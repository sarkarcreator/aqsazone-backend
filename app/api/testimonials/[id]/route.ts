import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { testimonials, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

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
    const testimonialId = parseInt(id, 10);
    const body = await req.json();

    const [updated] = await db
      .update(testimonials)
      .set({
        clientName: body.clientName,
        position: body.position,
        company: body.company,
        avatarUrl: body.avatarUrl,
        testimonial: body.testimonial,
        rating: body.rating ? parseInt(body.rating, 10) : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : undefined,
      })
      .where(eq(testimonials.id, testimonialId))
      .returning();

    await db.insert(activityLogs).values({
      action: 'Updated Testimonial',
      details: `Testimonial updated: ${updated.clientName}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error) {
    console.error('API /api/testimonials/[id] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
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
    const testimonialId = parseInt(id, 10);

    const [deleted] = await db.delete(testimonials).where(eq(testimonials.id, testimonialId)).returning();

    await db.insert(activityLogs).values({
      action: 'Deleted Testimonial',
      details: `Testimonial deleted: ${deleted?.clientName || testimonialId}`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/testimonials/[id] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
