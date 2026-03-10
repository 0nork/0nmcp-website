'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronRight, PanelLeftClose, ChevronDown } from 'lucide-react'
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

// Helper: encode an SVG path string into a data URI img src
// Dual-color: white stroke with colored accent fill/glow
const svg = (paths: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  )}`

// Dual-tone SVG: primary path in white, accent detail in color
const svgDual = (whitePaths: string, colorPaths: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g stroke="#e5e5e5">${whitePaths}</g><g stroke="${color}">${colorPaths}</g></svg>`
  )}`

/* ──────────────────────────────────────────── */
/*  Category Colors                            */
/* ──────────────────────────────────────────── */

const CAT_COLORS = {
  command:    '#7ed957',  // brand green — core home
  ai:        '#a78bfa',  // purple — AI & generation
  outreach:  '#00d4ff',  // cyan — outreach & prospecting
  market:    '#ff6b35',  // orange — marketplace & commerce
  ops:       '#f472b6',  // pink — operations & social
  tools:     '#facc15',  // yellow — utilities & tools
  system:    '#64748b',  // slate — account & admin
}

/* ──────────────────────────────────────────── */
/*  Categorized Navigation                     */
/* ──────────────────────────────────────────── */

interface NavItem {
  key: string
  label: string
  logo: string
  href?: string
}

interface NavCategory {
  id: string
  label: string
  color: string
  items: NavItem[]
  adminOnly?: boolean
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'command',
    label: 'Command',
    color: CAT_COLORS.command,
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        logo: '/brand/icon-green.png',
      },
      {
        key: 'credentials',
        label: 'Credentials',
        logo: svgDual(
          '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
          '',
          CAT_COLORS.command
        ),
      },
      {
        key: 'spark',
        label: 'Spark Runner',
        logo: svgDual(
          '',
          '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
          CAT_COLORS.command
        ),
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI Studio',
    color: CAT_COLORS.ai,
    items: [
      {
        key: 'chat',
        label: 'Chat',
        logo: svgDual(
          '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
          '<circle cx="12" cy="10" r="1"/><circle cx="8" cy="10" r="1"/><circle cx="16" cy="10" r="1"/>',
          CAT_COLORS.ai
        ),
      },
      {
        key: 'flows',
        label: 'Create',
        logo: svgDual(
          '<circle cx="12" cy="12" r="10"/>',
          '<line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
          CAT_COLORS.ai
        ),
      },
      {
        key: 'builder',
        label: 'AI Builder',
        logo: svgDual(
          '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>',
          '<line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
          CAT_COLORS.ai
        ),
      },
      {
        key: 'training',
        label: 'Brain',
        logo: svgDual(
          '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
          '<path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/>',
          CAT_COLORS.ai
        ),
      },
    ],
  },
  {
    id: 'outreach',
    label: 'Outreach',
    color: CAT_COLORS.outreach,
    items: [
      {
        key: 'outreach',
        label: 'Enricher',
        logo: svgDual(
          '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>',
          '<polyline points="22,6 12,13 2,6"/>',
          CAT_COLORS.outreach
        ),
      },
      {
        key: 'listkit',
        label: 'ListKit',
        logo: svgDual(
          '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
          '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>',
          CAT_COLORS.outreach
        ),
      },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        logo: svgDual(
          '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>',
          '<rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
          CAT_COLORS.outreach
        ),
        href: '/console/linkedin',
      },
    ],
  },
  {
    id: 'market',
    label: 'Marketplace',
    color: CAT_COLORS.market,
    items: [
      {
        key: 'store',
        label: 'Store',
        logo: svgDual(
          '<path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z"/><line x1="3" y1="7" x2="21" y2="7"/>',
          '<path d="M16 11a4 4 0 0 1-8 0"/>',
          CAT_COLORS.market
        ),
      },
      {
        key: 'vendor',
        label: 'Vendor Hub',
        logo: svgDual(
          '<line x1="12" y1="1" x2="12" y2="23"/>',
          '<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
          CAT_COLORS.market
        ),
      },
    ],
  },
  {
    id: 'ops',
    label: 'Operations',
    color: CAT_COLORS.ops,
    items: [
      {
        key: 'social',
        label: 'Social',
        logo: svgDual(
          '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>',
          '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
          CAT_COLORS.ops
        ),
        href: '/console/social',
      },
      {
        key: 'operations',
        label: 'Ops Center',
        logo: svgDual(
          '<circle cx="12" cy="12" r="3"/>',
          '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
          CAT_COLORS.ops
        ),
        href: '/console/operations',
      },
      {
        key: 'crew',
        label: '0nCrew',
        logo: svgDual(
          '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
          '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
          CAT_COLORS.ops
        ),
        href: '/console/crew',
      },
      {
        key: 'reporting',
        label: 'Reporting',
        logo: svgDual(
          '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>',
          '<line x1="6" y1="20" x2="6" y2="14"/>',
          CAT_COLORS.ops
        ),
        href: '/console/reporting',
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    color: CAT_COLORS.tools,
    items: [
      {
        key: 'tools',
        label: 'Tool Suite',
        logo: svgDual(
          '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
          '',
          CAT_COLORS.tools
        ),
        href: '/console/tools',
      },
      {
        key: 'convert',
        label: 'Converter',
        logo: svgDual(
          '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>',
          '<polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>',
          CAT_COLORS.tools
        ),
        href: '/console/convert',
      },
      {
        key: 'migrate',
        label: 'Migrate',
        logo: svgDual(
          '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>',
          '<path d="M16 2v4"/><path d="M8 2v4"/><line x1="7" y1="13" x2="17" y2="13"/>',
          CAT_COLORS.tools
        ),
        href: '/console/migrate',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    color: CAT_COLORS.system,
    items: [
      {
        key: 'account',
        label: 'Account',
        logo: svgDual(
          '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
          '<circle cx="12" cy="7" r="4"/>',
          CAT_COLORS.system
        ),
      },
    ],
  },
]

// Admin category appended when isAdmin
const ADMIN_CATEGORY: NavCategory = {
  id: 'admin',
  label: 'Admin',
  color: '#ef4444',
  adminOnly: true,
  items: [
    {
      key: 'admin',
      label: 'Admin Panel',
      logo: svgDual(
        '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        '',
        '#ef4444'
      ),
    },
  ],
}

const TRANSITION = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

/** Cycle order: open -> hidden -> icons -> open */
function getToggleIcon(mode: SidebarMode) {
  switch (mode) {
    case 'open':
      return PanelLeftClose
    case 'hidden':
      return ChevronRight
    case 'icons':
      return ChevronRight
  }
}

function getToggleLabel(mode: SidebarMode) {
  switch (mode) {
    case 'open':
      return 'Hide'
    case 'hidden':
      return 'Icons'
    case 'icons':
      return 'Expand'
  }
}

export function Sidebar({
  view,
  setView,
  mode,
  onToggleMode,
  connectedCount,
  mcpOnline,
  isAdmin,
}: SidebarProps) {
  const [hoverVisible, setHoverVisible] = useState(false)
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['command', 'ai', 'outreach', 'market', 'ops', 'tools', 'system'])
  )
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showLabels = mode === 'open' || (mode === 'hidden' && hoverVisible)
  const showIcons = mode === 'icons'

  const categories = isAdmin
    ? [...NAV_CATEGORIES, ADMIN_CATEGORY]
    : NAV_CATEGORIES

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Find which category the current view belongs to (for icon mode)
  const activeCategory = categories.find(cat =>
    cat.items.some(item => !item.href && item.key === view)
  )

  const sidebarWidth = showLabels ? '16rem' : showIcons ? '4rem' : '16rem'

  const handleHotzoneEnter = useCallback(() => {
    if (mode !== 'hidden') return
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    setHoverVisible(true)
  }, [mode])

  const handleSidebarLeave = useCallback(() => {
    if (mode !== 'hidden') return
    hideTimerRef.current = setTimeout(() => {
      setHoverVisible(false)
    }, 200)
  }, [mode])

  const handleSidebarEnter = useCallback(() => {
    if (mode !== 'hidden') return
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [mode])

  // ---- Render the sidebar content ----
  const sidebarContent = (
    <aside
      style={{
        width: sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        backgroundColor: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transition: TRANSITION,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: showIcons ? 'center' : 'flex-start',
          height: '3.5rem',
          padding: showIcons ? '0 0.5rem' : '0 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: TRANSITION,
        }}
      >
        {showIcons ? (
          <img
            src="/brand/icon-green.png"
            alt="0n"
            style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', objectFit: 'contain' }}
          />
        ) : (
          <img
            src="/brand/0n-console.png"
            alt="0n Console"
            style={{ height: '1.75rem', objectFit: 'contain' }}
          />
        )}
      </div>

      {/* Navigation with categories */}
      <nav
        style={{
          flex: 1,
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        className="sidebar-scroll"
      >
        {categories.map((cat) => (
          <CategoryGroup
            key={cat.id}
            category={cat}
            isOpen={openCategories.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
            view={view}
            setView={setView}
            showLabels={showLabels}
            showIcons={showIcons}
            activeCategory={activeCategory?.id}
          />
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          padding: showIcons ? '0.75rem 0.5rem' : '0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: showIcons ? 'center' : 'flex-start',
          }}
        >
          <StatusDot status={mcpOnline ? 'online' : 'offline'} />
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              opacity: showLabels ? 1 : 0,
              width: showLabels ? 'auto' : 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease',
            }}
          >
            {connectedCount} connected
          </span>
        </div>

        <ToggleButton mode={mode} onToggleMode={onToggleMode} showLabels={showLabels} showIcons={showIcons} />
      </div>

      {/* Scrollbar & animation styles */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes categorySlideIn {
          from { opacity: 0; max-height: 0; transform: translateY(-4px); }
          to   { opacity: 1; max-height: 400px; transform: translateY(0); }
        }
        @keyframes categorySlideOut {
          from { opacity: 1; max-height: 400px; }
          to   { opacity: 0; max-height: 0; }
        }
        @keyframes sidebarTooltipIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
    </aside>
  )

  // ---- Hidden mode: wrapper with hotzone + slide-in overlay ----
  if (mode === 'hidden') {
    return (
      <div
        style={{
          position: 'relative',
          width: 0,
          flexShrink: 0,
          height: '100%',
          zIndex: 100,
        }}
      >
        <div
          onMouseEnter={handleHotzoneEnter}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '6px',
            height: '100%',
            zIndex: 101,
            cursor: 'default',
          }}
        />
        <div
          onMouseEnter={handleSidebarEnter}
          onMouseLeave={handleSidebarLeave}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100%',
            zIndex: 100,
            transform: hoverVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: hoverVisible ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          {sidebarContent}
        </div>
      </div>
    )
  }

  return sidebarContent
}

/* ──────────────────────────────────────────── */
/*  Category Group — collapsible drawer        */
/* ──────────────────────────────────────────── */

function CategoryGroup({
  category,
  isOpen,
  onToggle,
  view,
  setView,
  showLabels,
  showIcons,
  activeCategory,
}: {
  category: NavCategory
  isOpen: boolean
  onToggle: () => void
  view: string
  setView: (v: string) => void
  showLabels: boolean
  showIcons: boolean
  activeCategory?: string
}) {
  const [headerHovered, setHeaderHovered] = useState(false)
  const hasActiveChild = category.items.some(item => !item.href && item.key === view)

  // Icons mode: show only first item icon as category representative
  if (showIcons) {
    const firstItem = category.items[0]
    const isActiveCat = activeCategory === category.id
    return (
      <div style={{ marginBottom: 2 }}>
        {/* Category dot indicator */}
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: category.color,
            margin: '6px auto 2px',
            opacity: 0.5,
          }}
        />
        {category.items.map((item) => {
          const active = !item.href && view === item.key
          return (
            <NavButton
              key={item.key}
              label={item.label}
              logo={item.logo}
              active={active}
              showLabels={false}
              showIcons={true}
              href={item.href}
              catColor={category.color}
              onClick={() => {
                if (!item.href) setView(item.key)
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Category Header */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          width: '100%',
          display: showLabels ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.375rem 0.625rem',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          background: headerHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'all 0.15s ease',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Color bar */}
          <div
            style={{
              width: 3,
              height: 14,
              borderRadius: 2,
              backgroundColor: category.color,
              opacity: hasActiveChild ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}
          />
          <span
            style={{
              fontSize: '0.675rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: hasActiveChild ? category.color : headerHovered ? category.color : 'rgba(255,255,255,0.35)',
              transition: 'color 0.2s',
            }}
          >
            {category.label}
          </span>
        </div>
        <ChevronDown
          size={12}
          style={{
            color: 'rgba(255,255,255,0.2)',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s ease, color 0.2s',
          }}
        />
      </button>

      {/* Items — sliding drawer */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isOpen || !showLabels ? `${category.items.length * 42}px` : '0px',
          opacity: isOpen || !showLabels ? 1 : 0,
          transition: 'max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
          paddingLeft: showLabels ? '0.375rem' : 0,
        }}
      >
        {category.items.map((item) => {
          const active = !item.href && view === item.key
          return (
            <NavButton
              key={item.key}
              label={item.label}
              logo={item.logo}
              active={active}
              showLabels={showLabels}
              showIcons={showIcons}
              href={item.href}
              catColor={category.color}
              onClick={() => {
                if (!item.href) setView(item.key)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  NavButton with tooltip & category color    */
/* ──────────────────────────────────────────── */

function NavButton({
  label,
  logo,
  active,
  showLabels,
  showIcons,
  onClick,
  href,
  catColor,
}: {
  label: string
  logo: string
  active: boolean
  showLabels: boolean
  showIcons: boolean
  onClick: () => void
  href?: string
  catColor: string
}) {
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (href) {
      window.location.href = href
    } else {
      onClick()
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleClick}
        onMouseEnter={(e) => {
          setHovered(true)
          if (!active) {
            e.currentTarget.style.backgroundColor = `${catColor}08`
          }
        }}
        onMouseLeave={(e) => {
          setHovered(false)
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
        title={showIcons ? label : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          borderRadius: '0.625rem',
          cursor: 'pointer',
          border: 'none',
          padding: showIcons ? '0.5rem 0' : '0.5rem 0.625rem',
          justifyContent: showIcons ? 'center' : 'flex-start',
          backgroundColor: active ? `${catColor}15` : 'transparent',
          borderLeft: active ? `2.5px solid ${catColor}` : '2.5px solid transparent',
          color: active ? '#fff' : 'var(--text-secondary)',
          transition: 'all 0.15s ease',
          fontFamily: 'inherit',
          fontSize: 'inherit',
        }}
      >
        <img
          src={logo}
          alt=""
          width={18}
          height={18}
          style={{
            flexShrink: 0,
            borderRadius: 2,
            filter: active ? 'brightness(1.3) saturate(1.2)' : hovered ? 'brightness(1.15)' : 'brightness(0.85)',
            transition: 'filter 0.15s ease',
            objectFit: 'contain',
          }}
        />
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: active ? 600 : 500,
            color: active ? catColor : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
            opacity: showLabels ? 1 : 0,
            width: showLabels ? 'auto' : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          {label}
        </span>
      </button>

      {/* Tooltip for icons mode */}
      {showIcons && hovered && (
        <div
          style={{
            position: 'absolute',
            left: 'calc(100% + 8px)',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(20, 20, 28, 0.95)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 500,
            padding: '0.3rem 0.6rem',
            borderRadius: '0.375rem',
            whiteSpace: 'nowrap',
            boxShadow: `0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px ${catColor}20`,
            pointerEvents: 'none',
            zIndex: 200,
            animation: 'sidebarTooltipIn 0.15s ease-out',
          }}
        >
          <span style={{ color: catColor }}>{label}</span>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Toggle button                              */
/* ──────────────────────────────────────────── */

function ToggleButton({
  mode,
  onToggleMode,
  showLabels,
  showIcons,
}: {
  mode: SidebarMode
  onToggleMode: () => void
  showLabels: boolean
  showIcons: boolean
}) {
  const ToggleIcon = getToggleIcon(mode)
  const toggleLabel = getToggleLabel(mode)

  return (
    <button
      onClick={onToggleMode}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: showIcons ? '0.5rem 0' : '0.5rem',
        justifyContent: showIcons ? 'center' : 'flex-start',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        background: 'none',
        border: 'none',
        transition: TRANSITION,
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text-secondary)'
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)'
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      title={showIcons ? toggleLabel : undefined}
    >
      <ToggleIcon size={14} />
      <span
        style={{
          fontSize: '0.7rem',
          opacity: showLabels ? 1 : 0,
          width: showLabels ? 'auto' : 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.3s ease',
        }}
      >
        {toggleLabel}
      </span>
    </button>
  )
}
