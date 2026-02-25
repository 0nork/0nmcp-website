import type { Metadata } from 'next'
import Link from 'next/link'
import securityData from '@/data/security.json'

export const metadata: Metadata = {
  title: 'Patent-Pending Technology — US Application #63/990,046',
  description: 'US Patent Application #63/990,046: Encrypted Semantic Container System for AI Orchestration. Filed February 24, 2026 by Michael A Mento Jr. Prior patent #63/968,814 (Seal of Truth).',
  openGraph: {
    title: 'Patent-Pending Technology — US Application #63/990,046',
    description: 'Pioneering the future of secure AI orchestration with patent-pending encrypted container technology.',
    url: 'https://0nmcp.com/security/patent',
  },
  alternates: { canonical: 'https://0nmcp.com/security/patent' },
}

export default function PatentPage() {
  const { patent } = securityData.pages

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Security', item: 'https://0nmcp.com/security' },
      { '@type': 'ListItem', position: 3, name: 'Patent', item: 'https://0nmcp.com/security/patent' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/security" className="hover:underline">Security</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Patent</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          {patent.title}
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>{patent.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {patent.description}
        </p>

        {/* Current patent */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Current Patent Application</h2>
          <div className="rounded-xl p-6" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--accent)' }}>
                {patent.current_patent.status}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{patent.current_patent.number}</span>
            </div>
            <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {patent.current_patent.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Filed: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{patent.current_patent.filed}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Inventor: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{patent.current_patent.inventor}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assignee: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{patent.current_patent.assignee}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Application #: </span>
                <span style={{ color: 'var(--accent)' }}>{patent.current_patent.number}</span>
              </div>
            </div>

            {/* Claims */}
            <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Key Claims</h4>
            <div className="flex flex-col gap-2">
              {patent.current_patent.claims.map((claim, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent)' }}>
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{claim}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prior patent */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Prior Patent</h2>
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                {patent.prior_patent.status}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{patent.prior_patent.number}</span>
            </div>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {patent.prior_patent.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Filed: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{patent.prior_patent.filed}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Inventor: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{patent.prior_patent.inventor}</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {patent.prior_patent.description}
            </p>
          </div>
        </section>

        {/* Innovations */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Key Innovations</h2>
          <div className="grid gap-4">
            {patent.innovations.map((innovation) => (
              <div key={innovation.title} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{innovation.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{innovation.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Legal notice */}
        <div className="rounded-xl p-5 mb-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Legal Notice</h3>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Patent Pending. The technologies described on this page are protected under US Patent Application #63/990,046
            and prior Patent Application #63/968,814. Unauthorized use, reproduction, or implementation of these patented
            innovations may constitute patent infringement. The 0nMCP software itself is released under the MIT license;
            the patent covers the specific innovations in encrypted container architecture, multi-party escrow protocols,
            and content-addressed integrity verification systems described herein.
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
          <p className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Explore the security system</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>See how patent-pending technology protects your AI orchestration stack.</p>
          <Link
            href="/security"
            className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm no-underline"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            Security Overview
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/security/transfer" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Secure Transfer
          </Link>
          <Link href="/security" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Security Overview &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
