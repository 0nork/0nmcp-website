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

const STATUS_CLASSES: Record<string, string> = {
  draft: 'text-amber-400 bg-amber-400/10',
  scheduled: 'text-blue-400 bg-blue-400/10',
  running: 'text-[var(--accent)] bg-[var(--accent)]/10',
  paused: 'text-[var(--text-muted)] bg-[var(--text-muted)]/10',
  completed: 'text-purple-400 bg-purple-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
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

  /* ─── render ─── */
  return (
    <div className="p-8 max-w-[960px] mx-auto w-full font-sans">
      {/* toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-[10px] font-semibold text-[0.8rem] shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${toast.type === 'ok' ? 'bg-[var(--accent)] text-black' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* header */}
      <h1 className="text-2xl font-bold text-[var(--text-primary)] m-0">Campaign Builder</h1>
      <p className="text-[0.8rem] text-[var(--text-muted)] mt-1 mb-5">
        Build sequential email campaigns with conditional logic and audience segmentation
      </p>

      {/* tabs */}
      <div className="flex gap-2 mb-6">
        {(['list', 'new'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'new') resetBuilder() }}
            className={`px-4 py-2 rounded-lg font-semibold text-[0.8rem] cursor-pointer transition-all border ${
              tab === t
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)]'
            }`}
          >
            {t === 'list' ? 'My Campaigns' : 'New Campaign'}
          </button>
        ))}
      </div>

      {/* ═══════ MY CAMPAIGNS ═══════ */}
      {tab === 'list' && (
        <div>
          {loading ? (
            <p className="text-[var(--text-muted)] text-[0.85rem]">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
              <p className="text-[var(--text-muted)] text-[0.9rem] m-0">
                No campaigns yet. Create your first sequential email campaign.
              </p>
              <button onClick={() => setTab('new')} className="mt-4 px-5 py-2 bg-[var(--accent)] text-black rounded-lg font-bold text-[0.8rem] cursor-pointer border-none">
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {campaigns.map(c => {
                const expanded = expandedId === c.id
                return (
                  <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
                    <div
                      onClick={() => setExpandedId(expanded ? null : c.id)}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold text-[0.65rem] uppercase tracking-wide font-mono ${STATUS_CLASSES[c.status] || 'text-[var(--text-muted)] bg-[var(--text-muted)]/10'}`}>
                          {c.status}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)] text-[0.9rem]">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="text-[0.7rem] text-[var(--text-muted)] font-mono">
                          {c.steps?.length || 0} step{(c.steps?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-4">
                          {[
                            { label: 'Sent', value: c.total_sent, cls: 'text-[var(--text-secondary)]' },
                            { label: 'Opened', value: c.total_opened, cls: 'text-[var(--color-cyan)]' },
                            { label: 'Clicked', value: c.total_clicked, cls: 'text-[var(--accent)]' },
                          ].map(s => (
                            <span key={s.label} className={`text-[0.65rem] font-mono ${s.cls}`}>
                              {s.value} {s.label.toLowerCase()}
                            </span>
                          ))}
                        </div>
                        <span className="text-[0.65rem] text-[var(--text-muted)]">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        <span className={`text-[0.7rem] text-[var(--text-muted)] inline-block transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}>
                          &#9660;
                        </span>
                      </div>
                    </div>

                    {/* expanded steps */}
                    {expanded && c.steps && c.steps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        {c.steps.map((s, i) => (
                          <div key={i} className={`flex gap-3 ${i < c.steps.length - 1 ? 'mb-2' : ''}`}>
                            <div className="flex flex-col items-center min-w-[28px]">
                              <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-[0.65rem] font-bold font-mono shrink-0">
                                {s.step}
                              </div>
                              {i < c.steps.length - 1 && (
                                <div className="w-0.5 flex-1 bg-[var(--accent)] opacity-30 mt-1 mb-1" />
                              )}
                            </div>
                            <div className={`flex-1 ${i < c.steps.length - 1 ? 'pb-2' : ''}`}>
                              <div className="text-[0.8rem] font-semibold text-[var(--text-primary)]">{s.subject || '(no subject)'}</div>
                              {s.preheader && <div className="text-[0.7rem] text-[var(--text-muted)] mt-0.5">{s.preheader}</div>}
                              <div className="text-[0.65rem] text-[var(--text-muted)] mt-1 font-mono">
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
          <div className="flex gap-1 mb-6">
            {[
              { n: 1, label: 'Campaign Info' },
              { n: 2, label: 'Email Steps' },
              { n: 3, label: 'Review & Save' },
            ].map(w => (
              <button
                key={w.n}
                onClick={() => setWizardStep(w.n)}
                className={`flex-1 py-2 rounded-lg border-none text-[0.75rem] cursor-pointer transition-colors duration-200 ${
                  wizardStep === w.n
                    ? 'bg-[var(--accent)] text-black font-bold'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] font-medium'
                }`}
              >
                {w.n}. {w.label}
              </button>
            ))}
          </div>

          {/* ── Step 1: Info ── */}
          {wizardStep === 1 && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <div className="mb-4">
                <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-1.5">Campaign Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Spring Re-engagement Sequence"
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[0.85rem] outline-none box-border"
                />
                {name && (
                  <div className="text-[0.65rem] text-[var(--text-muted)] mt-1 font-mono">
                    slug: {slugify(name)}
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of campaign goals and audience..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[0.85rem] outline-none box-border resize-y"
                />
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <h3 className="text-[0.85rem] font-bold text-[var(--text-primary)] m-0 mb-3">Audience Segment</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-[0.8rem] text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={hasEmail}
                      onChange={e => setHasEmail(e.target.checked)}
                      className="accent-[var(--accent)]"
                    />
                    Has email address
                  </label>

                  <div>
                    <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-1.5">Tier</label>
                    <select
                      value={tier}
                      onChange={e => setTier(e.target.value)}
                      className="max-w-[200px] px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[0.85rem] outline-none cursor-pointer"
                    >
                      <option value="all">All tiers</option>
                      <option value="vip">VIP</option>
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-1.5">Exclude Tags (comma-separated)</label>
                    <input
                      value={excludeTags}
                      onChange={e => setExcludeTags(e.target.value)}
                      placeholder="e.g. unsubscribed, do-not-email"
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[0.85rem] outline-none box-border"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button onClick={() => setWizardStep(2)} className="px-5 py-2 bg-[var(--accent)] text-black rounded-lg font-bold text-[0.8rem] cursor-pointer border-none">
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
                  {/* delay connector between steps */}
                  {idx > 0 && (
                    <>
                      <div className="flex items-center justify-center py-1">
                        <div className="w-0.5 h-5 bg-[var(--accent)] opacity-40" />
                      </div>
                      <div className="flex items-center justify-center mb-1">
                        <span className="px-3 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-[var(--accent)] text-[0.65rem] font-semibold font-mono">
                          {s.delay_days} day{s.delay_days !== 1 ? 's' : ''} later
                        </span>
                      </div>
                      <div className="flex items-center justify-center pb-1">
                        <div className="w-0.5 h-5 bg-[var(--accent)] opacity-40" />
                      </div>
                    </>
                  )}

                  {/* step card */}
                  <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
                    {/* step number circle */}
                    <div className="absolute -top-2.5 left-5 w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-[0.7rem] font-bold font-mono border-2 border-[var(--bg-primary)]">
                      {idx + 1}
                    </div>

                    {/* remove */}
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(idx)}
                        className="absolute top-2 right-3 bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-[0.75rem]"
                        title="Remove step"
                      >
                        Remove
                      </button>
                    )}

                    <div className="mt-2">
                      {/* delay */}
                      {idx > 0 && (
                        <div className="mb-3">
                          <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-1.5">Delay (days after previous step)</label>
                          <select
                            value={s.delay_days}
                            onChange={e => updateStep(idx, { delay_days: parseInt(e.target.value) })}
                            className="max-w-[120px] px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[0.85rem] outline-none cursor-pointer"
                          >
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i} value={i}>{i} day{i !== 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* subject */}
                      <div className="mb-3">
                        <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-1.5">Subject Line</label>
                        <input
                          value={s.subject}
                          onChange={e => updateStep(idx, { subject: e.target.value })}
                          placeholder={idx === 0 ? 'e.g. Welcome to our community' : `e.g. Step ${idx + 1} follow-up`}
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[0.85rem] outline-none box-border"
                        />
                      </div>

                      {/* preheader */}
                      <div className="mb-3">
                        <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-1.5">Preheader Text</label>
                        <input
                          value={s.preheader}
                          onChange={e => updateStep(idx, { preheader: e.target.value })}
                          placeholder="Preview text shown in inbox..."
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[0.85rem] outline-none box-border"
                        />
                      </div>

                      {/* conditions */}
                      <div className="border-t border-[var(--border)] pt-3">
                        <label className="block text-[0.75rem] font-semibold text-[var(--text-secondary)] mb-2">Conditions</label>
                        <div className="flex flex-col gap-1.5">
                          <label className="flex items-center gap-2 text-[0.75rem] text-[var(--text-secondary)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!s.conditions.only_if_opened_previous}
                              onChange={e => updateStep(idx, { conditions: { ...s.conditions, only_if_opened_previous: e.target.checked } })}
                              className="accent-[var(--accent)]"
                              disabled={idx === 0}
                            />
                            <span className={idx === 0 ? 'opacity-40' : ''}>Only send if opened previous email</span>
                          </label>
                          <label className="flex items-center gap-2 text-[0.75rem] text-[var(--text-secondary)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!s.conditions.skip_if_booked}
                              onChange={e => updateStep(idx, { conditions: { ...s.conditions, skip_if_booked: e.target.checked } })}
                              className="accent-[var(--accent)]"
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
              <div className="flex items-center justify-center py-1">
                <div className="w-0.5 h-6 bg-[var(--accent)] opacity-25" />
              </div>
              <button
                onClick={addStep}
                className="w-full py-3 rounded-lg border border-dashed border-[var(--accent)] bg-transparent text-[var(--accent)] font-semibold text-[0.8rem] cursor-pointer"
              >
                + Add Email Step
              </button>

              {/* nav */}
              <div className="mt-5 flex justify-between">
                <button onClick={() => setWizardStep(1)} className="px-5 py-2 bg-transparent text-[var(--text-primary)] border border-[var(--border)] rounded-lg font-semibold text-[0.8rem] cursor-pointer">Back</button>
                <button onClick={() => setWizardStep(3)} className="px-5 py-2 bg-[var(--accent)] text-black rounded-lg font-bold text-[0.8rem] cursor-pointer border-none">Next: Review</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {wizardStep === 3 && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-0 mb-4">Campaign Summary</h3>

              {/* stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Emails', value: steps.length, cls: 'text-[var(--accent)]' },
                  { label: 'Duration', value: `${totalDays} day${totalDays !== 1 ? 's' : ''}`, cls: 'text-[var(--color-cyan)]' },
                  { label: 'Audience', value: tier === 'all' ? 'All contacts' : tier.toUpperCase(), cls: 'text-[var(--color-purple)]' },
                ].map(s => (
                  <div key={s.label} className="bg-[var(--bg-primary)] rounded-xl p-4 text-center border border-[var(--border)]">
                    <div className={`text-2xl font-extrabold font-mono ${s.cls}`}>{s.value}</div>
                    <div className="text-[0.65rem] text-[var(--text-muted)] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* name + desc */}
              <div className="mb-4">
                <div className="text-[0.9rem] font-semibold text-[var(--text-primary)]">{name || '(unnamed)'}</div>
                {description && <div className="text-[0.75rem] text-[var(--text-muted)] mt-1">{description}</div>}
              </div>

              {/* segment */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-3 border border-[var(--border)] mb-4">
                <div className="text-[0.7rem] font-semibold text-[var(--text-secondary)] mb-1.5">Segment Filter</div>
                <div className="flex gap-3 flex-wrap">
                  {hasEmail && (
                    <span className="px-2 py-0.5 rounded font-mono text-[0.65rem] bg-[var(--accent)]/10 text-[var(--accent)]">
                      has_email
                    </span>
                  )}
                  {tier !== 'all' && (
                    <span className="px-2 py-0.5 rounded font-mono text-[0.65rem] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]">
                      tier:{tier}
                    </span>
                  )}
                  {excludeTags && excludeTags.split(',').filter(t => t.trim()).map(t => (
                    <span key={t.trim()} className="px-2 py-0.5 rounded font-mono text-[0.65rem] bg-red-500/10 text-red-400">
                      -{t.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* steps preview */}
              <div className="mb-5">
                <div className="text-[0.7rem] font-semibold text-[var(--text-secondary)] mb-2">Steps</div>
                {steps.map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 py-1.5 ${i < steps.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-[0.6rem] font-bold shrink-0 font-mono">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.8rem] text-[var(--text-primary)] font-medium">{s.subject || '(no subject)'}</div>
                    </div>
                    <span className="text-[0.6rem] text-[var(--text-muted)] font-mono">
                      {s.delay_days === 0 ? 'Day 0' : `+${s.delay_days}d`}
                    </span>
                  </div>
                ))}
              </div>

              {/* safety notice */}
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-3 mb-5">
                <div className="text-[0.75rem] text-amber-400 font-semibold mb-1">Safety Notice</div>
                <div className="text-[0.7rem] text-[var(--text-muted)] leading-relaxed">
                  Campaigns are saved as drafts and will never auto-send. Double confirmation is required before any emails are dispatched.
                </div>
              </div>

              {/* actions */}
              <div className="flex gap-3 justify-between">
                <button onClick={() => setWizardStep(2)} className="px-5 py-2 bg-transparent text-[var(--text-primary)] border border-[var(--border)] rounded-lg font-semibold text-[0.8rem] cursor-pointer">Back</button>
                <div className="flex gap-3">
                  <button
                    onClick={() => saveCampaign(false)}
                    disabled={saving}
                    className={`px-5 py-2 bg-transparent text-[var(--text-primary)] border border-[var(--border)] rounded-lg font-semibold text-[0.8rem] cursor-pointer ${saving ? 'opacity-50' : ''}`}
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    onClick={() => saveCampaign(true)}
                    disabled={saving}
                    className={`px-5 py-2 bg-[var(--accent)] text-black rounded-lg font-bold text-[0.8rem] cursor-pointer border-none ${saving ? 'opacity-50' : ''}`}
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
