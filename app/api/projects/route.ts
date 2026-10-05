import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { projects, projectMedia, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    if (isAdmin) {
      const { authorized } = await verifyAdminRequest(req);
      if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const categorySlug = searchParams.get('category') || undefined;
    const format = searchParams.get('format') || undefined;
    const sourceType = searchParams.get('sourceType') || undefined;
    const featuredOnly = searchParams.get('featured') === 'true';
    const search = searchParams.get('search') || undefined;

    const projectsList = await getProjects({
      publishedOnly: !isAdmin,
      featuredOnly,
      categorySlug,
      format,
      sourceType,
      search,
    });

    return NextResponse.json({ projects: projectsList });
  } catch (error) {
    console.error('API /api/projects GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.title || !body.slug || !body.shortDescription) {
      return NextResponse.json({ error: 'Title, slug, and short description are required' }, { status: 400 });
    }

    const [{ id: projectId }] = await db
      .insert(projects)
      .values({
        title: body.title,
        slug: body.slug.toLowerCase().replace(/\s+/g, '-'),
        clientName: body.clientName || null,
        categoryId: body.categoryId ? parseInt(body.categoryId, 10) : null,
        serviceId: body.serviceId ? parseInt(body.serviceId, 10) : null,
        shortDescription: body.shortDescription,
        description: body.description || body.shortDescription,
        challenge: body.challenge || null,
        solution: body.solution || null,
        workCompleted: body.workCompleted || null,
        tools: body.tools || [],
        results: body.results || null,
        projectDate: body.projectDate || null,
        sourceType: body.sourceType || 'aqsa',
        isSourceVisible: Boolean(body.isSourceVisible),
        format: body.format || 'multiple',
        status: body.status || 'published',
        isFeatured: Boolean(body.isFeatured),
        thumbnailUrl: body.thumbnailUrl || '/images/project_dashboard.jpg',
        liveUrl: body.liveUrl || null,
        externalUrl: body.externalUrl || null,
      })
      .$returningId();
    const [newProject] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

    // Insert media items if provided
    if (Array.isArray(body.media) && body.media.length > 0) {
      for (let i = 0; i < body.media.length; i++) {
        const m = body.media[i];
        if (m.url) {
          await db.insert(projectMedia).values({
            projectId: newProject.id,
            mediaType: m.mediaType || 'image',
            url: m.url,
            title: m.title || '',
            caption: m.caption || '',
            altText: m.altText || newProject.title,
            sortOrder: i + 1,
          });
        }
      }
    }

    await db.insert(activityLogs).values({
      action: 'Created Project',
      details: `Project created: ${newProject.title} (${newProject.slug})`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error('API /api/projects POST error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
