import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'web0n — Your Business Website, Built in Days',
  description: 'Professional 5-page business website with CRM, booking, SEO, and mobile-responsive design. $1,997 all-in. Built by real humans, powered by AI.',
  openGraph: {
    title: 'web0n — Your Business Website, Built in Days',
    description: 'Professional 5-page business website with CRM, booking, SEO, and mobile-responsive design. $1,997 all-in.',
    url: 'https://web0n.com',
  },
  other: {
    'script:ld+json': JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'web0n Professional Website',
        description: '5-page professional business website with CRM integration, online booking, contact forms, and SEO optimization.',
        brand: { '@type': 'Brand', name: 'web0n' },
        offers: {
          '@type': 'Offer',
          price: '1997',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How long does it take to build my website?',
            acceptedAnswer: { '@type': 'Answer', text: 'Most websites are live within 5-7 business days after we receive your deposit and business info.' },
          },
          {
            '@type': 'Question',
            name: 'What pages are included?',
            acceptedAnswer: { '@type': 'Answer', text: 'Every web0n site includes 5 pages: Home, Services, Contact, Booking, and Pricing.' },
          },
          {
            '@type': 'Question',
            name: 'How do payments work?',
            acceptedAnswer: { '@type': 'Answer', text: '50% deposit ($998.50) to start, 50% before launch. Invoices sent directly — no credit card forms.' },
          },
          {
            '@type': 'Question',
            name: 'Can I make changes after the site is built?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes — you get 2 rounds of revisions included. Submit revision requests through your client portal.' },
          },
          {
            '@type': 'Question',
            name: 'Do I get a CRM with my website?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes — every web0n site includes a starter-tier CRM sub-account with contact management, booking, and forms.' },
          },
          {
            '@type': 'Question',
            name: 'Will my site be mobile-friendly?',
            acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Every web0n site is fully responsive and tested on mobile, tablet, and desktop.' },
          },
        ],
      },
    ]),
  },
}

const PAGES = [
  { name: 'Home', desc: 'Hero section, about preview, testimonials, and calls-to-action' },
  { name: 'Services', desc: 'Full breakdown of what you offer with descriptions and pricing tiers' },
  { name: 'Contact', desc: 'Contact form, Google Maps embed, phone, email, and hours' },
  { name: 'Booking', desc: 'Online scheduling integrated with your CRM calendar' },
  { name: 'Pricing', desc: 'Clear pricing packages or service menu for your customers' },
]

const STEPS = [
  { num: '01', title: 'Tell Us About Your Business', desc: 'Search your business, auto-fill your info, upload your logo, and pick your colors.' },
  { num: '02', title: 'We Build It', desc: 'Our team builds your 5-page site with CRM integration, booking, and SEO — all reviewed by a human.' },
  { num: '03', title: 'You Launch', desc: 'Review your site, request tweaks, pay the balance, and go live. Your CRM is ready to capture leads.' },
]

const FAQS = [
  { q: 'How long does it take to build my website?', a: 'Most websites are live within 5-7 business days after we receive your deposit and business info.' },
  { q: 'What pages are included?', a: 'Every web0n site includes 5 pages: Home, Services, Contact, Booking, and Pricing. Need more? We can discuss add-ons.' },
  { q: 'How do payments work?', a: '50% deposit ($998.50) to start, 50% before launch. Invoices sent directly — no credit card forms needed.' },
  { q: 'Can I make changes after the site is built?', a: 'Yes — you get 2 rounds of revisions included. Submit revision requests through your client portal.' },
  { q: 'Do I get a CRM with my website?', a: 'Yes — every web0n site includes a starter-tier CRM sub-account with contact management, booking calendar, and lead capture forms.' },
  { q: 'Will my site be mobile-friendly?', a: 'Absolutely. Every web0n site is fully responsive and tested across mobile, tablet, and desktop.' },
]

export default function Web0nLanding() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 0 4rem' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          background: 'rgba(255, 107, 53, 0.1)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          fontSize: '0.8rem',
          color: '#ff6b35',
          fontWeight: 500,
          marginBottom: '1.5rem',
        }}>
          Powered by 0nMCP
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          fontFamily: 'var(--font-display)',
        }}>
          Your Business Website.<br />
          <span style={{ color: '#ff6b35' }}>Built in Days, Not Months.</span>
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: 600,
          margin: '0 auto 2rem',
          lineHeight: 1.6,
        }}>
          Professional 5-page website with CRM, booking, and SEO. Human-reviewed, AI-powered. One flat price — no surprises.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/onboard"
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
            }}
          >
            Get Started — $1,997
          </Link>
          <a
            href="#how-it-works"
            style={{
              padding: '0.85rem 2rem',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontWeight: 500,
              fontSize: '1rem',
              textDecoration: 'none',
              background: 'transparent',
            }}
          >
            How It Works
          </a>
        </div>
      </section>

      {/* What You Get */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          What You Get
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          5 professionally designed pages — everything your business needs to look great and capture leads.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {PAGES.map((page) => (
            <div
              key={page.name}
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ff6b35' }}>
                {page.name}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {page.desc}
              </p>
            </div>
          ))}
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            background: 'rgba(255, 107, 53, 0.05)',
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ff6b35' }}>
              + CRM Sub-Account
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Starter-tier CRM with contact management, booking calendar, forms, and pipeline tracking.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '3rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          How It Works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {STEPS.map((step) => (
            <div key={step.num} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#fff',
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          Simple Pricing
        </h2>
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          background: 'var(--bg-card)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: '#ff6b35', marginBottom: '0.25rem' }}>
            $1,997
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            One-time — no monthly fees for the build
          </p>
          <div style={{
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(255, 107, 53, 0.05)',
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
            listStyle: 'none',
            padding: 0,
            margin: '0 0 1.5rem',
            textAlign: 'left',
            fontSize: '0.9rem',
            lineHeight: 2,
          }}>
            {[
              '5 professionally designed pages',
              'Mobile-responsive design',
              'SEO-optimized content',
              'Contact form + Google Maps',
              'Online booking integration',
              'CRM sub-account (starter tier)',
              '2 rounds of revisions',
              'Live within 5-7 days',
            ].map((item) => (
              <li key={item} style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#ff6b35', marginRight: '0.5rem' }}>&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/onboard"
            style={{
              display: 'block',
              padding: '0.85rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}
            >
              <summary style={{
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                listStyle: 'none',
              }}>
                {faq.q}
              </summary>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{ padding: '4rem 0 5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Ready to Launch Your Website?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
          Tell us about your business. We&apos;ll handle the rest.
        </p>
        <Link
          href="/onboard"
          style={{
            padding: '0.85rem 2.5rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.1rem',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
          }}
        >
          Get Started — $1,997
        </Link>
      </section>
    </div>
  )
}
