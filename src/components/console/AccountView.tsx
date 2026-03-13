'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { RequestIntegrationView } from './RequestIntegrationView'
import { UpgradeModal } from './UpgradeModal'
import { CONSOLE_PLANS } from '@/lib/stripe'

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
}

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

        {/* Current Plan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {(() => {
            const planKey = billing?.plan || 'free'
            const planColors: Record<string, { bg: string; color: string; border: string }> = {
              free: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: 'var(--border)' },
              pro: { bg: 'rgba(126,217,87,0.15)', color: '#7ed957', border: 'rgba(126,217,87,0.3)' },
              team: { bg: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: 'rgba(0,212,255,0.3)' },
              contributor: { bg: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: 'rgba(255,107,53,0.3)' },
              owner: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
            }
            const c = planColors[planKey] || planColors.free
            return (
              <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: 'capitalize' }}>
                {planKey === 'owner' ? 'Owner' : CONSOLE_PLANS[planKey]?.name || 'Free'}
              </span>
            )
          })()}
          {billing?.vendorStatus && (
            <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', backgroundColor: 'rgba(255,107,53,0.1)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.2)', textTransform: 'uppercase' }}>
              Vendor: {billing.vendorStatus}
            </span>
          )}
        </div>

        {/* Plan features */}
        {billing?.plan && CONSOLE_PLANS[billing.plan] && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {CONSOLE_PLANS[billing.plan].features.map((f) => (
              <span key={f} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                {f}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setShowUpgradeModal(true)}
            style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: '#0a0a0f', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}
          >
            {billing?.plan === 'free' || !billing?.plan ? 'Upgrade Plan' : 'Change Plan'}
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
