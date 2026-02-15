import type { Metadata } from 'next'
import Link from 'next/link'
import servicesData from '@/data/services.json'
import { getAllCategories, getServicesInCategory } from '@/lib/sxo-helpers'

export const metadata: Metadata = {
  title: 'Turn it 0n — 59 Services, 1,385+ Capabilities | 0nMCP',
  description:
    'Connect 59 services with 1,385+ automation capabilities. Gmail, Slack, Stripe, Shopify, HubSpot, and more — all orchestrated by a single AI command. No monthly fees.',
  openGraph: {
    title: 'Turn it 0n — 59 Services, 1,385+ Capabilities | 0nMCP',
    description:
      'Connect 59 services with 1,385+ automation capabilities. No monthly fees, no drag-and-drop. Just describe what you want.',
    url: 'https://0nmcp.com/turn-it-on',
  },
  alternates: {
    canonical: 'https://0nmcp.com/turn-it-on',
  },
}

export default function TurnItOnPage() {
  const categories = getAllCategories()
  const totalTools = servicesData.meta.total_base_tools
  const totalCapabilities = servicesData.meta.total_capabilities
  const totalServices = servicesData.meta.total_services

  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="section-container text-center">
          <div className="inline-block mb-6">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            >
              Integrations
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ letterSpacing: '-0.03em' }}
          >
            <span style={{ color: 'var(--accent)' }}>{totalServices} Services</span>.{' '}
            <span style={{ color: 'var(--accent)' }}>
              {totalCapabilities.toLocaleString()}+ Capabilities
            </span>
            .
            <br />
            Turn it{' '}
            <span className="glow-text" style={{ color: 'var(--accent)' }}>
              0n
            </span>
            .
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every service below works with 0nMCP out of the box. No monthly
            fees, no drag-and-drop builders. Just describe what you want in
            plain English.
          </p>

          {/* Animated stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            <StatBlock value={totalServices.toString()} label="Services" />
            <StatBlock
              value={totalTools.toLocaleString() + '+'}
              label="Tools"
            />
            <StatBlock
              value={totalCapabilities.toLocaleString() + '+'}
              label="Capabilities"
            />
          </div>
        </div>
      </section>

      {/* Category sections */}
      {categories.map((category) => {
        const services = getServicesInCategory(category.id)
        if (services.length === 0) return null

        return (
          <section key={category.id} className="py-10" id={category.slug}>
            <div className="section-container">
              {/* Category header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl" role="img" aria-label={category.label}>
                    {category.icon}
                  </span>
                  <h2
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {category.label}
                  </h2>
                </div>
                <p
                  className="text-sm ml-10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {category.description}
                </p>
              </div>

              {/* Services grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/turn-it-on/${service.slug}`}
                    className="glow-box group flex items-start gap-4"
                    style={{ textDecoration: 'none' }}
                  >
                    <span
                      className="text-3xl flex-shrink-0 mt-0.5"
                      role="img"
                      aria-label={service.name}
                    >
                      {service.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {service.name}
                        </span>
                        <StatusBadge status={service.status} />
                      </div>
                      <p
                        className="text-xs mb-2 line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {service.description_short}
                      </p>
                      <span
                        className="text-xs"
                        style={{
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {service.tool_count} tools
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Bottom CTA */}
      <section className="py-20">
        <div className="section-container text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready?
          </h2>
          <p
            className="text-lg mb-8 max-w-lg mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            One command. {totalServices} services. {totalCapabilities.toLocaleString()}+ capabilities.
          </p>
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--accent)',
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.1)',
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

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="text-3xl md:text-4xl font-bold glow-text"
        style={{
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {value}
      </div>
      <div
        className="text-xs uppercase tracking-widest mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isLive = status === 'live'
  return (
    <span
      className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
      style={{
        fontFamily: 'var(--font-mono)',
        color: isLive ? '#00ff88' : '#00d4ff',
        backgroundColor: isLive
          ? 'rgba(0, 255, 136, 0.1)'
          : 'rgba(0, 212, 255, 0.1)',
        border: `1px solid ${
          isLive ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 212, 255, 0.2)'
        }`,
      }}
    >
      {isLive ? 'live' : 'federated'}
    </span>
  )
}
