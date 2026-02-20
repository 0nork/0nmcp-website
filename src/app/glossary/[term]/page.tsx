import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import glossaryData from '@/data/glossary.json'

type GlossaryTerm = (typeof glossaryData.terms)[number]

function findTerm(slug: string): GlossaryTerm | undefined {
  return glossaryData.terms.find((t) => t.slug === slug)
}

function findRelated(term: GlossaryTerm): GlossaryTerm[] {
  return term.related
    .map((slug) => glossaryData.terms.find((t) => t.slug === slug))
    .filter((t): t is GlossaryTerm => !!t)
}

const categoryLabels: Record<string, string> = {
  core: '0nMCP Core',
  execution: 'Execution Patterns',
  automation: 'Automation',
  integration: 'Integration',
  security: 'Security',
  ai: 'AI & LLMs',
  architecture: 'Architecture',
  development: 'Development',
  services: 'Services',
  seo: 'SEO',
}

export async function generateStaticParams() {
  return glossaryData.terms.map((t) => ({ term: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term: slug } = await params
  const term = findTerm(slug)

  if (!term) return { title: 'Term Not Found — 0nMCP Glossary' }

  const title = `What is ${term.term}? — AI Orchestration Glossary`
  const description = term.definition.slice(0, 155)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://0nmcp.com/glossary/${term.slug}`,
      type: 'article',
    },
    alternates: { canonical: `https://0nmcp.com/glossary/${term.slug}` },
  }
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ term: string }> }) {
  const { term: slug } = await params
  const term = findTerm(slug)

  if (!term) notFound()

  const related = findRelated(term)
  const sameCategory = glossaryData.terms
    .filter((t) => t.category === term.category && t.slug !== term.slug)
    .slice(0, 5)

  const definedTermJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.definition,
    url: `https://0nmcp.com/glossary/${term.slug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'AI Orchestration Glossary',
      url: 'https://0nmcp.com/glossary',
    },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${term.term}?`,
        acceptedAnswer: { '@type': 'Answer', text: term.definition },
      },
      {
        '@type': 'Question',
        name: `How does ${term.term} relate to AI orchestration?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${term.term} is a key concept in the ${categoryLabels[term.category] || term.category} domain of AI orchestration. ${term.definition}`,
        },
      },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://0nmcp.com/glossary' },
      { '@type': 'ListItem', position: 3, name: term.term, item: `https://0nmcp.com/glossary/${term.slug}` },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/glossary" className="hover:underline">Glossary</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>{term.term}</span>
        </nav>

        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider"
          style={{ background: 'var(--accent)', color: 'var(--bg-primary)', opacity: 0.9 }}
        >
          {categoryLabels[term.category] || term.category}
        </span>

        <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          What is {term.term}?
        </h1>

        <article className="mt-6">
          <div
            className="rounded-xl p-6 text-base leading-relaxed"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {term.definition}
          </div>

          {/* Related Terms */}
          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Related Terms</h2>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/glossary/${r.slug}`}
                    className="text-xs px-3 py-1.5 rounded-full no-underline font-semibold transition-colors"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent)' }}
                  >
                    {r.term}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* More in this category */}
          {sameCategory.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                More in {categoryLabels[term.category] || term.category}
              </h2>
              <div className="grid gap-2">
                {sameCategory.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/glossary/${t.slug}`}
                    className="rounded-lg p-3 no-underline transition-all group"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-sm font-bold group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                      {t.term}
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                      {t.definition.slice(0, 80)}...
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div
            className="mt-10 rounded-xl p-6 text-center"
            style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}
          >
            <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              See {term.term} in action with 0nMCP
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              545 tools. 26 services. One npm install.
            </p>
            <Link
              href="/turn-it-on"
              className="inline-block px-5 py-2 rounded-xl font-bold text-sm no-underline"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              Get Started
            </Link>
          </div>
        </article>

        <div className="mt-8 flex justify-between">
          <Link href="/glossary" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; All terms
          </Link>
          <Link href="/forum" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Ask a question &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
