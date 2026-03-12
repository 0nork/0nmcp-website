import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import WebFactory from '@/components/web0n/WebFactory'

export const metadata: Metadata = {
  title: 'web0n — Professional Business Websites Built in 5-7 Days | $1,997 Flat Rate',
  description:
    'Get a stunning 5-page business website with CRM, online booking, contact forms, SEO, and mobile-responsive design. Human-built, AI-powered. Live in 5-7 business days. $1,997 flat — no monthly fees for the build.',
  keywords: [
    'web0n', 'business website', 'professional website', 'website design service',
    'small business website', 'affordable web design', 'website in days',
    'CRM website', 'booking website', 'SEO website', 'mobile responsive website',
    'flat rate web design', 'quick website builder', 'website with CRM',
    'local business website', 'website design', 'web development service',
  ],
  alternates: {
    canonical: 'https://web0n.com',
  },
  openGraph: {
    title: 'web0n — Professional Business Websites Built in 5-7 Days',
    description:
      'Stunning 5-page website with CRM, booking, and SEO. $1,997 flat rate. Human-built, AI-powered. Live in days, not months.',
    url: 'https://web0n.com',
    siteName: 'web0n',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/brand/web0n-logo.png', width: 600, height: 200, alt: 'web0n — Professional websites built in days' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'web0n — Professional Business Websites in Days',
    description: '5-page website with CRM + booking + SEO. $1,997 flat. No monthly fees.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1 },
  },
}

const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'web0n',
    url: 'https://web0n.com',
    logo: 'https://web0n.com/brand/web0n-logo.png',
    description: 'Professional business websites built in days, not months.',
    parentOrganization: { '@type': 'Organization', name: 'RocketOpp LLC', url: 'https://rocketopp.com' },
    sameAs: ['https://0nmcp.com'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'web0n Professional Website Building Service',
    provider: { '@type': 'Organization', name: 'web0n', url: 'https://web0n.com' },
    serviceType: 'Website Design and Development',
    description: 'Professional 5-page business website with CRM integration, online booking, contact forms, SEO optimization, and mobile-responsive design. Delivered in 5-7 business days.',
    areaServed: { '@type': 'Country', name: 'United States' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'web0n Website Packages',
      itemListElement: [{
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'web0n 5-Page Professional Website' },
        price: '1997',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      }],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'web0n Professional Website Package',
    description: '5-page professional business website with CRM integration, online booking, contact forms, Google Maps, SEO optimization, and mobile-responsive design.',
    brand: { '@type': 'Brand', name: 'web0n' },
    image: 'https://web0n.com/brand/web0n-logo.png',
    offers: {
      '@type': 'Offer',
      price: '1997',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2027-12-31',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Get a Professional Website from web0n',
    description: 'Get your professional business website live in 3 simple steps.',
    totalTime: 'P7D',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '1997' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Tell Us About Your Business', text: 'Search your business on Google, auto-fill your information, upload your logo, and choose your brand colors. Takes about 5 minutes.' },
      { '@type': 'HowToStep', position: 2, name: 'We Build Your Website', text: 'Our team designs and builds your 5-page website with CRM integration, booking system, contact forms, and SEO optimization. Every site is reviewed by a real human.' },
      { '@type': 'HowToStep', position: 3, name: 'You Launch', text: 'Review your site, request tweaks (2 rounds included), pay the remaining balance, and go live. Your CRM is immediately ready to capture leads.' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How long does it take to build a web0n website?', acceptedAnswer: { '@type': 'Answer', text: 'Most web0n websites are live within 5-7 business days after we receive your deposit and business information. Complex customizations may take slightly longer.' } },
      { '@type': 'Question', name: 'What pages are included in a web0n website?', acceptedAnswer: { '@type': 'Answer', text: 'Every web0n website includes 5 professionally designed pages: Home, Services, Contact, Booking, and Pricing. Each page is mobile-responsive and SEO-optimized.' } },
      { '@type': 'Question', name: 'How do web0n payments work?', acceptedAnswer: { '@type': 'Answer', text: 'web0n uses a simple 50/50 payment structure. You pay a $998.50 deposit to start, and the remaining $998.50 before launch. Invoices are sent directly — no credit card forms needed.' } },
      { '@type': 'Question', name: 'Can I make changes after my web0n site is built?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — every web0n website includes 2 rounds of revisions. You can submit revision requests through your client portal and track their progress.' } },
      { '@type': 'Question', name: 'Do I get a CRM with my web0n website?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — every web0n website includes a starter-tier CRM sub-account with contact management, booking calendar, lead capture forms, and pipeline tracking at no extra cost.' } },
      { '@type': 'Question', name: 'Are web0n websites mobile-friendly?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Every web0n website is fully responsive and tested across mobile phones, tablets, and desktop computers to ensure a perfect experience on every device.' } },
      { '@type': 'Question', name: 'What is included in the $1,997 price?', acceptedAnswer: { '@type': 'Answer', text: 'The $1,997 flat rate includes 5 professionally designed pages, mobile-responsive design, SEO optimization, contact forms, Google Maps integration, online booking, a CRM sub-account, and 2 rounds of revisions. No hidden fees.' } },
      { '@type': 'Question', name: 'Do I need to provide my own hosting?', acceptedAnswer: { '@type': 'Answer', text: 'No. Your web0n website is hosted and maintained as part of the service. You do not need to purchase separate hosting or worry about server management.' } },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'web0n', item: 'https://web0n.com' }],
  },
]

