import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nMCP Commands — Universal Command Set for AI Orchestration',
  description:
    'One command set that works everywhere — Console, CLI, Telegram Bot, Chat, and API. 30+ commands across 96 services. Free and open source.',
  keywords: [
    '0nMCP commands',
    'AI orchestration commands',
    'universal command set',
    'MCP commands',
    'AI CLI commands',
    'workflow automation commands',
    'CRM commands',
    'AI assistant commands',
  ],
  openGraph: {
    title: '0nMCP Commands',
    description: 'Universal commands for AI orchestration. Works on every surface.',
    url: 'https://www.0nmcp.com/commands',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP Commands — Universal Command Set',
    description: 'One command set. Every surface. Console, CLI, Bot, Chat, API.',
  },
  alternates: { canonical: 'https://www.0nmcp.com/commands' },
}

// ─── Types ─────────────────────────────────────────────────────
interface Command {
  command: string
  name: string
  description: string
  category: string
  surfaces: string[]
  requiredAddon?: string
  addonPrice?: string
}

interface Category {
  id: string
  label: string
  icon: string
  color: string
}

// ─── Surface definitions ───────────────────────────────────────
const SURFACES = ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP', 'Webhook', 'Cron']

const SURFACE_COLORS: Record<string, string> = {
  Console: '#6EE05A',
  CLI: '#00d4ff',
  Bot: '#a78bfa',
  Chat: '#f59e0b',
  API: '#3b82f6',
  MCP: '#ec4899',
  Webhook: '#f97316',
  Cron: '#14b8a6',
}

// ─── Categories ────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { id: 'core', label: 'Core', icon: 'terminal', color: '#6EE05A' },
  { id: 'workflows', label: 'Workflows', icon: 'flow', color: '#00d4ff' },
  { id: 'ai', label: 'AI', icon: 'brain', color: '#a78bfa' },
  { id: 'crm', label: 'CRM', icon: 'users', color: '#f59e0b' },
  { id: 'services', label: 'Services', icon: 'plug', color: '#3b82f6' },
  { id: 'content', label: 'Content', icon: 'pencil', color: '#ec4899' },
  { id: 'premium', label: 'Premium Add-ons', icon: 'sparkle', color: '#a78bfa' },
]

