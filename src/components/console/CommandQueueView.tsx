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
  completed: { bg: 'rgba(110, 224, 90, 0.1)', text: '#6EE05A', dot: '#6EE05A' },
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
      <div className="p-8 text-center text-[var(--text-muted)]">
        Loading command queue...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-[rgba(255,82,82,0.1)] border border-[rgba(255,82,82,0.3)] rounded-xl px-8 py-6 text-center">
          <div className="text-2xl mb-2">?</div>
          <div className="text-[#ff5252] font-semibold">{error}</div>
          <div className="text-[var(--text-muted)] text-[13px] mt-2">
            Only VIP admins and the owner can access the command queue.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#00d4ff] to-[#a78bfa] flex items-center justify-center text-xl shrink-0">
            ?
          </div>
          <div>
            <h2 className="m-0 text-xl text-[var(--text-primary)] font-semibold">
              0nCommand Sync
            </h2>
            <div className="text-[13px] text-[var(--text-muted)]">
              Bridge between offline (Claude Code) and live (Vercel)
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pending', value: stats?.pending || 0, color: '#ffb74d' },
          { label: 'Running', value: stats?.running || 0, color: '#00d4ff' },
          { label: 'Completed Today', value: stats?.completed_today || 0, color: '#6EE05A' },
          { label: 'Failed Today', value: stats?.failed_today || 0, color: '#ff5252' },
        ].map((card) => (
          <div key={card.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] p-4 text-center">
            <div className="text-[28px] font-bold" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions — Queue Commands */}
      {isAdmin && (
        <div className="mb-6">
          <h3 className="text-[14px] text-[var(--text-secondary)] mb-3 uppercase tracking-[1px]">
            Queue Command for 0nCommand
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {Object.entries(COMMAND_LABELS)
              .filter(([, v]) => v.icon === '?' || v.icon === '?' || v.icon === '?')
              .slice(0, 6)
              .map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => queueCommand(type)}
                  disabled={queueing}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] px-4 py-3.5 cursor-pointer text-left transition-[border-color] duration-200 text-[var(--text-primary)] disabled:cursor-wait hover:border-[#00d4ff]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{info.icon}</span>
                    <span className="font-semibold text-[14px]">{info.label}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{info.desc}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-xl px-6 py-5 mb-6">
        <h3 className="text-[14px] text-[#00d4ff] mb-3 mt-0">
          How 0nCommand Sync Works
        </h3>
        <div className="grid gap-3 items-center" style={{ gridTemplateColumns: '1fr auto 1fr auto 1fr' }}>
          <div className="text-center">
            <div className="text-xl mb-1">?</div>
            <div className="text-[13px] text-[var(--text-primary)] font-semibold">0nLive</div>
            <div className="text-[11px] text-[var(--text-muted)]">Queue commands</div>
          </div>
          <div className="text-[#00d4ff] text-xl">→</div>
          <div className="text-center">
            <div className="text-xl mb-1">?</div>
            <div className="text-[13px] text-[var(--text-primary)] font-semibold">Supabase</div>
            <div className="text-[11px] text-[var(--text-muted)]">Message bus</div>
          </div>
          <div className="text-[#00d4ff] text-xl">→</div>
          <div className="text-center">
            <div className="text-xl mb-1">?</div>
            <div className="text-[13px] text-[var(--text-primary)] font-semibold">0nCommand</div>
            <div className="text-[11px] text-[var(--text-muted)]">Execute offline</div>
          </div>
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
          Commands queued here are picked up by <code className="text-[#ff6b35]">/0ncommand sync</code> running in Claude Code.
          All AI work runs on your MAX plan — zero external API costs.
          Results are pushed back to Supabase and appear here automatically.
        </div>
      </div>

      {/* Recent Commands */}
      <div>
        <h3 className="text-[14px] text-[var(--text-secondary)] mb-3 uppercase tracking-[1px]">
          Command History
        </h3>
        {(!stats?.recent || stats.recent.length === 0) ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] px-6 py-8 text-center text-[var(--text-muted)]">
            <div className="text-3xl mb-2">?</div>
            <div>No commands yet</div>
            <div className="text-xs mt-1">
              Queue a command above or run <code className="text-[#ff6b35]">/0ncommand sync</code> to push results from Claude Code.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.recent.map((cmd) => {
              const statusStyle = STATUS_COLORS[cmd.status] || STATUS_COLORS.pending
              const cmdInfo = COMMAND_LABELS[cmd.command_type]
              return (
                <div key={cmd.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] px-[18px] py-3.5 flex items-center gap-3">
                  {/* Direction indicator */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] shrink-0"
                    style={{
                      background: cmd.direction === 'to_offline' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(110, 224, 90, 0.1)',
                    }}
                  >
                    {cmd.direction === 'to_offline' ? '?' : '?'}
                  </div>

                  {/* Command info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[14px] text-[var(--text-primary)]">
                        {cmdInfo?.label || cmd.command_type}
                      </span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded font-semibold"
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                      >
                        {cmd.status}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {timeAgo(cmd.created_at)}
                      {cmd.completed_at && cmd.started_at && (
                        <> — took {Math.round((new Date(cmd.completed_at).getTime() - new Date(cmd.started_at).getTime()) / 1000)}s</>
                      )}
                      {cmd.error && (
                        <span className="text-[#ff5252] ml-2">{cmd.error}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(cmd.status === 'pending' || cmd.status === 'running') && isAdmin && (
                    <button
                      onClick={() => cancelCmd(cmd.id)}
                      className="bg-[rgba(255,82,82,0.1)] border border-[rgba(255,82,82,0.3)] rounded-md px-2.5 py-1 text-[#ff5252] text-xs cursor-pointer"
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
      <div className="text-center mt-4">
        <button
          onClick={loadStats}
          className="bg-transparent border border-[var(--border)] rounded-md px-4 py-1.5 text-[var(--text-muted)] text-xs cursor-pointer"
        >
          Refresh (auto-refreshes every 15s)
        </button>
      </div>
    </div>
  )
}
