'use client'

/**
 * DashboardRightSidebar
 *
 * Three-tab flyout panel attached to the right edge of the console.
 * Collapsed: 40px strip with puzzle-piece icon.
 * Expanded: 296px panel sliding in from the right.
 *
 * Tabs:
 *   Connectors — APEX-style connected service cards + available connector grid
 *   Vault       — vault file summary + quick-open CTA
 *   ⚡ Sparks   — balance + three package purchase cards
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { getLogoSrc } from '@/components/console/logo-map'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'connectors' | 'vault' | 'sparks'

interface ConnectedService {
  id: string
  name: string
  category: string
  connected: boolean
}

interface VaultSummary {
  total: number
  workflows: number
  brand: number
  credentials: number
}

interface AccountSummary {
  sparksBalance?: number
  plan?: string
  subscribed?: boolean
}

// ─── Static connector catalog (maps to APEX connector list) ──────────────────

const CONNECTORS: ConnectedService[] = [
  // AI
  { id: 'openai',      name: 'OpenAI',       category: 'AI',          connected: false },
  { id: 'anthropic',   name: 'Anthropic',    category: 'AI',          connected: false },
  { id: 'gemini',      name: 'Gemini',       category: 'AI',          connected: false },
  { id: 'groq',        name: 'GROQ',         category: 'AI',          connected: false },
  // CRM / Marketing
  { id: 'crm',         name: 'Rocket+CRM',   category: 'CRM',         connected: false },
  { id: 'hubspot',     name: 'HubSpot',      category: 'CRM',         connected: false },
  { id: 'listkit',     name: 'ListKit',      category: 'Sales',       connected: false },
  { id: 'smartlead',   name: 'Smartlead',    category: 'Sales',       connected: false },
  // Social
  { id: 'linkedin',    name: 'LinkedIn',     category: 'Social',      connected: false },
  { id: 'instagram',   name: 'Instagram',    category: 'Social',      connected: false },
  { id: 'x_twitter',   name: 'X / Twitter',  category: 'Social',      connected: false },
  { id: 'reddit',      name: 'Reddit',       category: 'Social',      connected: false },
  { id: 'discord',     name: 'Discord',      category: 'Social',      connected: false },
  { id: 'youtube',     name: 'YouTube',      category: 'Social',      connected: false },
  // Communication
  { id: 'slack',       name: 'Slack',        category: 'Comms',       connected: false },
  { id: 'gmail',       name: 'Gmail',        category: 'Comms',       connected: false },
  { id: 'twilio',      name: 'Twilio',       category: 'Comms',       connected: false },
  { id: 'sendgrid',    name: 'SendGrid',     category: 'Comms',       connected: false },
  // Payments
  { id: 'stripe',      name: 'Stripe',       category: 'Payments',    connected: false },
  // Dev / Data
  { id: 'github',      name: 'GitHub',       category: 'Dev',         connected: false },
  { id: 'vercel',      name: 'Vercel',       category: 'Dev',         connected: false },
  { id: 'supabase',    name: 'Supabase',     category: 'Dev',         connected: false },
  { id: 'notion',      name: 'Notion',       category: 'Data',        connected: false },
  { id: 'airtable',    name: 'Airtable',     category: 'Data',        connected: false },
  // Google
  { id: 'gdrive',      name: 'Google Drive', category: 'Google',      connected: false },
  { id: 'gsheets',     name: 'Sheets',       category: 'Google',      connected: false },
  { id: 'gcal',        name: 'Calendar',     category: 'Google',      connected: false },
  // E-commerce
  { id: 'shopify',     name: 'Shopify',      category: 'Commerce',    connected: false },
  { id: 'woocommerce', name: 'WooCommerce',  category: 'Commerce',    connected: false },
  { id: 'wordpress',   name: 'WordPress',    category: 'Commerce',    connected: false },
]

const SPARKS_PACKAGES = [
  { key: 'starter', label: 'Starter', sparks: 10,  price: '$5',  url: 'https://0nmcp.com/sparks?package=starter' },
  { key: 'growth',  label: 'Growth',  sparks: 50,  price: '$19', url: 'https://0nmcp.com/sparks?package=growth', featured: true },
  { key: 'pro',     label: 'Pro',     sparks: 200, price: '$49', url: 'https://0nmcp.com/sparks?package=pro' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex:       1,
        padding:    '6px 0',
        fontSize:   12,
        fontWeight: active ? 600 : 400,
        color:      active ? 'var(--accent, #7ed957)' : 'var(--text-muted, #64748b)',
        background: 'none',
        border:     'none',
        borderBottom: active
          ? '1.5px solid var(--accent, #7ed957)'
          : '1.5px solid transparent',
        cursor:    'pointer',
        transition: 'all 0.15s ease',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}

function ServiceLogo({ id, size = 22 }: { id: string; size?: number }) {
  const src = getLogoSrc(id)
  const initials = id.slice(0, 2).toUpperCase()
  if (src) {
    return (
      <img
        src={src}
        alt={id}
        width={size}
        height={size}
        style={{ objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 4, flexShrink: 0,
      background: 'rgba(126,217,87,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, color: 'var(--accent, #7ed957)',
    }}>
      {initials}
    </div>
  )
}

function ConnectorRow({
  connector,
  onConnect,
}: {
  connector: ConnectedService
  onConnect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         8,
        padding:     '7px 10px',
        borderRadius: 8,
        border:      connector.connected
          ? '0.5px solid rgba(126,217,87,0.35)'
          : `0.5px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'var(--border, rgba(255,255,255,0.06))'}`,
        background:  connector.connected
          ? 'rgba(126,217,87,0.04)'
          : hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition:  'all 0.15s ease',
        cursor:      connector.connected ? 'default' : 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !connector.connected && onConnect(connector.id)}
    >
      <ServiceLogo id={connector.id} size={20} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 500,
          color: 'var(--text-primary, #f0f0f0)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {connector.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', marginTop: 1 }}>
          {connector.category}
        </div>
      </div>

      {connector.connected ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 10, color: 'var(--accent, #7ed957)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent, #7ed957)',
          }} />
          Active
        </div>
      ) : (
        <div style={{
          fontSize: 10, fontWeight: 500,
          color: hovered ? 'var(--text-secondary, #94a3b8)' : 'var(--text-muted, #64748b)',
          transition: 'color 0.15s',
        }}>
          Connect
        </div>
      )}
    </div>
  )
}

// ─── Tab content panels ────────────────────────────────────────────────────────

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
  const [filter, setFilter]     = useState('')
  const [category, setCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(connectors.map(c => c.category)))]

  const filtered = connectors.filter(c => {
    const matchesSearch   = filter === '' || c.name.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = category === 'All' || c.category === category
    return matchesSearch && matchesCategory
  })

  const connected    = filtered.filter(c => c.connected)
  const notConnected = filtered.filter(c => !c.connected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>

      {/* Stats bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '0.5px solid var(--border, rgba(255,255,255,0.06))',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted, #64748b)' }}>
          <span style={{ fontWeight: 600, color: 'var(--accent, #7ed957)', fontSize: 13 }}>
            {connectedCount}
          </span>
          {' '}connected · {CONNECTORS.length} available
        </div>
        <button
          onClick={onOpenVault}
          style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 5,
            background: 'rgba(126,217,87,0.08)', border: '0.5px solid rgba(126,217,87,0.25)',
            color: 'var(--accent, #7ed957)', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Add in Vault
        </button>
      </div>

      {/* Search */}
      <div style={{
        padding: '8px 10px',
        borderBottom: '0.5px solid var(--border, rgba(255,255,255,0.06))',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 7,
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid var(--border, rgba(255,255,255,0.06))',
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }}>
            <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search services..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 12, color: 'var(--text-primary, #f0f0f0)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Category pills */}
      <div style={{
        display: 'flex', gap: 4, padding: '6px 10px', flexWrap: 'wrap', flexShrink: 0,
        borderBottom: '0.5px solid var(--border, rgba(255,255,255,0.06))',
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 4,
              background:  category === cat ? 'rgba(126,217,87,0.12)' : 'rgba(255,255,255,0.03)',
              border:      category === cat
                ? '0.5px solid rgba(126,217,87,0.4)'
                : '0.5px solid var(--border, rgba(255,255,255,0.06))',
              color:       category === cat ? 'var(--accent, #7ed957)' : 'var(--text-muted, #64748b)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Connector list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {connected.length > 0 && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(126,217,87,0.6)', padding: '4px 2px 2px' }}>
              Connected
            </div>
            {connected.map(c => (
              <ConnectorRow key={c.id} connector={c} onConnect={onConnect} />
            ))}
            <div style={{ height: 6 }} />
          </>
        )}

        {notConnected.length > 0 && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted, #64748b)', padding: '4px 2px 2px' }}>
              Available
            </div>
            {notConnected.map(c => (
              <ConnectorRow key={c.id} connector={c} onConnect={onConnect} />
            ))}
          </>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted, #64748b)', fontSize: 12 }}>
            No services match &ldquo;{filter}&rdquo;
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
    { label: 'SWITCH files',  value: loading ? '—' : String(summary?.workflows  ?? 0), color: '#7ed957' },
    { label: 'Brand assets',  value: loading ? '—' : String(summary?.brand      ?? 0), color: '#a78bfa' },
    { label: 'Credentials',   value: loading ? '—' : String(summary?.credentials ?? 0), color: '#00d4ff' },
    { label: 'Total files',   value: loading ? '—' : String(summary?.total      ?? 0), color: '#ff6b35' },
  ]

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid var(--border, rgba(255,255,255,0.06))',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', marginTop: 3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '10px 12px', borderRadius: 8,
        background: 'rgba(126,217,87,0.04)',
        border: '0.5px solid rgba(126,217,87,0.2)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent, #7ed957)', marginBottom: 4 }}>
          .0n file format
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.55 }}>
          SWITCH files are executable .0n workflow definitions. Build in the visual builder, run anywhere.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={onOpenVault}
          style={{
            padding: '9px 14px', borderRadius: 8, border: 'none',
            background: 'var(--accent, #7ed957)', color: '#080B0F',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.opacity = '.85' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = '1' }}
        >
          Open Vault
        </button>
        <a
          href="/builder"
          style={{
            display: 'block', padding: '8px 14px', borderRadius: 8,
            border: '0.5px solid var(--border, rgba(255,255,255,0.06))',
            color: 'var(--text-secondary, #94a3b8)', background: 'transparent',
            fontSize: 12, fontWeight: 500, textAlign: 'center', textDecoration: 'none',
            transition: 'border-color .15s, color .15s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'
            ;(e.target as HTMLAnchorElement).style.color = 'var(--text-primary, #f0f0f0)'
          }}
          onMouseLeave={e => {
            (e.target as HTMLAnchorElement).style.borderColor = 'var(--border, rgba(255,255,255,0.06))'
            ;(e.target as HTMLAnchorElement).style.color = 'var(--text-secondary, #94a3b8)'
          }}
        >
          Open Builder
        </a>
      </div>
    </div>
  )
}

