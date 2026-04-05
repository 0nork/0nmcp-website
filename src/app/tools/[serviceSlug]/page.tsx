import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import servicesData from '@/data/services.json'
import { ToolFlowDoc } from '@/components/console/ToolFlowDoc'

interface Props {
  params: Promise<{ serviceSlug: string }>
}

export async function generateStaticParams() {
  return servicesData.services.map((s) => ({ serviceSlug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serviceSlug } = await params
  const service = servicesData.services.find((s) => s.slug === serviceSlug)
  if (!service) return { title: 'Not Found' }

  return {
    title: `How to Use ${service.name} — ${service.tool_count} Tools | 0nMCP`,
    description: `Step-by-step guide for ${service.name}: ${service.description_short} ${service.tool_count} tools available.`,
    openGraph: {
      title: `How to Use ${service.name} | 0nMCP Tool Reference`,
      description: service.description_short,
      url: `https://www.0nmcp.com/tools/${service.slug}`,
    },
    alternates: { canonical: `https://www.0nmcp.com/tools/${service.slug}` },
  }
}

export default async function ServiceToolPage({ params }: Props) {
  const { serviceSlug } = await params
  const service = servicesData.services.find((s) => s.slug === serviceSlug)
  if (!service) notFound()

  const category = servicesData.categories.find((c) => c.id === service.category_id)

  const howTo = (service as Record<string, unknown>).howTo as {
    selections: string[]
    triggers: string[]
    actions: string[]
    outcomes: string[]
    frequency: string[]
    notifications: string[]
  } | undefined

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.0nmcp.com/tools' },
      { '@type': 'ListItem', position: 3, name: service.name, item: `https://www.0nmcp.com/tools/${service.slug}` },
    ],
  }

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Use ${service.name} with 0nMCP`,
    description: service.description_long || service.description_short,
    totalTime: 'PT5M',
    step: [
      { '@type': 'HowToStep', name: 'Select', text: `Choose from ${service.tool_count} available ${service.name} tools.` },
      { '@type': 'HowToStep', name: 'Trigger', text: 'Set the event or condition that starts the automation.' },
      { '@type': 'HowToStep', name: 'Actions', text: `Configure what ${service.name} should do when triggered.` },
      { '@type': 'HowToStep', name: 'Outcomes', text: 'Define the expected results and data flow.' },
      { '@type': 'HowToStep', name: 'Frequency', text: 'Set how often the automation runs.' },
      { '@type': 'HowToStep', name: 'Notifications', text: 'Choose where to send results and alerts.' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

        {/* Breadcrumb */}
        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/tools" className="hover:underline">Tools</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>{service.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">{service.icon}</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {service.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {category && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(126,217,87,0.1)', color: 'var(--accent)' }}>
                  {category.label}
                </span>
              )}
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {service.tool_count} tool{service.tool_count !== 1 ? 's' : ''}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{
                backgroundColor: service.status === 'live' ? 'rgba(126,217,87,0.1)' : 'rgba(245,158,11,0.1)',
                color: service.status === 'live' ? '#6EE05A' : '#f59e0b',
              }}>
                {service.status}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: 600 }}>
          {service.description_long || service.description_short}
        </p>

        {/* 6-step flow visualization */}
        {howTo && (
          <div className="mb-10 p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <ToolFlowDoc
              serviceName={service.name}
              serviceIcon={service.icon}
              howTo={howTo}
            />
          </div>
        )}

        {/* Tool list */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Available Tools
          </h2>

          <div className="space-y-3">
            {service.tools.map((tool) => {
              const t = tool as { id: string; name: string; description?: string; parameters?: { name: string; type: string; required: boolean }[] }
              return (
                <div
                  key={t.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {t.name}
                    </h3>
                    <code className="text-[10px] px-1.5 py-0.5 rounded" style={{
                      backgroundColor: 'rgba(126,217,87,0.08)',
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {t.id}
                    </code>
                  </div>
                  {t.description && (
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {t.description}
                    </p>
                  )}

                  {t.parameters && t.parameters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {t.parameters.map((param: { name: string; type: string; required: boolean }) => (
                        <span
                          key={param.name}
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            color: param.required ? 'var(--text-secondary)' : 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {param.name}
                          <span style={{ color: 'var(--text-muted)' }}>: {param.type}</span>
                          {param.required && <span style={{ color: '#ff6b35', marginLeft: 2 }}>*</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Example workflow snippet */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Example .0n Workflow
          </h2>
          <pre className="rounded-xl p-5 text-xs overflow-x-auto" style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.8,
          }}>
{`{
  "type": "workflow",
  "name": "${service.name} Automation",
  "steps": [
    {
      "service": "${service.id}",
      "action": "${service.tools[0]?.id || service.id + '_action'}",
      "inputs": {${((service.tools[0] as { parameters?: { name: string }[] })?.parameters?.slice(0, 2).map((p: { name: string }) => `\n        "${p.name}": "{{inputs.${p.name}}}"`).join(',')) || '\n        "data": "{{inputs.data}}"'}
      }
    }
  ]
}`}
          </pre>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-6 text-center" style={{
          background: 'linear-gradient(135deg, rgba(126,217,87,0.1), rgba(0,212,255,0.05))',
          border: '1px solid rgba(126,217,87,0.2)',
        }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Ready to use {service.name}?
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Connect your {service.name} account and start automating in minutes.
          </p>
          <Link
            href="/console"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary, #4CAF3D))',
              color: '#0B0F19',
              textDecoration: 'none',
            }}
          >
            Turn it On
          </Link>
        </div>
      </div>
    </div>
  )
}
