import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partners & Apps — 0nMCP Ecosystem | Featured Businesses Powered by AI',
  description:
    'Explore the 0nMCP ecosystem. 0nCore apps, Rocket+ mods, partner integrations, and featured businesses using 0nMCP to automate operations and grow revenue.',
  openGraph: {
    title: 'Partners & Apps — 0nMCP Ecosystem',
    description:
      'The full 0nMCP ecosystem — 0nCore apps, Rocket+ mods, partner integrations, and featured businesses powered by AI orchestration.',
    url: 'https://0nmcp.com/partners',
    type: 'website',
  },
  alternates: { canonical: 'https://0nmcp.com/partners' },
}

/* ------------------------------------------------------------------ */
/*  0nCore Apps — first-party apps built exclusively on 0nMCP          */
/* ------------------------------------------------------------------ */

interface AppCard {
  name: string
  tagline: string
  url: string
  description: string
  features: string[]
  integration: string
  color: string
  badge: string
  status: 'Live' | 'Coming Soon' | 'Beta'
  productPage?: string
}

const coreApps: AppCard[] = [
  {
    name: 'Social0n',
    tagline: 'AI-Powered Social Media Automation',
    url: 'https://social0n.com',
    description:
      'Generate, schedule, and publish social media content across every platform with AI. Smart scheduling, brand voice training, and multi-platform analytics — all powered by 0nMCP under the hood.',
    features: [
      'AI content generation with Claude',
      'Multi-platform publishing (X, LinkedIn, Instagram, Facebook, TikTok)',
      'Smart scheduling with engagement optimization',
      'Brand voice AI training',
      'Content calendar with .0n workflow integration',
      'Analytics dashboard across all platforms',
    ],
    integration:
      'Social0n connects to the CRM social media endpoints through 0nMCP, giving users full programmatic control over their social presence. Every post, schedule, and analytics query flows through 0nMCP.',
    color: '#7ed957',
    badge: '0nCore',
    status: 'Live',
    productPage: '/products/social0n',
  },
  {
    name: 'App0n',
    tagline: 'Build AI-Native Applications',
    url: 'https://app.0nmcp.com',
    description:
      'Ship AI-powered apps faster. Pre-built templates with auth, payments, and 0nMCP orchestration out of the box. The no-code workspace for the entire 0n ecosystem.',
    features: [
      'Composer — drag-and-drop SWITCH file builder',
      'Skill Builder — visual workflow creation',
      'Credential Vault — encrypted API key storage',
      'Production-ready Next.js templates',
      'AI components (chat, generators, form builders)',
      'One-click Vercel deploy',
    ],
    integration:
      'App0n is the UI layer for 0nMCP. Everything you build generates .0n files that work with the CLI, the marketplace, and any AI platform. 48 services, zero boilerplate.',
    color: '#3b82f6',
    badge: '0nCore',
    status: 'Live',
    productPage: '/products/app0n',
  },
  {
    name: 'Web0n',
    tagline: 'AI-First Website Builder',
    url: 'https://0nmcp.com/products/web0n',
    description:
      'Describe your website, deploy it live. AI generates pages, components, and content — all backed by 0nMCP services for forms, analytics, CRM sync, and more.',
    features: [
      'AI page generation from natural language',
      'Built-in CRM form integration',
      'SEO optimization powered by AI',
      'Template marketplace',
      'Automatic Vercel deployment',
    ],
    integration:
      'Web0n sites connect to 0nMCP for form submissions, analytics, CRM contact sync, and automated follow-up workflows. Every lead captured flows into your 0nMCP pipeline.',
    color: '#a855f7',
    badge: '0nCore',
    status: 'Coming Soon',
    productPage: '/products/web0n',
  },
  {
    name: '0n Marketplace',
    tagline: 'Pay-per-execution automation store',
    url: 'https://marketplace.rocketclients.com',
    description:
      'Browse, purchase, and execute pre-built .0n workflow automations without writing code. Every execution is metered at $0.10/run through Stripe.',
    features: [
      'Browse and purchase .0n workflow files',
      'Pay-per-execution pricing ($0.10/run)',
      'AI-powered workflow generation with Claude',
      'Usage dashboard with execution history',
      'Export any workflow to run locally',
    ],
    integration:
      'Built entirely on 0nMCP. Every workflow in the marketplace is a .0n file that uses 0nMCP services. Export any workflow and run it with your own installation.',
    color: '#7ed957',
    badge: '0nCore',
    status: 'Live',
  },
]

