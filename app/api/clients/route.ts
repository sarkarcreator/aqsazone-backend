import { NextRequest, NextResponse } from 'next/server';
import { getClients } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { clients, clientProjects, activityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { authorized } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clientsList = await getClients();
    return NextResponse.json({ clients: clientsList });
  } catch (error) {
    console.error('API /api/clients GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const [{ id: clientId }] = await db
      .insert(clients)
      .values({
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp,
        status: body.status || 'active',
        notes: body.notes,
      })
      .$returningId();
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);

    await db.insert(activityLogs).values({
      action: 'Created Client',
      details: `New client created: ${client.name} (${client.email})`,
      userEmail: email || 'admin',
    });

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('API /api/clients POST error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
