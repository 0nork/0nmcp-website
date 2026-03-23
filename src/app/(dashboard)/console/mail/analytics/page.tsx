'use client'

import { useState, useEffect } from 'react'

interface CampaignData {
  id: string
  name: string
  status: string
  stats: { sent: number; delivered: number; opened: number; clicked: number; replied: number; bounced: number; unsubscribed: number; meetings_booked: number }
  created_at: string
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30d')

  useEffect(() => {
    fetch('/api/mail?action=campaigns')
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Aggregate stats
  let totalSent = 0, totalDelivered = 0, totalOpened = 0, totalClicked = 0, totalReplied = 0, totalBounced = 0, totalMeetings = 0
  for (const c of campaigns) {
    const s = c.stats || {}
    totalSent += s.sent || 0
    totalDelivered += s.delivered || 0
    totalOpened += s.opened || 0
    totalClicked += s.clicked || 0
    totalReplied += s.replied || 0
    totalBounced += s.bounced || 0
    totalMeetings += s.meetings_booked || 0
  }

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0'
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0'
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0'
  const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0'
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0'

  // Sort campaigns by reply rate for top performers
  const sortedByReply = [...campaigns]
    .filter(c => (c.stats?.sent || 0) > 0)
    .sort((a, b) => {
      const rA = (a.stats?.replied || 0) / (a.stats?.sent || 1)
      const rB = (b.stats?.replied || 0) / (b.stats?.sent || 1)
      return rB - rA
    })
    .slice(0, 5)

  // Simulated chart bars (proportional to sent count)
  const maxSent = Math.max(...campaigns.map(c => c.stats?.sent || 0), 1)

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="jp-page-title">Analytics</h1>
          <p className="jp-page-subtitle">Performance metrics across all campaigns</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['7d', '30d', '90d'].map(r => (
            <button
              key={r}
              className={`jp-btn ${range === r ? 'jp-btn-primary' : 'jp-btn-outline'}`}
              onClick={() => setRange(r)}
              style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--jp-text-muted)' }}>Loading analytics...</div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="jp-stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
            {[
              { label: 'Total Sent', value: totalSent.toLocaleString(), color: 'green' },
              { label: 'Delivery Rate', value: `${deliveryRate}%`, color: 'green' },
              { label: 'Open Rate', value: `${openRate}%`, color: 'cyan' },
              { label: 'Reply Rate', value: `${replyRate}%`, color: 'purple' },
            ].map(s => (
              <div key={s.label} className={`jp-stat-card ${s.color}`}>
                <div className="jp-stat-label">{s.label}</div>
                <div className="jp-stat-value" style={{ marginTop: 8 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Funnel */}
            <div className="jp-card">
              <div className="jp-card-header">
                <h4>Engagement Funnel</h4>
              </div>
              <div className="jp-card-body">
                {[
                  { label: 'Sent', value: totalSent, color: 'var(--jp-text-secondary)', pct: 100 },
                  { label: 'Delivered', value: totalDelivered, color: 'var(--jp-green)', pct: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0 },
                  { label: 'Opened', value: totalOpened, color: 'var(--jp-cyan)', pct: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0 },
                  { label: 'Clicked', value: totalClicked, color: 'var(--jp-purple)', pct: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0 },
                  { label: 'Replied', value: totalReplied, color: 'var(--jp-amber)', pct: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0 },
                  { label: 'Meetings', value: totalMeetings, color: 'var(--jp-green)', pct: totalSent > 0 ? (totalMeetings / totalSent) * 100 : 0 },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--jp-text-secondary)' }}>{f.label}</span>
                      <span style={{ fontWeight: 600, color: f.color }}>{f.value} ({f.pct.toFixed(1)}%)</span>
                    </div>
                    <div className="jp-progress">
                      <div className="jp-progress-bar" style={{ width: `${f.pct}%`, background: f.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="jp-card">
              <div className="jp-card-header">
                <h4>Key Metrics</h4>
              </div>
              <div className="jp-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Click Rate', value: `${clickRate}%`, color: 'var(--jp-purple)' },
                    { label: 'Bounce Rate', value: `${bounceRate}%`, color: bounceRate !== '0' && parseFloat(bounceRate) > 5 ? 'var(--jp-red)' : 'var(--jp-green)' },
                    { label: 'Meetings Booked', value: totalMeetings.toString(), color: 'var(--jp-amber)' },
                    { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length.toString(), color: 'var(--jp-green)' },
                  ].map(m => (
                    <div key={m.label} style={{
                      padding: 16, borderRadius: 'var(--jp-radius-sm)',
                      background: 'var(--jp-bg-input)', border: '1px solid var(--jp-border)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono, monospace)' }}>{m.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginTop: 4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Send Volume Chart */}
          <div className="jp-card" style={{ marginBottom: 24 }}>
            <div className="jp-card-header">
              <h4>Campaign Performance</h4>
            </div>
            <div className="jp-card-body">
              {campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--jp-text-muted)', fontSize: '0.875rem' }}>
                  No campaign data yet
                </div>
              ) : (
                <div className="jp-chart-area" style={{ height: 180 }}>
                  {campaigns.slice(0, 14).map((c, i) => (
                    <div
                      key={c.id}
                      className="jp-chart-bar"
                      style={{ height: `${Math.max(8, ((c.stats?.sent || 0) / maxSent) * 100)}%` }}
                      title={`${c.name}: ${c.stats?.sent || 0} sent`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Sequences */}
          {sortedByReply.length > 0 && (
            <div className="jp-card">
              <div className="jp-card-header">
                <h4>Top Performing Campaigns (by Reply Rate)</h4>
              </div>
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Sent</th>
                    <th>Open Rate</th>
                    <th>Reply Rate</th>
                    <th>Meetings</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByReply.map(c => {
                    const s = c.stats || {}
                    const cOpen = s.sent > 0 ? ((s.opened / s.sent) * 100).toFixed(1) : '0'
                    const cReply = s.sent > 0 ? ((s.replied / s.sent) * 100).toFixed(1) : '0'
                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600, color: 'var(--jp-text)' }}>{c.name}</td>
                        <td>{s.sent}</td>
                        <td style={{ color: 'var(--jp-cyan)' }}>{cOpen}%</td>
                        <td style={{ color: 'var(--jp-green)', fontWeight: 600 }}>{cReply}%</td>
                        <td style={{ color: 'var(--jp-amber)' }}>{s.meetings_booked || 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
