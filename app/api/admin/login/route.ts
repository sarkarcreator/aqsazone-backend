import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, createAdminSession, ensureAdminTable, verifyPassword } from '@/lib/admin-auth';
import { getPool } from '@/src/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password || email.length > 320 || password.length > 1024) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await ensureAdminTable();
    const [rows] = await getPool().execute<Array<{ email: string; name: string; password_hash: string }>>(
      'SELECT email, name, password_hash FROM admin_accounts WHERE email = ? LIMIT 1', [email]
    );
    const admin = rows[0];
    if (!admin || !(await verifyPassword(password, admin.password_hash))) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    const session = createAdminSession(admin.email, admin.name);
    const response = NextResponse.json({ success: true, user: { email: admin.email, name: admin.name, role: 'admin' } });
    response.cookies.set(ADMIN_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ error: 'Admin login is temporarily unavailable.' }, { status: 500 });
  }
}
