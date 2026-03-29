'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

const LAUNCH_DATE = new Date('2026-05-01T00:00:00-04:00').getTime()

function useCountdown() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const diff = Math.max(0, LAUNCH_DATE - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

export default function RequestAccessPage() {
  const countdown = useCountdown()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '100vh', paddingTop: '8rem' }}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-glow-secondary" aria-hidden="true" />

        <div className="hero-content" style={{ maxWidth: '820px' }}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Launching May 1, 2026</span>
          </div>

          <h1 className="hero-title" style={{ marginBottom: '2rem' }}>
            The Future of<br />
            <span className="hero-title-accent">AI Orchestration</span><br />
            is Almost Here.
          </h1>

          {/* Countdown Timer */}
          <div className="ra-countdown">
            <div className="ra-countdown-item">
              <span className="ra-countdown-number">{String(countdown.days).padStart(2, '0')}</span>
              <span className="ra-countdown-label">Days</span>
            </div>
            <span className="ra-countdown-sep">:</span>
            <div className="ra-countdown-item">
              <span className="ra-countdown-number">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="ra-countdown-label">Hours</span>
            </div>
            <span className="ra-countdown-sep">:</span>
            <div className="ra-countdown-item">
              <span className="ra-countdown-number">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="ra-countdown-label">Minutes</span>
            </div>
            <span className="ra-countdown-sep">:</span>
            <div className="ra-countdown-item">
              <span className="ra-countdown-number">{String(countdown.seconds).padStart(2, '0')}</span>
              <span className="ra-countdown-label">Seconds</span>
            </div>
          </div>

          <p className="hero-subtitle" style={{ maxWidth: '620px', marginBottom: '3rem' }}>
            The universal AI orchestrator launches May 1st. <strong>{STATS_DISPLAY.tools} tools</strong> across <strong>{STATS_DISPLAY.services} services</strong>.
            Request early access now.
          </p>

          {/* Form or Thank You */}
          {!submitted ? (
            <div className="ra-form-container">
              <h2 className="ra-form-title">Request Early Access</h2>
              {error && <div className="ra-error">{error}</div>}

              <form onSubmit={handleSubmit} className="ra-form">
                <div className="ra-form-row">
                  <div className="ra-field">
                    <label htmlFor="ra-name">Full name</label>
                    <input
                      id="ra-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      required
                      autoFocus
                      autoComplete="name"
                    />
                  </div>
                  <div className="ra-field">
                    <label htmlFor="ra-company">Company <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      id="ra-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Inc"
                      autoComplete="organization"
                    />
                  </div>
                </div>

                <div className="ra-field">
                  <label htmlFor="ra-email">Email</label>
                  <input
                    id="ra-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="hero-cta-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? 'Reserving your spot...' : 'Request Early Access'}
                </button>
              </form>

              <p className="ra-note">
                Already have an account? <Link href="/login">Sign in</Link>
              </p>
            </div>
          ) : (
            <div className="ra-thankyou">
              <div className="ra-thankyou-icon">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="27" stroke="var(--accent)" strokeWidth="2" />
                  <path d="M16 28l8 8 16-16" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="ra-thankyou-title">Your spot is reserved.</h2>
              <p className="ra-thankyou-subtitle">
                Launch: <strong>May 1, 2026</strong>. We&apos;ll send you early access details at <strong>{email}</strong>.
              </p>

              {/* Pre-reserve upsell */}
              <div className="ra-prereserve">
                <h3 className="ra-prereserve-title">Want guaranteed access on day one?</h3>
                <p className="ra-prereserve-desc">
                  Pre-reserve your account for <strong>$50</strong> (credited to your first month).
                  Skip the waitlist and get priority onboarding.
                </p>
                <a
                  href="https://buy.stripe.com/test_00g00000000000000"
                  className="hero-cta-primary"
                  style={{ display: 'inline-flex' }}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Build Stripe checkout URL with prefilled email
                    const url = new URL('https://buy.stripe.com/test_00g00000000000000')
                    url.searchParams.set('prefilled_email', email)
                    window.open(url.toString(), '_blank')
                  }}
                >
                  Pre-reserve for $50
                </a>
                <p className="ra-prereserve-note">
                  100% credited to your first month. Cancel anytime before launch for a full refund.
                </p>
              </div>

              <p className="ra-note" style={{ marginTop: '2rem' }}>
                Already have an account? <Link href="/login">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <span className="stat-value">{STATS_DISPLAY.tools}</span>
            <span className="stat-label">Tools</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{STATS_DISPLAY.services}</span>
            <span className="stat-label">Services</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">7</span>
            <span className="stat-label">AI Platforms</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">5</span>
            <span className="stat-label">Patents</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">MIT</span>
            <span className="stat-label">Licensed</span>
          </div>
        </div>
      </section>
    </div>
  )
}
