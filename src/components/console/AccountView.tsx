'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { RequestIntegrationView } from './RequestIntegrationView'
import { UpgradeModal } from './UpgradeModal'
import { CONSOLE_PLANS, LEGACY_PLAN_MAP } from '@/lib/stripe'
import { SOCIAL_ENGINE_TIERS } from './StoreTypes'

type AccountTab = 'profile' | 'locations' | 'requests' | 'history' | 'contributor'

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
  plan?: string
  sparksBalance?: number
  executionsThisMonth?: number
  paymentMethod?: {
    card_brand: string | null
    card_last4: string | null
    card_exp_month: number | null
    card_exp_year: number | null
  } | null
  invoices?: {
    id: string
    amount_paid: number
    currency: string
    status: string
    created: number
    invoice_pdf: string | null
  }[]
  isOwner?: boolean
  vendorStatus?: string | null
  tierData?: {
    maxUsers: number
    maxLocations: number
    whiteLabel: boolean
    addOns: { extraUserMonthly: number; extraLocationMonthly: number } | null
  }
  activeSeats?: number
  activeLocations?: number
  vendorEligible?: boolean
  vendorProfile?: {
    business_name: string | null
    total_revenue_cents: number
    total_sales: number
    charges_enabled: boolean
  } | null
}

// ─── Locations Management Tab ─────────────────────────────────────────────

interface CrmLocationEntry {
  id: string
  name: string
  locationId: string
  pitToken: string
  isActive: boolean
}

