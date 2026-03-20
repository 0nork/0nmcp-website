'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Cpu, Brain, PenLine, ShoppingBag, Users, BarChart3,
  MessageSquare, KeyRound, Settings, Zap, Globe, Search,
  LayoutGrid, Gift, Mail, Share2, ChevronRight, GripVertical,
  Plus, X,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────── */

interface Module {
  id: string
  label: string
  desc: string
  href: string
  icon: React.ReactNode
  color: string
  enabled: boolean
}

interface QuickAction {
  label: string
  href: string
  icon: React.ReactNode
}

/* ─── Module Registry ────────────────────────────────────── */

const ALL_MODULES: Module[] = [
  { id: 'engine',     label: '0nEngine',         desc: 'Build AI agents that think and execute',   href: '/0nengine',       icon: <Cpu size={22} />,         color: '#7ed957', enabled: true },
  { id: 'crm',        label: 'CRM',              desc: 'Contacts, deals, conversations',           href: '/dashboard/crm',  icon: <Users size={22} />,       color: '#00d4ff', enabled: true },
  { id: 'blog',       label: '0nBlog',           desc: 'AI-generated content engine',              href: '/blog',           icon: <PenLine size={22} />,     color: '#a78bfa', enabled: true },
  { id: 'social',     label: 'Social Publisher',  desc: 'Post to all platforms at once',            href: '/dashboard/social', icon: <Share2 size={22} />,    color: '#f472b6', enabled: true },
  { id: 'brain',      label: 'Knowledge Base',    desc: 'Train your personal AI',                  href: '/dashboard/brain',  icon: <Brain size={22} />,     color: '#fbbf24', enabled: true },
  { id: 'store',      label: 'Module Shop',       desc: 'Browse tools and workflows',              href: '/dashboard/store',  icon: <ShoppingBag size={22} />, color: '#f97316', enabled: false },
  { id: 'seo',        label: 'SEO Engine',        desc: 'Search optimization tools',               href: '/dashboard/seo',    icon: <Search size={22} />,    color: '#34d399', enabled: false },
  { id: 'analytics',  label: 'Analytics',         desc: 'Track performance across channels',       href: '/dashboard/analytics', icon: <BarChart3 size={22} />, color: '#60a5fa', enabled: false },
  { id: 'email',      label: 'Email Campaigns',   desc: 'Drip sequences and broadcasts',           href: '/dashboard/email',  icon: <Mail size={22} />,      color: '#fb7185', enabled: false },
  { id: 'grid',       label: 'Grid Community',    desc: 'Connect with other builders',             href: '/dashboard/grid',   icon: <LayoutGrid size={22} />, color: '#7ed957', enabled: true },
  { id: 'affiliates', label: 'Affiliates',        desc: 'Refer and earn commissions',              href: '/dashboard/affiliates', icon: <Gift size={22} />,  color: '#c084fc', enabled: false },
]

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Contacts',          href: '/dashboard/crm',    icon: <Users size={18} /> },
  { label: '0nEngine Builder',  href: '/0nengine',         icon: <Cpu size={18} /> },
  { label: 'Social Publisher',  href: '/dashboard/social', icon: <Share2 size={18} /> },
  { label: 'Blog Generator',    href: '/blog',             icon: <PenLine size={18} /> },
  { label: 'Knowledge Base',    href: '/dashboard/brain',  icon: <Brain size={18} /> },
  { label: 'Analytics',         href: '/dashboard/analytics', icon: <BarChart3 size={18} /> },
]

/* ─── Styles ─────────────────────────────────────────────── */

const BG = '#0f1419'
const CARD = '#1a2332'
const CARD_BORDER = '#243042'
const TEXT = '#e1e8f0'
const TEXT_DIM = '#7d8a9a'
const TEXT_MUTED = '#4a5568'
const ACCENT = '#7ed957'

/* ─── Component ──────────────────────────────────────────── */

