'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { WidgetConfig, WidgetColumn } from '@/lib/mcp-widgets'

/* ═══════════════════════════════════════════════════════════════
   McpWidget — Live data widget powered by MCP proxy
   Fetches data from /api/mcp, renders tables/feeds/boards/cards.
   Auto-refreshes based on widget config interval.
   ═══════════════════════════════════════════════════════════════ */

interface McpWidgetProps {
  config: WidgetConfig
  /** Compact mode for dashboard grid */
  compact?: boolean
  /** Override refresh interval */
  refreshMs?: number
  /** Called when user clicks a row/item */
  onItemClick?: (item: Record<string, unknown>) => void
}

interface McpResponse {
  data?: unknown
  error?: string
  source?: string
}

export function McpWidget({ config, compact = true, refreshMs, onItemClick }: McpWidgetProps) {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: config.tool, params: {}, service: config.service }),
      })
      const json: McpResponse = await res.json()

      if (!mountedRef.current) return

      if (json.error) {
        setError(json.error)
        setData(null)
      } else {
        setData(json.data)
        setSource(json.source || null)
        setError(null)
      }
    } catch {
      if (mountedRef.current) {
        setError('Connection failed')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [config.tool, config.service])

  useEffect(() => {
    mountedRef.current = true
    fetchData()

    const interval = refreshMs || config.refreshInterval
    if (interval > 0) {
      intervalRef.current = setInterval(fetchData, interval)
    }

    return () => {
      mountedRef.current = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchData, refreshMs, config.refreshInterval])

  // ─── LOADING STATE ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        width: '100%', padding: compact ? '0' : '0.5rem',
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: '1.25rem', borderRadius: '0.375rem',
            background: 'rgba(255,255,255,0.04)',
            width: `${85 - i * 15}%`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
      </div>
    )
  }

  // ─── ERROR STATE ───────────────────────────────────────────
  if (error) {
    const isAuthError = error.includes('NO_AUTH') || error.includes('credentials')
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '0.375rem', width: '100%',
        padding: compact ? '0.25rem' : '1rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.25rem' }}>{isAuthError ? '🔐' : '⚠️'}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {isAuthError ? 'Connect your account in the Vault' : error}
        </div>
        <button
          onClick={() => { setLoading(true); setError(null); fetchData() }}
          style={{
            fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  // ─── DATA RENDERERS ────────────────────────────────────────
  const items = extractItems(data)

  switch (config.component) {
    case 'table':
      return <WidgetTable items={items} columns={config.columns} compact={compact} color={config.color} onItemClick={onItemClick} />
    case 'feed':
      return <WidgetFeed items={items} compact={compact} color={config.color} />
    case 'board':
      return <WidgetBoard items={items} stages={config.stages} compact={compact} color={config.color} />
    case 'card':
      return <WidgetCard items={items} fields={config.fields} compact={compact} color={config.color} />
    default:
      return <WidgetTable items={items} columns={config.columns} compact={compact} color={config.color} onItemClick={onItemClick} />
  }
}

/* ─── DATA EXTRACTION ────────────────────────────────────────── */

function extractItems(data: unknown): Record<string, unknown>[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    // Common CRM response shapes
    if (Array.isArray(obj.contacts)) return obj.contacts as Record<string, unknown>[]
    if (Array.isArray(obj.opportunities)) return obj.opportunities as Record<string, unknown>[]
    if (Array.isArray(obj.pipelines)) return obj.pipelines as Record<string, unknown>[]
    if (Array.isArray(obj.calendars)) return obj.calendars as Record<string, unknown>[]
    if (Array.isArray(obj.conversations)) return obj.conversations as Record<string, unknown>[]
    if (Array.isArray(obj.invoices)) return obj.invoices as Record<string, unknown>[]
    if (Array.isArray(obj.posts)) return obj.posts as Record<string, unknown>[]
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[]
    if (Array.isArray(obj.results)) return obj.results as Record<string, unknown>[]
    if (Array.isArray(obj.records)) return obj.records as Record<string, unknown>[]
    // Wrap single object
    return [obj]
  }
  return []
}

/* ─── TABLE RENDERER ─────────────────────────────────────────── */

