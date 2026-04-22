'use client'

import { useState, useEffect, useRef } from 'react'
import { STATS_DISPLAY } from '@/data/stats'
import { ArrowRight, Download } from 'lucide-react'

type Platform = 'claude-desktop' | 'claude-web' | 'claude-mobile' | 'claude-code'

const PLATFORMS = [
  {
    id: 'claude-desktop' as Platform,
    name: 'Claude Desktop',
    sub: 'Mac & Windows',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    steps: [
      { n: '1', title: 'Open Claude Desktop', desc: 'Click "Projects" then "New Project"' },
      { n: '2', title: 'Name it "0nMCP"', desc: 'So you can find it easily later' },
      { n: '3', title: 'Paste instructions', desc: 'Click "Set custom instructions" and paste' },
      { n: '4', title: 'Type /0nmcp login', desc: 'You\'re connected. That\'s it.' },
    ],
    method: 'copy',
  },
  {
    id: 'claude-web' as Platform,
    name: 'Claude Web',
    sub: 'claude.ai',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.15)',
    steps: [
      { n: '1', title: 'Go to claude.ai', desc: 'Sign in and click "Projects"' },
      { n: '2', title: 'Create a project', desc: 'Name it "0nMCP"' },
      { n: '3', title: 'Set custom instructions', desc: 'Paste the 0nMCP instructions' },
      { n: '4', title: 'Type /0nmcp login', desc: 'Done. All tools unlocked.' },
    ],
    method: 'copy',
  },
  {
    id: 'claude-mobile' as Platform,
    name: 'Claude Mobile',
    sub: 'iPhone & iPad',
    color: '#6EE05A',
    glow: 'rgba(126,217,87,0.15)',
    steps: [
      { n: '1', title: 'Set up on the web', desc: 'Create a project at claude.ai first' },
      { n: '2', title: 'Paste instructions', desc: 'It syncs to your phone automatically' },
      { n: '3', title: 'Open Claude on your device', desc: 'The project appears instantly' },
      { n: '4', title: 'Type /0nmcp login', desc: 'Full power, from your pocket.' },
    ],
    method: 'copy',
  },
  {
    id: 'claude-code' as Platform,
    name: 'Claude Code',
    sub: 'Terminal / CLI',
    color: '#ff6b35',
    glow: 'rgba(255,107,53,0.15)',
    steps: [
      { n: '1', title: 'Run one command', desc: 'Paste the installer below in your terminal' },
      { n: '2', title: 'Login', desc: 'Type /0nmcp login in Claude Code' },
      { n: '3', title: 'You\'re live', desc: 'Vault, Runs, Store, Brain — all in terminal.' },
    ],
    method: 'install',
  },
]

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export function Install0nClient() {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [copied, setCopied] = useState(false)
  const [installerCopied, setInstallerCopied] = useState(false)
  const [detected, setDetected] = useState<Platform | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod|android/.test(ua)) {
      setDetected('claude-mobile')
      setPlatform('claude-mobile')
    } else if (/mac|windows/.test(ua)) {
      setDetected('claude-desktop')
      setPlatform('claude-desktop')
    } else {
      setDetected('claude-web')
      setPlatform('claude-web')
    }
  }, [])

  const p = PLATFORMS.find(x => x.id === platform)

  async function copyInstructions() {
    try {
      const res = await fetch('/api/skill/download')
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      window.open('/api/skill/download', '_blank')
    }
  }

  async function copyInstaller() {
    try {
      await navigator.clipboard.writeText('curl -sL https://www.0nmcp.com/api/skill/install | sh')
      setInstallerCopied(true)
      setTimeout(() => setInstallerCopied(false), 3000)
    } catch { /* fallback */ }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative overflow-hidden pb-10">
        {/* Animated glow orbs */}
        <div className="absolute pointer-events-none rounded-full"
          style={{ top: -100, left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)' }} />
        <div className="absolute pointer-events-none rounded-full"
          style={{ top: -50, right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(126,217,87,0.06) 0%, transparent 70%)' }} />
        <div className="absolute pointer-events-none rounded-full"
          style={{ bottom: -100, left: '50%', width: 600, height: 300, background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', transform: 'translateX(-50%)' }} />

        <div className="relative max-w-[960px] mx-auto px-6 pt-20 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <a href="/" className="text-[#55556a] text-[13px] no-underline">Home</a>
            <span className="text-[#55556a] mx-2 text-[13px]">/</span>
            <span className="text-[#6EE05A] text-[13px] font-semibold">Install 0nMCP</span>
          </nav>

          {/* Trust badges */}
          <div className="flex justify-center gap-2.5 mb-7 flex-wrap">
            <span className="px-3.5 py-1.5 rounded-full bg-[rgba(126,217,87,0.08)] border border-[rgba(126,217,87,0.2)] text-xs text-[#6EE05A] font-bold tracking-wide">
              FREE
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[rgba(255,107,53,0.08)] border border-[rgba(255,107,53,0.2)] text-xs text-[#ff6b35] font-bold">
              60-SECOND INSTALL
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-xs text-[#00d4ff] font-bold">
              NO CREDIT CARD
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-[clamp(2.2rem,6vw,4.2rem)] font-black leading-[1.05] mb-5 tracking-[-0.03em]">
            Turn Claude into{' '}
            <span className="bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] bg-clip-text text-transparent">
              the ultimate
            </span>
            <br />
            AI command center
          </h1>

          {/* Subheadline */}
          <p className="text-[clamp(16px,2.5vw,21px)] text-[#8888a0] max-w-[620px] mx-auto mb-9 leading-[1.65]">
            {STATS_DISPLAY.tools}+ tools. {STATS_DISPLAY.services} services. Encrypted vault. Workflow store. Self-training AI brain.
            One install. Every Claude app.
          </p>

          {/* Primary CTA */}
          <div className="flex justify-center gap-3.5 mb-4 flex-wrap">
            <a href="#install" className="inline-flex items-center gap-2.5 px-9 py-4 rounded-[14px] font-extrabold text-lg no-underline text-[var(--text-primary)] transition-[transform,box-shadow] hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #e55a2b)', boxShadow: '0 4px 24px rgba(255,107,53,0.3)' }}>
              Install Now
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
            <a href="/signup" className="inline-flex items-center gap-2 px-7 py-4 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-[14px] font-semibold text-base no-underline">
              Create Free Account
            </a>
          </div>

          <p className="text-xs text-[#55556a] m-0">
            Works with Claude MAX, Pro & Team. Free 0nmcp.com account required.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════ SOCIAL PROOF STATS ═══════════════════════════ */}
      <section className="px-6 py-10 pb-15">
        <div className="max-w-[800px] mx-auto grid grid-cols-4 gap-4">
          {[
            { n: 1155, label: 'Tools', color: '#6EE05A' },
            { n: 91, label: 'Services', color: '#00d4ff' },
            { n: 50, label: 'Workflows', color: '#ff6b35' },
            { n: 4, label: 'Platforms', color: '#a78bfa' },
          ].map((s) => (
            <div key={s.label} className="text-center px-3 py-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[var(--bg-card)]">
              <div className="text-[clamp(28px,4vw,42px)] font-black font-mono leading-none" style={{ color: s.color }}>
                <AnimatedCounter target={s.n} />
                {s.n > 100 ? '+' : ''}
              </div>
              <div className="text-[11px] text-[#55556a] uppercase tracking-widest mt-1 font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════ INSTALL SECTION ═══════════════════════════ */}
      <section id="install" className="px-6 pb-20 scroll-mt-10">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-center mb-2 tracking-[-0.02em]">
            Choose your Claude app
          </h2>
          <p className="text-center text-[#8888a0] text-[15px] mb-8">
            Works everywhere Claude does. Pick your platform and install in seconds.
          </p>

          {/* Platform cards */}
          <div className="grid gap-3.5 mb-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
            {PLATFORMS.map((pl) => {
              const active = platform === pl.id
              const isDetected = detected === pl.id
              return (
                <button
                  key={pl.id}
                  onClick={() => setPlatform(pl.id)}
                  className="relative px-4 py-7 rounded-[18px] cursor-pointer text-center transition-all duration-[250ms] text-[var(--text-primary)] font-[inherit]"
                  style={{
                    background: active ? `${pl.color}0a` : 'rgba(255,255,255,0.015)',
                    border: `2px solid ${active ? `${pl.color}55` : 'var(--bg-card)'}`,
                    boxShadow: active ? `0 0 40px ${pl.glow}` : 'none',
                  }}
                >
                  {isDetected && (
                    <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 text-[9px] font-black px-2.5 py-0.5 rounded-[10px] tracking-[0.06em] whitespace-nowrap"
                      style={{ background: pl.color, color: '#0B0F19' }}>
                      YOUR DEVICE
                    </div>
                  )}
                  <div className="text-[15px] font-extrabold mb-1 transition-colors duration-[200ms]" style={{ color: active ? pl.color : '#e8e8ef' }}>
                    {pl.name}
                  </div>
                  <div className="text-xs text-[#55556a]">{pl.sub}</div>
                </button>
              )
            })}
          </div>

          {/* Steps + Action */}
          {p && (
            <div className="relative max-w-[640px] mx-auto rounded-[20px] px-8 py-9"
              style={{
                background: `linear-gradient(180deg, ${p.color}06 0%, transparent 100%)`,
                border: `1px solid ${p.color}18`,
              }}>
              {/* Glow dot */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-20 h-[3px] rounded-sm" style={{ background: p.color }} />

              {/* Steps */}
              <div className="mb-7">
                {p.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 py-3.5"
                    style={{ borderBottom: i < p.steps.length - 1 ? '1px solid var(--bg-card)' : 'none' }}>
                    <div className="w-8 h-8 rounded-[10px] shrink-0 flex items-center justify-center font-black text-sm"
                      style={{ background: `${p.color}12`, border: `1.5px solid ${p.color}33`, color: p.color }}>
                      {step.n}
                    </div>
                    <div className="pt-0.5">
                      <div className="font-bold text-[15px] text-[var(--text-primary)] mb-0.5">{step.title}</div>
                      <div className="text-[13px] text-[#8888a0] leading-[1.5]">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action area */}
              {p.method === 'install' ? (
                <>
                  <div className="bg-black/50 rounded-xl px-4 py-3.5 mb-4 font-mono text-sm text-[#ff6b35] border border-[rgba(255,107,53,0.15)] select-all break-all">
                    <span className="text-[#55556a]">$ </span>
                    curl -sL https://www.0nmcp.com/api/skill/install | sh
                  </div>
                  <button
                    onClick={copyInstaller}
                    className="w-full px-6 py-4 rounded-[14px] border-none font-extrabold text-[17px] cursor-pointer font-[inherit] transition-all duration-300 text-[var(--text-primary)]"
                    style={{
                      background: installerCopied
                        ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)'
                        : 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                      boxShadow: installerCopied ? '0 4px 20px rgba(126,217,87,0.3)' : '0 4px 20px rgba(255,107,53,0.3)',
                    }}
                  >
                    {installerCopied ? 'Copied! Paste in terminal' : 'Copy Install Command'}
                  </button>
                  <div className="flex justify-center gap-4 mt-3.5">
                    <a href="/api/skill/download" className="text-xs text-[#55556a] underline">Download SKILL.md</a>
                    <a href="/api/skill/dashboard" className="text-xs text-[#55556a] underline">Dashboard HTML</a>
                    <a href="/api/skill/config" className="text-xs text-[#55556a] underline">.claude.json</a>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={copyInstructions}
                    className="w-full px-6 py-4 rounded-[14px] border-none font-extrabold text-[17px] cursor-pointer font-[inherit] transition-all duration-300 min-w-[260px] text-[var(--text-primary)]"
                    style={{
                      background: copied
                        ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)'
                        : `linear-gradient(135deg, ${p.color}, ${p.color}bb)`,
                      boxShadow: `0 4px 20px ${p.glow}`,
                    }}
                  >
                    {copied ? 'Copied! Now paste in Claude' : 'Copy 0nMCP Instructions'}
                  </button>
                  {platform === 'claude-mobile' && (
                    <p className="text-center mt-3 mb-0 text-xs text-[#55556a]">
                      Tip: Set up on your computer first. Projects sync to mobile automatically.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════ WHAT YOU UNLOCK ═══════════════════════════ */}
      <section className="px-6 pb-20">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-center mb-2 tracking-[-0.02em]">
            What you unlock inside Claude
          </h2>
          <p className="text-center text-[#8888a0] text-[15px] mb-9">
            Everything below becomes available the moment you install.
          </p>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {[
              { icon: '🔐', title: 'Vault', sub: 'Encrypted API Keys', desc: 'AES-256 encrypted. Bidirectional sync between Claude and the web. Your keys never leave your vault.', color: '#f59e0b', glow: 'rgba(245,158,11,0.08)' },
              { icon: '⚡', title: 'Runs', sub: 'Pay-Per-Action Credits', desc: 'Credits that power everything. Check balance, spend on executions, top up anytime. Start with 50 free.', color: '#ff6b35', glow: 'rgba(255,107,53,0.08)' },
              { icon: '🏪', title: 'Store', sub: '50+ Pre-Built Workflows', desc: 'Marketing, sales, devops, data — ready-made automations you can run instantly or customize.', color: '#00d4ff', glow: 'rgba(0,212,255,0.08)' },
              { icon: '🧠', title: 'Council Brain', sub: 'Self-Training AI', desc: '7 distinct personas that learn and improve. View training status, contribute knowledge, level up.', color: '#a78bfa', glow: 'rgba(167,139,250,0.08)' },
              { icon: '🔧', title: `${STATS_DISPLAY.tools}+ Tools`, sub: `${STATS_DISPLAY.services} Services`, desc: 'CRM, Stripe, Slack, GitHub, Supabase, SendGrid, Discord, Shopify, Notion, and dozens more.', color: '#6EE05A', glow: 'rgba(126,217,87,0.08)' },
              { icon: '🚀', title: '4 Install Methods', sub: 'However You Work', desc: 'One-liner curl, SKILL.md download, interactive dashboard, or .claude.json config.', color: '#00d4ff', glow: 'rgba(0,212,255,0.08)' },
            ].map((f) => (
              <div key={f.title} className="px-6 pt-6 pb-7 rounded-[18px] border border-[var(--bg-card)] transition-[border-color,transform] duration-[200ms]"
                style={{ background: f.glow }}>
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[28px]">{f.icon}</span>
                  <div>
                    <div className="font-extrabold text-base" style={{ color: f.color }}>{f.title}</div>
                    <div className="text-[11px] text-[#55556a] font-semibold uppercase tracking-[0.04em]">{f.sub}</div>
                  </div>
                </div>
                <p className="m-0 text-[13px] text-[#8888a0] leading-[1.6]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ COMMANDS ═══════════════════════════ */}
      <section className="px-6 pb-20">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-[clamp(1.3rem,2.5vw,1.8rem)] font-extrabold text-center mb-2 tracking-[-0.02em]">
            Just type these in Claude
          </h2>
          <p className="text-center text-[#8888a0] text-sm mb-6">
            No setup, no config files, no learning curve.
          </p>
          <div className="bg-black/30 border border-[var(--border)] rounded-2xl px-6 py-5 text-sm">
            {[
              { cmd: '/0nmcp login', desc: 'Connect your account', c: '#ff6b35' },
              { cmd: '/0nmcp', desc: 'See your status', c: '#6EE05A' },
              { cmd: '/0nmcp vault', desc: 'Manage API keys', c: '#f59e0b' },
              { cmd: '/0nmcp vault save <svc>', desc: 'Push key to vault', c: '#f59e0b' },
              { cmd: '/0nmcp runs', desc: 'Check your balance', c: '#ff6b35' },
              { cmd: '/0nmcp store', desc: 'Browse workflows', c: '#00d4ff' },
              { cmd: '/0nmcp brain', desc: 'AI brain status', c: '#a78bfa' },
            ].map((c, i) => (
              <div key={c.cmd} className="flex justify-between items-center py-2.5"
                style={{ borderBottom: i < 6 ? '1px solid var(--bg-card)' : 'none' }}>
                <code className="font-mono font-bold text-[13px]" style={{ color: c.c }}>{c.cmd}</code>
                <span className="text-[#55556a] text-xs">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FAQ ═══════════════════════════ */}
      <section className="px-6 pb-20">
        <div className="max-w-[640px] mx-auto">
          <h2 className="text-[clamp(1.3rem,2.5vw,1.8rem)] font-extrabold text-center mb-8 tracking-[-0.02em]">
            Questions? Answered.
          </h2>
          {[
            { q: 'Is 0nMCP really free?', a: 'Yes. Free to install, free to use. You get 50 Runs and 20 executions per month. No credit card required. Upgrade only if you want more.' },
            { q: 'What Claude plans does it work with?', a: 'Claude MAX, Pro, and Team. Works on Desktop (Mac & Windows), Web (claude.ai), Mobile (iPhone & iPad), and Claude Code (terminal).' },
            { q: 'Is my data safe?', a: 'Your API keys are stored in an AES-256 encrypted vault with PBKDF2-SHA512 key derivation. We never see your keys in plaintext. Patent pending.' },
            { q: 'Can I uninstall it?', a: 'Yes. Just delete the project from Claude. No files modified, no system changes, nothing to clean up.' },
          ].map((faq) => (
            <div key={faq.q} className="py-5 border-b border-[var(--bg-card)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 mt-0">{faq.q}</h3>
              <p className="text-sm text-[#8888a0] m-0 leading-[1.6]">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════ FINAL CTA ═══════════════════════════ */}
      <section className="relative px-6 py-[60px] pb-[100px] text-center border-t border-[var(--bg-card)]">
        <div className="absolute top-0 left-1/2 w-[400px] h-[200px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />

        <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black mb-3 tracking-[-0.02em]">
          Ready? <span className="text-[#ff6b35]">60 seconds.</span>
        </h2>
        <p className="text-[17px] text-[#8888a0] mb-7 max-w-[440px] mx-auto">
          Join thousands of developers who turned Claude into their AI command center.
        </p>

        <div className="flex justify-center gap-3.5 flex-wrap">
          <a href="#install" className="inline-flex items-center gap-2.5 px-9 py-4 rounded-[14px] font-extrabold text-lg no-underline text-[var(--text-primary)]"
            style={{ background: 'linear-gradient(135deg, #ff6b35, #e55a2b)', boxShadow: '0 4px 24px rgba(255,107,53,0.3)' }}>
            Install 0nMCP
            <Download size={18} strokeWidth={2.5} />
          </a>
          <a href="/signup" className="inline-flex items-center gap-2 px-7 py-4 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-[14px] font-semibold text-base no-underline">
            Create Free Account
          </a>
        </div>

        <p className="text-xs text-[#55556a] mt-4">
          Free forever. Upgrade when you want more power.
        </p>
      </section>
    </div>
  )
}
