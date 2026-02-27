'use client'

import { useMemo, useState } from 'react'
import {
  Clock,
  Link,
  Zap,
  MessageSquare,
  AlertCircle,
  Trash2,
  Pin,
} from 'lucide-react'

interface HistoryEntry {
  id: string
  type: string
  detail: string
  ts: number
}

interface HistoryOverlayProps {
  history: HistoryEntry[]
  onClear: () => void
}

function typeIcon(type: string) {
  switch (type) {
    case 'connect':
      return Link
    case 'workflow':
      return Zap
    case 'chat':
      return MessageSquare
    case 'error':
      return AlertCircle
    default:
      return Pin
  }
}

function typeColors(type: string): { bg: string; fg: string } {
  switch (type) {
    case 'connect':
      return { bg: 'rgba(0,255,136,0.1)', fg: 'var(--accent)' }
    case 'workflow':
      return { bg: 'rgba(0,212,255,0.1)', fg: 'var(--accent-secondary)' }
    case 'chat':
      return { bg: 'var(--accent-glow)', fg: 'var(--accent)' }
    case 'error':
      return { bg: 'rgba(239,68,68,0.1)', fg: '#ef4444' }
    default:
      return { bg: 'var(--accent-glow)', fg: 'var(--accent)' }
  }
}

function groupByDate(entries: HistoryEntry[]) {
  const groups: Record<string, HistoryEntry[]> = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const entry of entries) {
    const date = new Date(entry.ts)
    let label: string
    if (date.toDateString() === today.toDateString()) {
      label = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday'
    } else {
      label = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    if (!groups[label]) groups[label] = []
    groups[label].push(entry)
  }
  return groups
}

export function HistoryOverlay({ history, onClear }: HistoryOverlayProps) {
  const grouped = useMemo(() => groupByDate(history), [history])
  const [clearConfirm, setClearConfirm] = useState(false)

  const handleClear = () => {
    if (clearConfirm) {
      onClear()
      setClearConfirm(false)
    } else {
      setClearConfirm(true)
      setTimeout(() => setClearConfirm(false), 3000)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-full mx-auto w-full" style={{ animation: 'console-fade-in 0.3s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl lg:text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            History
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {history.length} event{history.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer bg-transparent"
            style={{
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <Trash2 size={12} />
            {clearConfirm ? 'Click to confirm' : 'Clear all'}
          </button>
        )}
      </div>

      {/* Content */}
      {history.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-glow)' }}
          >
            <Clock size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            No activity yet
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Actions and events will appear here as you use the 0n Console.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-3 sticky top-0 py-1 z-[1]"
                style={{
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(10,10,15,0.8)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {date}
              </div>
              <div className="space-y-1">
                {entries.map((e, i) => {
                  const Icon = typeIcon(e.type)
                  const colors = typeColors(e.type)
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                      style={{
                        animation: 'console-stagger-in 0.4s ease both',
                        animationDelay: `${i * 30}ms`,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor =
                          'rgba(255,255,255,0.03)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <Icon size={14} style={{ color: colors.fg }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {e.detail}
                        </div>
                      </div>

                      <span
                        className="text-xs shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {new Date(e.ts).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
