import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nMCP — Universal AI API Orchestrator | 59 Services, 1,385+ Capabilities',
  description:
    '0nMCP is the universal AI API orchestrator. 59 services, 1,385+ capabilities, one install. Stop building workflows. Start describing outcomes. Three-Level Execution: Pipeline, Assembly Line, Radial Burst.',
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
  ],
  openGraph: {
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      '59 services. 1,385+ capabilities. One install. Stop building workflows. Start describing outcomes.',
    url: 'https://0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      '59 services. 1,385+ capabilities. One install. The universal AI API orchestrator.',
  },
  alternates: { canonical: 'https://0nmcp.com' },
}

const categories = [
  { name: 'Everyday Tools', count: 8, icon: 'wrench' },
  { name: 'Communication & Social', count: 9, icon: 'chat' },
  { name: 'Email Marketing', count: 6, icon: 'mail' },
  { name: 'Payments', count: 6, icon: 'card' },
  { name: 'CRM & Sales', count: 4, icon: 'users' },
  { name: 'Project Management', count: 8, icon: 'board' },
  { name: 'Docs & Signatures', count: 3, icon: 'doc' },
  { name: 'Support', count: 3, icon: 'headset' },
  { name: 'Websites', count: 3, icon: 'globe' },
  { name: 'Advertising', count: 2, icon: 'megaphone' },
  { name: 'AI', count: 2, icon: 'brain' },
  { name: 'Developer', count: 5, icon: 'code' },
]