export default function DashboardPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [editing, setEditing] = useState(false)
  const [userName, setUserName] = useState('')
  const [plan, setPlan] = useState('free')

  // Load user data + module preferences
  useEffect(() => {
    // Load saved module state from localStorage
    const saved = localStorage.getItem('0n_dashboard_modules')
    if (saved) {
      try {
        const savedIds: Record<string, boolean> = JSON.parse(saved)
        setModules(ALL_MODULES.map(m => ({ ...m, enabled: savedIds[m.id] ?? m.enabled })))
      } catch {
        setModules(ALL_MODULES)
      }
    } else {
      setModules(ALL_MODULES)
    }

    // Fetch user info
    fetch('/api/console/health')
      .then(r => r.json())
      .then(d => {
        if (d.user?.name) setUserName(d.user.name.split(' ')[0])
        if (d.user?.plan) setPlan(d.user.plan)
      })
      .catch(() => {})
  }, [])

  const toggleModule = useCallback((id: string) => {
    setModules(prev => {
      const next = prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m)
      const state: Record<string, boolean> = {}
      next.forEach(m => { state[m.id] = m.enabled })
      localStorage.setItem('0n_dashboard_modules', JSON.stringify(state))
      return next
    })
  }, [])

  const enabledModules = modules.filter(m => m.enabled)
  const disabledModules = modules.filter(m => !m.enabled)

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>

      {/* ── Top Bar ──────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.75rem',
        borderBottom: `1px solid ${CARD_BORDER}`,
        background: BG,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={110} height={38} style={{ objectFit: 'contain' }} priority />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/dashboard/store" style={{ color: TEXT_DIM, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Module Shop</Link>
          <Link href="/dashboard/billing" style={{ color: TEXT_DIM, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Billing</Link>
          <div style={{
            padding: '0.375rem 0.875rem', borderRadius: '8px',
            background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)',
            fontSize: '0.75rem', fontWeight: 700, color: ACCENT,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {plan}
          </div>
        </nav>
      </header>

      <div style={{ display: 'flex', maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.75rem', gap: '2rem' }}>

        {/* ── Main Content ────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* Welcome */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: TEXT, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
              My <span style={{ color: ACCENT }}>0nMCP</span>
            </h1>
            <p style={{ fontSize: '1rem', color: TEXT_DIM, margin: 0 }}>
              {userName ? `Welcome back, ${userName}.` : 'Your active modules and AI-powered tools'}
            </p>
          </div>

          {/* Active Modules Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Your Active Modules</h2>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                padding: '0.4rem 0.875rem', borderRadius: '8px', border: `1px solid ${CARD_BORDER}`,
                background: editing ? 'rgba(126,217,87,0.1)' : 'transparent',
                color: editing ? ACCENT : TEXT_DIM,
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {editing ? 'Done' : 'Customize'}
            </button>
          </div>

          {/* Module Grid */}
          {enabledModules.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {enabledModules.map(mod => (
                <ModuleCard key={mod.id} mod={mod} editing={editing} onToggle={toggleModule} />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '3rem', textAlign: 'center', borderRadius: '16px',
              border: `1px dashed ${CARD_BORDER}`, background: `${CARD}44`,
              marginBottom: '2rem',
            }}>
              <ShoppingBag size={40} style={{ color: TEXT_MUTED, margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: TEXT, margin: '0 0 0.375rem' }}>You haven&apos;t added any modules yet</p>
              <p style={{ fontSize: '0.875rem', color: TEXT_DIM, margin: '0 0 1.25rem' }}>Click &quot;Customize&quot; to enable modules, or browse the shop.</p>
              <Link href="/dashboard/store" style={{
                display: 'inline-block', padding: '0.625rem 1.5rem', borderRadius: '10px',
                background: ACCENT, color: '#000', fontWeight: 700, fontSize: '0.875rem',
                textDecoration: 'none',
              }}>
                Browse Module Shop
              </Link>
            </div>
          )}

          {/* Available Modules (when editing) */}
          {editing && disabledModules.length > 0 && (
            <>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: TEXT_DIM, margin: '0 0 0.75rem' }}>Available Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                {disabledModules.map(mod => (
                  <ModuleCard key={mod.id} mod={mod} editing={editing} onToggle={toggleModule} disabled />
                ))}
              </div>
            </>
          )}

        </main>

        {/* ── Right Sidebar ───────────────────────── */}
        <aside style={{ width: '260px', flexShrink: 0 }}>

          {/* Quick Actions */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: TEXT_MUTED, margin: '0 0 0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              Quick Actions
              <Settings size={14} style={{ color: TEXT_MUTED }} />
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {QUICK_ACTIONS.map(action => (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.75rem', borderRadius: '10px',
                    color: TEXT, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${CARD}`)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: TEXT_DIM }}>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: CARD_BORDER, margin: '0.5rem 0 1.25rem' }} />

          {/* Contact Insights */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: TEXT_MUTED, margin: '0 0 0.75rem',
            }}>
              Contact Insights
            </h3>
            <p style={{ fontSize: '0.8125rem', color: TEXT_DIM, margin: 0 }}>
              Select a location to view contacts
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: CARD_BORDER, margin: '0.5rem 0 1.25rem' }} />

          {/* Settings + Builder CTA */}
          <Link
            href="/dashboard/settings"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.75rem', borderRadius: '8px',
              color: TEXT_DIM, textDecoration: 'none', fontSize: '0.875rem',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = TEXT_DIM)}
          >
            <Settings size={16} /> Settings
          </Link>

          <Link
            href="/0nengine"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem', borderRadius: '12px', marginTop: '0.75rem',
              background: `linear-gradient(135deg, ${ACCENT}, #00d4ff)`,
              color: '#000', fontWeight: 700, fontSize: '0.875rem',
              textDecoration: 'none', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Zap size={16} /> Open Builder
          </Link>
        </aside>
      </div>
    </div>
  )
}

/* ─── Module Card ────────────────────────────────────────── */

function ModuleCard({ mod, editing, onToggle, disabled }: {
  mod: Module; editing: boolean; onToggle: (id: string) => void; disabled?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1rem 1.25rem', borderRadius: '14px',
      background: disabled ? `${CARD}88` : CARD,
      border: `1px solid ${disabled ? `${CARD_BORDER}88` : CARD_BORDER}`,
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s',
      cursor: editing ? 'pointer' : 'default',
      position: 'relative',
    }}
      onClick={() => editing && onToggle(mod.id)}
      onMouseEnter={e => {
        if (!editing) e.currentTarget.style.borderColor = `${mod.color}44`
      }}
      onMouseLeave={e => {
        if (!editing) e.currentTarget.style.borderColor = CARD_BORDER
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '12px',
        background: `${mod.color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: mod.color, flexShrink: 0,
      }}>
        {mod.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: disabled ? TEXT_DIM : TEXT, marginBottom: '0.125rem' }}>
          {mod.label}
        </div>
        <div style={{ fontSize: '0.8125rem', color: TEXT_DIM, lineHeight: 1.4 }}>
          {mod.desc}
        </div>
      </div>

      {/* Action */}
      {editing ? (
        <div style={{
          width: 28, height: 28, borderRadius: '8px',
          background: mod.enabled ? `${ACCENT}22` : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${mod.enabled ? ACCENT : CARD_BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {mod.enabled ? (
            <X size={14} style={{ color: ACCENT }} />
          ) : (
            <Plus size={14} style={{ color: TEXT_MUTED }} />
          )}
        </div>
      ) : (
        <Link href={mod.href} onClick={e => e.stopPropagation()} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <ChevronRight size={18} style={{ color: TEXT_MUTED }} />
        </Link>
      )}
    </div>
  )
}
