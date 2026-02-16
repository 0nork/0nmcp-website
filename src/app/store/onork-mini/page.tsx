import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nork Mini — Desktop Buddy & Command Widget | 0nMCP Store',
  description:
    'Your AI-powered desktop companion. Connect 10 services, manage credentials, build workflows, and chat with AI — all from a sleek sidebar widget.',
  openGraph: {
    title: '0nork Mini — Desktop Buddy & Command Widget',
    description:
      'Your AI-powered desktop companion. Connect 10 services, manage credentials, build workflows, and chat with AI.',
    url: 'https://0nmcp.com/store/onork-mini',
    siteName: '0nMCP',
    type: 'website',
  },
}

const SERVICES = [
  { name: 'CRM', color: '#7c3aed', icon: '🚀' },
  { name: 'Stripe', color: '#635bff', icon: '💳' },
  { name: 'Anthropic', color: '#d4a574', icon: '🧠' },
  { name: 'OpenAI', color: '#10a37f', icon: '🤖' },
  { name: 'Supabase', color: '#3ecf8e', icon: '🗄' },
  { name: 'Vercel', color: '#e2e2e2', icon: '▲' },
  { name: 'GitHub', color: '#e2e2e2', icon: '🐙' },
  { name: 'Gmail', color: '#d93025', icon: '✉' },
  { name: 'Slack', color: '#e01e5a', icon: '💬' },
  { name: 'n8n', color: '#ff6d5a', icon: '⚡' },
]

const CAPABILITIES = [
  { label: 'PIN-Protected Access', icon: '🔐' },
  { label: 'Service Credential Vault', icon: '🗝' },
  { label: 'AI Chat Assistant', icon: '💬' },
  { label: 'Workflow Manager', icon: '⚙' },
  { label: 'Activity History', icon: '📋' },
  { label: 'Smart Suggestions', icon: '💡' },
  { label: 'Command Palette', icon: '⌨' },
  { label: 'Embeddable Widget', icon: '🪟' },
]

export default function OnorkMiniStorePage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      {/* Hero */}
      <section className="store-hero">
        <div className="store-badge">First Product Drop</div>
        <h1>0nork Mini</h1>
        <p className="store-subtitle">
          Your AI-powered desktop buddy. A sleek sidebar widget that connects to
          10 services, manages your credentials securely, and gives you instant
          access to AI chat, workflows, and smart automation ideas.
        </p>
      </section>

      {/* Preview + Info Grid */}
      <section className="store-preview">
        {/* Left: Demo Preview */}
        <div className="store-demo">
          <div style={{
            background: '#08081a',
            borderRadius: 12,
            padding: '1rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            color: '#a0a8d0',
            lineHeight: 1.8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, color: '#fff' }}>0</span>
              </div>
              <span style={{ color: '#f0f0ff', fontWeight: 600, fontSize: '0.85rem' }}>0nork Mini</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#505880' }}>v1.0</span>
            </div>
            <div style={{ color: '#34d399', marginBottom: 4 }}>$ vault status</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  3 services connected</div>
            <div style={{ color: '#505880', marginBottom: 8 }}>  Stripe, Anthropic, Supabase</div>
            <div style={{ color: '#34d399', marginBottom: 4 }}>$ /flows</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  2 active workflows</div>
            <div style={{ color: '#505880', marginBottom: 8 }}>  Lead Scorer, Invoice Bot</div>
            <div style={{ color: '#60a5fa', marginBottom: 4 }}>{'>'} New contact → Claude scores lead quality</div>
            <div style={{ color: '#fbbf24', fontSize: '0.75rem' }}>💡 Smart suggestion based on connected services</div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="store-info">
          <h2>Your Desktop Command Center</h2>
          <ul className="store-features">
            <li>PIN-protected sidebar with 6-digit security</li>
            <li>Connect and manage 10 service APIs from one place</li>
            <li>Encrypted credential vault in your browser</li>
            <li>AI-powered chat with service-aware context</li>
            <li>Create, toggle, and execute .0n workflows</li>
            <li>Smart workflow ideas based on your connections</li>
            <li>Full activity history and command palette</li>
            <li>Embeddable on any website via script tag</li>
          </ul>

          <div className="store-pricing">
            <div className="store-price">Free</div>
            <p className="store-price-note">Included with your 0nMCP account</p>
          </div>

          <Link href="/signup" className="store-cta">
            Get Started — Create Account
          </Link>
          <button
            className="store-cta secondary"
            onClick={undefined}
            style={{ cursor: 'default' }}
          >
            Try it now — click the widget in the corner →
          </button>
        </div>
      </section>

      {/* Supported Services */}
      <section className="store-capabilities" style={{ marginBottom: '2.5rem' }}>
        <h3>10 Supported Services</h3>
        <div className="store-cap-grid">
          {SERVICES.map((svc) => (
            <div key={svc.name} className="store-cap-item">
              <div
                className="store-cap-icon"
                style={{ background: `${svc.color}22`, color: svc.color }}
              >
                {svc.icon}
              </div>
              {svc.name}
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="store-capabilities">
        <h3>Built-in Capabilities</h3>
        <div className="store-cap-grid">
          {CAPABILITIES.map((cap) => (
            <div key={cap.label} className="store-cap-item">
              <div className="store-cap-icon" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                {cap.icon}
              </div>
              {cap.label}
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="store-security">
        <h3>Security First</h3>
        <p>
          Your credentials never leave your browser. All API keys are stored in
          encrypted localStorage and are never transmitted to our servers.
          PIN protection prevents unauthorized access to your widget.
        </p>
        <div className="store-security-badges">
          <span className="store-security-badge">PIN Access</span>
          <span className="store-security-badge">Client-Side Only</span>
          <span className="store-security-badge">No Server Storage</span>
          <span className="store-security-badge">Encrypted Vault</span>
        </div>
      </section>
    </div>
  )
}
