import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'
import {
  getServiceBySlug,
  getServiceById,
  getCapabilityBySlug,
  getCategoryById,
  getCapabilitiesForService,
  getRelatedByTrigger,
  getRelatedByAction,
  getServicesInCategory,
  getActionServiceId,
  isServiceSlug,
} from '@/lib/sxo-helpers'
import ServiceLogo from '@/components/ServiceLogo'
import CapabilityHero from '@/components/turn-it-on/CapabilityHero'
import WorkflowDiagram from '@/components/turn-it-on/WorkflowDiagram'
import ComparisonTable from '@/components/turn-it-on/ComparisonTable'
import ConfigSnippet from '@/components/turn-it-on/ConfigSnippet'
import RelatedCapabilities from '@/components/turn-it-on/RelatedCapabilities'
import FAQSection from '@/components/turn-it-on/FAQSection'

// Generate static params for both services (26) and capabilities (126) = 152 pages
export function generateStaticParams() {
  const serviceParams = servicesData.services.map((s) => ({ slug: s.slug }))
  const capParams = capabilitiesData.capabilities.map((c) => ({ slug: c.slug }))
  return [...serviceParams, ...capParams]
}

// Dynamic metadata
export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    // Check if it's a service page
    if (isServiceSlug(slug)) {
      const service = getServiceBySlug(slug)!
      return {
        title: `Turn ${service.name} 0n — ${service.tool_count} Tools | 0nMCP`,
        description: service.description_long,
        keywords: service.sxo_keywords,
        openGraph: {
          title: `Turn ${service.name} 0n — ${service.tool_count} Tools | 0nMCP`,
          description: service.description_short,
          url: `https://0nmcp.com/turn-it-on/${slug}`,
        },
        alternates: {
          canonical: `https://0nmcp.com/turn-it-on/${slug}`,
        },
      }
    }

    // Check if it's a capability page
    const capability = getCapabilityBySlug(slug)
    if (capability) {
      const triggerService = getServiceById(capability.trigger_service)
      const actionServiceId = getActionServiceId(capability)
      const actionService = actionServiceId ? getServiceById(actionServiceId) : undefined
      const triggerName = triggerService?.name || capability.trigger_service
      const actionName = actionService?.name || 'Multiple Services'

      return {
        title: `Connect ${triggerName} to ${actionName} — Automate with 0nMCP`,
        description: capability.description,
        keywords: capability.sxo_queries,
        openGraph: {
          title: `Connect ${triggerName} to ${actionName} — Automate with 0nMCP`,
          description: capability.description,
          url: `https://0nmcp.com/turn-it-on/${slug}`,
        },
        alternates: {
          canonical: `https://0nmcp.com/turn-it-on/${slug}`,
        },
      }
    }

    return {
      title: 'Not Found | 0nMCP',
    }
  })
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Route to the correct page type
  if (isServiceSlug(slug)) {
    return <ServicePage slug={slug} />
  }

  const capability = getCapabilityBySlug(slug)
  if (capability) {
    return <CapabilityPage slug={slug} />
  }

  notFound()
}

// ============================================================
// SERVICE PAGE (26 pages)
// ============================================================

