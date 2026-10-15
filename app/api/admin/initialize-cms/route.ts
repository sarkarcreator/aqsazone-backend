import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { activityLogs, serviceCategories, services, siteSettings } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// These are portfolio/service taxonomy entries, not fabricated client projects or testimonials.
const initialCategories = [
  { name: 'Social Media Content', slug: 'social-media-content', description: 'Social media content planning, posts, and platform-ready creative.', sortOrder: 1 },
  { name: 'Graphic Design & Branding', slug: 'graphic-design-branding', description: 'Visual identity, branded graphics, and marketing creatives.', sortOrder: 2 },
  { name: 'Web Design & Development', slug: 'web-design-development', description: 'Website design, responsive pages, and web development.', sortOrder: 3 },
  { name: 'Digital Marketing & SEO', slug: 'digital-marketing-seo', description: 'Digital campaign support, search optimization, and content visibility.', sortOrder: 4 },
  { name: 'Video Editing & Reels', slug: 'video-editing-reels', description: 'Short-form video editing, reels, and social video assets.', sortOrder: 5 },
  { name: 'Content Writing & Copywriting', slug: 'content-writing-copywriting', description: 'Website copy, captions, articles, and marketing text.', sortOrder: 6 },
  { name: 'UI/UX & Prototyping', slug: 'ui-ux-prototyping', description: 'User interface layouts, user experience flows, and prototypes.', sortOrder: 7 },
  { name: 'AI & Automation', slug: 'ai-automation', description: 'AI-assisted workflows and practical business process automation.', sortOrder: 8 },
  { name: 'Office & Administrative Support', slug: 'office-administrative-support', description: 'Document formatting, spreadsheets, and administrative support.', sortOrder: 9 },
];