function WidgetTable({
  items, columns, compact, color, onItemClick,
}: {
  items: Record<string, unknown>[]
  columns?: WidgetColumn[]
  compact: boolean
  color: string
  onItemClick?: (item: Record<string, unknown>) => void
}) {
  const cols = columns || autoColumns(items)
  const maxRows = compact ? 5 : 20

  if (items.length === 0) {
    return <EmptyState label="No data" />
  }

  return (
    <div style={{ width: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: compact ? '0.65rem' : '0.75rem' }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col.key} style={{
                textAlign: 'left', padding: '0.25rem 0.5rem', color: 'var(--text-muted)',
                fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.slice(0, maxRows).map((item, i) => (
            <tr
              key={String(item.id || item._id || i)}
              onClick={() => onItemClick?.(item)}
              style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {cols.map(col => (
                <td key={col.key} style={{
                  padding: '0.3rem 0.5rem', color: 'var(--text-secondary)',
                  borderBottom: '1px solid rgba(255,255,255,0.03)', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px',
                }}>
                  {renderCell(item, col, color)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {items.length > maxRows && (
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.375rem 0' }}>
          +{items.length - maxRows} more
        </div>
      )}
    </div>
  )
}

/* ─── FEED RENDERER ──────────────────────────────────────────── */

function WidgetFeed({
  items, compact, color,
}: {
  items: Record<string, unknown>[]
  compact: boolean
  color: string
}) {
  const maxItems = compact ? 4 : 10

  if (items.length === 0) {
    return <EmptyState label="No items" />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {items.slice(0, maxItems).map((item, i) => {
        const title = String(item.subject || item.name || item.title || item.message || `Item ${i + 1}`)
        const sub = String(item.snippet || item.body || item.description || item.status || '')
        const time = item.dateUpdated || item.updatedAt || item.createdAt || item.dateAdded
        return (
          <div key={String(item.id || item._id || i)} style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            padding: '0.375rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
              background: color,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {title}
              </div>
              {sub && (
                <div style={{
                  fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {sub.slice(0, 80)}
                </div>
              )}
            </div>
            {time ? (
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                {formatRelativeTime(String(time))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/* ─── BOARD RENDERER (KANBAN) ────────────────────────────────── */

function WidgetBoard({
  items, stages, compact, color,
}: {
  items: Record<string, unknown>[]
  stages?: { id: string; label: string; color: string }[]
  compact: boolean
  color: string
}) {
  // Group items by stage/status
  const stageList = stages || inferStages(items)
  const grouped = new Map<string, Record<string, unknown>[]>()
  for (const s of stageList) grouped.set(s.id, [])

  for (const item of items) {
    const key = String(item.pipelineStageId || item.stageId || item.status || 'unknown')
    const bucket = grouped.get(key) || grouped.get('unknown') || []
    bucket.push(item)
  }

  if (items.length === 0) {
    return <EmptyState label="No pipeline data" />
  }

  return (
    <div style={{
      display: 'flex', gap: '0.5rem', width: '100%', overflow: 'auto',
      paddingBottom: '0.25rem',
    }}>
      {stageList.map(stage => {
        const stageItems = grouped.get(stage.id) || []
        return (
          <div key={stage.id} style={{
            flex: '0 0 140px', display: 'flex', flexDirection: 'column', gap: '0.375rem',
          }}>
            <div style={{
              fontSize: '0.6rem', fontWeight: 700, color: stage.color || color,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              paddingBottom: '0.25rem', borderBottom: `2px solid ${stage.color || color}`,
            }}>
              {stage.label} ({stageItems.length})
            </div>
            {stageItems.slice(0, compact ? 3 : 8).map((item, i) => (
              <div key={String(item.id || i)} style={{
                padding: '0.375rem', borderRadius: '0.375rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.6rem',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {String(item.name || item.title || `Deal ${i + 1}`)}
                </div>
                {item.monetaryValue ? (
                  <div style={{ color: '#7ed957', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                    ${Number(item.monetaryValue).toLocaleString()}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ─── CARD RENDERER ──────────────────────────────────────────── */

function WidgetCard({
  items, fields, compact, color,
}: {
  items: Record<string, unknown>[]
  fields?: string[]
  compact: boolean
  color: string
}) {
  const item = items[0]
  if (!item) return <EmptyState label="No data" />

  const displayFields = fields || Object.keys(item).filter(k => !k.startsWith('_') && k !== 'id').slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {displayFields.map(key => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            {String(item[key] ?? '-')}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── HELPERS ────────────────────────────────────────────────── */

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '100%', padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)',
    }}>
      {label}
    </div>
  )
}

function renderCell(item: Record<string, unknown>, col: WidgetColumn, color: string) {
  const val = item[col.key]
  if (val === null || val === undefined) return '-'

  switch (col.type) {
    case 'email':
      return <span style={{ color: '#00d4ff' }}>{String(val)}</span>
    case 'phone':
      return <span style={{ fontFamily: 'var(--font-mono)' }}>{String(val)}</span>
    case 'date':
      return formatRelativeTime(String(val))
    case 'currency':
      return <span style={{ color: '#7ed957', fontFamily: 'var(--font-mono)' }}>${Number(val).toLocaleString()}</span>
    case 'badge':
      return (
        <span style={{
          padding: '0.1rem 0.375rem', borderRadius: '0.25rem', fontSize: '0.6rem',
          background: `${color}15`, color, fontWeight: 600,
        }}>
          {Array.isArray(val) ? val.join(', ') : String(val)}
        </span>
      )
    case 'avatar':
      return (
        <div style={{
          width: 20, height: 20, borderRadius: '50%', background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.55rem', color, fontWeight: 700,
        }}>
          {String(val).charAt(0).toUpperCase()}
        </div>
      )
    default:
      return String(val)
  }
}

function autoColumns(items: Record<string, unknown>[]): WidgetColumn[] {
  if (items.length === 0) return []
  const keys = Object.keys(items[0]).filter(k => !k.startsWith('_') && k !== 'id').slice(0, 5)
  return keys.map(key => ({ key, label: key.replace(/([A-Z])/g, ' $1').trim(), type: 'text' as const }))
}

function inferStages(items: Record<string, unknown>[]): { id: string; label: string; color: string }[] {
  const seen = new Set<string>()
  const colors = ['#7ed957', '#00d4ff', '#f59e0b', '#a78bfa', '#ef4444', '#ff6b35']
  const stages: { id: string; label: string; color: string }[] = []
  for (const item of items) {
    const key = String(item.pipelineStageId || item.stageId || item.status || 'unknown')
    if (!seen.has(key)) {
      seen.add(key)
      stages.push({ id: key, label: String(item.stageName || item.status || key), color: colors[stages.length % colors.length] })
    }
  }
  return stages
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'now'
    if (diffMin < 60) return `${diffMin}m`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 30) return `${diffDay}d`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}
