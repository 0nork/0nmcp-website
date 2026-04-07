'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export default function SpaAuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createSupabaseBrowser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, source: 'vip-spa' }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Registration failed. Please try again.')
          setLoading(false)
          return
        }
        // Sign in after registration
        if (supabase) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
          if (signInErr) {
            setError(signInErr.message)
            setLoading(false)
            return
          }
        }
        router.push('/console')
        router.refresh()
      } else {
        if (!supabase) {
          setError('Authentication not configured.')
          setLoading(false)
          return
        }
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) {
          setError(err.message)
          setLoading(false)
          return
        }
        router.push('/console')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'

  return (
    <div style={{
      width: '100%',
      maxWidth: '380px',
    }}>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '32px',
        fontWeight: 400,
        color: '#272727',
        margin: '0 0 8px',
        textAlign: 'center',
      }}>
        {isLogin ? 'Welcome Back' : 'Create Your Account'}
      </h2>
      <p style={{
        fontSize: '14px',
        color: 'rgba(39, 39, 39, 0.5)',
        textAlign: 'center',
        margin: '0 0 36px',
        letterSpacing: '0.3px',
      }}>
        {isLogin ? 'Sign in to your VIP portal' : 'Join as a VIP member'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: 'rgba(39, 39, 39, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '8px',
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '15px',
              fontFamily: "'Lato', sans-serif",
              color: '#272727',
              background: '#F4DCD0',
              border: '1px solid rgba(87, 3, 1, 0.12)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C8792D' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(87, 3, 1, 0.12)' }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: 'rgba(39, 39, 39, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '8px',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            minLength={6}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '15px',
              fontFamily: "'Lato', sans-serif",
              color: '#272727',
              background: '#F4DCD0',
              border: '1px solid rgba(87, 3, 1, 0.12)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C8792D' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(87, 3, 1, 0.12)' }}
          />
        </div>

        {error && (
          <p style={{
            fontSize: '13px',
            color: '#570301',
            background: 'rgba(87, 3, 1, 0.06)',
            padding: '10px 14px',
            borderRadius: '6px',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '14px',
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            color: '#ffffff',
            background: loading ? 'rgba(200, 121, 45, 0.6)' : '#C8792D',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            transition: 'background 0.2s, transform 0.1s',
            marginTop: '4px',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#b56a25' }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C8792D' }}
        >
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      {/* Toggle */}
      <p style={{
        textAlign: 'center',
        fontSize: '14px',
        color: 'rgba(39, 39, 39, 0.5)',
        marginTop: '28px',
      }}>
        {isLogin ? 'New here? ' : 'Already have one? '}
        <button
          type="button"
          onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError('') }}
          style={{
            background: 'none',
            border: 'none',
            color: '#C8792D',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Lato', sans-serif",
            fontSize: '14px',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          {isLogin ? 'Create an account' : 'Sign in'}
        </button>
      </p>

      {/* Contact info */}
      <div style={{
        width: '40px',
        height: '1px',
        background: 'rgba(39, 39, 39, 0.1)',
        margin: '36px auto 20px',
      }} />
      <p style={{
        textAlign: 'center',
        fontSize: '13px',
        color: 'rgba(39, 39, 39, 0.35)',
        margin: 0,
        letterSpacing: '0.5px',
      }}>
        (724) 238-9800 &middot; spaligonier.com
      </p>
    </div>
  )
}