function ServicePage({ slug }: { slug: string }) {
  const service = getServiceBySlug(slug)!
  const category = getCategoryById(service.category_id)
  const capabilities = getCapabilitiesForService(service.id)
  const relatedServices = getServicesInCategory(service.category_id).filter(
    (s) => s.slug !== slug
  )

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to connect ${service.name} with 0nMCP`,
    description: service.description_long,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Install 0nMCP',
        text: 'Run "npx 0nmcp" in your terminal to install the universal AI API orchestrator.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: `Connect ${service.name}`,
        text: `Provide your ${service.name} API key when prompted. 0nMCP securely stores it using AES-256-GCM encryption.`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Describe your automation',
        text: `Tell 0nMCP what you want to do with ${service.name} in plain English. It handles the rest.`,
      },
    ],
    tool: {
      '@type': 'SoftwareApplication',
      name: '0nMCP',
      url: 'https://0nmcp.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="section-container text-center">
          <div className="inline-block mb-6">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                fontFamily: 'var(--font-mono)',
                color:
                  service.status === 'live' ? 'var(--accent)' : '#00d4ff',
                backgroundColor:
                  service.status === 'live'
                    ? 'rgba(126, 217, 87, 0.1)'
                    : 'rgba(0, 212, 255, 0.1)',
                border: `1px solid ${
                  service.status === 'live'
                    ? 'rgba(126, 217, 87, 0.2)'
                    : 'rgba(0, 212, 255, 0.2)'
                }`,
              }}
            >
              {service.status === 'live' ? 'Live' : 'Federated'}
            </span>
          </div>

          <span className="mb-6 block">
            <ServiceLogo src={(service as Record<string, unknown>).logo as string | undefined} alt={service.name} size={64} icon={service.icon} />
          </span>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ letterSpacing: '-0.03em' }}
          >
            Turn{' '}
            <span style={{ color: 'var(--accent)' }}>{service.name}</span>{' '}
            0n
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {service.description_long}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {service.tool_count}
              </div>
              <div
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Tools
              </div>
            </div>
            <div
              className="w-px h-10"
              style={{ backgroundColor: 'var(--border)' }}
            />
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {capabilities.length}
              </div>
              <div
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Automations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      {capabilities.length > 0 && (
        <section className="py-10">
          <div className="section-container">
            <h2
              className="text-2xl md:text-3xl font-bold mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              What you can automate with {service.name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities.map((cap) => {
                const trigger = getServiceById(cap.trigger_service)
                const capActionId = getActionServiceId(cap)
                const action = capActionId ? getServiceById(capActionId) : undefined

                return (
                  <Link
                    key={cap.slug}
                    href={`/turn-it-on/${cap.slug}`}
                    className="glow-box group"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ServiceLogo src={(trigger as Record<string, unknown> | undefined)?.logo as string | undefined} alt={trigger?.name ?? ''} size={20} icon={trigger?.icon} />
                      <span
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        &rarr;
                      </span>
                      <ServiceLogo src={(action as Record<string, unknown> | undefined)?.logo as string | undefined} alt={action?.name ?? ''} size={20} icon={action?.icon} />
                    </div>
                    <span
                      className="text-sm font-medium block mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {cap.name}
                    </span>
                    <span
                      className="text-xs block line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {cap.description}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tools List */}
      <section className="py-10">
        <div className="section-container">
          <h2
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: 'var(--text-primary)' }}
          >
            {service.tool_count} {service.name} Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(service.tools ?? []).map((tool) => (
              <div
                key={tool.id}
                className="px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  className="text-sm font-medium block mb-0.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {tool.name}
                </span>
                <span
                  className="text-xs block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {(tool as { id: string; name: string; description?: string }).description || tool.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="py-10">
          <div className="section-container">
            <h2
              className="text-2xl md:text-3xl font-bold mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              More in {category?.label || 'this category'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {relatedServices.slice(0, 8).map((s) => (
                <Link
                  key={s.slug}
                  href={`/turn-it-on/${s.slug}`}
                  className="glow-box flex items-center gap-3"
                  style={{ textDecoration: 'none' }}
                >
                  <ServiceLogo src={(s as Record<string, unknown>).logo as string | undefined} alt={s.name} size={28} icon={s.icon} />
                  <div>
                    <span
                      className="text-sm font-semibold block"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {s.name}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {s.tool_count} tools
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Install CTA */}
      <section className="py-20">
        <div className="section-container text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Start using {service.name} with AI
          </h2>
          <p
            className="text-lg mb-8 max-w-lg mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            {service.tool_count} tools, zero configuration. One command.
          </p>
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--accent)',
              boxShadow: '0 0 30px rgba(126, 217, 87, 0.1)',
            }}
          >
            <span
              className="text-lg font-bold"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
              }}
            >
              npx 0nmcp
            </span>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================================
// CAPABILITY PAGE (126 pages — Full SXO Template)
// ============================================================

function CapabilityPage({ slug }: { slug: string }) {
  const capability = getCapabilityBySlug(slug)!
  const triggerService = getServiceById(capability.trigger_service)
  const actionServiceId = getActionServiceId(capability)
  const actionService = actionServiceId ? getServiceById(actionServiceId) : undefined
  const triggerName = triggerService?.name || capability.trigger_service
  const actionName = actionService?.name || ''
  const triggerLogo = (triggerService as Record<string, unknown> | undefined)?.logo as string | null ?? null
  const actionLogo = (actionService as Record<string, unknown> | undefined)?.logo as string | null ?? null
  const triggerIcon = triggerService?.icon
  const actionIcon = actionService?.icon

  // Related capabilities
  const relatedByTrigger = getRelatedByTrigger(
    capability.trigger_service,
    slug,
    6
  )
  const relatedByAction = actionServiceId
    ? getRelatedByAction(actionServiceId, slug, 6)
    : []

  // Schema.org HowTo
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to connect ${triggerName} to ${actionName || 'multiple services'} with 0nMCP`,
    description: capability.description,
    totalTime: 'PT1M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Install 0nMCP',
        text: 'Run "npx 0nmcp" in your terminal to install the universal AI API orchestrator.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Connect your services',
        text: `Provide your ${triggerName}${actionName ? ` and ${actionName}` : ''} API keys when prompted.`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Describe your workflow',
        text: `Tell 0nMCP: "${capability.description}" and it handles the rest automatically.`,
      },
    ],
    tool: {
      '@type': 'SoftwareApplication',
      name: '0nMCP',
      url: 'https://0nmcp.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Section 1: CapabilityHero */}
      <CapabilityHero
        triggerName={triggerName}
        actionName={actionName}
        description={capability.description}
        slug={slug}
      />

      {/* Section 2: 3-Step How It Works */}
      <section className="py-16" id="how-it-works">
        <div className="section-container">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: 'var(--text-primary)' }}
          >
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Install 0nMCP"
              description="One command. No sign-ups, no accounts, no credit cards."
              code="npx 0nmcp"
            />
            <StepCard
              number="2"
              title="Connect your services"
              description={`Add your ${triggerName}${
                actionName ? ` and ${actionName}` : ''
              } API keys. Encrypted locally with AES-256-GCM.`}
            />
            <StepCard
              number="3"
              title="Describe your workflow"
              description="Tell the AI what you want in plain English. No drag-and-drop, no flowcharts."
            />
          </div>
        </div>
      </section>

      {/* Section 3: WorkflowDiagram */}
      {actionName && (
        <WorkflowDiagram
          triggerLogo={triggerLogo}
          triggerName={triggerName}
          actionLogo={actionLogo}
          actionName={actionName}
          triggerIcon={triggerIcon}
          actionIcon={actionIcon}
        />
      )}

      {/* Section 4: ConfigSnippet */}
      {capability.dot_0n_config && actionName && (
        <ConfigSnippet
          config={capability.dot_0n_config}
          triggerName={triggerName}
          actionName={actionName}
        />
      )}

      {/* Section 5: ComparisonTable */}
      <ComparisonTable />

      {/* Section 6: Related Capabilities */}
      <section className="py-16">
        <div className="section-container">
          <h2
            className="text-2xl md:text-3xl font-bold mb-10"
            style={{ color: 'var(--text-primary)' }}
          >
            Related Automations
          </h2>

          <RelatedCapabilities
            title={`Other ${triggerName} automations`}
            capabilities={relatedByTrigger.map((c) => ({
              slug: c.slug,
              name: c.name,
            }))}
          />

          {actionName && (
            <RelatedCapabilities
              title={`Other ${actionName} automations`}
              capabilities={relatedByAction.map((c) => ({
                slug: c.slug,
                name: c.name,
              }))}
            />
          )}
        </div>
      </section>

      {/* Section 7: FAQ */}
      <FAQSection triggerName={triggerName} actionName={actionName} />

      {/* Section 8: CTA Footer */}
      <section className="py-20">
        <div className="section-container text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready to connect {triggerName}
            {actionName ? ` to ${actionName}` : ''}?
          </h2>
          <p
            className="text-lg mb-8 max-w-lg mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            One command. Free. No monthly fees. No vendor lock-in.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div
              className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--accent)',
                boxShadow: '0 0 30px rgba(126, 217, 87, 0.1)',
              }}
            >
              <span
                className="text-lg font-bold"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                }}
              >
                npx 0nmcp
              </span>
            </div>
            <Link
              href="/turn-it-on"
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              &larr; Browse all integrations
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function StepCard({
  number,
  title,
  description,
  code,
}: {
  number: string
  title: string
  description: string
  code?: string
}) {
  return (
    <div className="glow-box text-center">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{
          backgroundColor: 'rgba(126, 217, 87, 0.1)',
          border: '1px solid rgba(126, 217, 87, 0.3)',
        }}
      >
        <span
          className="text-sm font-bold"
          style={{
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {number}
        </span>
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      {code && (
        <code
          className="text-xs px-3 py-1.5 rounded inline-block"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--border)',
          }}
        >
          {code}
        </code>
      )}
    </div>
  )
}
