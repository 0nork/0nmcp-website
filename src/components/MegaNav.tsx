'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import ServiceIcon, { ALL_SERVICES } from '@/components/ServiceLogos'

/* ── Mega-menu sections ── */
type MenuLink = { label: string; href: string; desc: string; accent?: boolean; badge?: string }
type MenuSection = {
  label: string
  columns: { title: string; links: MenuLink[] }[]
  services?: boolean
  serviceIds?: string[]
  graphic?: 'grid' | 'vault' | 'community' | 'shield'
  stat?: { value: string; label: string }
}

const MENU_SECTIONS: Record<string, MenuSection> = {
  product: {
    label: 'Product',
    columns: [
      {
        title: 'Get Started',
        links: [
          { label: 'Turn it 0n', href: '/turn-it-on', desc: 'Browse all 1,078 capabilities' },
          { label: 'Interactive Demo', href: '/demo', desc: 'Build your first RUN', accent: true },
          { label: 'Examples', href: '/examples', desc: 'Real-world use cases' },
          { label: 'Downloads', href: '/downloads', desc: 'Chrome extension & more' },
          { label: 'Convert', href: '/convert', desc: 'Migrate from any AI platform', accent: true },
        ],
      },
      {
        title: 'Platform',
        links: [
          { label: '.0n Standard', href: '/0n-standard', desc: 'Universal config format' },
          { label: 'Console', href: '/console', desc: 'Dashboard, Store, Builder & more', accent: true },
          { label: 'Pricing', href: '/#pricing', desc: 'Free forever, pay to scale' },
          { label: 'Integrations', href: '/integrations', desc: '48 connected services' },
        ],
      },
    ],
    services: true,
    serviceIds: ['stripe', 'slack', 'github', 'openai', 'anthropic', 'supabase', 'notion', 'discord', 'shopify', 'gmail', 'twilio', 'airtable', 'google-sheets', 'hubspot', 'mongodb', 'zoom'],
    graphic: 'grid',
    stat: { value: '819', label: 'Tools Ready' },
  },
  community: {
    label: 'Community',
    columns: [
      {
        title: 'Connect',
        links: [
          { label: 'Community Hub', href: '/community', desc: 'Discussion & updates' },
          { label: 'Forum', href: '/forum', desc: 'Ask questions & discuss', accent: true },
          { label: 'Sponsor', href: '/sponsor', desc: 'Support development' },
          { label: 'Report an Issue', href: '/report', desc: 'Bug reports & feedback' },
        ],
      },
      {
        title: 'Learn',
        links: [
          { label: 'All Courses', href: '/learn', desc: 'Free & premium courses', accent: true },
          { label: 'Glossary', href: '/glossary', desc: '80+ AI & MCP terms defined' },
          { label: 'Compare', href: '/compare', desc: 'vs Zapier, Make, n8n & more' },
        ],
      },
    ],
    serviceIds: ['github', 'discord', 'slack', 'linkedin', 'x', 'reddit'],
    graphic: 'community',
    stat: { value: '48', label: 'Services' },
  },
  products: {
    label: 'Products',
    columns: [
      {
        title: '0n Platform',
        links: [
          { label: '0nMCP', href: '/', desc: '819 tools, 48 services — the core orchestrator', badge: 'Core' },
          { label: '0nVault', href: '/security/vault', desc: 'AES-256 encrypted credential storage', badge: 'Patent Pending' },
          { label: '0n Engine', href: '/turn-it-on', desc: 'AI Brain import, export & verify' },
          { label: 'Digital Deed', href: '/security/transfer', desc: 'Business asset transfer system', accent: true },
          { label: 'App Builder', href: '/console', desc: 'Operations, routes, middleware & scheduler' },
        ],
      },
      {
        title: 'Ecosystem',
        links: [
          { label: '0nork Mini', href: '/store/onork-mini', desc: 'Embeddable AI widget' },
          { label: 'Partners', href: '/partners', desc: 'Partner products & integrations' },
          { label: 'Marketplace', href: '/marketplace', desc: 'Browse .0n workflows & automations', accent: true },
          { label: 'Connect', href: '/connect', desc: 'Partnerships & investment', accent: true },
        ],
      },
    ],
    serviceIds: ['vault', 'vault-container', 'deed', 'engine', 'app-builder', 'crm', 'stripe', 'anthropic', 'supabase'],
    graphic: 'vault',
    stat: { value: '1,078', label: 'Capabilities' },
  },
  security: {
    label: 'Security',
    columns: [
      {
        title: '0nVault',
        links: [
          { label: 'Security Overview', href: '/security', desc: 'Encrypted AI orchestration' },
          { label: 'Vault Container', href: '/security/vault', desc: '.0nv binary container format', badge: 'Patent Pending' },
          { label: '7 Semantic Layers', href: '/security/layers', desc: 'Independent encryption per layer' },
          { label: 'Multi-Party Escrow', href: '/security/escrow', desc: 'X25519 ECDH key agreement' },
        ],
      },
      {
        title: 'Transfer & Verification',
        links: [
          { label: 'Digital Deed', href: '/security/transfer', desc: 'Business asset transfer & chain of custody', accent: true },
          { label: 'Seal of Truth', href: '/security/seal-of-truth', desc: 'SHA3-256 integrity verification' },
          { label: 'Secure Transfer', href: '/security/transfer', desc: 'Replay prevention & audit trail' },
          { label: 'Patent-Pending', href: '/security/patent', desc: 'US Application #63/990,046', badge: 'Patent Pending' },
        ],
      },
    ],
    serviceIds: ['vault', 'vault-container', 'deed', 'engine'],
    graphic: 'shield',
    stat: { value: '2', label: 'Patents Pending' },
  },
}

