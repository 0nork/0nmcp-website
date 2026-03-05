import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CRO9 — Self-Learning SEO Engine | 0n Network',
  description: 'AI-powered SEO optimization that learns and adapts. CRO9 pulls Search Console data, scores pages with adaptive weights, generates content briefs, and auto-adjusts strategy daily.',
  openGraph: {
    title: 'CRO9 — Self-Learning SEO Engine',
    description: 'AI-powered SEO optimization that learns and adapts. Automated daily analysis, content briefs, and self-adjusting strategy.',
    url: 'https://0nmcp.com/products/cro9',
    siteName: '0nMCP',
  },
  keywords: ['SEO automation', 'CRO9', 'search console optimization', 'AI SEO', 'content briefs', 'SEO engine', 'conversion optimization'],
}

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect', desc: 'Add our service account to your Google Search Console. Takes 30 seconds.' },
  { step: '02', title: 'Analyze', desc: 'CRO9 pulls every page, query, click, and position from your Search Console data.' },
  { step: '03', title: 'Score', desc: 'Pages are scored using 5 adaptive weights: impressions, position, CTR gap, conversions, and freshness.' },
  { step: '04', title: 'Classify', desc: 'Each page gets bucketed: CTR Fix, Striking Distance, Relevance Rebuild, Local Boost, or Monitor.' },
  { step: '05', title: 'Brief', desc: 'AI generates word-count specs, keyword density targets, H2 counts, schema recommendations, and priority actions.' },
  { step: '06', title: 'Learn', desc: 'CRO9 compares past actions to current results and auto-adjusts scoring weights. It gets smarter every day.' },
]

const FEATURES = [
  { title: 'Self-Learning Weights', desc: 'Scoring factors auto-adjust based on what actually moves the needle for your site.' },
  { title: 'CTR Gap Detection', desc: 'Finds pages ranking well but underperforming on clicks vs expected CTR curve.' },
  { title: 'Content Brief Generator', desc: 'Word counts, keyword density, H2 frequency, reading level — all calculated per page type.' },
  { title: 'Bucket Classification', desc: 'Pages sorted into CTR Fix, Striking Distance, Relevance Rebuild, Local Boost, or Monitor.' },
  { title: 'Daily Auto-Analysis', desc: 'Runs at 6 AM every day. Fresh tasks and briefs waiting when you start work.' },
  { title: 'Schema Stack Recommendations', desc: 'Suggests Organization, FAQPage, Article, LocalBusiness, and more based on page type.' },
  { title: 'Google Sheets Dashboard', desc: 'All data in a live spreadsheet: tasks, briefs, history, weights, and raw Search Console data.' },
  { title: 'Keyword Engineering', desc: 'Primary/secondary keyword targets with exact placement rules and density ranges.' },
]

const PRICING = [
  {
    name: 'Setup',
    price: '$199',
    period: 'one-time',
    highlight: false,
    desc: 'Get CRO9 running on your site',
    features: [
      'Search Console verification',
      'GA4 property + data stream',
      'Tag Manager container setup',
      'CRO9 engine deployed',
      'Daily trigger configured',
      'First analysis run + review',
    ],
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/mo',
    highlight: true,
    desc: 'AI-powered optimization on autopilot',
    features: [
      'Everything in Setup',
      'Daily automated analysis',
      'AI-generated content briefs',
      'Weekly performance reports (emailed)',
      'Adaptive weight tuning',
      'Priority support',
      'Up to 500 pages tracked',
    ],
  },
  {
    name: 'Done-For-You',
    price: '$499',
    period: '/mo',
    highlight: false,
    desc: 'We execute the optimizations for you',
    features: [
      'Everything in Pro',
      'We implement the content briefs',
      'Title tag + meta description rewrites',
      'Schema markup implementation',
      'Monthly strategy call',
      'Unlimited pages',
      'Dedicated account manager',
    ],
  },
]

const METRICS = [
  { value: '6 AM', label: 'Daily auto-run' },
  { value: '5', label: 'Adaptive weights' },
  { value: '500+', label: 'Pages per analysis' },
  { value: '14d', label: 'Learning cycle' },
]

