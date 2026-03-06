'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* ─── Product Suite ──────────────────────────────────────── */

const PRODUCTS = [
  { name: '0nMCP', tag: 'Orchestrator', icon: '/brand/icons/0nmcp.svg', desc: '883 tools across 48 services. One command triggers Stripe, SendGrid, and CRM simultaneously.', href: '/', color: '#7ed957' },
  { name: '0nConsole', tag: 'Dashboard', icon: '/brand/icons/0nconsole.svg', desc: 'AI-powered control panel. Chat interface, visual builder, encrypted vault — all in one screen.', href: '/console', color: '#7ed957' },
  { name: '0nVault', tag: 'Security', icon: '/brand/icons/0nvault.svg', desc: 'Patent-pending AES-256-GCM encryption. 7 semantic layers. Multi-party escrow. Your keys stay yours.', href: '/security/vault', color: '#7ed957' },
  { name: '0nBrain', tag: 'AI Learning', icon: '/brand/icons/0nbrain.svg', desc: 'Adaptive learning engine. Signal weights, user intelligence profiles, behavioral fingerprints that improve over time.', href: '/console', color: '#7ed957' },
  { name: '0nArena', tag: 'AI Training', icon: '/brand/icons/0narena.svg', desc: '7 AI personas reason independently on any question. Empiricist, Adversary, Visionary — then synthesize a verdict.', href: '/console/tools/ai-training', color: '#7ed957' },
  { name: 'Social0n', tag: 'Social Media', icon: '/brand/icons/social0n.svg', desc: 'AI-powered multi-platform content generation. Smart scheduling, brand voice learning, and audience analytics.', href: '/products/social0n', color: '#00d4ff' },
  { name: 'App0n', tag: 'App Builder', icon: '/brand/icons/app0n.svg', desc: 'Build AI-native applications with auth, payments, and 0nMCP integration. One-click deploy to Vercel.', href: '/products/app0n', color: '#a78bfa' },
  { name: 'Web0n', tag: 'Website Builder', icon: '/brand/icons/web0n.svg', desc: 'Visual editor with AI page generation. Headless CMS, SEO automation, form capture, and analytics.', href: '/products/web0n', color: '#a78bfa' },
  { name: 'CRO9', tag: 'SEO Engine', icon: '/brand/icons/cro9.svg', desc: 'Self-learning SEO engine. Google Search Console integration, adaptive scoring, CTR gap detection, daily auto-analysis.', href: '/products/cro9', color: '#00d4ff' },
  { name: '0nBoard', tag: 'Community', icon: '/brand/icons/0nboard.svg', desc: 'Built-in community forum with profiles, karma, badges, and tag-triggered automation workflows.', href: '/community', color: '#7ed957' },
  { name: '0nStore', tag: 'Marketplace', icon: '/brand/icons/0nstore.svg', desc: 'Premium .0n workflows, Chrome extensions, and AI packs. Buy, sell, and share automation recipes.', href: '/store', color: '#7ed957' },
  { name: '0nCall', tag: 'AI Assistant', icon: '/brand/icons/0ncall.svg', desc: 'Interactive sidebar AI that understands your context. Multi-persona reasoning with vault integration.', href: '/console', color: '#00d4ff' },
  { name: '0nDefender', tag: 'Security Scanner', icon: '/brand/icons/0ndefender.svg', desc: 'Automated security scanning, threat detection, email reporting. Guard your digital infrastructure.', href: '/security', color: '#7ed957' },
  { name: '0nSwitch', tag: 'Workflows', icon: '/brand/icons/0nswitch.svg', desc: 'Portable .0n workflow files. Create, share, and run automation recipes across any 0nMCP-compatible platform.', href: '/0n-standard', color: '#7ed957' },
]

/* ─── Services ───────────────────────────────────────────── */

const SERVICES = [
  'Stripe', 'Gmail', 'Slack', 'HubSpot', 'Shopify', 'Google Sheets',
  'Discord', 'Twilio', 'Notion', 'Airtable', 'Calendly', 'Zoom',
  'Jira', 'Linear', 'Zendesk', 'MongoDB', 'SendGrid', 'Mailchimp',
  'GitHub', 'Supabase', 'Google Drive', 'Google Calendar', 'OpenAI', 'Anthropic',
  'Microsoft', 'CRM', 'Resend', 'ListKit',
]

