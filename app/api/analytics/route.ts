import { NextRequest, NextResponse } from 'next/server';
import { getAdminAnalytics, getActivityLogs } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { authorized } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const analytics = await getAdminAnalytics();
    const logs = await getActivityLogs(15);

    return NextResponse.json({
      analytics,
      recentActivity: logs,
    });
  } catch (error) {
    console.error('API /api/analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
