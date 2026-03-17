'use client'

import { useState, useRef, useCallback, useEffect, createContext, useContext, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Icon0n, LogoConsole } from '@/components/BrandSVG'
import {
  LayoutDashboard, MessageSquare, KeyRound, Sparkles,
  Blocks, ShoppingBag, Brain, Zap, RefreshCw,
  Mail, ListChecks, Linkedin, Share2, BarChart3,
  Store, User, Shield, PanelLeftClose, PanelLeft,
  Search, Globe, Terminal, Wrench, Users,
} from 'lucide-react'
import { StatusDot } from '@/components/console/StatusDot'

/* ────────── Types ────────── */

export type SidebarMode = 'open' | 'hidden' | 'icons'

interface NavItem {
  key: string
  label: string
  icon: ReactNode
  color?: string
  route?: string        // actual route to navigate to
  viewParam?: string    // ?view= param for /console SPA views
}

interface NavSection {
  label?: string
  items: NavItem[]
}

/* ────────── Context ────────── */

interface BackendSidebarState {
  mode: SidebarMode
  setMode: (m: SidebarMode) => void
  connectedCount: number
  mcpOnline: boolean
  isAdmin: boolean
}

const BackendSidebarContext = createContext<BackendSidebarState>({
  mode: 'open',
  setMode: () => {},
  connectedCount: 0,
  mcpOnline: false,
  isAdmin: false,
})

export function BackendSidebarProvider({
  children,
  connectedCount,
  mcpOnline,
  isAdmin,
}: {
  children: ReactNode
  connectedCount: number
  mcpOnline: boolean
  isAdmin: boolean
}) {
  const [mode, setMode] = useState<SidebarMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('0n-sidebar-mode') as SidebarMode) || 'open'
    }
    return 'open'
  })

  const handleSetMode = useCallback((m: SidebarMode) => {
    setMode(m)
    if (typeof window !== 'undefined') {
      localStorage.setItem('0n-sidebar-mode', m)
    }
  }, [])

  return (
    <BackendSidebarContext.Provider value={{ mode, setMode: handleSetMode, connectedCount, mcpOnline, isAdmin }}>
      {children}
    </BackendSidebarContext.Provider>
  )
}

export function useSidebarContext() {
  return useContext(BackendSidebarContext)
}

/* ────────── Colors ────────── */

const G = '#7ed957'
const P = '#a78bfa'
const C = '#00d4ff'
const O = '#ff6b35'
const K = '#f472b6'
const S = '#64748b'

/* ────────── Route Mapping ────────── */

const SECTIONS: NavSection[] = [
  {
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, color: G, route: '/console' },
      { key: 'chat', label: 'Chat', icon: <MessageSquare size={16} />, color: P, route: '/console', viewParam: 'chat' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { key: 'credentials', label: 'Vault', icon: <KeyRound size={16} />, color: G, route: '/console/vault' },
      { key: 'flows', label: 'Create', icon: <Sparkles size={16} />, color: P, route: '/console', viewParam: 'flows' },
      { key: 'builder', label: 'Builder', icon: <Blocks size={16} />, color: P, route: '/builder' },
      { key: 'site-builder', label: 'Site Builder', icon: <Globe size={16} />, color: O, route: '/console', viewParam: 'site-builder' },
      { key: 'store', label: 'Store', icon: <ShoppingBag size={16} />, color: O, route: '/console/marketplace' },
    ],
  },
  {
    label: 'AI',
    items: [
      { key: 'ai-employee', label: 'AI Employee', icon: <Zap size={16} />, color: G, route: '/console/ai-employee' },
      { key: 'training', label: 'Brain', icon: <Brain size={16} />, color: P, route: '/console', viewParam: 'training' },
      { key: 'sync', label: 'Sync', icon: <RefreshCw size={16} />, color: P, route: '/console', viewParam: 'sync' },
    ],
  },
  {
    label: 'Outreach',
    items: [
      { key: 'facebook-ads', label: 'Facebook Ads', icon: <Share2 size={16} />, color: '#1877F2', route: '/console/facebook-ads' },
      { key: 'outreach', label: 'Enricher', icon: <Mail size={16} />, color: C, route: '/console', viewParam: 'outreach' },
      { key: 'listkit', label: 'ListKit', icon: <ListChecks size={16} />, color: C, route: '/console', viewParam: 'listkit' },
      { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} />, color: C, route: '/console', viewParam: 'linkedin' },
    ],
  },
  {
    label: 'Operate',
    items: [
      { key: 'seo', label: 'SEO Engine', icon: <Search size={16} />, color: G, route: '/console', viewParam: 'seo' },
      { key: 'social', label: 'Social', icon: <Share2 size={16} />, color: K, route: '/console', viewParam: 'social' },
      { key: 'reporting', label: 'Reporting', icon: <BarChart3 size={16} />, color: K, route: '/console', viewParam: 'reporting' },
      { key: 'vendor', label: 'Vendor Hub', icon: <Store size={16} />, color: O, route: '/console', viewParam: 'vendor' },
      { key: 'terminal', label: 'Terminal', icon: <Terminal size={16} />, color: S, route: '/console/terminal' },
      { key: 'tools', label: 'Tools', icon: <Wrench size={16} />, color: S, route: '/console/tools' },
      { key: 'crew', label: '0nCrew', icon: <Users size={16} />, color: C, route: '/console/crew' },
    ],
  },
]

