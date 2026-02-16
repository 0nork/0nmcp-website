import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Web0n — AI Website Builder & CMS | 0n Network',
  description: 'Build stunning websites with AI. Web0n combines visual editing, CMS, and 0nMCP automation for sites that work harder.',
  openGraph: {
    title: 'Web0n — AI Website Builder & CMS',
    description: 'Build stunning websites with AI and 0nMCP automation.',
    url: 'https://0nmcp.com/products/web0n',
    siteName: '0nMCP',
  },
}

const FEATURES = [
  { title: 'AI Page Builder', desc: 'Describe what you want in plain English. Web0n generates responsive, production-ready pages.' },
  { title: 'Visual Editor', desc: 'Drag-and-drop editing with live preview. No code required for content updates.' },
  { title: 'Headless CMS', desc: 'Content API powered by Supabase. Structured content, media management, versioning.' },
  { title: 'SEO Automation', desc: 'AI generates meta tags, structured data, sitemaps, and optimized content automatically.' },
  { title: 'Form & Lead Capture', desc: 'Smart forms connected to CRM via 0nMCP. Leads flow directly into your pipeline.' },
  { title: 'Analytics & CRO', desc: 'Built-in analytics with AI-powered conversion optimization suggestions.' },
]

export default function Web0nPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <section className="store-hero">
        <div className="store-badge" style={{ borderColor: 'rgba(255, 107, 53, 0.3)', background: 'rgba(255, 107, 53, 0.1)', color: '#ff6b35' }}>
          Coming Soon
        </div>
        <h1 style={{ background: 'linear-gradient(135deg, #ff6b35, #ff9a5c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Web0n
        </h1>
        <p className="store-subtitle">
          AI-powered website builder and CMS. Build stunning sites that
          automatically optimize, capture leads, and integrate with your
          entire stack through 0nMCP.
        </p>
      </section>

      <section className="store-capabilities">
        <h3>Core Features</h3>
        <div className="store-cap-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="store-cap-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: '#ff6b35', fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</span>
              <span style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Web0n is currently in development. Join the waitlist to get early access.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="store-cta" style={{ maxWidth: 240, background: 'linear-gradient(135deg, #ff6b35, #ff9a5c)' }}>
            Join Waitlist
          </Link>
          <Link href="/" className="store-cta secondary" style={{ maxWidth: 240 }}>
            Back to 0nMCP
          </Link>
        </div>
      </section>
    </div>
  )
}
