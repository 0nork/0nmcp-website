'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PlaceResult {
  placeId: string
  name: string
  address: string
  phone?: string
  website?: string
  types?: string[]
  rating?: number
}

interface FormData {
  // Step 1: search
  searchQuery: string
  selectedPlace: PlaceResult | null
  // Step 2: business info
  businessName: string
  businessType: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  websiteUrl: string
  googlePlaceId: string
  googleData: Record<string, unknown> | null
  // Step 3: brand
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logoFile: File | null
  logoPreview: string
  tagline: string
  // Step 4: services
  services: string[]
  // Step 5: special requests
  specialRequests: string
  // Google listing interest
  interestedInGoogleListing: boolean
  // Coupon code
  couponCode: string
}

const INITIAL_FORM: FormData = {
  searchQuery: '',
  selectedPlace: null,
  businessName: '',
  businessType: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  websiteUrl: '',
  googlePlaceId: '',
  googleData: null,
  primaryColor: '#1a1a2e',
  secondaryColor: '#16213e',
  accentColor: '#6EE05A',
  logoFile: null,
  logoPreview: '',
  tagline: '',
  services: [''],
  specialRequests: '',
  interestedInGoogleListing: false,
  couponCode: '',
}

const STEP_TITLES = [
  'Find Your Business',
  'Business Info',
  'Brand & Style',
  'Your Services',
  'Special Requests',
  'Review & Pay',
]

const inputCls = 'w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[0.95rem] outline-none'
const labelCls = 'block text-[0.85rem] text-[var(--text-secondary)] mb-1.5 font-medium'

