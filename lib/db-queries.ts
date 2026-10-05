import { db } from '@/src/db/index';
import {
  siteSettings,
  serviceCategories,
  services,
  projects,
  projectMedia,
  caseStudies,
  testimonials,
  leads,
  clients,
  clientProjects,
  mediaItems,
  activityLogs,
} from '@/src/db/schema';
import { eq, desc, asc, and, or, ilike, sql, gte, lte } from 'drizzle-orm';

// --- SITE SETTINGS ---
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(siteSettings);
    const settings: Record<string, string> = {};
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    return settings;
  } catch (error) {
    console.error('Failed to get site settings:', error);
    return {};
  }
}

export async function updateSiteSettings(settingsMap: Record<string, string>, userEmail?: string) {
  try {
    for (const [key, value] of Object.entries(settingsMap)) {
      await db
        .insert(siteSettings)
        .values({ key, value: String(value), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: String(value), updatedAt: new Date() },
        });
    }

    await db.insert(activityLogs).values({
      action: 'Updated Site Settings',
      details: `Keys updated: ${Object.keys(settingsMap).join(', ')}`,
      userEmail: userEmail || 'admin',
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update site settings:', error);
    throw error;
  }
}

// --- SERVICES & CATEGORIES ---
export async function getCategories() {
  try {
    return await db.select().from(serviceCategories).orderBy(asc(serviceCategories.sortOrder));
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
}

export async function getServices(options?: { publishedOnly?: boolean; featuredOnly?: boolean }) {
  try {
    const conditions = [];
    if (options?.publishedOnly) {
      conditions.push(eq(services.isPublished, true));
    }
    if (options?.featuredOnly) {
      conditions.push(eq(services.isFeatured, true));
    }

    const query = db
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
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(asc(services.sortOrder), asc(services.id));
    }

    return await query.orderBy(asc(services.sortOrder), asc(services.id));
  } catch (error) {
    console.error('Failed to get services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    const rows = await db
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

    if (rows.length === 0) return null;

    // Increment views count asynchronously
    db.update(services)
      .set({ viewsCount: sql`${services.viewsCount} + 1` })
      .where(eq(services.slug, slug))
      .catch((e) => console.error('View increment error', e));

    return rows[0];
  } catch (error) {
    console.error(`Failed to get service by slug ${slug}:`, error);
    return null;
  }
}

// --- PROJECTS / PORTFOLIO ---
export async function getProjects(options?: {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  categorySlug?: string;
  format?: string;
  sourceType?: string;
  search?: string;
}) {
  try {
    const conditions = [];

    if (options?.publishedOnly) {
      conditions.push(eq(projects.status, 'published'));
    }
    if (options?.featuredOnly) {
      conditions.push(eq(projects.isFeatured, true));
    }
    if (options?.format && options.format !== 'all') {
      conditions.push(eq(projects.format, options.format));
    }
    if (options?.sourceType && options.sourceType !== 'all') {
      conditions.push(eq(projects.sourceType, options.sourceType));
    }
    if (options?.categorySlug && options.categorySlug !== 'all') {
      conditions.push(eq(serviceCategories.slug, options.categorySlug));
    }
    if (options?.search) {
      const s = `%${options.search}%`;
      conditions.push(
        or(
          ilike(projects.title, s),
          ilike(projects.shortDescription, s),
          ilike(projects.description, s),
          ilike(serviceCategories.name, s)
        )
      );
    }

    const query = db
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
      .leftJoin(services, eq(projects.serviceId, services.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(projects.isFeatured), desc(projects.id));
    }

    return await query.orderBy(desc(projects.isFeatured), desc(projects.id));
  } catch (error) {
    console.error('Failed to get projects:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const rows = await db
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

    if (rows.length === 0) return null;

    const project = rows[0];

    // Fetch media attachments
    const media = await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, project.id))
      .orderBy(asc(projectMedia.sortOrder), asc(projectMedia.id));

    // Fetch related case study
    const relatedCaseStudies = await db
      .select()
      .from(caseStudies)
      .where(eq(caseStudies.projectId, project.id))
      .limit(1);

    // Increment views
    db.update(projects)
      .set({ viewsCount: sql`${projects.viewsCount} + 1` })
      .where(eq(projects.slug, slug))
      .catch((e) => console.error('View increment error', e));

    return {
      ...project,
      media,
      caseStudy: relatedCaseStudies[0] || null,
    };
  } catch (error) {
    console.error(`Failed to get project by slug ${slug}:`, error);
    return null;
  }
}

// --- CASE STUDIES ---
export async function getCaseStudies(options?: { publishedOnly?: boolean; featuredOnly?: boolean }) {
  try {
    const conditions = [];
    if (options?.publishedOnly) {
      conditions.push(eq(caseStudies.isPublished, true));
    }
    if (options?.featuredOnly) {
      conditions.push(eq(caseStudies.isFeatured, true));
    }

    const query = db
      .select({
        id: caseStudies.id,
        projectId: caseStudies.projectId,
        projectTitle: projects.title,
        projectSlug: projects.slug,
        relatedServiceId: caseStudies.relatedServiceId,
        serviceName: services.name,
        title: caseStudies.title,
        slug: caseStudies.slug,
        clientBusiness: caseStudies.clientBusiness,
        problem: caseStudies.problem,
        objectives: caseStudies.objectives,
        strategy: caseStudies.strategy,
        workPerformed: caseStudies.workPerformed,
        tools: caseStudies.tools,
        implementation: caseStudies.implementation,
        results: caseStudies.results,
        coverImage: caseStudies.coverImage,
        isFeatured: caseStudies.isFeatured,
        isPublished: caseStudies.isPublished,
        viewsCount: caseStudies.viewsCount,
        createdAt: caseStudies.createdAt,
      })
      .from(caseStudies)
      .leftJoin(projects, eq(caseStudies.projectId, projects.id))
      .leftJoin(services, eq(caseStudies.relatedServiceId, services.id));

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(caseStudies.isFeatured), desc(caseStudies.id));
    }

    return await query.orderBy(desc(caseStudies.isFeatured), desc(caseStudies.id));
  } catch (error) {
    console.error('Failed to get case studies:', error);
    return [];
  }
}