const PAGES = [
  { name: 'Home Page', desc: 'Eye-catching hero section, about your business, customer testimonials, and clear calls-to-action that convert visitors into leads.' },
  { name: 'Services Page', desc: 'Complete breakdown of everything you offer with descriptions, pricing tiers, and benefit-focused copy that sells.' },
  { name: 'Contact Page', desc: 'Professional contact form connected to your CRM, embedded Google Maps, phone number, email, and business hours.' },
  { name: 'Booking Page', desc: 'Online scheduling integrated directly with your CRM calendar — customers book appointments without calling.' },
  { name: 'Pricing Page', desc: 'Clear, organized pricing packages or service menus that help customers understand your value instantly.' },
]

const STEPS = [
  { num: '01', title: 'Tell Us About Your Business', desc: 'Search for your business on Google to auto-fill your info. Upload your logo, pick your brand colors, and list your services. Takes about 5 minutes.' },
  { num: '02', title: 'We Build Your Website', desc: 'Our team designs your 5-page site with CRM integration, booking, forms, and SEO. Every site is reviewed and polished by a real human before you see it.' },
  { num: '03', title: 'You Review & Launch', desc: 'Preview your site, request tweaks (2 rounds included), pay the balance, and go live. Your CRM starts capturing leads immediately.' },
]

const FEATURES = [
  { title: 'Live in 5-7 Days', desc: 'Not weeks. Not months. Your professional website is live within one business week.' },
  { title: 'Human-Reviewed', desc: 'Every site is built with AI assistance and reviewed by a real person for quality and accuracy.' },
  { title: 'CRM Included', desc: 'Starter-tier CRM with contact management, booking, forms, and pipeline tracking at no extra cost.' },
  { title: 'SEO-Optimized', desc: 'Built-in search engine optimization so customers can find you on Google from day one.' },
  { title: 'Mobile-First', desc: 'Responsive design tested on phones, tablets, and desktops. Perfect on every screen.' },
  { title: 'No Hidden Fees', desc: '$1,997 flat rate covers everything. No surprise charges, no monthly build fees.' },
]

