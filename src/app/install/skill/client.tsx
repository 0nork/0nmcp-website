'use client'

import { useState, useEffect } from 'react'
import { STATS_DISPLAY } from '@/data/stats'

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
    <div style={{
      minHeight: '100vh',
      background: '#0B0F19',
      color: '#e2e2e8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Hero */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '60px 24px 40px',
        textAlign: 'center',
      }}>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#78788c', fontSize: 13, textDecoration: 'none', marginBottom: 32,
        }}>
          ← Back to 0nmcp.com
        </a>

        <div style={{
          display: 'inline-flex', padding: '6px 16px', borderRadius: 20,
          background: 'rgba(110, 224, 90, 0.1)', border: '1px solid rgba(110, 224, 90, 0.3)',
          fontSize: 13, color: '#6EE05A', fontWeight: 600, marginBottom: 24,
        }}>
          Free — No credit card needed
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800,
          lineHeight: 1.1, margin: '0 0 16px 0', color: '#e2e2e8',
        }}>
          Add <span style={{ color: '#ff6b35' }}>0nMCP</span> to Claude
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#9898a8',
          maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6,
        }}>
          {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. Your Vault, workflows, and AI brain — right inside any Claude app.
        </p>
      </div>

      {/* Platform Selector */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{
          fontSize: 15, color: '#78788c', textAlign: 'center', marginBottom: 16,
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
        }}>
          {detectedPlatform ? 'We detected your platform — choose yours' : 'Choose your platform'}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12, marginBottom: 40,
        }}>
          {PLATFORMS.map((p) => {
            const isSelected = selectedPlatform === p.id
            const isDetected = detectedPlatform === p.id
            return (
              <button
                key={p.id}
                onClick={() => { setSelectedPlatform(p.id); setSelectedMethod(null) }}
                style={{
                  position: 'relative',
                  background: isSelected ? `${p.color}12` : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${isSelected ? `${p.color}66` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 14, padding: '20px 16px',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  color: '#e2e2e8',
                }}
              >
                {isDetected && (
                  <div style={{
                    position: 'absolute', top: -8, right: -8,
                    background: p.color, color: '#0B0F19', fontSize: 10, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 10, letterSpacing: '0.03em',
                  }}>
                    DETECTED
                  </div>
                )}
                <div style={{ fontSize: 36, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: isSelected ? p.color : '#e2e2e8' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: '#78788c', marginTop: 2 }}>
                  {p.subtitle}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Platform-specific instructions */}
      {platform && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {platform.steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, padding: '20px 0',
                borderBottom: i < platform.steps.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: `${platform.color}18`, border: `2px solid ${platform.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: platform.color, fontSize: 15, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#e2e2e8', fontWeight: 700 }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: '#9898a8', lineHeight: 1.5 }}>
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
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 40px' }}>
          {selectedPlatform === 'claude-code' ? (
            <>
              <h2 style={{
                fontSize: 15, color: '#78788c', textAlign: 'center', marginBottom: 16,
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
              }}>
                Choose install method
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10, marginBottom: 24,
              }}>
                {INSTALL_METHODS.map((m) => {
                  const isSelected = selectedMethod === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      style={{
                        padding: '16px 18px', borderRadius: 12, textAlign: 'left',
                        background: isSelected ? `${m.color}0c` : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${isSelected ? `${m.color}55` : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer', transition: 'all 0.15s', color: '#e2e2e8',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 20 }}>{m.icon}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: isSelected ? m.color : '#e2e2e8' }}>
                          {m.label}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#78788c', lineHeight: 1.4 }}>
                        {m.desc}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Method-specific action */}
              {selectedMethod && (
                <div style={{
                  padding: 28,
                  background: `${INSTALL_METHODS.find(m => m.id === selectedMethod)!.color}08`,
                  border: `1px solid ${INSTALL_METHODS.find(m => m.id === selectedMethod)!.color}22`,
                  borderRadius: 16, textAlign: 'center',
                }}>
                  {selectedMethod === 'one-line' && (
                    <>
                      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#9898a8' }}>
                        Run this in your terminal — installs SKILL.md + dashboard + config:
                      </p>
                      <div style={{
                        background: 'rgba(0,0,0,0.4)', borderRadius: 10,
                        padding: '16px 20px', marginBottom: 16,
                        fontFamily: 'JetBrains Mono, SF Mono, monospace',
                        fontSize: 14, color: '#ff6b35', userSelect: 'all',
                        border: '1px solid rgba(255,255,255,0.06)',
                        textAlign: 'left',
                      }}>
                        curl -sL https://www.0nmcp.com/api/skill/install | sh
                      </div>
                      <button
                        onClick={copyInstaller}
                        className="btn-primary"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '14px 32px',
                          background: installerCopied
                            ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)'
                            : 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                          color: 'white', borderRadius: 12, fontWeight: 700,
                          fontSize: 16, border: 'none', cursor: 'pointer',
                          transition: 'all 0.3s', fontFamily: 'inherit',
                        }}
                      >
                        {installerCopied ? 'Copied!' : 'Copy Command'}
                      </button>
                    </>
                  )}

                  {selectedMethod === 'download' && (
                    <>
                      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#9898a8' }}>
                        Download the skill file and save it to your skills folder:
                      </p>
                      <a
                        href="/api/skill/download"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '14px 32px',
                          background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
                          color: 'white', borderRadius: 12, fontWeight: 700,
                          fontSize: 16, textDecoration: 'none', border: 'none',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download SKILL.md
                      </a>
                      <p style={{ margin: '16px 0 0 0', fontSize: 12, color: '#5a5a6a' }}>
                        Save to: <code style={{ color: '#6EE05A' }}>~/.claude/skills/0nmcp/SKILL.md</code>
                      </p>
                    </>
                  )}

                  {selectedMethod === 'dashboard' && (
                    <>
                      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#9898a8' }}>
                        A standalone HTML app — open locally to manage your 0nMCP account:
                      </p>
                      <a
                        href="/api/skill/dashboard"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '14px 32px',
                          background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                          color: 'white', borderRadius: 12, fontWeight: 700,
                          fontSize: 16, textDecoration: 'none', border: 'none',
                        }}
                      >
                        Download Dashboard
                      </a>
                      <p style={{ margin: '16px 0 0 0', fontSize: 12, color: '#5a5a6a' }}>
                        Open <code style={{ color: '#00d4ff' }}>dashboard.html</code> in any browser. Vault, Runs, Brain — all local.
                      </p>
                    </>
                  )}

                  {selectedMethod === 'config' && (
                    <>
                      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#9898a8' }}>
                        Pre-configured Claude Code project settings with MCP server reference:
                      </p>
                      <a
                        href="/api/skill/config"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '14px 32px',
                          background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                          color: 'white', borderRadius: 12, fontWeight: 700,
                          fontSize: 16, textDecoration: 'none', border: 'none',
                        }}
                      >
                        Download .claude.json
                      </a>
                      <p style={{ margin: '16px 0 0 0', fontSize: 12, color: '#5a5a6a' }}>
                        Place in your project root. Registers the skill + MCP server config.
                      </p>
                    </>
                  )}
                </div>
              )}

              {!selectedMethod && (
                <div style={{
                  padding: 24, borderRadius: 14,
                  border: '1px dashed rgba(255,255,255,0.1)',
                  textAlign: 'center', color: '#5a5a6a', fontSize: 14,
                }}>
                  Select an install method above
                </div>
              )}
            </>
          ) : (
            /* Non-Code platforms: copy instructions */
            <div style={{
              padding: 28,
              background: `${platform.color}08`,
              border: `1px solid ${platform.color}22`,
              borderRadius: 16, textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#9898a8' }}>
                Copy the 0nMCP instructions and paste them into your Claude Project:
              </p>
              <button
                onClick={copyInstructions}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 32px',
                  background: copied
                    ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)'
                    : `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                  color: 'white', borderRadius: 12, fontWeight: 700,
                  fontSize: 16, border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s', minWidth: 260, fontFamily: 'inherit',
                }}
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied! Now paste in Claude
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy 0nMCP Instructions
                  </>
                )}
              </button>
              {selectedPlatform === 'claude-mobile' && (
                <p style={{ margin: '16px 0 0 0', fontSize: 12, color: '#5a5a6a' }}>
                  Tip: Set this up on your computer first — Projects sync to mobile automatically.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Account requirement */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{
          background: 'rgba(255, 107, 53, 0.06)',
          border: '1px solid rgba(255, 107, 53, 0.15)',
          borderRadius: 14, padding: '24px 28px',
          display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255, 107, 53, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 15, color: '#e2e2e8' }}>
              Free account required
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#9898a8', lineHeight: 1.5 }}>
              You need an 0nmcp.com account. Sign up takes 30 seconds — no credit card.
            </p>
            <a
              href="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', background: 'rgba(255, 107, 53, 0.15)',
                color: '#ff6b35', borderRadius: 8, fontWeight: 600, fontSize: 13,
                textDecoration: 'none', border: '1px solid rgba(255, 107, 53, 0.3)',
              }}
            >
              Create Free Account →
            </a>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 28, color: '#e2e2e8' }}>
          What you unlock inside Claude
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 14,
        }}>
          {[
            { icon: '🔐', title: 'Vault — Encrypted API Keys', desc: 'AES-256 encrypted. 2-way sync between Claude and the web.', color: '#f59e0b' },
            { icon: '⚡', title: 'Runs — Pay Per Action', desc: 'Credits that power everything. Check, spend, top up.', color: '#ff6b35' },
            { icon: '🏪', title: 'Store — 50+ Workflows', desc: 'Pre-built automations. Purchase once, run anywhere.', color: '#00d4ff' },
            { icon: '🧠', title: 'Council Brain', desc: '7-persona self-training AI. View status, contribute, level up.', color: '#a78bfa' },
            { icon: '🔧', title: `${STATS_DISPLAY.tools} Tools, ${STATS_DISPLAY.services} Services`, desc: 'CRM, Stripe, Slack, GitHub, Supabase, and more.', color: '#6EE05A' },
            { icon: '🔄', title: '4 Install Methods', desc: 'One-liner, download, dashboard, config — however you work.', color: '#00d4ff' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: '20px 22px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <h3 style={{ margin: 0, fontSize: 14, color: f.color, fontWeight: 700 }}>{f.title}</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#78788c', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Command Reference */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 20, color: '#e2e2e8' }}>
          Just type these in Claude
        </h2>
        <div style={{
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '20px 24px', fontSize: 14, lineHeight: 2.2,
        }}>
          {[
            { cmd: '/0nmcp login', desc: 'Connect your account' },
            { cmd: '/0nmcp', desc: 'See your status' },
            { cmd: '/0nmcp vault', desc: 'Your API keys' },
            { cmd: '/0nmcp vault save <svc>', desc: 'Push key to vault' },
            { cmd: '/0nmcp runs', desc: 'Check your balance' },
            { cmd: '/0nmcp store', desc: 'Browse workflows' },
            { cmd: '/0nmcp brain', desc: 'AI brain status' },
          ].map((c) => (
            <div key={c.cmd} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <code style={{ color: '#ff6b35', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{c.cmd}</code>
              <span style={{ color: '#5a5a6a', fontSize: 13 }}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        textAlign: 'center', padding: '40px 24px 80px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ color: '#9898a8', fontSize: 16, marginBottom: 20, fontWeight: 500 }}>
          Ready? It takes 60 seconds.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 16,
              border: 'none', cursor: 'pointer',
            }}
          >
            Get Started ↑
          </button>
          <a
            href="/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', background: 'rgba(255,255,255,0.05)',
              color: '#e2e2e8', borderRadius: 12, fontWeight: 600, fontSize: 16,
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Create Free Account
          </a>
        </div>
        <p style={{ color: '#5a5a6a', fontSize: 12, marginTop: 16 }}>
          Works with Claude MAX, Pro, and Team plans. Free 0nmcp.com account required.
        </p>
      </div>
    </div>
  )
}
