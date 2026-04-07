'use client'

/**
 * /console/agent-workflows — AI Agent Workflows Viewer
 *
 * Shows all 22 workflows from crm_agent_workflows.
 * Spa workflows highlighted with burgundy badge.
 * Expandable steps view. Filter by location/status.
 */

import { useState, useEffect } from 'react'

interface WorkflowStep {
  step: number
  service: string
  action: string
  description: string
}

interface Workflow {
  id: string
  name: string
  slug: string
  description: string
  status: string
  trigger_event: string
  trigger_conditions: Record<string, unknown>
  steps: WorkflowStep[]
  services: string[]
  total_executions: number
  executions_today: number
  last_executed_at: string | null
  created_at: string
}

const SERVICE_COLORS: Record<string, string> = {
  crm: 'var(--accent, #7ed957)',
  supabase: '#3ECF8E',
  stripe: '#635BFF',
  slack: '#4A154B',
  telegram: '#26A5E4',
  anthropic: '#D4A574',
  openai: '#10a37f',
  gemini: '#4285F4',
  grok: '#1DA1F2',
  github: '#8b949e',
  vercel: '#fff',
  figma: '#F24E1E',
  ga4: '#E37400',
  devto: '#0A0A0A',
}

export default function AgentWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'spa' | 'platform'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/console/agent-workflows')
      .then(r => r.json())
      .then(data => { setWorkflows(data.workflows || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = workflows.filter(w => {
    if (filter === 'spa' && !w.slug.startsWith('0nspa')) return false
    if (filter === 'platform' && w.slug.startsWith('0nspa')) return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.slug.includes(search.toLowerCase())) return false
    return true
  })

  const spaCount = workflows.filter(w => w.slug.startsWith('0nspa')).length
  const platformCount = workflows.length - spaCount

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            AI Agent Workflows
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
            {workflows.length} workflows — {workflows.filter(w => w.status === 'active').length} active — {spaCount} Spa Ligonier
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text" placeholder="Search..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-primary)', color: 'var(--text-primary)',
              fontSize: '0.8125rem', width: 180, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {([['all', `All (${workflows.length})`], ['spa', `Spa (${spaCount})`], ['platform', `Platform (${platformCount})`]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key as 'all' | 'spa' | 'platform')} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.6875rem', fontWeight: 600, fontFamily: 'inherit',
                background: filter === key ? (key === 'spa' ? 'rgba(87,3,1,0.15)' : 'var(--accent-glow)') : 'transparent',
                color: filter === key ? (key === 'spa' ? '#C8792D' : 'var(--accent)') : 'var(--text-muted)',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(w => {
          const isSpa = w.slug.startsWith('0nspa')
          const isExpanded = expanded === w.id

          return (
            <div
              key={w.id}
              style={{
                borderRadius: 12, overflow: 'hidden',
                background: isExpanded ? 'var(--bg-card)' : 'var(--bg-card)',
                border: `1px solid ${isExpanded ? (isSpa ? 'rgba(200,121,45,0.3)' : 'var(--accent-dim)') : 'var(--border)'}`,
                transition: 'border-color 0.15s',
              }}
            >
              {/* Header Row */}
              <button
                onClick={() => setExpanded(isExpanded ? null : w.id)}
                style={{
                  width: '100%', padding: '14px 16px', border: 'none', cursor: 'pointer',
                  background: 'transparent', textAlign: 'left', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Status dot */}
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: w.status === 'active' ? 'var(--accent)' : 'var(--color-amber)',
                    boxShadow: w.status === 'active' ? '0 0 6px var(--accent-glow)' : 'none',
                  }} />
                  {/* Name */}
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {w.name}
                  </span>
                  {/* Spa badge */}
                  {isSpa && (
                    <span style={{
                      fontSize: '0.5rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                      background: 'rgba(87,3,1,0.15)', color: '#C8792D',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>SPA LIGONIER</span>
                  )}
                  {/* Trigger */}
                  <span style={{
                    fontSize: '0.5625rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, marginLeft: 'auto',
                    background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono, monospace)', flexShrink: 0,
                  }}>
                    {w.trigger_event}
                  </span>
                  {/* Expand arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} strokeLinecap="round"
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
                {/* Description */}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {w.description?.slice(0, 150)}{w.description && w.description.length > 150 ? '...' : ''}
                </p>
                {/* Service badges */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {w.services?.map(s => (
                    <span key={s} style={{
                      fontSize: '0.5rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: `color-mix(in srgb, ${SERVICE_COLORS[s] || 'var(--text-muted)'} 12%, transparent)`,
                      color: SERVICE_COLORS[s] || 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                    }}>{s}</span>
                  ))}
                </div>
                {/* Stats */}
                {(w.total_executions > 0 || w.last_executed_at) && (
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>{w.total_executions} executions</span>
                    {w.last_executed_at && <span>last: {new Date(w.last_executed_at).toLocaleDateString()}</span>}
                  </div>
                )}
              </button>

              {/* Expanded Steps */}
              {isExpanded && w.steps && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '12px 0 8px', fontFamily: 'var(--font-mono)' }}>
                    {w.steps.length} Steps
                  </div>
                  {w.steps.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, padding: '8px 0',
                      borderBottom: i < w.steps.length - 1 ? '1px solid var(--border)' : 'none',
                      fontSize: '0.75rem',
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSpa ? 'rgba(200,121,45,0.1)' : 'var(--accent-glow)',
                        color: isSpa ? '#C8792D' : 'var(--accent)',
                        fontSize: '0.5625rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                      }}>
                        {step.step}
                      </span>
                      <span style={{
                        minWidth: 65, color: SERVICE_COLORS[step.service] || 'var(--color-cyan)',
                        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.6875rem', flexShrink: 0,
                      }}>
                        {step.service}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {step.description}
                      </span>
                    </div>
                  ))}

                  {/* Trigger conditions */}
                  {w.trigger_conditions && Object.keys(w.trigger_conditions).length > 0 && (
                    <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary)', fontSize: '0.6875rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Conditions: </span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {JSON.stringify(w.trigger_conditions)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No workflows match your filter
        </div>
      )}
    </div>
  )
}
