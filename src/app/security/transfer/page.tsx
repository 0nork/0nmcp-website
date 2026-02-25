import type { Metadata } from 'next'
import Link from 'next/link'
import securityData from '@/data/security.json'

export const metadata: Metadata = {
  title: 'Secure Transfer Protocol — Replay Prevention & Chain of Custody',
  description: 'Transfer .0nv containers with cryptographic chain of custody, replay prevention, transfer ID tracking, and Ed25519 sender verification.',
  openGraph: {
    title: 'Secure Transfer Protocol — Replay Prevention & Chain of Custody',
    description: 'Cryptographic chain of custody for encrypted AI orchestration containers.',
    url: 'https://0nmcp.com/security/transfer',
  },
  alternates: { canonical: 'https://0nmcp.com/security/transfer' },
}

export default function TransferPage() {
  const { transfer } = securityData.pages

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to securely transfer a 0nVault container',
    description: transfer.description,
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Initiate Transfer', text: 'Generate a Transfer ID (UUID v7) and specify the recipient\'s public key and layer access grants.' },
      { '@type': 'HowToStep', position: 2, name: 'Sign the Transfer', text: 'The sender signs the transfer with their Ed25519 private key, including a nonce and timestamp for replay prevention.' },
      { '@type': 'HowToStep', position: 3, name: 'Re-encrypt Layers', text: 'Authorized layers are re-encrypted for the recipient using X25519 ECDH key agreement.' },
      { '@type': 'HowToStep', position: 4, name: 'Log the Transfer', text: 'The transfer is appended to the container\'s immutable transfer log with full cryptographic proof.' },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Security', item: 'https://0nmcp.com/security' },
      { '@type': 'ListItem', position: 3, name: 'Transfer', item: 'https://0nmcp.com/security/transfer' },
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
          <span style={{ color: 'var(--accent)' }}>Transfer</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          {transfer.title}
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>{transfer.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {transfer.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>UUID v7</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>transfer IDs</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>Ed25519</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>signatures</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>Append</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>only log</div>
          </div>
        </div>

        {/* Transfer features */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Transfer Protocol Features</h2>
          <div className="flex flex-col gap-4">
            {transfer.features.map((feature, i) => (
              <div key={feature.title} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start gap-4">
                  <span
                    className="text-xs font-mono font-bold px-2.5 py-1.5 rounded flex-shrink-0"
                    style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transfer flow diagram */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Transfer Flow</h2>
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="rounded-lg p-4" style={{ background: 'var(--bg-primary)' }}>
              <code className="text-xs font-mono block mb-2" style={{ color: 'var(--text-muted)' }}>1. Sender initiates transfer</code>
              <code className="text-xs font-mono block mb-1" style={{ color: 'var(--text-secondary)' }}>   transfer_id = UUIDv7()</code>
              <code className="text-xs font-mono block mb-1" style={{ color: 'var(--text-secondary)' }}>   nonce = random(32)</code>
              <code className="text-xs font-mono block mb-3" style={{ color: 'var(--text-secondary)' }}>   timestamp = now()</code>
              <code className="text-xs font-mono block mb-2" style={{ color: 'var(--text-muted)' }}>2. Sender signs transfer</code>
              <code className="text-xs font-mono block mb-3" style={{ color: 'var(--accent)' }}>   sig = Ed25519.sign(sender_key, transfer_id || nonce || timestamp || recipient_pk || layer_grants)</code>
              <code className="text-xs font-mono block mb-2" style={{ color: 'var(--text-muted)' }}>3. Re-encrypt authorized layers</code>
              <code className="text-xs font-mono block mb-3" style={{ color: 'var(--text-secondary)' }}>   shared_secret = X25519(sender_sk, recipient_pk)</code>
              <code className="text-xs font-mono block mb-2" style={{ color: 'var(--text-muted)' }}>4. Append to transfer log</code>
              <code className="text-xs font-mono block" style={{ color: '#00ff88' }}>   log.append(transfer_id, sender, recipient, layers, sig, timestamp)</code>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/security/seal-of-truth" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Seal of Truth
          </Link>
          <Link href="/security/patent" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Patent-Pending &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
