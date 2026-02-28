'use client'

import { useState } from 'react'
import { X, Play, Blocks, Download, Info, Loader2 } from 'lucide-react'
import type { PurchaseWithWorkflow } from './StoreTypes'

interface PremiumFlowActionModalProps {
  purchase: PurchaseWithWorkflow
  onClose: () => void
  onRun: (workflowData: Record<string, unknown>) => void
  onAddToBuilder: (workflowData: Record<string, unknown>) => void
  onDownload: (workflowId: string) => Promise<{ workflow?: unknown; filename?: string; error?: string }>
  onViewDetails: () => void
}

export function PremiumFlowActionModal({
  purchase,
  onClose,
  onRun,
  onAddToBuilder,
  onDownload,
  onViewDetails,
}: PremiumFlowActionModalProps) {
  const [downloading, setDownloading] = useState(false)

  const handleRun = () => {
    if (purchase.workflow_data) {
      onRun(purchase.workflow_data)
    }
    onClose()
  }

  const handleAddToBuilder = () => {
    if (purchase.workflow_data) {
      onAddToBuilder(purchase.workflow_data)
    }
    onClose()
  }

  const handleDownload = async () => {
    if (!purchase.workflow_id) return
    setDownloading(true)

    const result = await onDownload(purchase.workflow_id)
    setDownloading(false)

    if (result.workflow && result.filename) {
      // Trigger browser download
      const blob = new Blob([JSON.stringify(result.workflow, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const actions = [
    {
      label: 'Run',
      desc: 'Execute this workflow',
      icon: Play,
      color: '#00ff88',
      bg: 'rgba(0,255,136,0.1)',
      onClick: handleRun,
      disabled: !purchase.workflow_data,
    },
    {
      label: 'Add to Builder',
      desc: 'Import to visual canvas',
      icon: Blocks,
      color: '#00d4ff',
      bg: 'rgba(0,212,255,0.1)',
      onClick: handleAddToBuilder,
      disabled: !purchase.workflow_data,
    },
    {
      label: 'Download',
      desc: 'Save as .0n file',
      icon: downloading ? Loader2 : Download,
      color: 'var(--text-secondary)',
      bg: 'rgba(255,255,255,0.04)',
      onClick: handleDownload,
      disabled: !purchase.workflow_id || downloading,
      spin: downloading,
    },
    {
      label: 'View Details',
      desc: 'Full listing info',
      icon: Info,
      color: 'var(--text-muted)',
      bg: 'rgba(255,255,255,0.04)',
      onClick: onViewDetails,
      disabled: false,
    },
  ]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'console-fade-in 0.15s ease',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          animation: 'console-scale-in 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {purchase.workflow_name || purchase.listing?.title || 'Premium Workflow'}
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Choose an action
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-2 gap-3 p-5">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all cursor-pointer border-none text-center"
                style={{
                  backgroundColor: action.bg,
                  border: '1px solid var(--border)',
                  opacity: action.disabled ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!action.disabled) {
                    e.currentTarget.style.borderColor = action.color
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Icon
                  size={20}
                  style={{ color: action.color }}
                  className={action.spin ? 'animate-spin' : ''}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {action.label}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {action.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
