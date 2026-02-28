'use client'

import { useState, useRef, useCallback } from 'react'
import {
  LayoutDashboard,
  MessageSquare,
  Shield,
  Workflow,
  History,
  Users,
  Blocks,
  ShoppingBag,
  Linkedin,
  PlusCircle,
  Activity,
  Share2,
  BarChart3,
  ArrowRightLeft,
  TerminalSquare,
  GraduationCap,
  ChevronRight,
  PanelLeftClose,
  Code2,
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
}

const NAV_ITEMS: { key: string; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'community', label: 'Community', icon: Users },
  { key: 'builder', label: 'Builder', icon: Blocks },
  { key: 'terminal', label: 'Terminal', icon: TerminalSquare },
  { key: 'code', label: '0n Code', icon: Code2 },
  { key: 'vault', label: 'Vault', icon: Shield },
  { key: 'flows', label: 'Create', icon: Workflow },
  { key: 'operations', label: 'Operations', icon: Activity },
  { key: 'social', label: 'Social', icon: Share2 },
  { key: 'reporting', label: 'Reporting', icon: BarChart3 },
  { key: 'migrate', label: 'Migrate', icon: ArrowRightLeft },
  { key: 'learn', label: 'Learn', icon: GraduationCap },
  { key: 'store', label: 'Store', icon: ShoppingBag },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'request', label: 'Request', icon: PlusCircle },
  { key: 'history', label: 'History', icon: History },
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
}: SidebarProps) {
  const [hoverVisible, setHoverVisible] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showLabels = mode === 'open' || (mode === 'hidden' && hoverVisible)
  const showIcons = mode === 'icons'

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
          gap: '0.625rem',
          height: '3.5rem',
          padding: showIcons ? '0 0.5rem' : '0 1rem',
          justifyContent: showIcons ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--border)',
          transition: TRANSITION,
        }}
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 900,
              color: 'var(--bg-primary)',
            }}
          >
            0n
          </span>
        </div>
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            opacity: showLabels ? 1 : 0,
            width: showLabels ? 'auto' : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.3s ease, width 0.3s ease',
          }}
        >
          Console
        </span>
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
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key
          return (
            <NavButton
              key={key}
              label={label}
              icon={Icon}
              active={active}
              showLabels={showLabels}
              showIcons={showIcons}
              onClick={() => setView(key)}
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
  icon: Icon,
  active,
  showLabels,
  showIcons,
  onClick,
}: {
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  showLabels: boolean
  showIcons: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
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
        <Icon
          size={20}
          style={{
            flexShrink: 0,
            color: active ? 'var(--accent)' : undefined,
            transition: 'color 0.2s',
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
