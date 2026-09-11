'use client'

import { useState, useEffect } from 'react'

interface Provider {
  id: string
  provider_type: string
  status: string
  metadata: Record<string, unknown>
  created_at: string
}

const PROVIDER_CONFIG = [
  { type: 'sendgrid', name: 'Twilio SendGrid', desc: 'Primary transactional email sending', color: '#00B2E3', field: 'API Key' },
  { type: 'ses', name: 'Amazon SES', desc: 'Fallback sender, high volume', color: '#FF9900', field: 'Access Key + Secret' },
  { type: 'smartlead', name: 'Smartlead', desc: 'Sequence execution + warmup (primary)', color: '#6366f1', field: 'API Key' },
  { type: 'instantly', name: 'Instantly', desc: 'Warmup pool (secondary)', color: '#f97316', field: 'API Key' },
  { type: 'google_workspace', name: 'Google Workspace', desc: 'Mailbox provisioning', color: '#4285F4', field: 'Service Account JSON' },
  { type: 'microsoft_365', name: 'Microsoft 365', desc: 'Mailbox provisioning', color: '#00A4EF', field: 'Client ID + Secret' },
  { type: 'godaddy', name: 'GoDaddy', desc: 'DNS auto-configuration (SPF/DKIM/DMARC)', color: '#1BDBDB', field: 'API Key + Secret' },
]

export default function SettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/mail?action=providers')
      .then(r => r.json())
      .then(d => setProviders(d.providers || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isConnected = (type: string) => providers.some(p => p.provider_type === type)
  const getProvider = (type: string) => providers.find(p => p.provider_type === type)

  const connectProvider = async (type: string) => {
    if (!apiKey.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_provider',
          provider_type: type,
          vault_key_ref: `vault_${type}_${Date.now()}`,
          metadata: { connected_at: new Date().toISOString() },
        }),
      })
      const data = await res.json()
      if (data.provider) {
        setProviders(prev => [...prev, data.provider])
        setConnecting(null)
        setApiKey('')
      }
    } catch { /* empty */ }
    setSaving(false)
  }

  return (
    <div className="jp-content" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="jp-page-header">
        <h1 className="jp-page-title">0nMail Settings</h1>
        <p className="jp-page-subtitle">Provider connections, warmup configuration, and sending preferences</p>
      </div>

      {/* Provider Connections */}
      <div className="jp-card" style={{ marginBottom: 24 }}>
        <div className="jp-card-header">
          <h4>Provider Connections</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>
            {providers.length} of {PROVIDER_CONFIG.length} connected
          </span>
        </div>
        <div>
          {PROVIDER_CONFIG.map((cfg, i) => {
            const connected = isConnected(cfg.type)
            const provider = getProvider(cfg.type)
            return (
              <div
                key={cfg.type}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: i < PROVIDER_CONFIG.length - 1 ? '1px solid var(--jp-border)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: cfg.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, color: cfg.color,
                  }}>
                    {cfg.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-text)' }}>{cfg.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>{cfg.desc}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {connected ? (
                    <>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        background: provider?.status === 'active' ? 'var(--jp-green-glow)' : 'rgba(248, 113, 113, 0.12)',
                        color: provider?.status === 'active' ? 'var(--jp-green)' : 'var(--jp-red)',
                        textTransform: 'uppercase',
                      }}>
                        {provider?.status || 'connected'}
                      </span>
                      <button className="jp-btn jp-btn-outline" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                        Reconnect
                      </button>
                    </>
                  ) : connecting === cfg.type ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        className="jp-search-input"
                        style={{ width: 220, paddingLeft: 14, fontSize: '0.8125rem' }}
                        placeholder={cfg.field}
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        type="password"
                      />
                      <button
                        className="jp-btn jp-btn-primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => connectProvider(cfg.type)}
                        disabled={saving}
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        className="jp-btn jp-btn-outline"
                        style={{ fontSize: '0.75rem', padding: '6px 8px' }}
                        onClick={() => { setConnecting(null); setApiKey('') }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="jp-btn jp-btn-outline"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => { setConnecting(cfg.type); setApiKey('') }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Warmup Configuration */}
      <div className="jp-card" style={{ marginBottom: 24 }}>
        <div className="jp-card-header">
          <h4>Warmup Configuration</h4>
        </div>
        <div className="jp-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Daily Ramp Schedule</label>
              <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)', lineHeight: 1.8 }}>
                <div>Day 1-7: <span style={{ color: 'var(--jp-text)' }}>3-5 emails/day</span> (gentle start)</div>
                <div>Day 8-14: <span style={{ color: 'var(--jp-text)' }}>10-15 emails/day</span> (building reputation)</div>
                <div>Day 15-21: <span style={{ color: 'var(--jp-text)' }}>20-30 emails/day</span> (mid warmup)</div>
                <div>Day 22-28: <span style={{ color: 'var(--jp-text)' }}>35-45 emails/day</span> (near target)</div>
                <div>Day 29-30: <span style={{ color: 'var(--jp-green)' }}>50 emails/day</span> (warmup complete)</div>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Max Send Limit</label>
              <input
                className="jp-search-input"
                style={{ width: '100%', paddingLeft: 14 }}
                type="number"
                defaultValue={50}
                placeholder="50"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginTop: 4 }}>
                Maximum emails per inbox per day after warmup completes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sending Schedule */}
      <div className="jp-card" style={{ marginBottom: 24 }}>
        <div className="jp-card-header">
          <h4>Default Sending Schedule</h4>
        </div>
        <div className="jp-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Timezone</label>
              <select className="jp-search-input" style={{ width: '100%', paddingLeft: 14 }} defaultValue="America/New_York">
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Send Window Start</label>
              <select className="jp-search-input" style={{ width: '100%', paddingLeft: 14 }} defaultValue="8">
                {Array.from({ length: 14 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{h}:00 {h < 12 ? 'AM' : 'PM'}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>Send Window End</label>
              <select className="jp-search-input" style={{ width: '100%', paddingLeft: 14 }} defaultValue="17">
                {Array.from({ length: 14 }, (_, i) => i + 10).map(h => (
                  <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h < 12 ? 'AM' : 'PM'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Unsubscribe */}
      <div className="jp-card">
        <div className="jp-card-header">
          <h4>Unsubscribe Settings</h4>
        </div>
        <div className="jp-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--jp-green)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--jp-text-secondary)' }}>
              Include unsubscribe link in all outbound emails (CAN-SPAM compliant)
            </span>
          </div>
          <div>
            <label style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', display: 'block', marginBottom: 6 }}>
              Custom unsubscribe text
            </label>
            <input
              className="jp-search-input"
              style={{ width: '100%', paddingLeft: 14 }}
              defaultValue="If you'd prefer not to receive these emails, click here to unsubscribe."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
