import { NextRequest, NextResponse } from 'next/server';
import { createLead, getLeads } from '@/lib/db-queries';
import { verifyAdminRequest } from '@/lib/auth';

// Public submission: Contact inquiry -> CRM Lead
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const lead = await createLead({
      name: body.name,
      email: body.email,
      phone: body.phone,
      whatsapp: body.whatsapp,
      company: body.company,
      interestedService: body.interestedService,
      relatedProject: body.relatedProject,
      budget: body.budget,
      message: body.message,
      source: body.source || 'website',
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully! Aqsa will reach out to you shortly.',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('API /api/leads POST error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}

// Protected: Admin list leads
export async function GET(req: NextRequest) {
  const { authorized } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const leadsList = await getLeads({ status, priority, search, startDate, endDate });
    return NextResponse.json({ leads: leadsList });
  } catch (error) {
    console.error('API /api/leads GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
