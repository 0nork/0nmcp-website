import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import LogoBanner from '@/components/LogoBanner'
import DemoPreview from '@/components/DemoPreview'
import { getCategoryIcon } from '@/components/CategoryIcons'
import { STATS, STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: `0nMCP — Universal AI API Orchestrator | ${STATS_DISPLAY.tools} Tools, ${STATS_DISPLAY.services} Services`,
  description:
    `0nMCP is the universal AI API orchestrator. ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services, ${STATS_DISPLAY.capabilities} capabilities, one install. Stop building workflows. Start describing outcomes. Three-Level Execution: Pipeline, Assembly Line, Radial Burst.`,
  keywords: [
    '0nMCP',
    'MCP',
    'Model Context Protocol',
    'AI orchestration',
    'API orchestrator',
    'AI tools',
    'workflow automation',
    '0n Standard',
    'MCP server',
    'AI API',
    'AI workflow builder',
    'multi-service orchestration',
    'Stripe automation',
    'Slack integration',
    'CRM automation',
  ],
  openGraph: {
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      `${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services. ${STATS_DISPLAY.capabilities} capabilities. One install. Stop building workflows. Start describing outcomes.`,
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      `${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services. ${STATS_DISPLAY.capabilities} capabilities. One install. The universal AI API orchestrator.`,
  },
  alternates: { canonical: 'https://www.0nmcp.com' },
}

const categories = [
  { name: 'Everyday Tools', count: 8 },
  { name: 'Communication', count: 9 },
  { name: 'Email Marketing', count: 6 },
  { name: 'Payments', count: 8 },
  { name: 'CRM & Sales', count: 6 },
  { name: 'Project Mgmt', count: 8 },
  { name: 'Docs & Storage', count: 4 },
  { name: 'Support', count: 3 },
  { name: 'Websites', count: 3 },
  { name: 'Advertising', count: 6 },
  { name: 'AI', count: 2 },
  { name: 'Developer', count: 5 },
  { name: 'Social Media', count: 5 },
  { name: 'Accounting', count: 2 },
  { name: 'Finance', count: 2 },
  { name: 'Cloud', count: 1 },
  { name: 'Integration', count: 2 },
  { name: 'Automation', count: 1 },
  { name: 'Outreach', count: 1 },
  { name: 'Cold Email', count: 1 },
  { name: 'Messaging', count: 1 },
]

const faqItems = [
  {
    q: 'What is MCP orchestration?',
    a: 'MCP orchestration is the process of combining multiple Model Context Protocol servers into unified, automated workflows. Instead of connecting AI assistants to individual MCP servers one at a time, an orchestrator like 0nMCP federates them under a single gateway -- enabling chained, parallel, and conditional execution across services like CRM, email, calendar, and databases through a single trigger.',
  },
  {
    q: 'How do I combine multiple MCP servers?',
    a: `Install 0nMCP with 'npm i 0nmcp' and use the built-in orchestrator to federate multiple MCP servers. 0nMCP supports ${STATS_DISPLAY.services} services out of the box and provides ${STATS_DISPLAY.capabilities} capabilities that can be chained together in Pipeline (sequential), Assembly Line (decision), and Radial Burst (parallel) execution patterns.`,
  },
  {
    q: 'Can MCP servers work together automatically?',
    a: "Yes. 0nMCP's patented federation architecture enables MCP servers to work together through automated workflows. A single webhook, API call, or manual trigger can initiate multi-phase operations across CRM, email, calendar, database, and other MCP servers simultaneously.",
  },
  {
    q: 'What is the .0n Standard?',
    a: 'The .0n Standard is a universal configuration format for MCP servers -- like docker-compose.yml but for AI tools. It standardizes how MCP servers are configured across different clients including Claude Desktop, Cursor, VS Code, Windsurf, and Gemini CLI, solving the incompatible configuration problem.',
  },
  {
    q: 'How is 0nMCP different from other MCP tools?',
    a: '0nMCP is the only MCP platform with a patented three-level execution hierarchy (Pipeline, Assembly Line, Radial Burst), a universal configuration standard (.0n), and a federation gateway that unifies all MCP servers under one endpoint. Other tools connect to servers individually -- 0nMCP orchestrates them as a system.',
  },
  {
    q: 'What services does 0nMCP support?',
    a: `0nMCP supports ${STATS_DISPLAY.services} services across ${STATS_DISPLAY.categories} categories including Stripe, Slack, Discord, GitHub, OpenAI, Anthropic, Gmail, Google Sheets, Google Drive, Airtable, Notion, MongoDB, Supabase, Zendesk, Jira, HubSpot, Mailchimp, Twilio, SendGrid, Shopify, QuickBooks, Asana, Intercom, Dropbox, WhatsApp, Instagram, X (Twitter), TikTok, Google Ads, Facebook Ads, Plaid, Square, LinkedIn, Pipedrive, Azure, Cloudflare, GoDaddy, Resend, and more.`,
  },
  {
    q: 'Is 0nMCP free?',
    a: `0nMCP is free and open source under the MIT license. All ${STATS_DISPLAY.tools} tools, ${STATS_DISPLAY.services} services, and ${STATS_DISPLAY.capabilities} capabilities are available for unlimited local use via the CLI with no credit card required. The 0nMCP Console offers a free tier with 25 executions per month, a Pro plan at $19/month for unlimited executions and the visual workflow builder, and a Team plan at $49/month with 5 seats and shared workflows.`,
  },
]

