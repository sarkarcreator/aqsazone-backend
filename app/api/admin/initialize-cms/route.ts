import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth';
import { db } from '@/src/db/index';
import { activityLogs, serviceCategories, siteSettings } from '@/src/db/schema';
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
      details: `Added ${categoriesAdded} missing categories and ${settingsAdded} missing website settings; existing values preserved.`,
      userEmail: email || 'admin',
    });

    const categories = await db.select().from(serviceCategories).orderBy(serviceCategories.sortOrder);
    const settings = await db.select().from(siteSettings);
    return NextResponse.json({
      success: true,
      message: 'CMS defaults initialized. Existing categories and settings were preserved.',
      categoriesAdded,
      categoriesTotal: categories.length,
      settingsAdded,
      settingsTotal: settings.length,
    });
  } catch (error) {
    console.error('CMS initialization failed:', error);
    return NextResponse.json({ error: 'Could not initialize CMS defaults. Check the backend database connection and schema.' }, { status: 500 });
  }
}
