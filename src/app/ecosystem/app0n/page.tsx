import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Clock, Smartphone } from 'lucide-react'

import InterestForm from './InterestForm'

/**
 * app0n — coming soon.
 *
 * A FOLDER ROUTE, so it beats /ecosystem/[slug] in Next's matcher. That is
 * deliberate: the shared template generates a full product page with
 * SoftwareApplication schema and an Offer, and app0n does not exist yet.
 * Publishing that would be claiming a product and a price that are not real —
 * exactly the fabrication these pages are built to avoid.
 *
 * So the schema here is WebPage only. No SoftwareApplication, no Offer, no
 * aggregateRating. When app0n ships, delete this folder and add a data file to
 * lib/ecosystem — the template takes over automatically.
 */

const SITE = 'https://www.0nmcp.com'
const title = 'app0n — Coming Soon | 0nMCP'
const description =
  'app0n is an AI app builder in development, built on 0nMCP. Join the list to hear when it opens, or ask about early investment.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE}/ecosystem/app0n` },
  openGraph: { title, description, url: `${SITE}/ecosystem/app0n`, type: 'website' },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE}/ecosystem/app0n#page`,
      url: `${SITE}/ecosystem/app0n`,
      name: title,
      description,
      // No SoftwareApplication and no Offer: the product is not released, and
      // declaring one would be a claim we cannot stand behind.
      isPartOf: { '@type': 'WebSite', name: '0nMCP', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: '0n Apps', item: `${SITE}/ecosystem` },
        { '@type': 'ListItem', position: 3, name: 'app0n', item: `${SITE}/ecosystem/app0n` },
      ],
    },
  ],
}

export default function App0nComingSoon() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/ecosystem" className="inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white/80">
          <ArrowLeft className="h-3.5 w-3.5" /> All 0n Apps
        </Link>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
          <Clock className="h-3.5 w-3.5" />
          In development
        </div>

        <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">app0n</h1>

        <p className="mt-5 text-xl leading-relaxed text-white/70">
          app0n is an AI app builder being built on 0nMCP — so anything it makes can reach the
          106 services you have already connected, rather than starting from an empty integration
          list.
        </p>

        <p className="mt-4 leading-relaxed text-white/55">
          It is not open yet, and we would rather say that plainly than publish a page pretending
          otherwise. Join the list and you will hear the moment it is.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Built on 0nMCP', d: 'Your existing connections, available on day one.' },
            { t: 'One vault', d: 'No new credentials to wire up per app.' },
            { t: 'Flow-native', d: 'What it builds can be driven by a flow.' },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <Smartphone className="h-5 w-5 text-white/40" />
              <h2 className="mt-3 text-sm font-bold text-white">{x.t}</h2>
              <p className="mt-1 text-xs leading-relaxed text-white/50">{x.d}</p>
            </div>
          ))}
        </div>

        {/* ── Investment ── */}
        <div className="mt-12 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-transparent p-6">
          <h2 className="text-lg font-bold text-white">
            Looking to invest? Early bird investment opportunities may still be available.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            0n is building the orchestration layer underneath a family of products — 0nMCP,
            0nTask, web0n, CRO9 and social0n are already live. If you want to talk about backing
            what comes next, start below and we will reply personally.
          </p>
        </div>

        <div className="mt-6">
          <InterestForm />
        </div>

        <p className="mt-10 text-sm text-white/40">
          In the meantime, the products that are live:{' '}
          <Link href="/ecosystem/0ntask" className="text-white/70 underline">0nTask</Link>,{' '}
          <Link href="/ecosystem/web0n" className="text-white/70 underline">web0n</Link>,{' '}
          <Link href="/ecosystem/cro9" className="text-white/70 underline">CRO9</Link> and{' '}
          <Link href="/ecosystem/social0n" className="text-white/70 underline">social0n</Link>.
        </p>
      </div>
    </main>
  )
}
