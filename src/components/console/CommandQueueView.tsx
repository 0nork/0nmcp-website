'use client'

import { useState, useEffect, useCallback } from 'react'

interface QueuedCommand {
  id: string
  direction: 'to_offline' | 'to_live'
  command_type: string
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: number
  created_by: string
  created_at: string
  started_at: string | null
  completed_at: string | null
  error: string | null
}

interface QueueStats {
  pending: number
  running: number
  completed_today: number
  failed_today: number
  recent: QueuedCommand[]
}

const COMMAND_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  'training.run': { label: 'Run Training', desc: 'Execute a brain training batch offline', icon: '?' },
  'training.status': { label: 'Training Status', desc: 'Get current brain training status', icon: '?' },
  'content.generate': { label: 'Generate Content', desc: 'Generate content offline', icon: '?' },
  'persona.generate': { label: 'Generate Personas', desc: 'Run persona generation offline', icon: '?' },
  'knowledge.query': { label: 'Knowledge Query', desc: 'Deep reasoning query offline', icon: '?' },
  'knowledge.push': { label: 'Push Knowledge', desc: 'Push training results to live', icon: '?' },
  'content.push': { label: 'Push Content', desc: 'Push generated content to live', icon: '?' },
  'config.push': { label: 'Push Config', desc: 'Push config changes to live', icon: '?' },
  'deploy.trigger': { label: 'Trigger Deploy', desc: 'Trigger a Vercel deployment', icon: '?' },
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'rgba(255, 183, 77, 0.1)', text: '#ffb74d', dot: '#ffb74d' },
  running: { bg: 'rgba(0, 212, 255, 0.1)', text: '#00d4ff', dot: '#00d4ff' },
  completed: { bg: 'rgba(126, 217, 87, 0.1)', text: '#7ed957', dot: '#7ed957' },
  failed: { bg: 'rgba(255, 82, 82, 0.1)', text: '#ff5252', dot: '#ff5252' },
  cancelled: { bg: 'rgba(120, 120, 140, 0.1)', text: '#78788c', dot: '#78788c' },
}

export function CommandQueueView({ isAdmin }: { isAdmin: boolean }) {
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [queueing, setQueueing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/command-queue')
      if (!res.ok) {
        if (res.status === 403) {
          setError('VIP access required')
          return
        }
        throw new Error('Failed to load')
      }
      const data = await res.json()
      setStats(data)
      setError(null)
    } catch {
      setError('Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  // Auto-refresh every 15s
  useEffect(() => {
    const timer = setInterval(loadStats, 15000)
    return () => clearInterval(timer)
  }, [loadStats])

  async function queueCommand(commandType: string) {
    setQueueing(true)
    try {
      const res = await fetch('/api/command-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'queue',
          command_type: commandType,
          payload: {},
        }),
      })
      if (res.ok) {
        await loadStats()
      }
    } finally {
      setQueueing(false)
    }
  }

  async function cancelCmd(id: string) {
    await fetch('/api/command-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', command_id: id }),
    })
    await loadStats()
  }

  function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading command queue...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{
          background: 'rgba(255, 82, 82, 0.1)',
          border: '1px solid rgba(255, 82, 82, 0.3)',
          borderRadius: 12,
          padding: '24px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>?</div>
          <div style={{ color: '#ff5252', fontWeight: 600 }}>{error}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
            Only VIP admins and the owner can access the command queue.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #00d4ff 0%, #a78bfa 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            ?
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)' }}>
              0nCommand Sync
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Bridge between offline (Claude Code) and live (Vercel)
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: 'Pending', value: stats?.pending || 0, color: '#ffb74d' },
          { label: 'Running', value: stats?.running || 0, color: '#00d4ff' },
          { label: 'Completed Today', value: stats?.completed_today || 0, color: '#7ed957' },
          { label: 'Failed Today', value: stats?.failed_today || 0, color: '#ff5252' },
        ].map((card) => (
          <div key={card.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions — Queue Commands */}
      {isAdmin && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Queue Command for 0nCommand
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {Object.entries(COMMAND_LABELS)
              .filter(([, v]) => v.icon === '?' || v.icon === '?' || v.icon === '?')
              .slice(0, 6)
              .map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => queueCommand(type)}
                  disabled={queueing}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    cursor: queueing ? 'wait' : 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.2s',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00d4ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span>{info.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{info.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{info.desc}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={{
        background: 'rgba(0, 212, 255, 0.05)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 14, color: '#00d4ff', marginBottom: 12, marginTop: 0 }}>
          How 0nCommand Sync Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>?</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>0nLive</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Queue commands</div>
          </div>
          <div style={{ color: '#00d4ff', fontSize: 20 }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>?</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>Supabase</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Message bus</div>
          </div>
          <div style={{ color: '#00d4ff', fontSize: 20 }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>?</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>0nCommand</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Execute offline</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
          Commands queued here are picked up by <code style={{ color: '#ff6b35' }}>/0ncommand sync</code> running in Claude Code.
          All AI work runs on your MAX plan — zero external API costs.
          Results are pushed back to Supabase and appear here automatically.
        </div>
      </div>

      {/* Recent Commands */}
      <div>
        <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          Command History
        </h3>
        {(!stats?.recent || stats.recent.length === 0) ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '32px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>?</div>
            <div>No commands yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Queue a command above or run <code style={{ color: '#ff6b35' }}>/0ncommand sync</code> to push results from Claude Code.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recent.map((cmd) => {
              const statusStyle = STATUS_COLORS[cmd.status] || STATUS_COLORS.pending
              const cmdInfo = COMMAND_LABELS[cmd.command_type]
              return (
                <div key={cmd.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  {/* Direction indicator */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: cmd.direction === 'to_offline' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(126, 217, 87, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}>
                    {cmd.direction === 'to_offline' ? '?' : '?'}
                  </div>

                  {/* Command info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {cmdInfo?.label || cmd.command_type}
                      </span>
                      <span style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        fontWeight: 600,
                      }}>
                        {cmd.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {timeAgo(cmd.created_at)}
                      {cmd.completed_at && cmd.started_at && (
                        <> — took {Math.round((new Date(cmd.completed_at).getTime() - new Date(cmd.started_at).getTime()) / 1000)}s</>
                      )}
                      {cmd.error && (
                        <span style={{ color: '#ff5252', marginLeft: 8 }}>{cmd.error}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(cmd.status === 'pending' || cmd.status === 'running') && isAdmin && (
                    <button
                      onClick={() => cancelCmd(cmd.id)}
                      style={{
                        background: 'rgba(255, 82, 82, 0.1)',
                        border: '1px solid rgba(255, 82, 82, 0.3)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        color: '#ff5252',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Refresh */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          onClick={loadStats}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 16px',
            color: 'var(--text-muted)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Refresh (auto-refreshes every 15s)
        </button>
      </div>
    </div>
  )
}
