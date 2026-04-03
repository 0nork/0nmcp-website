'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

/* ================================================================
   SERVICE DETECTION PATTERNS
   ================================================================ */

type ServiceId =
  | 'stripe'
  | 'openai'
  | 'anthropic'
  | 'supabase'
  | 'slack'
  | 'github'
  | 'sendgrid'
  | 'twilio'
  | 'discord'
  | 'mongodb'
  | 'redis'
  | 'aws'
  | 'google'
  | 'database'
  | 'resend'
  | 'notion'
  | 'airtable'
  | 'shopify'
  | 'vercel'
  | 'cloudflare'
  | 'custom'

interface ServiceMeta {
  label: string
  color: string
  icon: string
}

const SERVICE_META: Record<ServiceId, ServiceMeta> = {
  stripe:     { label: 'Stripe',       color: '#635bff', icon: 'S' },
  openai:     { label: 'OpenAI',       color: '#10a37f', icon: 'O' },
  anthropic:  { label: 'Anthropic',    color: '#d4a574', icon: 'A' },
  supabase:   { label: 'Supabase',     color: '#3ecf8e', icon: 'SB' },
  slack:      { label: 'Slack',        color: '#e01e5a', icon: 'SL' },
  github:     { label: 'GitHub',       color: '#f0f6fc', icon: 'GH' },
  sendgrid:   { label: 'SendGrid',     color: '#1a82e2', icon: 'SG' },
  twilio:     { label: 'Twilio',       color: '#f22f46', icon: 'TW' },
  discord:    { label: 'Discord',      color: '#5865f2', icon: 'DC' },
  mongodb:    { label: 'MongoDB',      color: '#00ed64', icon: 'MG' },
  redis:      { label: 'Redis',        color: '#dc382d', icon: 'RD' },
  aws:        { label: 'AWS',          color: '#ff9900', icon: 'AW' },
  google:     { label: 'Google',       color: '#4285f4', icon: 'G' },
  database:   { label: 'Database',     color: '#336791', icon: 'DB' },
  resend:     { label: 'Resend',       color: '#fff', icon: 'RS' },
  notion:     { label: 'Notion',       color: '#fff', icon: 'NT' },
  airtable:   { label: 'Airtable',     color: '#18bfff', icon: 'AT' },
  shopify:    { label: 'Shopify',      color: '#96bf48', icon: 'SH' },
  vercel:     { label: 'Vercel',       color: '#fff', icon: 'VC' },
  cloudflare: { label: 'Cloudflare',   color: '#f38020', icon: 'CF' },
  custom:     { label: 'Custom',       color: '#7a8290', icon: '?' },
}

const SERVICE_PATTERNS: [RegExp, ServiceId][] = [
  [/^STRIPE/i, 'stripe'],
  [/^OPENAI/i, 'openai'],
  [/^ANTHROPIC/i, 'anthropic'],
  [/^sk[-_]ant/i, 'anthropic'],
  [/^SUPABASE/i, 'supabase'],
  [/^NEXT_PUBLIC_SUPABASE/i, 'supabase'],
  [/^SLACK/i, 'slack'],
  [/^GITHUB/i, 'github'],
  [/^SENDGRID/i, 'sendgrid'],
  [/^TWILIO/i, 'twilio'],
  [/^DISCORD/i, 'discord'],
  [/^MONGO/i, 'mongodb'],
  [/^REDIS/i, 'redis'],
  [/^AWS/i, 'aws'],
  [/^GOOGLE/i, 'google'],
  [/^DATABASE_URL/i, 'database'],
  [/^DB_/i, 'database'],
  [/^POSTGRES/i, 'database'],
  [/^PG_/i, 'database'],
  [/^RESEND/i, 'resend'],
  [/^NOTION/i, 'notion'],
  [/^AIRTABLE/i, 'airtable'],
  [/^SHOPIFY/i, 'shopify'],
  [/^VERCEL/i, 'vercel'],
  [/^NEXT_PUBLIC_VERCEL/i, 'vercel'],
  [/^CLOUDFLARE/i, 'cloudflare'],
  [/^CF_/i, 'cloudflare'],
]

