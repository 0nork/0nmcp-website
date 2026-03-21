'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import OAuthButtons from '@/components/OAuthButtons'

const VoidLoader = dynamic(() => import('@/components/VoidLoader'), { ssr: false })

export default function StartPage() {
  return <Suspense><StartForm /></Suspense>
}

function StartForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/0nboarding'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [provisioning, setProvisioning] = useState(false)

  const supabase = createSupabaseBrowser()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!supabase) { setError('Auth not configured'); return }

    setLoading(true)

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (err) { setError(err.message); setLoading(false); return }

    // Show provisioning animation
    setProvisioning(true)

    // Give the auth callback time to fire CRM provisioning
    setTimeout(() => {
      router.push('/0nboarding')
    }, 3000)
  }

  if (provisioning) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <VoidLoader size={350} message="Setting up your account..." />
        <p style={{ color: 'rgba(126,217,87,0.6)', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", marginTop: '1rem', letterSpacing: '0.1em' }}>
          PROVISIONING CRM • CREATING VAULT • DEPLOYING AI
        </p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050505',
      display: 'flex', fontFamily: "'Instrument Sans', system-ui, sans-serif",
    }}>

      {/* Left — VoidLoader visualization */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <style>{`
          @media (max-width: 768px) {
            .start-left { display: none !important; }
            .start-right { flex: 1 !important; }
          }
        `}</style>

        <div className="start-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <VoidLoader size={400} />

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(126,217,87,0.5)', marginBottom: '0.75rem' }}>
              Three-Level Execution
            </div>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              {[
                { label: 'Pipeline', color: '#7ed957' },
                { label: 'Assembly', color: '#00d4ff' },
                { label: 'Radial Burst', color: '#a78bfa' },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}66` }} />
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', maxWidth: '320px' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e1e8f0', lineHeight: 1.4, margin: '0 0 0.5rem' }}>
              Build AI agents that <span style={{ color: '#7ed957' }}>actually execute.</span>
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>
              1,229 tools. 54 services. Your agents think, decide, and take action — across everything.
            </p>
          </div>
        </div>
      </div>

      {/* Right — Sign Up Form */}
      <div className="start-right" style={{
        width: '480px', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '3rem',
        background: '#0a0c10',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '360px', width: '100%', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem',
              fontWeight: 800, color: '#7ed957', marginBottom: '0.375rem',
            }}>
              0nMCP
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e1e8f0', margin: '0 0 0.375rem' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Free forever. No credit card required.
            </p>
          </div>

          {/* OAuth */}
          <OAuthButtons mode="signup" redirectTo={redirect} />

          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            margin: '1.25rem 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            or sign up with email
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.625rem 0.875rem', borderRadius: '8px', marginBottom: '1rem',
              background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)',
              color: '#ff6b6b', fontSize: '0.8125rem',
            }}>{error}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.375rem' }}>Full name</label>
              <input
                value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Your name" required
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e1e8f0', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(126,217,87,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.375rem' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required autoComplete="email"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e1e8f0', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(126,217,87,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.375rem' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="8+ characters" required autoComplete="new-password"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e1e8f0', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(126,217,87,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '0.875rem', borderRadius: '10px', border: 'none',
              background: loading ? 'rgba(126,217,87,0.3)' : '#7ed957',
              color: '#000', fontSize: '0.9375rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              marginTop: '0.25rem', transition: 'all 0.15s',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(126,217,87,0.25)',
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#7ed957', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}
