'use client'

import { useState, useEffect, useCallback } from 'react'
import { RequestIntegrationView } from './RequestIntegrationView'

type AccountTab = 'profile' | 'requests' | 'history'

interface HistoryItem {
  id: string
  type: string
  detail: string
  ts: string
}

interface Profile {
  full_name: string
  company: string
  role: string
  bio: string
  email: string
  avatar_url: string | null
  created_at: string
  stripe_customer_id: string | null
  preferences: {
    default_view?: string
    notifications?: boolean
  }
}

interface BillingStatus {
  subscribed: boolean
  hasCustomer: boolean
  subscriptionId?: string | null
}

export function AccountView() {
  const [tab, setTab] = useState<AccountTab>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Editable fields
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')
  const [defaultView, setDefaultView] = useState('dashboard')
  const [notifications, setNotifications] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, billingRes] = await Promise.all([
        fetch('/api/console/account'),
        fetch('/api/console/billing'),
      ])

      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfile(data)
        setFullName(data.full_name || '')
        setCompany(data.company || '')
        setRole(data.role || '')
        setBio(data.bio || '')
        setDefaultView(data.preferences?.default_view || 'dashboard')
        setNotifications(data.preferences?.notifications !== false)
      }

      if (billingRes.ok) {
        setBilling(await billingRes.json())
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    // Load history from localStorage
    try {
      const raw = localStorage.getItem('0n-console-history')
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [fetchProfile])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/console/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          company,
          role,
          bio,
          preferences: { default_view: defaultView, notifications },
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch {
      // Ignore
    } finally {
      setSaving(false)
    }
  }

  const handleBillingPortal = async () => {
    try {
      const res = await fetch('/api/console/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal' }),
      })
      const data = await res.json()
      if (data.url) window.open(data.url, '_blank')
    } catch {
      // Ignore
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading account...</span>
      </div>
    )
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 6,
    fontFamily: 'var(--font-mono)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div
      style={{
        padding: 24,
        width: '100%',
        maxWidth: 800,
        margin: '0 auto',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>
          Account
        </h1>
        {tab === 'profile' && (
          <div style={{ display: 'flex', gap: 12 }}>
            {saved && (
              <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500, alignSelf: 'center' }}>Saved</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                color: '#0a0a0f',
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily: 'var(--font-display)',
                transition: 'opacity 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {([
          { key: 'profile' as AccountTab, label: 'Profile & Settings' },
          { key: 'requests' as AccountTab, label: 'Request Integration' },
          { key: 'history' as AccountTab, label: 'History' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: tab === key ? 600 : 400,
              color: tab === key ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'color 0.2s, border-color 0.2s',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Requests Tab ─── */}
      {tab === 'requests' && <RequestIntegrationView />}

      {/* ─── History Tab ─── */}
      {tab === 'history' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Console History</h2>
            {history.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem('0n-console-history')
                  setHistory([])
                }}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)',
                }}
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No history yet. Actions you take in the console will appear here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice().reverse().slice(0, 50).map((h) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, minWidth: 60 }}>
                    {h.type}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{h.detail}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {new Date(h.ts).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Profile Tab ─── */}
      {tab === 'profile' && (<>

      {/* Profile */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, marginTop: 0 }}>Profile</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: '#0a0a0f' }}>
              {fullName ? fullName[0].toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profile?.email || 'No email'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={labelStyle}>Display Name</div>
            <input
              style={inputStyle}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <div style={labelStyle}>Company</div>
            <input
              style={inputStyle}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div>
            <div style={labelStyle}>Role</div>
            <input
              style={inputStyle}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Developer, Founder"
            />
          </div>
          <div>
            <div style={labelStyle}>Bio</div>
            <input
              style={inputStyle}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio"
            />
          </div>
        </div>
      </div>

      {/* Plan & Billing */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, marginTop: 0 }}>Plan & Billing</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              backgroundColor: billing?.subscribed ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.06)',
              color: billing?.subscribed ? '#7ed957' : 'var(--text-muted)',
              border: `1px solid ${billing?.subscribed ? 'rgba(126,217,87,0.3)' : 'var(--border)'}`,
            }}
          >
            {billing?.subscribed ? 'Metered Plan' : 'Free Tier'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {billing?.subscribed ? '$0.10 per execution' : 'Upgrade for pay-per-execution workflows'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {billing?.subscribed ? (
            <button
              onClick={handleBillingPortal}
              style={{
                padding: '8px 20px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Manage Billing
            </button>
          ) : (
            <button
              onClick={async () => {
                const res = await fetch('/api/console/billing', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'subscribe' }),
                })
                const data = await res.json()
                if (data.url) window.open(data.url, '_blank')
              }}
              style={{
                padding: '8px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                color: '#0a0a0f',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              Upgrade to Metered
            </button>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, marginTop: 0 }}>Preferences</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={labelStyle}>Default View</div>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none' as const,
              }}
            >
              <option value="dashboard">Dashboard</option>
              <option value="chat">Chat</option>
              <option value="builder">Builder</option>
              <option value="social">Social Hub</option>
              <option value="store">Store</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Theme</div>
            <div style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: 14 }}>
              Dark (only theme)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <button
            onClick={() => setNotifications(!notifications)}
            style={{
              position: 'relative' as const,
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: notifications ? 'var(--accent)' : 'var(--border)',
              transition: 'background-color 0.2s',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute' as const,
                top: 3,
                left: notifications ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: notifications ? '#0a0a0f' : 'var(--text-muted)',
                transition: 'left 0.2s, background-color 0.2s',
              }}
            />
          </button>
          <span style={{ fontSize: 13, color: notifications ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            Email notifications
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ ...cardStyle, borderColor: 'rgba(255, 59, 48, 0.2)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ff3b30', marginBottom: 16, marginTop: 0 }}>Danger Zone</h2>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: '1px solid rgba(255,59,48,0.3)',
              background: 'rgba(255,59,48,0.08)',
              color: '#ff3b30',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Sign Out
          </button>
          <button
            onClick={() => window.open('mailto:mike@rocketopp.com?subject=Delete%20my%200nmcp.com%20account', '_blank')}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'none',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Request Account Deletion
          </button>
        </div>
      </div>

      </>)}
    </div>
  )
}
