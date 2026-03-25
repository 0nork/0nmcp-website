import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'WordPress Plugins by 0nCore | SXO Content Engine + AI Tools',
  description: 'The WordPress plugin ecosystem built with 0n technology. SXO scoring, AI content generation, CRM integration, conversion tracking, and page builder modules. Free core plugin + premium add-ons.',
  openGraph: {
    title: 'WordPress Plugins by 0nCore',
    description: 'SXO scoring, AI content, CRM integration — the WordPress ecosystem that actually ranks.',
    url: 'https://www.0nmcp.com/wordpress',
  },
}

const CORE_FEATURES = [
  { icon: '📊', name: 'SXO Scoring', desc: 'Every post scored 0-100 across 8 dimensions. Know exactly what to fix.' },
  { icon: '📡', name: 'CRM Integration', desc: 'Forms auto-submit to your CRM with UTM tracking. Every lead attributed.' },
  { icon: '🎯', name: 'Meta Pixel + GA4', desc: 'Sitewide tracking injected automatically. Zero code required.' },
  { icon: '🔗', name: 'REST API Bridge', desc: 'Full WordPress control from Claude Code. Pages, posts, media, menus.' },
  { icon: '🏗️', name: 'Canvas Template', desc: 'One checkbox — bypass your theme. Pure SXO content on a clean canvas.' },
  { icon: '🏷️', name: 'Schema.org', desc: 'LocalBusiness, DaySpa, Article — auto-injected based on your settings.' },
]

const PLUGINS = [
  {
    name: '0nCore',
    tagline: 'The Hub — Free Forever',
    price: 'Free',
    color: '#22c55e',
    features: ['SXO Scoring (8 dimensions)', 'CRM Webhook Integration', 'Meta Pixel + GA4 Tracking', 'UTM Capture → Attribution', 'Schema.org Auto-Inject', 'Canvas Template Override', 'REST API Bridge', 'JWT Auto-Setup', 'License System', 'Auto-Updates'],
    cta: 'Download Free',
    href: 'https://github.com/Crypto-Goatz/0ncore-wp/releases/latest',
    badge: 'FREE',
  },
  {
    name: 'WP-SXO',
    tagline: 'AI Content That Ranks',
    price: 'From $49/yr',
    color: '#3b82f6',
    features: ['Everything in 0nCore', 'Detailed SXO Recommendations', 'Step-by-Step Fix Guides', 'CRO9 Conversion Tracking', 'AI Content Writer (Max)', 'AI Page Optimizer (Max)', 'Claude Skill (100+ prompts)', 'BB + Elementor Output', 'Self-Improving Content Loop', 'Priority Support'],
    cta: 'Get WP-SXO',
    href: '/wordpress/wpsxo',
    badge: 'POPULAR',
    popular: true,
  },
  {
    name: 'Add-ons',
    tagline: 'Extend Everything',
    price: 'From $0',
    color: '#a855f7',
    features: ['Beaver Builder Modules (Free)', 'Elementor Widgets (Free)', 'Day Spa Pack ($29/yr)', 'CRO9 Tracking ($49/yr)', 'Radial Burst ($29/yr)', 'Ad Machine ($49/yr)', 'White Label ($99/yr)', 'Industry Packs', 'More coming monthly'],
    cta: 'Browse Add-ons',
    href: '/wordpress/addons',
    badge: 'ECOSYSTEM',
  },
]

const COMPARISON = [
  { feature: 'SXO Content Scoring', oncore: true, yoast: false, rankmath: false, openclaw: false },
  { feature: 'AI Content Generation', oncore: true, yoast: false, rankmath: false, openclaw: true },
  { feature: 'CRM Integration', oncore: true, yoast: false, rankmath: false, openclaw: false },
  { feature: 'Meta Pixel + GA4 Tracking', oncore: true, yoast: false, rankmath: false, openclaw: false },
  { feature: 'CRO9 Conversion Tracking', oncore: true, yoast: false, rankmath: false, openclaw: false },
  { feature: 'Page Builder Modules', oncore: true, yoast: false, rankmath: false, openclaw: false },
  { feature: 'Claude Desktop Integration', oncore: true, yoast: false, rankmath: false, openclaw: false },
  { feature: 'REST API for AI Control', oncore: true, yoast: false, rankmath: true, openclaw: true },
  { feature: 'Schema.org Auto-Inject', oncore: true, yoast: true, rankmath: true, openclaw: false },
  { feature: 'Keyword Optimization', oncore: true, yoast: true, rankmath: true, openclaw: true },
  { feature: 'Free Tier', oncore: true, yoast: true, rankmath: true, openclaw: true },
  { feature: 'Self-Improving Content', oncore: true, yoast: false, rankmath: false, openclaw: false },
]

