import type { Metadata } from 'next'
import Link from 'next/link'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'
import { STATS, STATS_DISPLAY } from '@/data/stats'
import { getAllCategories, getServicesInCategory } from '@/lib/sxo-helpers'
import ServiceLogo from '@/components/ServiceLogo'
import TurnItOnSignup from '@/components/turn-it-on/TurnItOnSignup'
import AnimatedGrid from '@/components/AnimatedGrid'
import AnimatedConnectors from '@/components/AnimatedConnectors'

export const metadata: Metadata = {
  title: `Turn it 0n — ${STATS_DISPLAY.services} Services, ${STATS_DISPLAY.tools} Tools | 0nMCP`,
  description:
    `Connect ${STATS_DISPLAY.services} services with ${STATS_DISPLAY.tools} tools and 80 pre-built automations. Gmail, Slack, Stripe, Shopify, HubSpot, and more — all orchestrated by a single AI command. No monthly fees.`,
  openGraph: {
    title: `Turn it 0n — ${STATS_DISPLAY.services} Services, 80+ Pre-Built Automations | 0nMCP`,
    description:
      `Connect ${STATS_DISPLAY.services} services with 80+ pre-built automations. No monthly fees, no drag-and-drop. Just describe what you want.`,
    url: 'https://www.0nmcp.com/turn-it-on',
  },
  alternates: {
    canonical: 'https://www.0nmcp.com/turn-it-on',
  },
}

export default function TurnItOnPage() {
  const categories = getAllCategories()
  const totalTools = servicesData.meta.total_tools
  const totalCapabilities = capabilitiesData.meta.total_capabilities
  const totalServices = servicesData.meta.total_services

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <AnimatedGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#6EE05A]/[0.06] blur-[140px]"
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 lg:pt-36 lg:pb-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6EE05A]/25 bg-[#6EE05A]/8 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#6EE05A]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EE05A] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE05A]" />
            </span>
            Integrations
          </div>

          <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              {STATS_DISPLAY.services_marketing} Services.
            </span>
            <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              {STATS_DISPLAY.capabilities_marketing} Capabilities.
            </span>
            <span className="block text-3xl font-bold leading-snug text-white/85 sm:text-4xl lg:text-5xl mt-2">
              Turn it 0n.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            Every service below works with 0nMCP out of the box. No monthly fees, no drag-and-drop
            builders. Just describe what you want in plain English.
          </p>

          {/* Sign up form — one question at a time */}
          <div className="mt-10">
            <TurnItOnSignup />
          </div>

          {/* Animated stats — gradient values */}
          <div className="mt-12 grid grid-cols-3 gap-3">
            {[
              { v: STATS_DISPLAY.services_marketing, l: 'Services' },
              { v: STATS_DISPLAY.capabilities_marketing, l: 'Capabilities' },
              { v: totalTools.toLocaleString() + '+', l: 'Tools' },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-border/60 bg-card/40 px-4 py-5 text-center backdrop-blur"
              >
                <div className="font-mono text-2xl font-black tabular-nums sm:text-3xl">
                  <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                    {s.v}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
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
                    <ServiceLogo
                      src={(service as Record<string, unknown>).logo as string | undefined}
                      alt={service.name}
                      size={36}
                      className="flex-shrink-0 mt-0.5"
                      icon={service.icon}
                    />
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
              boxShadow: '0 0 30px rgba(110, 224, 90, 0.1)',
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
        color: isLive ? '#6EE05A' : '#00d4ff',
        backgroundColor: isLive
          ? 'rgba(110, 224, 90, 0.1)'
          : 'rgba(0, 212, 255, 0.1)',
        border: `1px solid ${
          isLive ? 'rgba(110, 224, 90, 0.2)' : 'rgba(0, 212, 255, 0.2)'
        }`,
      }}
    >
      {isLive ? 'live' : 'federated'}
    </span>
  )
}
