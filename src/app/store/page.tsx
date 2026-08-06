import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

/* ─── Product Data ─── */

type Product = {
  id: string
  name: string
  price: string
  period: string
  desc: string
  features: string[]
  accent: boolean
  badge?: string
  tag?: string
}

const products: Product[] = [
  {
    id: 'starter',
    name: '0nCore Starter',
    price: '$80',
    period: '/mo',
    desc: 'Managed dashboard with CRM integration, AI assistant, and Slack notifications. Perfect for solo operators.',
    features: [
      'All 1,598+ tools & 106 services',
      'Web dashboard',
      'CRM integration (245 tools)',
      'AI assistant',
      'Slack integration',
      'Email support',
    ],
    accent: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 'pro',
    name: '0nCore Pro',
    price: '$180',
    period: '/mo',
    desc: 'Voice AI agent, AI course generator, and multi-location CRM. For growing teams that need more power.',
    features: [
      'Everything in Starter',
      'Voice AI agent',
      'AI course generator',
      'Multi-location CRM',
      'Priority support',
      'Full API access',
    ],
    accent: false,
  },
  {
    id: 'agency',
    name: '0nCore Agency',
    price: '$380',
    period: '/mo',
    desc: 'White-label branding, unlimited locations, and a dedicated support channel. Built for agencies.',
    features: [
      'Everything in Pro',
      'White-label branding',
      'Unlimited locations',
      'Domain customization',
      'Affiliate program (30%)',
      'Dedicated support',
    ],
    accent: false,
  },
  {
    id: 'agent-bundle',
    name: 'AI Agent Bundle',
    price: '$199',
    period: 'one-time',
    desc: 'All 8 pre-built AI agents: Sales, Support, Onboarding, Social, Analytics, Content, Scheduler, and Admin.',
    features: [
      '8 pre-built AI agents',
      'Sales & lead qualification',
      'Customer support automation',
      'Social media management',
      'Content generation engine',
      'Scheduling & calendar AI',
      'Analytics & reporting',
      'Admin & provisioning',
    ],
    accent: false,
    tag: 'BUNDLE',
  },
]

/* ─── Component ─── */

export default function StorePage() {
  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '70vh', paddingTop: '8rem' }}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-glow-secondary" aria-hidden="true" />

        <div className="hero-content" style={{ maxWidth: '820px' }}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Live now · v4.10</span>
          </div>

          <h1 className="hero-title" style={{ marginBottom: '2rem' }}>
            0nMCP<br />
            <span className="hero-title-accent">Get instant access</span>
          </h1>

          <p className="hero-subtitle" style={{ maxWidth: '620px', marginBottom: '1rem' }}>
            <strong>{STATS_DISPLAY.tools} tools</strong> across <strong>{STATS_DISPLAY.services} services</strong>.
            Live now. Free tier. Pick a plan or start building today.
          </p>

          {/* Trust Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: 9999,
            background: 'rgba(110, 224, 90, 0.08)',
            border: '1px solid rgba(110, 224, 90, 0.2)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#6EE05A',
            marginBottom: '1rem',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            100% refundable if you change your mind before launch
          </div>
        </div>
      </section>

      {/* Stats Bar */}
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
            <span className="stat-value">BSL-1.1</span>
            <span className="stat-label">Licensed</span>
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section id="pricing" className="pricing-section section-container">
        <h2 className="section-label">Choose Your Plan</h2>
        <p className="section-desc">Open source core is always free. Managed platform for teams who want more.</p>

        <div className="pricing-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', maxWidth: 1200 }}>
          {products.map((plan) => (
            <div key={plan.id} className={`pricing-card${plan.accent ? ' pricing-card-accent' : ''}`} style={{ position: 'relative' }}>
              {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
              {plan.tag && !plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '1rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 9999,
                  background: 'rgba(96, 165, 250, 0.15)',
                  color: '#60A5FA',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>
                  {plan.tag}
                </div>
              )}
              <h3 className="pricing-name">{plan.name}</h3>
              <div className="pricing-price">
                <span className="pricing-amount">{plan.price}</span>
                {plan.period !== 'one-time' && <span className="pricing-period">{plan.period}</span>}
                {plan.period === 'one-time' && <span className="pricing-period" style={{ color: 'var(--text-muted)' }}>one-time</span>}
              </div>
              <p className="pricing-desc">{plan.desc}</p>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <span className="pricing-check">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={plan.accent ? 'pricing-cta-primary' : 'pricing-cta-secondary'}
              >
                Pre-Order {plan.period === 'one-time' ? `for ${plan.price}` : 'Now'}
              </Link>
            </div>
          ))}
        </div>

        {/* Refund Trust Badge */}
        <div style={{
          maxWidth: 600,
          margin: '3rem auto 0',
          textAlign: 'center',
          padding: '1.5rem 2rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          borderRadius: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>30-Day Money-Back Guarantee</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Not happy? Cancel within 30 days for a <strong style={{ color: 'var(--text-primary)' }}>full refund</strong>. No questions asked.
            Your payment info is secured by Stripe.
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="features-section section-container">
        <h2 className="section-label">What You Get</h2>
        <p className="section-desc">Every plan includes the full power of 0nMCP.</p>

        <div className="features-grid">
          {[
            { title: `${STATS_DISPLAY.tools} Tools, One Install`, desc: 'Stripe, CRM, Slack, GitHub, Supabase, and 50 more services. All from a single MCP server.', color: '#6EE05A', icon: 'Z' },
            { title: 'Patent-Pending Security', desc: 'AES-256-GCM vault, hardware fingerprint binding, Argon2id double encryption. 5 patents filed.', color: '#a78bfa', icon: 'S' },
            { title: 'Every AI Platform', desc: 'Claude, Gemini, Grok, Cursor, Windsurf, VS Code. Auto-generates configs for 7+ platforms.', color: '#00d4ff', icon: 'A' },
            { title: 'Portable .0n Files', desc: 'Your workflows, credentials, and configs travel with you. One file format, any machine.', color: '#fbbf24', icon: 'P' },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: `${f.color}15`, borderColor: `${f.color}30` }}>
                <span style={{ color: f.color, fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{f.icon}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-accent-line" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta-section">
        <div className="final-cta-glow" aria-hidden="true" />
        <h2 className="final-cta-title">
          Not ready to<br />
          <span className="hero-title-accent">commit yet?</span>
        </h2>
        <p className="final-cta-subtitle">
          The open source core is always free. Sign up to start using it today.
        </p>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="hero-cta-primary">
            Start free
          </Link>
          <Link href="https://0ncore.com" className="hero-cta-secondary" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
            Star on GitHub
          </Link>
        </div>
      </section>
    </div>
  )
}
