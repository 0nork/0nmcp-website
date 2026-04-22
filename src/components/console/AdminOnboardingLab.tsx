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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] m-0">
            Onboarding Lab
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">
            A/B test onboarding flows — track conversion at every step
          </p>
        </div>
      </div>

      {/* Create New */}
      <div className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-4">
        <div className="text-[0.7rem] font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-3">
          New Experiment
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Experiment name"
            className="flex-[1_1_200px] px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[0.85rem] font-[inherit]"
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="flex-[2_1_300px] px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[0.85rem] font-[inherit]"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="px-4 py-2 rounded-lg border-0 bg-[#6EE05A] text-black font-semibold text-[0.85rem] cursor-pointer font-[inherit] disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Experiments List */}
      {loading ? (
        <div className="text-[var(--text-muted)] text-center py-8">Loading experiments...</div>
      ) : experiments.length === 0 ? (
        <div className="text-[var(--text-muted)] text-center py-8">No experiments yet. Create one above.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {experiments.map(exp => (
            <button
              key={exp.id}
              onClick={() => setSelectedExp(exp.id)}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-white/[0.02] cursor-pointer text-left w-full font-[inherit] text-inherit transition-[border-color] duration-150 hover:border-[rgba(126,217,87,0.3)]"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: STATUS_COLORS[exp.status] || '#94a3b8' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[0.9rem] font-semibold text-[var(--text-primary)]">{exp.name}</div>
                {exp.description && (
                  <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                    {exp.description}
                  </div>
                )}
              </div>
              <div className="flex gap-4 items-center shrink-0">
                <div className="text-right">
                  <div className="text-base font-bold text-[var(--text-primary)] font-mono">
                    {exp.totalUsers || 0}
                  </div>
                  <div className="text-[0.65rem] text-[var(--text-muted)]">users</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-[#6EE05A] font-mono">
                    {exp.completionRate || 0}%
                  </div>
                  <div className="text-[0.65rem] text-[var(--text-muted)]">completion</div>
                </div>
                <div
                  className="px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.05em]"
                  style={{
                    background: `${STATUS_COLORS[exp.status]}20`,
                    border: `1px solid ${STATUS_COLORS[exp.status]}40`,
                    color: STATUS_COLORS[exp.status],
                  }}
                >
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
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-transparent border border-[var(--border)] text-[var(--text-secondary)] rounded-lg px-3 py-1.5 cursor-pointer text-[0.8rem] font-[inherit]"
        >
          Back
        </button>
        <div className="flex-1">
          <h2 className="text-[1.15rem] font-bold text-[var(--text-primary)] m-0">
            {experiment.name}
          </h2>
          {experiment.description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-0">{experiment.description}</p>
          )}
        </div>
        <div className="flex gap-1.5">
          {['draft', 'active', 'paused', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => onStatusChange(experiment.id, status)}
              className="px-2.5 py-1 rounded-md text-[0.7rem] font-semibold cursor-pointer capitalize font-[inherit] transition-colors"
              style={{
                border: experiment.status === status ? `1px solid ${STATUS_COLORS[status]}` : '1px solid var(--border)',
                background: experiment.status === status ? `${STATUS_COLORS[status]}15` : 'transparent',
                color: experiment.status === status ? STATUS_COLORS[status] : 'var(--text-muted)',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Variant Cards */}
      {variants.map(v => (
        <div
          key={v.id}
          className="bg-white/[0.02] rounded-xl p-4 overflow-hidden"
          style={{ border: `1px solid ${v.is_control ? 'rgba(0,212,255,0.2)' : 'var(--border)'}` }}
        >
          {/* Variant Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="px-2 py-0.5 rounded-md text-[0.65rem] font-semibold"
              style={{
                background: v.is_control ? 'rgba(0,212,255,0.1)' : 'rgba(167,139,250,0.1)',
                border: `1px solid ${v.is_control ? 'rgba(0,212,255,0.2)' : 'rgba(167,139,250,0.2)'}`,
                color: v.is_control ? '#00d4ff' : '#a78bfa',
              }}
            >
              {v.is_control ? 'CONTROL' : 'VARIANT'}
            </div>
            <span className="text-[0.9rem] font-semibold text-[var(--text-primary)]">{v.name}</span>
            <span className="text-[0.7rem] text-[var(--text-muted)] font-mono">
              {v.weight}% weight
            </span>
            <div className="ml-auto flex gap-4">
              <div className="text-right">
                <div className="text-xl font-bold text-[var(--text-primary)] font-mono">
                  {v.totalUsers || 0}
                </div>
                <div className="text-[0.6rem] text-[var(--text-muted)]">users</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#6EE05A] font-mono">
                  {v.completionRate || 0}%
                </div>
                <div className="text-[0.6rem] text-[var(--text-muted)]">completed</div>
              </div>
            </div>
          </div>

          {/* Step Order */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {(v.step_order || []).map((step, i) => {
              const config = v.step_config?.[step] || {}
              const isSkipped = config.skip
              return (
                <div key={step} className="flex items-center gap-1">
                  {i > 0 && <span className="text-[var(--text-muted)] text-[0.7rem]">→</span>}
                  <span
                    className="px-2 py-0.5 rounded-md text-[0.7rem]"
                    style={{
                      background: isSkipped ? 'rgba(239,68,68,0.1)' : 'rgba(126,217,87,0.08)',
                      border: `1px solid ${isSkipped ? 'rgba(239,68,68,0.2)' : 'rgba(126,217,87,0.15)'}`,
                      color: isSkipped ? '#ef4444' : 'var(--text-secondary)',
                      textDecoration: isSkipped ? 'line-through' : 'none',
                    }}
                  >
                    {STEP_LABELS[step] || step}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Funnel */}
          {v.funnel && v.funnel.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[0.65rem] font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em]">
                Conversion Funnel
              </div>
              {v.funnel.map(f => {
                const maxViews = Math.max(...v.funnel!.map(ff => ff.views), 1)
                const barWidth = (f.views / maxViews) * 100
                return (
                  <div key={f.step} className="flex items-center gap-2">
                    <div className="w-[90px] text-xs text-[var(--text-secondary)] shrink-0">
                      {STEP_LABELS[f.step] || f.step}
                    </div>
                    <div className="flex-1 h-5 bg-[var(--bg-card)] rounded-[4px] overflow-hidden relative">
                      <div
                        className="h-full rounded-[4px] transition-[width_0.3s_ease]"
                        style={{
                          width: `${barWidth}%`,
                          background: 'linear-gradient(90deg, rgba(126,217,87,0.3), rgba(126,217,87,0.15))',
                        }}
                      />
                      <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[0.65rem] font-mono text-[var(--text-primary)]">
                        {f.views} views → {f.completes} done
                        {f.skips > 0 && <span className="text-[#f59e0b]"> ({f.skips} skip)</span>}
                        {f.dropOffs > 0 && <span className="text-[#ef4444]"> ({f.dropOffs} drop)</span>}
                      </div>
                    </div>
                    {f.avgDuration > 0 && (
                      <div className="text-[0.65rem] text-[var(--text-muted)] font-mono shrink-0 w-[50px] text-right">
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
