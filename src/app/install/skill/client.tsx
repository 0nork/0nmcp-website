'use client'

import { useState, useEffect } from 'react'

type Platform = 'claude-desktop' | 'claude-web' | 'claude-mobile' | 'claude-code'

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
      { title: 'Create a new Project', desc: 'Open Claude Desktop → Click "Projects" in the sidebar → "New Project"' },
      { title: 'Name it "0nMCP"', desc: 'Give your project a name so you can find it easily' },
      { title: 'Add the instructions', desc: 'Click "Set custom instructions" → Paste the 0nMCP instructions below' },
      { title: 'Start chatting', desc: 'Open the project and say "/0nmcp login" — Claude becomes your 0nMCP environment' },
    ],
  },
  {
    id: 'claude-web',
    name: 'Claude Web',
    subtitle: 'claude.ai in your browser',
    icon: '🌐',
    color: '#00d4ff',
    steps: [
      { title: 'Go to claude.ai', desc: 'Open claude.ai in your browser and sign in' },
      { title: 'Create a new Project', desc: 'Click "Projects" in the sidebar → "Create project"' },
      { title: 'Add custom instructions', desc: 'Click the project settings → "Set custom instructions" → Paste the 0nMCP instructions below' },
      { title: 'Start using 0nMCP', desc: 'Open a new chat in the project and say "/0nmcp login"' },
    ],
  },
  {
    id: 'claude-mobile',
    name: 'Claude Mobile',
    subtitle: 'iPhone & iPad',
    icon: '📱',
    color: '#7ed957',
    steps: [
      { title: 'Create a Project on the web', desc: 'Go to claude.ai on your computer first and create a project (Projects sync across all devices)' },
      { title: 'Add the instructions', desc: 'Paste the 0nMCP instructions as custom instructions in the project' },
      { title: 'Open Claude on your device', desc: 'The project will appear automatically in your Claude mobile app' },
      { title: 'Chat with 0nMCP anywhere', desc: 'Open the project on your phone or iPad and start using 0nMCP on the go' },
    ],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    subtitle: 'Terminal / CLI',
    icon: '⌨️',
    color: '#ff6b35',
    steps: [
      { title: 'Download the skill file', desc: 'Click the download button below to save the SKILL.md file' },
      { title: 'Save to skills folder', desc: 'Move the downloaded file to: ~/.claude/skills/0nmcp/SKILL.md' },
      { title: 'Type /0nmcp', desc: 'In Claude Code, type /0nmcp login and enter your 0nmcp.com credentials' },
      { title: 'You\'re connected', desc: 'Full 0nMCP environment — Vault, Sparks, Store, Brain — right in your terminal' },
    ],
  },
]

