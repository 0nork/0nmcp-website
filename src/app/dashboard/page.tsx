'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Cpu, Brain, PenLine, ShoppingBag, Users, BarChart3,
  Settings, Zap, Search, LayoutGrid, Gift, Mail, Share2,
  ChevronRight, Plus, X, Menu, Home, Star,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────── */

interface Plugin {
  id: string
  label: string
  desc: string
  href: string
  icon: React.ReactNode
  color: string
  enabled: boolean
}

interface QuickLink {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  color: string
}

/* ─── Plugin Registry ────────────────────────────────────── */

const ALL_PLUGINS: Plugin[] = [
  { id: 'engine',     label: '0nEngine',         desc: 'Build AI agents that think and execute',   href: '/0nengine',            icon: <Cpu size={24} />,         color: '#7ed957', enabled: true },
  { id: 'crm',        label: 'CRM',              desc: 'Contacts, deals, conversations',           href: '/dashboard/crm',       icon: <Users size={24} />,       color: '#00d4ff', enabled: true },
  { id: 'social',     label: 'Social Publisher',  desc: 'Post to all platforms at once',            href: '/dashboard/social',    icon: <Share2 size={24} />,      color: '#f472b6', enabled: true },
  { id: 'blog',       label: '0nBlog',           desc: 'AI-generated content engine',              href: '/blog',                icon: <PenLine size={24} />,     color: '#a78bfa', enabled: true },
  { id: 'brain',      label: 'Knowledge Base',    desc: 'Train your personal AI',                  href: '/dashboard/brain',     icon: <Brain size={24} />,       color: '#fbbf24', enabled: true },
  { id: 'grid',       label: 'Grid Community',    desc: 'Connect with other builders',             href: '/dashboard/grid',      icon: <LayoutGrid size={24} />,  color: '#7ed957', enabled: true },
  { id: 'seo',        label: 'SEO Engine',        desc: 'Search optimization tools',               href: '/dashboard/seo',       icon: <Search size={24} />,      color: '#34d399', enabled: false },
  { id: 'analytics',  label: 'Analytics',         desc: 'Track performance across channels',       href: '/dashboard/analytics', icon: <BarChart3 size={24} />,   color: '#60a5fa', enabled: false },
  { id: 'email',      label: 'Email Campaigns',   desc: 'Drip sequences and broadcasts',           href: '/dashboard/email',     icon: <Mail size={24} />,        color: '#fb7185', enabled: false },
  { id: 'affiliates', label: 'Affiliates',        desc: 'Refer and earn commissions',              href: '/dashboard/affiliates', icon: <Gift size={24} />,       color: '#c084fc', enabled: false },
  { id: 'store',      label: 'Marketplace',       desc: 'Browse plugins and add0ns',               href: '/dashboard/store',     icon: <ShoppingBag size={24} />, color: '#f97316', enabled: false },
]

const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { id: 'contacts',  label: 'Contacts',     href: '/dashboard/crm',     icon: <Users size={18} />,    color: '#00d4ff' },
  { id: 'engine',    label: '0nEngine',      href: '/0nengine',          icon: <Cpu size={18} />,      color: '#7ed957' },
  { id: 'social',    label: 'Social',        href: '/dashboard/social',  icon: <Share2 size={18} />,   color: '#f472b6' },
  { id: 'blog',      label: 'Blog',          href: '/blog',              icon: <PenLine size={18} />,  color: '#a78bfa' },
  { id: 'kb',        label: 'Knowledge',     href: '/dashboard/brain',   icon: <Brain size={18} />,    color: '#fbbf24' },
  { id: 'analytics', label: 'Analytics',     href: '/dashboard/analytics', icon: <BarChart3 size={18} />, color: '#60a5fa' },
  { id: 'settings',  label: 'Settings',      href: '/dashboard/settings', icon: <Settings size={18} />, color: '#7d8a9a' },
  { id: 'admin',     label: 'Admin',         href: '/dashboard/admin',   icon: <Star size={18} />,     color: '#ff3d3d' },
]

/* ─── Colors ─────────────────────────────────────────────── */

const BG = '#0f1419'
const SIDEBAR_BG = '#000000'
const CARD = '#1a2332'
const CARD_BORDER = '#243042'
const TEXT = '#e1e8f0'
const TEXT_DIM = '#7d8a9a'
const TEXT_MUTED = '#4a5568'
const ACCENT = '#7ed957'

/* ─── Component ──────────────────────────────────────────── */

