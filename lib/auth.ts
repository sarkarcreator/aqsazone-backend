import { NextRequest } from 'next/server';
import { ADMIN_COOKIE, getAdminFromSession } from '@/lib/admin-auth';

export async function verifyAdminRequest(req: NextRequest | Request): Promise<{ authorized: boolean; email?: string }> {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookieValue = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  const admin = await getAdminFromSession(cookieValue ? decodeURIComponent(cookieValue) : null);
  if (admin) return { authorized: true, email: admin.email };

  // Backward compatibility is intentionally not provided: raw passcodes and Firebase ID tokens are not sessions.
  return { authorized: false };
}
