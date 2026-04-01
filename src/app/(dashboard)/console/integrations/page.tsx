'use client'

import { useState, useCallback } from 'react'
import { STATS_DISPLAY } from '@/data/stats'

/* ─── Service definitions ─── */
interface ServiceDef {
  id: string
  name: string
  color: string
  icon: string
  pattern: string
  placeholder: string
  category: string
}

const SERVICES: ServiceDef[] = [
  { id: 'anthropic', name: 'Anthropic', color: '#D4A574', icon: 'An', pattern: 'sk-ant-...', placeholder: 'sk-ant-api03-...', category: 'AI' },
  { id: 'openai', name: 'OpenAI', color: '#10a37f', icon: 'OA', pattern: 'sk-...', placeholder: 'sk-proj-...', category: 'AI' },
  { id: 'groq', name: 'Groq', color: '#F55036', icon: 'Gq', pattern: 'gsk_...', placeholder: 'gsk_...', category: 'AI' },
  { id: 'stripe', name: 'Stripe', color: '#635BFF', icon: 'St', pattern: 'rk_live_...', placeholder: 'rk_live_...', category: 'Payments' },
  { id: 'crm', name: 'CRM (PIT)', color: '#6EE05A', icon: '0n', pattern: 'pit-...', placeholder: 'pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', category: 'CRM' },
  { id: 'sendgrid', name: 'SendGrid', color: '#1A82E2', icon: 'SG', pattern: 'SG.', placeholder: 'SG.xxxxxxxx...', category: 'Email' },
  { id: 'resend', name: 'Resend', color: '#000000', icon: 'Re', pattern: 're_...', placeholder: 're_xxxxxxxx...', category: 'Email' },
  { id: 'github', name: 'GitHub', color: '#333333', icon: 'GH', pattern: 'ghp_...', placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'Dev' },
  { id: 'supabase', name: 'Supabase', color: '#3ECF8E', icon: 'Sb', pattern: 'eyJ...', placeholder: 'eyJhbGciOi...', category: 'Database' },
  { id: 'google', name: 'Google AI', color: '#4285F4', icon: 'Go', pattern: 'AIza...', placeholder: 'AIzaSy...', category: 'AI' },
  { id: 'twilio', name: 'Twilio', color: '#F22F46', icon: 'Tw', pattern: 'AC...', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', category: 'Communication' },
  { id: 'slack', name: 'Slack', color: '#4A154B', icon: 'Sl', pattern: 'xoxb-...', placeholder: 'xoxb-xxxx-xxxx-xxxx', category: 'Communication' },
  { id: 'meta_pixel', name: 'Meta Pixel', color: '#1877F2', icon: 'Px', pattern: 'Numeric ID', placeholder: '1234567890123456', category: 'Analytics' },
  { id: 'ga4', name: 'GA4 Measurement ID', color: '#E37400', icon: 'GA', pattern: 'G-...', placeholder: 'G-XXXXXXXXXX', category: 'Analytics' },
  { id: 'google_ads', name: 'Google Ads', color: '#4285F4', icon: 'Ad', pattern: 'AW-...', placeholder: 'AW-123456789', category: 'Analytics' },
]

interface ServiceState {
  value: string
  status: 'disconnected' | 'connecting' | 'connected' | 'testing' | 'error'
  error?: string
  visible: boolean
}

type VaultState = Record<string, ServiceState>

function initialState(): VaultState {
  const state: VaultState = {}
  for (const svc of SERVICES) {
    state[svc.id] = { value: '', status: 'disconnected', visible: false, error: undefined }
  }
  return state
}

/* ─── Component ─── */
export default function IntegrationsPage() {
  const [vault, setVault] = useState<VaultState>(initialState)
  const [search, setSearch] = useState('')

  const connectedCount = Object.values(vault).filter(v => v.status === 'connected').length
  const totalCount = SERVICES.length
  const completionPct = Math.round((connectedCount / totalCount) * 100)

  const updateService = useCallback((id: string, patch: Partial<ServiceState>) => {
    setVault(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  async function handleConnect(svc: ServiceDef) {
    const current = vault[svc.id]
    if (!current.value.trim()) {
      updateService(svc.id, { error: 'API key is required', status: 'error' })
      return
    }

    updateService(svc.id, { status: 'connecting', error: undefined })

    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: svc.id, key: current.value.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Connection failed' }))
        updateService(svc.id, { status: 'error', error: data.error || 'Connection failed' })
        return
      }

      updateService(svc.id, { status: 'connected', error: undefined })
    } catch {
      updateService(svc.id, { status: 'error', error: 'Network error. Try again.' })
    }
  }

  async function handleTest(svc: ServiceDef) {
    updateService(svc.id, { status: 'testing', error: undefined })

    try {
      const res = await fetch('/api/vault/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: svc.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Test failed' }))
        updateService(svc.id, { status: 'error', error: data.error || 'Test failed' })
        return
      }

      updateService(svc.id, { status: 'connected', error: undefined })
    } catch {
      updateService(svc.id, { status: 'error', error: 'Test request failed' })
    }
  }

  const filteredServices = SERVICES.filter(svc =>
    svc.name.toLowerCase().includes(search.toLowerCase()) ||
    svc.category.toLowerCase().includes(search.toLowerCase())
  )

  // Group by category
  const categories = Array.from(new Set(filteredServices.map(s => s.category)))

  return (
    <div style={{ minHeight: '100%', padding: '1.5rem', background: 'var(--jp-bg)' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--jp-text)',
          margin: '0 0 0.375rem',
        }}>
          Connected Services
        </h1>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--jp-text-secondary)',
          margin: 0,
        }}>
          {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services. Add your API keys to unlock integrations.
        </p>
      </div>

      {/* ── Vault Completion Bar ── */}
      <div style={{
        background: 'var(--jp-surface)',
        borderRadius: 'var(--jp-radius)',
        padding: '1.25rem',
        border: '1px solid var(--jp-border)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-text)' }}>
            Vault Completion: {completionPct}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-secondary)' }}>
            {connectedCount} / {totalCount} connected
          </span>
        </div>
        <div style={{
          height: '8px',
          borderRadius: '4px',
          background: 'var(--jp-bg)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${completionPct}%`,
            borderRadius: '4px',
            background: completionPct === 100
              ? 'var(--jp-green)'
              : `linear-gradient(90deg, var(--jp-green), var(--jp-cyan))`,
            transition: 'width 0.4s ease',
            boxShadow: connectedCount > 0 ? '0 0 8px var(--jp-green-glow)' : 'none',
          }} />
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '360px',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--jp-radius-sm)',
            border: '1px solid var(--jp-border)',
            background: 'var(--jp-bg-input)',
            color: 'var(--jp-text)',
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--jp-border-hi)'}
          onBlur={e => e.target.style.borderColor = 'var(--jp-border)'}
        />
      </div>

      {/* ── Service Cards by Category ── */}
      {categories.map(cat => {
        const services = filteredServices.filter(s => s.category === cat)
        return (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--jp-text-muted)',
              marginBottom: '0.75rem',
            }}>
              {cat}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '0.75rem',
            }}>
              {services.map(svc => {
                const state = vault[svc.id]
                const isConnected = state.status === 'connected'
                const isLoading = state.status === 'connecting' || state.status === 'testing'

                return (
                  <div
                    key={svc.id}
                    style={{
                      background: 'var(--jp-surface)',
                      borderRadius: 'var(--jp-radius)',
                      padding: '1rem 1.25rem',
                      border: `1px solid ${isConnected ? 'rgba(110,224,90,0.3)' : 'var(--jp-border)'}`,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {/* Top row: icon + name + status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: `${svc.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: svc.color,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        flexShrink: 0,
                      }}>
                        {svc.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-text)' }}>
                          {svc.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {svc.pattern}
                        </div>
                      </div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isConnected ? 'var(--jp-green)' : 'var(--jp-text-muted)',
                        boxShadow: isConnected ? '0 0 8px rgba(110,224,90,0.4)' : 'none',
                        flexShrink: 0,
                      }} />
                    </div>

                    {/* Input row */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type={state.visible ? 'text' : 'password'}
                          placeholder={svc.placeholder}
                          value={state.value}
                          onChange={e => updateService(svc.id, { value: e.target.value, error: undefined, status: 'disconnected' })}
                          disabled={isLoading}
                          style={{
                            width: '100%',
                            padding: '0.5rem 2rem 0.5rem 0.625rem',
                            borderRadius: 'var(--jp-radius-xs)',
                            border: `1px solid ${state.error ? 'var(--jp-red)' : 'var(--jp-border)'}`,
                            background: 'var(--jp-bg-input)',
                            color: 'var(--jp-text)',
                            fontSize: '0.75rem',
                            fontFamily: "'JetBrains Mono', monospace",
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            opacity: isLoading ? 0.6 : 1,
                          }}
                          onFocus={e => { if (!state.error) e.target.style.borderColor = 'var(--jp-border-hi)' }}
                          onBlur={e => { if (!state.error) e.target.style.borderColor = 'var(--jp-border)' }}
                        />
                        {/* Toggle visibility */}
                        <button
                          onClick={() => updateService(svc.id, { visible: !state.visible })}
                          style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--jp-text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            fontSize: '0.6875rem',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                          title={state.visible ? 'Hide' : 'Show'}
                        >
                          {state.visible ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>

                      {/* Connect button */}
                      <button
                        onClick={() => handleConnect(svc)}
                        disabled={isLoading || !state.value.trim()}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--jp-radius-xs)',
                          border: 'none',
                          background: isConnected ? 'rgba(110,224,90,0.15)' : 'var(--jp-bg-elevated)',
                          color: isConnected ? 'var(--jp-green)' : 'var(--jp-text)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: isLoading || !state.value.trim() ? 'not-allowed' : 'pointer',
                          opacity: isLoading || !state.value.trim() ? 0.5 : 1,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                      >
                        {state.status === 'connecting' ? 'Saving...' : isConnected ? 'Saved' : 'Connect'}
                      </button>

                      {/* Test button */}
                      {isConnected && (
                        <button
                          onClick={() => handleTest(svc)}
                          disabled={state.status === 'testing'}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--jp-radius-xs)',
                            border: '1px solid var(--jp-border)',
                            background: 'transparent',
                            color: 'var(--jp-cyan)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: state.status === 'testing' ? 'not-allowed' : 'pointer',
                            opacity: state.status === 'testing' ? 0.5 : 1,
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s',
                          }}
                        >
                          {state.status === 'testing' ? 'Testing...' : 'Test'}
                        </button>
                      )}
                    </div>

                    {/* Error message */}
                    {state.error && (
                      <div style={{
                        marginTop: '0.375rem',
                        fontSize: '0.6875rem',
                        color: 'var(--jp-red)',
                      }}>
                        {state.error}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* ── Empty state ── */}
      {filteredServices.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--jp-text-muted)',
          fontSize: '0.875rem',
        }}>
          No services match &ldquo;{search}&rdquo;
        </div>
      )}
    </div>
  )
}
