import type { Metadata } from 'next'
import Link from 'next/link'
import glossaryData from '@/data/glossary.json'

export const metadata: Metadata = {
  title: 'AI Orchestration Glossary — 0nMCP',
  description: 'Complete glossary of AI orchestration, MCP, automation, and API integration terminology. 80+ terms defined for developers, AI engineers, and automation professionals.',
  openGraph: {
    title: 'AI Orchestration Glossary — 0nMCP',
    description: 'Complete glossary of AI orchestration, MCP, automation, and API integration terminology.',
    url: 'https://0nmcp.com/glossary',
  },
  alternates: { canonical: 'https://0nmcp.com/glossary' },
}

const categoryLabels: Record<string, string> = {
  core: '0nMCP Core Concepts',
  execution: 'Execution Patterns',
  automation: 'Automation & Workflows',
  integration: 'API & Integration',
  security: 'Security & Auth',
  ai: 'AI & Language Models',
  architecture: 'Architecture & Patterns',
  development: 'Development & Tools',
  services: 'Services & Platforms',
  seo: 'SEO & Optimization',
}

const categoryOrder = ['core', 'execution', 'automation', 'integration', 'security', 'ai', 'architecture', 'development', 'services', 'seo']

export default function GlossaryPage() {
  const terms = glossaryData.terms
  const grouped = categoryOrder.reduce<Record<string, typeof terms>>((acc, cat) => {
    const catTerms = terms.filter((t) => t.category === cat)
    if (catTerms.length > 0) acc[cat] = catTerms.sort((a, b) => a.term.localeCompare(b.term))
    return acc
  }, {})

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: terms.slice(0, 20).map((t) => ({
      '@type': 'Question',
      name: `What is ${t.term}?`,
      acceptedAnswer: { '@type': 'Answer', text: t.definition },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://0nmcp.com/glossary' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Glossary</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          AI Orchestration Glossary
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {terms.length} terms covering AI orchestration, MCP, workflow automation, API integration, and more.
          The definitive reference for anyone building with AI-native tools.
        </p>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categoryOrder.map((cat) => grouped[cat] ? (
            <a
              key={cat}
              href={`#${cat}`}
              className="text-xs px-3 py-1.5 rounded-full no-underline font-semibold transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {categoryLabels[cat]} ({grouped[cat].length})
            </a>
          ) : null)}
        </div>

        {/* Term groups */}
        {categoryOrder.map((cat) => {
          const catTerms = grouped[cat]
          if (!catTerms) return null
          return (
            <section key={cat} id={cat} className="mb-12">
              <h2 className="text-xl font-bold mb-4 pb-2" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}>
                {categoryLabels[cat]}
              </h2>
              <div className="grid gap-3">
                {catTerms.map((term) => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    className="rounded-xl p-4 no-underline transition-all group"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                      {term.term}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {term.definition.length > 180 ? term.definition.slice(0, 180) + '...' : term.definition}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Back to 0nMCP
          </Link>
        </div>
      </div>
    </div>
  )
}