/* ─── Pricing ────────────────────────────────────────────── */

const PLANS = [
  {
    name: 'Free', tag: 'Turn It On', price: '$0', period: 'forever',
    desc: 'Get started. No credit card.', color: '#7ed957',
    bg: 'rgba(126,217,87,0.06)', border: 'rgba(126,217,87,0.2)',
    cta: 'Start Free', href: '/signup?redirect=/console',
    features: ['Console access', 'Encrypted Vault (5 services)', 'Visual workflow builder', 'Community access', '10 AI posts/month'],
  },
  {
    name: 'Creator', tag: 'Turn It Up', price: '$19', period: '/month',
    desc: '7-day free trial. Cancel anytime.', color: '#7ed957',
    bg: 'rgba(126,217,87,0.08)', border: 'rgba(126,217,87,0.35)',
    cta: 'Start Free Trial', href: '/signup?redirect=/console',
    features: ['Everything in Free', 'Unlimited executions', 'AI chat (BYOK)', 'Voice learning + correction memory', 'Full marketplace access', 'Vault sync across devices'],
  },
  {
    name: 'Operator', tag: 'The Full Stack', price: '$49', period: '/month',
    desc: '7-day free trial. Cancel anytime.', color: '#7ed957',
    bg: 'rgba(126,217,87,0.10)', border: 'rgba(126,217,87,0.45)',
    cta: 'Start Free Trial', href: '/signup?redirect=/console', popular: true,
    features: ['Everything in Creator', 'Multi-channel Social0n', 'CRM integration', 'Council Arena access', 'Analytics dashboard', 'Priority support'],
  },
  {
    name: 'Agency', tag: 'Run the Stack', price: '$149', period: '/month',
    desc: '7-day free trial. Cancel anytime.', color: '#00d4ff',
    bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.3)',
    cta: 'Contact Sales', href: '/contact',
    features: ['Everything in Operator', '10 client accounts', 'White-label branding', 'Team management', 'Dedicated support + SLA'],
  },
]

/* ─── FAQs ───────────────────────────────────────────────── */

const FAQS = [
  { q: 'What is 0nMCP?', a: '0nMCP is a Universal AI API Orchestrator that connects 48 services (883 tools) into one platform. You describe what you want done in plain English, and AI executes it across all your connected services simultaneously.' },
  { q: 'Do I need to know how to code?', a: 'No. Type what you want in plain English. The AI figures out the rest. Or use the drag-and-drop visual builder to create workflows without writing a single line of code.' },
  { q: 'Is my data safe?', a: 'Your API keys are encrypted with AES-256-GCM before they ever leave your browser. The encryption system has a pending U.S. patent (Application #63/990,046). We literally cannot read your credentials.' },
  { q: 'What services does it connect to?', a: '48 services including Stripe, Gmail, Slack, HubSpot, Shopify, Google Sheets, Discord, Twilio, Notion, Airtable, OpenAI, Anthropic, Supabase, and many more. New services are added regularly.' },
  { q: 'How does the AI Training system work?', a: 'The Council Arena uses 7 AI personas that independently reason on any question. Each persona has a unique reasoning framework — from empirical analysis to ethical evaluation to adversarial stress-testing. The system learns from your rankings to improve over time.' },
  { q: 'What is a SWITCH file?', a: 'SWITCH files (.0n) are portable workflow definitions that capture your automations in a universal format. They can be shared, version-controlled, and run across any 0nMCP-compatible platform. Think of them as recipes for automation.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no hidden fees. Cancel from your account page in one click. Your data stays yours.' },
  { q: 'What is BYOK?', a: 'Bring Your Own Key. You connect your own AI API key (like Anthropic or OpenAI) through the encrypted Vault. Your key powers the AI chat — unlimited, on your own account. We never see it.' },
]

/* ─── Demo Pipeline Steps ────────────────────────────────── */

const PIPELINE_STEPS = [
  { service: 'Stripe', action: 'Create Invoice', color: '#635bff' },
  { service: 'SendGrid', action: 'Email Invoice', color: '#1a82e2' },
  { service: 'CRM', action: 'Log Activity', color: '#ff6b35' },
]