export default function DashboardPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [editing, setEditing] = useState(false)
  const [userName, setUserName] = useState('')
  const [plan, setPlan] = useState('free')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('0n_dashboard_addons')
    if (saved) {
      try {
        const savedIds: Record<string, boolean> = JSON.parse(saved)
        setPlugins(ALL_PLUGINS.map(m => ({ ...m, enabled: savedIds[m.id] ?? m.enabled })))
      } catch { setPlugins(ALL_PLUGINS) }
    } else {
      setPlugins(ALL_PLUGINS)
    }

    fetch('/api/console/health').then(r => r.json()).then(d => {
      if (d.user?.name) setUserName(d.user.name.split(' ')[0])
      if (d.user?.plan) setPlan(d.user.plan)
    }).catch(() => {})
  }, [])

  const togglePlugin = useCallback((id: string) => {
    setPlugins(prev => {
      const next = prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m)
      const state: Record<string, boolean> = {}
      next.forEach(m => { state[m.id] = m.enabled })
      localStorage.setItem('0n_dashboard_addons', JSON.stringify(state))
      return next
    })
  }, [])

  const enabledPlugins = plugins.filter(m => m.enabled)
  const disabledPlugins = plugins.filter(m => !m.enabled)

  return (
    <>
      <style>{`
        .plugin-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3);
        }
        .plugin-card:hover {
          transform: scale(0.98) translateY(1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 3px rgba(0,0,0,0.2);
        }
        .plugin-card:hover .plugin-text { text-shadow: 0 2px 8px rgba(0,0,0,0.8); }
        .plugin-card:hover .plugin-icon { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6)); }
        .plugin-card:active { transform: scale(0.96) translateY(2px); }
        .quick-btn {
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .quick-btn:hover {
          transform: scale(0.97) translateY(1px);
          box-shadow: 0 1px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(0,0,0,0.15);
        }
        .quick-btn:active { transform: scale(0.95); }
        @media (max-width: 768px) {
          .dash-sidebar { display: none !important; }
          .dash-main { padding: 1rem !important; }
          .dash-header-nav { display: none !important; }
          .dash-mobile-btn { display: flex !important; }
          .dash-layout { flex-direction: column !important; padding: 0 !important; }
        }
        @media (min-width: 769px) {
          .dash-mobile-btn { display: none !important; }
          .dash-mobile-nav { display: none !important; }
          .dash-mobile-bottom { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>

        {/* ── Header ───────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderBottom: `1px solid ${CARD_BORDER}`,
          background: BG, position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="dash-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: TEXT_DIM, cursor: 'pointer', padding: '0.25rem', display: 'none' }}>
              <Menu size={22} />
            </button>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex' }}>
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

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="dash-mobile-nav" style={{ background: CARD, borderBottom: `1px solid ${CARD_BORDER}`, padding: '0.5rem' }}>
            {[{ label: 'Marketplace', href: '/dashboard/store' }, { label: 'Billing', href: '/dashboard/billing' },
              { label: 'Settings', href: '/dashboard/settings' }, { label: 'Admin', href: '/dashboard/admin' }].map(item => (
              <Link key={item.label} href={item.href} style={{
                display: 'block', padding: '0.75rem 1rem', color: TEXT, textDecoration: 'none',
                fontSize: '0.9375rem', fontWeight: 500, borderRadius: '8px',
              }}>{item.label}</Link>
            ))}
          </div>
        )}

        {/* ── Layout ───────────────────────────────── */}
        <div className="dash-layout" style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 56px)' }}>

          {/* ── Main ───────────────────────────────── */}
          <main className="dash-main" style={{ flex: 1, padding: '2rem 2.5rem', minWidth: 0 }}>

            <div style={{ maxWidth: '960px' }}>
              {/* Welcome */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: TEXT, margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                  My <span style={{ color: ACCENT }}>0nMCP</span>
                </h1>
                <p style={{ fontSize: '0.9375rem', color: TEXT_DIM, margin: 0 }}>
                  {userName ? `Welcome back, ${userName}.` : 'Your plugins and AI-powered tools'}
                </p>
              </div>

              {/* Add0ns Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Your Add0ns</h2>
                <button onClick={() => setEditing(!editing)} style={{
                  padding: '0.375rem 0.75rem', borderRadius: '8px', border: `1px solid ${CARD_BORDER}`,
                  background: editing ? 'rgba(126,217,87,0.1)' : 'transparent',
                  color: editing ? ACCENT : TEXT_DIM,
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>{editing ? 'Done' : 'Manage'}</button>
              </div>

              {/* Plugin Grid */}
              {enabledPlugins.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {enabledPlugins.map(p => (
                    <PluginCard key={p.id} plugin={p} editing={editing} onToggle={togglePlugin} />
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '16px',
                  border: `1px dashed ${CARD_BORDER}`, marginBottom: '2rem',
                }}>
                  <ShoppingBag size={36} style={{ color: TEXT_MUTED, margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: TEXT, margin: '0 0 0.25rem' }}>No Add0ns installed yet</p>
                  <p style={{ fontSize: '0.875rem', color: TEXT_DIM, margin: '0 0 1rem' }}>Tap Manage to install plugins.</p>
                  <Link href="/dashboard/store" style={{
                    display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '10px',
                    background: ACCENT, color: '#000', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
                  }}>Browse Marketplace</Link>
                </div>
              )}

              {/* Available Plugins (editing) */}
              {editing && disabledPlugins.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT_DIM, margin: '0 0 0.75rem' }}>Available Plugins</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                    {disabledPlugins.map(p => (
                      <PluginCard key={p.id} plugin={p} editing={editing} onToggle={togglePlugin} disabled />
                    ))}
                  </div>
                </>
              )}
            </div>
          </main>

          {/* ── Right Sidebar — Quick Actions ──────── */}
          <aside className="dash-sidebar" style={{
            width: '220px', flexShrink: 0, background: SIDEBAR_BG,
            borderLeft: `1px solid ${CARD_BORDER}`,
            padding: '1.25rem 0.75rem',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: TEXT_MUTED, padding: '0 0.5rem',
              marginBottom: '0.75rem',
            }}>
              Quick Actions
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
              {DEFAULT_QUICK_LINKS.map(link => (
                <Link key={link.id} href={link.href} className="quick-btn" style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.75rem', borderRadius: '10px',
                  background: CARD, border: `1px solid ${CARD_BORDER}`,
                  color: TEXT, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600,
                }}>
                  <span style={{ color: link.color, display: 'flex' }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Builder CTA */}
            <Link href="/0nengine" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              padding: '0.75rem', borderRadius: '12px', marginTop: '0.75rem',
              background: `linear-gradient(135deg, ${ACCENT}, #00d4ff)`,
              color: '#000', fontWeight: 700, fontSize: '0.8125rem', textDecoration: 'none',
              boxShadow: `0 4px 20px rgba(126,217,87,0.25)`,
              transition: 'all 0.2s',
            }}>
              <Zap size={16} /> Open Builder
            </Link>
          </aside>
        </div>

        {/* ── Mobile Bottom Nav ─────────────────────── */}
        <nav className="dash-mobile-bottom" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
          background: '#000', borderTop: `1px solid ${CARD_BORDER}`, zIndex: 50,
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
            }}>{tab.icon}{tab.label}</Link>
          ))}
        </nav>
      </div>
    </>
  )
}

