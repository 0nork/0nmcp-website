'use client'

import { useState, useEffect } from 'react'
import { STATS_DISPLAY } from '@/data/stats'
import { Check, Copy, Download, ArrowLeft } from 'lucide-react'

type Platform = 'claude-desktop' | 'claude-web' | 'claude-mobile' | 'claude-code'
type InstallMethod = 'one-line' | 'download' | 'config' | 'dashboard'

interface PlatformInfo {
  id: Platform
  name: string
  subtitle: string
  icon: string
  color: string
  steps: { title: string; desc: string }[]
}

const PLATFORMS: PlatformInfo[] = [
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    subtitle: 'Mac & Windows app',
    icon: '🖥',
    color: '#a78bfa',
    steps: [
      { title: 'Create a new Project', desc: 'Open Claude Desktop → Click "Projects" → "New Project"' },
      { title: 'Name it "0nMCP"', desc: 'Give your project a name so you can find it easily' },
      { title: 'Add the instructions', desc: 'Click "Set custom instructions" → Paste the 0nMCP instructions below' },
      { title: 'Start chatting', desc: 'Open the project and say "/0nmcp login"' },
    ],
  },
  {
    id: 'claude-web',
    name: 'Claude Web',
    subtitle: 'claude.ai in browser',
    icon: '🌐',
    color: '#00d4ff',
    steps: [
      { title: 'Go to claude.ai', desc: 'Open claude.ai and sign in' },
      { title: 'Create a Project', desc: 'Click "Projects" → "Create project"' },
      { title: 'Set custom instructions', desc: 'Paste the 0nMCP instructions' },
      { title: 'Start using 0nMCP', desc: 'Say "/0nmcp login" in a new chat' },
    ],
  },
  {
    id: 'claude-mobile',
    name: 'Claude Mobile',
    subtitle: 'iPhone & iPad',
    icon: '📱',
    color: '#6EE05A',
    steps: [
      { title: 'Set up on the web first', desc: 'Create a project at claude.ai — Projects sync to mobile' },
      { title: 'Add instructions', desc: 'Paste 0nMCP instructions as custom instructions' },
      { title: 'Open Claude on your device', desc: 'The project appears automatically' },
      { title: 'Use 0nMCP anywhere', desc: 'Open the project and start chatting' },
    ],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    subtitle: 'Terminal / CLI',
    icon: '⌨️',
    color: '#ff6b35',
    steps: [
      { title: 'Install with one command', desc: 'Run the installer in your terminal — or choose a method below' },
      { title: 'Login', desc: 'Type /0nmcp login and enter your credentials' },
      { title: 'You\'re connected', desc: 'Vault, Runs, Store, Brain — all in your terminal' },
    ],
  },
]

const INSTALL_METHODS: { id: InstallMethod; label: string; desc: string; icon: string; color: string }[] = [
  { id: 'one-line', label: 'One-Line Installer', desc: 'curl command installs everything + opens dashboard', icon: '⚡', color: '#ff6b35' },
  { id: 'download', label: 'Download SKILL.md', desc: 'Manual: save to ~/.claude/skills/0nmcp/', icon: '📄', color: '#6EE05A' },
  { id: 'dashboard', label: 'Interactive Dashboard', desc: 'Standalone HTML control panel', icon: '📊', color: '#00d4ff' },
  { id: 'config', label: 'Project Config', desc: '.claude.json with MCP + skill config', icon: '⚙️', color: '#a78bfa' },
]