export default function HomePage() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RocketOpp, LLC',
    url: 'https://www.0nmcp.com',
    logo: 'https://www.0nmcp.com/icon.svg',
    sameAs: [
      'https://github.com/0nork/0nMCP',
      'https://npmjs.com/package/0nmcp',
      'https://discord.gg/0nork',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'mike@rocketopp.com',
      contactType: 'technical support',
    },
  }

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '0nMCP',
    url: 'https://www.0nmcp.com',
    description: `Universal AI API Orchestrator — ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.0nmcp.com/forum?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '0nMCP',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    description:
      `Universal AI API orchestrator with ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services and ${STATS_DISPLAY.capabilities} capabilities. Three-Level Execution: Pipeline, Assembly Line, Radial Burst.`,
    url: 'https://www.0nmcp.com',
    downloadUrl: 'https://www.npmjs.com/package/0nmcp',
    softwareVersion: '2.4.0',
    author: {
      '@type': 'Organization',
      name: 'RocketOpp, LLC',
      url: 'https://rocketopp.com',
    },
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Free (CLI)',
        description: `All ${STATS_DISPLAY.tools} tools, ${STATS_DISPLAY.services} services, unlimited local use, MIT licensed`,
      },
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Console Free',
        description: 'Console access, 25 executions per month, 1 saved workflow',
      },
      {
        '@type': 'Offer',
        price: '19',
        priceCurrency: 'USD',
        name: 'Console Pro',
        description: 'Unlimited executions, visual workflow builder, marketplace access, vault sync',
      },
      {
        '@type': 'Offer',
        price: '49',
        priceCurrency: 'USD',
        name: 'Console Team',
        description: '5 seats, shared workflows, team vault, API access, priority support',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '48',
      bestRating: '5',
    },
  }

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Install and Use 0nMCP',
    description: 'Get started with 0nMCP in three steps: install, connect your services, and describe what you need.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Install 0nMCP',
        text: 'Run npm i 0nmcp to install the universal AI API orchestrator. Works with any AI client that supports MCP.',
        url: 'https://www.0nmcp.com/#quickstart',
      },
      {
        '@type': 'HowToStep',
        name: 'Connect Your Services',
        text: 'Run 0nmcp engine import to add your API keys. 0nMCP encrypts and stores them securely in your local ~/.0n/ vault.',
        url: 'https://www.0nmcp.com/#quickstart',
      },
      {
        '@type': 'HowToStep',
        name: 'Describe What You Need',
        text: `Tell your AI what you want done. 0nMCP routes, orchestrates, and executes across all ${STATS_DISPLAY.services} services automatically.`,
        url: 'https://www.0nmcp.com/#quickstart',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      {/* ── HERO ── */}
      <HeroSection />

      {/* ── LOGO BANNER ── */}
      <LogoBanner />

      {/* ══════════════════════════════════════════
          PROBLEM & SOLUTION — Recessed (set back)
          ══════════════════════════════════════════ */}
      <section className="section-recessed py-24 px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">The Problem &amp; Solution</span>
          <h2 className="section-heading">
            Too Many APIs. Too Many Connectors.
            <br />
            <span style={{ color: 'var(--text-muted)' }}>Until now.</span>
          </h2>
          <p className="section-desc mb-12">
            Every AI assistant connects to services individually. No chaining.
            No automation. No orchestration. 0nMCP changes that &mdash; one
            orchestrator that federates {STATS_DISPLAY.services} services into a single, automated
            system. {STATS_DISPLAY.services} services. One orchestrator.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {[
              { before: 'Connect to each API separately', after: 'Describe what you want, 0nMCP handles the rest' },
              { before: 'Manually coordinate multi-step processes', after: 'Chain tools into automated multi-phase workflows' },
              { before: 'No workflow persistence or state tracking', after: 'Full execution logging, state, and audit trail' },
              { before: 'Different config format per client', after: 'Universal .0n config — write once, run everywhere' },
              { before: 'No parallel execution across services', after: 'Radial Burst parallel execution across services' },
              { before: 'Credentials in plain text .env files', after: 'AES-256 encrypted Vault with hardware fingerprinting' },
              { before: 'No way to transfer business digital assets', after: 'Digital Deed Transfer with chain of custody tracking' },
              { before: 'Workflows stuck on one machine', after: 'Export, share, and sell portable workflow packages' },
            ].map((row) => (
              <div key={row.before} className="float-card">
                <div className="flex items-start gap-3 mb-2.5">
                  <span style={{ color: '#ff6b35' }} className="flex-shrink-0 text-sm mt-0.5">&#10005;</span>
                  <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>{row.before}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span style={{ color: 'var(--accent)' }} className="flex-shrink-0 text-sm mt-0.5">&#10003;</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.after}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Trust */}
          <div className="pt-12" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="section-accent-line" />
            <span className="section-label">Security &amp; Trust</span>
            <h3 className="section-heading" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              Enterprise-grade security. Zero compromise.
            </h3>
            <p className="section-desc mb-10">
              Your API keys never leave your machine unencrypted. Every workflow
              file is cryptographically signed. Full audit trail on every
              execution.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'AES-256 Encrypted Vault', desc: 'Client-side encryption with PBKDF2-SHA512. Your API keys are encrypted before they ever touch disk. Hardware-bound fingerprinting.', color: '#7ed957' },
                { title: '0nVault Container System', desc: '7 semantic layers with independent encryption. Multi-party escrow via X25519 ECDH. Patent-pending binary .0nv format.', color: '#00d4ff' },
                { title: 'Digital Deed Transfer', desc: 'Package entire business digital assets into a single encrypted container. Chain of custody tracking with Seal of Truth verification.', color: '#a78bfa' },
                { title: 'Patent-Pending Architecture', desc: 'Three-Level Execution + Vault Container System. Two US provisional patents protecting the core technology.', color: '#ff6b35' },
                { title: 'Seal of Truth Verification', desc: 'SHA3-256 content-addressed integrity. Ed25519 digital signatures. Transfer registry with replay prevention.', color: '#00d4ff' },
                { title: 'Free & Open Source', desc: `MIT licensed. All ${STATS_DISPLAY.tools} tools, ${STATS_DISPLAY.services} services, unlimited local use. No credit card. No trial period. Fully auditable.`, color: '#7ed957' },
              ].map((item) => (
                <div key={item.title} className="float-card">
                  <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: item.color }} />
                  <h4 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LIVE DEMO — Elevated (forward)
          ══════════════════════════════════════════ */}
      <section className="section-elevated py-24 px-8" id="demo">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="section-accent-line mx-auto" />
            <span className="section-label">See It In Action</span>
            <h2 className="section-heading">
              Describe. Orchestrate. Done.
            </h2>
            <p className="section-desc mx-auto">
              Watch 0nMCP execute a real multi-service workflow in under a second.
              One natural language command triggers Stripe, SendGrid, and CRM
              simultaneously.
            </p>
          </div>

          <DemoPreview />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          THREE-LEVEL ARCHITECTURE — Recessed
          ══════════════════════════════════════════ */}
      <section className="section-recessed py-24 px-8" id="how-it-works">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="section-accent-line mx-auto" />
            <span className="section-label">Patented Architecture</span>
            <h2 className="section-heading">
              Three-Level Execution Hierarchy
            </h2>
            <p className="section-desc mx-auto">
              The only AI API orchestrator with a patented Pipeline &rarr;
              Assembly Line &rarr; Radial Burst execution model. Sequential
              phases. Decision points. Parallel actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                level: 'Level 1',
                name: 'Pipeline',
                desc: 'Sequential phases that represent major milestones. Each phase completes before the next begins. Think: intake, process, deliver.',
                color: 'var(--accent)',
                symbol: '\u2192',
              },
              {
                level: 'Level 2',
                name: 'Assembly Line',
                desc: 'Decision moments within each phase. Sequential checkpoints that evaluate conditions, route data, and determine what happens next.',
                color: 'var(--accent-secondary)',
                symbol: '\u25C7',
              },
              {
                level: 'Level 3',
                name: 'Radial Burst',
                desc: 'Parallel fan-out across multiple services simultaneously. Fire and forget, or wait for all results. Maximum throughput, minimum latency.',
                color: '#ff6b35',
                symbol: '\u229B',
              },
            ].map((arch) => (
              <div key={arch.name} className="float-card float-card-lg" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: arch.color,
                    opacity: 0.6,
                  }}
                />
                <span
                  className="font-mono text-[0.65rem] uppercase tracking-[0.15em] block mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {arch.level}
                </span>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl" style={{ color: arch.color }}>{arch.symbol}</span>
                  <h3 className="text-xl font-bold">{arch.name}</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{arch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES GRID — Elevated
          ══════════════════════════════════════════ */}
      <section className="section-elevated py-24 px-8" id="services">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <div className="section-accent-line mx-auto" />
            <span className="section-label">{STATS_DISPLAY.services} Services</span>
            <h2 className="section-heading">
              {STATS_DISPLAY.categories} Categories. Every Tool You Need.
            </h2>
            <p className="section-desc mx-auto">
              From CRM and payments to email marketing and AI &mdash; 0nMCP
              connects your entire stack under one orchestrator.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name)
              return (
                <Link key={cat.name} href="/turn-it-on" className="float-card float-card-accent no-underline" style={{ padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="block mb-2" style={{ color: 'var(--accent)' }}><Icon size={28} /></span>
                  <span className="font-mono text-xl font-bold block mb-1" style={{ color: 'var(--accent)' }}>{cat.count}</span>
                  <span className="text-xs font-medium block" style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUICK START — Recessed
          ══════════════════════════════════════════ */}
      <section className="section-recessed py-24 px-8" id="quickstart">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <div className="section-accent-line mx-auto" />
            <span className="section-label">Quick Start</span>
            <h2 className="section-heading">
              Three Steps. That&apos;s It.
            </h2>
            <p className="section-desc mx-auto">
              Install in seconds, connect your services, and describe what you
              need. 0nMCP handles the orchestration automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Install', desc: 'One command. No complex setup. Works with any AI client that supports MCP.', code: 'npm i 0nmcp' },
              { step: '02', title: 'Connect', desc: 'Add your API keys. 0nMCP encrypts and stores them securely in your local ~/.0n/ vault.', code: '0nmcp engine import' },
              { step: '03', title: 'Describe', desc: 'Tell your AI what you want done. 0nMCP routes, orchestrates, and executes across all services.', code: '"Send an invoice and notify the team"' },
            ].map((s) => (
              <div key={s.step} className="float-card float-card-lg">
                <div
                  className="font-mono text-[3rem] font-bold leading-none mb-4"
                  style={{ color: 'var(--accent)', opacity: 0.15 }}
                >
                  {s.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                <code
                  className="font-mono text-xs px-3 py-1.5 rounded inline-block"
                  style={{
                    backgroundColor: 'rgba(126,217,87,0.08)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(126,217,87,0.15)',
                  }}
                >
                  {s.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA — INSTALL ON CLAUDE
          ══════════════════════════════════════════ */}
      <section
        className="py-24 px-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(126,217,87,0.03) 0%, var(--bg-primary) 30%, var(--bg-primary) 70%, rgba(126,217,87,0.03) 100%)',
          borderTop: '1px solid rgba(126,217,87,0.1)',
          borderBottom: '1px solid rgba(126,217,87,0.1)',
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(126,217,87,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
        <div className="max-w-[900px] mx-auto text-center relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/brand/icons/0nmcp.svg"
              alt="0nMCP"
              width={48}
              height={48}
            />
            <span
              style={{
                fontSize: '1.5rem',
                color: 'var(--text-muted)',
                fontWeight: 300,
              }}
            >
              +
            </span>
            <div
              className="flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4a574, #c4956a)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
          </div>
          <span
            className="inline-block px-4 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(126,217,87,0.08)',
              border: '1px solid rgba(126,217,87,0.15)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#7ed957',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Huge Step &mdash; Install in 60 Seconds
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Add{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}
            >
              {STATS_DISPLAY.tools} AI Tools
            </span>
            <br />
            to Claude. Instantly.
          </h2>
          <p
            className="text-lg mb-4 max-w-[600px] mx-auto"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            One install transforms Claude into the ultimate AI command center.
            {STATS_DISPLAY.services} services, encrypted vault, workflow store, and self-training AI brain &mdash;
            across Desktop, Web, Mobile, and CLI.
          </p>
          <p
            className="text-sm mb-8 max-w-[500px] mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            No credit card. No trial. Free forever. This is the single biggest upgrade you can make to Claude.
          </p>

          {/* Install command + CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/install0n"
              className="no-underline inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                color: 'var(--bg-primary)',
                boxShadow: '0 0 30px rgba(126,217,87,0.25), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Install 0nMCP on Claude
            </Link>
            <code
              className="px-5 py-3.5 rounded-xl text-sm"
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'rgba(126,217,87,0.06)',
                border: '1px solid rgba(126,217,87,0.15)',
                color: '#7ed957',
              }}
            >
              npm i 0nmcp
            </code>
          </div>

          {/* Platform badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Claude Desktop', 'Claude Code', 'Claude Web', 'Claude Mobile'].map(platform => (
              <span
                key={platform}
                className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#7ed957' }}
                />
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING — Elevated
          ══════════════════════════════════════════ */}
      <section className="section-elevated py-24 px-8" id="pricing">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <div className="section-accent-line mx-auto" />
            <span className="section-label">Pricing</span>
            <h2 className="section-heading">
              Free CLI forever. Console plans for teams that scale.
            </h2>
            <p className="section-desc mx-auto">
              The full 0nMCP npm package is free and open source. The Console adds a visual interface, cloud execution, and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Free CLI */}
            <div className="float-card float-card-lg">
              <span className="font-mono text-xs uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Free CLI</span>
              <div className="text-4xl font-bold mb-1">
                <span className="text-lg align-super" style={{ color: 'var(--text-muted)' }}>$</span>0
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Open source, unlimited local use</p>
              <ul className="flex flex-col gap-2.5 list-none mb-6">
                {[`All ${STATS_DISPLAY.tools} tools`, `${STATS_DISPLAY.services} services`, `${STATS_DISPLAY.capabilities} capabilities`, 'MIT licensed', 'CLI + MCP interface', 'Community support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent)' }} className="font-bold text-xs">+</span>{f}
                  </li>
                ))}
              </ul>
              <a href="https://www.npmjs.com/package/0nmcp" target="_blank" rel="noopener noreferrer" className="btn-ghost w-full text-center justify-center no-underline">Install Free</a>
            </div>

            {/* Console Free */}
            <div className="float-card float-card-lg">
              <span className="font-mono text-xs uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Console Free</span>
              <div className="text-4xl font-bold mb-1">
                <span className="text-lg align-super" style={{ color: 'var(--text-muted)' }}>$</span>0
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Try the Console, no card required</p>
              <ul className="flex flex-col gap-2.5 list-none mb-6">
                {['Everything in Free CLI', 'Console web access', '25 executions / month', '1 saved workflow', 'Execution history', 'Email support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent)' }} className="font-bold text-xs">+</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/console" className="btn-ghost w-full text-center justify-center no-underline">Open Console</Link>
            </div>

            {/* Console Pro */}
            <div className="float-card float-card-lg float-card-featured relative">
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-mono text-[0.6rem] font-bold tracking-wider"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
              >
                MOST POPULAR
              </span>
              <span className="font-mono text-xs uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Console Pro</span>
              <div className="text-4xl font-bold mb-1">
                <span className="text-lg align-super" style={{ color: 'var(--text-muted)' }}>$</span>19
                <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Unlimited power for solo builders</p>
              <ul className="flex flex-col gap-2.5 list-none mb-6">
                {['Everything in Console Free', 'Unlimited executions', 'Visual workflow builder', 'Marketplace access', 'Vault sync across devices', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent)' }} className="font-bold text-xs">+</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/console" className="btn-accent w-full text-center justify-center no-underline">Start Pro</Link>
            </div>

            {/* Console Team */}
            <div className="float-card float-card-lg">
              <span className="font-mono text-xs uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Console Team</span>
              <div className="text-4xl font-bold mb-1">
                <span className="text-lg align-super" style={{ color: 'var(--text-muted)' }}>$</span>49
                <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Collaborate with your whole team</p>
              <ul className="flex flex-col gap-2.5 list-none mb-6">
                {['Everything in Console Pro', '5 team seats', 'Shared workflows', 'Team vault', 'API access', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#a78bfa' }} className="font-bold text-xs">+</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/console" className="btn-accent w-full text-center justify-center no-underline" style={{ background: 'linear-gradient(135deg, #a78bfa, var(--accent))' }}>Start Team</Link>
            </div>
          </div>

          {/* Enterprise callout */}
          <div className="float-card mt-8" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div>
                <span className="font-mono text-xs uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Enterprise</span>
                <span className="text-lg font-bold">Need SSO, SLA, or dedicated infra?</span>
              </div>
              <a href="mailto:mike@rocketopp.com?subject=0nMCP%20Enterprise%20Inquiry" className="btn-ghost no-underline whitespace-nowrap">Contact Us &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA — WEB0N.COM DEEP BLACK BREAK
          ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: '#000000',
          borderTop: '1px solid rgba(126,217,87,0.06)',
          borderBottom: '1px solid rgba(126,217,87,0.06)',
        }}
      >
        {/* Subtle ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '20%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(126,217,87,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            transform: 'translate(0, -50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        <div className="max-w-[1100px] mx-auto px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left — web0n branding + messaging */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/brand/icons/web0n.svg"
                  alt="web0n"
                  width={44}
                  height={44}
                  style={{ filter: 'drop-shadow(0 0 12px rgba(126,217,87,0.3))' }}
                />
                <img
                  src="/brand/web0n-logo.png"
                  alt="web0n"
                  height={28}
                  style={{ height: '28px', width: 'auto' }}
                />
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.15 }}
              >
                A Complete App.
                <br />
                <span style={{ color: '#7ed957' }}>Built Entirely with 0nMCP.</span>
              </h2>
              <p
                className="text-base mb-6"
                style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}
              >
                web0n.com is a fully functional business website application &mdash;
                generated end-to-end using nothing but the 0nMCP platform and its
                connected tools. No manual coding. No drag-and-drop builder. Just
                0nMCP orchestrating the entire stack.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['CRM Integration', 'Online Booking', 'Contact Forms', 'SEO Optimized', 'Mobile Responsive', 'AI-Powered'].map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(126,217,87,0.06)',
                      border: '1px solid rgba(126,217,87,0.12)',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <a
                  href="https://web0n.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
                  }}
                >
                  Visit web0n.com
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </a>
                <Link
                  href="/install0n"
                  className="no-underline inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'rgba(126,217,87,0.08)',
                    border: '1px solid rgba(126,217,87,0.2)',
                    color: '#7ed957',
                  }}
                >
                  Build Your Own with 0nMCP
                </Link>
              </div>
            </div>

            {/* Right — proof card */}
            <div
              className="rounded-2xl p-6 md:p-8 relative"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-6"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: '#7ed957',
                  letterSpacing: '0.12em',
                }}
              >
                Built With 0nMCP
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Website Generation', tool: 'Site Builder + AI Brain', status: '0nMCP' },
                  { label: 'CRM & Lead Capture', tool: 'HubSpot + Supabase', status: '0nMCP' },
                  { label: 'Booking System', tool: 'Google Calendar + Stripe', status: '0nMCP' },
                  { label: 'SEO & Analytics', tool: 'CRO9 Engine + GSC', status: '0nMCP' },
                  { label: 'Email Automation', tool: 'SendGrid + Resend', status: '0nMCP' },
                  { label: 'Deployment', tool: 'Vercel + Cloudflare', status: '0nMCP' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                    style={{
                      padding: '0.625rem 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#ffffff' }}>{item.label}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>{item.tool}</div>
                    </div>
                    <span
                      className="text-[0.6rem] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(126,217,87,0.1)',
                        color: '#7ed957',
                        border: '1px solid rgba(126,217,87,0.2)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="mt-6 pt-4 text-center text-xs"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
              >
                Zero manual code &mdash; 100% orchestrated by 0nMCP connected tools
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ — Recessed
          ══════════════════════════════════════════ */}
      <section className="section-recessed py-24 px-8" id="faq">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <div className="section-accent-line mx-auto" />
            <span className="section-label">FAQ</span>
            <h2 className="section-heading">Frequently Asked Questions</h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqItems.map((faq) => (
              <details key={faq.q} className="faq-item group">
                <summary>
                  {faq.q}
                  <span className="faq-toggle">+</span>
                </summary>
                <div className="faq-answer">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA — Elevated
          ══════════════════════════════════════════ */}
      <section className="section-elevated py-20 px-8 text-center">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
            Ready to{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}
            >
              Turn it 0n
            </span>
            ?
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. One install. Free forever.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/turn-it-on" className="btn-accent no-underline text-base px-8 py-3">
              Get Started &rarr;
            </Link>
            <a
              href="https://github.com/0nork/0nMCP"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost no-underline text-base px-8 py-3"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