export function SkillInstallClient() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [copied, setCopied] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null)

  // Auto-detect platform
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) {
      setDetectedPlatform('claude-mobile')
      setSelectedPlatform('claude-mobile')
    } else if (/android/.test(ua)) {
      setDetectedPlatform('claude-mobile')
      setSelectedPlatform('claude-mobile')
    } else if (/mac/.test(ua)) {
      setDetectedPlatform('claude-desktop')
      setSelectedPlatform('claude-desktop')
    } else if (/windows/.test(ua)) {
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
      // Fallback: open in new tab
      window.open('/api/skill/download', '_blank')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
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
        {/* Back link */}
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: '#78788c',
          fontSize: 13,
          textDecoration: 'none',
          marginBottom: 32,
        }}>
          ← Back to 0nmcp.com
        </a>

        <div style={{
          display: 'inline-flex',
          padding: '6px 16px',
          borderRadius: 20,
          background: 'rgba(126, 217, 87, 0.1)',
          border: '1px solid rgba(126, 217, 87, 0.3)',
          fontSize: 13,
          color: '#7ed957',
          fontWeight: 600,
          marginBottom: 24,
        }}>
          Free — No credit card needed
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          margin: '0 0 16px 0',
          color: '#e2e2e8',
        }}>
          Add <span style={{ color: '#ff6b35' }}>0nMCP</span> to Claude
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: '#9898a8',
          maxWidth: 600,
          margin: '0 auto 40px',
          lineHeight: 1.6,
        }}>
          850 tools. 53 services. Your Vault, workflows, and AI brain — right inside any Claude app. Takes 60 seconds.
        </p>
      </div>

      {/* Platform Selector */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <h2 style={{
          fontSize: 15,
          color: '#78788c',
          textAlign: 'center',
          marginBottom: 16,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          {detectedPlatform ? 'We detected your platform — choose yours' : 'Choose your platform'}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 40,
        }}>
          {PLATFORMS.map((p) => {
            const isSelected = selectedPlatform === p.id
            const isDetected = detectedPlatform === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                style={{
                  position: 'relative',
                  background: isSelected ? `${p.color}12` : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${isSelected ? `${p.color}66` : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 14,
                  padding: '20px 16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  color: 'var(--text-primary, #e2e2e8)',
                }}
              >
                {isDetected && (
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: p.color,
                    color: '#0a0a0f',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    letterSpacing: '0.03em',
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
        <div style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '0 24px 40px',
        }}>
          {/* Step-by-step */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}>
            {platform.steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 16,
                padding: '20px 0',
                borderBottom: i < platform.steps.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: `${platform.color}18`,
                  border: `2px solid ${platform.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: platform.color,
                  fontSize: 15,
                  flexShrink: 0,
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

          {/* Action Button — platform-specific */}
          <div style={{
            marginTop: 32,
            padding: 28,
            background: `${platform.color}08`,
            border: `1px solid ${platform.color}22`,
            borderRadius: 16,
            textAlign: 'center',
          }}>
            {selectedPlatform === 'claude-code' ? (
              <>
                <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#9898a8' }}>
                  Download the skill file and save it to your skills folder:
                </p>
                <a
                  href="/api/skill/download"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 32px',
                    background: `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                    color: 'white',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 16,
                    textDecoration: 'none',
                    border: 'none',
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
                  Save to: <code style={{ color: platform.color }}>~/.claude/skills/0nmcp/SKILL.md</code>
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#9898a8' }}>
                  Copy the 0nMCP instructions and paste them into your Claude Project:
                </p>
                <button
                  onClick={copyInstructions}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 32px',
                    background: copied
                      ? 'linear-gradient(135deg, #7ed957, #5cb83a)'
                      : `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`,
                    color: 'white',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    minWidth: 260,
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Account requirement */}
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '0 24px 40px',
      }}>
        <div style={{
          background: 'rgba(255, 107, 53, 0.06)',
          border: '1px solid rgba(255, 107, 53, 0.15)',
          borderRadius: 14,
          padding: '24px 28px',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255, 107, 53, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 15, color: '#e2e2e8' }}>
              Free account required
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#9898a8', lineHeight: 1.5 }}>
              You need an 0nmcp.com account to use the skill. Sign up takes 30 seconds — no credit card needed.
            </p>
            <a
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                background: 'rgba(255, 107, 53, 0.15)',
                color: '#ff6b35',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                border: '1px solid rgba(255, 107, 53, 0.3)',
              }}
            >
              Create Free Account →
            </a>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 24px 60px',
      }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 28,
          color: '#e2e2e8',
        }}>
          What you unlock inside Claude
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 14,
        }}>
          {[
            { icon: '🔐', title: 'Vault — Encrypted API Keys', desc: 'Your API keys, encrypted with AES-256, loaded securely into each conversation', color: '#f59e0b' },
            { icon: '⚡', title: 'Sparks — Pay Per Action', desc: 'Credits that power everything. Check balance, spend, top up — all inside Claude', color: '#ff6b35' },
            { icon: '🏪', title: 'Store — 50+ Workflows', desc: 'Browse pre-built automations. Purchase once, run anywhere, anytime', color: '#00d4ff' },
            { icon: '🧠', title: 'Council Brain', desc: 'A self-training AI with 7 personas. View status, contribute knowledge, level up', color: '#a78bfa' },
            { icon: '🔧', title: '850 Tools, 53 Services', desc: 'CRM, Stripe, Slack, GitHub, Supabase, and 48 more — orchestrate everything', color: '#7ed957' },
            { icon: '🔄', title: 'Live Account Sync', desc: 'Connected to your 0nmcp.com account. Everything stays in sync across devices', color: '#00d4ff' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: '20px 22px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
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
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '0 24px 60px',
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 20,
          color: '#e2e2e8',
        }}>
          Just type these in Claude
        </h2>
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: '20px 24px',
          fontSize: 14,
          lineHeight: 2.2,
        }}>
          {[
            { cmd: '/0nmcp login', desc: 'Connect your account' },
            { cmd: '/0nmcp', desc: 'See your status' },
            { cmd: '/0nmcp vault', desc: 'Your API keys' },
            { cmd: '/0nmcp sparks', desc: 'Check your balance' },
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
        textAlign: 'center',
        padding: '40px 24px 80px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ color: '#9898a8', fontSize: 16, marginBottom: 20, fontWeight: 500 }}>
          Ready? It takes 60 seconds.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: 'white',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Get Started ↑
          </button>
          <a
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.05)',
              color: '#e2e2e8',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
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