const faqItems = [
  {
    q: 'What is MCP orchestration?',
    a: 'MCP orchestration is the process of combining multiple Model Context Protocol servers into unified, automated workflows. Instead of connecting AI assistants to individual MCP servers one at a time, an orchestrator like 0nMCP federates them under a single gateway -- enabling chained, parallel, and conditional execution across services like CRM, email, calendar, and databases through a single trigger.',
  },
  {
    q: 'How do I combine multiple MCP servers?',
    a: "Install 0nMCP with 'npm i 0nmcp' and use the built-in orchestrator to federate multiple MCP servers. 0nMCP supports 59 services out of the box and provides 1,385+ capabilities that can be chained together in Pipeline (sequential), Assembly Line (decision), and Radial Burst (parallel) execution patterns.",
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
]

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '0nMCP',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    description:
      'Universal AI API orchestrator with 59 services and 1,385+ capabilities. Three-Level Execution: Pipeline, Assembly Line, Radial Burst.',
    url: 'https://0nmcp.com',
    downloadUrl: 'https://www.npmjs.com/package/0nmcp',
    softwareVersion: '1.7.0',
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
        name: 'Free (Open Source)',
        description:
          'Unlimited local use, all 59 services, MIT licensed, community support',
      },
      {
        '@type': 'Offer',
        price: '0.10',
        priceCurrency: 'USD',
        name: 'Marketplace',
        description: 'Pay-per-execution, $0.10 per run, no monthly fee',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />

      {/* ============================================
          HERO
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center px-8 pt-32 pb-16">
        {/* Glow */}
        <div
          className="absolute w-[600px] h-[600px] top-[10%] left-1/2 -translate-x-1/2 pointer-events-none animate-pulse-glow rounded-full"
          style={{
            background:
              'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-[900px] text-center relative z-[2]">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs mb-8 animate-fade-in-up"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--accent)',
                animation: 'pulseGlow 2s infinite',
              }}
            />
            v1.7.0 -- 59 services live
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            59 Services.{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              }}
            >
              1,385+ Capabilities.
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="text-3xl md:text-4xl font-bold mb-4 glow-text animate-fade-in-up"
            style={{
              color: 'var(--accent)',
              animationDelay: '0.15s',
              animationFillMode: 'both',
            }}
          >
            Turn it 0n.
          </p>

          {/* Tagline */}
          <p
            className="text-lg md:text-xl max-w-[640px] mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{
              color: 'var(--text-secondary)',
              animationDelay: '0.2s',
              animationFillMode: 'both',
            }}
          >
            Stop building workflows. Start describing outcomes.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex items-center justify-center gap-4 flex-wrap mb-8 animate-fade-in-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <Link href="/turn-it-on" className="btn-accent no-underline text-base px-8 py-3">
              Turn it 0n &rarr;
            </Link>
            <button
              className="btn-ghost text-base px-8 py-3"
              onClick={undefined}
              title="Copy to clipboard: npm i 0nmcp"
            >
              <code className="font-mono" style={{ color: 'var(--accent)' }}>
                npm i 0nmcp
              </code>
            </button>
          </div>

          {/* Stats */}
          <div
            className="flex justify-center gap-12 flex-wrap pt-8 animate-fade-in-up"
            style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
          >
            {[
              { num: '59', label: 'Services' },
              { num: '1,385+', label: 'Capabilities' },
              { num: '13', label: 'Categories' },
              { num: '3', label: 'npm Packages' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span
                  className="font-mono text-3xl font-bold block"
                  style={{ color: 'var(--accent)' }}
                >
                  {stat.num}
                </span>
                <span
                  className="text-xs uppercase tracking-widest mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PROBLEM / SOLUTION
          ============================================ */}
      <section
        className="py-24 px-8"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1100px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Too Many APIs. Too Many Connectors.
            <br />
            <span style={{ color: 'var(--text-secondary)' }}>
              Until now.
            </span>
          </h2>
          <p
            className="text-lg max-w-[600px] leading-relaxed mb-12"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every AI assistant connects to services individually. No chaining.
            No automation. No orchestration. You are left manually coordinating
            tools that should just work as a system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem */}
            <div
              className="p-8 rounded-xl"
              style={{
                background: 'rgba(255,107,53,0.05)',
                border: '1px solid rgba(255,107,53,0.2)',
              }}
            >
              <h3
                className="font-mono text-sm uppercase tracking-wide mb-6"
                style={{ color: '#ff6b35' }}
              >
                Without 0nMCP
              </h3>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  'Connect to each API separately',
                  'Manually coordinate multi-step processes',
                  'No workflow persistence or state tracking',
                  'Different config format per client',
                  'No parallel execution across services',
                  'Workflows stuck on one machine',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span style={{ color: '#ff6b35' }} className="flex-shrink-0">
                      &#10005;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div
              className="p-8 rounded-xl"
              style={{
                background: 'rgba(0,255,136,0.03)',
                border: '1px solid rgba(0,255,136,0.15)',
              }}
            >
              <h3
                className="font-mono text-sm uppercase tracking-wide mb-6"
                style={{ color: 'var(--accent)' }}
              >
                With 0nMCP
              </h3>
              <ul className="flex flex-col gap-3 list-none">
                {[
                  'Describe what you want, 0nMCP handles the rest',
                  'Chain tools into automated multi-phase workflows',
                  'Full execution logging, state, and audit trail',
                  'Universal .0n config standard -- write once, run everywhere',
                  'Radial Burst parallel execution across services',
                  'Export, share, and sell portable workflow packages',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span
                      style={{ color: 'var(--accent)' }}
                      className="flex-shrink-0"
                    >
                      &#10003;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          THREE-LEVEL ARCHITECTURE
          ============================================ */}
      <section className="py-24 px-8" id="how-it-works">
        <div className="max-w-[1100px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Patented Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Three-Level Execution Hierarchy
          </h2>
          <p
            className="text-lg max-w-[600px] leading-relaxed mb-12"
            style={{ color: 'var(--text-secondary)' }}
          >
            The only AI API orchestrator with a patented Pipeline &rarr; Assembly
            Line &rarr; Radial Burst execution model. Sequential phases.
            Decision points. Parallel actions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                level: 'Level 1',
                name: 'Pipeline',
                desc: 'Sequential phases that represent major milestones. Each phase completes before the next begins. Think: intake, process, deliver.',
                color: 'var(--accent)',
              },
              {
                level: 'Level 2',
                name: 'Assembly Line',
                desc: 'Decision moments within each phase. Sequential checkpoints that evaluate conditions, route data, and determine what happens next.',
                color: 'var(--accent-secondary)',
              },
              {
                level: 'Level 3',
                name: 'Radial Burst',
                desc: 'Parallel fan-out across multiple services simultaneously. Fire and forget, or wait for all results. Maximum throughput, minimum latency.',
                color: '#ff6b35',
              },
            ].map((arch) => (
              <div
                key={arch.name}
                className="glow-box relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{
                    background: `linear-gradient(90deg, ${arch.color}, transparent)`,
                  }}
                />
                <span
                  className="font-mono text-[0.7rem] uppercase tracking-[0.15em] block mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {arch.level}
                </span>
                <h3 className="text-xl font-bold mb-2">{arch.name}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {arch.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SERVICES GRID
          ============================================ */}
      <section
        className="py-24 px-8"
        id="services"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1100px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            59 Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            13 Categories. Every Tool You Need.
          </h2>
          <p
            className="text-lg max-w-[600px] leading-relaxed mb-12"
            style={{ color: 'var(--text-secondary)' }}
          >
            From CRM and payments to email marketing and AI -- 0nMCP connects
            your entire stack under one orchestrator.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/turn-it-on"
                className="glow-box text-center no-underline block"
              >
                <span
                  className="font-mono text-2xl font-bold block mb-2"
                  style={{ color: 'var(--accent)' }}
                >
                  {cat.count}
                </span>
                <span
                  className="text-sm font-medium block"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section className="py-24 px-8">
        <div className="max-w-[1100px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Quick Start
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">
            Three Steps. That&apos;s It.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Install',
                desc: 'One command. No complex setup. Works with any AI client that supports MCP.',
                code: 'npm i 0nmcp',
              },
              {
                step: '02',
                title: 'Connect',
                desc: 'Add your API keys for the services you use. 0nMCP encrypts and stores them securely in ~/.0n/',
                code: '0nmcp engine import',
              },
              {
                step: '03',
                title: 'Describe',
                desc: 'Tell your AI what you want done. 0nMCP handles the orchestration, routing, and execution across all connected services.',
                code: '"Send an invoice and notify the team"',
              },
            ].map((step) => (
              <div key={step.step} className="glow-box">
                <span
                  className="font-mono text-3xl font-bold block mb-4"
                  style={{ color: 'var(--accent)' }}
                >
                  {step.step}
                </span>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {step.desc}
                </p>
                <code
                  className="font-mono text-xs px-3 py-1.5 rounded"
                  style={{
                    backgroundColor: 'rgba(0,255,136,0.08)',
                    color: 'var(--accent)',
                  }}
                >
                  {step.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PRICING
          ============================================ */}
      <section
        className="py-24 px-8"
        id="pricing"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1100px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">
            Free forever. Pay only when you scale.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="glow-box">
              <span
                className="font-mono text-xs uppercase tracking-wide block mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Free
              </span>
              <div className="text-4xl font-bold mb-1">
                <span
                  className="text-lg align-super"
                  style={{ color: 'var(--text-muted)' }}
                >
                  $
                </span>
                0
              </div>
              <p
                className="text-sm mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                Open source, unlimited local use
              </p>
              <ul className="flex flex-col gap-3 list-none mb-8">
                {[
                  'All 59 services',
                  '1,385+ capabilities',
                  'MIT licensed',
                  'Community support',
                  'CLI and MCP interface',
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span style={{ color: 'var(--accent)' }} className="font-bold">
                      +
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://www.npmjs.com/package/0nmcp"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full text-center justify-center no-underline"
              >
                Install Free
              </a>
            </div>

            {/* Marketplace */}
            <div
              className="glow-box relative"
              style={{
                borderColor: 'var(--accent)',
                boxShadow: '0 0 40px var(--accent-glow)',
              }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-mono text-[0.65rem] font-bold tracking-wide"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-primary)',
                }}
              >
                MOST POPULAR
              </span>
              <span
                className="font-mono text-xs uppercase tracking-wide block mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Marketplace
              </span>
              <div className="text-4xl font-bold mb-1">
                <span
                  className="text-lg align-super"
                  style={{ color: 'var(--text-muted)' }}
                >
                  $
                </span>
                0.10
                <span
                  className="text-base font-normal"
                  style={{ color: 'var(--text-muted)' }}
                >
                  /execution
                </span>
              </div>
              <p
                className="text-sm mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                Pay only for what you use. No monthly fee.
              </p>
              <ul className="flex flex-col gap-3 list-none mb-8">
                {[
                  'Everything in Free',
                  'Cloud execution',
                  'Visual workflow builder',
                  'Workflow marketplace',
                  'Priority execution queue',
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span style={{ color: 'var(--accent)' }} className="font-bold">
                      +
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://marketplace.rocketclients.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent w-full text-center justify-center no-underline"
              >
                Launch Builder
              </a>
            </div>

            {/* Enterprise */}
            <div className="glow-box">
              <span
                className="font-mono text-xs uppercase tracking-wide block mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Enterprise
              </span>
              <div className="text-4xl font-bold mb-1">Custom</div>
              <p
                className="text-sm mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                Dedicated infrastructure and support
              </p>
              <ul className="flex flex-col gap-3 list-none mb-8">
                {[
                  'Everything in Marketplace',
                  'SSO / SAML',
                  'Custom integrations',
                  'SLA guarantee',
                  'Dedicated support channel',
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span style={{ color: 'var(--accent)' }} className="font-bold">
                      +
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:mike@rocketopp.com?subject=0nMCP%20Enterprise%20Inquiry"
                className="btn-ghost w-full text-center justify-center no-underline"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ
          ============================================ */}
      <section className="py-24 px-8" id="faq">
        <div className="max-w-[800px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">
            Frequently Asked Questions
          </h2>

          <div className="flex flex-col gap-3">
            {faqItems.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <summary
                  className="px-6 py-5 cursor-pointer font-semibold text-[0.95rem] list-none flex justify-between items-center"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {faq.q}
                  <span
                    className="font-mono text-lg ml-4 flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-6 pb-5 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
