'use client'

import { useState } from 'react'
import {
  Workflow,
  Zap,
  Trash2,
  Plus,
  Play,
  Loader2,
  Server,
  Star,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import type { PurchaseWithWorkflow } from './StoreTypes'

interface McpWorkflow {
  name: string
  path?: string
  type?: string
  version?: string
}

interface LocalFlow {
  id: string
  name: string
  trigger: string
  actions: string[]
  on: boolean
}

interface FlowsOverlayProps {
  mcpWorkflows: McpWorkflow[]
  localFlows: LocalFlow[]
  onRun: (name: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
  premiumPurchases?: PurchaseWithWorkflow[]
  onPremiumClick?: (purchase: PurchaseWithWorkflow) => void
  onGoToStore?: () => void
}

export function FlowsOverlay({
  mcpWorkflows,
  localFlows,
  onRun,
  onToggle,
  onDelete,
  onCreate,
  premiumPurchases = [],
  onPremiumClick,
  onGoToStore,
}: FlowsOverlayProps) {
  const [runningId, setRunningId] = useState<string | null>(null)
  const [runResult, setRunResult] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const totalFlows = mcpWorkflows.length + localFlows.length

  const handleRun = async (name: string) => {
    setRunningId(name)
    setRunResult(null)
    onRun(name)
    // Simulate result clearing
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
    <div className="p-4 md:p-6 lg:p-8 max-w-full mx-auto w-full" style={{ animation: 'console-fade-in 0.3s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl lg:text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Workflows
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {totalFlows} workflow{totalFlows !== 1 ? 's' : ''}
            {mcpWorkflows.length > 0 && (
              <span className="ml-1" style={{ color: 'var(--accent)' }}>
                ({mcpWorkflows.length} from 0nMCP)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            color: 'var(--bg-primary)',
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
          New Workflow
        </button>
      </div>

      {/* Run result banner */}
      {runResult && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid rgba(0,255,136,0.2)',
            color: 'var(--text-secondary)',
            animation: 'console-fade-in 0.2s ease',
          }}
        >
          {runResult}
        </div>
      )}

      {/* Empty state */}
      {totalFlows === 0 ? (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-glow)' }}
          >
            <Workflow size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            No workflows yet
          </h3>
          <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Build your first automation to connect services and trigger actions automatically.
            You can also create .0n workflow files in ~/.0n/workflows/
          </p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: 'var(--bg-primary)',
            }}
          >
            <Plus size={16} />
            Create Workflow
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 0nMCP Workflows */}
          {mcpWorkflows.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Server size={14} style={{ color: 'var(--accent)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  0nMCP Workflows
                </h3>
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ~/.0n/workflows/
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mcpWorkflows.map((w, i) => (
                  <div
                    key={w.name}
                    className="glow-box rounded-2xl p-4 transition-all duration-300"
                    style={{
                      animation: 'console-stagger-in 0.4s ease both',
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--accent-glow)' }}
                        >
                          <Zap size={16} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="min-w-0">
                          <span
                            className="font-semibold text-sm truncate block"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {w.name}
                          </span>
                          {w.version && (
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              v{w.version}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRun(w.name)}
                        disabled={runningId === w.name}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-none"
                        style={{
                          backgroundColor: 'rgba(0,255,136,0.1)',
                          color: 'var(--accent)',
                          opacity: runningId === w.name ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.2)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.1)')
                        }
                      >
                        {runningId === w.name ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Play size={12} />
                        )}
                        Run
                      </button>
                    </div>
                    <div className="text-xs ml-[46px]" style={{ color: 'var(--text-muted)' }}>
                      {w.type || 'workflow'} &middot; {w.path?.split('/').pop() || w.name + '.0n'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Workflows */}
          {localFlows.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Workflow size={14} style={{ color: 'var(--accent-secondary)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Local Workflows
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {localFlows.map((f, i) => (
                  <div
                    key={f.id}
                    className="glow-box rounded-2xl p-4 transition-all duration-300"
                    style={{
                      animation: 'console-stagger-in 0.4s ease both',
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: f.on
                              ? 'rgba(0,212,255,0.1)'
                              : 'rgba(255,255,255,0.04)',
                          }}
                        >
                          <Zap
                            size={16}
                            style={{
                              color: f.on ? 'var(--accent-secondary)' : 'var(--text-muted)',
                            }}
                          />
                        </div>
                        <span
                          className="font-semibold text-sm truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {f.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onToggle(f.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer border-none"
                          style={{
                            backgroundColor: f.on ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)',
                            color: f.on ? 'var(--accent)' : 'var(--text-muted)',
                          }}
                        >
                          {f.on ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {f.on ? 'ON' : 'OFF'}
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="p-1.5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                          style={{
                            color: deleteConfirm === f.id ? '#ef4444' : 'var(--text-muted)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
                            e.currentTarget.style.color = '#ef4444'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = deleteConfirm === f.id ? '#ef4444' : 'var(--text-muted)'
                          }}
                          title={deleteConfirm === f.id ? 'Click again to confirm' : 'Delete'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 ml-[46px]">
                      <div
                        className="text-xs flex items-center gap-1.5"
                        style={{ color: 'var(--accent-secondary)' }}
                      >
                        <Zap size={10} />
                        {f.trigger}
                      </div>
                      {f.actions.map((a, idx) => (
                        <div
                          key={idx}
                          className="text-xs pl-3"
                          style={{
                            color: 'var(--text-secondary)',
                            borderLeft: '1px solid var(--border)',
                          }}
                        >
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Premium Workflows */}
          {premiumPurchases.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star size={14} style={{ color: '#ffbb33' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Premium Workflows
                  </h3>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: 'rgba(255,187,51,0.1)',
                      color: '#ffbb33',
                    }}
                  >
                    {premiumPurchases.length}
                  </span>
                </div>
                {onGoToStore && (
                  <button
                    onClick={onGoToStore}
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer border-none bg-transparent"
                    style={{ color: 'var(--accent)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  >
                    <ShoppingBag size={12} />
                    Browse Store
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {premiumPurchases.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => onPremiumClick?.(p)}
                    className="glow-box rounded-2xl p-4 transition-all duration-300 text-left cursor-pointer border-none w-full"
                    style={{
                      animation: 'console-stagger-in 0.4s ease both',
                      animationDelay: `${i * 60}ms`,
                      borderLeft: '3px solid #ffbb33',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,187,51,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(255,187,51,0.1)' }}
                      >
                        <Star size={16} style={{ color: '#ffbb33' }} />
                      </div>
                      <div className="min-w-0">
                        <span
                          className="font-semibold text-sm truncate block"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {p.workflow_name || p.listing?.title || 'Premium Workflow'}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {p.listing?.category || 'workflow'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
