import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('API /api/settings GET error:', error);

    // Return a safe, actionable category without exposing database credentials or SQL.
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code || '')
        : '';
    const message =
      error instanceof Error ? error.message.toLowerCase() : '';

    let errorMessage = 'Website settings database query failed.';
    if (code === 'ER_NO_SUCH_TABLE' || message.includes("doesn't exist") || message.includes('no such table')) {
      errorMessage = 'The site_settings database table is missing. Run the backend database migrations against the production database.';
    } else if (
      code.startsWith('ECONN') ||
      code === 'ETIMEDOUT' ||
      code === 'PROTOCOL_CONNECTION_LOST' ||
      message.includes('access denied')
    ) {
      errorMessage = 'The backend cannot connect to the configured database. Check the production DATABASE_URL and database permissions.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    await updateSiteSettings(body, email);
    const updatedSettings = await getSiteSettings();
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('API /api/settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
