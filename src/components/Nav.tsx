'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import AuthModal from '@/components/AuthModal'

const navLinks = [
  { label: 'Turn it 0n', href: '/turn-it-on' },
  { label: 'Learn', href: '/learn' },
  { label: 'Examples', href: '/examples' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Community', href: '/community' },
  { label: 'Security', href: '/security' },
]

const commandLinks = [
  {
    label: 'Console',
    href: '/console',
    desc: 'AI command center',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    label: 'Builder',
    href: '/builder',
    desc: 'Visual workflow editor',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Planner',
    href: '/planner',
    desc: 'Customizable data canvas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    label: 'Forum',
    href: '/forum',
    desc: 'Community discussions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Store',
    href: '/store/onork-mini',
    desc: 'Apps & templates',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
]

export default function Nav() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!commandOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCommandOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [commandOpen])

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
            <rect width="40" height="40" rx="8" fill="#0a0a0f" stroke="#7ed957" strokeWidth="1.5" strokeOpacity="0.4"/>
            <text x="20" y="27" textAnchor="middle" fill="#7ed957" fontSize="20" fontWeight="700" fontFamily="monospace">0n</text>
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
          {/* 0nCommand Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setCommandOpen(!commandOpen)}
              className="btn-accent"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              0nCommand
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'transform 0.2s ease',
                  transform: commandOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {commandOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  width: '260px',
                  background: 'rgba(10, 10, 15, 0.98)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  padding: '0.375rem',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(126,217,87,0.06)',
                  zIndex: 100,
                  animation: 'commandDropIn 0.15s ease-out',
                }}
              >
                {commandLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setCommandOpen(false); setMobileOpen(false) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(126,217,87,0.08)'
                      e.currentTarget.style.color = '#7ed957'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                  >
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(126,217,87,0.08)',
                        border: '1px solid rgba(126,217,87,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#7ed957',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-display)',
                        lineHeight: 1.2,
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-display)',
                        lineHeight: 1.3,
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Divider + quick action */}
                <div style={{
                  height: '1px',
                  background: 'var(--border)',
                  margin: '0.25rem 0.5rem',
                }} />
                <Link
                  href="/turn-it-on"
                  onClick={() => { setCommandOpen(false); setMobileOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(126,217,87,0.06)'
                    e.currentTarget.style.color = '#7ed957'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Connect a service...
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <Link href="/account" className="btn-ghost" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              Account
            </Link>
          ) : (
            <button
              className="btn-ghost"
              onClick={() => setShowAuthModal(true)}
              style={{ cursor: 'pointer' }}
            >
              Sign in
            </button>
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

            {/* 0nCommand section */}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '0.75rem',
                marginTop: '0.5rem',
              }}
            >
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#7ed957',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                marginBottom: '0.5rem',
                padding: '0 0.25rem',
              }}>
                0nCommand
              </div>
              <div className="flex flex-col gap-1">
                {commandLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.5rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(126,217,87,0.08)',
                      border: '1px solid rgba(126,217,87,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7ed957',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-display)',
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth */}
            <div
              className="flex flex-col gap-3 pt-3 mt-1"
              style={{ borderTop: '1px solid var(--border)' }}
            >
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
                <button
                  className="btn-ghost text-center justify-center"
                  style={{ width: '100%', cursor: 'pointer' }}
                  onClick={() => { setMobileOpen(false); setShowAuthModal(true) }}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dropdown animation */}
      <style>{`
        @keyframes commandDropIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => { router.push('/console'); router.refresh() }}
      />
    </nav>
  )
}
