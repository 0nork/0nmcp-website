'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  active_campaigns: number
  total_contacts: number
  emails_sent: number
  open_rate: string
  reply_rate: string
  meetings_booked: number
  avg_health: number
  total_inboxes: number
  warming_inboxes: number
  recent_campaigns: Array<{ id: string; name: string; status: string; stats: Record<string, number> }>
  unread_replies: number
}

export default function MailDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mail?action=dashboard_stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Active Campaigns', value: stats?.active_campaigns ?? 0, color: 'green', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Total Contacts', value: stats?.total_contacts ?? 0, color: 'cyan', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Emails Sent', value: stats?.emails_sent ?? 0, color: 'purple', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { label: 'Open Rate', value: `${stats?.open_rate ?? '0'}%`, color: 'green', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { label: 'Reply Rate', value: `${stats?.reply_rate ?? '0'}%`, color: 'cyan', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
    { label: 'Meetings Booked', value: stats?.meetings_booked ?? 0, color: 'amber', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]

  const quickActions = [
    { label: 'New Campaign', desc: 'Launch a cold email campaign', href: '/console/mail/campaigns', icon: 'M12 4v16m8-8H4', color: 'var(--jp-green)' },
    { label: 'New Sequence', desc: 'AI-generate email steps', href: '/console/mail/sequences', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', color: 'var(--jp-cyan)' },
    { label: 'Add Inbox', desc: 'Connect a sending inbox', href: '/console/mail/inboxes', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'var(--jp-purple)' },
  ]

  const healthColor = (score: number) => {
    if (score >= 80) return 'var(--jp-green)'
    if (score >= 60) return 'var(--jp-amber)'
    return 'var(--jp-red)'
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--jp-green)'
      case 'paused': return 'var(--jp-amber)'
      case 'draft': return 'var(--jp-text-muted)'
      case 'complete': return 'var(--jp-cyan)'
      default: return 'var(--jp-text-muted)'
    }
  }

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="jp-page-title">0nMail</h1>
          <p className="jp-page-subtitle">Cold email orchestration engine</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {stats?.unread_replies ? (
            <Link href="/console/mail/replies" className="jp-btn jp-btn-outline" style={{ textDecoration: 'none' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {stats.unread_replies} unread
            </Link>
          ) : null}
        </div>
      </div>

      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} className={`jp-stat-card ${s.color}`}>
            <div className="jp-stat-header">
              <span className="jp-stat-label">{s.label}</span>
              <div className={`jp-stat-icon ${s.color}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
            </div>
            <div className="jp-stat-value">
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Deliverability Health Bar */}
      <div className="jp-card" style={{ marginBottom: 24 }}>
        <div className="jp-card-header">
          <h4>Deliverability Health</h4>
          <Link href="/console/mail/deliverability" style={{ fontSize: '0.8125rem', color: 'var(--jp-cyan)', textDecoration: 'none' }}>
            View Details
          </Link>
        </div>
        <div className="jp-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="jp-progress" style={{ height: 10 }}>
                <div
                  className="jp-progress-bar"
                  style={{
                    width: `${stats?.avg_health ?? 0}%`,
                    background: healthColor(stats?.avg_health ?? 0),
                  }}
                />
              </div>
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: healthColor(stats?.avg_health ?? 0),
              fontFamily: 'var(--font-mono, monospace)',
              minWidth: 48,
              textAlign: 'right',
            }}>
              {loading ? '—' : `${stats?.avg_health ?? 0}%`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: '0.8125rem', color: 'var(--jp-text-secondary)' }}>
            <span>{stats?.total_inboxes ?? 0} inboxes</span>
            <span style={{ color: 'var(--jp-amber)' }}>{stats?.warming_inboxes ?? 0} warming</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Recent Campaigns */}
        <div className="jp-card">
          <div className="jp-card-header">
            <h4>Recent Campaigns</h4>
            <Link href="/console/mail/campaigns" style={{ fontSize: '0.8125rem', color: 'var(--jp-cyan)', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div>
            {loading ? (
              <div className="jp-card-body" style={{ color: 'var(--jp-text-muted)', fontSize: '0.875rem' }}>Loading...</div>
            ) : (stats?.recent_campaigns?.length ?? 0) === 0 ? (
              <div className="jp-empty-state" style={{ padding: 32 }}>
                <div className="jp-empty-state-title">No campaigns yet</div>
                <div className="jp-empty-state-text">Create your first campaign to start sending</div>
              </div>
            ) : (
              <ul className="jp-activity-list">
                {stats!.recent_campaigns.map(c => (
                  <li key={c.id} className="jp-activity-item">
                    <span className="jp-activity-dot" style={{ background: statusColor(c.status) }} />
                    <div className="jp-activity-content">
                      <div className="jp-activity-text">{c.name}</div>
                      <div className="jp-activity-meta">
                        {c.stats?.sent ?? 0} sent / {c.stats?.opened ?? 0} opened / {c.stats?.replied ?? 0} replied
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: statusColor(c.status) + '20',
                      color: statusColor(c.status),
                      textTransform: 'uppercase',
                    }}>
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div style={{ marginBottom: 8, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--jp-text-secondary)' }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quickActions.map(qa => (
              <Link key={qa.label} href={qa.href} className="jp-quick-action" style={{ textDecoration: 'none' }}>
                <div className="jp-quick-action-icon" style={{ background: qa.color + '20', color: qa.color }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={qa.icon} />
                  </svg>
                </div>
                <div>
                  <div className="jp-quick-action-label">{qa.label}</div>
                  <div className="jp-quick-action-desc">{qa.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
