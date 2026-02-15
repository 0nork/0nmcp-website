'use client'

import { useState } from 'react'
import Link from 'next/link'

const navLinks = [
  { label: 'Turn it 0n', href: '/turn-it-on' },
  { label: 'Examples', href: '/examples' },
  { label: 'Standard', href: '/0n-standard' },
  { label: 'Community', href: '/community' },
  { label: 'Sponsor', href: '/sponsor' },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
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
          className="text-xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
          }}
        >
          0nMCP
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
          <a
            href="https://rocketopp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Store
          </a>
          <Link
            href="/builder"
            className="btn-accent"
          >
            Builder
          </Link>
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
              <a
                href="https://rocketopp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-center justify-center"
              >
                Store
              </a>
              <Link
                href="/builder"
                className="btn-accent text-center justify-center"
                onClick={() => setMobileOpen(false)}
              >
                Builder
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
