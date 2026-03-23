'use client'

import { useState, useEffect } from 'react'

interface Reply {
  id: string
  from_email: string
  subject: string | null
  body_preview: string | null
  classification: string | null
  sentiment_score: number | null
  ai_draft_response: string | null
  status: string
  created_at: string
  onmail_campaigns?: { name: string }
  onmail_campaign_contacts?: { first_name: string | null; last_name: string | null; email: string; company: string | null }
}

export default function RepliesPage() {
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Reply | null>(null)

  useEffect(() => {
    fetch('/api/mail?action=replies')
      .then(r => r.json())
      .then(d => setReplies(d.replies || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const classColor = (cls: string | null) => {
    switch (cls) {
      case 'positive': return 'var(--jp-green)'
      case 'negative': return 'var(--jp-red)'
      case 'ooo': return 'var(--jp-amber)'
      case 'unsubscribe': return 'var(--jp-red)'
      case 'bounce': return 'var(--jp-red)'
      case 'referral': return 'var(--jp-cyan)'
      default: return 'var(--jp-text-muted)'
    }
  }

  const classLabel = (cls: string | null) => {
    switch (cls) {
      case 'positive': return 'INTERESTED'
      case 'negative': return 'NOT INTERESTED'
      case 'ooo': return 'OUT OF OFFICE'
      case 'unsubscribe': return 'UNSUBSCRIBE'
      case 'bounce': return 'BOUNCE'
      case 'referral': return 'REFERRAL'
      default: return 'UNCLASSIFIED'
    }
  }

  const contactName = (r: Reply) => {
    const c = r.onmail_campaign_contacts
    if (c?.first_name || c?.last_name) return `${c.first_name || ''} ${c.last_name || ''}`.trim()
    return r.from_email
  }

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header">
        <h1 className="jp-page-title">Reply Hub</h1>
        <p className="jp-page-subtitle">All replies across campaigns, classified by intent</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--jp-text-muted)' }}>Loading replies...</div>
      ) : replies.length === 0 ? (
        <div className="jp-card">
          <div className="jp-empty-state">
            <div className="jp-empty-state-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <div className="jp-empty-state-title">No replies yet</div>
            <div className="jp-empty-state-text">Replies from your campaigns will appear here, classified automatically</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '380px 1fr' : '1fr', gap: 16 }}>
          {/* Reply List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="jp-card" style={{ overflow: 'hidden' }}>
              {replies.map((r, i) => (
                <div
                  key={r.id}
                  onClick={() => setSelected(r)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: i < replies.length - 1 ? '1px solid var(--jp-border)' : undefined,
                    cursor: 'pointer',
                    background: selected?.id === r.id ? 'var(--jp-green-glow)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (selected?.id !== r.id) (e.currentTarget.style.background = 'rgba(255,255,255,0.02)') }}
                  onMouseLeave={e => { if (selected?.id !== r.id) (e.currentTarget.style.background = 'transparent') }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: r.status === 'unread' ? 700 : 500, color: 'var(--jp-text)' }}>
                      {contactName(r)}
                    </div>
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                      background: classColor(r.classification) + '20', color: classColor(r.classification),
                      whiteSpace: 'nowrap',
                    }}>
                      {classLabel(r.classification)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginBottom: 2 }}>
                    {r.onmail_campaigns?.name || 'Unknown campaign'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.body_preview || r.subject || 'No preview'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', marginTop: 4 }}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Detail */}
          {selected && (
            <div className="jp-card">
              <div className="jp-card-header">
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--jp-text)' }}>{contactName(selected)}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)' }}>{selected.from_email}</div>
                </div>
                <button className="jp-btn jp-btn-outline" onClick={() => setSelected(null)} style={{ padding: '4px 8px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="jp-card-body">
                {/* Contact info sidebar */}
                {selected.onmail_campaign_contacts && (
                  <div style={{
                    padding: 12, borderRadius: 8, background: 'var(--jp-bg-input)',
                    border: '1px solid var(--jp-border)', marginBottom: 16, fontSize: '0.8125rem',
                  }}>
                    <div style={{ color: 'var(--jp-text-muted)', marginBottom: 4 }}>Contact Info</div>
                    {selected.onmail_campaign_contacts.company && (
                      <div style={{ color: 'var(--jp-text-secondary)' }}>Company: {selected.onmail_campaign_contacts.company}</div>
                    )}
                    <div style={{ color: 'var(--jp-text-secondary)' }}>Email: {selected.onmail_campaign_contacts.email}</div>
                  </div>
                )}

                {/* Subject */}
                {selected.subject && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginBottom: 2 }}>Subject</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--jp-text)' }}>{selected.subject}</div>
                  </div>
                )}

                {/* Body */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginBottom: 2 }}>Reply</div>
                  <div style={{
                    fontSize: '0.875rem', color: 'var(--jp-text-secondary)', whiteSpace: 'pre-wrap',
                    padding: 12, borderRadius: 8, background: 'var(--jp-bg-input)',
                    border: '1px solid var(--jp-border)', lineHeight: 1.6,
                  }}>
                    {selected.body_preview || 'No content'}
                  </div>
                </div>

                {/* AI Draft Response */}
                {selected.ai_draft_response && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--jp-cyan)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Draft Response (0nReply)
                    </div>
                    <div style={{
                      fontSize: '0.875rem', color: 'var(--jp-text)', whiteSpace: 'pre-wrap',
                      padding: 12, borderRadius: 8, background: 'rgba(0, 212, 255, 0.06)',
                      border: '1px solid rgba(0, 212, 255, 0.15)', lineHeight: 1.6,
                    }}>
                      {selected.ai_draft_response}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="jp-btn jp-btn-primary" style={{ fontSize: '0.8125rem' }}>
                    Send Reply
                  </button>
                  <button className="jp-btn jp-btn-outline" style={{ fontSize: '0.8125rem' }}>
                    Send to CRM
                  </button>
                  <button className="jp-btn jp-btn-outline" style={{ fontSize: '0.8125rem', color: 'var(--jp-amber)' }}>
                    Mark as Meeting Booked
                  </button>
                  <button className="jp-btn jp-btn-outline" style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)' }}>
                    Archive
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
