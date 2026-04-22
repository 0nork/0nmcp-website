'use client'

import { useState, useEffect } from 'react'
import type { LeaderboardData } from '@/lib/training/types'

const TIER_COLORS: Record<number, string> = {
  0: '#64748b', 1: '#6EE05A', 2: '#00d4ff', 3: '#a78bfa', 4: '#ff6b35',
}

const TIER_ICONS: Record<number, string> = {
  0: '🌱', 1: '🌿', 2: '🌳', 3: '🏔️', 4: '🧠',
}

interface TrainingViewProps {
  isAdmin?: boolean
}

export function TrainingView({ isAdmin }: TrainingViewProps) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningHousekeeping, setRunningHousekeeping] = useState(false)

  useEffect(() => {
    fetch('/api/training/leaderboard')
      .then(r => r.json())
      .then(d => { if (d.currentTier) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-2">🧠</div>
        <div className="text-[0.8rem] text-[var(--text-muted,#666)]">Loading Brain Training Dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-2">🧠</div>
        <div className="text-[var(--text-primary,#e5e5e5)]">Brain Training Factory</div>
        <div className="text-[0.8rem] text-[var(--text-muted,#666)] mt-2">
          No training data yet. Run <code className="text-[#6EE05A]">/training</code> in Claude Code to start the first session.
        </div>
      </div>
    )
  }

  const tierColor = TIER_COLORS[data.currentTier.tier] || '#64748b'
  const tierIcon = TIER_ICONS[data.currentTier.tier] || '🌱'

  const triggerHousekeeping = async () => {
    setRunningHousekeeping(true)
    try {
      await fetch('/api/training/run', { method: 'POST' })
      const r = await fetch('/api/training/leaderboard')
      const d = await r.json()
      if (d.currentTier) setData(d)
    } catch {}
    setRunningHousekeeping(false)
  }

  // Latest run
  const lastTrainedRun = data.recentRuns.find(r => r.run_type !== 'housekeeping')
  const lastTrainedAgo = lastTrainedRun
    ? timeAgo(new Date(lastTrainedRun.created_at))
    : 'Never'

  // Brain health = avg of last 5 non-housekeeping runs
  const trainingRuns = data.recentRuns.filter(r => r.run_type !== 'housekeeping')
  const brainHealth = trainingRuns.length > 0
    ? trainingRuns.slice(0, 5).reduce((s, r) => s + (r.avg_composite_score || 0), 0) / Math.min(trainingRuns.length, 5)
    : 0

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* ─── Hero Status Bar ─── */}
      <div
        className="bg-[var(--bg-card,#0B0F19)] border rounded-xl p-5 mb-6"
        style={{ borderColor: `${tierColor}33` }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* Tier Badge */}
          <div
            className="flex items-center gap-2 rounded-[2rem] px-4 py-2"
            style={{
              background: `${tierColor}15`,
              border: `1px solid ${tierColor}44`,
              boxShadow: `0 0 20px ${tierColor}22`,
            }}
          >
            <span className="text-2xl">{tierIcon}</span>
            <div>
              <div className="font-bold text-[1.1rem]" style={{ color: tierColor }}>
                Tier {data.currentTier.tier}: {data.currentTier.name}
              </div>
              <div className="text-[0.7rem] text-[var(--text-muted,#666)]">
                {data.currentTier.personaCount} personas · {data.currentTier.domains.length} domains
              </div>
            </div>
          </div>

          {/* Knowledge Count */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between mb-1">
              <span className="text-[var(--text-secondary,#a3a3a3)] text-[0.8rem]">
                Knowledge: {data.totalKnowledge}
              </span>
              <span className="text-[0.75rem] text-[var(--text-muted,#666)]">
                {data.nextTierProgress.label}
              </span>
            </div>
            <div className="bg-[var(--bg-card)] rounded h-2 overflow-hidden">
              <div
                className="h-full rounded transition-[width] duration-500"
                style={{
                  width: `${Math.min((data.nextTierProgress.current / data.nextTierProgress.needed) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${tierColor}, ${tierColor}88)`,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <StatPill label="Last Trained" value={lastTrainedAgo} color={lastTrainedRun ? '#6EE05A' : '#64748b'} pulse={!!lastTrainedRun} />
            <StatPill label="Avg Score" value={data.avgScore ? data.avgScore.toFixed(3) : '—'} color={getScoreColor(data.avgScore)} />
            <StatPill label="Brain Health" value={brainHealth ? brainHealth.toFixed(3) : '—'} color={getScoreColor(brainHealth)} />
          </div>
        </div>
      </div>

      {/* ─── Grid: Personas + Domain Coverage ─── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Persona Cards */}
        <div className="bg-[var(--bg-card,#0B0F19)] border border-[var(--border,#1a1a1a)] rounded-xl p-5">
          <h3 className="text-[var(--text-primary,#e5e5e5)] mt-0 mb-4 text-base">
            Council Personas
          </h3>
          <div className="grid gap-3">
            {data.personaScores.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg border"
                style={{
                  background: p.isActive ? '#111' : '#0B0F19',
                  borderColor: p.isActive ? '#1a1a1a' : '#111',
                  opacity: p.isActive ? 1 : 0.45,
                  filter: p.isActive ? 'none' : 'grayscale(1)',
                }}
              >
                <span className="text-xl">{(p as { avatar?: string }).avatar || '🤖'}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-primary,#e5e5e5)] font-semibold text-[0.85rem]">
                      {p.name}
                    </span>
                    {p.isActive ? (
                      <span className="text-[0.8rem] font-mono" style={{ color: getScoreColor(p.avgScore) }}>
                        {p.avgScore > 0 ? p.avgScore.toFixed(3) : '—'}
                      </span>
                    ) : (
                      <span className="text-[0.7rem] text-[var(--text-muted)]">Tier {p.unlocksAtTier}</span>
                    )}
                  </div>
                  <div className="text-[0.7rem] text-[var(--text-muted,#666)]">{p.specialty}</div>
                  {p.isActive && p.avgScore > 0 && (
                    <div className="bg-[var(--bg-card)] rounded-sm h-1 mt-1">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${Math.min(p.avgScore * 100, 100)}%`,
                          background: getScoreColor(p.avgScore),
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Coverage */}
        <div className="bg-[var(--bg-card,#0B0F19)] border border-[var(--border,#1a1a1a)] rounded-xl p-5">
          <h3 className="text-[var(--text-primary,#e5e5e5)] mt-0 mb-4 text-base">
            Domain Coverage
          </h3>
          {data.domainCoverage.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--text-muted,#666)]">No domain data yet. Run /training to start.</div>
          ) : (
            <div className="grid gap-3">
              {data.domainCoverage.map(d => (
                <div key={d.domain}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--text-secondary,#a3a3a3)] text-[0.8rem]">
                      {(d as { label?: string }).label || d.domain}
                    </span>
                    <span className="text-[0.75rem] font-mono" style={{ color: getScoreColor(d.avgScore) }}>
                      {d.count} entries · {d.avgScore.toFixed(3)}
                    </span>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded h-1.5">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.min(d.avgScore * 100, 100)}%`,
                        background: getScoreColor(d.avgScore),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Training Run Log ─── */}
      <div className="bg-[var(--bg-card,#0B0F19)] border border-[var(--border,#1a1a1a)] rounded-xl p-5 mb-6">
        <h3 className="text-[var(--text-primary,#e5e5e5)] mt-0 mb-4 text-base">
          Training Run Log
        </h3>
        {data.recentRuns.length === 0 ? (
          <div className="text-[0.8rem] text-[var(--text-muted,#666)]">No training runs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.8rem]">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  {['Time', 'Type', 'Tier', 'Batch', 'Avg Score', 'Added', 'Pruned', 'Duration'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentRuns.map(run => (
                  <tr key={run.id} className="border-b border-[#111]">
                    <td className="py-2 px-2 text-[var(--text-muted)]">{timeAgo(new Date(run.created_at))}</td>
                    <td className="py-2 px-2">
                      <span
                        className="text-[0.7rem] py-0.5 px-1.5 rounded"
                        style={{
                          background: run.run_type === 'offline' ? '#6EE05A22' : run.run_type === 'housekeeping' ? '#64748b22' : '#ff6b3522',
                          color: run.run_type === 'offline' ? '#6EE05A' : run.run_type === 'housekeeping' ? '#64748b' : '#ff6b35',
                        }}
                      >
                        {run.run_type}
                      </span>
                    </td>
                    <td className="py-2 px-2" style={{ color: TIER_COLORS[run.tier_level] || '#666' }}>T{run.tier_level}</td>
                    <td className="py-2 px-2 text-[var(--text-muted)] font-mono">{run.batch_size || '—'}</td>
                    <td className="py-2 px-2 font-mono" style={{ color: getScoreColor(run.avg_composite_score || 0) }}>
                      {run.avg_composite_score ? run.avg_composite_score.toFixed(3) : '—'}
                    </td>
                    <td className="py-2 px-2 font-mono" style={{ color: run.entries_added ? '#6EE05A' : '#666' }}>
                      {run.entries_added ? `+${run.entries_added}` : '—'}
                    </td>
                    <td className="py-2 px-2 font-mono" style={{ color: run.entries_pruned ? '#ef4444' : '#666' }}>
                      {run.entries_pruned ? `-${run.entries_pruned}` : '—'}
                    </td>
                    <td className="py-2 px-2 text-[var(--text-muted)] font-mono">
                      {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(1)}s` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Grid: Milestones + Admin ─── */}
      <div className={`grid gap-6 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Milestones */}
        <div className="bg-[var(--bg-card,#0B0F19)] border border-[var(--border,#1a1a1a)] rounded-xl p-5">
          <h3 className="text-[var(--text-primary,#e5e5e5)] mt-0 mb-4 text-base">
            Milestones
          </h3>
          {data.milestones.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--text-muted,#666)]">No milestones achieved yet. Run /training to begin.</div>
          ) : (
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[6px] top-0 bottom-0 w-0.5 bg-[var(--bg-card)]" />
              {data.milestones.map((m) => {
                const isTier = m.milestone_key.startsWith('tier_')
                const color = isTier ? (TIER_COLORS[parseInt(m.milestone_key.replace('tier_', '').replace('_reached', ''))] || '#6EE05A') : '#6EE05A'
                return (
                  <div key={m.milestone_key} className="relative mb-4">
                    {/* Dot */}
                    <div
                      className="absolute left-[-1.5rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0B0F19]"
                      style={{ background: color, boxShadow: `0 0 8px ${color}44` }}
                    />
                    <div className="text-[0.85rem] text-[var(--text-primary,#e5e5e5)] font-semibold">
                      {formatMilestoneKey(m.milestone_key)}
                    </div>
                    <div className="text-[0.7rem] text-[var(--text-muted,#666)]">
                      {new Date(m.reached_at).toLocaleDateString()} · {timeAgo(new Date(m.reached_at))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="bg-[var(--bg-card,#0B0F19)] border border-[var(--border,#1a1a1a)] rounded-xl p-5">
            <h3 className="text-[var(--text-primary,#e5e5e5)] mt-0 mb-4 text-base">
              Admin Controls
            </h3>
            <button
              onClick={triggerHousekeeping}
              disabled={runningHousekeeping}
              className="w-full py-3 rounded-lg font-semibold text-[0.9rem] mb-4 transition-colors duration-150"
              style={{
                background: runningHousekeeping ? '#1a1a1a' : `${tierColor}22`,
                border: `1px solid ${runningHousekeeping ? '#333' : tierColor}44`,
                color: runningHousekeeping ? '#666' : tierColor,
                cursor: runningHousekeeping ? 'not-allowed' : 'pointer',
              }}
            >
              {runningHousekeeping ? 'Running...' : 'Run Housekeeping Now'}
            </button>
            <div className="text-[0.8rem] text-[var(--text-muted,#666)]">
              Housekeeping prunes expired entries, checks tier upgrades, and sends milestone notifications.
              Actual training runs happen offline via <code className="text-[#6EE05A]">/training</code>.
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <MiniStat label="Total Knowledge" value={String(data.totalKnowledge)} />
              <MiniStat label="Avg Score" value={data.avgScore ? data.avgScore.toFixed(3) : '0'} />
              <MiniStat label="Training Runs" value={String(data.recentRuns.filter(r => r.run_type !== 'housekeeping').length)} />
              <MiniStat label="Domains" value={String(data.domainCoverage.length)} />
              <MiniStat label="Milestones" value={String(data.milestones.length)} />
              <MiniStat label="Active Personas" value={String(data.personaScores.filter(p => p.isActive).length)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helper Components ───────────────────────────────────────

function StatPill({ label, value, color, pulse }: { label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[0.65rem] text-[var(--text-muted)] mb-0.5">{label}</div>
      <div className="flex items-center gap-1 justify-center">
        {pulse && (
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          />
        )}
        <span className="font-mono text-[0.85rem] font-semibold" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#111] rounded-lg p-2 text-center">
      <div className="text-[0.65rem] text-[var(--text-muted)]">{label}</div>
      <div className="text-[var(--text-primary,#e5e5e5)] font-semibold text-base font-mono">
        {value}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 0.85) return '#6EE05A'
  if (score >= 0.75) return '#facc15'
  if (score >= 0.65) return '#fb923c'
  return '#ef4444'
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatMilestoneKey(key: string): string {
  const labels: Record<string, string> = {
    first_training_run: 'First Training Run',
    knowledge_50: '50 Knowledge Entries',
    knowledge_100: '100 Knowledge Entries',
    knowledge_500: '500 Knowledge Entries',
    knowledge_1000: '1,000 Knowledge Entries',
    tier_1_reached: 'Tier 1: Sprout',
    tier_2_reached: 'Tier 2: Growth',
    tier_3_reached: 'Tier 3: Canopy',
    tier_4_reached: 'Tier 4: Neural',
    first_user_contribution: 'First User Contribution',
    high_score_run: 'High Score Run (>0.90)',
  }
  if (key.startsWith('domain_mastery_')) {
    return `Domain Mastery: ${key.replace('domain_mastery_', '')}`
  }
  return labels[key] || key
}