const FAQS = [
  { q: 'How long does it take to build my website?', a: 'Most websites are live within 5-7 business days after we receive your deposit and business information. Complex customizations may take slightly longer, but we\'ll communicate timelines clearly.' },
  { q: 'What pages are included?', a: 'Every web0n site includes 5 professionally designed pages: Home, Services, Contact, Booking, and Pricing. Need additional pages? We can discuss add-ons during your onboarding.' },
  { q: 'How do payments work?', a: '50% deposit ($998.50) to start, 50% before launch. Invoices are sent directly to your email — no credit card forms or payment portals needed. Simple and secure.' },
  { q: 'Can I make changes after the site is built?', a: 'Yes — you get 2 rounds of revisions included in the price. Submit revision requests through your client portal and track their progress in real-time.' },
  { q: 'Do I get a CRM with my website?', a: 'Yes — every web0n website includes a starter-tier CRM sub-account with contact management, booking calendar, lead capture forms, and pipeline tracking. No additional cost.' },
  { q: 'Will my site be mobile-friendly?', a: 'Absolutely. Every web0n website is fully responsive and tested across mobile phones, tablets, and desktop computers. We don\'t ship anything that doesn\'t look great on every device.' },
  { q: 'What is included in the $1,997 price?', a: 'Everything: 5 pages, mobile-responsive design, SEO optimization, contact forms, Google Maps, online booking integration, CRM sub-account, 2 rounds of revisions, and hosting. Zero hidden fees.' },
  { q: 'Do I need to provide hosting or a domain?', a: 'Hosting is included. If you already have a domain, we\'ll connect it. If not, we can help you purchase one (domain registration cost is separate, typically $10-15/year).' },
]

