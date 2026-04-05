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
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const cx = 220
  const cy = 220
  const orbitR = 160
  const nodeR = 22

  const nodePositions = useMemo(() =>
    FORGE_SERVICES.map((_, i) => {
      const angle = (i / FORGE_SERVICES.length) * Math.PI * 2 - Math.PI / 2
      return {
        x: cx + orbitR * Math.cos(angle),
        y: cy + orbitR * Math.sin(angle),
        angle,
      }
    }), []
  )

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 480, aspectRatio: '1', margin: '0 auto' }}>
      <style>{`
        @keyframes forgeDrawLine {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes forgeRadialBurst {
          0% { opacity: 0; transform: scale(1); }
          30% { opacity: 0.3; }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes forgeHubPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px var(--accent)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 16px var(--accent)); }
        }
        @keyframes forgeNodeAppear {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes forgeGlowPing {
          0% { r: 22; opacity: 0.5; }
          100% { r: 34; opacity: 0; }
        }
        @keyframes forgeRingExpand {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 0.2; transform: scale(1); }
        }
        @keyframes forgeOrbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <svg viewBox="0 0 440 440" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="forgeHubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <filter id="forgeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="forgeBigGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Clip circles for each node */}
          {nodePositions.map((_, i) => (
            <clipPath key={`clip-${i}`} id={`nodeClip-${i}`}>
              <circle cx={nodePositions[i].x} cy={nodePositions[i].y} r={nodeR - 3} />
            </clipPath>
          ))}
        </defs>

        <circle cx={cx} cy={cy} r={80} fill="url(#forgeHubGlow)" />

        {[60, 120, 180].map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity={0.08}
            strokeWidth={1}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animation: `forgeRingExpand 1.2s ease-out ${0.3 + i * 0.2}s both`,
            }}
          />
        ))}

        {nodePositions.map((pos, i) => (
          <line
            key={`line-${i}`}
            x1={cx}
            y1={cy}
            x2={pos.x}
            y2={pos.y}
            stroke="var(--accent)"
            strokeOpacity={0.12}
            strokeWidth={1}
            strokeDasharray="300"
            strokeDashoffset="0"
            style={{
              animation: `forgeDrawLine 0.8s ease-out ${0.5 + i * 0.08}s both`,
            }}
          />
        ))}

        {[1, 2, 3].map((n) => (
          <circle
            key={`burst-${n}`}
            cx={cx}
            cy={cy}
            r={orbitR * 0.4 * n}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animation: `forgeRadialBurst 1.5s ease-out ${0.8 + n * 0.3}s both`,
            }}
          />
        ))}

        {FORGE_SERVICES.map((svc, i) => {
          const pos = nodePositions[i]
          const isHovered = hoveredNode === i
          return (
            <g
              key={`node-${i}`}
              style={{
                transformOrigin: `${pos.x}px ${pos.y}px`,
                animation: `forgeNodeAppear 0.5s ease-out ${0.8 + i * 0.06}s both`,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeR}
                fill="none"
                stroke={svc.color}
                strokeWidth={1.5}
                opacity={0}
                style={{
                  animation: `forgeGlowPing 0.8s ease-out ${1.0 + i * 0.06}s both`,
                }}
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? nodeR * 1.15 : nodeR}
                fill={svc.color}
                filter={isHovered ? 'url(#forgeBigGlow)' : 'url(#forgeGlow)'}
                style={{ transition: 'all 0.2s ease' }}
              />
              <image
                href={`/logos/${svc.file}`}
                x={pos.x - (nodeR - 5)}
                y={pos.y - (nodeR - 5)}
                width={(nodeR - 5) * 2}
                height={(nodeR - 5) * 2}
                clipPath={`url(#nodeClip-${i})`}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )
        })}

        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: 'forgeHubPulse 3s ease-in-out infinite',
        }}>
          <circle
            cx={cx}
            cy={cy}
            r={30}
            fill="var(--bg-card)"
            stroke="var(--accent)"
            strokeWidth={2.5}
            filter="url(#forgeBigGlow)"
          />
          <text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--accent)"
            fontSize="10"
            fontWeight="800"
            fontFamily="var(--font-display, system-ui)"
          >
            0nMCP
          </text>
        </g>
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
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--accent-glow)',
      border: '1px solid var(--accent)',
      borderRadius: 100,
      padding: '8px 20px',
      marginBottom: 24,
    }}>
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--accent)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-display, system-ui)',
      }}>
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
      style={{
        background: bg || 'transparent',
        padding: '0',
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '100px 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        ...style,
      }}>
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
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      scrollBehavior: 'smooth',
      overflow: 'hidden',
    }}>

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
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, rgba(126,217,87,0.03) 50%, var(--bg-primary) 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
      }}>
        {/* Perspective grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          perspective: '600px',
          perspectiveOrigin: '50% 40%',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '-20%',
            width: '140%',
            height: '120%',
            backgroundImage: `
              linear-gradient(var(--grid-line-color, var(--accent-glow)) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line-color, var(--accent-glow)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'rotateX(55deg)',
            transformOrigin: '50% 0%',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)',
          }} />
        </div>

        {/* Subtle center glow */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 600,
          background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Hero content */}
        <div
          className="hero-grid"
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1200,
            margin: '0 auto',
            padding: '140px 24px 80px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            gap: 48,
            minHeight: '90vh',
            animation: 'heroFadeIn 1s ease-out both',
          }}
        >
          {/* Left: Text */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PillBadge>Open Source -- MIT Licensed</PillBadge>

            <h1 style={{
              fontSize: 'clamp(40px, 5.5vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-display, system-ui)',
              marginBottom: 24,
              color: 'var(--text-primary)',
            }}>
              <span style={{ color: 'var(--accent)' }}>0n</span>MCP
            </h1>

            <p style={{
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: 'var(--font-display, system-ui)',
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}>
              One Brain. Every Service. Zero Limits.
            </p>

            <p style={{
              fontSize: 'clamp(16px, 1.8vw, 18px)',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body, system-ui)',
              marginBottom: 40,
              maxWidth: 520,
            }}>
              The universal AI orchestrator connecting {STATS_DISPLAY.services} services
              through {STATS_DISPLAY.tools} tools. Install once, connect to everything.
            </p>

            {/* Stats Row */}
            <div className="hero-stats-row" style={{
              display: 'flex',
              gap: 32,
              flexWrap: 'wrap',
              marginBottom: 40,
            }}>
              {[
                { value: STATS.tools, label: 'TOOLS', color: 'var(--accent)' },
                { value: STATS.services, label: 'SERVICES', color: 'var(--color-cyan)' },
                { value: STATS.patents, label: 'PATENTS', color: 'var(--color-purple)' },
                { valueStr: 'MIT', label: 'LICENSED', color: 'var(--color-amber)' },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: 'clamp(24px, 2.5vw, 34px)',
                    fontWeight: 800,
                    color: stat.color,
                    fontFamily: 'var(--font-display, system-ui)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}>
                    {'valueStr' in stat && stat.valueStr ? stat.valueStr : <AnimatedNumber target={stat.value as number} />}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.14em',
                    marginTop: 6,
                    fontFamily: 'var(--font-display, system-ui)',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              <Link
                href="/start"
                className="cta-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--cta-bg)',
                  color: 'var(--cta-text)',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '16px 32px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display, system-ui)',
                }}
              >
                Get Started
                <IconArrowRight size={16} />
              </Link>
              <Link
                href="https://github.com/0nork/0nMCP"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '16px 32px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display, system-ui)',
                  border: '1px solid var(--border)',
                }}
              >
                <IconGitHub size={18} />
                View on GitHub
              </Link>
            </div>

            {/* npx badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 20px',
            }}>
              <IconTerminal size={16} />
              <code style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 14,
                color: 'var(--accent)',
                fontWeight: 600,
              }}>
                npx 0nmcp@latest
              </code>
            </div>
          </div>

          {/* Right: Forge Radial Burst */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ForgeRadialBurst />
          </div>
        </div>
      </section>

      {/* ============================================================
         2. INTEGRATION LOGO GRID
         ============================================================ */}
      <Section bg="var(--bg-secondary)">
        <div style={{ textAlign: 'center' }}>
          <PillBadge>Integrations</PillBadge>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display, system-ui)',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Connect to All Modern Platforms
          </h2>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body, system-ui)',
            marginBottom: 40,
            maxWidth: 540,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            From Stripe to Slack to Supabase. Every major API, one install.
          </p>
        </div>

        {/* Search/filter bar */}
        <div style={{
          maxWidth: 400,
          margin: '0 auto 40px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 18px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search services..."
              value={logoFilter}
              onChange={(e) => setLogoFilter(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body, system-ui)',
                fontSize: 14,
                width: '100%',
              }}
            />
          </div>
        </div>

        <div
          className="logo-grid-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 20,
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          {filteredLogos.map((svc) => (
            <div
              key={svc.name}
              className="logo-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '24px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
              }}
            >
              <img
                src={`/logos/${svc.file}`}
                alt={svc.name}
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
              />
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-display, system-ui)',
              }}>
                {svc.name}
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link
            href="/integrations"
            style={{
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              fontFamily: 'var(--font-display, system-ui)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
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
        <div style={{ textAlign: 'center' }}>
          <PillBadge>Features</PillBadge>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display, system-ui)',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            The universal AI orchestrator
          </h2>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body, system-ui)',
            marginBottom: 56,
            maxWidth: 540,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            One server. Every service. Every AI platform. No lock-in.
          </p>
        </div>

        <div
          className="features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
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
              className="home-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 32,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'var(--accent-glow)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                color: feature.accent,
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 10,
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 15,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body, system-ui)',
                lineHeight: 1.7,
                margin: 0,
              }}>
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
        <div style={{ textAlign: 'center' }}>
          <PillBadge>How It Works</PillBadge>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display, system-ui)',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Three steps to AI orchestration
          </h2>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body, system-ui)',
            marginBottom: 56,
            maxWidth: 540,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Install once. Connect your APIs. Let AI do the rest.
          </p>
        </div>

        <div
          className="process-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          {[
            {
              num: 1,
              title: 'Install',
              desc: 'One command installs all tools across every supported service.',
              code: '$ npx 0nmcp@latest',
            },
            {
              num: 2,
              title: 'Connect',
              desc: 'Import your API keys. Auto-maps to all services. Vault-encrypted.',
              code: '$ 0nmcp engine import',
            },
            {
              num: 3,
              title: 'Build',
              desc: 'Describe what you want in natural language. AI calls the tools.',
              code: '"Invoice on Stripe, notify Slack"',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="home-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 36,
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Number circle */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                background: 'var(--accent-glow)',
              }}>
                <span style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-display, system-ui)',
                }}>
                  {step.num}
                </span>
              </div>

              <h3 style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 10,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: 15,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body, system-ui)',
                lineHeight: 1.65,
                marginBottom: 24,
              }}>
                {step.desc}
              </p>
              {/* Terminal-style code block */}
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 18px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 14,
                color: 'var(--accent)',
                textAlign: 'left',
              }}>
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
        <div style={{ textAlign: 'center' }}>
          <PillBadge>Pricing</PillBadge>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display, system-ui)',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Simple, transparent pricing
          </h2>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body, system-ui)',
            marginBottom: 56,
            maxWidth: 540,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Open source core. Managed platform for teams.
          </p>
        </div>

        <div
          className="pricing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {[
            {
              name: 'Tier 1',
              price: '$0',
              period: 'forever',
              desc: 'Full MCP server. Self-hosted. Open source.',
              features: [
                `All ${STATS_DISPLAY.services} services`,
                `${STATS_DISPLAY.tools} tools`,
                'Vault encryption',
                'CLI + HTTP modes',
                '.0n workflow engine',
                'Community support',
              ],
              cta: 'Get Started',
              ctaHref: 'https://github.com/0nork/0nMCP',
              featured: false,
            },
            {
              name: 'Tier 2',
              price: '$80',
              period: '/mo',
              desc: 'Managed dashboard. CRM integration. Priority.',
              features: [
                'Everything in Tier 1',
                'Web dashboard',
                'CRM integration',
                'AI assistant',
                'Voice AI agent',
                'Priority support',
              ],
              cta: 'Get Started',
              ctaHref: '/signup',
              featured: true,
              badge: 'MOST POPULAR',
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              desc: 'White-label. Unlimited locations. SLA.',
              features: [
                'Everything in Tier 2',
                'White-label branding',
                'Unlimited locations',
                'Domain customization',
                'Dedicated support',
                'Custom SLA',
              ],
              cta: 'Contact Sales',
              ctaHref: 'mailto:mike@rocketopp.com',
              featured: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="pricing-card"
              style={{
                background: 'var(--bg-card)',
                border: plan.featured ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 20,
                padding: 32,
                position: 'relative',
                boxShadow: plan.featured ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column' as const,
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--cta-bg)',
                  color: 'var(--cta-text)',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '6px 18px',
                  borderRadius: 100,
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-display, system-ui)',
                  whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 12,
              }}>
                {plan.name}
              </h3>
              <div style={{ marginBottom: 12 }}>
                <span style={{
                  fontSize: plan.price === 'Custom' ? 36 : 44,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display, system-ui)',
                  letterSpacing: '-0.03em',
                }}>
                  {plan.price}
                </span>
                {plan.period && plan.period !== 'forever' && (
                  <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body, system-ui)',
                marginBottom: 24,
                lineHeight: 1.5,
              }}>
                {plan.desc}
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 28px',
                flex: 1,
              }}>
                {plan.features.map((f) => (
                  <li key={f} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body, system-ui)',
                    padding: '7px 0',
                  }}>
                    <span style={{ flexShrink: 0, color: 'var(--accent)' }}>
                      <IconCheck size={14} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                {...(plan.ctaHref.startsWith('http') || plan.ctaHref.startsWith('mailto')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className={plan.featured ? 'cta-primary' : 'cta-outline'}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 0',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display, system-ui)',
                  ...(plan.featured
                    ? {
                        background: 'var(--cta-bg)',
                        color: 'var(--cta-text)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }),
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
        <div style={{ textAlign: 'center' }}>
          <PillBadge>Social Proof</PillBadge>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display, system-ui)',
            letterSpacing: '-0.02em',
            marginBottom: 56,
          }}>
            Trusted by builders worldwide
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
        className="features-grid"
        >
          {[
            {
              quote: 'Replaced 6 different integration tools with one install. The .0n workflow engine is a game-changer.',
              name: 'Alex Chen',
              role: 'CTO, DataFlow',
              initials: 'AC',
            },
            {
              quote: '1,000+ tools accessible from any AI platform. We went from weeks of integration work to minutes.',
              name: 'Sarah Kim',
              role: 'Lead Engineer, BuildCo',
              initials: 'SK',
            },
            {
              quote: 'The vault encryption and patent-pending security gives us the confidence to run production workloads.',
              name: 'Marcus Lee',
              role: 'Security Lead, ShieldOps',
              initials: 'ML',
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 32,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Quote mark */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent)" opacity={0.3} style={{ marginBottom: 16 }}>
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10H0z" />
              </svg>
              <p style={{
                fontSize: 15,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body, system-ui)',
                lineHeight: 1.7,
                marginBottom: 24,
                fontStyle: 'italic',
              }}>
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display, system-ui)',
                }}>
                  {testimonial.initials}
                </div>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display, system-ui)',
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-body, system-ui)',
                  }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         7. FINAL CTA
         ============================================================ */}
      <section style={{
        position: 'relative',
        padding: '120px 24px 140px',
        textAlign: 'center',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 500,
          background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <h2 style={{
          position: 'relative',
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: 800,
          lineHeight: 1.1,
          fontFamily: 'var(--font-display, system-ui)',
          letterSpacing: '-0.03em',
          marginBottom: 20,
          color: 'var(--text-primary)',
        }}>
          Stop configuring.<br />
          <span style={{ color: 'var(--accent)' }}>
            Start building.
          </span>
        </h2>

        <p style={{
          position: 'relative',
          fontSize: 19,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body, system-ui)',
          marginBottom: 40,
          lineHeight: 1.6,
          maxWidth: 520,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. Every AI platform. One command.
        </p>

        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <Link
            href="/start"
            className="cta-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--cta-bg)',
              color: 'var(--cta-text)',
              fontWeight: 700,
              fontSize: 17,
              padding: '18px 36px',
              borderRadius: 12,
              textDecoration: 'none',
              fontFamily: 'var(--font-display, system-ui)',
            }}
          >
            Get Started
            <IconArrowRight size={16} />
          </Link>
          <Link
            href="/install"
            className="cta-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 17,
              padding: '18px 36px',
              borderRadius: 12,
              textDecoration: 'none',
              fontFamily: 'var(--font-display, system-ui)',
              border: '1px solid var(--border)',
            }}
          >
            <IconTerminal size={18} />
            Install Now
          </Link>
        </div>
      </section>

      {/* ============================================================
         8. FOOTER (dark, 4 columns)
         ============================================================ */}
      <footer style={{
        background: 'var(--bg-sidebar)',
        color: 'var(--sidebar-text)',
        padding: '64px 24px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            className="footer-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 40,
              marginBottom: 48,
            }}
          >
            {/* Brand column */}
            <div>
              <div style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 12,
              }}>
                <span style={{ color: 'var(--accent)' }}>0n</span>
                <span style={{ color: 'var(--sidebar-text)' }}>CORE</span>
              </div>
              <p style={{
                fontSize: 14,
                color: 'var(--sidebar-text-muted)',
                fontFamily: 'var(--font-body, system-ui)',
                lineHeight: 1.6,
                marginBottom: 20,
              }}>
                Unifying Digital Connectivity
              </p>
              {/* Social icons */}
              <div style={{ display: 'flex', gap: 16 }}>
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
                    style={{
                      color: 'var(--sidebar-text-muted)',
                      transition: 'color 0.2s',
                    }}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Home column */}
            <div>
              <h4 style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--sidebar-text)',
                fontFamily: 'var(--font-display, system-ui)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                Home
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Integrations', href: '/integrations' },
                  { label: 'About', href: '/about' },
                  { label: 'Blog', href: '/blog' },
                ].map((link) => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    <Link href={link.href} style={{
                      color: 'var(--sidebar-text-muted)',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontFamily: 'var(--font-body, system-ui)',
                      transition: 'color 0.2s',
                    }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product column */}
            <div>
              <h4 style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--sidebar-text)',
                fontFamily: 'var(--font-display, system-ui)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                Product
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'Documentation', href: '/docs' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Downloads', href: '/downloads' },
                  { label: 'Changelog', href: '/changelog' },
                ].map((link) => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    <Link href={link.href} style={{
                      color: 'var(--sidebar-text-muted)',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontFamily: 'var(--font-body, system-ui)',
                      transition: 'color 0.2s',
                    }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* People column */}
            <div>
              <h4 style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--sidebar-text)',
                fontFamily: 'var(--font-display, system-ui)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                People
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'Community', href: '/community' },
                  { label: 'Forum', href: '/forum' },
                  { label: 'Partners', href: '/partners' },
                  { label: 'Contact', href: 'mailto:mike@rocketopp.com' },
                ].map((link) => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    <Link
                      href={link.href}
                      {...(link.href.startsWith('mailto') ? { target: '_blank' } : {})}
                      style={{
                        color: 'var(--sidebar-text-muted)',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontFamily: 'var(--font-body, system-ui)',
                        transition: 'color 0.2s',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid var(--sidebar-border)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <span style={{
              fontSize: 13,
              color: 'var(--sidebar-text-muted)',
              fontFamily: 'var(--font-body, system-ui)',
            }}>
              &copy; {new Date().getFullYear()} RocketOpp LLC. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{
                  fontSize: 13,
                  color: 'var(--sidebar-text-muted)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body, system-ui)',
                }}>
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
