'use client'

import { useState, useEffect, useCallback } from 'react'

/* ─── types ─── */
interface CampaignStep {
  step: number
  type: 'email'
  delay_days: number
  subject: string
  preheader: string
  template_id: string | null
  html?: string
  conditions: {
    only_if_opened_previous?: boolean
    skip_if_booked?: boolean
    skip_if_clicked?: boolean
  }
  tracking: { utm_source: string; utm_campaign: string; utm_content: string }
}

interface Campaign {
  id: string
  name: string
  slug: string
  description: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled'
  segment_filter: { has_email?: boolean; tags?: string[]; tiers?: string[]; exclude_tags?: string[] }
  steps: CampaignStep[]
  total_sent: number
  total_opened: number
  total_clicked: number
  total_converted: number
  approved: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

/* ─── helpers ─── */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function emptyStep(n: number): CampaignStep {
  return {
    step: n,
    type: 'email',
    delay_days: n === 1 ? 0 : 3,
    subject: '',
    preheader: '',
    template_id: null,
    conditions: {},
    tracking: { utm_source: '0nmcp', utm_campaign: '', utm_content: `step-${n}` },
  }
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#f59e0b',
  scheduled: '#3b82f6',
  running: 'var(--accent)',
  paused: 'var(--text-muted)',
  completed: 'var(--color-purple)',
  cancelled: '#ef4444',
}

/* ─── component ─── */
export default function CampaignBuilderPage() {
  const [tab, setTab] = useState<'list' | 'new'>('list')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /* builder state */
  const [wizardStep, setWizardStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [hasEmail, setHasEmail] = useState(true)
  const [tier, setTier] = useState('all')
  const [excludeTags, setExcludeTags] = useState('')
  const [steps, setSteps] = useState<CampaignStep[]>([emptyStep(1)])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  /* fetch */
  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/console/campaigns')
      const j = await r.json()
      setCampaigns(j.campaigns || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  /* save */
  async function saveCampaign(requestApproval: boolean) {
    if (!name.trim()) { setToast({ msg: 'Campaign name is required', type: 'err' }); return }
    if (steps.some(s => !s.subject.trim())) { setToast({ msg: 'Every step needs a subject line', type: 'err' }); return }
    setSaving(true)
    try {
      const body = {
        name: name.trim(),
        slug: slugify(name),
        description: description.trim(),
        status: 'draft' as const,
        segment_filter: {
          has_email: hasEmail,
          tiers: tier === 'all' ? [] : [tier],
          exclude_tags: excludeTags.split(',').map(t => t.trim()).filter(Boolean),
        },
        steps: steps.map((s, i) => ({ ...s, step: i + 1, tracking: { ...s.tracking, utm_campaign: slugify(name) } })),
        approved: false,
        request_approval: requestApproval,
      }
      const r = await fetch('/api/console/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) throw new Error('Save failed')
      setToast({ msg: requestApproval ? 'Campaign saved — approval requested' : 'Campaign saved as draft', type: 'ok' })
      resetBuilder()
      setTab('list')
      fetchCampaigns()
    } catch {
      setToast({ msg: 'Failed to save campaign', type: 'err' })
    }
    setSaving(false)
  }

  function resetBuilder() {
    setWizardStep(1)
    setName('')
    setDescription('')
    setHasEmail(true)
    setTier('all')
    setExcludeTags('')
    setSteps([emptyStep(1)])
  }

  function updateStep(idx: number, patch: Partial<CampaignStep>) {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s))
  }

  function addStep() {
    setSteps(prev => [...prev, emptyStep(prev.length + 1)])
  }

  function removeStep(idx: number) {
    if (steps.length <= 1) return
    setSteps(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })))
  }

  const totalDays = steps.reduce((a, s) => a + s.delay_days, 0)

  /* ─── render helpers ─── */
  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem',
    fontFamily: 'Inter, sans-serif',
  }

  const btnPrimary: React.CSSProperties = {
    padding: '0.6rem 1.25rem',
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  }

  const btnOutline: React.CSSProperties = {
    padding: '0.6rem 1.25rem',
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  }

  /* ─── render ─── */
  return (
    <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto', width: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: 10,
          background: toast.type === 'ok' ? 'var(--accent)' : '#ef4444',
          color: toast.type === 'ok' ? '#000' : '#fff',
          fontWeight: 600, fontSize: '0.8rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          fontFamily: 'Inter, sans-serif',
        }}>
          {toast.msg}
        </div>
      )}

      {/* header */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'Inter, sans-serif' }}>
        Campaign Builder
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.25rem 0' }}>
        Build sequential email campaigns with conditional logic and audience segmentation
      </p>

      {/* tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['list', 'new'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'new') resetBuilder() }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: tab === t ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: tab === t ? 'rgba(126,217,87,0.1)' : 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {t === 'list' ? 'My Campaigns' : 'New Campaign'}
          </button>
        ))}
      </div>

      {/* ═══════ MY CAMPAIGNS ═══════ */}
      {tab === 'list' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                No campaigns yet. Create your first sequential email campaign.
              </p>
              <button onClick={() => setTab('new')} style={{ ...btnPrimary, marginTop: '1rem' }}>
                Create Campaign
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {campaigns.map(c => {
                const expanded = expandedId === c.id
                return (
                  <div key={c.id} style={cardStyle}>
                    <div
                      onClick={() => setExpandedId(expanded ? null : c.id)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 6,
                          background: `${STATUS_COLORS[c.status] || '#666'}22`,
                          color: STATUS_COLORS[c.status] || '#666',
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.04em', fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {c.status}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                          {c.steps?.length || 0} step{(c.steps?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          {[
                            { label: 'Sent', value: c.total_sent, color: 'var(--text-secondary)' },
                            { label: 'Opened', value: c.total_opened, color: 'var(--color-cyan)' },
                            { label: 'Clicked', value: c.total_clicked, color: 'var(--accent)' },
                          ].map(s => (
                            <span key={s.label} style={{ fontSize: '0.65rem', color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>
                              {s.value} {s.label.toLowerCase()}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        <span style={{
                          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s', display: 'inline-block',
                          color: 'var(--text-muted)', fontSize: '0.7rem',
                        }}>
                          &#9660;
                        </span>
                      </div>
                    </div>

                    {/* expanded steps */}
                    {expanded && c.steps && c.steps.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        {c.steps.map((s, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: i < c.steps.length - 1 ? '0.5rem' : 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 28 }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'var(--accent)', color: '#000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                                flexShrink: 0,
                              }}>
                                {s.step}
                              </div>
                              {i < c.steps.length - 1 && (
                                <div style={{ width: 2, flex: 1, background: 'var(--accent)', opacity: 0.3, marginTop: 4, marginBottom: 4 }} />
                              )}
                            </div>
                            <div style={{ flex: 1, paddingBottom: i < c.steps.length - 1 ? '0.5rem' : 0 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.subject || '(no subject)'}</div>
                              {s.preheader && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.preheader}</div>}
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                                {s.delay_days === 0 ? 'Immediately' : `+${s.delay_days} day${s.delay_days !== 1 ? 's' : ''}`}
                                {s.conditions?.only_if_opened_previous ? ' / opened prev' : ''}
                                {s.conditions?.skip_if_booked ? ' / skip if booked' : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════ NEW CAMPAIGN ═══════ */}
      {tab === 'new' && (
        <div>
          {/* wizard nav */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
            {[
              { n: 1, label: 'Campaign Info' },
              { n: 2, label: 'Email Steps' },
              { n: 3, label: 'Review & Save' },
            ].map(w => (
              <button
                key={w.n}
                onClick={() => setWizardStep(w.n)}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none',
                  background: wizardStep === w.n ? 'var(--accent)' : 'var(--bg-card)',
                  color: wizardStep === w.n ? '#000' : 'var(--text-muted)',
                  fontWeight: wizardStep === w.n ? 700 : 500,
                  fontSize: '0.75rem', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.2s',
                }}
              >
                {w.n}. {w.label}
              </button>
            ))}
          </div>

          {/* ── Step 1: Info ── */}
          {wizardStep === 1 && (
            <div style={cardStyle}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Campaign Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Spring Re-engagement Sequence"
                  style={inputStyle}
                />
                {name && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                    slug: {slugify(name)}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of campaign goals and audience..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
                  Audience Segment
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* has email */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={hasEmail}
                      onChange={e => setHasEmail(e.target.checked)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    Has email address
                  </label>

                  {/* tier */}
                  <div>
                    <label style={labelStyle}>Tier</label>
                    <select
                      value={tier}
                      onChange={e => setTier(e.target.value)}
                      style={{ ...inputStyle, maxWidth: 200, cursor: 'pointer' }}
                    >
                      <option value="all">All tiers</option>
                      <option value="vip">VIP</option>
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                    </select>
                  </div>

                  {/* exclude tags */}
                  <div>
                    <label style={labelStyle}>Exclude Tags (comma-separated)</label>
                    <input
                      value={excludeTags}
                      onChange={e => setExcludeTags(e.target.value)}
                      placeholder="e.g. unsubscribed, do-not-email"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setWizardStep(2)} style={btnPrimary}>
                  Next: Email Steps
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Email Steps ── */}
          {wizardStep === 2 && (
            <div>
              {steps.map((s, idx) => (
                <div key={idx}>
                  {/* delay badge between steps */}
                  {idx > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0' }}>
                      <div style={{ width: 2, height: 20, background: 'var(--accent)', opacity: 0.4 }} />
                    </div>
                  )}
                  {idx > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                      <span style={{
                        padding: '0.2rem 0.75rem', borderRadius: 20,
                        background: 'rgba(126,217,87,0.12)', border: '1px solid rgba(126,217,87,0.25)',
                        color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 600,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {s.delay_days} day{s.delay_days !== 1 ? 's' : ''} later
                      </span>
                    </div>
                  )}
                  {idx > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '0.25rem' }}>
                      <div style={{ width: 2, height: 20, background: 'var(--accent)', opacity: 0.4 }} />
                    </div>
                  )}

                  {/* step card */}
                  <div style={{ ...cardStyle, position: 'relative' }}>
                    {/* step number circle */}
                    <div style={{
                      position: 'absolute', top: -10, left: 20,
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                      border: '2px solid var(--bg-primary)',
                    }}>
                      {idx + 1}
                    </div>

                    {/* remove */}
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(idx)}
                        style={{
                          position: 'absolute', top: 8, right: 12,
                          background: 'none', border: 'none', color: 'var(--text-muted)',
                          cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif',
                        }}
                        title="Remove step"
                      >
                        Remove
                      </button>
                    )}

                    <div style={{ marginTop: '0.5rem' }}>
                      {/* delay */}
                      {idx > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <label style={labelStyle}>Delay (days after previous step)</label>
                          <select
                            value={s.delay_days}
                            onChange={e => updateStep(idx, { delay_days: parseInt(e.target.value) })}
                            style={{ ...inputStyle, maxWidth: 120, cursor: 'pointer' }}
                          >
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i} value={i}>{i} day{i !== 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* subject */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={labelStyle}>Subject Line</label>
                        <input
                          value={s.subject}
                          onChange={e => updateStep(idx, { subject: e.target.value })}
                          placeholder={idx === 0 ? 'e.g. Welcome to our community' : `e.g. Step ${idx + 1} follow-up`}
                          style={inputStyle}
                        />
                      </div>

                      {/* preheader */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={labelStyle}>Preheader Text</label>
                        <input
                          value={s.preheader}
                          onChange={e => updateStep(idx, { preheader: e.target.value })}
                          placeholder="Preview text shown in inbox..."
                          style={inputStyle}
                        />
                      </div>

                      {/* conditions */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Conditions</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={!!s.conditions.only_if_opened_previous}
                              onChange={e => updateStep(idx, { conditions: { ...s.conditions, only_if_opened_previous: e.target.checked } })}
                              style={{ accentColor: 'var(--accent)' }}
                              disabled={idx === 0}
                            />
                            <span style={{ opacity: idx === 0 ? 0.4 : 1 }}>Only send if opened previous email</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={!!s.conditions.skip_if_booked}
                              onChange={e => updateStep(idx, { conditions: { ...s.conditions, skip_if_booked: e.target.checked } })}
                              style={{ accentColor: 'var(--accent)' }}
                            />
                            Skip if already booked
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* add step */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0' }}>
                <div style={{ width: 2, height: 24, background: 'var(--accent)', opacity: 0.25 }} />
              </div>
              <button
                onClick={addStep}
                style={{
                  ...btnOutline,
                  width: '100%',
                  borderStyle: 'dashed',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                  padding: '0.75rem',
                }}
              >
                + Add Email Step
              </button>

              {/* nav */}
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setWizardStep(1)} style={btnOutline}>Back</button>
                <button onClick={() => setWizardStep(3)} style={btnPrimary}>Next: Review</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {wizardStep === 3 && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
                Campaign Summary
              </h3>

              {/* stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
                marginBottom: '1.25rem',
              }}>
                {[
                  { label: 'Emails', value: steps.length, color: 'var(--accent)' },
                  { label: 'Duration', value: `${totalDays} day${totalDays !== 1 ? 's' : ''}`, color: 'var(--color-cyan)' },
                  { label: 'Audience', value: tier === 'all' ? 'All contacts' : tier.toUpperCase(), color: 'var(--color-purple)' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--bg-primary)', borderRadius: 10, padding: '1rem', textAlign: 'center',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* name + desc */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name || '(unnamed)'}</div>
                {description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{description}</div>}
              </div>

              {/* segment */}
              <div style={{
                background: 'var(--bg-primary)', borderRadius: 8, padding: '0.75rem',
                border: '1px solid var(--border)', marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Segment Filter</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {hasEmail && (
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: 6,
                      background: 'rgba(126,217,87,0.1)', color: 'var(--accent)',
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      has_email
                    </span>
                  )}
                  {tier !== 'all' && (
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: 6,
                      background: 'rgba(0,212,255,0.1)', color: 'var(--color-cyan)',
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      tier:{tier}
                    </span>
                  )}
                  {excludeTags && excludeTags.split(',').filter(t => t.trim()).map(t => (
                    <span key={t.trim()} style={{
                      padding: '0.15rem 0.5rem', borderRadius: 6,
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      -{t.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* steps preview */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Steps</div>
                {steps.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.4rem 0',
                    borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--accent)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{s.subject || '(no subject)'}</div>
                    </div>
                    <span style={{
                      fontSize: '0.6rem', color: 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {s.delay_days === 0 ? 'Day 0' : `+${s.delay_days}d`}
                    </span>
                  </div>
                ))}
              </div>

              {/* safety notice */}
              <div style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 8, padding: '0.75rem', marginBottom: '1.25rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Safety Notice
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Campaigns are saved as drafts and will never auto-send. Double confirmation is required before any emails are dispatched.
                </div>
              </div>

              {/* actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                <button onClick={() => setWizardStep(2)} style={btnOutline}>Back</button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => saveCampaign(false)}
                    disabled={saving}
                    style={{ ...btnOutline, opacity: saving ? 0.5 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    onClick={() => saveCampaign(true)}
                    disabled={saving}
                    style={{ ...btnPrimary, opacity: saving ? 0.5 : 1 }}
                    title="Double confirmation required to send"
                  >
                    {saving ? 'Saving...' : 'Request Approval'}
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
