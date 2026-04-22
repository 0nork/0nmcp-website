'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SERVICE_LOGOS } from '@/components/ServiceLogos'
import { STATS, STATS_DISPLAY } from '@/data/stats'

/* ─── Product Suite ──────────────────────────────────────── */

const PRODUCTS = [
  { name: '0nMCP', tag: 'Orchestrator', icon: '/brand/icons/0nmcp.svg', desc: `${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services. One command triggers Stripe, SendGrid, and CRM simultaneously.`, href: '/', color: '#6EE05A' },
  { name: '0nConsole', tag: 'Dashboard', icon: '/brand/icons/0nconsole.svg', desc: 'AI-powered control panel. Chat interface, visual builder, encrypted vault — all in one screen.', href: '/console', color: '#6EE05A' },
  { name: '0nVault', tag: 'Security', icon: '/brand/icons/0nvault.svg', desc: 'Patent-pending AES-256-GCM encryption. 7 semantic layers. Multi-party escrow. Your keys stay yours.', href: '/security/vault', color: '#6EE05A' },
  { name: '0nBrain', tag: 'AI Learning', icon: '/brand/icons/0nbrain.svg', desc: 'Adaptive learning engine. Signal weights, user intelligence profiles, behavioral fingerprints that improve over time.', href: '/console', color: '#6EE05A' },
  { name: '0nArena', tag: 'AI Training', icon: '/brand/icons/0narena.svg', desc: '7 AI personas reason independently on any question. Empiricist, Adversary, Visionary — then synthesize a verdict.', href: '/console/tools/ai-training', color: '#6EE05A' },
  { name: 'Social0n', tag: 'Social Media', icon: '/brand/icons/social0n.svg', desc: 'AI-powered multi-platform content generation. Smart scheduling, brand voice learning, and audience analytics.', href: '/products/social0n', color: '#00d4ff' },
  { name: 'App0n', tag: 'App Builder', icon: '/brand/icons/app0n.svg', desc: 'Build AI-native applications with auth, payments, and 0nMCP integration. One-click deploy to Vercel.', href: '/products/app0n', color: '#a78bfa' },
  { name: 'Web0n', tag: 'Website Builder', icon: '/brand/icons/web0n.svg', desc: 'Visual editor with AI page generation. Headless CMS, SEO automation, form capture, and analytics.', href: '/products/web0n', color: '#a78bfa' },
  { name: 'CRO9', tag: 'SEO Engine', icon: '/brand/icons/cro9.svg', desc: 'Self-learning SEO engine. Google Search Console integration, adaptive scoring, CTR gap detection, daily auto-analysis.', href: '/products/cro9', color: '#00d4ff' },
  { name: '0nBoard', tag: 'Community', icon: '/brand/icons/0nboard.svg', desc: 'Built-in community forum with profiles, karma, badges, and tag-triggered automation workflows.', href: '/community', color: '#6EE05A' },
  { name: '0nStore', tag: 'Marketplace', icon: '/brand/icons/0nstore.svg', desc: 'Premium .0n workflows, Chrome extensions, and AI packs. Buy, sell, and share automation recipes.', href: '/store', color: '#6EE05A' },
  { name: '0nCall', tag: 'AI Assistant', icon: '/brand/icons/0ncall.svg', desc: 'Interactive sidebar AI that understands your context. Multi-persona reasoning with vault integration.', href: '/console', color: '#00d4ff' },
  { name: '0nDefender', tag: 'Security Scanner', icon: '/brand/icons/0ndefender.svg', desc: 'Automated security scanning, threat detection, email reporting. Guard your digital infrastructure.', href: '/security', color: '#6EE05A' },
  { name: '0nSwitch', tag: 'Workflows', icon: '/brand/icons/0nswitch.svg', desc: 'Portable .0n workflow files. Create, share, and run automation recipes across any 0nMCP-compatible platform.', href: '/0n-standard', color: '#6EE05A' },
]

/* ─── Carousel Services (real SVG logos) ─────────────────── */

