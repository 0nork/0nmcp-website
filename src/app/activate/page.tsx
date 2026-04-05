'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ActivatePage() {
  return (
    <Suspense>
      <ActivateFlow />
    </Suspense>
  )
}

function ActivateFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillCode = searchParams.get('code') || ''

  const [step, setStep] = useState<'code' | 'auth' | 'approving' | 'done'>('code')
  const [code, setCode] = useState(prefillCode)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<{ platform?: string; device_name?: string } | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const supabase = createSupabaseBrowser()

  // Auto-submit if code came from URL
  useEffect(() => {
    if (prefillCode && prefillCode.length >= 8) {
      validateCode(prefillCode.replace('-', ''))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check if user is already logged in
  useEffect(() => {
    if (step === 'code' || step === 'auth') {
      supabase?.auth.getUser().then(({ data: { user } }) => {
        if (user && step === 'auth') {
          // Already logged in — skip to approval
          setStep('approving')
          approveCode(code)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  async function validateCode(rawCode: string) {
    const formatted = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    if (formatted.length !== 8) {
      setError('Code must be 8 characters')
      return
    }
    const userCode = `${formatted.slice(0, 4)}-${formatted.slice(4)}`
    setCode(userCode)
    setLoading(true)
    setError('')

    // Verify code exists
    const res = await fetch('/api/auth/device/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_code: userCode }),
    })

    if (!res.ok) {
      setError('Invalid or expired code. Check your terminal.')
      setLoading(false)
      return
    }

    const data = await res.json()
    setDeviceInfo({ platform: data.platform, device_name: data.device_name })
    setLoading(false)

    // Check if already logged in
    const { data: { user } } = await supabase!.auth.getUser()
    if (user) {
      setStep('approving')
      approveCode(userCode)
    } else {
      setStep('auth')
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!supabase) { setError('Auth not configured'); setLoading(false); return }

    if (isSignup) {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/activate?code=${code}`,
        },
      })
      if (err) { setError(err.message); setLoading(false); return }
      // For signup, we auto-confirm if possible (dev) or wait for email
      // Try to sign in immediately (works if email confirmation is disabled)
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInErr) {
        setStep('approving')
        await approveCode(code)
      } else {
        setError('Check your email to confirm, then come back to this page.')
        setLoading(false)
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      setStep('approving')
      await approveCode(code)
    }
  }

  async function approveCode(userCode: string) {
    setLoading(true)
    const res = await fetch('/api/auth/device/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_code: userCode, action: 'approve' }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to approve')
      setStep('code')
      setLoading(false)
      return
    }

    setStep('done')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans, system-ui)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 0 60px rgba(110, 224, 90, 0.05)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#6EE05A',
            letterSpacing: '-0.02em',
          }}>0n</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Turn it 0n
          </div>
        </div>

        {/* Step: Enter Code */}
        {step === 'code' && (
          <>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '0.5rem' }}>
              Activate your device
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '1.5rem' }}>
              Enter the code shown in your terminal
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {Array.from({ length: 8 }, (_, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  maxLength={1}
                  value={code.replace('-', '')[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    const current = code.replace('-', '').split('')
                    current[i] = val
                    const joined = current.join('')
                    setCode(joined.length > 4 ? `${joined.slice(0, 4)}-${joined.slice(4)}` : joined)
                    if (val && i < 7) inputRefs.current[i + 1]?.focus()
                    if (joined.length === 8) validateCode(joined)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code.replace('-', '')[i] && i > 0) {
                      inputRefs.current[i - 1]?.focus()
                    }
                  }}
                  style={{
                    width: '44px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    background: 'var(--bg-card)',
                    border: '2px solid #1a1a2e',
                    borderRadius: '8px',
                    color: '#6EE05A',
                    outline: 'none',
                    ...(i === 3 ? { marginRight: '12px' } : {}),
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.8125rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
            {loading && <p style={{ color: '#6EE05A', fontSize: '0.8125rem', textAlign: 'center' }}>Verifying...</p>}
          </>
        )}

        {/* Step: Sign In or Sign Up */}
        {step === 'auth' && (
          <>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '0.5rem' }}>
              {isSignup ? 'Create your 0n account' : 'Sign in to approve'}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '1.5rem' }}>
              Connecting device: <span style={{ color: '#6EE05A', fontFamily: 'var(--font-mono, monospace)' }}>{deviceInfo?.device_name || 'CLI'}</span>
            </p>

            {error && <p style={{ color: '#ef4444', fontSize: '0.8125rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {isSignup && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  style={inputStyle}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
              />
              <button type="submit" disabled={loading} style={{
                padding: '12px',
                background: '#6EE05A',
                color: '#000',
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Working...' : isSignup ? 'Create Account & Approve' : 'Sign In & Approve'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsSignup(!isSignup); setError('') }} style={{
                background: 'none', border: 'none', color: '#6EE05A', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem',
              }}>
                {isSignup ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </>
        )}

        {/* Step: Approving */}
        {step === 'approving' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: '3px solid #6EE05A', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', animation: 'pulse 1.5s infinite',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Turning it 0n...</h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>Provisioning your account. Check your terminal.</p>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(110, 224, 90, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6EE05A', marginBottom: '0.5rem' }}>You&apos;re 0n.</h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
              Your device is connected. Return to your terminal to continue.
            </p>
            <Link href="/dashboard" style={{
              display: 'inline-block', padding: '10px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
            }}>
              Go to Console
            </Link>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
        `}</style>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
}
