import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partners -- 0nMCP Ecosystem',
  description:
    'Partner products and integrations in the 0nMCP ecosystem. MCPFED AI Automation Marketplace, 0n Marketplace, Rocket+ CRM tools, and more.',
  openGraph: {
    title: 'Partners -- 0nMCP Ecosystem',
    description:
      'Explore the 0nMCP partner ecosystem. AI automation, marketplaces, and orchestration tools working together.',
    url: 'https://0nmcp.com/partners',
    type: 'website',
  },
  alternates: { canonical: 'https://0nmcp.com/partners' },
}

const partners = [
  {
    name: 'MCPFED',
    tagline: 'The AI Automation Marketplace',
    url: 'https://mcpfed.com',
    description:
      'Federation of Agents platform with the Opp Factory — an AI-powered system for building complete business operations from natural language. Uses the same three-level execution hierarchy as 0nMCP: Pipeline, Assembly Line, and Radial Burst.',
    features: [
      'Opp Factory — AI-generated business operations',
      'FOPs Library — Federated Operating Procedures',
      'Three-level execution hierarchy (Pipeline > Assembly Line > Radial Burst)',
      'Template marketplace for pre-built operations',
      'Stripe-powered subscription management',
    ],
    integration:
      'MCPFED operations can be exported as .0n workflow files, making them portable across any 0nMCP-powered setup. The same execution model that powers 0nMCP also powers MCPFED.',
    color: '#ff6b35',
    badge: 'Partner',
  },
  {
    name: '0n Marketplace',
    tagline: 'Pay-per-execution automation store',
    url: 'https://marketplace.rocketclients.com',
    description:
      'The SaaS marketplace for .0n workflow files. Browse, purchase, and execute pre-built automations without writing a single line of code. Every execution is metered and tracked through Stripe.',
    features: [
      'Browse and purchase .0n workflow files',
      'Pay-per-execution pricing ($0.10/run)',
      'AI-powered workflow generation with Claude',
      'Usage dashboard with execution history',
      'Stripe-powered billing and metering',
    ],
    integration:
      'Built on top of 0nMCP. Every workflow in the marketplace is a .0n file that uses 0nMCP services. Export any workflow and run it locally with your own 0nMCP installation.',
    color: '#00ff88',
    badge: 'Official',
  },
  {
    name: 'Rocket+',
    tagline: 'Modular CRM enhancements',
    url: 'https://rocketadd.com',
    description:
      'A suite of AI-powered tools that extend your CRM with advanced automation, course generation, client management, and 50+ modular enhancements. Built by RocketOpp LLC.',
    features: [
      '50+ modular CRM tools',
      'AI course generation',
      'Client portal management',
      'Social media automation',
      'Appointment scheduling',
    ],
    integration:
      '0nMCP includes 245 CRM tools across 12 modules (contacts, calendars, opportunities, invoices, and more). Rocket+ users can orchestrate their entire CRM through 0nMCP.',
    color: '#00d4ff',
    badge: 'Partner',
  },
  {
    name: 'app.0nmcp.com',
    tagline: 'The 0n Customer Portal',
    url: 'https://app.0nmcp.com',
    description:
      'Authenticated workspace for managing your .0n files, building skills, composing SWITCH files, and connecting services. The no-code interface for the entire 0n ecosystem.',
    features: [
      'Composer — drag-and-drop SWITCH file builder',
      'Skill Builder — visual workflow creation',
      'Credential Vault — encrypted API key storage',
      'Community — discussions, groups, members',
      'Console — real-time service status',
    ],
    integration:
      'The app is the UI layer for 0nMCP. Everything you build in the app generates .0n files that work with the CLI, the marketplace, and any AI platform.',
    color: '#9945ff',
    badge: 'Official',
  },
]

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
          className="text-lg max-w-[640px] mx-auto leading-relaxed relative z-[2]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Partner products and integrations that extend the 0nMCP platform.
          One standard, many applications. Every product speaks .0n.
        </p>
      </section>

      {/* Partner Cards */}
      <section className="py-12 px-8">
        <div className="max-w-[1000px] mx-auto space-y-8">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="glow-box relative"
              style={{
                borderColor: partner.color + '30',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold">{partner.name}</h2>
                    <span
                      className="text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: partner.color + '18',
                        color: partner.color,
                        border: `1px solid ${partner.color}30`,
                      }}
                    >
                      {partner.badge}
                    </span>
                  </div>
                  <p
                    className="font-mono text-sm"
                    style={{ color: partner.color }}
                  >
                    {partner.tagline}
                  </p>
                </div>
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost no-underline text-sm shrink-0"
                >
                  Visit &rarr;
                </a>
              </div>

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                {partner.description}
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
                    {partner.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: partner.color }}
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
                    {partner.integration}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,212,255,0.05))',
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
              Every product in the ecosystem speaks .0n. Build once, run anywhere.
              One SWITCH file powers them all.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="/0n-standard"
                className="btn-accent no-underline"
              >
                Learn the .0n Standard
              </a>
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