function LocationsTab() {
  const [locations, setLocations] = useState<CrmLocationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', locationId: '', pitToken: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetch('/api/console/crm/locations')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.locations) {
          setLocations(d.locations.map((l: { id: string; name: string; isActive: boolean; pitToken?: string }) => ({
            id: l.id,
            name: l.name || l.id,
            locationId: l.id,
            pitToken: l.pitToken || '',
            isActive: l.isActive,
          })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!form.name.trim() || !form.locationId.trim()) {
      setMessage({ text: 'Name and Location ID are required', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/console/crm/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: form.locationId.trim(),
          pitToken: form.pitToken.trim() || undefined,
          name: form.name.trim(),
          action: 'add',
        }),
      })
      if (res.ok) {
        setLocations(prev => [...prev, {
          id: form.locationId.trim(),
          name: form.name.trim(),
          locationId: form.locationId.trim(),
          pitToken: form.pitToken.trim(),
          isActive: false,
        }])
        setForm({ name: '', locationId: '', pitToken: '' })
        setAdding(false)
        setMessage({ text: 'Location added', type: 'success' })
      } else {
        setMessage({ text: 'Failed to add location', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Network error', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleUpdate = async (loc: CrmLocationEntry) => {
    setSaving(true)
    try {
      await fetch('/api/console/crm/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: form.locationId.trim() || loc.locationId,
          pitToken: form.pitToken.trim() || undefined,
          name: form.name.trim() || loc.name,
          action: 'update',
        }),
      })
      setLocations(prev => prev.map(l => l.id === loc.id ? {
        ...l,
        name: form.name.trim() || l.name,
        locationId: form.locationId.trim() || l.locationId,
        pitToken: form.pitToken.trim() || l.pitToken,
      } : l))
      setEditingId(null)
      setForm({ name: '', locationId: '', pitToken: '' })
      setMessage({ text: 'Location updated', type: 'success' })
    } catch {
      setMessage({ text: 'Failed to update', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleRemove = async (locId: string) => {
    if (!confirm('Remove this location?')) return
    try {
      await fetch('/api/console/crm/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: locId, action: 'remove' }),
      })
      setLocations(prev => prev.filter(l => l.id !== locId))
      setMessage({ text: 'Location removed', type: 'success' })
    } catch {
      setMessage({ text: 'Failed to remove', type: 'error' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSetActive = async (locId: string) => {
    await fetch('/api/console/crm/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId: locId }),
    })
    setLocations(prev => prev.map(l => ({ ...l, isActive: l.id === locId })))
    setMessage({ text: 'Active location switched', type: 'success' })
    setTimeout(() => setMessage(null), 3000)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#e8eaed', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  } as const

  const cardS = {
    padding: '1.25rem', borderRadius: 12,
    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
  } as const

  return (
    <div style={cardS}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e8eaed', margin: 0 }}>CRM Locations</h2>
        <button
          onClick={() => { setAdding(true); setEditingId(null); setForm({ name: '', locationId: '', pitToken: '' }) }}
          style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            background: '#7ed957', color: '#080B0F',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + Add Location
        </button>
      </div>

      {message && (
        <div style={{
          padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 12,
          background: message.type === 'success' ? 'rgba(126,217,87,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(126,217,87,0.2)' : 'rgba(239,68,68,0.2)'}`,
          color: message.type === 'success' ? '#7ed957' : '#ef4444',
        }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#5f6672', fontSize: 13, padding: 20, textAlign: 'center' }}>Loading locations...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {locations.map(loc => (
            <div key={loc.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 10,
              background: loc.isActive ? 'rgba(126,217,87,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${loc.isActive ? 'rgba(126,217,87,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              {/* Status dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: loc.isActive ? '#7ed957' : '#5f6672',
                boxShadow: loc.isActive ? '0 0 6px rgba(126,217,87,0.5)' : 'none',
              }} />

              {editingId === loc.id ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Location Name" style={inputStyle} />
                  <input value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))} placeholder="Location ID" style={inputStyle} />
                  <input value={form.pitToken} onChange={e => setForm(f => ({ ...f, pitToken: e.target.value }))} placeholder="PIT Token (optional)" style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleUpdate(loc)} disabled={saving} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#7ed957', color: '#080B0F', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {saving ? '...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditingId(null); setForm({ name: '', locationId: '', pitToken: '' }) }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9aa0a8', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e8eaed' }}>
                      {loc.name}
                      {loc.isActive && <span style={{ marginLeft: 8, fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(126,217,87,0.12)', color: '#7ed957', fontWeight: 700 }}>ACTIVE</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#5f6672', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                      {loc.locationId}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!loc.isActive && (
                      <button onClick={() => handleSetActive(loc.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(126,217,87,0.2)', background: 'transparent', color: '#7ed957', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                        Set Active
                      </button>
                    )}
                    <button onClick={() => { setEditingId(loc.id); setForm({ name: loc.name, locationId: loc.locationId, pitToken: loc.pitToken }) }} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9aa0a8', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Edit
                    </button>
                    <button onClick={() => handleRemove(loc.id)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#ef4444', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {locations.length === 0 && !adding && (
            <div style={{ textAlign: 'center', padding: 24, color: '#5f6672', fontSize: 13 }}>
              No locations connected. Add your first CRM location.
            </div>
          )}
        </div>
      )}

      {/* Add Location Form */}
      {adding && (
        <div style={{ marginTop: 12, padding: '16px', borderRadius: 10, background: 'rgba(126,217,87,0.03)', border: '1px solid rgba(126,217,87,0.12)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e8eaed', marginBottom: 12 }}>Connect New Location</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9aa0a8', marginBottom: 4 }}>Location Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. The Spa In Ligonier" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9aa0a8', marginBottom: 4 }}>CRM Location ID *</label>
              <input value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))} placeholder="e.g. F76MNKOMQCMruMrumtdf" style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9aa0a8', marginBottom: 4 }}>PIT Token (Private Integration Token)</label>
              <input value={form.pitToken} onChange={e => setForm(f => ({ ...f, pitToken: e.target.value }))} placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} type="password" />
              <div style={{ fontSize: 10, color: '#5f6672', marginTop: 4 }}>
                Find this in your CRM under Settings &gt; Business Profile &gt; Private Integrations
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={handleAdd} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#7ed957', color: '#080B0F', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Connecting...' : 'Connect Location'}
              </button>
              <button onClick={() => { setAdding(false); setForm({ name: '', locationId: '', pitToken: '' }) }} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9aa0a8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Account View ────────────────────────────────────────────────────

export function AccountView() {
  const [tab, setTab] = useState<AccountTab>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Editable fields
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [bio, setBio] = useState('')
  const [defaultView, setDefaultView] = useState('dashboard')
  const [notifications, setNotifications] = useState(true)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const handlePasswordChange = async () => {
    setPasswordMsg(null)

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setPasswordSaving(true)
    try {
      const supabase = createSupabaseBrowser()
      if (!supabase) {
        setPasswordMsg({ type: 'error', text: 'Auth not configured.' })
        return
      }

      // Re-authenticate with current password to verify identity
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setPasswordMsg({ type: 'error', text: 'Unable to verify your account.' })
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInError) {
        setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' })
        return
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPasswordMsg({ type: 'error', text: error.message })
        return
      }

      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordMsg({ type: 'error', text: 'Something went wrong. Try again.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  const passwordStrength = (() => {
    if (!newPassword) return 0
    let s = 0
    if (newPassword.length >= 8) s++
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) s++
    if (/\d/.test(newPassword)) s++
    if (/[^A-Za-z0-9]/.test(newPassword)) s++
    return s
  })()

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
          { key: 'locations' as AccountTab, label: 'CRM Locations' },
          { key: 'contributor' as AccountTab, label: 'Contributor' },
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

      {/* ─── Locations Tab ─── */}
      {tab === 'locations' && <LocationsTab />}

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

      {/* ─── Contributor Tab ─── */}
      {tab === 'contributor' && (
        <div>
          {/* What is a Contributor? */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, marginTop: 0 }}>
              What is a Contributor?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
              Contributors sell workflows, templates, and automations on the 0n Marketplace. You keep <strong style={{ color: '#7ed957' }}>85%</strong> of every sale.
              Payouts are automated through Stripe Connect.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Revenue Split', value: '85/15', note: 'You keep 85%' },
                { label: 'Payouts', value: 'Auto', note: 'Via Stripe Connect' },
                { label: 'Minimum Tier', value: 'Agency', note: '$149/mo or higher' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#ff6b35', fontFamily: 'var(--font-mono)' }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status + Action */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, marginTop: 0 }}>
              Your Contributor Status
            </h2>

            {!billing?.vendorEligible ? (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  You need an <strong style={{ color: '#ff6b35' }}>Agency</strong> ($149/mo) or <strong style={{ color: '#a78bfa' }}>Enterprise</strong> ($499/mo) plan to become a Contributor.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #ff6b35, #cc5529)',
                    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Upgrade to Agency
                </button>
              </div>
            ) : !billing?.vendorStatus ? (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Your plan qualifies for Contributor access. Apply to start selling on the marketplace.
                </p>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/console/vendor/apply', { method: 'POST' })
                      fetchProfile()
                    } catch { /* ignore */ }
                  }}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #ff6b35, #cc5529)',
                    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Apply as Contributor
                </button>
              </div>
            ) : billing.vendorStatus === 'applied' ? (
              <div style={{ padding: '16px 20px', borderRadius: 10, backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>Application Pending</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Your contributor application is being reviewed. You&apos;ll be notified when approved.
                </p>
              </div>
            ) : billing.vendorStatus === 'approved' ? (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  You&apos;re approved! Complete your Stripe Connect onboarding to start receiving payouts.
                </p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/console/vendor/onboard', { method: 'POST' })
                      const data = await res.json()
                      if (data.url) window.location.href = data.url
                    } catch { /* ignore */ }
                  }}
                  style={{
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                    color: '#0a0a0f', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Complete Stripe Onboarding
                </button>
              </div>
            ) : billing.vendorStatus === 'active' ? (
              <div>
                {/* Revenue stats */}
                {billing.vendorProfile && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.15)', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#7ed957', fontFamily: 'var(--font-mono)' }}>
                        ${((billing.vendorProfile.total_revenue_cents || 0) / 100).toFixed(0)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Total Revenue</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
                        {billing.vendorProfile.total_sales || 0}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Total Sales</div>
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: billing.vendorProfile.charges_enabled ? '#7ed957' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                        {billing.vendorProfile.charges_enabled ? 'Active' : 'Pending'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Payouts</div>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {billing.vendorProfile?.business_name && (
                    <strong style={{ color: 'var(--text-primary)' }}>{billing.vendorProfile.business_name} — </strong>
                  )}
                  Vendor account active.
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Docs */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, marginTop: 0 }}>
              Contributor Guide
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {[
                { q: 'How payouts work', a: 'You earn 85% of every sale. Payouts are automated via Stripe Connect on a rolling basis. Set up your banking details during onboarding.' },
                { q: 'Creating listings', a: 'Build workflows in the Console Builder, then publish them to the Store. Set your own price point and description.' },
                { q: 'Pricing strategies', a: 'Most successful listings are priced between $9-$49 for individual workflows and $99-$299 for bundles.' },
                { q: 'White-label reports', a: 'Agency+ tiers can generate branded reports for clients showing workflow performance and ROI.' },
              ].map(item => (
                <div key={item.q} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.q}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
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

        {/* Current Plan */}
        {(() => {
          const rawPlan = billing?.plan || 'free'
          const planKey = LEGACY_PLAN_MAP[rawPlan] || rawPlan
          const planColors: Record<string, { bg: string; color: string; border: string }> = {
            free: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'var(--border)' },
            creator: { bg: 'rgba(126,217,87,0.15)', color: '#7ed957', border: 'rgba(126,217,87,0.3)' },
            operator: { bg: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: 'rgba(0,212,255,0.3)' },
            agency: { bg: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: 'rgba(255,107,53,0.3)' },
            enterprise: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
            owner: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
          }
          const c = planColors[planKey] || planColors.free
          const tierInfo = SOCIAL_ENGINE_TIERS.find(t => t.key === planKey) || SOCIAL_ENGINE_TIERS[0]
          const td = billing?.tierData

          return (
            <>
              {/* Tier badge + vendor badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: 'capitalize' }}>
                  {planKey === 'owner' ? 'Owner' : tierInfo.label}
                </span>
                {billing?.vendorStatus && (
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(255,107,53,0.1)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.2)', textTransform: 'uppercase' }}>
                    Vendor: {billing.vendorStatus}
                  </span>
                )}
              </div>

              {/* Seats & Locations */}
              {td && planKey !== 'owner' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>
                        {billing?.activeSeats ?? 0}/{td.maxUsers}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Team Seats</div>
                    {td.addOns && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        +${td.addOns.extraUserMonthly}/mo per extra seat
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)' }}>
                        {billing?.activeLocations ?? 0}/{td.maxLocations}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Locations</div>
                    {td.addOns && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        +${td.addOns.extraLocationMonthly}/mo per extra location
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )
        })()}

        {/* Plan features */}
        {(() => {
          const rawPlan = billing?.plan || 'free'
          const planKey = LEGACY_PLAN_MAP[rawPlan] || rawPlan
          const planData = CONSOLE_PLANS[planKey]
          if (!planData) return null
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {planData.features.map((f) => (
                <span key={f} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                  {f}
                </span>
              ))}
            </div>
          )
        })()}

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setShowUpgradeModal(true)}
            style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: '#0a0a0f', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}
          >
            {billing?.plan === 'free' || !billing?.plan ? 'Upgrade Plan' : 'Switch Plan'}
          </button>
          {billing?.hasCustomer && (
            <button
              onClick={handleBillingPortal}
              style={{
                padding: '8px 20px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Manage Billing
            </button>
          )}
        </div>

        {/* Usage This Period */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Usage This Period</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {billing?.sparksBalance ?? 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Sparks Balance</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {billing?.executionsThisMonth ?? 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Executions This Month</div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Payment Method</div>
          {billing?.paymentMethod ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {billing.paymentMethod.card_brand || 'Card'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                **** {billing.paymentMethod.card_last4}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {billing.paymentMethod.card_exp_month}/{billing.paymentMethod.card_exp_year}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No payment method on file.{' '}
              <button onClick={handleBillingPortal} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
                Add one
              </button>
            </div>
          )}
        </div>

        {/* Invoices */}
        {billing?.invoices && billing.invoices.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ ...labelStyle, marginBottom: 12 }}>Recent Invoices</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {billing.invoices.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: 72 }}>
                    {new Date(inv.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', minWidth: 60 }}>
                    ${(inv.amount_paid / 100).toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize',
                    backgroundColor: inv.status === 'paid' ? 'rgba(126,217,87,0.12)' : 'rgba(245,158,11,0.12)',
                    color: inv.status === 'paid' ? '#7ed957' : '#f59e0b',
                  }}>
                    {inv.status}
                  </span>
                  <span style={{ flex: 1 }} />
                  {inv.invoice_pdf && (
                    <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                      PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          currentPlan={billing?.plan || 'free'}
          onClose={() => setShowUpgradeModal(false)}
          onSwitched={() => fetchProfile()}
        />
      )}

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

      {/* Change Password */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, marginTop: 0 }}>Change Password</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
          <div>
            <div style={labelStyle}>Current Password</div>
            <input
              type="password"
              style={inputStyle}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <div style={labelStyle}>New Password</div>
            <input
              type="password"
              style={inputStyle}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null) }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            {newPassword && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: passwordStrength >= level
                        ? level <= 1 ? '#ff3b30' : level <= 2 ? '#ff9500' : level <= 3 ? '#ffcc00' : '#34c759'
                        : 'var(--border)',
                      transition: 'background-color 0.2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={labelStyle}>Confirm New Password</div>
            <input
              type="password"
              style={inputStyle}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(null) }}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>

          {passwordMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              backgroundColor: passwordMsg.type === 'success' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
              color: passwordMsg.type === 'success' ? '#34c759' : '#ff3b30',
              border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(52,199,89,0.3)' : 'rgba(255,59,48,0.3)'}`,
            }}>
              {passwordMsg.text}
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              border: 'none',
              background: (!currentPassword || !newPassword || !confirmPassword)
                ? 'var(--border)'
                : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: (!currentPassword || !newPassword || !confirmPassword) ? 'var(--text-muted)' : '#0a0a0f',
              fontSize: 14,
              fontWeight: 600,
              cursor: (passwordSaving || !currentPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
              opacity: passwordSaving ? 0.6 : 1,
              fontFamily: 'var(--font-display)',
              transition: 'opacity 0.2s',
              alignSelf: 'flex-start',
            }}
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
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