export async function getCaseStudyBySlug(slug: string) {
  try {
    const rows = await db
      .select({
        id: caseStudies.id,
        projectId: caseStudies.projectId,
        projectTitle: projects.title,
        projectSlug: projects.slug,
        relatedServiceId: caseStudies.relatedServiceId,
        serviceName: services.name,
        serviceSlug: services.slug,
        title: caseStudies.title,
        slug: caseStudies.slug,
        clientBusiness: caseStudies.clientBusiness,
        problem: caseStudies.problem,
        objectives: caseStudies.objectives,
        strategy: caseStudies.strategy,
        workPerformed: caseStudies.workPerformed,
        tools: caseStudies.tools,
        implementation: caseStudies.implementation,
        results: caseStudies.results,
        coverImage: caseStudies.coverImage,
        isFeatured: caseStudies.isFeatured,
        isPublished: caseStudies.isPublished,
        viewsCount: caseStudies.viewsCount,
        createdAt: caseStudies.createdAt,
      })
      .from(caseStudies)
      .leftJoin(projects, eq(caseStudies.projectId, projects.id))
      .leftJoin(services, eq(caseStudies.relatedServiceId, services.id))
      .where(eq(caseStudies.slug, slug))
      .limit(1);

    if (rows.length === 0) return null;

    // Increment views
    db.update(caseStudies)
      .set({ viewsCount: sql`${caseStudies.viewsCount} + 1` })
      .where(eq(caseStudies.slug, slug))
      .catch((e) => console.error('View increment error', e));

    return rows[0];
  } catch (error) {
    console.error(`Failed to get case study by slug ${slug}:`, error);
    return null;
  }
}

// --- TESTIMONIALS ---
export async function getTestimonials(options?: { publishedOnly?: boolean; featuredOnly?: boolean }) {
  try {
    const conditions = [];
    if (options?.publishedOnly) {
      conditions.push(eq(testimonials.isPublished, true));
    }
    if (options?.featuredOnly) {
      conditions.push(eq(testimonials.isFeatured, true));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(testimonials)
        .where(and(...conditions))
        .orderBy(desc(testimonials.isFeatured), desc(testimonials.id));
    }

    return await db.select().from(testimonials).orderBy(desc(testimonials.isFeatured), desc(testimonials.id));
  } catch (error) {
    console.error('Failed to get testimonials:', error);
    return [];
  }
}

// --- LEADS & CRM ---
export async function createLead(data: {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  interestedService?: string;
  relatedProject?: string;
  budget?: string;
  message: string;
  source?: string;
}) {
  try {
    const [lead] = await db
      .insert(leads)
      .values({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        company: data.company?.trim() || null,
        interestedService: data.interestedService || null,
        relatedProject: data.relatedProject || null,
        budget: data.budget || null,
        message: data.message.trim(),
        source: data.source || 'website',
        status: 'new',
        priority: 'medium',
        assignedPerson: 'Aqsa',
      })
      .returning();

    await db.insert(activityLogs).values({
      action: 'New Lead Created',
      details: `Lead #${lead.id} received from ${lead.name} (${lead.email}) for ${lead.interestedService || 'General Inquiry'}`,
      userEmail: lead.email,
    });

    return lead;
  } catch (error) {
    console.error('Failed to create lead:', error);
    throw error;
  }
}

export async function getLeads(options?: {
  status?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const conditions = [];
    if (options?.status && options.status !== 'all') {
      conditions.push(eq(leads.status, options.status));
    }
    if (options?.priority && options.priority !== 'all') {
      conditions.push(eq(leads.priority, options.priority));
    }
    if (options?.startDate) {
      const start = new Date(options.startDate);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        conditions.push(gte(leads.createdAt, start));
      }
    }
    if (options?.endDate) {
      const end = new Date(options.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(leads.createdAt, end));
      }
    }
    if (options?.search) {
      const s = `%${options.search}%`;
      conditions.push(
        or(
          ilike(leads.name, s),
          ilike(leads.email, s),
          ilike(leads.company, s),
          ilike(leads.interestedService, s)
        )
      );
    }

    if (conditions.length > 0) {
      return await db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.id));
    }

    return await db.select().from(leads).orderBy(desc(leads.id));
  } catch (error) {
    console.error('Failed to get leads:', error);
    return [];
  }
}

