'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function ForumConsoleToggle() {
  const pathname = usePathname()
  const isForum = pathname.startsWith('/forum')

  return (
    <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
      <Link
        href="/forum"
        style={{
          padding: '5px 14px',
          borderRadius: 7,
          fontSize: '0.75rem',
          fontWeight: 700,
          textDecoration: 'none',
          transition: 'all 0.15s',
          background: isForum ? 'var(--accent)' : 'transparent',
          color: isForum ? 'var(--bg-primary)' : 'var(--text-secondary)',
        }}
      >
        Forum
      </Link>
      <Link
        href="/console"
        style={{
          padding: '5px 14px',
          borderRadius: 7,
          fontSize: '0.75rem',
          fontWeight: 700,
          textDecoration: 'none',
          transition: 'all 0.15s',
          background: !isForum ? 'var(--accent)' : 'transparent',
          color: !isForum ? 'var(--bg-primary)' : 'var(--text-secondary)',
        }}
      >
        Console
      </Link>
    </div>
  )
}
