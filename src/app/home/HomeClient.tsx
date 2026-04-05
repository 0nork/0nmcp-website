'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { STATS, STATS_DISPLAY } from '@/data/stats'

/* ===================================================================
   FORGE SERVICES (radial burst nodes)
   =================================================================== */

const FORGE_SERVICES = [
  { abbr: 'St', color: '#635bff' },
  { abbr: 'Sl', color: '#4a154b' },
  { abbr: 'Gh', color: '#333333' },
  { abbr: 'Sb', color: '#3ecf8e' },
  { abbr: 'Sg', color: '#1a82e2' },
  { abbr: 'Tw', color: '#f22f46' },
  { abbr: 'Go', color: '#4285f4' },
  { abbr: 'Sh', color: '#96bf48' },
  { abbr: 'Dc', color: '#5865f2' },
  { abbr: 'Hs', color: '#ff7a59' },
  { abbr: 'Li', color: '#5e6ad2' },
  { abbr: 'Oa', color: '#10a37f' },
  { abbr: 'An', color: '#d4a574' },
  { abbr: 'Zm', color: '#2d8cff' },
  { abbr: 'Ji', color: '#0052cc' },
  { abbr: 'Mg', color: '#47a248' },
  { abbr: 'Sq', color: '#333333' },
  { abbr: 'Ln', color: '#0A66C2' },
  { abbr: 'No', color: '#ffffff' },
  { abbr: 'Tg', color: '#2AABEE' },
]

/* ===================================================================
   SERVICE LOGOS for logo grid
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
  { name: 'Telegram', file: 'telegram.svg' },
  { name: 'HubSpot', file: 'hubspot.svg' },
  { name: 'Notion', file: 'notion.svg' },
  { name: 'Square', file: 'square.svg' },
]

/* ===================================================================
   SVG ICONS (thin stroke, no fill)
   =================================================================== */

