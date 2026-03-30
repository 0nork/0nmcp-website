'use client'

import { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  {
    tag: 'Universal Orchestrator',
    headline: '900+ Tools. 55 Services. One Install.',
    body: 'Stripe, CRM, Slack, GitHub, Supabase, SendGrid, Twilio — and 48 more. Every tool your AI needs, accessible through a single MCP server.',
  },
  {
    tag: 'Every AI Platform',
    headline: 'Works With Claude, Gemini, Grok, Cursor, and More',
    body: 'Auto-generates configs for 7+ AI platforms. One codebase powers them all. No vendor lock-in. Switch models in seconds.',
  },
  {
    tag: 'Patent-Pending Security',
    headline: 'AES-256 Vault. Hardware-Bound. Zero Trust.',
    body: '0nVault encrypts credentials with AES-256-GCM, PBKDF2-SHA512, and hardware fingerprint binding. 4 patents filed. Cisco called the competition a "security nightmare."',
  },
  {
    tag: 'The .0n Standard',
    headline: 'Describe What You Want. Not How To Do It.',
    body: 'SWITCH files replace brittle workflows with declarative intent. Your config says WHAT to do — 0nMCP figures out HOW based on the user\'s connected services.',
  },
  {
    tag: 'CRM Integration',
    headline: '245 CRM Tools. Full Pipeline. Real Revenue.',
    body: 'Contacts, calendars, invoices, payments, social, opportunities — the deepest CRM integration in any MCP server. Built for agencies that need AI that makes money.',
  },
  {
    tag: 'Multi-AI Council',
    headline: '5 AI Models Debate. You Get the Best Answer.',
    body: 'GPT-4o, Gemini, Grok, Claude, and Llama respond in parallel. Cross-critique. Synthesize. Score against 7 reasoning personas. Superintelligence by committee.',
  },
  {
    tag: 'Open Source',
    headline: 'MIT Licensed. Free Forever. npm Install.',
    body: 'The core 0nMCP server is open source and always will be. No paywall on the engine. Marketplace executions start at $0.01 each.',
  },
]

const INTERVAL = 6000

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const goTo = useCallback((index: number, dir: 'next' | 'prev' = 'next') => {
    setDirection(dir)
    setCurrent(index)
  }, [])

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 'next')
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev')
  }, [current, goTo])

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [next])

  const slide = SLIDES[current]

  return (
    <section style={{
      background: '#f5f5f7',
      padding: '4rem 1.5rem',
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 16,
        padding: '3.5rem 3rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 260,
      }}>
        {/* Slide content */}
        <div
          key={current}
          style={{
            textAlign: 'center',
            animation: `slideIn${direction === 'next' ? 'Right' : 'Left'} 0.4s ease-out`,
          }}
        >
          {/* Tag */}
          <span style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 6,
            background: '#f0f0f0',
            fontSize: 12,
            fontWeight: 600,
            color: '#555',
            letterSpacing: '0.02em',
            marginBottom: 20,
          }}>
            {slide.tag}
          </span>

          {/* Headline */}
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 800,
            color: '#1a1a1a',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
          }}>
            {slide.headline}
          </h2>

          {/* Body */}
          <p style={{
            fontSize: 15,
            color: '#666',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto',
          }}>
            {slide.body}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: '#f0f0f0',
        }}>
          <div
            key={`progress-${current}`}
            style={{
              height: '100%',
              background: '#1a1a1a',
              animation: `progressBar ${INTERVAL}ms linear`,
              width: '100%',
              transformOrigin: 'left',
            }}
          />
        </div>
      </div>

      {/* Navigation arrows */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
      }}>
        <button
          onClick={prev}
          aria-label="Previous slide"
          style={{
            width: 40, height: 40,
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            color: '#999',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#1a1a1a' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.color = '#999' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          style={{
            width: 40, height: 40,
            borderRadius: 8,
            border: 'none',
            background: '#1a1a1a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            color: '#fff',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              background: i === current ? '#1a1a1a' : '#d0d0d0',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes progressBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  )
}
