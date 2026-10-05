import { NextRequest, NextResponse } from 'next/server';
import { getCaseStudies } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { caseStudies, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    if (isAdmin) {
      const { authorized } = await verifyAdminRequest(req);
      if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const featuredOnly = searchParams.get('featured') === 'true';

    const list = await getCaseStudies({ publishedOnly: !isAdmin, featuredOnly });
    return NextResponse.json({ caseStudies: list });
  } catch (error) {
    console.error('API /api/case-studies GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.title || !body.slug || !body.clientBusiness || !body.problem || !body.results) {
      return NextResponse.json({ error: 'Title, slug, client, problem, and results are required' }, { status: 400 });
    }

    const [{ id: caseStudyId }] = await db
      .insert(caseStudies)
      .values({
        title: body.title,
        slug: body.slug.toLowerCase().replace(/\s+/g, '-'),
        clientBusiness: body.clientBusiness,
        projectId: body.projectId ? parseInt(body.projectId, 10) : null,
        relatedServiceId: body.relatedServiceId ? parseInt(body.relatedServiceId, 10) : null,
        problem: body.problem,
        objectives: body.objectives || '',
        strategy: body.strategy || '',
        workPerformed: body.workPerformed || '',
        tools: body.tools || '',
        implementation: body.implementation || '',
        results: body.results,
        coverImage: body.coverImage || '/images/project_dashboard.jpg',
        isFeatured: Boolean(body.isFeatured),
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      })
      .$returningId();
    const [created] = await db.select().from(caseStudies).where(eq(caseStudies.id, caseStudyId)).limit(1);

    await db.insert(activityLogs).values({
      action: 'Created Case Study',
      details: `Case Study created: ${created.title}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, caseStudy: created });
  } catch (error) {
    console.error('API /api/case-studies POST error:', error);
    return NextResponse.json({ error: 'Failed to create case study' }, { status: 500 });
  }
}
