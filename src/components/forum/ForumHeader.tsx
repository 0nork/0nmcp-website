'use client'

import Link from 'next/link'
import ForumConsoleToggle from '@/components/ForumConsoleToggle'

export default function ForumHeader({ title }: { title?: string }) {
  return (
    <header
      style={{
        flexShrink: 0,
        height: '3.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Left: breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {/* Mobile menu placeholder */}
        <Link
          href="/forum"
          className="sm:hidden"
          style={{ textDecoration: 'none' }}
        >
          <img
            src="/brand/icon-green.png"
            alt="0n"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
        </Link>
        <div className="hidden sm:flex items-center gap-2">
          <img
            src="/brand/icon-green.png"
            alt="0n"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Forum
          </span>
          {title && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              / {title}
            </span>
          )}
        </div>
      </div>

      {/* Right: toggle */}
      <ForumConsoleToggle />
    </header>
  )
}
