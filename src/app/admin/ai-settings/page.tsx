'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface BrainConfig {
  id: string
  config_key: string
  config_value: Record<string, unknown>
  description: string | null
  updated_at: string
}

interface UIPStats {
  total_profiles: number
  profiles_with_voice: number
  avg_completeness: number
  total_signals_24h: number
  total_signals_7d: number
  top_signal_types: { type: string; count: number }[]
}

interface ProductSubStats {
  tier: string
  count: number
}

const ADMIN_EMAIL = 'mike@rocketopp.com'

export default function AISettingsPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [configs, setConfigs] = useState<BrainConfig[]>([])
  const [uipStats, setUipStats] = useState<UIPStats | null>(null)
  const [subStats, setSubStats] = useState<ProductSubStats[]>([])
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'brain' | 'signals' | 'profiles' | 'subscriptions'>('brain')

  const supabase = createSupabaseBrowser()

  const checkAuth = useCallback(async () => {
    if (!supabase) { setAuthorized(false); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      setAuthorized(false)
      setLoading(false)
      return
    }
    setAuthorized(true)
    setLoading(false)
  }, [supabase])

  const loadConfigs = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('ai_brain_config')
      .select('*')
      .order('config_key')
    if (data) setConfigs(data)
  }, [supabase])

  const loadStats = useCallback(async () => {
    if (!supabase) return
    // UIP stats
    const { count: totalProfiles } = await supabase
      .from('user_intelligence_profiles')
      .select('*', { count: 'exact', head: true })

    const { count: profilesWithVoice } = await supabase
      .from('user_intelligence_profiles')
      .select('*', { count: 'exact', head: true })
      .neq('voice_profile', '{}')

    // Signal counts
    const now = new Date()
    const day = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { count: signals24h } = await supabase
      .from('ai_behavioral_signals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', day)

    const { count: signals7d } = await supabase
      .from('ai_behavioral_signals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', week)

    setUipStats({
      total_profiles: totalProfiles || 0,
      profiles_with_voice: profilesWithVoice || 0,
      avg_completeness: 0,
      total_signals_24h: signals24h || 0,
      total_signals_7d: signals7d || 0,
      top_signal_types: [],
    })

    // Subscription stats
    const { data: subs } = await supabase
      .from('product_subscriptions')
      .select('tier')
      .eq('status', 'active')

    if (subs) {
      const tierCounts: Record<string, number> = {}
      for (const s of subs) {
        tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1
      }
      setSubStats(Object.entries(tierCounts).map(([tier, count]) => ({ tier, count })))
    }
  }, [supabase])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (authorized) {
      loadConfigs()
      loadStats()
    }
  }, [authorized, loadConfigs, loadStats])

  const handleSave = async (key: string) => {
    if (!supabase) return
    setSaving(true)
    try {
      const parsed = JSON.parse(editValue)
      await supabase
        .from('ai_brain_config')
        .update({ config_value: parsed, updated_at: new Date().toISOString() })
        .eq('config_key', key)
      setEditingKey(null)
      loadConfigs()
    } catch {
      alert('Invalid JSON')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ padding: 32, color: 'var(--text-muted)' }}>
        Verifying access...
      </div>
    )
  }

  if (!authorized) {
    return (
      <div style={{ padding: 32, maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>0n</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          AI Brain — Restricted Access
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
          This section is restricted to the system administrator.
          Sign in with the authorized account to continue.
        </p>
        <a
          href="/login?redirect=/admin/ai-settings"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            borderRadius: 8,
            backgroundColor: 'var(--accent)',
            color: '#0a0a0f',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Sign In
        </a>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    resize: 'vertical' as const,
  }

  const cardStyle: React.CSSProperties = {
    padding: 20,
    borderRadius: 12,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-card)',
    marginBottom: 16,
  }

  const statBox: React.CSSProperties = {
    padding: 16,
    borderRadius: 10,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-card)',
    textAlign: 'center' as const,
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          0n AI Brain
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Master configuration for the autonomous learning engine. Changes here affect every AI interaction across the ecosystem.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', padding: 4, borderRadius: 10 }}>
        {(['brain', 'signals', 'profiles', 'subscriptions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab ? 'var(--accent-glow, rgba(126,217,87,0.15))' : 'transparent',
              color: activeTab === tab ? 'var(--accent, #7ed957)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 500,
              fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'brain' ? 'Brain Config' : tab === 'signals' ? 'Learning Signals' : tab === 'profiles' ? 'User Profiles' : 'Subscriptions'}
          </button>
        ))}
      </div>

      {/* Brain Config Tab */}
      {activeTab === 'brain' && (
        <div>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {configs.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Config Keys</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
                {uipStats?.total_profiles || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Profiles</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#ff6b35', fontFamily: 'var(--font-mono)' }}>
                {uipStats?.total_signals_24h || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signals (24h)</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                {uipStats?.total_signals_7d || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signals (7d)</div>
            </div>
          </div>

          {/* Config entries */}
          {configs.map((config) => (
            <div key={config.config_key} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {config.config_key}
                  </h3>
                  {config.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{config.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingKey === config.config_key ? (
                    <>
                      <button
                        onClick={() => handleSave(config.config_key)}
                        disabled={saving}
                        style={{
                          padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: 'var(--accent)', color: '#0a0a0f', fontSize: 12, fontWeight: 600,
                          opacity: saving ? 0.5 : 1,
                        }}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        style={{
                          padding: '6px 16px', borderRadius: 6, border: '1px solid var(--border)',
                          cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)',
                          fontSize: 12,
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingKey(config.config_key)
                        setEditValue(JSON.stringify(config.config_value, null, 2))
                      }}
                      style={{
                        padding: '6px 16px', borderRadius: 6, border: '1px solid var(--border)',
                        cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)',
                        fontSize: 12,
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {editingKey === config.config_key ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={12}
                  style={inputStyle}
                />
              ) : (
                <pre style={{
                  padding: 14, borderRadius: 8, backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)',
                  overflow: 'auto', maxHeight: 300, fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {JSON.stringify(config.config_value, null, 2)}
                </pre>
              )}

              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
                Last updated: {new Date(config.updated_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Signals Tab */}
      {activeTab === 'signals' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Signal Pipeline Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Last 24 Hours</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {uipStats?.total_signals_24h || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Last 7 Days</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
                  {uipStats?.total_signals_7d || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Active Profiles</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#ff6b35', fontFamily: 'var(--font-mono)' }}>
                  {uipStats?.total_profiles || 0}
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Signal Weight Hierarchy
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              How the AI prioritizes different types of learning signals.
            </p>
            {[
              { label: 'Corrections', weight: 3.0, color: '#ff4444' },
              { label: 'Rejections', weight: 2.0, color: '#ff6b35' },
              { label: 'Edits', weight: 1.5, color: '#f59e0b' },
              { label: 'Approvals', weight: 1.0, color: 'var(--accent)' },
              { label: 'Interactions', weight: 0.5, color: '#00d4ff' },
              { label: 'Page Views', weight: 0.1, color: '#a855f7' },
            ].map((signal) => (
              <div key={signal.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 100 }}>{signal.label}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div style={{
                    width: `${(signal.weight / 3.0) * 100}%`,
                    height: '100%',
                    borderRadius: 4,
                    backgroundColor: signal.color,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: signal.color, width: 32 }}>
                  {signal.weight}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Profiles Tab */}
      {activeTab === 'profiles' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              User Intelligence Profiles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Total Profiles</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {uipStats?.total_profiles || 0}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>With Voice Data</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
                  {uipStats?.profiles_with_voice || 0}
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              How UIP Learning Works
            </h3>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}>
                Every user interaction generates behavioral signals. The AI aggregates these signals into a
                User Intelligence Profile (UIP) that evolves over time.
              </p>
              <p style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--text-primary)' }}>The loop:</strong> User interacts → Signal captured → UIP updated → AI reads UIP → Better response → User interacts...
              </p>
              <p>
                <strong style={{ color: 'var(--text-primary)' }}>The switching cost:</strong> After 30 days, the AI knows the user&apos;s voice, patterns, and preferences.
                That knowledge only exists inside 0n. It cannot be exported.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Product Subscriptions
            </h3>
            {subStats.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active subscriptions yet. The tiers are ready — waiting for first signups.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {subStats.map((s) => (
                  <div key={s.tier} style={statBox}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      {s.count}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.tier}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Tier Pricing
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {[
                { name: 'Free', price: '$0', color: 'var(--text-muted)' },
                { name: 'Creator', price: '$19/mo', color: 'var(--accent)' },
                { name: 'Operator', price: '$49/mo', color: '#ff6b35' },
                { name: 'Agency', price: '$149/mo', color: '#00d4ff' },
                { name: 'Enterprise', price: '$499/mo', color: '#a855f7' },
              ].map((tier) => (
                <div key={tier.name} style={{
                  padding: 14, borderRadius: 10, border: `1px solid ${tier.color}30`,
                  backgroundColor: `${tier.color}08`, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tier.color }}>{tier.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {tier.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* .0n Brain File reference */}
      <div style={{
        marginTop: 32, padding: 16, borderRadius: 10,
        border: '1px solid var(--border)', backgroundColor: 'rgba(126,217,87,0.04)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Master Brain File
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          ~/.0n/ai-brain.0n
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          The .0n brain file is the source of truth for AI identity, learning weights, tier definitions, and security policies.
          Changes to config keys above sync at runtime. The .0n file is the permanent transplant.
        </div>
      </div>
    </div>
  )
}
