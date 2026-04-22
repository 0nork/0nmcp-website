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

// ── Shared classes ──

const inputCls = [
  'bg-[var(--bg-primary)] border border-[var(--border)] rounded-[10px]',
  'text-[var(--text-primary)] font-[inherit] text-sm py-2.5 px-3.5 outline-none',
  'transition-colors duration-150 focus:border-[rgba(126,217,87,0.4)]',
  'w-full',
].join(' ')

const labelCls = 'text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.05em] uppercase'

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
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  // ── Not purchased — show upgrade CTA ──
  if (!owned) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)] p-8">
        <div className="text-center max-w-[520px]">
          <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[rgba(126,217,87,0.12)] to-[rgba(0,212,255,0.08)] border border-[rgba(126,217,87,0.2)] flex items-center justify-center mx-auto mb-6">
            <Globe size={36} className="text-[#6EE05A]" />
          </div>

          <h2 className="text-[28px] font-extrabold text-[var(--text-primary)] mb-2">
            web0n Site Builder
          </h2>
          <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-6">
            AI-powered website generation + CRM funnel deployment.
            Generate 5-page professional websites in minutes with a single click.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
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
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#6EE05A] shrink-0" />
                <span className="text-[13px] text-[#ccc]">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-[36px] font-black text-[var(--text-primary)]">$1,497</span>
            <span className="text-sm text-[var(--text-muted)]">one-time</span>
          </div>

          <a
            href="/console/marketplace/web0n-site-builder"
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-xl bg-gradient-to-br from-[#6EE05A] to-[#4CAF3D] text-[#0B0F19] text-[15px] font-extrabold no-underline transition-all duration-150 hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(126,217,87,0.3)]"
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
    <div className="flex-1 overflow-auto bg-[var(--bg-primary)] py-8 px-6">
      <div className="max-w-[720px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[rgba(126,217,87,0.15)] to-[rgba(0,212,255,0.1)] border border-[rgba(126,217,87,0.25)] flex items-center justify-center">
            <Globe size={22} className="text-[#6EE05A]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] m-0">
              web0n Site Builder
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] m-0">
              AI website generation + CRM funnel deployment
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6EE05A] shadow-[0_0_8px_rgba(126,217,87,0.5)]" />
            <span className="text-[11px] font-semibold text-[#6EE05A]">Active</span>
          </div>
        </div>

        {/* Build Form */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Business Name */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Business name *</label>
              <input
                ref={inputRef}
                name="businessName"
                type="text"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Acme Roofing Co."
                required
                className={inputCls}
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Email *</label>
                <input
                  name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="owner@business.com" required
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Phone</label>
                <input
                  name="phone" type="tel" value={form.phone}
                  onChange={handleChange} placeholder="+1 555 000 0000"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Street address</label>
              <input
                name="address" type="text" value={form.address}
                onChange={handleChange} placeholder="123 Main St"
                className={inputCls}
              />
            </div>

            {/* City / State / Zip */}
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>City</label>
                <input
                  name="city" type="text" value={form.city}
                  onChange={handleChange} placeholder="Pittsburgh"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>State</label>
                <input
                  name="state" type="text" value={form.state}
                  onChange={handleChange} placeholder="PA" maxLength={2}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Zip</label>
                <input
                  name="zip" type="text" value={form.zip}
                  onChange={handleChange} placeholder="15222"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Website + Brand Color */}
            <div className="grid grid-cols-[2fr_1fr] gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Current website</label>
                <input
                  name="website" type="url" value={form.website}
                  onChange={handleChange} placeholder="https://example.com"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Brand color</label>
                <div className="flex gap-2 items-center">
                  <input
                    name="brandColor" type="color" value={form.brandColor}
                    onChange={handleChange}
                    className="w-10 h-10 border border-[var(--border)] rounded-lg p-[3px] bg-[var(--bg-primary)] cursor-pointer"
                  />
                  <input
                    name="brandColor" type="text" value={form.brandColor}
                    onChange={handleChange} placeholder="#6EE05A" maxLength={7}
                    className={`${inputCls} flex-1`}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className={[
                'flex items-center justify-center gap-2.5 py-3.5 px-7 rounded-xl mt-2',
                'border-none text-[#0B0F19] text-[15px] font-extrabold font-[inherit]',
                'transition-all duration-150',
                status === 'loading'
                  ? 'bg-[rgba(126,217,87,0.3)] cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-br from-[#6EE05A] to-[#4CAF3D] cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_24px_rgba(126,217,87,0.3)]',
              ].join(' ')}
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
            <div className="flex items-start gap-3 mt-5 py-3.5 px-4 rounded-xl bg-[rgba(126,217,87,0.06)] border border-[rgba(126,217,87,0.2)]">
              <CheckCircle2 size={20} className="text-[#6EE05A] shrink-0 mt-px" />
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] m-0">Build triggered</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 mb-0 font-[var(--font-mono)]">
                  CRM agent processing · {result.conversationId?.slice(0, 16)}...
                </p>
              </div>
            </div>
          )}

          {result && status === 'error' && (
            <div className="flex items-start gap-3 mt-5 py-3.5 px-4 rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)]">
              <XCircle size={20} className="text-[#ef4444] shrink-0 mt-px" />
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] m-0">Build failed</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">{result.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">How it works</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
            {[
              { step: '1', title: 'Enter details', desc: 'Business name, email, address, brand color' },
              { step: '2', title: 'AI generates pages', desc: '5 pages — Home, Services, About, Booking, Contact' },
              { step: '3', title: 'Deploy to CRM', desc: 'Funnel auto-deployed to client sub-account' },
              { step: '4', title: 'Live in minutes', desc: 'Website ready for custom domain + launch' },
            ].map(s => (
              <div key={s.step} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg shrink-0 bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] flex items-center justify-center text-xs font-extrabold text-[#6EE05A]">
                  {s.step}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[var(--text-primary)]">{s.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-snug">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent builds */}
        {recentBuilds.length > 0 && (
          <div className="mt-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Recent builds</h3>
            <div className="flex flex-col gap-2">
              {recentBuilds.slice(0, 5).map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-3.5 rounded-[10px] bg-white/[0.02] border border-[var(--bg-card)]"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe size={14} className="text-[#6EE05A]" />
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">{b.businessName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)] font-[var(--font-mono)]">
                      {new Date(b.triggeredAt).toLocaleDateString()}
                    </span>
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: b.status === 'triggered' ? '#6EE05A' : '#f59e0b' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* web0n.com link */}
        <div className="mt-6 text-center">
          <a
            href="https://web0n.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] no-underline hover:text-[#6EE05A] transition-colors duration-150"
          >
            Powered by web0n.com <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}
