'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Finding {
  id: string
  scan_type: string
  title: string
  summary: string
  source_url: string | null
  threat_level: string
  category: string
  company_name: string | null
  overlapping_patents: string[] | null
  overlap_summary: string | null
  reviewed: boolean
  review_status: string | null
  created_at: string
}

interface Alert {
  id: string
  alert_type: string
  message: string
  read: boolean
  created_at: string
}

interface ScanInfo {
  scan_type: string
  status: string
  results_count: number
  completed_at: string | null
}

const THREAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.08)', text: '#ef4444', dot: '#ef4444' },
  high: { bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', dot: '#f59e0b' },
  medium: { bg: 'rgba(59,130,246,0.08)', text: '#3b82f6', dot: '#3b82f6' },
  low: { bg: 'rgba(156,163,175,0.08)', text: '#9ca3af', dot: '#9ca3af' },
  opportunity: { bg: 'rgba(110,224,90,0.08)', text: '#6EE05A', dot: '#6EE05A' },
}

const REVIEW_ACTIONS = [
  { key: 'watching', label: '👁 Watching', color: '#3b82f6' },
  { key: 'action_required', label: '⚡ Action Required', color: '#ef4444' },
  { key: 'no_action', label: '✓ No Action', color: '#9ca3af' },
  { key: 'escalate_attorney', label: '⚖️ Escalate to Attorney', color: '#f59e0b' },
]