/* ------------------------------------------------------------------ */
/*  Partner Apps — recommended integrations                            */
/* ------------------------------------------------------------------ */

const partnerApps: AppCard[] = [
  {
    name: 'Rocket+',
    tagline: 'The CRM Power Suite',
    url: 'https://rocketadd.com',
    description:
      'A suite of 50+ modular CRM enhancements — AI course generation, RocketFlow automation, client portals, appointment scheduling, and more. The most comprehensive CRM enhancement platform available.',
    features: [
      '50+ modular CRM tools (Mods)',
      'RocketFlow — visual automation builder',
      'AI Course Generator — create and import courses',
      'Focus Flow — productivity workflows',
      'Client portal management',
      'API Connections hub',
    ],
    integration:
      '0nMCP includes 245 CRM tools across 12 modules. Rocket+ users can orchestrate contacts, calendars, opportunities, invoices, conversations, and more — all through 0nMCP. Connect your Rocket+ API key and instantly unlock every CRM endpoint.',
    color: '#ff6b35',
    badge: 'Recommended',
    status: 'Live',
  },
  {
    name: 'RocketCRM',
    tagline: 'All-Access CRM Capability Hub',
    url: 'https://rocketclients.com',
    description:
      'The gateway to the full CRM experience. RocketCRM at rocketclients.com gives you all-access capability — contacts, pipelines, workflows, invoicing, calendars, social posting, and 245 API endpoints ready for 0nMCP.',
    features: [
      'Full CRM access — contacts, deals, pipelines',
      'Workflow automation engine',
      'Email & SMS marketing',
      'Calendar & appointment booking',
      'Invoice & payment processing',
      'White-label ready',
    ],
    integration:
      'RocketCRM is the recommended CRM for 0nMCP users. Sign up at rocketclients.com, generate your API key, and 0nMCP instantly connects to 245 endpoints across contacts, conversations, calendars, opportunities, invoices, payments, products, social media, and more.',
    color: '#00d4ff',
    badge: 'Recommended',
    status: 'Live',
  },
  {
    name: 'CRO9',
    tagline: 'Conversion Rate Optimization Toolkit',
    url: 'https://cro9.io',
    description:
      'Data-driven conversion optimization. Heatmaps, A/B testing, funnel analysis, and AI-powered recommendations to maximize every visitor interaction on your site.',
    features: [
      'Heatmaps & session recordings',
      'A/B testing engine',
      'Funnel analysis & drop-off detection',
      'AI optimization recommendations',
      'Real-time analytics dashboard',
      'Integration with CRM contacts',
    ],
    integration:
      'CRO9 data flows into 0nMCP workflows. Tag high-intent visitors as CRM contacts, trigger follow-up sequences when conversion events fire, and feed optimization insights into your AI automation pipeline.',
    color: '#f43f5e',
    badge: 'Partner',
    status: 'Live',
  },
  {
    name: 'SXO Website',
    tagline: 'Search Experience Optimization',
    url: 'https://sxowebsite.com',
    description:
      'Professional website and SEO services built on the SXO (Search Experience Optimization) methodology. Combines technical SEO, UX design, and conversion optimization into a unified approach.',
    features: [
      'Technical SEO audit & implementation',
      'Search experience optimization',
      'Core Web Vitals optimization',
      'Content strategy & execution',
      'Local SEO & Google Business Profile',
      'Ongoing performance monitoring',
    ],
    integration:
      'SXO insights connect to 0nMCP for automated reporting, CRM contact enrichment with SEO data, and AI-powered content generation based on search intent analysis.',
    color: '#eab308',
    badge: 'Partner',
    status: 'Live',
  },
  {
    name: 'MCPFED',
    tagline: 'Federation of Agents Platform',
    url: 'https://mcpfed.com',
    description:
      'The AI Automation Marketplace with the Opp Factory — build complete business operations from natural language. Uses the same three-level execution hierarchy as 0nMCP: Pipeline, Assembly Line, and Radial Burst.',
    features: [
      'Opp Factory — AI-generated business operations',
      'FOPs Library — Federated Operating Procedures',
      'Three-level execution hierarchy',
      'Template marketplace for pre-built operations',
      'Export operations as .0n workflow files',
    ],
    integration:
      'MCPFED operations can be exported as .0n workflow files, making them portable across any 0nMCP-powered setup. The same execution model powers both platforms.',
    color: '#ff6b35',
    badge: 'Partner',
    status: 'Live',
  },
  {
    name: 'ListKit',
    tagline: 'B2B Lead Generation & Sales Intelligence',
    url: 'https://listkit.io',
    description:
      'Access 731M+ B2B contacts with triple-verified emails, AI company search, and buyer intent data. ListKit handles lead generation — 0nMCP handles everything after. Export leads via CSV or Zapier webhook, and 0nMCP automatically scores, enriches, and routes them into your CRM pipeline with zero manual work.',
    features: [
      '731M+ verified B2B contact database',
      'Triple-verified email addresses',
      'AI-powered company search & filtering',
      'Buyer intent signal data',
      'CSV export & Zapier webhook triggers',
      'Credit-based pricing from Free to Enterprise',
    ],
    integration:
      'ListKit leads flow directly into 0nMCP via .0n SWITCH files. The listkit-lead-pipeline workflow scores each lead, classifies company size, creates CRM contacts with tags, and places them in your pipeline — all auto-enriched from your connection file. No code, no database tables, no manual import.',
    color: '#6366f1',
    badge: 'Partner',
    status: 'Live',
  },
]