export function SkillInstallClient() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<InstallMethod | null>(null)
  const [copied, setCopied] = useState(false)
  const [installerCopied, setInstallerCopied] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod|android/.test(ua)) {
      setDetectedPlatform('claude-mobile')
      setSelectedPlatform('claude-mobile')
    } else if (/mac|windows/.test(ua)) {
      setDetectedPlatform('claude-desktop')
      setSelectedPlatform('claude-desktop')
    } else {
      setDetectedPlatform('claude-web')
      setSelectedPlatform('claude-web')
    }
  }, [])

  const platform = PLATFORMS.find(p => p.id === selectedPlatform)

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
    } catch { /* fallback handled below */ }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">

      {/* Hero */}
      <div className="max-w-[900px] mx-auto px-6 pt-[60px] pb-10 text-center">
        <a href="/" className="inline-flex items-center gap-1.5 text-[var(--text-muted)] text-[13px] no-underline mb-8">
          <ArrowLeft size={14} />
          Back to 0nmcp.com
        </a>

        <div className="inline-flex px-4 py-1.5 rounded-[20px] bg-[rgba(110,224,90,0.1)] border border-[rgba(110,224,90,0.3)] text-[13px] text-[#6EE05A] font-semibold mb-6">
          Free — No credit card needed
        </div>

        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.1] mb-4 text-[var(--text-primary)]">
          Add <span className="text-[#ff6b35]">0nMCP</span> to Claude
        </h1>

        <p className="text-[clamp(16px,2.5vw,20px)] text-[var(--text-secondary)] max-w-[600px] mx-auto mb-10 leading-[1.6]">
          {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. Your Vault, workflows, and AI brain — right inside any Claude app.
        </p>
      </div>

      {/* Platform Selector */}
      <div className="max-w-[900px] mx-auto px-6">
        <h2 className="text-[15px] text-[var(--text-muted)] text-center mb-4 font-semibold uppercase tracking-[1px]">
          {detectedPlatform ? 'We detected your platform — choose yours' : 'Choose your platform'}
        </h2>

        <div className="grid gap-3 mb-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {PLATFORMS.map((p) => {
            const isSelected = selectedPlatform === p.id
            const isDetected = detectedPlatform === p.id
            return (
              <button
                key={p.id}
                onClick={() => { setSelectedPlatform(p.id); setSelectedMethod(null) }}
                className="relative rounded-[14px] px-4 py-5 cursor-pointer text-center transition-all duration-200 text-[var(--text-primary)]"
                style={{
                  background: isSelected ? `${p.color}12` : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${isSelected ? `${p.color}66` : 'var(--border)'}`,
                }}
              >
                {isDetected && (
                  <div
                    className="absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-[10px] tracking-[0.03em]"
                    style={{ background: p.color, color: 'var(--bg-primary)' }}
                  >
                    DETECTED
                  </div>
                )}
                <div className="text-[36px] mb-2">{p.icon}</div>
                <div className="font-bold text-[15px]" style={{ color: isSelected ? p.color : '#e2e2e8' }}>
                  {p.name}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {p.subtitle}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Platform-specific instructions */}
      {platform && (
        <div className="max-w-[700px] mx-auto px-6 pb-5">
          <div className="flex flex-col gap-0">
            {platform.steps.map((step, i) => (
              <div key={i} className="flex gap-4 py-5"
                style={{ borderBottom: i < platform.steps.length - 1 ? '1px solid var(--bg-card)' : 'none' }}>
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-extrabold text-[15px]"
                  style={{
                    background: `${platform.color}18`,
                    border: `2px solid ${platform.color}44`,
                    color: platform.color,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="m-0 mb-1 text-base text-[var(--text-primary)] font-bold">
                    {step.title}
                  </h3>
                  <p className="m-0 text-sm text-[var(--text-secondary)] leading-[1.5]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Installation Methods — Claude Code gets all 4, others get copy */}
      {platform && (
        <div className="max-w-[700px] mx-auto px-6 pb-10">
          {selectedPlatform === 'claude-code' ? (
            <>
              <h2 className="text-[15px] text-[var(--text-muted)] text-center mb-4 font-semibold uppercase tracking-[1px]">
                Choose install method
              </h2>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {INSTALL_METHODS.map((m) => {
                  const isSelected = selectedMethod === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className="px-4 py-4 rounded-xl text-left transition-all duration-150 text-[var(--text-primary)] font-[inherit] cursor-pointer"
                      style={{
                        background: isSelected ? `${m.color}0c` : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${isSelected ? `${m.color}55` : 'var(--border)'}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[20px]">{m.icon}</span>
                        <span className="font-bold text-sm" style={{ color: isSelected ? m.color : '#e2e2e8' }}>
                          {m.label}
                        </span>
                      </div>
                      <p className="m-0 text-xs text-[var(--text-muted)] leading-[1.4]">
                        {m.desc}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Method-specific action */}
              {selectedMethod && (
                <div
                  className="p-7 rounded-2xl text-center"
                  style={{
                    background: `${INSTALL_METHODS.find(m => m.id === selectedMethod)!.color}08`,
                    border: `1px solid ${INSTALL_METHODS.find(m => m.id === selectedMethod)!.color}22`,
                  }}
                >
                  {selectedMethod === 'one-line' && (
                    <>
                      <p className="mb-4 text-sm text-[var(--text-secondary)]">
                        Run this in your terminal — installs SKILL.md + dashboard + config:
                      </p>
                      <div className="bg-black/40 rounded-[10px] px-5 py-4 mb-4 text-sm text-[#ff6b35] select-all border border-[var(--border)] text-left"
                        style={{ fontFamily: 'JetBrains Mono, SF Mono, monospace' }}>
                        curl -sL https://www.0nmcp.com/api/skill/install | sh
                      </div>
                      <button
                        onClick={copyInstaller}
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl border-none font-bold text-base cursor-pointer transition-all duration-300 font-[inherit] text-white"
                        style={{
                          background: installerCopied
                            ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)'
                            : 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                        }}
                      >
                        {installerCopied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Command</>}
                      </button>
                    </>
                  )}

                  {selectedMethod === 'download' && (
                    <>
                      <p className="mb-4 text-sm text-[var(--text-secondary)]">
                        Download the skill file and save it to your skills folder:
                      </p>
                      <a
                        href="/api/skill/download"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-base no-underline border-none text-white"
                        style={{ background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)' }}
                      >
                        <Download size={18} />
                        Download SKILL.md
                      </a>
                      <p className="mt-4 mb-0 text-xs text-[var(--text-muted)]">
                        Save to: <code className="text-[#6EE05A]">~/.claude/skills/0nmcp/SKILL.md</code>
                      </p>
                    </>
                  )}

                  {selectedMethod === 'dashboard' && (
                    <>
                      <p className="mb-4 text-sm text-[var(--text-secondary)]">
                        A standalone HTML app — open locally to manage your 0nMCP account:
                      </p>
                      <a
                        href="/api/skill/dashboard"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-base no-underline border-none text-white"
                        style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)' }}
                      >
                        <Download size={18} />
                        Download Dashboard
                      </a>
                      <p className="mt-4 mb-0 text-xs text-[var(--text-muted)]">
                        Open <code className="text-[#00d4ff]">dashboard.html</code> in any browser. Vault, Runs, Brain — all local.
                      </p>
                    </>
                  )}

                  {selectedMethod === 'config' && (
                    <>
                      <p className="mb-4 text-sm text-[var(--text-secondary)]">
                        Pre-configured Claude Code project settings with MCP server reference:
                      </p>
                      <a
                        href="/api/skill/config"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-base no-underline border-none text-white"
                        style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' }}
                      >
                        <Download size={18} />
                        Download .claude.json
                      </a>
                      <p className="mt-4 mb-0 text-xs text-[var(--text-muted)]">
                        Place in your project root. Registers the skill + MCP server config.
                      </p>
                    </>
                  )}
                </div>
              )}

              {!selectedMethod && (
                <div className="p-6 rounded-[14px] border border-dashed border-[var(--border)] text-center text-[var(--text-muted)] text-sm">
                  Select an install method above
                </div>
              )}
            </>
          ) : (
            /* Non-Code platforms: copy instructions */
            <div
              className="p-7 rounded-2xl text-center"
              style={{
                background: `${platform.color}08`,
                border: `1px solid ${platform.color}22`,
              }}
            >
              <p className="mb-4 text-sm text-[var(--text-secondary)]">
                Copy the 0nMCP instructions and paste them into your Claude Project:
              </p>
              <button
                onClick={copyInstructions}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-base border-none cursor-pointer transition-all duration-300 min-w-[260px] font-[inherit] text-white"
                style={{
                  background: copied
                    ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)'
                    : `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                }}
              >
                {copied ? (
                  <><Check size={18} /> Copied! Now paste in Claude</>
                ) : (
                  <><Copy size={18} /> Copy 0nMCP Instructions</>
                )}
              </button>
              {selectedPlatform === 'claude-mobile' && (
                <p className="mt-4 mb-0 text-xs text-[var(--text-muted)]">
                  Tip: Set this up on your computer first — Projects sync to mobile automatically.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Account requirement */}
      <div className="max-w-[600px] mx-auto px-6 pb-10">
        <div className="bg-[rgba(255,107,53,0.06)] border border-[rgba(255,107,53,0.15)] rounded-[14px] px-7 py-6 flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-[rgba(255,107,53,0.12)] flex items-center justify-center text-2xl shrink-0">
            👤
          </div>
          <div className="flex-1">
            <h3 className="m-0 mb-1 text-[15px] text-[var(--text-primary)]">
              Free account required
            </h3>
            <p className="m-0 mb-3 text-[13px] text-[var(--text-secondary)] leading-[1.5]">
              You need an 0nmcp.com account. Sign up takes 30 seconds — no credit card.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[rgba(255,107,53,0.15)] text-[#ff6b35] rounded-lg font-semibold text-[13px] no-underline border border-[rgba(255,107,53,0.3)]"
            >
              Create Free Account →
            </a>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div className="max-w-[900px] mx-auto px-6 pb-15">
        <h2 className="text-2xl font-bold text-center mb-7 text-[var(--text-primary)]">
          What you unlock inside Claude
        </h2>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {[
            { icon: '🔐', title: 'Vault — Encrypted API Keys', desc: 'AES-256 encrypted. 2-way sync between Claude and the web.', color: '#f59e0b' },
            { icon: '⚡', title: 'Runs — Pay Per Action', desc: 'Credits that power everything. Check, spend, top up.', color: '#ff6b35' },
            { icon: '🏪', title: 'Store — 50+ Workflows', desc: 'Pre-built automations. Purchase once, run anywhere.', color: '#00d4ff' },
            { icon: '🧠', title: 'Council Brain', desc: '7-persona self-training AI. View status, contribute, level up.', color: '#a78bfa' },
            { icon: '🔧', title: `${STATS_DISPLAY.tools} Tools, ${STATS_DISPLAY.services} Services`, desc: 'CRM, Stripe, Slack, GitHub, Supabase, and more.', color: '#6EE05A' },
            { icon: '🔄', title: '4 Install Methods', desc: 'One-liner, download, dashboard, config — however you work.', color: '#00d4ff' },
          ].map((f) => (
            <div key={f.title} className="px-5 py-5 bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-[14px]">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="m-0 text-sm font-bold" style={{ color: f.color }}>{f.title}</h3>
              </div>
              <p className="m-0 text-[13px] text-[var(--text-muted)] leading-[1.5]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Command Reference */}
      <div className="max-w-[600px] mx-auto px-6 pb-15">
        <h2 className="text-xl font-bold text-center mb-5 text-[var(--text-primary)]">
          Just type these in Claude
        </h2>
        <div className="bg-black/30 border border-[var(--border)] rounded-[14px] px-6 py-5 text-sm leading-[2.2]">
          {[
            { cmd: '/0nmcp login', desc: 'Connect your account' },
            { cmd: '/0nmcp', desc: 'See your status' },
            { cmd: '/0nmcp vault', desc: 'Your API keys' },
            { cmd: '/0nmcp vault save <svc>', desc: 'Push key to vault' },
            { cmd: '/0nmcp runs', desc: 'Check your balance' },
            { cmd: '/0nmcp store', desc: 'Browse workflows' },
            { cmd: '/0nmcp brain', desc: 'AI brain status' },
          ].map((c) => (
            <div key={c.cmd} className="flex justify-between items-center">
              <code className="text-[#ff6b35] font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
              <span className="text-[var(--text-muted)] text-[13px]">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center px-6 py-10 pb-20 border-t border-[var(--bg-card)]">
        <p className="text-[var(--text-secondary)] text-base mb-5 font-medium">
          Ready? It takes 60 seconds.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-base border-none cursor-pointer text-white"
            style={{ background: 'linear-gradient(135deg, #ff6b35, #e55a2b)' }}
          >
            Get Started ↑
          </button>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl font-semibold text-base no-underline border border-[var(--border)]"
          >
            Create Free Account
          </a>
        </div>
        <p className="text-[var(--text-muted)] text-xs mt-4">
          Works with Claude MAX, Pro, and Team plans. Free 0nmcp.com account required.
        </p>
      </div>
    </div>
  )
}
