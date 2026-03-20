'use client'

import { useState, useRef, useCallback, type ReactNode } from 'react'
import { Icon0n, LogoConsole } from '@/components/BrandSVG'
import {
  LayoutDashboard, MessageSquare, KeyRound, Sparkles,
  Blocks, ShoppingBag, Brain, Zap, RefreshCw, Cpu,
  Mail, ListChecks, Linkedin, Share2, BarChart3,
  Store, User, Shield, PanelLeftClose, PanelLeft,
  Search, Globe, Terminal, Wrench, Users, LayoutGrid, Gift, PenLine,
} from 'lucide-react'
import { StatusDot } from './StatusDot'

export type SidebarMode = 'open' | 'hidden' | 'icons'

interface SidebarProps {
  view: string
  setView: (v: string) => void
  mode: SidebarMode
  onToggleMode: () => void
  connectedCount: number
  mcpOnline: boolean
  isAdmin?: boolean
}

interface NavItem {
  key: string
  label: string
  icon: ReactNode
  color?: string
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const G = '#7ed957'
const P = '#a78bfa'
const C = '#00d4ff'
const O = '#ff6b35'
const K = '#f472b6'
const S = '#64748b'

const SECTIONS: NavSection[] = [
  {
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, color: G },
      { key: 'chat', label: 'Chat', icon: <MessageSquare size={16} />, color: P },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { key: 'credentials', label: 'Vault', icon: <KeyRound size={16} />, color: G },
      { key: 'flows', label: 'Create', icon: <Sparkles size={16} />, color: P },
      { key: 'engine', label: '0nEngine', icon: <Cpu size={16} />, color: G },
      { key: 'site-builder', label: 'Site Builder', icon: <Globe size={16} />, color: O },
      { key: 'store', label: 'Store', icon: <ShoppingBag size={16} />, color: O },
    ],
  },
  {
    label: 'AI',
    items: [
      { key: 'training', label: 'Brain', icon: <Brain size={16} />, color: P },
      { key: 'spark', label: 'Spark Runner', icon: <Zap size={16} />, color: G },
      { key: 'sync', label: 'Sync', icon: <RefreshCw size={16} />, color: P },
    ],
  },
  {
    label: 'Content',
    items: [
      { key: 'blog', label: '0nBlog', icon: <PenLine size={16} />, color: G },
      { key: 'outreach', label: 'Enricher', icon: <Mail size={16} />, color: C },
      { key: 'listkit', label: 'ListKit', icon: <ListChecks size={16} />, color: C },
      { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} />, color: C },
    ],
  },
  {
    label: 'Operate',
    items: [
      { key: 'seo', label: 'SEO Engine', icon: <Search size={16} />, color: G },
      { key: 'social', label: 'Social', icon: <Share2 size={16} />, color: K },
      { key: 'reporting', label: 'Reporting', icon: <BarChart3 size={16} />, color: K },
      { key: 'vendor', label: 'Vendor Hub', icon: <Store size={16} />, color: O },
      { key: 'terminal', label: 'Terminal', icon: <Terminal size={16} />, color: S },
      { key: 'tools', label: 'Tools', icon: <Wrench size={16} />, color: S },
      { key: 'crew', label: '0nCrew', icon: <Users size={16} />, color: C },
      { key: 'grid', label: 'Grid', icon: <LayoutGrid size={16} />, color: G },
      { key: 'affiliate', label: 'Affiliates', icon: <Gift size={16} />, color: G },
    ],
  },
]

const BOTTOM_ITEMS: NavItem[] = [
  { key: 'account', label: 'Account', icon: <User size={16} />, color: S },
]

const ADMIN_ITEM: NavItem = { key: 'admin', label: 'Admin', icon: <Shield size={16} />, color: '#ef4444' }

function isActiveView(key: string, view: string): boolean {
  if (key === 'credentials') return view === 'vault'
  return key === view
}