const initialServices = [
  {
    categorySlug: 'social-media-content', name: 'Social Media Content Creation', slug: 'social-media-content-creation', icon: 'Share2',
    shortDescription: 'Platform-ready social media posts, content calendars, captions, and branded creative assets.',
    fullDescription: 'A practical content service for brands that need consistent, clear, and visually aligned social media communication. Deliverables are agreed with the client before production.',
    features: ['Content calendar planning', 'Post concepts and captions', 'Platform-sized creative assets', 'Brand-consistent formatting'],
    process: [{ title: 'Brief & goals', description: 'Confirm the audience, platforms, brand voice, and campaign goal.' }, { title: 'Plan & create', description: 'Prepare a content plan and draft the agreed posts and captions.' }, { title: 'Review & handoff', description: 'Collect feedback, apply agreed revisions, and deliver approved assets.' }],
    faqs: [{ question: 'Which platforms can you support?', answer: 'Platform selection is agreed during the project brief based on the client’s audience and needs.' }, { question: 'Do you publish posts too?', answer: 'Publishing and account management can be discussed as a separate scope.' }],
    sortOrder: 1,
  },
  {
    categorySlug: 'graphic-design-branding', name: 'Graphic Design & Brand Assets', slug: 'graphic-design-brand-assets', icon: 'Palette',
    shortDescription: 'Professional marketing graphics and consistent visual assets aligned with your existing brand.',
    fullDescription: 'Design support for digital campaigns and brand communication. Final deliverables depend on the approved brief and the assets supplied by the client.',
    features: ['Social media graphics', 'Promotional banners', 'Brand-aligned layouts', 'Export-ready digital files'],
    process: [{ title: 'Understand the brief', description: 'Review brand guidelines, audience, format, and intended use.' }, { title: 'Design concepts', description: 'Create design directions and refine the selected direction.' }, { title: 'Final delivery', description: 'Export approved files in the agreed formats.' }],
    faqs: [{ question: 'Can you follow an existing brand style?', answer: 'Yes. Share your available logo, colors, fonts, and brand references during briefing.' }, { question: 'Are revisions included?', answer: 'The number and scope of revisions are confirmed in the project proposal.' }],
    sortOrder: 2,
  },
  {
    categorySlug: 'web-design-development', name: 'Website Design & Development', slug: 'website-design-development', icon: 'Code2',
    shortDescription: 'Responsive business websites and portfolio pages designed around clear user journeys.',
    fullDescription: 'Website planning and implementation for portfolios and business websites. Features, integrations, hosting, and delivery milestones are defined in the project scope.',
    features: ['Responsive page layouts', 'Clear navigation and calls to action', 'Content and contact forms', 'Basic technical SEO structure'],
    process: [{ title: 'Plan', description: 'Define site goals, pages, content, and technical requirements.' }, { title: 'Build', description: 'Implement responsive pages and agreed functionality.' }, { title: 'Review & launch', description: 'Test the agreed flows, resolve issues, and coordinate deployment.' }],
    faqs: [{ question: 'Can an existing website be improved?', answer: 'Yes. The current site can be reviewed first to estimate the work required.' }, { question: 'Is hosting included?', answer: 'Hosting and domain costs are discussed separately unless explicitly included in the proposal.' }],
    sortOrder: 3,
  },
  {
    categorySlug: 'digital-marketing-seo', name: 'Digital Marketing & SEO Support', slug: 'digital-marketing-seo-support', icon: 'TrendingUp',
    shortDescription: 'Search-friendly content structure, on-page SEO improvements, and digital campaign support.',
    fullDescription: 'Digital visibility support focused on improving the quality and discoverability of a website or campaign. Rankings and campaign outcomes depend on competition, budget, and many external factors and are not guaranteed.',
    features: ['Keyword and intent research', 'On-page metadata review', 'Content structure recommendations', 'Campaign reporting framework'],
    process: [{ title: 'Audit', description: 'Review the current website, goals, and available analytics.' }, { title: 'Prioritize', description: 'Create a practical action plan based on impact and effort.' }, { title: 'Implement & review', description: 'Apply agreed changes and review measurable indicators over time.' }],
    faqs: [{ question: 'Can you guarantee first-page rankings?', answer: 'No ethical SEO provider can guarantee a specific ranking. Work focuses on sound practices and measurable improvements.' }, { question: 'Do you need website access?', answer: 'Read-only access or client-provided details may be enough for an audit; implementation access is agreed when needed.' }],
    sortOrder: 4,
  },
  {
    categorySlug: 'video-editing-reels', name: 'Short-Form Video & Reels Editing', slug: 'short-form-video-reels-editing', icon: 'Sparkles',
    shortDescription: 'Edited short-form videos with clean pacing, captions, and platform-ready exports.',
    fullDescription: 'Video editing for supplied footage and agreed creative direction. Scope covers the length, format, captions, and revisions agreed before editing begins.',
    features: ['Short-form video cuts', 'Caption and title overlays', 'Basic audio cleanup', 'Vertical social exports'],
    process: [{ title: 'Collect assets', description: 'Confirm footage, references, target platform, and final duration.' }, { title: 'Edit', description: 'Assemble the edit and apply agreed captions and visual treatments.' }, { title: 'Review & export', description: 'Apply feedback and export the final agreed format.' }],
    faqs: [{ question: 'Do I provide the footage?', answer: 'Usually the client provides footage and brand assets unless sourcing is included in the agreed scope.' }, { question: 'Can you edit long videos?', answer: 'Long-form editing can be assessed and quoted separately.' }],
    sortOrder: 5,
  },
  {
    categorySlug: 'content-writing-copywriting', name: 'Website Content & Copywriting', slug: 'website-content-copywriting', icon: 'Sparkles',
    shortDescription: 'Clear website copy, service descriptions, captions, and marketing text tailored to your audience.',
    fullDescription: 'Writing support for digital products and marketing. Research sources, tone, length, and approval workflow are agreed for each assignment.',
    features: ['Website page copy', 'Service and product descriptions', 'Social captions', 'Editing and proofreading'],
    process: [{ title: 'Brief', description: 'Confirm audience, purpose, tone, and required formats.' }, { title: 'Draft', description: 'Prepare content using supplied facts and approved references.' }, { title: 'Edit & approve', description: 'Refine clarity and accuracy with client feedback.' }],
    faqs: [{ question: 'Can you match my brand voice?', answer: 'Yes. Existing content or a short style brief helps establish the desired voice.' }, { question: 'Do you verify specialist claims?', answer: 'Any specialist facts or regulated claims should be supplied or reviewed by the client’s qualified expert.' }],
    sortOrder: 6,
  },
  {
    categorySlug: 'ui-ux-prototyping', name: 'UI/UX Design & Prototyping', slug: 'ui-ux-design-prototyping', icon: 'Palette',
    shortDescription: 'User flows, wireframes, interface layouts, and clickable design prototypes for digital products.',
    fullDescription: 'Design planning that helps teams clarify a digital product before development. Deliverables may include user flows, wireframes, responsive screens, and prototype links.',
    features: ['User journey mapping', 'Wireframes and page structure', 'Responsive interface concepts', 'Prototype handoff notes'],
    process: [{ title: 'Discover', description: 'Clarify users, product goals, and essential journeys.' }, { title: 'Structure & design', description: 'Map the flows and create the agreed interface concepts.' }, { title: 'Prototype & handoff', description: 'Connect key screens and document design decisions for implementation.' }],
    faqs: [{ question: 'Is a prototype a working website?', answer: 'A prototype demonstrates interface flows; production functionality requires development.' }, { question: 'Can you work with an existing product?', answer: 'Yes. Existing screens and user feedback can inform the design review.' }],
    sortOrder: 7,
  },
  {
    categorySlug: 'ai-automation', name: 'AI Workflow & Business Automation', slug: 'ai-workflow-business-automation', icon: 'Bot',
    shortDescription: 'Practical automation planning for repetitive workflows, lead handling, and internal business tasks.',
    fullDescription: 'Automation support starts with mapping a real workflow and deciding where automation is appropriate. Integrations, permissions, data handling, and human review are agreed before implementation.',
    features: ['Workflow mapping', 'Automation opportunity review', 'AI-assisted task design', 'Human review and error handling'],
    process: [{ title: 'Map the workflow', description: 'Document current steps, tools, inputs, and exceptions.' }, { title: 'Design & test', description: 'Build a scoped workflow and test normal and failure cases.' }, { title: 'Handoff', description: 'Document operation, limitations, access, and maintenance needs.' }],
    faqs: [{ question: 'Can every task be fully automated?', answer: 'No. Some tasks need human review, especially sensitive decisions or uncertain AI outputs.' }, { question: 'Will you integrate existing tools?', answer: 'Potential integrations are assessed based on the tools’ APIs, permissions, and technical constraints.' }],
    sortOrder: 8,
  },
  {
    categorySlug: 'office-administrative-support', name: 'Office & Administrative Support', slug: 'office-administrative-support', icon: 'CheckCircle2',
    shortDescription: 'Document formatting, spreadsheet organization, data cleanup, and structured administrative assistance.',
    fullDescription: 'Digital office support for clearly defined document and spreadsheet tasks. Access to confidential data and handling procedures are agreed before work starts.',
    features: ['Word document formatting', 'Spreadsheet cleanup and organization', 'Presentation formatting', 'Structured data entry'],
    process: [{ title: 'Confirm requirements', description: 'Agree the file formats, instructions, deadlines, and data-handling rules.' }, { title: 'Prepare files', description: 'Complete the agreed formatting or organization tasks.' }, { title: 'Quality check', description: 'Review the deliverables against the instructions before handoff.' }],
    faqs: [{ question: 'Can you work with Microsoft Office files?', answer: 'Yes, common Word, Excel, and PowerPoint tasks can be scoped based on the files provided.' }, { question: 'How is sensitive information handled?', answer: 'Share only necessary data and agree access and confidentiality requirements before work begins.' }],
    sortOrder: 9,
  },
];

