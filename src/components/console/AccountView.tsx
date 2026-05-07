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
  runsBalance?: number
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

  const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[13px] font-[inherit] outline-none'

  return (
    <div className="p-5 rounded-xl bg-[rgba(255,255,255,0.025)] border border-[var(--border)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">CRM Locations</h2>
        <button
          onClick={() => { setAdding(true); setEditingId(null); setForm({ name: '', locationId: '', pitToken: '' }) }}
          className="px-4 py-[7px] rounded-lg border-none bg-[#6EE05A] text-[#080B0F] text-[12px] font-bold cursor-pointer font-[inherit]"
        >
          + Add Location
        </button>
      </div>

      {message && (
        <div className={[
          'px-3.5 py-2 rounded-lg mb-3 text-[12px] border',
          message.type === 'success'
            ? 'bg-[rgba(126,217,87,0.08)] border-[rgba(126,217,87,0.2)] text-[#6EE05A]'
            : 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#ef4444]',
        ].join(' ')}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="text-[var(--text-muted)] text-[13px] p-5 text-center">Loading locations...</div>
      ) : (
        <div className="flex flex-col gap-2">
          {locations.map(loc => (
            <div
              key={loc.id}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-[10px] border',
                loc.isActive
                  ? 'bg-[rgba(126,217,87,0.04)] border-[rgba(126,217,87,0.2)]'
                  : 'bg-[rgba(255,255,255,0.02)] border-[var(--border)]',
              ].join(' ')}
            >
              {/* Status dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: loc.isActive ? '#6EE05A' : '#5f6672',
                  boxShadow: loc.isActive ? '0 0 6px rgba(126,217,87,0.5)' : 'none',
                }}
              />

              {editingId === loc.id ? (
                <div className="flex-1 flex flex-col gap-2">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Location Name" className={inputCls} />
                  <input value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))} placeholder="Location ID" className={inputCls} />
                  <input value={form.pitToken} onChange={e => setForm(f => ({ ...f, pitToken: e.target.value }))} placeholder="PIT Token (optional)" className={`${inputCls} font-mono text-[11px]`} />
                  <div className="flex gap-1.5">
                    <button onClick={() => handleUpdate(loc)} disabled={saving} className="px-3.5 py-1.5 rounded-md border-none bg-[#6EE05A] text-[#080B0F] text-[11px] font-bold cursor-pointer font-[inherit]">
                      {saving ? '...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditingId(null); setForm({ name: '', locationId: '', pitToken: '' }) }} className="px-3.5 py-1.5 rounded-md border border-[var(--border)] bg-transparent text-[#7A8290] text-[11px] cursor-pointer font-[inherit]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                      {loc.name}
                      {loc.isActive && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-[rgba(126,217,87,0.12)] text-[#6EE05A] font-bold">ACTIVE</span>}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                      {loc.locationId}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {!loc.isActive && (
                      <button onClick={() => handleSetActive(loc.id)} className="px-2.5 py-1 rounded-md border border-[rgba(126,217,87,0.2)] bg-transparent text-[#6EE05A] text-[10px] cursor-pointer font-[inherit] font-semibold">
                        Set Active
                      </button>
                    )}
                    <button onClick={() => { setEditingId(loc.id); setForm({ name: loc.name, locationId: loc.locationId, pitToken: loc.pitToken }) }} className="px-2.5 py-1 rounded-md border border-[var(--border)] bg-transparent text-[#7A8290] text-[10px] cursor-pointer font-[inherit]">
                      Edit
                    </button>
                    <button onClick={() => handleRemove(loc.id)} className="px-2.5 py-1 rounded-md border border-[rgba(239,68,68,0.2)] bg-transparent text-[#ef4444] text-[10px] cursor-pointer font-[inherit]">
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {locations.length === 0 && !adding && (
            <div className="text-center p-6 text-[var(--text-muted)] text-[13px]">
              No locations connected. Add your first CRM location.
            </div>
          )}
        </div>
      )}

      {/* Add Location Form */}
      {adding && (
        <div className="mt-3 p-4 rounded-[10px] bg-[rgba(126,217,87,0.03)] border border-[rgba(126,217,87,0.12)]">
          <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Connect New Location</div>
          <div className="flex flex-col gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#7A8290] mb-1">Location Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. The Spa In Ligonier" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7A8290] mb-1">CRM Location ID *</label>
              <input value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))} placeholder="e.g. F76MNKOMQCMruMrumtdf" className={`${inputCls} font-mono text-[11px]`} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7A8290] mb-1">PIT Token (Private Integration Token)</label>
              <input value={form.pitToken} onChange={e => setForm(f => ({ ...f, pitToken: e.target.value }))} placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={`${inputCls} font-mono text-[11px]`} type="password" />
              <div className="text-[10px] text-[var(--text-muted)] mt-1">
                Find this in your CRM under Settings &gt; Business Profile &gt; Private Integrations
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={handleAdd} disabled={saving} className="px-5 py-2.5 rounded-lg border-none bg-[#6EE05A] text-[#080B0F] text-[13px] font-bold cursor-pointer font-[inherit]">
                {saving ? 'Connecting...' : 'Connect Location'}
              </button>
              <button onClick={() => { setAdding(false); setForm({ name: '', locationId: '', pitToken: '' }) }} className="px-5 py-2.5 rounded-lg border border-[var(--border)] bg-transparent text-[#7A8290] text-[13px] cursor-pointer font-[inherit]">
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
      const user = (await supabase.auth.getSession()).data.session?.user ?? null
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
      <div className="p-6 flex items-center justify-center h-full">
        <span className="text-[var(--text-muted)] text-[14px]">Loading account...</span>
      </div>
    )
  }

  const cardCls = 'bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-5'
  const labelCls = 'text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em] mb-1.5 font-mono'
  const inputCls = 'w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[14px] font-[inherit] outline-none transition-[border-color] duration-200'

  return (
    <div className="p-6 w-full max-w-[800px] mx-auto animate-[console-fade-in_0.3s_ease]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0 tracking-[-0.02em]">
          Account
        </h1>
        {tab === 'profile' && (
          <div className="flex gap-3">
            {saved && (
              <span className="text-[var(--accent)] text-[13px] font-medium self-center">Saved</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={[
                'px-6 py-2.5 rounded-xl border-none bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary,#00d4ff))] text-[#0B0F19] text-[14px] font-semibold font-[var(--font-display)] transition-opacity duration-200',
                saving ? 'opacity-60 cursor-wait' : 'cursor-pointer',
              ].join(' ')}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border)] pb-0">
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
            className={[
              'px-5 py-2.5 text-[13px] bg-none border-none cursor-pointer font-[var(--font-display)] transition-[color,border-color] duration-200 -mb-px border-b-2',
              tab === key
                ? 'font-semibold text-[var(--accent)] border-b-[var(--accent)]'
                : 'font-normal text-[var(--text-muted)] border-b-transparent',
            ].join(' ')}
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
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">Console History</h2>
            {history.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem('0n-console-history')
                  setHistory([])
                }}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-none text-[var(--text-muted)] text-[12px] cursor-pointer font-mono"
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-[var(--text-muted)] text-[14px]">No history yet. Actions you take in the console will appear here.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.slice().reverse().slice(0, 50).map((h) => (
                <div key={h.id} className="flex items-center gap-3 px-3 py-2 rounded-[10px] bg-[rgba(255,255,255,0.02)] border border-[var(--border)]">
                  <span className="text-[11px] text-[var(--text-muted)] font-mono shrink-0 min-w-[60px]">
                    {h.type}
                  </span>
                  <span className="text-[13px] text-[var(--text-secondary)] flex-1">{h.detail}</span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono shrink-0">
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
          <div className={cardCls}>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-3 mt-0">
              What is a Contributor?
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7] mb-3">
              Contributors sell workflows, templates, and automations on the 0n Marketplace. You keep <strong className="text-[#6EE05A]">85%</strong> of every sale.
              Payouts are automated through Stripe Connect.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Revenue Split', value: '85/15', note: 'You keep 85%' },
                { label: 'Payouts', value: 'Auto', note: 'Via Stripe Connect' },
                { label: 'Minimum Tier', value: 'Agency', note: '$149/mo or higher' },
              ].map(item => (
                <div key={item.label} className="px-4 py-3 rounded-[10px] bg-[rgba(255,107,53,0.06)] border border-[rgba(255,107,53,0.15)] text-center">
                  <div className="text-[20px] font-bold text-[#ff6b35] font-mono">{item.value}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.label}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status + Action */}
          <div className={cardCls}>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4 mt-0">
              Your Contributor Status
            </h2>

            {!billing?.vendorEligible ? (
              <div>
                <p className="text-[13px] text-[var(--text-secondary)] mb-3">
                  You need an <strong className="text-[#ff6b35]">Agency</strong> ($149/mo) or <strong className="text-[#a78bfa]">Enterprise</strong> ($499/mo) plan to become a Contributor.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-6 py-2.5 rounded-[10px] border-none bg-[linear-gradient(135deg,#ff6b35,#cc5529)] text-[var(--text-primary)] text-[13px] font-semibold cursor-pointer"
                >
                  Upgrade to Agency
                </button>
              </div>
            ) : !billing?.vendorStatus ? (
              <div>
                <p className="text-[13px] text-[var(--text-secondary)] mb-3">
                  Your plan qualifies for Contributor access. Apply to start selling on the marketplace.
                </p>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/console/vendor/apply', { method: 'POST' })
                      fetchProfile()
                    } catch { /* ignore */ }
                  }}
                  className="px-6 py-2.5 rounded-[10px] border-none bg-[linear-gradient(135deg,#ff6b35,#cc5529)] text-[var(--text-primary)] text-[13px] font-semibold cursor-pointer"
                >
                  Apply as Contributor
                </button>
              </div>
            ) : billing.vendorStatus === 'applied' ? (
              <div className="px-5 py-4 rounded-[10px] bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)]">
                <div className="text-[14px] font-semibold text-[#f59e0b] mb-1">Application Pending</div>
                <p className="text-[13px] text-[var(--text-muted)] m-0">
                  Your contributor application is being reviewed. You&apos;ll be notified when approved.
                </p>
              </div>
            ) : billing.vendorStatus === 'approved' ? (
              <div>
                <p className="text-[13px] text-[var(--text-secondary)] mb-3">
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
                  className="px-6 py-2.5 rounded-[10px] border-none bg-[linear-gradient(135deg,#6EE05A,#4CAF3D)] text-[#0B0F19] text-[13px] font-semibold cursor-pointer"
                >
                  Complete Stripe Onboarding
                </button>
              </div>
            ) : billing.vendorStatus === 'active' ? (
              <div>
                {/* Revenue stats */}
                {billing.vendorProfile && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="px-4 py-3 rounded-[10px] bg-[rgba(126,217,87,0.08)] border border-[rgba(126,217,87,0.15)] text-center">
                      <div className="text-[22px] font-bold text-[#6EE05A] font-mono">
                        ${((billing.vendorProfile.total_revenue_cents || 0) / 100).toFixed(0)}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Total Revenue</div>
                    </div>
                    <div className="px-4 py-3 rounded-[10px] bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)] text-center">
                      <div className="text-[22px] font-bold text-[#00d4ff] font-mono">
                        {billing.vendorProfile.total_sales || 0}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Total Sales</div>
                    </div>
                    <div className="px-4 py-3 rounded-[10px] bg-[rgba(255,107,53,0.08)] border border-[rgba(255,107,53,0.15)] text-center">
                      <div className={`text-[22px] font-bold font-mono ${billing.vendorProfile.charges_enabled ? 'text-[#6EE05A]' : 'text-[#f59e0b]'}`}>
                        {billing.vendorProfile.charges_enabled ? 'Active' : 'Pending'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Payouts</div>
                    </div>
                  </div>
                )}
                <div className="text-[13px] text-[var(--text-secondary)] mb-1">
                  {billing.vendorProfile?.business_name && (
                    <strong className="text-[var(--text-primary)]">{billing.vendorProfile.business_name} — </strong>
                  )}
                  Vendor account active.
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Docs */}
          <div className={cardCls}>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4 mt-0">
              Contributor Guide
            </h2>
            <div className="text-[13px] text-[var(--text-secondary)] leading-[1.8]">
              {[
                { q: 'How payouts work', a: 'You earn 85% of every sale. Payouts are automated via Stripe Connect on a rolling basis. Set up your banking details during onboarding.' },
                { q: 'Creating listings', a: 'Build workflows in the Console Builder, then publish them to the Store. Set your own price point and description.' },
                { q: 'Pricing strategies', a: 'Most successful listings are priced between $9-$49 for individual workflows and $99-$299 for bundles.' },
                { q: 'White-label reports', a: 'Agency+ tiers can generate branded reports for clients showing workflow performance and ROI.' },
              ].map(item => (
                <div key={item.q} className="mb-4">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">{item.q}</div>
                  <div className="text-[12px] text-[var(--text-muted)]">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Profile Tab ─── */}
      {tab === 'profile' && (<>

      {/* Profile */}
      <div className={cardCls}>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-5 mt-0">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary,#00d4ff))] flex items-center justify-center shrink-0">
            <span className="text-[22px] font-extrabold text-[#0B0F19]">
              {fullName ? fullName[0].toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <div className="text-[14px] text-[var(--text-secondary)]">{profile?.email || 'No email'}</div>
            <div className="text-[12px] text-[var(--text-muted)] mt-0.5">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={labelCls}>Display Name</div>
            <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <div className={labelCls}>Company</div>
            <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
          </div>
          <div>
            <div className={labelCls}>Role</div>
            <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Developer, Founder" />
          </div>
          <div>
            <div className={labelCls}>Bio</div>
            <input className={inputCls} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio" />
          </div>
        </div>
      </div>

      {/* Plan & Billing */}
      <div className={cardCls}>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-5 mt-0">Plan & Billing</h2>

        {/* Current Plan */}
        {(() => {
          const rawPlan = billing?.plan || 'free'
          const planKey = LEGACY_PLAN_MAP[rawPlan] || rawPlan
          const planColors: Record<string, { bg: string; color: string; border: string }> = {
            free: { bg: 'var(--border)', color: 'var(--text-muted)', border: 'var(--border)' },
            creator: { bg: 'rgba(126,217,87,0.15)', color: '#6EE05A', border: 'rgba(126,217,87,0.3)' },
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
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-4 py-1.5 rounded-[20px] text-[13px] font-bold font-mono capitalize"
                  style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                >
                  {planKey === 'owner' ? 'Owner' : tierInfo.label}
                </span>
                {billing?.vendorStatus && (
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold font-mono uppercase bg-[rgba(255,107,53,0.1)] text-[#ff6b35] border border-[rgba(255,107,53,0.2)]">
                    Vendor: {billing.vendorStatus}
                  </span>
                )}
              </div>

              {/* Seats & Locations */}
              {td && planKey !== 'owner' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="px-4 py-3 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)]">
                    <div className="flex justify-between items-baseline">
                      <div className="text-[22px] font-bold font-mono" style={{ color: c.color }}>
                        {billing?.activeSeats ?? 0}/{td.maxUsers}
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Team Seats</div>
                    {td.addOns && (
                      <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                        +${td.addOns.extraUserMonthly}/mo per extra seat
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)]">
                    <div className="flex justify-between items-baseline">
                      <div className="text-[22px] font-bold font-mono" style={{ color: c.color }}>
                        {billing?.activeLocations ?? 0}/{td.maxLocations}
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Locations</div>
                    {td.addOns && (
                      <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
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
            <div className="flex flex-wrap gap-1.5 mb-4">
              {planData.features.map((f) => (
                <span key={f} className="text-[11px] text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)]">
                  {f}
                </span>
              ))}
            </div>
          )
        })()}

        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-5 py-2 rounded-[10px] border-none bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary,#00d4ff))] text-[#0B0F19] text-[13px] font-semibold cursor-pointer font-[var(--font-display)]"
          >
            {billing?.plan === 'free' || !billing?.plan ? 'Upgrade Plan' : 'Switch Plan'}
          </button>
          {billing?.hasCustomer && (
            <button
              onClick={handleBillingPortal}
              className="px-5 py-2 rounded-[10px] border border-[var(--border)] bg-none text-[var(--text-secondary)] text-[13px] font-medium cursor-pointer font-[inherit]"
            >
              Manage Billing
            </button>
          )}
        </div>

        {/* Usage This Period */}
        <div className="border-t border-[var(--border)] pt-4 mb-4">
          <div className={`${labelCls} mb-3`}>Usage This Period</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="text-[22px] font-bold text-[var(--text-primary)] font-mono">
                {billing?.runsBalance ?? 0}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Runs Balance</div>
            </div>
            <div className="px-4 py-3 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="text-[22px] font-bold text-[var(--text-primary)] font-mono">
                {billing?.executionsThisMonth ?? 0}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Executions This Month</div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border-t border-[var(--border)] pt-4 mb-4">
          <div className={`${labelCls} mb-3`}>Payment Method</div>
          {billing?.paymentMethod ? (
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)]">
              <span className="text-[13px] font-semibold text-[var(--text-primary)] capitalize">
                {billing.paymentMethod.card_brand || 'Card'}
              </span>
              <span className="text-[13px] text-[var(--text-secondary)] font-mono">
                **** {billing.paymentMethod.card_last4}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                {billing.paymentMethod.card_exp_month}/{billing.paymentMethod.card_exp_year}
              </span>
            </div>
          ) : (
            <div className="text-[13px] text-[var(--text-muted)]">
              No payment method on file.{' '}
              <button onClick={handleBillingPortal} className="bg-none border-none text-[var(--accent)] cursor-pointer text-[13px] font-semibold p-0">
                Add one
              </button>
            </div>
          )}
        </div>

        {/* Invoices */}
        {billing?.invoices && billing.invoices.length > 0 && (
          <div className="border-t border-[var(--border)] pt-4">
            <div className={`${labelCls} mb-3`}>Recent Invoices</div>
            <div className="flex flex-col gap-1.5">
              {billing.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--border)]">
                  <span className="text-[12px] text-[var(--text-muted)] font-mono min-w-[72px]">
                    {new Date(inv.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] font-mono min-w-[60px]">
                    ${(inv.amount_paid / 100).toFixed(2)}
                  </span>
                  <span className={[
                    'text-[10px] font-semibold px-2 py-0.5 rounded-[10px] capitalize',
                    inv.status === 'paid'
                      ? 'bg-[rgba(126,217,87,0.12)] text-[#6EE05A]'
                      : 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b]',
                  ].join(' ')}>
                    {inv.status}
                  </span>
                  <span className="flex-1" />
                  {inv.invoice_pdf && (
                    <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[var(--accent)] no-underline font-medium">
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
      <div className={cardCls}>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-5 mt-0">Preferences</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={labelCls}>Default View</div>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
              className={`${inputCls} cursor-pointer appearance-none`}
            >
              <option value="dashboard">Dashboard</option>
              <option value="chat">Chat</option>
              <option value="builder">Builder</option>
              <option value="social">Social Hub</option>
              <option value="store">Store</option>
            </select>
          </div>
          <div>
            <div className={labelCls}>Theme</div>
            <div className="px-3.5 py-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] text-[14px]">
              Dark (only theme)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={() => setNotifications(!notifications)}
            className={[
              'relative w-11 h-6 rounded-xl border-none cursor-pointer p-0 transition-[background-color] duration-200',
              notifications ? 'bg-[var(--accent)]' : 'bg-[var(--border)]',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-[3px] w-[18px] h-[18px] rounded-full transition-[left,background-color] duration-200',
                notifications ? 'left-[23px] bg-[#0B0F19]' : 'left-[3px] bg-[var(--text-muted)]',
              ].join(' ')}
            />
          </button>
          <span className={`text-[13px] ${notifications ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
            Email notifications
          </span>
        </div>
      </div>

      {/* Change Password */}
      <div className={cardCls}>
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-5 mt-0">Change Password</h2>

        <div className="flex flex-col gap-4 max-w-[400px]">
          <div>
            <div className={labelCls}>Current Password</div>
            <input
              type="password"
              className={inputCls}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <div className={labelCls}>New Password</div>
            <input
              type="password"
              className={inputCls}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null) }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            {newPassword && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="flex-1 h-1 rounded-sm transition-[background-color] duration-200"
                    style={{
                      backgroundColor: passwordStrength >= level
                        ? level <= 1 ? '#ff3b30' : level <= 2 ? '#ff9500' : level <= 3 ? '#ffcc00' : '#34c759'
                        : 'var(--border)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className={labelCls}>Confirm New Password</div>
            <input
              type="password"
              className={inputCls}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(null) }}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>

          {passwordMsg && (
            <div className={[
              'px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium border',
              passwordMsg.type === 'success'
                ? 'bg-[rgba(52,199,89,0.1)] text-[#34c759] border-[rgba(52,199,89,0.3)]'
                : 'bg-[rgba(255,59,48,0.1)] text-[#ff3b30] border-[rgba(255,59,48,0.3)]',
            ].join(' ')}>
              {passwordMsg.text}
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            className={[
              'px-6 py-2.5 rounded-[10px] border-none text-[14px] font-semibold font-[var(--font-display)] transition-opacity duration-200 self-start',
              (!currentPassword || !newPassword || !confirmPassword)
                ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary,#00d4ff))] text-[#0B0F19] cursor-pointer',
              passwordSaving ? 'opacity-60' : '',
            ].join(' ')}
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[var(--bg-card)] border border-[rgba(255,59,48,0.2)] rounded-2xl p-6 mb-5">
        <h2 className="text-[16px] font-semibold text-[#ff3b30] mb-4 mt-0">Danger Zone</h2>

        <div className="flex gap-3">
          <button
            onClick={handleSignOut}
            className="px-5 py-2 rounded-[10px] border border-[rgba(255,59,48,0.3)] bg-[rgba(255,59,48,0.08)] text-[#ff3b30] text-[13px] font-medium cursor-pointer font-[inherit]"
          >
            Sign Out
          </button>
          <button
            onClick={() => window.open('mailto:mike@rocketopp.com?subject=Delete%20my%200nmcp.com%20account', '_blank')}
            className="px-5 py-2 rounded-[10px] border border-[var(--border)] bg-none text-[var(--text-muted)] text-[13px] font-medium cursor-pointer font-[inherit]"
          >
            Request Account Deletion
          </button>
        </div>
      </div>

      </>)}
    </div>
  )
}
