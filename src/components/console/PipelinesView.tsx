'use client'

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
}

interface PipelineStage {
  id: string
  name: string
  position: number
}

interface Opportunity {
  id: string
  name: string
  contactName: string
  monetaryValue: number
  pipelineStageId: string
  status: 'open' | 'won' | 'lost' | 'abandoned'
  source?: string
  dateAdded: string
  lastActivity?: string
}

interface PipelinesResponse {
  pipelines: Pipeline[]
}

interface OpportunitiesResponse {
  opportunities: Opportunity[]
  total: number
}

const STATUS_DOT: Record<string, string> = {
  open: '#6EE05A',
  won: '#00d4ff',
  lost: '#ef4444',
  abandoned: '#5f6672',
}

function Spinner(): ReactNode {
  return (
    <div style={{
      width: 20, height: 20, border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: '#6EE05A', borderRadius: '50%',
      animation: 'pipe-spin 0.6s linear infinite',
    }} />
  )
}

function formatCurrency(value: number): string {
  if (!value && value !== 0) return ''
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toLocaleString()}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function PipelinesView() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOpps, setLoadingOpps] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const kanbanRef = useRef<HTMLDivElement>(null)

  const fetchPipelines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/console/crm/pipelines')
      if (!res.ok) throw new Error(`Failed to fetch pipelines (${res.status})`)
      const data: PipelinesResponse = await res.json()
      setPipelines(data.pipelines || [])
      if (data.pipelines?.length > 0 && !selectedPipelineId) {
        setSelectedPipelineId(data.pipelines[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pipelines')
    } finally {
      setLoading(false)
    }
  }, [selectedPipelineId])

  const fetchOpportunities = useCallback(async (pipelineId: string) => {
    try {
      setLoadingOpps(true)
      const res = await fetch(`/api/console/crm/pipelines?pipelineId=${pipelineId}`)
      if (!res.ok) throw new Error(`Failed to fetch opportunities (${res.status})`)
      const data: OpportunitiesResponse = await res.json()
      setOpportunities(data.opportunities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load opportunities')
    } finally {
      setLoadingOpps(false)
    }
  }, [])

  useEffect(() => {
    fetchPipelines()
  }, [fetchPipelines])

  useEffect(() => {
    if (selectedPipelineId) {
      fetchOpportunities(selectedPipelineId)
    }
  }, [selectedPipelineId, fetchOpportunities])

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId)
  const stages = (selectedPipeline?.stages || []).sort((a, b) => a.position - b.position)

  // Group opportunities by stage
  const oppsByStage: Record<string, Opportunity[]> = {}
  for (const stage of stages) {
    oppsByStage[stage.id] = []
  }
  for (const opp of opportunities) {
    if (oppsByStage[opp.pipelineStageId]) {
      oppsByStage[opp.pipelineStageId].push(opp)
    }
  }

  // Calculate stage totals
  const stageTotals: Record<string, { count: number; value: number }> = {}
  for (const stage of stages) {
    const stageOpps = oppsByStage[stage.id] || []
    stageTotals[stage.id] = {
      count: stageOpps.length,
      value: stageOpps.reduce((sum, o) => sum + (o.monetaryValue || 0), 0),
    }
  }

  // Total pipeline value
  const totalValue = opportunities.reduce((sum, o) => sum + (o.monetaryValue || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem 1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e8eaed', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
              Pipelines
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#5f6672', margin: 0 }}>
              {opportunities.length} deal{opportunities.length !== 1 ? 's' : ''}
              {totalValue > 0 ? ` — ${formatCurrency(totalValue)} total value` : ''}
            </p>
          </div>
        </div>

        {/* Pipeline selector */}
        {pipelines.length > 1 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {pipelines.map(pl => {
              const active = pl.id === selectedPipelineId
              return (
                <button
                  key={pl.id}
                  onClick={() => setSelectedPipelineId(pl.id)}
                  style={{
                    padding: '0.4rem 0.875rem', borderRadius: 6, fontFamily: 'inherit',
                    border: `1px solid ${active ? 'rgba(126,217,87,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    background: active ? 'rgba(126,217,87,0.08)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#6EE05A' : '#7A8290',
                    fontSize: '0.75rem', fontWeight: active ? 600 : 500, cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >
                  {pl.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          margin: '0 2rem 1rem', padding: '1rem 1.25rem', borderRadius: 12,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>
          <button
            onClick={fetchPipelines}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
              background: 'transparent', color: '#ef4444', fontSize: '0.75rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {(loading || loadingOpps) && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spinner />
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadingOpps && pipelines.length === 0 && !error && (
        <div style={{
          margin: '0 2rem', padding: '3rem 1.5rem', textAlign: 'center', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '1.25rem', color: '#3a3a4a', marginBottom: '0.5rem' }}>No pipelines</div>
          <p style={{ fontSize: '0.8rem', color: '#5f6672', margin: 0 }}>
            Create a pipeline in your CRM to see deals here.
          </p>
        </div>
      )}

      {/* Kanban board */}
      {!loading && !loadingOpps && selectedPipeline && stages.length > 0 && (
        <div
          ref={kanbanRef}
          className="pipe-kanban"
          style={{
            flex: 1, display: 'flex', gap: '0.75rem', overflow: 'auto',
            padding: '0 2rem 2rem', minHeight: 0,
          }}
        >
          {stages.map((stage, stageIdx) => {
            const stageOpps = oppsByStage[stage.id] || []
            const totals = stageTotals[stage.id]
            // Generate a subtle color per stage position
            const hue = (stageIdx / stages.length) * 120 + 100 // green-to-cyan range
            const stageColor = `hsl(${hue}, 60%, 55%)`

            return (
              <div key={stage.id} style={{
                minWidth: 260, maxWidth: 320, width: 280, flexShrink: 0,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                {/* Stage header */}
                <div style={{
                  padding: '0.75rem 0.875rem', marginBottom: '0.5rem',
                  borderRadius: 10, background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderTop: `2px solid ${stageColor}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e8eaed' }}>
                      {stage.name}
                    </span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.4rem',
                      borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#7A8290',
                    }}>
                      {totals.count}
                    </span>
                  </div>
                  {totals.value > 0 && (
                    <div style={{
                      fontSize: '0.7rem', color: '#5f6672', fontFamily: 'var(--font-mono)',
                    }}>
                      {formatCurrency(totals.value)}
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div style={{
                  flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem',
                }}>
                  {stageOpps.length === 0 && (
                    <div style={{
                      padding: '1.5rem 0.75rem', textAlign: 'center', borderRadius: 8,
                      border: '1px dashed rgba(255,255,255,0.06)', color: '#3a3a4a',
                      fontSize: '0.7rem',
                    }}>
                      No deals
                    </div>
                  )}

                  {stageOpps.map(opp => {
                    const statusColor = STATUS_DOT[opp.status] || '#6EE05A'
                    return (
                      <div key={opp.id} style={{
                        padding: '0.75rem 0.875rem', borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'default', transition: 'border-color 0.15s ease',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                      >
                        {/* Contact + status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0,
                          }} />
                          <span style={{
                            fontSize: '0.8rem', fontWeight: 600, color: '#e8eaed',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                          }}>
                            {opp.contactName || opp.name || 'Unknown'}
                          </span>
                        </div>

                        {/* Deal name if different from contact */}
                        {opp.name && opp.name !== opp.contactName && (
                          <div style={{
                            fontSize: '0.7rem', color: '#5f6672', marginBottom: 6,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {opp.name}
                          </div>
                        )}

                        {/* Value + date */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {opp.monetaryValue > 0 ? (
                            <span style={{
                              fontSize: '0.8rem', fontWeight: 700, color: '#6EE05A',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {formatCurrency(opp.monetaryValue)}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#3a3a4a' }}>No value</span>
                          )}
                          <span style={{
                            fontSize: '0.6rem', color: '#5f6672', fontFamily: 'var(--font-mono)',
                          }}>
                            {formatDate(opp.lastActivity || opp.dateAdded)}
                          </span>
                        </div>

                        {/* Source */}
                        {opp.source && (
                          <div style={{
                            marginTop: 6, fontSize: '0.6rem', color: '#5f6672',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            via {opp.source}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No stages */}
      {!loading && !loadingOpps && selectedPipeline && stages.length === 0 && (
        <div style={{
          margin: '0 2rem', padding: '3rem 1.5rem', textAlign: 'center', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '1.25rem', color: '#3a3a4a', marginBottom: '0.5rem' }}>No stages</div>
          <p style={{ fontSize: '0.8rem', color: '#5f6672', margin: 0 }}>
            This pipeline has no stages configured.
          </p>
        </div>
      )}

      <style>{`
        @keyframes pipe-spin { to { transform: rotate(360deg) } }
        .pipe-kanban::-webkit-scrollbar { height: 6px; }
        .pipe-kanban::-webkit-scrollbar-track { background: transparent; }
        .pipe-kanban::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .pipe-kanban::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  )
}
