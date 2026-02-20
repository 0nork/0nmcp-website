import type { Metadata } from 'next'
import Link from 'next/link'
import comparisonsData from '@/data/comparisons.json'

export const metadata: Metadata = {
  title: '0nMCP vs Alternatives — Compare AI Orchestration Platforms',
  description: 'Compare 0nMCP against Zapier, Make, n8n, Power Automate, and other automation platforms. See feature-by-feature breakdowns, pricing, and which tool fits your needs.',
  openGraph: {
    title: '0nMCP vs Alternatives — Compare AI Orchestration Platforms',
    description: 'Feature-by-feature comparisons of 0nMCP against 12 automation and orchestration platforms.',
    url: 'https://0nmcp.com/compare',
  },
  alternates: { canonical: 'https://0nmcp.com/compare' },
}

export default function ComparePage() {
  const comparisons = comparisonsData.comparisons

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://0nmcp.com/compare' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Compare</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          0nMCP vs Alternatives
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          How does AI-native orchestration stack up against traditional automation platforms?
          Detailed feature-by-feature comparisons to help you choose the right tool.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>545</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>tools</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>$0</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>local use</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>MIT</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>licensed</div>
          </div>
        </div>

        {/* Comparison cards */}
        <div className="grid gap-4">
          {comparisons.map((comp) => (
            <Link
              key={comp.slug}
              href={`/compare/${comp.slug}`}
              className="rounded-xl p-5 no-underline transition-all group"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-base font-bold mb-1 group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                    0nMCP vs {comp.competitor}
                  </h2>
                  <p className="text-xs mb-2" style={{ color: 'var(--accent)' }}>{comp.tagline}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {comp.description.slice(0, 160)}...
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent)' }}>
                  {comp.key_differences.length} differences
                </span>
              </div>
              <div className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {comp.pricing_compare.slice(0, 120)}...
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/turn-it-on" className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm no-underline" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
            Try 0nMCP Free
          </Link>
        </div>
      </div>
    </div>
  )
}
