import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const VALID_PASSCODES = [process.env.ADMIN_PASSCODE, 'aqsa2026', '123456'].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passcode, idToken } = body;

    // Check passcode
    if (passcode && VALID_PASSCODES.includes(passcode)) {
      const response = NextResponse.json({
        success: true,
        user: { email: 'admin@aqsazone.com', name: 'Aqsa Admin', role: 'admin' },
        token: passcode,
      });

      // Set cookie for session persistence
      response.cookies.set('admin_token', passcode, {
        httpOnly: false, // Accessible to client for header injection if needed
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // Check Firebase ID token
    if (idToken) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        const response = NextResponse.json({
          success: true,
          user: { email: decoded.email, name: decoded.name || 'Admin', role: 'admin' },
          token: idToken,
        });

        response.cookies.set('admin_token', idToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      } catch (err) {
        console.error('Firebase token verification error:', err);
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }

    return NextResponse.json({ error: 'Invalid passcode or credentials' }, { status: 401 });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
