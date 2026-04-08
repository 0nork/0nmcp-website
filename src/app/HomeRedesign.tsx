'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── COLOR PALETTE (Grok-inspired, brighter) ────────────────────────────────

const C = {
  bg: '#0F1217',
  card: '#1A2028',
  deep: '#080B10',
  lime: '#B2FF4D',
  purple: '#9B6EFF',
  turquoise: '#3FFFE0',
  orange: '#FF6B35',
  text: '#f0f4f8',
  textSec: '#8a93a3',
  textMuted: '#555d6e',
  border: 'rgba(178,255,77,0.08)',
}

// ─── ORBIT SERVICE ICONS ─────────────────────────────────────────────────────

const ORBIT_ICONS = [
  { abbr: 'Sl', color: '#4A154B', radius: 180, speed: 60, start: 0 },
  { abbr: 'St', color: '#635BFF', radius: 220, speed: 80, start: 45 },
  { abbr: 'HS', color: '#FF7A59', radius: 260, speed: 100, start: 90 },
  { abbr: 'Gm', color: '#EA4335', radius: 200, speed: 70, start: 135 },
  { abbr: 'No', color: '#e5e5e5', radius: 300, speed: 120, start: 180 },
  { abbr: 'Sh', color: '#96BF48', radius: 240, speed: 90, start: 225 },
  { abbr: 'Zd', color: '#03363D', radius: 280, speed: 110, start: 270 },
  { abbr: 'Tw', color: '#F22F46', radius: 160, speed: 55, start: 315 },
  { abbr: 'OA', color: '#10a37f', radius: 320, speed: 130, start: 160 },
  { abbr: 'Fi', color: '#F24E1E', radius: 190, speed: 65, start: 200 },
]

// ─── INTEGRATION TILES ──────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: 'Slack', abbr: 'Sl', color: '#4A154B' },
  { name: 'Stripe', abbr: 'St', color: '#635BFF' },
  { name: 'Gmail', abbr: 'Gm', color: '#EA4335' },
  { name: 'HubSpot', abbr: 'HS', color: '#FF7A59' },
  { name: 'Shopify', abbr: 'Sh', color: '#96BF48' },
  { name: 'QuickBooks', abbr: 'QB', color: '#2CA01C' },
  { name: 'Figma', abbr: 'Fi', color: '#F24E1E' },
  { name: 'Notion', abbr: 'No', color: '#e5e5e5' },
  { name: 'Zapier', abbr: 'Zp', color: '#FF4A00' },
]

// ─── KEYFRAMES (injected once) ───────────────────────────────────────────────

const KEYFRAMES = `
@keyframes orbitFloat {
  from { transform: rotate(var(--start)) translateX(var(--radius)) rotate(calc(-1 * var(--start))); }
  to { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--radius)) rotate(calc(-1 * (var(--start) + 360deg))); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(178,255,77,0.3), 0 0 60px rgba(178,255,77,0.1); }
  50% { box-shadow: 0 0 30px rgba(178,255,77,0.5), 0 0 80px rgba(178,255,77,0.2); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes typingDots {
  0%, 20% { opacity: 0.2; }
  50% { opacity: 1; }
  80%, 100% { opacity: 0.2; }
}
@keyframes chipPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
@keyframes bottomGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.08); }
}
`

// ─── INTERSECTION OBSERVER HOOK ──────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLElement>(null)
  // Scroll reveal disabled — sections visible immediately
  // IO was failing due to SiteChrome layout scroll context
  return { ref: ref as React.RefObject<HTMLDivElement>, visible: true }
}

// ─── INLINE SVG HELPERS ──────────────────────────────────────────────────────