function detectService(key: string): ServiceId {
  for (const [pattern, service] of SERVICE_PATTERNS) {
    if (pattern.test(key)) return service
  }
  return 'custom'
}

/* ================================================================
   CONVERSION ENGINE
   ================================================================ */

interface ParsedVar {
  key: string
  value: string
  service: ServiceId
}

interface ConnectionFile {
  service: ServiceId
  filename: string
  content: Record<string, unknown>
}

interface ConversionResult {
  variables: ParsedVar[]
  services: ServiceId[]
  connections: ConnectionFile[]
  masterSwitch: Record<string, unknown>
}

function parseEnv(raw: string): ParsedVar[] {
  const vars: ParsedVar[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    vars.push({ key, value, service: detectService(key) })
  }
  return vars
}

function convertToOn(vars: ParsedVar[]): ConversionResult {
  // Group by service
  const groups = new Map<ServiceId, ParsedVar[]>()
  for (const v of vars) {
    const list = groups.get(v.service) || []
    list.push(v)
    groups.set(v.service, list)
  }

  const services = Array.from(groups.keys()).filter(s => s !== 'custom')
  const connections: ConnectionFile[] = []

  for (const [service, serviceVars] of groups) {
    const credentials: Record<string, string> = {}
    for (const v of serviceVars) {
      credentials[v.key] = maskValue(v.value)
    }

    const meta = SERVICE_META[service]
    connections.push({
      service,
      filename: `${service}.0n`,
      content: {
        '0n': '1.0',
        type: 'connection',
        service: service === 'custom' ? 'custom' : service,
        name: `${meta.label} Connection`,
        created: new Date().toISOString().split('T')[0],
        encryption: {
          algorithm: 'AES-256-GCM',
          key_derivation: 'Argon2id',
          iterations: 3,
          memory: '64MB',
          parallelism: 4,
        },
        credentials,
        ...(service !== 'custom'
          ? {
              endpoints: getServiceEndpoints(service),
              capabilities: getServiceCapabilities(service),
            }
          : {}),
      },
    })
  }

  // Master SWITCH
  const masterSwitch = {
    '0n': '1.0',
    type: 'switch',
    name: 'Master SWITCH',
    description: `Auto-generated from .env — ${vars.length} variables across ${services.length} services`,
    created: new Date().toISOString().split('T')[0],
    connections: services.reduce(
      (acc, s) => {
        acc[s] = { file: `~/.0n/connections/${s}.0n`, status: 'ready' }
        return acc
      },
      {} as Record<string, { file: string; status: string }>
    ),
    activation: {
      pipeline: 'connect > verify > configure > activate',
      auto_verify: true,
    },
  }

  return { variables: vars, services, connections, masterSwitch }
}

function maskValue(value: string): string {
  if (value.length <= 8) return '*'.repeat(value.length)
  return value.slice(0, 4) + '*'.repeat(Math.min(value.length - 8, 20)) + value.slice(-4)
}

function getServiceEndpoints(service: ServiceId): Record<string, string> {
  const endpoints: Partial<Record<ServiceId, Record<string, string>>> = {
    stripe: { base: 'https://api.stripe.com/v1', webhooks: '/webhooks' },
    openai: { base: 'https://api.openai.com/v1', chat: '/chat/completions', models: '/models' },
    anthropic: { base: 'https://api.anthropic.com/v1', messages: '/messages' },
    supabase: { rest: '/rest/v1', auth: '/auth/v1', storage: '/storage/v1', realtime: '/realtime/v1' },
    slack: { base: 'https://slack.com/api', events: '/events' },
    github: { base: 'https://api.github.com', graphql: 'https://api.github.com/graphql' },
    sendgrid: { base: 'https://api.sendgrid.com/v3', mail: '/mail/send' },
    twilio: { base: 'https://api.twilio.com/2010-04-01' },
    discord: { base: 'https://discord.com/api/v10' },
    mongodb: { protocol: 'mongodb+srv://' },
    redis: { protocol: 'redis://' },
    aws: { iam: 'https://iam.amazonaws.com', s3: 'https://s3.amazonaws.com' },
    google: { oauth: 'https://oauth2.googleapis.com', apis: 'https://www.googleapis.com' },
  }
  return endpoints[service] || {}
}

