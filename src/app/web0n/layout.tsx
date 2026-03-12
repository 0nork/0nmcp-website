import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'web0n — Professional Websites Built in Days',
    template: '%s | web0n',
  },
  description: 'Your business website, built in days, not months. 5-page professional website with CRM, booking, and SEO — $1,997.',
  metadataBase: new URL('https://web0n.com'),
  openGraph: {
    title: 'web0n — Professional Websites Built in Days',
    description: 'Your business website, built in days, not months. 5-page professional website with CRM, booking, and SEO — $1,997.',
    url: 'https://web0n.com',
    siteName: 'web0n',
    type: 'website',
  },
}

export default function Web0nLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #ff6b35, #ff8f65)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              web0n
            </span>
          </Link>
          <Link
            href="/onboard"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} RocketOpp LLC. All rights reserved.
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>Home</Link>
            <Link href="/legal/privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/legal/terms" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>Terms</Link>
            <a href="https://0nmcp.com" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>Powered by 0nMCP</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
