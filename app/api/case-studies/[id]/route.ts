import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { caseStudies, projects, services, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slug = decodeURIComponent(id);
    const [caseStudy] = await db
      .select({
        id: caseStudies.id,
        projectId: caseStudies.projectId,
        projectTitle: projects.title,
        projectSlug: projects.slug,
        relatedServiceId: caseStudies.relatedServiceId,
        serviceName: services.name,
        serviceSlug: services.slug,
        title: caseStudies.title,
        slug: caseStudies.slug,
        clientBusiness: caseStudies.clientBusiness,
        problem: caseStudies.problem,
        objectives: caseStudies.objectives,
        strategy: caseStudies.strategy,
        workPerformed: caseStudies.workPerformed,
        tools: caseStudies.tools,
        implementation: caseStudies.implementation,
        results: caseStudies.results,
        coverImage: caseStudies.coverImage,
        isFeatured: caseStudies.isFeatured,
        isPublished: caseStudies.isPublished,
        viewsCount: caseStudies.viewsCount,
        createdAt: caseStudies.createdAt,
      })
      .from(caseStudies)
      .leftJoin(projects, eq(caseStudies.projectId, projects.id))
      .leftJoin(services, eq(caseStudies.relatedServiceId, services.id))
      .where(eq(caseStudies.slug, slug))
      .limit(1);

    if (!caseStudy || !caseStudy.isPublished) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    await db.update(caseStudies).set({ viewsCount: caseStudy.viewsCount + 1 }).where(eq(caseStudies.id, caseStudy.id));
    return NextResponse.json({ caseStudy });
  } catch (error) {
    console.error('API /api/case-studies/[id] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch case study' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const caseStudyId = parseInt(id, 10);
    const body = await req.json();

    await db
      .update(caseStudies)
      .set({
        title: body.title,
        slug: body.slug ? body.slug.toLowerCase().replace(/\s+/g, '-') : undefined,
        clientBusiness: body.clientBusiness,
        projectId: body.projectId !== undefined ? (body.projectId ? parseInt(body.projectId, 10) : null) : undefined,
        relatedServiceId: body.relatedServiceId !== undefined ? (body.relatedServiceId ? parseInt(body.relatedServiceId, 10) : null) : undefined,
        problem: body.problem,
        objectives: body.objectives,
        strategy: body.strategy,
        workPerformed: body.workPerformed,
        tools: body.tools,
        implementation: body.implementation,
        results: body.results,
        coverImage: body.coverImage,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
      })
      .where(eq(caseStudies.id, caseStudyId));
    const [updated] = await db.select().from(caseStudies).where(eq(caseStudies.id, caseStudyId)).limit(1);

    await db.insert(activityLogs).values({
      action: 'Updated Case Study',
      details: `Case Study updated: ${updated.title}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, caseStudy: updated });
  } catch (error) {
    console.error('API /api/case-studies/[id] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update case study' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const caseStudyId = parseInt(id, 10);

    const [deleted] = await db.select().from(caseStudies).where(eq(caseStudies.id, caseStudyId)).limit(1);
    await db.delete(caseStudies).where(eq(caseStudies.id, caseStudyId));

    await db.insert(activityLogs).values({
      action: 'Deleted Case Study',
      details: `Case Study deleted: ${deleted?.title || caseStudyId}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/case-studies/[id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
}
