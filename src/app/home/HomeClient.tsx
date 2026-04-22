'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { STATS, STATS_DISPLAY } from '@/data/stats'

/* ===================================================================
   FORGE SERVICES (radial burst nodes)
   =================================================================== */

const FORGE_SERVICES = [
  { abbr: 'St', color: '#635bff', file: 'stripe.svg' },
  { abbr: 'Sl', color: '#4a154b', file: 'slack.svg' },
  { abbr: 'Gh', color: '#333333', file: 'github.svg' },
  { abbr: 'Sb', color: '#3ecf8e', file: 'supabase.svg' },
  { abbr: 'Sg', color: '#1a82e2', file: 'sendgrid.svg' },
  { abbr: 'Tw', color: '#f22f46', file: 'twilio.svg' },
  { abbr: 'Go', color: '#4285f4', file: 'gmail.svg' },
  { abbr: 'Sh', color: '#96bf48', file: 'shopify.svg' },
  { abbr: 'Dc', color: '#5865f2', file: 'discord.svg' },
  { abbr: 'Hs', color: '#ff7a59', file: 'hubspot.svg' },
  { abbr: 'Li', color: '#5e6ad2', file: 'linear.svg' },
  { abbr: 'Oa', color: '#10a37f', file: 'openai.svg' },
  { abbr: 'An', color: '#d4a574', file: 'anthropic.svg' },
  { abbr: 'Zm', color: '#2d8cff', file: 'zoom.svg' },
  { abbr: 'Ji', color: '#0052cc', file: 'jira.svg' },
  { abbr: 'Mg', color: '#47a248', file: 'mongodb.svg' },
  { abbr: 'Sq', color: '#333333', file: 'square.svg' },
  { abbr: 'Ln', color: '#0A66C2', file: 'linkedin.svg' },
  { abbr: 'No', color: '#ffffff', file: 'notion.svg' },
  { abbr: 'Tg', color: '#2AABEE', file: 'telegram.svg' },
]

/* ===================================================================
   SERVICE LOGOS for integration grid
   =================================================================== */

const LOGO_GRID = [
  { name: 'Stripe', file: 'stripe.svg' },
  { name: 'Slack', file: 'slack.svg' },
  { name: 'GitHub', file: 'github.svg' },
  { name: 'Supabase', file: 'supabase.svg' },
  { name: 'OpenAI', file: 'openai.svg' },
  { name: 'Anthropic', file: 'anthropic.svg' },
  { name: 'Shopify', file: 'shopify.svg' },
  { name: 'Discord', file: 'discord.svg' },
  { name: 'HubSpot', file: 'hubspot.svg' },
  { name: 'Notion', file: 'notion.svg' },
  { name: 'Twilio', file: 'twilio.svg' },
  { name: 'Zoom', file: 'zoom.svg' },
  { name: 'SendGrid', file: 'sendgrid.svg' },
  { name: 'MongoDB', file: 'mongodb.svg' },
  { name: 'Jira', file: 'jira.svg' },
  { name: 'Gmail', file: 'gmail.svg' },
  { name: 'Linear', file: 'linear.svg' },
  { name: 'Vercel', file: 'vercel.svg' },
  { name: 'Cloudflare', file: 'cloudflare.svg' },
  { name: 'Square', file: 'square.svg' },
  { name: 'Airtable', file: 'airtable.svg' },
  { name: 'Calendly', file: 'calendly.svg' },
  { name: 'Telegram', file: 'telegram.svg' },
  { name: 'WhatsApp', file: 'whatsapp.svg' },
]

/* ===================================================================
   SVG ICONS (thin stroke, no fill — NO emojis)
   =================================================================== */