type MenuKey = 'product' | 'community' | 'products' | 'security'

/* ── Build a curated service list from IDs ── */
function getServicesByIds(ids: string[]) {
  return ids.map((id) => ALL_SERVICES.find((s) => s.id === id)).filter(Boolean) as typeof ALL_SERVICES
}

/* ── Background graphic components ── */
function GridGraphic() {
  return (
    <div className="mega-panel-graphic mega-panel-graphic-grid" aria-hidden="true">
      {/* Animated circuit-style grid lines */}
      <svg width="100%" height="100%" viewBox="0 0 300 200" fill="none" style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
        {/* Horizontal lines */}
        {[30, 70, 110, 150].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="300" y2={y} stroke="#7ed957" strokeWidth="0.5" />
        ))}
        {/* Vertical lines */}
        {[50, 100, 150, 200, 250].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="#7ed957" strokeWidth="0.5" />
        ))}
        {/* Nodes at intersections */}
        {[50, 150, 250].map((x) =>
          [30, 110].map((y) => (
            <circle key={`n${x}${y}`} cx={x} cy={y} r="2.5" fill="#7ed957" opacity="0.4">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
            </circle>
          ))
        )}
        {/* Animated data pulse along paths */}
        <circle r="3" fill="#7ed957" opacity="0.8">
          <animateMotion dur="4s" repeatCount="indefinite" path="M50,30 L150,30 L150,110 L250,110" />
        </circle>
        <circle r="2" fill="#00d4ff" opacity="0.6">
          <animateMotion dur="5s" repeatCount="indefinite" path="M250,30 L150,30 L150,150 L50,150" />
        </circle>
      </svg>
      {/* Corner accent glow */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,217,87,0.08) 0%, transparent 70%)',
      }} />
    </div>
  )
}

