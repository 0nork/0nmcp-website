import type { Metadata } from 'next'
import Link from 'next/link'
import securityData from '@/data/security.json'

export const metadata: Metadata = {
  title: 'Seal of Truth — SHA3-256 Integrity Verification for 0nVault',
  description: 'Tamper-proof integrity verification using SHA3-256 content-addressed hashing. Verify any .0nv container without decrypting it. Prior patent #63/968,814.',
  openGraph: {
    title: 'Seal of Truth — SHA3-256 Integrity Verification for 0nVault',
    description: 'Content-addressed integrity verification. Verify encrypted containers without decryption keys.',
    url: 'https://0nmcp.com/security/seal-of-truth',
  },
  alternates: { canonical: 'https://0nmcp.com/security/seal-of-truth' },
}

export default function SealOfTruthPage() {
  const { seal_of_truth } = securityData.pages

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to verify a 0nVault container with the Seal of Truth',
    description: seal_of_truth.description,
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Obtain the Seal', text: 'The Seal of Truth is embedded in the .0nv container and can also be published separately.' },
      { '@type': 'HowToStep', position: 2, name: 'Compute the Hash', text: `Compute: ${seal_of_truth.formula}` },
      { '@type': 'HowToStep', position: 3, name: 'Compare', text: 'Compare the computed hash with the embedded or published seal. A match confirms integrity.' },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Security', item: 'https://0nmcp.com/security' },
      { '@type': 'ListItem', position: 3, name: 'Seal of Truth', item: 'https://0nmcp.com/security/seal-of-truth' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/security" className="hover:underline">Security</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Seal of Truth</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          {seal_of_truth.title}
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>{seal_of_truth.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {seal_of_truth.description}
        </p>

        {/* Algorithm stat */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{seal_of_truth.algorithm}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>algorithm</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>128-bit</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>collision resistance</div>
          </div>
        </div>

        {/* Formula */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>The Formula</h2>
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-primary)' }}>
              <code className="text-sm font-mono font-bold block text-center" style={{ color: 'var(--accent)' }}>
                {seal_of_truth.formula}
              </code>
            </div>
            <div className="flex flex-col gap-3">
              {seal_of_truth.formula_explanation.map((part) => (
                <div key={part.component} className="flex items-start gap-3">
                  <code className="text-xs font-mono font-bold px-2 py-1 rounded flex-shrink-0" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent)' }}>
                    {part.component}
                  </code>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{part.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Properties */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Properties</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {seal_of_truth.properties.map((prop) => (
              <div key={prop.title} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{prop.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{prop.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prior patent */}
        <section className="mb-10">
          <div className="rounded-xl p-5" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>Prior Patent</h3>
            <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
              <strong>Patent #{seal_of_truth.prior_patent.number}</strong> &mdash; {seal_of_truth.prior_patent.title}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Filed: {seal_of_truth.prior_patent.filed} | Status: {seal_of_truth.prior_patent.status} | Inventor: Michael A Mento Jr.
            </p>
          </div>
        </section>

        {/* Verification example */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Verification Example</h2>
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="rounded-lg p-4" style={{ background: 'var(--bg-primary)' }}>
              <code className="text-xs font-mono block mb-1" style={{ color: 'var(--text-muted)' }}>$ 0nmcp vault verify container.0nv</code>
              <code className="text-xs font-mono block mb-1" style={{ color: 'var(--text-secondary)' }}>Computing Seal of Truth...</code>
              <code className="text-xs font-mono block mb-1" style={{ color: 'var(--accent)' }}>Seal: a3f8c2d1e9b7...4f6a (SHA3-256)</code>
              <code className="text-xs font-mono block mb-1" style={{ color: 'var(--text-secondary)' }}>Comparing with embedded seal...</code>
              <code className="text-xs font-mono block" style={{ color: '#00ff88' }}>VERIFIED: Container integrity confirmed.</code>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/security/escrow" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Multi-Party Escrow
          </Link>
          <Link href="/security/transfer" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Secure Transfer &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
