'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Download, RefreshCw, Zap } from 'lucide-react'
import { GOOGLE_SERVICES_UNLOCKED } from '@/lib/google-scopes'

interface GoogleStatus {
  connected: boolean
  expired?: boolean
  services?: string[]
  serviceCount?: number
  scopes?: string[]
}

export function GoogleConnectBanner() {
  const [status, setStatus] = useState<GoogleStatus>({ connected: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/console/google-status')
      .then(r => r.json())
      .then(data => setStatus(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  const connectedServiceKeys = new Set(status.services || [])

  if (status.connected && !status.expired) {
    return (
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(126,217,87,0.1), rgba(66,133,244,0.08))',
          border: '1px solid rgba(126,217,87,0.25)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(66,133,244,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
                Google Connected
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {status.serviceCount || 0} services unlocked via OAuth
              </div>
            </div>
          </div>
          <a
            href="/api/console/google-export"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium no-underline transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <Download size={12} />
            Download .0n for CLI
          </a>
        </div>

        {/* Connected services grid */}
        <div className="flex flex-wrap gap-1.5">
          {GOOGLE_SERVICES_UNLOCKED.map(svc => {
            const isActive = connectedServiceKeys.has(svc.key)
            return (
              <span
                key={svc.key}
                className="text-[11px] font-medium px-2 py-1 rounded-full flex items-center gap-1"
                style={{
                  background: isActive ? 'rgba(126,217,87,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? 'rgba(126,217,87,0.25)' : 'var(--border)'}`,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
                {svc.name}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  // Expired token state
  if (status.connected && status.expired) {
    return (
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(66,133,244,0.06))',
          border: '1px solid rgba(239,68,68,0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RefreshCw size={18} style={{ color: '#ef4444' }} />
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Google Token Expired</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reconnect to restore {status.serviceCount} services</div>
            </div>
          </div>
          <a
            href="/api/auth/google-connect"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold no-underline transition-all"
            style={{ background: '#4285F4', color: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3367d6' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#4285F4' }}
          >
            <RefreshCw size={14} />
            Reconnect Google
          </a>
        </div>
      </div>
    )
  }

  // Not connected — main CTA
  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(66,133,244,0.08), rgba(126,217,87,0.06), rgba(66,133,244,0.04))',
        border: '1px solid rgba(66,133,244,0.2)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(66,133,244,0.12)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Connect Google — unlock {GOOGLE_SERVICES_UNLOCKED.length} services in one click
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              One consent screen. Every Google service. Instant.
            </div>
          </div>
        </div>

        <a
          href="/api/auth/google-connect"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold no-underline transition-all whitespace-nowrap"
          style={{ background: '#4285F4', color: '#fff' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#3367d6' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#4285F4' }}
        >
          <Zap size={14} />
          Connect Google Account
        </a>
      </div>

      {/* Service preview grid */}
      <div className="flex flex-wrap gap-1.5">
        {GOOGLE_SERVICES_UNLOCKED.map(svc => (
          <span
            key={svc.key}
            className="text-[11px] font-medium px-2 py-1 rounded-full"
            style={{
              background: 'rgba(66,133,244,0.08)',
              border: '1px solid rgba(66,133,244,0.15)',
              color: 'rgba(66,133,244,0.7)',
            }}
          >
            {svc.name}
          </span>
        ))}
      </div>
    </div>
  )
}
