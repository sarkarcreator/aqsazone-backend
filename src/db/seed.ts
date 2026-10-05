import { db } from './index';
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
  users,
} from './schema';
import { count } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('Checking if database already has data...');
  const [existingCategories] = await db.select({ value: count() }).from(serviceCategories);

  if (existingCategories && Number(existingCategories.value) > 0) {
    console.log('Database already has seeded data. Skipping seed.');
    return;
  }

  console.log('Seeding Aqsa Zone initial database...');

  // 1. Initial Site Settings
  const initialSettings = [
    { key: 'hero_title', value: "Hi, I'm Aqsa" },
    { key: 'hero_subtitle', value: 'Digital Professional & Creative Problem Solver' },
    { key: 'hero_tagline', value: 'Turning Ideas Into Digital Experiences' },
    {
      key: 'hero_description',
      value:
        'I help businesses, brands and individuals build their digital presence through creative, technical and digital solutions.',
    },
    { key: 'hero_primary_cta', value: 'View My Work' },
    { key: 'hero_secondary_cta', value: "Let's Work Together" },
    { key: 'profile_image', value: '/images/aqsa_profile.jpg' },
    { key: 'about_name', value: 'Aqsa' },
    {
      key: 'about_intro',
      value:
        'A creative and results-driven digital specialist blending engineering discipline with design intuition.',
    },
    {
      key: 'about_bio',
      value:
        'I am a digital professional with a strong passion for helping entrepreneurs, growing brands, and modern enterprises translate ambitious ideas into tangible digital realities. With hands-on proficiency across modern web engineering, AI automation, high-impact brand aesthetics, and strategic growth campaigns, I deliver end-to-end solutions that look stunning and perform reliably.',
    },
    { key: 'about_experience', value: '5+ Years of Industry Experience' },
    { key: 'about_education', value: 'B.S. in Computer Science & Interactive Multimedia' },
    {
      key: 'about_skills',
      value: JSON.stringify([
        'Full-Stack Web Development',
        'AI Agents & Automation Workflows',
        'UI/UX & Brand Identity Systems',
        'Advanced SEO & Search Engine Dominance',
        'Social Media Architecture & Growth',
        'E-Commerce & Digital Merchandising',
        'Performance Ads & Conversion Funnels',
        'Executive & Team Digital Skills Training',
      ]),
    },
    {
      key: 'about_career_focus',
      value:
        'Architecting resilient digital platforms, unlocking operational efficiency through AI automation, and crafting memorable brand identities.',
    },
    { key: 'collaboration_enabled', value: 'true' },
    { key: 'collaboration_title', value: 'Professional Collaboration' },
    {
      key: 'collaboration_text',
      value:
        'Aqsa also collaborates with Digital Solutions Hub on selected digital projects and services.',
    },
    { key: 'contact_email', value: 'hello@aqsazone.com' },
    { key: 'contact_phone', value: '+1 (555) 019-2834' },
    { key: 'contact_whatsapp', value: '+15550192834' },
    { key: 'social_linkedin', value: 'https://linkedin.com/in/aqsa-digital' },
    { key: 'social_instagram', value: 'https://instagram.com/aqsa.zone' },
    { key: 'social_tiktok', value: 'https://tiktok.com/@aqsa.zone' },
    { key: 'social_x', value: 'https://x.com/aqsazone' },
    { key: 'social_facebook', value: 'https://facebook.com/aqsazone' },
    { key: 'seo_title', value: 'Aqsa Zone | Digital Services & Creative Portfolio' },
    {
      key: 'seo_description',
      value:
        'Turning Ideas Into Digital Experiences. Explore professional web development, AI automation, branding, and digital growth services by Aqsa.',
    },
    { key: 'footer_tagline', value: 'Crafting the next generation of digital excellence.' },
  ];

  for (const s of initialSettings) {
    await db.insert(siteSettings).values(s).onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: s.value },
    });
  }

  // 2. Service Categories
  const categoriesData = [
    { name: 'AI & Automation', slug: 'ai-automation', description: 'Autonomous agents, workflow integrations, and intelligent automation systems.', sortOrder: 1 },
    { name: 'Web & App Development', slug: 'web-development', description: 'Custom web applications, e-commerce stores, business websites, and admin portals.', sortOrder: 2 },
    { name: 'Design & Branding', slug: 'design-branding', description: 'Logo creation, brand identity systems, social media visual assets, and marketing collateral.', sortOrder: 3 },
    { name: 'Social Media Management', slug: 'social-media', description: 'End-to-end platform management, content curation, reels, and strategic audience growth.', sortOrder: 4 },
    { name: 'SEO & Google Ranking', slug: 'seo-ranking', description: 'Technical SEO audits, keyword research, on-page architecture, and local Google visibility.', sortOrder: 5 },
    { name: 'Digital Marketing & Ads', slug: 'digital-marketing', description: 'Targeted Meta and Google ad campaigns optimized for lead generation and maximum ROI.', sortOrder: 6 },
    { name: 'LinkedIn Services', slug: 'linkedin-services', description: 'Executive profile makeover, company page growth, and B2B thought leadership funnels.', sortOrder: 7 },
    { name: 'TikTok & Creator Services', slug: 'tiktok-creator', description: 'Agency account setup, viral hooks, creator monetization, and algorithmic expansion.', sortOrder: 8 },
    { name: 'Content Creation', slug: 'content-creation', description: 'Compelling copywriting, insightful articles, video scripting, and strategic storytelling.', sortOrder: 9 },
    { name: 'E-Commerce & Online Business', slug: 'ecommerce-business', description: 'Shopify architecture, eBay storefronts, product catalog management, and dropshipping ops.', sortOrder: 10 },
    { name: 'Computer & Digital Skills Training', slug: 'skills-training', description: 'Practical 1-on-1 and team corporate workshops on digital tools, office suites, and AI adoption.', sortOrder: 11 },
  ];

  const insertedCategories = await db.insert(serviceCategories).values(categoriesData).returning();
  const categoryMap = new Map<string, number>();
  insertedCategories.forEach((c) => categoryMap.set(c.slug, c.id));

  // 3. Services
  const servicesData = [
    {
      categoryId: categoryMap.get('ai-automation')!,
      name: 'AI Agents & Automation Systems',
      slug: 'ai-agents-automation',
      icon: 'Bot',
      shortDescription: 'Deploy autonomous AI agents that handle repetitive inquiries, schedule appointments, and streamline complex business operations 24/7.',
      fullDescription: 'We build enterprise-grade, bespoke AI workflows that integrate seamlessly with your CRM, communication tools, and databases. From autonomous customer support agents that resolve queries with human-like precision to automated data extraction pipelines, we free up your team to focus on high-value strategic growth.',
      features: ['Custom AI Agents (LangChain, OpenAI, Gemini)', 'Zapier & Make.com Advanced Workflow Chains', 'CRM & ERP Synchronization', 'Intelligent Document & Invoice Parsing', 'Continuous Agent Monitoring & Guardrails'],
      process: [
        { title: 'Workflow Audit', description: 'We map out your repetitive bottlenecks, repetitive team actions, and integration requirements.' },
        { title: 'Agent Architecture', description: 'Design prompt flows, safety parameters, tool execution, and vector memory retrieval.' },
        { title: 'Testing & Integration', description: 'Conduct end-to-end sandbox testing before linking with your live communications channels.' },
        { title: 'Deployment & Training', description: 'Seamless rollout with comprehensive handover and monitoring dashboards.' }
      ],
      faqs: [
        { question: 'What tools or platforms do your AI agents integrate with?', answer: 'We connect with WhatsApp, Telegram, Slack, HubSpot, Salesforce, Google Workspace, custom SQL databases, and web portals.' },
        { question: 'Is my proprietary data secure when using AI agents?', answer: 'Yes, we implement strict zero-data-retention APIs and enterprise confidentiality protocols.' }
      ],
      sourceType: 'aqsa',
      isFeatured: true,
      isPublished: true,
      sortOrder: 1,
    },
    {
      categoryId: categoryMap.get('web-development')!,
      name: 'Full-Stack Web & App Development',
      slug: 'web-app-development',
      icon: 'Code2',
      shortDescription: 'High-performance, bespoke web applications, SaaS dashboards, and scalable corporate platforms crafted with modern technologies.',
      fullDescription: 'From lightning-fast marketing websites to complex cloud-native portals and custom admin CMS/CRM systems, we engineer web solutions built for security, responsiveness, and conversion. Every line of code is structured for maintainability and peak performance.',
      features: ['React, Next.js & TypeScript Engineering', 'Custom Admin Panels & CRM Dashboards', 'Tailwind CSS & Mobile-First Responsive Design', 'Relational Databases & Scalable API Architectures', 'Core Web Vitals & Speed Optimization'],
      process: [
        { title: 'Technical Discovery', description: 'Define user journeys, database schemas, feature requirements, and technical constraints.' },
        { title: 'UI/UX Wireframing', description: 'Build interactive prototypes and validate layouts before writing code.' },
        { title: 'Full-Stack Development', description: 'Agile sprints with clean code, automated testing, and milestone check-ins.' },
        { title: 'Launch & Performance Tuning', description: 'Production deployment, SSL setup, and 99+ Lighthouse performance optimization.' }
      ],
      faqs: [
        { question: 'Can I manage content without touching the code?', answer: 'Yes, all our platforms include intuitive, self-hosted Admin CMS dashboards for instant updates.' },
        { question: 'Do you work with existing codebases?', answer: 'Absolutely. We refactor, modernize, and build new modules onto existing stacks.' }
      ],
      sourceType: 'collaboration',
      isFeatured: true,
      isPublished: true,
      sortOrder: 2,
    },
    {
      categoryId: categoryMap.get('design-branding')!,
      name: 'Brand Identity & Visual Design Systems',
      slug: 'brand-identity-design',
      icon: 'Palette',
      shortDescription: 'Distinctive, memorable visual identities, logo marks, social media design systems, and marketing collateral that command authority.',
      fullDescription: 'A strong brand goes far beyond a pretty logo. We design comprehensive visual ecosystems that communicate your unique value proposition, evoke trust, and make your business instantly recognizable across every digital and print touchpoint.',
      features: ['Strategic Logo & Iconography Design', 'Color Palettes & Typography Guidelines', 'Social Media Templates & Design Kits', 'Business Cards & Stationery Systems', 'Pitch Decks & Marketing Banners'],
      process: [
        { title: 'Brand Positioning', description: 'Uncovering brand personality, target demographics, and market competitors.' },
        { title: 'Creative Concepts', description: 'Developing 3 distinct creative directions with real-world application mockups.' },
        { title: 'Refinement', description: 'Polishing the chosen concept down to the pixel with strict grid alignment.' },
        { title: 'Brand Guidelines Delivery', description: 'Exporting comprehensive asset kits in vector formats alongside a brand style manual.' }
      ],
      faqs: [
        { question: 'What file formats will I receive?', answer: 'Vector files (AI, EPS, SVG), high-resolution web formats (PNG, JPG, WebP), and ready-to-print PDFs.' }
      ],
      sourceType: 'aqsa',
      isFeatured: true,
      isPublished: true,
      sortOrder: 3,
    },
    {
      categoryId: categoryMap.get('seo-ranking')!,
      name: 'SEO & Search Engine Dominance',
      slug: 'seo-google-ranking',
      icon: 'TrendingUp',
      shortDescription: 'Data-driven on-page, technical, and local SEO strategies that elevate your organic rankings and drive qualified customer search traffic.',
      fullDescription: 'Stop relying solely on paid ad spend. We optimize your website architecture, build semantic keyword hierarchies, resolve indexing bottlenecks, and execute authority-building strategies that place your business in front of high-intent searchers on Google.',
      features: ['Technical SEO Audits & Core Web Vitals', 'High-Intent Keyword Research & Mapping', 'On-Page Content & Meta Optimization', 'Schema Markup & Rich Snippet Implementation', 'Local Google Business Profile Ranking'],
      process: [
        { title: 'Comprehensive SEO Audit', description: 'Diagnosing crawl errors, slow page loads, duplicate content, and missing schema.' },
        { title: 'Keyword Strategy', description: 'Identifying commercial and transactional keywords your customers search for.' },
        { title: 'On-Page Optimization', description: 'Rebuilding heading hierarchy, meta tags, image alt data, and internal linking.' },
        { title: 'Monitoring & Reporting', description: 'Tracking ranking positions, search impressions, and click-through rates monthly.' }
      ],
      faqs: [
        { question: 'How long until we see SEO results?', answer: 'Initial technical and indexing improvements happen within weeks, with solid organic ranking gains typically appearing between 60 to 90 days.' }
      ],
      sourceType: 'aqsa',
      isFeatured: true,
      isPublished: true,
      sortOrder: 4,
    },
    {
      categoryId: categoryMap.get('digital-marketing')!,
      name: 'Digital Marketing & Paid Advertising',
      slug: 'digital-marketing-ads',
      icon: 'Megaphone',
      shortDescription: 'Targeted Meta and Google ad campaigns engineered for consistent customer acquisition, lead generation, and measurable return on ad spend.',
      fullDescription: 'We create, execute, and optimize full-funnel ad campaigns that convert casual scrollers into paying clients. From high-converting copywriting and visual ad creatives to custom pixel tracking and retargeting sequences, we treat your marketing budget like our own investment.',
      features: ['Meta Ads (Facebook & Instagram)', 'Google Search & Performance Max Ads', 'High-Converting Ad Creatives & Video Hooks', 'Pixel & Conversion API Tracking', 'A/B Creative & Audience Testing'],
      process: [
        { title: 'Funnel Blueprint', description: 'Defining customer avatars, offer positioning, and target cost-per-acquisition.' },
        { title: 'Creative Production', description: 'Crafting persuasive ad copies, static visuals, and video reels.' },
        { title: 'Campaign Setup', description: 'Configuring precise audience targeting, custom exclusions, and pixel conversions.' },
        { title: 'Scaling & Optimization', description: 'Daily bid adjustments, budget reallocation to winning ad sets, and continuous split testing.' }
      ],
      faqs: [
        { question: 'What is the recommended minimum ad budget?', answer: 'We recommend starting with at least $500/month in ad spend to ensure sufficient statistical data for machine learning optimization.' }
      ],
      sourceType: 'collaboration',
      isFeatured: false,
      isPublished: true,
      sortOrder: 5,
    },
    {
      categoryId: categoryMap.get('linkedin-services')!,
      name: 'LinkedIn Executive Optimization & B2B Lead Gen',
      slug: 'linkedin-services',
      icon: 'Share2',
      shortDescription: 'Elevate your personal authority, revamp company pages, and implement outbound connection systems that attract enterprise partnerships.',
      fullDescription: 'Position yourself as an undisputed authority in your niche. We transform dormant LinkedIn profiles into 24/7 lead generation magnets with magnetic headlines, engaging about narratives, and structured weekly thought-leadership content.',
      features: ['Profile & Company Page Overhaul', 'Custom Banner & Featured Section Design', 'Weekly B2B Thought-Leadership Content Plans', 'Targeted Network Growth & Direct Outreach', 'Inbound Inquiry Conversion System'],
      process: [
        { title: 'Profile Audit', description: 'Analyzing your current profile strength, keywords, and audience impressions.' },
        { title: 'Bio & Copy Overhaul', description: 'Rewriting your headline, summary, and experience sections with commercial clarity.' },
        { title: 'Content Rhythm', description: 'Drafting high-engagement industry insights, case breakdown posts, and carousels.' }
      ],
      faqs: [
        { question: 'Do I have to spend hours on LinkedIn myself?', answer: 'No, we provide done-for-you content and outreach frameworks requiring only minutes of your weekly approval.' }
      ],
      sourceType: 'aqsa',
      isFeatured: false,
      isPublished: true,
      sortOrder: 6,
    },
    {
      categoryId: categoryMap.get('ecommerce-business')!,
      name: 'E-Commerce & Online Store Solutions',
      slug: 'ecommerce-store-solutions',
      icon: 'ShoppingCart',
      shortDescription: 'Complete Shopify, dropshipping, and multi-channel store setups designed to maximize average order value and checkout conversions.',
      fullDescription: 'Launch or scale your digital store with battle-tested e-commerce infrastructure. We handle theme customization, frictionless checkout flows, automated abandoned cart recovery, payment gateway integration, and inventory sync across major sales channels.',
      features: ['Shopify Store Setup & Customization', 'Payment Gateway & Shipping Rate Config', 'Product Catalog & High-Converting Descriptions', 'Abandoned Cart & Email Recovery Automations', 'Cross-Sell & Upsell Funnel Integration'],
      process: [
        { title: 'Store Architecture', description: 'Selecting optimal themes, navigational hierarchy, and collection structures.' },
        { title: 'Setup & Integrations', description: 'Configuring payment providers (Stripe, PayPal), tax rules, and order notifications.' },
        { title: 'Conversion Audit', description: 'Ensuring 1-click checkout, trust badges, and lightning-fast mobile rendering.' }
      ],
      faqs: [
        { question: 'Can you migrate my existing store to Shopify?', answer: 'Yes, we migrate products, customers, and order history with zero downtime.' }
      ],
      sourceType: 'dsh',
      isFeatured: false,
      isPublished: true,
      sortOrder: 7,
    },
    {
      categoryId: categoryMap.get('skills-training')!,
      name: 'Digital Skills & Modern Tech Workshops',
      slug: 'digital-skills-training',
      icon: 'GraduationCap',
      shortDescription: 'Hands-on practical training in AI productivity tools, office workflows, digital marketing, and web fundamentals for individuals and teams.',
      fullDescription: 'Empower yourself or your staff with the digital competencies required in today modern workplace. We provide structured, interactive curriculum sessions tailored to your exact industry needs, complete with practical assignments and ongoing Q&A support.',
      features: ['GenAI & Prompt Engineering Mastery', 'Microsoft Office & Workspace Productivity', 'Practical Web & No-Code Fundamentals', 'Social Media & Content Strategy Basics', 'Personalized 1-on-1 Mentorship Sessions'],
      process: [
        { title: 'Skills Assessment', description: 'Identifying knowledge gaps and defining clear learning objectives.' },
        { title: 'Interactive Sessions', description: 'Live video workshops with real-world project walkthroughs.' },
        { title: 'Resource Toolkits', description: 'Delivering cheat sheets, prompt libraries, and step-by-step checklists.' }
      ],
      faqs: [
        { question: 'Are sessions conducted online or in person?', answer: 'Training is primarily delivered via interactive live video sessions (Zoom/Google Meet) with full recording access.' }
      ],
      sourceType: 'aqsa',
      isFeatured: false,
      isPublished: true,
      sortOrder: 8,
    }
  ];

  const insertedServices = await db.insert(services).values(servicesData).returning();
  const serviceMap = new Map<string, number>();
  insertedServices.forEach((s) => serviceMap.set(s.slug, s.id));

  // 4. Projects / Portfolio
  const projectsData = [
    {
      title: 'Aura Luxe Lifestyle - Brand Identity & Design System',
      slug: 'aura-luxe-lifestyle-branding',
      clientName: 'Aura Luxe Atelier',
      categoryId: categoryMap.get('design-branding')!,
      serviceId: serviceMap.get('brand-identity-design')!,
      shortDescription: 'An opulent visual identity system, custom typography, luxury packaging, and digital collateral for a premium lifestyle label.',
      description: 'Aura Luxe approached us to develop a complete brand overhaul that would position them alongside prestigious international luxury ateliers. We engineered an elegant design system featuring custom typography, a gold-embossed emblem, minimalist stationery, and comprehensive digital guidelines.',
      challenge: 'The client existing visual presence was fragmented across outdated templates, failing to communicate the premium craftsmanship and price point of their collections.',
      solution: 'We crafted a minimalist yet opulent brand universe anchored by high-contrast serif typography, deep slate backgrounds, and warm metallic accents across print and digital media.',
      workCompleted: 'Brand strategy, primary & secondary logomarks, color system, luxury packaging mockup, stationery suite, social media templates, and 45-page brand guideline manual.',
      tools: ['Adobe Illustrator', 'Photoshop', 'Figma', 'InDesign'],
      results: 'Transformed customer perception, contributing to a 42% lift in average order value and immediate international retail stockist inquiries.',
      projectDate: '2025',
      sourceType: 'aqsa',
      isSourceVisible: false,
      format: 'image',
      status: 'published',
      isFeatured: true,
      thumbnailUrl: '/images/project_brand.jpg',
      liveUrl: 'https://auraluxe.example.com',
      externalUrl: '',
      viewsCount: 342,
    },
    {
      title: 'NextGen Cloud Analytics & Enterprise Portal',
      slug: 'nextgen-cloud-analytics-portal',
      clientName: 'Apex Data Systems',
      categoryId: categoryMap.get('web-development')!,
      serviceId: serviceMap.get('web-app-development')!,
      shortDescription: 'A modern, lightning-fast SaaS web dashboard and administrative command center built for real-time telemetry and data workflows.',
      description: 'Designed and engineered an enterprise-grade analytics dashboard that renders millions of telemetry events in real time. Features interactive drill-downs, multi-tenant authentication, automated report generation, and dark-mode aesthetic.',
      challenge: 'Legacy portal suffered from 8-second page loads, poor mobile adaptability, and clunky manual data exports.',
      solution: 'Re-architected the frontend using Next.js App Router, Tailwind CSS, and optimized WebSockets for instant data streaming.',
      workCompleted: 'Full UI/UX design, Next.js frontend implementation, RESTful API integrations, responsive charting, and role-based access control.',
      tools: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Chart.js'],
      results: 'Reduced page load latency to under 350ms, improved daily active user engagement by 65%, and earned praise from executive stakeholders.',
      projectDate: '2025',
      sourceType: 'collaboration',
      isSourceVisible: true,
      format: 'website',
      status: 'published',
      isFeatured: true,
      thumbnailUrl: '/images/project_dashboard.jpg',
      liveUrl: 'https://apexanalytics.example.com',
      externalUrl: '',
      viewsCount: 512,
    },
    {
      title: 'Autonomous Client Inquiry & Scheduling AI Agent',
      slug: 'autonomous-inquiry-scheduling-ai-agent',
      clientName: 'PrimeTech Advisory',
      categoryId: categoryMap.get('ai-automation')!,
      serviceId: serviceMap.get('ai-agents-automation')!,
      shortDescription: 'An intelligent AI agent handling multi-lingual lead qualification, CRM entry, and calendar bookings with zero human latency.',
      description: 'Engineered an autonomous conversational agent integrated directly into the client website and messaging channels. The agent understands complex queries, qualifies budget and intent, checks calendar availability, and creates leads in the CRM.',
      challenge: 'High inbound lead volume outside of business hours resulted in a 48% drop-off rate as prospects sought faster competitors.',
      solution: 'Deployed a custom AI conversational agent with strict domain knowledge guardrails, calendar booking integration, and webhook CRM sync.',
      workCompleted: 'Prompt engineering, conversational state management, calendar API integration, CRM webhook pipeline, and monitoring dashboard.',
      tools: ['Gemini 2.5 Flash', 'Node.js', 'Google Calendar API', 'HubSpot CRM', 'Make.com'],
      results: 'Instant 24/7 response time achieved; qualified booking conversion climbed by 83% in the first 45 days.',
      projectDate: '2025',
      sourceType: 'aqsa',
      isSourceVisible: false,
      format: 'case_study',
      status: 'published',
      isFeatured: true,
      thumbnailUrl: '/images/project_dashboard.jpg',
      liveUrl: '',
      externalUrl: '',
      viewsCount: 420,
    },
    {
      title: 'B2B Strategic LinkedIn Authority Campaign',
      slug: 'b2b-strategic-linkedin-authority',
      clientName: 'Nordic Venture Partners',
      categoryId: categoryMap.get('linkedin-services')!,
      serviceId: serviceMap.get('linkedin-services')!,
      shortDescription: 'Comprehensive executive profile transformation and organic thought leadership strategy for managing partners.',
      description: 'Rebuilt the personal brand presence for senior partners, crafting weekly visual breakdowns and insight articles on technology investment trends that positioned the firm at the forefront of regional venture discussions.',
      challenge: 'Partners had minimal digital footprint despite managing significant funds, limiting direct inbound pitch opportunities.',
      solution: 'Redesigned profiles with authoritative positioning banners, curated weekly long-form insights, and established an engagement schedule.',
      workCompleted: 'Profile design overhaul, 12 in-depth articles, 24 carousel visual assets, and lead tracking workflow.',
      tools: ['Figma', 'LinkedIn Analytics', 'Notion', 'Canva Pro'],
      results: 'Over 280,000 organic post impressions generated within 90 days and 18 high-profile direct deal inquiries initiated.',
      projectDate: '2024',
      sourceType: 'aqsa',
      isSourceVisible: false,
      format: 'written_work',
      status: 'published',
      isFeatured: false,
      thumbnailUrl: '/images/project_brand.jpg',
      liveUrl: 'https://linkedin.com/company/nordic-example',
      externalUrl: '',
      viewsCount: 298,
    }
  ];

  const insertedProjects = await db.insert(projects).values(projectsData).returning();

  // 5. Project Media attachments
  for (const proj of insertedProjects) {
    await db.insert(projectMedia).values([
      {
        projectId: proj.id,
        mediaType: 'image',
        url: proj.thumbnailUrl || '/images/project_dashboard.jpg',
        title: `${proj.title} - Showcase View`,
        caption: 'High-resolution project preview demonstrating visual execution and architectural layout.',
        altText: proj.title,
        sortOrder: 1,
      },
      {
        projectId: proj.id,
        mediaType: 'image',
        url: '/images/project_brand.jpg',
        title: `${proj.title} - Collateral & System Details`,
        caption: 'Detailed breakdown of system modules, responsive typography, and asset implementations.',
        altText: `${proj.title} details`,
        sortOrder: 2,
      },
    ]);
  }

  // 6. Case Studies
  await db.insert(caseStudies).values([
    {
      projectId: insertedProjects[1].id,
      relatedServiceId: serviceMap.get('web-app-development')!,
      title: 'Scaling Telemetry & Analytics UX for Apex Data Systems',
      slug: 'scaling-telemetry-analytics-apex-data',
      clientBusiness: 'Apex Data Systems (Enterprise Cloud Monitoring)',
      problem: 'Apex legacy customer portal suffered from unacceptable load latency of 8+ seconds, confusing navigation hierarchies, and high user frustration during mission-critical incident responses.',
      objectives: 'Modernize the platform architecture, reduce latency to under 500ms, provide an intuitive dark-mode interface, and enable instant CSV/PDF reporting.',
      strategy: 'We conducted in-depth stakeholder workflows, decomposed the monolithic interface into modular reactive widgets, and deployed an optimized Next.js frontend with server-side caching.',
      workPerformed: 'Architectural redesign, UX wireframes, high-fidelity prototypes, complete Next.js implementation, interactive charts, and API integration.',
      tools: 'Next.js, TypeScript, Tailwind CSS, PostgreSQL, Chart.js',
      implementation: 'Phased rollout with continuous staging reviews, migrating 500+ active enterprise accounts with zero unexpected downtime.',
      results: 'Achieved 340ms average page load speeds (95% reduction), 65% increase in daily active user session duration, and 0 customer churn during migration.',
      coverImage: '/images/project_dashboard.jpg',
      isFeatured: true,
      isPublished: true,
      viewsCount: 184,
    },
    {
      projectId: insertedProjects[2].id,
      relatedServiceId: serviceMap.get('ai-agents-automation')!,
      title: 'Automating Inbound Pipeline with 24/7 Autonomous AI Agent',
      slug: 'automating-inbound-pipeline-primetech',
      clientBusiness: 'PrimeTech Advisory (Management Consultancy)',
      problem: 'Inbound prospect inquiries arrived from multiple global timezones, resulting in 12+ hour response lags and lost high-ticket client opportunities.',
      objectives: 'Deploy an intelligent, brand-aligned AI agent capable of answering complex consulting questions, verifying prospect qualification criteria, and booking direct partner consultations.',
      strategy: 'Engineered a multi-stage conversational state machine with strict domain guardrails, real-time Google Calendar availability checks, and automatic CRM lead entry.',
      workPerformed: 'Custom prompt architecture, tool-calling pipelines, calendar integration, automated email confirmations, and lead scoring logic.',
      tools: 'Gemini 2.5 Flash, Node.js API, Google Calendar API, HubSpot CRM',
      implementation: 'Integrated widget deployed on web and WhatsApp, accompanied by human-in-the-loop escalation notifications.',
      results: '83% increase in qualified consultation bookings, 100% elimination of out-of-hours response delays, and saving 15 staff hours weekly.',
      coverImage: '/images/project_dashboard.jpg',
      isFeatured: true,
      isPublished: true,
      viewsCount: 220,
    }
  ]);

  // 7. Testimonials
  await db.insert(testimonials).values([
    {
      clientName: 'Elena Rostova',
      position: 'Managing Director',
      company: 'Aura Luxe Atelier',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      testimonial: 'Aqsa transformed our brand from the ground up. Her keen aesthetic sensibility and attention to typography gave our luxury label the presence it truly deserved. Working with her was seamless, professional, and extraordinarily rewarding.',
      rating: 5,
      isFeatured: true,
      isPublished: true,
    },
    {
      clientName: 'Marcus Vance',
      position: 'VP of Technology',
      company: 'Apex Data Systems',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      testimonial: 'The new analytics dashboard delivered by Aqsa Zone blew our expectations out of the water. Not only is it blazingly fast and responsive, but the clean engineering allows our internal developers to build on top of it effortlessly.',
      rating: 5,
      isFeatured: true,
      isPublished: true,
    },
    {
      clientName: 'Tariq Al-Mansoor',
      position: 'Founder & CEO',
      company: 'PrimeTech Advisory',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      testimonial: 'Our inbound qualification process used to be our biggest bottleneck. The AI automation workflows developed by Aqsa revolutionized our pipeline. We are booking 80% more calls with zero extra administrative overhead.',
      rating: 5,
      isFeatured: true,
      isPublished: true,
    }
  ]);

  // 8. Sample Leads for CRM
  const sampleLeads = [
    {
      name: 'Sophia Chen',
      company: 'Zenith Health Innovations',
      email: 'sophia@zenithhealth.io',
      phone: '+1 415 892 3411',
      whatsapp: '+14158923411',
      interestedService: 'AI Agents & Automation Systems',
      relatedProject: 'Autonomous Client Inquiry & Scheduling AI Agent',
      budget: '$5,000 - $10,000',
      message: 'We are looking to implement an AI patient onboarding and appointment scheduling agent for our clinic network. Loved your work with PrimeTech.',
      source: 'service_page',
      status: 'discussion',
      priority: 'high',
      notes: 'Initial call scheduled for Thursday 2 PM. Very enthusiastic about Gemini 2.5 Flash capabilities.',
      followUpDate: '2026-10-08',
      assignedPerson: 'Aqsa',
    },
    {
      name: 'David Miller',
      company: 'Craft & Co. Retailers',
      email: 'david@craftandco.com',
      phone: '+1 212 555 7820',
      whatsapp: '+12125557820',
      interestedService: 'Full-Stack Web & App Development',
      relatedProject: 'Aura Luxe Lifestyle - Brand Identity & Design System',
      budget: '$10,000 - $25,000',
      message: 'Need a complete redesign of our e-commerce web platform and brand guidelines before Q4.',
      source: 'website',
      status: 'proposal',
      priority: 'high',
      notes: 'Proposal draft sent with two tier options. Waiting on partner feedback.',
      followUpDate: '2026-10-10',
      assignedPerson: 'Aqsa',
    },
    {
      name: 'Amira Patel',
      company: 'Vanguard Media Group',
      email: 'amira@vanguardmedia.co',
      phone: '+44 20 7946 0912',
      whatsapp: '+442079460912',
      interestedService: 'SEO & Search Engine Dominance',
      relatedProject: '',
      budget: '$2,500 - $5,000',
      message: 'Looking for a comprehensive technical SEO audit and ongoing search dominance strategy for our publishing arm.',
      source: 'contact_page',
      status: 'new',
      priority: 'medium',
      notes: 'Inquiry received today. Review current domain metrics before reaching out.',
      followUpDate: '2026-10-06',
      assignedPerson: 'Aqsa',
    },
    {
      name: 'Julian Hayes',
      company: 'Starlight Capital',
      email: 'j.hayes@starlightcap.com',
      phone: '+1 312 901 4455',
      whatsapp: '+13129014455',
      interestedService: 'LinkedIn Executive Optimization & B2B Lead Gen',
      relatedProject: 'B2B Strategic LinkedIn Authority Campaign',
      budget: '$3,000 - $6,000',
      message: 'Seeking profile optimization and weekly ghostwriting for 3 managing directors.',
      source: 'project_page',
      status: 'won',
      priority: 'high',
      notes: 'Contract signed! Converted to active client.',
      followUpDate: '',
      assignedPerson: 'Aqsa',
    }
  ];

  const insertedLeads = await db.insert(leads).values(sampleLeads).returning();

  // Convert Won lead to Client
  const wonLead = insertedLeads.find((l) => l.status === 'won');
  if (wonLead) {
    const [client] = await db.insert(clients).values({
      leadId: wonLead.id,
      name: wonLead.name,
      company: wonLead.company,
      email: wonLead.email,
      phone: wonLead.phone,
      whatsapp: wonLead.whatsapp,
      status: 'active',
      notes: 'Enterprise account. 3 Managing Partner LinkedIn profile revamps and 3 months content retainer.',
    }).returning();

    await db.insert(clientProjects).values({
      clientId: client.id,
      projectName: 'Executive Thought Leadership Retainer',
      serviceName: 'LinkedIn Executive Optimization',
      status: 'in_progress',
      budget: '$5,400',
      startDate: '2026-10-01',
      endDate: '2026-12-31',
      notes: 'Phase 1: Profile revamp in progress. Phase 2: Weekly carousels.',
    });
  }

  // 9. Media Items
  await db.insert(mediaItems).values([
    {
      filename: 'aqsa_profile.jpg',
      fileType: 'image',
      url: '/images/aqsa_profile.jpg',
      size: 710131,
      altText: 'Aqsa - Digital Professional & Creative Problem Solver',
      caption: 'Official brand portrait for Aqsa Zone.',
    },
    {
      filename: 'project_dashboard.jpg',
      fileType: 'image',
      url: '/images/project_dashboard.jpg',
      size: 575506,
      altText: 'NextGen Analytics Platform Interface',
      caption: 'Interactive cloud telemetry and metrics dashboard mockup.',
    },
    {
      filename: 'project_brand.jpg',
      fileType: 'image',
      url: '/images/project_brand.jpg',
      size: 768204,
      altText: 'Aura Luxe Brand Identity System',
      caption: 'Stationery, typography, and gold emblem luxury branding.',
    }
  ]);

  // 10. Initial Activity Log
  await db.insert(activityLogs).values({
    action: 'System Initialized',
    details: 'Initial database seeds, services catalogue, portfolio projects, and site settings established.',
    userEmail: 'system@aqsazone.com',
  });

  console.log('Seeding completed successfully!');
}
