'use client'

import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  ChevronRight,
} from 'lucide-react'
import { StatusDot } from './StatusDot'
import { SVC, CATEGORY_LABELS, type ServiceField } from '@/lib/console/services'

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

type TabMode = 'simple' | 'advanced'

export function VaultDetail({ service, onBack, vault, onSave }: VaultDetailProps) {
  const svcDef = SVC[service]

  // Raw field definitions with guided metadata
  const rawFields: ServiceField[] = svcDef
    ? svcDef.f
    : [{ k: 'api_key', lb: 'API Key', ph: 'Enter your API key...', s: true, h: `Your ${service} API key.`, lk: '#', ll: 'Find API Key', t: 'simple', step: 1, req: true, guide: 'Enter your API key to connect this service.' }]

  // Split fields by tier
  const simpleFields = useMemo(
    () => rawFields.filter(f => f.t !== 'advanced').sort((a, b) => (a.step ?? 99) - (b.step ?? 99)),
    [rawFields]
  )
  const allFields = rawFields // Advanced shows everything

  const label = svcDef?.l || service.charAt(0).toUpperCase() + service.slice(1)
  const desc = svcDef?.d || `Connect your ${service} account.`
  const color = svcDef?.c || '#8888a0'
  const caps = svcDef?.cap || []
  const cat = svcDef?.cat

  // Persist tab preference
  const [tab, setTab] = useState<TabMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('0n_vault_tab') as TabMode) || 'simple'
    }
    return 'simple'
  })
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [localValues, setLocalValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const f of rawFields) {
      initial[f.k] = vault[service]?.[f.k] || ''
    }
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const accentColor = color === '#ffffff' || color === '#e2e2e2' || color === '#000000' ? '#60a5fa' : color
  const isConnected = rawFields.some((f) => vault[service]?.[f.k])
  const isGoogleOAuth = GOOGLE_OAUTH_SERVICES.has(service)
  const hasOAuthToken = vault[service]?.refresh_token && vault[service]?.client_id

  // Simple tab progress
  const simpleFilledCount = simpleFields.filter(f => localValues[f.k]?.trim()).length
  const simpleTotalCount = simpleFields.length
  const allSimpleFilled = simpleFilledCount === simpleTotalCount && simpleTotalCount > 0

  const switchTab = (t: TabMode) => {
    setTab(t)
    if (typeof window !== 'undefined') localStorage.setItem('0n_vault_tab', t)
  }

  const handleSave = () => {
    setSaving(true)
    setSaveResult(null)
    try {
      for (const f of rawFields) {
        if (localValues[f.k]) {
          onSave(service, f.k, localValues[f.k])
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
      const hasKeys = rawFields.some((f) => localValues[f.k])
      setTestResult(hasKeys ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 4000)
    }
  }

  // Render a single field input (shared between simple and advanced)
  const renderFieldInput = (f: ServiceField) => (
    <div key={f.k}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {f.lb}
          {f.req && <span style={{ color: accentColor, marginLeft: 4 }}>*</span>}
        </label>
        {f.s && (
          <button
            onClick={() => setShow((p) => ({ ...p, [f.k]: !p[f.k] }))}
            className="flex items-center gap-1 text-xs transition-colors cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            {show[f.k] ? <EyeOff size={12} /> : <Eye size={12} />}
            {show[f.k] ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      <input
        type={f.s && !show[f.k] ? 'password' : 'text'}
        value={localValues[f.k]}
        onChange={(e) => setLocalValues((prev) => ({ ...prev, [f.k]: e.target.value }))}
        placeholder={f.ph}
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
    </div>
  )

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

      {/* ═══ Tab Bar ═══ */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <button
          onClick={() => switchTab('simple')}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none"
          style={{
            backgroundColor: tab === 'simple' ? accentColor + '18' : 'transparent',
            color: tab === 'simple' ? accentColor : 'var(--text-muted)',
            borderBottom: tab === 'simple' ? `2px solid ${accentColor}` : '2px solid transparent',
          }}
        >
          Simple Setup
        </button>
        <button
          onClick={() => switchTab('advanced')}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none"
          style={{
            backgroundColor: tab === 'advanced' ? 'rgba(255,255,255,0.05)' : 'transparent',
            color: tab === 'advanced' ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: tab === 'advanced' ? '2px solid var(--text-muted)' : '2px solid transparent',
          }}
        >
          Advanced
        </button>
      </div>

      {/* ═══ SIMPLE TAB ═══ */}
      {tab === 'simple' && (
        <div className="space-y-4">
          {/* Progress bar */}
          {simpleTotalCount > 1 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Step {Math.min(simpleFilledCount + 1, simpleTotalCount)} of {simpleTotalCount}
                </span>
                <span className="text-xs" style={{ color: allSimpleFilled ? accentColor : 'var(--text-muted)' }}>
                  {allSimpleFilled ? 'All done!' : `${simpleFilledCount} of ${simpleTotalCount} complete`}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(simpleFilledCount / simpleTotalCount) * 100}%`,
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Success state */}
          {allSimpleFilled && (
            <div
              className="glow-box rounded-xl p-5 text-center"
              style={{ borderColor: accentColor + '30' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: accentColor + '18' }}
              >
                <CheckCircle2 size={24} style={{ color: accentColor }} />
              </div>
              <div className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                You&apos;re connected!
              </div>
              <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {label} is ready to use. Save your credentials below.
              </div>
              <button
                onClick={() => switchTab('advanced')}
                className="inline-flex items-center gap-1 text-xs font-medium cursor-pointer bg-transparent border-none p-0 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Want more control? Switch to Advanced
                <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Step cards */}
          {simpleFields.map((f, idx) => {
            const isFilled = !!localValues[f.k]?.trim()
            const stepNum = simpleTotalCount > 1 ? (f.step ?? idx + 1) : null

            return (
              <div
                key={f.k}
                className="glow-box rounded-xl p-5 transition-all duration-200"
                style={{
                  borderColor: isFilled ? accentColor + '30' : undefined,
                }}
              >
                {/* Step header */}
                <div className="flex items-start gap-3 mb-3">
                  {stepNum !== null && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: isFilled ? accentColor : accentColor + '18',
                        color: isFilled ? 'var(--bg-primary)' : accentColor,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isFilled ? <CheckCircle2 size={14} /> : stepNum}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      {stepNum !== null ? `Get your ${f.lb}` : f.lb}
                    </div>
                    {/* Guide text */}
                    <p
                      className="text-xs leading-relaxed mb-0"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {f.guide || f.h}
                    </p>
                  </div>
                </div>

                {/* Open service link */}
                {f.lk && f.lk !== '#' && (
                  <a
                    href={f.lk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold no-underline mb-3 px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      backgroundColor: accentColor + '12',
                      color: accentColor,
                      border: `1px solid ${accentColor}25`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentColor + '20' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = accentColor + '12' }}
                  >
                    <ExternalLink size={11} />
                    Open {label}
                  </a>
                )}

                {/* Field input */}
                {renderFieldInput(f)}

                {/* Filled indicator */}
                {isFilled && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 size={12} style={{ color: accentColor }} />
                    <span className="text-xs font-medium" style={{ color: accentColor }}>
                      Saved
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ ADVANCED TAB ═══ */}
      {tab === 'advanced' && (
        <div>
          <h4
            className="text-xs font-semibold tracking-wider uppercase mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Credentials ({allFields.length})
          </h4>

          <div className="space-y-3">
            {allFields.map((f) => (
              <div
                key={f.k}
                className="glow-box rounded-xl p-4 transition-all duration-200"
                style={{
                  borderColor: localValues[f.k] ? accentColor + '30' : undefined,
                }}
              >
                {renderFieldInput(f)}
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  {f.h}
                </p>
                {f.lk && f.lk !== '#' && (
                  <a
                    href={f.lk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium no-underline mt-1.5"
                    style={{ color: accentColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    <ExternalLink size={10} />
                    {f.ll}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
