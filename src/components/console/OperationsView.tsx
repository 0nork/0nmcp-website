'use client'

import { useState } from 'react'
import {
  Activity,
  Play,
  Pause,
  Trash2,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  RotateCcw,
} from 'lucide-react'
import type { Operation } from '@/lib/console/useOperations'

interface OperationsViewProps {
  operations: Operation[]
  onPause: (id: string) => void
  onResume: (id: string) => void
  onRun: (id: string) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const STATUS_CONFIG = {
  active: {
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    icon: CheckCircle2,
    label: 'Active',
  },
  paused: {
    color: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    icon: Pause,
    label: 'Paused',
  },
  error: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: AlertTriangle,
    label: 'Error',
  },
}

export function OperationsView({
  operations,
  onPause,
  onResume,
  onRun,
  onDelete,
  onCreateNew,
}: OperationsViewProps) {
  const [runningId, setRunningId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleRun = (id: string) => {
    setRunningId(id)
    onRun(id)
    setTimeout(() => setRunningId(null), 3000)
  }

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        maxWidth: '80rem',
        margin: '0 auto',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Operations
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            {operations.length} operation{operations.length !== 1 ? 's' : ''}
            {operations.filter((o) => o.status === 'active').length > 0 && (
              <span style={{ marginLeft: '0.5rem', color: '#22c55e' }}>
                ({operations.filter((o) => o.status === 'active').length} active)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onCreateNew}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'var(--bg-primary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <Plus size={16} />
          New Operation
        </button>
      </div>

      {/* Empty State */}
      {operations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--accent-glow)',
            }}
          >
            <Activity size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            No operations yet
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              maxWidth: '24rem',
              margin: '0 auto 1.5rem',
            }}
          >
            Create your first automation with the workflow wizard. Operations let
            you run, pause, and manage your workflows.
          </p>
          <button
            onClick={onCreateNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              background:
                'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'var(--bg-primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Zap size={16} />
            Create Workflow
          </button>
        </div>
      ) : (
        /* Operations Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {operations.map((op, i) => {
            const cfg = STATUS_CONFIG[op.status]
            const StatusIcon = cfg.icon
            const isRunning = runningId === op.id
            const isDeletePending = deleteConfirm === op.id

            return (
              <div
                key={op.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  transition: 'all 0.2s ease',
                  animation: 'console-stagger-in 0.4s ease both',
                  animationDelay: `${i * 50}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Top row: name + status */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {op.name}
                    </h3>
                    {op.description && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          margin: '0.25rem 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {op.description}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.1875rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: cfg.bg,
                      color: cfg.color,
                      flexShrink: 0,
                      marginLeft: '0.75rem',
                    }}
                  >
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                </div>

                {/* Service pills */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  {op.services.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '0.625rem',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {op.services.length > 5 && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      +{op.services.length - 5}
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Zap size={11} />
                    {op.trigger}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Clock size={11} />
                    {timeAgo(op.lastRun)}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <RotateCcw size={11} />
                    {op.runCount} run{op.runCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Error message */}
                {op.status === 'error' && op.errorMessage && (
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      color: '#ef4444',
                      marginBottom: '0.75rem',
                      padding: '0.375rem 0.5rem',
                      backgroundColor: 'rgba(239,68,68,0.05)',
                      borderRadius: '0.375rem',
                    }}
                  >
                    {op.errorMessage}
                  </p>
                )}

                {/* Action buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {/* Toggle pause/resume */}
                  <button
                    onClick={() =>
                      op.status === 'active'
                        ? onPause(op.id)
                        : onResume(op.id)
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor:
                        op.status === 'active'
                          ? 'rgba(234,179,8,0.1)'
                          : 'rgba(34,197,94,0.1)',
                      color:
                        op.status === 'active' ? '#eab308' : '#22c55e',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {op.status === 'active' ? (
                      <>
                        <Pause size={12} /> Pause
                      </>
                    ) : (
                      <>
                        <Play size={12} /> Start
                      </>
                    )}
                  </button>

                  {/* Run now */}
                  <button
                    onClick={() => handleRun(op.id)}
                    disabled={isRunning}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: 'rgba(0,255,136,0.1)',
                      color: 'var(--accent)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: isRunning ? 'wait' : 'pointer',
                      fontFamily: 'inherit',
                      opacity: isRunning ? 0.6 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isRunning ? (
                      <>
                        <Loader2
                          size={12}
                          style={{ animation: 'spin 1s linear infinite' }}
                        />{' '}
                        Running...
                      </>
                    ) : (
                      <>
                        <Play size={12} /> Run Now
                      </>
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(op.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: isDeletePending
                        ? 'rgba(239,68,68,0.15)'
                        : 'transparent',
                      color: isDeletePending ? '#ef4444' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      marginLeft: 'auto',
                      transition: 'all 0.15s ease',
                    }}
                    title={
                      isDeletePending ? 'Click again to confirm' : 'Delete'
                    }
                  >
                    <Trash2 size={12} />
                    {isDeletePending ? 'Confirm' : ''}
                  </button>
                </div>
              </div>
            )
          })}
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
