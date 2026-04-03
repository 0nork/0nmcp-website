'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { STATS_DISPLAY } from '@/data/stats'

/* ── Clean light mega-menu — Figma reference ── */

type MenuLink = { label: string; href: string; bold?: boolean }
type MenuSection = {
  label: string
  href?: string
  columns: { title?: string; links: MenuLink[] }[]
  featured?: { title: string; href: string; image?: string }
}

const MENU: Record<string, MenuSection> = {
  product: {
    label: 'Product',
    columns: [
      {
        title: 'Platform',
        links: [
          { label: 'Integrations', href: '/integrations', bold: true },
          { label: 'Turn it 0n', href: '/turn-it-on' },
          { label: 'SXO Audit', href: '/audit' },
          { label: 'Security & Vault', href: '/security' },
          { label: 'Technology', href: '/technology' },
        ],
      },
      {
        title: 'Solutions',
        links: [
          { label: 'Compare', href: '/compare', bold: true },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'Canvas', href: '/canvas' },
          { label: '.0n Standard', href: '/0n-standard' },
          { label: 'Converter', href: '/convert' },
        ],
      },
    ],
    featured: {
      title: `${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services — ${STATS_DISPLAY.patents} patents pending`,
      href: '/start',
    },
  },
  resources: {
    label: 'Resources',
    columns: [
      {
        title: 'Learn',
        links: [
          { label: 'Blog', href: '/blog', bold: true },
          { label: 'Courses', href: '/learn' },
          { label: 'Glossary', href: '/glossary' },
          { label: 'Examples', href: '/examples' },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'Forum', href: '/forum', bold: true },
          { label: 'Community', href: '/community' },
          { label: 'Partners', href: '/partners' },
          { label: 'Sponsor', href: '/sponsor' },
        ],
      },
    ],
    featured: {
      title: 'Free AI website audit — get your SXO score in 5 seconds',
      href: '/audit',
    },
  },
}

type MenuKey = keyof typeof MENU

export default function MegaNav() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) { setAuthReady(true); return }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email ?? undefined, id: data.user.id } : null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? undefined, id: session.user.id } : null)
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const enter = (key: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpenMenu(key)
  }
  const leave = () => { timeoutRef.current = setTimeout(() => setOpenMenu(null), 180) }
  const cancelLeave = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }

  const section = openMenu ? MENU[openMenu] : null

  return (
    <nav ref={navRef} className="mn" onMouseLeave={leave}>
      <div className="mn-bar">
        {/* Logo */}
        <Link href="/" className="mn-logo no-underline">
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={120} height={40} style={{ objectFit: 'contain' }} priority />
        </Link>

        {/* Desktop links */}
        <div className="mn-links">
          {(Object.keys(MENU) as MenuKey[]).map(key => (
            <button
              key={key}
              className={`mn-trigger${openMenu === key ? ' active' : ''}`}
              onMouseEnter={() => enter(key)}
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
            >
              {MENU[key].label}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mn-chev">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
          <Link href="/audit" className="mn-link no-underline" onMouseEnter={() => { cancelLeave(); setOpenMenu(null) }}>Audit</Link>
          <Link href="/blog" className="mn-link no-underline" onMouseEnter={() => { cancelLeave(); setOpenMenu(null) }}>Blog</Link>
          <Link href="/forum" className="mn-link no-underline" onMouseEnter={() => { cancelLeave(); setOpenMenu(null) }}>Forum</Link>
        </div>

        {/* Right CTAs */}
        <div className="mn-actions" style={authReady ? undefined : { visibility: 'hidden' }}>
          {!user ? (
            <>
              <Link href="/login" className="mn-signin no-underline">Login</Link>
              <Link href="/start" className="mn-cta no-underline">Get Started</Link>
            </>
          ) : (
            <Link href="/dashboard" className="mn-cta no-underline">Dashboard</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="mn-hamburger" onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null) }} aria-label="Menu">
          <span className={`mn-burger${mobileOpen ? ' open' : ''}`}><span /><span /><span /></span>
        </button>
      </div>

      {/* Desktop mega dropdown */}
      {section && (
        <div className="mn-dropdown" onMouseEnter={cancelLeave}>
          <div className="mn-dropdown-inner">
            {section.columns.map((col, i) => (
              <div key={i} className="mn-col">
                {col.title && <span className="mn-col-title">{col.title}</span>}
                {col.links.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`mn-item no-underline${link.bold ? ' mn-item-bold' : ''}`}
                    onClick={() => setOpenMenu(null)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            {section.featured && (
              <div className="mn-featured">
                <Link href={section.featured.href} className="mn-featured-card no-underline" onClick={() => setOpenMenu(null)}>
                  <span className="mn-featured-title">{section.featured.title}</span>
                  <span className="mn-featured-arrow">Read more &rarr;</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mn-mobile">
          {Object.values(MENU).map(sec =>
            sec.columns.map((col, i) =>
              col.links.map(link => (
                <Link key={`${i}-${link.label}`} href={link.href} className="mn-mobile-link no-underline" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))
            )
          )}
          <Link href="/#pricing" className="mn-mobile-link no-underline" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/compare" className="mn-mobile-link no-underline" onClick={() => setMobileOpen(false)}>Compare</Link>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!user ? (
              <>
                <Link href="/signup" className="mn-cta no-underline" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Request Access</Link>
                <Link href="/login" className="mn-signin no-underline" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Login</Link>
              </>
            ) : (
              <Link href="/dashboard" className="mn-cta no-underline" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
