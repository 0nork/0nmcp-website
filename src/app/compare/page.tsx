import type { Metadata } from 'next'
import Link from 'next/link'
import comparisonsData from '@/data/comparisons.json'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: '0nMCP vs Alternatives — Compare AI Orchestration Platforms',
  description: 'Compare 0nMCP against Zapier, Make, n8n, Power Automate, OpenClaw, and 8 more platforms. Feature-by-feature breakdowns, pricing, and honest assessments.',
  openGraph: {
    title: '0nMCP vs Alternatives — Why Teams Switch',
    description: `${comparisonsData.comparisons.length} head-to-head comparisons. ${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. Free and open source.`,
    url: 'https://www.0nmcp.com/compare',
  },
  alternates: { canonical: 'https://www.0nmcp.com/compare' },
}

// Color coding for competitor categories
const COMP_COLORS: Record<string, string> = {
  'Zapier': '#ff4a00',
  'Make': '#6d00cc',
  'n8n': '#ea4b71',
  'Power Automate': '#0066ff',
  'IFTTT': '#33ccff',
  'Pipedream': '#22c55e',
  'Activepieces': '#6366f1',
  'Workato': '#e11d48',
  'Tray.io': '#8b5cf6',
  'Windmill': '#06b6d4',
  'LangChain': '#1c3d5a',
  'Relay.app': '#f59e0b',
  'OpenClaw': '#ef4444',
}

export default function ComparePage() {
  const comparisons = comparisonsData.comparisons

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.0nmcp.com/compare' },
    ],
  }

  return (
    <div className="homepage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '55vh', paddingTop: '7rem' }}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>{comparisons.length} head-to-head comparisons</span>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)' }}>
            0nMCP vs<br />
            <span className="hero-title-accent">Everything Else</span>
          </h1>

          <p className="hero-subtitle">
            Honest, detailed comparisons against every major automation and orchestration platform.
            See exactly where 0nMCP wins — and where the others still have an edge.
          </p>
        </div>
      </section>

      {/* Stats */}
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
            <span className="stat-value">$0</span>
            <span className="stat-label">Local Use</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">MIT</span>
            <span className="stat-label">Licensed</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">7+</span>
            <span className="stat-label">AI Platforms</span>
          </div>
        </div>
      </section>

      {/* Quick Wins Summary */}
      <section className="section-container" style={{ padding: '4rem 1.5rem 2rem' }}>
        <h2 className="section-label">Why Teams Switch</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: 900, margin: '0 auto' }}>
          {[
            { stat: '900+', label: 'tools in one install', sub: 'vs 1-50 per platform' },
            { stat: '55', label: 'services included', sub: 'vs configure each separately' },
            { stat: 'AI-native', label: 'describe, don\'t build', sub: 'vs drag-and-drop builders' },
            { stat: 'Local-first', label: 'your machine, your data', sub: 'vs cloud-only SaaS' },
          ].map((item) => (
            <div key={item.label} className="step-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{item.stat}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Cards */}
      <section className="section-container" style={{ padding: '3rem 1.5rem 5rem' }}>
        <h2 className="section-label">Detailed Comparisons</h2>
        <p className="section-desc">Pick your current tool. See how 0nMCP stacks up.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', maxWidth: 1000, margin: '0 auto' }}>
          {comparisons.map((comp) => {
            const color = COMP_COLORS[comp.competitor] || '#6EE05A'
            return (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden',
                  transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                }}
                className="compare-card-hover"
              >
                {/* Accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.6 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                      0nMCP vs {comp.competitor}
                    </h2>
                    <p style={{ fontSize: '0.75rem', color, margin: 0, fontWeight: 600 }}>{comp.tagline}</p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.625rem', borderRadius: 9999, fontSize: '0.625rem', fontWeight: 700,
                    background: `${color}15`, color, fontFamily: 'var(--font-mono)', flexShrink: 0,
                  }}>
                    {comp.key_differences.length} diffs
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                  {comp.description.slice(0, 140)}...
                </p>

                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  {comp.pricing_compare.slice(0, 100)}...
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
                    Read comparison →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="table-section section-container">
        <h2 className="section-label">At a Glance</h2>
        <p className="section-desc">0nMCP vs the field</p>

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th className="compare-us">0nMCP</th>
                <th className="compare-them">Typical Alternative</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dim: 'Total tools', us: '900+', them: '10-50 per platform' },
                { dim: 'Services included', us: '55 built-in', them: '1 per MCP server' },
                { dim: 'AI integration', us: 'Native — describe workflows', them: 'Drag-and-drop builder' },
                { dim: 'CRM tools', us: '245 tools (12 modules)', them: '0 (separate integration)' },
                { dim: 'Security', us: 'AES-256 vault, local-first', them: 'Cloud-stored API keys' },
                { dim: 'Portability', us: '.0n files work everywhere', them: 'Platform lock-in' },
                { dim: 'Pricing', us: 'Free (MIT) / $80/mo managed', them: '$20-500+/mo' },
                { dim: 'AI platforms', us: 'Claude, Gemini, Grok, Cursor, 7+', them: '1 platform usually' },
              ].map((row) => (
                <tr key={row.dim}>
                  <td className="compare-feature">{row.dim}</td>
                  <td className="compare-us-val">{row.us}</td>
                  <td className="compare-them-val">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta-section">
        <div className="final-cta-glow" aria-hidden="true" />
        <h2 className="final-cta-title">
          Ready to<br />
          <span className="hero-title-accent">switch?</span>
        </h2>
        <p className="final-cta-subtitle">
          One npm install. {STATS_DISPLAY.tools} tools. Free and open source.
        </p>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="hero-cta-primary">
            Start Free — No Credit Card
          </Link>
          <Link href="/integrations" className="hero-cta-secondary">
            Browse {STATS_DISPLAY.services} Integrations
          </Link>
        </div>
      </section>
    </div>
  )
}
