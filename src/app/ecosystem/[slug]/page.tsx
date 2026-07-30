import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, ExternalLink } from 'lucide-react'

import { ECOSYSTEM_APPS, getApp } from '@/lib/ecosystem'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return ECOSYSTEM_APPS.map((a) => ({ slug: a.slug }))
}

const SITE = 'https://www.0nmcp.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const app = getApp(slug)
  if (!app) return {}

  // layout.tsx has no title template, so the brand is appended here.
  const title = `${app.metaTitle} | 0nMCP`
  return {
    title,
    description: app.metaDescription,
    keywords: [app.primaryKeyword, app.name, '0nMCP', 'MCP', 'AI agents'],
    alternates: { canonical: `${SITE}/ecosystem/${app.slug}` },
    openGraph: {
      title,
      description: app.metaDescription,
      url: `${SITE}/ecosystem/${app.slug}`,
      type: 'website',
      ...(app.ogImage ? { images: [{ url: app.ogImage, width: 1200, height: 630, alt: app.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: app.metaDescription,
    },
  }
}

/** Adds cross-domain attribution so clicks are traceable on arrival. */
function stamped(url: string) {
  const u = new URL(url)
  u.searchParams.set('utm_source', '0nmcp')
  u.searchParams.set('utm_medium', 'ecosystem')
  u.searchParams.set('cro9_ref', '0nmcp')
  return u.toString()
}

export default async function EcosystemAppPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const app = getApp(slug)
  if (!app) notFound()

  const pageUrl = `${SITE}/ecosystem/${app.slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: app.name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      description: app.whatItIs[0],
      url: app.url,
      // Machine-readable proof this app depends on 0nMCP. Every app page adds
      // another independent assertion that 0nMCP is the foundation.
      isBasedOn: {
        '@type': 'SoftwareApplication',
        name: '0nMCP',
        url: SITE,
        applicationCategory: 'DeveloperApplication',
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: String(Math.min(...app.offers.map((o) => o.priceUsd))),
        highPrice: String(Math.max(...app.offers.map((o) => o.priceUsd))),
        offerCount: app.offers.length,
        availability: 'https://schema.org/InStock',
        offers: app.offers.map((o) => ({
          '@type': 'Offer',
          name: o.name,
          price: String(o.priceUsd),
          priceCurrency: 'USD',
          description: o.blurb,
          url: app.url,
        })),
      },
      // No aggregateRating — see house rule 4 in lib/ecosystem/types.ts.
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: app.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: '0n Apps', item: `${SITE}/ecosystem` },
        { '@type': 'ListItem', position: 3, name: app.name, item: pageUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: app.metaTitle,
      description: app.metaDescription,
      url: pageUrl,
      dateModified: app.lastUpdated,
      isPartOf: { '@type': 'WebSite', name: '0nMCP', url: SITE },
    },
  ]

  const h2 = 'text-2xl font-bold tracking-tight text-white sm:text-3xl'
  const card = 'rounded-2xl border border-white/10 bg-white/[0.02] p-6'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-semibold text-white/40">
          <Link href="/" className="hover:text-white/70">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ecosystem" className="hover:text-white/70">0n Apps</Link>
          <span className="mx-2">/</span>
          <span className="text-white/70">{app.name}</span>
        </nav>

        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{app.h1}</h1>
        <p className="mt-4 text-lg text-white/60">{app.tagline}</p>

        {/* whatItIs[0] is emphasised because it is the sentence LLMs lift. */}
        <section className="mt-10">
          <h2 className={h2}>What {app.name} is</h2>
          <div className="mt-5 space-y-4">
            {app.whatItIs.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 font-medium leading-relaxed text-white'
                    : 'leading-relaxed text-white/65'
                }
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className={h2}>Who it is for</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {app.whoItIsFor.map((w) => (
              <li key={w} className={`${card} flex gap-3`}>
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
                <span className="text-sm leading-relaxed text-white/70">{w}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className={h2}>What it does</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {app.capabilities.map((c) => (
              <div key={c.title} className={card}>
                <h3 className="font-bold text-white">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Highest-extraction asset on the page. */}
        <section className="mt-12">
          <h2 className={h2}>{app.name} vs a conventional task manager</h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                  <th className="px-4 py-3 font-semibold">Dimension</th>
                  <th className="px-4 py-3 font-semibold text-violet-300">{app.name}</th>
                  <th className="px-4 py-3 font-semibold">Conventional tools</th>
                </tr>
              </thead>
              <tbody>
                {app.comparison.map((r) => (
                  <tr key={r.dimension} className="border-t border-white/[0.07]">
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-white/85">
                      {r.dimension}
                    </th>
                    <td className="bg-violet-500/[0.06] px-4 py-3 text-white/80">{r.app}</td>
                    <td className="px-4 py-3 text-white/55">{r.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className={h2}>Pricing</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {app.offers.map((o) => (
              <div key={o.name} className={card}>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-300">{o.name}</p>
                <p className="mt-2 font-mono text-3xl font-bold text-white">
                  ${o.priceUsd}
                  <span className="ml-1 text-sm font-normal text-white/45">
                    {o.period === 'month' ? '/mo' : 'once'}
                  </span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/60">{o.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Built on 0nMCP — body copy, with contextual internal links. */}
        <section className="mt-12">
          <h2 className={h2}>Built on 0nMCP</h2>
          <p className="mt-5 leading-relaxed text-white/70">{app.builtOn}</p>
          <ul className="mt-5 space-y-2">
            {app.crossLinks.map((l) => (
              <li key={l.href} className="text-sm text-white/60">
                <Link href={l.href} className="font-semibold text-violet-300 hover:underline">
                  {l.label}
                </Link>
                {' — '}
                {l.context}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className={h2}>Common questions</h2>
          <div className="mt-5 space-y-4">
            {app.faqs.map((f) => (
              <div key={f.q} className={card}>
                {/* H3: questions are children of the section H2, not siblings. */}
                <h3 className="font-semibold text-white">{f.q}</h3>
                <p className="mt-2 leading-relaxed text-white/65">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-cyan-500/[0.06] p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Try {app.name}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/65">{app.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={stamped(app.url)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Open {app.name} <ExternalLink className="h-4 w-4" />
            </a>
            <Link
              href="/ecosystem"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 font-semibold text-white/80 transition-colors hover:border-white/30"
            >
              All 0n Apps <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">
            Last updated {new Date(app.lastUpdated).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </section>
      </main>
    </>
  )
}
