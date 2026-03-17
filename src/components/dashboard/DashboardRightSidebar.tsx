'use client'

/**
 * DashboardRightSidebar — APEX-inspired floating panel
 *
 * Collapsed: floating pill button on right edge
 * Expanded: 340px floating panel with rounded corners + glassmorphism
 *
 * Tabs: Connectors | Vault | Credits
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { getLogoSrc } from '@/components/console/logo-map'

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = 'connectors' | 'vault' | 'credits'

interface ConnectedService {
  id: string
  name: string
  category: string
  description: string
  connected: boolean
}

interface VaultSummary {
  total: number
  workflows: number
  brand: number
  credentials: number
}

interface AccountSummary {
  creditsBalance?: number
  plan?: string
  subscribed?: boolean
}

// ─── Connector catalog ──────────────────────────────────────────────────────

const CONNECTORS: ConnectedService[] = [
  { id: 'openai',      name: 'OpenAI',       category: 'AI',       description: 'GPT models & embeddings',     connected: false },
  { id: 'anthropic',   name: 'Anthropic',    category: 'AI',       description: 'Claude AI models',            connected: false },
  { id: 'gemini',      name: 'Gemini',       category: 'AI',       description: 'Google AI platform',          connected: false },
  { id: 'groq',        name: 'GROQ',         category: 'AI',       description: 'Fast LLM inference',          connected: false },
  { id: 'crm',         name: 'Rocket+ CRM',  category: 'CRM',      description: 'Contacts, pipelines, email',  connected: false },
  { id: 'hubspot',     name: 'HubSpot',      category: 'CRM',      description: 'Marketing & sales CRM',       connected: false },
  { id: 'listkit',     name: 'ListKit',      category: 'Sales',    description: 'Lead list building',          connected: false },
  { id: 'smartlead',   name: 'Smartlead',    category: 'Sales',    description: 'Cold email automation',       connected: false },
  { id: 'linkedin',    name: 'LinkedIn',     category: 'Social',   description: 'Professional networking',     connected: false },
  { id: 'instagram',   name: 'Instagram',    category: 'Social',   description: 'Photo & video sharing',       connected: false },
  { id: 'x_twitter',   name: 'X / Twitter',  category: 'Social',   description: 'Microblogging platform',      connected: false },
  { id: 'reddit',      name: 'Reddit',       category: 'Social',   description: 'Community discussions',       connected: false },
  { id: 'discord',     name: 'Discord',      category: 'Social',   description: 'Team communication',         connected: false },
  { id: 'youtube',     name: 'YouTube',      category: 'Social',   description: 'Video platform',             connected: false },
  { id: 'slack',       name: 'Slack',        category: 'Comms',    description: 'Workplace messaging',        connected: false },
  { id: 'gmail',       name: 'Gmail',        category: 'Comms',    description: 'Email by Google',            connected: false },
  { id: 'twilio',      name: 'Twilio',       category: 'Comms',    description: 'SMS & voice APIs',           connected: false },
  { id: 'sendgrid',    name: 'SendGrid',     category: 'Comms',    description: 'Transactional email',        connected: false },
  { id: 'stripe',      name: 'Stripe',       category: 'Payments', description: 'Payment processing',         connected: false },
  { id: 'github',      name: 'GitHub',       category: 'Dev',      description: 'Code hosting & CI/CD',       connected: false },
  { id: 'vercel',      name: 'Vercel',       category: 'Dev',      description: 'Frontend deployment',        connected: false },
  { id: 'supabase',    name: 'Supabase',     category: 'Dev',      description: 'Postgres & auth',            connected: false },
  { id: 'notion',      name: 'Notion',       category: 'Data',     description: 'Docs & knowledge base',      connected: false },
  { id: 'airtable',    name: 'Airtable',     category: 'Data',     description: 'Spreadsheet database',       connected: false },
  { id: 'gdrive',      name: 'Google Drive', category: 'Google',   description: 'Cloud file storage',         connected: false },
  { id: 'gsheets',     name: 'Sheets',       category: 'Google',   description: 'Online spreadsheets',        connected: false },
  { id: 'gcal',        name: 'Calendar',     category: 'Google',   description: 'Scheduling & events',        connected: false },
  { id: 'shopify',     name: 'Shopify',      category: 'Commerce', description: 'E-commerce platform',        connected: false },
  { id: 'woocommerce', name: 'WooCommerce',  category: 'Commerce', description: 'WordPress commerce',         connected: false },
  { id: 'wordpress',   name: 'WordPress',    category: 'Commerce', description: 'Content management',         connected: false },
]

const CREDIT_PACKAGES = [
  { key: 'starter', label: 'Starter',  credits: 10,  price: '$5',  featured: false },
  { key: 'growth',  label: 'Growth',   credits: 50,  price: '$19', featured: true },
  { key: 'pro',     label: 'Pro Pack', credits: 200, price: '$49', featured: false },
]

// ─── Shared styles ──────────────────────────────────────────────────────────

const PANEL_BG       = 'rgba(12, 14, 20, 0.92)'
const PANEL_BORDER   = 'rgba(255, 255, 255, 0.07)'
const CARD_BG        = 'rgba(255, 255, 255, 0.03)'
const CARD_BG_HOVER  = 'rgba(255, 255, 255, 0.06)'
const CARD_BORDER    = 'rgba(255, 255, 255, 0.06)'
const ACCENT         = '#7ed957'
const ACCENT_DIM     = 'rgba(126, 217, 87, 0.12)'
const ACCENT_BORDER  = 'rgba(126, 217, 87, 0.3)'
const TEXT_PRIMARY   = '#e8eaed'
const TEXT_SECONDARY = '#9aa0a8'
const TEXT_MUTED     = '#5f6672'

// ─── Sub-components ─────────────────────────────────────────────────────────

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 0',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        letterSpacing: active ? '0.01em' : '0',
        color: active ? ACCENT : TEXT_MUTED,
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${active ? ACCENT : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}

function ServiceLogo({ id, size = 28 }: { id: string; size?: number }) {
  const src = getLogoSrc(id)
  const initials = id.slice(0, 2).toUpperCase()
  if (src) {
    return (
      <img
        src={src}
        alt={id}
        width={size}
        height={size}
        style={{ objectFit: 'contain', borderRadius: 6, flexShrink: 0 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: ACCENT_DIM,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color: ACCENT,
    }}>
      {initials}
    </div>
  )
}

function ConnectorCard({
  connector,
  onConnect,
}: {
  connector: ConnectedService
  onConnect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !connector.connected && onConnect(connector.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px',
        borderRadius: 10,
        border: connector.connected
          ? `1px solid ${ACCENT_BORDER}`
          : `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : CARD_BORDER}`,
        background: connector.connected
          ? 'rgba(126,217,87,0.04)'
          : hovered ? CARD_BG_HOVER : CARD_BG,
        transition: 'all 0.2s ease',
        cursor: connector.connected ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row: logo + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ServiceLogo id={connector.id} size={32} />
        {connector.connected ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, color: ACCENT,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: ACCENT,
              boxShadow: `0 0 6px ${ACCENT}`,
            }} />
            Active
          </div>
        ) : (
          <div style={{
            fontSize: 10, fontWeight: 500, padding: '2px 8px',
            borderRadius: 4,
            background: hovered ? ACCENT_DIM : 'transparent',
            color: hovered ? ACCENT : TEXT_MUTED,
            transition: 'all 0.2s',
            border: hovered ? `1px solid ${ACCENT_BORDER}` : '1px solid transparent',
          }}>
            Connect
          </div>
        )}
      </div>

      {/* Name + description */}
      <div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: TEXT_PRIMARY,
          lineHeight: 1.3,
        }}>
          {connector.name}
        </div>
        <div style={{
          fontSize: 10, color: TEXT_MUTED, marginTop: 2,
          lineHeight: 1.4,
        }}>
          {connector.description}
        </div>
      </div>
    </div>
  )
}

