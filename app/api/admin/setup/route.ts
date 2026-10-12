import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminSetupNeeded, createAdminSession, hashPassword, ensureAdminTable } from '@/lib/admin-auth';
import { getPool } from '@/src/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({ setupRequired: await adminSetupNeeded() });
  } catch (error) {
    console.error('Admin setup status failed:', error);
    return NextResponse.json({ error: 'Unable to check admin setup.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let connection;
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return NextResponse.json({ error: 'Enter a valid name and email address.' }, { status: 400 });
    }
    if (password.length < 12 || password.length > 1024 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Use at least 12 characters, including uppercase, lowercase and a number.' }, { status: 400 });
    }

    await ensureAdminTable();
    connection = await getPool().getConnection();
    await connection.query("SELECT GET_LOCK('aqsazone_first_admin_setup', 10)");
    await connection.beginTransaction();
    const [rows] = await connection.query<Array<{ total: number }>>('SELECT COUNT(*) AS total FROM admin_accounts FOR UPDATE');
    if (Number(rows[0]?.total || 0) !== 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Admin setup is already complete. Use the login page.' }, { status: 409 });
    }
    await connection.execute('INSERT INTO admin_accounts (email, name, password_hash) VALUES (?, ?, ?)', [email, name, await hashPassword(password)]);
    await connection.commit();

    const session = createAdminSession(email, name);
    const response = NextResponse.json({ success: true, user: { email, name, role: 'admin' } });
    response.cookies.set(ADMIN_COOKIE, session.token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    if (connection) await connection.rollback().catch(() => undefined);
    console.error('Admin first-time setup failed:', error);
    return NextResponse.json({ error: 'Unable to create the admin account.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.query("SELECT RELEASE_LOCK('aqsazone_first_admin_setup')").catch(() => undefined);
      connection.release();
    }
  }
}
