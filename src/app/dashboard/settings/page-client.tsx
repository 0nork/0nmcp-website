'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AccountData {
  email: string
  full_name: string
  company: string
  bio: string
  created_at: string
}

export default function DashboardSettingsPage() {
  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ full_name: '', company: '', bio: '' })
  const router = useRouter()

  useEffect(() => {
    fetch('/api/console/account')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setData(d)
          setForm({ full_name: d.full_name || '', company: d.company || '', bio: d.bio || '' })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/console/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSaved(true)
    } catch {
      // Silent fail
    } finally {
      setSaving(false)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  async function handleSignOut() {
    try {
      const supabase = createSupabaseBrowser()
      if (supabase) await supabase.auth.signOut()
    } catch { /* ignore */ }
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch { /* ignore */ }
    router.push('/login')
  }

  async function handleResetPassword() {
    if (!data?.email) return
    try {
      const supabase = createSupabaseBrowser()
      if (supabase) {
        await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        alert('Password reset email sent. Check your inbox.')
      }
    } catch {
      alert('Failed to send reset email. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid var(--jp-border)',
          borderTopColor: 'var(--jp-green)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: 'var(--jp-bg-input)',
    border: '1px solid var(--jp-border)',
    borderRadius: 'var(--jp-radius-xs)',
    color: 'var(--jp-text)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--jp-text-secondary)',
    marginBottom: '0.375rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '640px' }}>
      <div className="jp-page-header">
        <h1 className="jp-page-title">Settings</h1>
        <p className="jp-page-subtitle">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="jp-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="jp-menu-group-label" style={{ marginBottom: '1rem' }}>Profile</div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email</label>
          <div style={{
            ...inputStyle,
            background: 'var(--jp-bg)',
            color: 'var(--jp-text-muted)',
            cursor: 'not-allowed',
          }}>
            {data?.email || '—'}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            style={inputStyle}
            placeholder="Your name"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Company</label>
          <input
            type="text"
            value={form.company}
            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            style={inputStyle}
            placeholder="Company name"
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Short bio"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="jp-btn jp-btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ fontSize: '0.8125rem' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--jp-green)' }}>
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="jp-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="jp-menu-group-label" style={{ marginBottom: '1rem' }}>Security</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--jp-text)', fontWeight: 500 }}>
              Password
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)', marginTop: '0.125rem' }}>
              Send a password reset link to your email
            </div>
          </div>
          <button
            onClick={handleResetPassword}
            style={{
              fontSize: '0.8125rem',
              background: 'var(--jp-bg-card)',
              border: '1px solid var(--jp-border)',
              color: 'var(--jp-text)',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--jp-radius-sm)',
              fontFamily: 'inherit',
            }}
          >
            Reset Password
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="jp-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="jp-menu-group-label" style={{ marginBottom: '0.75rem' }}>Account</div>
        <div style={{
          fontSize: '0.8125rem',
          color: 'var(--jp-text-muted)',
        }}>
          Member since {data?.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          border: '1px solid var(--jp-border)',
          borderRadius: 'var(--jp-radius-sm)',
          color: 'var(--jp-red)',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'var(--jp-transition)',
        }}
      >
        Sign Out
      </button>
    </div>
  )
}
