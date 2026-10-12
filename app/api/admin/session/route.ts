import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, getAdminFromSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromSession(req.cookies.get(ADMIN_COOKIE)?.value);
    return NextResponse.json({ authenticated: Boolean(admin), user: admin ? { ...admin, role: 'admin' } : null }, { status: admin ? 200 : 401 });
  } catch (error) {
    console.error('Admin session check failed:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/', maxAge: 0 });
  return response;
}
