'use client'

import { memo, useState, useEffect, useCallback, useRef } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { StepNode } from './types'

/* ═══════════════════════════════════════════════════════════════
   LiveDataNode — Builder node that shows live data preview from MCP.
   Displays a mini table/feed inline in the workflow canvas.
   Fetches data from /api/mcp on mount and auto-refreshes.
   ═══════════════════════════════════════════════════════════════ */

// Which tools support live preview
const LIVE_TOOLS: Record<string, { label: string; fields: string[]; refreshMs: number }> = {
  search_contacts:    { label: 'Contacts',      fields: ['firstName', 'email', 'phone'],        refreshMs: 30000 },
  list_pipelines:     { label: 'Pipelines',      fields: ['name', 'stages'],                    refreshMs: 30000 },
  list_opportunities: { label: 'Deals',          fields: ['name', 'monetaryValue', 'status'],   refreshMs: 15000 },
  list_calendars:     { label: 'Calendars',      fields: ['name', 'locationId'],                refreshMs: 60000 },
  list_conversations: { label: 'Conversations',  fields: ['contactName', 'lastMessageBody'],    refreshMs: 10000 },
  list_invoices:      { label: 'Invoices',       fields: ['name', 'amount', 'status'],          refreshMs: 30000 },
  list_social_posts:  { label: 'Social Posts',   fields: ['summary', 'status'],                 refreshMs: 30000 },
  list_workflows:     { label: 'Workflows',      fields: ['name', 'active'],                    refreshMs: 30000 },
  list_tags:          { label: 'Tags',           fields: ['name'],                              refreshMs: 60000 },
  list_customers:     { label: 'Customers',      fields: ['name', 'email'],                     refreshMs: 30000 },
  list_payment_intents: { label: 'Payments',     fields: ['description', 'amount', 'status'],   refreshMs: 15000 },
  list_scenarios:     { label: 'Scenarios',      fields: ['name', 'islinked'],                  refreshMs: 30000 },
  list_workers:       { label: 'Workers',        fields: ['id', 'modified_on'],                 refreshMs: 60000 },
  list_dns_records:   { label: 'DNS Records',    fields: ['name', 'type', 'content'],           refreshMs: 120000 },
  // Whimsical
  list_boards:        { label: 'Boards',         fields: ['name', 'type'],                      refreshMs: 60000 },
  list_workspaces:    { label: 'Workspaces',     fields: ['name'],                              refreshMs: 60000 },
}

function LiveDataNodeComponent({ data, selected }: NodeProps<StepNode>) {
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liveEnabled, setLiveEnabled] = useState(true)
  const mountedRef = useRef(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const toolConfig = data.toolId ? LIVE_TOOLS[data.toolId] : null
  const isLiveCapable = !!toolConfig

  const fetchPreview = useCallback(async () => {
    if (!data.toolId || !isLiveCapable) return
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: data.toolId, params: data.inputs || {} }),
      })
      const json = await res.json()
      if (!mountedRef.current) return

      if (json.error) {
        setError(json.error)
        setItems([])
      } else {
        const raw = json.data
        const arr = extractArray(raw)
        setItems(arr.slice(0, 3))
        setError(null)
      }
    } catch {
      if (mountedRef.current) setError('Offline')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [data.toolId, data.inputs, isLiveCapable])

  useEffect(() => {
    mountedRef.current = true
    if (isLiveCapable && liveEnabled) {
      setLoading(true)
      fetchPreview()
      intervalRef.current = setInterval(fetchPreview, toolConfig!.refreshMs)
    }
    return () => {
      mountedRef.current = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchPreview, isLiveCapable, liveEnabled, toolConfig])

  const accentColor = data.serviceId === 'crm' ? '#ff6b35'
    : data.serviceId === 'stripe' ? '#635bff'
    : data.serviceId === 'whimsical' ? '#a855f7'
    : '#7ed957'

  return (
    <div
      className={`step-node${selected ? ' selected' : ''}`}
      style={{
        minWidth: isLiveCapable ? 260 : undefined,
        borderColor: isLiveCapable ? `${accentColor}40` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      {/* Header */}
      <div className="step-node-header">
        <div className="step-node-icon">
          {data.serviceLogo ? (
            <img src={data.serviceLogo} alt={data.serviceName} width={18} height={18} />
          ) : (
            data.serviceIcon
          )}
        </div>
        <div className="step-node-service">{data.serviceName}</div>
        {isLiveCapable && (
          <span
            style={{
              fontSize: '0.5rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 4,
              background: liveEnabled ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
              color: liveEnabled ? accentColor : 'var(--text-muted)',
              cursor: 'pointer',
              userSelect: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
            onClick={(e) => { e.stopPropagation(); setLiveEnabled(p => !p) }}
            title={liveEnabled ? 'Click to pause live data' : 'Click to enable live data'}
          >
            {liveEnabled ? 'LIVE' : 'PAUSED'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="step-node-body">
        <div className="step-node-id">{data.stepId}</div>
        <div className="step-node-tool">
          {data.toolName || 'Select a tool...'}
        </div>
      </div>

      {/* Live Data Preview */}
      {isLiveCapable && liveEnabled && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '6px 0 2px',
          marginTop: 4,
        }}>
          {loading && items.length === 0 && (
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
              Loading...
            </div>
          )}
          {error && (
            <div style={{ fontSize: '0.55rem', color: '#ef4444', textAlign: 'center', padding: '4px 0' }}>
              {error.includes('NO_AUTH') ? 'Connect in Vault' : error}
            </div>
          )}
          {!error && items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 6, fontSize: '0.5rem', color: 'var(--text-secondary)',
                  padding: '2px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <span style={{
                    width: 4, height: 4, borderRadius: '50%', background: accentColor,
                    flexShrink: 0, marginTop: 3,
                  }} />
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {toolConfig!.fields.map(f => String(item[f] ?? '')).filter(Boolean).join(' — ')}
                  </span>
                </div>
              ))}
              <div style={{ fontSize: '0.45rem', color: 'var(--text-muted)', textAlign: 'right', paddingTop: 2 }}>
                {toolConfig!.label} preview
              </div>
            </div>
          )}
          {!error && items.length === 0 && !loading && (
            <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
              No data
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {(data.condition || data.parallelGroup) && (
        <div className="step-node-badges">
          {data.condition && (
            <span className="step-node-badge condition">IF</span>
          )}
          {data.parallelGroup && (
            <span className="step-node-badge parallel">
              {data.parallelGroup}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function extractArray(data: unknown): Record<string, unknown>[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    for (const key of ['contacts', 'opportunities', 'pipelines', 'calendars', 'conversations', 'invoices', 'posts', 'data', 'items', 'results', 'records', 'workflows']) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[]
    }
    return [obj]
  }
  return []
}

export default memo(LiveDataNodeComponent)