// Keep contact details and social URLs blank until the owner supplies verified values.
// Only create missing keys; never overwrite anything already saved by the admin.
const initialSettings: Record<string, string> = {
  hero_title: 'Aqsa Jutt',
  hero_tagline: 'Creative Digital Portfolio',
  hero_subtitle: 'Creative work, digital services, and selected projects',
  hero_description: 'Explore portfolio work and digital services. Project details and published work are managed through the admin panel.',
  hero_primary_cta: 'View Portfolio',
  hero_secondary_cta: 'Contact Me',
  profile_image: '',
  about_name: 'Aqsa Jutt',
  about_experience: '',
  about_education: '',
  about_intro: 'Creative digital professional',
  about_bio: 'This profile is managed by Aqsa. Add a verified biography, experience, education, and achievements in Website Settings.',
  about_career_focus: 'Digital content, creative design, and web projects',
  collaboration_enabled: 'true',
  collaboration_title: 'Professional Collaboration',
  collaboration_text: 'Aqsa collaborates with Digital Solutions Hub on selected digital projects and services.',
  contact_email: '',
  contact_phone: '',
  contact_whatsapp: '',
  social_linkedin: '',
  social_instagram: '',
  social_tiktok: '',
  social_x: '',
  seo_title: 'Aqsa Zone | Aqsa Jutt Portfolio',
  seo_description: 'Explore Aqsa Jutt’s portfolio, creative services, and selected digital projects.',
};

