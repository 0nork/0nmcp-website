import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nMCP for ChatGPT — 16 AI Tools Inside OpenAI | 0nMCP',
  description:
    'Install 0nMCP in ChatGPT and get 16 tools: CRM contacts, Stripe payments, Slack messaging, AI brain, website builder, and pipeline execution. One token to connect. Free.',
  keywords: ['0nMCP', 'ChatGPT', 'MCP server', 'OpenAI', 'CRM', 'Stripe', 'AI tools', 'workflow automation'],
  openGraph: {
    title: '0nMCP for ChatGPT',
    description: '16 AI tools inside ChatGPT. One token to connect.',
    url: 'https://0nmcp.com/integrations/chatgpt',
  },
  alternates: { canonical: 'https://0nmcp.com/integrations/chatgpt' },
}

/* ── Tool data ── */
const TOOL_GROUPS = [
  {
    category: 'Builder',
    tools: [
      { name: 'build_website', desc: 'Generate a full multi-page website from a prompt' },
      { name: 'browse_tools', desc: 'Search the entire 0nMCP tool catalog by keyword' },
      { name: 'run_pipeline', desc: 'Execute a multi-step automation pipeline' },
    ],
  },
  {
    category: 'Account',
    tools: [
      { name: 'get_account', desc: 'View your 0nMCP account, Spark balance, and usage' },
      { name: 'purchase_sparks', desc: 'Buy execution credits directly from chat' },
    ],
  },
  {
    category: 'CRM',
    tools: [
      { name: 'search_contacts', desc: 'Find contacts by name, email, tag, or custom field' },
      { name: 'create_contact', desc: 'Add a new contact with tags and pipeline stage' },
      { name: 'get_pipeline', desc: 'View deal stages, values, and forecasts' },
      { name: 'send_email', desc: 'Send a templated or freeform email to any contact' },
    ],
  },
  {
    category: 'Payments',
    tools: [
      { name: 'get_revenue', desc: 'Pull total revenue, MRR, and charge counts' },
      { name: 'get_balance', desc: 'Check your Stripe available and pending balance' },
      { name: 'list_customers', desc: 'Browse Stripe customers with subscription status' },
    ],
  },
  {
    category: 'Communication',
    tools: [
      { name: 'post_to_slack', desc: 'Send a message to any Slack channel' },
      { name: 'ask_ai', desc: 'Query the 0nMCP AI brain for answers' },
    ],
  },
  {
    category: 'Discovery',
    tools: [
      { name: 'list_integrations', desc: 'See every connected service and its status' },
      { name: 'list_commands', desc: 'Browse all available slash commands' },
    ],
  },
]

const EXAMPLES = [
  {
    user: 'Search my contacts for anyone at Google',
    response: 'Found 3 contacts at Google: Lisa Chen (VP Sales), David Park (Engineering Lead), Maria Santos (Head of Partnerships). All tagged "enterprise".',
  },
  {
    user: 'How much revenue did we make this month?',
    response: '$12,450.00 across 47 charges. MRR is $8,200. Up 18% from last month.',
  },
  {
    user: 'Create a contact for sarah@acme.com',
    response: 'Contact created: Sarah (sarah@acme.com). Tagged "inbound". Added to "New Leads" pipeline, stage "Qualified".',
  },
  {
    user: 'Post "New feature shipped!" to #announcements',
    response: 'Posted to #announcements in your Slack workspace. Message delivered to 142 members.',
  },
  {
    user: 'Build a website for Mountain View Coffee',
    response: '5-page site triggered: Home, Menu, About, Gallery, Contact. 1 Spark used. Preview ready in ~30 seconds.',
  },
]

const FAQS = [
  {
    q: 'Do I need a paid OpenAI plan?',
    a: 'No. 0nMCP works with any ChatGPT plan that supports GPTs, including the free tier.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Authentication uses OAuth 2.1 with PKCE. Tokens are scoped and short-lived. No credentials are stored on OpenAI servers.',
  },
  {
    q: 'Can I use it with my team?',
    a: 'Yes. Each team member connects their own 0n token. Permissions are scoped per user -- no shared credentials.',
  },
  {
    q: 'What happens when I run out of Sparks?',
    a: 'Free actions like search and discovery still work. Execution-heavy tools pause until you purchase more Sparks or your plan refills.',
  },
  {
    q: 'Does it work with Claude too?',
    a: 'Yes. 0nMCP is a standard MCP server. See our Claude integration page for setup instructions.',
  },
]

/* ── Inline SVGs ── */
function IconInstall() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconKey() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

function IconCommand() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconBot() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  )
}

