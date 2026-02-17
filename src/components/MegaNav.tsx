'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import ServiceIcon, { ALL_SERVICES } from '@/components/ServiceLogos'

/* ── Mega-menu sections ── */
type MenuLink = { label: string; href: string; desc: string; accent?: boolean; badge?: string; external?: boolean }
type MenuSection = { label: string; columns: { title: string; links: MenuLink[] }[]; services?: boolean }

const MENU_SECTIONS: Record<string, MenuSection> = {
  product: {
    label: 'Product',
    columns: [
      {
        title: 'Get Started',
        links: [
          { label: 'Turn it 0n', href: '/turn-it-on', desc: 'Browse all capabilities' },
          { label: 'Interactive Demo', href: '/demo', desc: 'Build your first RUN', accent: true },
          { label: 'Examples', href: '/examples', desc: 'Real-world use cases' },
          { label: 'Downloads', href: '/downloads', desc: 'Chrome extension & more' },
        ],
      },
      {
        title: 'Platform',
        links: [
          { label: '.0n Standard', href: '/0n-standard', desc: 'Universal config format' },
          { label: 'Pricing', href: '/#pricing', desc: 'Free forever, pay to scale' },
          { label: 'Marketplace', href: 'https://rocketopp.com', desc: 'Buy & sell RUNs', external: true },
        ],
      },
    ],
    services: true,
  },
  community: {
    label: 'Community',
    columns: [
      {
        title: 'Connect',
        links: [
          { label: 'Community Hub', href: '/community', desc: 'Discussion & updates' },
          { label: 'Forum', href: '/forum', desc: 'Ask questions & discuss', accent: true },
          { label: 'Discord', href: 'https://discord.gg/0nork', desc: 'Join the conversation', external: true },
          { label: 'GitHub', href: 'https://github.com/0nork/0nMCP', desc: 'Star & contribute', external: true },
          { label: 'Sponsor', href: '/sponsor', desc: 'Support development' },
        ],
      },
      {
        title: 'Learn',
        links: [
          { label: 'All Courses', href: '/learn', desc: 'Free & premium courses', accent: true },
          { label: 'Documentation', href: 'https://github.com/0nork/0nMCP#readme', desc: 'Full API reference', external: true },
          { label: 'npm Package', href: 'https://www.npmjs.com/package/0nmcp', desc: '0nmcp on npm', external: true },
          { label: 'Report an Issue', href: '/report', desc: 'Bug reports & feedback' },
        ],
      },
    ],
  },
  products: {
    label: 'Products',
    columns: [
      {
        title: '0n Suite',
        links: [
          { label: '0nMCP', href: '/', desc: 'Universal AI API Orchestrator', badge: 'Core' },
          { label: '0nork Mini', href: '/store/onork-mini', desc: 'Embeddable AI widget' },
          { label: 'Social0n', href: '/products/social0n', desc: 'Social media automation' },
          { label: 'App0n', href: '/products/app0n', desc: 'Mobile app builder' },
          { label: 'Web0n', href: '/products/web0n', desc: 'Website generation' },
        ],
      },
      {
        title: 'Ecosystem',
        links: [
          { label: 'Partners', href: '/partners', desc: 'Partner products & integrations' },
          { label: 'MCPFED', href: 'https://mcpfed.com', desc: 'AI Automation Marketplace', external: true },
          { label: 'Marketplace', href: 'https://marketplace.rocketclients.com', desc: '0n Marketplace', external: true },
        ],
      },
    ],
  },
}

type MenuKey = 'product' | 'community' | 'products'

/* ── Service logo strip (top 12) ── */
const TOP_SERVICES = ALL_SERVICES.slice(0, 12)

