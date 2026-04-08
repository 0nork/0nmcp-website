'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COLORS = {
  bgPrimary: '#0d1117',
  bgCard: '#1f2937',
  bgDeep: '#040A1A',
  green: '#7ed957',
  greenDim: '#5cb83a',
  greenGlow: 'rgba(126, 217, 87, 0.15)',
  teal: '#14b8a6',
  tealAlt: '#00C2C7',
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  orange: '#FF6B35',
  textPrimary: '#f0f4f8',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  border: 'rgba(255,255,255,0.08)',
}

const SERVICES = [
  [
    { name: 'CRM', abbr: 'CR', color: '#7ed957', tools: 245 },
    { name: 'Stripe', abbr: 'St', color: '#635BFF', tools: 42 },
    { name: 'Slack', abbr: 'Sl', color: '#4A154B', tools: 28 },
    { name: 'OpenAI', abbr: 'OA', color: '#10a37f', tools: 35 },
    { name: 'GitHub', abbr: 'GH', color: '#8b949e', tools: 48 },
    { name: 'Supabase', abbr: 'Sb', color: '#3ECF8E', tools: 32 },
  ],
  [
    { name: 'Telegram', abbr: 'Tg', color: '#26A5E4', tools: 18 },
    { name: 'Figma', abbr: 'Fi', color: '#F24E1E', tools: 22 },
    { name: 'Anthropic', abbr: 'An', color: '#D4A574', tools: 30 },
    { name: 'Gemini', abbr: 'Ge', color: '#4285F4', tools: 25 },
    { name: 'Vercel', abbr: 'Vc', color: '#e5e5e5', tools: 20 },
    { name: 'Sanity', abbr: 'Sa', color: '#F03E2F', tools: 15 },
  ],
  [
    { name: 'Discord', abbr: 'Dc', color: '#5865F2', tools: 24 },
    { name: 'Twilio', abbr: 'Tw', color: '#F22F46', tools: 20 },
    { name: 'SendGrid', abbr: 'SG', color: '#1A82E2', tools: 18 },
    { name: 'HubSpot', abbr: 'HS', color: '#FF7A59', tools: 36 },
    { name: 'Notion', abbr: 'No', color: '#e5e5e5', tools: 28 },
    { name: 'Shopify', abbr: 'Sh', color: '#96BF48', tools: 34 },
  ],
]

const FEATURES = [
  {
    title: '1,554 Tools',
    desc: 'CRM, Stripe, Slack, and 93 more services unified in a single MCP server. Install once, access everything.',
  },
  {
    title: 'AI-Native Execution',
    desc: 'Describe outcomes, not steps. Your AI decides which tools to call, in what order, with what data.',
  },
  {
    title: 'Vault Encryption',
    desc: 'AES-256-GCM with machine-bound keys. PBKDF2-SHA512 at 100K iterations. Your credentials never leave your machine.',
  },
  {
    title: 'Universal Commands',
    desc: 'The same natural language commands work in Claude, ChatGPT, Cursor, Windsurf, Gemini, and the CLI.',
  },
  {
    title: '5 Patents Pending',
    desc: 'Three-Level Execution, Seal of Truth, 0nVault Container System, Capability Routing, and more.',
  },
  {
    title: 'Free & Open Source',
    desc: 'MIT licensed. Free forever. No usage limits on local execution. Premium cloud features unlock at scale.',
  },
]

const PRICING = [
  {
    tier: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1,554 tools',
      'Unlimited local execution',
      'Vault encryption',
      'All 96 services',
      'MIT licensed',
    ],
    cta: 'Get Started',
    href: '/signup',
    highlighted: false,
  },
  {
    tier: 'Pro',
    price: '$19',
    period: '/mo',
    features: [
      'Everything in Free',
      'Cloud execution',
      'Priority AI routing',
      'Team workspaces',
      'All add-ons included',
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    href: '/partners',
    highlighted: false,
  },
]

// ─── FLOATING DOTS DATA ───────────────────────────────────────────────────────

function generateDots(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
    opacity: 0.08 + Math.random() * 0.18,
    duration: 12 + Math.random() * 20,
    delay: Math.random() * -20,
    drift: 20 + Math.random() * 40,
  }))
}

const HERO_DOTS = generateDots(18)

// ─── SCROLL REVEAL HOOK ──────────────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

// ─── COUNTER HOOK ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number = 1800) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])

  return { ref, count }
}

// ─── TYPING ANIMATION HOOK ───────────────────────────────────────────────────

