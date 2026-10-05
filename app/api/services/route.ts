import { NextRequest, NextResponse } from 'next/server';
import { getServices, getCategories } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { services, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const featuredOnly = searchParams.get('featured') === 'true';
    if (isAdmin) {
      const { authorized } = await verifyAdminRequest(req);
      if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const servicesList = await getServices({ publishedOnly: !isAdmin, featuredOnly });
    const categoriesList = await getCategories();

    return NextResponse.json({ services: servicesList, categories: categoriesList });
  } catch (error) {
    console.error('API /api/services GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name || !body.slug || !body.shortDescription) {
      return NextResponse.json({ error: 'Name, slug, and short description are required' }, { status: 400 });
    }

    const [{ id: serviceId }] = await db
      .insert(services)
      .values({
        categoryId: body.categoryId ? parseInt(body.categoryId, 10) : null,
        name: body.name,
        slug: body.slug.toLowerCase().replace(/\s+/g, '-'),
        icon: body.icon || 'Sparkles',
        shortDescription: body.shortDescription,
        fullDescription: body.fullDescription || body.shortDescription,
        features: body.features || [],
        process: body.process || [],
        faqs: body.faqs || [],
        sourceType: body.sourceType || 'aqsa',
        isFeatured: Boolean(body.isFeatured),
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
        sortOrder: body.sortOrder ? parseInt(body.sortOrder, 10) : 0,
      })
      .$returningId();
    const [newService] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);

    await db.insert(activityLogs).values({
      action: 'Created Service',
      details: `Service created: ${newService.name} (${newService.slug})`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error('API /api/services POST error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
