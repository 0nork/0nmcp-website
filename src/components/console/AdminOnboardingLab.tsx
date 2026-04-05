'use client'

import { useState, useEffect, useCallback } from 'react'

interface Variant {
  id: string
  name: string
  is_control: boolean
  weight: number
  step_order: string[]
  step_config: Record<string, Record<string, unknown>>
  totalUsers?: number
  completionRate?: number
  funnel?: { step: string; views: number; completes: number; skips: number; dropOffs: number; avgDuration: number }[]
}

interface Experiment {
  id: string
  name: string
  description: string
  status: string
  totalUsers?: number
  completedUsers?: number
  completionRate?: number
  created_at: string
}

const STEP_LABELS: Record<string, string> = {
  welcome: 'Welcome',
  profile: 'Profile Setup',
  tools: 'Connect Tools',
  payment: 'Payment',
  community: 'Join Community',
  launch: 'Launch Pad',
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  active: '#6EE05A',
  paused: '#f59e0b',
  completed: '#00d4ff',
}

export function AdminOnboardingLab() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExp, setSelectedExp] = useState<string | null>(null)
  const [expDetail, setExpDetail] = useState<{ experiment: Experiment; variants: Variant[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const fetchExperiments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/onboarding')
      const data = await res.json()
      setExperiments(data.experiments || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const fetchDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/onboarding?id=${id}`)
      const data = await res.json()
      setExpDetail(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchExperiments() }, [fetchExperiments])

  useEffect(() => {
    if (selectedExp) fetchDetail(selectedExp)
    else setExpDetail(null)
  }, [selectedExp, fetchDetail])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newName,
          description: newDesc,
          variants: [
            { name: 'Control', is_control: true, weight: 50, step_order: ['welcome', 'profile', 'tools', 'payment', 'community', 'launch'] },
            { name: 'Variant B', is_control: false, weight: 50, step_order: ['welcome', 'profile', 'community', 'launch'] },
          ],
        }),
      })
      setNewName('')
      setNewDesc('')
      await fetchExperiments()
    } catch { /* ignore */ }
    setCreating(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch('/api/admin/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', id, status }),
    })
    await fetchExperiments()
    if (selectedExp === id) fetchDetail(id)
  }

  if (selectedExp && expDetail) {
    return <ExperimentDetail detail={expDetail} onBack={() => setSelectedExp(null)} onStatusChange={handleStatusChange} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
            Onboarding Lab
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            A/B test onboarding flows — track conversion at every step
          </p>
        </div>
      </div>

      {/* Create New */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
        border: '1px solid var(--border)', padding: '1rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          New Experiment
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Experiment name"
            style={{
              flex: '1 1 200px', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid var(--border)', background: 'var(--bg-primary)',
              color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit',
            }}
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            style={{
              flex: '2 1 300px', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid var(--border)', background: 'var(--bg-primary)',
              color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
              background: '#6EE05A', color: '#000', fontWeight: 600,
              fontSize: '0.85rem', cursor: 'pointer', opacity: creating || !newName.trim() ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Experiments List */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading experiments...</div>
      ) : experiments.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No experiments yet. Create one above.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {experiments.map(exp => (
            <button
              key={exp.id}
              onClick={() => setSelectedExp(exp.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem', borderRadius: '0.75rem',
                border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                fontFamily: 'inherit', color: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: STATUS_COLORS[exp.status] || '#94a3b8',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{exp.name}</div>
                {exp.description && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exp.description}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {exp.totalUsers || 0}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>users</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6EE05A', fontFamily: 'var(--font-mono)' }}>
                    {exp.completionRate || 0}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>completion</div>
                </div>
                <div style={{
                  padding: '0.2rem 0.5rem', borderRadius: '9999px',
                  background: `${STATUS_COLORS[exp.status]}20`,
                  border: `1px solid ${STATUS_COLORS[exp.status]}40`,
                  fontSize: '0.65rem', fontWeight: 600,
                  color: STATUS_COLORS[exp.status],
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {exp.status}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ExperimentDetail({
  detail,
  onBack,
  onStatusChange,
}: {
  detail: { experiment: Experiment; variants: Variant[] }
  onBack: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  const { experiment, variants } = detail

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer',
            fontSize: '0.8rem', fontFamily: 'inherit',
          }}
        >
          Back
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
            {experiment.name}
          </h2>
          {experiment.description && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.125rem 0 0' }}>{experiment.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {['draft', 'active', 'paused', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => onStatusChange(experiment.id, status)}
              style={{
                padding: '0.25rem 0.625rem', borderRadius: '0.375rem',
                border: experiment.status === status ? `1px solid ${STATUS_COLORS[status]}` : '1px solid var(--border)',
                background: experiment.status === status ? `${STATUS_COLORS[status]}15` : 'transparent',
                color: experiment.status === status ? STATUS_COLORS[status] : 'var(--text-muted)',
                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize', fontFamily: 'inherit',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Variant Cards */}
      {variants.map(v => (
        <div key={v.id} style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
          border: `1px solid ${v.is_control ? 'rgba(0,212,255,0.2)' : 'var(--border)'}`,
          padding: '1rem', overflow: 'hidden',
        }}>
          {/* Variant Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
              background: v.is_control ? 'rgba(0,212,255,0.1)' : 'rgba(167,139,250,0.1)',
              border: `1px solid ${v.is_control ? 'rgba(0,212,255,0.2)' : 'rgba(167,139,250,0.2)'}`,
              fontSize: '0.65rem', fontWeight: 600,
              color: v.is_control ? '#00d4ff' : '#a78bfa',
            }}>
              {v.is_control ? 'CONTROL' : 'VARIANT'}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {v.weight}% weight
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {v.totalUsers || 0}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>users</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6EE05A', fontFamily: 'var(--font-mono)' }}>
                  {v.completionRate || 0}%
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>completed</div>
              </div>
            </div>
          </div>

          {/* Step Order */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {(v.step_order || []).map((step, i) => {
              const config = v.step_config?.[step] || {}
              const isSkipped = config.skip
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>}
                  <span style={{
                    padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
                    background: isSkipped ? 'rgba(239,68,68,0.1)' : 'rgba(126,217,87,0.08)',
                    border: `1px solid ${isSkipped ? 'rgba(239,68,68,0.2)' : 'rgba(126,217,87,0.15)'}`,
                    fontSize: '0.7rem', color: isSkipped ? '#ef4444' : 'var(--text-secondary)',
                    textDecoration: isSkipped ? 'line-through' : 'none',
                  }}>
                    {STEP_LABELS[step] || step}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Funnel */}
          {v.funnel && v.funnel.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Conversion Funnel
              </div>
              {v.funnel.map(f => {
                const maxViews = Math.max(...v.funnel!.map(ff => ff.views), 1)
                const barWidth = (f.views / maxViews) * 100
                return (
                  <div key={f.step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '90px', fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {STEP_LABELS[f.step] || f.step}
                    </div>
                    <div style={{ flex: 1, height: '20px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        height: '100%', width: `${barWidth}%`,
                        background: 'linear-gradient(90deg, rgba(126,217,87,0.3), rgba(126,217,87,0.15))',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '0.5rem', transform: 'translateY(-50%)',
                        fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
                      }}>
                        {f.views} views → {f.completes} done
                        {f.skips > 0 && <span style={{ color: '#f59e0b' }}> ({f.skips} skip)</span>}
                        {f.dropOffs > 0 && <span style={{ color: '#ef4444' }}> ({f.dropOffs} drop)</span>}
                      </div>
                    </div>
                    {f.avgDuration > 0 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, width: '50px', textAlign: 'right' }}>
                        {f.avgDuration > 60000 ? `${Math.round(f.avgDuration / 60000)}m` : `${Math.round(f.avgDuration / 1000)}s`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
