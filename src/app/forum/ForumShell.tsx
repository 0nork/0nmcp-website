'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import ForumSidebar from '@/components/forum/ForumSidebar'

export default function ForumShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Determine title for header breadcrumb
  let headerTitle = ''
  if (pathname === '/forum/new') headerTitle = 'New Thread'
  else if (pathname.startsWith('/forum/c/')) headerTitle = 'Group'
  else if (pathname !== '/forum' && pathname.startsWith('/forum/')) headerTitle = 'Thread'

  const handleGroupChange = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') {
      params.delete('group')
    } else {
      params.set('group', slug)
    }
    router.push(`/forum?${params.toString()}`)
    setMobileMenuOpen(false)
  }, [router, searchParams])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block" style={{ height: '100%' }}>
        <ForumSidebar
          onGroupChange={handleGroupChange}
          activeGroup={searchParams.get('group') || 'all'}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(0,0,0,0.6)',
            }}
          />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
            <ForumSidebar
              onGroupChange={handleGroupChange}
              activeGroup={searchParams.get('group') || 'all'}
            />
          </div>
        </>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {/* Header with mobile menu button */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-secondary)',
                cursor: 'pointer', padding: '0.25rem', display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <img
              src="/brand/icon-green.png"
              alt="0n"
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Forum
            </span>
            {headerTitle && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                / {headerTitle}
              </span>
            )}
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <span
                style={{
                  padding: '5px 14px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700,
                  background: 'var(--accent)', color: 'var(--bg-primary)',
                }}
              >
                Forum
              </span>
              <a
                href="/console"
                style={{
                  padding: '5px 14px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700,
                  textDecoration: 'none', background: 'transparent', color: 'var(--text-secondary)',
                }}
              >
                Console
              </a>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
