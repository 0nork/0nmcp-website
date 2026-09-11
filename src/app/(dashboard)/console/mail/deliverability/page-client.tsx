'use client'

import { useState, useEffect } from 'react'

interface Domain {
  id: string
  domain: string
  registrar: string | null
  health_score: number
  spam_score: number
  blacklist_status: Record<string, unknown>
  last_checked_at: string | null
  auto_pause_threshold: number
  created_at: string
}

interface Inbox {
  id: string
  email_address: string
  domain: string
  health_score: number
  spf_verified: boolean
  dkim_verified: boolean
  dmarc_verified: boolean
  dns_configured: boolean
}

export default function DeliverabilityPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [inboxes, setInboxes] = useState<Inbox[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/mail?action=domains').then(r => r.json()),
      fetch('/api/mail?action=inboxes').then(r => r.json()),
    ]).then(([d, i]) => {
      setDomains(d.domains || [])
      setInboxes(i.inboxes || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const healthColor = (score: number) => {
    if (score >= 80) return 'var(--jp-green)'
    if (score >= 60) return 'var(--jp-amber)'
    if (score >= 40) return '#fb923c' // orange
    return 'var(--jp-red)'
  }

  const spamColor = (score: number) => {
    if (score <= 2) return 'var(--jp-green)'
    if (score <= 5) return 'var(--jp-amber)'
    return 'var(--jp-red)'
  }

  // Group inboxes by domain
  const domainInboxes: Record<string, Inbox[]> = {}
  for (const inbox of inboxes) {
    if (!domainInboxes[inbox.domain]) domainInboxes[inbox.domain] = []
    domainInboxes[inbox.domain].push(inbox)
  }

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header">
        <h1 className="jp-page-title">Deliverability Monitor</h1>
        <p className="jp-page-subtitle">Domain health scores, DNS verification, and blacklist monitoring</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--jp-text-muted)' }}>Loading deliverability data...</div>
      ) : domains.length === 0 && inboxes.length === 0 ? (
        <div className="jp-card">
          <div className="jp-empty-state">
            <div className="jp-empty-state-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="jp-empty-state-title">No domains to monitor</div>
            <div className="jp-empty-state-text">Add inboxes or domains to start tracking deliverability</div>
          </div>
        </div>
      ) : (
        <>
          {/* Domain Health Table */}
          {domains.length > 0 && (
            <div className="jp-card" style={{ marginBottom: 24 }}>
              <div className="jp-card-header">
                <h4>Domain Health</h4>
              </div>
              <table className="jp-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Health Score</th>
                    <th>Spam Score</th>
                    <th>Blacklists</th>
                    <th>Last Checked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map(d => {
                    const blacklistCount = Object.keys(d.blacklist_status || {}).length
                    const autoPaused = d.health_score < d.auto_pause_threshold
                    return (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600, color: 'var(--jp-text)' }}>{d.domain}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="jp-progress" style={{ width: 80, height: 6 }}>
                              <div className="jp-progress-bar" style={{ width: `${d.health_score}%`, background: healthColor(d.health_score) }} />
                            </div>
                            <span style={{ fontWeight: 700, color: healthColor(d.health_score), fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
                              {d.health_score}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: spamColor(d.spam_score) }}>{d.spam_score}/10</span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                            background: blacklistCount === 0 ? 'var(--jp-green-glow)' : 'rgba(248, 113, 113, 0.12)',
                            color: blacklistCount === 0 ? 'var(--jp-green)' : 'var(--jp-red)',
                          }}>
                            {blacklistCount === 0 ? 'Clean' : `${blacklistCount} hit`}
                          </span>
                        </td>
                        <td style={{ color: 'var(--jp-text-muted)', fontSize: '0.8125rem' }}>
                          {d.last_checked_at ? new Date(d.last_checked_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          {autoPaused ? (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(248, 113, 113, 0.12)', color: 'var(--jp-red)' }}>
                              AUTO-PAUSED
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--jp-green-glow)', color: 'var(--jp-green)' }}>
                              HEALTHY
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* DNS Verification by Domain */}
          {Object.keys(domainInboxes).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {Object.entries(domainInboxes).map(([domain, dInboxes]) => (
                <div key={domain} className="jp-card">
                  <div className="jp-card-header">
                    <h4>{domain}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>{dInboxes.length} inbox{dInboxes.length !== 1 ? 'es' : ''}</span>
                  </div>
                  <div className="jp-card-body">
                    {/* DNS Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {[
                        { label: 'SPF', ok: dInboxes.some(i => i.spf_verified) },
                        { label: 'DKIM', ok: dInboxes.some(i => i.dkim_verified) },
                        { label: 'DMARC', ok: dInboxes.some(i => i.dmarc_verified) },
                        { label: 'MX', ok: dInboxes.some(i => i.dns_configured) },
                      ].map(dns => (
                        <div key={dns.label} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 10px', borderRadius: 6,
                          background: dns.ok ? 'var(--jp-green-glow)' : 'rgba(248, 113, 113, 0.06)',
                          border: `1px solid ${dns.ok ? 'rgba(110, 224, 90, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
                        }}>
                          {dns.ok ? (
                            <svg width="14" height="14" fill="none" stroke="var(--jp-green)" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" fill="none" stroke="var(--jp-red)" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: dns.ok ? 'var(--jp-green)' : 'var(--jp-red)' }}>
                            {dns.label} {dns.ok ? 'verified' : 'missing'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Inbox list under this domain */}
                    {dInboxes.map(inbox => (
                      <div key={inbox.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 0', borderTop: '1px solid var(--jp-border)',
                      }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)' }}>{inbox.email_address}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: healthColor(inbox.health_score), fontFamily: 'var(--font-mono, monospace)' }}>
                          {inbox.health_score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Auto-Pause Warning */}
          {domains.some(d => d.health_score < d.auto_pause_threshold) && (
            <div style={{
              marginTop: 24, padding: 16, borderRadius: 'var(--jp-radius)',
              background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <svg width="20" height="20" fill="none" stroke="var(--jp-red)" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-red)' }}>Auto-Pause Active</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)' }}>
                  {domains.filter(d => d.health_score < d.auto_pause_threshold).map(d => d.domain).join(', ')} — campaigns using these domains have been paused to protect sender reputation
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
