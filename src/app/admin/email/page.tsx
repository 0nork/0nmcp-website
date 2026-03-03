'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface NotificationSettings {
  welcome_email: boolean
  password_reset: boolean
  admin_new_thread: boolean
  weekly_digest: boolean
}

interface EmailSettings {
  notifications: NotificationSettings
  templates: Record<string, string>
}

const DEFAULT_SETTINGS: EmailSettings = {
  notifications: {
    welcome_email: true,
    password_reset: true,
    admin_new_thread: false,
    weekly_digest: false,
  },
  templates: {
    welcome: 'default',
    confirmation: 'default',
    reset: 'default',
    magic_link: 'default',
  },
}

const TEMPLATES = [
  { key: 'welcome', label: 'Welcome Email', description: 'Sent after signup confirmation' },
  { key: 'confirmation', label: 'Email Confirmation', description: 'Verify new email address' },
  { key: 'reset', label: 'Password Reset', description: 'Password recovery link' },
  { key: 'magic_link', label: 'Magic Link', description: 'Passwordless login' },
]

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [crmStatus, setCrmStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/email')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings({
            notifications: { ...DEFAULT_SETTINGS.notifications, ...(data.settings.notifications || {}) },
            templates: { ...DEFAULT_SETTINGS.templates, ...(data.settings.templates || {}) },
          })
        }
        setCrmStatus(data.crm_connected ? 'connected' : 'disconnected')
      }
    } catch {
      setCrmStatus('disconnected')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        setMessage('Settings saved')
      } else {
        const data = await res.json()
        setMessage(data.error || 'Save failed')
      }
    } catch {
      setMessage('Network error')
    }
    setSaving(false)
  }

  async function handleTestEmail() {
    setTestSending(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_email' }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message || 'Test email sent')
      } else {
        setMessage(data.error || 'Test email failed')
      }
    } catch {
      setMessage('Network error')
    }
    setTestSending(false)
  }

  function toggleNotification(key: keyof NotificationSettings) {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }))
  }

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading email settings...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem' }}>Admin</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>/</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Email Settings</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Email & Notifications</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleTestEmail}
            disabled={testSending}
            style={{
              padding: '8px 16px', borderRadius: 8, background: 'rgba(0,212,255,0.15)',
              color: '#00d4ff', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
            }}
          >
            {testSending ? 'Sending...' : 'Send Test Email'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 16px', borderRadius: 8, background: saving ? 'var(--bg-card)' : 'var(--accent)',
              color: saving ? 'var(--text-muted)' : 'var(--bg-primary)', border: 'none', fontWeight: 700,
              fontSize: '0.75rem', cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '10px 16px', borderRadius: 12, marginBottom: 16, fontSize: '0.8125rem', fontWeight: 600,
          background: message.includes('fail') || message.includes('error') ? 'rgba(255,61,61,0.1)' : 'rgba(126,217,87,0.1)',
          color: message.includes('fail') || message.includes('error') ? '#ff3d3d' : 'var(--accent)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {message}
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>&times;</button>
        </div>
      )}

      {/* CRM Connection Status */}
      <div style={{
        padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: crmStatus === 'connected' ? '#7ed957' : crmStatus === 'checking' ? '#ff6b35' : '#ff3d3d',
          boxShadow: crmStatus === 'connected' ? '0 0 6px rgba(126,217,87,0.5)' : 'none',
        }} />
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>CRM Email Integration</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {crmStatus === 'connected' ? 'Connected — transactional emails route through CRM API' :
             crmStatus === 'checking' ? 'Checking connection...' :
             'Disconnected — set CRM_API_KEY in environment'}
          </div>
        </div>
      </div>

      {/* Notification Rules */}
      <div style={{
        padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
        marginBottom: 20,
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 16 }}>Notification Rules</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NotificationToggle
            label="Welcome email on signup"
            description="Send welcome email when a new user signs up and confirms email"
            enabled={settings.notifications.welcome_email}
            onToggle={() => toggleNotification('welcome_email')}
          />
          <NotificationToggle
            label="Password reset notifications"
            description="Send password reset email when requested"
            enabled={settings.notifications.password_reset}
            onToggle={() => toggleNotification('password_reset')}
          />
          <NotificationToggle
            label="Admin: New thread notifications"
            description="Notify admins when a new forum thread is created"
            enabled={settings.notifications.admin_new_thread}
            onToggle={() => toggleNotification('admin_new_thread')}
          />
          <NotificationToggle
            label="Weekly digest emails"
            description="Send a weekly summary to all users with forum highlights"
            enabled={settings.notifications.weekly_digest}
            onToggle={() => toggleNotification('weekly_digest')}
          />
        </div>
      </div>

      {/* Email Templates */}
      <div style={{
        padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 16 }}>Email Templates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {TEMPLATES.map(t => (
            <div key={t.key} style={{
              padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 8 }}>{t.description}</div>
              <div style={{
                display: 'inline-block', padding: '3px 8px', borderRadius: 4,
                background: 'rgba(126,217,87,0.1)', color: 'var(--accent)',
                fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
              }}>
                {settings.templates[t.key] || 'default'}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Templates are configured in Supabase Auth settings and CRM email builder.
        </p>
      </div>
    </div>
  )
}

function NotificationToggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      borderRadius: 10, background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{description}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          position: 'relative', transition: 'all 0.2s',
          background: enabled ? 'rgba(126,217,87,0.3)' : 'rgba(255,255,255,0.1)',
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', position: 'absolute', top: 3,
          left: enabled ? 23 : 3, transition: 'left 0.2s',
          background: enabled ? '#7ed957' : 'var(--text-muted)',
        }} />
      </button>
    </div>
  )
}