/* ------------------------------------------------------------------ */
/*  Featured Business Partners                                         */
/* ------------------------------------------------------------------ */

interface FeaturedBusiness {
  slug: string
  name: string
  tagline: string
  description: string
  website: string
  location: string
  industry: string
  services: string[]
  integrations: string[]
  stats: { label: string; value: string }[]
  testimonial?: { quote: string; author: string; role: string }
  logo: string
  gradient: string
  accent: string
}

const featuredBusinesses: FeaturedBusiness[] = [
  {
    slug: 'the-spa-in-ligonier',
    name: 'The Spa In Ligonier',
    tagline: 'Premier Spa Experience in the Laurel Highlands',
    description:
      'The Spa In Ligonier has served the Laurel Highlands community since 2021, building a loyal clientele with a 95% repeat visit rate. By integrating 0nMCP\'s orchestration platform, the spa automated appointment follow-ups, social media posting, lead capture workflows, and seasonal campaign management — freeing owner Rachel Knapic to focus on delivering world-class experiences instead of juggling marketing tools. With 5,076 contacts managed through 20 automated workflows, the spa runs its entire digital operation on 0nMCP-powered orchestration.',
    website: 'https://spaligonier.com',
    location: 'Ligonier, PA',
    industry: 'Health & Wellness',
    services: [
      'Clinical Facials',
      'Massage Therapy',
      'Japanese Head Spa',
      'Body Treatments',
      'Waxing Services',
      'Gift Cards',
    ],
    integrations: ['CRM', 'Rocket+', 'MassageBook', 'Google Business', 'Facebook', 'Square', 'Sanity CMS'],
    stats: [
      { label: 'Repeat Rate', value: '95%' },
      { label: 'Contacts', value: '5,076' },
      { label: 'Workflows', value: '20' },
      { label: 'Since', value: '2021' },
    ],
    testimonial: {
      quote:
        'I used to spend hours every week on marketing and follow-ups. Now 0nMCP handles my campaigns, appointment reminders, and social posts automatically. I just focus on my clients.',
      author: 'Rachel Knapic',
      role: 'Owner, The Spa In Ligonier',
    },
    logo: 'https://firebasestorage.googleapis.com/v0/b/highlevel-backend.appspot.com/o/locationPhotos%2FF76MNKOMQCMruMrumtdf.png?alt=media&token=7cadaad8-b069-4cde-b426-39aa986579cf',
    gradient: 'linear-gradient(135deg, #1a2c27 0%, #2c4b43 50%, #1a2c27 100%)',
    accent: '#c56a57',
  },
]

/* ------------------------------------------------------------------ */
/*  Stats bar                                                          */
/* ------------------------------------------------------------------ */

