import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Seal of Truth — Tamper-Proof Data Verification | 0nMCP Patent #63/968,814',
  description: 'The Seal of Truth creates a unique digital fingerprint of your data using SHA3-256 cryptography. If anyone changes even one character, you\'ll know instantly. US Patent Application #63/968,814.',
  openGraph: {
    title: 'Seal of Truth — Tamper-Proof Data Verification',
    description: 'A unique digital fingerprint that proves your data hasn\'t been tampered with. Patent-pending technology from 0nMCP.',
    url: 'https://www.0nmcp.com/technology/seal-of-truth',
  },
  alternates: { canonical: 'https://www.0nmcp.com/technology/seal-of-truth' },
}

export default function SealOfTruthPage() {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Seal of Truth',
    description: 'Tamper-proof data verification system using SHA3-256 cryptography. Creates a unique fingerprint of your data that\'s mathematically impossible to fake.',
    url: 'https://www.0nmcp.com/technology/seal-of-truth',
    brand: { '@type': 'Organization', name: '0nMCP' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Included free with 0nMCP' },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is the Seal of Truth?', acceptedAnswer: { '@type': 'Answer', text: 'The Seal of Truth is a tamper-proof digital fingerprint for your data. Using SHA3-256 cryptography, it creates a unique signature that changes if even a single character in your data is modified. This makes it easy to verify that files, credentials, and configurations haven\'t been altered.' } },
      { '@type': 'Question', name: 'How does the Seal of Truth work?', acceptedAnswer: { '@type': 'Answer', text: 'When you create a vault container, the Seal of Truth combines the header, manifest, and all encrypted layer contents through a SHA3-256 hash function. This produces a unique 256-bit fingerprint. Anyone with the seal can verify the container\'s integrity without needing to decrypt it.' } },
      { '@type': 'Question', name: 'Can the Seal of Truth be faked?', acceptedAnswer: { '@type': 'Answer', text: 'No. SHA3-256 is a one-way cryptographic function. There is no known way to create two different sets of data that produce the same seal. Even changing one byte in a terabyte of data produces a completely different fingerprint.' } },
      { '@type': 'Question', name: 'What is US Patent Application #63/968,814?', acceptedAnswer: { '@type': 'Answer', text: 'US Patent Application #63/968,814, titled "Content-Addressed Integrity Verification for Encrypted Containers," was filed on January 27, 2026. It covers the Seal of Truth system — the method of creating tamper-proof, content-addressed verification for encrypted data containers.' } },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Technology', item: 'https://www.0nmcp.com/technology' },
      { '@type': 'ListItem', position: 3, name: 'Seal of Truth', item: 'https://www.0nmcp.com/technology/seal-of-truth' },
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
          <Link href="/technology" className="hover:underline">Technology</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Seal of Truth</span>
        </nav>

        {/* Hero */}
        <div className="heading-glow">
          <span className="text-xs font-mono uppercase tracking-widest mb-3 block" style={{ color: '#6EE05A' }}>
            US Patent Application #63/968,814
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Seal of Truth
          </h1>
        </div>
        <p className="text-xl md:text-2xl font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          A tamper-proof fingerprint for your data.
        </p>
        <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
          Filed January 27, 2026 &middot; Inventor: Michael A. Mento Jr. &middot; Assigned to RocketOpp LLC
        </p>

        {/* Plain English explanation */}
        <section className="rounded-2xl p-6 md:p-8 mb-10" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            What it does — in plain English
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Think of a wax seal on an old-fashioned letter. If someone opens the letter and re-seals it, you can tell it&apos;s been tampered with because the seal is broken.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            The Seal of Truth works the same way — but for digital data. When you store files, credentials, or configurations in a <Link href="/technology/0nvault" className="underline" style={{ color: '#a78bfa' }}>0nVault container</Link>, we create a unique digital &ldquo;fingerprint&rdquo; of everything inside. This fingerprint is mathematically unique — even changing one character in one file creates a completely different seal.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The result? You can verify that your data hasn&apos;t been modified, corrupted, or tampered with — instantly, and without needing to decrypt anything.
          </p>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { step: '1', title: 'Create', desc: 'You save data into a 0nVault container — files, credentials, configurations, anything you want to protect.' },
              { step: '2', title: 'Seal', desc: 'The system runs all your data through a one-way mathematical function (SHA3-256) to create a unique 256-bit fingerprint — the Seal of Truth.' },
              { step: '3', title: 'Verify', desc: 'Anytime you want, run the verification. If the seal matches, your data is untouched. If it doesn\'t — something changed.' },
            ].map((s) => (
              <div key={s.step} className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black mb-3" style={{ backgroundColor: 'rgba(126,217,87,0.15)', color: '#6EE05A' }}>
                  {s.step}
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why it matters */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Why this matters for you
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Trust your backups', desc: 'Know with mathematical certainty that your backup files are exactly what you saved. No corruption, no tampering.' },
              { title: 'Prove authenticity', desc: 'When you hand off business assets — contracts, credentials, configurations — the recipient can verify nothing was changed in transit.' },
              { title: 'Detect breaches instantly', desc: 'If an attacker modifies any file in your vault, the seal breaks immediately. You don\'t need to check every file — just verify the seal.' },
              { title: 'Public verification', desc: 'Anyone can verify the seal without needing to see the encrypted data inside. The fingerprint proves integrity without revealing contents.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <span className="text-lg shrink-0" style={{ color: '#6EE05A' }}>&#10003;</span>
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-world analogy */}
        <section className="rounded-2xl p-6 md:p-8 mb-10" style={{ background: 'linear-gradient(135deg, rgba(126,217,87,0.06), rgba(0,212,255,0.04))', border: '1px solid rgba(126,217,87,0.15)' }}>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Real-world analogy
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Imagine you&apos;re shipping a package. Before sealing the box, you weigh it, photograph the contents, and record the dimensions. You write all of this on a card taped to the outside. When the package arrives, the recipient checks: same weight? Same dimensions? Photo matches? If yes — the package is authentic. If anything is off — someone opened it.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>
            The Seal of Truth does this automatically, mathematically, and instantly for digital data. And unlike a physical seal, it&apos;s impossible to break and re-create.
          </p>
        </section>

        {/* Related technology */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Related technology
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/technology/0nvault" className="rounded-xl p-5 no-underline group" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm mb-1 group-hover:underline" style={{ color: '#a78bfa' }}>0nVault Container</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>The encrypted container that the Seal of Truth protects</p>
            </Link>
            <Link href="/security/seal-of-truth" className="rounded-xl p-5 no-underline group" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm mb-1 group-hover:underline" style={{ color: '#6EE05A' }}>Technical Specifications</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>SHA3-256 algorithm details, formula, and implementation</p>
            </Link>
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/technology" className="text-sm font-bold no-underline" style={{ color: 'var(--text-muted)' }}>
            &larr; All Technology
          </Link>
          <Link href="/technology/0nvault" className="text-sm font-bold no-underline" style={{ color: '#a78bfa' }}>
            0nVault Container &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
