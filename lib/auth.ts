import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const VALID_PASSCODES = [
  process.env.ADMIN_PASSCODE,
  process.env.NODE_ENV !== 'production' ? 'aqsa2026' : null,
].filter(Boolean) as string[];

export async function verifyAdminRequest(req: NextRequest | Request): Promise<{ authorized: boolean; email?: string }> {
  // Check authorization header
  const authHeader = req.headers.get('authorization');
  const adminSecretHeader = req.headers.get('x-admin-token');

  // Check custom admin token header
  if (adminSecretHeader && VALID_PASSCODES.includes(adminSecretHeader)) {
    return { authorized: true, email: 'admin@aqsazone.com' };
  }

  // Check Bearer token (can be Firebase ID token or admin passcode)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();

    if (VALID_PASSCODES.includes(token)) {
      return { authorized: true, email: 'admin@aqsazone.com' };
    }

    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return { authorized: true, email: decoded.email || 'firebase-admin' };
    } catch {
      // If token verification fails
      return { authorized: false };
    }
  }

  // Check cookies for admin_session
  if ('cookies' in req && typeof (req as NextRequest).cookies?.get === 'function') {
    const cookie = (req as NextRequest).cookies.get('admin_token')?.value;
    if (cookie && VALID_PASSCODES.includes(cookie)) {
      return { authorized: true, email: 'admin@aqsazone.com' };
    }
  }

  return { authorized: false };
}
