import type { Metadata } from 'next'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: '0nMCP — One Brain. Every Service. Zero Limits.',
  description:
    'The universal AI API orchestrator. 900+ tools across 55 services — Stripe, CRM, Slack, GitHub, Supabase, and more. One npm install. Every AI platform. Patent-pending security.',
  keywords: [
    '0nMCP',
    'MCP server',
    'AI orchestrator',
    'API integration',
    'workflow automation',
    'Model Context Protocol',
    'AI tools',
    'Stripe MCP',
    'CRM automation',
  ],
  openGraph: {
    title: '0nMCP — One Brain. Every Service. Zero Limits.',
    description: '900+ tools. 55 services. One command. Works with Claude, Gemini, Grok, Cursor, and every MCP-compatible AI.',
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — One Brain. Every Service. Zero Limits.',
    description: '900+ tools. 55 services. One command. Works with Claude, Gemini, Grok, Cursor, and every MCP-compatible AI.',
  },
  alternates: { canonical: 'https://www.0nmcp.com' },
}

const services = [
  { name: 'Stripe', color: '#635bff' },
  { name: 'Slack', color: '#4a154b' },
  { name: 'GitHub', color: '#f0f6fc' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'SendGrid', color: '#1a82e2' },
  { name: 'Twilio', color: '#f22f46' },
  { name: 'Google', color: '#4285f4' },
  { name: 'Shopify', color: '#96bf48' },
  { name: 'Discord', color: '#5865f2' },
  { name: 'Notion', color: '#ffffff' },
  { name: 'HubSpot', color: '#ff7a59' },
  { name: 'Linear', color: '#5e6ad2' },
]

const features = [
  {
    title: '900+ Tools, One Install',
    desc: 'Stripe, CRM, Slack, GitHub, Supabase, SendGrid, Twilio, and 48 more services. All accessible through a single MCP server.',
    color: '#6EE05A',
    icon: '⚡',
  },
  {
    title: 'Every AI Platform',
    desc: 'Claude, Gemini, Grok, Cursor, Windsurf, VS Code, OpenAI — generates configs for 7+ platforms automatically.',
    color: '#00d4ff',
    icon: '🧠',
  },
  {
    title: 'Patent-Pending Security',
    desc: 'AES-256-GCM vault encryption with hardware fingerprint binding. Credentials never leave your machine.',
    color: '#a78bfa',
    icon: '🔒',
  },
  {
    title: 'Portable .0n Files',
    desc: 'Your workflows, credentials, and configs travel with you. One file format works on any machine, any AI platform.',
    color: '#fbbf24',
    icon: '📦',
  },
]

const comparisons = [
  { feature: 'Total tools', us: '900+', them: '10-50', themLabel: 'Zapier / Make' },
  { feature: 'Services included', us: '55', them: '1-5', themLabel: 'per MCP server' },
  { feature: 'Setup time', us: '1 command', them: '30+ min', themLabel: 'per service' },
  { feature: 'Credential security', us: 'AES-256 vault', them: 'Plain text .env', themLabel: 'most tools' },
  { feature: 'AI platform lock-in', us: 'None — works everywhere', them: 'Single platform', themLabel: 'most tools' },
  { feature: 'Monthly cost', us: 'Free / $80', them: '$20-500+', themLabel: 'per service' },
]

const steps = [
  {
    num: '01',
    title: 'Install',
    desc: 'One npm command installs 900+ tools across 55 services.',
    code: 'npx 0nmcp@latest',
  },
  {
    num: '02',
    title: 'Connect',
    desc: 'Import your API keys. Auto-maps to all services. Vault-encrypted.',
    code: '0nmcp engine import',
  },
  {
    num: '03',
    title: 'Build',
    desc: 'Your AI can now access every service. Describe what you want — it executes.',
    code: '"Create a Stripe invoice and notify the team on Slack"',
  },
]