const BOTTOM_ITEMS: NavItem[] = [
  { key: 'account', label: 'Account', icon: <User size={16} />, color: S, route: '/console', viewParam: 'account' },
]

const ADMIN_ITEM: NavItem = { key: 'admin', label: 'Admin', icon: <Shield size={16} />, color: '#ef4444', route: '/admin' }

/* ────────── Active Detection ────────── */

function getActiveKey(pathname: string, searchParams: URLSearchParams): string {
  // Exact route matches first
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/builder')) return 'builder'
  if (pathname.startsWith('/console/vault')) return 'credentials'
  if (pathname.startsWith('/console/marketplace')) return 'store'
  if (pathname.startsWith('/console/workflows')) return 'store'
  if (pathname.startsWith('/console/terminal')) return 'terminal'
  if (pathname.startsWith('/console/tools')) return 'tools'
  if (pathname.startsWith('/console/facebook-ads')) return 'facebook-ads'
  if (pathname.startsWith('/console/ai-employee')) return 'ai-employee'
  if (pathname.startsWith('/console/crew')) return 'crew'

  // /console with ?view= param
  if (pathname === '/console') {
    const view = searchParams.get('view')
    if (view) return view
    return 'dashboard'
  }

  return 'dashboard'
}

/* ────────── Main Component ────────── */

export function BackendSidebar() {
  const { mode, setMode, connectedCount, mcpOnline, isAdmin } = useSidebarContext()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [hoverVisible, setHoverVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeKey = getActiveKey(pathname, searchParams)
  const showLabels = mode === 'open' || (mode === 'hidden' && hoverVisible)
  const iconsOnly = mode === 'icons'
  const width = showLabels ? '13.5rem' : iconsOnly ? '3.5rem' : '13.5rem'

  const handleToggleMode = useCallback(() => {
    setMode(
      mode === 'open' ? 'hidden' :
      mode === 'hidden' ? 'icons' :
      'open'
    )
  }, [mode, setMode])

  const handleNav = useCallback((item: NavItem) => {
    if (item.viewParam) {
      // Navigate to /console with ?view= param
      router.push(`/console?view=${item.viewParam}`)
    } else if (item.route) {
      router.push(item.route)
    }
  }, [router])

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
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: iconsOnly ? 'center' : 'flex-start',
        padding: iconsOnly ? '0 0.5rem' : '0 1.125rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push('/console')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          {iconsOnly ? (
            <Icon0n size={24} />
          ) : (
            <LogoConsole height={22} />
          )}
        </button>
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
                color: section.items[0]?.color ? `${section.items[0].color}66` : 'rgba(255,255,255,0.2)',
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
                active={item.key === activeKey}
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
            active={item.key === activeKey}
            showLabels={showLabels}
            iconsOnly={iconsOnly}
            onClick={() => handleNav(item)}
          />
        ))}
        {isAdmin && (
          <SidebarItem
            item={ADMIN_ITEM}
            active={activeKey === 'admin'}
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
            onClick={handleToggleMode}
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
          color: active ? c : hovered ? '#e2e2e8' : '#9a9aaa',
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex', color: active ? c : hovered ? c : `${c}99`, opacity: active ? 1 : 0.8 }}>
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