/* ─── Plugin Card ────────────────────────────────────────── */

function PluginCard({ plugin, editing, onToggle, disabled }: {
  plugin: Plugin; editing: boolean; onToggle: (id: string) => void; disabled?: boolean
}) {
  const content = (
    <>
      <div className="plugin-icon" style={{
        width: 48, height: 48, borderRadius: '14px',
        background: `${plugin.color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: plugin.color, flexShrink: 0,
        transition: 'filter 0.25s',
      }}>
        {plugin.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="plugin-text" style={{
          fontSize: '1rem', fontWeight: 700,
          color: disabled ? TEXT_DIM : TEXT, marginBottom: '0.15rem',
          transition: 'text-shadow 0.25s',
        }}>
          {plugin.label}
        </div>
        <div className="plugin-text" style={{
          fontSize: '0.8125rem', color: TEXT_DIM, lineHeight: 1.4,
          transition: 'text-shadow 0.25s',
        }}>
          {plugin.desc}
        </div>
      </div>
      {editing ? (
        <div style={{
          width: 28, height: 28, borderRadius: '8px',
          background: plugin.enabled ? `${ACCENT}22` : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${plugin.enabled ? ACCENT : CARD_BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {plugin.enabled ? <X size={14} style={{ color: ACCENT }} /> : <Plus size={14} style={{ color: TEXT_MUTED }} />}
        </div>
      ) : (
        <ChevronRight size={18} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
      )}
    </>
  )

  const cardStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem 1.25rem', borderRadius: '14px',
    background: CARD,
    border: `1px solid ${CARD_BORDER}`,
    opacity: disabled ? 0.5 : 1,
    cursor: 'pointer', width: '100%', textAlign: 'left',
    fontFamily: 'inherit', textDecoration: 'none',
    color: 'inherit',
  }

  if (editing) {
    return (
      <button className="plugin-card" onClick={() => onToggle(plugin.id)} style={cardStyle}>
        {content}
      </button>
    )
  }

  return (
    <Link href={plugin.href} className="plugin-card" style={cardStyle}>
      {content}
    </Link>
  )
}
