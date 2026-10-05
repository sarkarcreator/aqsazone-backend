import { NextRequest, NextResponse } from 'next/server';
import { getMediaItems } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { mediaItems } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { authorized } = await verifyAdminRequest(req);
  if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const items = await getMediaItems();
    return NextResponse.json({ media: items });
  } catch (error) {
    console.error('API /api/media GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { authorized } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.url || !body.filename) {
      return NextResponse.json({ error: 'URL and filename are required' }, { status: 400 });
    }

    const [{ id: mediaId }] = await db
      .insert(mediaItems)
      .values({
        filename: body.filename,
        fileType: body.fileType || 'image',
        url: body.url,
        size: body.size || 0,
        altText: body.altText || '',
        caption: body.caption || '',
      })
      .$returningId();
    const [created] = await db.select().from(mediaItems).where(eq(mediaItems.id, mediaId)).limit(1);

    return NextResponse.json({ success: true, media: created });
  } catch (error) {
    console.error('API /api/media POST error:', error);
    return NextResponse.json({ error: 'Failed to add media' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { authorized } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Media ID required' }, { status: 400 });

    await db.delete(mediaItems).where(eq(mediaItems.id, parseInt(id, 10)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/media DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