const pricing = [
  {
    name: 'Open Source',
    price: 'Free',
    period: 'forever',
    desc: 'Full MCP server. 900+ tools. Self-hosted.',
    features: ['All 55 services', '900+ tools', 'Vault encryption', 'CLI + HTTP modes', '.0n workflow engine', 'Community support'],
    cta: 'Get Started',
    ctaHref: 'https://github.com/0nork/0nMCP',
    accent: false,
  },
  {
    name: '0nCore Starter',
    price: '$80',
    period: '/mo',
    desc: 'Managed dashboard. CRM integration. AI assistant.',
    features: ['Everything in Free', 'Web dashboard', 'CRM integration', 'AI assistant', 'Slack integration', 'Email support'],
    cta: 'Request Early Access',
    ctaHref: '/signup',
    accent: true,
    badge: 'MOST POPULAR',
  },
  {
    name: '0nCore Pro',
    price: '$180',
    period: '/mo',
    desc: 'Voice AI. Course generator. Multi-location.',
    features: ['Everything in Starter', 'Voice AI agent', 'AI course generator', 'Multi-location CRM', 'Priority support', 'API access'],
    cta: 'Request Early Access',
    ctaHref: '/signup',
    accent: false,
  },
  {
    name: '0nCore Agency',
    price: '$380',
    period: '/mo',
    desc: 'White-label. Unlimited locations. Custom branding.',
    features: ['Everything in Pro', 'White-label branding', 'Unlimited locations', 'Domain customization', 'Affiliate program', 'Dedicated support'],
    cta: 'Contact Sales',
    ctaHref: 'mailto:mike@rocketopp.com',
    accent: false,
  },
]

