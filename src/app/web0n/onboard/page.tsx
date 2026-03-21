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
  accentColor: '#7ed957',
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

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-display)',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem',
    fontWeight: 500 as const,
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Step {step + 1} of 6</span>
          <span style={{ fontSize: '0.8rem', color: '#7ed957', fontWeight: 500 }}>{STEP_TITLES[step]}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
          <div style={{
            width: `${((step + 1) / 6) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #7ed957, #a3e87c)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Step 0: Business Search */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Find Your Business</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Search for your business to auto-fill your information.
          </p>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Type your business name and city..."
              value={form.searchQuery}
              onChange={e => setForm(prev => ({ ...prev, searchQuery: e.target.value }))}
              style={inputStyle}
              autoFocus
            />
            {searching && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Searching...
              </div>
            )}
          </div>
          {searchResults.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              overflow: 'hidden',
            }}>
              {searchResults.map(place => (
                <button
                  key={place.placeId}
                  onClick={() => selectPlace(place)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{place.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{place.address}</div>
                </button>
              ))}
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Can&apos;t find your business?{' '}
            <button
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: '#7ed957', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline' }}
            >
              Enter info manually
            </button>
          </p>
        </div>
      )}

      {/* Step 1: Business Info */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Business Information</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {form.selectedPlace ? 'We pre-filled what we could — edit anything below.' : 'Tell us about your business.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Business Name *</label>
              <input style={inputStyle} value={form.businessName} onChange={e => setForm(prev => ({ ...prev, businessName: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Business Type</label>
              <input style={inputStyle} value={form.businessType} onChange={e => setForm(prev => ({ ...prev, businessType: e.target.value }))} placeholder="e.g., Salon, Plumber, Restaurant" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input style={inputStyle} value={form.state} onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Zip</label>
                <input style={inputStyle} value={form.zip} onChange={e => setForm(prev => ({ ...prev, zip: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Existing Website (if any)</label>
              <input style={inputStyle} value={form.websiteUrl} onChange={e => setForm(prev => ({ ...prev, websiteUrl: e.target.value }))} placeholder="https://" />
            </div>

            {/* Google Business Listing — shown when business wasn't found in Places */}
            {!form.selectedPlace && (
              <div style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid rgba(126, 217, 87, 0.2)',
                background: 'rgba(126, 217, 87, 0.03)',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={form.interestedInGoogleListing}
                    onChange={e => setForm(prev => ({ ...prev, interestedInGoogleListing: e.target.checked }))}
                    style={{ marginTop: '0.2rem', accentColor: '#7ed957', width: 18, height: 18 }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      I&apos;d like help getting my business listed on Google
                    </span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      A Google Business Profile is one of the most impactful things you can do for local visibility. Here&apos;s what it gets you:
                    </p>
                    <ul style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      lineHeight: 1.8,
                      paddingLeft: '1rem',
                      marginTop: '0.35rem',
                    }}>
                      <li><strong style={{ color: 'var(--text-primary)' }}>Google Maps visibility</strong> — customers find you when searching nearby</li>
                      <li><strong style={{ color: 'var(--text-primary)' }}>Search ranking boost</strong> — Google prioritizes businesses with verified profiles</li>
                      <li><strong style={{ color: 'var(--text-primary)' }}>Reviews & trust</strong> — collect Google reviews that show in search results</li>
                      <li><strong style={{ color: 'var(--text-primary)' }}>Free traffic</strong> — your hours, phone, and website show without paying for ads</li>
                      <li><strong style={{ color: 'var(--text-primary)' }}>Insights & analytics</strong> — see how customers find and interact with your listing</li>
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Brand & Style</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Help us match your brand. Skip anything you&apos;re not sure about — we&apos;ll pick great defaults.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Brand Colors</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((key, i) => (
                  <div key={key} style={{ textAlign: 'center' }}>
                    <input
                      type="color"
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ width: 48, height: 48, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {['Primary', 'Secondary', 'Accent'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Logo</label>
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
                style={{ ...inputStyle, padding: '0.5rem' }}
              />
              {form.logoPreview && (
                <div style={{ marginTop: '0.5rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.logoPreview} alt="Logo preview" style={{ maxHeight: 80, borderRadius: 8 }} />
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Tagline / Slogan</label>
              <input style={inputStyle} value={form.tagline} onChange={e => setForm(prev => ({ ...prev, tagline: e.target.value }))} placeholder="e.g., Quality service you can trust" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Services */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your Services</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            What services does your business offer? We&apos;ll feature these on your website.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.services.map((service, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={service}
                  onChange={e => updateService(i, e.target.value)}
                  placeholder={`Service ${i + 1}`}
                />
                {form.services.length > 1 && (
                  <button
                    onClick={() => removeService(i)}
                    style={{
                      padding: '0 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addService}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px dashed var(--border)',
              background: 'transparent',
              color: '#7ed957',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            + Add Service
          </button>
        </div>
      )}

      {/* Step 4: Special Requests */}
      {step === 4 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Special Requests</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Anything specific you want on your site? Special features, content, or preferences?
          </p>
          <textarea
            style={{ ...inputStyle, minHeight: 180, resize: 'vertical' }}
            value={form.specialRequests}
            onChange={e => setForm(prev => ({ ...prev, specialRequests: e.target.value }))}
            placeholder="Tell us anything — specific wording, features, pages, content you want highlighted..."
          />
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Review & Pay</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Review your info below. After submitting, you&apos;ll receive a deposit invoice for $998.50.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Business Info Summary */}
            <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7ed957', marginBottom: '0.75rem' }}>Business</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {form.businessName}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> {form.businessType || '—'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {form.email}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {form.phone || '—'}</div>
              </div>
              {form.address && (
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Address:</span> {[form.address, form.city, form.state, form.zip].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {/* Brand Summary */}
            <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7ed957', marginBottom: '0.75rem' }}>Brand</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[form.primaryColor, form.secondaryColor, form.accentColor].map((c, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: '1px solid var(--border)' }} />
                ))}
              </div>
              {form.tagline && <div style={{ fontSize: '0.9rem' }}><span style={{ color: 'var(--text-muted)' }}>Tagline:</span> {form.tagline}</div>}
            </div>

            {/* Services Summary */}
            <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7ed957', marginBottom: '0.75rem' }}>Services</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {form.services.filter(s => s.trim()).join(' / ') || 'None specified'}
              </div>
            </div>

            {/* Google Listing Interest */}
            {form.interestedInGoogleListing && (
              <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(126, 217, 87, 0.2)', background: 'rgba(126, 217, 87, 0.03)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7ed957', marginBottom: '0.25rem' }}>Google Business Listing</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  We&apos;ll reach out to help get your business listed on Google Maps &amp; Search.
                </div>
              </div>
            )}

            {/* Coupon Code */}
            <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7ed957', marginBottom: '0.75rem' }}>Coupon Code</h3>
              <input
                style={{
                  ...inputStyle,
                  borderColor: couponResult?.valid ? 'rgba(126, 217, 87, 0.5)' : couponResult && !couponResult.valid ? 'rgba(255, 80, 80, 0.5)' : undefined,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
                value={form.couponCode}
                onChange={e => setForm(prev => ({ ...prev, couponCode: e.target.value }))}
                placeholder="Enter coupon code (optional)"
              />
              {checkingCoupon && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Checking code...</div>
              )}
              {couponResult && !checkingCoupon && (
                <div style={{
                  fontSize: '0.8rem',
                  marginTop: '0.35rem',
                  color: couponResult.valid ? '#7ed957' : '#ff5050',
                }}>
                  {couponResult.valid
                    ? couponResult.isFree
                      ? '100% off — no payment required!'
                      : `${couponResult.discountPercent}% off applied — you save $${couponResult.discountAmount?.toFixed(2)}`
                    : couponResult.error || 'Invalid coupon code'}
                </div>
              )}
            </div>

            {/* Price */}
            <div style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: `1px solid ${couponResult?.valid ? 'rgba(126, 217, 87, 0.5)' : 'rgba(126, 217, 87, 0.3)'}`,
              background: 'rgba(126, 217, 87, 0.05)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7ed957' }}>
                {couponResult?.valid && couponResult.isFree ? (
                  <><s style={{ opacity: 0.4 }}>$998.50</s> FREE</>
                ) : couponResult?.valid && couponResult.discountPercent ? (
                  <><s style={{ opacity: 0.4, fontSize: '1.1rem' }}>$998.50</s>{' '}${couponResult.depositDue?.toFixed(2)} Deposit</>
                ) : (
                  '$998.50 Deposit'
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {couponResult?.valid && couponResult.isFree
                  ? 'Coupon applied — no payment required'
                  : couponResult?.valid && couponResult.discountPercent
                    ? `${couponResult.discountPercent}% off deposit — remaining balance due before launch`
                    : '50% of $1,997 total — remaining 50% due before launch'}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', color: '#ff5050', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              padding: '0.7rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
            }}
          >
            Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            style={{
              padding: '0.7rem 1.5rem',
              borderRadius: '8px',
              background: canProceed() ? 'linear-gradient(135deg, #7ed957, #5cb83a)' : 'var(--bg-tertiary)',
              color: canProceed() ? '#fff' : 'var(--text-muted)',
              border: 'none',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '0.7rem 2rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
              color: '#0f1419',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              fontSize: '0.95rem',
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
