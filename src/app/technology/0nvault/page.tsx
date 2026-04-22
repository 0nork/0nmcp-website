import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nVault — Encrypted Digital Safe With 7 Compartments | 0nMCP Patent #63/990,046',
  description: '0nVault is an encrypted digital safe with 7 independent compartments. Store credentials, workflows, and business assets — share specific keys with specific people. US Patent Application #63/990,046.',
  openGraph: {
    title: '0nVault — Encrypted Digital Safe With 7 Compartments',
    description: 'A digital safe with 7 separate compartments, each with its own lock. Store, encrypt, and securely transfer business assets.',
    url: 'https://www.0nmcp.com/technology/0nvault',
  },
  alternates: { canonical: 'https://www.0nmcp.com/technology/0nvault' },
}

const LAYERS = [
  { name: 'Workflows', desc: 'Your automation recipes — the RUNs that connect your tools and services together.', icon: '⚡' },
  { name: 'Credentials', desc: 'API keys and passwords, double-encrypted for extra security. Even if someone gets into the vault, these have their own separate lock.', icon: '🔑' },
  { name: 'Environment Variables', desc: 'The settings that make your apps work — database URLs, API endpoints, configuration values.', icon: '⚙️' },
  { name: 'MCP Configs', desc: 'Your AI tool connections — which services, which settings, which permissions.', icon: '🔌' },
  { name: 'Site Profiles', desc: 'Website configurations, domain settings, and deployment preferences.', icon: '🌐' },
  { name: 'AI Brain', desc: "Your AI's learned knowledge — custom instructions, training data, and personalization.", icon: '🧠' },
  { name: 'Audit Trail', desc: "A tamper-proof log of everything that's happened — who accessed what, when, and from where.", icon: '📋' },
]

