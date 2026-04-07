import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nMCP for Claude — Universal MCP Server for Claude Desktop & Claude Code | 0nMCP',
  description: 'Add 0nMCP to Claude Desktop or Claude Code and unlock 1,554 tools across 96 services. CRM, Stripe, Slack, GitHub, and 92 more. The most comprehensive MCP server available.',
  keywords: ['0nMCP', 'Claude', 'Anthropic', 'MCP server', 'Claude Desktop', 'Claude Code', 'AI tools', 'workflow automation'],
  openGraph: {
    title: '0nMCP for Claude',
    description: '1,554 tools across 96 services. The most comprehensive MCP server.',
    url: 'https://0nmcp.com/integrations/claude',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
        { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://0nmcp.com/integrations' },
        { '@type': 'ListItem', position: 3, name: 'Claude', item: 'https://0nmcp.com/integrations/claude' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: '0nMCP',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Cross-platform',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Universal MCP server with 1,554 tools across 96 services. Works with Claude Desktop, Claude Code, and any MCP-compatible client.',
      url: 'https://0nmcp.com',
      downloadUrl: 'https://www.npmjs.com/package/0nmcp',
      softwareVersion: '2.9.0',
      author: { '@type': 'Organization', name: '0nORK', url: 'https://0nmcp.com' },
      license: 'https://opensource.org/licenses/MIT',
    },
  ],
}

const STATS = [
  { value: '1,554', label: 'Tools' },
  { value: '96', label: 'Services' },
  { value: '22', label: 'Categories' },
  { value: 'MIT', label: 'Licensed' },
  { value: 'Free', label: 'Forever' },
]

const CATEGORIES = [
  { name: 'CRM', tools: 289, services: 'Contacts, Calendar, Pipeline, Social, Users, Objects, Invoices, Payments, Products, Locations', color: '#a78bfa' },
  { name: 'Payments', tools: 32, services: 'Stripe charges, subscriptions, invoices, products, customers, payouts', color: '#635bff' },
  { name: 'Communication', tools: 146, services: 'Slack channels/messages, Telegram bot API, Twilio SMS/voice, Discord', color: '#00d4ff' },
  { name: 'AI Models', tools: 18, services: 'OpenAI, Gemini, Grok, Ollama, Anthropic', color: '#a78bfa' },
  { name: 'Developer', tools: 28, services: 'GitHub repos, PRs, issues, actions, releases, webhooks', color: '#6EE05A' },
  { name: 'Infrastructure', tools: 44, services: 'Supabase, Vercel, Google Cloud, Cloudflare, Azure', color: '#FF6B35' },
  { name: 'Content', tools: 34, services: 'Sanity CMS, Dev.to publishing, Notion, Airtable', color: '#00C2C7' },
  { name: 'Marketing', tools: 68, services: 'Mailchimp, HubSpot, Google Ads, Facebook Ads, LinkedIn Ads, TikTok Ads', color: '#FFD700' },
  { name: 'E-Commerce', tools: 42, services: 'Shopify, Square, products, orders, inventory, customers', color: '#96bf48' },
  { name: 'Productivity', tools: 36, services: 'Asana, Linear, Jira, Calendly, Zoom, Google Calendar', color: '#14b8a6' },
  { name: 'Finance', tools: 28, services: 'QuickBooks, Plaid, invoices, transactions, accounts', color: '#2ca01c' },
  { name: 'Social', tools: 52, services: 'Instagram, Twitter/X, LinkedIn, WhatsApp, TikTok', color: '#e1306c' },
]

