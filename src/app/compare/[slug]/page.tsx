import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import comparisonsData from '@/data/comparisons.json'

type Comparison = (typeof comparisonsData.comparisons)[number]

function findComparison(slug: string): Comparison | undefined {
  return comparisonsData.comparisons.find((c) => c.slug === slug)
}

export async function generateStaticParams() {
  return comparisonsData.comparisons.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const comp = findComparison(slug)

  if (!comp) return { title: 'Comparison Not Found — 0nMCP' }

  const title = `0nMCP vs ${comp.competitor} — ${comp.tagline}`
  const description = `${comp.description.slice(0, 140)} Compare features, pricing, and use cases.`

  return {
    title,
    description,
    openGraph: { title, description, url: `https://0nmcp.com/compare/${comp.slug}` },
    alternates: { canonical: `https://0nmcp.com/compare/${comp.slug}` },
  }
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comp = findComparison(slug)

  if (!comp) notFound()

  const others = comparisonsData.comparisons.filter((c) => c.slug !== comp.slug).slice(0, 4)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: '0nMCP',
    description: 'Universal AI API Orchestrator — 819 tools, 48 services, one npm install.',
    url: 'https://0nmcp.com',
    brand: { '@type': 'Organization', name: '0nMCP' },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free and open source (MIT licensed). Marketplace executions $0.10 each.',
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: comp.faq.map((f) => ({
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
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://0nmcp.com/compare' },
      { '@type': 'ListItem', position: 3, name: `vs ${comp.competitor}`, item: `https://0nmcp.com/compare/${comp.slug}` },
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
          <Link href="/compare" className="hover:underline">Compare</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>vs {comp.competitor}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          0nMCP vs {comp.competitor}
        </h1>
        <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--accent)' }}>{comp.tagline}</p>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>{comp.description}</p>

        {/* Feature comparison table */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Feature Comparison</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-3 text-xs font-bold p-3" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Feature</div>
              <div style={{ color: 'var(--accent)' }}>0nMCP</div>
              <div style={{ color: 'var(--text-secondary)' }}>{comp.competitor}</div>
            </div>
            {comp.key_differences.map((diff, i) => (
              <div
                key={i}
                className="grid grid-cols-3 text-xs p-3"
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                  borderBottom: i < comp.key_differences.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{diff.feature}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{diff.onmcp}</div>
                <div style={{ color: 'var(--text-muted)' }}>{diff.competitor}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Pricing</h2>
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comp.pricing_compare}</p>
          </div>
        </section>

        {/* Best for */}
        <section className="mb-10 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>Choose 0nMCP if...</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comp.best_for_onmcp}</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Choose {comp.competitor} if...</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{comp.best_for_competitor}</p>
          </div>
        </section>

        {/* About competitor */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>About {comp.competitor}</h2>
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comp.competitor_summary}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {comp.faq.map((f, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.q}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other comparisons */}
        {others.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>More Comparisons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/compare/${o.slug}`}
                  className="rounded-lg p-3 no-underline text-center transition-all group"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <span className="text-xs font-bold group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                    vs {o.competitor}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
          <p className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Ready to try 0nMCP?</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>819 tools. 48 services. Free and open source.</p>
          <Link
            href="/turn-it-on"
            className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm no-underline"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            Get Started Free
          </Link>
        </div>

        <div className="mt-8 flex justify-between">
          <Link href="/compare" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; All comparisons
          </Link>
          <Link href="/glossary" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Glossary &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
