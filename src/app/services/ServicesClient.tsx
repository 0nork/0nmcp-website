'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { STATS } from '@/data/stats'
import ServiceLogo from '@/components/ServiceLogo'

// ─── TYPES ───────────────────────────────────────────────────────

interface ServiceData {
  id: string
  name: string
  slug: string
  icon: string
  category_id: string
  display_order: number
  status: string
  description_short: string
  description_long: string
  tool_count: number
  logo?: string
}

interface CategoryData {
  id: string
  label: string
  slug: string
  display_order: number
  description: string
  icon: string
}

interface ServicesClientProps {
  categories: CategoryData[]
  categoryServices: Record<string, ServiceData[]>
  topServices: ServiceData[]
  allServices: ServiceData[]
}

// ─── ANIMATED COUNTER HOOK ───────────────────────────────────────

function useCountUp(target: number, duration = 2000, startDelay = 0) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    const timeout = setTimeout(() => {
      const steps = 60
      const increment = target / steps
      let current = 0
      let step = 0

      const timer = setInterval(() => {
        step++
        // Ease-out curve
        const progress = 1 - Math.pow(1 - step / steps, 3)
        current = Math.round(target * progress)
        setCount(current)
        if (step >= steps) {
          setCount(target)
          clearInterval(timer)
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }, startDelay)

    return () => clearTimeout(timeout)
  }, [started, target, duration, startDelay])

  return { count, ref }
}

// ─── ORBIT ANIMATION ─────────────────────────────────────────────

