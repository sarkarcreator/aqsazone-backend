import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, createAdminSession, ensureAdminTable, verifyPassword } from '@/lib/admin-auth';
import { getPool } from '@/src/db';
import type { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';

const attemptsByIp = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const current = attemptsByIp.get(ip);
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many login attempts. Please wait 15 minutes and try again.' }, { status: 429 });
  }
  if (!current || current.resetAt <= now) attemptsByIp.set(ip, { count: 0, resetAt: now + RATE_WINDOW_MS });

  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password || email.length > 320 || password.length > 1024) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await ensureAdminTable();
    const [rows] = await getPool().execute<(RowDataPacket & { email: string; name: string; password_hash: string })[]>(
      'SELECT email, name, password_hash FROM admin_accounts WHERE email = ? LIMIT 1', [email]
    );
    const admin = rows[0];
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      const attempt = attemptsByIp.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
      attemptsByIp.set(ip, { count: attempt.count + 1, resetAt: attempt.resetAt });
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }
    attemptsByIp.delete(ip);

    const session = createAdminSession(admin.email, admin.name);
    const response = NextResponse.json({ success: true, user: { email: admin.email, name: admin.name, role: 'admin' } });
    response.cookies.set(ADMIN_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ error: 'Admin login is temporarily unavailable.' }, { status: 500 });
  }
}