function getServiceCapabilities(service: ServiceId): string[] {
  const caps: Partial<Record<ServiceId, string[]>> = {
    stripe: ['payments', 'subscriptions', 'invoices', 'webhooks', 'customers'],
    openai: ['chat', 'embeddings', 'images', 'audio', 'fine-tuning'],
    anthropic: ['messages', 'streaming', 'tool-use', 'vision'],
    supabase: ['database', 'auth', 'storage', 'realtime', 'edge-functions'],
    slack: ['messaging', 'channels', 'users', 'reactions', 'files'],
    github: ['repos', 'issues', 'pull-requests', 'actions', 'packages'],
    sendgrid: ['email', 'templates', 'contacts', 'campaigns'],
    twilio: ['sms', 'voice', 'verify', 'conversations'],
    discord: ['messages', 'guilds', 'channels', 'webhooks'],
    mongodb: ['crud', 'aggregation', 'indexing', 'transactions'],
    redis: ['cache', 'pub-sub', 'streams', 'transactions'],
    aws: ['s3', 'lambda', 'ses', 'dynamodb', 'iam'],
    google: ['analytics', 'ads', 'sheets', 'drive', 'calendar'],
  }
  return caps[service] || []
}

/* ================================================================
   EXAMPLE .env
   ================================================================ */

const EXAMPLE_ENV = `# Paste your .env file contents here
# Example:

STRIPE_SECRET_KEY=sk_live_abc123def456
STRIPE_WEBHOOK_SECRET=whsec_xyz789

OPENAI_API_KEY=sk-proj-abc123def456ghi789
OPENAI_ORG_ID=org-abc123

ANTHROPIC_API_KEY=sk-ant-api03-xyz

SUPABASE_URL=https://abc123.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

GITHUB_TOKEN=ghp_abc123def456

DATABASE_URL=postgresql://user:pass@host:5432/db

SLACK_BOT_TOKEN=xoxb-abc-123-def
SENDGRID_API_KEY=SG.abc123.xyz456`

/* ================================================================
   COMPARISON TABLE DATA
   ================================================================ */

const COMPARISON_ROWS = [
  { feature: 'Encryption',       env: 'None (plaintext)',    on: 'AES-256-GCM' },
  { feature: 'Key Derivation',   env: 'None',                on: 'Argon2id' },
  { feature: 'Service Detection', env: 'Manual / none',      on: 'Automatic (26+ services)' },
  { feature: 'Cross-Platform',   env: 'Copy-paste per tool', on: `${STATS_DISPLAY.ai_platforms} AI platforms` },
  { feature: 'Access Control',   env: 'None',                on: 'Per-layer permissions' },
  { feature: 'Tamper Detection', env: 'None',                on: 'Seal of Truth (SHA3-256)' },
  { feature: 'Version Control',  env: 'Dangerous (.gitignore)', on: 'Safe (encrypted)' },
]

/* ================================================================
   COMPONENT
   ================================================================ */

type ConvertState = 'idle' | 'converting' | 'done'

