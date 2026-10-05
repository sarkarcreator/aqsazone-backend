import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Admin users & authenticated users (using Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('admin').notNull(), // 'admin' | 'editor' | 'viewer'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Site Settings (CMS configuration, hero, about, contacts, collaboration notice)
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service Categories
export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Services
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => serviceCategories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').default('Sparkles').notNull(),
  shortDescription: text('short_description').notNull(),
  fullDescription: text('full_description').notNull(),
  features: jsonb('features').$type<string[]>().default([]).notNull(),
  process: jsonb('process').$type<{ title: string; description: string }[]>().default([]).notNull(),
  faqs: jsonb('faqs').$type<{ question: string; answer: string }[]>().default([]).notNull(),
  sourceType: text('source_type').default('aqsa').notNull(), // 'aqsa' | 'dsh' | 'collaboration'
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Projects / Portfolio
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  clientName: text('client_name'),
  categoryId: integer('category_id').references(() => serviceCategories.id),
  serviceId: integer('service_id').references(() => services.id),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  challenge: text('challenge'),
  solution: text('solution'),
  workCompleted: text('work_completed'),
  tools: jsonb('tools').$type<string[]>().default([]).notNull(),
  results: text('results'),
  projectDate: text('project_date'), // e.g. "2025" or "Q3 2025"
  sourceType: text('source_type').default('aqsa').notNull(), // 'aqsa' | 'dsh' | 'collaboration'
  isSourceVisible: boolean('is_source_visible').default(false).notNull(),
  format: text('format').default('multiple').notNull(), // 'image' | 'video' | 'social_post' | 'website' | 'written_work' | 'case_study' | 'multiple'
  status: text('status').default('published').notNull(), // 'draft' | 'review' | 'published' | 'archived'
  isFeatured: boolean('is_featured').default(false).notNull(),
  thumbnailUrl: text('thumbnail_url'),
  liveUrl: text('live_url'),
  externalUrl: text('external_url'),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Project Media (images, videos, social posts, written documents)
export const projectMedia = pgTable('project_media', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  mediaType: text('media_type').notNull(), // 'image' | 'video' | 'social_post' | 'written' | 'document'
  url: text('url').notNull(),
  title: text('title'),
  caption: text('caption'),
  altText: text('alt_text'),
  embedCode: text('embed_code'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Case Studies
export const caseStudies = pgTable('case_studies', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  relatedServiceId: integer('related_service_id').references(() => services.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  clientBusiness: text('client_business').notNull(),
  problem: text('problem').notNull(),
  objectives: text('objectives').notNull(),
  strategy: text('strategy').notNull(),
  workPerformed: text('work_performed').notNull(),
  tools: text('tools'),
  implementation: text('implementation').notNull(),
  results: text('results').notNull(),
  coverImage: text('cover_image'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Testimonials
export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  clientName: text('client_name').notNull(),
  position: text('position').notNull(),
  company: text('company').notNull(),
  avatarUrl: text('avatar_url'),
  testimonial: text('testimonial').notNull(),
  rating: integer('rating').default(5).notNull(),
  isFeatured: boolean('is_featured').default(true).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Leads / Inquiries (CRM)
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  interestedService: text('interested_service'),
  relatedProject: text('related_project'),
  budget: text('budget'),
  message: text('message').notNull(),
  source: text('source').default('website').notNull(), // 'website', 'contact_page', 'service_page', 'project_page'
  status: text('status').default('new').notNull(), // 'new' | 'contacted' | 'discussion' | 'proposal' | 'negotiation' | 'won' | 'lost'
  priority: text('priority').default('medium').notNull(), // 'low' | 'medium' | 'high'
  notes: text('notes'),
  followUpDate: text('follow_up_date'),
  assignedPerson: text('assigned_person').default('Aqsa'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clients (Converted from Leads)
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  company: text('company'),
  email: text('email').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  status: text('status').default('active').notNull(), // 'active' | 'completed' | 'on_hold'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Client Projects
export const clientProjects = pgTable('client_projects', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  projectName: text('project_name').notNull(),
  serviceName: text('service_name'),
  status: text('status').default('in_progress').notNull(), // 'in_progress' | 'completed' | 'review' | 'paused'
  budget: text('budget'),
  notes: text('notes'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Centralized Media Library
export const mediaItems = pgTable('media_items', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  fileType: text('file_type').notNull(), // 'image' | 'video' | 'document' | 'external'
  url: text('url').notNull(),
  size: integer('size').default(0).notNull(),
  altText: text('alt_text'),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Activity Logs
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  details: text('details'),
  userEmail: text('user_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
  projects: many(projects),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  projects: many(projects),
  caseStudies: many(caseStudies),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [projects.categoryId],
    references: [serviceCategories.id],
  }),
  service: one(services, {
    fields: [projects.serviceId],
    references: [services.id],
  }),
  media: many(projectMedia),
  caseStudies: many(caseStudies),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, {
    fields: [projectMedia.projectId],
    references: [projects.id],
  }),
}));

export const caseStudiesRelations = relations(caseStudies, ({ one }) => ({
  project: one(projects, {
    fields: [caseStudies.projectId],
    references: [projects.id],
  }),
  relatedService: one(services, {
    fields: [caseStudies.relatedServiceId],
    references: [services.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  lead: one(leads, {
    fields: [clients.leadId],
    references: [leads.id],
  }),
  projects: many(clientProjects),
}));

export const clientProjectsRelations = relations(clientProjects, ({ one }) => ({
  client: one(clients, {
    fields: [clientProjects.clientId],
    references: [clients.id],
  }),
}));
