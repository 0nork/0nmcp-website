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

// ─── Sub-components ─────────────────────────────────────────────────────────

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 py-2.5 text-xs cursor-pointer border-b-2 transition-all duration-200 bg-transparent border-x-0 border-t-0 font-[inherit]',
        active
          ? 'font-semibold tracking-[0.01em] text-[#6EE05A] border-b-[#6EE05A]'
          : 'font-normal text-[#5f6672] border-b-transparent',
      ].join(' ')}
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
        className="object-contain rounded-[6px] shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="rounded-[6px] shrink-0 bg-[rgba(110,224,90,0.12)] flex items-center justify-center text-[10px] font-bold text-[#6EE05A]"
      style={{ width: size, height: size }}
    >
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
      className={[
        'flex flex-col gap-2 p-3 rounded-[10px] border transition-all duration-200 relative overflow-hidden',
        connector.connected
          ? 'border-[rgba(110,224,90,0.3)] bg-[rgba(126,217,87,0.04)] cursor-default'
          : hovered
          ? 'border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] cursor-pointer'
          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] cursor-pointer',
      ].join(' ')}
    >
      {/* Top row: logo + status */}
      <div className="flex items-start justify-between">
        <ServiceLogo id={connector.id} size={32} />
        {connector.connected ? (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#6EE05A]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6EE05A] shadow-[0_0_6px_#6EE05A]" />
            Active
          </div>
        ) : (
          <div className={[
            'text-[10px] font-medium px-2 py-0.5 rounded transition-all duration-200 border',
            hovered
              ? 'bg-[rgba(110,224,90,0.12)] text-[#6EE05A] border-[rgba(110,224,90,0.3)]'
              : 'bg-transparent text-[#5f6672] border-transparent',
          ].join(' ')}>
            Connect
          </div>
        )}
      </div>

      {/* Name + description */}
      <div>
        <div className="text-xs font-semibold text-[#e8eaed] leading-tight">
          {connector.name}
        </div>
        <div className="text-[10px] text-[#5f6672] mt-0.5 leading-snug">
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
    <div className="flex flex-col h-full">

      {/* Header stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.07)] shrink-0">
        <div className="text-xs text-[#7A8290]">
          <span className="font-bold text-[#6EE05A] text-base">{connectedCount}</span>
          <span className="ml-1">of {CONNECTORS.length}</span>
        </div>
        <button
          onClick={onOpenVault}
          className="text-[11px] px-3 py-[5px] rounded-[6px] bg-[rgba(110,224,90,0.12)] border border-[rgba(110,224,90,0.3)] text-[#6EE05A] cursor-pointer font-[inherit] font-semibold transition-all duration-150 hover:bg-[rgba(110,224,90,0.2)]"
        >
          + Import
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] transition-colors duration-200">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#5f6672" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search connectors..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-[#e8eaed] font-[inherit] placeholder:text-[#5f6672]"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="bg-transparent border-none cursor-pointer text-[#5f6672] p-0 flex"
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 px-4 pb-2.5 flex-wrap shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={[
              'text-[11px] px-2.5 py-1 rounded-[6px] cursor-pointer font-[inherit] transition-all duration-150 border',
              category === cat
                ? 'bg-[rgba(110,224,90,0.12)] border-[rgba(110,224,90,0.3)] text-[#6EE05A] font-semibold'
                : 'bg-transparent border-[rgba(255,255,255,0.06)] text-[#5f6672] font-normal',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Connector grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 flex flex-col gap-2">
        {connected.length > 0 && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6EE05A] py-2 pb-1">
              Connected
            </div>
            <div className="grid grid-cols-2 gap-2">
              {connected.map(c => (
                <ConnectorCard key={c.id} connector={c} onConnect={onConnect} />
              ))}
            </div>
            <div className="h-1" />
          </>
        )}

        {notConnected.length > 0 && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#5f6672] py-2 pb-1">
              Available
            </div>
            <div className="grid grid-cols-2 gap-2">
              {notConnected.map(c => (
                <ConnectorCard key={c.id} connector={c} onConnect={onConnect} />
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-[#5f6672] text-sm">
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
    { label: 'SWITCH files',  value: loading ? '-' : String(summary?.workflows  ?? 0), color: '#6EE05A' },
    { label: 'Brand assets',  value: loading ? '-' : String(summary?.brand      ?? 0), color: '#a78bfa' },
    { label: 'Credentials',   value: loading ? '-' : String(summary?.credentials ?? 0), color: '#00d4ff' },
    { label: 'Total files',   value: loading ? '-' : String(summary?.total      ?? 0), color: '#ff6b35' },
  ]

  return (
    <div className="p-4 flex flex-col gap-3.5">

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map(s => (
          <div key={s.label} className="p-3.5 rounded-[10px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <div className="text-[22px] font-black leading-none" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[10px] text-[#5f6672] mt-1.5 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* .0n info card */}
      <div className="p-3.5 rounded-[10px] bg-[rgba(126,217,87,0.04)] border border-[rgba(126,217,87,0.15)]">
        <div className="text-xs font-bold text-[#6EE05A] mb-1.5">
          .0n file format
        </div>
        <div className="text-[11px] text-[#7A8290] leading-relaxed">
          SWITCH files are executable .0n workflow definitions.
          Build in the visual builder, run anywhere.
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onOpenVault}
          className="px-4 py-[11px] rounded-lg border-none bg-[#6EE05A] text-[#080B0F] text-[13px] font-bold cursor-pointer font-[inherit] transition-all duration-150 hover:opacity-85"
        >
          Open Vault
        </button>
        <a
          href="/builder"
          className="block px-4 py-2.5 rounded-lg border border-[rgba(255,255,255,0.06)] text-[#7A8290] bg-transparent text-xs font-medium text-center no-underline transition-all duration-150 hover:border-[rgba(255,255,255,0.12)] hover:text-[#e8eaed]"
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
    <div className="p-4 flex flex-col gap-3.5">

      {/* Balance card */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-[rgba(126,217,87,0.08)] to-[rgba(0,212,255,0.04)] border border-[rgba(110,224,90,0.3)] text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[rgba(126,217,87,0.65)] mb-2">
          Credit balance
        </div>
        <div className="text-[40px] font-black text-[#6EE05A] leading-none font-mono [text-shadow:0_0_20px_rgba(126,217,87,0.2)]">
          {balance === null ? '-' : balance.toLocaleString()}
        </div>
        <div className="text-[11px] text-[#5f6672] mt-1.5">
          {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
        </div>
      </div>

      <div className="text-xs text-[#7A8290] leading-relaxed">
        Each workflow execution costs 1-5 credits. Purchase below to keep building.
      </div>

      {/* Package cards */}
      <div className="flex flex-col gap-2">
        {CREDIT_PACKAGES.map(pkg => (
          <button
            key={pkg.key}
            onClick={() => handlePurchase(pkg)}
            disabled={purchasing === pkg.key}
            className={[
              'flex items-center gap-3 px-3.5 py-3 rounded-[10px] border transition-all duration-200 cursor-pointer font-[inherit] text-left w-full',
              'hover:border-[rgba(110,224,90,0.3)] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
              pkg.featured
                ? 'bg-[rgba(126,217,87,0.06)] border-[rgba(110,224,90,0.3)]'
                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]',
              purchasing === pkg.key ? 'opacity-60 cursor-wait' : '',
            ].join(' ')}
          >
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-[#e8eaed]">
                  {pkg.label}
                </span>
                {pkg.featured && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(110,224,90,0.12)] text-[#6EE05A] font-bold tracking-[0.04em]">
                    POPULAR
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#5f6672] mt-0.5">
                {pkg.credits} credits
              </div>
            </div>
            <div className="text-sm font-bold text-[#080B0F] bg-[#6EE05A] px-3 py-[5px] rounded-[6px] font-mono">
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
      className={direction === 'right' ? 'rotate-180' : ''}>
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
    <div ref={panelRef} className="relative shrink-0 h-full">

      {/* ── Floating trigger strip ──────────────────────────────────────────── */}
      <div className="w-11 h-full flex flex-col items-center pt-4 gap-1.5 bg-transparent z-10 relative">
        {/* Main toggle */}
        <button
          className={[
            'sidebar-trigger-pulse w-9 h-9 rounded-[11px] border cursor-pointer flex items-center justify-center transition-all duration-200 relative',
            open
              ? 'border-[rgba(110,224,90,0.3)] bg-[rgba(110,224,90,0.12)] text-[#6EE05A]'
              : 'border-[rgba(126,217,87,0.2)] bg-[rgba(126,217,87,0.06)] text-[#8ee86a] hover:bg-[rgba(126,217,87,0.15)] hover:text-[#6EE05A] hover:border-[rgba(110,224,90,0.3)]',
          ].join(' ')}
          onClick={() => setOpen(p => !p)}
          title="Extensions"
        >
          <PuzzleIcon size={17} />
          {/* Badge */}
          {activeConnectedCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6EE05A] text-[#080B0F] text-[9px] font-black flex items-center justify-center leading-none shadow-[0_0_8px_rgba(126,217,87,0.4)]">
              {activeConnectedCount > 9 ? '9+' : activeConnectedCount}
            </div>
          )}
        </button>

        {/* Credits shortcut */}
        <button
          onClick={() => { setActiveTab('credits'); setOpen(true) }}
          title="Credits"
          className={[
            'w-[34px] h-[34px] rounded-[10px] border cursor-pointer flex items-center justify-center transition-all duration-200',
            open && activeTab === 'credits'
              ? 'border-[rgba(110,224,90,0.3)] bg-[rgba(110,224,90,0.12)] text-[#6EE05A]'
              : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#5f6672] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#7A8290]',
          ].join(' ')}
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
          className={[
            'w-[34px] h-[34px] rounded-[10px] border cursor-pointer flex items-center justify-center transition-all duration-200',
            open && activeTab === 'vault'
              ? 'border-[rgba(110,224,90,0.3)] bg-[rgba(110,224,90,0.12)] text-[#6EE05A]'
              : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#5f6672] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#7A8290]',
          ].join(' ')}
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
        className="fixed right-14 top-[60px] bottom-3 w-[360px] rounded-2xl border border-[rgba(255,255,255,0.07)] flex flex-col overflow-hidden z-[100]"
        style={{
          background: 'rgba(12, 14, 20, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: open
            ? '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--bg-card) inset'
            : 'none',
          transform: open ? 'translateX(0) scale(1)' : 'translateX(16px) scale(0.97)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, box-shadow 0.3s ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Panel header */}
        <div className="flex items-center gap-2.5 px-[18px] py-3.5 border-b border-[rgba(255,255,255,0.07)] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[rgba(110,224,90,0.12)] flex items-center justify-center text-[#6EE05A]">
            <PuzzleIcon size={14} />
          </div>
          <span className="text-sm font-bold text-[#e8eaed] flex-1 tracking-[-0.01em]">
            Extensions
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent cursor-pointer text-[#5f6672] flex items-center justify-center p-0 transition-all duration-150 hover:bg-[rgba(255,255,255,0.06)] hover:text-[#7A8290]"
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(255,255,255,0.07)] shrink-0 px-3">
          <TabButton label="Connectors" active={activeTab === 'connectors'} onClick={() => setActiveTab('connectors')} />
          <TabButton label="Vault" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} />
          <TabButton label="Credits" active={activeTab === 'credits'} onClick={() => setActiveTab('credits')} />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'connectors' && (
            <ConnectorsTab
              connectors={connectors}
              connectedCount={activeConnectedCount}
              onConnect={handleConnect}
              onOpenVault={handleOpenVault}
            />
          )}
          {activeTab === 'vault' && (
            <div className="flex-1 overflow-y-auto">
              <VaultTab onOpenVault={handleOpenVault} />
            </div>
          )}
          {activeTab === 'credits' && (
            <div className="flex-1 overflow-y-auto">
              <CreditsTab />
            </div>
          )}
        </div>
      </div>

      {/* Pulse animation for trigger buttons */}
      <style>{`
        @keyframes sidebarPulseLoop {
          0%, 90% { box-shadow: 0 0 0 0 rgba(110, 224, 90, 0); }
          93% { box-shadow: 0 0 0 8px rgba(110, 224, 90, 0.35); }
          96% { box-shadow: 0 0 0 0 rgba(110, 224, 90, 0); }
          98% { box-shadow: 0 0 0 8px rgba(110, 224, 90, 0.25); }
          100% { box-shadow: 0 0 0 0 rgba(110, 224, 90, 0); }
        }
        .sidebar-trigger-pulse {
          animation: sidebarPulseLoop 30s ease-in-out infinite;
          animation-delay: 10s;
        }
      `}</style>
    </div>
  )
}
