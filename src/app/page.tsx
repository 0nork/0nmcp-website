import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import AgencyHomepage from '@/components/AgencyHomepage'

export const metadata: Metadata = {
  title: 'White-Label AI for Agencies — US-Based Agency CRM & Copilot | 0nMCP',
  description:
    `The white-label AI engine behind the agency stack. Agency copilot, US-based agency CRM and client portals on one connection to ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services. Stalled build? A US-based partner finishes it, under your brand.`,
  // Written for the agency owner with a half-built app, not for someone
  // shopping for an MCP server. The old set ranked us against developer tools
  // and never against the phrase this buyer actually types.
  keywords: [
    'white label AI for agencies', 'white label agency AI platform',
    'US based agency CRM', 'agency copilot', 'AI copilot for agencies',
    'marketing agency consultant', 'marketing agency AI consultant',
    'US based development partner', 'finish my half built app',
    'agency automation platform', 'white label client portal',
    'AI infrastructure for agencies', '0nMCP', 'MCP server',
  ],
  openGraph: {
    title: 'White-Label AI for Agencies — US-Based Agency CRM & Copilot | 0nMCP',
    description: `Your app is half built. Your developer stopped replying. We are the US-based engine that finishes it — white-labelled, under your brand.`,
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'White-Label AI for Agencies — US-Based Agency CRM & Copilot | 0nMCP',
    description: `Your app is half built. Your developer stopped replying. We are the US-based engine that finishes it — white-labelled, under your brand.`,
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
    q: 'What does 0nMCP actually do for an agency?',
    a: `It is the engine your agency products run on. One connection reaches ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services — CRM, Stripe, Google, Slack, Shopify and more — so an agency copilot, a white-label CRM and client portals all work without you building and maintaining ${STATS_DISPLAY.services} separate integrations.`,
  },
  {
    q: 'Is this white-label? Will my clients know you exist?',
    a: 'It is white-label end to end, and no. You resell the stack under your own brand, your own domain and your own pricing, and you keep the client relationship. We never sell to your clients.',
  },
  {
    q: 'Are you US-based?',
    a: 'Yes. RocketOpp LLC is a registered US company based in Pennsylvania, working Eastern time. You get an owner on the phone rather than a ticket queue or a rotating offshore account manager.',
  },
  {
    q: 'My app is half built and my developer disappeared. Can you finish it?',
    a: 'That is the most common reason agencies come to us. We start by reading what actually exists — repo, dashboard, whatever there is — and give you an honest inventory plus an ordered list of what is left with real dates. Most of what a stalled build needs already exists on the engine, so the remaining work is usually connecting rather than rebuilding.',
  },
  {
    q: 'What is the Agency Copilot?',
    a: 'A command surface where your operators describe an outcome in plain English and it happens across every client account — under your logo. Nothing runs before someone approves it, and every action leaves a receipt in plain English.',
  },
  {
    q: 'What is included in the US-based agency CRM?',
    a: 'Contacts, pipelines, conversations, calendars and billing — the full operating layer, white-labelled, with the AI already wired in rather than bolted on afterwards.',
  },
  {
    q: 'Do you do consulting, or only software?',
    a: 'Both. Marketing agency consulting is part of the engagement, because deciding what to build is usually worth more than building it. If we think you should not build something, we say so.',
  },
  {
    q: 'Where are my API keys stored?',
    a: 'In the 0nVault — encrypted at rest under your own account. You connect a service once and every product you build can use it without the key being copied anywhere else.',
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
      description: `The white-label AI engine behind the agency stack — an agency copilot, a US-based agency CRM and client portals on one connection to ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services.`,
      // Stated in the schema, not only in the copy. "US-based" is the claim this
      // buyer has been burned on, and an engine that can read the country off
      // the organization is more use than a flag icon on the page.
      address: { '@type': 'PostalAddress', addressCountry: 'US', addressRegion: 'PA' },
      areaServed: { '@type': 'Country', name: 'United States' },
      sameAs: ['https://github.com/0nork', 'https://www.npmjs.com/package/0nmcp'],
    },
    {
      '@type': 'Service',
      '@id': 'https://www.0nmcp.com/#agency-service',
      name: 'White-label AI platform for agencies',
      serviceType: 'White-label AI infrastructure, agency copilot and US-based agency CRM',
      provider: { '@id': 'https://www.0nmcp.com/#organization' },
      areaServed: { '@type': 'Country', name: 'United States' },
      audience: { '@type': 'Audience', audienceType: 'Marketing agencies' },
      description:
        'White-label AI infrastructure for marketing agencies: an agency copilot, a US-based agency CRM, client portals, and consulting to finish stalled or half-built applications under the agency own brand.',
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
      <AgencyHomepage />
      {/* Visible counterpart to the FAQPage schema above. An engine will not
          cite an answer it cannot see, and a FAQPage block with no rendered
          counterpart is the exact pattern that gets discounted. */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-3xl font-black tracking-tight text-[#f0f4f8]">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-[#30363d] bg-white/[0.02] p-5 transition-colors hover:border-[#6EE05A]/40">
              <summary className="cursor-pointer list-none font-semibold text-[#f0f4f8] marker:hidden">{f.q}</summary>
              <p className="mt-3 leading-relaxed text-[#8b949e]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
