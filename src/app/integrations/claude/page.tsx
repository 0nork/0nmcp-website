import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nMCP for Claude — Universal MCP Server for Claude Desktop & Claude Code | 0nMCP',
  description: 'Add 0nMCP to Claude Desktop or Claude Code and unlock 1,640+ tools across 111 services. CRM, Stripe, Slack, GitHub, and 107 more. The most comprehensive MCP server available.',
  keywords: ['0nMCP', 'Claude', 'Anthropic', 'MCP server', 'Claude Desktop', 'Claude Code', 'AI tools', 'workflow automation'],
  openGraph: {
    title: '0nMCP for Claude',
    description: '1,640+ tools across 111 services. The most comprehensive MCP server.',
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
      description: 'Universal MCP server with 1,640+ tools across 111 services. Works with Claude Desktop, Claude Code, and any MCP-compatible client.',
      url: 'https://0nmcp.com',
      downloadUrl: 'https://www.npmjs.com/package/0nmcp',
      softwareVersion: '2.9.0',
      author: { '@type': 'Organization', name: '0nORK', url: 'https://0nmcp.com' },
      license: 'https://opensource.org/licenses/MIT',
    },
  ],
}

const STATS = [
  { value: '1,640+', label: 'Tools' },
  { value: '111', label: 'Services' },
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
    desc: 'Chain tools in a single conversation: search contact, create opportunity, send email, post to Slack. Claude orchestrates multi-step operations across any combination of 111 services.',
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
  { feature: 'Tools', onmcp: '1,640+', typical: '5-20' },
  { feature: 'Services', onmcp: '111', typical: '1-3' },
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
    a: 'Yes. 0nMCP is MIT licensed and free forever. The core server with all 1,640+ tools costs nothing. Premium features like hosted execution and the marketplace unlock at growth milestones.',
  },
  {
    q: 'Does it work with Claude Code?',
    a: 'Yes. Run claude mcp add 0nmcp -- npx -y 0nmcp and you are connected. Claude Code can call all 1,640+ tools directly from your terminal.',
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

      <main className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen">

        {/* ── HERO ── */}
        <section className="bg-gradient-to-b from-[#0d0d1a] to-[var(--bg-primary)] px-6 pt-20 pb-16 text-center">
          <div className="max-w-[900px] mx-auto">
            {/* Anthropic + 0nMCP lockup */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {/* Claude logo mark */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#a78bfa" fillOpacity="0.15" />
                <path d="M24 10c-7.73 0-14 6.27-14 14s6.27 14 14 14 14-6.27 14-14S31.73 10 24 10zm0 4a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-2 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2 6c-2.21 0-4-1.12-4-2.5h8c0 1.38-1.79 2.5-4 2.5z" fill="#a78bfa" />
              </svg>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {/* 0nMCP mark */}
              <div className="w-12 h-12 rounded-xl bg-[#6EE05A]/15 flex items-center justify-center font-mono font-bold text-sm text-[#6EE05A]">0n</div>
            </div>

            <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-tight tracking-tight mb-5">
              0nMCP for <span className="text-[#a78bfa]">Claude</span>
            </h1>
            <p className="font-display text-[clamp(18px,2.5vw,24px)] text-[var(--text-secondary)] mb-10 leading-relaxed">
              1,640+ tools. 111 services. The most comprehensive MCP server ever built.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-0 mb-10 border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
              {STATS.map((s, i) => (
                <div key={s.label} className={`px-7 py-4 flex-auto min-w-[100px] ${i < STATS.length - 1 ? 'border-r border-[var(--border)]' : ''}`}>
                  <div className="font-mono text-[22px] font-bold text-[#a78bfa]">{s.value}</div>
                  <div className="text-[13px] text-[var(--text-muted)] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#install" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#a78bfa] text-white font-display font-bold text-base no-underline transition-all hover:-translate-y-px hover:shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add to Claude Desktop
              </a>
              <div className="inline-flex items-center px-7 py-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] font-mono text-[15px] text-[#6EE05A] select-all cursor-text">
                npm install -g 0nmcp
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="px-6 py-20 max-w-[1100px] mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Three Ways to Connect
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            {/* Method 1: Claude Desktop */}
            <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#a78bfa] to-[#00d4ff]" />
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#a78bfa]/12 text-[#a78bfa] font-bold text-base mb-4">1</div>
              <h3 className="font-display text-xl font-bold mb-2">Claude Desktop</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-5 leading-relaxed">
                Add this to your <span className="font-mono text-[13px] text-[#a78bfa]">claude_desktop_config.json</span>. Done.
              </p>
              <pre className="bg-[#0d0d1a] rounded-lg p-5 font-mono text-[13px] leading-relaxed text-[#e0e0e0] overflow-auto m-0">{`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`}</pre>
            </div>

            {/* Method 2: Claude Code */}
            <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#a78bfa] to-[#6EE05A]" />
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#a78bfa]/12 text-[#a78bfa] font-bold text-base mb-4">2</div>
              <h3 className="font-display text-xl font-bold mb-2">Claude Code</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-5 leading-relaxed">
                One command. Instant connection.
              </p>
              <pre className="bg-[#0d0d1a] rounded-lg p-5 font-mono text-[13px] leading-relaxed text-[#e0e0e0] overflow-auto m-0">{`claude mcp add 0nmcp -- npx -y 0nmcp`}</pre>
            </div>

            {/* Method 3: npm Global */}
            <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#6EE05A] to-[#00d4ff]" />
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#6EE05A]/12 text-[#6EE05A] font-bold text-base mb-4">3</div>
              <h3 className="font-display text-xl font-bold mb-2">npm Global Install</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-5 leading-relaxed">
                Install globally. Run as stdio MCP server.
              </p>
              <pre className="bg-[#0d0d1a] rounded-lg p-5 font-mono text-[13px] leading-relaxed text-[#e0e0e0] overflow-auto m-0">{`npm install -g 0nmcp
0nmcp`}</pre>
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section className="px-6 py-20 bg-[var(--bg-card)] border-t border-b border-[var(--border)]">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-3">What You Get</h2>
            <p className="text-center text-[var(--text-secondary)] text-base mb-12 max-w-[600px] mx-auto">
              111 services organized into 22 categories. Every tool available to Claude instantly.
            </p>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-6 py-5" style={{ borderLeft: `3px solid ${cat.color}` }}>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-display text-base font-bold m-0">{cat.name}</h3>
                    <span className="font-mono text-[13px] font-semibold" style={{ color: cat.color }}>{cat.tools}</span>
                  </div>
                  <p className="text-[var(--text-muted)] text-[13px] m-0 leading-relaxed">{cat.services}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-[var(--text-muted)] text-sm mt-6">
              Plus 85+ more services across file storage, project management, advertising, DNS, and more.
            </p>
          </div>
        </section>

        {/* ── CLAUDE-SPECIFIC SUPERPOWERS ── */}
        <section className="px-6 py-20 max-w-[1100px] mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Claude-Specific Superpowers
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {SUPERPOWERS.map((sp) => (
              <div key={sp.title} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8">
                <div className="mb-4">{sp.icon}</div>
                <h3 className="font-display text-lg font-bold mb-3">{sp.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm m-0 leading-[1.7]">{sp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── REAL EXAMPLES ── */}
        <section className="px-6 py-20 bg-[var(--bg-card)] border-t border-b border-[var(--border)]">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-3">Real Conversations</h2>
            <p className="text-center text-[var(--text-secondary)] text-base mb-12">
              What it actually looks like when Claude has 0nMCP.
            </p>

            <div className="flex flex-col gap-8">
              {EXAMPLES.map((ex, i) => (
                <div key={i} className="flex flex-col gap-3">
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="bg-[#a78bfa] text-white px-[18px] py-3 rounded-[16px_16px_4px_16px] text-sm leading-relaxed max-w-[85%] font-display">
                      {ex.prompt}
                    </div>
                  </div>
                  {/* Claude bubble */}
                  <div className="flex justify-start">
                    <div className="bg-[var(--bg-primary)] border border-[var(--border)] px-[18px] py-3 rounded-[16px_16px_16px_4px] text-sm leading-relaxed max-w-[85%]">
                      <div className="mb-2">{ex.result}</div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)] opacity-80">
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
        <section className="px-6 py-20 max-w-[800px] mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            0nMCP vs. Typical MCP Servers
          </h2>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-3.5 text-left font-display text-sm font-semibold text-[var(--text-muted)]">Feature</th>
                  <th className="px-5 py-3.5 text-center font-display text-sm font-bold text-[#a78bfa]">0nMCP</th>
                  <th className="px-5 py-3.5 text-center font-display text-sm font-semibold text-[var(--text-muted)]">Typical</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARISON.length - 1 ? 'border-b border-[var(--border)]' : ''}>
                    <td className="px-5 py-3 text-sm font-medium">{row.feature}</td>
                    <td className="px-5 py-3 text-center font-mono text-sm text-[#6EE05A] font-semibold">{row.onmcp}</td>
                    <td className="px-5 py-3 text-center text-sm text-[var(--text-muted)]">{row.typical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── INSTALLATION DETAIL ── */}
        <section id="install" className="px-6 py-20 bg-[var(--bg-card)] border-t border-b border-[var(--border)]">
          <div className="max-w-[800px] mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-3">Installation</h2>
            <p className="text-center text-[var(--text-secondary)] text-base mb-12">
              Three methods, all under 60 seconds.
            </p>

            {/* Step-by-step for Claude Desktop */}
            <div className="mb-12">
              <h3 className="font-display text-xl font-bold mb-5 text-[#a78bfa]">
                <span className="font-mono mr-2">01</span>
                Claude Desktop
              </h3>
              <ol className="pl-5 m-0 flex flex-col gap-3">
                <li className="text-[var(--text-secondary)] text-sm leading-[1.7]">
                  Open Claude Desktop settings (gear icon) or navigate to the config file directly:
                  <br />
                  <span className="font-mono text-xs text-[var(--text-muted)]">macOS: ~/Library/Application Support/Claude/claude_desktop_config.json</span>
                  <br />
                  <span className="font-mono text-xs text-[var(--text-muted)]">Windows: %APPDATA%\Claude\claude_desktop_config.json</span>
                </li>
                <li className="text-[var(--text-secondary)] text-sm leading-[1.7]">
                  Add the 0nMCP server config:
                  <pre className="bg-[#0d0d1a] rounded-lg p-4 mt-2 font-mono text-[13px] leading-relaxed text-[#e0e0e0] overflow-auto">{`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`}</pre>
                </li>
                <li className="text-[var(--text-secondary)] text-sm leading-[1.7]">
                  Restart Claude Desktop. You will see 0nMCP in the MCP server list with 1,640+ tools available.
                </li>
              </ol>
            </div>

            {/* Claude Code */}
            <div className="mb-12">
              <h3 className="font-display text-xl font-bold mb-5 text-[#a78bfa]">
                <span className="font-mono mr-2">02</span>
                Claude Code
              </h3>
              <pre className="bg-[#0d0d1a] rounded-lg p-5 font-mono text-[13px] leading-relaxed text-[#e0e0e0] overflow-auto">{`claude mcp add 0nmcp -- npx -y 0nmcp`}</pre>
              <p className="text-[var(--text-muted)] text-[13px] mt-2">
                That is it. 0nMCP is now available in every Claude Code session.
              </p>
            </div>

            {/* Turn it 0n */}
            <div>
              <h3 className="font-display text-xl font-bold mb-5 text-[#6EE05A]">
                <span className="font-mono mr-2">03</span>
                Turn it 0n -- Import Credentials
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4 leading-[1.7]">
                After installing, import your API keys to unlock all 111 services:
              </p>
              <pre className="bg-[#0d0d1a] rounded-lg p-5 font-mono text-[13px] leading-[1.8] text-[#e0e0e0] overflow-auto">{`# Import credentials from .env files
0nmcp engine import

# Verify all API keys work
0nmcp engine verify

# Generate Claude Desktop config with your services
0nmcp engine platforms`}</pre>
              <p className="text-[var(--text-muted)] text-[13px] mt-3">
                Credentials are stored in <span className="font-mono">~/.0n/connections/</span> and encrypted with AES-256-GCM via the 0nVault.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 py-20 max-w-[800px] mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="flex flex-col gap-6">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-7 py-6">
                <h3 className="font-display text-base font-bold mb-2.5">{item.q}</h3>
                <p className="text-[var(--text-secondary)] text-sm m-0 leading-[1.7]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-6 py-20 bg-gradient-to-b from-[var(--bg-primary)] to-[#0d0d1a] text-center border-t border-[var(--border)]">
          <div className="max-w-[600px] mx-auto">
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-extrabold mb-4 leading-tight">
              The most comprehensive MCP server.
              <br />
              <span className="text-[#6EE05A]">Free and open source.</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-base mb-9 leading-relaxed">
              1,640+ tools across 111 services. MIT licensed. Add it to Claude in under 60 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#install" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#a78bfa] text-white font-display font-bold text-base no-underline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add to Claude
              </a>
              <a href="https://www.npmjs.com/package/0nmcp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-transparent border border-[var(--border)] text-[var(--text-primary)] font-display font-semibold text-base no-underline">
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
