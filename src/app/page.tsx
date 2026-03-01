import type { Metadata } from 'next'
import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import LogoBanner from '@/components/LogoBanner'
import DemoPreview from '@/components/DemoPreview'

export const metadata: Metadata = {
  title: '0nMCP — Universal AI API Orchestrator | 819 Tools, 48 Services',
  description:
    '0nMCP is the universal AI API orchestrator. 819 tools across 48 services, 1,078 capabilities, one install. Stop building workflows. Start describing outcomes. Three-Level Execution: Pipeline, Assembly Line, Radial Burst.',
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
      '819 tools across 48 services. 1,078 capabilities. One install. Stop building workflows. Start describing outcomes.',
    url: 'https://0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      '819 tools across 48 services. 1,078 capabilities. One install. The universal AI API orchestrator.',
  },
  alternates: { canonical: 'https://0nmcp.com' },
}

const categories = [
  { name: 'Everyday Tools', count: 8, icon: '⚡' },
  { name: 'Communication', count: 9, icon: '💬' },
  { name: 'Email Marketing', count: 6, icon: '📧' },
  { name: 'Payments', count: 8, icon: '💳' },
  { name: 'CRM & Sales', count: 6, icon: '👥' },
  { name: 'Project Mgmt', count: 8, icon: '📋' },
  { name: 'Docs & Storage', count: 4, icon: '📄' },
  { name: 'Support', count: 3, icon: '🎧' },
  { name: 'Websites', count: 3, icon: '🌐' },
  { name: 'Advertising', count: 6, icon: '📢' },
  { name: 'AI', count: 2, icon: '🧠' },
  { name: 'Developer', count: 5, icon: '⌨️' },
  { name: 'Social Media', count: 5, icon: '📱' },
  { name: 'Accounting', count: 2, icon: '📊' },
  { name: 'Finance', count: 2, icon: '🏦' },
  { name: 'Cloud', count: 1, icon: '☁️' },
  { name: 'Integration', count: 2, icon: '🔗' },
  { name: 'Automation', count: 1, icon: '⚙️' },
  { name: 'Outreach', count: 1, icon: '📤' },
  { name: 'Cold Email', count: 1, icon: '❄️' },
  { name: 'Messaging', count: 1, icon: '💭' },
]

const faqItems = [
  {
    q: 'What is MCP orchestration?',
    a: 'MCP orchestration is the process of combining multiple Model Context Protocol servers into unified, automated workflows. Instead of connecting AI assistants to individual MCP servers one at a time, an orchestrator like 0nMCP federates them under a single gateway -- enabling chained, parallel, and conditional execution across services like CRM, email, calendar, and databases through a single trigger.',
  },
  {
    q: 'How do I combine multiple MCP servers?',
    a: "Install 0nMCP with 'npm i 0nmcp' and use the built-in orchestrator to federate multiple MCP servers. 0nMCP supports 48 services out of the box and provides 1,078 capabilities that can be chained together in Pipeline (sequential), Assembly Line (decision), and Radial Burst (parallel) execution patterns.",
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
    a: '0nMCP supports 48 services across 21 categories including Stripe, Slack, Discord, GitHub, OpenAI, Anthropic, Gmail, Google Sheets, Google Drive, Airtable, Notion, MongoDB, Supabase, Zendesk, Jira, HubSpot, Mailchimp, Twilio, SendGrid, Shopify, QuickBooks, Asana, Intercom, Dropbox, WhatsApp, Instagram, X (Twitter), TikTok, Google Ads, Facebook Ads, Plaid, Square, LinkedIn, Pipedrive, Azure, and more.',
  },
  {
    q: 'Is 0nMCP free?',
    a: '0nMCP is free and open source under the MIT license. All 819 tools, 48 services, and 1,078 capabilities are available for unlimited local use via the CLI with no credit card required. The 0nMCP Console offers a free tier with 25 executions per month, a Pro plan at $19/month for unlimited executions and the visual workflow builder, and a Team plan at $49/month with 5 seats and shared workflows.',
  },
]

export default function HomePage() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RocketOpp, LLC',
    url: 'https://0nmcp.com',
    logo: 'https://0nmcp.com/icon.svg',
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
    url: 'https://0nmcp.com',
    description: 'Universal AI API Orchestrator — 819 tools across 48 services',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://0nmcp.com/forum?search={search_term_string}',
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
      'Universal AI API orchestrator with 819 tools across 48 services and 1,078 capabilities. Three-Level Execution: Pipeline, Assembly Line, Radial Burst.',
    url: 'https://0nmcp.com',
    downloadUrl: 'https://www.npmjs.com/package/0nmcp',
    softwareVersion: '2.2.0',
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
        description: 'All 819 tools, 48 services, unlimited local use, MIT licensed',
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
        url: 'https://0nmcp.com/#quickstart',
      },
      {
        '@type': 'HowToStep',
        name: 'Connect Your Services',
        text: 'Run 0nmcp engine import to add your API keys. 0nMCP encrypts and stores them securely in your local ~/.0n/ vault.',
        url: 'https://0nmcp.com/#quickstart',
      },
      {
        '@type': 'HowToStep',
        name: 'Describe What You Need',
        text: 'Tell your AI what you want done. 0nMCP routes, orchestrates, and executes across all 48 services automatically.',
        url: 'https://0nmcp.com/#quickstart',
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
            orchestrator that federates 48 services into a single, automated
            system.
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
                { title: 'AES-256 Encrypted Vault', desc: 'Client-side encryption with PBKDF2-SHA512. Your API keys are encrypted before they ever touch disk. Hardware-bound fingerprinting.', color: '#00ff88' },
                { title: '0nVault Container System', desc: '7 semantic layers with independent encryption. Multi-party escrow via X25519 ECDH. Patent-pending binary .0nv format.', color: '#00d4ff' },
                { title: 'Digital Deed Transfer', desc: 'Package entire business digital assets into a single encrypted container. Chain of custody tracking with Seal of Truth verification.', color: '#a78bfa' },
                { title: 'Patent-Pending Architecture', desc: 'Three-Level Execution + Vault Container System. Two US provisional patents protecting the core technology.', color: '#ff6b35' },
                { title: 'Seal of Truth Verification', desc: 'SHA3-256 content-addressed integrity. Ed25519 digital signatures. Transfer registry with replay prevention.', color: '#00d4ff' },
                { title: 'Free & Open Source', desc: 'MIT licensed. All 819 tools, 48 services, unlimited local use. No credit card. No trial period. Fully auditable.', color: '#00ff88' },
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
            <span className="section-label">48 Services</span>
            <h2 className="section-heading">
              21 Categories. Every Tool You Need.
            </h2>
            <p className="section-desc mx-auto">
              From CRM and payments to email marketing and AI &mdash; 0nMCP
              connects your entire stack under one orchestrator.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href="/turn-it-on" className="float-card float-card-accent no-underline" style={{ padding: '1.5rem 1rem', textAlign: 'center', display: 'block' }}>
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <span className="font-mono text-xl font-bold block mb-1" style={{ color: 'var(--accent)' }}>{cat.count}</span>
                <span className="text-xs font-medium block" style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
              </Link>
            ))}
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
                    backgroundColor: 'rgba(0,255,136,0.08)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(0,255,136,0.15)',
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
                {['All 819 tools', '48 services', '1,078 capabilities', 'MIT licensed', 'CLI + MCP interface', 'Community support'].map((f) => (
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
            819 tools. 48 services. One install. Free forever.
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
