'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { StatusDot } from './StatusDot'
import { McpWidget } from './McpWidget'
import { WIDGET_REGISTRY, type WidgetConfig } from '@/lib/mcp-widgets'

// ─── MODULE DEFINITIONS ─────────────────────────────────────────
// Each module represents a console feature that can be arranged on the dashboard

interface DashboardModule {
  id: string
  label: string
  icon: string
  color: string
  description: string
  size: 'sm' | 'md' | 'lg' | 'xl'  // sm=1col, md=1col tall, lg=2col, xl=full-width
  view?: string  // navigates to this console view on click
  /** If set, this module renders a live MCP widget */
  mcpWidget?: WidgetConfig
}

// Convert MCP widgets to dashboard modules
const MCP_MODULES: DashboardModule[] = WIDGET_REGISTRY.map(w => ({
  id: `mcp-${w.id}`,
  label: w.label,
  icon: w.icon,
  color: w.color,
  description: w.description,
  size: w.size === 'xl' ? 'xl' : w.size,
  mcpWidget: w,
}))

const DEFAULT_MODULES: DashboardModule[] = [
  { id: 'status', label: '0nMCP Status', icon: '⚡', color: '#7ed957', description: 'Server health & connectivity', size: 'lg' },
  { id: 'chat', label: 'AI Chat', icon: '💬', color: '#d4a574', description: 'Claude-powered assistant', size: 'sm', view: 'chat' },
  { id: 'builder', label: 'Builder', icon: '🔲', color: '#7ed957', description: 'Visual workflow builder', size: 'sm', view: 'builder' },
  { id: 'vault', label: 'Vault', icon: '🔐', color: '#7ed957', description: 'Credential management', size: 'sm', view: 'vault' },
  { id: 'create', label: 'Create', icon: '✨', color: '#ff6b35', description: 'AI workflow generator', size: 'sm', view: 'flows' },
  { id: 'operations', label: 'Operations', icon: '📈', color: '#22d3ee', description: 'Active automations', size: 'md', view: 'operations' },
  // ─── LIVE MCP WIDGETS (CRM) ──────────────────────────────
  ...MCP_MODULES.filter(m => m.mcpWidget?.service === 'crm'),
  // ─── APP MODULES ─────────────────────────────────────────
  { id: 'store', label: 'Marketplace', icon: '🏪', color: '#ff6b35', description: 'Browse .0n workflows', size: 'sm', view: 'store' },
  { id: 'social', label: 'Social Hub', icon: '🚀', color: '#1DA1F2', description: 'Multi-platform posting', size: 'sm', view: 'social' },
  { id: 'reporting', label: 'Reporting', icon: '📊', color: '#f59e0b', description: 'Analytics & insights', size: 'sm', view: 'reporting' },
  { id: 'terminal', label: 'Terminal', icon: '▶', color: '#00d4ff', description: 'Web terminal', size: 'sm', view: 'terminal' },
  { id: 'code', label: '0n Code', icon: '⟨/⟩', color: '#a78bfa', description: 'Code editor', size: 'sm', view: 'code' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077b5', description: 'LinkedIn management', size: 'sm', view: 'linkedin' },
  { id: 'migrate', label: 'Migrate', icon: '🔄', color: '#a855f7', description: 'Import from other platforms', size: 'sm', view: 'migrate' },
  { id: 'convert', label: 'Convert', icon: '🔀', color: '#00d4ff', description: 'Config format converter', size: 'sm', view: 'convert' },
  // ─── LIVE MCP WIDGETS (Stripe + Automation + Infra) ──────
  ...MCP_MODULES.filter(m => m.mcpWidget?.service !== 'crm'),
  // ─── STATUS MODULES ──────────────────────────────────────
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
  const previewOrder = useRef<string[] | null>(null)
  const [, forceRender] = useState(0)

  // Save layout on change
  useEffect(() => {
    saveLayout(moduleOrder)
  }, [moduleOrder])

  // The displayed order: use live preview while dragging, otherwise saved order
  const displayOrder = previewOrder.current || moduleOrder

  // Build ordered modules list
  const modules = displayOrder
    .map(id => DEFAULT_MODULES.find(m => m.id === id))
    .filter((m): m is DashboardModule => !!m)

  // ─── DRAG HANDLERS ──────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!editing) return
    setDragId(id)
    previewOrder.current = null
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }, [editing])

  const handleDragEnd = useCallback(() => {
    // Commit the preview order as final
    if (previewOrder.current) {
      setModuleOrder(previewOrder.current)
    }
    previewOrder.current = null
    setDragId(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    if (!editing || !dragId || targetId === dragId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    // Reorder live: move dragged item to target position
    const base = previewOrder.current || moduleOrder
    const fromIdx = base.indexOf(dragId)
    const toIdx = base.indexOf(targetId)
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return

    const next = [...base]
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, dragId)
    previewOrder.current = next
    forceRender(n => n + 1)
  }, [editing, dragId, moduleOrder])

  const handleDragOverAllow = useCallback((e: React.DragEvent) => {
    if (!editing) return
    e.preventDefault()
  }, [editing])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // ─── WIDGET PICKER (add/remove widgets in edit mode) ──
  const [showWidgetPicker, setShowWidgetPicker] = useState(false)

  const toggleWidget = useCallback((widgetId: string) => {
    setModuleOrder(prev => {
      if (prev.includes(widgetId)) {
        return prev.filter(id => id !== widgetId)
      }
      return [...prev, widgetId]
    })
  }, [])

  // ─── MODULE CONTENT RENDERERS ───────────────────────
  const renderModuleContent = (mod: DashboardModule) => {
    // Live MCP widget modules
    if (mod.mcpWidget) {
      return <McpWidget config={mod.mcpWidget} compact />
    }

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
                <span><strong style={{ color: '#00d4ff' }}>53</strong> services</span>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {editing && (
            <button
              onClick={() => setShowWidgetPicker(p => !p)}
              style={{
                padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none',
                background: showWidgetPicker ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: showWidgetPicker ? '#00d4ff' : 'var(--text-secondary)',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: showWidgetPicker ? 'rgba(0,212,255,0.3)' : 'var(--border)',
                transition: 'all 0.15s ease',
              }}
            >
              + Add Widget
            </button>
          )}
          <button
            onClick={() => { setEditing(e => !e); setShowWidgetPicker(false) }}
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
      </div>

      {/* Widget Picker Panel */}
      {showWidgetPicker && (
        <div style={{
          marginBottom: '1rem', padding: '1rem', borderRadius: '0.875rem',
          background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.2)',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Available Widgets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {DEFAULT_MODULES.map(mod => {
              const isActive = moduleOrder.includes(mod.id)
              return (
                <button
                  key={mod.id}
                  onClick={() => toggleWidget(mod.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: isActive ? `${mod.color}12` : 'rgba(255,255,255,0.02)',
                    borderWidth: 1, borderStyle: 'solid',
                    borderColor: isActive ? `${mod.color}30` : 'var(--border)',
                    transition: 'all 0.15s ease', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '0.875rem' }}>{mod.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? mod.color : 'var(--text-secondary)' }}>
                      {mod.label}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                      {mod.mcpWidget ? `LIVE — ${mod.mcpWidget.service}` : mod.description}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    color: isActive ? '#7ed957' : 'var(--text-muted)',
                  }}>
                    {isActive ? '✓' : '+'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div
        onDragOver={handleDragOverAllow}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
        }}
      >
        {modules.map((mod) => {
          const isDragging = dragId === mod.id
          const colSpan = mod.size === 'xl' ? 4 : mod.size === 'lg' ? 2 : 1
          const rowSpan = mod.size === 'xl' ? 2 : mod.size === 'md' ? 2 : 1
          const isLive = !!mod.mcpWidget

          return (
            <div
              key={mod.id}
              draggable={editing}
              onDragStart={(e) => handleDragStart(e, mod.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, mod.id)}
              onDrop={handleDrop}
              onClick={() => {
                if (!editing && mod.view && onNavigate) onNavigate(mod.view)
              }}
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                background: 'var(--bg-card)',
                borderRadius: '0.875rem',
                padding: '1rem',
                border: editing
                  ? '1px dashed rgba(126,217,87,0.2)'
                  : isLive
                    ? `1px solid ${mod.color}20`
                    : '1px solid var(--border)',
                cursor: editing ? 'grab' : mod.view ? 'pointer' : 'default',
                opacity: isDragging ? 0.3 : 1,
                transition: 'transform 0.2s ease, opacity 0.2s ease, box-shadow 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                minHeight: mod.size === 'xl' ? '280px' : mod.size === 'md' ? '180px' : '100px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!editing) {
                  e.currentTarget.style.borderColor = `${mod.color}40`
                  e.currentTarget.style.boxShadow = `0 0 20px ${mod.color}08`
                }
              }}
              onMouseLeave={(e) => {
                if (!editing) {
                  e.currentTarget.style.borderColor = isLive ? `${mod.color}20` : 'var(--border)'
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {mod.label}
                      </span>
                      {isLive && (
                        <span style={{
                          fontSize: '0.5rem', fontWeight: 700, padding: '0.1rem 0.3rem',
                          borderRadius: '0.25rem', background: `${mod.color}15`, color: mod.color,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          LIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {mod.description}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editing && (
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.5,
                      cursor: 'grab', userSelect: 'none',
                    }}>
                      ⠿
                    </div>
                  )}
                </div>
              </div>

              {/* Module Content */}
              <div style={{ flex: 1, display: 'flex', alignItems: isLive ? 'flex-start' : 'center', overflow: 'auto' }}>
                {renderModuleContent(mod)}
              </div>

              {/* Navigate indicator for clickable modules */}
              {!editing && mod.view && !isLive && (
                <div style={{
                  position: 'absolute', bottom: '0.5rem', right: '0.75rem',
                  fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.4,
                }}>
                  →
                </div>
              )}

              {/* Source indicator for live widgets */}
              {isLive && (
                <div style={{
                  position: 'absolute', top: '0.5rem', right: '0.75rem',
                  fontSize: '0.5rem', color: 'var(--text-muted)', opacity: 0.5,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {mod.mcpWidget?.service}
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