export default function CRO9Page() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      {/* Hero */}
      <section className="store-hero">
        <div className="store-badge" style={{
          borderColor: 'rgba(0, 188, 212, 0.3)',
          background: 'rgba(0, 188, 212, 0.1)',
          color: '#00BCD4',
        }}>
          AI-Powered SEO
        </div>
        <h1 style={{
          background: 'linear-gradient(135deg, #2C5282, #00BCD4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          CRO9
        </h1>
        <p style={{
          fontSize: '1.4rem',
          fontWeight: 600,
          color: '#00BCD4',
          marginBottom: '0.5rem',
        }}>
          Optimize Faster. Convert More.
        </p>
        <p className="store-subtitle">
          A self-learning SEO engine that pulls your Search Console data, scores every page,
          generates content briefs, and gets smarter every day — completely on autopilot.
        </p>
      </section>

      {/* Metrics Bar */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        maxWidth: 700,
        margin: '0 auto 3rem',
      }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{
            textAlign: 'center',
            padding: '1.25rem 0.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00BCD4' }}>{m.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </section>

      {/* Demo Preview */}
      <section className="store-preview" style={{ marginBottom: '4rem' }}>
        <div className="store-demo">
          <div style={{
            background: '#08081a',
            borderRadius: 12,
            padding: '1rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.78rem',
            color: '#a0a8d0',
            lineHeight: 1.9,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #2C5282, #00BCD4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>C9</span>
              </div>
              <span style={{ color: '#f0f0ff', fontWeight: 600, fontSize: '0.85rem' }}>CRO9 Engine</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#505880' }}>6:00 AM</span>
            </div>
            <div style={{ color: '#00BCD4', marginBottom: 4 }}>$ runDailyAnalysis()</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  Fetched 247 pages from GSC</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  Weights: imp=0.31 pos=0.24 ctr=0.27</div>
            <div style={{ color: '#505880', marginBottom: 8 }}>  Generated 12 tasks</div>
            <div style={{ color: '#fbbf24', marginBottom: 4 }}>{'>'} STRIKING_DISTANCE: /blog/seo-guide</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  Position: 6.2 → Target: Top 3</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  Action: EXPAND_DEPTH_AND_AUTHORITY</div>
            <div style={{ color: '#505880', marginBottom: 8 }}>  Brief: +2 H2s, 2800 words, 0.8% density</div>
            <div style={{ color: '#f87171', marginBottom: 4 }}>{'>'} CTR_FIX: /services/pricing</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  CTR: 1.8% | Expected: 5.0% | Gap: 64%</div>
            <div style={{ color: '#505880', marginBottom: 2 }}>  Action: REWRITE_META_AND_INTRO</div>
            <div style={{ color: '#34d399', marginTop: 8 }}>Learning: 3 improvements, 0 regressions</div>
            <div style={{ color: '#34d399' }}>Weights auto-adjusted ✓</div>
          </div>
        </div>

        <div className="store-info">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>SEO That Thinks For Itself</h2>
          <ul className="store-features">
            <li>Pulls Search Console data daily — clicks, impressions, CTR, position</li>
            <li>Scores every page using 5 weighted factors that self-adjust</li>
            <li>Classifies pages into action buckets with specific fix instructions</li>
            <li>Generates content briefs with word counts, keyword targets, and schema stack</li>
            <li>Compares past actions to current results — learns what works</li>
            <li>Outputs everything to a Google Sheet dashboard</li>
            <li>Zero manual configuration after setup</li>
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2rem' }}>
          How It Works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} style={{
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(44, 82, 130, 0.2), rgba(0, 188, 212, 0.2))',
                border: '1px solid rgba(0, 188, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#00BCD4',
                fontSize: '0.85rem',
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="store-capabilities" style={{ marginBottom: '4rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Engine Capabilities</h3>
        <div className="store-cap-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="store-cap-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: '#00BCD4', fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</span>
              <span style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bucket Explainer */}
      <section style={{
        marginBottom: '4rem',
        padding: '2rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>The 5 Action Buckets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'CTR Fix', color: '#f87171', desc: 'Ranks well but nobody clicks. Rewrite title + meta.' },
            { name: 'Striking Distance', color: '#fbbf24', desc: 'Position 4-15. Add depth to break into top 3.' },
            { name: 'Relevance Rebuild', color: '#f472b6', desc: 'Impressions but bad rank. Needs content restructure.' },
            { name: 'Local Boost', color: '#34d399', desc: 'Local intent detected. Strengthen geo signals.' },
            { name: 'Monitor', color: '#505880', desc: 'Performing well. No action needed right now.' },
          ].map((b) => (
            <div key={b.name} style={{
              padding: '1rem',
              background: `${b.color}08`,
              border: `1px solid ${b.color}30`,
              borderRadius: 10,
            }}>
              <div style={{ fontWeight: 600, color: b.color, marginBottom: 6, fontSize: '0.95rem' }}>{b.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Pricing
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
          Start with a one-time setup, or let CRO9 run your SEO on autopilot.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {PRICING.map((plan) => (
            <div key={plan.name} style={{
              padding: '2rem',
              background: plan.highlight ? 'rgba(0, 188, 212, 0.05)' : 'var(--bg-card)',
              border: `1px solid ${plan.highlight ? 'rgba(0, 188, 212, 0.3)' : 'var(--border)'}`,
              borderRadius: 16,
              position: 'relative',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 16px',
                  background: 'linear-gradient(135deg, #2C5282, #00BCD4)',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#fff',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {plan.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {plan.desc}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00BCD4' }}>{plan.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                {plan.features.map((f) => (
                  <li key={f} style={{
                    padding: '0.4rem 0',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}>
                    <span style={{ color: '#00BCD4', fontSize: '0.7rem' }}>&#9679;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="store-cta"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: plan.highlight
                    ? 'linear-gradient(135deg, #2C5282, #00BCD4)'
                    : 'transparent',
                  border: plan.highlight ? 'none' : '1px solid var(--border)',
                  color: plan.highlight ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {plan.name === 'Setup' ? 'Get Started' : plan.name === 'Pro' ? 'Start Pro' : 'Contact Us'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack / Trust */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        marginBottom: '3rem',
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Built on the 0n Network</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 1.5rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
          CRO9 is powered by the same AI orchestration infrastructure behind 0nMCP.
          Your data flows through Google&apos;s APIs, processed by adaptive algorithms,
          and delivered to a live Google Sheet — no black boxes, full transparency.
        </p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>Google Search Console API</span>
          <span>&#183;</span>
          <span>Google Analytics</span>
          <span>&#183;</span>
          <span>Google Sheets</span>
          <span>&#183;</span>
          <span>0nMCP Orchestrator</span>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #2C5282, #00BCD4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
        }}>
          Stop guessing. Start optimizing.
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
          Most SEO tools tell you what&apos;s wrong. CRO9 tells you exactly what to do — and learns from the results.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="store-cta" style={{ maxWidth: 240, background: 'linear-gradient(135deg, #2C5282, #00BCD4)' }}>
            Get CRO9 Setup — $199
          </Link>
          <Link href="/" className="store-cta secondary" style={{ maxWidth: 240 }}>
            Back to 0nMCP
          </Link>
        </div>
      </section>
    </div>
  )
}
