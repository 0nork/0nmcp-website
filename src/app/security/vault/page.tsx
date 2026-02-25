import type { Metadata } from 'next'
import Link from 'next/link'
import securityData from '@/data/security.json'

export const metadata: Metadata = {
  title: '0nVault Container System — .0nv Binary Format',
  description: 'The .0nv container format bundles encrypted semantic layers, digital signatures, integrity seals, and transfer logs into a single portable binary file for AI orchestration.',
  openGraph: {
    title: '0nVault Container System — .0nv Binary Format',
    description: 'A single .0nv file holds your entire AI orchestration context with military-grade encryption.',
    url: 'https://0nmcp.com/security/vault',
  },
  alternates: { canonical: 'https://0nmcp.com/security/vault' },
}

export default function VaultPage() {
  const { vault } = securityData.pages

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to use the 0nVault Container System',
    description: vault.description,
    step: vault.operations.map((op, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: op.name,
      text: op.description,
    })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: vault.faq.map((f) => ({
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
      { '@type': 'ListItem', position: 3, name: 'Vault', item: 'https://0nmcp.com/security/vault' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/security" className="hover:underline">Security</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Vault</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          {vault.title}
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>{vault.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {vault.description}
        </p>

        {/* Format info */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Binary Format Structure</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{vault.format.extension}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>extension</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{vault.format.magic_bytes}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>magic bytes</div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{vault.format.type}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>format</div>
            </div>
          </div>

          {/* Format diagram */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold p-3" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              .0nv Container Sections
            </div>
            {vault.format.sections.map((section, i) => (
              <div
                key={section.name}
                className="flex items-start gap-4 p-4"
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                  borderBottom: i < vault.format.sections.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span className="text-xs font-mono font-bold px-2 py-1 rounded flex-shrink-0" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{section.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{section.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Operations */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Container Operations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {vault.operations.map((op) => (
              <div key={op.name} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{op.name}</h3>
                <code className="text-xs font-mono block mb-2 px-2 py-1 rounded" style={{ background: 'var(--bg-primary)', color: 'var(--accent)' }}>
                  {op.command}
                </code>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{op.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {vault.faq.map((f, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.q}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/security" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Security Overview
          </Link>
          <Link href="/security/layers" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            7 Semantic Layers &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
