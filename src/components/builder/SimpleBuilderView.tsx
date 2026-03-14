'use client'

import { useState, useMemo, useCallback } from 'react'
import { useBuilder, useBuilderDispatch } from './BuilderContext'
import { getServiceById } from '@/lib/sxo-helpers'
import type { StepNodeData } from './types'

/* ── Inline key-value editor ──────────────────────────────────────── */

function KVEditor({
  label,
  entries,
  onChange,
}: {
  label: string
  entries: Record<string, string>
  onChange: (entries: Record<string, string>) => void
}) {
  const pairs = Object.entries(entries)
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>
        {label}
      </div>
      {pairs.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
          No {label.toLowerCase()} configured
        </div>
      )}
      {pairs.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
          <input
            style={{
              flex: 1, padding: '5px 8px', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 12,
              outline: 'none',
            }}
            value={k}
            onChange={(e) => {
              const updated: Record<string, string> = {}
              for (const [ok, ov] of Object.entries(entries)) {
                updated[ok === k ? e.target.value : ok] = ov
              }
              onChange(updated)
            }}
          />
          <input
            style={{
              flex: 2, padding: '5px 8px', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
              outline: 'none',
            }}
            placeholder="value or {{step.output}}"
            value={v}
            onChange={(e) => onChange({ ...entries, [k]: e.target.value })}
          />
          <button
            onClick={() => { const { [k]: _, ...rest } = entries; onChange(rest) }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange({ ...entries, [`param_${pairs.length + 1}`]: '' })}
        style={{
          padding: '3px 8px', fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'var(--accent)', background: 'none',
          border: '1px dashed var(--border)', borderRadius: 4,
          cursor: 'pointer', width: '100%', marginTop: 2,
        }}
      >
        + Add
      </button>
    </div>
  )
}

/* ── Step card component ─────────────────────────────────────────── */