export async function updateLead(id: number, data: Partial<typeof leads.$inferInsert>, userEmail?: string) {
  try {
    const [updated] = await db
      .update(leads)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();

    await db.insert(activityLogs).values({
      action: 'Updated Lead',
      details: `Lead #${id} (${updated.name}) updated. Status: ${updated.status}`,
      userEmail: userEmail || 'admin',
    });

    return updated;
  } catch (error) {
    console.error(`Failed to update lead ${id}:`, error);
    throw error;
  }
}

export async function convertLeadToClient(leadId: number, userEmail?: string) {
  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (!lead) throw new Error('Lead not found');

    // Check if client already exists
    const [existing] = await db.select().from(clients).where(eq(clients.leadId, leadId)).limit(1);
    if (existing) return existing;

    const [client] = await db
      .insert(clients)
      .values({
        leadId: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        status: 'active',
        notes: `Converted from Lead #${lead.id}. Interested in: ${lead.interestedService || 'General'}. Budget: ${lead.budget || 'N/A'}. Message: ${lead.message}`,
      })
      .returning();

    // Mark lead status as 'won'
    await db.update(leads).set({ status: 'won', updatedAt: new Date() }).where(eq(leads.id, leadId));

    // Create initial client project placeholder
    if (lead.interestedService) {
      await db.insert(clientProjects).values({
        clientId: client.id,
        projectName: `${lead.interestedService} Implementation`,
        serviceName: lead.interestedService,
        status: 'in_progress',
        budget: lead.budget || '',
        notes: 'Initial project established on conversion.',
      });
    }

    await db.insert(activityLogs).values({
      action: 'Lead Converted to Client',
      details: `Lead #${leadId} converted to Client #${client.id} (${client.name})`,
      userEmail: userEmail || 'admin',
    });

    return client;
  } catch (error) {
    console.error(`Failed to convert lead ${leadId} to client:`, error);
    throw error;
  }
}

// --- CLIENTS ---
export async function getClients() {
  try {
    const clientsList = await db.select().from(clients).orderBy(desc(clients.id));
    const allProjects = await db.select().from(clientProjects).orderBy(desc(clientProjects.id));

    return clientsList.map((c) => ({
      ...c,
      projects: allProjects.filter((p) => p.clientId === c.id),
    }));
  } catch (error) {
    console.error('Failed to get clients:', error);
    return [];
  }
}

// --- ANALYTICS ---
export async function getAdminAnalytics() {
  try {
    const allLeads = await db.select().from(leads);
    const allProjects = await db.select().from(projects);
    const allServices = await db.select().from(services);
    const allClients = await db.select().from(clients);
    const allCaseStudies = await db.select().from(caseStudies);
    const allTestimonials = await db.select().from(testimonials);

    const totalLeads = allLeads.length;
    const newLeads = allLeads.filter((l) => l.status === 'new').length;
    const wonLeads = allLeads.filter((l) => l.status === 'won').length;
    const lostLeads = allLeads.filter((l) => l.status === 'lost').length;
    const activeLeads = allLeads.filter((l) => ['contacted', 'discussion', 'proposal', 'negotiation'].includes(l.status)).length;

    // Leads by status
    const statusCounts: Record<string, number> = {};
    allLeads.forEach((l) => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });

    // Leads by service
    const serviceCounts: Record<string, number> = {};
    allLeads.forEach((l) => {
      const s = l.interestedService || 'Unspecified';
      serviceCounts[s] = (serviceCounts[s] || 0) + 1;
    });

    // Leads by source
    const sourceCounts: Record<string, number> = {};
    allLeads.forEach((l) => {
      const src = l.source || 'website';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    return {
      totalLeads,
      newLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      totalServices: allServices.length,
      publishedServices: allServices.filter((s) => s.isPublished).length,
      totalProjects: allProjects.length,
      publishedProjects: allProjects.filter((p) => p.status === 'published').length,
      draftProjects: allProjects.filter((p) => p.status === 'draft').length,
      totalClients: allClients.length,
      totalCaseStudies: allCaseStudies.length,
      totalTestimonials: allTestimonials.length,
      statusCounts,
      serviceCounts,
      sourceCounts,
      topViewedProjects: allProjects.sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5),
      topViewedServices: allServices.sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5),
    };
  } catch (error) {
    console.error('Failed to get admin analytics:', error);
    return null;
  }
}

// --- ACTIVITY LOGS ---
export async function getActivityLogs(limit = 30) {
  try {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return [];
  }
}

// --- MEDIA ITEMS ---
export async function getMediaItems() {
  try {
    return await db.select().from(mediaItems).orderBy(desc(mediaItems.id));
  } catch (error) {
    console.error('Failed to get media items:', error);
    return [];
  }
}
