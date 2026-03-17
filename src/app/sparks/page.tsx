'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Pack {
  id: string
  name: string
  sparks: number
  price: string
  price_cents: number
  bonus: string | null
  badge: string
  purchase_url: string
}

interface Balance {
  balance: number
  lifetime_earned: number
  lifetime_spent: number
  is_owner?: boolean
  alert?: {
    level: string
    message: string
    suggested_pack: string
    purchase_url: string
  } | null
}

const FALLBACK_PACKS: Pack[] = [
  { id: 'starter', name: 'Starter', sparks: 50, price: '$5', price_cents: 500, bonus: null, badge: 'Try It', purchase_url: '/api/sparks/purchase?pack=starter' },
  { id: 'builder', name: 'Builder', sparks: 250, price: '$20', price_cents: 2000, bonus: '25% bonus', badge: 'Popular', purchase_url: '/api/sparks/purchase?pack=builder' },
  { id: 'pro', name: 'Pro', sparks: 750, price: '$50', price_cents: 5000, bonus: '50% bonus', badge: 'Best Value', purchase_url: '/api/sparks/purchase?pack=pro' },
  { id: 'unlimited', name: 'Unlimited', sparks: 2000, price: '$100', price_cents: 10000, bonus: '100% bonus', badge: 'Power User', purchase_url: '/api/sparks/purchase?pack=unlimited' },
]

const COST_TABLE = [
  { action: 'AI Chat Message', cost: 3 },
  { action: 'Workflow Execution', cost: 5 },
  { action: 'Website Build', cost: 10 },
  { action: 'SXO Audit', cost: 5 },
  { action: 'Content Generation', cost: 10 },
  { action: 'Config Conversion', cost: 1 },
  { action: 'Lead Enrichment', cost: 1 },
  { action: 'Email Sequence', cost: 5 },
  { action: 'Workflow Creation', cost: 2 },
  { action: 'File Export', cost: 1 },
]

