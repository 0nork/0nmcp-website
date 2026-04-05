import Link from 'next/link'
import Image from 'next/image'

/**
 * Simple footer for landing pages — logo, copyright, minimal links.
 */
export default function FooterSimple() {
  return (
    <footer style={{
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        maxWidth: '960px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image src="/brand/icon-green.png" alt="0n" width={20} height={20} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
            &copy; {new Date().getFullYear()} RocketOpp LLC
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'GitHub', href: 'https://github.com/0nork/0nMCP' },
          ].map(link => (
            <Link key={link.label} href={link.href} style={{
              fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none', transition: 'color 0.15s',
            }}>{link.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