export default function Web0nOnboard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [searchTimeout, setSearchTimeoutState] = useState<NodeJS.Timeout | null>(null)
  const [couponResult, setCouponResult] = useState<{
    valid: boolean
    discountPercent?: number
    discountAmount?: number
    depositDue?: number
    isFree?: boolean
    error?: string
  } | null>(null)
  const [checkingCoupon, setCheckingCoupon] = useState(false)

  // Debounced Google Places search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
    if (form.searchQuery.length < 3) {
      setSearchResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/web0n/places-search?q=${encodeURIComponent(form.searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.results || [])
        }
      } catch {
        // silent fail on search
      } finally {
        setSearching(false)
      }
    }, 400)
    setSearchTimeoutState(t)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.searchQuery])

  // Debounced coupon code validation
  useEffect(() => {
    if (!form.couponCode.trim()) {
      setCouponResult(null)
      return
    }
    setCheckingCoupon(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/web0n/coupon-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: form.couponCode, email: form.email }),
        })
        if (res.ok) {
          setCouponResult(await res.json())
        } else {
          setCouponResult({ valid: false, error: 'Failed to check coupon' })
        }
      } catch {
        setCouponResult({ valid: false, error: 'Failed to check coupon' })
      } finally {
        setCheckingCoupon(false)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [form.couponCode, form.email])

  function selectPlace(place: PlaceResult) {
    const addressParts = place.address?.split(',').map(s => s.trim()) || []
    setForm(prev => ({
      ...prev,
      selectedPlace: place,
      businessName: place.name || prev.businessName,
      phone: place.phone || prev.phone,
      websiteUrl: place.website || prev.websiteUrl,
      googlePlaceId: place.placeId,
      googleData: place as unknown as Record<string, unknown>,
      address: addressParts[0] || '',
      city: addressParts[1] || '',
      state: addressParts[2]?.split(' ')[0] || '',
      zip: addressParts[2]?.split(' ')[1] || '',
      businessType: place.types?.[0]?.replace(/_/g, ' ') || '',
    }))
    setSearchResults([])
    setStep(1) // Auto-advance to business info
  }

  function addService() {
    setForm(prev => ({ ...prev, services: [...prev.services, ''] }))
  }

  function updateService(index: number, value: string) {
    setForm(prev => {
      const services = [...prev.services]
      services[index] = value
      return { ...prev, services }
    })
  }

  function removeService(index: number) {
    setForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit() {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/web0n/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          businessType: form.businessType,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          websiteUrl: form.websiteUrl,
          googlePlaceId: form.googlePlaceId,
          googleData: form.googleData,
          brandColors: {
            primary: form.primaryColor,
            secondary: form.secondaryColor,
            accent: form.accentColor,
          },
          logoUrl: form.logoPreview || null,
          tagline: form.tagline,
          services: form.services.filter(s => s.trim()),
          specialRequests: form.specialRequests,
          interestedInGoogleListing: form.interestedInGoogleListing,
          couponCode: form.couponCode || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const data = await res.json()

      // Redirect based on result
      if (data.isFree) {
        // Coupon applied — go straight to success
        router.push('/portal?welcome=free')
      } else if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
      } else {
        router.push('/portal')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return form.businessName.length > 0 || form.selectedPlace !== null
      case 1: return form.businessName.trim() && form.email.trim()
      case 2: return true // brand is optional
      case 3: return form.services.some(s => s.trim())
      case 4: return true // special requests optional
      case 5: return true // review
      default: return false
    }
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 pt-8 pb-16">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-[0.8rem] text-[var(--text-muted)]">Step {step + 1} of 6</span>
          <span className="text-[0.8rem] text-[var(--accent-brand)] font-medium">{STEP_TITLES[step]}</span>
        </div>
        <div className="h-1 rounded-sm bg-[var(--bg-tertiary)] overflow-hidden">
          <div
            className="h-full rounded-sm transition-[width] duration-300 ease-in-out"
            style={{
              width: `${((step + 1) / 6) * 100}%`,
              background: 'linear-gradient(90deg, #6EE05A, #a3e87c)',
            }}
          />
        </div>
      </div>

      {/* Step 0: Business Search */}
      {step === 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Find Your Business</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Search for your business to auto-fill your information.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Type your business name and city..."
              value={form.searchQuery}
              onChange={e => setForm(prev => ({ ...prev, searchQuery: e.target.value }))}
              className={inputCls}
              autoFocus
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[0.8rem]">
                Searching...
              </div>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 border border-[var(--border)] rounded-lg bg-[var(--bg-card)] overflow-hidden">
              {searchResults.map(place => (
                <button
                  key={place.placeId}
                  onClick={() => selectPlace(place)}
                  className="block w-full px-4 py-3 text-left bg-transparent border-none border-b border-[var(--border)] cursor-pointer text-[var(--text-primary)] last:border-b-0"
                >
                  <div className="font-semibold text-[0.95rem]">{place.name}</div>
                  <div className="text-[0.8rem] text-[var(--text-muted)] mt-0.5">{place.address}</div>
                </button>
              ))}
            </div>
          )}
          <p className="text-[var(--text-muted)] text-[0.8rem] mt-4">
            Can&apos;t find your business?{' '}
            <button
              onClick={() => setStep(1)}
              className="bg-transparent border-none text-[var(--accent-brand)] cursor-pointer text-[0.8rem] underline"
            >
              Enter info manually
            </button>
          </p>
        </div>
      )}

      {/* Step 1: Business Info */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Business Information</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {form.selectedPlace ? 'We pre-filled what we could — edit anything below.' : 'Tell us about your business.'}
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Business Name *</label>
              <input className={inputCls} value={form.businessName} onChange={e => setForm(prev => ({ ...prev, businessName: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Business Type</label>
              <input className={inputCls} value={form.businessType} onChange={e => setForm(prev => ({ ...prev, businessType: e.target.value }))} placeholder="e.g., Salon, Plumber, Restaurant" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input className={inputCls} type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input className={inputCls} value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input className={inputCls} value={form.state} onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Zip</label>
                <input className={inputCls} value={form.zip} onChange={e => setForm(prev => ({ ...prev, zip: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Existing Website (if any)</label>
              <input className={inputCls} value={form.websiteUrl} onChange={e => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))} placeholder="https://" />
            </div>

            {/* Google Business Listing — shown when business wasn't found in Places */}
            {!form.selectedPlace && (
              <div className="p-5 rounded-xl border border-[rgba(110,224,90,0.2)] bg-[rgba(110,224,90,0.03)]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.interestedInGoogleListing}
                    onChange={e => setForm(prev => ({ ...prev, interestedInGoogleListing: e.target.checked }))}
                    className="mt-0.5 w-4.5 h-4.5 accent-[#6EE05A]"
                  />
                  <div>
                    <span className="font-semibold text-[0.95rem]">
                      I&apos;d like help getting my business listed on Google
                    </span>
                    <p className="text-[var(--text-secondary)] text-[0.8rem] mt-2 leading-relaxed">
                      A Google Business Profile is one of the most impactful things you can do for local visibility. Here&apos;s what it gets you:
                    </p>
                    <ul className="text-[var(--text-secondary)] text-[0.8rem] leading-loose pl-4 mt-1.5">
                      <li><strong className="text-[var(--text-primary)]">Google Maps visibility</strong> — customers find you when searching nearby</li>
                      <li><strong className="text-[var(--text-primary)]">Search ranking boost</strong> — Google prioritizes businesses with verified profiles</li>
                      <li><strong className="text-[var(--text-primary)]">Reviews &amp; trust</strong> — collect Google reviews that show in search results</li>
                      <li><strong className="text-[var(--text-primary)]">Free traffic</strong> — your hours, phone, and website show without paying for ads</li>
                      <li><strong className="text-[var(--text-primary)]">Insights &amp; analytics</strong> — see how customers find and interact with your listing</li>
                    </ul>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Brand & Style */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Brand &amp; Style</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Help us match your brand. Skip anything you&apos;re not sure about — we&apos;ll pick great defaults.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Brand Colors</label>
              <div className="flex gap-4 items-center">
                {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((key, i) => (
                  <div key={key} className="text-center">
                    <input
                      type="color"
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-12 h-12 border-none rounded-lg cursor-pointer bg-transparent"
                    />
                    <div className="text-[0.75rem] text-[var(--text-muted)] mt-1">
                      {['Primary', 'Secondary', 'Accent'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setForm(prev => ({
                      ...prev,
                      logoFile: file,
                      logoPreview: URL.createObjectURL(file),
                    }))
                  }
                }}
                className="w-full px-2 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[0.95rem] outline-none"
              />
              {form.logoPreview && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.logoPreview} alt="Logo preview" className="max-h-20 rounded-lg" />
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Tagline / Slogan</label>
              <input className={inputCls} value={form.tagline} onChange={e => setForm(prev => ({ ...prev, tagline: e.target.value }))} placeholder="e.g., Quality service you can trust" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Services */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Services</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            What services does your business offer? We&apos;ll feature these on your website.
          </p>
          <div className="flex flex-col gap-3">
            {form.services.map((service, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={service}
                  onChange={e => updateService(i, e.target.value)}
                  placeholder={`Service ${i + 1}`}
                />
                {form.services.length > 1 && (
                  <button
                    onClick={() => removeService(i)}
                    className="px-3 rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-muted)] cursor-pointer text-xl"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addService}
            className="mt-3 px-4 py-2 rounded-lg border border-dashed border-[var(--border)] bg-transparent text-[var(--accent-brand)] cursor-pointer text-[0.85rem]"
          >
            + Add Service
          </button>
        </div>
      )}

      {/* Step 4: Special Requests */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Special Requests</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Anything specific you want on your site? Special features, content, or preferences?
          </p>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[0.95rem] outline-none min-h-[180px] resize-y"
            value={form.specialRequests}
            onChange={e => setForm(prev => ({ ...prev, specialRequests: e.target.value }))}
            placeholder="Tell us anything — specific wording, features, pages, content you want highlighted..."
          />
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Review &amp; Pay</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Review your info below. After submitting, you&apos;ll receive a deposit invoice for $998.50.
          </p>

          <div className="flex flex-col gap-4">
            {/* Business Info Summary */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h3 className="text-[0.9rem] font-semibold text-[var(--accent-brand)] mb-3">Business</h3>
              <div className="grid grid-cols-2 gap-2 text-[0.9rem]">
                <div><span className="text-[var(--text-muted)]">Name:</span> {form.businessName}</div>
                <div><span className="text-[var(--text-muted)]">Type:</span> {form.businessType || '—'}</div>
                <div><span className="text-[var(--text-muted)]">Email:</span> {form.email}</div>
                <div><span className="text-[var(--text-muted)]">Phone:</span> {form.phone || '—'}</div>
              </div>
              {form.address && (
                <div className="text-[0.9rem] mt-2">
                  <span className="text-[var(--text-muted)]">Address:</span> {[form.address, form.city, form.state, form.zip].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {/* Brand Summary */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h3 className="text-[0.9rem] font-semibold text-[var(--accent-brand)] mb-3">Brand</h3>
              <div className="flex gap-2 mb-2">
                {[form.primaryColor, form.secondaryColor, form.accentColor].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-md border border-[var(--border)]" style={{ background: c }} />
                ))}
              </div>
              {form.tagline && <div className="text-[0.9rem]"><span className="text-[var(--text-muted)]">Tagline:</span> {form.tagline}</div>}
            </div>

            {/* Services Summary */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h3 className="text-[0.9rem] font-semibold text-[var(--accent-brand)] mb-3">Services</h3>
              <div className="text-[0.9rem] text-[var(--text-secondary)]">
                {form.services.filter(s => s.trim()).join(' / ') || 'None specified'}
              </div>
            </div>

            {/* Google Listing Interest */}
            {form.interestedInGoogleListing && (
              <div className="p-5 rounded-xl border border-[rgba(110,224,90,0.2)] bg-[rgba(110,224,90,0.03)]">
                <h3 className="text-[0.9rem] font-semibold text-[var(--accent-brand)] mb-1">Google Business Listing</h3>
                <div className="text-[0.85rem] text-[var(--text-secondary)]">
                  We&apos;ll reach out to help get your business listed on Google Maps &amp; Search.
                </div>
              </div>
            )}

            {/* Coupon Code */}
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <h3 className="text-[0.9rem] font-semibold text-[var(--accent-brand)] mb-3">Coupon Code</h3>
              <input
                className={`${inputCls} uppercase tracking-wide ${
                  couponResult?.valid
                    ? 'border-[rgba(110,224,90,0.5)]'
                    : couponResult && !couponResult.valid
                    ? 'border-[rgba(255,80,80,0.5)]'
                    : ''
                }`}
                value={form.couponCode}
                onChange={e => setForm(prev => ({ ...prev, couponCode: e.target.value }))}
                placeholder="Enter coupon code (optional)"
              />
              {checkingCoupon && (
                <div className="text-[0.8rem] text-[var(--text-muted)] mt-1.5">Checking code...</div>
              )}
              {couponResult && !checkingCoupon && (
                <div className={`text-[0.8rem] mt-1.5 ${couponResult.valid ? 'text-[#6EE05A]' : 'text-[#ff5050]'}`}>
                  {couponResult.valid
                    ? couponResult.isFree
                      ? '100% off — no payment required!'
                      : `${couponResult.discountPercent}% off applied — you save $${couponResult.discountAmount?.toFixed(2)}`
                    : couponResult.error || 'Invalid coupon code'}
                </div>
              )}
            </div>

            {/* Price */}
            <div
              className="p-5 rounded-xl text-center"
              style={{
                border: `1px solid ${couponResult?.valid ? 'rgba(110,224,90,0.5)' : 'rgba(110,224,90,0.3)'}`,
                background: 'rgba(110,224,90,0.05)',
              }}
            >
              <div className="text-2xl font-bold text-[var(--accent-brand)]">
                {couponResult?.valid && couponResult.isFree ? (
                  <><s className="opacity-40">$998.50</s> FREE</>
                ) : couponResult?.valid && couponResult.discountPercent ? (
                  <><s className="opacity-40 text-xl">$998.50</s>{' '}${couponResult.depositDue?.toFixed(2)} Deposit</>
                ) : (
                  '$998.50 Deposit'
                )}
              </div>
              <div className="text-[0.85rem] text-[var(--text-muted)] mt-1">
                {couponResult?.valid && couponResult.isFree
                  ? 'Coupon applied — no payment required'
                  : couponResult?.valid && couponResult.discountPercent
                    ? `${couponResult.discountPercent}% off deposit — remaining balance due before launch`
                    : '50% of $1,997 total — remaining 50% due before launch'}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-[rgba(255,50,50,0.1)] border border-[rgba(255,50,50,0.3)] text-[#ff5050] text-[0.9rem]">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 gap-4">
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            className="px-6 py-2.5 rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-primary)] cursor-pointer text-[0.9rem]"
          >
            Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="px-6 py-2.5 rounded-lg border-none font-semibold text-[0.9rem] transition-colors"
            style={{
              background: canProceed() ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)' : 'var(--bg-tertiary)',
              color: canProceed() ? '#fff' : 'var(--text-muted)',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 rounded-lg border-none font-semibold text-[0.95rem] transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
              color: '#0B0F19',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? 'Creating project...'
              : couponResult?.valid && couponResult.isFree
                ? 'Submit — No Payment Required'
                : couponResult?.valid && couponResult.depositDue
                  ? `Submit & Pay $${couponResult.depositDue.toFixed(2)} Deposit`
                  : 'Submit & Pay $998.50 Deposit'}
          </button>
        )}
      </div>
    </div>
  )
}