function SparksTab() {
  const [balance, setBalance] = useState<number | null>(null)
  const [plan,    setPlan]    = useState<string>('free')

  useEffect(() => {
    fetch('/api/console/billing')
      .then(r => r.ok ? r.json() : null)
      .then((data: AccountSummary | null) => {
        if (data?.sparksBalance != null) setBalance(data.sparksBalance)
        if (data?.plan)          setPlan(data.plan)
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div style={{
        padding: '14px 16px', borderRadius: 10,
        background: 'rgba(126,217,87,0.06)',
        border: '0.5px solid rgba(126,217,87,0.3)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(126,217,87,0.7)', marginBottom: 6 }}>
          Sparks balance
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent, #7ed957)', lineHeight: 1, fontFamily: "'Barlow', sans-serif" }}>
          {balance === null ? '—' : balance.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', marginTop: 4 }}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.55 }}>
        Each pipeline execution costs 1–5 Sparks. Purchase below to keep building.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SPARKS_PACKAGES.map(pkg => (
          <a
            key={pkg.key}
            href={pkg.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              background:  pkg.featured ? 'rgba(126,217,87,0.08)' : 'rgba(255,255,255,0.02)',
              border:      pkg.featured
                ? '0.5px solid rgba(126,217,87,0.4)'
                : '0.5px solid var(--border, rgba(255,255,255,0.06))',
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(126,217,87,0.5)'
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = pkg.featured
                ? 'rgba(126,217,87,0.4)'
                : 'var(--border, rgba(255,255,255,0.06))'
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'none'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary, #f0f0f0)' }}>
                  {pkg.label}
                </span>
                {pkg.featured && (
                  <span style={{
                    fontSize: 9, padding: '1px 5px', borderRadius: 3,
                    background: 'rgba(126,217,87,0.15)', color: 'var(--accent, #7ed957)',
                    fontWeight: 700, letterSpacing: '.05em',
                  }}>
                    BEST VALUE
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted, #64748b)', marginTop: 1 }}>
                {pkg.sparks} Sparks
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent, #7ed957)', fontFamily: "'JetBrains Mono', monospace" }}>
              {pkg.price}
            </div>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ))}
      </div>

      <a
        href="https://0nmcp.com/sparks"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'block', textAlign: 'center',
          fontSize: 11, color: 'var(--text-muted, #64748b)', textDecoration: 'none',
          transition: 'color .15s',
        }}
        onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = 'var(--text-secondary, #94a3b8)' }}
        onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = 'var(--text-muted, #64748b)' }}
      >
        Manage Sparks → 0nmcp.com
      </a>
    </div>
  )
}

