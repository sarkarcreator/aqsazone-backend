import { NextRequest, NextResponse } from 'next/server';
import { convertLeadToClient } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    const client = await convertLeadToClient(leadId, email);
    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('API /api/leads/[id]/convert POST error:', error);
    return NextResponse.json({ error: 'Failed to convert lead to client' }, { status: 500 });
  }
}