export default function PatentIntelDashboard() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastScan, setLastScan] = useState<ScanInfo | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('threat_level', filter)
    if (typeFilter !== 'all') params.set('scan_type', typeFilter)
    params.set('limit', '100')

    const [findingsRes, alertsRes] = await Promise.all([
      fetch(`/api/admin/patent-intel/findings?${params}`).then(r => r.json()).catch(() => ({ findings: [], total: 0 })),
      fetch('/api/admin/patent-intel/alerts').then(r => r.json()).catch(() => ({ alerts: [], unread_count: 0 })),
    ])

    setFindings(findingsRes.findings || [])
    setTotal(findingsRes.total || 0)
    setAlerts(alertsRes.alerts || [])
    setLoading(false)
  }, [filter, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  async function triggerScan(type: string = 'all') {
    setScanning(true)
    await fetch('/api/admin/patent-intel/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scan_type: type }),
    })
    setTimeout(() => { setScanning(false); fetchData() }, 5000)
  }

  async function reviewFinding(id: string, status: string) {
    await fetch(`/api/admin/patent-intel/findings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_status: status, review_notes: reviewNotes }),
    })
    setReviewingId(null)
    setReviewNotes('')
    fetchData()
  }

  async function markAlertsRead() {
    await fetch('/api/admin/patent-intel/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all_read: true }),
    })
    fetchData()
  }

  const counts = {
    critical: findings.filter(f => f.threat_level === 'critical').length,
    high: findings.filter(f => f.threat_level === 'high').length,
    medium: findings.filter(f => f.threat_level === 'medium').length,
    low: findings.filter(f => f.threat_level === 'low').length,
    opportunity: findings.filter(f => f.threat_level === 'opportunity').length,
    unreviewed: findings.filter(f => !f.reviewed).length,
  }
  const unreadAlerts = alerts.filter(a => !a.read).length

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8eaed', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #1e293b' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#6EE05A' }}>0n</span>DEFENDER
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(110,224,90,0.1)', color: '#6EE05A', fontWeight: 700 }}>PATENT INTEL</span>
            </h1>
            <p style={{ fontSize: 13, color: '#556880', margin: '4px 0 0' }}>
              {total} findings · {counts.unreviewed} unreviewed · {unreadAlerts} unread alerts
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/patent-intel/watchlist" style={{
              padding: '8px 16px', borderRadius: 8, background: '#1c2b42', color: '#8b9ab5',
              fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #1e293b',
            }}>
              Watchlist
            </Link>
            <button onClick={() => triggerScan('all')} disabled={scanning} style={{
              padding: '8px 20px', borderRadius: 8,
              background: scanning ? '#1c2b42' : '#6EE05A', color: scanning ? '#556880' : '#0a0a0f',
              fontSize: 13, fontWeight: 800, border: 'none', cursor: scanning ? 'not-allowed' : 'pointer',
            }}>
              {scanning ? 'Scanning...' : 'Run Full Scan ▶'}
            </button>
          </div>
        </div>

        {/* Threat Summary + Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24 }}>
          {/* Threat counts */}
          <div style={{ background: '#111827', borderRadius: 14, padding: 20, border: '1px solid #1e293b' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#556880', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Threat Summary</h3>
            {Object.entries(THREAT_COLORS).map(([level, colors]) => (
              <div key={level} onClick={() => setFilter(level)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                background: filter === level ? colors.bg : 'transparent',
                transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.dot }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, textTransform: 'capitalize' }}>{level}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: colors.text }}>{counts[level as keyof typeof counts] || 0}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #1e293b', marginTop: 8, paddingTop: 8 }}>
              <div onClick={() => setFilter('all')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                background: filter === 'all' ? 'rgba(255,255,255,0.04)' : 'transparent',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#8b9ab5' }}>All</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#e8eaed' }}>{total}</span>
              </div>
            </div>
          </div>

          {/* Alert feed */}
          <div style={{ background: '#111827', borderRadius: 14, padding: 20, border: '1px solid #1e293b', maxHeight: 300, overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#556880', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Alert Feed {unreadAlerts > 0 && <span style={{ color: '#ef4444' }}>({unreadAlerts} new)</span>}
              </h3>
              {unreadAlerts > 0 && (
                <button onClick={markAlertsRead} style={{ fontSize: 11, color: '#6EE05A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>
            {alerts.length === 0 ? (
              <p style={{ fontSize: 13, color: '#556880', textAlign: 'center', padding: '2rem 0' }}>No alerts yet. Run a scan to start monitoring.</p>
            ) : alerts.slice(0, 20).map(alert => (
              <div key={alert.id} style={{
                padding: '8px 0', borderBottom: '1px solid #1e293b',
                opacity: alert.read ? 0.5 : 1,
              }}>
                <p style={{ fontSize: 13, color: '#e8eaed', margin: 0 }}>{alert.message}</p>
                <p style={{ fontSize: 11, color: '#556880', margin: '2px 0 0' }}>
                  {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Type filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { key: 'all', label: 'All Types' },
            { key: 'mcp_entrant', label: 'MCP Entrants' },
            { key: 'patent', label: 'Patent Conflicts' },
            { key: 'acquisition', label: 'Acquisition Signals' },
            { key: 'brand', label: 'Brand Protection' },
          ].map(t => (
            <button key={t.key} onClick={() => setTypeFilter(t.key)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: typeFilter === t.key ? '#6EE05A' : '#1c2b42',
              color: typeFilter === t.key ? '#0a0a0f' : '#8b9ab5',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Findings list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#556880' }}>Loading findings...</div>
        ) : findings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#556880' }}>
            <p style={{ fontSize: 15, fontWeight: 600 }}>No findings yet</p>
            <p style={{ fontSize: 13 }}>Run a scan to start monitoring the MCP ecosystem.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {findings.map(f => {
              const tc = THREAT_COLORS[f.threat_level] || THREAT_COLORS.low
              const isReviewing = reviewingId === f.id
              return (
                <div key={f.id} style={{
                  background: '#111827', borderRadius: 12, padding: 16,
                  border: `1px solid ${isReviewing ? '#6EE05A' : '#1e293b'}`,
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Threat badge */}
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                      background: tc.bg, color: tc.text, textTransform: 'uppercase',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {f.threat_level}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Title + category */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#1c2b42', color: '#8b9ab5', fontWeight: 600, textTransform: 'uppercase' }}>
                          {f.category.replace(/_/g, ' ')}
                        </span>
                        {f.reviewed && f.review_status && (
                          <span style={{ fontSize: 10, color: '#6EE05A', fontWeight: 600 }}>
                            {REVIEW_ACTIONS.find(a => a.key === f.review_status)?.label || f.review_status}
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#e8eaed', margin: '0 0 4px' }}>{f.title}</h4>
                      <p style={{ fontSize: 13, color: '#8b9ab5', margin: '0 0 6px', lineHeight: 1.5 }}>{f.summary}</p>

                      {/* Meta */}
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#556880', flexWrap: 'wrap' }}>
                        {f.company_name && <span>Company: {f.company_name}</span>}
                        {f.overlapping_patents?.length ? <span>Overlaps: {f.overlapping_patents.join(', ')}</span> : null}
                        {f.source_url && <a href={f.source_url} target="_blank" rel="noopener" style={{ color: '#6EE05A' }}>Source →</a>}
                        <span>{new Date(f.created_at).toLocaleDateString()}</span>
                      </div>

                      {f.overlap_summary && (
                        <p style={{ fontSize: 12, color: '#f59e0b', margin: '6px 0 0', fontStyle: 'italic' }}>{f.overlap_summary}</p>
                      )}

                      {/* Review panel */}
                      {isReviewing && (
                        <div style={{ marginTop: 12, padding: 12, background: '#0a0a0f', borderRadius: 10, border: '1px solid #1e293b' }}>
                          <textarea
                            value={reviewNotes}
                            onChange={e => setReviewNotes(e.target.value)}
                            placeholder="Review notes..."
                            rows={2}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b', background: '#111827', color: '#e8eaed', fontSize: 13, resize: 'vertical', marginBottom: 8, boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {REVIEW_ACTIONS.map(action => (
                              <button key={action.key} onClick={() => reviewFinding(f.id, action.key)} style={{
                                padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                background: 'rgba(255,255,255,0.04)', color: action.color,
                                border: `1px solid ${action.color}33`, cursor: 'pointer',
                              }}>
                                {action.label}
                              </button>
                            ))}
                            <button onClick={() => setReviewingId(null)} style={{
                              padding: '6px 12px', borderRadius: 6, fontSize: 11,
                              background: 'none', color: '#556880', border: 'none', cursor: 'pointer',
                            }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Review button */}
                    {!isReviewing && (
                      <button onClick={() => setReviewingId(f.id)} style={{
                        padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: f.reviewed ? '#1c2b42' : 'rgba(110,224,90,0.1)',
                        color: f.reviewed ? '#556880' : '#6EE05A',
                        border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {f.reviewed ? 'Re-review' : 'Review'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