function IconBolt({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconCpu({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  )
}

function IconShield({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function IconFile({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
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

function IconTerminal({ color = 'currentColor', size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
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

/* ===================================================================
   FORGE RADIAL BURST ANIMATION
   =================================================================== */

function ForgeRadialBurst() {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const cx = 220
  const cy = 220
  const orbitR = 160
  const nodeR = 20

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
          0% { r: 20; opacity: 0.5; }
          100% { r: 32; opacity: 0; }
        }
        @keyframes forgeRingExpand {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 0.2; transform: scale(1); }
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
        </defs>

        <circle cx={cx} cy={cy} r={80} fill="url(#forgeHubGlow)" />

        {[60, 120, 180].map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#7ed957"
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
            stroke="#7ed957"
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
            stroke="#7ed957"
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
                style={{ transition: 'r 0.2s ease, filter 0.2s ease' }}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-display, system-ui)"
                style={{ pointerEvents: 'none' }}
              >
                {svc.abbr}
              </text>
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
            r={28}
            fill="#161b22"
            stroke="#7ed957"
            strokeWidth={2.5}
            filter="url(#forgeBigGlow)"
          />
          <text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#7ed957"
            fontSize="11"
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
      border: '1px solid rgba(126,217,87,0.2)',
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
}: {
  children: React.ReactNode
  id?: string
  style?: React.CSSProperties
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
    </section>
  )
}

/* ===================================================================
   MAIN COMPONENT
   =================================================================== */

export default function HomeClient() {
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
        .home-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .home-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .logo-item {
          opacity: 0.4;
          filter: grayscale(100%) brightness(2);
          transition: all 0.3s ease;
        }
        .logo-item:hover {
          opacity: 1;
          filter: grayscale(0%) brightness(1);
        }
        .pricing-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
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
        }
      `}</style>

      {/* ============================================================
         1. HERO
         ============================================================ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
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
              linear-gradient(rgba(126,217,87,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(126,217,87,0.04) 1px, transparent 1px)
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
          background: 'radial-gradient(ellipse, rgba(126,217,87,0.05) 0%, transparent 65%)',
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
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-display, system-ui)',
              marginBottom: 24,
            }}>
              Connect your AI<br />to{' '}
              <span style={{
                background: 'linear-gradient(135deg, #7ed957 0%, #3ecf8e 50%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                everything.
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              marginBottom: 40,
              maxWidth: 520,
            }}>
              {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services. One install. Every AI platform. {STATS_DISPLAY.patents} patents pending.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link
                href="/start"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--accent)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '16px 32px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display, system-ui)',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 30px rgba(126,217,87,0.3)',
                }}
              >
                Get Started
                <IconArrowRight color="#000" size={16} />
              </Link>
              <Link
                href="/install"
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
                  transition: 'all 0.2s',
                }}
              >
                <IconTerminal color="var(--text-secondary)" />
                Install Now
              </Link>
            </div>

            {/* Stats Row */}
            <div className="hero-stats-row" style={{
              display: 'flex',
              gap: 36,
              flexWrap: 'wrap',
            }}>
              {[
                { value: STATS.tools, label: 'TOOLS', color: 'var(--accent)' },
                { value: STATS.services, label: 'SERVICES', color: 'var(--color-cyan)' },
                { value: STATS.patents, label: 'PATENTS', color: 'var(--color-purple)' },
                { valueStr: '$0', label: 'FREE', color: 'var(--color-amber)' },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: 'clamp(26px, 2.5vw, 36px)',
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
          </div>

          {/* Right: Forge Radial Burst */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ForgeRadialBurst />
          </div>
        </div>
      </section>

      {/* ============================================================
         2. SERVICE LOGO GRID
         ============================================================ */}
      <Section>
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
            Connected to {STATS_DISPLAY.services}+ services
          </h2>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            marginBottom: 56,
            maxWidth: 540,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            From Stripe to Slack to Supabase. Every major API, one install.
          </p>
        </div>

        <div
          className="logo-grid-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {LOGO_GRID.map((svc) => (
            <div
              key={svc.name}
              className="logo-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '28px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
              }}
            >
              <img
                src={`/brand/logos/${svc.file}`}
                alt={svc.name}
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-display, system-ui)',
              }}>
                {svc.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         3. HOW IT WORKS
         ============================================================ */}
      <Section>
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
              code: 'npx 0nmcp',
            },
            {
              num: 2,
              title: 'Connect',
              desc: 'Import your API keys. Auto-maps to all services. Vault-encrypted.',
              code: '0nmcp engine import',
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
                boxShadow: 'var(--shadow-lg)',
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
                lineHeight: 1.65,
                marginBottom: 24,
              }}>
                {step.desc}
              </p>
              <div style={{
                background: '#0d1117',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 18px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 14,
                color: 'var(--accent)',
              }}>
                <code>{step.code}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         4. STATS BAR
         ============================================================ */}
      <Section style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div
          className="stats-bar-inner"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: '40px 24px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {[
            { value: STATS.tools, label: 'TOOLS', color: 'var(--accent)' },
            { value: STATS.services, label: 'SERVICES', color: 'var(--color-cyan)' },
            { value: STATS.patents, label: 'PATENTS', color: 'var(--color-purple)' },
            { valueStr: STATS.local_cost, label: 'FREE', color: 'var(--color-amber)' },
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                color: stat.color,
                fontFamily: 'var(--font-display, system-ui)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {'valueStr' in stat && stat.valueStr ? stat.valueStr : <AnimatedNumber target={stat.value as number} />}
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.14em',
                marginTop: 8,
                fontFamily: 'var(--font-display, system-ui)',
              }}>
                {stat.label}
              </div>
              {/* Divider */}
              {i < arr.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '10%',
                  height: '80%',
                  width: 1,
                  background: 'var(--border)',
                }} />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         5. FEATURES (2x2)
         ============================================================ */}
      <Section>
        <div style={{ textAlign: 'center' }}>
          <PillBadge>Why 0nMCP</PillBadge>
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
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 24,
          }}
        >
          {[
            {
              icon: <IconBolt color="var(--accent)" size={28} />,
              title: `${STATS_DISPLAY.tools} Tools, One Install`,
              desc: 'Stripe, CRM, Slack, GitHub, Supabase, SendGrid, Twilio, and 95+ more services. All accessible through a single MCP server.',
              accentRaw: '#7ed957',
            },
            {
              icon: <IconCpu color="var(--color-cyan)" size={28} />,
              title: 'Every AI Platform',
              desc: 'Claude, GPT, Gemini, Cursor, Windsurf, VS Code -- generates configs for 7+ platforms automatically. Zero lock-in.',
              accentRaw: '#14b8a6',
            },
            {
              icon: <IconShield color="var(--color-purple)" size={28} />,
              title: '7-Layer Security',
              desc: 'AES-256-GCM encryption, Argon2id key derivation, hardware fingerprint binding, Seal of Truth integrity, and 5 filed patents.',
              accentRaw: '#8b5cf6',
            },
            {
              icon: <IconFile color="var(--color-amber)" size={28} />,
              title: 'Portable .0n Files',
              desc: 'Your workflows, credentials, and brain files travel with you. One file format works on any machine, any AI platform.',
              accentRaw: '#d97706',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="home-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 36,
                borderTop: `3px solid ${feature.accentRaw}`,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `${feature.accentRaw}10`,
                border: `1px solid ${feature.accentRaw}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 21,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display, system-ui)',
                marginBottom: 12,
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 15,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================
         6. PRICING (4 tiers)
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
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              desc: 'Full MCP server. Self-hosted.',
              features: [`All ${STATS_DISPLAY.services} services`, `${STATS_DISPLAY.tools} tools`, 'Vault encryption', 'CLI + HTTP modes', '.0n workflow engine', 'Community support'],
              cta: 'Get Started',
              ctaHref: 'https://github.com/0nork/0nMCP',
              featured: false,
            },
            {
              name: 'Starter',
              price: '$80',
              period: '/mo',
              desc: 'Managed dashboard. CRM integration.',
              features: ['Everything in Free', 'Web dashboard', 'CRM integration', 'AI assistant', 'Slack integration', 'Email support'],
              cta: 'Get Started',
              ctaHref: '/signup',
              featured: false,
            },
            {
              name: 'Pro',
              price: '$180',
              period: '/mo',
              desc: 'Voice AI. Multi-location. Priority.',
              features: ['Everything in Starter', 'Voice AI agent', 'AI course generator', 'Multi-location CRM', 'Priority support', 'API access'],
              cta: 'Get Started',
              ctaHref: '/signup',
              featured: true,
              badge: 'MOST POPULAR',
            },
            {
              name: 'Agency',
              price: '$380',
              period: '/mo',
              desc: 'White-label. Unlimited locations.',
              features: ['Everything in Pro', 'White-label branding', 'Unlimited locations', 'Domain customization', 'Affiliate program', 'Dedicated support'],
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
                boxShadow: plan.featured
                  ? '0 0 40px rgba(126,217,87,0.15), var(--shadow-lg)'
                  : 'var(--shadow-lg)',
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
                  background: 'var(--accent)',
                  color: '#000',
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
                  fontSize: 44,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display, system-ui)',
                  letterSpacing: '-0.03em',
                }}>
                  {plan.price}
                </span>
                {plan.period !== 'forever' && (
                  <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
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
                    padding: '7px 0',
                  }}>
                    <span style={{ flexShrink: 0 }}>
                      <IconCheck color="var(--accent)" size={14} />
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
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 0',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display, system-ui)',
                  transition: 'all 0.2s',
                  ...(plan.featured
                    ? {
                        background: 'var(--accent)',
                        color: '#000',
                        boxShadow: '0 0 20px rgba(126,217,87,0.3)',
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
         7. FINAL CTA
         ============================================================ */}
      <section style={{
        position: 'relative',
        padding: '120px 24px 140px',
        textAlign: 'center',
        overflow: 'hidden',
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
        }}>
          Stop configuring.<br />
          <span style={{
            color: 'var(--accent)',
            textShadow: '0 0 40px var(--accent-glow)',
          }}>
            Start building.
          </span>
        </h2>

        <p style={{
          position: 'relative',
          fontSize: 19,
          color: 'var(--text-secondary)',
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
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--accent)',
              color: '#000',
              fontWeight: 700,
              fontSize: 17,
              padding: '18px 36px',
              borderRadius: 12,
              textDecoration: 'none',
              fontFamily: 'var(--font-display, system-ui)',
              boxShadow: '0 0 30px rgba(126,217,87,0.35)',
              transition: 'all 0.2s',
            }}
          >
            Get Started
            <IconArrowRight color="#000" size={16} />
          </Link>
          <Link
            href="/install"
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
              transition: 'all 0.2s',
            }}
          >
            <IconTerminal color="var(--text-secondary)" />
            Install Now
          </Link>
        </div>
      </section>
    </div>
  )
}