function ArrowRight({ size = 18, color = '#0F1217' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function CheckIcon({ size = 14, color = C.lime }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ShieldIcon({ size = 20, color = C.lime }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function ServerIcon({ size = 20, color = C.lime }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}

function ZapIcon({ size = 20, color = C.lime }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function GlobeIcon({ size = 20, color = C.lime }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

// ─── TYPING DOTS ─────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 5, height: 5, borderRadius: '50%', background: C.lime,
            animation: `typingDots 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function HomeRedesign() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // inject keyframes once
    if (!document.getElementById('home-v2-keyframes')) {
      const style = document.createElement('style')
      style.id = 'home-v2-keyframes'
      style.textContent = KEYFRAMES
      document.head.appendChild(style)
    }
  }, [])

  // Section reveal hooks
  const chat = useReveal()
  const crews = useReveal()
  const integrations = useReveal()
  const howItWorks = useReveal()
  const features = useReveal()
  const pricing = useReveal()
  const bottomCta = useReveal()

  if (!mounted) return null

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: 'Inter, system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* ═══════════════════════════ SECTION 1: HERO ═══════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '60px 24px 80px',
      }}>
        {/* Orbiting service icons */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 0, height: 0,
          transform: 'translate(-50%, -55%)',
          pointerEvents: 'none',
        }}>
          {ORBIT_ICONS.map((icon, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 36, height: 36,
                borderRadius: '50%',
                background: icon.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
                opacity: 0.2,
                ['--start' as string]: `${icon.start}deg`,
                ['--radius' as string]: `${icon.radius}px`,
                animation: `orbitFloat ${icon.speed}s linear infinite`,
                top: -18, left: -18,
              }}
            >
              {icon.abbr}
            </div>
          ))}
        </div>

        {/* Logo mark */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.lime}, ${C.turquoise})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 900, color: C.deep,
          marginBottom: 32,
          boxShadow: `0 0 40px rgba(178,255,77,0.25), 0 0 80px rgba(63,255,224,0.1)`,
          animation: mounted ? 'fadeInUp 0.8s ease-out' : 'none',
          position: 'relative', zIndex: 2,
        }}>
          0n
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          textAlign: 'center',
          margin: '0 0 20px',
          color: C.text,
          position: 'relative', zIndex: 2,
        }}>
          The old workflow is dead.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: C.lime,
          textAlign: 'center',
          maxWidth: 560,
          margin: '0 0 36px',
          lineHeight: 1.6,
          fontWeight: 500,
          position: 'relative', zIndex: 2,
          animation: 'fadeInUp 0.8s ease-out 0.2s both',
        }}>
          Describe the outcome. 0n orchestrates 100+ apps and runs it.
        </p>

        {/* CTA row */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          position: 'relative', zIndex: 2,
          animation: 'fadeInUp 0.8s ease-out 0.4s both',
        }}>
          <a href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.lime, color: C.deep,
            padding: '14px 28px', borderRadius: 999,
            fontWeight: 700, fontSize: 15,
            textDecoration: 'none',
            animation: 'pulseGlow 3s ease-in-out infinite',
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Start Free — Connect in 9s
            <ArrowRight size={16} color={C.deep} />
          </a>
          <a href="/demo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: C.textSec,
            padding: '14px 28px', borderRadius: 999,
            fontWeight: 600, fontSize: 15,
            textDecoration: 'none',
            border: `1px solid ${C.border}`,
            transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.lime; e.currentTarget.style.color = C.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec }}
          >
            Watch Demo
          </a>
        </div>

        {/* Connected services row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
          marginTop: 40, position: 'relative', zIndex: 2,
          animation: 'fadeInUp 0.8s ease-out 0.6s both',
        }}>
          {['Slack', 'Stripe', 'HubSpot', 'Gmail', 'Notion'].map(s => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.textMuted }}>
              <CheckIcon size={12} /> {s}
            </span>
          ))}
          <span style={{ fontSize: 13, color: C.lime, fontWeight: 600 }}>+100 more</span>
        </div>

        {/* Bottom tagline */}
        <p style={{
          fontSize: 13, color: C.textMuted, textAlign: 'center',
          marginTop: 32, letterSpacing: '0.02em',
          position: 'relative', zIndex: 2,
          animation: 'fadeInUp 0.8s ease-out 0.8s both',
        }}>
          Pre-connected tokens &middot; Agentic execution &middot; No steps. Just outcomes.
        </p>
      </section>

      {/* ═══════════════════════ SECTION 2: AGENTIC CHAT ═══════════════════════ */}
      <section
        ref={chat.ref}
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.deep,
          opacity: chat.visible ? 1 : 0,
          transform: chat.visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Section label */}
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.lime, marginBottom: 12 }}>
            Agentic Chat
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 48, lineHeight: 1.15 }}>
            Tell 0n what to ship.
          </h2>

          {/* Chat mockup */}
          <div style={{
            background: C.card, borderRadius: 16, padding: 'clamp(20px, 3vw, 36px)',
            border: `1px solid ${C.border}`,
          }}>
            {/* User message */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${C.purple}, ${C.turquoise})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>
                U
              </div>
              <div style={{
                background: 'rgba(155,110,255,0.08)', borderRadius: 12,
                padding: '14px 18px', maxWidth: '80%',
                border: `1px solid rgba(155,110,255,0.15)`,
              }}>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: C.text }}>
                  Generate Q3 performance report and email top 10 clients with personalized invoice links.
                </p>
              </div>
            </div>

            {/* 0n response */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${C.lime}, ${C.turquoise})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 900, color: C.deep,
              }}>
                0n
              </div>
              <div style={{
                background: 'rgba(178,255,77,0.05)', borderRadius: 12,
                padding: '14px 18px', maxWidth: '80%',
                border: `1px solid rgba(178,255,77,0.1)`,
              }}>
                <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0, color: C.textSec }}>
                  <span style={{ color: C.lime, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                    Pulling from Stripe + HubSpot + Google Sheets...
                  </span>
                  <br />
                  <span style={{ color: C.turquoise, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                    Building crew now
                  </span>
                  <TypingDots />
                  <br />
                  <span style={{ color: C.text, fontSize: 13, marginTop: 8, display: 'inline-block' }}>
                    Analyzing 3 integrations &middot; Selecting optimal path &middot;{' '}
                    <span style={{ color: C.lime, fontWeight: 600 }}>97% confidence</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Quick-select chips */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {[
                { label: 'Add payment reminder', color: C.lime, bg: 'rgba(178,255,77,0.08)', border: 'rgba(178,255,77,0.2)' },
                { label: 'Include Slack alert', color: C.purple, bg: 'rgba(155,110,255,0.08)', border: 'rgba(155,110,255,0.2)' },
                { label: 'Train new agent', color: C.turquoise, bg: 'rgba(63,255,224,0.08)', border: 'rgba(63,255,224,0.2)' },
              ].map(chip => (
                <button
                  key={chip.label}
                  style={{
                    background: chip.bg, color: chip.color,
                    border: `1px solid ${chip.border}`,
                    borderRadius: 999, padding: '8px 16px',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ SECTION 3: CREWS ══════════════════════════ */}
      <section
        ref={crews.ref}
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.bg,
          opacity: crews.visible ? 1 : 0,
          transform: crews.visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.purple, marginBottom: 12 }}>
            Crews
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 48, lineHeight: 1.15 }}>
            Crews train once. Ship forever.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                name: 'Revenue Crew', color: C.lime,
                agents: 3, services: 'Stripe + HubSpot',
                automations: 41, status: 'Active',
              },
              {
                name: 'Marketing Crew', color: C.purple,
                agents: 3, services: 'LinkedIn + Mailchimp',
                automations: 47, status: 'Deployed 47x',
              },
              {
                name: 'Support Crew', color: C.turquoise,
                agents: 2, services: 'Zendesk + Slack',
                automations: 24, status: '24/7 Active',
              },
            ].map(crew => (
              <div
                key={crew.name}
                style={{
                  background: C.card,
                  borderRadius: 14,
                  padding: 28,
                  border: `1px solid ${crew.color}22`,
                  borderTop: `3px solid ${crew.color}`,
                  transition: 'border-color 0.3s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${crew.color}55`; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${crew.color}22`; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: crew.color }}>{crew.name}</h3>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: C.deep,
                    background: crew.color, borderRadius: 999, padding: '3px 10px',
                  }}>
                    {crew.agents} agents
                  </span>
                </div>

                {/* Trained on */}
                <p style={{ fontSize: 13, color: C.textSec, margin: '0 0 12px' }}>
                  <span style={{ color: C.textMuted, fontWeight: 600 }}>Trained on:</span>{' '}
                  {crew.services}
                </p>

                {/* Automation count */}
                <p style={{ fontSize: 13, color: C.textSec, margin: '0 0 16px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: crew.color, fontWeight: 700, fontSize: 20 }}>
                    {crew.automations}
                  </span>{' '}
                  automations
                </p>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: crew.color, display: 'inline-block',
                    boxShadow: `0 0 8px ${crew.color}66`,
                  }} />
                  <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{crew.status}</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 14, color: C.textMuted, textAlign: 'center',
            marginTop: 32, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Build specialized AI teams in plain language. Train once. Deploy everywhere.
          </p>
        </div>
      </section>

      {/* ═══════════════════ SECTION 4: INTEGRATIONS ══════════════════════════ */}
      <section
        ref={integrations.ref}
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.deep,
          opacity: integrations.visible ? 1 : 0,
          transform: integrations.visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.turquoise, marginBottom: 12 }}>
            Integrations
          </p>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.15 }}>
            100+ Connected. Zero Setup.
          </h2>
          <p style={{ fontSize: 15, color: C.textSec, marginBottom: 48, maxWidth: 480 }}>
            Pre-authorized tokens unlock instant orchestration
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 14,
          }}>
            {INTEGRATIONS.map(svc => (
              <div
                key={svc.name}
                style={{
                  background: C.card, borderRadius: 12, padding: 20,
                  border: `1px solid ${C.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = svc.color + '44'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Service circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: svc.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff',
                }}>
                  {svc.abbr}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{svc.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: C.lime,
                    background: 'rgba(178,255,77,0.1)', padding: '2px 8px', borderRadius: 999,
                  }}>
                    Token Active
                  </span>
                  <span style={{ fontSize: 10, color: C.textMuted }}>MCP ready</span>
                </div>
              </div>
            ))}

            {/* + Connect New */}
            <a
              href="/console/integrations"
              style={{
                background: 'transparent', borderRadius: 12, padding: 20,
                border: `2px dashed rgba(178,255,77,0.15)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                textDecoration: 'none',
                transition: 'border-color 0.2s',
                minHeight: 130,
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.lime + '44')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(178,255,77,0.15)')}
            >
              <span style={{ fontSize: 28, color: C.lime, fontWeight: 300, lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>Connect New</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5: HOW IT WORKS ═════════════════════════ */}
      <section
        ref={howItWorks.ref}
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.bg,
          opacity: howItWorks.visible ? 1 : 0,
          transform: howItWorks.visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900,
            letterSpacing: '-0.02em', marginBottom: 56, lineHeight: 1.15,
            textAlign: 'center',
          }}>
            How it works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
          }}>
            {[
              {
                step: '01', title: 'Describe',
                desc: 'Tell 0n what you want in plain language. No steps, no diagrams, no config files.',
              },
              {
                step: '02', title: '0n Decides',
                desc: 'AI selects the right integrations, builds the execution path, and assembles a crew.',
              },
              {
                step: '03', title: 'Outcome Ships',
                desc: 'Result delivered. Crew handles it. You move on to the next thing that matters.',
              },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: 48, fontWeight: 900, color: C.lime,
                  fontFamily: 'JetBrains Mono, monospace',
                  opacity: 0.3, display: 'block', marginBottom: 12,
                  lineHeight: 1,
                }}>
                  {item.step}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px', color: C.text }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 6: FEATURES ═════════════════════════════ */}
      <section
        ref={features.ref}
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.deep,
          opacity: features.visible ? 1 : 0,
          transform: features.visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900,
            letterSpacing: '-0.02em', marginBottom: 48, lineHeight: 1.15,
            textAlign: 'center',
          }}>
            Built different
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
          }}>
            {[
              {
                icon: <ZapIcon size={24} color={C.lime} />,
                title: 'Agentic AI',
                desc: '0n decides the steps so you don\'t have to. Describe the outcome, the AI builds the path.',
                accent: C.lime,
              },
              {
                icon: <ServerIcon size={24} color={C.purple} />,
                title: 'Live MCP Server',
                desc: '1,554 tools, 96 services, real-time execution. The largest MCP server ever built.',
                accent: C.purple,
              },
              {
                icon: <ShieldIcon size={24} color={C.turquoise} />,
                title: 'Vault Encryption',
                desc: 'AES-256-GCM with hardware fingerprint binding. Your keys stay yours. Patent pending.',
                accent: C.turquoise,
              },
              {
                icon: <GlobeIcon size={24} color={C.orange} />,
                title: 'Universal Surface',
                desc: 'Console, CLI, Slack, Telegram, ChatGPT. Same commands everywhere. One brain.',
                accent: C.orange,
              },
            ].map(feat => (
              <div
                key={feat.title}
                style={{
                  background: C.card, borderRadius: 14, padding: 28,
                  border: `1px solid ${C.border}`,
                  transition: 'border-color 0.3s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = feat.accent + '33'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ marginBottom: 16 }}>{feat.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 10px', color: C.text }}>{feat.title}</h3>
                <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.65, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 7: PRICING ══════════════════════════════ */}
      <section
        ref={pricing.ref}
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.bg,
          opacity: pricing.visible ? 1 : 0,
          transform: pricing.visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900,
            letterSpacing: '-0.02em', marginBottom: 48, lineHeight: 1.15,
            textAlign: 'center',
          }}>
            Simple pricing
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            alignItems: 'stretch',
          }}>
            {/* Free */}
            <div style={{
              background: C.card, borderRadius: 16, padding: 32,
              border: `1px solid ${C.border}`,
              display: 'flex', flexDirection: 'column',
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Free</h3>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 900 }}>$0</span>
                <span style={{ fontSize: 14, color: C.textMuted, marginLeft: 4 }}>/forever</span>
              </div>
              <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.6, margin: '0 0 24px', flex: 1 }}>
                Connect, orchestrate, ship. No credit card required.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['5 Crews', '100 executions/mo', '10 integrations', 'Community support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textSec }}>
                    <CheckIcon size={13} /> {f}
                  </li>
                ))}
              </ul>
              <a href="/signup" style={{
                display: 'block', textAlign: 'center', padding: '12px 0',
                borderRadius: 999, fontSize: 14, fontWeight: 700,
                color: C.text, textDecoration: 'none',
                border: `1px solid ${C.border}`,
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.lime)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
              >
                Get Started
              </a>
            </div>

            {/* Pro */}
            <div style={{
              background: C.card, borderRadius: 16, padding: 32,
              border: `2px solid ${C.lime}33`,
              display: 'flex', flexDirection: 'column',
              position: 'relative',
              boxShadow: `0 0 40px rgba(178,255,77,0.05)`,
            }}>
              <span style={{
                position: 'absolute', top: -12, left: 24,
                background: C.lime, color: C.deep,
                fontSize: 11, fontWeight: 800, padding: '4px 14px',
                borderRadius: 999, letterSpacing: '0.04em',
              }}>
                Popular
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Pro</h3>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 900 }}>$19</span>
                <span style={{ fontSize: 14, color: C.textMuted, marginLeft: 4 }}>/mo</span>
              </div>
              <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.6, margin: '0 0 24px', flex: 1 }}>
                Unlimited Crews, priority AI, all add-ons, team seats.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Unlimited Crews', 'Unlimited executions', 'All integrations', 'Priority AI routing', 'Team seats', 'Priority support'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textSec }}>
                    <CheckIcon size={13} /> {f}
                  </li>
                ))}
              </ul>
              <a href="/signup?plan=pro" style={{
                display: 'block', textAlign: 'center', padding: '12px 0',
                borderRadius: 999, fontSize: 14, fontWeight: 700,
                color: C.deep, textDecoration: 'none',
                background: C.lime,
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Start Pro
              </a>
            </div>

            {/* Enterprise */}
            <div style={{
              background: C.card, borderRadius: 16, padding: 32,
              border: `1px solid ${C.border}`,
              display: 'flex', flexDirection: 'column',
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Enterprise</h3>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 900 }}>Custom</span>
              </div>
              <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.6, margin: '0 0 24px', flex: 1 }}>
                Dedicated support, SLA, custom integrations, white-label.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Everything in Pro', 'Dedicated account manager', 'Custom SLA', 'White-label option', 'On-premise available', 'SSO / SAML'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textSec }}>
                    <CheckIcon size={13} /> {f}
                  </li>
                ))}
              </ul>
              <a href="/contact" style={{
                display: 'block', textAlign: 'center', padding: '12px 0',
                borderRadius: 999, fontSize: 14, fontWeight: 700,
                color: C.text, textDecoration: 'none',
                border: `1px solid ${C.border}`,
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.purple)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 8: BOTTOM CTA ═══════════════════════════ */}
      <section
        ref={bottomCta.ref}
        style={{
          padding: 'clamp(80px, 10vw, 160px) 24px',
          background: C.deep,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          opacity: bottomCta.visible ? 1 : 0,
          transform: bottomCta.visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        {/* Radial glow behind logo */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 400, height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(178,255,77,0.12) 0%, transparent 70%)`,
          animation: 'bottomGlow 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.lime}, ${C.turquoise})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 900, color: C.deep,
          margin: '0 auto 32px',
          position: 'relative', zIndex: 1,
          boxShadow: `0 0 50px rgba(178,255,77,0.3)`,
        }}>
          0n
        </div>

        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900,
          letterSpacing: '-0.02em', marginBottom: 28, lineHeight: 1.2,
          position: 'relative', zIndex: 1,
        }}>
          The old workflow is dead.<br />
          <span style={{ color: C.lime }}>Describe it. 0n does it.</span>
        </h2>

        <a href="/signup" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: C.lime, color: C.deep,
          padding: '16px 36px', borderRadius: 999,
          fontWeight: 700, fontSize: 16,
          textDecoration: 'none',
          animation: 'pulseGlow 3s ease-in-out infinite',
          transition: 'transform 0.2s',
          position: 'relative', zIndex: 1,
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Start Free
          <ArrowRight size={18} color={C.deep} />
        </a>

        {/* Footer links */}
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
          marginTop: 48, position: 'relative', zIndex: 1,
        }}>
          {[
            { label: 'GitHub', href: 'https://github.com/0nork/0nmcp' },
            { label: 'npm', href: 'https://www.npmjs.com/package/0nmcp' },
            { label: 'Docs', href: '/docs' },
            { label: 'Community', href: '/community' },
            { label: 'Blog', href: '/blog' },
          ].map(link => (
            <a key={link.label} href={link.href} style={{
              fontSize: 13, color: C.textMuted, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