export default function Web0nLanding() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      <article itemScope itemType="https://schema.org/WebPage" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ========== HERO ========== */}
        <header style={{ textAlign: 'center', padding: '4rem 0 0' }}>
          <Image
            src="/brand/web0n-logo.png"
            alt="web0n — Professional websites built in days"
            width={280}
            height={90}
            priority
            style={{ margin: '0 auto 1.5rem', display: 'block' }}
          />

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-display)',
          }}>
            Your Business Website.{' '}
            <span style={{ color: '#7ed957' }}>Built in Days, Not Months.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: 640,
            margin: '0 auto 2rem',
            lineHeight: 1.65,
          }}>
            Professional 5-page website with CRM, online booking, and SEO.
            Human-reviewed. AI-powered. One flat price&nbsp;&mdash;&nbsp;no surprises.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <Link
              href="/onboard"
              style={{
                padding: '0.9rem 2.25rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                color: '#0a0a0f',
                fontWeight: 700,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(126, 217, 87, 0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              Get Started &mdash; $1,997
            </Link>
            <a
              href="#how-it-works"
              style={{
                padding: '0.9rem 2.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                fontSize: '1.05rem',
                textDecoration: 'none',
                background: 'transparent',
              }}
            >
              See How It Works
            </a>
          </div>
        </header>

        {/* ========== WEB FACTORY ANIMATION ========== */}
        <WebFactory />

        {/* ========== TRUST SIGNALS ========== */}
        <section aria-label="Key features at a glance" style={{
          display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap',
          padding: '2.5rem 0', textAlign: 'center',
        }}>
          {[
            ['5-7 Days', 'To go live'],
            ['5 Pages', 'Professionally designed'],
            ['CRM Included', 'At no extra cost'],
            ['$1,997', 'Flat — no monthly fees'],
          ].map(([title, sub]) => (
            <div key={title}>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#7ed957' }}>{title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>
            </div>
          ))}
        </section>

        {/* ========== WHY WEB0N ========== */}
        <section aria-labelledby="why-heading" style={{ padding: '2.5rem 0' }}>
          <h2 id="why-heading" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Why Businesses Choose <span style={{ color: '#7ed957' }}>web0n</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            We combine AI efficiency with human quality control to deliver professional websites faster than anyone else.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem', color: '#7ed957' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== WHAT YOU GET ========== */}
        <section aria-labelledby="pages-heading" style={{ padding: '2.5rem 0' }}>
          <h2 id="pages-heading" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Everything Your Business Needs Online
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            5 professionally designed pages plus a CRM sub-account &mdash; everything to look great and capture leads from day one.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {PAGES.map((page) => (
              <div key={page.name} style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: '#7ed957' }}>
                  {page.name}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {page.desc}
                </p>
              </div>
            ))}
            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(126, 217, 87, 0.3)',
              background: 'rgba(126, 217, 87, 0.04)',
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: '#7ed957' }}>
                + CRM Sub-Account
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Starter-tier CRM with contact management, booking calendar, lead capture forms, and pipeline tracking &mdash; included at no extra cost.
              </p>
            </div>
          </div>
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section id="how-it-works" aria-labelledby="how-heading" style={{ padding: '2.5rem 0' }}>
          <h2 id="how-heading" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            Three Simple Steps to Your New Website
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {STEPS.map((step) => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontWeight: 800, fontSize: '1.1rem', color: '#0a0a0f',
                  fontFamily: 'var(--font-display)',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== PRICING ========== */}
        <section aria-labelledby="pricing-heading" style={{ padding: '2.5rem 0' }}>
          <h2 id="pricing-heading" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            Simple, Transparent Pricing
          </h2>
          <div style={{
            maxWidth: 500, margin: '0 auto', padding: '2.5rem 2rem',
            borderRadius: '16px',
            border: '1px solid rgba(126, 217, 87, 0.3)',
            background: 'var(--bg-card)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3.25rem', fontWeight: 800, color: '#7ed957', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
              $1,997
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              One-time flat rate &mdash; no monthly fees for the build
            </p>
            <div style={{
              padding: '1rem', borderRadius: '10px',
              background: 'rgba(126, 217, 87, 0.05)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>50% Deposit to Start</span>
                <span style={{ fontWeight: 600 }}>$998.50</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>50% Before Launch</span>
                <span style={{ fontWeight: 600 }}>$998.50</span>
              </div>
            </div>
            <ul style={{
              listStyle: 'none', padding: 0, margin: '0 0 1.5rem',
              textAlign: 'left', fontSize: '0.9rem', lineHeight: 2.1,
            }}>
              {[
                '5 professionally designed pages',
                'Mobile-responsive design',
                'SEO-optimized content',
                'Contact form + Google Maps',
                'Online booking integration',
                'CRM sub-account (starter tier)',
                '2 rounds of revisions',
                'Live within 5-7 business days',
                'Hosting included',
              ].map((item) => (
                <li key={item} style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#7ed957', marginRight: '0.5rem', fontWeight: 700 }}>&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/onboard"
              style={{
                display: 'block', padding: '0.9rem', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                color: '#0a0a0f', fontWeight: 700, fontSize: '1.05rem',
                textDecoration: 'none', textAlign: 'center',
              }}
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* ========== FAQ ========== */}
        <section aria-labelledby="faq-heading" style={{ padding: '2.5rem 0' }}>
          <h2 id="faq-heading" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                }}
              >
                <summary style={{
                  fontWeight: 600, cursor: 'pointer',
                  fontSize: '1rem', listStyle: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  {faq.q}
                  <span style={{ color: '#7ed957', fontSize: '1.2rem', marginLeft: '0.75rem', flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ========== FINAL CTA ========== */}
        <section aria-label="Get started" style={{ padding: '4rem 0 5rem', textAlign: 'center' }}>
          <Image
            src="/brand/web0n-icon.jpg"
            alt="web0n"
            width={56}
            height={56}
            style={{ borderRadius: 14, margin: '0 auto 1.25rem', display: 'block' }}
          />
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Ready to Launch Your Website?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Tell us about your business. We&apos;ll handle the design, the code, the CRM, and the SEO. You just show up and launch.
          </p>
          <Link
            href="/onboard"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2.75rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
              color: '#0a0a0f',
              fontWeight: 700,
              fontSize: '1.1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(126, 217, 87, 0.3)',
            }}
          >
            Get Started &mdash; $1,997
          </Link>
        </section>
      </article>
    </>
  )
}
