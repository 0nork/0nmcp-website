'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const BRAND = {
  green: '#7ed957',
  greenDim: '#5cb83a',
  greenGlow: 'rgba(126,217,87,0.15)',
  cyan: '#00d4ff',
  purple: '#a78bfa',
  amber: '#f59e0b',
  bg: '#060a0f',
  bgCard: '#0c1220',
  bgCardHover: '#111a2e',
  border: '#1a2540',
  textPrimary: '#f0f4f8',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
}

const ORBIT_SERVICES = [
  { label: 'Stripe', angle: 0 },
  { label: 'Slack', angle: 30 },
  { label: 'GitHub', angle: 60 },
  { label: 'Supabase', angle: 90 },
  { label: 'OpenAI', angle: 120 },
  { label: 'CRM', angle: 150 },
  { label: 'Twilio', angle: 180 },
  { label: 'Discord', angle: 210 },
  { label: 'Notion', angle: 240 },
  { label: 'Shopify', angle: 270 },
  { label: 'HubSpot', angle: 300 },
  { label: 'Linear', angle: 330 },
]

const TICKER_SERVICES = [
  'Stripe', 'Slack', 'GitHub', 'Supabase', 'OpenAI', 'Anthropic',
  'CRM', 'SendGrid', 'Twilio', 'Discord', 'Notion', 'HubSpot',
  'Linear', 'Shopify', 'Square', 'Telegram', 'Pipedrive', 'WooCommerce',
  'Jira', 'Zendesk', 'Airtable', 'Calendly', 'Zoom', 'MongoDB',
  'Cloudflare', 'Google Sheets', 'Google Drive', 'Mailchimp', 'Asana',
  'Intercom', 'Dropbox', 'WhatsApp', 'QuickBooks', 'Plaid',
]

/* ═══════════════════════════════════════════════════════════════════
   SVG ICON PATHS
   ═══════════════════════════════════════════════════════════════════ */