function VaultGraphic() {
  return (
    <div className="mega-panel-graphic" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 300 200" fill="none" style={{ position: 'absolute', inset: 0, opacity: 0.07 }}>
        {/* Concentric lock rings */}
        <circle cx="150" cy="100" r="80" stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="4 6">
          <animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" dur="30s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="100" r="55" stroke="#00d4ff" strokeWidth="0.5" strokeDasharray="3 5">
          <animateTransform attributeName="transform" type="rotate" from="360 150 100" to="0 150 100" dur="22s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="100" r="30" stroke="#7ed957" strokeWidth="1" strokeDasharray="2 4">
          <animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" dur="15s" repeatCount="indefinite" />
        </circle>
        {/* Center shield */}
        <path d="M150 76 L150 124 M138 88 L162 112 M162 88 L138 112" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
      <div style={{
        position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)',
        width: '180px', height: '100px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
      }} />
    </div>
  )
}

function CommunityGraphic() {
  return (
    <div className="mega-panel-graphic" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 300 200" fill="none" style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
        {/* Network of connected people nodes */}
        {[
          { cx: 80, cy: 60 }, { cx: 220, cy: 50 }, { cx: 150, cy: 100 },
          { cx: 60, cy: 140 }, { cx: 240, cy: 150 }, { cx: 150, cy: 170 },
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r="8" fill="none" stroke="#00d4ff" strokeWidth="1">
              <animate attributeName="r" values="7;9;7" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.cx} cy={n.cy} r="3" fill="#00d4ff" opacity="0.5" />
          </g>
        ))}
        {/* Connection lines */}
        {[
          [80, 60, 150, 100], [220, 50, 150, 100], [60, 140, 150, 100],
          [240, 150, 150, 100], [150, 170, 150, 100], [80, 60, 60, 140],
          [220, 50, 240, 150],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00d4ff" strokeWidth="0.5" opacity="0.3" strokeDasharray="3 3" />
        ))}
      </svg>
      <div style={{
        position: 'absolute', top: '20px', left: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
      }} />
    </div>
  )
}

function ShieldGraphic() {
  return (
    <div className="mega-panel-graphic" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 300 200" fill="none" style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
        {/* Shield shape */}
        <path d="M150 20 L230 55 L230 120 C230 160 150 190 150 190 C150 190 70 160 70 120 L70 55 Z"
          fill="none" stroke="#7ed957" strokeWidth="1" strokeDasharray="6 3">
          <animate attributeName="stroke-dashoffset" from="0" to="18" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Inner lines = 7 layers */}
        {[45, 60, 75, 90, 105, 120, 135].map((y, i) => (
          <line key={`layer${i}`} x1="95" y1={y} x2="205" y2={y}
            stroke={i % 2 === 0 ? '#7ed957' : '#a78bfa'} strokeWidth="0.5" opacity="0.4" />
        ))}
        {/* Checkmark */}
        <path d="M130 105 L145 120 L175 80" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
        </path>
      </svg>
      <div style={{
        position: 'absolute', top: '-10px', right: '20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,217,87,0.06) 0%, transparent 70%)',
      }} />
    </div>
  )
}

const GRAPHICS: Record<string, () => React.ReactNode> = {
  grid: GridGraphic,
  vault: VaultGraphic,
  community: CommunityGraphic,
  shield: ShieldGraphic,
}

