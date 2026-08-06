import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Our Technology — 4 Patents Powering the Future of AI Orchestration | 0nMCP',
  description: 'Explore the patent-pending technology behind 0nMCP: tamper-proof data verification, encrypted digital vaults, multi-AI reasoning, and adaptive content generation. 4 US patent applications filed.',
  openGraph: {
    title: 'Our Technology — 4 Patents Powering the Future of AI Orchestration',
    description: 'From encrypted vaults to multi-AI reasoning engines — discover the patented innovations that make 0nMCP the most advanced AI orchestration platform.',
    url: 'https://www.0nmcp.com/technology',
  },
  alternates: { canonical: 'https://www.0nmcp.com/technology' },
}

const PATENTS = [
  {
    slug: 'seal-of-truth',
    name: 'Seal of Truth',
    number: '#63/968,814',
    filed: 'January 2026',
    color: '#6EE05A',
    icon: '🔒',
    headline: 'A tamper-proof fingerprint for your data',
    description: 'Think of it like a wax seal on a letter. If anyone changes even a single character in your files, you\'ll know instantly. We use advanced cryptography to create a unique "fingerprint" of your data that\'s mathematically impossible to fake.',
    useCases: ['Verify file integrity', 'Detect unauthorized changes', 'Prove authenticity'],
  },
  {
    slug: '0nvault',
    name: '0nVault Container',
    number: '#63/990,046',
    filed: 'February 2026',
    color: '#a78bfa',
    icon: '🏦',
    headline: 'A digital safe with 7 separate compartments',
    description: 'Imagine a safe deposit box at a bank — but digital, with 7 independent compartments, each with its own lock. You can share the key to one compartment without opening the others. Perfect for securely storing and transferring business assets.',
    useCases: ['Encrypted credential storage', 'Multi-party access control', 'Business asset transfer'],
  },
  {
    slug: '0nplex',
    name: '0nPlex',
    number: '#64/006,268',
    filed: 'March 2026',
    color: '#00d4ff',
    icon: '🧠',
    headline: '7 AI experts debate every answer',
    description: 'Instead of asking one AI for an answer, 0nPlex assembles a panel of 7 AI personalities — each with a different perspective. They debate, challenge, and refine every response until it\'s the best possible answer. Think of it as having 7 expert advisors working together on every question.',
    useCases: ['Higher quality AI responses', 'Multiple perspective analysis', 'Self-improving knowledge'],
  },
  {
    slug: '0ncore',
    name: '0nCore',
    number: '#64/006,282',
    filed: 'March 2026',
    color: '#ff6b35',
    icon: '✍️',
    headline: 'AI that writes in YOUR voice',
    description: 'Every business has its own voice, its own way of communicating. 0nCore learns your industry, your style, and your language — then generates content that sounds authentically like you. It even gets smarter over time by learning what works across similar businesses.',
    useCases: ['Authentic brand voice', 'Industry-specific language', 'Conversion-optimized content'],
  },
]

