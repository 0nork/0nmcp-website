import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CRO9 — Self-Learning SEO Engine | 0n Network',
  description: 'AI-powered SEO optimization that learns and adapts. CRO9 pulls Search Console data, scores pages with adaptive weights, generates content briefs, and auto-adjusts strategy daily.',
  openGraph: {
    title: 'CRO9 — Self-Learning SEO Engine',
    description: 'AI-powered SEO optimization that learns and adapts. Automated daily analysis, content briefs, and self-adjusting strategy.',
    url: 'https://www.0nmcp.com/products/cro9',
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

const BUCKETS = [
  { name: 'CTR Fix', colorText: 'text-red-400', colorBg: 'bg-red-400/[0.03]', colorBorder: 'border-red-400/19', desc: 'Ranks well but nobody clicks. Rewrite title + meta.' },
  { name: 'Striking Distance', colorText: 'text-amber-400', colorBg: 'bg-amber-400/[0.03]', colorBorder: 'border-amber-400/19', desc: 'Position 4-15. Add depth to break into top 3.' },
  { name: 'Relevance Rebuild', colorText: 'text-pink-400', colorBg: 'bg-pink-400/[0.03]', colorBorder: 'border-pink-400/19', desc: 'Impressions but bad rank. Needs content restructure.' },
  { name: 'Local Boost', colorText: 'text-emerald-400', colorBg: 'bg-emerald-400/[0.03]', colorBorder: 'border-emerald-400/19', desc: 'Local intent detected. Strengthen geo signals.' },
  { name: 'Monitor', colorText: 'text-[#505880]', colorBg: 'bg-[#505880]/[0.03]', colorBorder: 'border-[#505880]/30', desc: 'Performing well. No action needed right now.' },
]

export default function CRO9Page() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 pb-16">
      {/* Hero */}
      <section className="store-hero">
        <div className="store-badge border-[rgba(0,188,212,0.3)] bg-[rgba(0,188,212,0.1)] text-[#00BCD4]">
          AI-Powered SEO
        </div>
        <h1 className="bg-gradient-to-br from-[#2C5282] to-[#00BCD4] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
          CRO9
        </h1>
        <p className="text-[1.4rem] font-semibold text-[#00BCD4] mb-2">
          Optimize Faster. Convert More.
        </p>
        <p className="store-subtitle">
          A self-learning SEO engine that pulls your Search Console data, scores every page,
          generates content briefs, and gets smarter every day — completely on autopilot.
        </p>
      </section>

      {/* Metrics Bar */}
      <section className="grid grid-cols-4 gap-4 max-w-[700px] mx-auto mb-12">
        {METRICS.map((m) => (
          <div key={m.label} className="text-center py-5 px-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
            <div className="text-2xl font-bold text-[#00BCD4]">{m.value}</div>
            <div className="text-[0.8rem] text-[var(--text-muted)] mt-1">{m.label}</div>
          </div>
        ))}
      </section>

      {/* Demo Preview */}
      <section className="store-preview mb-16">
        <div className="store-demo">
          <div className="bg-[var(--bg-primary)] rounded-xl p-4 font-mono text-[0.78rem] text-[#a0a8d0] leading-[1.9]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2C5282] to-[#00BCD4] flex items-center justify-center">
                <span className="text-xs text-[var(--text-primary)] font-bold">C9</span>
              </div>
              <span className="text-[#f0f0ff] font-semibold text-[0.85rem]">CRO9 Engine</span>
              <span className="ml-auto text-[0.7rem] text-[#505880]">6:00 AM</span>
            </div>
            <div className="text-[#00BCD4] mb-1">$ runDailyAnalysis()</div>
            <div className="text-[#505880] mb-0.5">  Fetched 247 pages from GSC</div>
            <div className="text-[#505880] mb-0.5">  Weights: imp=0.31 pos=0.24 ctr=0.27</div>
            <div className="text-[#505880] mb-2">  Generated 12 tasks</div>
            <div className="text-amber-400 mb-1">{'>'} STRIKING_DISTANCE: /blog/seo-guide</div>
            <div className="text-[#505880] mb-0.5">  Position: 6.2 → Target: Top 3</div>
            <div className="text-[#505880] mb-0.5">  Action: EXPAND_DEPTH_AND_AUTHORITY</div>
            <div className="text-[#505880] mb-2">  Brief: +2 H2s, 2800 words, 0.8% density</div>
            <div className="text-red-400 mb-1">{'>'} CTR_FIX: /services/pricing</div>
            <div className="text-[#505880] mb-0.5">  CTR: 1.8% | Expected: 5.0% | Gap: 64%</div>
            <div className="text-[#505880] mb-0.5">  Action: REWRITE_META_AND_INTRO</div>
            <div className="text-emerald-400 mt-2">Learning: 3 improvements, 0 regressions</div>
            <div className="text-emerald-400">Weights auto-adjusted ✓</div>
          </div>
        </div>

        <div className="store-info">
          <h2 className="text-[var(--text-primary)] mb-4">SEO That Thinks For Itself</h2>
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
      <section className="mb-16">
        <h2 className="text-center text-[1.8rem] font-bold text-[var(--text-primary)] mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl flex gap-4 items-start">
              <div className="w-10 h-10 rounded-[10px] bg-[linear-gradient(135deg,rgba(44,82,130,0.2),rgba(0,188,212,0.2))] border border-[rgba(0,188,212,0.3)] flex items-center justify-center font-bold text-[#00BCD4] text-[0.85rem] shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-semibold text-[var(--text-primary)] mb-1">{item.title}</div>
                <div className="text-[0.85rem] text-[var(--text-secondary)] leading-[1.6]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="store-capabilities mb-16">
        <h3 className="mb-6">Engine Capabilities</h3>
        <div className="store-cap-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="store-cap-item flex-col items-start gap-2">
              <span className="text-[#00BCD4] font-semibold text-[0.95rem]">{f.title}</span>
              <span className="text-[0.8rem] leading-[1.5]">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bucket Explainer */}
      <section className="mb-16 p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <h3 className="mb-6 text-[var(--text-primary)]">The 5 Action Buckets</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {BUCKETS.map((b) => (
            <div key={b.name} className={`p-4 ${b.colorBg} border ${b.colorBorder} rounded-[10px]`}>
              <div className={`font-semibold ${b.colorText} mb-1.5 text-[0.95rem]`}>{b.name}</div>
              <div className="text-[0.8rem] text-[var(--text-secondary)] leading-[1.5]">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="text-center text-[1.8rem] font-bold text-[var(--text-primary)] mb-2">
          Pricing
        </h2>
        <p className="text-center text-[var(--text-secondary)] max-w-[500px] mx-auto mb-8">
          Start with a one-time setup, or let CRO9 run your SEO on autopilot.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl relative ${plan.highlight ? 'bg-[rgba(0,188,212,0.05)] border border-[rgba(0,188,212,0.3)]' : 'bg-[var(--bg-card)] border border-[var(--border)]'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#2C5282] to-[#00BCD4] rounded-full text-[0.75rem] font-semibold text-[var(--text-primary)]">
                  Most Popular
                </div>
              )}
              <div className="text-[1.1rem] font-semibold text-[var(--text-primary)] mb-1">
                {plan.name}
              </div>
              <div className="text-[0.85rem] text-[var(--text-muted)] mb-4">
                {plan.desc}
              </div>
              <div className="mb-6">
                <span className="text-[2.5rem] font-bold text-[#00BCD4]">{plan.price}</span>
                <span className="text-[var(--text-muted)] text-[0.9rem]">{plan.period}</span>
              </div>
              <ul className="list-none p-0 m-0 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="py-1.5 text-[0.85rem] text-[var(--text-secondary)] flex items-center gap-2.5">
                    <span className="text-[#00BCD4] text-[0.7rem]">&#9679;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.name === 'Done-For-You' ? '/partners' : '/console?view=store'}
                className={`store-cta block text-center ${plan.highlight ? 'bg-gradient-to-r from-[#2C5282] to-[#00BCD4] border-0 text-white' : 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)]'}`}
              >
                {plan.name === 'Setup' ? 'Get Started' : plan.name === 'Pro' ? 'Start Pro' : 'Contact Us'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack / Trust */}
      <section className="text-center p-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl mb-12">
        <h3 className="text-[var(--text-primary)] mb-4">Built on the 0n Network</h3>
        <p className="text-[var(--text-secondary)] max-w-[600px] mx-auto mb-6 text-[0.9rem] leading-[1.7]">
          CRO9 is powered by the same AI orchestration infrastructure behind 0nMCP.
          Your data flows through Google&apos;s APIs, processed by adaptive algorithms,
          and delivered to a live Google Sheet — no black boxes, full transparency.
        </p>
        <div className="flex gap-8 justify-center flex-wrap text-[var(--text-muted)] text-[0.85rem]">
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
      <section className="text-center py-8">
        <h2 className="text-[1.6rem] font-bold bg-gradient-to-br from-[#2C5282] to-[#00BCD4] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mb-4">
          Stop guessing. Start optimizing.
        </h2>
        <p className="text-[var(--text-secondary)] max-w-[500px] mx-auto mb-6">
          Most SEO tools tell you what&apos;s wrong. CRO9 tells you exactly what to do — and learns from the results.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup" className="store-cta max-w-[240px] bg-gradient-to-r from-[#2C5282] to-[#00BCD4]">
            Get CRO9 Setup — $199
          </Link>
          <Link href="/" className="store-cta secondary max-w-[240px]">
            Back to 0nMCP
          </Link>
        </div>
      </section>
    </div>
  )
}