const CAROUSEL_SERVICES = [
  { name: 'Rocket+', key: 'crm' },
  { name: 'Stripe', key: 'stripe' },
  { name: 'SendGrid', key: 'sendgrid' },
  { name: 'Slack', key: 'slack' },
  { name: 'Discord', key: 'discord' },
  { name: 'Twilio', key: 'twilio' },
  { name: 'GitHub', key: 'github' },
  { name: 'Shopify', key: 'shopify' },
  { name: 'OpenAI', key: 'openai' },
  { name: 'Anthropic', key: 'anthropic' },
  { name: 'Gmail', key: 'gmail' },
  { name: 'Sheets', key: 'google-sheets' },
  { name: 'Drive', key: 'google-drive' },
  { name: 'Airtable', key: 'airtable' },
  { name: 'Notion', key: 'notion' },
  { name: 'MongoDB', key: 'mongodb' },
  { name: 'Supabase', key: 'supabase' },
  { name: 'Zendesk', key: 'zendesk' },
  { name: 'Jira', key: 'jira' },
  { name: 'HubSpot', key: 'hubspot' },
  { name: 'Mailchimp', key: 'mailchimp' },
  { name: 'Calendar', key: 'google-calendar' },
  { name: 'Calendly', key: 'calendly' },
  { name: 'Zoom', key: 'zoom' },
  { name: 'Linear', key: 'linear' },
  { name: 'Microsoft', key: 'microsoft' },
  { name: 'QuickBooks', key: 'quickbooks' },
  { name: 'Asana', key: 'asana' },
  { name: 'Intercom', key: 'intercom' },
  { name: 'Dropbox', key: 'dropbox' },
  { name: 'WhatsApp', key: 'whatsapp' },
  { name: 'Instagram', key: 'instagram' },
  { name: 'X', key: 'x' },
  { name: 'TikTok', key: 'tiktok' },
  { name: 'Google Ads', key: 'google-ads' },
  { name: 'Meta Ads', key: 'facebook-ads' },
  { name: 'Plaid', key: 'plaid' },
  { name: 'Square', key: 'square' },
  { name: 'Smartlead', key: 'smartlead' },
  { name: 'Zapier', key: 'zapier' },
  { name: 'MuleSoft', key: 'mulesoft' },
  { name: 'Azure', key: 'azure' },
  { name: 'Pipedrive', key: 'pipedrive' },
  { name: 'LinkedIn', key: 'linkedin' },
  { name: 'Telegram', key: 'telegram' },
  { name: 'Postmark', key: 'postmark' },
  { name: 'Groq', key: 'groq' },
  { name: 'ElevenLabs', key: 'elevenlabs' },
]

/* ─── Pricing ────────────────────────────────────────────── */

const PLANS = [
  {
    name: 'Free', tag: 'Turn It On', price: '$0', period: 'forever',
    desc: 'Get started. No credit card.', color: '#6EE05A',
    popular: false,
    cta: 'Request Access', href: '/signup?redirect=/console',
    features: ['Console access', 'Encrypted Vault (5 services)', 'Visual workflow builder', 'Community access', '10 AI posts/month'],
  },
  {
    name: 'Creator', tag: 'Turn It Up', price: '$19', period: '/month',
    desc: '7-day free trial. Cancel anytime.', color: '#6EE05A',
    popular: false,
    cta: 'Request Early Access', href: '/signup?redirect=/console',
    features: ['Everything in Free', 'Unlimited executions', 'AI chat (BYOK)', 'Voice learning + correction memory', 'Full marketplace access', 'Vault sync across devices'],
  },
  {
    name: 'Operator', tag: 'The Full Stack', price: '$49', period: '/month',
    desc: '7-day free trial. Cancel anytime.', color: '#6EE05A',
    popular: true,
    cta: 'Request Early Access', href: '/signup?redirect=/console',
    features: ['Everything in Creator', 'Multi-channel Social0n', 'CRM integration', 'Council Arena access', 'Analytics dashboard', 'Priority support'],
  },
  {
    name: 'Agency', tag: 'Run the Stack', price: '$149', period: '/month',
    desc: '7-day free trial. Cancel anytime.', color: '#00d4ff',
    popular: false,
    cta: 'Contact Sales', href: '/contact',
    features: ['Everything in Operator', '10 client accounts', 'White-label branding', 'Team management', 'Dedicated support + SLA'],
  },
]

/* ─── FAQs ───────────────────────────────────────────────── */

