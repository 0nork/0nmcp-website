import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ServiceIcon, { ALL_SERVICES } from '@/components/ServiceLogos'
import MarketplaceCard from '@/components/marketplace/MarketplaceCard'
import { getCategoryColor } from '@/components/marketplace/MarketplaceTypes'

export const revalidate = 3600

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function getListing(slug: string) {
  const db = getDb()
  if (!db) return null
  const { data } = await db
    .from('store_listings')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  if (!data) return null
  return { ...data, price: (data.price || 0) / 100 }
}

async function getSimilar(category: string, excludeId: string) {
  const db = getDb()
  if (!db) return []
  const { data } = await db
    .from('store_listings')
    .select(
      'id, title, slug, description, long_description, category, tags, price, currency, cover_image_url, services, step_count, status, total_purchases, workflow_data, created_at'
    )
    .eq('status', 'active')
    .eq('category', category)
    .neq('id', excludeId)
    .order('total_purchases', { ascending: false })
    .limit(4)
  if (!data) return []
  return data.map((l) => ({ ...l, price: (l.price || 0) / 100 }))
}

export async function generateStaticParams() {
  const db = getDb()
  if (!db) return []
  const { data } = await db.from('store_listings').select('slug').eq('status', 'active')
  return (data || []).map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListing(slug)
  if (!listing) return { title: 'Not Found | 0nMCP Marketplace' }
  return {
    title: `${listing.title} — 0nMCP Marketplace`,
    description: listing.description || `${listing.title} — a .0n workflow automation for ${listing.services.join(', ')}.`,
    openGraph: {
      title: `${listing.title} | 0nMCP Marketplace`,
      description: listing.description || undefined,
      url: `https://0nmcp.com/marketplace/${slug}`,
      siteName: '0nMCP',
      type: 'website',
    },
    alternates: { canonical: `https://0nmcp.com/marketplace/${slug}` },
  }
}

function getServiceName(id: string): string {
  return ALL_SERVICES.find((s) => s.id === id)?.name || id
}

export default async function MarketplaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const listing = await getListing(slug)
  if (!listing) notFound()

  const similar = await getSimilar(listing.category, listing.id)
  const catColor = getCategoryColor(listing.category)

  const steps = (listing.workflow_data as { steps?: { name?: string; service?: string; action?: string }[] })?.steps || []

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Marketplace', item: 'https://0nmcp.com/marketplace' },
      { '@type': 'ListItem', position: 3, name: listing.title, item: `https://0nmcp.com/marketplace/${slug}` },
    ],
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    url: `https://0nmcp.com/marketplace/${slug}`,
    brand: { '@type': 'Brand', name: '0nMCP' },
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: (listing.currency || 'usd').toUpperCase(),
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs pt-24 mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:underline" style={{ color: 'var(--text-muted)' }}>Marketplace</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{listing.title}</span>
        </nav>

        {/* Cover banner */}
        <div
          className="rounded-2xl mb-8"
          style={{
            height: 200,
            background: listing.cover_image_url
              ? `url(${listing.cover_image_url}) center/cover`
              : `linear-gradient(135deg, ${catColor}10, ${catColor}35, ${catColor}10)`,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!listing.cover_image_url && (
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.1 }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={catColor} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {listing.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-md"
                style={{
                  backgroundColor: `${catColor}20`,
                  color: catColor,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                }}
              >
                {listing.category}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {listing.step_count} step{listing.step_count !== 1 ? 's' : ''}
              </span>
              {listing.total_purchases > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {listing.total_purchases} install{listing.total_purchases !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center gap-4">
            <span
              className="text-xl font-bold"
              style={{
                color: listing.price === 0 ? 'var(--accent)' : '#ff6b35',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
            </span>
            <Link
              href="/login"
              className="btn-accent text-sm font-semibold px-6 py-2.5 rounded-lg no-underline"
            >
              Get Workflow
            </Link>
          </div>
        </div>

        {/* Description */}
        {(listing.long_description || listing.description) && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              About
            </h2>
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                {listing.long_description || listing.description}
              </p>
            </div>
          </section>
        )}

        {/* Workflow steps */}
        {steps.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Workflow Steps
            </h2>
            <div className="flex flex-col gap-3">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <span
                    className="shrink-0 flex items-center justify-center text-xs font-bold rounded-lg"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: `${catColor}15`,
                      color: catColor,
                      fontFamily: 'var(--font-mono)',
                      border: `1px solid ${catColor}25`,
                    }}
                  >
                    {i + 1}
                  </span>
                  {step.service && (
                    <span className="shrink-0">
                      <ServiceIcon id={step.service} size={20} />
                    </span>
                  )}
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {step.name || step.action || `Step ${i + 1}`}
                    </div>
                    {step.service && (
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {getServiceName(step.service)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Connected services */}
        {listing.services.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Connected Services
            </h2>
            <div className="flex gap-3 flex-wrap">
              {listing.services.map((sId: string) => (
                <Link
                  key={sId}
                  href={`/integrations/${sId}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg no-underline transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                  }}
                >
                  <ServiceIcon id={sId} size={18} />
                  {getServiceName(sId)}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {listing.tags.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Tags
            </h2>
            <div className="flex gap-2 flex-wrap">
              {listing.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(126,217,87,0.06)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Similar listings */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Similar Workflows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((l, i) => (
                <MarketplaceCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
