'use client'

import { useState, useRef, useCallback, type ReactNode } from 'react'
import { Icon0n } from '@/components/BrandSVG'
import Image from 'next/image'
import {
  LayoutDashboard, MessageSquare, KeyRound, Sparkles,
  Blocks, ShoppingBag, Brain, Zap, RefreshCw, Cpu,
  Mail, ListChecks, Linkedin, Share2, BarChart3,
  Store, User, Shield, PanelLeftClose, PanelLeft,
  Search, Globe, Terminal, Wrench, Users, LayoutGrid, Gift, PenLine, Download,
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
  isPaid?: boolean
}

interface NavItem {
  key: string
  label: string
  icon: ReactNode
  color?: string
  paidOnly?: boolean
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const G = '#6EE05A'
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
      { key: 'downloads', label: 'Downloads', icon: <Download size={16} />, color: G },
    ],
  },
  {
    label: 'AI',
    items: [
      { key: 'training', label: 'Brain', icon: <Brain size={16} />, color: P },
      { key: 'runs', label: 'Spark Runner', icon: <Zap size={16} />, color: G },
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
      { key: 'grid', label: 'Grid', icon: <LayoutGrid size={16} />, color: G, paidOnly: true },
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

export function Sidebar({ view, setView, mode, onToggleMode, connectedCount, mcpOnline, isAdmin, isPaid }: SidebarProps) {
  const [hoverVisible, setHoverVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showLabels = mode === 'open' || (mode === 'hidden' && hoverVisible)
  const iconsOnly = mode === 'icons'
  const width = showLabels ? '13.5rem' : iconsOnly ? '3.5rem' : '13.5rem'

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
    <aside
      className="flex flex-col shrink-0 bg-[var(--bg-primary)] border-r border-[var(--border)] overflow-hidden h-full transition-[width] duration-200 ease-[ease]"
      style={{ width }}
    >
      {/* Logo */}
      <div
        className={`h-14 flex items-center border-b border-[var(--border)] shrink-0 ${iconsOnly ? 'justify-center px-2' : 'justify-start px-[1.125rem]'}`}
      >
        {iconsOnly ? (
          <Icon0n size={24} />
        ) : (
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={120} height={42} className="object-contain" priority />
        )}
      </div>

      {/* Nav */}
      <nav className="sb-nav flex-1 py-2.5 px-2 flex flex-col gap-px overflow-y-auto overflow-x-hidden">
        {SECTIONS.map((section, si) => (
          <div key={si} className={si < SECTIONS.length - 1 ? 'mb-0.5' : ''}>
            {section.label && showLabels && (
              <div className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/20 px-3 pt-3.5 pb-1.5">
                {section.label}
              </div>
            )}
            {iconsOnly && si > 0 && (
              <div className="h-px bg-[var(--bg-card)] my-1.5 mx-2.5" />
            )}
            {section.items.filter(item => !item.paidOnly || isPaid).map(item => (
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
      <div className="px-2 pt-1.5 pb-2 border-t border-[var(--border)] shrink-0">
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

        <div className={`flex items-center px-2.5 pt-2.5 pb-1 mt-1 ${iconsOnly ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-1.5">
            <StatusDot status={mcpOnline ? 'online' : 'offline'} />
            {showLabels && (
              <span className="text-[0.625rem] text-white/25">
                {connectedCount} connected
              </span>
            )}
          </div>
          <button
            onClick={onToggleMode}
            className="bg-transparent border-none text-[var(--border-hover)] cursor-pointer p-1 rounded flex items-center"
          >
            {iconsOnly || !showLabels ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>
      </div>

      <style>{`
        .sb-nav::-webkit-scrollbar { width: 2px; }
        .sb-nav::-webkit-scrollbar-track { background: transparent; }
        .sb-nav::-webkit-scrollbar-thumb { background: var(--bg-card); border-radius: 2px; }
      `}</style>
    </aside>
  )

  if (mode === 'hidden') {
    return (
      <div className="relative w-0 shrink-0 h-full z-[100]">
        <div
          onMouseEnter={onHotzoneEnter}
          className="fixed left-0 top-0 w-1.5 h-full z-[101]"
        />
        <div
          onMouseEnter={onSidebarEnter}
          onMouseLeave={onSidebarLeave}
          className="fixed left-0 top-0 h-full z-[100] transition-transform duration-[0.25s] ease-[ease]"
          style={{
            transform: hoverVisible ? 'translateX(0)' : 'translateX(-100%)',
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
  const c = item.color || '#6EE05A'

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center gap-2.5 rounded-lg border-none cursor-pointer font-[inherit] transition-all duration-[0.12s] ease-[ease]"
        style={{
          padding: iconsOnly ? '8px 0' : '7px 10px',
          justifyContent: iconsOnly ? 'center' : 'flex-start',
          background: active ? `${c}10` : hovered ? 'var(--bg-card)' : 'transparent',
          borderLeft: iconsOnly ? 'none' : active ? `2px solid ${c}` : '2px solid transparent',
          color: active ? c : hovered ? '#e2e2e8' : '#808090',
        }}
      >
        <span className="shrink-0 flex" style={{ opacity: active ? 1 : 0.65 }}>
          {item.icon}
        </span>
        {showLabels && (
          <span className="text-[0.8rem] whitespace-nowrap overflow-hidden" style={{ fontWeight: active ? 600 : 450 }}>
            {item.label}
          </span>
        )}
      </button>

      {iconsOnly && hovered && (
        <div
          className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 text-[0.7rem] font-semibold px-2.5 py-1 rounded-[6px] whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-[200] pointer-events-none border bg-[var(--bg-card)]"
          style={{ color: c, borderColor: `${c}20` }}
        >
          {item.label}
        </div>
      )}
    </div>
  )
}
