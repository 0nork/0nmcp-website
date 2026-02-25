import type { Metadata } from 'next'
import Link from 'next/link'
import securityData from '@/data/security.json'

export const metadata: Metadata = {
  title: 'Multi-Party Escrow — X25519 ECDH Key Agreement for 0nVault',
  description: 'Share encrypted .0nv containers with up to 8 parties using X25519 ECDH key agreement. Granular per-layer access control with cryptographic enforcement.',
  openGraph: {
    title: 'Multi-Party Escrow — X25519 ECDH Key Agreement for 0nVault',
    description: 'Share encrypted containers with granular per-layer access control for up to 8 parties.',
    url: 'https://0nmcp.com/security/escrow',
  },
  alternates: { canonical: 'https://0nmcp.com/security/escrow' },
}

export default function EscrowPage() {
  const { escrow } = securityData.pages

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to use 0nVault Multi-Party Escrow',
    description: escrow.description,
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Generate Keypairs', text: 'Each party generates an X25519 keypair and shares their public key.' },
      { '@type': 'HowToStep', position: 2, name: 'Define Access Matrix', text: 'The owner defines which layers each party can access.' },
      { '@type': 'HowToStep', position: 3, name: 'Perform Key Agreement', text: 'ECDH key agreement derives unique shared secrets for each party.' },
      { '@type': 'HowToStep', position: 4, name: 'Distribute Container', text: 'The .0nv container is shared. Each party can only decrypt their authorized layers.' },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: escrow.faq.map((f) => ({
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
      { '@type': 'ListItem', position: 3, name: 'Escrow', item: 'https://0nmcp.com/security/escrow' },
    ],
  }

  const layerHeaders = ['workflows', 'credentials', 'env_vars', 'mcp_configs', 'site_profiles', 'ai_brain', 'audit_trail'] as const
  const layerShortNames: Record<string, string> = {
    workflows: 'Workflows',
    credentials: 'Creds',
    env_vars: 'Env',
    mcp_configs: 'MCP',
    site_profiles: 'Sites',
    ai_brain: 'AI',
    audit_trail: 'Audit',
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
          <span style={{ color: 'var(--accent)' }}>Escrow</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          {escrow.title}
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>{escrow.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {escrow.description}
        </p>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{escrow.max_parties}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>max parties</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>X25519</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>ECDH</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>7</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>access layers</div>
          </div>
        </div>

        {/* Features */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Escrow Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {escrow.features.map((feature) => (
              <div key={feature.title} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Access matrix */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Access Matrix Example</h2>
          <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left p-3 font-bold" style={{ color: 'var(--text-muted)' }}>Party</th>
                  {layerHeaders.map((h) => (
                    <th key={h} className="p-3 font-bold text-center" style={{ color: 'var(--text-muted)' }}>
                      {layerShortNames[h]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {escrow.access_matrix_example.map((row, i) => (
                  <tr
                    key={row.party}
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                      borderBottom: i < escrow.access_matrix_example.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td className="p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.party}</td>
                    {layerHeaders.map((h) => (
                      <td key={h} className="p-3 text-center">
                        <span style={{ color: (row as Record<string, boolean | string>)[h] ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {(row as Record<string, boolean | string>)[h] ? '\u2713' : '\u2715'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Each party can only decrypt the layers marked with a checkmark. Access is enforced cryptographically -- unauthorized layers are indecipherable.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {escrow.faq.map((f, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.q}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/security/layers" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; 7 Semantic Layers
          </Link>
          <Link href="/security/seal-of-truth" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Seal of Truth &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