const FAQS = [
  { q: 'What is 0nMCP?', a: `0nMCP is a Universal AI API Orchestrator that connects ${STATS_DISPLAY.services} services (${STATS_DISPLAY.tools} tools) into one platform. You describe what you want done in plain English, and AI executes it across all your connected services simultaneously.` },
  { q: 'Do I need to know how to code?', a: 'No. Type what you want in plain English. The AI figures out the rest. Or use the drag-and-drop visual builder to create workflows without writing a single line of code.' },
  { q: 'Is my data safe?', a: 'Your API keys are encrypted with AES-256-GCM before they ever leave your browser. The encryption system has a pending U.S. patent (Application #63/990,046). We literally cannot read your credentials.' },
  { q: 'What services does it connect to?', a: `${STATS_DISPLAY.services} services including Stripe, Gmail, Slack, HubSpot, Shopify, Google Sheets, Discord, Twilio, Notion, Airtable, OpenAI, Anthropic, Supabase, and many more. New services are added regularly.` },
  { q: 'How does the AI Training system work?', a: 'The Council Arena uses 7 AI personas that independently reason on any question. Each persona has a unique reasoning framework — from empirical analysis to ethical evaluation to adversarial stress-testing. The system learns from your rankings to improve over time.' },
  { q: 'What is a SWITCH file?', a: 'SWITCH files (.0n) are portable workflow definitions that capture your automations in a universal format. They can be shared, version-controlled, and run across any 0nMCP-compatible platform. Think of them as recipes for automation.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no hidden fees. Cancel from your account page in one click. Your data stays yours.' },
  { q: 'What is BYOK?', a: 'Bring Your Own Key. You connect your own AI API key (like Anthropic or OpenAI) through the encrypted Vault. Your key powers the AI chat — unlimited, on your own account. We never see it.' },
]

/* ─── Demo Pipeline Steps ────────────────────────────────── */

const PIPELINE_STEPS = [
  { service: 'Stripe', action: 'Create Invoice', color: '#635bff' },
  { service: 'SendGrid', action: 'Email Invoice', color: '#1a82e2' },
  { service: 'Rocket+', action: 'Log Activity', color: '#ff6b35' },
]

/* ─── Shared Components ──────────────────────────────────── */