// ─── Commands data ─────────────────────────────────────────────
const COMMANDS: Command[] = [
  // Core
  { command: '/start', name: 'Start', description: 'Initialize your 0nMCP session and load your profile.', category: 'core', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API'] },
  { command: '/help', name: 'Help', description: 'Display available commands, usage guides, and documentation links.', category: 'core', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API'] },
  { command: '/status', name: 'Status', description: 'Show current session status, connected services, and system health.', category: 'core', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },
  { command: '/login', name: 'Login', description: 'Authenticate with your 0nMCP account or API key.', category: 'core', surfaces: ['Console', 'CLI', 'Bot', 'Chat'] },
  { command: '/logout', name: 'Logout', description: 'End your current session and clear cached credentials.', category: 'core', surfaces: ['Console', 'CLI', 'Bot', 'Chat'] },
  { command: '/whoami', name: 'Who Am I', description: 'Display your account details, plan, and connected services.', category: 'core', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },
  { command: '/commands', name: 'Commands', description: 'List all available commands with descriptions and surface compatibility.', category: 'core', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API'] },
  { command: '/settings', name: 'Settings', description: 'View and modify your preferences, notifications, and defaults.', category: 'core', surfaces: ['Console', 'CLI', 'Chat'] },

  // Workflows
  { command: '/run', name: 'Run', description: 'Execute a workflow by name or ID. Supports parameters and dry-run mode.', category: 'workflows', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP', 'Webhook', 'Cron'] },
  { command: '/workflows', name: 'Workflows', description: 'List, search, and manage your saved workflows and RUNs.', category: 'workflows', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },
  { command: '/create', name: 'Create', description: 'Create a new workflow from a template or natural language description.', category: 'workflows', surfaces: ['Console', 'CLI', 'Chat', 'API'] },
  { command: '/schedule', name: 'Schedule', description: 'Schedule a workflow to run on a cron expression or at a specific time.', category: 'workflows', surfaces: ['Console', 'CLI', 'Chat', 'API', 'Cron'] },

  // AI
  { command: '/ask', name: 'Ask', description: 'Ask a question and get an AI-powered answer with context from your data.', category: 'ai', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },
  { command: '/council', name: 'Council', description: 'Invoke the Multi-AI Council for consensus-driven decisions across models.', category: 'ai', surfaces: ['Console', 'CLI', 'Chat', 'API'] },
  { command: '/chat', name: 'Chat', description: 'Start an interactive AI chat session with full tool access.', category: 'ai', surfaces: ['Console', 'CLI', 'Bot', 'Chat'] },
  { command: '/brain', name: 'Brain', description: 'Access and manage your AI Brain — memory, context, and learned preferences.', category: 'ai', surfaces: ['Console', 'CLI', 'Chat', 'API', 'MCP'] },

  // CRM
  { command: '/contacts', name: 'Contacts', description: 'Search, create, update, and manage CRM contacts and their properties.', category: 'crm', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },
  { command: '/pipeline', name: 'Pipeline', description: 'View and manage sales pipelines, opportunities, and deal stages.', category: 'crm', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },
  { command: '/calendar', name: 'Calendar', description: 'Manage calendars, appointments, availability, and booking links.', category: 'crm', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },
  { command: '/conversations', name: 'Conversations', description: 'Access SMS, email, and chat conversations with contacts.', category: 'crm', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },

  // Services
  { command: '/connect', name: 'Connect', description: 'Connect a new service by providing API credentials or OAuth flow.', category: 'services', surfaces: ['Console', 'CLI', 'Chat'] },
  { command: '/vault', name: 'Vault', description: 'Manage encrypted credential storage with AES-256-GCM vault.', category: 'services', surfaces: ['Console', 'CLI', 'Chat', 'API', 'MCP'] },
  { command: '/balance', name: 'Balance', description: 'Check API credit balances and usage across connected services.', category: 'services', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API'] },
  { command: '/integrations', name: 'Integrations', description: 'List all available integrations and their connection status.', category: 'services', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API', 'MCP'] },

  // Content
  { command: '/blog', name: 'Blog', description: 'Generate, schedule, and publish blog posts across connected platforms.', category: 'content', surfaces: ['Console', 'CLI', 'Chat', 'API'] },
  { command: '/social', name: 'Social', description: 'Create and schedule social media posts across all connected channels.', category: 'content', surfaces: ['Console', 'CLI', 'Bot', 'Chat', 'API'] },
  { command: '/sxo', name: 'SXO', description: 'Run Search Experience Optimization scans and generate improvement reports.', category: 'content', surfaces: ['Console', 'CLI', 'Chat', 'API'] },

  // Premium Add-ons
  { command: '/generate-course', name: 'Course Generator', description: 'Generate full online courses with modules, lessons, quizzes, and certificates.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat'], requiredAddon: 'Course Generator', addonPrice: '$29/mo' },
  { command: '/onpress', name: 'OnPress', description: 'WordPress management — themes, plugins, content, security, and deployments.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat', 'API'], requiredAddon: 'OnPress', addonPrice: '$19/mo' },
  { command: '/mail-sequences', name: 'Mail Sequences', description: 'Build and deploy automated email sequences with AI-written copy.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat', 'API', 'Cron'], requiredAddon: 'Mail Sequences', addonPrice: '$39/mo' },
  { command: '/facebook-ads', name: 'Facebook Ads', description: 'Create, manage, and optimize Facebook ad campaigns with AI targeting.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat', 'API'], requiredAddon: 'Facebook Ads', addonPrice: '$49/mo' },
  { command: '/linkedin-outreach', name: 'LinkedIn Outreach', description: 'Automated LinkedIn connection requests, messages, and follow-up sequences.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat', 'API', 'Cron'], requiredAddon: 'LinkedIn Outreach', addonPrice: '$29/mo' },
  { command: '/site-builder', name: 'Site Builder', description: 'Generate and deploy full websites from natural language descriptions.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat'], requiredAddon: 'Site Builder', addonPrice: '$19/mo' },
  { command: '/security-scan', name: 'Security Scan', description: 'Run comprehensive security audits on your connected services and APIs.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat', 'API', 'MCP'], requiredAddon: 'Security Scan', addonPrice: '$9/mo' },
  { command: '/intel', name: 'Intel', description: 'Competitive intelligence — monitor competitors, track changes, get alerts.', category: 'premium', surfaces: ['Console', 'CLI', 'Chat', 'API', 'Cron'], requiredAddon: 'Intel', addonPrice: '$19/mo' },
]