export default function VaultPage() {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: '0nVault Container System',
    description: 'An encrypted digital safe with 7 independent compartments. Store credentials, workflows, and business assets with military-grade AES-256-GCM encryption.',
    url: 'https://www.0nmcp.com/technology/0nvault',
    brand: { '@type': 'Organization', name: '0nMCP' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Included free with 0nMCP' },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is 0nVault?', acceptedAnswer: { '@type': 'Answer', text: '0nVault is an encrypted digital container with 7 separate compartments (semantic layers). Each layer stores a different type of data — workflows, credentials, environment variables, MCP configs, site profiles, AI brain data, and audit trails. Each compartment has its own encryption, so you can share access to specific layers without exposing others.' } },
      { '@type': 'Question', name: 'What are the 7 semantic layers?', acceptedAnswer: { '@type': 'Answer', text: 'The 7 layers are: (1) Workflows — your automation recipes, (2) Credentials — API keys with double encryption, (3) Environment Variables — app settings, (4) MCP Configs — AI tool connections, (5) Site Profiles — website configurations, (6) AI Brain — custom AI knowledge, (7) Audit Trail — tamper-proof activity logs.' } },
      { '@type': 'Question', name: 'How does multi-party escrow work?', acceptedAnswer: { '@type': 'Answer', text: "Multi-party escrow lets up to 8 people share access to a vault container, with each person only able to access the layers they're authorized for. It uses X25519 key agreement — think of it as giving different people different keys to different rooms in a building." } },
      { '@type': 'Question', name: 'Can I transfer a vault container to someone else?', acceptedAnswer: { '@type': 'Answer', text: "Yes. The secure transfer system creates a complete chain of custody — every transfer is logged, verified, and protected against replay attacks. When you transfer a vault, the recipient can verify it hasn't been tampered with using the Seal of Truth." } },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Technology', item: 'https://www.0nmcp.com/technology' },
      { '@type': 'ListItem', position: 3, name: '0nVault', item: 'https://www.0nmcp.com/technology/0nvault' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5 text-[var(--text-muted)]" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/technology" className="hover:underline">Technology</Link>
          <span>/</span>
          <span className="text-violet-400">0nVault</span>
        </nav>

        {/* Hero */}
        <div className="heading-glow">
          <span className="text-xs font-mono uppercase tracking-widest mb-3 block text-violet-400">
            US Patent Application #63/990,046
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-[var(--text-primary)]">
            0nVault Container System
          </h1>
        </div>
        <p className="text-xl md:text-2xl font-medium mb-3 text-[var(--text-secondary)]">
          A digital safe with 7 separate compartments — each with its own lock.
        </p>
        <p className="text-base mb-8 text-[var(--text-muted)]">
          Filed February 24, 2026 &middot; Inventor: Michael A. Mento Jr. &middot; Assigned to RocketOpp LLC
        </p>

        {/* Plain English */}
        <section className="rounded-2xl p-6 md:p-8 mb-10 bg-[var(--bg-card)] border border-[var(--border)]">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
            What it does — in plain English
          </h2>
          <p className="text-sm leading-relaxed mb-4 text-[var(--text-secondary)]">
            Imagine a safe deposit box at a bank — but instead of one compartment, it has <strong className="text-[var(--text-primary)]">7 separate compartments</strong>, each with its own key.
          </p>
          <p className="text-sm leading-relaxed mb-4 text-[var(--text-secondary)]">
            You can put your passwords in one compartment, your workflow recipes in another, your website settings in a third. When you need to share something with a business partner, you hand them the key to just the compartments they need — they never see what&apos;s in the others.
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Everything is encrypted with military-grade AES-256 encryption. Your passwords get an extra layer of protection on top of that. And the entire container is sealed with a <Link href="/technology/seal-of-truth" className="underline text-[#6EE05A]">Seal of Truth</Link> — so you can always verify nothing&apos;s been tampered with.
          </p>
        </section>

        {/* 7 Layers */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
            The 7 compartments
          </h2>
          <div className="space-y-3">
            {LAYERS.map((layer, i) => (
              <div key={layer.name} className="flex items-start gap-4 rounded-xl p-5 bg-[var(--bg-card)] border border-[var(--border)]">
                <span className="text-2xl shrink-0">{layer.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--text-muted)]">Layer {i + 1}</span>
                    <h3 className="font-bold text-sm text-violet-400">{layer.name}</h3>
                    {layer.name === 'Credentials' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,107,53,0.15)] text-[#ff6b35] border border-[rgba(255,107,53,0.3)]">
                        Double Encrypted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key features */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
            Key features
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { title: 'Multi-Party Sharing', desc: 'Share with up to 8 people, each with access to only the compartments they need. Like giving different keys to different rooms in a building.' },
              { title: 'Business Transfer', desc: 'Transfer entire digital businesses — credentials, workflows, websites — in one encrypted package. Complete chain of custody tracking.' },
              { title: 'Tamper Detection', desc: "Every container includes a Seal of Truth. If anyone modifies anything inside, the seal breaks immediately." },
              { title: 'Portable Encryption', desc: 'Containers work on any machine. Use a passphrase to encrypt — no special hardware or setup required.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl p-5 bg-[var(--bg-card)] border border-[var(--border)]">
                <h3 className="font-bold text-sm mb-2 text-[var(--text-primary)]">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Real-world use cases */}
        <section className="rounded-2xl p-6 md:p-8 mb-10 bg-[linear-gradient(135deg,rgba(167,139,250,0.06),rgba(0,212,255,0.04))] border border-[rgba(167,139,250,0.15)]">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
            Who uses this?
          </h2>
          <div className="space-y-3">
            {[
              { who: 'Freelancers & agencies', use: 'Package an entire client project — API keys, website config, workflows — and hand it off securely when the project ends.' },
              { who: 'Business sellers', use: 'Selling a digital business? Transfer everything the buyer needs in one encrypted, verified container.' },
              { who: 'Development teams', use: "Share credentials and configs with team members without exposing secrets they don't need access to." },
              { who: 'AI developers', use: "Bundle your AI's knowledge base, tool connections, and configurations into a single portable file." },
            ].map((uc) => (
              <div key={uc.who} className="flex gap-3">
                <span className="text-violet-400">&#8250;</span>
                <div>
                  <strong className="text-sm text-[var(--text-primary)]">{uc.who}:</strong>{' '}
                  <span className="text-sm text-[var(--text-secondary)]">{uc.use}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
            Related technology
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/technology/seal-of-truth" className="rounded-xl p-4 no-underline group bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-1 group-hover:underline text-[#6EE05A]">Seal of Truth</h3>
              <p className="text-xs text-[var(--text-muted)]">The tamper-proof fingerprint that protects every container</p>
            </Link>
            <Link href="/security/vault" className="rounded-xl p-4 no-underline group bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-1 group-hover:underline text-violet-400">Technical Specs</h3>
              <p className="text-xs text-[var(--text-muted)]">AES-256-GCM, Ed25519, binary format details</p>
            </Link>
            <Link href="/security/escrow" className="rounded-xl p-4 no-underline group bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-1 group-hover:underline text-[#00d4ff]">Multi-Party Escrow</h3>
              <p className="text-xs text-[var(--text-muted)]">How key agreement works between parties</p>
            </Link>
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
          <Link href="/technology/seal-of-truth" className="text-sm font-bold no-underline text-[#6EE05A]">
            &larr; Seal of Truth
          </Link>
          <Link href="/technology/0nplex" className="text-sm font-bold no-underline text-[#00d4ff]">
            0nPlex &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
