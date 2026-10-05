import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { services, serviceCategories, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slug = decodeURIComponent(id);
    const [service] = await db
      .select({
        id: services.id,
        categoryId: services.categoryId,
        categoryName: serviceCategories.name,
        categorySlug: serviceCategories.slug,
        name: services.name,
        slug: services.slug,
        icon: services.icon,
        shortDescription: services.shortDescription,
        fullDescription: services.fullDescription,
        features: services.features,
        process: services.process,
        faqs: services.faqs,
        sourceType: services.sourceType,
        isFeatured: services.isFeatured,
        isPublished: services.isPublished,
        sortOrder: services.sortOrder,
        viewsCount: services.viewsCount,
        createdAt: services.createdAt,
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(eq(services.slug, slug))
      .limit(1);

    if (!service || !service.isPublished) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    await db.update(services).set({ viewsCount: service.viewsCount + 1 }).where(eq(services.id, service.id));
    return NextResponse.json({ service });
  } catch (error) {
    console.error('API /api/services/[id] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
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
    const serviceId = parseInt(id, 10);
    const body = await req.json();

    const [updated] = await db
      .update(services)
      .set({
        categoryId: body.categoryId !== undefined ? (body.categoryId ? parseInt(body.categoryId, 10) : null) : undefined,
        name: body.name,
        slug: body.slug ? body.slug.toLowerCase().replace(/\s+/g, '-') : undefined,
        icon: body.icon,
        shortDescription: body.shortDescription,
        fullDescription: body.fullDescription,
        features: body.features,
        process: body.process,
        faqs: body.faqs,
        sourceType: body.sourceType,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
        sortOrder: body.sortOrder !== undefined ? parseInt(body.sortOrder, 10) : undefined,
      })
      .where(eq(services.id, serviceId))
      .returning();

    await db.insert(activityLogs).values({
      action: 'Updated Service',
      details: `Service updated: ${updated.name}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    console.error('API /api/services/[id] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
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
    const serviceId = parseInt(id, 10);

    const [deleted] = await db.delete(services).where(eq(services.id, serviceId)).returning();

    await db.insert(activityLogs).values({
      action: 'Deleted Service',
      details: `Service deleted: ${deleted?.name || serviceId}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/services/[id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
