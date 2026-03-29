import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Affiliate Program — 0nMCP | Earn 30% Recurring Commission',
  description: 'Join the 0nMCP affiliate program. Earn 30% recurring commission on every customer you refer. No cap. Paid monthly. Join free.',
  openGraph: {
    title: 'Earn 30% Recurring — 0nMCP Affiliate Program',
    description: 'Refer customers to 0nMCP and earn 30% of every payment, every month, forever. No caps. No limits.',
  },
}

const tiers = [
  {
    name: 'Standard',
    rate: '30%',
    requirement: 'Sign up',
    perks: ['30% recurring commission', 'Unique referral link', 'Real-time dashboard', '90-day cookie window', 'Monthly payouts'],
  },
  {
    name: 'Gold',
    rate: '35%',
    requirement: '10+ conversions',
    perks: ['35% recurring commission', 'Priority support', 'Co-marketing opportunities', 'Custom landing pages', 'Everything in Standard'],
    accent: true,
  },
  {
    name: 'Platinum',
    rate: '40%',
    requirement: '50+ conversions',
    perks: ['40% recurring commission', 'Dedicated account manager', 'Revenue share on service referrals', 'White-label materials', 'Everything in Gold'],
  },
]

const steps = [
  { num: '1', title: 'Sign up free', desc: 'Create your 0nMCP account. Your unique referral link is generated automatically.' },
  { num: '2', title: 'Share your link', desc: 'Share on social media, blog posts, YouTube, newsletters, or direct to clients. 90-day attribution cookie.' },
  { num: '3', title: 'Earn forever', desc: 'When someone signs up through your link and subscribes, you earn 30%+ of every payment. Monthly. Forever.' },
]

const earnings = [
  { plan: 'Starter ($80/mo)', monthly: '$24', annual: '$288' },
  { plan: 'Pro ($180/mo)', monthly: '$54', annual: '$648' },
  { plan: 'Agency ($380/mo)', monthly: '$114', annual: '$1,368' },
]

const faqs = [
  { q: 'How much can I earn?', a: 'There is no cap. You earn 30-40% of every payment your referrals make, every month, for as long as they remain a customer. Ten Agency referrals = $1,140/month passive income.' },
  { q: 'When do I get paid?', a: 'Commissions are calculated monthly and paid out via Stripe transfer on the 1st of each month. Minimum payout is $50.' },
  { q: 'How long does the cookie last?', a: '90 days. If someone clicks your link today and signs up within 90 days, you get credit — even if they close the browser and come back later.' },
  { q: 'Can I refer myself?', a: 'No. Self-referrals are detected and voided. The program is for genuine referrals to other people and businesses.' },
  { q: 'Do I need to be a customer?', a: 'You need a free 0nMCP account. You do not need to be on a paid plan to refer others.' },
  { q: 'What counts as a conversion?', a: 'When your referral signs up for a paid 0nCore plan (Starter, Pro, or Agency) and makes their first payment.' },
  { q: 'Is the commission truly recurring?', a: 'Yes. As long as your referral remains a paying customer, you earn commission on every single payment. Cancel = commission stops for that customer.' },
  { q: 'Can I promote on paid ads?', a: 'Yes, but you cannot bid on branded terms ("0nMCP", "0nCore"). All other advertising is encouraged.' },
]

export default function AffiliatesPage() {
  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '70vh' }}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Affiliate Program — Now Open</span>
          </div>

          <h1 className="hero-title">
            Earn <span className="hero-title-accent">30% Recurring</span><br />
            On Every Referral.
          </h1>

          <p className="hero-subtitle">
            Refer businesses to 0nMCP. Earn <strong>30% of every payment</strong>, every month, for the life of the customer.
            No caps. No limits. Paid monthly via Stripe.
          </p>

          <div className="hero-ctas">
            <Link href="/signup" className="hero-cta-primary">
              Join the Affiliate Program — Free
            </Link>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <span className="stat-value">30-40%</span>
            <span className="stat-label">Commission</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">90 days</span>
            <span className="stat-label">Cookie Window</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">Recurring</span>
            <span className="stat-label">Forever</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">Monthly</span>
            <span className="stat-label">Payouts</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">No Cap</span>
            <span className="stat-label">Earnings</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="steps-section section-container">
        <h2 className="section-label">How It Works</h2>
        <p className="section-desc">Three steps. Zero complexity.</p>

        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Earnings Table */}
      <section className="table-section section-container">
        <h2 className="section-label">Earnings Calculator</h2>
        <p className="section-desc">Per referral. No cap on total referrals.</p>

        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Plan Referred</th>
                <th className="compare-us">Your Monthly Earnings</th>
                <th>Annual (per referral)</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e) => (
                <tr key={e.plan}>
                  <td className="compare-feature">{e.plan}</td>
                  <td className="compare-us-val">{e.monthly}/mo</td>
                  <td style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{e.annual}/yr</td>
                </tr>
              ))}
              <tr>
                <td className="compare-feature" style={{ fontWeight: 700 }}>10 Agency referrals</td>
                <td className="compare-us-val" style={{ fontSize: '1.125rem' }}>$1,140/mo</td>
                <td style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.125rem' }}>$13,680/yr</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Tiers */}
      <section className="pricing-section section-container">
        <h2 className="section-label">Commission Tiers</h2>
        <p className="section-desc">Earn more as you grow.</p>

        <div className="pricing-grid" style={{ maxWidth: '900px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {tiers.map((tier) => (
            <div key={tier.name} className={`pricing-card${tier.accent ? ' pricing-card-accent' : ''}`}>
              {tier.accent && <div className="pricing-badge">RECOMMENDED</div>}
              <h3 className="pricing-name">{tier.name}</h3>
              <div className="pricing-price">
                <span className="pricing-amount">{tier.rate}</span>
                <span className="pricing-period">recurring</span>
              </div>
              <p className="pricing-desc">{tier.requirement}</p>
              <ul className="pricing-features">
                {tier.perks.map((p) => (
                  <li key={p}>
                    <span className="pricing-check">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section section-container">
        <h2 className="section-label">Affiliate FAQ</h2>
        <div className="faq-grid">
          {faqs.map((item) => (
            <details key={item.q} className="faq-item">
              <summary className="faq-question">{item.q}</summary>
              <p className="faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="final-cta-glow" aria-hidden="true" />
        <h2 className="final-cta-title">
          Start earning<br />
          <span className="hero-title-accent">today.</span>
        </h2>
        <p className="final-cta-subtitle">
          Sign up free. Get your link. Share it. Get paid every month.
        </p>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="hero-cta-primary">
            Join the Affiliate Program
          </Link>
        </div>
      </section>
    </div>
  )
}
