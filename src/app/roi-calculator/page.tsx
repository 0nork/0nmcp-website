import type { Metadata } from 'next'
import ROICalculator from '@/components/ROICalculator'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: 'ROI Calculator — How Much Can Your Agency Save? | 0nMCP',
  description: 'Calculate your agency automation ROI in 60 seconds. See how much time and money you save by automating client onboarding, reporting, lead follow-up, social media, email campaigns, and billing.',
  keywords: ['ROI calculator', 'automation ROI', 'agency automation', 'AI automation cost savings', '0nMCP', 'workflow automation'],
  openGraph: {
    title: 'ROI Calculator — How Much Can Your Agency Save?',
    description: 'Input your numbers, see your savings instantly. Most agencies save $4,000+ per month.',
    url: 'https://www.0nmcp.com/roi-calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agency ROI Calculator | 0nMCP',
    description: 'Calculate how much time and money your agency wastes on manual tasks.',
  },
  alternates: { canonical: 'https://www.0nmcp.com/roi-calculator' },
}

const FAQ_ITEMS = [
  {
    question: 'How much does agency automation save?',
    answer: 'The average 15-client agency spends $4,000+ per month on manual operations that can be fully automated. This includes client onboarding, reporting, lead follow-up, social media, email campaigns, and invoicing.',
  },
  {
    question: 'What is the ROI payback period for 0nMCP?',
    answer: '0nMCP has a free tier with 20 executions per month — so your payback period is instant. For agencies with higher volume, the metered plan costs $0.01 per execution, meaning you start saving from day one.',
  },
  {
    question: 'What tasks can 0nMCP automate?',
    answer: `0nMCP orchestrates ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services including CRM, Stripe, email platforms, social media, databases, and more. Any repetitive multi-step task — from lead nurture sequences to invoice generation — can be automated.`,
  },
  {
    question: 'Is 0nMCP free for agencies?',
    answer: '0nMCP is open source and free to install. The free tier includes 20 workflow executions per month. For higher volume, the metered plan charges $0.01 per execution with no monthly commitment.',
  },
]

export default function ROICalculatorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: '0nMCP ROI Calculator',
        description: 'Free tool to calculate agency automation ROI and time savings.',
        url: 'https://www.0nmcp.com/roi-calculator',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
          { '@type': 'ListItem', position: 2, name: 'ROI Calculator', item: 'https://www.0nmcp.com/roi-calculator' },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="section-elevated" style={{ padding: '4rem 1.5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <nav className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
            <span className="mx-2">/</span>
            <span style={{ color: 'var(--text-secondary)' }}>ROI Calculator</span>
          </nav>

          <div className="section-accent-line" />
          <span className="section-label">Free Tool</span>
          <h1
            className="heading-glow"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}
          >
            How Much Is Manual Work<br />
            <span style={{ color: 'var(--accent)' }}>Costing Your Agency?</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '36rem', margin: '0 auto' }}>
            Drag the sliders. Watch the numbers. The average agency wastes <strong style={{ color: '#ff4444' }}>$4,000+/month</strong> on tasks that take <strong style={{ color: 'var(--accent)' }}>0nMCP 3 seconds</strong> to automate.
          </p>
        </div>
      </section>

      {/* Interactive Calculator */}
      <ROICalculator />
    </>
  )
}
