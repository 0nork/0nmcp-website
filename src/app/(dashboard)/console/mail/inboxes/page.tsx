'use client'

import { useState, useEffect } from 'react'

interface Inbox {
  id: string
  email_address: string
  domain: string
  provider: string
  warmup_provider: string | null
  warmup_status: string
  warmup_day: number
  health_score: number
  daily_send_limit: number
  dns_configured: boolean
  spf_verified: boolean
  dkim_verified: boolean
  dmarc_verified: boolean
  created_at: string
}

export default function InboxesPage() {
  const [inboxes, setInboxes] = useState<Inbox[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ email_address: '', domain: '', provider: 'google_workspace', warmup_provider: 'smartlead' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/mail?action=inboxes')
      .then(r => r.json())
      .then(d => setInboxes(d.inboxes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const healthColor = (score: number) => {
    if (score >= 80) return 'var(--jp-green)'
    if (score >= 60) return 'var(--jp-amber)'
    return 'var(--jp-red)'
  }

  const warmupColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--jp-amber)'
      case 'complete': return 'var(--jp-green)'
      case 'paused': return 'var(--jp-red)'
      default: return 'var(--jp-text-muted)'
    }
  }

  const providerLabel = (p: string) => {
    switch (p) {
      case 'google_workspace': return 'Google Workspace'
      case 'microsoft_365': return 'Microsoft 365'
      default: return p
    }
  }

  const addInbox = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_inbox', ...form }),
      })
      const data = await res.json()
      if (data.inbox) {
        setInboxes(prev => [data.inbox, ...prev])
        setShowAdd(false)
        setForm({ email_address: '', domain: '', provider: 'google_workspace', warmup_provider: 'smartlead' })
      }
    } catch { /* empty */ }
    setSaving(false)
  }

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="jp-page-title">Inboxes</h1>
          <p className="jp-page-subtitle">Manage sending inboxes and warmup status</p>
        </div>
        <button className="jp-btn jp-btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Inbox
        </button>
      </div>

      {/* Add Inbox Modal */}
      {showAdd && (
        <div className="jp-card" style={{ marginBottom: 24 }}>
          <div className="jp-card-header">
            <h4>Connect New Inbox</h4>
            <button className="jp-btn jp-btn-outline" onClick={() => setShowAdd(false)} style={{ padding: '4px 8px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="jp-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input
                className="jp-search-input"
                style={{ width: '100%', paddingLeft: 14 }}
                placeholder="name@yourdomain.com"
                value={form.email_address}
                onChange={e => {
                  const email = e.target.value
                  setForm(f => ({ ...f, email_address: email, domain: email.includes('@') ? email.split('@')[1] : f.domain }))
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Domain</label>
              <input
                className="jp-search-input"
                style={{ width: '100%', paddingLeft: 14 }}
                placeholder="yourdomain.com"
                value={form.domain}
                onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Mailbox Provider</label>
              <select
                className="jp-search-input"
                style={{ width: '100%', paddingLeft: 14 }}
                value={form.provider}
                onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
              >
                <option value="google_workspace">Google Workspace</option>
                <option value="microsoft_365">Microsoft 365</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Warmup Provider</label>
              <select
                className="jp-search-input"
                style={{ width: '100%', paddingLeft: 14 }}
                value={form.warmup_provider}
                onChange={e => setForm(f => ({ ...f, warmup_provider: e.target.value }))}
              >
                <option value="smartlead">Smartlead (recommended)</option>
                <option value="instantly">Instantly</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="jp-btn jp-btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="jp-btn jp-btn-primary" onClick={addInbox} disabled={saving || !form.email_address || !form.domain}>
                {saving ? 'Connecting...' : 'Connect Inbox'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inbox Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--jp-text-muted)' }}>Loading inboxes...</div>
      ) : inboxes.length === 0 ? (
        <div className="jp-card">
          <div className="jp-empty-state">
            <div className="jp-empty-state-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="jp-empty-state-title">No inboxes connected</div>
            <div className="jp-empty-state-text">Add your first sending inbox to start warming up and launching campaigns</div>
          </div>
        </div>
      ) : (
        <div className="jp-integration-grid">
          {inboxes.map(inbox => (
            <div key={inbox.id} className="jp-integration-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--jp-text)', marginBottom: 4 }}>
                    {inbox.email_address}
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(167, 139, 250, 0.12)',
                    color: 'var(--jp-purple)',
                  }}>
                    {providerLabel(inbox.provider)}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: warmupColor(inbox.warmup_status) + '20',
                  color: warmupColor(inbox.warmup_status),
                  textTransform: 'uppercase',
                }}>
                  {inbox.warmup_status === 'active' ? `Warming (Day ${inbox.warmup_day})` : inbox.warmup_status}
                </span>
              </div>

              {/* Health Score */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--jp-text-muted)' }}>Health Score</span>
                  <span style={{ fontWeight: 700, color: healthColor(inbox.health_score), fontFamily: 'var(--font-mono, monospace)' }}>
                    {inbox.health_score}/100
                  </span>
                </div>
                <div className="jp-progress">
                  <div className="jp-progress-bar" style={{ width: `${inbox.health_score}%`, background: healthColor(inbox.health_score) }} />
                </div>
              </div>

              {/* Warmup Progress */}
              {inbox.warmup_status === 'active' && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--jp-text-muted)' }}>Warmup Progress</span>
                    <span style={{ color: 'var(--jp-amber)' }}>Day {inbox.warmup_day}/30</span>
                  </div>
                  <div className="jp-progress">
                    <div className="jp-progress-bar amber" style={{ width: `${Math.min(100, (inbox.warmup_day / 30) * 100)}%` }} />
                  </div>
                </div>
              )}

              {/* Send Limit */}
              <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginBottom: 12 }}>
                Daily limit: <span style={{ color: 'var(--jp-text-secondary)', fontWeight: 600 }}>{inbox.daily_send_limit}/day</span>
              </div>

              {/* DNS Status */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'SPF', ok: inbox.spf_verified },
                  { label: 'DKIM', ok: inbox.dkim_verified },
                  { label: 'DMARC', ok: inbox.dmarc_verified },
                ].map(dns => (
                  <span key={dns.label} style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: dns.ok ? 'var(--jp-green-glow)' : 'rgba(248, 113, 113, 0.12)',
                    color: dns.ok ? 'var(--jp-green)' : 'var(--jp-red)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    {dns.ok ? (
                      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {dns.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