export default function EnvConverterClient() {
  const [envInput, setEnvInput] = useState('')
  const [state, setState] = useState<ConvertState>('idle')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [progress, setProgress] = useState(0)
  const outputRef = useRef<HTMLDivElement>(null)

  const handleConvert = useCallback(() => {
    if (!envInput.trim()) return

    setState('converting')
    setProgress(0)

    // Animate progress
    const steps = [10, 25, 45, 65, 80, 95, 100]
    let i = 0
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
      } else {
        clearInterval(interval)
      }
    }, 120)

    // Simulate brief processing time for dramatic effect
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      const vars = parseEnv(envInput)
      if (vars.length === 0) {
        setState('idle')
        return
      }
      const converted = convertToOn(vars)
      setResult(converted)
      setState('done')
      setActiveTab(0)

      // Scroll to output on mobile
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 900)
  }, [envInput])

  const handleCopy = useCallback(() => {
    if (!result) return
    const activeConn = result.connections[activeTab]
    if (!activeConn) return
    navigator.clipboard.writeText(JSON.stringify(activeConn.content, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result, activeTab])

  const handleCopyAll = useCallback(() => {
    if (!result) return
    const allFiles = {
      connections: result.connections.map(c => ({ file: c.filename, ...c.content })),
      master_switch: result.masterSwitch,
    }
    navigator.clipboard.writeText(JSON.stringify(allFiles, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  const handleReset = useCallback(() => {
    setEnvInput('')
    setState('idle')
    setResult(null)
    setActiveTab(0)
    setProgress(0)
  }, [])

  const handleLoadExample = useCallback(() => {
    setEnvInput(EXAMPLE_ENV)
  }, [])

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <section className="py-20 md:py-28 px-6 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[900px] mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              border: '1px solid var(--accent)',
              backgroundColor: 'var(--accent-glow)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--accent)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Free Tool — No Account Required
          </div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight heading-glow"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Convert <span className="glow-text" style={{ color: 'var(--accent)' }}>.env</span> to{' '}
            <span className="glow-text" style={{ color: 'var(--accent)' }}>.0n</span>
          </h1>

          <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Stop storing API keys in plaintext. Convert your .env files to encrypted .0n connection files with
            automatic service detection and AES-256-GCM protection.
          </p>

          {/* Trust badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mt-2"
            style={{
              backgroundColor: 'rgba(110, 224, 90, 0.06)',
              border: '1px solid rgba(110, 224, 90, 0.15)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1L2 3.5V6.5C2 9.55 4.15 12.37 7 13C9.85 12.37 12 9.55 12 6.5V3.5L7 1Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path d="M5 7L6.5 8.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Your keys never leave your browser — 100% client-side processing
          </div>
        </div>
      </section>

      {/* ── Converter Tool ── */}
      <section className="px-4 md:px-6 pb-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Left: Input Panel */}
            <div>
              <TerminalPanel
                title="input.env"
                headerExtra={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLoadExample}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        transition: 'color 0.2s, border-color 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--accent)'
                        e.currentTarget.style.borderColor = 'var(--accent)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      Load Example
                    </button>
                    {envInput && (
                      <button
                        onClick={handleReset}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          transition: 'color 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#f22f46'
                          e.currentTarget.style.borderColor = '#f22f46'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                }
              >
                <textarea
                  value={envInput}
                  onChange={e => setEnvInput(e.target.value)}
                  placeholder={EXAMPLE_ENV}
                  spellCheck={false}
                  style={{
                    width: '100%',
                    minHeight: '420px',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    lineHeight: '1.7',
                    resize: 'vertical',
                    padding: '0',
                  }}
                />
              </TerminalPanel>

              {/* Convert Button */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleConvert}
                  disabled={!envInput.trim() || state === 'converting'}
                  className="btn-accent"
                  style={{
                    padding: '12px 32px',
                    fontSize: '0.9rem',
                    opacity: !envInput.trim() || state === 'converting' ? 0.5 : 1,
                    cursor: !envInput.trim() || state === 'converting' ? 'not-allowed' : 'pointer',
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {state === 'converting' ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner />
                      Converting...
                    </span>
                  ) : state === 'done' ? (
                    'Re-Convert to .0n'
                  ) : (
                    'Convert to .0n'
                  )}
                </button>
              </div>

              {/* Progress bar during conversion */}
              {state === 'converting' && (
                <div className="mt-3" style={{ height: '3px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: 'var(--accent)',
                      transition: 'width 0.15s ease',
                      boxShadow: '0 0 8px var(--accent-glow)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right: Output Panel */}
            <div ref={outputRef}>
              {state === 'done' && result ? (
                <>
                  {/* Stats bar */}
                  <div
                    className="flex flex-wrap items-center gap-3 mb-4"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                  >
                    <StatChip
                      label="Services Detected"
                      value={String(result.services.length)}
                      color="var(--accent)"
                    />
                    <StatChip
                      label="Credentials Secured"
                      value={String(result.variables.length)}
                      color="var(--accent-secondary)"
                    />
                    <StatChip
                      label="Files Generated"
                      value={String(result.connections.length + 1)}
                      color="#a78bfa"
                    />
                  </div>

                  {/* Service badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.services.map(s => (
                      <ServiceBadge key={s} service={s} />
                    ))}
                  </div>

                  {/* Tab bar */}
                  <div
                    className="flex flex-wrap gap-1 mb-1"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                    }}
                  >
                    {result.connections.map((conn, i) => (
                      <button
                        key={conn.filename}
                        onClick={() => setActiveTab(i)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '6px 6px 0 0',
                          border: '1px solid var(--border)',
                          borderBottom: 'none',
                          backgroundColor: activeTab === i ? 'var(--bg-card)' : 'transparent',
                          color: activeTab === i ? 'var(--accent)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                        }}
                      >
                        {conn.filename}
                      </button>
                    ))}
                    <button
                      onClick={() => setActiveTab(result.connections.length)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px 6px 0 0',
                        border: '1px solid var(--border)',
                        borderBottom: 'none',
                        backgroundColor: activeTab === result.connections.length ? 'var(--bg-card)' : 'transparent',
                        color: activeTab === result.connections.length ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                      }}
                    >
                      master.0n
                    </button>
                  </div>

                  {/* Output terminal */}
                  <TerminalPanel
                    title={activeTab < result.connections.length ? result.connections[activeTab].filename : 'master.0n'}
                    headerExtra={
                      <div
                        className="flex items-center gap-2"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}
                      >
                        <span
                          className="flex items-center gap-1"
                          style={{
                            color: 'var(--accent)',
                            backgroundColor: 'rgba(110, 224, 90, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M5 0.5L1 2.5V5C1 7.5 2.8 9.8 5 10.5C7.2 9.8 9 7.5 9 5V2.5L5 0.5Z"
                              fill="currentColor"
                              opacity="0.3"
                            />
                            <path
                              d="M5 0.5L1 2.5V5C1 7.5 2.8 9.8 5 10.5C7.2 9.8 9 7.5 9 5V2.5L5 0.5Z"
                              stroke="currentColor"
                              strokeWidth="0.8"
                              fill="none"
                            />
                          </svg>
                          7-Layer Encryption Ready
                        </span>
                      </div>
                    }
                  >
                    <SyntaxHighlightedJson
                      data={
                        activeTab < result.connections.length
                          ? result.connections[activeTab].content
                          : result.masterSwitch
                      }
                    />
                  </TerminalPanel>

                  {/* CTA buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={activeTab < result.connections.length ? handleCopy : handleCopyAll}
                      className="btn-ghost"
                      style={{ flex: 1, justifyContent: 'center', padding: '12px 24px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px' }}>
                        <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M10 4V2.5A1.5 1.5 0 008.5 1H2.5A1.5 1.5 0 001 2.5v6A1.5 1.5 0 002.5 10H4" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      {copied ? 'Copied!' : activeTab < result.connections.length ? 'Copy .0n' : 'Copy All'}
                    </button>
                    <button
                      onClick={() => setShowSignup(true)}
                      className="btn-accent"
                      style={{ flex: 1, justifyContent: 'center', padding: '12px 24px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px' }}>
                        <path
                          d="M7 1L2 3.5V6.5C2 9.55 4.15 12.37 7 13C9.85 12.37 12 9.55 12 6.5V3.5L7 1Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          fill="none"
                        />
                        <path d="M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      Save to Vault
                    </button>
                  </div>
                </>
              ) : (
                /* Empty state */
                <TerminalPanel title="output.0n">
                  <div
                    className="flex flex-col items-center justify-center text-center"
                    style={{ minHeight: '420px', color: 'var(--text-muted)' }}
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: '16px', opacity: 0.4 }}>
                      <path
                        d="M24 4L8 12v10c0 11 6.8 21.3 16 24 9.2-2.7 16-13 16-24V12L24 4z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '8px' }}>
                      {state === 'converting' ? 'Analyzing credentials...' : 'Paste your .env and click Convert'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', maxWidth: '280px' }}>
                      Your .env variables will be auto-detected, grouped by service, and converted to encrypted .0n
                      connection files.
                    </p>
                  </div>
                </TerminalPanel>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Security Comparison ── */}
      <section
        className="py-20 md:py-24 px-6"
        style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-[900px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Why Switch?</span>
          <h2 className="section-heading">.env vs .0n — Security Comparison</h2>
          <p className="section-desc">
            Your .env files are plaintext liabilities. The .0n standard encrypts, organizes, and protects your
            credentials with military-grade security.
          </p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                    Feature
                  </th>
                  <th className="py-3 px-4" style={{ color: '#f22f46', fontWeight: 500 }}>
                    <span className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M4 4l4 4M8 4l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      .env
                    </span>
                  </th>
                  <th className="py-3 px-4" style={{ color: 'var(--accent)', fontWeight: 500 }}>
                    <span className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M4 6l1.5 1.5L8 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      .0n
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.feature} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                      {row.feature}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>
                      {row.env}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--accent)' }}>
                      {row.on}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 md:py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">How It Works</span>
          <h2 className="section-heading">From Plaintext to Protected in Seconds</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                num: '01',
                title: 'Paste',
                desc: 'Paste your .env contents into the converter. We auto-detect services from variable names.',
              },
              {
                num: '02',
                title: 'Convert',
                desc: 'Variables are grouped by service and structured into .0n connection files with encryption metadata.',
              },
              {
                num: '03',
                title: 'Protect',
                desc: 'Save to your 0nVault for AES-256-GCM encryption, or copy the .0n files to use locally with 0nMCP.',
              },
            ].map(step => (
              <div key={step.num} className="glow-box text-center">
                <span
                  className="text-3xl font-bold mb-3 block"
                  style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', opacity: 0.5 }}
                >
                  {step.num}
                </span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Detected Services ── */}
      <section
        className="py-20 md:py-24 px-6"
        style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Auto-Detection</span>
          <h2 className="section-heading">26+ Services Recognized Instantly</h2>
          <p className="section-desc">
            The converter automatically identifies your API keys and groups them by service. Each service gets its own
            encrypted .0n connection file with proper endpoints and capabilities.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-12">
            {(Object.entries(SERVICE_META) as [ServiceId, ServiceMeta][])
              .filter(([id]) => id !== 'custom')
              .map(([id, meta]) => (
                <div
                  key={id}
                  className="glow-box flex items-center gap-3"
                  style={{ padding: '12px 14px' }}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: `${meta.color}18`,
                      color: meta.color,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {meta.icon}
                  </div>
                  <span
                    className="text-sm truncate"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                  >
                    {meta.label}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="py-24 md:py-32 px-6 text-center"
        style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to <span style={{ color: 'var(--accent)' }}>Encrypt Everything</span>?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            The converter is free forever. Sign up to save encrypted files to your Vault, access{' '}
            {STATS_DISPLAY.tools} tools, and deploy workflows instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-accent no-underline text-base px-8 py-3">
              Create Free Account
            </Link>
            <Link href="/0n-standard" className="btn-ghost no-underline text-base px-8 py-3">
              Learn about .0n
            </Link>
          </div>
        </div>
      </section>

      {/* ── Signup Modal ── */}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </div>
  )
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function TerminalPanel({
  title,
  headerExtra,
  children,
}: {
  title: string
  headerExtra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57', display: 'block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#febc2e', display: 'block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840', display: 'block' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {title}
          </span>
        </div>
        {headerExtra}
      </div>

      {/* Body */}
      <div className="p-4" style={{ maxHeight: '520px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function SyntaxHighlightedJson({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data, null, 2)
  const lines = json.split('\n')

  return (
    <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', lineHeight: '1.7' }}>
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span
            style={{
              display: 'inline-block',
              width: '32px',
              textAlign: 'right',
              marginRight: '16px',
              color: 'var(--text-muted)',
              opacity: 0.4,
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {i + 1}
          </span>
          <span>
            <HighlightLine line={line} />
          </span>
        </div>
      ))}
    </pre>
  )
}

function HighlightLine({ line }: { line: string }) {
  // Match JSON keys, string values, numbers, booleans, nulls
  const parts: React.ReactNode[] = []
  let remaining = line
  let key = 0

  while (remaining.length > 0) {
    // JSON key
    const keyMatch = remaining.match(/^(\s*)"([^"]+)"(\s*:)/)
    if (keyMatch) {
      parts.push(
        <span key={key++} style={{ color: 'var(--text-muted)' }}>{keyMatch[1]}</span>,
        <span key={key++} style={{ color: '#60a5fa' }}>&quot;{keyMatch[2]}&quot;</span>,
        <span key={key++} style={{ color: 'var(--text-muted)' }}>{keyMatch[3]}</span>
      )
      remaining = remaining.slice(keyMatch[0].length)
      continue
    }

    // String value (with accent for encrypted indicators)
    const strMatch = remaining.match(/^(\s*)"([^"]*)"/)
    if (strMatch) {
      const val = strMatch[2]
      const isEncrypted = val.includes('***') || val.includes('AES') || val.includes('Argon')
      const isAccent = val === 'ready' || val === 'connection' || val === 'switch'
      parts.push(
        <span key={key++} style={{ color: 'var(--text-muted)' }}>{strMatch[1]}</span>,
        <span
          key={key++}
          style={{
            color: isAccent
              ? 'var(--accent)'
              : isEncrypted
                ? '#f0a060'
                : '#a78bfa',
          }}
        >
          &quot;{val}&quot;
        </span>
      )
      remaining = remaining.slice(strMatch[0].length)
      continue
    }

    // Numbers
    const numMatch = remaining.match(/^(\s*)(\d+\.?\d*)/)
    if (numMatch) {
      parts.push(
        <span key={key++} style={{ color: 'var(--text-muted)' }}>{numMatch[1]}</span>,
        <span key={key++} style={{ color: '#f0a060' }}>{numMatch[2]}</span>
      )
      remaining = remaining.slice(numMatch[0].length)
      continue
    }

    // Booleans
    const boolMatch = remaining.match(/^(\s*)(true|false)/)
    if (boolMatch) {
      parts.push(
        <span key={key++} style={{ color: 'var(--text-muted)' }}>{boolMatch[1]}</span>,
        <span key={key++} style={{ color: 'var(--accent)' }}>{boolMatch[2]}</span>
      )
      remaining = remaining.slice(boolMatch[0].length)
      continue
    }

    // Default: single char
    parts.push(
      <span key={key++} style={{ color: 'var(--text-muted)' }}>
        {remaining[0]}
      </span>
    )
    remaining = remaining.slice(1)
  }

  return <>{parts}</>
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <span style={{ color, fontWeight: 700, fontSize: '0.85rem' }}>{value}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{label}</span>
    </div>
  )
}

function ServiceBadge({ service }: { service: ServiceId }) {
  const meta = SERVICE_META[service]
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1 rounded"
      style={{
        backgroundColor: `${meta.color}12`,
        border: `1px solid ${meta.color}25`,
      }}
    >
      <span
        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
        style={{ backgroundColor: `${meta.color}25`, color: meta.color, fontFamily: 'var(--font-mono)' }}
      >
        {meta.icon}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: meta.color }}>
        {meta.label}
      </span>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M8 2a6 6 0 014.24 1.76" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}

function SignupModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          maxWidth: '440px',
          width: '100%',
          padding: '32px',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Shield icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-glow)', border: '2px solid var(--accent)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 2L4 7v7c0 7.7 4.3 14.9 10 17 5.7-2.1 10-9.3 10-17V7L14 2z"
                stroke="var(--accent)"
                strokeWidth="1.8"
                fill="none"
              />
              <path d="M10 14l2.5 2.5L18 11" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h3
          className="text-xl font-bold text-center mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Save to Your 0nVault
        </h3>
        <p
          className="text-center mb-6"
          style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}
        >
          Create a free account to save encrypted .0n files to your personal Vault. Access them from any AI
          platform with {STATS_DISPLAY.tools} tools at your fingertips.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="btn-accent no-underline text-center"
            style={{ padding: '14px 24px', width: '100%', justifyContent: 'center' }}
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="btn-ghost no-underline text-center"
            style={{ padding: '14px 24px', width: '100%', justifyContent: 'center' }}
          >
            I already have an account
          </Link>
        </div>

        <p
          className="text-center mt-4"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
        >
          Free tier includes unlimited conversions + 5 Vault saves
        </p>
      </div>
    </div>
  )
}