export default function MegaNav() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) return

    const loadUserAndPlan = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single()
      setUserPlan(profile?.plan || 'free')
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email ?? undefined, id: data.user.id })
        loadUserAndPlan(data.user.id)
      } else {
        setUser(null)
      }
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email ?? undefined, id: session.user.id })
        loadUserAndPlan(session.user.id)
      } else {
        setUser(null)
        setUserPlan('free')
      }
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
          <img src="/brand/logo-white.png" alt="0nMCP" height={32} width={100} style={{ height: 32, width: 'auto' }} />
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
          {!user ? (
            <>
              <Link href="/signup" className="mega-nav-cta-signup no-underline">
                Sign Up Free
              </Link>
              <Link href="/login" className="mega-nav-cta-signin no-underline">
                Sign in
              </Link>
            </>
          ) : userPlan === 'free' ? (
            <>
              <Link href="/console" className="mega-nav-cta-demo no-underline" style={{ position: 'relative' }}>
                Console
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  fontSize: 9, fontWeight: 700, lineHeight: 1,
                  padding: '2px 4px', borderRadius: 4,
                  background: 'rgba(126,217,87,0.15)',
                  color: '#7ed957',
                  border: '1px solid rgba(126,217,87,0.3)',
                }}>
                  Upgrade
                </span>
              </Link>
              <Link href="/account" className="mega-nav-cta-account no-underline">
                Account
              </Link>
            </>
          ) : (
            <>
              <Link href="/console" className="mega-nav-cta-demo no-underline" style={{ position: 'relative' }}>
                Console
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  fontSize: 9, fontWeight: 700, lineHeight: 1,
                  padding: '2px 4px', borderRadius: 4,
                  background: userPlan === 'team' ? 'rgba(0,212,255,0.12)' : 'rgba(126,217,87,0.12)',
                  color: userPlan === 'team' ? '#00d4ff' : '#7ed957',
                  border: `1px solid ${userPlan === 'team' ? 'rgba(0,212,255,0.25)' : 'rgba(126,217,87,0.25)'}`,
                  textTransform: 'uppercase',
                }}>
                  {userPlan}
                </span>
              </Link>
              <Link href="/account" className="mega-nav-cta-account no-underline">
                Account
              </Link>
            </>
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
          {/* Background graphic */}
          {section.graphic && GRAPHICS[section.graphic] && GRAPHICS[section.graphic]()}

          <div className="mega-dropdown-inner">
            <div className="mega-dropdown-columns">
              {/* Link columns */}
              {section.columns.map((col) => (
                <div key={col.title} className="mega-dropdown-col">
                  <span className="mega-dropdown-col-title">{col.title}</span>
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="mega-dropdown-link no-underline"
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

              {/* Right panel: services + stat */}
              {section.serviceIds && (
                <div className="mega-dropdown-services">
                  {/* Stat badge */}
                  {section.stat && (
                    <div className="mega-dropdown-stat">
                      <span className="mega-dropdown-stat-value">{section.stat.value}</span>
                      <span className="mega-dropdown-stat-label">{section.stat.label}</span>
                    </div>
                  )}

                  <span className="mega-dropdown-col-title">
                    {section.services ? '48 Connected Services' : 'Featured'}
                  </span>
                  <div className="mega-dropdown-logo-grid">
                    {getServicesByIds(section.serviceIds).map((s) => (
                      <div key={s.id} className="mega-dropdown-service" title={s.name}>
                        <ServiceIcon id={s.id} size={18} />
                        <span>{s.name}</span>
                      </div>
                    ))}
                    {section.services && (
                      <Link
                        href="/turn-it-on"
                        className="mega-dropdown-service mega-dropdown-service-more no-underline"
                        onClick={() => setOpenMenu(null)}
                      >
                        <span className="mega-dropdown-more-count">+{48 - (section.serviceIds?.length || 0)}</span>
                        <span>more</span>
                      </Link>
                    )}
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
                  >
                    {link.label}
                  </Link>
                ))
              )}
            </div>
          ))}
          <div className="mega-mobile-ctas">
            {!user ? (
              <>
                <Link href="/signup" className="btn-accent w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Sign Up Free
                </Link>
                <Link href="/login" className="btn-ghost w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
              </>
            ) : userPlan === 'free' ? (
              <>
                <Link href="/console?view=upgrade" className="btn-accent w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Start Free Trial
                </Link>
                <Link href="/console" className="btn-ghost w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Console
                </Link>
              </>
            ) : (
              <>
                <Link href="/console" className="btn-accent w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Console
                </Link>
                <Link href="/account" className="btn-ghost w-full text-center justify-center no-underline" onClick={() => setMobileOpen(false)}>
                  Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
