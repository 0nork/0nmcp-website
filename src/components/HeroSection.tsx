'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import CopyButton from './CopyButton'

/* ── Animated counter that counts up from 0 ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const duration = 2200
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    const id = setTimeout(() => requestAnimationFrame(tick), 600)
    return () => clearTimeout(id)
  }, [target])

  return (
    <>
      {count}
      {suffix}
    </>
  )
}

/* ── Orbital service dots ── */
const ORBIT_SERVICES = [
  { name: 'Stripe', color: '#635bff' },
  { name: 'Slack', color: '#e01e5a' },
  { name: 'GitHub', color: '#f0f6fc' },
  { name: 'OpenAI', color: '#10a37f' },
  { name: 'Discord', color: '#5865f2' },
  { name: 'Notion', color: '#ffffff' },
  { name: 'Twilio', color: '#f22f46' },
  { name: 'Gmail', color: '#ea4335' },
  { name: 'Shopify', color: '#96bf48' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'Jira', color: '#0052cc' },
  { name: 'HubSpot', color: '#ff7a59' },
]

export default function HeroSection() {
  const [typed, setTyped] = useState('')
  const fullText = 'Stop building workflows. Start describing outcomes.'

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i))
        i++
      } else {
        clearInterval(id)
      }
    }, 32)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="hero-section">
      {/* ── Background layers ── */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-radial" />
        <div className="hero-rings">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
        </div>

        {/* Floating particles */}
        <div className="hero-particles">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="hero-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
              }}
            />
          ))}
        </div>

        {/* Scan line */}
        <div className="hero-scan-line" />

        {/* Orbital ring of services */}
        <div className="hero-orbit">
          {ORBIT_SERVICES.map((s, i) => {
            const angle = (360 / ORBIT_SERVICES.length) * i
            return (
              <div
                key={s.name}
                className="hero-orbit-dot"
                style={
                  {
                    '--angle': `${angle}deg`,
                    '--dot-color': s.color,
                  } as React.CSSProperties
                }
                title={s.name}
              >
                <span className="hero-orbit-label">{s.name[0]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge animate-fade-in-up">
          <span className="hero-badge-dot" />
          <span>v1.7.0 — 545 tools live</span>
        </div>

        {/* Headline */}
        <h1
          className="hero-headline animate-fade-in-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          The Universal AI
          <br />
          <span className="hero-gradient-text">API Orchestrator</span>
        </h1>

        {/* Turn it 0n */}
        <p
          className="hero-glow-line animate-fade-in-up"
          style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
        >
          Turn it 0n.
        </p>

        {/* Typewriter tagline */}
        <p
          className="hero-tagline animate-fade-in-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          {typed}
          <span className="hero-cursor">|</span>
        </p>

        {/* CTAs */}
        <div
          className="hero-ctas animate-fade-in-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          <Link href="/turn-it-on" className="hero-cta-primary no-underline">
            Turn it 0n <span className="hero-cta-arrow">&rarr;</span>
          </Link>
          <CopyButton text="npm i 0nmcp" display="npm i 0nmcp" />
        </div>

        {/* Animated stats */}
        <div
          className="hero-stats animate-fade-in-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          {[
            { target: 545, suffix: '', label: 'Tools' },
            { target: 26, suffix: '', label: 'Services' },
            { target: 80, suffix: '+', label: 'Automations' },
            { target: 13, suffix: '', label: 'Categories' },
          ].map((stat) => (
            <div key={stat.label} className="hero-stat">
              <span className="hero-stat-num">
                <Counter target={stat.target} suffix={stat.suffix} />
              </span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div
          className="hero-trust animate-fade-in-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
        >
          {[
            { label: 'AES-256 Encrypted', color: '#00ff88' },
            { label: 'HMAC Signed', color: '#00d4ff' },
            { label: 'MIT Licensed', color: '#a78bfa' },
            { label: 'Patent Pending', color: '#ff6b35' },
            { label: 'Free Forever', color: '#00ff88' },
          ].map((t) => (
            <span key={t.label} className="hero-trust-item">
              <span
                className="hero-trust-dot"
                style={{ backgroundColor: t.color }}
              />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" aria-hidden="true">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-dot" />
        </div>
      </div>
    </section>
  )
}
