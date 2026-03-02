import type { Metadata } from 'next'
import Link from 'next/link'
import securityData from '@/data/security.json'
import { STATS } from '@/data/stats'

export const metadata: Metadata = {
  title: '0nVault Security System — Patent-Pending Encrypted AI Orchestration',
  description: '0nVault: 7 semantic layers, AES-256-GCM encryption, Ed25519 signatures, SHA3-256 integrity seals, multi-party escrow, and secure transfer. Patent-pending technology for AI orchestration security.',
  openGraph: {
    title: '0nVault Security System — Patent-Pending Encrypted AI Orchestration',
    description: 'Military-grade encryption for AI orchestration. 7 semantic layers, multi-party escrow, tamper-proof seals, and secure transfer in a single .0nv container.',
    url: 'https://0nmcp.com/security',
  },
  alternates: { canonical: 'https://0nmcp.com/security' },
}

const subPages = [
  { href: '/security/vault', title: '0nVault Container', desc: 'The .0nv binary container format' },
  { href: '/security/layers', title: '7 Semantic Layers', desc: 'Independent encryption per layer' },
  { href: '/security/escrow', title: 'Multi-Party Escrow', desc: 'X25519 ECDH key agreement' },
  { href: '/security/seal-of-truth', title: 'Seal of Truth', desc: 'SHA3-256 integrity verification' },
  { href: '/security/transfer', title: 'Secure Transfer', desc: 'Replay prevention & chain of custody' },
  { href: '/security/patent', title: 'Patent-Pending', desc: 'Application #63/990,046' },
]

export default function SecurityPage() {
  const { overview } = securityData

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: '0nVault',
    description: overview.description,
    url: 'https://0nmcp.com/security',
    brand: { '@type': 'Organization', name: '0nMCP' },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Included with 0nMCP (MIT licensed). Patent-pending technology.',
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: overview.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Security', item: 'https://0nmcp.com/security' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Security</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          {overview.title}
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>{overview.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {overview.description}
        </p>

        {/* Key stats */}
        <div className="grid grid-cols-4 gap-3 mb-10">
          {overview.stats.map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Core Security Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {overview.features.map((feature) => (
              <div key={feature.title} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sub-page navigation */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Explore the Security System</h2>
          <div className="grid gap-3">
            {subPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="rounded-xl p-5 no-underline transition-all group"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                      {page.title}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{page.desc}</p>
                  </div>
                  <span className="text-lg" style={{ color: 'var(--accent)' }}>&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Patent notice */}
        <div className="rounded-xl p-5 mb-10" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>Patent-Pending Technology</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            US Patent Application #63/990,046 | Filed February 24, 2026 | Inventor: Michael A Mento Jr.
            <br />
            Prior Patent: #63/968,814 (Seal of Truth, December 2025)
          </p>
        </div>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {overview.faq.map((f, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.q}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
          <p className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Secure your AI orchestration stack</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{STATS.tools} tools. {STATS.services} services. Military-grade encryption.</p>
          <Link
            href="/turn-it-on"
            className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm no-underline"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            Get Started Free
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Back to 0nMCP
          </Link>
        </div>
      </div>
    </div>
  )
}
