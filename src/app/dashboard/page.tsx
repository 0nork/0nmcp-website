'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Cpu, Brain, PenLine, ShoppingBag, Users, BarChart3,
  Settings, Zap, Search, LayoutGrid, Gift, Mail, Share2,
  ChevronRight, Plus, X, Menu, Home, Star, ArrowRight,
  Play, Pause, Circle,
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

/* ─── Mini Engine Flow Templates (IFTTT-style) ───────────── */

const FLOW_TEMPLATES = [
  {
    id: 'welcome',
    label: 'Welcome Flow',
    trigger: { icon: <Users size={14} />, label: 'New Contact', color: '#00d4ff' },
    actions: [
      { icon: <Mail size={14} />, label: 'Send Email', color: '#fb7185' },
      { icon: <Share2 size={14} />, label: 'Notify Slack', color: '#f472b6' },
    ],
    active: true,
  },
  {
    id: 'social',
    label: 'Auto Post',
    trigger: { icon: <PenLine size={14} />, label: 'Blog Published', color: '#a78bfa' },
    actions: [
      { icon: <Share2 size={14} />, label: 'Post LinkedIn', color: '#0077b5' },
      { icon: <Share2 size={14} />, label: 'Post X', color: '#fff' },
    ],
    active: true,
  },
  {
    id: 'lead',
    label: 'Lead Scoring',
    trigger: { icon: <Search size={14} />, label: 'Page Visited', color: '#34d399' },
    actions: [
      { icon: <Cpu size={14} />, label: 'Score Lead', color: '#7ed957' },
      { icon: <Users size={14} />, label: 'Update CRM', color: '#00d4ff' },
    ],
    active: false,
  },
  {
    id: 'onboard',
    label: 'Onboarding',
    trigger: { icon: <Zap size={14} />, label: 'User Signs Up', color: '#7ed957' },
    actions: [
      { icon: <Brain size={14} />, label: 'Create Profile', color: '#fbbf24' },
      { icon: <Mail size={14} />, label: 'Welcome Email', color: '#fb7185' },
      { icon: <Users size={14} />, label: 'Add to CRM', color: '#00d4ff' },
    ],
    active: true,
  },
]

/* ─── Component ──────────────────────────────────────────── */

