'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Cpu, Brain, PenLine, ShoppingBag, Users, BarChart3,
  Settings, Zap, Search, LayoutGrid, Gift, Mail, Share2,
  ChevronRight, Plus, X, Menu, Home,
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

/* ─── Plugin Registry (Add0ns) ───────────────────────────── */

const ALL_MODULES: Module[] = [
  // Core Plugins — enabled by default
  { id: 'engine',     label: '0nEngine',         desc: 'Build AI agents that think and execute',   href: '/0nengine',            icon: <Cpu size={22} />,         color: '#7ed957', enabled: true },
  { id: 'crm',        label: 'CRM',              desc: 'Contacts, deals, conversations',           href: '/dashboard/crm',       icon: <Users size={22} />,       color: '#00d4ff', enabled: true },
  { id: 'social',     label: 'Social Publisher',  desc: 'Post to all platforms at once',            href: '/dashboard/social',    icon: <Share2 size={22} />,      color: '#f472b6', enabled: true },
  { id: 'blog',       label: '0nBlog',           desc: 'AI-generated content engine',              href: '/blog',                icon: <PenLine size={22} />,     color: '#a78bfa', enabled: true },
  { id: 'brain',      label: 'Knowledge Base',    desc: 'Train your personal AI',                  href: '/dashboard/brain',     icon: <Brain size={22} />,       color: '#fbbf24', enabled: true },
  { id: 'grid',       label: 'Grid Community',    desc: 'Connect with other builders',             href: '/dashboard/grid',      icon: <LayoutGrid size={22} />,  color: '#7ed957', enabled: true },
  // Available Plugins — install to enable
  { id: 'seo',        label: 'SEO Engine',        desc: 'Search optimization tools',               href: '/dashboard/seo',       icon: <Search size={22} />,      color: '#34d399', enabled: false },
  { id: 'analytics',  label: 'Analytics',         desc: 'Track performance across channels',       href: '/dashboard/analytics', icon: <BarChart3 size={22} />,   color: '#60a5fa', enabled: false },
  { id: 'email',      label: 'Email Campaigns',   desc: 'Drip sequences and broadcasts',           href: '/dashboard/email',     icon: <Mail size={22} />,        color: '#fb7185', enabled: false },
  { id: 'affiliates', label: 'Affiliates',        desc: 'Refer and earn commissions',              href: '/dashboard/affiliates', icon: <Gift size={22} />,       color: '#c084fc', enabled: false },
  { id: 'store',      label: 'Marketplace',       desc: 'Browse plugins and tools',                href: '/dashboard/store',     icon: <ShoppingBag size={22} />, color: '#f97316', enabled: false },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('0n_dashboard_addons')
    if (saved) {
      try {
        const savedIds: Record<string, boolean> = JSON.parse(saved)
        setModules(ALL_MODULES.map(m => ({ ...m, enabled: savedIds[m.id] ?? m.enabled })))
      } catch { setModules(ALL_MODULES) }
    } else {
      setModules(ALL_MODULES)
    }

    fetch('/api/console/health').then(r => r.json()).then(d => {
      if (d.user?.name) setUserName(d.user.name.split(' ')[0])
      if (d.user?.plan) setPlan(d.user.plan)
    }).catch(() => {})
  }, [])

  const toggleModule = useCallback((id: string) => {
    setModules(prev => {
      const next = prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m)
      const state: Record<string, boolean> = {}
      next.forEach(m => { state[m.id] = m.enabled })
      localStorage.setItem('0n_dashboard_addons', JSON.stringify(state))
      return next
    })
  }, [])

  const enabledModules = modules.filter(m => m.enabled)
  const disabledModules = modules.filter(m => !m.enabled)

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar { display: none !important; }
          .dash-main { padding: 1rem !important; }
          .dash-header-nav { display: none !important; }
          .dash-mobile-menu-btn { display: flex !important; }
          .dash-layout { flex-direction: column !important; padding: 0 !important; }
          .dash-module-grid { grid-template-columns: 1fr !important; }
          .dash-welcome h1 { font-size: 1.375rem !important; }
        }
        @media (min-width: 769px) {
          .dash-mobile-menu-btn { display: none !important; }
          .dash-mobile-nav { display: none !important; }
          .dash-mobile-bottom { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>

        {/* ── Top Bar ──────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderBottom: `1px solid ${CARD_BORDER}`,
          background: BG, position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="dash-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: TEXT_DIM, cursor: 'pointer', padding: '0.25rem', display: 'none' }}
            >
              <Menu size={22} />
            </button>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={100} height={35} style={{ objectFit: 'contain' }} priority />
            </Link>
          </div>
          <nav className="dash-header-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/dashboard/store" style={{ color: TEXT_DIM, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Marketplace</Link>
            <Link href="/dashboard/billing" style={{ color: TEXT_DIM, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Billing</Link>
            <div style={{
              padding: '0.3rem 0.75rem', borderRadius: '8px',
              background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)',
              fontSize: '0.6875rem', fontWeight: 700, color: ACCENT,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{plan}</div>
          </nav>
        </header>

        {/* ── Mobile Dropdown Nav ──────────────────── */}
        {mobileMenuOpen && (
          <div className="dash-mobile-nav" style={{
            background: CARD, borderBottom: `1px solid ${CARD_BORDER}`,
            padding: '0.5rem',
          }}>
            {[
              { label: 'Marketplace', href: '/dashboard/store' },
              { label: 'Billing', href: '/dashboard/billing' },
              { label: 'Settings', href: '/dashboard/settings' },
              { label: 'Admin', href: '/dashboard/admin' },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{
                display: 'block', padding: '0.75rem 1rem', color: TEXT, textDecoration: 'none',
                fontSize: '0.9375rem', fontWeight: 500, borderRadius: '8px',
              }}>{item.label}</Link>
            ))}
          </div>
        )}

        {/* ── Layout ───────────────────────────────── */}
        <div className="dash-layout" style={{ display: 'flex', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem', gap: '2rem' }}>

          {/* ── Main Content ────────────────────────── */}
          <main className="dash-main" style={{ flex: 1, minWidth: 0, padding: 0 }}>

            {/* Welcome */}
            <div className="dash-welcome" style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: TEXT, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                My <span style={{ color: ACCENT }}>0nMCP</span>
              </h1>
              <p style={{ fontSize: '0.9375rem', color: TEXT_DIM, margin: 0 }}>
                {userName ? `Welcome back, ${userName}.` : 'Your plugins and AI-powered tools'}
              </p>
            </div>

            {/* Active Modules Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Your Add0ns</h2>
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: '8px', border: `1px solid ${CARD_BORDER}`,
                  background: editing ? 'rgba(126,217,87,0.1)' : 'transparent',
                  color: editing ? ACCENT : TEXT_DIM,
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {editing ? 'Done' : 'Manage'}
              </button>
            </div>

            {/* Module Grid */}
            {enabledModules.length > 0 ? (
              <div className="dash-module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {enabledModules.map(mod => (
                  <ModuleCard key={mod.id} mod={mod} editing={editing} onToggle={toggleModule} />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '14px',
                border: `1px dashed ${CARD_BORDER}`, background: `${CARD}44`,
                marginBottom: '1.5rem',
              }}>
                <ShoppingBag size={36} style={{ color: TEXT_MUTED, margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '1rem', fontWeight: 600, color: TEXT, margin: '0 0 0.25rem' }}>No Add0ns installed yet</p>
                <p style={{ fontSize: '0.875rem', color: TEXT_DIM, margin: '0 0 1rem' }}>Tap Manage to install plugins.</p>
                <Link href="/dashboard/store" style={{
                  display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '10px',
                  background: ACCENT, color: '#000', fontWeight: 700, fontSize: '0.875rem',
                  textDecoration: 'none',
                }}>Browse Marketplace</Link>
              </div>
            )}

            {/* Available Plugins (when editing) */}
            {editing && disabledModules.length > 0 && (
              <>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT_DIM, margin: '0 0 0.625rem' }}>Available Plugins</h3>
                <div className="dash-module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.625rem', marginBottom: '1.5rem' }}>
                  {disabledModules.map(mod => (
                    <ModuleCard key={mod.id} mod={mod} editing={editing} onToggle={toggleModule} disabled />
                  ))}
                </div>
              </>
            )}
          </main>

          {/* ── Right Sidebar (hidden on mobile) ──── */}
          <aside className="dash-sidebar" style={{ width: '240px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUTED, margin: '0 0 0.625rem', display: 'flex', justifyContent: 'space-between' }}>
              Quick Actions <Settings size={13} style={{ color: TEXT_MUTED }} />
            </div>
            {[
              { label: 'Contacts', href: '/dashboard/crm', icon: <Users size={17} /> },
              { label: '0nEngine', href: '/0nengine', icon: <Cpu size={17} /> },
              { label: 'Social', href: '/dashboard/social', icon: <Share2 size={17} /> },
              { label: 'Blog', href: '/blog', icon: <PenLine size={17} /> },
              { label: 'Knowledge Base', href: '/dashboard/brain', icon: <Brain size={17} /> },
              { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={17} /> },
            ].map(a => (
              <Link key={a.label} href={a.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5rem 0.625rem', borderRadius: '8px',
                color: TEXT, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500,
                transition: 'background 0.15s', marginBottom: '0.125rem',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = CARD)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: TEXT_DIM }}>{a.icon}</span> {a.label}
              </Link>
            ))}
            <div style={{ height: '1px', background: CARD_BORDER, margin: '0.75rem 0' }} />
            <Link href="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem', color: TEXT_DIM, textDecoration: 'none', fontSize: '0.8125rem' }}>
              <Settings size={15} /> Settings
            </Link>
            <Link href="/0nengine" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              padding: '0.625rem', borderRadius: '10px', marginTop: '0.5rem',
              background: `linear-gradient(135deg, ${ACCENT}, #00d4ff)`,
              color: '#000', fontWeight: 700, fontSize: '0.8125rem', textDecoration: 'none',
            }}>
              <Zap size={15} /> Open Builder
            </Link>
          </aside>
        </div>

        {/* ── Mobile Bottom Nav (app-style) ─────────── */}
        <nav className="dash-mobile-bottom" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
          background: CARD, borderTop: `1px solid ${CARD_BORDER}`,
          zIndex: 50,
        }}>
          {[
            { icon: <Home size={20} />, label: 'Home', href: '/dashboard', active: true },
            { icon: <Cpu size={20} />, label: 'Engine', href: '/0nengine', active: false },
            { icon: <LayoutGrid size={20} />, label: 'Grid', href: '/dashboard/grid', active: false },
            { icon: <PenLine size={20} />, label: 'Blog', href: '/blog', active: false },
            { icon: <Settings size={20} />, label: 'More', href: '/dashboard/admin', active: false },
          ].map(tab => (
            <Link key={tab.label} href={tab.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              color: tab.active ? ACCENT : TEXT_MUTED, textDecoration: 'none',
              fontSize: '0.625rem', fontWeight: 600, padding: '0.25rem 0.75rem',
            }}>
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

/* ─── Module Card ────────────────────────────────────────── */

function ModuleCard({ mod, editing, onToggle, disabled }: {
  mod: Module; editing: boolean; onToggle: (id: string) => void; disabled?: boolean
}) {
  const Wrapper = editing ? 'button' as const : 'div' as const
  const inner = (
    <>
      <div style={{
        width: 42, height: 42, borderRadius: '11px',
        background: `${mod.color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: mod.color, flexShrink: 0,
      }}>
        {mod.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: disabled ? TEXT_DIM : TEXT, marginBottom: '0.1rem' }}>
          {mod.label}
        </div>
        <div style={{ fontSize: '0.8125rem', color: TEXT_DIM, lineHeight: 1.4 }}>
          {mod.desc}
        </div>
      </div>
      {editing ? (
        <div style={{
          width: 26, height: 26, borderRadius: '7px',
          background: mod.enabled ? `${ACCENT}22` : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${mod.enabled ? ACCENT : CARD_BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {mod.enabled ? <X size={13} style={{ color: ACCENT }} /> : <Plus size={13} style={{ color: TEXT_MUTED }} />}
        </div>
      ) : (
        <Link href={mod.href} onClick={e => e.stopPropagation()} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <ChevronRight size={18} style={{ color: TEXT_MUTED }} />
        </Link>
      )}
    </>
  )

  const style: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '0.875rem 1rem', borderRadius: '12px',
    background: disabled ? `${CARD}88` : CARD,
    border: `1px solid ${disabled ? `${CARD_BORDER}88` : CARD_BORDER}`,
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s', cursor: editing ? 'pointer' : 'default',
    width: '100%', textAlign: 'left' as const, fontFamily: 'inherit',
  }

  if (editing) {
    return <Wrapper onClick={() => onToggle(mod.id)} style={style}>{inner}</Wrapper>
  }
  return <div style={style}>{inner}</div>
}