function IconBolt({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconCpu({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  )
}

function IconShield({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function IconFile({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconCheck({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconChevron({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconTerminal({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function IconGitHub({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function IconArrowRight({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   RADIAL BURST ANIMATION
   ═══════════════════════════════════════════════════════════════════ */

type Phase = 'pipeline' | 'assembly' | 'burst'

const PHASE_CONFIG: Record<Phase, { color: string; label: string; duration: number }> = {
  pipeline: { color: BRAND.green, label: 'PIPELINE', duration: 4000 },
  assembly: { color: BRAND.cyan, label: 'ASSEMBLY LINE', duration: 4000 },
  burst: { color: BRAND.purple, label: 'RADIAL BURST', duration: 4000 },
}

const PHASES: Phase[] = ['pipeline', 'assembly', 'burst']

function RadialBurst() {
  const [phase, setPhase] = useState<Phase>('pipeline')
  const [progress, setProgress] = useState(0)
  const animRef = useRef<number>(0)
  const startRef = useRef(Date.now())
  const phaseIndexRef = useRef(0)

  useEffect(() => {
    let running = true
    const tick = () => {
      if (!running) return
      const elapsed = Date.now() - startRef.current
      const currentPhase = PHASES[phaseIndexRef.current]
      const dur = PHASE_CONFIG[currentPhase].duration
      const p = Math.min(elapsed / dur, 1)
      setProgress(p)

      if (p >= 1) {
        phaseIndexRef.current = (phaseIndexRef.current + 1) % PHASES.length
        setPhase(PHASES[phaseIndexRef.current])
        startRef.current = Date.now()
        setProgress(0)
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(animRef.current) }
  }, [])

  const cx = 200
  const cy = 200
  const orbitR = 140
  const config = PHASE_CONFIG[phase]

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420, aspectRatio: '1', margin: '0 auto' }}>
      <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bigGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center glow */}
        <circle cx={cx} cy={cy} r={60} fill="url(#centerGlow)" />

        {/* Orbit ring */}
        <circle
          cx={cx} cy={cy} r={orbitR}
          fill="none"
          stroke={config.color}
          strokeOpacity={0.1}
          strokeWidth={1}
        />

        {/* Connection lines from center to each service */}
        {ORBIT_SERVICES.map((svc, i) => {
          const rad = (svc.angle * Math.PI) / 180
          const sx = cx + orbitR * Math.cos(rad)
          const sy = cy + orbitR * Math.sin(rad)
          return (
            <line
              key={`line-${i}`}
              x1={cx} y1={cy} x2={sx} y2={sy}
              stroke={config.color}
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          )
        })}

        {/* Phase-specific animations */}
        {phase === 'pipeline' && (
          <PipelineAnimation cx={cx} cy={cy} orbitR={orbitR} progress={progress} color={config.color} />
        )}
        {phase === 'assembly' && (
          <AssemblyAnimation cx={cx} cy={cy} orbitR={orbitR} progress={progress} color={config.color} />
        )}
        {phase === 'burst' && (
          <BurstAnimation cx={cx} cy={cy} orbitR={orbitR} progress={progress} color={config.color} />
        )}

        {/* Service nodes */}
        {ORBIT_SERVICES.map((svc, i) => {
          const rad = (svc.angle * Math.PI) / 180
          const sx = cx + orbitR * Math.cos(rad)
          const sy = cy + orbitR * Math.sin(rad)
          const pulseScale = 1 + 0.15 * Math.sin(Date.now() / 600 + i * 0.5)
          return (
            <g key={`node-${i}`}>
              <circle cx={sx} cy={sy} r={6 * pulseScale} fill={config.color} fillOpacity={0.15} />
              <circle cx={sx} cy={sy} r={3.5} fill={config.color} filter="url(#glow)" />
              <text
                x={sx}
                y={sy + 16}
                textAnchor="middle"
                fill={BRAND.textSecondary}
                fontSize="8"
                fontFamily="var(--font-display, system-ui)"
                fontWeight="500"
              >
                {svc.label}
              </text>
            </g>
          )
        })}

        {/* Center node */}
        <circle cx={cx} cy={cy} r={22} fill={BRAND.bgCard} stroke={config.color} strokeWidth={2} filter="url(#bigGlow)" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill={config.color} fontSize="9" fontWeight="700" fontFamily="var(--font-display, system-ui)">
          0nMCP
        </text>
      </svg>

      {/* Phase indicator */}
      <div style={{
        position: 'absolute',
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}>
        {PHASES.map((p) => (
          <div key={p} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: phase === p ? 1 : 0.35,
            transition: 'opacity 0.4s',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: PHASE_CONFIG[p].color,
              boxShadow: phase === p ? `0 0 8px ${PHASE_CONFIG[p].color}` : 'none',
            }} />
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: PHASE_CONFIG[p].color,
              fontFamily: 'var(--font-display, system-ui)',
              letterSpacing: '0.05em',
            }}>
              {PHASE_CONFIG[p].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PipelineAnimation({ cx, cy, orbitR, progress, color }: { cx: number; cy: number; orbitR: number; progress: number; color: string }) {
  // Sequential dots flowing from center to each service in sequence
  const dots = []
  const totalServices = ORBIT_SERVICES.length
  for (let i = 0; i < totalServices; i++) {
    const serviceProgress = (progress * totalServices - i)
    if (serviceProgress < 0 || serviceProgress > 1.5) continue
    const t = Math.min(serviceProgress, 1)
    const rad = (ORBIT_SERVICES[i].angle * Math.PI) / 180
    const dx = cx + orbitR * Math.cos(rad) * t
    const dy = cy + orbitR * Math.sin(rad) * t
    dots.push(
      <circle key={`pipe-${i}`} cx={dx} cy={dy} r={3} fill={color} opacity={1 - t * 0.3} filter="url(#glow)" />
    )
  }
  return <>{dots}</>
}

function AssemblyAnimation({ cx, cy, orbitR, progress, color }: { cx: number; cy: number; orbitR: number; progress: number; color: string }) {
  // 3 parallel tracks with dots moving outward
  const tracks = [0, 1, 2]
  const dots = []
  for (const track of tracks) {
    const offset = track * 0.15
    const t = ((progress + offset) % 1)
    for (let i = 0; i < 4; i++) {
      const serviceIdx = track * 4 + i
      if (serviceIdx >= ORBIT_SERVICES.length) continue
      const rad = (ORBIT_SERVICES[serviceIdx].angle * Math.PI) / 180
      const dx = cx + orbitR * Math.cos(rad) * t
      const dy = cy + orbitR * Math.sin(rad) * t
      dots.push(
        <circle key={`asm-${track}-${i}`} cx={dx} cy={dy} r={2.5} fill={color} opacity={0.8} filter="url(#glow)" />
      )
    }
  }
  return <>{dots}</>
}

function BurstAnimation({ cx, cy, orbitR, progress, color }: { cx: number; cy: number; orbitR: number; progress: number; color: string }) {
  // Expanding ring + all dots burst outward simultaneously
  const ringR = orbitR * progress
  const ringOpacity = 1 - progress
  const dots = ORBIT_SERVICES.map((svc, i) => {
    const rad = (svc.angle * Math.PI) / 180
    const dist = orbitR * Math.min(progress * 1.2, 1)
    const dx = cx + dist * Math.cos(rad)
    const dy = cy + dist * Math.sin(rad)
    return (
      <circle key={`burst-${i}`} cx={dx} cy={dy} r={4 * (1 - progress * 0.3)} fill={color} opacity={0.9} filter="url(#glow)" />
    )
  })

  return (
    <>
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke={color} strokeWidth={2} opacity={ringOpacity * 0.6} />
      <circle cx={cx} cy={cy} r={ringR * 0.7} fill="none" stroke={color} strokeWidth={1} opacity={ringOpacity * 0.3} />
      {dots}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TICKER COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

function ServiceTicker() {
  const doubled = useMemo(() => [...TICKER_SERVICES, ...TICKER_SERVICES], [])
  return (
    <div style={{
      overflow: 'hidden',
      width: '100%',
      padding: '24px 0',
      borderTop: `1px solid ${BRAND.border}`,
      borderBottom: `1px solid ${BRAND.border}`,
    }}>
      <div
        style={{
          display: 'flex',
          gap: 32,
          whiteSpace: 'nowrap',
          animation: 'tickerScroll 40s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((name, i) => (
          <span
            key={i}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: BRAND.textMuted,
              fontFamily: 'var(--font-display, system-ui)',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: BRAND.green,
              opacity: 0.5,
              flexShrink: 0,
            }} />
            {name}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════ */

function AnimatedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = Date.now()
          const tick = () => {
            const elapsed = Date.now() - start
            const p = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setValue(Math.round(target * eased))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{value.toLocaleString()}</span>
}

/* ═══════════════════════════════════════════════════════════════════
   FAQ ITEM
   ═══════════════════════════════════════════════════════════════════ */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderBottom: `1px solid ${BRAND.border}`,
        padding: '20px 0',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          gap: 16,
        }}
      >
        <span style={{
          fontSize: 17,
          fontWeight: 600,
          color: BRAND.textPrimary,
          fontFamily: 'var(--font-display, system-ui)',
        }}>
          {q}
        </span>
        <span style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s',
          flexShrink: 0,
          color: BRAND.textMuted,
        }}>
          <IconChevron />
        </span>
      </button>
      <div style={{
        maxHeight: open ? 200 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{
          margin: '12px 0 0',
          fontSize: 15,
          lineHeight: 1.7,
          color: BRAND.textSecondary,
        }}>
          {a}
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════════════════════════════ */

function Section({
  children,
  id,
  style,
}: {
  children: React.ReactNode
  id?: string
  style?: React.CSSProperties
}) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '80px 24px',
        ...style,
      }}
    >
      {children}
    </section>
  )
}

function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <h2 style={{
      fontSize: 'clamp(32px, 4vw, 48px)',
      fontWeight: 800,
      color: color || BRAND.textPrimary,
      fontFamily: 'var(--font-display, system-ui)',
      marginBottom: 12,
      letterSpacing: '-0.02em',
      textAlign: 'center',
    }}>
      {children}
    </h2>
  )
}

function SectionDesc({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 18,
      color: BRAND.textSecondary,
      textAlign: 'center',
      marginBottom: 48,
      maxWidth: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: 1.6,
    }}>
      {children}
    </p>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   GLASS CARD
   ═══════════════════════════════════════════════════════════════════ */

function GlassCard({
  children,
  style,
  hover = true,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  hover?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered ? BRAND.bgCardHover : BRAND.bgCard,
        border: `1px solid ${BRAND.border}`,
        borderRadius: 16,
        padding: 32,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function HomeClient() {
  return (
    <div style={{
      background: BRAND.bg,
      color: BRAND.textPrimary,
      minHeight: '100vh',
      scrollBehavior: 'smooth',
      overflow: 'hidden',
    }}>
      {/* ─── HERO ─── */}
      <section style={{
        position: 'relative',
        padding: '120px 24px 60px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: 48,
        minHeight: '85vh',
      }}>
        {/* Background gradient orbs */}
        <div style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${BRAND.greenGlow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: -100,
          right: -200,
          width: 500,
          height: 500,
          background: `radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Left: Text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `${BRAND.green}10`,
            border: `1px solid ${BRAND.green}30`,
            borderRadius: 100,
            padding: '8px 16px',
            marginBottom: 28,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: BRAND.green,
              boxShadow: `0 0 8px ${BRAND.green}`,
            }} />
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: BRAND.green,
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-display, system-ui)',
            }}>
              Open Source -- MIT Licensed
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-display, system-ui)',
            marginBottom: 24,
          }}>
            Connect your AI to{' '}
            <br />
            <span style={{
              color: BRAND.green,
              textShadow: `0 0 40px ${BRAND.greenGlow}`,
            }}>
              everything.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            lineHeight: 1.6,
            color: BRAND.textSecondary,
            marginBottom: 36,
            maxWidth: 520,
          }}>
            1,589 tools across 102 services. One install. Every AI platform. 5 patents pending.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: BRAND.green,
                color: '#000',
                fontWeight: 700,
                fontSize: 16,
                padding: '14px 28px',
                borderRadius: 10,
                textDecoration: 'none',
                fontFamily: 'var(--font-display, system-ui)',
                transition: 'all 0.2s',
                boxShadow: `0 0 20px ${BRAND.green}40`,
              }}
            >
              Get Early Access
              <IconArrowRight color="#000" size={16} />
            </Link>
            <Link
              href="/install"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: BRAND.textPrimary,
                fontWeight: 600,
                fontSize: 16,
                padding: '14px 28px',
                borderRadius: 10,
                textDecoration: 'none',
                fontFamily: 'var(--font-display, system-ui)',
                border: `1px solid ${BRAND.border}`,
                transition: 'all 0.2s',
              }}
            >
              <IconTerminal color={BRAND.textSecondary} />
              Install Now
            </Link>
          </div>
        </div>

        {/* Right: Radial Burst */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RadialBurst />
        </div>

        {/* Responsive: stack on mobile */}
        <style>{`
          @media (max-width: 768px) {
            section:first-child {
              grid-template-columns: 1fr !important;
              text-align: center;
              padding-top: 80px !important;
              min-height: auto !important;
            }
            section:first-child > div:first-child {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
          }
        `}</style>
      </section>

      {/* ─── SERVICE TICKER ─── */}
      <ServiceTicker />

      {/* ─── STATS BAR ─── */}
      <Section style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 0,
          flexWrap: 'wrap',
          background: `${BRAND.bgCard}cc`,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 20,
          padding: '32px 16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {[
            { value: 1589, label: 'TOOLS', color: BRAND.green },
            { value: 102, label: 'SERVICES', color: BRAND.cyan },
            { value: 5, label: 'PATENTS', color: BRAND.purple },
            { valueStr: '$0', label: 'FREE', color: BRAND.amber },
            { valueStr: 'MIT', label: 'LICENSED', color: BRAND.textPrimary },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
            }}>
              <div style={{
                textAlign: 'center',
                padding: '0 clamp(16px, 3vw, 40px)',
              }}>
                <div style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  fontWeight: 800,
                  color: stat.color,
                  fontFamily: 'var(--font-display, system-ui)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  {stat.valueStr ?? <AnimatedNumber target={stat.value!} />}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: BRAND.textMuted,
                  letterSpacing: '0.12em',
                  marginTop: 6,
                  fontFamily: 'var(--font-display, system-ui)',
                }}>
                  {stat.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{
                  width: 1,
                  height: 40,
                  background: BRAND.border,
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ─── HOW IT WORKS ─── */}
      <Section>
        <SectionLabel>How It Works</SectionLabel>
        <SectionDesc>Three commands. That&apos;s it.</SectionDesc>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {[
            {
              num: '01',
              title: 'Install',
              desc: 'One command installs 1,589 tools across 102 services.',
              code: 'npx 0nmcp',
              color: BRAND.green,
            },
            {
              num: '02',
              title: 'Connect',
              desc: 'Import your API keys. Auto-maps to all services. Vault-encrypted.',
              code: '0nmcp engine import',
              color: BRAND.cyan,
            },
            {
              num: '03',
              title: 'Build',
              desc: 'Your AI calls any service. Describe what you want in natural language.',
              code: '"Send an invoice on Stripe and notify the team on Slack"',
              color: BRAND.purple,
            },
          ].map((step) => (
            <GlassCard key={step.num}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: step.color,
                  fontFamily: 'var(--font-display, system-ui)',
                  letterSpacing: '0.06em',
                }}>
                  {step.num}
                </span>
                <div style={{
                  height: 1,
                  flex: 1,
                  background: `linear-gradient(to right, ${step.color}30, transparent)`,
                }} />
              </div>
              <h3 style={{
                fontSize: 22,
                fontWeight: 700,
                color: BRAND.textPrimary,
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 8,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: 15,
                color: BRAND.textSecondary,
                lineHeight: 1.6,
                marginBottom: 20,
              }}>
                {step.desc}
              </p>
              <div style={{
                background: '#0a0e16',
                border: `1px solid ${BRAND.border}`,
                borderRadius: 10,
                padding: '14px 18px',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 14,
                color: step.color,
                overflow: 'auto',
              }}>
                <code>{step.code}</code>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* ─── FEATURES GRID ─── */}
      <Section>
        <SectionLabel>Why 0nMCP</SectionLabel>
        <SectionDesc>One orchestrator to connect them all.</SectionDesc>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}>
          {[
            {
              icon: <IconBolt color={BRAND.green} size={28} />,
              title: '1,589 Tools, One Install',
              desc: 'Stripe, CRM, Slack, GitHub, Supabase, SendGrid, Twilio, and 95 more services. All accessible through a single MCP server.',
              color: BRAND.green,
            },
            {
              icon: <IconCpu color={BRAND.cyan} size={28} />,
              title: 'Every AI Platform',
              desc: 'Claude, GPT, Gemini, Cursor, Windsurf, VS Code -- generates configs for 7+ platforms automatically. Zero lock-in.',
              color: BRAND.cyan,
            },
            {
              icon: <IconShield color={BRAND.purple} size={28} />,
              title: '7-Layer Security',
              desc: 'AES-256-GCM encryption, Argon2id key derivation, hardware fingerprint binding, Seal of Truth integrity, and 5 filed patents.',
              color: BRAND.purple,
            },
            {
              icon: <IconFile color={BRAND.amber} size={28} />,
              title: 'Portable .0n Files',
              desc: 'Your workflows, credentials, and brain files travel with you. One file format works on any machine, any AI platform.',
              color: BRAND.amber,
            },
          ].map((feature) => (
            <GlassCard key={feature.title}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: `${feature.color}10`,
                border: `1px solid ${feature.color}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: BRAND.textPrimary,
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 10,
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 15,
                color: BRAND.textSecondary,
                lineHeight: 1.7,
                marginBottom: 16,
              }}>
                {feature.desc}
              </p>
              <div style={{
                height: 2,
                width: 40,
                background: feature.color,
                borderRadius: 2,
              }} />
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* ─── COMPARISON TABLE ─── */}
      <Section>
        <SectionLabel>0nMCP vs. Everything Else</SectionLabel>
        <SectionDesc>Side-by-side. No spin.</SectionDesc>

        <div style={{
          background: BRAND.bgCard,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-display, system-ui)',
          }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BRAND.border}` }}>
                <th style={{
                  textAlign: 'left',
                  padding: '16px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: BRAND.textMuted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  Feature
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '16px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: BRAND.green,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  0nMCP
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '16px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: BRAND.textMuted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  Others
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Total tools', us: '1,589', them: '10-50' },
                { feature: 'Services', us: '102', them: '1-5' },
                { feature: 'Setup time', us: '1 command', them: '30+ min' },
                { feature: 'Security', us: 'AES-256 vault', them: 'Plain text .env' },
                { feature: 'AI lock-in', us: 'None', them: 'Single platform' },
                { feature: 'Cost', us: 'Free / $80', them: '$20-500+' },
              ].map((row, i) => (
                <tr key={row.feature} style={{
                  borderBottom: i < 5 ? `1px solid ${BRAND.border}` : 'none',
                }}>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: 15,
                    fontWeight: 600,
                    color: BRAND.textPrimary,
                  }}>
                    {row.feature}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: 700,
                    color: BRAND.green,
                  }}>
                    {row.us}
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    textAlign: 'center',
                    fontSize: 15,
                    color: BRAND.textMuted,
                  }}>
                    {row.them}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/compare" style={{
            color: BRAND.textSecondary,
            fontSize: 15,
            textDecoration: 'none',
            fontWeight: 500,
            fontFamily: 'var(--font-display, system-ui)',
            transition: 'color 0.2s',
          }}>
            See detailed comparisons
            <span style={{ marginLeft: 6 }}><IconArrowRight color={BRAND.textSecondary} size={14} /></span>
          </Link>
        </div>
      </Section>

      {/* ─── PRICING ─── */}
      <Section id="pricing">
        <SectionLabel>Pricing</SectionLabel>
        <SectionDesc>Open source core. Managed platform for teams.</SectionDesc>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
        }}>
          {[
            {
              name: 'Open Source',
              price: 'Free',
              period: 'forever',
              desc: 'Full MCP server. 1,589 tools. Self-hosted.',
              features: ['All 102 services', '1,589 tools', 'Vault encryption', 'CLI + HTTP modes', '.0n workflow engine', 'Community support'],
              cta: 'Get Started',
              ctaHref: 'https://github.com/0nork/0nMCP',
              accent: false,
              borderColor: BRAND.border,
            },
            {
              name: 'Starter',
              price: '$80',
              period: '/mo',
              desc: 'Managed dashboard. CRM integration. AI assistant.',
              features: ['Everything in Free', 'Web dashboard', 'CRM integration', 'AI assistant', 'Slack integration', 'Email support'],
              cta: 'Get Early Access',
              ctaHref: '/signup',
              accent: true,
              badge: 'MOST POPULAR',
              borderColor: BRAND.green,
            },
            {
              name: 'Pro',
              price: '$180',
              period: '/mo',
              desc: 'Voice AI. Course generator. Multi-location.',
              features: ['Everything in Starter', 'Voice AI agent', 'AI course generator', 'Multi-location CRM', 'Priority support', 'API access'],
              cta: 'Get Early Access',
              ctaHref: '/signup',
              accent: false,
              borderColor: BRAND.border,
            },
            {
              name: 'Agency',
              price: '$380',
              period: '/mo',
              desc: 'White-label. Unlimited locations. Custom branding.',
              features: ['Everything in Pro', 'White-label branding', 'Unlimited locations', 'Domain customization', 'Affiliate program', 'Dedicated support'],
              cta: 'Contact Sales',
              ctaHref: 'mailto:mike@rocketopp.com',
              accent: false,
              borderColor: BRAND.border,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.accent ? `${BRAND.bgCard}` : BRAND.bgCard,
                border: `1px solid ${plan.borderColor}`,
                borderRadius: 16,
                padding: 28,
                position: 'relative',
                boxShadow: plan.accent ? `0 0 30px ${BRAND.green}15` : 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: BRAND.green,
                  color: '#000',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 14px',
                  borderRadius: 100,
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-display, system-ui)',
                }}>
                  {plan.badge}
                </div>
              )}
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: BRAND.textPrimary,
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 8,
              }}>
                {plan.name}
              </h3>
              <div style={{ marginBottom: 12 }}>
                <span style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: BRAND.textPrimary,
                  fontFamily: 'var(--font-display, system-ui)',
                  letterSpacing: '-0.02em',
                }}>
                  {plan.price}
                </span>
                {plan.period !== 'forever' && (
                  <span style={{ fontSize: 16, color: BRAND.textMuted, marginLeft: 4 }}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: 14,
                color: BRAND.textSecondary,
                marginBottom: 20,
                lineHeight: 1.5,
              }}>
                {plan.desc}
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 24px',
                flex: 1,
              }}>
                {plan.features.map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: BRAND.textSecondary,
                    padding: '6px 0',
                  }}>
                    <IconCheck color={BRAND.green} size={14} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                {...(plan.ctaHref.startsWith('http') || plan.ctaHref.startsWith('mailto')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display, system-ui)',
                  transition: 'all 0.2s',
                  ...(plan.accent
                    ? {
                        background: BRAND.green,
                        color: '#000',
                        boxShadow: `0 0 16px ${BRAND.green}30`,
                      }
                    : {
                        background: 'transparent',
                        color: BRAND.textPrimary,
                        border: `1px solid ${BRAND.border}`,
                      }),
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Affiliate banner */}
        <div style={{
          marginTop: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: BRAND.bgCard,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 14,
          padding: '24px 32px',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              color: BRAND.textPrimary,
              fontFamily: 'var(--font-display, system-ui)',
              marginBottom: 4,
            }}>
              Earn 30% Recurring Commission
            </h3>
            <p style={{ fontSize: 14, color: BRAND.textSecondary }}>
              Join the 0nMCP affiliate program. Refer customers, earn every month they stay.
            </p>
          </div>
          <Link href="/partners" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: BRAND.green,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
            fontFamily: 'var(--font-display, system-ui)',
            whiteSpace: 'nowrap',
          }}>
            Become an Affiliate
            <IconArrowRight color={BRAND.green} size={14} />
          </Link>
        </div>
      </Section>

      {/* ─── FAQ ─── */}
      <Section>
        <SectionLabel>FAQ</SectionLabel>
        <SectionDesc>Common questions answered.</SectionDesc>

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {[
            {
              q: 'What is MCP?',
              a: 'Model Context Protocol -- the open standard that lets AI assistants connect to external tools and data sources. 0nMCP is the largest MCP server available with 1,589 tools across 102 services.',
            },
            {
              q: 'Which AI platforms work with 0nMCP?',
              a: 'Claude Desktop, Gemini CLI, GPT, Cursor, Windsurf, VS Code (Continue + Cline), and any MCP-compatible client. Configs for all 7+ platforms are auto-generated.',
            },
            {
              q: 'Is it really free?',
              a: 'Yes. The core MCP server is open source (MIT license) with all 1,589 tools. The managed platform with dashboard, CRM integration, and support starts at $80/mo.',
            },
            {
              q: 'How is this different from Zapier?',
              a: 'Zapier connects apps to apps with triggers and zaps. 0nMCP connects apps to AI -- your AI can directly call any API. No predefined triggers. Just describe what you want in natural language.',
            },
            {
              q: 'Are my API keys secure?',
              a: 'Yes. Credentials are encrypted with AES-256-GCM, protected by Argon2id key derivation, and bound to your hardware fingerprint via the patent-pending 0nVault system. 7-layer security with 5 filed patents.',
            },
            {
              q: 'Can I use my existing API keys?',
              a: 'Yes. Run 0nmcp engine import and it auto-detects keys from .env files, CSV exports, or JSON configs. Maps them to all 102 services automatically with vault encryption.',
            },
          ].map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </Section>

      {/* ─── FINAL CTA ─── */}
      <section style={{
        position: 'relative',
        padding: '100px 24px 120px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 400,
          background: `radial-gradient(ellipse, ${BRAND.greenGlow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <h2 style={{
          position: 'relative',
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.1,
          fontFamily: 'var(--font-display, system-ui)',
          letterSpacing: '-0.03em',
          marginBottom: 20,
        }}>
          Stop configuring.<br />
          <span style={{
            color: BRAND.green,
            textShadow: `0 0 40px ${BRAND.greenGlow}`,
          }}>
            Start building.
          </span>
        </h2>

        <p style={{
          position: 'relative',
          fontSize: 18,
          color: BRAND.textSecondary,
          marginBottom: 36,
          lineHeight: 1.6,
        }}>
          One command. 1,589 tools. Every AI platform.
        </p>

        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: BRAND.green,
              color: '#000',
              fontWeight: 700,
              fontSize: 17,
              padding: '16px 32px',
              borderRadius: 10,
              textDecoration: 'none',
              fontFamily: 'var(--font-display, system-ui)',
              boxShadow: `0 0 30px ${BRAND.green}40`,
              transition: 'all 0.2s',
            }}
          >
            Claim Your Spot
            <IconArrowRight color="#000" size={16} />
          </Link>
          <Link
            href="https://github.com/0nork/0nMCP"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              color: BRAND.textPrimary,
              fontWeight: 600,
              fontSize: 17,
              padding: '16px 32px',
              borderRadius: 10,
              textDecoration: 'none',
              fontFamily: 'var(--font-display, system-ui)',
              border: `1px solid ${BRAND.border}`,
              transition: 'all 0.2s',
            }}
          >
            <IconGitHub size={18} />
            Star on GitHub
          </Link>
        </div>
      </section>
    </div>
  )
}