export default function WordPressPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 0 60px' }}>
        <div style={{ display: 'inline-block', background: 'var(--accent-dim, rgba(126,217,87,0.1))', border: '1px solid rgba(126,217,87,0.2)', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, color: 'var(--accent, #7ed957)', marginBottom: 20, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
          Built with 0n Technology
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
          WordPress Plugins<br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent, #7ed957), #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>That Actually Rank</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
          SXO scoring, AI content generation, CRM integration, conversion tracking, and page builder modules — one ecosystem, infinite power.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="https://github.com/Crypto-Goatz/0ncore-wp/releases/latest" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: 'var(--accent, #7ed957)', color: '#0B0F19', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            Download 0nCore — Free
          </a>
          <Link href="/wordpress/wpsxo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', color: 'var(--text-primary)' }}>
            See WP-SXO Demo →
          </Link>
        </div>
      </section>

      {/* Core Features */}
      <section style={{ padding: '40px 0 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>What 0nCore Does (Free)</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>Install one plugin. Get all of this. Forever free.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {CORE_FEATURES.map(f => (
            <div key={f.name} className="module-card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--text-primary)' }}>{f.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plugin Cards */}
      <section style={{ padding: '40px 0 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>The Ecosystem</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>Start free. Scale when ready. Every plugin works together.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {PLUGINS.map(p => (
            <div key={p.name} className="module-card" style={{ padding: 24, position: 'relative', border: p.popular ? `2px solid ${p.color}` : undefined }}>
              {p.badge && (
                <div style={{ position: 'absolute', top: -10, right: 16, background: p.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.05em' }}>{p.badge}</div>
              )}
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{p.tagline}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: p.color, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>{p.price}</div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: p.color, fontSize: 12, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href={p.href} style={{ display: 'block', textAlign: 'center', padding: '12px 20px', background: p.popular ? p.color : 'transparent', color: p.popular ? '#fff' : 'var(--text-primary)', border: p.popular ? 'none' : '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '40px 0 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>0nCore vs. The Competition</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>Other SEO plugins optimize keywords. 0nCore optimizes the entire experience.</p>
        <div className="module-card" style={{ overflow: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: 700 }}>Feature</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontWeight: 700, color: '#22c55e' }}>0nCore</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>Yoast</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>RankMath</th>
                <th style={{ textAlign: 'center', padding: '14px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>OpenClaw</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500 }}>{row.feature}</td>
                  <td style={{ textAlign: 'center', padding: '10px 12px', color: row.oncore ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{row.oncore ? '✓' : '✕'}</td>
                  <td style={{ textAlign: 'center', padding: '10px 12px', color: row.yoast ? '#22c55e' : '#ef4444' }}>{row.yoast ? '✓' : '✕'}</td>
                  <td style={{ textAlign: 'center', padding: '10px 12px', color: row.rankmath ? '#22c55e' : '#ef4444' }}>{row.rankmath ? '✓' : '✕'}</td>
                  <td style={{ textAlign: 'center', padding: '10px 12px', color: row.openclaw ? '#22c55e' : '#ef4444' }}>{row.openclaw ? '✓' : '✕'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="module-card" style={{ background: 'linear-gradient(135deg, #0B0F19, #1a1d2e)', padding: '48px 32px', textAlign: 'center', border: 'none' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            Start Building With <span style={{ color: 'var(--accent, #7ed957)' }}>0nCore</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto 28px' }}>
            Free forever. No credit card. Install in 30 seconds. Your WordPress site has never been this powerful.
          </p>
          <a href="https://github.com/Crypto-Goatz/0ncore-wp/releases/latest" style={{ display: 'inline-flex', padding: '16px 36px', background: 'var(--accent, #7ed957)', color: '#0B0F19', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>
            Download 0nCore — Free
          </a>
        </div>
      </section>
    </div>
  )
}
