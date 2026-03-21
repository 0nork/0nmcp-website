'use client'

import { useState, useEffect, useRef } from 'react'
import { STATS_DISPLAY } from '@/data/stats'

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
    color: '#7ed957',
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
    <div style={{ minHeight: '100vh', background: '#0f1419', color: '#e8e8ef', fontFamily: 'var(--font-display), system-ui, sans-serif' }}>

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingBottom: 40 }}>
        {/* Animated glow orbs */}
        <div style={{ position: 'absolute', top: -100, left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -50, right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,217,87,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: '50%', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px 0', textAlign: 'center', position: 'relative' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
            <a href="/" style={{ color: '#55556a', fontSize: 13, textDecoration: 'none' }}>Home</a>
            <span style={{ color: '#55556a', margin: '0 8px', fontSize: 13 }}>/</span>
            <span style={{ color: '#7ed957', fontSize: 13, fontWeight: 600 }}>Install 0nMCP</span>
          </nav>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            <span style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)', fontSize: 12, color: '#7ed957', fontWeight: 700, letterSpacing: '0.02em' }}>
              FREE
            </span>
            <span style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', fontSize: 12, color: '#ff6b35', fontWeight: 700 }}>
              60-SECOND INSTALL
            </span>
            <span style={{ padding: '5px 14px', borderRadius: 20, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', fontSize: 12, color: '#00d4ff', fontWeight: 700 }}>
              NO CREDIT CARD
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 6vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            margin: '0 0 20px',
            letterSpacing: '-0.03em',
          }}>
            Turn Claude into{' '}
            <span style={{
              background: 'linear-gradient(135deg, #ff6b35, #ff8c5a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              the ultimate
            </span>
            <br />
            AI command center
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 21px)', color: '#8888a0', maxWidth: 620, margin: '0 auto 36px', lineHeight: 1.65 }}>
            {STATS_DISPLAY.tools}+ tools. {STATS_DISPLAY.services} services. Encrypted vault. Workflow store. Self-training AI brain.
            One install. Every Claude app.
          </p>

          {/* Primary CTA */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            <a href="#install" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: '#fff', borderRadius: 14, fontWeight: 800, fontSize: 18,
              textDecoration: 'none', boxShadow: '0 4px 24px rgba(255,107,53,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              Install Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 28px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8e8ef', borderRadius: 14, fontWeight: 600, fontSize: 16,
              textDecoration: 'none',
            }}>
              Create Free Account
            </a>
          </div>

          <p style={{ fontSize: 12, color: '#55556a', margin: 0 }}>
            Works with Claude MAX, Pro & Team. Free 0nmcp.com account required.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════ SOCIAL PROOF STATS ═══════════════════════════ */}
      <section style={{ padding: '40px 24px 60px' }}>
        <div style={{
          maxWidth: 800, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        }}>
          {[
            { n: 1155, label: 'Tools', color: '#7ed957' },
            { n: 91, label: 'Services', color: '#00d4ff' },
            { n: 50, label: 'Workflows', color: '#ff6b35' },
            { n: 4, label: 'Platforms', color: '#a78bfa' },
          ].map((s) => (
            <div key={s.label} style={{
              textAlign: 'center', padding: '20px 12px', borderRadius: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono), monospace', lineHeight: 1 }}>
                <AnimatedCounter target={s.n} />
                {s.n > 100 ? '+' : ''}
              </div>
              <div style={{ fontSize: 11, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════ INSTALL SECTION ═══════════════════════════ */}
      <section id="install" style={{ padding: '0 24px 80px', scrollMarginTop: 40 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Choose your Claude app
          </h2>
          <p style={{ textAlign: 'center', color: '#8888a0', fontSize: 15, marginBottom: 32 }}>
            Works everywhere Claude does. Pick your platform and install in seconds.
          </p>

          {/* Platform cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 40 }}>
            {PLATFORMS.map((pl) => {
              const active = platform === pl.id
              const isDetected = detected === pl.id
              return (
                <button
                  key={pl.id}
                  onClick={() => setPlatform(pl.id)}
                  style={{
                    position: 'relative', padding: '28px 18px', borderRadius: 18, cursor: 'pointer',
                    background: active ? `${pl.color}0a` : 'rgba(255,255,255,0.015)',
                    border: `2px solid ${active ? `${pl.color}55` : 'rgba(255,255,255,0.05)'}`,
                    textAlign: 'center', transition: 'all 0.25s', color: '#e8e8ef', fontFamily: 'inherit',
                    boxShadow: active ? `0 0 40px ${pl.glow}` : 'none',
                  }}
                >
                  {isDetected && (
                    <div style={{
                      position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                      background: pl.color, color: '#0f1419', fontSize: 9, fontWeight: 800,
                      padding: '3px 10px', borderRadius: 10, letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}>
                      YOUR DEVICE
                    </div>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 800, color: active ? pl.color : '#e8e8ef', marginBottom: 4, transition: 'color 0.2s' }}>
                    {pl.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#55556a' }}>{pl.sub}</div>
                </button>
              )
            })}
          </div>

          {/* Steps + Action */}
          {p && (
            <div style={{
              maxWidth: 640, margin: '0 auto',
              background: `linear-gradient(180deg, ${p.color}06 0%, transparent 100%)`,
              border: `1px solid ${p.color}18`,
              borderRadius: 20, padding: '36px 32px', position: 'relative',
            }}>
              {/* Glow dot */}
              <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', width: 80, height: 3, borderRadius: 2, background: p.color }} />

              {/* Steps */}
              <div style={{ marginBottom: 28 }}>
                {p.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 16, padding: '14px 0',
                    borderBottom: i < p.steps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: `${p.color}12`, border: `1.5px solid ${p.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 14, color: p.color,
                    }}>
                      {step.n}
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#e8e8ef', marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: 13, color: '#8888a0', lineHeight: 1.5 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action area */}
              {p.method === 'install' ? (
                <>
                  <div style={{
                    background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: '14px 18px',
                    fontFamily: 'var(--font-mono), JetBrains Mono, monospace', fontSize: 14,
                    color: '#ff6b35', border: '1px solid rgba(255,107,53,0.15)',
                    marginBottom: 16, userSelect: 'all', wordBreak: 'break-all',
                  }}>
                    <span style={{ color: '#55556a' }}>$ </span>
                    curl -sL https://www.0nmcp.com/api/skill/install | sh
                  </div>
                  <button
                    onClick={copyInstaller}
                    style={{
                      width: '100%', padding: '16px 24px', borderRadius: 14, border: 'none',
                      background: installerCopied
                        ? 'linear-gradient(135deg, #7ed957, #5cb83a)'
                        : 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                      color: '#fff', fontWeight: 800, fontSize: 17, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.3s',
                      boxShadow: installerCopied ? '0 4px 20px rgba(126,217,87,0.3)' : '0 4px 20px rgba(255,107,53,0.3)',
                    }}
                  >
                    {installerCopied ? 'Copied! Paste in terminal' : 'Copy Install Command'}
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
                    <a href="/api/skill/download" style={{ fontSize: 12, color: '#55556a', textDecoration: 'underline' }}>Download SKILL.md</a>
                    <a href="/api/skill/dashboard" style={{ fontSize: 12, color: '#55556a', textDecoration: 'underline' }}>Dashboard HTML</a>
                    <a href="/api/skill/config" style={{ fontSize: 12, color: '#55556a', textDecoration: 'underline' }}>.claude.json</a>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={copyInstructions}
                    style={{
                      width: '100%', padding: '16px 24px', borderRadius: 14, border: 'none',
                      background: copied
                        ? 'linear-gradient(135deg, #7ed957, #5cb83a)'
                        : `linear-gradient(135deg, ${p.color}, ${p.color}bb)`,
                      color: '#fff', fontWeight: 800, fontSize: 17, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.3s', minWidth: 260,
                      boxShadow: `0 4px 20px ${p.glow}`,
                    }}
                  >
                    {copied ? 'Copied! Now paste in Claude' : 'Copy 0nMCP Instructions'}
                  </button>
                  {platform === 'claude-mobile' && (
                    <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: 12, color: '#55556a' }}>
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
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>
            What you unlock inside Claude
          </h2>
          <p style={{ textAlign: 'center', color: '#8888a0', fontSize: 15, marginBottom: 36 }}>
            Everything below becomes available the moment you install.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { icon: '🔐', title: 'Vault', sub: 'Encrypted API Keys', desc: 'AES-256 encrypted. Bidirectional sync between Claude and the web. Your keys never leave your vault.', color: '#f59e0b', glow: 'rgba(245,158,11,0.08)' },
              { icon: '⚡', title: 'Runs', sub: 'Pay-Per-Action Credits', desc: 'Credits that power everything. Check balance, spend on executions, top up anytime. Start with 50 free.', color: '#ff6b35', glow: 'rgba(255,107,53,0.08)' },
              { icon: '🏪', title: 'Store', sub: '50+ Pre-Built Workflows', desc: 'Marketing, sales, devops, data — ready-made automations you can run instantly or customize.', color: '#00d4ff', glow: 'rgba(0,212,255,0.08)' },
              { icon: '🧠', title: 'Council Brain', sub: 'Self-Training AI', desc: '7 distinct personas that learn and improve. View training status, contribute knowledge, level up.', color: '#a78bfa', glow: 'rgba(167,139,250,0.08)' },
              { icon: '🔧', title: `${STATS_DISPLAY.tools}+ Tools`, sub: `${STATS_DISPLAY.services} Services`, desc: 'CRM, Stripe, Slack, GitHub, Supabase, SendGrid, Discord, Shopify, Notion, and dozens more.', color: '#7ed957', glow: 'rgba(126,217,87,0.08)' },
              { icon: '🚀', title: '4 Install Methods', sub: 'However You Work', desc: 'One-liner curl, SKILL.md download, interactive dashboard, or .claude.json config.', color: '#00d4ff', glow: 'rgba(0,212,255,0.08)' },
            ].map((f) => (
              <div key={f.title} style={{
                padding: '24px 24px 28px', borderRadius: 18,
                background: f.glow, border: '1px solid rgba(255,255,255,0.05)',
                transition: 'border-color 0.2s, transform 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: f.color }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: '#55556a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.sub}</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#8888a0', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ COMMANDS ═══════════════════════════ */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 800, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Just type these in Claude
          </h2>
          <p style={{ textAlign: 'center', color: '#8888a0', fontSize: 14, marginBottom: 24 }}>
            No setup, no config files, no learning curve.
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '20px 24px', fontSize: 14,
          }}>
            {[
              { cmd: '/0nmcp login', desc: 'Connect your account', c: '#ff6b35' },
              { cmd: '/0nmcp', desc: 'See your status', c: '#7ed957' },
              { cmd: '/0nmcp vault', desc: 'Manage API keys', c: '#f59e0b' },
              { cmd: '/0nmcp vault save <svc>', desc: 'Push key to vault', c: '#f59e0b' },
              { cmd: '/0nmcp runs', desc: 'Check your balance', c: '#ff6b35' },
              { cmd: '/0nmcp store', desc: 'Browse workflows', c: '#00d4ff' },
              { cmd: '/0nmcp brain', desc: 'AI brain status', c: '#a78bfa' },
            ].map((c, i) => (
              <div key={c.cmd} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <code style={{ color: c.c, fontFamily: 'var(--font-mono), monospace', fontWeight: 700, fontSize: 13 }}>{c.cmd}</code>
                <span style={{ color: '#55556a', fontSize: 12 }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FAQ ═══════════════════════════ */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 800, textAlign: 'center', marginBottom: 32, letterSpacing: '-0.02em' }}>
            Questions? Answered.
          </h2>
          {[
            { q: 'Is 0nMCP really free?', a: 'Yes. Free to install, free to use. You get 50 Runs and 20 executions per month. No credit card required. Upgrade only if you want more.' },
            { q: 'What Claude plans does it work with?', a: 'Claude MAX, Pro, and Team. Works on Desktop (Mac & Windows), Web (claude.ai), Mobile (iPhone & iPad), and Claude Code (terminal).' },
            { q: 'Is my data safe?', a: 'Your API keys are stored in an AES-256 encrypted vault with PBKDF2-SHA512 key derivation. We never see your keys in plaintext. Patent pending.' },
            { q: 'Can I uninstall it?', a: 'Yes. Just delete the project from Claude. No files modified, no system changes, nothing to clean up.' },
          ].map((faq) => (
            <div key={faq.q} style={{
              padding: '20px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e8e8ef', margin: '0 0 8px' }}>{faq.q}</h3>
              <p style={{ fontSize: 14, color: '#8888a0', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════ FINAL CTA ═══════════════════════════ */}
      <section style={{
        padding: '60px 24px 100px', textAlign: 'center', position: 'relative',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', width: 400, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>
          Ready? <span style={{ color: '#ff6b35' }}>60 seconds.</span>
        </h2>
        <p style={{ fontSize: 17, color: '#8888a0', marginBottom: 28, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
          Join thousands of developers who turned Claude into their AI command center.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <a href="#install" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px',
            background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
            color: '#fff', borderRadius: 14, fontWeight: 800, fontSize: 18,
            textDecoration: 'none', boxShadow: '0 4px 24px rgba(255,107,53,0.3)',
          }}>
            Install 0nMCP
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </a>
          <a href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 28px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#e8e8ef', borderRadius: 14, fontWeight: 600, fontSize: 16,
            textDecoration: 'none',
          }}>
            Create Free Account
          </a>
        </div>

        <p style={{ fontSize: 12, color: '#55556a', marginTop: 16 }}>
          Free forever. Upgrade when you want more power.
        </p>
      </section>
    </div>
  )
}