const stats = [
  { label: '0nCore Apps', value: '4' },
  { label: 'Partner Integrations', value: '6' },
  { label: 'Rocket+ Mods', value: '13' },
  { label: 'Featured Businesses', value: String(featuredBusinesses.length) },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PartnersPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Partners', item: 'https://0nmcp.com/partners' },
    ],
  }

  const localBusinessJsonLd = featuredBusinesses.map((biz) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: biz.name,
    description: biz.description,
    url: biz.website,
    image: biz.logo,
    address: {
      '@type': 'PostalAddress',
      addressLocality: biz.location.split(',')[0]?.trim(),
      addressRegion: biz.location.split(',')[1]?.trim(),
      addressCountry: 'US',
    },
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
    },
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {localBusinessJsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      {/* Hero */}
      <section className="pt-40 pb-16 px-8 text-center relative">
        <div
          className="absolute w-[500px] h-[500px] top-[5%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }}
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 relative z-[2]">
          The 0n{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            }}
          >
            Ecosystem
          </span>
        </h1>
        <p
          className="text-lg max-w-[640px] mx-auto leading-relaxed relative z-[2] mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          0nMCP is the engine. These are the apps that run on it.
          One standard, many applications — every product speaks .0n.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 md:gap-12 flex-wrap relative z-[2]">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                {s.value}
              </div>
              <div
                className="text-[0.65rem] font-mono uppercase tracking-widest mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 0nCore Apps Section */}
      <section className="py-12 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">0nCore Apps</h2>
            <span
              className="text-[0.55rem] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
              style={{
                background: 'rgba(126, 217, 87, 0.1)',
                color: '#7ed957',
                border: '1px solid rgba(126, 217, 87, 0.2)',
              }}
            >
              First Party
            </span>
          </div>
          <p
            className="text-sm mb-8 max-w-[600px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Applications built exclusively on 0nMCP. These use the .0n standard natively
            and are designed to work together as a unified platform.
          </p>

          <div className="space-y-6">
            {coreApps.map((app) => (
              <AppCardComponent key={app.name} app={app} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1000px] mx-auto px-8">
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }}
        />
      </div>

      {/* Partner Apps Section */}
      <section className="py-12 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Partners & Integrations</h2>
            <span
              className="text-[0.55rem] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                color: '#00d4ff',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}
            >
              Recommended
            </span>
          </div>
          <p
            className="text-sm mb-8 max-w-[600px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Third-party apps and services we recommend. Each connects to 0nMCP, giving you
            seamless automation across your entire stack.
          </p>

          <div className="space-y-6">
            {partnerApps.map((app) => (
              <AppCardComponent key={app.name} app={app} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Business Partners */}
      <section className="py-16 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Featured Business Partners</h2>
            <span
              className="text-[0.55rem] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
              style={{
                background: 'rgba(197, 106, 87, 0.1)',
                color: '#c56a57',
                border: '1px solid rgba(197, 106, 87, 0.2)',
              }}
            >
              Showcase
            </span>
          </div>
          <p
            className="text-sm mb-10 max-w-[600px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Real businesses using 0nMCP to automate operations, grow revenue, and deliver
            exceptional customer experiences.
          </p>

          {featuredBusinesses.map((biz) => (
            <div
              key={biz.slug}
              className="rounded-2xl overflow-hidden mb-8"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Banner */}
              <div
                className="relative px-8 md:px-12 py-10 md:py-14"
                style={{ background: biz.gradient }}
              >
                <div
                  className="absolute top-5 right-6 text-[0.55rem] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(126, 217, 87, 0.15)',
                    color: '#7ed957',
                    border: '1px solid rgba(126, 217, 87, 0.25)',
                  }}
                >
                  Featured Partner
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0"
                    style={{
                      border: `2px solid ${biz.accent}50`,
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <img src={biz.logo} alt={biz.name} className="w-full h-full object-contain p-2" />
                  </div>
                  <div>
                    <div
                      className="font-mono text-[0.6rem] uppercase tracking-[0.2em] mb-1"
                      style={{ color: biz.accent }}
                    >
                      {biz.industry} &bull; {biz.location}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{biz.name}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {biz.tagline}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {biz.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl px-4 py-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div
                        className="text-xl md:text-2xl font-bold font-mono"
                        style={{ color: biz.accent }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="text-[0.55rem] font-mono uppercase tracking-wider mt-1"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="px-8 md:px-12 py-8 space-y-8" style={{ background: 'var(--bg-card)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {biz.description}
                </p>

                {/* Services + Integrations */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <span
                      className="font-mono text-[0.6rem] uppercase tracking-[0.15em] block mb-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Services Offered
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {biz.services.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-3 py-1.5 rounded-full"
                          style={{
                            background: `${biz.accent}15`,
                            color: biz.accent,
                            border: `1px solid ${biz.accent}30`,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span
                      className="font-mono text-[0.6rem] uppercase tracking-[0.15em] block mb-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      0nMCP Integrations
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {biz.integrations.map((i) => (
                        <span
                          key={i}
                          className="text-xs font-mono px-3 py-1.5 rounded-full"
                          style={{
                            background: 'rgba(126,217,87,0.08)',
                            color: '#7ed957',
                            border: '1px solid rgba(126,217,87,0.2)',
                          }}
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                {biz.testimonial && (
                  <blockquote
                    className="rounded-xl p-6 md:p-8"
                    style={{
                      background: `${biz.accent}08`,
                      borderLeft: `3px solid ${biz.accent}`,
                    }}
                  >
                    <p
                      className="text-base italic mb-3"
                      style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}
                    >
                      &ldquo;{biz.testimonial.quote}&rdquo;
                    </p>
                    <cite className="not-italic">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {biz.testimonial.author}
                      </span>
                      <span className="text-xs block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {biz.testimonial.role}
                      </span>
                    </cite>
                  </blockquote>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={biz.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm no-underline"
                    style={{ background: biz.accent, color: '#fff' }}
                  >
                    Visit {biz.name} &rarr;
                  </a>
                  <Link
                    href="/turn-it-on"
                    className="btn-accent no-underline text-sm"
                  >
                    Get Started with 0nMCP
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Become a Featured Business CTA */}
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(197,106,87,0.06), rgba(126,217,87,0.04))',
              border: '1px solid rgba(197,106,87,0.12)',
            }}
          >
            <h3 className="text-lg font-bold mb-2">Want to be featured?</h3>
            <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Using 0nMCP to power your business? Get a dedicated showcase on our partners page
              and show the world what AI orchestration makes possible.
            </p>
            <Link href="/community" className="btn-ghost no-underline text-sm">
              Apply to Be Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1000px] mx-auto px-8">
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }}
        />
      </div>

      {/* CRM Connection CTA */}
      <section className="py-16 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div
            className="rounded-2xl p-10 md:p-12 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(255,107,53,0.08))',
              border: '1px solid rgba(0,212,255,0.15)',
            }}
          >
            <div className="relative z-[2]">
              <div
                className="font-mono text-[0.6rem] uppercase tracking-[0.2em] mb-3"
                style={{ color: '#00d4ff' }}
              >
                The Recommended CRM
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Get started with RocketCRM
              </h3>
              <p
                className="text-sm leading-relaxed mb-6 max-w-lg"
                style={{ color: 'var(--text-secondary)' }}
              >
                RocketCRM gives you all-access CRM capability — 245 API endpoints ready for 0nMCP
                automation. Contacts, pipelines, calendars, invoicing, email, SMS, social media,
                and more. Sign up, grab your API key, and you&apos;re connected.
              </p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="https://rocketclients.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent no-underline"
                >
                  Get RocketCRM
                </a>
                <a
                  href="https://rocketadd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost no-underline"
                >
                  Explore Rocket+ Mods
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build on 0n CTA */}
      <section className="py-16 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div
            className="rounded-2xl p-10 md:p-12 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(126,217,87,0.05), rgba(153,69,255,0.05))',
              border: '1px solid rgba(126,217,87,0.1)',
            }}
          >
            <h3 className="text-xl font-bold mb-3">
              Build on the 0n Standard
            </h3>
            <p
              className="text-base mb-6 max-w-lg mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Want to build an 0nCore app or become a partner? The .0n standard is open.
              One SWITCH file powers them all.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/0n-standard" className="btn-accent no-underline">
                Learn the .0n Standard
              </Link>
              <a
                href="https://github.com/0nork/0nMCP"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost no-underline"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  App Card Component                                                 */
/* ------------------------------------------------------------------ */

function AppCardComponent({ app }: { app: AppCard }) {
  return (
    <div
      className="glow-box relative"
      style={{ borderColor: app.color + '30' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-2xl font-bold">{app.name}</h3>
            <span
              className="text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: app.color + '18',
                color: app.color,
                border: `1px solid ${app.color}30`,
              }}
            >
              {app.badge}
            </span>
            {app.status !== 'Live' && (
              <span
                className="text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {app.status}
              </span>
            )}
          </div>
          <p className="font-mono text-sm" style={{ color: app.color }}>
            {app.tagline}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {app.productPage && (
            <Link
              href={app.productPage}
              className="btn-ghost no-underline text-sm"
            >
              Details
            </Link>
          )}
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost no-underline text-sm"
          >
            Visit &rarr;
          </a>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        {app.description}
      </p>

      {/* Features + Integration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.15em] block mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Key Features
          </span>
          <ul className="space-y-1.5">
            {app.features.map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: app.color }}
                />
                {feat}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.15em] block mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            0nMCP Integration
          </span>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {app.integration}
          </p>
        </div>
      </div>
    </div>
  )
}
