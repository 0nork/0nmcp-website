'use client'

import { useState, useEffect } from 'react'

interface SequenceStep {
  step_number: number
  delay_days: number
  subject_a: string
  subject_b: string
  body: string
  personalization_tokens: string[]
}

interface Sequence {
  id: string
  name: string
  icp_description: string | null
  steps: SequenceStep[]
  status: string
  lvos_winning_variant: string | null
  created_at: string
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    icp_description: '',
    call_to_action: '',
    tone: 'direct' as string,
    steps: 5,
  })
  const [generatedSteps, setGeneratedSteps] = useState<SequenceStep[]>([])

  useEffect(() => {
    fetch('/api/mail/sequences')
      .then(r => r.json())
      .then(d => setSequences(d.sequences || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generateSequence = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/mail/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          generate: true,
        }),
      })
      const data = await res.json()
      if (data.sequence) {
        setSequences(prev => [data.sequence, ...prev])
        setGeneratedSteps(data.steps || data.sequence.steps || [])
      }
    } catch { /* empty */ }
    setGenerating(false)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--jp-green)'
      case 'paused': return 'var(--jp-amber)'
      case 'complete': return 'var(--jp-cyan)'
      default: return 'var(--jp-text-muted)'
    }
  }

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="jp-page-title">Sequences</h1>
          <p className="jp-page-subtitle">Build and manage email sequences with AI</p>
        </div>
        <button className="jp-btn jp-btn-primary" onClick={() => { setShowCreate(!showCreate); setGeneratedSteps([]) }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Sequence
        </button>
      </div>

      {/* Create Sequence Form */}
      {showCreate && (
        <div className="jp-card" style={{ marginBottom: 24 }}>
          <div className="jp-card-header">
            <h4>AI Sequence Generator</h4>
            <button className="jp-btn jp-btn-outline" onClick={() => setShowCreate(false)} style={{ padding: '4px 8px' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="jp-card-body">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>
                  Sequence Name
                </label>
                <input
                  className="jp-search-input"
                  style={{ width: '100%', paddingLeft: 14 }}
                  placeholder="Q1 SaaS Outreach"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>
                  Who are you trying to reach? (ICP Description)
                </label>
                <textarea
                  className="jp-search-input"
                  style={{ width: '100%', paddingLeft: 14, paddingTop: 10, minHeight: 80, resize: 'vertical' }}
                  placeholder="Head of Sales at B2B SaaS companies, 50-500 employees, using Salesforce"
                  value={form.icp_description}
                  onChange={e => setForm(f => ({ ...f, icp_description: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>
                  What do you want them to do? (Call to Action)
                </label>
                <input
                  className="jp-search-input"
                  style={{ width: '100%', paddingLeft: 14 }}
                  placeholder="Book a 15-minute demo"
                  value={form.call_to_action}
                  onChange={e => setForm(f => ({ ...f, call_to_action: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Tone</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['direct', 'consultative', 'casual'].map(t => (
                      <button
                        key={t}
                        className={`jp-btn ${form.tone === t ? 'jp-btn-primary' : 'jp-btn-outline'}`}
                        onClick={() => setForm(f => ({ ...f, tone: t }))}
                        style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.8125rem' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>
                    Number of Steps: {form.steps}
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={7}
                    value={form.steps}
                    onChange={e => setForm(f => ({ ...f, steps: parseInt(e.target.value) }))}
                    style={{ width: '100%', accentColor: 'var(--jp-green)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--jp-text-muted)' }}>
                    <span>3</span><span>5</span><span>7</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="jp-btn jp-btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button
                  className="jp-btn jp-btn-primary"
                  onClick={generateSequence}
                  disabled={generating || !form.icp_description}
                >
                  {generating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Steps Preview */}
            {generatedSteps.length > 0 && (
              <div style={{ marginTop: 24, borderTop: '1px solid var(--jp-border)', paddingTop: 20 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-green)', marginBottom: 16 }}>
                  Generated {generatedSteps.length}-Step Sequence
                </div>
                {generatedSteps.map((step, i) => (
                  <div key={i} className="jp-card" style={{ marginBottom: 12 }}>
                    <div className="jp-card-header" style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6875rem', fontWeight: 700, background: 'var(--jp-green-glow)', color: 'var(--jp-green)',
                        }}>
                          {step.step_number}
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--jp-text)' }}>
                          Day {step.delay_days} {i === 0 ? '(Initial outreach)' : `(Follow-up)`}
                        </span>
                      </div>
                    </div>
                    <div className="jp-card-body" style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)' }}>Subject A:</span>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text)' }}>{step.subject_a}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)' }}>Subject B (A/B):</span>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text)' }}>{step.subject_b}</div>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)' }}>Body:</span>
                        <pre style={{
                          fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit', margin: '4px 0 0', lineHeight: 1.5,
                        }}>
                          {step.body}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sequence List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--jp-text-muted)' }}>Loading sequences...</div>
      ) : sequences.length === 0 && !showCreate ? (
        <div className="jp-card">
          <div className="jp-empty-state">
            <div className="jp-empty-state-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div className="jp-empty-state-title">No sequences yet</div>
            <div className="jp-empty-state-text">Create your first sequence with AI to start generating personalized cold email copy</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sequences.map(seq => (
            <div key={seq.id} className="jp-card" style={{ cursor: 'pointer' }}>
              <div className="jp-card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--jp-text)', marginBottom: 4 }}>
                    {seq.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)' }}>
                    {seq.steps?.length || 0} steps
                    {seq.icp_description && ` -- ${seq.icp_description.slice(0, 60)}${seq.icp_description.length > 60 ? '...' : ''}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {seq.lvos_winning_variant && (
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                      background: 'var(--jp-green-glow)', color: 'var(--jp-green)',
                    }}>
                      LVOS Winner: Variant {seq.lvos_winning_variant.toUpperCase()}
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                    background: statusColor(seq.status) + '20', color: statusColor(seq.status), textTransform: 'uppercase',
                  }}>
                    {seq.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
