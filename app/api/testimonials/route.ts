import { NextRequest, NextResponse } from 'next/server';
import { getTestimonials } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { testimonials, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const featuredOnly = searchParams.get('featured') === 'true';

    const list = await getTestimonials({ publishedOnly: !isAdmin, featuredOnly });
    return NextResponse.json({ testimonials: list });
  } catch (error) {
    console.error('API /api/testimonials GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.clientName || !body.testimonial) {
      return NextResponse.json({ error: 'Client name and testimonial are required' }, { status: 400 });
    }

    const [created] = await db
      .insert(testimonials)
      .values({
        clientName: body.clientName,
        position: body.position || '',
        company: body.company || '',
        avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        testimonial: body.testimonial,
        rating: body.rating ? parseInt(body.rating, 10) : 5,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : true,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      })
      .returning();

    await db.insert(activityLogs).values({
      action: 'Created Testimonial',
      details: `Testimonial created for ${created.clientName} (${created.company})`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, testimonial: created });
  } catch (error) {
    console.error('API /api/testimonials POST error:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
