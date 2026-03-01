import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import MarketplaceBrowser from '@/components/marketplace/MarketplaceBrowser'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Marketplace — Browse .0n Workflows & Automations | 0nMCP',
  description:
    'Discover pre-built .0n SWITCH files for 48 services and 1,078 capabilities. Browse, filter by service or capability, and install automation workflows instantly.',
  openGraph: {
    title: 'Marketplace — .0n Workflow Store | 0nMCP',
    description:
      'App store for AI automations. Browse .0n SWITCH files across 48 services — CRM, Stripe, Gmail, Slack, and more.',
    url: 'https://0nmcp.com/marketplace',
    siteName: '0nMCP',
    type: 'website',
  },
  alternates: { canonical: 'https://0nmcp.com/marketplace' },
}

async function getListings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []
  const db = createClient(url, key)
  const { data } = await db
    .from('store_listings')
    .select(
      'id, title, slug, description, long_description, category, tags, price, currency, cover_image_url, services, step_count, status, total_purchases, workflow_data, created_at'
    )
    .eq('status', 'active')
    .order('total_purchases', { ascending: false })
  if (!data) return []
  return data.map((l) => ({ ...l, price: (l.price || 0) / 100 }))
}

function buildServiceList() {
  return servicesData.services.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    category: servicesData.categories.find((c) => c.id === s.category_id)?.label || 'Other',
  }))
}

function buildCapabilityCategories() {
  const cats: Record<string, { label: string; serviceIds: Set<string> }> = {}
  for (const cap of capabilitiesData.capabilities) {
    const catId = cap.category
    if (!cats[catId]) {
      const label = catId
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
      cats[catId] = { label, serviceIds: new Set() }
    }
    if (cap.trigger_service) cats[catId].serviceIds.add(cap.trigger_service)
    if (cap.action_service) cats[catId].serviceIds.add(cap.action_service)
  }
  return Object.entries(cats).map(([id, val]) => ({
    id,
    label: val.label,
    serviceIds: Array.from(val.serviceIds),
  }))
}

export default async function MarketplacePage() {
  const listings = await getListings()
  const services = buildServiceList()
  const capabilityCategories = buildCapabilityCategories()

  const totalServices = new Set(listings.flatMap((l) => l.services)).size

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://0nmcp.com/marketplace' },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '0nMCP Marketplace',
    description: 'Browse pre-built .0n workflow automations for 48 services.',
    url: 'https://0nmcp.com/marketplace',
    numberOfItems: listings.length,
    provider: {
      '@type': 'Organization',
      name: '0nMCP',
      url: 'https://0nmcp.com',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {/* Hero */}
        <div className="pt-28 pb-10 text-center">
          <div
            className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full mb-4"
            style={{
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              border: '1px solid rgba(126,217,87,0.2)',
            }}
          >
            MARKETPLACE
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, var(--accent), #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            .0n Workflow Store
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto mb-6"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            Pre-built SWITCH files for every use case. Browse, filter, install — automate anything in seconds.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { value: listings.length.toString(), label: 'Workflows' },
              { value: totalServices.toString(), label: 'Services' },
              { value: '1,078', label: 'Capabilities' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-xl font-bold"
                  style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          <a href="/" className="hover:underline" style={{ color: 'var(--text-muted)' }}>
            Home
          </a>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Marketplace</span>
        </nav>

        {/* Browser */}
        <MarketplaceBrowser
          listings={listings}
          services={services}
          capabilityCategories={capabilityCategories}
        />
      </div>
    </>
  )
}