export default function TechnologyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Our Technology — 4 Patents Powering 0nMCP',
    description: 'Explore the patent-pending technology behind 0nMCP: tamper-proof data verification, encrypted digital vaults, multi-AI reasoning, and adaptive content generation.',
    url: 'https://www.0nmcp.com/technology',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: PATENTS.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          description: p.description,
          url: `https://www.0nmcp.com/technology/${p.slug}`,
        },
      })),
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Technology', item: 'https://www.0nmcp.com/technology' },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How many patents does 0nMCP have?',
        acceptedAnswer: { '@type': 'Answer', text: '0nMCP has 4 US patent applications filed, covering data verification (Seal of Truth), encrypted containers (0nVault), multi-AI reasoning (0nPlex), and adaptive content generation (0nCore). All patents are assigned to RocketOpp LLC.' },
      },
      {
        '@type': 'Question',
        name: 'What makes 0nMCP different from other AI platforms?',
        acceptedAnswer: { '@type': 'Answer', text: '0nMCP is built on patent-pending technology. Our Seal of Truth provides tamper-proof data verification, 0nVault offers military-grade encryption with 7 semantic layers, 0nPlex uses 7 competing AI personas for superior answers, and 0nCore adapts content to match your authentic voice. No other platform has this combination.' },
      },
      {
        '@type': 'Question',
        name: 'Is the patent-pending technology included for free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. All patent-pending technology is included with every 0nMCP account. The platform is free to start with pay-as-you-scale pricing. The core is source-available under BSL-1.1; local use is free, commercial hosting requires a license.' },
      },
      {
        '@type': 'Question',
        name: 'Who invented the technology behind 0nMCP?',
        acceptedAnswer: { '@type': 'Answer', text: 'All 4 patents were invented by Michael A. Mento Jr. and are assigned to RocketOpp LLC. The patents cover breakthroughs in AI orchestration, encrypted data containers, multi-model reasoning, and adaptive content generation.' },
      },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Technology</span>
        </nav>

        <div className="heading-glow">
          <h1 className="text-3xl md:text-5xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            Our Technology
          </h1>
        </div>
        <p className="text-lg md:text-xl mb-4" style={{ color: 'var(--text-secondary)' }}>
          4 US patent applications. Built to protect your data, amplify your AI, and speak your language.
        </p>
        <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
          Every innovation below is included with 0nMCP — no extra cost, no enterprise tier required.
        </p>

        {/* Patent grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {PATENTS.map((p) => (
            <Link
              key={p.slug}
              href={`/technology/${p.slug}`}
              className="group rounded-2xl p-6 no-underline transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <h2 className="text-xl font-bold mb-0.5 group-hover:underline" style={{ color: p.color }}>
                    {p.name}
                  </h2>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    US Patent Application {p.number} &middot; Filed {p.filed}
                  </span>
                </div>
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {p.headline}
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                {p.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.useCases.map((uc) => (
                  <span
                    key={uc}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${p.color}15`,
                      color: p.color,
                      border: `1px solid ${p.color}30`,
                    }}
                  >
                    {uc}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Why it matters */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Why patents matter
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: 'Protection', desc: 'These aren\'t buzzwords — they\'re legally protected innovations. Our technology is defensible and unique in the market.' },
              { title: 'Quality', desc: 'Patents require proving novelty. Every system described here solves a problem no one else has solved the same way.' },
              { title: 'Included', desc: 'You don\'t pay extra for patented tech. Every 0nMCP user gets the full power of all 4 innovations, starting day one.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl p-5"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <h3 className="font-bold mb-2" style={{ color: 'var(--accent)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical deep dives */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Want the technical details?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Our <Link href="/security" className="underline" style={{ color: 'var(--accent)' }}>Security documentation</Link> covers the cryptographic specifications, algorithms, and implementation details behind the Seal of Truth and 0nVault.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/security/vault" className="text-sm px-4 py-2 rounded-lg no-underline" style={{ backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>
              Vault Specs
            </Link>
            <Link href="/security/layers" className="text-sm px-4 py-2 rounded-lg no-underline" style={{ backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>
              7 Semantic Layers
            </Link>
            <Link href="/security/escrow" className="text-sm px-4 py-2 rounded-lg no-underline" style={{ backgroundColor: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>
              Multi-Party Escrow
            </Link>
            <Link href="/security/seal-of-truth" className="text-sm px-4 py-2 rounded-lg no-underline" style={{ backgroundColor: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)', color: '#6EE05A' }}>
              Seal of Truth Specs
            </Link>
            <Link href="/security/patent" className="text-sm px-4 py-2 rounded-lg no-underline" style={{ backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
              All Patent Filings
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Do I need a special plan to use patented features?', a: 'No. All patent-pending technology is included with every 0nMCP account, including the free tier. There are no enterprise gates or premium-only features.' },
              { q: 'Are these real patents?', a: 'Yes. All 4 are filed with the United States Patent and Trademark Office (USPTO) as provisional patent applications under 35 USC 111(b). They are assigned to RocketOpp LLC.' },
              { q: 'Can I use these technologies in my own projects?', a: 'Absolutely. 0nMCP is source-available (BSL-1.1). You can use the platform and its patent-pending technology in your commercial projects. The patents protect our unique implementations from being copied by competitors.' },
              { q: 'How does 0nPlex make AI responses better?', a: '0nPlex sends every question to 7 different AI "personalities" — an Empiricist, Behavioralist, Systems Architect, Ethicist, Pragmatist, Adversary, and Visionary. Each brings a unique perspective, then the best ideas are combined into one superior answer.' },
            ].map((faq) => (
              <details
                key={faq.q}
                className="rounded-xl group"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <summary className="cursor-pointer px-5 py-4 text-sm font-semibold list-none flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                  <span className="text-xs transition-transform group-open:rotate-180" style={{ color: 'var(--text-muted)' }}>&#9660;</span>
                </summary>
                <p className="px-5 pb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center rounded-2xl p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.06))', border: '1px solid rgba(126,217,87,0.15)' }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to use patented AI technology?
          </h2>
          <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of developers and businesses using 0nMCP to orchestrate AI workflows with patent-protected technology. Free to start.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="btn-accent no-underline px-6 py-2.5 rounded-xl font-bold text-sm">
              Request Early Access
            </Link>
            <Link href="/turn-it-on" className="no-underline px-6 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Browse Capabilities
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
