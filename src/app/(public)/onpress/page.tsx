'use client'

import { useState, useEffect } from 'react'

const LAUNCH_DATE = new Date('2026-03-26T00:00:00Z')
const END_DATE = new Date(LAUNCH_DATE.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime()
      const diff = END_DATE.getTime() - now
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

export default function OnPressPage() {
  const countdown = useCountdown()
  const [loading, setLoading] = useState(false)
  const [seats, setSeats] = useState(100)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/onpress/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Checkout error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#0A0E17', color: '#E8E8E8', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a1f2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7ed957, #5cb83a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#0A0E17' }}>0n</div>
          <span style={{ fontWeight: 800, fontSize: 18 }}><span style={{ color: '#7ed957' }}>On</span>Press</span>
        </div>
        <a href="https://0nmcp.com" style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}>by 0nMCP</a>
      </nav>

      {/* Countdown Banner */}
      {!countdown.expired && (
        <div style={{ background: 'linear-gradient(90deg, #7ed957, #5cb83a)', padding: '10px 0', textAlign: 'center' }}>
          <span style={{ color: '#0A0E17', fontWeight: 800, fontSize: 14 }}>
            Launch Price — $49/year ends in{' '}
            <span style={{ fontFamily: 'monospace', fontSize: 16 }}>
              {countdown.days}d {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
            </span>
            {' '}— Only {seats} seats left
          </span>
        </div>
      )}

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(126,217,87,0.1)', color: '#7ed957', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
          First Ever — Figma to WordPress Plugin Converter
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Your Figma design.<br />
          <span style={{ color: '#7ed957' }}>A WordPress theme in seconds.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#888', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 32px' }}>
          OnPress extracts every color, font, spacing value, and component from your Figma file — and generates a production-ready WordPress theme or plugin. No code. No rebuilding. Just press.
        </p>
        <button
          onClick={handleCheckout}
          disabled={loading || countdown.expired}
          style={{
            padding: '16px 48px', background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
            color: '#0A0E17', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 800,
            cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 30px rgba(126,217,87,0.3)', transition: 'all 0.2s',
          }}
        >
          {loading ? 'Redirecting to checkout...' : 'Get OnPress — $49/year'}
        </button>
        <p style={{ fontSize: 12, color: '#555', marginTop: 12 }}>7-day money-back guarantee. Cancel anytime.</p>
      </section>

      {/* How It Works */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
          Three clicks. That's it.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { step: '01', title: 'Open in Figma', desc: 'Install the OnPress plugin from the Figma Community. Open your design file.' },
            { step: '02', title: 'Extract & Generate', desc: 'OnPress scans every color, font, spacing, component, and layout. One click.' },
            { step: '03', title: 'Download & Install', desc: 'Get a production-ready WordPress theme ZIP. Upload to WordPress. Done.' },
          ].map(s => (
            <div key={s.step} style={{ background: '#111622', border: '1px solid #1a1f2e', borderRadius: 16, padding: 28 }}>
              <div style={{ color: '#7ed957', fontFamily: 'monospace', fontSize: 32, fontWeight: 900, marginBottom: 12 }}>{s.step}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two Products */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 48 }}>
          Themes <span style={{ color: '#7ed957' }}>AND</span> Plugins
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#111622', border: '2px solid #7ed957', borderRadius: 16, padding: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: 24, background: '#7ed957', color: '#0A0E17', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Theme Generator</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, marginTop: 8 }}>WordPress Theme</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['style.css with CSS variables from Figma', 'functions.php with Customizer controls', 'All template files (header, footer, index, single, page, 404, search, archive)', 'Google Fonts auto-imported', 'Editor color palette from your design', 'Responsive breakpoints', 'WooCommerce ready'].map(f => (
                <li key={f} style={{ fontSize: 13, color: '#bbb', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#7ed957', flexShrink: 0 }}>+</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: '#111622', border: '2px solid #a78bfa', borderRadius: 16, padding: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: 24, background: '#a78bfa', color: '#0A0E17', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>First Ever</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, marginTop: 8 }}>WordPress Plugin</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Custom Gutenberg blocks from Figma components', 'Shortcodes for every component', 'Admin settings page with color pickers', 'REST API endpoints', 'Design tokens as CSS variables', 'Block render templates', 'Works with any theme'].map(f => (
                <li key={f} style={{ fontSize: 13, color: '#bbb', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#a78bfa', flexShrink: 0 }}>+</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What Gets Extracted */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 32 }}>
          Every design token. Automatically.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { name: 'Colors', desc: 'Every paint style → CSS variables + Customizer controls' },
            { name: 'Typography', desc: 'Font families, sizes, weights, line heights → CSS rules + Google Fonts' },
            { name: 'Spacing', desc: 'Auto-layout padding + gaps → spacing scale variables' },
            { name: 'Border Radius', desc: 'Corner radii → radius variables' },
            { name: 'Effects', desc: 'Drop shadows, blurs → CSS shadow classes' },
            { name: 'Components', desc: 'Figma components → WordPress blocks + shortcodes' },
            { name: 'Auto Layout', desc: 'Flex direction, alignment, wrap → CSS flexbox' },
            { name: 'Page Structure', desc: 'Frame hierarchy → template structure' },
          ].map(t => (
            <div key={t.name} style={{ background: '#111622', border: '1px solid #1a1f2e', borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7ed957', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WordPress Plugin Too */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
          Also available as a <span style={{ color: '#7ed957' }}>WordPress plugin</span>
        </h2>
        <p style={{ color: '#888', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          Don't use Figma? No problem. Install the OnPress WordPress plugin, paste any Figma URL into your dashboard, and generate themes and plugins directly from WordPress admin. No Figma account needed — just the share link.
        </p>
      </section>

      {/* Pricing */}
      <section style={{ padding: '60px 24px', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#111622', border: '2px solid #7ed957', borderRadius: 20, padding: 40, position: 'relative' }}>
          {!countdown.expired && (
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 16px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              Launch price — {countdown.days}d {countdown.hours}h left
            </div>
          )}
          <div style={{ fontSize: 14, color: '#888', textDecoration: 'line-through', marginBottom: 4, marginTop: 8 }}>$149/year</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#7ed957', lineHeight: 1 }}>$49</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>per year</div>
          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {[
              'Figma plugin (unlimited conversions)',
              'WordPress plugin (paste any Figma URL)',
              'Theme generator (12 template files)',
              'Plugin generator (blocks, shortcodes, settings)',
              'Real ZIP downloads',
              'Direct WordPress install',
              'All future updates',
              '7-day money-back guarantee',
            ].map(f => (
              <li key={f} style={{ fontSize: 13, color: '#bbb', display: 'flex', gap: 8 }}>
                <span style={{ color: '#7ed957' }}>+</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleCheckout}
            disabled={loading || countdown.expired}
            style={{
              width: '100%', padding: '16px', background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
              color: '#0A0E17', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 30px rgba(126,217,87,0.3)',
            }}
          >
            {loading ? 'Loading...' : 'Get OnPress Now — $49/year'}
          </button>
          <p style={{ fontSize: 11, color: '#555', marginTop: 10 }}>Secure checkout via Stripe. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid #1a1f2e', marginTop: 60 }}>
        <p style={{ fontSize: 12, color: '#555' }}>
          OnPress by <a href="https://0nmcp.com" style={{ color: '#7ed957', textDecoration: 'none' }}>0nMCP</a> / RocketOpp LLC
        </p>
      </footer>
    </div>
  )
}