// ─── PuzzleIcon ───────────────────────────────────────────────────────────────

function PuzzleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
    </svg>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface DashboardRightSidebarProps {
  onOpenVault?: () => void
  connectedCount?: number
}

export default function DashboardRightSidebar({
  onOpenVault,
  connectedCount = 0,
}: DashboardRightSidebarProps) {
  const [open,       setOpen]       = useState(false)
  const [activeTab,  setActiveTab]  = useState<Tab>('connectors')
  const [connectors, setConnectors] = useState<ConnectedService[]>(CONNECTORS)
  const panelRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
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

      {/* Collapsed 40px strip */}
      <div style={{
        width: 40, height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 12, gap: 8,
        borderLeft: '1px solid var(--border, rgba(255,255,255,0.06))',
        background: 'var(--bg-card, #0e1117)', zIndex: 10, position: 'relative',
      }}>
        <button
          onClick={() => setOpen(p => !p)}
          title="Connectors & Sparks"
          style={{
            width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: open ? 'rgba(126,217,87,0.12)' : 'transparent',
            color: open ? 'var(--accent, #7ed957)' : 'var(--text-muted, #64748b)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            if (!open) {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary, #94a3b8)'
            }
          }}
          onMouseLeave={e => {
            if (!open) {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted, #64748b)'
            }
          }}
        >
          <PuzzleIcon size={16} />
        </button>

        {activeConnectedCount > 0 && (
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'rgba(126,217,87,0.12)', border: '1px solid rgba(126,217,87,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: 'var(--accent, #7ed957)', lineHeight: 1,
          }}>
            {activeConnectedCount > 99 ? '99+' : activeConnectedCount}
          </div>
        )}

        <button
          onClick={() => { setActiveTab('sparks'); setOpen(true) }}
          title="Sparks"
          style={{
            width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: (open && activeTab === 'sparks') ? 'rgba(126,217,87,0.12)' : 'transparent',
            color: (open && activeTab === 'sparks') ? 'var(--accent, #7ed957)' : 'var(--text-muted, #64748b)',
            transition: 'all 0.15s ease', marginTop: 4,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>
      </div>

      {/* 296px flyout panel */}
      <div style={{
        position: 'absolute', right: 40, top: 0, width: 296, height: '100%',
        background: 'var(--bg-card, #0e1117)',
        borderLeft: '1px solid var(--border, rgba(255,255,255,0.06))',
        boxShadow: open ? '-8px 0 32px rgba(0,0,0,0.5)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        opacity: open ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
        zIndex: 41, pointerEvents: open ? 'auto' : 'none',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 14px', height: 44,
          borderBottom: '0.5px solid var(--border, rgba(255,255,255,0.06))', flexShrink: 0,
        }}>
          <PuzzleIcon size={14} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #f0f0f0)', flex: 1 }}>
            0nMCP Extensions
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: 24, height: 24, borderRadius: 5, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--text-muted, #64748b)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '0.5px solid var(--border, rgba(255,255,255,0.06))',
          flexShrink: 0, padding: '0 6px',
        }}>
          <TabButton label="Connectors" active={activeTab === 'connectors'} onClick={() => setActiveTab('connectors')} />
          <TabButton label="Vault"      active={activeTab === 'vault'}      onClick={() => setActiveTab('vault')} />
          <TabButton label="⚡ Sparks"  active={activeTab === 'sparks'}     onClick={() => setActiveTab('sparks')} />
        </div>

        {/* Content */}
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
          {activeTab === 'sparks' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <SparksTab />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
