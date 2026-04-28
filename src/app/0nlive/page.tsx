import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '0n Command Center — Live Access',
  description: 'Download and install the 0n Command Center. 12 engines, 88 API routes, AI-powered outreach, CRM auto-provisioning.',
  robots: { index: false, follow: false },
}

export default function ZeroNLivePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(126,217,87,0.2), rgba(126,217,87,0.05))',
            border: '2px solid rgba(126,217,87,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#6EE05A',
            fontFamily: "'JetBrains Mono', monospace",
          }}>0n</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Command Center <span style={{ color: '#6EE05A' }}>v4.2</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 500, margin: '0 auto' }}>
            Your personal AI operations hub. 12 engines, 88 routes, zero-knowledge credential proxy,
            OAuth SSO, outreach enrichment, and automatic CRM provisioning.
          </p>
        </div>

        {/* Download Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: 32, marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#6EE05A' }}>&#x25B6;</span> Quick Install
          </h2>

          <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 20, border: '1px solid var(--border)', marginBottom: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 12 }}>
              Sign up — no install
            </p>
            <a
              href="https://0ncore.com"
              target="_blank"
              rel="noopener"
              style={{
                display: 'inline-block',
                background: '#6EE05A',
                color: '#0a0a0a',
                fontWeight: 800,
                fontSize: 14,
                padding: '12px 24px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              Open 0nCore Free →
            </a>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
            Sign up at <strong style={{ color: 'var(--text-primary)' }}>0ncore.com</strong> — no
            credit card, no install. Your dashboard provisions automatically.
          </p>
        </div>

        {/* Environment Variables */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: 32, marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#00d4ff' }}>&#x2699;</span> Environment Setup
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            Edit <code style={{ color: '#00d4ff', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>.env</code> with your credentials.
            Only Supabase keys are required — everything else is optional.
          </p>

          <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 20, border: '1px solid var(--border)' }}>
            <pre style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-primary)',
              lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap',
            }}>{`# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SESSION_SECRET=any-random-string

# Optional
PORT=3030
GITHUB_TOKEN=ghp_...
# OAUTH_GOOGLE_CLIENT_ID=
# OAUTH_GOOGLE_CLIENT_SECRET=`}</pre>
          </div>
        </div>

        {/* What's Included */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: 32, marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#a78bfa' }}>&#x2726;</span> What&apos;s Inside
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Engines', value: '12', color: '#6EE05A', items: 'Reddit, LinkedIn, GitHub, Outreach, OAuth, Onboarding...' },
              { label: 'API Routes', value: '88+', color: '#00d4ff', items: 'Builder, connections, workflows, marketplace, admin' },
              { label: 'Services', value: '54', color: '#a78bfa', items: 'Stripe, Gmail, Slack, Discord, CRM, OpenAI, Anthropic...' },
              { label: 'OAuth Providers', value: '7', color: '#f59e0b', items: 'Google, GitHub, Slack, Stripe, Zoom, HubSpot, Microsoft' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'var(--bg-primary)', borderRadius: 8, padding: 16,
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.items}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: 32, marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#ff6b35' }}>&#x26A1;</span> Key Features
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { title: 'Zero-Knowledge Capability Proxy', desc: 'Credentials borrowed in-memory, wiped after each call. Never in logs, never at rest.', color: '#6EE05A' },
              { title: 'CRM Auto-Provisioning', desc: 'Register an account and get a full CRM sub-account generated automatically via API.', color: '#00d4ff' },
              { title: 'Outreach Enricher', desc: 'Upload a CSV, AI enriches each lead with location hooks, competitors, reviews, pain points. Generate email sequences.', color: '#a78bfa' },
              { title: 'Guided Workflow Builder', desc: '5-step builder: Trigger → Action → Configure → Output → Turn it 0n. Connects to 54 services.', color: '#f59e0b' },
              { title: 'OAuth SSO', desc: '7 providers (Google, GitHub, Slack, Stripe, Zoom, HubSpot, Microsoft). Click to connect, no API keys needed.', color: '#ff6b35' },
              { title: 'Desktop App', desc: 'macOS .app bundle. Double-click to launch, Cmd+Q to stop. Green 0n icon.', color: '#6EE05A' },
            ].map((f) => (
              <div key={f.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.color, marginTop: 7, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* macOS Tip */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(126,217,87,0.2)', borderRadius: 12,
          padding: 24, marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#6EE05A' }}>
            macOS SSL Note
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
            If you see TLS certificate errors connecting to Supabase, start with:
          </p>
          <code style={{
            display: 'block', marginTop: 8, padding: '8px 12px',
            background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6EE05A',
          }}>NODE_TLS_REJECT_UNAUTHORIZED=0 node server.js</code>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #222' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Built by <span style={{ color: 'var(--text-muted)' }}>RocketOpp LLC</span> &middot; Powered by <span style={{ color: '#6EE05A' }}>0nMCP</span>
          </p>
          <p style={{ fontSize: 10, color: '#333', marginTop: 4 }}>
            This page is private and not indexed. Access is invitation-only.
          </p>
        </div>

      </div>
    </div>
  )
}