function IconBolt({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconCpu({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  )
}

function IconShield({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function IconFile({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function IconWorkflow({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v3a1 1 0 001 1h4m6-4v3a1 1 0 01-1 1h-4m0 0v2" />
    </svg>
  )
}

function IconBrain({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 015 5c0 .8-.2 1.5-.5 2.2A5 5 0 0119 14a5 5 0 01-3 4.6V22h-4v-3.4A5 5 0 019 14a5 5 0 012.5-4.8A5 5 0 0112 2z" />
      <path d="M12 2a5 5 0 00-5 5c0 .8.2 1.5.5 2.2" />
    </svg>
  )
}

function IconCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconTerminal({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function IconArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function IconGitHub({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function IconTwitter({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function IconLinkedIn({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function IconDiscord({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  )
}

/* ===================================================================
   FORGE RADIAL BURST ANIMATION (with real SVG logos)
   =================================================================== */

function ForgeRadialBurst() {
  const CX = 220, CY = 220, RADIUS = 160, HUB_R = 32
  const [litCount, setLitCount] = useState(0)
  const [showHub, setShowHub] = useState(false)
  const [fading, setFading] = useState(false)
  const [cycle, setCycle] = useState(0)
  const N = FORGE_SERVICES.length

  const nodePositions = useMemo(() =>
    FORGE_SERVICES.map((_, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2
      return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) }
    }), [N]
  )

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const t = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, ms)) }

    setLitCount(0); setShowHub(false); setFading(false)
    t(200, () => setShowHub(true))
    for (let i = 0; i <= N; i++) { t(600 + i * 100, () => setLitCount(c => c + 1)) }
    const allLit = 600 + N * 100
    t(allLit + 4000, () => setFading(true))
    t(allLit + 5000, () => setCycle(k => k + 1))

    return () => timers.forEach(clearTimeout)
  }, [cycle, N])

  return (
    <div
      key={cycle}
      className="relative w-full max-w-[480px] mx-auto transition-opacity duration-[900ms]"
      style={{ aspectRatio: '1', opacity: fading ? 0 : 1 }}
    >
      <style>{`
        @keyframes forgeSpin    { to { transform: rotate(360deg) } }
        @keyframes forgeSpinRev { to { transform: rotate(-360deg) } }
        @keyframes forgeLineAnim { 0%,100% { opacity: .5 } 50% { opacity: .85 } }
        @keyframes forgeNodeAnim { 0%,100% { opacity: .85 } 50% { opacity: 1 } }
        @keyframes forgeHubPulse { 0%,100% { opacity: 0 } 40% { opacity: .12 } }
        @keyframes forgeLogoPop  { from { opacity: 0; transform: scale(.5) } to { opacity: 1; transform: scale(1) } }
        @keyframes forgeHubGlow  { 0%,100% { filter: drop-shadow(0 0 6px var(--accent)) } 50% { filter: drop-shadow(0 0 14px var(--accent)) } }
      `}</style>
      <svg viewBox="0 0 440 440" className="w-full h-full">
        <defs>
          <radialGradient id="fHubFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="fHubGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {nodePositions.map((p, i) => (
            <clipPath key={`fc-${i}`} id={`fClip-${i}`}>
              <circle cx={p.x} cy={p.y} r={11} />
            </clipPath>
          ))}
        </defs>

        {/* Hub aura */}
        {showHub && litCount > 8 && (
          <circle cx={CX} cy={CY} r={60} fill="url(#fAura)" style={{ animation: 'forgeHubPulse 2.2s ease-out infinite' }} />
        )}

        {/* Connection lines */}
        {FORGE_SERVICES.map((_, i) => {
          const p = nodePositions[i]
          const lit = i < litCount
          return (
            <line key={`fl-${i}`} x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke={lit ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={lit ? 1.2 : 0.5}
              strokeOpacity={lit ? 0.6 : 0.2}
              style={lit ? { animation: 'forgeLineAnim 2s ease-in-out infinite' } : undefined}
            />
          )
        })}

        {/* Rotating rings */}
        {showHub && (
          <>
            <circle cx={CX} cy={CY} r={50} fill="none" stroke="var(--accent)" strokeWidth={0.7} strokeOpacity={0.18} strokeDasharray="4 9"
              style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'forgeSpin 9s linear infinite' }} />
            <circle cx={CX} cy={CY} r={62} fill="none" stroke="var(--accent)" strokeWidth={0.4} strokeOpacity={0.08} strokeDasharray="2 12"
              style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'forgeSpinRev 14s linear infinite' }} />
          </>
        )}

        {/* Hub center with 0n logo */}
        {showHub && (
          <g filter="url(#fHubGlow)" style={{ animation: 'forgeHubGlow 3s ease-in-out infinite' }}>
            <circle cx={CX} cy={CY} r={HUB_R} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth={1.8} />
            <image href="/brand/on-white.png" x={CX - 20} y={CY - 20} width={40} height={40} style={{ filter: 'drop-shadow(0 0 4px rgba(126,217,87,0.4))' }} />
          </g>
        )}

        {/* Data packets traveling along lines */}
        {FORGE_SERVICES.slice(0, litCount).map((svc, i) => {
          const p = nodePositions[i]
          const dur = (1.4 + (i % 5) * 0.28).toFixed(2)
          const delay = ((i * 0.17) % parseFloat(dur)).toFixed(2)
          return (
            <circle key={`fpk-${i}`} r={2} fill={svc.color} opacity={0.85}>
              <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} path={`M ${CX},${CY} L ${p.x},${p.y}`} />
            </circle>
          )
        })}

        {/* Service nodes with real logos */}
        {FORGE_SERVICES.map((svc, i) => {
          const p = nodePositions[i]
          const lit = i < litCount
          return (
            <g key={`fn-${i}`} filter={lit ? 'url(#fGlow)' : undefined}
              style={lit ? { animation: 'forgeNodeAnim 1.8s ease-in-out infinite' } : undefined}>
              <circle cx={p.x} cy={p.y} r={16}
                fill={lit ? `${svc.color}22` : 'var(--bg-card)'}
                stroke={lit ? svc.color : 'var(--border)'}
                strokeWidth={lit ? 1.4 : 0.5}
              />
              {/* White background for logo visibility */}
              <circle cx={p.x} cy={p.y} r={11.5}
                fill="rgba(255,255,255,0.92)"
                opacity={lit ? 0.95 : 0.08}
              />
              {lit && (
                <image href={`/logos/${svc.file}`} x={p.x - 10.5} y={p.y - 10.5} width={21} height={21}
                  clipPath={`url(#fClip-${i})`}
                  style={{ animation: `forgeLogoPop 0.35s cubic-bezier(.34,1.56,.64,1) both`, animationDelay: `${i * 0.05}s` }}
                />
              )}
            </g>
          )
        })}

        {/* Stats text */}
        {litCount >= N && (
          <text x={CX} y={CY + RADIUS + 32} textAnchor="middle"
            fontFamily="var(--font-mono, monospace)" fontSize="9"
            fill="var(--accent)" fillOpacity={0.4} letterSpacing=".08em">
            + {STATS.services - N} more services
          </text>
        )}
      </svg>
    </div>
  )
}

/* ===================================================================
   ANIMATED COUNTER
   =================================================================== */

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

/* ===================================================================
   PILL BADGE
   =================================================================== */

function PillBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6 border border-[var(--accent)]"
      style={{ background: 'var(--accent-glow)' }}>
      <span className="text-xs font-bold text-[var(--accent)] tracking-[0.1em] uppercase">
        {children}
      </span>
    </div>
  )
}

/* ===================================================================
   SECTION FADE-IN WRAPPER
   =================================================================== */

function Section({
  children,
  id,
  style,
  bg,
}: {
  children: React.ReactNode
  id?: string
  style?: React.CSSProperties
  bg?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id={id}
      style={{ background: bg || 'transparent', padding: '0' }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '100px 24px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          ...style,
        }}
      >
        {children}
      </div>
    </section>
  )
}

