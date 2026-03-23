'use client'

import { useState, useEffect } from 'react'

interface Campaign {
  id: string
  name: string
  status: string
  contact_count: number
  contact_source: string
  stats: { sent: number; delivered: number; opened: number; clicked: number; replied: number; bounced: number; unsubscribed: number; meetings_booked: number }
  sequence_id: string | null
  inbox_ids: string[]
  scheduled_at: string | null
  started_at: string | null
  created_at: string
  onmail_sequences?: { name: string; steps: unknown[] }
}

interface Sequence {
  id: string
  name: string
  steps: unknown[]
  status: string
}

interface Inbox {
  id: string
  email_address: string
  health_score: number
  warmup_status: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [inboxes, setInboxes] = useState<Inbox[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sequence_id: '',
    inbox_ids: [] as string[],
    contacts_csv: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/mail/campaigns').then(r => r.json()),
      fetch('/api/mail/sequences').then(r => r.json()),
      fetch('/api/mail?action=inboxes').then(r => r.json()),
    ]).then(([c, s, i]) => {
      setCampaigns(c.campaigns || [])
      setSequences(s.sequences || [])
      setInboxes(i.inboxes || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const parseContacts = (csv: string) => {
    const lines = csv.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim())
      const contact: Record<string, string> = {}
      headers.forEach((h, i) => { contact[h] = vals[i] || '' })
      return contact
    })
  }

  const createCampaign = async () => {
    setSaving(true)
    try {
      const contacts = form.contacts_csv ? parseContacts(form.contacts_csv) : []
      const res = await fetch('/api/mail/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sequence_id: form.sequence_id || null,
          inbox_ids: form.inbox_ids,
          contacts,
          contact_source: contacts.length > 0 ? 'csv' : 'manual',
        }),
      })
      const data = await res.json()
      if (data.campaign) {
        setCampaigns(prev => [{ ...data.campaign, contact_count: contacts.length }, ...prev])
        setShowCreate(false)
        setForm({ name: '', sequence_id: '', inbox_ids: [], contacts_csv: '' })
      }
    } catch { /* empty */ }
    setSaving(false)
  }

  const toggleInbox = (id: string) => {
    setForm(f => ({
      ...f,
      inbox_ids: f.inbox_ids.includes(id)
        ? f.inbox_ids.filter(i => i !== id)
        : [...f.inbox_ids, id],
    }))
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--jp-green)'
      case 'scheduled': return 'var(--jp-cyan)'
      case 'paused': return 'var(--jp-amber)'
      case 'complete': return 'var(--jp-purple)'
      default: return 'var(--jp-text-muted)'
    }
  }

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="jp-page-title">Campaigns</h1>
          <p className="jp-page-subtitle">Launch and manage cold email campaigns</p>
        </div>
        <button className="jp-btn jp-btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>
      </div>

      {/* Create Campaign Wizard */}
      {showCreate && (
        <div className="jp-card" style={{ marginBottom: 24 }}>
          <div className="jp-card-header">
            <h4>Create Campaign</h4>
            <button className="jp-btn jp-btn-outline" onClick={() => setShowCreate(false)} style={{ padding: '4px 8px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="jp-card-body" style={{ display: 'grid', gap: 20 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Campaign Name</label>
              <input
                className="jp-search-input"
                style={{ width: '100%', paddingLeft: 14 }}
                placeholder="Q1 SaaS Outreach — March 2026"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Select Sequence */}
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Select Sequence</label>
              {sequences.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)', padding: '8px 0' }}>
                  No sequences available. Create a sequence first.
                </div>
              ) : (
                <select
                  className="jp-search-input"
                  style={{ width: '100%', paddingLeft: 14 }}
                  value={form.sequence_id}
                  onChange={e => setForm(f => ({ ...f, sequence_id: e.target.value }))}
                >
                  <option value="">Select a sequence...</option>
                  {sequences.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({(s.steps as unknown[])?.length || 0} steps)</option>
                  ))}
                </select>
              )}
            </div>

            {/* Select Inboxes */}
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>
                Select Sending Inboxes ({form.inbox_ids.length} selected)
              </label>
              {inboxes.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)', padding: '8px 0' }}>
                  No inboxes available. Add an inbox first.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {inboxes.map(inbox => (
                    <button
                      key={inbox.id}
                      className={`jp-btn ${form.inbox_ids.includes(inbox.id) ? 'jp-btn-primary' : 'jp-btn-outline'}`}
                      onClick={() => toggleInbox(inbox.id)}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      {inbox.email_address}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Contacts */}
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>
                Paste Contacts (CSV format: email, first_name, last_name, company, title)
              </label>
              <textarea
                className="jp-search-input"
                style={{ width: '100%', paddingLeft: 14, paddingTop: 10, minHeight: 100, resize: 'vertical', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem' }}
                placeholder={`email,first_name,last_name,company,title\njohn@acme.com,John,Doe,Acme Inc,VP Sales\njane@corp.com,Jane,Smith,Corp LLC,Head of Ops`}
                value={form.contacts_csv}
                onChange={e => setForm(f => ({ ...f, contacts_csv: e.target.value }))}
              />
              {form.contacts_csv && (
                <div style={{ fontSize: '0.75rem', color: 'var(--jp-cyan)', marginTop: 4 }}>
                  {parseContacts(form.contacts_csv).length} contacts parsed
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="jp-btn jp-btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              <button
                className="jp-btn jp-btn-primary"
                onClick={createCampaign}
                disabled={saving || !form.name}
              >
                {saving ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--jp-text-muted)' }}>Loading campaigns...</div>
      ) : campaigns.length === 0 && !showCreate ? (
        <div className="jp-card">
          <div className="jp-empty-state">
            <div className="jp-empty-state-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="jp-empty-state-title">No campaigns yet</div>
            <div className="jp-empty-state-text">Create your first campaign to start sending cold emails at scale</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.map(c => {
            const s = c.stats || { sent: 0, opened: 0, replied: 0, meetings_booked: 0 }
            const progress = c.contact_count > 0 ? Math.round((s.sent / c.contact_count) * 100) : 0
            return (
              <div key={c.id} className="jp-card">
                <div className="jp-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--jp-text)', marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)' }}>
                        {c.contact_count} contacts
                        {c.onmail_sequences?.name && ` -- ${c.onmail_sequences.name}`}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                      background: statusColor(c.status) + '20', color: statusColor(c.status), textTransform: 'uppercase',
                    }}>
                      {c.status}
                    </span>
                  </div>

                  {/* Progress */}
                  {c.status !== 'draft' && (
                    <div style={{ marginBottom: 12 }}>
                      <div className="jp-progress" style={{ height: 6 }}>
                        <div className="jp-progress-bar green" style={{ width: `${progress}%` }} />
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', marginTop: 4 }}>{progress}% sent</div>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div style={{ display: 'flex', gap: 20, fontSize: '0.8125rem' }}>
                    <div><span style={{ color: 'var(--jp-text-muted)' }}>Sent:</span> <span style={{ fontWeight: 600, color: 'var(--jp-text)' }}>{s.sent}</span></div>
                    <div><span style={{ color: 'var(--jp-text-muted)' }}>Opened:</span> <span style={{ fontWeight: 600, color: 'var(--jp-green)' }}>{s.opened}</span></div>
                    <div><span style={{ color: 'var(--jp-text-muted)' }}>Replied:</span> <span style={{ fontWeight: 600, color: 'var(--jp-cyan)' }}>{s.replied}</span></div>
                    <div><span style={{ color: 'var(--jp-text-muted)' }}>Meetings:</span> <span style={{ fontWeight: 600, color: 'var(--jp-amber)' }}>{s.meetings_booked}</span></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
