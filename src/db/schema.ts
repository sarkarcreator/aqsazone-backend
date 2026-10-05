import { mysqlTable, int, text, varchar, boolean, timestamp, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Admin users & authenticated users (using Firebase Auth UID)
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  uid: varchar('uid', { length: 128 }).notNull().unique(), // Firebase Auth UID
  email: varchar('email', { length: 320 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 32 }).default('admin').notNull(), // 'admin' | 'editor' | 'viewer'
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Site Settings (CMS configuration, hero, about, contacts, collaboration notice)
export const siteSettings = mysqlTable('site_settings', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 191 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Service Categories
export const serviceCategories = mysqlTable('service_categories', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  description: text('description'),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Services
export const services = mysqlTable('services', {
  id: int('id').autoincrement().primaryKey(),
  categoryId: int('category_id').references(() => serviceCategories.id),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  icon: varchar('icon', { length: 100 }).default('Sparkles').notNull(),
  shortDescription: text('short_description').notNull(),
  fullDescription: text('full_description').notNull(),
  features: json('features').$type<string[]>().notNull(),
  process: json('process').$type<{ title: string; description: string }[]>().notNull(),
  faqs: json('faqs').$type<{ question: string; answer: string }[]>().notNull(),
  sourceType: varchar('source_type', { length: 32 }).default('aqsa').notNull(), // 'aqsa' | 'dsh' | 'collaboration'
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  viewsCount: int('views_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Projects / Portfolio
export const projects = mysqlTable('projects', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  clientName: text('client_name'),
  categoryId: int('category_id').references(() => serviceCategories.id),
  serviceId: int('service_id').references(() => services.id),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  challenge: text('challenge'),
  solution: text('solution'),
  workCompleted: text('work_completed'),
  tools: json('tools').$type<string[]>().notNull(),
  results: text('results'),
  projectDate: text('project_date'), // e.g. "2025" or "Q3 2025"
  sourceType: varchar('source_type', { length: 32 }).default('aqsa').notNull(), // 'aqsa' | 'dsh' | 'collaboration'
  isSourceVisible: boolean('is_source_visible').default(false).notNull(),
  format: varchar('format', { length: 32 }).default('multiple').notNull(), // 'image' | 'video' | 'social_post' | 'website' | 'written_work' | 'case_study' | 'multiple'
  status: varchar('status', { length: 32 }).default('published').notNull(), // 'draft' | 'review' | 'published' | 'archived'
  isFeatured: boolean('is_featured').default(false).notNull(),
  thumbnailUrl: text('thumbnail_url'),
  liveUrl: text('live_url'),
  externalUrl: text('external_url'),
  viewsCount: int('views_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Project Media (images, videos, social posts, written documents)
export const projectMedia = mysqlTable('project_media', {
  id: int('id').autoincrement().primaryKey(),
  projectId: int('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  mediaType: varchar('media_type', { length: 32 }).notNull(), // 'image' | 'video' | 'social_post' | 'written' | 'document'
  url: text('url').notNull(),
  title: text('title'),
  caption: text('caption'),
  altText: text('alt_text'),
  embedCode: text('embed_code'),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Case Studies
export const caseStudies = mysqlTable('case_studies', {
  id: int('id').autoincrement().primaryKey(),
  projectId: int('project_id').references(() => projects.id, { onDelete: 'set null' }),
  relatedServiceId: int('related_service_id').references(() => services.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  clientBusiness: varchar('client_business', { length: 255 }).notNull(),
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
  viewsCount: int('views_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Testimonials
export const testimonials = mysqlTable('testimonials', {
  id: int('id').autoincrement().primaryKey(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  testimonial: text('testimonial').notNull(),
  rating: int('rating').default(5).notNull(),
  isFeatured: boolean('is_featured').default(true).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Leads / Inquiries (CRM)
export const leads = mysqlTable('leads', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  company: text('company'),
  email: varchar('email', { length: 320 }).notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  interestedService: text('interested_service'),
  relatedProject: text('related_project'),
  budget: text('budget'),
  message: text('message').notNull(),
  source: varchar('source', { length: 32 }).default('website').notNull(), // 'website', 'contact_page', 'service_page', 'project_page'
  status: varchar('status', { length: 32 }).default('new').notNull(), // 'new' | 'contacted' | 'discussion' | 'proposal' | 'negotiation' | 'won' | 'lost'
  priority: varchar('priority', { length: 32 }).default('medium').notNull(), // 'low' | 'medium' | 'high'
  notes: text('notes'),
  followUpDate: text('follow_up_date'),
  assignedPerson: varchar('assigned_person', { length: 255 }).default('Aqsa'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Clients (Converted from Leads)
export const clients = mysqlTable('clients', {
  id: int('id').autoincrement().primaryKey(),
  leadId: int('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  company: text('company'),
  email: varchar('email', { length: 320 }).notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  status: varchar('status', { length: 32 }).default('active').notNull(), // 'active' | 'completed' | 'on_hold'
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Client Projects
export const clientProjects = mysqlTable('client_projects', {
  id: int('id').autoincrement().primaryKey(),
  clientId: int('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  serviceName: text('service_name'),
  status: varchar('status', { length: 32 }).default('in_progress').notNull(), // 'in_progress' | 'completed' | 'review' | 'paused'
  budget: text('budget'),
  notes: text('notes'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Centralized Media Library
export const mediaItems = mysqlTable('media_items', {
  id: int('id').autoincrement().primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 32 }).notNull(), // 'image' | 'video' | 'document' | 'external'
  url: text('url').notNull(),
  size: int('size').default(0).notNull(),
  altText: text('alt_text'),
  caption: text('caption'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Activity Logs
export const activityLogs = mysqlTable('activity_logs', {
  id: int('id').autoincrement().primaryKey(),
  action: text('action').notNull(),
  details: text('details'),
  userEmail: text('user_email'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
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
