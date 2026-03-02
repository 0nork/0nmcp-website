'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronRight, PanelLeftClose } from 'lucide-react'
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
const svg = (paths: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  )}`

const NAV_ITEMS: { key: string; label: string; logo: string; href?: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    logo: '/brand/icon-green.png',
  },
  {
    key: 'chat',
    label: 'Chat',
    logo: 'https://cdn.simpleicons.org/anthropic/d4a574',
  },
  {
    key: 'community',
    label: 'Community',
    logo: 'https://cdn.simpleicons.org/discourse/ffffff',
    href: '/forum',
  },
  {
    key: 'builder',
    label: 'Builder',
    logo: svg(
      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><line x1="10" y1="6.5" x2="14" y2="6.5"/><line x1="6.5" y1="10" x2="6.5" y2="14"/>',
      '#7ed957'
    ),
  },
  {
    key: 'terminal',
    label: 'Terminal',
    logo: svg(
      '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
      '#00d4ff'
    ),
  },
  {
    key: 'code',
    label: '0n Code',
    logo: svg(
      '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
      '#a78bfa'
    ),
  },
  {
    key: 'vault',
    label: 'Vault',
    logo: svg(
      '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/>',
      '#7ed957'
    ),
  },
  {
    key: 'flows',
    label: 'Create',
    logo: svg(
      '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
      '#ff6b35'
    ),
  },
  {
    key: 'operations',
    label: 'Operations',
    logo: svg(
      '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      '#22d3ee'
    ),
  },
  {
    key: 'social',
    label: 'Social',
    logo: svg(
      '<path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/>',
      '#1DA1F2'
    ),
  },
  {
    key: 'reporting',
    label: 'Reporting',
    logo: svg(
      '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      '#f59e0b'
    ),
  },
  {
    key: 'migrate',
    label: 'Migrate',
    logo: svg(
      '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
      '#a855f7'
    ),
  },
  {
    key: 'learn',
    label: 'Learn',
    logo: svg(
      '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
      '#10b981'
    ),
    href: '/learn',
  },
  {
    key: 'store',
    label: 'Marketplace',
    logo: svg(
      '<path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z"/><line x1="3" y1="7" x2="21" y2="7"/><path d="M16 11a4 4 0 0 1-8 0"/>',
      '#ff6b35'
    ),
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    logo: 'https://cdn.simpleicons.org/linkedin/0077b5',
  },
  {
    key: 'convert',
    label: 'Convert',
    logo: svg(
      '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
      '#00d4ff'
    ),
  },
  {
    key: 'account',
    label: 'Account',
    logo: svg(
      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      '#e2e2e2'
    ),
  },
]

const TRANSITION = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

/** Cycle order: open -> hidden -> icons -> open */
function getToggleIcon(mode: SidebarMode) {
  switch (mode) {
    case 'open':
      return PanelLeftClose // will hide
    case 'hidden':
      return ChevronRight // will go to icons
    case 'icons':
      return ChevronRight // will go to open
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
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showLabels = mode === 'open' || (mode === 'hidden' && hoverVisible)
  const showIcons = mode === 'icons'

  // Conditionally add Admin nav item
  const navItems = isAdmin
    ? [
        ...NAV_ITEMS,
        {
          key: 'admin',
          label: 'Admin',
          logo: svg(
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
            '#7ed957'
          ),
        },
      ]
    : NAV_ITEMS

  // Compute the effective width of the sidebar content
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
        backgroundColor: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
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
          borderBottom: '1px solid var(--border)',
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

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '0.75rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {navItems.map(({ key, label, logo, href }) => {
          const active = !href && view === key
          return (
            <NavButton
              key={key}
              label={label}
              logo={logo}
              active={active}
              showLabels={showLabels}
              showIcons={showIcons}
              href={href}
              onClick={() => {
                if (!href) setView(key)
              }}
            />
          )
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          padding: showIcons ? '0.75rem 0.5rem' : '0.75rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Status row */}
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
              fontSize: '0.75rem',
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

        {/* Mode toggle button */}
        <ToggleButton mode={mode} onToggleMode={onToggleMode} showLabels={showLabels} showIcons={showIcons} />
      </div>
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
        {/* Invisible hotzone at left edge */}
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

        {/* Slide-in sidebar overlay */}
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

  // ---- Open or Icons mode: render inline ----
  return sidebarContent
}

// ──────────────────────────────────────────────
// NavButton with tooltip support for icons mode
// ──────────────────────────────────────────────

function NavButton({
  label,
  logo,
  active,
  showLabels,
  showIcons,
  onClick,
  href,
}: {
  label: string
  logo: string
  active: boolean
  showLabels: boolean
  showIcons: boolean
  onClick: () => void
  href?: string
}) {
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    if (href) {
      window.open(href, '_blank', 'noopener')
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
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }
        }}
        onMouseLeave={(e) => {
          setHovered(false)
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }
        }}
        title={showIcons ? label : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          border: 'none',
          padding: showIcons ? '0.625rem 0' : '0.625rem 0.75rem',
          justifyContent: showIcons ? 'center' : 'flex-start',
          backgroundColor: active ? 'var(--accent-glow)' : 'transparent',
          borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: TRANSITION,
          fontFamily: 'inherit',
          fontSize: 'inherit',
        }}
      >
        <img
          src={logo}
          alt=""
          width={20}
          height={20}
          style={{
            flexShrink: 0,
            borderRadius: 2,
            filter: active ? 'brightness(1.2)' : hovered ? 'brightness(1.1)' : 'brightness(0.9)',
            transition: 'filter 0.2s ease',
            objectFit: 'contain',
          }}
        />
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: showLabels ? 1 : 0,
            width: showLabels ? 'auto' : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.3s ease, width 0.3s ease',
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
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '0.35rem 0.65rem',
            borderRadius: '0.375rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
            pointerEvents: 'none',
            zIndex: 200,
            animation: 'sidebarTooltipIn 0.15s ease-out',
          }}
        >
          {label}
        </div>
      )}

      {/* Inline keyframes for tooltip animation */}
      {showIcons && hovered && (
        <style>{`
          @keyframes sidebarTooltipIn {
            from {
              opacity: 0;
              transform: translateY(-50%) translateX(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(-50%) translateX(0);
            }
          }
        `}</style>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Toggle button for cycling sidebar mode
// ──────────────────────────────────────────────

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
      <ToggleIcon size={16} />
      <span
        style={{
          fontSize: '0.75rem',
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