/* ─── Shared Components ──────────────────────────────────── */

function CtaButton({ children, href, size = 'lg', variant = 'primary' }: {
  children: React.ReactNode; href: string; size?: 'lg' | 'md'; variant?: 'primary' | 'secondary'
}) {
  return (
    <Link href={href} className="inline-flex items-center justify-center font-semibold rounded-xl transition-all no-underline"
      style={{
        padding: size === 'lg' ? '16px 40px' : '12px 28px',
        fontSize: size === 'lg' ? '16px' : '14px',
        background: variant === 'primary' ? 'linear-gradient(135deg, #7ed957, #5cb83a)' : 'rgba(255,255,255,0.06)',
        color: variant === 'primary' ? '#0a0a0f' : '#e8e8ef',
        border: variant === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.1)',
        textDecoration: 'none',
      }}
    >{children}</Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg, #7ed957, #00d4ff)', borderRadius: 2, margin: '0 auto 16px' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)' }}>
        {children}
      </span>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left cursor-pointer"
        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)', padding: 0 }}>
        <span>{q}</span>
        <span style={{ color: 'var(--accent)', fontSize: 20, transition: 'transform 0.2s ease', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 16 }}>+</span>
      </button>
      {open && <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>{a}</p>}
    </div>
  )
}

/* ─── Animated Demo Component ────────────────────────────── */

