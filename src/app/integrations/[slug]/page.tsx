import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'

type Service = (typeof servicesData.services)[number]
type Capability = (typeof capabilitiesData.capabilities)[number]

const logicServices = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']

function findService(slug: string): Service | undefined {
  return servicesData.services.find((s) => s.slug === slug && !logicServices.includes(s.id))
}

function getCapabilities(serviceId: string): { asTrigger: Capability[]; asAction: Capability[] } {
  const all = capabilitiesData.capabilities
  return {
    asTrigger: all.filter((c) => c.trigger_service === serviceId),
    asAction: all.filter((c) => c.action_service === serviceId),
  }
}

function getConnectedServices(serviceId: string): Service[] {
  const caps = capabilitiesData.capabilities
  const connectedIds = new Set<string>()
  caps.forEach((c) => {
    if (c.trigger_service === serviceId && c.action_service) connectedIds.add(c.action_service)
    if (c.action_service === serviceId && c.trigger_service) connectedIds.add(c.trigger_service)
  })
  connectedIds.delete(serviceId)
  return servicesData.services.filter((s) => connectedIds.has(s.id) && !logicServices.includes(s.id))
}

function serviceName(id: string | undefined): string {
  if (!id) return 'Unknown'
  return servicesData.services.find((s) => s.id === id)?.name || id
}

export async function generateStaticParams() {
  return servicesData.services
    .filter((s) => !logicServices.includes(s.id))
    .map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = findService(slug)

  if (!service) return { title: 'Integration Not Found — 0nMCP' }

  const caps = getCapabilities(service.id)
  const total = caps.asTrigger.length + caps.asAction.length

  const title = `${service.name} Integration — Connect with AI | 0nMCP`
  const description = `Connect ${service.name} to ${total > 0 ? total + ' automations across ' : ''}26 services using AI-powered orchestration. No code required — describe what you want and 0nMCP handles the rest.`

  return {
    title,
    description: description.slice(0, 155),
    openGraph: { title, description: description.slice(0, 155), url: `https://0nmcp.com/integrations/${service.slug}` },
    alternates: { canonical: `https://0nmcp.com/integrations/${service.slug}` },
  }
}

export default async function IntegrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = findService(slug)

  if (!service) notFound()

  const caps = getCapabilities(service.id)
  const connected = getConnectedServices(service.id)
  const totalCaps = caps.asTrigger.length + caps.asAction.length

  const howToJsonLd = totalCaps > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to connect ${service.name} with 0nMCP`,
    description: `Set up ${service.name} integration with AI-powered orchestration in minutes.`,
    step: [
      { '@type': 'HowToStep', name: 'Install 0nMCP', text: 'Run npm install -g 0nmcp to install the universal AI orchestrator.' },
      { '@type': 'HowToStep', name: `Add ${service.name} credentials`, text: `Import your ${service.name} API key using 0nmcp engine import or add it to your .0n config.` },
      { '@type': 'HowToStep', name: 'Connect your AI', text: 'Configure your AI client (Claude, Cursor, etc.) to use 0nMCP as an MCP server.' },
      { '@type': 'HowToStep', name: 'Describe your automation', text: `Tell your AI what you want to do with ${service.name} in natural language. 0nMCP handles the rest.` },
    ],
  } : null

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I connect ${service.name} to 0nMCP?`,
        acceptedAnswer: { '@type': 'Answer', text: `Install 0nMCP (npm install -g 0nmcp), add your ${service.name} API credentials, and connect your AI client. You can then automate ${service.name} using natural language.` },
      },
      {
        '@type': 'Question',
        name: `What can I automate with ${service.name} and 0nMCP?`,
        acceptedAnswer: { '@type': 'Answer', text: `0nMCP provides ${totalCaps} pre-built automations for ${service.name}, connecting it to ${connected.length} other services. You can also create custom automations by describing them in natural language.` },
      },
      {
        '@type': 'Question',
        name: `Is the ${service.name} integration free?`,
        acceptedAnswer: { '@type': 'Answer', text: `Yes. 0nMCP is open source (MIT licensed) and free for local use. Marketplace executions are $0.10 each with no monthly subscription.` },
      },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://0nmcp.com/integrations' },
      { '@type': 'ListItem', position: 3, name: service.name, item: `https://0nmcp.com/integrations/${service.slug}` },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {howToJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/integrations" className="hover:underline">Integrations</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>{service.name}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          {service.name} Integration
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          Connect {service.name} to {connected.length > 0 ? `${connected.length} services` : 'your entire stack'} with AI-powered orchestration.
          {totalCaps > 0 ? ` ${totalCaps} pre-built automations ready to go.` : ' Full API access through 0nMCP tools.'}
        </p>

        {/* Quick setup */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Setup</h2>
          <div className="grid gap-3">
            {[
              { step: '1', title: 'Install 0nMCP', desc: 'npm install -g 0nmcp' },
              { step: '2', title: `Add ${service.name} credentials`, desc: '0nmcp engine import — auto-detects your API keys' },
              { step: '3', title: 'Connect your AI', desc: 'Works with Claude, Cursor, Windsurf, Gemini, and more' },
              { step: '4', title: 'Automate', desc: `"Send a ${service.name} notification when..." — describe it, 0nMCP does it` },
            ].map((s) => (
              <div key={s.step} className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <span className="text-xs font-black rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
                  {s.step}
                </span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Automations as trigger */}
        {caps.asTrigger.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              When {service.name} triggers...
            </h2>
            <div className="grid gap-2">
              {caps.asTrigger.map((cap) => (
                <Link
                  key={cap.slug}
                  href={`/turn-it-on/${cap.slug}`}
                  className="rounded-xl p-4 no-underline transition-all group"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                    {cap.name}
                  </h3>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{cap.description}</p>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{service.name} &rarr; {serviceName(cap.action_service)}</span>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,107,53,0.08)', color: 'var(--accent)' }}>
                      {cap.pricing_tier}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Automations as action */}
        {caps.asAction.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              ...sends to {service.name}
            </h2>
            <div className="grid gap-2">
              {caps.asAction.map((cap) => (
                <Link
                  key={cap.slug}
                  href={`/turn-it-on/${cap.slug}`}
                  className="rounded-xl p-4 no-underline transition-all group"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                    {cap.name}
                  </h3>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{cap.description}</p>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{serviceName(cap.trigger_service)} &rarr; {service.name}</span>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,107,53,0.08)', color: 'var(--accent)' }}>
                      {cap.pricing_tier}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Connected services */}
        {connected.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Services that connect to {service.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {connected.map((s) => (
                <Link
                  key={s.slug}
                  href={`/integrations/${s.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full no-underline font-semibold transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent)' }}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>FAQ</h2>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>How do I connect {service.name}?</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Install 0nMCP, add your {service.name} API credentials via the Engine, and start automating with natural language.</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Is it free?</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Yes. 0nMCP is open source (MIT). Local execution is free. Marketplace executions cost $0.10 each.</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>What AI clients work with this?</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, and any MCP-compatible client.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
          <p className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Start automating {service.name}</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>One npm install. AI-native. Free and open source.</p>
          <Link
            href="/turn-it-on"
            className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm no-underline"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            Turn It 0n
          </Link>
        </div>

        <div className="mt-8 flex justify-between">
          <Link href="/integrations" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; All integrations
          </Link>
          <Link href={`/turn-it-on/${service.slug}`} className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Full service details &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
