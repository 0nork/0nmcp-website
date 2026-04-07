'use client'

import { useState, useCallback } from 'react'
import { STATS_DISPLAY } from '@/data/stats'
import { GoogleConnectBanner } from '@/components/console/GoogleConnectBanner'

/* ═══════════════════════════════════════════════════════════
   Service Definitions — Each service has everything needed
   for guided setup: link to get key, affiliate URL, scopes,
   step-by-step guide, and tool count.
   ═══════════════════════════════════════════════════════════ */

interface ServiceDef {
  id: string
  name: string
  color: string
  icon: string
  pattern: string
  placeholder: string
  category: string
  description: string
  toolCount: number
  scopes: string[]
  guide: string[]
  keyUrl: string
  affiliateUrl?: string
  keyLabel: string
}

const SERVICES: ServiceDef[] = [
  // ── AI ──
  {
    id: 'anthropic', name: 'Anthropic', color: '#D4A574', icon: 'An', pattern: 'sk-ant-...', placeholder: 'sk-ant-api03-...', category: 'AI',
    description: 'Claude AI — the brain behind 0nMCP orchestration',
    toolCount: 12, scopes: ['Messages', 'Completions', 'Tool Use', 'Vision'],
    guide: ['Go to console.anthropic.com', 'Click "API Keys" in the left sidebar', 'Click "Create Key" and name it "0nMCP"', 'Copy the key (starts with sk-ant-)'],
    keyUrl: 'https://console.anthropic.com/settings/keys', keyLabel: 'Get API Key',
  },
  {
    id: 'openai', name: 'OpenAI', color: '#10a37f', icon: 'OA', pattern: 'sk-...', placeholder: 'sk-proj-...', category: 'AI',
    description: 'GPT-4o, DALL-E, Whisper — AI completions and generation',
    toolCount: 15, scopes: ['Chat', 'Images', 'Audio', 'Embeddings', 'Assistants'],
    guide: ['Go to platform.openai.com/api-keys', 'Click "Create new secret key"', 'Name it "0nMCP" and copy the key'],
    keyUrl: 'https://platform.openai.com/api-keys', keyLabel: 'Get API Key',
  },
  {
    id: 'gemini', name: 'Google Gemini', color: '#4285F4', icon: 'Gm', pattern: 'AIza...', placeholder: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', category: 'AI',
    description: 'Gemini 2.0 — Google\'s multimodal AI with code and vision',
    toolCount: 10, scopes: ['Chat', 'Embeddings', 'Vision', 'Code Generation'],
    guide: ['Go to aistudio.google.com/apikey', 'Click "Create API Key"', 'Select your Google Cloud project', 'Copy the generated API key'],
    keyUrl: 'https://aistudio.google.com/apikey', keyLabel: 'Get API Key',
  },
  {
    id: 'grok', name: 'xAI Grok', color: '#1DA1F2', icon: 'Xr', pattern: 'xai-...', placeholder: 'xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'AI',
    description: 'Grok — real-time reasoning with access to live data from X',
    toolCount: 8, scopes: ['Chat', 'Reasoning', 'Real-Time Data'],
    guide: ['Go to console.x.ai', 'Sign in with your X account', 'Click "Create API Key"', 'Copy the key (starts with xai-)'],
    keyUrl: 'https://console.x.ai', keyLabel: 'Get API Key',
  },
  {
    id: 'groq', name: 'Groq', color: '#F55036', icon: 'Gq', pattern: 'gsk_...', placeholder: 'gsk_...', category: 'AI',
    description: 'Ultra-fast inference — Llama, Mixtral, Gemma at lightning speed',
    toolCount: 8, scopes: ['Chat Completions', 'Models'],
    guide: ['Go to console.groq.com/keys', 'Click "Create API Key"', 'Copy the key (starts with gsk_)'],
    keyUrl: 'https://console.groq.com/keys', keyLabel: 'Get Free Key',
  },
  // ── CRM ──
  {
    id: 'crm', name: 'CRM (PIT Token)', color: '#6EE05A', icon: '0n', pattern: 'pit-...', placeholder: 'pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', category: 'CRM',
    description: 'Full CRM access — contacts, pipeline, calendar, email, SMS',
    toolCount: 289, scopes: ['Contacts', 'Calendars', 'Opportunities', 'Invoices', 'Conversations', 'Social', 'Users', 'Objects'],
    guide: ['Go to your CRM Settings > Business Profile', 'Scroll to "API" section', 'Generate a Private Integration Token (PIT)', 'Copy the token (starts with pit-)'],
    keyUrl: 'https://app.rocketclients.com/settings', keyLabel: 'Get PIT Token',
  },
  // ── Payments ──
  {
    id: 'stripe', name: 'Stripe', color: '#635BFF', icon: 'St', pattern: 'rk_live_...', placeholder: 'rk_live_...', category: 'Payments',
    description: 'Payment processing — invoices, subscriptions, checkout, billing',
    toolCount: 32, scopes: ['Charges', 'Customers', 'Invoices', 'Subscriptions', 'Products', 'Checkout', 'Webhooks'],
    guide: ['Go to dashboard.stripe.com/apikeys', 'Copy your "Secret key" (live mode)', 'Starts with rk_live_ or sk_live_'],
    keyUrl: 'https://dashboard.stripe.com/apikeys', keyLabel: 'Get API Key',
  },
  // ── Communication ──
  {
    id: 'slack', name: 'Slack', color: '#4A154B', icon: 'Sl', pattern: 'xoxb-...', placeholder: 'xoxb-xxxx-xxxx-xxxx', category: 'Communication',
    description: 'Team messaging, channels, notifications, workflows',
    toolCount: 14, scopes: ['Messages', 'Channels', 'Users', 'Files', 'Reactions'],
    guide: ['Go to api.slack.com/apps', 'Create a new app or select existing', 'Go to OAuth & Permissions', 'Copy the "Bot User OAuth Token" (starts with xoxb-)'],
    keyUrl: 'https://api.slack.com/apps', keyLabel: 'Create App',
  },
  {
    id: 'telegram', name: 'Telegram', color: '#26A5E4', icon: 'Tg', pattern: '123456:ABC...', placeholder: '123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'Communication',
    description: 'Telegram Bot API — messages, groups, channels, payments, inline',
    toolCount: 132, scopes: ['Messages', 'Groups', 'Channels', 'Inline', 'Payments', 'Media', 'Commands'],
    guide: ['Open Telegram and message @BotFather', 'Send /newbot and follow the prompts', 'Name your bot and choose a username', 'Copy the HTTP API token provided'],
    keyUrl: 'https://t.me/BotFather', keyLabel: 'Create Bot',
  },
  {
    id: 'twilio', name: 'Twilio', color: '#F22F46', icon: 'Tw', pattern: 'AC...', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'Communication',
    description: 'SMS, voice calls, WhatsApp, video — programmable comms',
    toolCount: 16, scopes: ['SMS', 'Voice', 'WhatsApp', 'Verify', 'Lookup'],
    guide: ['Go to console.twilio.com', 'Your Account SID is on the dashboard', 'Click "Show" to reveal Auth Token', 'Use format: AccountSID:AuthToken'],
    keyUrl: 'https://console.twilio.com', keyLabel: 'Get Credentials',
  },
  // ── Developer ──
  {
    id: 'github', name: 'GitHub', color: '#333333', icon: 'GH', pattern: 'ghp_...', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'Developer',
    description: 'Repository management, issues, PRs, Actions, releases',
    toolCount: 28, scopes: ['Repos', 'Issues', 'Pull Requests', 'Actions', 'Releases', 'Webhooks'],
    guide: ['Go to github.com/settings/tokens', 'Click "Generate new token (classic)"', 'Select scopes: repo, workflow, read:org', 'Copy the token (starts with ghp_)'],
    keyUrl: 'https://github.com/settings/tokens/new', keyLabel: 'Generate Token',
  },
  // ── Infrastructure ──
  {
    id: 'supabase', name: 'Supabase', color: '#3ECF8E', icon: 'Sb', pattern: 'eyJ...', placeholder: 'eyJhbGciOi...', category: 'Infrastructure',
    description: 'Postgres database, auth, storage, realtime, edge functions',
    toolCount: 22, scopes: ['Database', 'Auth', 'Storage', 'Realtime', 'Edge Functions'],
    guide: ['Go to supabase.com/dashboard', 'Select your project', 'Go to Settings > API', 'Copy the "anon/public" key or "service_role" key'],
    keyUrl: 'https://supabase.com/dashboard', keyLabel: 'Get API Key',
  },
  {
    id: 'vercel', name: 'Vercel', color: '#000000', icon: 'Vc', pattern: 'token...', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx', category: 'Infrastructure',
    description: 'Deployment, hosting, domains, serverless — ship to production',
    toolCount: 18, scopes: ['Deployments', 'Projects', 'Domains', 'Env Vars', 'Logs', 'Analytics'],
    guide: ['Go to vercel.com/account/tokens', 'Click "Create" and name it "0nMCP"', 'Set scope and expiration', 'Copy the generated token'],
    keyUrl: 'https://vercel.com/account/tokens', keyLabel: 'Create Token',
  },
  // ── Design ──
  {
    id: 'figma', name: 'Figma', color: '#F24E1E', icon: 'Fg', pattern: 'figd_...', placeholder: 'figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'Design',
    description: 'Design files, components, styles, variables, exports',
    toolCount: 20, scopes: ['Files', 'Components', 'Styles', 'Comments', 'Exports', 'Variables'],
    guide: ['Go to figma.com/settings', 'Scroll to "Personal Access Tokens"', 'Click "Create a new personal access token"', 'Copy the token (starts with figd_)'],
    keyUrl: 'https://www.figma.com/developers/api#access-tokens', keyLabel: 'Get Token',
  },
  // ── Content ──
  {
    id: 'sanity', name: 'Sanity CMS', color: '#F03E2F', icon: 'Sn', pattern: 'sk...', placeholder: 'skxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'Content',
    description: 'Headless CMS — documents, schemas, GROQ queries, assets',
    toolCount: 24, scopes: ['Documents', 'Schemas', 'Datasets', 'Assets', 'GROQ', 'Releases'],
    guide: ['Go to sanity.io/manage', 'Select your project', 'Navigate to API > Tokens', 'Create a token with desired permissions'],
    keyUrl: 'https://www.sanity.io/manage', keyLabel: 'Get Token',
  },
  {
    id: 'devto', name: 'Dev.to', color: '#0A0A0A', icon: 'Dv', pattern: 'alphanumeric', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx', category: 'Content',
    description: 'Developer blogging — publish articles, comments, analytics',
    toolCount: 10, scopes: ['Articles', 'Comments', 'Tags', 'Analytics', 'Publish'],
    guide: ['Go to dev.to/settings/extensions', 'Scroll to "DEV Community API Keys"', 'Enter a description like "0nMCP"', 'Click "Generate API Key" and copy it'],
    keyUrl: 'https://dev.to/settings/extensions', keyLabel: 'Get API Key',
  },
  // ── Email ──
  {
    id: 'sendgrid', name: 'SendGrid', color: '#1A82E2', icon: 'SG', pattern: 'SG.', placeholder: 'SG.xxxxxxxx...', category: 'Email',
    description: 'Transactional and marketing email delivery',
    toolCount: 18, scopes: ['Send Email', 'Templates', 'Contacts', 'Lists', 'Stats'],
    guide: ['Go to app.sendgrid.com/settings/api_keys', 'Click "Create API Key"', 'Choose "Full Access" and name it "0nMCP"', 'Copy the key (starts with SG.)'],
    keyUrl: 'https://app.sendgrid.com/settings/api_keys', keyLabel: 'Get API Key',
  },
  {
    id: 'resend', name: 'Resend', color: '#000000', icon: 'Re', pattern: 're_...', placeholder: 're_xxxxxxxx...', category: 'Email',
    description: 'Modern email API — developer-friendly transactional email',
    toolCount: 8, scopes: ['Send', 'Domains', 'Audiences', 'Emails'],
    guide: ['Go to resend.com/api-keys', 'Click "Create API Key"', 'Copy the key (starts with re_)'],
    keyUrl: 'https://resend.com/api-keys', keyLabel: 'Get API Key',
  },
  // ── Analytics ──
  {
    id: 'ga4', name: 'Google Analytics 4', color: '#E37400', icon: 'GA', pattern: 'G-...', placeholder: 'G-XXXXXXXXXX', category: 'Analytics',
    description: 'Pageviews, events, conversions, audiences, real-time reports',
    toolCount: 6, scopes: ['Pageviews', 'Events', 'Conversions', 'Audiences', 'Realtime'],
    guide: ['Go to analytics.google.com', 'Click Admin (gear icon)', 'Go to Data Streams > your stream', 'Copy the "Measurement ID" (starts with G-)'],
    keyUrl: 'https://analytics.google.com', keyLabel: 'Get Measurement ID',
  },
  {
    id: 'meta_pixel', name: 'Meta Pixel', color: '#1877F2', icon: 'Px', pattern: 'Numeric ID', placeholder: '1234567890123456', category: 'Analytics',
    description: 'Facebook/Instagram conversion tracking and audiences',
    toolCount: 4, scopes: ['PageView', 'Purchase', 'Lead', 'Custom Events'],
    guide: ['Go to business.facebook.com/events_manager', 'Select your Pixel', 'Copy the Pixel ID (numeric, 15-16 digits)'],
    keyUrl: 'https://business.facebook.com/events_manager', keyLabel: 'Get Pixel ID',
  },
  {
    id: 'google_ads', name: 'Google Ads', color: '#4285F4', icon: 'Ad', pattern: 'AW-...', placeholder: 'AW-123456789', category: 'Analytics',
    description: 'Google Ads conversion tracking and remarketing',
    toolCount: 8, scopes: ['Conversions', 'Remarketing', 'Campaigns', 'Reports'],
    guide: ['Go to ads.google.com', 'Click Tools > Conversions', 'Your Conversion ID starts with AW-', 'Or use the Google Connect button above for full OAuth access'],
    keyUrl: 'https://ads.google.com', keyLabel: 'Get Conversion ID',
  },
]

