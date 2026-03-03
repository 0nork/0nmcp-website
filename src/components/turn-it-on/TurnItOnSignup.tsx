'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type Step = 'email' | 'password' | 'launch'

export default function TurnItOnSignup() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on step change
  useEffect(() => {
    if (step !== 'launch') {
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [step])

  function transitionTo(next: Step) {
    setFadeState('out')
    setTimeout(() => {
      setStep(next)
      setError('')
      setFadeState('in')
    }, 300)
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    transitionTo('password')
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    transitionTo('launch')
  }

  async function handleLaunch() {
    setLoading(true)
    setError('')
    try {
      const supabase = createSupabaseBrowser()
      if (!supabase) throw new Error('Connection failed')

      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) {
        // If user exists, try sign in
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
          if (signInError) {
            setError(signInError.message)
            setLoading(false)
            return
          }
        } else {
          setError(signUpError.message)
          setLoading(false)
          return
        }
      }

      router.push('/console')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '520px',
        margin: '0 auto 2.5rem',
        background: '#000000',
        border: '2px solid #7ed957',
        borderRadius: '27px',
        padding: '2rem 2rem 1.75rem',
        boxShadow: '0 0 40px rgba(126, 217, 87, 0.15), 0 0 80px rgba(126, 217, 87, 0.06), inset 0 0 30px rgba(126, 217, 87, 0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '20%',
        right: '20%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #7ed957, transparent)',
        opacity: 0.6,
      }} />

      {/* Step content with fade */}
      <div
        style={{
          opacity: fadeState === 'in' ? 1 : 0,
          transform: fadeState === 'in' ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <label
              style={{
                display: 'block',
                fontSize: '1.125rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}
            >
              What&apos;s your email address?
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@company.com"
                autoComplete="email"
                style={{
                  width: '100%',
                  background: 'rgba(126, 217, 87, 0.04)',
                  border: '1px solid rgba(126, 217, 87, 0.25)',
                  borderRadius: '14px',
                  padding: '0.875rem 1.125rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  outline: 'none',
                  caretColor: '#7ed957',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7ed957'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(126, 217, 87, 0.25)'}
              />
            </div>
            {error && (
              <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                color: '#000000',
                fontSize: '0.9375rem',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 4px 20px rgba(126, 217, 87, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(126, 217, 87, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(126, 217, 87, 0.3)'
              }}
            >
              Continue
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              {email}
            </div>
            <label
              style={{
                display: 'block',
                fontSize: '1.125rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.01em',
              }}
            >
              Set a password.
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="6+ characters"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  background: 'rgba(126, 217, 87, 0.04)',
                  border: '1px solid rgba(126, 217, 87, 0.25)',
                  borderRadius: '14px',
                  padding: '0.875rem 1.125rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  outline: 'none',
                  caretColor: '#7ed957',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#7ed957'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(126, 217, 87, 0.25)'}
              />
            </div>
            {error && (
              <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                color: '#000000',
                fontSize: '0.9375rem',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 4px 20px rgba(126, 217, 87, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(126, 217, 87, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(126, 217, 87, 0.3)'
              }}
            >
              Continue
            </button>
          </form>
        )}

        {step === 'launch' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}>
              {email}
            </div>
            {error && (
              <div style={{ fontSize: '0.8rem', color: '#ef4444', marginBottom: '0.75rem', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button
              onClick={handleLaunch}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                border: '2px solid #7ed957',
                background: loading ? 'rgba(126, 217, 87, 0.15)' : 'linear-gradient(135deg, #7ed957, #5cb83a)',
                color: loading ? '#7ed957' : '#000000',
                fontSize: '1.125rem',
                fontWeight: 900,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 0 30px rgba(126, 217, 87, 0.35), 0 4px 20px rgba(126, 217, 87, 0.25)',
                animation: loading ? 'none' : 'launchPulse 2s ease-in-out infinite',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
                  e.currentTarget.style.boxShadow = '0 0 50px rgba(126, 217, 87, 0.45), 0 8px 30px rgba(126, 217, 87, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(126, 217, 87, 0.35), 0 4px 20px rgba(126, 217, 87, 0.25)'
              }}
            >
              {loading ? 'Launching...' : 'Launch Console'}
            </button>
          </div>
        )}
      </div>

      {/* Step indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '1.25rem',
      }}>
        {(['email', 'password', 'launch'] as Step[]).map((s, i) => (
          <div
            key={s}
            style={{
              width: step === s ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i <= ['email', 'password', 'launch'].indexOf(step) ? '#7ed957' : 'rgba(126, 217, 87, 0.15)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes launchPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(126, 217, 87, 0.35), 0 4px 20px rgba(126, 217, 87, 0.25); }
          50% { box-shadow: 0 0 50px rgba(126, 217, 87, 0.5), 0 4px 30px rgba(126, 217, 87, 0.35); }
        }
      `}</style>
    </div>
  )
}