export default function DashboardPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [editing, setEditing] = useState(false)
  const [userName, setUserName] = useState('')
  const [plan, setPlan] = useState('free')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
        .flow-card {
          transition: all 0.2s ease;
        }
        .flow-card:hover {
          background: rgba(255,255,255,0.04) !important;
          transform: translateX(2px);
        }
        @media (max-width: 768px) {
          .dash-left-sidebar { display: none !important; }
          .dash-main { padding: 1rem !important; }
          .dash-header-nav { display: none !important; }
          .dash-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .dash-mobile-btn { display: none !important; }
          .dash-mobile-nav { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0f1419', color: '#e1e8f0', fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>

        {/* ══════ HEADER ══════════════════════════════════════ */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', height: '56px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(15,20,25,0.95)', backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="dash-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: '#7d8a9a', cursor: 'pointer', padding: '0.25rem', display: 'none' }}>
              <Menu size={22} />
            </button>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex' }}>
              <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={100} height={35} style={{ objectFit: 'contain' }} priority />
            </Link>
          </div>

          {/* Center nav — key links */}
          <nav className="dash-header-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { label: 'Dashboard', href: '/dashboard', active: true },
              { label: 'Engine', href: '/0nengine' },
              { label: 'Grid', href: '/dashboard/grid' },
              { label: 'Marketplace', href: '/dashboard/store' },
              { label: 'Courses', href: '/learn' },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{
                padding: '0.4rem 0.875rem', borderRadius: '8px',
                color: item.active ? '#7ed957' : 'rgba(255,255,255,0.5)',
                background: item.active ? 'rgba(126,217,87,0.08)' : 'transparent',
                textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600,
                transition: 'all 0.15s',
              }}>{item.label}</Link>
            ))}
          </nav>

          {/* Right — plan badge + settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.25rem 0.625rem', borderRadius: '6px',
              background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.15)',
              fontSize: '0.625rem', fontWeight: 700, color: '#7ed957',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{plan}</div>
            <Link href="/dashboard/settings" style={{ color: '#4a5568', display: 'flex' }}>
              <Settings size={18} />
            </Link>
          </div>
        </header>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="dash-mobile-nav" style={{ background: '#151d27', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem' }}>
            {[
              { label: 'Engine', href: '/0nengine' },
              { label: 'Grid', href: '/dashboard/grid' },
              { label: 'Marketplace', href: '/dashboard/store' },
              { label: 'Courses', href: '/learn' },
              { label: 'Settings', href: '/dashboard/settings' },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{
                display: 'block', padding: '0.75rem 1rem', color: '#e1e8f0', textDecoration: 'none',
                fontSize: '0.9375rem', fontWeight: 500, borderRadius: '8px',
              }}>{item.label}</Link>
            ))}
          </div>
        )}

        {/* ══════ LAYOUT: LEFT SIDEBAR + MAIN ════════════════ */}
        <div style={{ display: 'flex', width: '100%', minHeight: 'calc(100vh - 56px - 52px)' }}>

          {/* ── LEFT SIDEBAR — Mini 0nEngine (IFTTT-style) ─── */}
          <aside className="dash-left-sidebar" style={{
            width: sidebarCollapsed ? '52px' : '260px',
            flexShrink: 0,
            background: '#0b1015',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem',
            display: 'flex', flexDirection: 'column',
            transition: 'width 0.25s ease',
            overflow: 'hidden',
          }}>
            {/* Sidebar header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1rem', padding: '0 0.25rem',
            }}>
              {!sidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={14} style={{ color: '#7ed957' }} />
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: '#7ed957',
                  }}>0nEngine</span>
                </div>
              )}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
                background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer',
                padding: '0.25rem', display: 'flex',
              }}>
                <ChevronRight size={14} style={{ transform: sidebarCollapsed ? 'rotate(0)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </button>
            </div>

            {/* Flow cards */}
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                {FLOW_TEMPLATES.map(flow => (
                  <div key={flow.id} className="flow-card" style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                  }}>
                    {/* Flow header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e1e8f0' }}>{flow.label}</span>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: flow.active ? '#7ed957' : '#4a5568',
                        boxShadow: flow.active ? '0 0 6px rgba(126,217,87,0.5)' : 'none',
                      }} />
                    </div>

                    {/* Trigger → Actions chain */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {/* Trigger */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.375rem 0.5rem', borderRadius: '6px',
                        background: `${flow.trigger.color}10`,
                        border: `1px solid ${flow.trigger.color}20`,
                      }}>
                        <span style={{ color: flow.trigger.color, display: 'flex' }}>{flow.trigger.icon}</span>
                        <span style={{ fontSize: '0.6875rem', color: flow.trigger.color, fontWeight: 600 }}>
                          {flow.trigger.label}
                        </span>
                      </div>

                      {/* Connector line */}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '1px', height: '8px', background: 'rgba(255,255,255,0.1)' }} />
                      </div>

                      {/* Actions */}
                      {flow.actions.map((action, i) => (
                        <div key={i}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.375rem 0.5rem', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                          }}>
                            <span style={{ color: action.color, display: 'flex' }}>{action.icon}</span>
                            <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                              {action.label}
                            </span>
                          </div>
                          {i < flow.actions.length - 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <div style={{ width: '1px', height: '4px', background: 'rgba(255,255,255,0.06)' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Create new flow CTA */}
                <Link href="/0nengine" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  padding: '0.625rem', borderRadius: '10px', marginTop: '0.5rem',
                  border: '1px dashed rgba(126,217,87,0.2)',
                  color: '#7ed957', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}>
                  <Plus size={14} /> New Flow
                </Link>
              </div>
            )}

            {/* Collapsed state — just icons */}
            {sidebarCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {FLOW_TEMPLATES.map(flow => (
                  <div key={flow.id} title={flow.label} style={{
                    width: 32, height: 32, borderRadius: '8px',
                    background: flow.active ? 'rgba(126,217,87,0.08)' : 'rgba(255,255,255,0.02)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <Circle size={8} fill={flow.active ? '#7ed957' : '#4a5568'} stroke="none" />
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* ── MAIN CONTENT ────────────────────────────────── */}
          <main className="dash-main" style={{ flex: 1, padding: '2rem 2.5rem', minWidth: 0, overflowY: 'auto' }}>
            <div style={{ maxWidth: '960px' }}>
              {/* Welcome */}
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#e1e8f0', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
                  My <span style={{ color: '#7ed957' }}>0nMCP</span>
                </h1>
                <p style={{ fontSize: '0.9375rem', color: '#7d8a9a', margin: 0 }}>
                  {userName ? `Welcome back, ${userName}.` : 'Your plugins and AI-powered tools'}
                </p>
              </div>

              {/* Add0ns Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Your Add0ns</h2>
                <button onClick={() => setEditing(!editing)} style={{
                  padding: '0.375rem 0.75rem', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: editing ? 'rgba(126,217,87,0.1)' : 'transparent',
                  color: editing ? '#7ed957' : '#7d8a9a',
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
                  border: '1px dashed rgba(255,255,255,0.06)', marginBottom: '2rem',
                }}>
                  <ShoppingBag size={36} style={{ color: '#4a5568', margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#e1e8f0', margin: '0 0 0.25rem' }}>No Add0ns installed yet</p>
                  <p style={{ fontSize: '0.875rem', color: '#7d8a9a', margin: '0 0 1rem' }}>Tap Manage to install plugins.</p>
                  <Link href="/dashboard/store" style={{
                    display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '10px',
                    background: '#7ed957', color: '#0f1419', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
                  }}>Browse Marketplace</Link>
                </div>
              )}

              {/* Available Plugins (editing) */}
              {editing && disabledPlugins.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7d8a9a', margin: '0 0 0.75rem' }}>Available Plugins</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                    {disabledPlugins.map(p => (
                      <PluginCard key={p.id} plugin={p} editing={editing} onToggle={togglePlugin} disabled />
                    ))}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>

        {/* ══════ FOOTER NAV ═════════════════════════════════ */}
        <footer style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: '#0b1015',
          gap: '0.25rem', flexWrap: 'wrap',
          position: 'sticky', bottom: 0, zIndex: 40,
        }}>
          {[
            { label: 'Dashboard', href: '/dashboard', icon: <Home size={14} />, active: true },
            { label: 'Engine', href: '/0nengine', icon: <Cpu size={14} /> },
            { label: 'Grid', href: '/dashboard/grid', icon: <LayoutGrid size={14} /> },
            { label: 'Courses', href: '/learn', icon: <Brain size={14} /> },
            { label: 'Marketplace', href: '/dashboard/store', icon: <ShoppingBag size={14} /> },
            { label: 'Affiliates', href: '/dashboard/affiliates', icon: <Gift size={14} /> },
            { label: 'Billing', href: '/dashboard/billing', icon: <BarChart3 size={14} /> },
            { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={14} /> },
          ].map(item => (
            <Link key={item.label} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.4rem 0.75rem', borderRadius: '6px',
              color: item.active ? '#7ed957' : '#4a5568',
              background: item.active ? 'rgba(126,217,87,0.06)' : 'transparent',
              textDecoration: 'none', fontSize: '0.6875rem', fontWeight: 600,
              transition: 'all 0.15s',
            }}>
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </footer>
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
          color: disabled ? '#7d8a9a' : '#e1e8f0', marginBottom: '0.15rem',
          transition: 'text-shadow 0.25s',
        }}>
          {plugin.label}
        </div>
        <div className="plugin-text" style={{
          fontSize: '0.8125rem', color: '#7d8a9a', lineHeight: 1.4,
          transition: 'text-shadow 0.25s',
        }}>
          {plugin.desc}
        </div>
      </div>
      {editing ? (
        <div style={{
          width: 28, height: 28, borderRadius: '8px',
          background: plugin.enabled ? 'rgba(126,217,87,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${plugin.enabled ? '#7ed957' : 'rgba(255,255,255,0.06)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {plugin.enabled ? <X size={14} style={{ color: '#7ed957' }} /> : <Plus size={14} style={{ color: '#4a5568' }} />}
        </div>
      ) : (
        <ChevronRight size={18} style={{ color: '#4a5568', flexShrink: 0 }} />
      )}
    </>
  )

  const cardStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1rem 1.25rem', borderRadius: '14px',
    background: '#1a2332',
    border: '1px solid rgba(255,255,255,0.06)',
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
