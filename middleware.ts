import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  // Reject cross-origin state-changing requests to prevent cookie-based CSRF.
  if (origin && !allowedOrigins.includes(origin) && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Admin-Token');
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
