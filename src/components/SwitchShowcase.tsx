'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SAMPLE_SWITCH = `{
  "$0n": {
    "type": "switch",
    "name": "RocketOpp — Full Product Suite",
    "version": "1.0.0",
    "author": "Mike @ RocketOpp"
  },
  "identity": {
    "owner": "RocketOpp LLC",
    "brand": "0nORK"
  },
  "products": {
    "rocket_command": {
      "name": "Rocket Command",
      "domain": "command.rocketclients.com"
    },
    "rocket_add": {
      "name": "Rocket Add",
      "domain": "rocketadd.com"
    },
    "onork_app": {
      "name": "0nork App",
      "domain": "app.0nork.com"
    },
    "...": { "name": "5 more products" }
  },
  "connections": {
    "crm": { "tools": 245 },
    "stripe": { "account": "acct_***" },
    "supabase": { "project": "***" },
    "vercel": { "team": "***" },
    "github": { "org": "***" },
    "sendgrid": { "verified": true },
    "anthropic": { "model": "claude-opus-4-6" },
    "google_analytics": { "property": "***" }
  }
}`

const FEATURES = [
  '8 products',
  '8 connections',
  'Skill-ready',
]

export default function SwitchShowcase() {
  const [visibleChars, setVisibleChars] = useState(0)
  const [animationDone, setAnimationDone] = useState(false)

  useEffect(() => {
    if (animationDone) return
    const total = SAMPLE_SWITCH.length
    const interval = setInterval(() => {
      setVisibleChars((prev) => {
        const next = prev + 3
        if (next >= total) {
          clearInterval(interval)
          setAnimationDone(true)
          return total
        }
        return next
      })
    }, 8)
    return () => clearInterval(interval)
  }, [animationDone])

  return (
    <div style={{
      position: 'relative',
      maxWidth: '420px',
      width: '100%',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        animation: 'switchShowcaseGlow 4s ease-in-out infinite alternate',
      }}>
        {/* Heading */}
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
          letterSpacing: '-0.02em',
        }}>
          Your entire business in one file
        </h3>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          fontFamily: 'var(--font-mono)',
        }}>
          .0n SWITCH file format
        </p>

        {/* Code block */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          padding: '0.875rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Title bar dots */}
          <div style={{
            display: 'flex',
            gap: '0.375rem',
            marginBottom: '0.75rem',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28c840' }} />
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.5625rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              rocketopp.0n.json
            </span>
          </div>

          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5625rem',
            lineHeight: '1.5',
            color: 'var(--text-secondary)',
            margin: 0,
            overflow: 'hidden',
            maxHeight: '16rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all' as const,
          }}>
            <code>
              <span style={{ color: 'var(--text-secondary)' }}>
                {SAMPLE_SWITCH.slice(0, visibleChars)}
              </span>
              {!animationDone && (
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '12px',
                  backgroundColor: 'var(--accent)',
                  marginLeft: '1px',
                  animation: 'cursorBlink 1s step-end infinite',
                }} />
              )}
            </code>
          </pre>

          {/* Gradient fade at bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2.5rem',
            background: 'linear-gradient(transparent, var(--bg-primary))',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Feature pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
        }}>
          {FEATURES.map((f) => (
            <span key={f} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.25rem 0.625rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--accent)',
              letterSpacing: '0.02em',
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/login?redirect=/account"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: 'var(--accent)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(126, 217, 87, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Sign in to import
        </Link>

        {/* Subtle border glow animation via pseudo-element workaround with box-shadow */}
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes switchShowcaseGlow {
          0% {
            box-shadow: 0 0 0 rgba(126, 217, 87, 0);
          }
          100% {
            box-shadow: 0 0 30px rgba(126, 217, 87, 0.06), 0 0 60px rgba(126, 217, 87, 0.03);
          }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