export async function POST(req: NextRequest) {
  const { authorized, email } = await verifyAdminRequest(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existingCategories = await db.select({ slug: serviceCategories.slug }).from(serviceCategories);
    const categorySlugs = new Set(existingCategories.map((category) => category.slug));
    let categoriesAdded = 0;

    for (const category of initialCategories) {
      if (categorySlugs.has(category.slug)) continue;
      await db.insert(serviceCategories).values(category);
      categoriesAdded += 1;
    }

    const categoriesBySlug = new Map(
      (await db.select({ id: serviceCategories.id, slug: serviceCategories.slug }).from(serviceCategories))
        .map((category) => [category.slug, category.id])
    );
    const existingServices = await db.select({ slug: services.slug }).from(services);
    const serviceSlugs = new Set(existingServices.map((service) => service.slug));
    let servicesAdded = 0;

    for (const service of initialServices) {
      if (serviceSlugs.has(service.slug)) continue;
      const categoryId = categoriesBySlug.get(service.categorySlug);
      if (!categoryId) continue;
      const { categorySlug: _categorySlug, ...serviceValues } = service;
      await db.insert(services).values({
        ...serviceValues,
        categoryId,
        sourceType: 'aqsa',
        isFeatured: service.sortOrder <= 3,
        isPublished: true,
      });
      servicesAdded += 1;
    }

    const existingSettings = await db.select({ key: siteSettings.key }).from(siteSettings);
    const settingKeys = new Set(existingSettings.map((setting) => setting.key));
    let settingsAdded = 0;

    for (const [key, value] of Object.entries(initialSettings)) {
      if (settingKeys.has(key)) continue;
      await db.insert(siteSettings).values({ key, value, updatedAt: new Date() });
      settingsAdded += 1;
    }

    await db.insert(activityLogs).values({
      action: 'Initialized CMS defaults',
      details: `Added ${categoriesAdded} missing categories, ${servicesAdded} missing service entries, and ${settingsAdded} missing website settings; existing values preserved.`,
      userEmail: email || 'admin',
    });

    const categories = await db.select().from(serviceCategories).orderBy(serviceCategories.sortOrder);
    const settings = await db.select().from(siteSettings);
    const allServices = await db.select().from(services);
    return NextResponse.json({
      success: true,
      message: 'CMS defaults initialized. Existing categories, services, and settings were preserved.',
      categoriesAdded,
      categoriesTotal: categories.length,
      servicesAdded,
      servicesTotal: allServices.length,
      settingsAdded,
      settingsTotal: settings.length,
    });
  } catch (error) {
    console.error('CMS initialization failed:', error);
    return NextResponse.json({ error: 'Could not initialize CMS defaults. Check the backend database connection and schema.' }, { status: 500 });
  }
}
