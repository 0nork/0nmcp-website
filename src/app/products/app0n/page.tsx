import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'App0n — Build AI-Native Applications | 0n Network',
  description: 'Ship AI-powered apps faster. App0n gives you pre-built components, auth, payments, and 0nMCP orchestration out of the box.',
  openGraph: {
    title: 'App0n — Build AI-Native Applications',
    description: 'Ship AI-powered apps faster with pre-built components and 0nMCP orchestration.',
    url: 'https://0nmcp.com/products/app0n',
    siteName: '0nMCP',
  },
}

const FEATURES = [
  { title: 'App Templates', desc: 'Production-ready Next.js templates with auth, payments, and dashboard pre-configured.' },
  { title: '0nMCP Integration', desc: 'Every template comes wired to 0nMCP. Your app can orchestrate 59 services from day one.' },
  { title: 'AI Components', desc: 'Drop-in chat interfaces, content generators, and AI-powered form builders.' },
  { title: 'Auth & Payments', desc: 'Supabase auth and Stripe billing baked in. Users, subscriptions, and invoices handled.' },
  { title: 'One-Click Deploy', desc: 'Deploy to Vercel with a single command. Environment variables auto-configured.' },
  { title: 'Plugin System', desc: 'Extend your app with .0n plugins from the marketplace. Install, configure, execute.' },
]

export default function App0nPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <section className="store-hero">
        <div className="store-badge" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
          Coming Soon
        </div>
        <h1 style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          App0n
        </h1>
        <p className="store-subtitle">
          Build and ship AI-native applications in hours, not months.
          Pre-built templates, auth, payments, and full 0nMCP orchestration
          — ready to deploy.
        </p>
      </section>

      <section className="store-capabilities">
        <h3>Core Features</h3>
        <div className="store-cap-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="store-cap-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</span>
              <span style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          App0n is currently in development. Join the waitlist to get early access.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="store-cta" style={{ maxWidth: 240, background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
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
