'use client'

import { useState, useEffect } from 'react'
import type { LeaderboardData } from '@/lib/training/types'

const TIER_COLORS: Record<number, string> = {
  0: '#64748b', 1: '#6EE05A', 2: '#00d4ff', 3: '#a78bfa', 4: '#ff6b35',
}

const TIER_ICONS: Record<number, string> = {
  0: '🌱', 1: '🌿', 2: '🌳', 3: '🏔️', 4: '🧠',
}

const card: React.CSSProperties = {
  background: 'var(--bg-card, #0B0F19)',
  border: '1px solid var(--border, #1a1a1a)',
  borderRadius: '0.75rem',
  padding: '1.25rem',
}

const sub: React.CSSProperties = {
  color: 'var(--text-muted, #666)',
  fontSize: '0.8rem',
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
        <div style={sub}>Loading Brain Training Dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
        <div style={{ color: 'var(--text-primary, #e5e5e5)' }}>Brain Training Factory</div>
        <div style={{ ...sub, marginTop: '0.5rem' }}>
          No training data yet. Run <code style={{ color: '#6EE05A' }}>/training</code> in Claude Code to start the first session.
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
  const lastRun = data.recentRuns[0]
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
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ─── Hero Status Bar ─── */}
      <div style={{ ...card, marginBottom: '1.5rem', borderColor: `${tierColor}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Tier Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: `${tierColor}15`, border: `1px solid ${tierColor}44`,
            borderRadius: '2rem', padding: '0.5rem 1rem',
            boxShadow: `0 0 20px ${tierColor}22`,
          }}>
            <span style={{ fontSize: '1.5rem' }}>{tierIcon}</span>
            <div>
              <div style={{ color: tierColor, fontWeight: 700, fontSize: '1.1rem' }}>
                Tier {data.currentTier.tier}: {data.currentTier.name}
              </div>
              <div style={{ ...sub, fontSize: '0.7rem' }}>
                {data.currentTier.personaCount} personas · {data.currentTier.domains.length} domains
              </div>
            </div>
          </div>

          {/* Knowledge Count */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary, #a3a3a3)', fontSize: '0.8rem' }}>
                Knowledge: {data.totalKnowledge}
              </span>
              <span style={{ ...sub, fontSize: '0.75rem' }}>
                {data.nextTierProgress.label}
              </span>
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min((data.nextTierProgress.current / data.nextTierProgress.needed) * 100, 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${tierColor}, ${tierColor}88)`,
                borderRadius: '4px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <StatPill label="Last Trained" value={lastTrainedAgo} color={lastTrainedRun ? '#6EE05A' : '#64748b'} pulse={!!lastTrainedRun} />
            <StatPill label="Avg Score" value={data.avgScore ? data.avgScore.toFixed(3) : '—'} color={getScoreColor(data.avgScore)} />
            <StatPill label="Brain Health" value={brainHealth ? brainHealth.toFixed(3) : '—'} color={getScoreColor(brainHealth)} />
          </div>
        </div>
      </div>

      {/* ─── Grid: Personas + Domain Coverage ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Persona Cards */}
        <div style={card}>
          <h3 style={{ color: 'var(--text-primary, #e5e5e5)', margin: '0 0 1rem', fontSize: '1rem' }}>
            Council Personas
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.personaScores.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                background: p.isActive ? '#111' : '#0B0F19',
                borderRadius: '0.5rem',
                border: `1px solid ${p.isActive ? '#1a1a1a' : '#111'}`,
                opacity: p.isActive ? 1 : 0.45,
                filter: p.isActive ? 'none' : 'grayscale(1)',
              }}>
                <span style={{ fontSize: '1.25rem' }}>{(p as { avatar?: string }).avatar || '🤖'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-primary, #e5e5e5)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {p.name}
                    </span>
                    {p.isActive ? (
                      <span style={{ color: getScoreColor(p.avgScore), fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
                        {p.avgScore > 0 ? p.avgScore.toFixed(3) : '—'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tier {p.unlocksAtTier}</span>
                    )}
                  </div>
                  <div style={{ ...sub, fontSize: '0.7rem' }}>{p.specialty}</div>
                  {p.isActive && p.avgScore > 0 && (
                    <div style={{ background: 'var(--bg-card)', borderRadius: '3px', height: '4px', marginTop: '4px' }}>
                      <div style={{
                        width: `${Math.min(p.avgScore * 100, 100)}%`,
                        height: '100%',
                        background: getScoreColor(p.avgScore),
                        borderRadius: '3px',
                      }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Coverage */}
        <div style={card}>
          <h3 style={{ color: 'var(--text-primary, #e5e5e5)', margin: '0 0 1rem', fontSize: '1rem' }}>
            Domain Coverage
          </h3>
          {data.domainCoverage.length === 0 ? (
            <div style={sub}>No domain data yet. Run /training to start.</div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {data.domainCoverage.map(d => (
                <div key={d.domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary, #a3a3a3)', fontSize: '0.8rem' }}>
                      {(d as { label?: string }).label || d.domain}
                    </span>
                    <span style={{ color: getScoreColor(d.avgScore), fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {d.count} entries · {d.avgScore.toFixed(3)}
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: '4px', height: '6px' }}>
                    <div style={{
                      width: `${Math.min(d.avgScore * 100, 100)}%`,
                      height: '100%',
                      background: getScoreColor(d.avgScore),
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Training Run Log ─── */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--text-primary, #e5e5e5)', margin: '0 0 1rem', fontSize: '1rem' }}>
          Training Run Log
        </h3>
        {data.recentRuns.length === 0 ? (
          <div style={sub}>No training runs yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Time', 'Type', 'Tier', 'Batch', 'Avg Score', 'Added', 'Pruned', 'Duration'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentRuns.map(run => (
                  <tr key={run.id} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{timeAgo(new Date(run.created_at))}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                        background: run.run_type === 'offline' ? '#6EE05A22' : run.run_type === 'housekeeping' ? '#64748b22' : '#ff6b3522',
                        color: run.run_type === 'offline' ? '#6EE05A' : run.run_type === 'housekeeping' ? '#64748b' : '#ff6b35',
                      }}>
                        {run.run_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem', color: TIER_COLORS[run.tier_level] || '#666' }}>T{run.tier_level}</td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{run.batch_size || '—'}</td>
                    <td style={{ padding: '0.5rem', color: getScoreColor(run.avg_composite_score || 0), fontFamily: 'JetBrains Mono, monospace' }}>
                      {run.avg_composite_score ? run.avg_composite_score.toFixed(3) : '—'}
                    </td>
                    <td style={{ padding: '0.5rem', color: run.entries_added ? '#6EE05A' : '#666', fontFamily: 'JetBrains Mono, monospace' }}>
                      {run.entries_added ? `+${run.entries_added}` : '—'}
                    </td>
                    <td style={{ padding: '0.5rem', color: run.entries_pruned ? '#ef4444' : '#666', fontFamily: 'JetBrains Mono, monospace' }}>
                      {run.entries_pruned ? `-${run.entries_pruned}` : '—'}
                    </td>
                    <td style={{ padding: '0.5rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Milestones */}
        <div style={card}>
          <h3 style={{ color: 'var(--text-primary, #e5e5e5)', margin: '0 0 1rem', fontSize: '1rem' }}>
            Milestones
          </h3>
          {data.milestones.length === 0 ? (
            <div style={sub}>No milestones achieved yet. Run /training to begin.</div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: '6px', top: 0, bottom: 0,
                width: '2px', background: 'var(--bg-card)',
              }} />
              {data.milestones.map((m, i) => {
                const isTier = m.milestone_key.startsWith('tier_')
                const color = isTier ? (TIER_COLORS[parseInt(m.milestone_key.replace('tier_', '').replace('_reached', ''))] || '#6EE05A') : '#6EE05A'
                return (
                  <div key={m.milestone_key} style={{ position: 'relative', marginBottom: '1rem' }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: '-1.5rem', top: '4px',
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: color, border: '2px solid #0B0F19',
                      boxShadow: `0 0 8px ${color}44`,
                    }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary, #e5e5e5)', fontWeight: 600 }}>
                      {formatMilestoneKey(m.milestone_key)}
                    </div>
                    <div style={{ ...sub, fontSize: '0.7rem' }}>
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
          <div style={card}>
            <h3 style={{ color: 'var(--text-primary, #e5e5e5)', margin: '0 0 1rem', fontSize: '1rem' }}>
              Admin Controls
            </h3>
            <button
              onClick={triggerHousekeeping}
              disabled={runningHousekeeping}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                background: runningHousekeeping ? '#1a1a1a' : `${tierColor}22`,
                border: `1px solid ${runningHousekeeping ? '#333' : tierColor}44`,
                color: runningHousekeeping ? '#666' : tierColor,
                cursor: runningHousekeeping ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem',
              }}
            >
              {runningHousekeeping ? 'Running...' : 'Run Housekeeping Now'}
            </button>
            <div style={sub}>
              Housekeeping prunes expired entries, checks tier upgrades, and sends milestone notifications.
              Actual training runs happen offline via <code style={{ color: '#6EE05A' }}>/training</code>.
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
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
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
        {pulse && (
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: color, display: 'inline-block',
            boxShadow: `0 0 6px ${color}`,
          }} />
        )}
        <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', fontWeight: 600 }}>
          {value}
        </span>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#111', borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ color: 'var(--text-primary, #e5e5e5)', fontWeight: 600, fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>
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
