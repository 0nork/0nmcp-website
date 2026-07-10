'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface VipAccount {
  id: string
  slug: string
  company_name: string
  owner_name: string | null
  email: string
  user_id: string | null
  branding: { logo: string | null; primary_color: string; accent_color: string }
  dashboard_config: { widgets: string[] }
  features: Record<string, boolean>
  status: string
}

export default function PortalShell({ account }: { account: VipAccount }) {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const primary = account.branding?.primary_color || '#7ed957'
  const accent = account.branding?.accent_color || '#00d4ff'

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && account.user_id && session.user.id === account.user_id) {
        setAuthed(true)
      } else if (session && session.user.email === account.email) {
        setAuthed(true)
      }
      setLoading(false)
    })
  }, [account])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoggingIn(true)
    const supabase = createSupabaseBrowser()
    if (!supabase) { setError('Auth not available'); setLoggingIn(false); return }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoggingIn(false); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (session && (session.user.email === account.email || session.user.id === account.user_id)) {
      setAuthed(true)
    } else {
      setError('This account does not have access to this portal.')
      await supabase.auth.signOut()
    }
    setLoggingIn(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${primary}33`, borderTopColor: primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  /* ── LOGIN GATE ── */
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Branding */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {account.branding?.logo ? (
              <img src={account.branding.logo} alt={account.company_name} style={{ height: 48, marginBottom: 16 }} />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: '#000',
              }}>{account.company_name.charAt(0)}</div>
            )}
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem',
              fontFamily: 'var(--font-display, system-ui)',
            }}>{account.company_name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to your portal</p>
          </div>

          {/* Login Form */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '2rem',
          }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '0.75rem', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem',
              }}>{error}</div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required autoFocus
                  style={{
                    width: '100%', height: 44, borderRadius: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', padding: '0 0.875rem', fontSize: '0.9rem', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" required
                  style={{
                    width: '100%', height: 44, borderRadius: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', padding: '0 0.875rem', fontSize: '0.9rem', outline: 'none',
                  }}
                />
              </div>
              <button type="submit" disabled={loggingIn} style={{
                width: '100%', height: 48, borderRadius: 8,
                background: primary, color: '#000', border: 'none',
                fontSize: '0.95rem', fontWeight: 700, cursor: loggingIn ? 'wait' : 'pointer',
                fontFamily: 'var(--font-display, system-ui)',
              }}>{loggingIn ? 'Signing in...' : 'Sign In'}</button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Powered by 0nMCP
          </p>
        </div>
      </div>
    )
  }

  /* ── DASHBOARD SHELL ── */
  const widgets = account.dashboard_config?.widgets || ['contacts', 'pipeline', 'chat', 'calendar', 'tasks']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top Bar */}
      <header style={{
        height: 56, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#000',
          }}>{account.company_name.charAt(0)}</div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{account.company_name}</span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
            background: `${primary}20`, color: primary, textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>VIP</span>
        </div>
        <button onClick={async () => {
          const s = createSupabaseBrowser()
          if (s) await s.auth.signOut()
          router.refresh()
          setAuthed(false)
        }} style={{
          padding: '6px 14px', borderRadius: 6, background: 'var(--bg-card)',
          border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
        }}>Sign Out</button>
      </header>

      {/* Dashboard Grid */}
      <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Welcome back{account.owner_name ? `, ${account.owner_name.split(' ')[0]}` : ''}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {widgets.map(w => (
            <div key={w} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '1.5rem', minHeight: 200,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: w === 'chat' ? accent : w === 'pipeline' ? '#a78bfa' : w === 'calendar' ? '#f59e0b' : primary,
                }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{w}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {w === 'contacts' && 'Manage your contacts and client relationships'}
                {w === 'pipeline' && 'Track deals and opportunities through stages'}
                {w === 'chat' && 'AI-powered assistant — ask anything'}
                {w === 'calendar' && 'Appointments, scheduling, and availability'}
                {w === 'tasks' && 'To-do items, projects, and deadlines'}
                {w === 'files' && 'Documents, uploads, and shared resources'}
                {w === 'analytics' && 'Reports, metrics, and performance data'}
              </p>
              <div style={{
                marginTop: '1rem', padding: '2rem', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)',
                textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem',
              }}>Coming soon</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-primary)', fontSize: '0.7rem' }}>
        Powered by 0nMCP — 1,640+ tools across 111 services
      </footer>
    </div>
  )
}