const SUPERPOWERS = [
  {
    title: 'Native Tool Use',
    desc: 'Claude calls 0nMCP tools natively via the Model Context Protocol. Say "Search CRM for John" and get real API calls with real results. No plugins, no configuration, no middleware.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: 'Multi-Step Workflows',
    desc: 'Chain tools in a single conversation: search contact, create opportunity, send email, post to Slack. Claude orchestrates multi-step operations across any combination of 96 services.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: 'Vault Encryption',
    desc: 'AES-256-GCM machine-bound credential storage with PBKDF2-SHA512 (100K iterations). Your API keys are encrypted at rest and never leave your machine. Patent pending.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'SWITCH Files (.0n)',
    desc: 'Save any workflow as a portable .0n SWITCH file. Run it anywhere: CLI, Claude Desktop, Claude Code, Slack, Telegram, or ChatGPT. One format, every platform.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
]

const EXAMPLES = [
  {
    prompt: 'Find all contacts tagged "enterprise" and create a Stripe invoice for each',
    result: '4 invoices created totaling $12,800. Stripe payment links sent to all 4 contacts.',
    tools: 'crm_search_contacts, stripe_create_invoice (x4)',
  },
  {
    prompt: 'Check my Stripe balance and post the numbers to #finance on Slack',
    result: 'Balance: $8,420.00 available, $1,200.00 pending. Posted to #finance.',
    tools: 'stripe_get_balance, slack_post_message',
  },
  {
    prompt: 'Create a new GitHub issue on 0nork/0nMCP for the webhook bug',
    result: 'Issue #47 created: "Webhook signature verification failing on Shopify events"',
    tools: 'github_create_issue',
  },
  {
    prompt: 'Search contacts for sarah@acme.com, add tag "vip", move to Closed Won',
    result: 'Contact found. Tag "vip" added. Pipeline stage updated to Closed Won.',
    tools: 'crm_search_contacts, crm_add_tag, crm_update_opportunity',
  },
  {
    prompt: 'Generate a .0n workflow that sends a welcome email when a new contact is created',
    result: 'SWITCH file generated: welcome-email.0n with trigger + email step + Slack notification.',
    tools: 'engine_export',
  },
]

const COMPARISON = [
  { feature: 'Tools', onmcp: '1,554', typical: '5-20' },
  { feature: 'Services', onmcp: '96', typical: '1-3' },
  { feature: 'CRM Integration', onmcp: '289 tools', typical: 'None' },
  { feature: 'Encryption', onmcp: 'AES-256-GCM', typical: 'None' },
  { feature: 'Cost', onmcp: 'Free (MIT)', typical: 'Varies' },
  { feature: 'Patents', onmcp: '5 pending', typical: '0' },
  { feature: 'Portable Workflows', onmcp: '.0n SWITCH files', typical: 'No' },
  { feature: 'AI Model Support', onmcp: '5 models', typical: '1' },
]

const FAQ = [
  {
    q: 'Is it free?',
    a: 'Yes. 0nMCP is MIT licensed and free forever. The core server with all 1,554 tools costs nothing. Premium features like hosted execution and the marketplace unlock at growth milestones.',
  },
  {
    q: 'Does it work with Claude Code?',
    a: 'Yes. Run claude mcp add 0nmcp -- npx -y 0nmcp and you are connected. Claude Code can call all 1,554 tools directly from your terminal.',
  },
  {
    q: 'How do I add my API keys?',
    a: 'Run 0nmcp engine import to auto-detect credentials from .env, CSV, or JSON files. Or add them manually to ~/.0n/connections/ as .0n connection files.',
  },
  {
    q: 'Is it secure?',
    a: 'Yes. The 0nVault uses AES-256-GCM encryption with PBKDF2-SHA512 (100K iterations) and hardware fingerprint binding. Credentials are encrypted at rest and never transmitted. Patent pending (US #63/990,046).',
  },
  {
    q: 'Does it work with ChatGPT too?',
    a: 'Yes. 0nMCP works with any MCP-compatible client including ChatGPT, Cursor, Windsurf, Gemini, Continue, Cline, and OpenAI. See our ChatGPT integration page for details.',
  },
]

export default function ClaudeIntegrationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <section style={{
          background: 'linear-gradient(180deg, #0d0d1a 0%, var(--bg-primary) 100%)',
          padding: '80px 24px 64px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Anthropic + 0nMCP lockup */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
              {/* Claude logo mark */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#a78bfa" fillOpacity="0.15" />
                <path d="M24 10c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14S31.73 10 24 10zm0 4a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-2 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2 6c-2.21 0-4-1.12-4-2.5h8c0 1.38-1.79 2.5-4 2.5z" fill="#a78bfa" />
              </svg>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {/* 0nMCP mark */}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(110, 224, 90, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: '#6EE05A',
              }}>0n</div>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.1,
              margin: '0 0 20px',
              letterSpacing: '-0.02em',
            }}>
              0nMCP for <span style={{ color: '#a78bfa' }}>Claude</span>
            </h1>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              color: 'var(--text-secondary)',
              margin: '0 0 40px',
              lineHeight: 1.5,
            }}>
              1,554 tools. 96 services. The most comprehensive MCP server ever built.
            </p>

            {/* Stats bar */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0,
              marginBottom: 40,
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--bg-card)',
            }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{
                  padding: '16px 28px',
                  borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                  flex: '1 1 auto',
                  minWidth: 100,
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#a78bfa' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
              <a href="#install" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 8,
                background: '#a78bfa', color: '#fff',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                textDecoration: 'none',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add to Claude Desktop
              </a>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 28px', borderRadius: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)', fontSize: 15, color: '#6EE05A',
                userSelect: 'all', cursor: 'text',
              }}>
                npm install -g 0nmcp
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
            textAlign: 'center', marginBottom: 48,
          }}>
            Three Ways to Connect
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {/* Method 1: Claude Desktop */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 32, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #a78bfa, #00d4ff)',
              }} />
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(167, 139, 250, 0.12)',
                color: '#a78bfa', fontWeight: 700, fontSize: 16, marginBottom: 16,
              }}>1</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Claude Desktop</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
                Add this to your <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#a78bfa' }}>claude_desktop_config.json</span>. Done.
              </p>
              <pre style={{
                background: '#0d0d1a', borderRadius: 8, padding: 20,
                fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6,
                color: '#e0e0e0', overflow: 'auto', margin: 0,
              }}>{`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`}</pre>
            </div>

            {/* Method 2: Claude Code */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 32, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #a78bfa, #6EE05A)',
              }} />
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(167, 139, 250, 0.12)',
                color: '#a78bfa', fontWeight: 700, fontSize: 16, marginBottom: 16,
              }}>2</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Claude Code</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
                One command. Instant connection.
              </p>
              <pre style={{
                background: '#0d0d1a', borderRadius: 8, padding: 20,
                fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6,
                color: '#e0e0e0', overflow: 'auto', margin: 0,
              }}>{`claude mcp add 0nmcp -- npx -y 0nmcp`}</pre>
            </div>

            {/* Method 3: npm Global */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 32, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #6EE05A, #00d4ff)',
              }} />
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(110, 224, 90, 0.12)',
                color: '#6EE05A', fontWeight: 700, fontSize: 16, marginBottom: 16,
              }}>3</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>npm Global Install</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
                Install globally. Run as stdio MCP server.
              </p>
              <pre style={{
                background: '#0d0d1a', borderRadius: 8, padding: 20,
                fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6,
                color: '#e0e0e0', overflow: 'auto', margin: 0,
              }}>{`npm install -g 0nmcp
0nmcp`}</pre>
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section style={{
          padding: '80px 24px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
              textAlign: 'center', marginBottom: 12,
            }}>
              What You Get
            </h2>
            <p style={{
              textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16,
              marginBottom: 48, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto',
            }}>
              96 services organized into 22 categories. Every tool available to Claude instantly.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {CATEGORIES.map((cat) => (
                <div key={cat.name} style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '20px 24px',
                  borderLeft: `3px solid ${cat.color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, margin: 0 }}>{cat.name}</h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: cat.color, fontWeight: 600 }}>{cat.tools}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{cat.services}</p>
                </div>
              ))}
            </div>

            <p style={{
              textAlign: 'center', color: 'var(--text-muted)', fontSize: 14,
              marginTop: 24,
            }}>
              Plus 85+ more services across file storage, project management, advertising, DNS, and more.
            </p>
          </div>
        </section>

        {/* ── CLAUDE-SPECIFIC SUPERPOWERS ── */}
        <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
            textAlign: 'center', marginBottom: 48,
          }}>
            Claude-Specific Superpowers
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {SUPERPOWERS.map((sp) => (
              <div key={sp.title} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 32,
              }}>
                <div style={{ marginBottom: 16 }}>{sp.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>{sp.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0, lineHeight: 1.7 }}>{sp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── REAL EXAMPLES ── */}
        <section style={{
          padding: '80px 24px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
              textAlign: 'center', marginBottom: 12,
            }}>
              Real Conversations
            </h2>
            <p style={{
              textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16,
              marginBottom: 48,
            }}>
              What it actually looks like when Claude has 0nMCP.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {EXAMPLES.map((ex, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* User bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: '#a78bfa', color: '#fff',
                      padding: '12px 18px', borderRadius: '16px 16px 4px 16px',
                      fontSize: 14, lineHeight: 1.6, maxWidth: '85%',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {ex.prompt}
                    </div>
                  </div>
                  {/* Claude bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      padding: '12px 18px', borderRadius: '16px 16px 16px 4px',
                      fontSize: 14, lineHeight: 1.6, maxWidth: '85%',
                    }}>
                      <div style={{ marginBottom: 8 }}>{ex.result}</div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: 'var(--text-muted)', opacity: 0.8,
                      }}>
                        {ex.tools}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
            textAlign: 'center', marginBottom: 48,
          }}>
            0nMCP vs. Typical MCP Servers
          </h2>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Feature</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#a78bfa' }}>0nMCP</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Typical</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 500 }}>{row.feature}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#6EE05A', fontWeight: 600 }}>{row.onmcp}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>{row.typical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── INSTALLATION DETAIL ── */}
        <section id="install" style={{
          padding: '80px 24px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
              textAlign: 'center', marginBottom: 12,
            }}>
              Installation
            </h2>
            <p style={{
              textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16,
              marginBottom: 48,
            }}>
              Three methods, all under 60 seconds.
            </p>

            {/* Step-by-step for Claude Desktop */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#a78bfa' }}>
                <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8 }}>01</span>
                Claude Desktop
              </h3>
              <ol style={{ padding: '0 0 0 20px', margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  Open Claude Desktop settings (gear icon) or navigate to the config file directly:
                  <br />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                    macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
                  </span>
                  <br />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                    Windows: %APPDATA%\Claude\claude_desktop_config.json
                  </span>
                </li>
                <li style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  Add the 0nMCP server config:
                  <pre style={{
                    background: '#0d0d1a', borderRadius: 8, padding: 16, marginTop: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6, color: '#e0e0e0', overflow: 'auto',
                  }}>{`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`}</pre>
                </li>
                <li style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                  Restart Claude Desktop. You will see 0nMCP in the MCP server list with 1,554 tools available.
                </li>
              </ol>
            </div>

            {/* Claude Code */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#a78bfa' }}>
                <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8 }}>02</span>
                Claude Code
              </h3>
              <pre style={{
                background: '#0d0d1a', borderRadius: 8, padding: 20,
                fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6, color: '#e0e0e0', overflow: 'auto',
              }}>{`claude mcp add 0nmcp -- npx -y 0nmcp`}</pre>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
                That is it. 0nMCP is now available in every Claude Code session.
              </p>
            </div>

            {/* Turn it 0n */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#6EE05A' }}>
                <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8 }}>03</span>
                Turn it 0n -- Import Credentials
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.7 }}>
                After installing, import your API keys to unlock all 96 services:
              </p>
              <pre style={{
                background: '#0d0d1a', borderRadius: 8, padding: 20,
                fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8, color: '#e0e0e0', overflow: 'auto',
              }}>{`# Import credentials from .env files
0nmcp engine import

# Verify all API keys work
0nmcp engine verify

# Generate Claude Desktop config with your services
0nmcp engine platforms`}</pre>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
                Credentials are stored in <span style={{ fontFamily: 'var(--font-mono)' }}>~/.0n/connections/</span> and encrypted with AES-256-GCM via the 0nVault.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
            textAlign: 'center', marginBottom: 48,
          }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {FAQ.map((item) => (
              <div key={item.q} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '24px 28px',
              }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, margin: '0 0 10px' }}>{item.q}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0, lineHeight: 1.7 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={{
          padding: '80px 24px',
          background: 'linear-gradient(180deg, var(--bg-primary) 0%, #0d0d1a 100%)',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 800, marginBottom: 16, lineHeight: 1.2,
            }}>
              The most comprehensive MCP server.
              <br />
              <span style={{ color: '#6EE05A' }}>Free and open source.</span>
            </h2>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36, lineHeight: 1.6,
            }}>
              1,554 tools across 96 services. MIT licensed. Add it to Claude in under 60 seconds.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
              <a href="#install" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 8,
                background: '#a78bfa', color: '#fff',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                textDecoration: 'none',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add to Claude
              </a>
              <a href="https://www.npmjs.com/package/0nmcp" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
                textDecoration: 'none',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View on npm
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
