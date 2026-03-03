'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
} from 'lucide-react'
import { StatusDot } from './StatusDot'
import { SVC, CATEGORY_LABELS } from '@/lib/console/services'

const GOOGLE_OAUTH_SERVICES = new Set([
  'gmail', 'google_calendar', 'google_sheets', 'google_drive', 'google_docs',
  'google_slides', 'google_forms', 'google_tasks', 'ga4', 'google_ads',
  'google_business', 'youtube', 'search_console', 'merchant_center', 'tag_manager',
])

interface VaultDetailProps {
  service: string
  onBack: () => void
  vault: Record<string, Record<string, string>>
  onSave: (service: string, key: string, value: string) => void
}

export function VaultDetail({ service, onBack, vault, onSave }: VaultDetailProps) {
  const svcDef = SVC[service]

  // Build fields from the SVC definition or fallback
  const fields = svcDef
    ? svcDef.f.map(f => ({
        key: f.k,
        label: f.lb,
        placeholder: f.ph,
        secret: !!f.s,
        help: f.h,
        link: f.lk,
        linkLabel: f.ll,
      }))
    : [{
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your API key...',
        secret: true,
        help: `Your ${service} API key.`,
        link: '#',
        linkLabel: 'Find API Key',
      }]

  const label = svcDef?.l || service.charAt(0).toUpperCase() + service.slice(1)
  const desc = svcDef?.d || `Connect your ${service} account.`
  const color = svcDef?.c || '#8888a0'
  const caps = svcDef?.cap || []
  const cat = svcDef?.cat

  const [show, setShow] = useState<Record<string, boolean>>({})
  const [localValues, setLocalValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const f of fields) {
      initial[f.key] = vault[service]?.[f.key] || ''
    }
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const accentColor = color === '#ffffff' || color === '#e2e2e2' || color === '#000000' ? '#60a5fa' : color
  const isConnected = fields.some((f) => vault[service]?.[f.key])
  const isGoogleOAuth = GOOGLE_OAUTH_SERVICES.has(service)
  const hasOAuthToken = vault[service]?.refresh_token && vault[service]?.client_id

  const handleSave = () => {
    setSaving(true)
    setSaveResult(null)
    try {
      for (const f of fields) {
        if (localValues[f.key]) {
          onSave(service, f.key, localValues[f.key])
        }
      }
      setSaveResult('success')
    } catch {
      setSaveResult('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveResult(null), 3000)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      await new Promise((r) => setTimeout(r, 1200))
      const hasKeys = fields.some((f) => localValues[f.key])
      setTestResult(hasKeys ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 4000)
    }
  }

  return (
    <div
      className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-5"
      style={{ animation: 'console-slide-in 0.3s ease' }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm transition-colors cursor-pointer bg-transparent border-none p-0"
        style={{ color: 'var(--accent-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-secondary)')}
      >
        <ArrowLeft size={14} />
        All services
      </button>

      {/* Service header */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold"
          style={{
            backgroundColor: accentColor + '18',
            color: accentColor,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {label.slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div className="text-sm flex items-center gap-2 mt-0.5">
            <StatusDot status={isConnected ? 'online' : 'offline'} />
            <span style={{ color: isConnected ? 'var(--accent)' : '#ef4444' }}>
              {isConnected ? 'Connected' : 'Not connected'}
            </span>
            {cat && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>&middot;</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {CATEGORY_LABELS[cat]}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Google OAuth badge */}
      {isGoogleOAuth && hasOAuthToken && (
        <div
          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
          style={{
            background: 'rgba(66,133,244,0.08)',
            border: '1px solid rgba(66,133,244,0.2)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <div>
            <span className="text-xs font-semibold" style={{ color: '#4285f4' }}>Connected via Google OAuth</span>
            <span className="text-xs ml-1.5" style={{ color: 'var(--text-muted)' }}>Credentials auto-populated</span>
          </div>
        </div>
      )}

      {isGoogleOAuth && !hasOAuthToken && (
        <a
          href="/api/auth/google-connect"
          className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 no-underline transition-all"
          style={{
            background: 'rgba(66,133,244,0.06)',
            border: '1px solid rgba(66,133,244,0.15)',
            color: '#4285f4',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4285f4' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(66,133,244,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-xs font-medium">Connect Google to auto-fill credentials</span>
        </a>
      )}

      {/* Description */}
      <div
        className="glow-box rounded-xl p-4 text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {desc}
      </div>

      {/* Capabilities */}
      {caps.length > 0 && (
        <div>
          <h4
            className="text-xs font-semibold tracking-wider uppercase mb-2.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Capabilities ({caps.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {caps.map((c) => (
              <span
                key={c}
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: accentColor + '14',
                  border: `1px solid ${accentColor}25`,
                  color: accentColor,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Credential fields */}
      <div>
        <h4
          className="text-xs font-semibold tracking-wider uppercase mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Credentials ({fields.length})
        </h4>

        <div className="space-y-3">
          {fields.map((f) => (
            <div
              key={f.key}
              className="glow-box rounded-xl p-4 transition-all duration-200"
              style={{
                borderColor: localValues[f.key] ? accentColor + '30' : undefined,
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {f.label}
                </label>
                {f.secret && (
                  <button
                    onClick={() => setShow((p) => ({ ...p, [f.key]: !p[f.key] }))}
                    className="flex items-center gap-1 text-xs transition-colors cursor-pointer bg-transparent border-none"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {show[f.key] ? <EyeOff size={12} /> : <Eye size={12} />}
                    {show[f.key] ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
              <input
                type={f.secret && !show[f.key] ? 'password' : 'text'}
                value={localValues[f.key]}
                onChange={(e) =>
                  setLocalValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {f.help}
              </p>
              {f.link && f.link !== '#' && (
                <a
                  href={f.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium no-underline mt-1.5"
                  style={{ color: accentColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  <ExternalLink size={10} />
                  {f.linkLabel}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            color: 'var(--bg-primary)',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveResult === 'success' ? (
            <CheckCircle2 size={16} />
          ) : saveResult === 'error' ? (
            <XCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving
            ? 'Saving...'
            : saveResult === 'success'
              ? 'Saved'
              : saveResult === 'error'
                ? 'Error'
                : 'Save Credentials'}
        </button>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            opacity: testing ? 0.6 : 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {testing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : testResult === 'success' ? (
            <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
          ) : testResult === 'error' ? (
            <XCircle size={16} className="text-red-500" />
          ) : null}
          {testing
            ? 'Testing...'
            : testResult === 'success'
              ? 'Connected'
              : testResult === 'error'
                ? 'Failed'
                : 'Test Connection'}
        </button>
      </div>

      <style>{`
        @keyframes console-slide-in {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
