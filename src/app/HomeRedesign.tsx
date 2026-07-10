'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── COLOR PALETTE ───────────────────────────────────────────────────────────

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
    <span className="inline-flex gap-[3px] ml-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-[5px] h-[5px] rounded-full"
          style={{
            background: C.lime,
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
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-[60px] pb-[80px]">
        {/* Orbiting service icons */}
        <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%', width: 0, height: 0, transform: 'translate(-50%, -55%)' }}>
          {ORBIT_ICONS.map((icon, i) => (
            <div
              key={i}
              className="absolute w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{
                background: icon.color,
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
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-black mb-8 relative z-[2]"
          style={{
            background: `linear-gradient(135deg, ${C.lime}, ${C.turquoise})`,
            color: C.deep,
            boxShadow: `0 0 40px rgba(178,255,77,0.25), 0 0 80px rgba(63,255,224,0.1)`,
            animation: mounted ? 'fadeInUp 0.8s ease-out' : 'none',
          }}
        >
          0n
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(32px,5vw,56px)] font-black tracking-[-0.03em] leading-[1.1] text-center m-0 mb-5 relative z-[2]"
          style={{ color: C.text }}
        >
          The old workflow is dead.
        </h1>

        {/* Subheadline */}
        <p
          className="text-[clamp(15px,2vw,18px)] text-center max-w-[560px] m-0 mb-9 leading-relaxed font-medium relative z-[2]"
          style={{ color: C.lime, animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
        >
          Describe the outcome. 0n orchestrates 100+ apps and runs it.
        </p>

        {/* CTA row */}
        <div
          className="flex gap-3.5 flex-wrap justify-center relative z-[2]"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}
        >
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-[15px] no-underline transition-transform duration-200 hover:scale-[1.04]"
            style={{
              background: C.lime, color: C.deep,
              animation: 'pulseGlow 3s ease-in-out infinite',
            }}
          >
            Start Free — Connect in 9s
            <ArrowRight size={16} color={C.deep} />
          </a>
          <a
            href="/demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[15px] no-underline transition-all duration-200 hover:border-[color:var(--lime)] hover:text-white"
            style={{
              background: 'transparent', color: C.textSec,
              border: `1px solid ${C.border}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.lime; e.currentTarget.style.color = C.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec }}
          >
            Watch Demo
          </a>
        </div>

        {/* Connected services row */}
        <div
          className="flex items-center gap-4 flex-wrap justify-center mt-10 relative z-[2]"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
        >
          {['Slack', 'Stripe', 'HubSpot', 'Gmail', 'Notion'].map(s => (
            <span key={s} className="inline-flex items-center gap-1 text-[13px]" style={{ color: C.textMuted }}>
              <CheckIcon size={12} /> {s}
            </span>
          ))}
          <span className="text-[13px] font-semibold" style={{ color: C.lime }}>+100 more</span>
        </div>

        {/* Bottom tagline */}
        <p
          className="text-[13px] text-center mt-8 tracking-[0.02em] relative z-[2]"
          style={{ color: C.textMuted, animation: 'fadeInUp 0.8s ease-out 0.8s both' }}
        >
          Pre-connected tokens &middot; Agentic execution &middot; No steps. Just outcomes.
        </p>
      </section>

      {/* ═══════════════════════ SECTION 2: AGENTIC CHAT ═══════════════════════ */}
      <section
        ref={chat.ref}
        className="px-6 transition-all duration-700"
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.deep,
          opacity: chat.visible ? 1 : 0,
          transform: chat.visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: C.lime }}>
            Agentic Chat
          </p>
          <h2 className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.02em] mb-12 leading-[1.15]">
            Tell 0n what to ship.
          </h2>

          {/* Chat mockup */}
          <div
            className="rounded-2xl p-[clamp(20px,3vw,36px)]"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {/* User message */}
            <div className="flex gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.turquoise})` }}
              >
                U
              </div>
              <div
                className="rounded-xl px-[18px] py-3.5 max-w-[80%]"
                style={{ background: 'rgba(155,110,255,0.08)', border: '1px solid rgba(155,110,255,0.15)' }}
              >
                <p className="text-sm leading-relaxed m-0" style={{ color: C.text }}>
                  Generate Q3 performance report and email top 10 clients with personalized invoice links.
                </p>
              </div>
            </div>

            {/* 0n response */}
            <div className="flex gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black"
                style={{ background: `linear-gradient(135deg, ${C.lime}, ${C.turquoise})`, color: C.deep }}
              >
                0n
              </div>
              <div
                className="rounded-xl px-[18px] py-3.5 max-w-[80%]"
                style={{ background: 'rgba(178,255,77,0.05)', border: '1px solid rgba(178,255,77,0.1)' }}
              >
                <p className="text-sm leading-[1.8] m-0" style={{ color: C.textSec }}>
                  <span className="font-mono text-xs" style={{ color: C.lime }}>
                    Pulling from Stripe + HubSpot + Google Sheets...
                  </span>
                  <br />
                  <span className="font-mono text-xs" style={{ color: C.turquoise }}>
                    Building crew now
                  </span>
                  <TypingDots />
                  <br />
                  <span className="text-[13px] mt-2 inline-block" style={{ color: C.text }}>
                    Analyzing 3 integrations &middot; Selecting optimal path &middot;{' '}
                    <span className="font-semibold" style={{ color: C.lime }}>97% confidence</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Quick-select chips */}
            <div className="flex gap-2.5 flex-wrap mt-2">
              {[
                { label: 'Add payment reminder', color: C.lime, bg: 'rgba(178,255,77,0.08)', border: 'rgba(178,255,77,0.2)' },
                { label: 'Include Slack alert', color: C.purple, bg: 'rgba(155,110,255,0.08)', border: 'rgba(155,110,255,0.2)' },
                { label: 'Train new agent', color: C.turquoise, bg: 'rgba(63,255,224,0.08)', border: 'rgba(63,255,224,0.2)' },
              ].map(chip => (
                <button
                  key={chip.label}
                  className="rounded-full px-4 py-2 text-xs font-semibold cursor-pointer transition-transform duration-150 hover:scale-[1.05]"
                  style={{
                    background: chip.bg, color: chip.color,
                    border: `1px solid ${chip.border}`,
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
        className="px-6 transition-all duration-700"
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.bg,
          opacity: crews.visible ? 1 : 0,
          transform: crews.visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: C.purple }}>
            Crews
          </p>
          <h2 className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.02em] mb-12 leading-[1.15]">
            Crews train once. Ship forever.
          </h2>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              { name: 'Revenue Crew', color: C.lime, agents: 3, services: 'Stripe + HubSpot', automations: 41, status: 'Active' },
              { name: 'Marketing Crew', color: C.purple, agents: 3, services: 'LinkedIn + Mailchimp', automations: 47, status: 'Deployed 47x' },
              { name: 'Support Crew', color: C.turquoise, agents: 2, services: 'Zendesk + Slack', automations: 24, status: '24/7 Active' },
            ].map(crew => (
              <div
                key={crew.name}
                className="rounded-[14px] p-7 transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: C.card,
                  border: `1px solid ${crew.color}22`,
                  borderTop: `3px solid ${crew.color}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${crew.color}55` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${crew.color}22` }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-extrabold m-0" style={{ color: crew.color }}>{crew.name}</h3>
                  <span
                    className="text-[11px] font-bold rounded-full px-2.5 py-[3px]"
                    style={{ color: C.deep, background: crew.color }}
                  >
                    {crew.agents} agents
                  </span>
                </div>

                {/* Trained on */}
                <p className="text-[13px] m-0 mb-3" style={{ color: C.textSec }}>
                  <span className="font-semibold" style={{ color: C.textMuted }}>Trained on:</span>{' '}
                  {crew.services}
                </p>

                {/* Automation count */}
                <p className="text-[13px] m-0 mb-4" style={{ color: C.textSec }}>
                  <span className="font-mono font-bold text-xl" style={{ color: crew.color }}>
                    {crew.automations}
                  </span>{' '}
                  automations
                </p>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: crew.color, boxShadow: `0 0 8px ${crew.color}66` }}
                  />
                  <span className="text-xs font-semibold" style={{ color: C.textMuted }}>{crew.status}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-center mt-8 max-w-[540px] mx-auto leading-relaxed" style={{ color: C.textMuted }}>
            Build specialized AI teams in plain language. Train once. Deploy everywhere.
          </p>
        </div>
      </section>

      {/* ═══════════════════ SECTION 4: INTEGRATIONS ══════════════════════════ */}
      <section
        ref={integrations.ref}
        className="px-6 transition-all duration-700"
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.deep,
          opacity: integrations.visible ? 1 : 0,
          transform: integrations.visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div className="max-w-[900px] mx-auto">
          <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3" style={{ color: C.turquoise }}>
            Integrations
          </p>
          <h2 className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.02em] mb-3 leading-[1.15]">
            100+ Connected. Zero Setup.
          </h2>
          <p className="text-[15px] mb-12 max-w-[480px]" style={{ color: C.textSec }}>
            Pre-authorized tokens unlock instant orchestration
          </p>

          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {INTEGRATIONS.map(svc => (
              <div
                key={svc.name}
                className="rounded-xl p-5 flex flex-col items-center gap-3 cursor-default transition-all duration-200"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = svc.color + '44'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold text-white"
                  style={{ background: svc.color }}
                >
                  {svc.abbr}
                </div>
                <span className="text-[13px] font-bold" style={{ color: C.text }}>{svc.name}</span>
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: C.lime, background: 'rgba(178,255,77,0.1)' }}
                  >
                    Token Active
                  </span>
                  <span className="text-[10px]" style={{ color: C.textMuted }}>MCP ready</span>
                </div>
              </div>
            ))}

            {/* + Connect New */}
            <a
              href="/console/integrations"
              className="rounded-xl p-5 flex flex-col items-center justify-center gap-2 no-underline transition-all duration-200 min-h-[130px]"
              style={{ background: 'transparent', border: `2px dashed rgba(178,255,77,0.15)` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.lime + '44')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(178,255,77,0.15)')}
            >
              <span className="text-[28px] font-light leading-none" style={{ color: C.lime }}>+</span>
              <span className="text-xs font-semibold" style={{ color: C.textMuted }}>Connect New</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5: HOW IT WORKS ═════════════════════════ */}
      <section
        ref={howItWorks.ref}
        className="px-6 transition-all duration-700"
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.bg,
          opacity: howItWorks.visible ? 1 : 0,
          transform: howItWorks.visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.02em] mb-14 leading-[1.15] text-center">
            How it works
          </h2>

          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {[
              { step: '01', title: 'Describe', desc: 'Tell 0n what you want in plain language. No steps, no diagrams, no config files.' },
              { step: '02', title: '0n Decides', desc: 'AI selects the right integrations, builds the execution path, and assembles a crew.' },
              { step: '03', title: 'Outcome Ships', desc: 'Result delivered. Crew handles it. You move on to the next thing that matters.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <span
                  className="text-[48px] font-black block mb-3 leading-none"
                  style={{ color: C.lime, fontFamily: 'JetBrains Mono, monospace', opacity: 0.3 }}
                >
                  {item.step}
                </span>
                <h3 className="text-xl font-extrabold m-0 mb-3" style={{ color: C.text }}>{item.title}</h3>
                <p className="text-sm leading-[1.7] m-0" style={{ color: C.textSec }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 6: FEATURES ═════════════════════════════ */}
      <section
        ref={features.ref}
        className="px-6 transition-all duration-700"
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.deep,
          opacity: features.visible ? 1 : 0,
          transform: features.visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.02em] mb-12 leading-[1.15] text-center">
            Built different
          </h2>

          <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              { icon: <ZapIcon size={24} color={C.lime} />, title: 'Agentic AI', desc: "0n decides the steps so you don't have to. Describe the outcome, the AI builds the path.", accent: C.lime },
              { icon: <ServerIcon size={24} color={C.purple} />, title: 'Live MCP Server', desc: '1,640+ tools, 111 services, real-time execution. The largest MCP server ever built.', accent: C.purple },
              { icon: <ShieldIcon size={24} color={C.turquoise} />, title: 'Vault Encryption', desc: 'AES-256-GCM with hardware fingerprint binding. Your keys stay yours. Patent pending.', accent: C.turquoise },
              { icon: <GlobeIcon size={24} color={C.orange} />, title: 'Universal Surface', desc: 'Console, CLI, Slack, Telegram, ChatGPT. Same commands everywhere. One brain.', accent: C.orange },
            ].map(feat => (
              <div
                key={feat.title}
                className="rounded-[14px] p-7 transition-all duration-200"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = feat.accent + '33'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div className="mb-4">{feat.icon}</div>
                <h3 className="text-[17px] font-extrabold m-0 mb-2.5" style={{ color: C.text }}>{feat.title}</h3>
                <p className="text-sm leading-[1.65] m-0" style={{ color: C.textSec }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 7: PRICING ══════════════════════════════ */}
      <section
        ref={pricing.ref}
        className="px-6 transition-all duration-700"
        style={{
          padding: 'clamp(60px, 8vw, 120px) 24px',
          background: C.bg,
          opacity: pricing.visible ? 1 : 0,
          transform: pricing.visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <div className="max-w-[960px] mx-auto">
          <h2 className="text-[clamp(26px,4vw,42px)] font-black tracking-[-0.02em] mb-12 leading-[1.15] text-center">
            Simple pricing
          </h2>

          <div className="grid gap-[18px] items-stretch" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {/* Free */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <h3 className="text-xl font-extrabold m-0 mb-2">Free</h3>
              <div className="mb-5">
                <span className="text-[36px] font-black">$0</span>
                <span className="text-sm ml-1" style={{ color: C.textMuted }}>/forever</span>
              </div>
              <p className="text-sm leading-relaxed m-0 mb-6 flex-1" style={{ color: C.textSec }}>
                Connect, orchestrate, ship. No credit card required.
              </p>
              <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2.5">
                {['5 Crews', '100 executions/mo', '10 integrations', 'Community support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px]" style={{ color: C.textSec }}>
                    <CheckIcon size={13} /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup"
                className="block text-center py-3 rounded-full text-sm font-bold no-underline transition-all duration-200"
                style={{ color: C.text, border: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.lime)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
              >
                Get Started
              </a>
            </div>

            {/* Pro */}
            <div
              className="rounded-2xl p-8 flex flex-col relative"
              style={{ background: C.card, border: `2px solid ${C.lime}33`, boxShadow: `0 0 40px rgba(178,255,77,0.05)` }}
            >
              <span
                className="absolute -top-3 left-6 text-[11px] font-extrabold px-3.5 py-1 rounded-full tracking-[0.04em]"
                style={{ background: C.lime, color: C.deep }}
              >
                Popular
              </span>
              <h3 className="text-xl font-extrabold m-0 mb-2">Pro</h3>
              <div className="mb-5">
                <span className="text-[36px] font-black">$19</span>
                <span className="text-sm ml-1" style={{ color: C.textMuted }}>/mo</span>
              </div>
              <p className="text-sm leading-relaxed m-0 mb-6 flex-1" style={{ color: C.textSec }}>
                Unlimited Crews, priority AI, all add-ons, team seats.
              </p>
              <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2.5">
                {['Unlimited Crews', 'Unlimited executions', 'All integrations', 'Priority AI routing', 'Team seats', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px]" style={{ color: C.textSec }}>
                    <CheckIcon size={13} /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup?plan=pro"
                className="block text-center py-3 rounded-full text-sm font-bold no-underline transition-opacity duration-200 hover:opacity-90"
                style={{ color: C.deep, background: C.lime }}
              >
                Start Pro
              </a>
            </div>

            {/* Enterprise */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <h3 className="text-xl font-extrabold m-0 mb-2">Enterprise</h3>
              <div className="mb-5">
                <span className="text-[36px] font-black">Custom</span>
              </div>
              <p className="text-sm leading-relaxed m-0 mb-6 flex-1" style={{ color: C.textSec }}>
                Dedicated support, SLA, custom integrations, white-label.
              </p>
              <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2.5">
                {['Everything in Pro', 'Dedicated account manager', 'Custom SLA', 'White-label option', 'On-premise available', 'SSO / SAML'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px]" style={{ color: C.textSec }}>
                    <CheckIcon size={13} /> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/contact"
                className="block text-center py-3 rounded-full text-sm font-bold no-underline transition-all duration-200"
                style={{ color: C.text, border: `1px solid ${C.border}` }}
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
        className="px-6 text-center relative overflow-hidden transition-all duration-700"
        style={{
          padding: 'clamp(80px, 10vw, 160px) 24px',
          background: C.deep,
          opacity: bottomCta.visible ? 1 : 0,
          transform: bottomCta.visible ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        {/* Radial glow behind logo */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -60%)',
            width: 400, height: 400,
            background: `radial-gradient(circle, rgba(178,255,77,0.12) 0%, transparent 70%)`,
            animation: 'bottomGlow 4s ease-in-out infinite',
          }}
        />

        {/* Logo */}
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[26px] font-black mx-auto mb-8 relative z-[1]"
          style={{
            background: `linear-gradient(135deg, ${C.lime}, ${C.turquoise})`,
            color: C.deep,
            boxShadow: `0 0 50px rgba(178,255,77,0.3)`,
          }}
        >
          0n
        </div>

        <h2
          className="text-[clamp(24px,4vw,40px)] font-black tracking-[-0.02em] mb-7 leading-[1.2] relative z-[1]"
        >
          The old workflow is dead.<br />
          <span style={{ color: C.lime }}>Describe it. 0n does it.</span>
        </h2>

        <a
          href="/signup"
          className="inline-flex items-center gap-2 px-9 py-4 rounded-full font-bold text-base no-underline transition-transform duration-200 hover:scale-[1.05] relative z-[1]"
          style={{
            background: C.lime, color: C.deep,
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}
        >
          Start Free
          <ArrowRight size={18} color={C.deep} />
        </a>

        {/* Footer links */}
        <div className="flex gap-6 justify-center flex-wrap mt-12 relative z-[1]">
          {[
            { label: 'Try 0nCore Free', href: 'https://0ncore.com' },
            { label: 'Library', href: '/library' },
            { label: 'Docs', href: '/docs' },
            { label: 'Community', href: '/community' },
            { label: 'Blog', href: '/blog' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] no-underline transition-colors duration-200"
              style={{ color: C.textMuted }}
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