function OrbitRing({ services, radius, duration, reverse }: {
  services: ServiceData[]
  radius: number
  duration: number
  reverse?: boolean
}) {
  return (
    <div
      className="services-orbit-ring"
      style={{
        width: radius * 2,
        height: radius * 2,
        animation: `servicesOrbit ${duration}s linear infinite ${reverse ? 'reverse' : ''}`,
      }}
    >
      {services.map((s, i) => {
        const angle = (360 / services.length) * i
        return (
          <div
            key={s.id}
            className="services-orbit-node"
            style={{
              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
              animation: `servicesOrbit ${duration}s linear infinite ${reverse ? '' : 'reverse'}`,
            }}
          >
            <Link
              href={`/turn-it-on/${s.slug}`}
              className="services-orbit-icon"
              title={`${s.name} — ${s.tool_count} tools`}
            >
              <ServiceLogo
                src={(s as unknown as Record<string, unknown>).logo as string | undefined}
                alt={s.name}
                size={32}
                icon={s.icon}
              />
            </Link>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────

export function ServicesClient({
  categories,
  categoryServices,
  topServices,
  allServices,
}: ServicesClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  // Animated counters
  const tools = useCountUp(STATS.tools, 2200, 200)
  const services = useCountUp(STATS.services, 2000, 400)
  const capabilities = useCountUp(STATS.capabilities, 2400, 100)
  const cats = useCountUp(STATS.categories, 1800, 600)

  // Filter services
  const filteredCategories = categories.filter(cat => {
    if (activeCategory && cat.id !== activeCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const svc = categoryServices[cat.id] || []
      return (
        cat.label.toLowerCase().includes(q) ||
        svc.some(s => s.name.toLowerCase().includes(q) || s.description_short.toLowerCase().includes(q))
      )
    }
    return true
  })

  const getFilteredServices = useCallback((catId: string) => {
    const svc = categoryServices[catId] || []
    if (!searchQuery) return svc
    const q = searchQuery.toLowerCase()
    return svc.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description_short.toLowerCase().includes(q)
    )
  }, [categoryServices, searchQuery])

  // Stagger animation index for service cards
  const [visibleCards, setVisibleCards] = useState(new Set<string>())
  const cardObserver = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    cardObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => new Set(prev).add(entry.target.getAttribute('data-service-id') || ''))
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )
    return () => cardObserver.current?.disconnect()
  }, [])

  const cardRef = useCallback((el: HTMLElement | null) => {
    if (el && cardObserver.current) {
      cardObserver.current.observe(el)
    }
  }, [])

  // Orbit rings — split top services into 2 rings
  const ring1 = topServices.slice(0, 6)
  const ring2 = topServices.slice(6, 12)

  return (
    <div className="services-page">
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="services-hero">
        {/* Background effects */}
        <div className="services-hero-bg">
          <div className="services-hero-glow services-hero-glow-1" />
          <div className="services-hero-glow services-hero-glow-2" />
          <div className="services-hero-glow services-hero-glow-3" />
          <div className="services-hero-grid" />
        </div>

        <div className="services-hero-content">
          {/* Orbit visualization */}
          <div className="services-orbit-container">
            {/* Center node */}
            <div className="services-orbit-center">
              <img
                src="/brand/icon-green.png"
                alt="0nMCP"
                width={48}
                height={48}
                style={{ filter: 'drop-shadow(0 0 20px rgba(126,217,87,0.5))' }}
              />
            </div>
            <OrbitRing services={ring1} radius={120} duration={30} />
            <OrbitRing services={ring2} radius={200} duration={45} reverse />
            {/* Orbit lines */}
            <div className="services-orbit-line" style={{ width: 240, height: 240 }} />
            <div className="services-orbit-line" style={{ width: 400, height: 400 }} />
          </div>

          {/* Hero text */}
          <div className="services-hero-text">
            <div className="services-hero-badge">
              <span className="services-hero-badge-dot" />
              <span>CONNECTED INFRASTRUCTURE</span>
            </div>
            <h1 className="services-hero-title">
              One server.<br />
              <span className="services-hero-accent">Every service.</span>
            </h1>
            <p className="services-hero-subtitle">
              {STATS.services} services. {STATS.tools.toLocaleString()} tools. {STATS.capabilities.toLocaleString()} pre-built capabilities.
              Stop being a victim of non-existent functions — become an inventor of processes.
            </p>
          </div>
        </div>

        {/* ─── STAT COUNTERS ────────────────────────────────── */}
        <div className="services-stats-bar" ref={tools.ref}>
          <div className="services-stat">
            <div className="services-stat-number services-stat-green">
              {tools.count.toLocaleString()}
            </div>
            <div className="services-stat-label">Tools</div>
            <div className="services-stat-bar">
              <div className="services-stat-bar-fill services-stat-bar-green" style={{ width: `${(tools.count / STATS.tools) * 100}%` }} />
            </div>
          </div>
          <div className="services-stat-divider" />
          <div className="services-stat">
            <div className="services-stat-number services-stat-cyan">
              {services.count}
            </div>
            <div className="services-stat-label">Services</div>
            <div className="services-stat-bar">
              <div className="services-stat-bar-fill services-stat-bar-cyan" style={{ width: `${(services.count / STATS.services) * 100}%` }} />
            </div>
          </div>
          <div className="services-stat-divider" />
          <div className="services-stat">
            <div className="services-stat-number services-stat-purple">
              {capabilities.count.toLocaleString()}
            </div>
            <div className="services-stat-label">Capabilities</div>
            <div className="services-stat-bar">
              <div className="services-stat-bar-fill services-stat-bar-purple" style={{ width: `${(capabilities.count / STATS.capabilities) * 100}%` }} />
            </div>
          </div>
          <div className="services-stat-divider" />
          <div className="services-stat">
            <div className="services-stat-number services-stat-orange">
              {cats.count}
            </div>
            <div className="services-stat-label">Categories</div>
            <div className="services-stat-bar">
              <div className="services-stat-bar-fill services-stat-bar-orange" style={{ width: `${(cats.count / STATS.categories) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FILTER BAR ────────────────────────────────────── */}
      <section className="services-filter-section">
        <div className="services-filter-bar">
          <div className="services-search-wrap">
            <svg className="services-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${STATS.services} services...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="services-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="services-search-clear">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="services-category-pills">
            <button
              className={`services-pill ${!activeCategory ? 'services-pill-active' : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              All ({allServices.length})
            </button>
            {categories.map(cat => {
              const count = (categoryServices[cat.id] || []).length
              if (count === 0) return null
              return (
                <button
                  key={cat.id}
                  className={`services-pill ${activeCategory === cat.id ? 'services-pill-active' : ''}`}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                >
                  <span>{cat.icon}</span> {cat.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SERVICE GRID BY CATEGORY ──────────────────────── */}
      <section className="services-grid-section">
        {filteredCategories.map(cat => {
          const svc = getFilteredServices(cat.id)
          if (svc.length === 0) return null

          return (
            <div key={cat.id} className="services-category-block">
              <div className="services-category-header">
                <span className="services-category-icon">{cat.icon}</span>
                <div>
                  <h2 className="services-category-title">{cat.label}</h2>
                  <p className="services-category-desc">{cat.description}</p>
                </div>
                <span className="services-category-count">{svc.length}</span>
              </div>

              <div className="services-card-grid">
                {svc.map((s, i) => {
                  const isVisible = visibleCards.has(s.id)
                  const isHovered = hoveredService === s.id

                  return (
                    <Link
                      key={s.id}
                      href={`/turn-it-on/${s.slug}`}
                      ref={cardRef}
                      data-service-id={s.id}
                      className="services-card"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                        transitionDelay: `${i * 40}ms`,
                        borderColor: isHovered ? `${getServiceColor(s)}40` : undefined,
                        boxShadow: isHovered ? `0 0 30px ${getServiceColor(s)}10, inset 0 1px 0 ${getServiceColor(s)}15` : undefined,
                      }}
                      onMouseEnter={() => setHoveredService(s.id)}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      {/* Glow line top */}
                      <div
                        className="services-card-glow-line"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${getServiceColor(s)}, transparent)`,
                          opacity: isHovered ? 0.6 : 0,
                        }}
                      />

                      <div className="services-card-header">
                        <div className="services-card-logo" style={{ borderColor: `${getServiceColor(s)}25` }}>
                          <ServiceLogo
                            src={(s as unknown as Record<string, unknown>).logo as string | undefined}
                            alt={s.name}
                            size={28}
                            icon={s.icon}
                          />
                        </div>
                        <div className="services-card-meta">
                          <div className="services-card-name">{s.name}</div>
                          <div className="services-card-tools">
                            <span style={{ color: getServiceColor(s) }}>{s.tool_count}</span> tools
                          </div>
                        </div>
                        {s.status === 'live' && (
                          <span className="services-card-live-dot" />
                        )}
                      </div>

                      <p className="services-card-desc">{s.description_short}</p>

                      <div className="services-card-footer">
                        <span className="services-card-explore">
                          Explore <span className="services-card-arrow">→</span>
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

        {filteredCategories.length === 0 && (
          <div className="services-empty">
            <p>No services match &ldquo;{searchQuery}&rdquo;</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory(null) }} className="btn-ghost" style={{ marginTop: '1rem' }}>
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ─── BOTTOM CTA ────────────────────────────────────── */}
      <section className="services-cta-section">
        <div className="services-cta-glow" />
        <h2 className="services-cta-title">
          Ready to connect <span style={{ color: 'var(--accent)' }}>everything</span>?
        </h2>
        <p className="services-cta-subtitle">
          {STATS.tools.toLocaleString()} tools. {STATS.services} services. One command to start.
        </p>
        <div className="services-cta-code">
          <code>npx 0nmcp</code>
        </div>
        <div className="services-cta-buttons">
          <Link href="/install" className="btn-accent">
            Install 0nMCP
          </Link>
          <Link href="/console" className="btn-ghost">
            Open Console
          </Link>
        </div>
      </section>

      {/* ─── STYLES ────────────────────────────────────────── */}
      <style>{`
        /* ===== PAGE ===== */
        .services-page {
          min-height: 100vh;
          position: relative;
        }

        /* ===== HERO ===== */
        .services-hero {
          position: relative;
          overflow: hidden;
          padding: 6rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 90vh;
          justify-content: center;
        }

        .services-hero-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .services-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(126,217,87,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(126,217,87,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%);
        }

        .services-hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.4;
        }
        .services-hero-glow-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(126,217,87,0.15), transparent 70%);
          top: -100px; left: 50%;
          transform: translateX(-50%);
          animation: servicesGlowDrift1 8s ease-in-out infinite alternate;
        }
        .services-hero-glow-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(0,212,255,0.1), transparent 70%);
          top: 200px; right: -100px;
          animation: servicesGlowDrift2 12s ease-in-out infinite alternate;
        }
        .services-hero-glow-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%);
          bottom: 0; left: -50px;
          animation: servicesGlowDrift3 10s ease-in-out infinite alternate;
        }

        @keyframes servicesGlowDrift1 { from { transform: translateX(-50%) translateY(0); } to { transform: translateX(-50%) translateY(30px); } }
        @keyframes servicesGlowDrift2 { from { transform: translateX(0) translateY(0); } to { transform: translateX(-20px) translateY(20px); } }
        @keyframes servicesGlowDrift3 { from { transform: translateX(0) translateY(0); } to { transform: translateX(30px) translateY(-15px); } }

        .services-hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
          max-width: 900px;
        }

        /* ===== ORBIT ===== */
        .services-orbit-container {
          position: relative;
          width: 440px;
          height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .services-orbit-center {
          position: absolute;
          z-index: 3;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: rgba(126,217,87,0.08);
          border: 2px solid rgba(126,217,87,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: servicesCenterPulse 3s ease-in-out infinite;
        }

        @keyframes servicesCenterPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(126,217,87,0.15), 0 0 60px rgba(126,217,87,0.05); }
          50% { box-shadow: 0 0 50px rgba(126,217,87,0.25), 0 0 100px rgba(126,217,87,0.1); }
        }

        .services-orbit-ring {
          position: absolute;
          border-radius: 50%;
        }

        .services-orbit-node {
          position: absolute;
          top: 50%; left: 50%;
          margin-top: -20px;
          margin-left: -20px;
        }

        .services-orbit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border-radius: 12px;
          background: rgba(26,26,37,0.9);
          border: 1px solid var(--border);
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .services-orbit-icon:hover {
          border-color: var(--accent);
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(126,217,87,0.2);
        }

        .services-orbit-line {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(126,217,87,0.06);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        @keyframes servicesOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ===== HERO TEXT ===== */
        .services-hero-text {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .services-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          background: rgba(126,217,87,0.08);
          border: 1px solid rgba(126,217,87,0.2);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent);
          font-family: var(--font-mono);
        }

        .services-hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: servicesBadgePulse 2s ease-in-out infinite;
        }

        @keyframes servicesBadgePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px var(--accent); }
          50% { opacity: 0.5; box-shadow: 0 0 8px var(--accent); }
        }

        .services-hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.05;
          color: var(--text-primary);
          font-family: var(--font-display);
          letter-spacing: -0.03em;
        }

        .services-hero-accent {
          background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .services-hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.6;
        }

        /* ===== STAT COUNTERS ===== */
        .services-stats-bar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: stretch;
          justify-content: center;
          gap: 0;
          margin-top: 2rem;
          padding: 2rem 3rem;
          background: rgba(26,26,37,0.6);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          width: 100%;
          max-width: 800px;
        }

        .services-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0 1.5rem;
        }

        .services-stat-number {
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 800;
          font-family: var(--font-mono);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .services-stat-green { color: #7ed957; text-shadow: 0 0 30px rgba(126,217,87,0.3); }
        .services-stat-cyan { color: #00d4ff; text-shadow: 0 0 30px rgba(0,212,255,0.3); }
        .services-stat-purple { color: #a78bfa; text-shadow: 0 0 30px rgba(167,139,250,0.3); }
        .services-stat-orange { color: #ff6b35; text-shadow: 0 0 30px rgba(255,107,53,0.3); }

        .services-stat-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .services-stat-bar {
          width: 100%;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.04);
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .services-stat-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 2.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .services-stat-bar-green { background: linear-gradient(90deg, #5cb83a, #7ed957); box-shadow: 0 0 8px rgba(126,217,87,0.4); }
        .services-stat-bar-cyan { background: linear-gradient(90deg, #0090b0, #00d4ff); box-shadow: 0 0 8px rgba(0,212,255,0.4); }
        .services-stat-bar-purple { background: linear-gradient(90deg, #7c5cbf, #a78bfa); box-shadow: 0 0 8px rgba(167,139,250,0.4); }
        .services-stat-bar-orange { background: linear-gradient(90deg, #cc5020, #ff6b35); box-shadow: 0 0 8px rgba(255,107,53,0.4); }

        .services-stat-divider {
          width: 1px;
          align-self: stretch;
          background: linear-gradient(180deg, transparent, var(--border), transparent);
        }

        /* ===== FILTER ===== */
        .services-filter-section {
          padding: 2rem 1.5rem 0;
          max-width: 1200px;
          margin: 0 auto;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .services-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          border-radius: 1rem;
        }

        .services-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .services-search-icon {
          position: absolute;
          left: 0.75rem;
          width: 16px; height: 16px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .services-search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-family: var(--font-display);
          outline: none;
          transition: border-color 0.2s;
        }
        .services-search-input:focus {
          border-color: var(--accent);
        }
        .services-search-input::placeholder {
          color: var(--text-muted);
        }

        .services-search-clear {
          position: absolute;
          right: 0.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
        }

        .services-category-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }

        .services-pill {
          padding: 0.3rem 0.625rem;
          border-radius: 9999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-display);
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          white-space: nowrap;
        }
        .services-pill:hover {
          border-color: var(--accent);
          color: var(--text-primary);
        }
        .services-pill-active {
          background: rgba(126,217,87,0.1);
          border-color: rgba(126,217,87,0.3);
          color: var(--accent);
        }

        /* ===== SERVICE GRID ===== */
        .services-grid-section {
          padding: 2rem 1.5rem 4rem;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .services-category-block {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .services-category-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
        }

        .services-category-icon {
          font-size: 1.5rem;
          width: 2.5rem; height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .services-category-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .services-category-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .services-category-count {
          margin-left: auto;
          font-size: 0.7rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--accent);
          background: rgba(126,217,87,0.08);
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
          border: 1px solid rgba(126,217,87,0.15);
          flex-shrink: 0;
        }

        .services-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 0.75rem;
        }

        /* ===== SERVICE CARD ===== */
        .services-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 0.875rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .services-card:hover {
          transform: translateY(-2px);
        }

        .services-card:hover .services-card-arrow {
          transform: translateX(3px);
        }

        .services-card-glow-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          transition: opacity 0.3s;
        }

        .services-card-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .services-card-logo {
          width: 40px; height: 40px;
          border-radius: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .services-card-meta {
          flex: 1;
          min-width: 0;
        }

        .services-card-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .services-card-tools {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .services-card-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(126,217,87,0.5);
          animation: servicesBadgePulse 2s ease-in-out infinite;
        }

        .services-card-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .services-card-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: auto;
        }

        .services-card-explore {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: color 0.2s;
        }
        .services-card:hover .services-card-explore {
          color: var(--accent);
        }

        .services-card-arrow {
          display: inline-block;
          transition: transform 0.2s;
        }

        .services-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
          font-size: 1rem;
        }

        /* ===== CTA ===== */
        .services-cta-section {
          position: relative;
          text-align: center;
          padding: 6rem 1.5rem;
          overflow: hidden;
        }

        .services-cta-glow {
          position: absolute;
          top: 50%; left: 50%;
          width: 600px; height: 400px;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(126,217,87,0.08), transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .services-cta-title {
          position: relative;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 0.75rem;
        }

        .services-cta-subtitle {
          position: relative;
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0 0 2rem;
        }

        .services-cta-code {
          position: relative;
          display: inline-block;
          padding: 0.75rem 2rem;
          background: rgba(126,217,87,0.06);
          border: 1px solid rgba(126,217,87,0.2);
          border-radius: 0.75rem;
          font-family: var(--font-mono);
          font-size: 1.1rem;
          color: var(--accent);
          margin-bottom: 2rem;
          letter-spacing: 0.02em;
        }

        .services-cta-buttons {
          position: relative;
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .services-hero { min-height: auto; padding: 4rem 1rem 2rem; }
          .services-orbit-container { transform: scale(0.65); margin: -3rem 0; }
          .services-stats-bar { flex-wrap: wrap; gap: 1.5rem; padding: 1.5rem; }
          .services-stat-divider { display: none; }
          .services-stat { min-width: 40%; }
          .services-filter-section { position: static; }
          .services-card-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .services-hero-title { font-size: 2rem; }
          .services-orbit-container { transform: scale(0.5); }
          .services-stat { min-width: 100%; }
          .services-stats-bar { flex-direction: column; align-items: center; }
        }
      `}</style>
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────

function getServiceColor(service: ServiceData): string {
  const colors: Record<string, string> = {
    logic: '#7ed957',
    everyday: '#f59e0b',
    communication: '#1DA1F2',
    email_marketing: '#7c3aed',
    payments: '#ff6b35',
    crm_sales: '#00d4ff',
    project_mgmt: '#3b82f6',
    support: '#ec4899',
    ai: '#a78bfa',
    developer: '#7ed957',
    social_media: '#1DA1F2',
    advertising: '#f97316',
    messaging: '#22d3ee',
    accounting: '#10b981',
    finance: '#6366f1',
    storage: '#8b5cf6',
    cold_email: '#ef4444',
    automation: '#ff6b35',
    integration: '#00d4ff',
    cloud: '#3b82f6',
  }
  return colors[service.category_id] || '#7ed957'
}
