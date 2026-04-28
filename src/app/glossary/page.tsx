import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import glossaryData from '@/data/glossary.json'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/Reveal'
import AnimatedGrid from '@/components/AnimatedGrid'
import AnimatedConnectors from '@/components/AnimatedConnectors'

export const metadata: Metadata = {
  title: 'AI Orchestration Glossary — 0nMCP',
  description:
    'Complete glossary of AI orchestration, MCP, automation, and API integration terminology. 80+ terms defined for developers, AI engineers, and automation professionals.',
  openGraph: {
    title: 'AI Orchestration Glossary — 0nMCP',
    description:
      'Complete glossary of AI orchestration, MCP, automation, and API integration terminology.',
    url: 'https://www.0nmcp.com/glossary',
  },
  alternates: { canonical: 'https://www.0nmcp.com/glossary' },
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

const categoryOrder = [
  'core',
  'execution',
  'automation',
  'integration',
  'security',
  'ai',
  'architecture',
  'development',
  'services',
  'seo',
]

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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://www.0nmcp.com/glossary' },
    ],
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <AnimatedGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6EE05A]/[0.06] blur-[140px]"
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-36 lg:pb-20">
          <Reveal direction="up">
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-[#6EE05A]">Home</Link>
              <span>/</span>
              <span className="text-[#6EE05A]">Glossary</span>
            </div>
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
              <BookOpen className="mr-1.5 h-3 w-3 text-[#6EE05A]" />
              {terms.length} terms · 10 categories
            </Badge>
            <h1 className="text-balance text-5xl font-black tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                AI Orchestration Glossary.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              Plain-English definitions for AI orchestration, MCP, workflow automation, API integration,
              and the broader ecosystem. The definitive reference for anyone building with AI-native tools.
            </p>
          </Reveal>

          {/* Quick category nav */}
          <Reveal direction="up" delay={120}>
            <div className="mt-10 flex flex-wrap gap-2">
              {categoryOrder.map((cat) =>
                grouped[cat] ? (
                  <a
                    key={cat}
                    href={`#${cat}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm font-semibold text-white/80 backdrop-blur transition-colors hover:border-[#6EE05A]/40 hover:bg-card hover:text-[#6EE05A]"
                  >
                    {categoryLabels[cat]}
                    <span className="rounded-full bg-[#6EE05A]/10 px-2 py-0.5 font-mono text-[10px] text-[#6EE05A]">
                      {grouped[cat].length}
                    </span>
                  </a>
                ) : null,
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ TERM GROUPS ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <AnimatedConnectors intensity={0.18} />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          {categoryOrder.map((cat, ci) => {
            const catTerms = grouped[cat]
            if (!catTerms) return null
            return (
              <Reveal key={cat} direction="up" delay={ci * 60}>
                <section id={cat} className="scroll-mt-24 mb-16 last:mb-0">
                  <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
                    <h2 className="text-2xl font-black tracking-tight">
                      <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                        {categoryLabels[cat]}
                      </span>
                    </h2>
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {catTerms.length} {catTerms.length === 1 ? 'term' : 'terms'}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {catTerms.map((term, ti) => (
                      <Reveal key={term.slug} delay={ti * 30} direction="up">
                        <Link href={`/glossary/${term.slug}`} className="group block">
                          <Card className="h-full border-border/60 bg-card/40 backdrop-blur transition-colors hover:border-[#6EE05A]/40 hover:bg-card/70">
                            <CardContent className="space-y-2 py-5">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base text-white group-hover:text-[#6EE05A]">
                                  {term.term}
                                </CardTitle>
                                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-[#6EE05A] group-hover:opacity-100" />
                              </div>
                              <CardDescription className="text-sm leading-relaxed text-white/70">
                                {term.definition.length > 180
                                  ? term.definition.slice(0, 180) + '…'
                                  : term.definition}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        </Link>
                      </Reveal>
                    ))}
                  </div>
                </section>
              </Reveal>
            )
          })}

          <Reveal direction="up">
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7 text-base font-bold">
                <Link href="/what-is-0nmcp">
                  What is 0nMCP?
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <Link href="/turn-it-on">Browse 150+ integrations</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