/* ── JSON-LD ── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
        { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://0nmcp.com/integrations' },
        { '@type': 'ListItem', position: 3, name: 'ChatGPT', item: 'https://0nmcp.com/integrations/chatgpt' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: '0nMCP for ChatGPT',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://0nmcp.com/integrations/chatgpt',
      description: 'Install 0nMCP in ChatGPT and get 16 tools: CRM contacts, Stripe payments, Slack messaging, AI brain, website builder, and pipeline execution.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free to install. Execution uses Sparks starting at $5 for 10.',
      },
      author: {
        '@type': 'Organization',
        name: '0nORK',
        url: 'https://0nmcp.com',
      },
      softwareVersion: '2.0',
      featureList: '16 tools, CRM, Stripe, Slack, AI Brain, Website Builder, Pipeline Execution',
    },
  ],
}

/* ── Shared styles ── */
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '24px',
}

const sectionStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '80px 24px',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'Instrument Sans, sans-serif',
  color: 'var(--text-primary)',
  margin: 0,
}

const subheadingStyle: React.CSSProperties = {
  fontFamily: 'Instrument Sans, sans-serif',
  color: 'var(--text-secondary)',
  margin: 0,
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace',
}

export default function ChatGPTIntegrationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Breadcrumb ── */}
      <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px 0' }}>
        <ol
          style={{
            listStyle: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
            padding: 0,
            fontSize: '14px',
            color: 'var(--text-muted)',
          }}
        >
          <li><Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link></li>
          <li style={{ display: 'flex', alignItems: 'center' }}><IconChevron /></li>
          <li><Link href="/integrations" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Integrations</Link></li>
          <li style={{ display: 'flex', alignItems: 'center' }}><IconChevron /></li>
          <li style={{ color: 'var(--text-primary)' }}>ChatGPT</li>
        </ol>
      </nav>

      {/* ── 1. Hero ── */}
      <section style={{ ...sectionStyle, textAlign: 'center', paddingBottom: '40px' }}>
        {/* OpenAI logo mark */}
        <div style={{ marginBottom: '24px' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="#10a37f">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
          </svg>
        </div>
        <h1 style={{ ...headingStyle, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px' }}>
          0nMCP for ChatGPT
        </h1>
        <p style={{ ...subheadingStyle, fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          16 tools. One token. Your entire business stack inside ChatGPT.
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '32px',
            marginBottom: '40px',
            fontSize: '14px',
            color: 'var(--text-muted)',
          }}
        >
          {[
            { value: '16', label: 'Tools' },
            { value: '96', label: 'Services' },
            { value: 'CRM + Stripe + Slack', label: 'Core Stack' },
            { value: 'Free', label: 'To Install' },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ ...monoStyle, fontSize: '20px', fontWeight: 700, color: '#10a37f' }}>{stat.value}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a
            href="https://chatgpt.com/gpts"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: '#10a37f',
              color: '#fff',
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '8px',
              textDecoration: 'none',
              border: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Install in ChatGPT
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
          <Link
            href="/console"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '8px',
              textDecoration: 'none',
              border: '1px solid var(--border)',
            }}
          >
            Get Your Token
          </Link>
        </div>
      </section>

      {/* ── 2. How It Works ── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={sectionStyle}>
          <h2 style={{ ...headingStyle, fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
            Three steps. Under a minute.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              {
                step: '01',
                title: 'Install',
                desc: 'Add 0nMCP from the GPT Store. Takes 10 seconds.',
                icon: <IconInstall />,
              },
              {
                step: '02',
                title: 'Connect',
                desc: 'Paste your 0n token. OAuth handles the rest.',
                icon: <IconKey />,
              },
              {
                step: '03',
                title: 'Command',
                desc: '"Search my contacts for John" -- it actually does it.',
                icon: <IconCommand />,
              },
            ].map((item) => (
              <div key={item.step} style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
                <span
                  style={{
                    ...monoStyle,
                    position: 'absolute',
                    top: '16px',
                    right: '20px',
                    fontSize: '48px',
                    fontWeight: 800,
                    color: 'var(--border)',
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </span>
                <div style={{ marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ ...headingStyle, fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. All 16 Tools ── */}
      <section style={sectionStyle}>
        <h2 style={{ ...headingStyle, fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>
          All 16 Tools
        </h2>
        <p style={{ ...subheadingStyle, textAlign: 'center', marginBottom: '48px', fontSize: '15px' }}>
          Every tool available inside your ChatGPT session.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {TOOL_GROUPS.map((group) =>
            group.tools.map((tool) => (
              <div key={tool.name} style={{ ...cardStyle, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span
                    style={{
                      ...monoStyle,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6EE05A',
                    }}
                  >
                    {tool.name}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#10a37f',
                      background: 'rgba(16, 163, 127, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontWeight: 500,
                    }}
                  >
                    {group.category}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                  {tool.desc}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── 4. Real Examples ── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={sectionStyle}>
          <h2 style={{ ...headingStyle, fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>
            Real Conversations
          </h2>
          <p style={{ ...subheadingStyle, textAlign: 'center', marginBottom: '48px', fontSize: '15px' }}>
            Actual prompts and responses from 0nMCP inside ChatGPT.
          </p>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {EXAMPLES.map((ex, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* User message */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(16, 163, 127, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconUser />
                  </div>
                  <div
                    style={{
                      ...cardStyle,
                      padding: '14px 18px',
                      borderRadius: '12px 12px 12px 4px',
                      flex: 1,
                    }}
                  >
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.5 }}>{ex.user}</p>
                  </div>
                </div>
                {/* Bot response */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingLeft: '44px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(110, 224, 90, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconBot />
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-tertiary, var(--bg-card))',
                      border: '1px solid var(--border)',
                      borderRadius: '12px 12px 12px 4px',
                      padding: '14px 18px',
                      flex: 1,
                    }}
                  >
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, ...monoStyle }}>
                      {ex.response}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Architecture ── */}
      <section style={sectionStyle}>
        <h2 style={{ ...headingStyle, fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
          How It Connects
        </h2>
        <div
          style={{
            ...cardStyle,
            maxWidth: '800px',
            margin: '0 auto',
            background: 'var(--bg-deep, #040A1A)',
            border: '1px solid rgba(16, 163, 127, 0.2)',
            padding: '40px 32px',
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              ...monoStyle,
              color: 'var(--text-on-dark, #E0E0E0)',
              fontSize: '14px',
              lineHeight: 1.8,
              margin: 0,
              whiteSpace: 'pre',
              textAlign: 'center',
            }}
          >
{`ChatGPT  ──>  OAuth 2.1 + PKCE  ──>  0nmcp.com  ──>  MCP Server  ──>  16 Tools
                                            |
                                    ┌───────┼───────┐
                                    |       |       |
                                   CRM   Stripe   Slack
                                    |       |       |
                                Contacts  Revenue  Channels
                                Pipeline  Balance  Messages
                                 Email   Customers   AI`}
          </pre>
        </div>
      </section>

      {/* ── 6. Pricing ── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={sectionStyle}>
          <h2 style={{ ...headingStyle, fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '12px' }}>
            Pricing
          </h2>
          <p style={{ ...subheadingStyle, textAlign: 'center', marginBottom: '48px', fontSize: '15px' }}>
            Free to install and connect. Pay only for what you execute.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', maxWidth: '860px', margin: '0 auto' }}>
            {[
              { name: 'Starter', sparks: '10', price: '$5', per: '$0.50 / Spark', highlight: false },
              { name: 'Growth', sparks: '50', price: '$19', per: '$0.38 / Spark', highlight: true },
              { name: 'Pro', sparks: '200', price: '$49', per: '$0.25 / Spark', highlight: false },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                  border: plan.highlight ? '2px solid #10a37f' : '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                {plan.highlight && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#10a37f',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 14px',
                      borderRadius: '8px',
                    }}
                  >
                    Best Value
                  </span>
                )}
                <h3 style={{ ...headingStyle, fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{plan.name}</h3>
                <div style={{ ...monoStyle, fontSize: '2rem', fontWeight: 800, color: '#10a37f', marginBottom: '4px' }}>
                  {plan.price}
                </div>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 4px', fontSize: '14px' }}>
                  {plan.sparks} Sparks
                </p>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>{plan.per}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: '#10a37f',
                color: '#fff',
                fontFamily: 'Instrument Sans, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ── */}
      <section style={sectionStyle}>
        <h2 style={{ ...headingStyle, fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '48px' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQS.map((faq, i) => (
            <details
              key={i}
              style={{
                ...cardStyle,
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  padding: '18px 24px',
                  cursor: 'pointer',
                  fontFamily: 'Instrument Sans, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {faq.q}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div style={{ padding: '0 24px 18px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── 8. Bottom CTA ── */}
      <section
        style={{
          background: 'var(--bg-deep, #040A1A)',
          borderTop: '1px solid rgba(16, 163, 127, 0.2)',
        }}
      >
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--text-on-dark, #E0E0E0)',
              marginBottom: '16px',
              margin: '0 0 16px',
            }}
          >
            Your entire business stack. Inside ChatGPT.
          </h2>
          <p style={{ color: 'var(--text-on-dark, #a0a0a0)', fontSize: '15px', marginBottom: '32px', opacity: 0.7 }}>
            16 tools. One token. Zero context-switching.
          </p>
          <a
            href="https://chatgpt.com/gpts"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: '#10a37f',
              color: '#fff',
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: '17px',
              fontWeight: 600,
              borderRadius: '8px',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            Install in ChatGPT
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
        </div>
      </section>
    </>
  )
}
