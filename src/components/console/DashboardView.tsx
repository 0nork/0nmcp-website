'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { StatusDot } from './StatusDot'

// ─── MODULE DEFINITIONS ─────────────────────────────────────────
// Each module represents a console feature that can be arranged on the dashboard

interface DashboardModule {
  id: string
  label: string
  icon: string
  color: string
  description: string
  size: 'sm' | 'md' | 'lg'  // sm=1col, md=1col tall, lg=2col
  view?: string  // navigates to this console view on click
}

const DEFAULT_MODULES: DashboardModule[] = [
  { id: 'status', label: '0nMCP Status', icon: '⚡', color: '#7ed957', description: 'Server health & connectivity', size: 'lg' },
  { id: 'chat', label: 'AI Chat', icon: '💬', color: '#d4a574', description: 'Claude-powered assistant', size: 'sm', view: 'chat' },
  { id: 'builder', label: 'Builder', icon: '🔲', color: '#7ed957', description: 'Visual workflow builder', size: 'sm', view: 'builder' },
  { id: 'vault', label: 'Vault', icon: '🔐', color: '#7ed957', description: 'Credential management', size: 'sm', view: 'vault' },
  { id: 'create', label: 'Create', icon: '✨', color: '#ff6b35', description: 'AI workflow generator', size: 'sm', view: 'flows' },
  { id: 'operations', label: 'Operations', icon: '📈', color: '#22d3ee', description: 'Active automations', size: 'md', view: 'operations' },
  { id: 'store', label: 'Marketplace', icon: '🏪', color: '#ff6b35', description: 'Browse .0n workflows', size: 'sm', view: 'store' },
  { id: 'social', label: 'Social Hub', icon: '🚀', color: '#1DA1F2', description: 'Multi-platform posting', size: 'sm', view: 'social' },
  { id: 'reporting', label: 'Reporting', icon: '📊', color: '#f59e0b', description: 'Analytics & insights', size: 'sm', view: 'reporting' },
  { id: 'terminal', label: 'Terminal', icon: '▶', color: '#00d4ff', description: 'Web terminal', size: 'sm', view: 'terminal' },
  { id: 'code', label: '0n Code', icon: '⟨/⟩', color: '#a78bfa', description: 'Code editor', size: 'sm', view: 'code' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077b5', description: 'LinkedIn management', size: 'sm', view: 'linkedin' },
  { id: 'migrate', label: 'Migrate', icon: '🔄', color: '#a855f7', description: 'Import from other platforms', size: 'sm', view: 'migrate' },
  { id: 'convert', label: 'Convert', icon: '🔀', color: '#00d4ff', description: 'Config format converter', size: 'sm', view: 'convert' },
  { id: 'activity', label: 'Recent Activity', icon: '🕐', color: '#7ed957', description: 'Session history', size: 'md' },
  { id: 'services', label: 'Connected Services', icon: '🔗', color: '#7ed957', description: 'Active API connections', size: 'lg' },
]

const STORAGE_KEY = '0n-dashboard-layout'

function loadLayout(): string[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return null
}

function saveLayout(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch { /* ignore */ }
}

// ─── PROPS ──────────────────────────────────────────────────────

interface DashboardViewProps {
  mcpOnline: boolean
  mcpHealth: {
    version?: string
    uptime?: number
    connections?: number
    services?: string[]
    mode?: string
    tools?: number
  } | null
  connectedCount: number
  flowCount: number
  historyCount: number
  messageCount: number
  connectedServices: string[]
  recentHistory: { id: string; type: string; detail: string; ts: number }[]
  onNavigate?: (view: string) => void
}

// ─── COMPONENT ──────────────────────────────────────────────────

export function DashboardView({
  mcpOnline,
  mcpHealth,
  connectedCount,
  flowCount,
  historyCount,
  messageCount,
  connectedServices,
  recentHistory,
  onNavigate,
}: DashboardViewProps) {
  const [moduleOrder, setModuleOrder] = useState<string[]>(() => {
    const saved = loadLayout()
    return saved || DEFAULT_MODULES.map(m => m.id)
  })
  const [editing, setEditing] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  // Save layout on change
  useEffect(() => {
    saveLayout(moduleOrder)
  }, [moduleOrder])

  // Build ordered modules list
  const modules = moduleOrder
    .map(id => DEFAULT_MODULES.find(m => m.id === id))
    .filter((m): m is DashboardModule => !!m)

  // ─── DRAG HANDLERS ──────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!editing) return
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    // Make the drag image slightly transparent
    const el = e.currentTarget as HTMLElement
    setTimeout(() => { el.style.opacity = '0.4' }, 0)
  }, [editing])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '1'
    setDragId(null)
    setDragOverId(null)
    dragCounter.current = 0
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent, id: string) => {
    if (!editing || !dragId || id === dragId) return
    e.preventDefault()
    dragCounter.current++
    setDragOverId(id)
  }, [editing, dragId])

  const handleDragLeave = useCallback(() => {
    dragCounter.current--
    if (dragCounter.current <= 0) {
      setDragOverId(null)
      dragCounter.current = 0
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!editing) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [editing])

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!dragId || dragId === targetId) return

    setModuleOrder(prev => {
      const newOrder = [...prev]
      const fromIdx = newOrder.indexOf(dragId)
      const toIdx = newOrder.indexOf(targetId)
      if (fromIdx < 0 || toIdx < 0) return prev
      newOrder.splice(fromIdx, 1)
      newOrder.splice(toIdx, 0, dragId)
      return newOrder
    })
    setDragId(null)
    setDragOverId(null)
    dragCounter.current = 0
  }, [dragId])

  // ─── MODULE CONTENT RENDERERS ───────────────────────
  const renderModuleContent = (mod: DashboardModule) => {
    switch (mod.id) {
      case 'status':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StatusDot status={mcpOnline ? 'online' : 'offline'} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {mcpOnline ? (mcpHealth?.mode === 'local' ? 'Local Mode' : 'Cloud Mode') : 'Offline'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {mcpOnline ? `v${mcpHealth?.version || '2.2.0'} — ${mcpHealth?.tools || 819} tools` : 'Run: npx 0nmcp serve'}
                </div>
              </div>
            </div>
            {mcpOnline && (
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span><strong style={{ color: '#7ed957' }}>{mcpHealth?.tools || 819}</strong> tools</span>
                <span><strong style={{ color: '#00d4ff' }}>48</strong> services</span>
              </div>
            )}
          </div>
        )

      case 'activity':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
            {recentHistory.slice(0, 4).map(entry => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: entry.type === 'error' ? '#ef4444' : entry.type === 'workflow' ? '#00d4ff' : '#7ed957',
                }} />
                <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.detail}
                </span>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {recentHistory.length === 0 && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                No activity yet
              </div>
            )}
          </div>
        )

      case 'services':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', width: '100%' }}>
            {connectedServices.length > 0 ? connectedServices.map(name => (
              <span key={name} style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                borderRadius: '0.375rem', background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)', color: 'var(--text-secondary)',
              }}>
                {name}
              </span>
            )) : (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No services connected</span>
            )}
          </div>
        )

      default: {
        // Simple stat display for feature modules
        const stat = mod.id === 'chat' ? messageCount
          : mod.id === 'vault' ? connectedCount
          : mod.id === 'operations' ? flowCount
          : mod.id === 'reporting' ? historyCount
          : null

        return stat !== null ? (
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: mod.color, fontFamily: 'var(--font-mono)' }}>
            {stat}
          </div>
        ) : null
      }
    }
  }

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
            Command Center
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Drag modules to customize your workspace
          </p>
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          style={{
            padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none',
            background: editing ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.04)',
            color: editing ? '#7ed957' : 'var(--text-secondary)',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            borderWidth: 1, borderStyle: 'solid',
            borderColor: editing ? 'rgba(126,217,87,0.3)' : 'var(--border)',
            transition: 'all 0.15s ease',
          }}
        >
          {editing ? '✓ Done' : '⚙ Edit Layout'}
        </button>
      </div>

      {/* Module Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
      }}>
        {modules.map((mod) => {
          const isDropTarget = dragOverId === mod.id && dragId !== mod.id
          const isDragging = dragId === mod.id
          const colSpan = mod.size === 'lg' ? 2 : 1
          const rowSpan = mod.size === 'md' ? 2 : 1

          return (
            <div
              key={mod.id}
              draggable={editing}
              onDragStart={(e) => handleDragStart(e, mod.id)}
              onDragEnd={handleDragEnd}
              onDragEnter={(e) => handleDragEnter(e, mod.id)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, mod.id)}
              onClick={() => {
                if (!editing && mod.view && onNavigate) onNavigate(mod.view)
              }}
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                background: 'var(--bg-card)',
                borderRadius: '0.875rem',
                padding: '1rem',
                border: isDropTarget
                  ? '2px dashed #7ed957'
                  : editing
                    ? '1px dashed rgba(126,217,87,0.2)'
                    : '1px solid var(--border)',
                cursor: editing ? 'grab' : mod.view ? 'pointer' : 'default',
                opacity: isDragging ? 0.4 : 1,
                transform: isDropTarget ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                minHeight: mod.size === 'md' ? '180px' : '100px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!editing && mod.view) {
                  e.currentTarget.style.borderColor = `${mod.color}40`
                  e.currentTarget.style.boxShadow = `0 0 20px ${mod.color}08`
                }
              }}
              onMouseLeave={(e) => {
                if (!editing) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {/* Module Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${mod.color}12`, fontSize: '0.875rem',
                    border: `1px solid ${mod.color}20`,
                  }}>
                    {mod.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {mod.label}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {mod.description}
                    </div>
                  </div>
                </div>
                {editing && (
                  <div style={{
                    fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.5,
                    cursor: 'grab', userSelect: 'none',
                  }}>
                    ⠿
                  </div>
                )}
              </div>

              {/* Module Content */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {renderModuleContent(mod)}
              </div>

              {/* Navigate indicator for clickable modules */}
              {!editing && mod.view && (
                <div style={{
                  position: 'absolute', bottom: '0.5rem', right: '0.75rem',
                  fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.4,
                }}>
                  →
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Responsive breakpoint styles */}
      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-column: span 2"] {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