export default function MegaNav() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email ?? undefined } : null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? undefined } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleEnter = (key: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpenMenu(key)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 200)
  }

  const section = openMenu ? MENU_SECTIONS[openMenu] : null

  return (
    <nav
      ref={navRef}
      className="mega-nav"
      onMouseLeave={handleLeave}
    >
      <div className="mega-nav-bar">
        {/* Logo */}
        <Link href="/" className="mega-nav-logo no-underline">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0a0a0f" stroke="#00ff88" strokeWidth="1.5" strokeOpacity="0.4" />
            <text x="20" y="27" textAnchor="middle" fill="#00ff88" fontSize="20" fontWeight="700" fontFamily="monospace">
              0n
            </text>
          </svg>
          <span>MCP</span>
        </Link>

        {/* Desktop menu triggers */}
        <div className="mega-nav-links">
          {(Object.keys(MENU_SECTIONS) as MenuKey[]).map((key) => (
            <button
              key={key}
              className={`mega-nav-trigger${openMenu === key ? ' active' : ''}`}
              onMouseEnter={() => handleEnter(key)}
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
            >
              {MENU_SECTIONS[key].label}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mega-nav-chevron">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* Right side CTAs */}
        <div className="mega-nav-actions">
          <a
            href="https://github.com/0nork/0nMCP"
            target="_blank"
            rel="noopener noreferrer"
            className="mega-nav-github"
            aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <Link href="/demo" className="mega-nav-cta-demo no-underline">
            Demo
          </Link>
          {user ? (
            <Link href="/account" className="mega-nav-cta-account no-underline">
              Account
            </Link>
          ) : (
            <Link href="/login" className="mega-nav-cta-signin no-underline">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="mega-nav-mobile-toggle"
          onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null) }}
          aria-label="Toggle menu"
        >
          <span className={`mega-nav-burger${mobileOpen ? ' open' : ''}`}>
            <span /><span /><span />
          </span>
        </button>
      </div>

      {/* ── Desktop mega dropdown ── */}
      {section && (
        <div className="mega-dropdown" onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}>
          <div className="mega-dropdown-inner">
            <div className="mega-dropdown-columns">
              {section.columns.map((col) => (
                <div key={col.title} className="mega-dropdown-col">
                  <span className="mega-dropdown-col-title">{col.title}</span>
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="mega-dropdown-link no-underline"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      onClick={() => setOpenMenu(null)}
                    >
                      <span className="mega-dropdown-link-label">
                        {link.label}
                        {link.badge && (
                          <span className="mega-dropdown-badge">{link.badge}</span>
                        )}
                        {link.accent && (
                          <span className="mega-dropdown-new">NEW</span>
                        )}
                      </span>
                      <span className="mega-dropdown-link-desc">{link.desc}</span>
                    </Link>
                  ))}
                </div>
              ))}

              {/* Service logos strip (only for Product menu) */}
              {section.services && (
                <div className="mega-dropdown-services">
                  <span className="mega-dropdown-col-title">26 Connected Services</span>
                  <div className="mega-dropdown-logo-grid">
                    {TOP_SERVICES.map((s) => (
                      <div key={s.id} className="mega-dropdown-service" title={s.name}>
                        <ServiceIcon id={s.id} size={20} />
                        <span>{s.name}</span>
                      </div>
                    ))}
                    <Link
                      href="/turn-it-on"
                      className="mega-dropdown-service mega-dropdown-service-more no-underline"
                      onClick={() => setOpenMenu(null)}
                    >
                      <span className="mega-dropdown-more-count">+14</span>
                      <span>more</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="mega-mobile">
          {(Object.keys(MENU_SECTIONS) as MenuKey[]).map((key) => (
            <div key={key} className="mega-mobile-section">
              <span className="mega-mobile-section-title">{MENU_SECTIONS[key].label}</span>
              {MENU_SECTIONS[key].columns.map((col) =>
                col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="mega-mobile-link no-underline"
                    onClick={() => setMobileOpen(false)}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </Link>
                ))
              )}
            </div>
          ))}
          <div className="mega-mobile-ctas">
            <Link href="/demo" className="btn-accent w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
              Interactive Demo
            </Link>
            {user ? (
              <Link href="/account" className="btn-ghost w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                Account
              </Link>
            ) : (
              <Link href="/login" className="btn-ghost w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
