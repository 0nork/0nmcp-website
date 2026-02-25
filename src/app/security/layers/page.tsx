import type { Metadata } from 'next'
import Link from 'next/link'
import securityData from '@/data/security.json'

export const metadata: Metadata = {
  title: '7 Semantic Layers — 0nVault Independent Encryption',
  description: 'Workflows, credentials, env vars, MCP configs, site profiles, AI brain, and audit trail -- each encrypted independently with AES-256-GCM. Credentials use double-encryption with Argon2id.',
  openGraph: {
    title: '7 Semantic Layers — 0nVault Independent Encryption',
    description: '7 independently encrypted layers for complete AI orchestration security. Granular access control per layer.',
    url: 'https://0nmcp.com/security/layers',
  },
  alternates: { canonical: 'https://0nmcp.com/security/layers' },
}

export default function LayersPage() {
  const { layers } = securityData.pages

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Understanding the 7 Semantic Layers of 0nVault',
    description: layers.description,
    step: layers.layers.map((layer, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: layer.name,
      text: layer.description,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Security', item: 'https://0nmcp.com/security' },
      { '@type': 'ListItem', position: 3, name: 'Layers', item: 'https://0nmcp.com/security/layers' },
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
          <span style={{ color: 'var(--accent)' }}>Layers</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          {layers.title}
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>{layers.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {layers.description}
        </p>

        {/* Layer count stat */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>7</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>layers</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>AES-256</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>per layer</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>Argon2id</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>credentials</div>
          </div>
        </div>

        {/* Layer details */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Layer Architecture</h2>
          <div className="flex flex-col gap-4">
            {layers.layers.map((layer, i) => (
              <div key={layer.id} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-mono font-bold px-2.5 py-1.5 rounded flex-shrink-0"
                    style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent)' }}
                  >
                    L{i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{layer.name}</h3>
                      {layer.encryption.includes('Argon2id') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--accent)' }}>
                          Double-Encrypted
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{layer.description}</p>
                    <div className="flex gap-4 text-[11px]">
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong>Encryption:</strong> {layer.encryption}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong>Access:</strong> {layer.access}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Double encryption callout */}
        <section className="mb-10">
          <div className="rounded-xl p-5" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>Credentials Double-Encryption</h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              The credentials layer (L2) receives an extra layer of protection. Before being encrypted with the standard AES-256-GCM layer key,
              credential values are first encrypted with a key derived using Argon2id -- a memory-hard key derivation function resistant to
              GPU and ASIC attacks. This means that even if the layer key is compromised, credentials remain protected by the Argon2id-derived key.
            </p>
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)' }}>
              <code className="text-xs font-mono block" style={{ color: 'var(--accent)' }}>
                credential_key = Argon2id(passphrase, salt, t=3, m=65536, p=4)
              </code>
              <code className="text-xs font-mono block mt-1" style={{ color: 'var(--text-muted)' }}>
                encrypted = AES-256-GCM(layer_key, AES-256-GCM(credential_key, plaintext))
              </code>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/security/vault" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Vault Container
          </Link>
          <Link href="/security/escrow" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Multi-Party Escrow &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
