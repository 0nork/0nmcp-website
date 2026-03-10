import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Install 0nMCP Skill for Claude Code | 0nMCP',
  description: 'Turn Claude Code into a full 0nMCP environment. Download one file, authenticate, and get access to 850 tools, your Vault, workflows, and the Council Brain.',
  openGraph: {
    title: 'Install 0nMCP Skill for Claude Code',
    description: 'Turn Claude Code into a full 0nMCP environment with one file.',
    url: 'https://0nmcp.com/install/skill',
  },
}

export default function SkillInstallPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e2e8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Hero */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '6px 16px',
          borderRadius: 20,
          background: 'rgba(255, 107, 53, 0.1)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          fontSize: 13,
          color: '#ff6b35',
          fontWeight: 600,
          marginBottom: 24,
        }}>
          Free Download
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          margin: '0 0 16px 0',
          background: 'linear-gradient(135deg, #ff6b35, #ff9a5c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Turn Claude Code into<br />an 0nMCP Environment
        </h1>

        <p style={{
          fontSize: 18,
          color: '#9898a8',
          maxWidth: 600,
          margin: '0 auto 32px',
          lineHeight: 1.6,
        }}>
          One file. One command. 850 tools across 53 services — your Vault, workflows, Sparks, and the Council Brain, all from your terminal.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/api/skill/download"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: 'white',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              border: 'none',
              transition: 'transform 0.2s',
            }}
          >
            Download SKILL.md
          </a>
          <a
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.05)',
              color: '#e2e2e8',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Create Account First
          </a>
        </div>
      </div>

      {/* Steps */}
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 60px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {[
            {
              step: '1',
              title: 'Sign up at 0nmcp.com',
              desc: 'Create your free account. You get a Vault for API keys, a Spark balance, and access to the Store.',
              code: null,
              color: '#7ed957',
            },
            {
              step: '2',
              title: 'Download the skill',
              desc: 'Save SKILL.md to your Claude Code skills directory.',
              code: 'mkdir -p ~/.claude/skills/0nmcp && curl -o ~/.claude/skills/0nmcp/SKILL.md https://0nmcp.com/api/skill/download',
              color: '#00d4ff',
            },
            {
              step: '3',
              title: 'Login from Claude Code',
              desc: 'Type /0nmcp login and enter your credentials. Your session is established.',
              code: '/0nmcp login',
              color: '#a78bfa',
            },
            {
              step: '4',
              title: 'You\'re connected',
              desc: 'Access your Vault, run workflows, check your Sparks, and contribute to the Council Brain — all from Claude Code.',
              code: '/0nmcp',
              color: '#ff6b35',
            },
          ].map((s) => (
            <div key={s.step} style={{
              display: 'flex',
              gap: 16,
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${s.color}15`,
                border: `1px solid ${s.color}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: s.color,
                fontSize: 18,
                flexShrink: 0,
              }}>
                {s.step}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: 16, color: '#e2e2e8' }}>
                  {s.title}
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#9898a8', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
                {s.code && (
                  <code style={{
                    display: 'block',
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.4)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#ff6b35',
                    fontFamily: 'JetBrains Mono, monospace',
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                  }}>
                    {s.code}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What You Get */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '0 24px 60px',
      }}>
        <h2 style={{
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 32,
          color: '#e2e2e8',
        }}>
          What You Get
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {[
            { icon: '🔐', title: 'Vault Access', desc: 'Your encrypted API keys, loaded securely into your session' },
            { icon: '⚡', title: 'Sparks System', desc: 'Pay-per-action credits — check balance and spend from the CLI' },
            { icon: '🏪', title: 'Workflow Store', desc: 'Browse and run purchased automation templates' },
            { icon: '🧠', title: 'Council Brain', desc: 'View training status and contribute knowledge (Tier 3+)' },
            { icon: '🔧', title: '850 Tools', desc: '53 services, 23 categories — orchestrate anything' },
            { icon: '🔄', title: 'Live Sync', desc: 'Connected to your 0nmcp.com account in real time' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: 20,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 15, color: '#e2e2e8' }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#78788c', lineHeight: 1.4 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Command Reference */}
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 60px',
      }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 24,
          color: '#e2e2e8',
        }}>
          Command Reference
        </h2>
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: 24,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          lineHeight: 2,
          color: '#9898a8',
        }}>
          <div><span style={{ color: '#ff6b35' }}>/0nmcp</span>           <span style={{ color: '#5a5a6a' }}>— Show status (services, sparks, brain)</span></div>
          <div><span style={{ color: '#ff6b35' }}>/0nmcp login</span>     <span style={{ color: '#5a5a6a' }}>— Authenticate with your account</span></div>
          <div><span style={{ color: '#ff6b35' }}>/0nmcp vault</span>     <span style={{ color: '#5a5a6a' }}>— List connected services</span></div>
          <div><span style={{ color: '#ff6b35' }}>/0nmcp sparks</span>    <span style={{ color: '#5a5a6a' }}>— Check your Spark balance</span></div>
          <div><span style={{ color: '#ff6b35' }}>/0nmcp store</span>     <span style={{ color: '#5a5a6a' }}>— Browse automation templates</span></div>
          <div><span style={{ color: '#ff6b35' }}>/0nmcp brain</span>     <span style={{ color: '#5a5a6a' }}>— View brain training status</span></div>
          <div><span style={{ color: '#ff6b35' }}>/0nmcp help</span>      <span style={{ color: '#5a5a6a' }}>— Full command reference</span></div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        textAlign: 'center',
        padding: '40px 24px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ color: '#78788c', fontSize: 14, marginBottom: 16 }}>
          Ready to turn Claude into your AI orchestration terminal?
        </p>
        <a
          href="/api/skill/download"
          style={{
            display: 'inline-flex',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
            color: 'white',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Download the Skill — Free
        </a>
        <p style={{ color: '#5a5a6a', fontSize: 12, marginTop: 12 }}>
          Requires Claude Code (MAX, Pro, or Team plan) and a free 0nmcp.com account.
        </p>
      </div>
    </div>
  )
}
