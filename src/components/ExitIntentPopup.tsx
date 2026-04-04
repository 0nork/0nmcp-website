'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const readyRef = useRef(false)

  // Countdown to May 1, 2026
  useEffect(() => {
    const target = new Date('2026-05-01T00:00:00-04:00').getTime()
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  // 5-second delay before arming
  useEffect(() => {
    const timer = setTimeout(() => {
      readyRef.current = true
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (
      e.clientY > 0 ||
      !readyRef.current ||
      document.cookie.includes('0n_exit_dismissed')
    ) return

    document.cookie = `0n_exit_dismissed=1; path=/; max-age=86400; SameSite=Lax`
    setVisible(true)
  }, [])

  useEffect(() => {
    // Don't mount if already shown this session
    if (typeof window !== 'undefined' && document.cookie.includes('0n_exit_dismissed')) return

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [handleMouseLeave])

  function close() {
    setVisible(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Exit Intent', email, type: 'exit-intent', source: 'exit-popup' }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  const timerBoxStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(245,245,245,0.7)',
    borderRadius: 10,
    padding: '8px 12px',
    minWidth: 56,
    backdropFilter: 'blur(4px)',
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'exitOverlayIn 0.3s ease forwards',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            maxWidth: 420,
            width: '90vw',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            padding: '36px 32px 28px',
            animation: 'exitCardIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Close button */}
          <button
            onClick={close}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
              fontSize: 20,
              color: '#999',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </svg>
          </button>

          {submitted ? (
            /* ── Success State ── */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6EE05A, #4CAF50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>
                You&apos;re in!
              </h3>
              <p style={{ fontSize: 14, color: '#555', margin: 0 }}>
                Check your email for next steps.
              </p>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', margin: '0 0 8px', textAlign: 'center' }}>
                Don&apos;t Leave Yet!
              </h2>
              <p style={{ fontSize: 14, color: '#555', margin: '0 0 20px', textAlign: 'center', lineHeight: 1.5 }}>
                Pre-register before our May 1st launch and get 30 days free.
              </p>

              {/* Countdown */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hours' },
                  { value: countdown.minutes, label: 'Min' },
                  { value: countdown.seconds, label: 'Sec' },
                ].map(({ value, label }) => (
                  <div key={label} style={timerBoxStyle}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums' }}>
                      {String(value).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 15,
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 12,
                    outline: 'none',
                    background: 'rgba(255,255,255,0.6)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                    color: '#1a1a1a',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6EE05A'
                    e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.06), 0 0 0 3px rgba(110,224,90,0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
                    e.currentTarget.style.boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.06)'
                  }}
                />
                {error && (
                  <p style={{ color: '#e53e3e', fontSize: 13, margin: 0, textAlign: 'center' }}>{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px 24px',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#fff',
                    background: '#1a1a1a',
                    border: 'none',
                    borderRadius: 12,
                    cursor: loading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {loading ? 'Submitting...' : 'Claim My Free 30 Days'}
                </button>
              </form>

              <button
                onClick={close}
                style={{
                  display: 'block',
                  margin: '14px auto 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#999',
                  padding: '4px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#666'
                  e.currentTarget.style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#999'
                  e.currentTarget.style.textDecoration = 'none'
                }}
              >
                No thanks, I&apos;ll pay full price.
              </button>
            </>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes exitOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes exitCardIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