export default function SparksPage() {
  const [packs, setPacks] = useState<Pack[]>(FALLBACK_PACKS)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('sparks') === 'purchased') {
      setSuccess(true)
      window.history.replaceState({}, '', '/sparks')
    }

    fetch('/api/sparks/packs')
      .then(r => r.json())
      .then(d => { if (d.packs?.length) setPacks(d.packs) })
      .catch(() => {})

    fetch('/api/sparks/balance')
      .then(r => {
        if (r.ok) return r.json()
        throw new Error('Not logged in')
      })
      .then(d => {
        setBalance(d)
        setIsLoggedIn(true)
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  const handlePurchase = (packId: string) => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=/sparks`
      return
    }
    setPurchasing(packId)
    window.location.href = `/api/sparks/purchase?pack=${packId}&return=${encodeURIComponent('/sparks')}`
  }

  const highlightColor = '#7ed957'

  return (
    <div style={{ minHeight: '100vh', background: '#080B0F', color: '#e4e4e7' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: highlightColor }}>0n</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>MCP</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isLoggedIn ? (
            <Link href="/console" style={{
              padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
              background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.3)',
              color: highlightColor, textDecoration: 'none',
            }}>
              Console
            </Link>
          ) : (
            <>
              <Link href="/login?redirect=/sparks" style={{ fontSize: '0.85rem', color: '#a1a1aa', textDecoration: 'none' }}>
                Log in
              </Link>
              <Link href="/signup" style={{
                padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
                background: highlightColor, color: '#080B0F', textDecoration: 'none',
              }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        {/* Success Banner */}
        {success && (
          <div style={{
            margin: '2rem 0 0', padding: '1rem 1.5rem', borderRadius: 12,
            background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.3)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: '1.5rem' }}>&#9889;</span>
            <div>
              <div style={{ fontWeight: 700, color: highlightColor }}>Credits purchased successfully!</div>
              <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Your balance has been updated. Start building.</div>
            </div>
            <Link href="/console" style={{
              marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, fontSize: '0.85rem',
              fontWeight: 600, background: highlightColor, color: '#080B0F', textDecoration: 'none',
            }}>
              Go to Console
            </Link>
          </div>
        )}

        {/* Hero */}
        <section style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20, marginBottom: '1.5rem',
            background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)',
          }}>
            <span style={{ fontSize: '1rem' }}>&#9889;</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: highlightColor, letterSpacing: '0.05em' }}>
              CREDITS
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>
            <span style={{ color: '#fff' }}>Power your </span>
            <span style={{ color: highlightColor }}>AI workflows</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#a1a1aa', maxWidth: 560, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Credits are pre-paid units that power every tool, workflow, and AI generation on 0nMCP.
            Buy once, use across the entire platform.
          </p>

          {/* Balance Card (if logged in) */}
          {isLoggedIn && balance && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 16,
              padding: '12px 24px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 600, letterSpacing: '0.05em' }}>YOUR BALANCE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: balance.balance > 20 ? highlightColor : '#ef4444' }}>
                  {balance.is_owner ? '∞' : balance.balance.toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Credits</span>
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.08)' }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 600 }}>LIFETIME</div>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
                  {balance.is_owner ? '∞' : balance.lifetime_earned.toLocaleString()} earned
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Pricing Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '4rem',
        }}>
          {packs.map((pack, i) => {
            const isPopular = i === 1
            const isPro = i === 2
            const perCredit = (pack.price_cents / 100 / pack.sparks).toFixed(3)
            return (
              <div
                key={pack.id}
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  padding: '2rem 1.5rem',
                  background: isPopular ? 'rgba(126,217,87,0.04)' : '#0E1117',
                  border: `1px solid ${isPopular ? 'rgba(126,217,87,0.4)' : isPro ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
              >
                {/* Badge */}
                <div style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  padding: '3px 14px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  background: isPopular ? highlightColor : isPro ? '#00d4ff' : 'rgba(255,255,255,0.06)',
                  color: isPopular || isPro ? '#080B0F' : '#a1a1aa',
                  border: `1px solid ${isPopular ? highlightColor : isPro ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {pack.badge || pack.name}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: 8, marginBottom: 4 }}>
                  {pack.name}
                </h3>

                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>{pack.price}</span>
                </div>

                <div style={{
                  fontSize: '2rem', fontWeight: 800, color: highlightColor, marginBottom: 4,
                }}>
                  {pack.sparks.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Credits</span>
                </div>

                {pack.bonus && (
                  <div style={{
                    fontSize: '0.8rem', fontWeight: 600, color: '#00d4ff', marginBottom: '0.5rem',
                  }}>
                    {pack.bonus}
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: '#71717a', marginBottom: '1.5rem' }}>
                  ${perCredit} per credit
                </div>

                <div style={{ flex: 1 }} />

                <button
                  onClick={() => handlePurchase(pack.id)}
                  disabled={purchasing === pack.id}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700,
                    cursor: purchasing === pack.id ? 'wait' : 'pointer',
                    border: 'none',
                    background: isPopular ? highlightColor : isPro ? '#00d4ff' : 'rgba(255,255,255,0.08)',
                    color: isPopular || isPro ? '#080B0F' : '#fff',
                    transition: 'opacity 0.15s',
                    opacity: purchasing === pack.id ? 0.6 : 1,
                  }}
                >
                  {purchasing === pack.id ? 'Redirecting...' : isLoggedIn ? 'Buy Now' : 'Sign up to buy'}
                </button>
              </div>
            )
          })}
        </section>

        {/* Cost Table */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '0.5rem' }}>
            What do credits cost?
          </h2>
          <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Every action on the platform costs a specific number of credits.
          </p>

          <div style={{
            maxWidth: 600, margin: '0 auto', borderRadius: 16, overflow: 'hidden',
            background: '#0E1117', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {COST_TABLE.map((item, i) => (
              <div
                key={item.action}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom: i < COST_TABLE.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: '#e4e4e7' }}>{item.action}</span>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 700, color: highlightColor,
                  fontFamily: 'monospace',
                }}>
                  {item.cost} {item.cost === 1 ? 'credit' : 'credits'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '2rem' }}>
            How it works
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem', maxWidth: 800, margin: '0 auto',
          }}>
            {[
              { step: '1', title: 'Buy Credits', desc: 'Choose a pack. Pay once via Stripe. No subscriptions, no recurring fees.' },
              { step: '2', title: 'Use the platform', desc: 'Run workflows, chat with AI, build websites, generate content — every action costs credits.' },
              { step: '3', title: 'Top up anytime', desc: 'Running low? Buy more credits whenever you need them. Bigger packs = better value.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{
                padding: '1.5rem', borderRadius: 12,
                background: '#0E1117', border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', fontSize: '0.9rem', fontWeight: 800, color: highlightColor,
                  fontFamily: 'monospace',
                }}>
                  {step}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '4rem', maxWidth: 700, margin: '0 auto 4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: '2rem' }}>
            FAQ
          </h2>
          {[
            { q: 'Do credits expire?', a: 'No. Credits never expire. Use them whenever you want.' },
            { q: 'Can I get a refund?', a: 'Unused credits can be refunded within 7 days of purchase. Contact mike@rocketopp.com.' },
            { q: 'Is there a free tier?', a: 'New accounts get 10 free credits to try the platform. Install 0nMCP locally for unlimited free usage.' },
            { q: 'Can I use 0nMCP for free?', a: 'Yes! Install 0nMCP locally (npm install -g 0nmcp) and run it on your own machine — unlimited, no credits needed. Credits only apply to cloud usage on 0nmcp.com.' },
          ].map(({ q, a }) => (
            <div key={q} style={{
              padding: '1.25rem 1.5rem', borderRadius: 12, marginBottom: '0.75rem',
              background: '#0E1117', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>{q}</div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.5 }}>{a}</div>
            </div>
          ))}
        </section>

        {/* CTA */}
        {!isLoggedIn && (
          <section style={{ textAlign: 'center', padding: '3rem 0 4rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Ready to build?
            </h2>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
              Create a free account and get 10 credits to start.
            </p>
            <Link href="/signup" style={{
              display: 'inline-block', padding: '14px 32px', borderRadius: 10,
              fontSize: '1rem', fontWeight: 700, background: highlightColor, color: '#080B0F',
              textDecoration: 'none',
            }}>
              Get Started Free
            </Link>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem',
        textAlign: 'center', fontSize: '0.75rem', color: '#52525b',
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Link href="/" style={{ color: '#71717a', textDecoration: 'none' }}>Home</Link>
          <Link href="/console" style={{ color: '#71717a', textDecoration: 'none' }}>Console</Link>
          <Link href="/store/onork-mini" style={{ color: '#71717a', textDecoration: 'none' }}>Store</Link>
          <Link href="/legal" style={{ color: '#71717a', textDecoration: 'none' }}>Legal</Link>
        </div>
        &copy; {new Date().getFullYear()} RocketOpp LLC. All rights reserved.
      </footer>
    </div>
  )
}