export default function HomePage() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RocketOpp, LLC',
    url: 'https://www.0nmcp.com',
    logo: 'https://www.0nmcp.com/brand/0nmcp-logo.png',
    sameAs: [
      'https://github.com/0nork/0nMCP',
      'https://npmjs.com/package/0nmcp',
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <div className="homepage">

        {/* ── HERO ── */}
        <section className="hero-section">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-glow-secondary" aria-hidden="true" />

          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>v2.9 — {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services</span>
            </div>

            <h1 className="hero-title">
              One Brain.<br />
              <span className="hero-title-accent">Every Service.</span><br />
              Zero Limits.
            </h1>

            <p className="hero-subtitle">
              The universal AI API orchestrator. Connect <strong>55 services</strong> to <strong>any AI platform</strong> with one install.
              Claude, Gemini, Grok, Cursor — they all speak 0nMCP.
            </p>

            <div className="hero-ctas">
              <Link href="/signup" className="hero-cta-primary">
                Request Early Access
              </Link>
              <Link href="https://github.com/0nork/0nMCP" className="hero-cta-secondary" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                View on GitHub
              </Link>
            </div>

            {/* Install command */}
            <div className="hero-install">
              <code>npx 0nmcp@latest</code>
              <span className="hero-install-hint">Works with npm, pnpm, yarn, bun</span>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="stats-bar">
          <div className="stats-bar-inner">
            <div className="stat-item">
              <span className="stat-value">{STATS_DISPLAY.tools}</span>
              <span className="stat-label">Tools</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{STATS_DISPLAY.services}</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">7</span>
              <span className="stat-label">AI Platforms</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">5</span>
              <span className="stat-label">Patents</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">MIT</span>
              <span className="stat-label">Licensed</span>
            </div>
          </div>
        </section>

        {/* ── SERVICE LOGOS TICKER ── */}
        <section className="services-ticker">
          <div className="services-ticker-track">
            {[...services, ...services].map((s, i) => (
              <div key={i} className="service-chip">
                <span className="service-chip-dot" style={{ background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </section>

        {/* ── BEFORE / AFTER ── */}
        <section className="comparison-section section-container">
          <h2 className="section-label">The Problem</h2>

          <div className="before-after">
            <div className="before-card">
              <div className="before-after-header">
                <span className="before-after-icon">✗</span>
                <span className="before-after-title">Without 0nMCP</span>
              </div>
              <div className="before-after-body">
                <p>Configure Stripe MCP server for Claude...</p>
                <p>Configure Supabase MCP server for Gemini...</p>
                <p>Configure Slack MCP server for Cursor...</p>
                <p>Configure GitHub MCP server for VS Code...</p>
                <p className="before-after-calc">55 services × 7 AI platforms = <strong>385 configurations</strong></p>
                <p className="before-after-bottom">Different auth flows. Different formats. Different docs. For every single service.</p>
              </div>
            </div>

            <div className="after-card">
              <div className="before-after-header">
                <span className="before-after-icon after-icon">✓</span>
                <span className="before-after-title">With 0nMCP</span>
              </div>
              <div className="before-after-body">
                <div className="after-code">
                  <code>npx 0nmcp@latest</code>
                </div>
                <p className="after-result">Done. All 55 services. All 900+ tools. Any AI platform.</p>
                <p className="after-detail">One install. One config. Vault-encrypted credentials.</p>
                <p className="after-detail">Portable .0n files work on every machine.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="steps-section section-container">
          <h2 className="section-label">How It Works</h2>
          <p className="section-desc">Three commands. That&apos;s it.</p>

          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                <div className="step-code">
                  <code>{step.code}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="features-section section-container">
          <h2 className="section-label">Why 0nMCP</h2>
          <p className="section-desc">One orchestrator to rule them all.</p>

          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: `${f.color}15`, borderColor: `${f.color}30` }}>
                  <span>{f.icon}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="feature-accent-line" style={{ background: f.color }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="table-section section-container">
          <h2 className="section-label">0nMCP vs. Everything Else</h2>
          <p className="section-desc">Side-by-side. No spin.</p>

          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="compare-us">0nMCP</th>
                  <th className="compare-them">Others</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((c) => (
                  <tr key={c.feature}>
                    <td className="compare-feature">{c.feature}</td>
                    <td className="compare-us-val">{c.us}</td>
                    <td className="compare-them-val">
                      {c.them}
                      <span className="compare-them-note">{c.themLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="compare-cta">
            <Link href="/compare" className="btn-ghost">
              See detailed comparisons →
            </Link>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="pricing-section section-container">
          <h2 className="section-label">Pricing</h2>
          <p className="section-desc">Open source core. Managed platform for teams.</p>

          <div className="pricing-grid">
            {pricing.map((plan) => (
              <div key={plan.name} className={`pricing-card${plan.accent ? ' pricing-card-accent' : ''}`}>
                {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
                <h3 className="pricing-name">{plan.name}</h3>
                <div className="pricing-price">
                  <span className="pricing-amount">{plan.price}</span>
                  {plan.period !== 'forever' && <span className="pricing-period">{plan.period}</span>}
                </div>
                <p className="pricing-desc">{plan.desc}</p>
                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <span className="pricing-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaHref}
                  className={plan.accent ? 'pricing-cta-primary' : 'pricing-cta-secondary'}
                  {...(plan.ctaHref.startsWith('http') || plan.ctaHref.startsWith('mailto') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Affiliate CTA */}
          <div className="affiliate-banner">
            <div className="affiliate-content">
              <h3>Earn 30% Recurring Commission</h3>
              <p>Join the 0nMCP affiliate program. Refer customers, earn every month they stay.</p>
            </div>
            <Link href="/partners" className="affiliate-cta">
              Become an Affiliate →
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section section-container">
          <h2 className="section-label">FAQ</h2>
          <div className="faq-grid">
            {[
              { q: 'What is MCP?', a: 'Model Context Protocol — the open standard that lets AI assistants connect to external tools and data sources. 0nMCP is the largest MCP server available.' },
              { q: 'Which AI platforms work with 0nMCP?', a: 'Claude Desktop, Gemini CLI, Cursor, Windsurf, VS Code (Continue + Cline), and any MCP-compatible client. We auto-generate configs for all of them.' },
              { q: 'Is it really free?', a: 'Yes. The core MCP server is open source (MIT license) with 900+ tools. The managed 0nCore dashboard is a paid product for teams who want a web UI, CRM integration, and support.' },
              { q: 'How is this different from Zapier?', a: 'Zapier connects apps to apps. 0nMCP connects apps to AI. Your AI can directly call any API — no predefined triggers needed. Describe what you want in natural language.' },
              { q: 'Are my API keys secure?', a: 'Yes. Credentials are encrypted with AES-256-GCM, bound to your hardware fingerprint, and never leave your machine. Patent-pending 0nVault system.' },
              { q: 'Can I use my existing API keys?', a: 'Yes. Run `0nmcp engine import` and it auto-detects keys from .env files, CSV exports, or JSON configs. Maps them to all 55 services automatically.' },
            ].map((item) => (
              <details key={item.q} className="faq-item">
                <summary className="faq-question">{item.q}</summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="final-cta-section">
          <div className="final-cta-glow" aria-hidden="true" />
          <h2 className="final-cta-title">
            Stop configuring.<br />
            <span className="hero-title-accent">Start building.</span>
          </h2>
          <p className="final-cta-subtitle">
            One command. {STATS_DISPLAY.tools} tools. Every AI platform.
          </p>
          <div className="hero-ctas" style={{ justifyContent: 'center' }}>
            <Link href="/signup" className="hero-cta-primary">
              Request Early Access
            </Link>
            <Link href="https://github.com/0nork/0nMCP" className="hero-cta-secondary" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              Star on GitHub
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