// ─── Tab panels ─────────────────────────────────────────────────────────────

function ConnectorsTab({
  connectors,
  connectedCount,
  onConnect,
  onOpenVault,
}: {
  connectors: ConnectedService[]
  connectedCount: number
  onConnect: (id: string) => void
  onOpenVault: () => void
}) {
  const [filter, setFilter] = useState('')
  const [category, setCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(connectors.map(c => c.category)))]

  const filtered = connectors.filter(c => {
    const matchesSearch = filter === '' || c.name.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = category === 'All' || c.category === category
    return matchesSearch && matchesCategory
  })

  const connected = filtered.filter(c => c.connected)
  const notConnected = filtered.filter(c => !c.connected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header stats */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${PANEL_BORDER}`,
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, color: TEXT_SECONDARY }}>
          <span style={{ fontWeight: 700, color: ACCENT, fontSize: 16 }}>
            {connectedCount}
          </span>
          <span style={{ marginLeft: 4 }}>of {CONNECTORS.length}</span>
        </div>
        <button
          onClick={onOpenVault}
          style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 6,
            background: ACCENT_DIM,
            border: `1px solid ${ACCENT_BORDER}`,
            color: ACCENT, cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 600, transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(126,217,87,0.2)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = ACCENT_DIM
          }}
        >
          + Import
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 16px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 8,
          background: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          transition: 'border-color 0.2s',
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={TEXT_MUTED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search connectors..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 12, color: TEXT_PRIMARY, fontFamily: 'inherit',
            }}
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: TEXT_MUTED, padding: 0, display: 'flex',
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div style={{
        display: 'flex', gap: 6, padding: '0 16px 10px', flexWrap: 'wrap', flexShrink: 0,
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 6,
              background: category === cat ? ACCENT_DIM : 'transparent',
              border: category === cat
                ? `1px solid ${ACCENT_BORDER}`
                : `1px solid ${CARD_BORDER}`,
              color: category === cat ? ACCENT : TEXT_MUTED,
              cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: category === cat ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Connector grid */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '4px 16px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {connected.length > 0 && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.08em', color: ACCENT, padding: '8px 0 4px',
            }}>
              Connected
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              {connected.map(c => (
                <ConnectorCard key={c.id} connector={c} onConnect={onConnect} />
              ))}
            </div>
            <div style={{ height: 4 }} />
          </>
        )}

        {notConnected.length > 0 && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.08em', color: TEXT_MUTED, padding: '8px 0 4px',
            }}>
              Available
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              {notConnected.map(c => (
                <ConnectorCard key={c.id} connector={c} onConnect={onConnect} />
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '32px 0',
            color: TEXT_MUTED, fontSize: 13,
          }}>
            No connectors match &ldquo;{filter}&rdquo;
          </div>
        )}
      </div>
    </div>
  )
}

function VaultTab({ onOpenVault }: { onOpenVault: () => void }) {
  const [summary, setSummary] = useState<VaultSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/console/vault-files')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data != null) {
          const tc = data.typeCounts ?? {}
          setSummary({
            total:       data.total ?? 0,
            workflows:   tc.workflow ?? tc.switch ?? 0,
            brand:       tc.brand ?? 0,
            credentials: tc.credentials ?? 0,
          })
        } else {
          setSummary({ total: 0, workflows: 0, brand: 0, credentials: 0 })
        }
      })
      .catch(() => setSummary({ total: 0, workflows: 0, brand: 0, credentials: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'SWITCH files',  value: loading ? '-' : String(summary?.workflows  ?? 0), color: ACCENT },
    { label: 'Brand assets',  value: loading ? '-' : String(summary?.brand      ?? 0), color: '#a78bfa' },
    { label: 'Credentials',   value: loading ? '-' : String(summary?.credentials ?? 0), color: '#00d4ff' },
    { label: 'Total files',   value: loading ? '-' : String(summary?.total      ?? 0), color: '#ff6b35' },
  ]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            padding: '14px', borderRadius: 10,
            background: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 6, fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* .0n info card */}
      <div style={{
        padding: '14px', borderRadius: 10,
        background: 'rgba(126,217,87,0.04)',
        border: `1px solid rgba(126,217,87,0.15)`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>
          .0n file format
        </div>
        <div style={{ fontSize: 11, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
          SWITCH files are executable .0n workflow definitions.
          Build in the visual builder, run anywhere.
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onOpenVault}
          style={{
            padding: '11px 16px', borderRadius: 8, border: 'none',
            background: ACCENT, color: '#080B0F',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          Open Vault
        </button>
        <a
          href="/builder"
          style={{
            display: 'block', padding: '10px 16px', borderRadius: 8,
            border: `1px solid ${CARD_BORDER}`,
            color: TEXT_SECONDARY, background: 'transparent',
            fontSize: 12, fontWeight: 500, textAlign: 'center', textDecoration: 'none',
            transition: 'all .15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.15)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = TEXT_PRIMARY
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = CARD_BORDER
            ;(e.currentTarget as HTMLAnchorElement).style.color = TEXT_SECONDARY
          }}
        >
          Open Builder
        </a>
      </div>
    </div>
  )
}

function CreditsTab() {
  const [balance, setBalance] = useState<number | null>(null)
  const [plan, setPlan] = useState<string>('free')
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/console/billing')
      .then(r => r.ok ? r.json() : null)
      .then((data: AccountSummary | null) => {
        if (data?.creditsBalance != null) setBalance(data.creditsBalance)
        if (data?.plan) setPlan(data.plan)
      })
      .catch(() => {})
  }, [])

  const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    setPurchasing(pkg.key)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: pkg.key, credits: pkg.credits }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.url) window.location.href = data.url
      }
    } catch {
      // fallback
    } finally {
      setPurchasing(null)
    }
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Balance card */}
      <div style={{
        padding: '20px', borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.04))',
        border: `1px solid ${ACCENT_BORDER}`,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.1em', color: 'rgba(126,217,87,0.65)', marginBottom: 8,
        }}>
          Credit balance
        </div>
        <div style={{
          fontSize: 40, fontWeight: 900, color: ACCENT, lineHeight: 1,
          fontFamily: "'JetBrains Mono', monospace",
          textShadow: '0 0 20px rgba(126,217,87,0.2)',
        }}>
          {balance === null ? '-' : balance.toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 6 }}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
        </div>
      </div>

      <div style={{ fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
        Each workflow execution costs 1-5 credits. Purchase below to keep building.
      </div>

      {/* Package cards — in-panel purchase buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CREDIT_PACKAGES.map(pkg => (
          <button
            key={pkg.key}
            onClick={() => handlePurchase(pkg)}
            disabled={purchasing === pkg.key}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              background: pkg.featured ? 'rgba(126,217,87,0.06)' : CARD_BG,
              border: pkg.featured
                ? `1px solid ${ACCENT_BORDER}`
                : `1px solid ${CARD_BORDER}`,
              transition: 'all .2s',
              cursor: purchasing === pkg.key ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              width: '100%',
              opacity: purchasing === pkg.key ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!purchasing) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT_BORDER
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = pkg.featured ? ACCENT_BORDER : CARD_BORDER
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>
                  {pkg.label}
                </span>
                {pkg.featured && (
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 4,
                    background: ACCENT_DIM, color: ACCENT,
                    fontWeight: 700, letterSpacing: '.04em',
                  }}>
                    POPULAR
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>
                {pkg.credits} credits
              </div>
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: '#080B0F',
              background: ACCENT,
              padding: '5px 12px',
              borderRadius: 6,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {purchasing === pkg.key ? '...' : pkg.price}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function PuzzleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
    </svg>
  )
}

function ChevronIcon({ direction = 'left', size = 14 }: { direction?: 'left' | 'right'; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: direction === 'right' ? 'rotate(180deg)' : 'none' }}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

interface DashboardRightSidebarProps {
  onOpenVault?: () => void
  connectedCount?: number
}

export default function DashboardRightSidebar({
  onOpenVault,
  connectedCount = 0,
}: DashboardRightSidebarProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('connectors')
  const [connectors, setConnectors] = useState<ConnectedService[]>(CONNECTORS)
  const panelRef = useRef<HTMLDivElement>(null)

  // Load connected state when panel opens
  useEffect(() => {
    if (!open) return
    fetch('/api/console/billing')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        if (Array.isArray(data.connected_services)) {
          const connectedIds = new Set(data.connected_services as string[])
          setConnectors(CONNECTORS.map(c => ({ ...c, connected: connectedIds.has(c.id) })))
        }
      })
      .catch(() => {})
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // ESC to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const handleConnect = useCallback(() => {
    if (onOpenVault) onOpenVault()
    else window.location.href = '/console?view=vault'
  }, [onOpenVault])

  const handleOpenVault = useCallback(() => {
    setOpen(false)
    if (onOpenVault) onOpenVault()
    else window.location.href = '/console?view=vault'
  }, [onOpenVault])

  const activeConnectedCount = connectors.filter(c => c.connected).length || connectedCount

  return (
    <div ref={panelRef} style={{ position: 'relative', flexShrink: 0, height: '100%' }}>

      {/* ── Floating trigger strip ──────────────────────────────────────────── */}
      <div style={{
        width: 44,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        gap: 6,
        background: 'transparent',
        zIndex: 10,
        position: 'relative',
      }}>
        {/* Main toggle */}
        <button
          className={open ? '' : 'sidebar-trigger-pulse'}
          onClick={() => setOpen(p => !p)}
          title="Extensions"
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            border: `1px solid ${open ? ACCENT_BORDER : 'rgba(126,217,87,0.2)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: open ? ACCENT_DIM : 'rgba(126,217,87,0.06)',
            color: open ? ACCENT : '#8ee86a',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          onMouseEnter={e => {
            if (!open) {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(126,217,87,0.15)'
              ;(e.currentTarget as HTMLButtonElement).style.color = ACCENT
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT_BORDER
            }
          }}
          onMouseLeave={e => {
            if (!open) {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(126,217,87,0.06)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#8ee86a'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(126,217,87,0.2)'
            }
          }}
        >
          <PuzzleIcon size={17} />
          {/* Badge */}
          {activeConnectedCount > 0 && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 16, height: 16, borderRadius: '50%',
              background: ACCENT, color: '#080B0F',
              fontSize: 9, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
              boxShadow: `0 0 8px rgba(126,217,87,0.4)`,
            }}>
              {activeConnectedCount > 9 ? '9+' : activeConnectedCount}
            </div>
          )}
        </button>

        {/* Credits shortcut */}
        <button
          onClick={() => { setActiveTab('credits'); setOpen(true) }}
          title="Credits"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${(open && activeTab === 'credits') ? ACCENT_BORDER : CARD_BORDER}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (open && activeTab === 'credits') ? ACCENT_DIM : CARD_BG,
            color: (open && activeTab === 'credits') ? ACCENT : TEXT_MUTED,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!(open && activeTab === 'credits')) {
              (e.currentTarget as HTMLButtonElement).style.background = CARD_BG_HOVER
              ;(e.currentTarget as HTMLButtonElement).style.color = TEXT_SECONDARY
            }
          }}
          onMouseLeave={e => {
            if (!(open && activeTab === 'credits')) {
              (e.currentTarget as HTMLButtonElement).style.background = CARD_BG
              ;(e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED
            }
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>

        {/* Vault shortcut */}
        <button
          onClick={() => { setActiveTab('vault'); setOpen(true) }}
          title="Vault"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${(open && activeTab === 'vault') ? ACCENT_BORDER : CARD_BORDER}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (open && activeTab === 'vault') ? ACCENT_DIM : CARD_BG,
            color: (open && activeTab === 'vault') ? ACCENT : TEXT_MUTED,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!(open && activeTab === 'vault')) {
              (e.currentTarget as HTMLButtonElement).style.background = CARD_BG_HOVER
              ;(e.currentTarget as HTMLButtonElement).style.color = TEXT_SECONDARY
            }
          }}
          onMouseLeave={e => {
            if (!(open && activeTab === 'vault')) {
              (e.currentTarget as HTMLButtonElement).style.background = CARD_BG
              ;(e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED
            }
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>
      </div>

      {/* ── Floating panel ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          right: 56,
          top: 60,
          bottom: 12,
          width: 360,
          background: PANEL_BG,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 16,
          border: `1px solid ${PANEL_BORDER}`,
          boxShadow: open
            ? '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset'
            : 'none',
          transform: open ? 'translateX(0) scale(1)' : 'translateX(16px) scale(0.97)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, box-shadow 0.3s ease',
          zIndex: 100,
          pointerEvents: open ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Panel header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          borderBottom: `1px solid ${PANEL_BORDER}`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: ACCENT_DIM,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: ACCENT,
          }}>
            <PuzzleIcon size={14} />
          </div>
          <span style={{
            fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, flex: 1,
            letterSpacing: '-0.01em',
          }}>
            Extensions
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: `1px solid ${CARD_BORDER}`,
              background: 'transparent', cursor: 'pointer',
              color: TEXT_MUTED, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 0,
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = CARD_BG_HOVER
              ;(e.currentTarget as HTMLButtonElement).style.color = TEXT_SECONDARY
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${PANEL_BORDER}`,
          flexShrink: 0,
          padding: '0 12px',
        }}>
          <TabButton label="Connectors" active={activeTab === 'connectors'} onClick={() => setActiveTab('connectors')} />
          <TabButton label="Vault" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} />
          <TabButton label="Credits" active={activeTab === 'credits'} onClick={() => setActiveTab('credits')} />
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'connectors' && (
            <ConnectorsTab
              connectors={connectors}
              connectedCount={activeConnectedCount}
              onConnect={handleConnect}
              onOpenVault={handleOpenVault}
            />
          )}
          {activeTab === 'vault' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <VaultTab onOpenVault={handleOpenVault} />
            </div>
          )}
          {activeTab === 'credits' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <CreditsTab />
            </div>
          )}
        </div>
      </div>

      {/* Pulse animation for trigger buttons */}
      <style>{`
        @keyframes sidebarPulseLoop {
          0%, 90% { box-shadow: 0 0 0 0 rgba(126, 217, 87, 0); }
          93% { box-shadow: 0 0 0 8px rgba(126, 217, 87, 0.35); }
          96% { box-shadow: 0 0 0 0 rgba(126, 217, 87, 0); }
          98% { box-shadow: 0 0 0 8px rgba(126, 217, 87, 0.25); }
          100% { box-shadow: 0 0 0 0 rgba(126, 217, 87, 0); }
        }
        .sidebar-trigger-pulse {
          animation: sidebarPulseLoop 30s ease-in-out infinite;
          animation-delay: 10s;
        }
      `}</style>
    </div>
  )
}