function StepCard({
  node,
  index,
  total,
  isExpanded,
  onToggle,
}: {
  node: { id: string; data: StepNodeData }
  index: number
  total: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const dispatch = useBuilderDispatch()
  const d = node.data

  const service = useMemo(() => getServiceById(d.serviceId), [d.serviceId])
  const tools = useMemo(() => service?.tools ?? [], [service])
  const logoUrl = useMemo(() => {
    if (d.serviceLogo) return d.serviceLogo
    return ''
  }, [d.serviceLogo])

  const update = useCallback(
    (data: Partial<StepNodeData>) => {
      dispatch({ type: 'UPDATE_NODE_DATA', nodeId: node.id, data })
    },
    [node.id, dispatch]
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Connector line */}
      {index < total - 1 && (
        <div style={{
          position: 'absolute',
          left: 24,
          top: '100%',
          width: 2,
          height: 24,
          background: 'var(--border)',
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: -3,
            width: 0, height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '6px solid var(--border)',
          }} />
        </div>
      )}

      {/* Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${isExpanded ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 10,
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: isExpanded ? '0 0 12px var(--accent-glow)' : 'none',
        }}
      >
        {/* Header — always visible */}
        <div
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            cursor: 'pointer',
            background: isExpanded ? 'var(--bg-tertiary)' : 'transparent',
            transition: 'background 0.15s',
          }}
        >
          {/* Step number */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: isExpanded ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: isExpanded ? 'var(--bg-primary)' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
            flexShrink: 0, transition: 'all 0.2s',
          }}>
            {index + 1}
          </div>

          {/* Service icon */}
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {logoUrl ? (
              <img src={logoUrl} alt={d.serviceName} width={18} height={18} />
            ) : (
              <span style={{ fontSize: 14 }}>{d.serviceIcon || '?'}</span>
            )}
          </div>

          {/* Step info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {d.toolName || d.serviceName}
            </div>
            <div style={{
              fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {d.serviceId} &middot; {d.stepId}
            </div>
          </div>

          {/* Expand chevron */}
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}>
            &#9654;
          </span>
        </div>

        {/* Expanded config */}
        {isExpanded && (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border)' }}>
            {/* Tool selector */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>
                Tool
              </div>
              {tools.length > 0 ? (
                <select
                  value={d.toolId}
                  onChange={(e) => {
                    const tool = tools.find((t) => t.id === e.target.value)
                    update({ toolId: e.target.value, toolName: tool?.name ?? e.target.value })
                  }}
                  style={{
                    width: '100%', padding: '7px 10px', background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13,
                    outline: 'none', appearance: 'none',
                  }}
                >
                  <option value="">Select a tool...</option>
                  {tools.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={d.toolId}
                  onChange={(e) => update({ toolId: e.target.value, toolName: e.target.value })}
                  style={{
                    width: '100%', padding: '7px 10px', background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 13,
                    outline: 'none',
                  }}
                />
              )}
            </div>

            {/* Inputs */}
            <KVEditor
              label="Inputs"
              entries={d.inputs}
              onChange={(inputs) => update({ inputs })}
            />

            {/* Outputs */}
            <KVEditor
              label="Outputs"
              entries={d.outputs}
              onChange={(outputs) => update({ outputs })}
            />

            {/* Advanced row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>
                  On Fail
                </div>
                <select
                  value={d.onFail}
                  onChange={(e) => update({ onFail: e.target.value as StepNodeData['onFail'] })}
                  style={{
                    width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)', borderRadius: 4,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
                    outline: 'none', appearance: 'none',
                  }}
                >
                  <option value="halt">Halt</option>
                  <option value="skip">Skip</option>
                  <option value="retry:1">Retry 1x</option>
                  <option value="retry:2">Retry 2x</option>
                  <option value="retry:3">Retry 3x</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Timeout
                </div>
                <input
                  type="number"
                  placeholder="30000"
                  value={d.timeout || ''}
                  onChange={(e) => update({ timeout: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)', borderRadius: 4,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Condition */}
            {(d.condition || isExpanded) && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Condition
                </div>
                <input
                  value={d.condition}
                  onChange={(e) => update({ condition: e.target.value })}
                  placeholder="e.g. {{step.prev.status}} == 'success'"
                  style={{
                    width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)', borderRadius: 4,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Delete */}
            <button
              onClick={() => dispatch({ type: 'DELETE_NODE', nodeId: node.id })}
              style={{
                marginTop: 12, width: '100%', padding: '7px 0',
                background: 'none', border: '1px solid #ff4444',
                borderRadius: 6, color: '#ff4444',
                fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
              }}
            >
              Remove Step
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main SimpleBuilderView ──────────────────────────────────────── */

export default function SimpleBuilderView() {
  const { nodes, edges, settings } = useBuilder()
  const [expandedId, setExpandedId] = useState<string | null>(
    nodes.length > 0 ? nodes[0].id : null
  )

  // Sort nodes by dependency depth (topological)
  const sortedNodes = useMemo(() => {
    if (nodes.length === 0) return []
    const depMap = new Map<string, Set<string>>()
    edges.forEach((e) => {
      if (!depMap.has(e.target)) depMap.set(e.target, new Set())
      depMap.get(e.target)!.add(e.source)
    })

    const depths = new Map<string, number>()
    function getDepth(id: string): number {
      if (depths.has(id)) return depths.get(id)!
      const deps = depMap.get(id)
      if (!deps || deps.size === 0) { depths.set(id, 0); return 0 }
      const d = Math.max(...[...deps].map(getDepth)) + 1
      depths.set(id, d)
      return d
    }
    nodes.forEach((n) => getDepth(n.id))
    return [...nodes].sort((a, b) => (depths.get(a.id) ?? 0) - (depths.get(b.id) ?? 0))
  }, [nodes, edges])

  if (nodes.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        color: 'var(--text-muted)', padding: 40,
      }}>
        <div style={{ fontSize: 40, opacity: 0.3 }}>0n</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
          No steps yet
        </div>
        <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
          Import a .0n file or drag services from the palette to get started.
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '24px 32px',
      background: 'var(--bg-primary)',
    }}>
      {/* Workflow header */}
      <div style={{
        marginBottom: 24, paddingBottom: 16,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          {settings.name || 'Untitled Workflow'}
        </div>
        {settings.description && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            {settings.description}
          </div>
        )}
        <div style={{
          display: 'flex', gap: 16, fontSize: 12,
          fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
        }}>
          {settings.author && <span>by {settings.author}</span>}
          <span>{nodes.length} step{nodes.length !== 1 ? 's' : ''}</span>
          <span>{new Set(nodes.map(n => n.data.serviceId)).size} service{new Set(nodes.map(n => n.data.serviceId)).size !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Step list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
        {sortedNodes.map((node, i) => (
          <StepCard
            key={node.id}
            node={node}
            index={i}
            total={sortedNodes.length}
            isExpanded={expandedId === node.id}
            onToggle={() => setExpandedId(expandedId === node.id ? null : node.id)}
          />
        ))}
      </div>
    </div>
  )
}
