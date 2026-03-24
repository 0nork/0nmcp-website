'use client'

/**
 * ConsoleToast — Notification toast system
 *
 * APEX-style floating notifications that slide in from top-right.
 * Supports success, error, info, and warning types.
 * Auto-dismiss with progress bar.
 *
 * Usage:
 *   import { useToast, ToastProvider } from './ConsoleToast'
 *   const { toast } = useToast()
 *   toast({ title: 'Connected!', description: 'Stripe is now active', type: 'success' })
 */

import { useState, useCallback, createContext, useContext, useRef, useEffect, type ReactNode, type ReactElement } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number // ms, default 4000
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

// ─── Type-specific styles ───────────────────────────────────────────────────

const TYPE_STYLES: Record<Toast['type'], { accent: string; bg: string; border: string; icon: ReactElement }> = {
  success: {
    accent: '#6EE05A',
    bg: 'rgba(110, 224, 90, 0.06)',
    border: 'rgba(110, 224, 90, 0.2)',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  error: {
    accent: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.06)',
    border: 'rgba(239, 68, 68, 0.2)',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  info: {
    accent: '#00d4ff',
    bg: 'rgba(0, 212, 255, 0.06)',
    border: 'rgba(0, 212, 255, 0.2)',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  warning: {
    accent: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.06)',
    border: 'rgba(245, 158, 11, 0.2)',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
}

// ─── Single toast item ──────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const style = TYPE_STYLES[toast.type]
  const duration = toast.duration ?? 4000
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)

    timerRef.current = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duration, onDismiss, toast.id])

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: 'rgba(12, 14, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${style.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        maxWidth: 360,
        width: '100%',
        transform: exiting ? 'translateX(120%)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        animation: 'toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: style.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        {style.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#e8eaed',
          lineHeight: 1.3,
        }}>
          {toast.title}
        </div>
        {toast.description && (
          <div style={{
            fontSize: 12, color: '#7A8290', marginTop: 3,
            lineHeight: 1.4,
          }}>
            {toast.description}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          width: 20, height: 20, borderRadius: 5,
          border: 'none', background: 'transparent',
          cursor: 'pointer', color: '#5f6672',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, flexShrink: 0, transition: 'color 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#7A8290' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5f6672' }}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
        </svg>
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'rgba(255,255,255,0.03)',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: style.accent,
          opacity: 0.5,
          transition: 'width 0.1s linear',
        }} />
      </div>
    </div>
  )
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { ...t, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