const FREE_COMMANDS = COMMANDS.filter((c) => !c.requiredAddon)
const PREMIUM_COMMANDS = COMMANDS.filter((c) => c.requiredAddon)

// ─── SVG Icons (inline) ────────────────────────────────────────
function CategoryIcon({ type, size = 20 }: { type: string; size?: number }) {
  const s = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'terminal':
      return <svg viewBox="0 0 24 24" {...s}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
    case 'flow':
      return <svg viewBox="0 0 24 24" {...s}><circle cx="5" cy="6" r="2" /><circle cx="19" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><path d="M5 8v2a4 4 0 004 4h2" /><path d="M19 8v2a4 4 0 01-4 4h-2" /></svg>
    case 'brain':
      return <svg viewBox="0 0 24 24" {...s}><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><line x1="9" y1="21" x2="15" y2="21" /><line x1="10" y1="23" x2="14" y2="23" /></svg>
    case 'users':
      return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
    case 'plug':
      return <svg viewBox="0 0 24 24" {...s}><path d="M12 22v-5" /><path d="M9 8V1" /><path d="M15 8V1" /><path d="M18 8H6a2 2 0 00-2 2v2a8 8 0 008 8 8 8 0 008-8v-2a2 2 0 00-2-2z" /></svg>
    case 'pencil':
      return <svg viewBox="0 0 24 24" {...s}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    case 'sparkle':
      return <svg viewBox="0 0 24 24" {...s}><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" /></svg>
    case 'lock':
      return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
    default:
      return null
  }
}

// ─── Structured Data ───────────────────────────────────────────
function StructuredData() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Commands', item: 'https://www.0nmcp.com/commands' },
    ],
  }
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '0nMCP Universal Commands',
    description: `${COMMANDS.length} commands for AI orchestration across ${SURFACES.length} surfaces.`,
    url: 'https://www.0nmcp.com/commands',
    numberOfItems: COMMANDS.length,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
    </>
  )
}

