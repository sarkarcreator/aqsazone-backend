import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { projects, projectMedia, caseStudies, services, serviceCategories, activityLogs } from '@/src/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slug = decodeURIComponent(id);
    const [project] = await db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        clientName: projects.clientName,
        categoryId: projects.categoryId,
        categoryName: serviceCategories.name,
        categorySlug: serviceCategories.slug,
        serviceId: projects.serviceId,
        serviceName: services.name,
        shortDescription: projects.shortDescription,
        description: projects.description,
        challenge: projects.challenge,
        solution: projects.solution,
        workCompleted: projects.workCompleted,
        tools: projects.tools,
        results: projects.results,
        projectDate: projects.projectDate,
        sourceType: projects.sourceType,
        isSourceVisible: projects.isSourceVisible,
        format: projects.format,
        status: projects.status,
        isFeatured: projects.isFeatured,
        thumbnailUrl: projects.thumbnailUrl,
        liveUrl: projects.liveUrl,
        externalUrl: projects.externalUrl,
        viewsCount: projects.viewsCount,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .leftJoin(serviceCategories, eq(projects.categoryId, serviceCategories.id))
      .leftJoin(services, eq(projects.serviceId, services.id))
      .where(eq(projects.slug, slug))
      .limit(1);

    if (!project || project.status !== 'published') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const media = await db.select().from(projectMedia)
      .where(eq(projectMedia.projectId, project.id))
      .orderBy(asc(projectMedia.sortOrder), asc(projectMedia.id));
    const [caseStudy] = await db.select().from(caseStudies)
      .where(eq(caseStudies.projectId, project.id))
      .limit(1);

    await db.update(projects).set({ viewsCount: project.viewsCount + 1 }).where(eq(projects.id, project.id));
    return NextResponse.json({ project: { ...project, media, caseStudy: caseStudy || null } });
  } catch (error) {
    console.error('API /api/projects/[id] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
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
    const projectId = parseInt(id, 10);
    const body = await req.json();

    await db
      .update(projects)
      .set({
        title: body.title,
        slug: body.slug ? body.slug.toLowerCase().replace(/\s+/g, '-') : undefined,
        clientName: body.clientName,
        categoryId: body.categoryId !== undefined ? (body.categoryId ? parseInt(body.categoryId, 10) : null) : undefined,
        serviceId: body.serviceId !== undefined ? (body.serviceId ? parseInt(body.serviceId, 10) : null) : undefined,
        shortDescription: body.shortDescription,
        description: body.description,
        challenge: body.challenge,
        solution: body.solution,
        workCompleted: body.workCompleted,
        tools: body.tools,
        results: body.results,
        projectDate: body.projectDate,
        sourceType: body.sourceType,
        isSourceVisible: body.isSourceVisible !== undefined ? Boolean(body.isSourceVisible) : undefined,
        format: body.format,
        status: body.status,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        thumbnailUrl: body.thumbnailUrl,
        liveUrl: body.liveUrl,
        externalUrl: body.externalUrl,
      })
      .where(eq(projects.id, projectId));
    const [updated] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

    // Replace project media if provided
    if (Array.isArray(body.media)) {
      await db.delete(projectMedia).where(eq(projectMedia.projectId, projectId));
      for (let i = 0; i < body.media.length; i++) {
        const m = body.media[i];
        if (m.url) {
          await db.insert(projectMedia).values({
            projectId,
            mediaType: m.mediaType || 'image',
            url: m.url,
            title: m.title || '',
            caption: m.caption || '',
            altText: m.altText || updated.title,
            sortOrder: i + 1,
          });
        }
      }
    }

    await db.insert(activityLogs).values({
      action: 'Updated Project',
      details: `Project updated: ${updated.title}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error('API /api/projects/[id] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
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
    const projectId = parseInt(id, 10);

    const [deleted] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    await db.delete(projects).where(eq(projects.id, projectId));

    await db.insert(activityLogs).values({
      action: 'Deleted Project',
      details: `Project deleted: ${deleted?.title || projectId}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/projects/[id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
