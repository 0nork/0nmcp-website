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

        {/* Multi-color radial glows */}
        <div className="hero-glow hero-glow-green" />
        <div className="hero-glow hero-glow-purple" />
        <div className="hero-glow hero-glow-blue" />

        {/* Animated digital particles — green, purple, blue mix */}
        <div className="hero-particles">
          {Array.from({ length: 50 }).map((_, i) => {
            const colors = ['#00ff88', '#a78bfa', '#00d4ff', '#00ff88', '#a78bfa', '#00d4ff']
            const color = colors[i % colors.length]
            const size = 1 + Math.random() * 2.5
            return (
              <span
                key={i}
                className="hero-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${5 + Math.random() * 6}s`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  boxShadow: `0 0 ${4 + Math.random() * 8}px ${color}`,
                }}
              />
            )
          })}
        </div>

        {/* Scan lines — vertical and horizontal, random fade in/out */}
        <div className="hero-scanlines">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="hero-line hero-line-h"
              style={{
                animationDelay: `${i * 2.5 + Math.random() * 2}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
                top: `${10 + Math.random() * 80}%`,
              }}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="hero-line hero-line-v"
              style={{
                animationDelay: `${i * 2 + Math.random() * 3}s`,
                animationDuration: `${7 + Math.random() * 5}s`,
                left: `${10 + Math.random() * 80}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge animate-fade-in-up">
          <span className="hero-badge-dot" />
          <span>v2.2.0 — 819 tools live</span>
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
            { target: 819, suffix: '', label: 'Tools' },
            { target: 48, suffix: '', label: 'Services' },
            { target: 1078, suffix: '', label: 'Capabilities' },
            { target: 21, suffix: '', label: 'Categories' },
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
