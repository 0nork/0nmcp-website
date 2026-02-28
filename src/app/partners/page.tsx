import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partners & Apps — 0nMCP Ecosystem',
  description:
    'Explore the 0nMCP ecosystem. 0nCore apps built exclusively on 0nMCP, plus partner integrations from Rocket+, CRO9, SXO, and more.',
  openGraph: {
    title: 'Partners & Apps — 0nMCP Ecosystem',
    description:
      'The full 0nMCP ecosystem — 0nCore apps, partner integrations, and the RocketCRM connection.',
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
    color: '#00ff88',
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
    color: '#00ff88',
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
]

/* ------------------------------------------------------------------ */
/*  Stats bar                                                          */
/* ------------------------------------------------------------------ */

const stats = [
  { label: '0nCore Apps', value: '4' },
  { label: 'Partner Integrations', value: '5' },
  { label: 'CRM Endpoints', value: '245' },
  { label: 'Connected Services', value: '26' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PartnersPage() {
  return (
    <>
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
                background: 'rgba(0, 255, 136, 0.1)',
                color: '#00ff88',
                border: '1px solid rgba(0, 255, 136, 0.2)',
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
                'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(153,69,255,0.05))',
              border: '1px solid rgba(0,255,136,0.1)',
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
