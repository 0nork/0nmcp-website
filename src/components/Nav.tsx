'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

const navLinks = [
  { label: 'Turn it 0n', href: '/turn-it-on' },
  { label: 'Learn', href: '/learn' },
  { label: 'Examples', href: '/examples' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Community', href: '/community' },
  { label: 'Security', href: '/security' },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email ?? undefined } : null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? undefined } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav
      className="fixed left-0 right-0 z-50"
      style={{
        top: '2rem',
        backgroundColor: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="section-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
        >
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
            <rect width="40" height="40" rx="8" fill="#0a0a0f" stroke="#00ff88" strokeWidth="1.5" strokeOpacity="0.4"/>
            <text x="20" y="27" textAnchor="middle" fill="#00ff88" fontSize="20" fontWeight="700" fontFamily="monospace">0n</text>
          </svg>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent)',
            }}
          >
            MCP
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link text-sm font-medium"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/console"
            className="btn-ghost"
          >
            Console
          </Link>
          <Link
            href="/builder"
            className="btn-accent"
          >
            Builder
          </Link>
          {user ? (
            <Link href="/account" className="btn-ghost" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              Account
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="block w-5 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: 'var(--text-primary)',
              transform: mobileOpen
                ? 'rotate(45deg) translate(2px, 2px)'
                : 'none',
            }}
          />
          <span
            className="block w-5 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: 'var(--text-primary)',
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: 'var(--text-primary)',
              transform: mobileOpen
                ? 'rotate(-45deg) translate(2px, -2px)'
                : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="section-container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium py-2"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div
              className="flex flex-col gap-3 pt-3 mt-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <Link
                href="/console"
                className="btn-ghost text-center justify-center"
                onClick={() => setMobileOpen(false)}
              >
                Console
              </Link>
              <Link
                href="/builder"
                className="btn-accent text-center justify-center"
                onClick={() => setMobileOpen(false)}
              >
                Builder
              </Link>
              {user ? (
                <Link
                  href="/account"
                  className="btn-ghost text-center justify-center"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn-ghost text-center justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