export function Sidebar({ view, setView, mode, onToggleMode, connectedCount, mcpOnline, isAdmin }: SidebarProps) {
  const [hoverVisible, setHoverVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showLabels = mode === 'open' || (mode === 'hidden' && hoverVisible)
  const iconsOnly = mode === 'icons'
  const width = showLabels ? '13.5rem' : iconsOnly ? '3.5rem' : '13.5rem'

  // Items that navigate to separate routes instead of setting view state
  const ROUTE_ITEMS: Record<string, string> = { grid: '/grid', blog: '/blog' }

  const handleNav = useCallback((item: NavItem) => {
    const route = ROUTE_ITEMS[item.key]
    if (route) {
      window.location.href = route
      return
    }
    setView(item.key)
  }, [setView])

  const onHotzoneEnter = useCallback(() => {
    if (mode !== 'hidden') return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setHoverVisible(true)
  }, [mode])

  const onSidebarLeave = useCallback(() => {
    if (mode !== 'hidden') return
    hideTimer.current = setTimeout(() => setHoverVisible(false), 200)
  }, [mode])

  const onSidebarEnter = useCallback(() => {
    if (mode !== 'hidden') return
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }, [mode])

  const content = (
    <aside style={{
      width,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      background: '#0a0a0f',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: iconsOnly ? 'center' : 'flex-start',
        padding: iconsOnly ? '0 0.5rem' : '0 1.125rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        {iconsOnly ? (
          <Icon0n size={24} />
        ) : (
          <LogoConsole height={22} />
        )}
      </div>

      {/* Nav */}
      <nav className="sb-nav" style={{
        flex: 1,
        padding: '0.625rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: si < SECTIONS.length - 1 ? 2 : 0 }}>
            {section.label && showLabels && (
              <div style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.2)',
                padding: '0.875rem 0.75rem 0.375rem',
              }}>
                {section.label}
              </div>
            )}
            {iconsOnly && si > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '6px 10px' }} />
            )}
            {section.items.map(item => (
              <SidebarItem
                key={item.key}
                item={item}
                active={isActiveView(item.key, view)}
                showLabels={showLabels}
                iconsOnly={iconsOnly}
                onClick={() => handleNav(item)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{
        padding: '0.375rem 0.5rem 0.5rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        {BOTTOM_ITEMS.map(item => (
          <SidebarItem
            key={item.key}
            item={item}
            active={isActiveView(item.key, view)}
            showLabels={showLabels}
            iconsOnly={iconsOnly}
            onClick={() => handleNav(item)}
          />
        ))}
        {isAdmin && (
          <SidebarItem
            item={ADMIN_ITEM}
            active={isActiveView('admin', view)}
            showLabels={showLabels}
            iconsOnly={iconsOnly}
            onClick={() => handleNav(ADMIN_ITEM)}
          />
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: iconsOnly ? 'center' : 'space-between',
          padding: '0.625rem 0.625rem 0.25rem',
          marginTop: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status={mcpOnline ? 'online' : 'offline'} />
            {showLabels && (
              <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.25)' }}>
                {connectedCount} connected
              </span>
            )}
          </div>
          <button
            onClick={onToggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.15)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {iconsOnly || !showLabels ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      <style>{`
        .sb-nav::-webkit-scrollbar { width: 2px; }
        .sb-nav::-webkit-scrollbar-track { background: transparent; }
        .sb-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 2px; }
      `}</style>
    </aside>
  )

  if (mode === 'hidden') {
    return (
      <div style={{ position: 'relative', width: 0, flexShrink: 0, height: '100%', zIndex: 100 }}>
        <div
          onMouseEnter={onHotzoneEnter}
          style={{ position: 'fixed', left: 0, top: 0, width: 6, height: '100%', zIndex: 101 }}
        />
        <div
          onMouseEnter={onSidebarEnter}
          onMouseLeave={onSidebarLeave}
          style={{
            position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 100,
            transform: hoverVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s ease',
            boxShadow: hoverVisible ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          {content}
        </div>
      </div>
    )
  }

  return content
}

/* ────────── Nav Item ────────── */

function SidebarItem({ item, active, showLabels, iconsOnly, onClick }: {
  item: NavItem
  active: boolean
  showLabels: boolean
  iconsOnly: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const c = item.color || '#7ed957'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: iconsOnly ? '8px 0' : '7px 10px',
          justifyContent: iconsOnly ? 'center' : 'flex-start',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          background: active ? `${c}10` : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          borderLeft: iconsOnly ? 'none' : active ? `2px solid ${c}` : '2px solid transparent',
          transition: 'all 0.12s ease',
          color: active ? c : hovered ? '#e2e2e8' : '#808090',
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex', opacity: active ? 1 : 0.65 }}>
          {item.icon}
        </span>
        {showLabels && (
          <span style={{
            fontSize: '0.8rem',
            fontWeight: active ? 600 : 450,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}>
            {item.label}
          </span>
        )}
      </button>

      {iconsOnly && hovered && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 8px)',
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#14141c',
          color: c,
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          border: `1px solid ${c}20`,
          zIndex: 200,
          pointerEvents: 'none',
        }}>
          {item.label}
        </div>
      )}
    </div>
  )
}