/* ═══ State Types ═══ */
interface ServiceState {
  value: string
  status: 'disconnected' | 'connecting' | 'connected' | 'testing' | 'error'
  error?: string
  visible: boolean
}
type VaultState = Record<string, ServiceState>

function initialState(): VaultState {
  const state: VaultState = {}
  for (const svc of SERVICES) state[svc.id] = { value: '', status: 'disconnected', visible: false, error: undefined }
  return state
}

/* ═══ Component ═══ */
export default function IntegrationsPage() {
  const [vault, setVault] = useState<VaultState>(initialState)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ServiceDef | null>(null)
  const [modalValue, setModalValue] = useState('')
  const [modalStatus, setModalStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [modalError, setModalError] = useState('')

  const connectedCount = Object.values(vault).filter(v => v.status === 'connected').length
  const totalCount = SERVICES.length
  const completionPct = Math.round((connectedCount / totalCount) * 100)

  const updateService = useCallback((id: string, patch: Partial<ServiceState>) => {
    setVault(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  function openModal(svc: ServiceDef) {
    setModal(svc)
    setModalValue(vault[svc.id]?.value || '')
    setModalStatus('idle')
    setModalError('')
  }

  async function handleModalSave() {
    if (!modal || !modalValue.trim()) return
    setModalStatus('saving')
    setModalError('')
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: modal.id, key: modalValue.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed' }))
        setModalError(data.error || 'Connection failed')
        setModalStatus('error')
        return
      }
      updateService(modal.id, { value: modalValue, status: 'connected', error: undefined })
      setModalStatus('saved')
      setTimeout(() => setModal(null), 1200)
    } catch {
      setModalError('Network error')
      setModalStatus('error')
    }
  }

  const filteredServices = SERVICES.filter(svc =>
    svc.name.toLowerCase().includes(search.toLowerCase()) ||
    svc.category.toLowerCase().includes(search.toLowerCase())
  )
  const categories = Array.from(new Set(filteredServices.map(s => s.category)))

  return (
    <div style={{ minHeight: '100%', padding: '1.5rem', background: 'var(--jp-bg)' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--jp-text)', margin: '0 0 0.375rem' }}>
          Connected Services
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', margin: 0 }}>
          {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services. Connect to unlock AI agent workflows.
        </p>
      </div>

      {/* ── Agentic Chat Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(110,224,90,0.08), rgba(0,212,255,0.08))',
        borderRadius: 'var(--jp-radius)', padding: '1rem 1.25rem',
        border: '1px solid rgba(110,224,90,0.2)', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(110,224,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--jp-green, #6EE05A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--jp-text)' }}>
            Agentic Workflows via Chat
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-secondary)', lineHeight: 1.4 }}>
            Every connected service is available through the AI chat. Run multi-step workflows like &ldquo;Create a Stripe customer, add them to CRM, and notify Slack&rdquo; — all in natural language.
          </div>
        </div>
        <a href="/console" style={{
          padding: '6px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
          background: 'var(--jp-green, #6EE05A)', color: '#000', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          Open Chat
        </a>
      </div>

      <GoogleConnectBanner />

      {/* ── Vault Progress ── */}
      <div style={{ background: 'var(--jp-surface)', borderRadius: 'var(--jp-radius)', padding: '1.25rem', border: '1px solid var(--jp-border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-text)' }}>Vault: {completionPct}%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-secondary)' }}>{connectedCount}/{totalCount} connected</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--jp-bg)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completionPct}%`, borderRadius: 4, background: 'linear-gradient(90deg, var(--jp-green), var(--jp-cyan))', transition: 'width 0.4s', boxShadow: connectedCount > 0 ? '0 0 8px var(--jp-green-glow)' : 'none' }} />
        </div>
      </div>

      {/* ── Search ── */}
      <input type="text" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} style={{
        width: '100%', maxWidth: 360, padding: '0.625rem 0.875rem', borderRadius: 'var(--jp-radius-sm)',
        border: '1px solid var(--jp-border)', background: 'var(--jp-bg-input)', color: 'var(--jp-text)',
        fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', marginBottom: '1.25rem',
      }} />

      {/* ── Service Cards ── */}
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--jp-text-muted)', marginBottom: '0.75rem' }}>
            {cat}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {filteredServices.filter(s => s.category === cat).map(svc => {
              const state = vault[svc.id]
              const isConnected = state.status === 'connected'
              return (
                <button key={svc.id} onClick={() => openModal(svc)} style={{
                  background: 'var(--jp-surface)', borderRadius: 'var(--jp-radius)', padding: '1rem 1.125rem',
                  border: `1px solid ${isConnected ? 'rgba(110,224,90,0.3)' : 'var(--jp-border)'}`,
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: `${svc.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: svc.color, fontSize: '0.8125rem', fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
                  }}>
                    {svc.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-text)' }}>{svc.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', lineHeight: 1.4 }}>{svc.description}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isConnected ? 'var(--jp-green)' : 'var(--jp-text-muted)',
                      boxShadow: isConnected ? '0 0 8px rgba(110,224,90,0.4)' : 'none',
                    }} />
                    <span style={{ fontSize: '0.5625rem', color: 'var(--jp-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {svc.toolCount} tools
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {filteredServices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--jp-text-muted)', fontSize: '0.875rem' }}>
          No services match &ldquo;{search}&rdquo;
        </div>
      )}

      {/* ═══ MODAL ═══ */}
      {modal && (
        <>
          <style>{`
            @keyframes modal-in { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
          <div onClick={() => setModal(null)} style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
            animation: 'fade-in 0.2s ease',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: 'var(--jp-surface-elevated, #111827)', borderRadius: 20,
              maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto',
              border: '1px solid var(--jp-border)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
              animation: 'modal-in 0.25s ease',
            }}>
              {/* Modal Header */}
              <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: `${modal.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: modal.color, fontSize: '1rem', fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {modal.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--jp-text, #E8EAED)', margin: 0 }}>
                    Connect {modal.name}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted, #4A5568)', margin: '2px 0 0' }}>
                    {modal.description}
                  </p>
                </div>
                <button onClick={() => setModal(null)} style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--jp-border)',
                  background: 'transparent', color: 'var(--jp-text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>

              <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                {/* Scopes */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--jp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    {modal.toolCount} tools unlocked
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {modal.scopes.map(s => (
                      <span key={s} style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600,
                        background: `${modal.color}10`, border: `1px solid ${modal.color}20`, color: modal.color,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step-by-step Guide */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--jp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    How to get your key
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {modal.guide.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${modal.color}12`, color: modal.color,
                          fontSize: '0.625rem', fontWeight: 800,
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary, #9CA3AF)', lineHeight: 1.5, paddingTop: 2 }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Get Key Button */}
                <a
                  href={modal.affiliateUrl || modal.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '12px', borderRadius: 10,
                    background: modal.color, color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700,
                    textDecoration: 'none', marginBottom: '1.25rem', transition: 'opacity 0.2s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {modal.keyLabel}
                </a>

                {/* API Key Input */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--jp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Paste your API key
                  </div>
                  <input
                    type="password"
                    value={modalValue}
                    onChange={e => { setModalValue(e.target.value); setModalStatus('idle'); setModalError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleModalSave()}
                    placeholder={modal.placeholder}
                    autoFocus
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: `1px solid ${modalError ? '#ef4444' : 'var(--jp-border)'}`,
                      background: 'var(--jp-surface, #0B0F19)', color: 'var(--jp-text, #E8EAED)',
                      fontSize: '0.8125rem', fontFamily: "'JetBrains Mono', monospace", outline: 'none',
                    }}
                  />
                </div>

                {modalError && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0 0 0.75rem' }}>{modalError}</p>
                )}

                {/* Save Button */}
                <button
                  onClick={handleModalSave}
                  disabled={!modalValue.trim() || modalStatus === 'saving'}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                    background: modalStatus === 'saved' ? 'rgba(110,224,90,0.15)' : 'var(--jp-green, #6EE05A)',
                    color: modalStatus === 'saved' ? 'var(--jp-green)' : '#000',
                    fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    opacity: !modalValue.trim() ? 0.4 : 1, transition: 'all 0.2s',
                  }}
                >
                  {modalStatus === 'saving' ? 'Connecting...' : modalStatus === 'saved' ? 'Connected!' : 'Connect & Save'}
                </button>

                <p style={{ fontSize: '0.625rem', color: 'var(--jp-text-muted)', margin: '0.75rem 0 0', textAlign: 'center' }}>
                  Encrypted with AES-256-GCM. Your key never leaves your vault.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