function CtaButton({ children, href, size = 'lg', variant = 'primary' }: {
  children: React.ReactNode; href: string; size?: 'lg' | 'md'; variant?: 'primary' | 'secondary'
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center font-semibold rounded-xl transition-all no-underline"
      style={{
        padding: size === 'lg' ? '16px 40px' : '12px 28px',
        fontSize: size === 'lg' ? '16px' : '14px',
        background: variant === 'primary' ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)' : 'var(--border)',
        color: variant === 'primary' ? '#0B0F19' : 'var(--text-primary)',
        border: variant === 'primary' ? 'none' : '1px solid var(--border)',
        textDecoration: 'none',
      }}
    >{children}</Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center mb-4">
      <div className="w-10 h-[3px] rounded-sm mx-auto mb-4" style={{ background: 'linear-gradient(90deg, #6EE05A, #00d4ff)' }} />
      <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
        {children}
      </span>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left cursor-pointer bg-transparent border-none p-0 text-[var(--text-primary)] text-base font-semibold"
      >
        <span>{q}</span>
        <span
          className="text-xl flex-shrink-0 ml-4 transition-transform duration-200 text-[var(--accent)]"
          style={{ transform: open ? 'rotate(45deg)' : 'none' }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="mt-3 mb-0 text-[var(--text-secondary)] text-[15px] leading-[1.7]">{a}</p>
      )}
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

  return (
    <div className="grid gap-4 max-w-[1100px] mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {/* Panel 1: Describe */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-border overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-white/[0.02]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">01 Describe</span>
        </div>
        <div className="px-5 py-6 min-h-[140px]">
          <div className="font-mono text-sm text-[var(--text-secondary)] leading-[1.7]">
            <span className="text-[var(--accent)]">&gt;</span> {typed}
            {phase === 'typing' && <span className="text-[var(--accent)] animate-[blink_1s_infinite]">|</span>}
          </div>
          {phase !== 'typing' && (
            <div className="mt-4 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: phase === 'done' ? '#6EE05A' : '#fbbf24',
                  animation: phase === 'processing' ? 'pulse-dot 1s infinite' : 'none',
                }}
              />
              <span className="font-mono text-[13px]" style={{ color: phase === 'done' ? '#6EE05A' : '#fbbf24' }}>
                {phase === 'done' ? 'Complete — 3 services executed' : 'Processing 3 services...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Panel 2: Orchestrate */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-border overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-white/[0.02]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">02 Orchestrate</span>
        </div>
        <div className="px-5 py-5 min-h-[140px] flex flex-col gap-3.5">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.service} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity duration-300"
                style={{ background: step.color, opacity: activeStep >= i ? 1 : 0.3 }}
              />
              <div className="flex-1">
                <div
                  className="text-sm font-semibold transition-colors duration-300"
                  style={{ color: activeStep >= i ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {step.service}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{step.action}</div>
              </div>
              <div className="w-20 h-1 rounded-sm bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-sm transition-[width] duration-[600ms] ease-out"
                  style={{ background: step.color, width: `${progress[i]}%` }}
                />
              </div>
              {progress[i] === 100 && <span className="text-[#6EE05A] text-sm">&#x2713;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Panel 3: Done */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-border overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-white/[0.02]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">03 Done</span>
        </div>
        <div className="px-5 py-5 min-h-[140px]">
          {phase === 'done' ? (
            <div className="animate-[fade-in_0.3s_ease]">
              <div className="font-mono text-[13px] text-[#6EE05A] mb-3">&#x2713; All 3 services completed</div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-muted)]">Invoice</span>
                  <span className="text-[var(--text-secondary)] font-mono">INV-2026-0847</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-muted)]">Email</span>
                  <span className="text-[var(--text-secondary)] font-mono">Delivered</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-muted)]">CRM</span>
                  <span className="text-[var(--text-secondary)] font-mono">Activity logged</span>
                </div>
                <div className="flex justify-between text-[13px] mt-2 pt-2 border-t border-border">
                  <span className="text-[var(--text-muted)]">Time</span>
                  <span className="text-[#6EE05A] font-mono font-semibold">1.2s</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-[var(--text-muted)] text-sm">
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
    <div className="bg-[var(--bg-primary)] min-h-screen">

      {/* ── Sticky Header ────────────────────────────────── */}
      <header className="sticky top-0 z-[100] flex items-center justify-between px-6 py-2.5 border-b border-border backdrop-blur-xl"
        style={{ background: 'rgba(10,10,15,0.85)' }}>
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/brand/icon-green.png" alt="0nMCP" width={28} height={28} className="object-contain" />
          <span className="font-extrabold text-base text-[var(--text-primary)]">0nMCP</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[var(--text-secondary)] no-underline">Sign In</Link>
          <Link
            href="/signup?redirect=/console"
            className="px-6 py-2 rounded-[10px] font-semibold text-sm no-underline text-[#0B0F19]"
            style={{ background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)' }}
          >
            Request Access
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-10 text-center max-w-[900px] mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full text-[#6EE05A] text-[13px] font-semibold mb-6 tracking-[0.03em]"
          style={{ background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)' }}>
          {STATS_DISPLAY.tools} tools &middot; {STATS_DISPLAY.services} services &middot; Patent pending
        </div>

        <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[var(--text-primary)] mb-6">
          Describe it.{' '}
          <span className="bg-gradient-to-br from-[#6EE05A] to-[#00d4ff] bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI does it.
          </span>
        </h1>

        <p className="text-[clamp(16px,2.5vw,20px)] leading-[1.7] text-[var(--text-secondary)] max-w-[640px] mx-auto mb-10">
          0nMCP connects your CRM, email, payments, social media, and 44 other services into one AI-powered platform.
          One command triggers everything. One screen controls it all.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <CtaButton href="/signup?redirect=/console">Request Early Access</CtaButton>
          <CtaButton href="#demo" variant="secondary" size="md">See it in action</CtaButton>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section className="px-6 pt-10 pb-16 max-w-[800px] mx-auto">
        <div className="flex justify-center gap-12 flex-wrap">
          {[
            { v: STATS.tools, s: '+', l: 'Tools' },
            { v: STATS.services, s: '', l: 'Services' },
            { v: 14, s: '', l: 'Products' },
            { v: 7, s: '', l: 'AI Personas' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className="text-[28px] font-extrabold text-[var(--text-primary)] font-mono">
                <AnimatedCounter end={s.v} suffix={s.s} />
              </div>
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.1em]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO: Describe. Orchestrate. Done. ────────────── */}
      <section id="demo" className="section-recessed px-6 py-20">
        <SectionLabel>See it in action</SectionLabel>
        <h2 className="text-[clamp(28px,5vw,48px)] font-extrabold text-center tracking-[-0.03em] text-[var(--text-primary)] mb-4">
          Describe. Orchestrate. Done.
        </h2>
        <p className="text-center text-[1.05rem] text-[var(--text-secondary)] max-w-[640px] mx-auto mb-12 leading-[1.7]">
          Watch 0nMCP execute a real multi-service workflow in under a second.
          One natural language command triggers Stripe, SendGrid, and CRM simultaneously.
        </p>
        <DemoSection />
      </section>

      {/* ── PRODUCT SUITE ────────────────────────────────── */}
      <section className="section-elevated px-6 py-20 max-w-[1200px] mx-auto">
        <SectionLabel>The 0n Ecosystem</SectionLabel>
        <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold text-center tracking-[-0.02em] text-[var(--text-primary)] mb-3">
          14 products.{' '}
          <span className="text-[var(--accent)]">One platform.</span>
        </h2>
        <p className="text-center text-[1.05rem] text-[var(--text-secondary)] max-w-[600px] mx-auto mb-12 leading-[1.7]">
          Every tool your business needs — orchestration, security, AI, social, apps, websites, SEO, community, and marketplace.
        </p>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {PRODUCTS.map(p => (
            <Link
              key={p.name}
              href={p.href}
              className="float-card flex flex-col gap-3 px-5 py-6 rounded-[14px] bg-[var(--bg-card)] border border-border no-underline transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <Image src={p.icon} alt={p.name} width={32} height={32} />
                <div>
                  <div className="text-base font-bold text-[var(--text-primary)]">{p.name}</div>
                  <div
                    className="text-[11px] font-mono uppercase tracking-[0.08em]"
                    style={{ color: p.color }}
                  >
                    {p.tag}
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed m-0">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECURITY ─────────────────────────────────────── */}
      <section className="section-recessed px-6 py-20">
        <SectionLabel>Enterprise Security</SectionLabel>
        <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold text-center tracking-[-0.02em] text-[var(--text-primary)] mb-12">
          Patent-pending protection
        </h2>

        <div className="grid gap-5 max-w-[1000px] mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            { title: 'AES-256-GCM', desc: 'Military-grade encryption for all credentials. Your API keys are encrypted before they leave your browser.' },
            { title: 'Zero Knowledge', desc: 'We literally cannot read your keys. Decryption happens only on your device with your passphrase.' },
            { title: 'Patent Pending', desc: 'U.S. Patent Application #63/990,046 — 0nVault Container System with 7 semantic layers.' },
            { title: 'Multi-Party Escrow', desc: 'X25519 ECDH key exchange. Up to 8 parties with per-layer access control and replay prevention.' },
            { title: 'Seal of Truth', desc: 'SHA3-256 content-addressed integrity verification. Tamper-proof audit trail for every operation.' },
            { title: 'Ed25519 Signatures', desc: 'Digital signatures on every container. Chain of custody tracking for business deed transfers.' },
          ].map(s => (
            <div key={s.title} className="px-5 py-6 rounded-[14px] bg-[var(--bg-card)] border border-border">
              <h3 className="text-[15px] font-bold text-[var(--accent)] mb-2 font-mono">{s.title}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed m-0">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONNECTED SERVICES CAROUSEL ──────────────────── */}
      <section className="section-elevated py-16 text-center">
        <div className="px-6 mb-8">
          <h2 className="text-[clamp(20px,3vw,32px)] font-bold text-[var(--text-primary)] tracking-[-0.02em] mb-2">
            {STATS_DISPLAY.services} services. One API key each. Infinite possibilities.
          </h2>
          <p className="text-sm text-[var(--text-muted)] m-0">
            Real SVG logos. Real integrations. All connected.
          </p>
        </div>

        <div className="relative overflow-hidden h-[50px]">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-20 z-[2] pointer-events-none"
            style={{ background: 'linear-gradient(to right, var(--bg-primary), transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-20 z-[2] pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--bg-primary), transparent)' }}
          />
          {/* Scrolling track */}
          <div className="flex items-center h-[50px] gap-10 w-max animate-[service-scroll_60s_linear_infinite]">
            {/* Original set */}
            {CAROUSEL_SERVICES.map((s, i) => {
              const Logo = SERVICE_LOGOS[s.key]
              return (
                <div key={`a-${i}`} className="flex items-center gap-2.5 flex-shrink-0">
                  {Logo ? <Logo size={24} /> : (
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-[#6EE05A]"
                      style={{ background: 'rgba(126,217,87,0.15)' }}>
                      {s.name[0]}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">{s.name}</span>
                </div>
              )
            })}
            {/* Duplicate for seamless loop */}
            {CAROUSEL_SERVICES.map((s, i) => {
              const Logo = SERVICE_LOGOS[s.key]
              return (
                <div key={`b-${i}`} className="flex items-center gap-2.5 flex-shrink-0">
                  {Logo ? <Logo size={24} /> : (
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-[#6EE05A]"
                      style={{ background: 'rgba(126,217,87,0.15)' }}>
                      {s.name[0]}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">{s.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section-recessed px-6 py-20 max-w-[900px] mx-auto">
        <SectionLabel>Quick Start</SectionLabel>
        <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold text-center tracking-[-0.02em] text-[var(--text-primary)] mb-12">
          Three steps. Five minutes.
        </h2>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            { num: '01', title: 'Sign up', desc: 'Free. 30 seconds. No credit card required.', color: '#6EE05A' },
            { num: '02', title: 'Connect your tools', desc: "Paste your API keys into the encrypted Vault. We can't see them — ever.", color: '#00d4ff' },
            { num: '03', title: 'Describe what you need', desc: 'Type in plain English or drag and drop in the visual builder. AI handles the rest.', color: '#a78bfa' },
          ].map(s => (
            <div key={s.num} className="px-7 py-8 rounded-2xl bg-[var(--bg-card)] border border-border">
              <div className="text-[40px] font-black font-mono leading-none mb-4 opacity-30" style={{ color: s.color }}>{s.num}</div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] m-0">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="section-elevated px-6 py-20 max-w-[1100px] mx-auto">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold text-center tracking-[-0.02em] text-[var(--text-primary)] mb-3">
          Simple pricing. No surprises.
        </h2>
        <p className="text-center text-[var(--text-muted)] mb-12 text-[15px]">
          Start free. Upgrade when you&apos;re ready. Cancel anytime.
        </p>

        <div className="grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="px-6 py-7 rounded-2xl relative"
              style={{
                background: plan.name === 'Agency' ? 'rgba(0,212,255,0.06)' : 'rgba(126,217,87,0.06)',
                border: plan.popular
                  ? `2px solid ${plan.name === 'Agency' ? 'rgba(0,212,255,0.45)' : 'rgba(126,217,87,0.45)'}`
                  : `1px solid ${plan.name === 'Agency' ? 'rgba(0,212,255,0.2)' : 'rgba(126,217,87,0.2)'}`,
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] text-[#0B0F19] whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)' }}
                >
                  Most Popular
                </div>
              )}
              <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-[0.08em] mb-1">{plan.tag}</div>
              <h3 className="text-xl font-bold mb-1" style={{ color: plan.color }}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[36px] font-extrabold text-[var(--text-primary)] font-mono">{plan.price}</span>
                <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>
              </div>
              <p className="text-[13px] text-[var(--text-muted)] mb-5">{plan.desc}</p>
              <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <span className="flex-shrink-0 leading-[18px]" style={{ color: plan.color }}>&check;</span>
                    <span className="text-[var(--text-secondary)] leading-[18px]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className="block text-center py-3 rounded-xl font-bold text-sm no-underline"
                style={{
                  background: plan.popular
                    ? `linear-gradient(135deg, ${plan.color}, ${plan.color === '#6EE05A' ? '#4CAF3D' : '#0099cc'})`
                    : 'var(--border)',
                  color: plan.popular ? '#0B0F19' : 'var(--text-primary)',
                  border: plan.popular ? 'none' : '1px solid var(--border)',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="section-recessed px-6 py-20 max-w-[700px] mx-auto">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="text-[clamp(24px,4vw,36px)] font-extrabold text-center tracking-[-0.02em] text-[var(--text-primary)] mb-10">
          Questions? Answers.
        </h2>
        <div>{FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="px-6 py-24 text-center max-w-[640px] mx-auto">
        <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold tracking-[-0.035em] text-[var(--text-primary)] mb-4 leading-[1.1]">
          Ready to{' '}
          <span className="bg-gradient-to-br from-[#6EE05A] to-[#00d4ff] bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Turn it 0n?
          </span>
        </h2>
        <p className="text-[17px] text-[var(--text-secondary)] mb-8 leading-relaxed">
          Free account. No credit card. Start automating in 5 minutes.
        </p>
        <CtaButton href="/signup?redirect=/console">Request Early Access &rarr;</CtaButton>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="px-6 py-8 text-center border-t border-border">
        <p className="text-[13px] text-[var(--text-muted)] m-0">
          &copy; {new Date().getFullYear()} RocketOpp LLC &middot; Patent Pending #63/990,046 &middot;{' '}
          <Link href="/legal" className="text-[var(--text-muted)] underline">Legal</Link>
          {' '}&middot;{' '}
          <Link href="/security" className="text-[var(--text-muted)] underline">Security</Link>
        </p>
      </footer>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes service-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}
