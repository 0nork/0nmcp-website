import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'web0n — Professional Websites Built in Days',
    template: '%s | web0n',
  },
  description: 'Your business website, built in days, not months. 5-page professional website with CRM, booking, and SEO — $1,997 flat rate.',
  metadataBase: new URL('https://web0n.com'),
  icons: {
    icon: '/brand/web0n-icon.jpg',
    apple: '/brand/web0n-icon.jpg',
  },
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
        background: 'rgba(10, 10, 15, 0.92)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0.6rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Image
              src="/brand/web0n-logo.png"
              alt="web0n"
              width={130}
              height={42}
              priority
              style={{ display: 'block', filter: 'drop-shadow(0 2px 8px rgba(126,217,87,0.1))' }}
            />
          </Link>
          <Link
            href="/onboard"
            style={{
              padding: '0.45rem 1.15rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
              color: '#0a0a0f',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Image
              src="/brand/web0n-icon.jpg"
              alt="0n"
              width={20}
              height={20}
              style={{ display: 'block', borderRadius: 5 }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Powered by <a href="https://0nmcp.com" style={{ color: '#7ed957', textDecoration: 'none', fontWeight: 500 }}>0nMCP</a>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} RocketOpp LLC. All rights reserved.
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>Home</Link>
            <a href="https://0nmcp.com/legal/privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>Privacy</a>
            <a href="https://0nmcp.com/legal/terms" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
