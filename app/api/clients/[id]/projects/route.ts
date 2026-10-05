import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { clientProjects } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    const body = await req.json();

    if (!body.projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const [{ id: projectId }] = await db
      .insert(clientProjects)
      .values({
        clientId,
        projectName: body.projectName,
        serviceName: body.serviceName,
        status: body.status || 'in_progress',
        budget: body.budget,
        notes: body.notes,
        startDate: body.startDate,
        endDate: body.endDate,
      })
      .$returningId();
    const [project] = await db.select().from(clientProjects).where(eq(clientProjects.id, projectId)).limit(1);

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('API /api/clients/[id]/projects error:', error);
    return NextResponse.json({ error: 'Failed to add project' }, { status: 500 });
  }
}
