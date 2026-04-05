'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { Globe, Zap, CheckCircle2, XCircle, Loader2, Lock, ExternalLink, ArrowRight } from 'lucide-react'

// ── Types ──

interface BuildFormData {
  businessName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  website: string
  brandColor: string
}

type TriggerStatus = 'idle' | 'loading' | 'success' | 'error'

interface TriggerResult {
  success?: boolean
  conversationId?: string
  contactId?: string
  message?: string
  error?: string
}

interface RecentBuild {
  businessName: string
  status: string
  triggeredAt: string
  conversationId?: string
}

const DEFAULT_FORM: BuildFormData = {
  businessName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  website: '',
  brandColor: '#6EE05A',
}

const SITE_BUILDER_SLUG = 'web0n-site-builder'

// ── Component ──

export function SiteBuilderView() {
  const [owned, setOwned] = useState<boolean | null>(null)
  const [form, setForm] = useState<BuildFormData>(DEFAULT_FORM)
  const [status, setStatus] = useState<TriggerStatus>('idle')
  const [result, setResult] = useState<TriggerResult | null>(null)
  const [recentBuilds, setRecentBuilds] = useState<RecentBuild[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if user owns the site builder listing
  useEffect(() => {
    async function checkOwnership() {
      try {
        const res = await fetch('/api/console/store/purchases')
        if (!res.ok) { setOwned(false); return }
        const data = await res.json()
        const purchases = data.purchases || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasSiteBuilder = purchases.some((p: any) =>
          p.listing?.slug === SITE_BUILDER_SLUG
        )
        setOwned(hasSiteBuilder)
      } catch {
        setOwned(false)
      }
    }
    checkOwnership()
  }, [])

  // Load recent builds from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('0n_recent_builds')
      if (stored) setRecentBuilds(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setResult(null)

    try {
      const res = await fetch('/api/ghl-agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data: TriggerResult = await res.json()

      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)

      setResult(data)
      setStatus('success')

      // Save to recent builds
      const build: RecentBuild = {
        businessName: form.businessName,
        status: 'triggered',
        triggeredAt: new Date().toISOString(),
        conversationId: data.conversationId,
      }
      const updated = [build, ...recentBuilds].slice(0, 10)
      setRecentBuilds(updated)
      localStorage.setItem('0n_recent_builds', JSON.stringify(updated))

      setForm(DEFAULT_FORM)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setResult({ error: msg })
      setStatus('error')
    }
  }

  // ── Loading state ──
  if (owned === null) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  // ── Not purchased — show upgrade CTA ──
  if (!owned) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(126,217,87,0.12), rgba(0,212,255,0.08))',
            border: '1px solid rgba(126,217,87,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Globe size={36} style={{ color: '#6EE05A' }} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            web0n Site Builder
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            AI-powered website generation + CRM funnel deployment.
            Generate 5-page professional websites in minutes with a single click.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            marginBottom: 32, textAlign: 'left',
          }}>
            {[
              'AI-generated HTML pages',
              'CRM funnel auto-deploy',
              'CRO9 conversion methodology',
              'SEO-optimized content',
              'Mobile-responsive design',
              'Booking calendar widget',
              'One-click build trigger',
              'CRM Agent Studio integration',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={14} style={{ color: '#6EE05A', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#ccc' }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)' }}>$1,497</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>one-time</span>
          </div>

          <a
            href="/console/marketplace/web0n-site-builder"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
              color: '#0B0F19', fontSize: 15, fontWeight: 800,
              textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(126,217,87,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <Lock size={16} />
            Unlock Site Builder
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    )
  }

  // ── Owned — show the builder form ──
  return (
    <div style={{
      flex: 1, overflow: 'auto', background: 'var(--bg-primary)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(126,217,87,0.15), rgba(0,212,255,0.1))',
            border: '1px solid rgba(126,217,87,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={22} style={{ color: '#6EE05A' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              web0n Site Builder
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              AI website generation + CRM funnel deployment
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#6EE05A', boxShadow: '0 0 8px rgba(126,217,87,0.5)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6EE05A' }}>Active</span>
          </div>
        </div>

        {/* Build Form */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 28,
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Business Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Business name *</label>
              <input
                ref={inputRef}
                name="businessName"
                type="text"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Acme Roofing Co."
                required
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>

            {/* Email + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Email *</label>
                <input
                  name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="owner@business.com" required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Phone</label>
                <input
                  name="phone" type="tel" value={form.phone}
                  onChange={handleChange} placeholder="+1 555 000 0000"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Street address</label>
              <input
                name="address" type="text" value={form.address}
                onChange={handleChange} placeholder="123 Main St"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>

            {/* City / State / Zip */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>City</label>
                <input
                  name="city" type="text" value={form.city}
                  onChange={handleChange} placeholder="Pittsburgh"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>State</label>
                <input
                  name="state" type="text" value={form.state}
                  onChange={handleChange} placeholder="PA" maxLength={2}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Zip</label>
                <input
                  name="zip" type="text" value={form.zip}
                  onChange={handleChange} placeholder="15222"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
            </div>

            {/* Website + Brand Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Current website</label>
                <input
                  name="website" type="url" value={form.website}
                  onChange={handleChange} placeholder="https://example.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Brand color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    name="brandColor" type="color" value={form.brandColor}
                    onChange={handleChange}
                    style={{
                      width: 40, height: 40, border: '1px solid var(--border)',
                      borderRadius: 8, padding: 3, background: 'var(--bg-primary)', cursor: 'pointer',
                    }}
                  />
                  <input
                    name="brandColor" type="text" value={form.brandColor}
                    onChange={handleChange} placeholder="#6EE05A" maxLength={7}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 28px', borderRadius: 12, marginTop: 8,
                background: status === 'loading' ? 'rgba(126,217,87,0.3)' : 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
                border: 'none', color: '#0B0F19', fontSize: 15, fontWeight: 800,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (status !== 'loading') { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(126,217,87,0.3)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {status === 'loading' ? (
                <><Loader2 size={18} className="animate-spin" /> Building website...</>
              ) : (
                <><Zap size={18} /> Build website</>
              )}
            </button>
          </form>

          {/* Result banner */}
          {result && status === 'success' && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              marginTop: 20, padding: '14px 16px', borderRadius: 12,
              background: 'rgba(126,217,87,0.06)', border: '1px solid rgba(126,217,87,0.2)',
            }}>
              <CheckCircle2 size={20} style={{ color: '#6EE05A', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Build triggered</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
                  CRM agent processing · {result.conversationId?.slice(0, 16)}...
                </p>
              </div>
            </div>
          )}

          {result && status === 'error' && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              marginTop: 20, padding: '14px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Build failed</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>{result.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{
          marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 24,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>How it works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { step: '1', title: 'Enter details', desc: 'Business name, email, address, brand color' },
              { step: '2', title: 'AI generates pages', desc: '5 pages — Home, Services, About, Booking, Contact' },
              { step: '3', title: 'Deploy to CRM', desc: 'Funnel auto-deployed to client sub-account' },
              { step: '4', title: 'Live in minutes', desc: 'Website ready for custom domain + launch' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#6EE05A',
                }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent builds */}
        {recentBuilds.length > 0 && (
          <div style={{
            marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 24,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Recent builds</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentBuilds.slice(0, 5).map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--bg-card)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Globe size={14} style={{ color: '#6EE05A' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{b.businessName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(b.triggeredAt).toLocaleDateString()}
                    </span>
                    <div style={{
                      width: 6, height: 6, borderRadius: 3,
                      background: b.status === 'triggered' ? '#6EE05A' : '#f59e0b',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* web0n.com link */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a
            href="https://web0n.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6EE05A' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
          >
            Powered by web0n.com <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ──

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  letterSpacing: '0.05em', textTransform: 'uppercase' as const,
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-primary)', border: '1px solid var(--border)',
  borderRadius: 10, color: 'var(--text-primary)', fontFamily: 'inherit',
  fontSize: 14, padding: '10px 14px', outline: 'none',
  transition: 'border-color 0.15s',
}