/* ===================================================================
   MAIN COMPONENT
   =================================================================== */

export default function HomeClient() {
  const [logoFilter, setLogoFilter] = useState('')

  const filteredLogos = useMemo(() => {
    if (!logoFilter) return LOGO_GRID
    return LOGO_GRID.filter(l => l.name.toLowerCase().includes(logoFilter.toLowerCase()))
  }, [logoFilter])

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen overflow-hidden scroll-smooth">

      {/* Global homepage styles */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .home-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .home-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .logo-item {
          opacity: 0.6;
          filter: grayscale(80%);
          transition: all 0.3s ease;
        }
        .logo-item img {
          transition: filter 0.3s ease;
          filter: brightness(0.3) saturate(0);
        }
        .logo-item:hover img {
          filter: none !important;
        }
        [data-theme="dark"] .logo-item img {
          filter: none;
        }
        .logo-item:hover {
          opacity: 1;
          filter: grayscale(0%);
          transform: translateY(-2px);
        }
        .pricing-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .cta-primary {
          transition: all 0.2s ease;
        }
        .cta-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .cta-outline {
          transition: all 0.2s ease;
        }
        .cta-outline:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
            padding-top: 80px !important;
            min-height: auto !important;
          }
          .hero-grid > div:first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-stats-row {
            justify-content: center !important;
          }
          .logo-grid-inner {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
          .process-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-bar-inner {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* ============================================================
         1. HERO
         ============================================================ */}
      <section
        className="relative min-h-screen overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--bg-primary) 0%, rgba(126,217,87,0.03) 50%, var(--bg-primary) 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        {/* Perspective grid background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '600px', perspectiveOrigin: '50% 40%' }}>
          <div
            className="absolute"
            style={{
              top: '30%', left: '-20%', width: '140%', height: '120%',
              backgroundImage: `
                linear-gradient(var(--grid-line-color, var(--accent-glow)) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-line-color, var(--accent-glow)) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'rotateX(55deg)',
              transformOrigin: '50% 0%',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)',
            }}
          />
        </div>

        {/* Subtle center glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 900, height: 600,
            background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 65%)',
          }}
        />

        {/* Hero content */}
        <div
          className="hero-grid relative z-[1] max-w-[1200px] mx-auto grid items-center gap-12"
          style={{
            padding: '140px 24px 80px',
            gridTemplateColumns: '1fr 1fr',
            minHeight: '90vh',
            animation: 'heroFadeIn 1s ease-out both',
          }}
        >
          {/* Left: Text */}
          <div className="relative z-[1]">
            <PillBadge>Open Source -- MIT Licensed</PillBadge>

            <h1
              className="text-[clamp(40px,5.5vw,72px)] font-black leading-[1.05] tracking-[-0.03em] mb-6 text-[var(--text-primary)]"
            >
              <span className="text-[var(--accent)]">0n</span>MCP
            </h1>

            <p className="text-[clamp(20px,2.5vw,28px)] font-semibold leading-[1.3] text-[var(--text-primary)] mb-4">
              One Brain. Every Service. Zero Limits.
            </p>

            <p className="text-[clamp(16px,1.8vw,18px)] leading-[1.65] text-[var(--text-secondary)] mb-10 max-w-[520px]">
              The universal AI orchestrator connecting {STATS_DISPLAY.services} services
              through {STATS_DISPLAY.tools} tools. Install once, connect to everything.
            </p>

            {/* Stats Row */}
            <div className="hero-stats-row flex gap-8 flex-wrap mb-10">
              {[
                { value: STATS.tools, label: 'TOOLS', color: 'var(--accent)' },
                { value: STATS.services, label: 'SERVICES', color: 'var(--color-cyan)' },
                { value: STATS.patents, label: 'PATENTS', color: 'var(--color-purple)' },
                { valueStr: 'MIT', label: 'LICENSED', color: 'var(--color-amber)' },
              ].map((stat) => (
                <div key={stat.label} className="text-left">
                  <div
                    className="text-[clamp(24px,2.5vw,34px)] font-extrabold leading-none tracking-[-0.02em]"
                    style={{ color: stat.color }}
                  >
                    {'valueStr' in stat && stat.valueStr ? stat.valueStr : <AnimatedNumber target={stat.value as number} />}
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.14em] mt-1.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap mb-8">
              <Link
                href="/start"
                className="cta-primary inline-flex items-center gap-2 font-bold text-base px-8 py-4 rounded-xl no-underline"
                style={{ background: 'var(--cta-bg)', color: 'var(--cta-text)' }}
              >
                Get Started
                <IconArrowRight size={16} />
              </Link>
              <Link
                href="https://github.com/0nork/0nMCP"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-outline inline-flex items-center gap-2 font-semibold text-base px-8 py-4 rounded-xl no-underline border border-[var(--border)] bg-transparent text-[var(--text-primary)]"
              >
                <IconGitHub size={18} />
                View on GitHub
              </Link>
            </div>

            {/* npx badge */}
            <div className="inline-flex items-center gap-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px] px-5 py-3">
              <IconTerminal size={16} />
              <code className="font-mono text-sm text-[var(--accent)] font-semibold">
                npx 0nmcp@latest
              </code>
            </div>
          </div>

          {/* Right: Forge Radial Burst */}
          <div className="relative z-[1]">
            <ForgeRadialBurst />
          </div>
        </div>
      </section>

      {/* ============================================================
         2. INTEGRATION LOGO GRID
         ============================================================ */}
      <Section bg="var(--bg-secondary)">
        <div className="text-center">
          <PillBadge>Integrations</PillBadge>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
            Connect to All Modern Platforms
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-[540px] mx-auto leading-relaxed">
            From Stripe to Slack to Supabase. Every major API, one install.
          </p>
        </div>

        {/* Search/filter bar */}
        <div className="max-w-[400px] mx-auto mb-10">
          <div className="flex items-center gap-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-[18px] py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search services..."
              value={logoFilter}
              onChange={(e) => setLogoFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-[var(--text-primary)] text-sm w-full"
            />
          </div>
        </div>

        <div
          className="logo-grid-inner grid gap-5 max-w-[900px] mx-auto"
          style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
        >
          {filteredLogos.map((svc) => (
            <div
              key={svc.name}
              className="logo-item flex flex-col items-center justify-center gap-2.5 py-6 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px]"
            >
              <img
                src={`/logos/${svc.file}`}
                alt={svc.name}
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {svc.name}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/integrations"
            className="text-[var(--accent)] font-semibold text-[15px] no-underline inline-flex items-center gap-1.5"
          >
            View all {STATS_DISPLAY.services}+ integrations
            <IconArrowRight size={14} />
          </Link>
        </div>
      </Section>

      {/* ============================================================
         3. FEATURES GRID (3 columns)
         ============================================================ */}
      <Section>
        <div className="text-center">
          <PillBadge>Features</PillBadge>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
            The universal AI orchestrator
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-14 max-w-[540px] mx-auto leading-relaxed">
            One server. Every service. Every AI platform. No lock-in.
          </p>
        </div>

        <div className="features-grid grid gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            {
              icon: <IconBolt size={28} />,
              title: `${STATS_DISPLAY.tools} Tools`,
              desc: 'Stripe, CRM, Slack, GitHub, Supabase, SendGrid, Twilio, and dozens more services. All accessible through a single MCP server.',
              accent: 'var(--accent)',
            },
            {
              icon: <IconCpu size={28} />,
              title: 'Every AI Platform',
              desc: 'Claude, GPT, Gemini, Cursor, Windsurf, VS Code -- generates configs for 7+ platforms automatically. Zero lock-in.',
              accent: 'var(--color-cyan)',
            },
            {
              icon: <IconShield size={28} />,
              title: '7-Layer Security',
              desc: 'AES-256-GCM encryption, Argon2id key derivation, hardware fingerprint binding, Seal of Truth integrity, and 5 filed patents.',
              accent: 'var(--color-purple)',
            },
            {
              icon: <IconFile size={28} />,
              title: 'Portable .0n Files',
              desc: 'Your workflows, credentials, and brain files travel with you. One file format works on any machine, any AI platform.',
              accent: 'var(--color-amber)',
            },
            {
              icon: <IconWorkflow size={28} />,
              title: 'Workflow Engine',
              desc: 'Three-level execution: Pipeline, Assembly Line, Radial Burst. Describe outcomes in natural language and let AI handle the rest.',
              accent: 'var(--color-success)',
            },
            {
              icon: <IconBrain size={28} />,
              title: 'AI Brain',
              desc: 'Portable brain bundles capture your context, preferences, and connections. Export once, import into any AI platform instantly.',
              accent: 'var(--color-red)',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="home-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] p-8"
            >
              <div
                className="w-[52px] h-[52px] rounded-[14px] border border-[var(--border)] flex items-center justify-center mb-5"
                style={{ background: 'var(--accent-glow)', color: feature.accent }}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2.5">
                {feature.title}
              </h3>
              <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] m-0">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         4. HOW IT WORKS (3 steps)
         ============================================================ */}
      <Section bg="var(--bg-secondary)">
        <div className="text-center">
          <PillBadge>How It Works</PillBadge>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
            Three steps to AI orchestration
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-14 max-w-[540px] mx-auto leading-relaxed">
            Install once. Connect your APIs. Let AI do the rest.
          </p>
        </div>

        <div className="process-grid grid gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { num: 1, title: 'Install', desc: 'One command installs all tools across every supported service.', code: '$ npx 0nmcp@latest' },
            { num: 2, title: 'Connect', desc: 'Import your API keys. Auto-maps to all services. Vault-encrypted.', code: '$ 0nmcp engine import' },
            { num: 3, title: 'Build', desc: 'Describe what you want in natural language. AI calls the tools.', code: '"Invoice on Stripe, notify Slack"' },
          ].map((step) => (
            <div
              key={step.num}
              className="home-card bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] p-9 text-center"
            >
              {/* Number circle */}
              <div
                className="w-14 h-14 rounded-full border-2 border-[var(--accent)] flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--accent-glow)' }}
              >
                <span className="text-[22px] font-extrabold text-[var(--accent)]">{step.num}</span>
              </div>

              <h3 className="text-[22px] font-bold text-[var(--text-primary)] mb-2.5">{step.title}</h3>
              <p className="text-[15px] text-[var(--text-secondary)] leading-[1.65] mb-6">{step.desc}</p>
              {/* Terminal-style code block */}
              <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-[18px] py-3.5 font-mono text-sm text-[var(--accent)] text-left">
                <code>{step.code}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         5. PRICING (3 tiers)
         ============================================================ */}
      <Section id="pricing">
        <div className="text-center">
          <PillBadge>Pricing</PillBadge>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-14 max-w-[540px] mx-auto leading-relaxed">
            Open source core. Managed platform for teams.
          </p>
        </div>

        <div className="pricing-grid grid gap-6 items-start" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            {
              name: 'Tier 1', price: '$0', period: 'forever',
              desc: 'Full MCP server. Self-hosted. Open source.',
              features: [`All ${STATS_DISPLAY.services} services`, `${STATS_DISPLAY.tools} tools`, 'Vault encryption', 'CLI + HTTP modes', '.0n workflow engine', 'Community support'],
              cta: 'Get Started', ctaHref: 'https://github.com/0nork/0nMCP', featured: false,
            },
            {
              name: 'Tier 2', price: '$80', period: '/mo',
              desc: 'Managed dashboard. CRM integration. Priority.',
              features: ['Everything in Tier 1', 'Web dashboard', 'CRM integration', 'AI assistant', 'Voice AI agent', 'Priority support'],
              cta: 'Get Started', ctaHref: '/signup', featured: true, badge: 'MOST POPULAR',
            },
            {
              name: 'Enterprise', price: 'Custom', period: '',
              desc: 'White-label. Unlimited locations. SLA.',
              features: ['Everything in Tier 2', 'White-label branding', 'Unlimited locations', 'Domain customization', 'Dedicated support', 'Custom SLA'],
              cta: 'Contact Sales', ctaHref: 'mailto:mike@rocketopp.com', featured: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="pricing-card bg-[var(--bg-card)] rounded-[20px] p-8 relative flex flex-col"
              style={{
                border: plan.featured ? '2px solid var(--accent)' : '1px solid var(--border)',
                boxShadow: plan.featured ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 font-extrabold text-[11px] px-[18px] py-1.5 rounded-full tracking-[0.08em] whitespace-nowrap"
                  style={{ background: 'var(--cta-bg)', color: 'var(--cta-text)' }}
                >
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                {plan.name}
              </h3>
              <div className="mb-3">
                <span
                  className="font-extrabold"
                  style={{ fontSize: plan.price === 'Custom' ? 36 : 44, color: 'var(--text-primary)' }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-[var(--text-muted)] ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{plan.desc}</p>
              <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--accent)] flex-shrink-0">
                      <IconCheck size={14} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className="block text-center py-3 rounded-xl text-sm font-bold no-underline transition-all duration-200"
                style={{
                  ...(plan.featured
                    ? { background: 'var(--cta-bg)', color: 'var(--cta-text)' }
                    : { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' }
                  ),
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         6. TESTIMONIALS / SOCIAL PROOF
         ============================================================ */}
      <Section bg="var(--bg-secondary)">
        <div className="text-center">
          <PillBadge>Social Proof</PillBadge>
          <h2 className="text-[clamp(32px,4vw,52px)] font-extrabold text-[var(--text-primary)] tracking-[-0.02em] mb-14">
            Trusted by builders worldwide
          </h2>
        </div>

        <div className="features-grid grid gap-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            {
              quote: 'Replaced 6 different integration tools with one install. The .0n workflow engine is a game-changer.',
              name: 'Alex Chen', role: 'CTO, DataFlow', initials: 'AC',
            },
            {
              quote: '1,000+ tools accessible from any AI platform. We went from weeks of integration work to minutes.',
              name: 'Sarah Kim', role: 'Lead Engineer, BuildCo', initials: 'SK',
            },
            {
              quote: 'The vault encryption and patent-pending security gives us the confidence to run production workloads.',
              name: 'Marcus Lee', role: 'Security Lead, ShieldOps', initials: 'ML',
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] p-8"
            >
              {/* Quote mark */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent)" opacity={0.3} className="mb-4">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10H0z" />
              </svg>
              <p className="text-[15px] text-[var(--text-secondary)] leading-[1.7] mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] text-sm font-bold"
                  style={{ background: 'var(--accent-glow)' }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{testimonial.name}</div>
                  <div className="text-[13px] text-[var(--text-muted)]">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         7. FINAL CTA
         ============================================================ */}
      <section className="relative px-6 pt-[120px] pb-[140px] text-center overflow-hidden bg-[var(--bg-primary)]">
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: 700, height: 500, background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)' }}
        />

        <h2 className="relative text-[clamp(36px,5vw,60px)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-5 text-[var(--text-primary)]">
          Stop configuring.<br />
          <span className="text-[var(--accent)]">
            Start building.
          </span>
        </h2>

        <p className="relative text-[19px] text-[var(--text-secondary)] mb-10 leading-relaxed max-w-[520px] mx-auto">
          {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. Every AI platform. One command.
        </p>

        <div className="relative flex justify-center gap-4 flex-wrap">
          <Link
            href="/start"
            className="cta-primary inline-flex items-center gap-2 font-bold text-[17px] px-9 py-[18px] rounded-xl no-underline"
            style={{ background: 'var(--cta-bg)', color: 'var(--cta-text)' }}
          >
            Get Started
            <IconArrowRight size={16} />
          </Link>
          <Link
            href="/install"
            className="cta-outline inline-flex items-center gap-2 font-semibold text-[17px] px-9 py-[18px] rounded-xl no-underline border border-[var(--border)] bg-transparent text-[var(--text-primary)]"
          >
            <IconTerminal size={18} />
            Install Now
          </Link>
        </div>
      </section>

      {/* ============================================================
         8. FOOTER (dark, 4 columns)
         ============================================================ */}
      <footer className="bg-[var(--bg-sidebar)] text-[var(--sidebar-text)] pt-16 pb-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="footer-grid grid gap-10 mb-12" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {/* Brand column */}
            <div>
              <div className="text-[22px] font-extrabold mb-3">
                <span className="text-[var(--accent)]">0n</span>
                <span className="text-[var(--sidebar-text)]">CORE</span>
              </div>
              <p className="text-sm text-[var(--sidebar-text-muted)] leading-relaxed mb-5">
                Unifying Digital Connectivity
              </p>
              {/* Social icons */}
              <div className="flex gap-4">
                {[
                  { icon: <IconGitHub size={18} />, href: 'https://github.com/0nork/0nMCP', label: 'GitHub' },
                  { icon: <IconTwitter size={18} />, href: 'https://x.com/0nmcp', label: 'X' },
                  { icon: <IconLinkedIn size={18} />, href: 'https://linkedin.com/company/rocketopp', label: 'LinkedIn' },
                  { icon: <IconDiscord size={18} />, href: '/community', label: 'Discord' },
                ].map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={social.label}
                    className="text-[var(--sidebar-text-muted)] transition-colors duration-200 hover:text-[var(--sidebar-text)]"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Home column */}
            <div>
              <h4 className="text-sm font-bold text-[var(--sidebar-text)] tracking-[0.05em] uppercase mb-4">
                Home
              </h4>
              <ul className="list-none p-0 m-0">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Integrations', href: '/integrations' },
                  { label: 'About', href: '/about' },
                  { label: 'Blog', href: '/blog' },
                ].map((link) => (
                  <li key={link.label} className="mb-2.5">
                    <Link
                      href={link.href}
                      className="text-[var(--sidebar-text-muted)] no-underline text-sm transition-colors duration-200 hover:text-[var(--sidebar-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product column */}
            <div>
              <h4 className="text-sm font-bold text-[var(--sidebar-text)] tracking-[0.05em] uppercase mb-4">
                Product
              </h4>
              <ul className="list-none p-0 m-0">
                {[
                  { label: 'Documentation', href: '/docs' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Downloads', href: '/downloads' },
                  { label: 'Changelog', href: '/changelog' },
                ].map((link) => (
                  <li key={link.label} className="mb-2.5">
                    <Link
                      href={link.href}
                      className="text-[var(--sidebar-text-muted)] no-underline text-sm transition-colors duration-200 hover:text-[var(--sidebar-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* People column */}
            <div>
              <h4 className="text-sm font-bold text-[var(--sidebar-text)] tracking-[0.05em] uppercase mb-4">
                People
              </h4>
              <ul className="list-none p-0 m-0">
                {[
                  { label: 'Community', href: '/community' },
                  { label: 'Forum', href: '/forum' },
                  { label: 'Partners', href: '/partners' },
                  { label: 'Contact', href: 'mailto:mike@rocketopp.com' },
                ].map((link) => (
                  <li key={link.label} className="mb-2.5">
                    <Link
                      href={link.href}
                      {...(link.href.startsWith('mailto') ? { target: '_blank' } : {})}
                      className="text-[var(--sidebar-text-muted)] no-underline text-sm transition-colors duration-200 hover:text-[var(--sidebar-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[var(--sidebar-border)] pt-6 flex justify-between items-center flex-wrap gap-3">
            <span className="text-[13px] text-[var(--sidebar-text-muted)]">
              &copy; {new Date().getFullYear()} RocketOpp LLC. All rights reserved.
            </span>
            <div className="flex gap-5">
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] text-[var(--sidebar-text-muted)] no-underline transition-colors duration-200 hover:text-[var(--sidebar-text)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
