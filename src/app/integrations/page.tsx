import type { Metadata } from 'next'
import Link from 'next/link'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'

export const metadata: Metadata = {
  title: 'Integrations — Connect 26 Services with AI | 0nMCP',
  description: 'Browse all 0nMCP integrations. Connect Gmail, Slack, Stripe, CRM, Shopify, and 21 more services with AI-powered orchestration. 80+ pre-built automations.',
  openGraph: {
    title: 'Integrations — Connect 26 Services with AI | 0nMCP',
    description: '80+ pre-built automations across 26 services. AI-native API orchestration.',
    url: 'https://0nmcp.com/integrations',
  },
  alternates: { canonical: 'https://0nmcp.com/integrations' },
}

const logicServices = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']

export default function IntegrationsPage() {
  const services = servicesData.services.filter((s) => !logicServices.includes(s.id))
  const capabilities = capabilitiesData.capabilities

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://0nmcp.com/integrations' },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '0nMCP Integrations',
    description: '26 service integrations with 80+ pre-built automations for AI-powered orchestration.',
    url: 'https://0nmcp.com/integrations',
    numberOfItems: services.length,
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Integrations</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          Integrations
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          {services.length} services. {capabilities.length}+ pre-built automations. Connect anything to anything with AI-native orchestration.
        </p>

        {/* Service grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((service) => {
            const capCount = capabilities.filter(
              (c) => c.trigger_service === service.id || c.action_service === service.id
            ).length

            return (
              <Link
                key={service.slug}
                href={`/integrations/${service.slug}`}
                className="rounded-xl p-4 no-underline transition-all group"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                  {service.name}
                </h2>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  {capCount > 0 ? `${capCount} automation${capCount !== 1 ? 's' : ''}` : 'Direct API access'}
                </p>
                <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(255,107,53,0.08)', color: 'var(--accent)' }}>
                  View integration &rarr;
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-xl p-6 text-center" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
          <p className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Don&apos;t see your service?
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            0nMCP is extensible — connect any REST API with custom tools. More services unlock as the community grows.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/turn-it-on" className="inline-block px-5 py-2 rounded-xl font-bold text-sm no-underline" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
              Get Started
            </Link>
            <Link href="/community" className="inline-block px-5 py-2 rounded-xl font-bold text-sm no-underline" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Request Integration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
