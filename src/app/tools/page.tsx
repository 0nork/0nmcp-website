import type { Metadata } from 'next'
import Link from 'next/link'
import servicesData from '@/data/services.json'

export const metadata: Metadata = {
  title: 'Tool Reference — 870+ AI Tools Explained | 0nMCP',
  description: 'Browse all 0nMCP tools organized by category. Learn what each tool does with step-by-step how-to documentation for 91 services.',
  openGraph: {
    title: 'Tool Reference — 870+ AI Tools Explained | 0nMCP',
    description: 'Step-by-step how-to docs for every tool in the 0nMCP ecosystem.',
    url: 'https://www.0nmcp.com/tools',
  },
  alternates: { canonical: 'https://www.0nmcp.com/tools' },
}

export default function ToolsPage() {
  const categories = servicesData.categories
  const services = servicesData.services

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.0nmcp.com/tools' },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '0nMCP Tool Reference',
    description: 'Complete tool reference for 91 services with 870+ tools.',
    url: 'https://www.0nmcp.com/tools',
    numberOfItems: services.length,
  }

  const totalTools = services.reduce((sum, s) => sum + (s.tool_count || 0), 0)

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Tools</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Tool Reference
        </h1>
        <p className="text-base mb-2" style={{ color: 'var(--text-secondary)', maxWidth: 600 }}>
          Every tool in the 0nMCP ecosystem, organized by category. Click any service for step-by-step how-to documentation.
        </p>

        {/* Stats */}
        <div className="flex gap-6 mb-10">
          {[
            { value: services.length, label: 'Services' },
            { value: totalTools.toLocaleString(), label: 'Tools' },
            { value: categories.length, label: 'Categories' },
          ].map((stat) => (
            <div key={stat.label}>
              <span className="text-2xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {stat.value}
              </span>
              <span className="text-sm ml-1.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Categories */}
        {categories.map((cat) => {
          const catServices = services.filter((s) => s.category_id === cat.id)
          if (catServices.length === 0) return null

          return (
            <section key={cat.id} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{cat.icon}</span>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {cat.label}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(126,217,87,0.1)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {catServices.length}
                </span>
              </div>
              {cat.description && (
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{cat.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catServices.map((service) => (
                  <Link
                    key={service.id}
                    href={`/tools/${service.slug}`}
                    className="block rounded-xl p-4 transition-all group"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{service.icon}</span>
                      <div>
                        <div className="text-sm font-semibold group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                          {service.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {service.tool_count} tool{service.tool_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {service.description_short}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
