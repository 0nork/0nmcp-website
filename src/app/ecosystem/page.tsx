import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { ECOSYSTEM_APPS } from '@/lib/ecosystem'

export const dynamic = 'force-static'

const SITE = 'https://www.0nmcp.com'

const TITLE = '0n Apps — Products Built on 0nMCP'
const DESCRIPTION =
  'The 0n Apps run on 0nMCP: 1,640+ tools across 109 services. Each app is a purpose-built surface on top of the same orchestration layer.'

export const metadata: Metadata = {
  title: `${TITLE} | 0nMCP`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}/ecosystem` },
  openGraph: {
    title: `${TITLE} | 0nMCP`,
    description: DESCRIPTION,
    url: `${SITE}/ecosystem`,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} | 0nMCP`, description: DESCRIPTION },
}

export default function EcosystemHub() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: TITLE,
      description: DESCRIPTION,
      url: `${SITE}/ecosystem`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '0n Apps built on 0nMCP',
      itemListElement: ECOSYSTEM_APPS.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: a.name,
        url: `${SITE}/ecosystem/${a.slug}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: '0n Apps', item: `${SITE}/ecosystem` },
      ],
    },
  ]

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
          <span className="text-white/70">0n Apps</span>
        </nav>

        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">0n Apps</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
          Every 0n app runs on 0nMCP — the same orchestration layer, the same{' '}
          <Link href="/integrations" className="font-semibold text-violet-300 hover:underline">
            1,640+ tools across 109 services
          </Link>
          . Each one is a purpose-built surface on top of it rather than a separate stack.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ECOSYSTEM_APPS.map((a) => (
            <Link
              key={a.slug}
              href={`/ecosystem/${a.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-violet-500/35"
            >
              <h2 className="flex items-center justify-between font-bold text-white">
                {a.name}
                <ArrowRight className="h-4 w-4 text-violet-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-violet-300/70">
                {a.primaryKeyword}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{a.tagline}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/45">
          More apps are being added. Each gets a full page here as it ships.
        </p>
      </main>
    </>
  )
}