// ─── Page Component ────────────────────────────────────────────
export default function CommandsPage() {
  const freeCategories = CATEGORIES.filter((c) => c.id !== 'premium')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "var(--font-display, 'Instrument Sans', system-ui, sans-serif)" }}>
      <StructuredData />

      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
        {/* Background glow */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(110, 224, 90, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Breadcrumb */}
          <nav style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#6EE05A' }}>Commands</span>
          </nav>

          <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Universal{' '}
            <span style={{ background: 'linear-gradient(135deg, #6EE05A, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Commands
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            One command set. Every surface. Console, CLI, Bot, Chat, API — your commands work everywhere.
          </p>

          {/* Stats bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { value: String(COMMANDS.length), label: 'commands' },
              { value: String(SURFACES.length), label: 'surfaces' },
              { value: '96', label: 'services' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6EE05A', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/signup"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', background: '#6EE05A', color: '#0a0a0a', fontWeight: 700, fontSize: '0.9375rem', borderRadius: 8, textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s' }}
          >
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      {/* ═══ SURFACE LEGEND ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.625rem' }}>
          {SURFACES.map((surface) => (
            <div
              key={surface}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.375rem 0.75rem',
                borderRadius: 6,
                border: `1px solid ${SURFACE_COLORS[surface]}33`,
                background: `${SURFACE_COLORS[surface]}0D`,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: SURFACE_COLORS[surface],
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: SURFACE_COLORS[surface] }} />
              {surface}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FREE COMMAND CATEGORIES ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {freeCategories.map((cat) => {
          const catCommands = FREE_COMMANDS.filter((c) => c.category === cat.id)
          if (catCommands.length === 0) return null
          return (
            <div key={cat.id} style={{ marginBottom: '3rem' }}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ color: cat.color, display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon type={cat.icon} size={22} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {cat.label}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
                  {catCommands.length} commands
                </span>
              </div>

              {/* Command cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
                {catCommands.map((cmd) => (
                  <div
                    key={cmd.command}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                  >
                    {/* Top row: command + name */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <code style={{
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: '#6EE05A',
                        background: 'rgba(110, 224, 90, 0.08)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: 6,
                      }}>
                        {cmd.command}
                      </code>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {cmd.name}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      {cmd.description}
                    </p>

                    {/* Surface badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
                      {cmd.surfaces.map((surface) => (
                        <span
                          key={surface}
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                            padding: '0.125rem 0.375rem',
                            borderRadius: 4,
                            color: SURFACE_COLORS[surface] || 'var(--text-muted)',
                            background: `${SURFACE_COLORS[surface] || '#666'}14`,
                            border: `1px solid ${SURFACE_COLORS[surface] || '#666'}33`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {surface}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* ═══ PREMIUM ADD-ONS ═══ */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
          <div style={{ color: '#a78bfa', display: 'flex', alignItems: 'center' }}>
            <CategoryIcon type="sparkle" size={22} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Premium Add-ons
          </h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 600 }}>
          Specialized command modules that extend your 0nMCP console with industry-specific capabilities.
        </p>

        {/* Premium grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {PREMIUM_COMMANDS.map((cmd) => (
            <div
              key={cmd.command}
              style={{
                position: 'relative',
                background: 'var(--bg-card)',
                borderRadius: 12,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                border: '1px solid transparent',
                backgroundImage: 'linear-gradient(var(--bg-card), var(--bg-card)), linear-gradient(135deg, rgba(167, 139, 250, 0.4), rgba(0, 212, 255, 0.2), rgba(167, 139, 250, 0.4))',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              {/* Price badge */}
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: 6, padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
                {cmd.addonPrice}
              </div>

              {/* Command + lock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                  <CategoryIcon type="lock" size={14} />
                </span>
                <code style={{
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                  background: 'rgba(167, 139, 250, 0.08)',
                  padding: '0.25rem 0.625rem',
                  borderRadius: 6,
                }}>
                  {cmd.command}
                </code>
              </div>

              {/* Name */}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {cmd.name}
              </h3>

              {/* Description */}
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {cmd.description}
              </p>

              {/* Surface badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {cmd.surfaces.map((surface) => (
                  <span
                    key={surface}
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                      padding: '0.125rem 0.375rem',
                      borderRadius: 4,
                      color: SURFACE_COLORS[surface] || 'var(--text-muted)',
                      background: `${SURFACE_COLORS[surface] || '#666'}14`,
                      border: `1px solid ${SURFACE_COLORS[surface] || '#666'}33`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {surface}
                  </span>
                ))}
              </div>

              {/* Upgrade button */}
              <Link
                href="/console/marketplace"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 'auto',
                  padding: '0.5rem 1rem',
                  background: 'rgba(167, 139, 250, 0.12)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  borderRadius: 8,
                  color: '#a78bfa',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                Add to Console
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{
        borderTop: '1px solid var(--border)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '-30%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(110, 224, 90, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Ready to command{' '}
            <span style={{ background: 'linear-gradient(135deg, #6EE05A, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              your stack?
            </span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            {COMMANDS.length} commands. {SURFACES.length} surfaces. 96 services. One interface.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.875rem 2.5rem',
                background: '#6EE05A',
                color: '#0a0a0a',
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
            </Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#6EE05A', textDecoration: 'none', fontWeight: 600 }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