function DemoSection() {
  const [phase, setPhase] = useState<'typing' | 'processing' | 'done'>('typing')
  const [typed, setTyped] = useState('')
  const [activeStep, setActiveStep] = useState(-1)
  const [progress, setProgress] = useState([0, 0, 0])
  const command = 'Create a Stripe invoice for $500, email it via SendGrid, and log it in the CRM'
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let i = 0
    setPhase('typing')
    setTyped('')
    setActiveStep(-1)
    setProgress([0, 0, 0])

    intervalRef.current = setInterval(() => {
      i++
      if (i <= command.length) {
        setTyped(command.slice(0, i))
      } else if (i === command.length + 15) {
        setPhase('processing')
        setActiveStep(0)
      } else if (i === command.length + 30) {
        setProgress(p => [100, p[1], p[2]])
        setActiveStep(1)
      } else if (i === command.length + 45) {
        setProgress(p => [100, 100, p[2]])
        setActiveStep(2)
      } else if (i === command.length + 60) {
        setProgress([100, 100, 100])
        setPhase('done')
      } else if (i > command.length + 100) {
        i = 0
        setPhase('typing')
        setTyped('')
        setActiveStep(-1)
        setProgress([0, 0, 0])
      }
    }, 40)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const termStyle: React.CSSProperties = {
    borderRadius: 12,
    background: '#111118',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  }

  const dotBar: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.02)',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
      {/* Panel 1: Describe */}
      <div style={termStyle}>
        <div style={dotBar}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>01 Describe</span>
        </div>
        <div style={{ padding: '24px 20px', minHeight: 140 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <span style={{ color: 'var(--accent)' }}>&gt;</span> {typed}
            {phase === 'typing' && <span style={{ color: 'var(--accent)', animation: 'blink 1s infinite' }}>|</span>}
          </div>
          {phase !== 'typing' && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: phase === 'done' ? '#7ed957' : '#fbbf24', animation: phase === 'processing' ? 'pulse-dot 1s infinite' : 'none' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: phase === 'done' ? '#7ed957' : '#fbbf24' }}>
                {phase === 'done' ? 'Complete — 3 services executed' : 'Processing 3 services...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Panel 2: Orchestrate */}
      <div style={termStyle}>
        <div style={dotBar}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>02 Orchestrate</span>
        </div>
        <div style={{ padding: '20px', minHeight: 140, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.service} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: step.color, opacity: activeStep >= i ? 1 : 0.3, transition: 'opacity 0.3s' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: activeStep >= i ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color 0.3s' }}>{step.service}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.action}</div>
              </div>
              <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, background: step.color, width: `${progress[i]}%`, transition: 'width 0.6s ease' }} />
              </div>
              {progress[i] === 100 && <span style={{ color: '#7ed957', fontSize: 14 }}>&#x2713;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Panel 3: Done */}
      <div style={termStyle}>
        <div style={dotBar}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ marginLeft: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>03 Done</span>
        </div>
        <div style={{ padding: '20px', minHeight: 140 }}>
          {phase === 'done' ? (
            <div style={{ animation: 'fade-in 0.3s ease' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ed957', marginBottom: 12 }}>&#x2713; All 3 services completed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Invoice</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>INV-2026-0847</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Delivered</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>CRM</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Activity logged</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Time</span>
                  <span style={{ color: '#7ed957', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>1.2s</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-muted)', fontSize: 14 }}>
              {phase === 'typing' ? 'Waiting for command...' : 'Executing...'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Counter Animation ──────────────────────────────────── */

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true
        const duration = 1500
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function GoClient() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Sticky Header ────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/brand/icon-green.png" alt="0nMCP" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>0nMCP</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}>Sign In</Link>
          <Link href="/signup?redirect=/console" className="no-underline" style={{
            padding: '8px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
            color: '#0a0a0f', fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>Start Free</Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 100,
          background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)',
          color: '#7ed957', fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: '0.03em',
        }}>
          883 tools &middot; 48 services &middot; Patent pending
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.08,
          letterSpacing: '-0.035em', color: 'var(--text-primary)', marginBottom: 24,
        }}>
          Describe it.{' '}
          <span style={{ background: 'linear-gradient(135deg, #7ed957, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI does it.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.7,
          color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 40px',
        }}>
          0nMCP connects your CRM, email, payments, social media, and 44 other services into one AI-powered platform.
          One command triggers everything. One screen controls it all.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <CtaButton href="/signup?redirect=/console">Start Free &mdash; No Credit Card</CtaButton>
          <CtaButton href="#demo" variant="secondary" size="md">See it in action</CtaButton>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section style={{ padding: '40px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            { v: 883, s: '+', l: 'Tools' },
            { v: 48, s: '', l: 'Services' },
            { v: 14, s: '', l: 'Products' },
            { v: 7, s: '', l: 'AI Personas' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                <AnimatedCounter end={s.v} suffix={s.s} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO: Describe. Orchestrate. Done. ────────────── */}
      <section id="demo" className="section-recessed" style={{ padding: '80px 24px' }}>
        <SectionLabel>See it in action</SectionLabel>
        <h2 style={{
          fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, textAlign: 'center',
          letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 16,
        }}>
          Describe. Orchestrate. Done.
        </h2>
        <p style={{
          textAlign: 'center', fontSize: '1.05rem', color: 'var(--text-secondary)',
          maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.7,
        }}>
          Watch 0nMCP execute a real multi-service workflow in under a second.
          One natural language command triggers Stripe, SendGrid, and CRM simultaneously.
        </p>
        <DemoSection />
      </section>

      {/* ── PRODUCT SUITE ────────────────────────────────── */}
      <section className="section-elevated" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel>The 0n Ecosystem</SectionLabel>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, textAlign: 'center',
          letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 12,
        }}>
          14 products.{' '}
          <span style={{ color: 'var(--accent)' }}>One platform.</span>
        </h2>
        <p style={{
          textAlign: 'center', fontSize: '1.05rem', color: 'var(--text-secondary)',
          maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7,
        }}>
          Every tool your business needs — orchestration, security, AI, social, apps, websites, SEO, community, and marketplace.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {PRODUCTS.map(p => (
            <Link key={p.name} href={p.href} className="float-card" style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              padding: '24px 20px', borderRadius: 14,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              textDecoration: 'none', transition: 'all 0.25s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Image src={p.icon} alt={p.name} width={32} height={32} style={{ filter: 'brightness(1)' }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: p.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.tag}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECURITY ─────────────────────────────────────── */}
      <section className="section-recessed" style={{ padding: '80px 24px' }}>
        <SectionLabel>Enterprise Security</SectionLabel>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, textAlign: 'center',
          letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 48,
        }}>
          Patent-pending protection
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { title: 'AES-256-GCM', desc: 'Military-grade encryption for all credentials. Your API keys are encrypted before they leave your browser.' },
            { title: 'Zero Knowledge', desc: 'We literally cannot read your keys. Decryption happens only on your device with your passphrase.' },
            { title: 'Patent Pending', desc: 'U.S. Patent Application #63/990,046 — 0nVault Container System with 7 semantic layers.' },
            { title: 'Multi-Party Escrow', desc: 'X25519 ECDH key exchange. Up to 8 parties with per-layer access control and replay prevention.' },
            { title: 'Seal of Truth', desc: 'SHA3-256 content-addressed integrity verification. Tamper-proof audit trail for every operation.' },
            { title: 'Ed25519 Signatures', desc: 'Digital signatures on every container. Chain of custody tracking for business deed transfers.' },
          ].map(s => (
            <div key={s.title} style={{
              padding: '24px 20px', borderRadius: 14,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONNECTED SERVICES ────────────────────────────── */}
      <section className="section-elevated" style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 24,
        }}>
          48 services. One API key each. Infinite possibilities.
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {SERVICES.map(s => (
            <span key={s} style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
            }}>{s}</span>
          ))}
          <span style={{
            padding: '6px 14px', borderRadius: 8,
            background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)',
            color: '#7ed957', fontSize: 13, fontWeight: 600,
          }}>+ 20 more</span>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section-recessed" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <SectionLabel>Quick Start</SectionLabel>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, textAlign: 'center',
          letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 48,
        }}>
          Three steps. Five minutes.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { num: '01', title: 'Sign up', desc: 'Free. 30 seconds. No credit card required.', color: '#7ed957' },
            { num: '02', title: 'Connect your tools', desc: 'Paste your API keys into the encrypted Vault. We can\'t see them — ever.', color: '#00d4ff' },
            { num: '03', title: 'Describe what you need', desc: 'Type in plain English or drag and drop in the visual builder. AI handles the rest.', color: '#a78bfa' },
          ].map(s => (
            <div key={s.num} style={{ padding: '32px 28px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'var(--font-mono)', color: s.color, opacity: 0.3, lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{s.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="section-elevated" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>Pricing</SectionLabel>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, textAlign: 'center',
          letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 12,
        }}>
          Simple pricing. No surprises.
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 15 }}>
          Start free. Upgrade when you&apos;re ready. Cancel anytime.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16, alignItems: 'start',
        }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              padding: '28px 24px', borderRadius: 16,
              background: plan.bg,
              border: plan.popular ? `2px solid ${plan.border}` : `1px solid ${plan.border}`,
              position: 'relative',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 16px', borderRadius: 100,
                  background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                  color: '#0a0a0f', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Most Popular</div>
              )}
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{plan.tag}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'start', gap: 10, fontSize: 13 }}>
                    <span style={{ color: plan.color, fontSize: 13, lineHeight: '18px', flexShrink: 0 }}>&check;</span>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: '18px' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="no-underline" style={{
                display: 'block', textAlign: 'center', padding: 12, borderRadius: 12,
                fontWeight: 700, fontSize: 14, textDecoration: 'none',
                background: plan.popular ? `linear-gradient(135deg, ${plan.color}, ${plan.color === '#7ed957' ? '#5cb83a' : '#0099cc'})` : 'rgba(255,255,255,0.06)',
                color: plan.popular ? '#0a0a0f' : 'var(--text-primary)',
                border: plan.popular ? 'none' : '1px solid var(--border)',
              }}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="section-recessed" style={{ padding: '80px 24px', maxWidth: 700, margin: '0 auto' }}>
        <SectionLabel>FAQ</SectionLabel>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, textAlign: 'center',
          letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 40,
        }}>
          Questions? Answers.
        </h2>
        <div>{FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800,
          letterSpacing: '-0.035em', color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.1,
        }}>
          Ready to{' '}
          <span style={{ background: 'linear-gradient(135deg, #7ed957, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Turn it 0n?
          </span>
        </h2>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
          Free account. No credit card. Start automating in 5 minutes.
        </p>
        <CtaButton href="/signup?redirect=/console">Create Your Free Account &rarr;</CtaButton>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ padding: '32px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          &copy; {new Date().getFullYear()} RocketOpp LLC &middot; Patent Pending #63/990,046 &middot;{' '}
          <Link href="/legal" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Legal</Link>
          {' '}&middot;{' '}
          <Link href="/security" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Security</Link>
        </p>
      </footer>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}