function useTypingAnimation(lines: string[], startDelay: number = 800) {
  const [displayLines, setDisplayLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [started, setStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const timeout = setTimeout(() => {
      if (currentLine >= lines.length) return

      const line = lines[currentLine]
      if (currentChar < line.length) {
        setDisplayLines((prev) => {
          const copy = [...prev]
          copy[currentLine] = line.substring(0, currentChar + 1)
          return copy
        })
        setCurrentChar((c) => c + 1)
      } else {
        if (currentLine < lines.length - 1) {
          setCurrentLine((l) => l + 1)
          setCurrentChar(0)
          setDisplayLines((prev) => [...prev, ''])
        }
      }
    }, currentLine === 0 && currentChar === 0 ? startDelay : currentChar === 0 ? 400 : 25)

    return () => clearTimeout(timeout)
  }, [started, currentLine, currentChar, lines, startDelay])

  return { containerRef, displayLines }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function HomeRedesign() {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText('npm install -g 0nmcp')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // Section reveal refs
  const whatIs = useScrollReveal()
  const servicesSection = useScrollReveal()
  const howSection = useScrollReveal()
  const featuresSection = useScrollReveal()
  const demoSection = useScrollReveal()
  const pricingSection = useScrollReveal()
  const socialSection = useScrollReveal()
  const bottomCta = useScrollReveal()

  // Counter refs
  const toolsCounter = useCountUp(1554)
  const servicesCounter = useCountUp(96)
  const categoriesCounter = useCountUp(22)

  // Typing animation for terminal
  const terminalLines = [
    '> "Search CRM for contacts tagged \'vip\', create Stripe invoice for each, notify Slack"',
    '',
    'Planning execution...',
    '',
    'Step 1: search_crm_contacts  -->  12 contacts found',
    'Step 2: create_stripe_invoice  -->  12 invoices created',
    'Step 3: post_to_slack  -->  "#revenue: 12 VIP invoices generated"',
    '',
    'Done. 3 services. 1 sentence. 4.2 seconds.',
  ]
  const terminal = useTypingAnimation(terminalLines)

  return (
    <>
      {/* ── GLOBAL KEYFRAMES ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes heroGradientShift {
          0%, 100% { background-position: 0% 50%; }
          33% { background-position: 50% 100%; }
          66% { background-position: 100% 50%; }
        }
        @keyframes floatDot {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(var(--drift), calc(var(--drift) * -0.6)); }
          50% { transform: translate(calc(var(--drift) * -0.4), var(--drift)); }
          75% { transform: translate(calc(var(--drift) * 0.7), calc(var(--drift) * -0.3)); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(126,217,87,0.3), 0 0 60px rgba(126,217,87,0.1); }
          50% { box-shadow: 0 0 30px rgba(126,217,87,0.5), 0 0 80px rgba(126,217,87,0.15); }
        }
        @keyframes terminalGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(126,217,87,0.08), 0 4px 60px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 50px rgba(126,217,87,0.12), 0 4px 60px rgba(0,0,0,0.5); }
        }
        @keyframes slideInStagger {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div style={{ background: COLORS.bgPrimary, color: COLORS.textPrimary, minHeight: '100vh', overflow: 'hidden' }}>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1: HERO
            ════════════════════════════════════════════════════════════════════ */}
        <section style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(80px, 12vh, 140px) clamp(16px, 5vw, 48px) clamp(40px, 6vh, 80px)',
          background: `linear-gradient(135deg,
            ${COLORS.bgPrimary} 0%,
            rgba(126,217,87,0.06) 25%,
            rgba(20,184,166,0.08) 50%,
            rgba(139,92,246,0.06) 75%,
            ${COLORS.bgPrimary} 100%)`,
          backgroundSize: '400% 400%',
          animation: 'heroGradientShift 20s ease infinite',
          overflow: 'hidden',
        }}>
          {/* Floating dots */}
          {HERO_DOTS.map((dot) => (
            <div key={dot.id} style={{
              position: 'absolute',
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: COLORS.green,
              opacity: dot.opacity,
              animation: `floatDot ${dot.duration}s ease-in-out infinite`,
              animationDelay: `${dot.delay}s`,
              // @ts-expect-error CSS custom property
              '--drift': `${dot.drift}px`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* Logo mark */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: `0 0 40px ${COLORS.greenGlow}, 0 0 80px rgba(20,184,166,0.1)`,
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 28,
              fontWeight: 800,
              color: COLORS.bgPrimary,
              letterSpacing: '-1px',
            }}>0n</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.08,
            margin: '0 0 20px',
            letterSpacing: '-0.03em',
            color: COLORS.textPrimary,
          }}>
            The Universal AI Orchestrator
          </h1>

          {/* Stats line */}
          <p style={{
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            fontWeight: 400,
            textAlign: 'center',
            margin: '0 0 16px',
            color: COLORS.green,
            letterSpacing: '0.01em',
          }}>
            1,554 tools. 96 services. One command.
          </p>

          {/* Tagline */}
          <p style={{
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
            fontStyle: 'italic',
            textAlign: 'center',
            margin: '0 0 40px',
            color: COLORS.textMuted,
            maxWidth: 520,
          }}>
            Stop building workflows. Start describing outcomes.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 48,
          }}>
            <a href="/signup" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
              color: COLORS.bgPrimary,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: `0 0 24px ${COLORS.greenGlow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 0 36px rgba(126,217,87,0.4)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 0 24px ${COLORS.greenGlow}`
            }}
            >
              {/* Arrow icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Get Started Free
            </a>

            <button onClick={handleCopy} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              color: COLORS.textSecondary,
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 500,
              fontSize: '0.9rem',
              border: `1px solid ${COLORS.border}`,
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.green
              e.currentTarget.style.color = COLORS.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border
              e.currentTarget.style.color = COLORS.textSecondary
            }}
            >
              <span>npm install -g 0nmcp</span>
              {/* Copy / check icon */}
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              )}
            </button>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'clamp(12px, 3vw, 32px)',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: COLORS.textMuted,
            textTransform: 'uppercase',
          }}>
            {['1,554 TOOLS', '96 SERVICES', '22 CATEGORIES', 'MIT LICENSE', '5 PATENTS'].map((stat, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span style={{ color: COLORS.green, opacity: 0.4 }}>*</span>}
                {stat}
              </span>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2: WHAT IS 0nMCP
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={whatIs.ref} style={{
          background: COLORS.bgDeep,
          padding: 'clamp(60px, 10vh, 120px) clamp(16px, 5vw, 48px)',
          opacity: whatIs.visible ? 1 : 0,
          transform: whatIs.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              textAlign: 'center',
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}>
              One MCP server. Every service.
            </h2>
            <p style={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              textAlign: 'center',
              color: COLORS.textSecondary,
              maxWidth: 640,
              margin: '0 auto 48px',
              lineHeight: 1.65,
            }}>
              Connect once. Access everything. Your AI describes the outcome — 0nMCP handles the rest.
            </p>

            {/* Terminal block */}
            <div ref={terminal.containerRef} style={{
              maxWidth: 720,
              margin: '0 auto',
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              animation: whatIs.visible ? 'terminalGlow 4s ease-in-out infinite' : 'none',
            }}>
              {/* Terminal header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                <span style={{
                  marginLeft: 12,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem',
                  color: COLORS.textMuted,
                }}>0nmcp</span>
              </div>

              {/* Terminal body */}
              <div style={{
                padding: 'clamp(16px, 3vw, 28px)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 'clamp(0.72rem, 1.3vw, 0.88rem)',
                lineHeight: 1.85,
                minHeight: 260,
              }}>
                {terminal.displayLines.map((line, i) => {
                  let color = COLORS.green
                  if (i === 0) color = COLORS.textPrimary
                  if (line.startsWith('Planning')) color = COLORS.textMuted
                  if (line.startsWith('Done.')) color = COLORS.teal
                  if (line.startsWith('Step')) {
                    const checkColor = COLORS.green
                    return (
                      <div key={i}>
                        <span style={{ color: checkColor }}>{'  \u2713 '}</span>
                        <span style={{ color: COLORS.textSecondary }}>{line.replace(/^Step/, 'Step')}</span>
                      </div>
                    )
                  }
                  return (
                    <div key={i} style={{ color, minHeight: line === '' ? 8 : 'auto' }}>
                      {line}
                      {i === terminal.displayLines.length - 1 && i < terminalLines.length - 1 && (
                        <span style={{ animation: 'blink 1s step-end infinite', marginLeft: 2 }}>|</span>
                      )}
                    </div>
                  )
                })}
                {terminal.displayLines.length === 0 && (
                  <span style={{ color: COLORS.textMuted, animation: 'blink 1s step-end infinite' }}>|</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3: SERVICES GRID
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={servicesSection.ref} style={{
          padding: 'clamp(60px, 10vh, 120px) clamp(16px, 5vw, 48px)',
          background: COLORS.bgPrimary,
          opacity: servicesSection.visible ? 1 : 0,
          transform: servicesSection.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              textAlign: 'center',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>
              96 Services. Their logos. Their colors.
            </h2>
            <p style={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: '1rem',
              textAlign: 'center',
              color: COLORS.textMuted,
              margin: '0 0 48px',
            }}>
              Each integration speaks its own language. 0nMCP speaks all of them.
            </p>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 14,
              maxWidth: 880,
              margin: '0 auto',
            }}>
              {SERVICES.flat().map((service, i) => (
                <div key={service.name} style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: '20px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'default',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  animation: servicesSection.visible ? `fadeInUp 0.5s ease ${i * 0.05}s both` : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.borderColor = service.color
                  e.currentTarget.style.boxShadow = `0 0 20px ${service.color}22`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.borderColor = COLORS.border
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  {/* Abbreviation */}
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: service.color,
                  }}>{service.abbr}</span>

                  {/* Name */}
                  <span style={{
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontSize: '0.8rem',
                    color: COLORS.textSecondary,
                  }}>{service.name}</span>

                  {/* Tool count badge */}
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.65rem',
                    color: COLORS.textMuted,
                    background: 'rgba(255,255,255,0.04)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>{service.tools} tools</span>
                </div>
              ))}

              {/* +78 more card */}
              <a href="/integrations" style={{
                background: 'transparent',
                border: `1px dashed ${COLORS.textMuted}`,
                borderRadius: 10,
                padding: '20px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                animation: servicesSection.visible ? `fadeInUp 0.5s ease 0.9s both` : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.green
                e.currentTarget.style.background = 'rgba(126,217,87,0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.textMuted
                e.currentTarget.style.background = 'transparent'
              }}
              >
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: COLORS.green,
                }}>+78</span>
                <span style={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '0.8rem',
                  color: COLORS.textSecondary,
                }}>more services</span>
              </a>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 4: HOW IT WORKS
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={howSection.ref} style={{
          padding: 'clamp(60px, 10vh, 120px) clamp(16px, 5vw, 48px)',
          background: COLORS.bgDeep,
          opacity: howSection.visible ? 1 : 0,
          transform: howSection.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              textAlign: 'center',
              margin: '0 0 48px',
              letterSpacing: '-0.02em',
            }}>
              Three steps. Zero config.
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}>
              {[
                {
                  num: '01',
                  title: 'Install',
                  desc: 'One command. No dependencies. No Docker. No setup wizard.',
                  code: 'npx -y 0nmcp',
                },
                {
                  num: '02',
                  title: 'Connect',
                  desc: 'Import your API keys from .env, CSV, or JSON. AI verifies each one.',
                  code: '0nmcp engine import',
                },
                {
                  num: '03',
                  title: 'Command',
                  desc: 'Describe what you want in natural language. 0nMCP executes it.',
                  code: '"Send VIP contacts a Stripe invoice and notify Slack"',
                },
              ].map((step, i) => (
                <div key={step.num} style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 14,
                  padding: 'clamp(24px, 3vw, 36px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  animation: howSection.visible ? `fadeInUp 0.5s ease ${i * 0.15}s both` : 'none',
                }}>
                  {/* Step number */}
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '2.4rem',
                    fontWeight: 900,
                    background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}>{step.num}</span>

                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    margin: 0,
                  }}>{step.title}</h3>

                  <p style={{
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontSize: '0.95rem',
                    color: COLORS.textSecondary,
                    lineHeight: 1.6,
                    margin: 0,
                  }}>{step.desc}</p>

                  {/* Code snippet */}
                  <div style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.78rem',
                    color: COLORS.green,
                    overflowX: 'auto',
                  }}>
                    {step.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 5: FEATURES
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={featuresSection.ref} style={{
          padding: 'clamp(60px, 10vh, 120px) clamp(16px, 5vw, 48px)',
          background: COLORS.bgPrimary,
          opacity: featuresSection.visible ? 1 : 0,
          transform: featuresSection.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              textAlign: 'center',
              margin: '0 0 48px',
              letterSpacing: '-0.02em',
            }}>
              Built for builders.
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {FEATURES.map((feat, i) => (
                <div key={feat.title} style={{
                  background: COLORS.bgCard,
                  borderLeft: `3px solid ${COLORS.green}`,
                  borderRadius: '0 10px 10px 0',
                  padding: 'clamp(20px, 2.5vw, 28px)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  animation: featuresSection.visible ? `fadeInUp 0.4s ease ${i * 0.08}s both` : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.3)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    margin: '0 0 8px',
                    color: COLORS.textPrimary,
                  }}>{feat.title}</h3>
                  <p style={{
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontSize: '0.9rem',
                    color: COLORS.textSecondary,
                    lineHeight: 1.6,
                    margin: 0,
                  }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 6: LIVE DEMO
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={demoSection.ref} style={{
          padding: 'clamp(60px, 10vh, 120px) clamp(16px, 5vw, 48px)',
          background: COLORS.bgDeep,
          opacity: demoSection.visible ? 1 : 0,
          transform: demoSection.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              textAlign: 'center',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>
              See it in action.
            </h2>
            <p style={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: '1rem',
              textAlign: 'center',
              color: COLORS.textMuted,
              margin: '0 0 40px',
            }}>
              This is what you see when you start 0nMCP.
            </p>

            {/* Demo terminal */}
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              animation: demoSection.visible ? 'terminalGlow 4s ease-in-out infinite' : 'none',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                <span style={{
                  marginLeft: 12,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem',
                  color: COLORS.textMuted,
                }}>terminal</span>
              </div>

              {/* Body */}
              <div style={{
                padding: 'clamp(20px, 3vw, 32px)',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 'clamp(0.72rem, 1.3vw, 0.85rem)',
                lineHeight: 1.9,
              }}>
                <div style={{ color: COLORS.textMuted }}>$ 0nmcp</div>
                <div style={{ height: 12 }} />
                <div style={{ color: COLORS.green, fontWeight: 700 }}>
                  {'  '}0nMCP v3.2.2 -- Universal AI API Orchestrator
                </div>
                <div style={{ height: 8 }} />
                <div style={{ color: COLORS.textSecondary }}>
                  {'  '}Tools:{'      '}<span ref={toolsCounter.ref} style={{ color: COLORS.textPrimary, fontWeight: 600 }}>{toolsCounter.count.toLocaleString()}</span>
                </div>
                <div style={{ color: COLORS.textSecondary }}>
                  {'  '}Services:{'   '}<span ref={servicesCounter.ref} style={{ color: COLORS.textPrimary, fontWeight: 600 }}>{servicesCounter.count}</span>
                </div>
                <div style={{ color: COLORS.textSecondary }}>
                  {'  '}Categories:{'  '}<span ref={categoriesCounter.ref} style={{ color: COLORS.textPrimary, fontWeight: 600 }}>{categoriesCounter.count}</span>
                </div>
                <div style={{ color: COLORS.textSecondary }}>
                  {'  '}License:{'    '}<span style={{ color: COLORS.textPrimary, fontWeight: 600 }}>MIT</span>
                </div>
                <div style={{ height: 12 }} />
                <div style={{ color: COLORS.teal }}>
                  {'  '}Ready. Describe your outcome.
                </div>
                <div style={{ height: 8 }} />
                <div style={{ color: COLORS.textPrimary }}>
                  {'> '}<span style={{ animation: 'blink 1s step-end infinite', color: COLORS.green }}>_</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 7: PRICING
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={pricingSection.ref} style={{
          padding: 'clamp(60px, 10vh, 120px) clamp(16px, 5vw, 48px)',
          background: COLORS.bgPrimary,
          opacity: pricingSection.visible ? 1 : 0,
          transform: pricingSection.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              textAlign: 'center',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>
              Simple pricing. No surprises.
            </h2>
            <p style={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: '1rem',
              textAlign: 'center',
              color: COLORS.textMuted,
              margin: '0 0 48px',
            }}>
              Start free. Scale when you are ready.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              alignItems: 'stretch',
            }}>
              {PRICING.map((plan, i) => (
                <div key={plan.tier} style={{
                  background: plan.highlighted ? 'rgba(126,217,87,0.04)' : COLORS.bgCard,
                  border: `1px solid ${plan.highlighted ? COLORS.green + '44' : COLORS.border}`,
                  borderRadius: 14,
                  padding: 'clamp(28px, 3vw, 40px) clamp(20px, 2.5vw, 32px)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: pricingSection.visible ? `fadeInUp 0.5s ease ${i * 0.12}s both` : 'none',
                }}>
                  {/* Popular badge */}
                  {plan.highlighted && (
                    <div style={{
                      position: 'absolute',
                      top: 14,
                      right: -28,
                      background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
                      color: COLORS.bgPrimary,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '4px 36px',
                      transform: 'rotate(45deg)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>Popular</div>
                  )}

                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    margin: '0 0 8px',
                    color: plan.highlighted ? COLORS.green : COLORS.textPrimary,
                  }}>{plan.tier}</h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 4,
                    marginBottom: 24,
                  }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '2.4rem',
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                    }}>{plan.price}</span>
                    <span style={{
                      fontFamily: '"Nunito Sans", sans-serif',
                      fontSize: '0.9rem',
                      color: COLORS.textMuted,
                    }}>{plan.period}</span>
                  </div>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    flex: 1,
                  }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontSize: '0.9rem',
                        color: COLORS.textSecondary,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a href={plan.href} style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 20px',
                    borderRadius: 8,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    ...(plan.highlighted ? {
                      background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
                      color: COLORS.bgPrimary,
                      boxShadow: `0 0 20px ${COLORS.greenGlow}`,
                    } : {
                      background: 'rgba(255,255,255,0.06)',
                      color: COLORS.textPrimary,
                      border: `1px solid ${COLORS.border}`,
                    }),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 8: SOCIAL PROOF
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={socialSection.ref} style={{
          padding: 'clamp(60px, 10vh, 100px) clamp(16px, 5vw, 48px)',
          background: COLORS.bgDeep,
          opacity: socialSection.visible ? 1 : 0,
          transform: socialSection.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 800,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}>
              Trusted by developers and businesses worldwide.
            </h2>
            <p style={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: '1rem',
              color: COLORS.textMuted,
              margin: '0 0 40px',
              lineHeight: 1.6,
            }}>
              Open source. Community-driven. Growing every day.
            </p>

            {/* Stats cards */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 40,
            }}>
              {[
                { label: 'Reddit opportunities tracked', value: '1,058' },
                { label: 'Blog articles published', value: '10' },
                { label: 'Community profiles', value: '34' },
              ].map((stat, i) => (
                <div key={stat.label} style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: '20px 28px',
                  minWidth: 180,
                  animation: socialSection.visible ? `fadeInUp 0.4s ease ${i * 0.1}s both` : 'none',
                }}>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: COLORS.green,
                    marginBottom: 4,
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontSize: '0.8rem',
                    color: COLORS.textMuted,
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Badge placeholders */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}>
              {/* GitHub stars badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8rem',
                color: COLORS.textSecondary,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                GitHub Stars
              </div>

              {/* npm downloads badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8rem',
                color: COLORS.textSecondary,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                npm Downloads
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 9: BOTTOM CTA
            ════════════════════════════════════════════════════════════════════ */}
        <section ref={bottomCta.ref} style={{
          position: 'relative',
          padding: 'clamp(80px, 12vh, 140px) clamp(16px, 5vw, 48px)',
          background: COLORS.bgDeep,
          textAlign: 'center',
          overflow: 'hidden',
          opacity: bottomCta.visible ? 1 : 0,
          transform: bottomCta.visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {/* Green glow background */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.greenGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
            opacity: 0.5,
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
            {/* Logo */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
              boxShadow: `0 0 40px ${COLORS.greenGlow}`,
            }}>
              <span style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 22,
                fontWeight: 800,
                color: COLORS.bgPrimary,
              }}>0n</span>
            </div>

            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(2rem, 4.5vw, 3rem)',
              fontWeight: 900,
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}>
              Your entire stack. One command.
            </h2>
            <p style={{
              fontFamily: '"Nunito Sans", sans-serif',
              fontSize: '1.1rem',
              color: COLORS.textSecondary,
              margin: '0 0 36px',
              lineHeight: 1.6,
            }}>
              Join thousands of developers who stopped writing boilerplate and started describing outcomes.
            </p>

            {/* CTA button */}
            <a href="/signup" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 40px',
              borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
              color: COLORS.bgPrimary,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              animation: 'pulseGlow 3s ease-in-out infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Get Started Free
            </a>

            {/* npm command */}
            <div style={{
              marginTop: 24,
              display: 'inline-block',
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: '10px 20px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.85rem',
              color: COLORS.textSecondary,
            }}>
              npm install -g 0nmcp
            </div>

            {/* Links */}
            <div style={{
              marginTop: 40,
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'GitHub', href: 'https://github.com/0nork/0nmcp' },
                { label: 'npm', href: 'https://npmjs.com/package/0nmcp' },
                { label: 'Docs', href: '/learn' },
                { label: 'Community', href: '/community' },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontFamily: '"Nunito Sans", sans-serif',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.green }}
                onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textMuted }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
