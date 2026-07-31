import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import Homepage from '@/components/Homepage'

export const metadata: Metadata = {
  title: '0nMCP — The Universal AI API Orchestrator',
  description:
    `The universal AI API orchestrator. ${STATS_DISPLAY.tools}+ tools across ${STATS_DISPLAY.services} services. One install. Zero config. MIT licensed. Powered by 5 patented technologies.`,
  keywords: [
    '0nMCP', 'MCP server', 'AI orchestrator', 'API integration',
    'workflow automation', 'Model Context Protocol', 'AI tools',
  ],
  openGraph: {
    title: '0nMCP — The Universal AI API Orchestrator',
    description: `${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. One command. MIT licensed.`,
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — The Universal AI API Orchestrator',
    description: `${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. One command. MIT licensed.`,
  },
  alternates: { canonical: 'https://www.0nmcp.com' },
}

/**
 * Homepage structured data.
 *
 * The homepage shipped ZERO JSON-LD — confirmed by running our own tech scanner
 * against it: "No structured data. Nothing tells an engine what this business is
 * or what it sells." Every child page had schema; the one page every AI engine
 * reaches first had none.
 *
 * FAQs are also RENDERED VISIBLY further down the page. Schema describing markup
 * that is not on the page is the mismatch that costs more than it earns — an
 * engine will not cite an answer it cannot see, and a FAQPage block with no
 * visible counterpart is exactly the pattern that gets discounted.
 */
const FAQS = [
  {
    q: 'What is 0nMCP?',
    a: `0nMCP is a universal AI API orchestrator — a single Model Context Protocol server that gives any AI assistant access to ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services, from one install with no per-service integration work.`,
  },
  {
    q: 'What is the Model Context Protocol?',
    a: 'The Model Context Protocol (MCP) is an open standard that lets AI assistants call external tools and data sources through a consistent interface, instead of each application building its own bespoke integration for every service.',
  },
  {
    q: 'How many services does 0nMCP connect to?',
    a: `${STATS_DISPLAY.services} services and ${STATS_DISPLAY.tools} tools — CRM, Stripe, Slack, Google Workspace, GitHub, Shopify, Supabase and more — all reachable through one connection.`,
  },
  {
    q: 'Do I need to write code to use it?',
    a: 'No. You install 0nMCP once, connect the services you use, and then describe what you want in plain English. It handles the API calls.',
  },
  {
    q: 'Is 0nMCP free?',
    a: 'There is a free tier, and the core is open source. Paid plans add higher limits and the managed products built on top of it.',
  },
  {
    q: 'Where are my API keys stored?',
    a: 'In the 0nVault — encrypted at rest, under your own account. You connect a service once and every 0n product can use it without the key being copied anywhere else.',
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.0nmcp.com/#organization',
      name: '0nMCP',
      legalName: 'RocketOpp LLC',
      url: 'https://www.0nmcp.com',
      logo: 'https://www.0nmcp.com/og-image.png',
      description: `The universal AI API orchestrator — ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services.`,
      sameAs: ['https://github.com/0nork', 'https://www.npmjs.com/package/0nmcp'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.0nmcp.com/#website',
      url: 'https://www.0nmcp.com',
      name: '0nMCP',
      publisher: { '@id': 'https://www.0nmcp.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://www.0nmcp.com/integrations?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.0nmcp.com/#software',
      name: '0nMCP',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Windows, macOS, Linux',
      url: 'https://www.0nmcp.com',
      downloadUrl: 'https://www.npmjs.com/package/0nmcp',
      softwareVersion: '4.10.0',
      description: `A single MCP server exposing ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services to any AI assistant.`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': 'https://www.0nmcp.com/#organization' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.0nmcp.com/#faq',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Homepage />
      {/* Visible counterpart to the FAQPage schema above. */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
              <p className="mt-2 leading-relaxed text-white/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
