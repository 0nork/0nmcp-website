'use client'

import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

const SERVICES = [
  { name: 'Stripe', abbr: 'St', color: '#635bff' },
  { name: 'Slack', abbr: 'Sl', color: '#4a154b' },
  { name: 'CRM', abbr: 'CR', color: '#ff6b35' },
  { name: 'GitHub', abbr: 'Gh', color: '#f0f0f0' },
  { name: 'Supabase', abbr: 'Sb', color: '#3ecf8e' },
  { name: 'LinkedIn', abbr: 'Li', color: '#0a66c2' },
  { name: 'OpenAI', abbr: 'Oa', color: '#10a37f' },
  { name: 'Shopify', abbr: 'Sh', color: '#96bf48' },
]

export default function AnimatedHero() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem 4rem',
        marginTop: '-1px',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Subtle radial glow behind the hub */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 600,
          height: 600,
          transform: 'translate(-50%, -45%)',
          background: 'radial-gradient(circle, rgba(126,217,87,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.1,
          animation: 'heroFadeUp 0.8s ease-out both',
        }}
      >
        <span style={{ color: '#7ed957' }}>0n</span>MCP
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          margin: '12px 0 0',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          animation: 'heroFadeUp 0.8s ease-out 0.15s both',
        }}
      >
        One Brain. Every Service. Zero Limits.
      </p>

      {/* ── Orbital Visualization ── */}
      <div
        style={{
          position: 'relative',
          width: 340,
          height: 340,
          margin: '3rem auto 2.5rem',
          animation: 'heroFadeUp 0.8s ease-out 0.3s both',
        }}
      >
        {/* Orbit ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(126,217,87,0.12)',
          }}
        />

        {/* Dashed orbit ring (rotating) */}
        <div
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            border: '1px dashed rgba(126,217,87,0.08)',
            animation: 'orbitSpin 60s linear infinite',
          }}
        />

        {/* Center hub */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 72,
            height: 72,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 900,
            color: 'var(--text-primary)',
            boxShadow: '0 0 40px rgba(126,217,87,0.3), 0 0 80px rgba(126,217,87,0.1)',
            animation: 'hubPulse 3s ease-in-out infinite',
            zIndex: 2,
          }}
        >
          0n
        </div>

        {/* Service nodes positioned around the circle */}
        {SERVICES.map((svc, i) => {
          const angle = (i / SERVICES.length) * 360
          const rad = (angle * Math.PI) / 180
          const radius = 150
          const x = 170 + Math.cos(rad) * radius - 22
          const y = 170 + Math.sin(rad) * radius - 22

          return (
            <div key={svc.name}>
              {/* Dashed connection line (SVG) */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 340,
                  height: 340,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                <line
                  x1={170}
                  y1={170}
                  x2={x + 22}
                  y2={y + 22}
                  stroke="rgba(126,217,87,0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  style={{
                    animation: `lineGrow 1.2s ease-out ${0.4 + i * 0.1}s both`,
                  }}
                />
                {/* Data pulse traveling along the line */}
                <circle r="2" fill="#7ed957" opacity="0.6">
                  <animateMotion
                    dur={`${2.5 + i * 0.3}s`}
                    repeatCount="indefinite"
                    path={`M${x + 22},${y + 22} L170,170`}
                  />
                </circle>
              </svg>

              {/* Service node */}
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: `2px solid ${svc.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                  animation: `nodeAppear 0.5s ease-out ${0.5 + i * 0.1}s both`,
                  boxShadow: `0 0 12px ${svc.color}33`,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: svc.color,
                    lineHeight: 1,
                  }}
                >
                  {svc.abbr}
                </span>
                <span
                  style={{
                    fontSize: 7,
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1,
                    marginTop: 2,
                  }}
                >
                  {svc.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          flexWrap: 'wrap',
          fontSize: 14,
          color: 'rgba(255,255,255,0.45)',
          fontWeight: 600,
          letterSpacing: '0.01em',
          animation: 'heroFadeUp 0.8s ease-out 0.5s both',
          marginBottom: '2rem',
        }}
      >
        <span>
          <span style={{ color: '#7ed957' }}>{STATS_DISPLAY.tools}</span> tools
        </span>
        <span style={{ color: 'var(--border-hover)' }}>|</span>
        <span>
          <span style={{ color: '#7ed957' }}>{STATS_DISPLAY.services}</span> services
        </span>
        <span style={{ color: 'var(--border-hover)' }}>|</span>
        <span>
          <span style={{ color: '#7ed957' }}>5</span> patents
        </span>
        <span style={{ color: 'var(--border-hover)' }}>|</span>
        <span>Source-available</span>
      </div>

      {/* CTAs */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          animation: 'heroFadeUp 0.8s ease-out 0.6s both',
        }}
      >
        <Link
          href="/start"
          style={{
            padding: '14px 32px',
            borderRadius: 12,
            background: '#7ed957',
            color: '#0a0a0a',
            fontWeight: 800,
            fontSize: 15,
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          Get Started
        </Link>
        <Link
          href="https://0ncore.com"
          target="_blank"
          rel="noopener"
          style={{
            padding: '14px 32px',
            borderRadius: 12,
            background: 'var(--border)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            transition: 'transform 0.2s, background 0.2s',
          }}
        >
          Try 0nCore Free
        </Link>
      </div>

      {/* Install command */}
      <div
        style={{
          marginTop: 20,
          animation: 'heroFadeUp 0.8s ease-out 0.7s both',
        }}
      >
        <code
          style={{
            fontSize: 13,
            color: '#7ed957',
            background: 'rgba(126,217,87,0.08)',
            padding: '8px 18px',
            borderRadius: 8,
            border: '1px solid rgba(126,217,87,0.15)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          npx 0nmcp@latest
        </code>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hubPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(126,217,87,0.3), 0 0 80px rgba(126,217,87,0.1); }
          50% { box-shadow: 0 0 60px rgba(126,217,87,0.45), 0 0 120px rgba(126,217,87,0.15); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes nodeAppear {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes lineGrow {
          from { stroke-dashoffset: 200; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </section>
  )
}
