'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { BrandIcon, IconStar, IconDiamond, IconSparkle, IconRising, IconBook, IconHammer, IconForum } from '@/components/CategoryIcons'
import { STATS_DISPLAY } from '@/data/stats'

const PRODUCTS = [
  { name: '0ncore', color: '#a855f7', desc: 'Core infrastructure — vault, signing, execution engine' },
  { name: '0nmcp', color: '#00d4ff', desc: `Universal API Protocol — ${STATS_DISPLAY.tools} tools, ${STATS_DISPLAY.services} services` },
  { name: 'app0n', color: '#6EE05A', desc: 'Application Layer — workflows, builder, marketplace' },
  { name: 'social0n', color: '#ff8c00', desc: 'Community Platform — forum, groups, reputation' },
  { name: '0nork', color: '#ef4444', desc: 'Parent company — orchestration infrastructure' },
]

const ROLES = ['developer', 'founder', 'agency', 'enterprise', 'hobbyist'] as const

const INTERESTS = [
  'AI/ML', 'Automation', 'CRM', 'E-Commerce', 'DevOps',
  'Social Media', 'Analytics', 'Security', 'Education', 'IoT',
]

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  )
}

// Archetype display config
const ARCHETYPE_DISPLAY: Record<string, { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; title: string; color: string; desc: string }> = {
  executive: { icon: IconStar, title: 'Executive Visionary', color: '#a78bfa', desc: 'You lead with strategy and big-picture thinking. Your content carries weight.' },
  manager: { icon: IconDiamond, title: 'Growth Catalyst', color: '#00d4ff', desc: 'You bridge strategy and execution. People look to you for actionable insight.' },
  individual: { icon: IconHammer, title: 'Builder & Maker', color: '#6EE05A', desc: 'You ship. Your hands-on expertise makes your perspective invaluable.' },
  student: { icon: IconRising, title: 'Rising Voice', color: '#ff8c00', desc: 'Fresh perspective is your superpower. The community is excited to hear from you.' },
}

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowser()

  // OAuth provider detection
  const provider = searchParams.get('provider')
  const archetypeParam = searchParams.get('archetype')
  const isLinkedIn = provider === 'linkedin'
  const isOAuth = !!provider

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // LinkedIn PACG state
  const [archetypeTier, setArchetypeTier] = useState(archetypeParam || '')
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpAnswer, setFollowUpAnswer] = useState('')

  // Profile state
  const [userId, setUserId] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [bio, setBio] = useState('')
  const [role, setRole] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Vault state (step 3)
  const [vaultService, setVaultService] = useState('')
  const [vaultKey, setVaultKey] = useState('')
  const [vaultHint, setVaultHint] = useState('')
  const [vaultSaved, setVaultSaved] = useState(false)
  const [credentialCount, setCredentialCount] = useState(0)

  // Payment state (step 4)
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: string; card_brand: string; card_last4: string; card_exp_month: number; card_exp_year: number; is_default: boolean
  }>>([])
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Community state (step 5)
  const [groups, setGroups] = useState<Array<{ id: string; slug: string; name: string; description: string; icon: string; member_count: number }>>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [groupsJoined, setGroupsJoined] = useState(0)

  // Vendor state (step 6)
  const [wantsVendor, setWantsVendor] = useState(false)
  const [vendorBusiness, setVendorBusiness] = useState('')
  const [vendorApplied, setVendorApplied] = useState(false)

  // A/B Testing state
  const [experimentId, setExperimentId] = useState<string | null>(null)
  const [variantId, setVariantId] = useState<string | null>(null)
  const [abStepOrder, setAbStepOrder] = useState<string[]>(['welcome', 'profile', 'tools', 'payment', 'community', 'launch'])
  const [abStepConfig, setAbStepConfig] = useState<Record<string, Record<string, unknown>>>({})
  const stepTimerRef = { current: Date.now() }

  // Track A/B testing events
  const trackEvent = useCallback(async (eventStep: string, eventType: string, metadata?: Record<string, unknown>) => {
    try {
      await fetch('/api/onboarding/experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: eventStep,
          event_type: eventType,
          experiment_id: experimentId,
          variant_id: variantId,
          metadata,
          duration_ms: Date.now() - stepTimerRef.current,
        }),
      })
    } catch { /* non-blocking */ }
  }, [experimentId, variantId, stepTimerRef])

  // Load user data
  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company, bio, avatar_url, role, interests, onboarding_step, is_vendor, vendor_status')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setCompany(profile.company || '')
        setBio(profile.bio || '')
        setAvatarUrl(profile.avatar_url || '')
        setRole(profile.role || '')
        setInterests(profile.interests || [])
        if (profile.is_vendor) setVendorApplied(true)
        if (profile.onboarding_step && profile.onboarding_step > 0) {
          setStep(Math.min(profile.onboarding_step, TOTAL_STEPS))
        }
      }

      // Check existing credentials count
      const { count } = await supabase
        .from('user_vaults')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setCredentialCount(count || 0)

      // LinkedIn: fetch PACG results + follow-up question
      if (isLinkedIn) {
        try {
          const { data: member } = await supabase
            .from('linkedin_members')
            .select('id, archetype')
            .eq('user_id', user.id)
            .single()

          if (member?.archetype) {
            const arch = member.archetype as { tier?: string }
            if (arch.tier) setArchetypeTier(arch.tier)
          }

          // Fetch the latest LVOS selection for the follow-up question
          if (member?.id) {
            const { data: selection } = await supabase
              .from('lvos_selections')
              .select('variant:variant_id(question_text), session_id')
              .eq('member_id', member.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            if (selection) {
              const variant = selection.variant as unknown as { question_text?: string }
              if (variant?.question_text) setFollowUpQuestion(variant.question_text)
            }
          }
        } catch { /* LinkedIn data may not exist yet */ }
      }

      // Fetch A/B experiment variant
      try {
        const expRes = await fetch('/api/onboarding/experiment')
        if (expRes.ok) {
          const expData = await expRes.json()
          if (expData.experiment_id) setExperimentId(expData.experiment_id)
          if (expData.variant_id) setVariantId(expData.variant_id)
          if (expData.step_order?.length) setAbStepOrder(expData.step_order)
          if (expData.step_config) setAbStepConfig(expData.step_config)
        }
      } catch { /* A/B testing is non-critical */ }

      // Detect payment return from Stripe
      const paymentStatus = searchParams.get('payment')
      if (paymentStatus === 'saved') {
        setStep(4) // stay on step 4 to show success
      }

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load payment methods when on step 4
  useEffect(() => {
    if (step !== 4) return
    async function loadPaymentMethods() {
      try {
        const res = await fetch('/api/stripe/connect?action=payment_methods')
        if (res.ok) {
          const data = await res.json()
          setPaymentMethods(data.payment_methods || [])
        }
      } catch { /* non-critical */ }
    }
    loadPaymentMethods()
  }, [step])

  // Save progress step marker
  const saveStep = useCallback(async (nextStep: number) => {
    if (!supabase || !userId) return
    await supabase
      .from('profiles')
      .update({ onboarding_step: nextStep })
      .eq('id', userId)
  }, [supabase, userId])

  // Map step names to step numbers
  const STEP_MAP: Record<string, number> = { welcome: 1, profile: 2, tools: 3, payment: 4, community: 5, launch: 6 }
  const STEP_NAMES: Record<number, string> = { 1: 'welcome', 2: 'profile', 3: 'tools', 4: 'payment', 5: 'community', 6: 'launch' }
  const currentStepName = STEP_NAMES[step] || 'unknown'

  // Track step view when step changes
  useEffect(() => {
    if (!loading && currentStepName !== 'unknown') {
      trackEvent(currentStepName, 'view')
      stepTimerRef.current = Date.now()
    }
  }, [step, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate steps — respects A/B variant step order and skips
  function goNext() {
    // Track completion of current step
    trackEvent(currentStepName, 'complete')

    // Find current position in A/B step order
    const currentIndex = abStepOrder.indexOf(currentStepName)
    let nextIndex = currentIndex + 1

    // Skip steps marked as skip in step_config
    while (nextIndex < abStepOrder.length) {
      const nextStepName = abStepOrder[nextIndex]
      const config = abStepConfig[nextStepName]
      if (config?.skip) {
        trackEvent(nextStepName, 'skip')
        nextIndex++
      } else {
        break
      }
    }

    if (nextIndex >= abStepOrder.length) {
      // All done — go to launch
      const launchStep = STEP_MAP['launch'] || TOTAL_STEPS
      setStep(launchStep)
      saveStep(launchStep)
    } else {
      const nextStepName = abStepOrder[nextIndex]
      const nextStepNum = STEP_MAP[nextStepName] || (step + 1)
      setStep(nextStepNum)
      saveStep(nextStepNum)
    }
    setError('')
  }

  function goBack() {
    const currentIndex = abStepOrder.indexOf(currentStepName)
    let prevIndex = currentIndex - 1

    // Skip backwards over skipped steps
    while (prevIndex >= 0) {
      const prevStepName = abStepOrder[prevIndex]
      const config = abStepConfig[prevStepName]
      if (config?.skip) {
        prevIndex--
      } else {
        break
      }
    }

    if (prevIndex >= 0) {
      const prevStepName = abStepOrder[prevIndex]
      const prevStepNum = STEP_MAP[prevStepName] || Math.max(step - 1, 1)
      setStep(prevStepNum)
    } else {
      setStep(1)
    }
    setError('')
  }

  // Step 2: Save profile
  async function handleSaveProfile() {
    if (!supabase || !userId) return
    if (!role) { setError('Please select a role'); return }
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('profiles')
      .update({ bio, role, interests, avatar_url: avatarUrl })
      .eq('id', userId)

    setSaving(false)
    if (err) { setError(err.message); return }
    goNext()
  }

  // Step 2: Avatar upload
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !supabase || !userId) return

    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { setError(upErr.message); setAvatarUploading(false); return }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setAvatarUploading(false)
  }

  // Step 2: Toggle interest
  function toggleInterest(interest: string) {
    setInterests(prev => {
      if (prev.includes(interest)) return prev.filter(i => i !== interest)
      if (prev.length >= 5) return prev
      return [...prev, interest]
    })
  }

  // Step 3: Save vault credential
  async function handleSaveVault() {
    if (!supabase || !userId) return
    if (!vaultService || !vaultKey) { setError('Service name and API key are required'); return }
    setSaving(true)
    setError('')

    // Client-side encryption (same as account page)
    const enc = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(userId), 'PBKDF2', false, ['deriveKey'])
    const derivedKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, enc.encode(vaultKey))

    const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf instanceof Uint8Array ? buf : buf)))

    const { error: err } = await supabase.from('user_vaults').insert({
      user_id: userId,
      service_name: vaultService,
      encrypted_key: toB64(encrypted),
      iv: toB64(iv),
      salt: toB64(salt),
      key_hint: vaultHint.slice(0, 8) || null,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setVaultSaved(true)
    setCredentialCount(prev => prev + 1)
    setVaultService('')
    setVaultKey('')
    setVaultHint('')
  }

  // Step 4: Add payment method via Stripe SetupIntent
  async function handleAddPaymentMethod() {
    setPaymentLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup_intent' }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create payment setup')
        setPaymentLoading(false)
        return
      }

      const { client_secret, customer_id } = await res.json()

      // Create a Stripe Checkout session in setup mode for the hosted card form
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'setup_card',
          customer_id,
          setup_intent_secret: client_secret,
        }),
      })

      if (checkoutRes.ok) {
        const { url } = await checkoutRes.json()
        if (url) {
          window.location.href = url
          return
        }
      }

      // Fallback: store the setup intent info and show success
      // In production, this would use Stripe Elements
      setError('Payment setup is being configured. Please try again shortly.')
      setPaymentLoading(false)
    } catch {
      setError('Network error. Please try again.')
      setPaymentLoading(false)
    }
  }

  // Step 5: Load community groups
  useEffect(() => {
    if (step !== 5) return
    async function loadGroups() {
      try {
        const res = await fetch('/api/community/groups')
        if (res.ok) {
          const data = await res.json()
          setGroups(data.groups || [])
          // Pre-check default groups
          const defaults = (data.groups || [])
            .filter((g: { slug: string }) => ['general', 'announcements', 'help'].includes(g.slug))
            .map((g: { slug: string }) => g.slug)
          setSelectedGroups(defaults)
        }
      } catch { /* groups endpoint may not exist yet */ }
    }
    loadGroups()
  }, [step])

  // Step 5: Join selected groups
  async function handleJoinGroups() {
    setSaving(true)
    setError('')
    let joined = 0

    for (const slug of selectedGroups) {
      try {
        const res = await fetch(`/api/community/groups/${slug}/join`, { method: 'POST' })
        if (res.ok) joined++
      } catch { /* non-critical */ }
    }

    setGroupsJoined(joined)
    setSaving(false)
    goNext()
  }

  // Step 6: Apply as vendor
  async function handleApplyVendor() {
    if (!vendorBusiness.trim()) { setError('Please enter a business name'); return }
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          business_name: vendorBusiness,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Application failed')
        setSaving(false)
        return
      }

      setVendorApplied(true)
      setSaving(false)
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  // Step 6: Complete onboarding
  async function handleComplete() {
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding/complete', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to complete onboarding')
        setSaving(false)
        return
      }
      router.push('/console')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-loading">
          <div className="signup-spinner" />
        </div>
      </div>
    )
  }

  // Get initials for avatar fallback
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="onboarding-container">
      {/* Progress indicator */}
      <div className="onboarding-progress">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} className="onboarding-progress-segment">
            <div className={`onboarding-step-dot ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}>
              {i + 1 < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
              ) : (
                i + 1
              )}
            </div>
            {i < TOTAL_STEPS - 1 && <div className={`onboarding-progress-line ${i + 1 < step ? 'completed' : ''}`} />}
          </div>
        ))}
      </div>

      {error && <div className="auth-error" style={{ maxWidth: 600, margin: '0 auto 1rem' }}>{error}</div>}

      {/* ===== STEP 1: WELCOME ===== */}
      {step === 1 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">
            {isLinkedIn ? `Welcome, ${fullName.split(' ')[0] || 'friend'}!` : 'Welcome to the 0n Network'}
          </h1>
          <p className="onboarding-subtitle">
            {isLinkedIn
              ? 'We connected your LinkedIn profile. Next up: your personalized archetype reveal.'
              : isOAuth
                ? `Signed in with ${provider}. Let\u2019s set up your vault.`
                : 'Your unified platform for AI orchestration \u2014 from encrypted credentials to community-powered learning.'}
          </p>

          <div className="onboarding-product-grid">
            {PRODUCTS.map(p => (
              <div key={p.name} className="onboarding-product-card" style={{ '--product-color': p.color } as React.CSSProperties}>
                <div className="onboarding-product-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BrandIcon name={p.name} size={28} />
                  <span className="onboarding-product-name">{p.name}</span>
                </div>
                <p className="onboarding-product-desc">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="onboarding-stat-row">
            <div className="onboarding-stat"><span className="onboarding-stat-value">{STATS_DISPLAY.tools}</span><span className="onboarding-stat-label">Tools</span></div>
            <div className="onboarding-stat"><span className="onboarding-stat-value">{STATS_DISPLAY.services}</span><span className="onboarding-stat-label">Services</span></div>
            <div className="onboarding-stat"><span className="onboarding-stat-value">AES-256</span><span className="onboarding-stat-label">Encrypted Vault</span></div>
            <div className="onboarding-stat"><span className="onboarding-stat-value">$0</span><span className="onboarding-stat-label">Free Forever</span></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', maxWidth: 400, margin: '0 auto' }}>
            <a href="/install" className="auth-btn primary" style={{ maxWidth: 320, width: '100%', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v10m0 0l-3.5-3.5M9 12l3.5-3.5M3 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Install 0nMCP Now
            </a>
            <button className="auth-btn secondary" onClick={goNext} style={{ maxWidth: 320, width: '100%', fontSize: '0.8rem' }}>
              Skip — set up profile first
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 2: ARCHETYPE REVEAL (LinkedIn) or PROFILE SETUP ===== */}
      {step === 2 && isLinkedIn && archetypeTier && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">We analyzed your profile</h1>
          <p className="onboarding-subtitle">
            Our PACG engine classified you based on your LinkedIn data. Here&apos;s your archetype:
          </p>

          {/* Archetype Card */}
          <div style={{
            background: 'rgba(126,217,87,0.06)',
            border: `1px solid ${ARCHETYPE_DISPLAY[archetypeTier]?.color || '#6EE05A'}40`,
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            margin: '1.5rem 0',
          }}>
            <div style={{ marginBottom: '0.5rem', color: ARCHETYPE_DISPLAY[archetypeTier]?.color || '#6EE05A' }}>
              {(() => { const AIcon = ARCHETYPE_DISPLAY[archetypeTier]?.icon || IconStar; return <AIcon size={48} /> })()}
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: ARCHETYPE_DISPLAY[archetypeTier]?.color || '#6EE05A',
              fontFamily: 'var(--font-display)',
              marginBottom: '0.5rem',
            }}>
              {ARCHETYPE_DISPLAY[archetypeTier]?.title || archetypeTier}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              {ARCHETYPE_DISPLAY[archetypeTier]?.desc || 'Your unique profile has been classified.'}
            </p>
          </div>

          {/* Follow-up Question */}
          {followUpQuestion && (
            <div style={{ marginTop: '1.5rem' }}>
              <label className="onboarding-section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                One quick question to personalize your experience:
              </label>
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                {followUpQuestion}
              </p>
              <div className="auth-field">
                <textarea
                  value={followUpAnswer}
                  onChange={e => setFollowUpAnswer(e.target.value.slice(0, 500))}
                  placeholder="Share your thoughts..."
                  rows={3}
                  style={{ resize: 'none' }}
                />
                <span className="onboarding-char-count">{followUpAnswer.length}/500</span>
              </div>
            </div>
          )}

          <div className="onboarding-actions" style={{ marginTop: '1.5rem' }}>
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary" onClick={() => {
              // Save follow-up answer if provided (fire-and-forget)
              if (followUpAnswer && supabase && userId) {
                fetch('/api/linkedin/follow-up', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ response: followUpAnswer }),
                }).catch(() => {})
              }
              goNext()
            }}>
              {followUpAnswer ? 'Continue' : 'Skip & Continue'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && !(isLinkedIn && archetypeTier) && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">Set up your profile</h1>
          <p className="onboarding-subtitle">Tell us a bit about yourself so we can personalize your experience.</p>

          {/* Avatar section — skip upload for OAuth users who already have an avatar */}
          <div className="onboarding-avatar-section">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="onboarding-avatar-img" />
            ) : (
              <div className="onboarding-avatar-initials">{initials || '?'}</div>
            )}
            {!isOAuth && (
              <label className="onboarding-avatar-upload">
                <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                {avatarUploading ? 'Uploading...' : 'Upload photo'}
              </label>
            )}
          </div>

          <div className="onboarding-form-grid">
            <div className="auth-field">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 300))}
                placeholder="What are you building with 0nMCP?"
                rows={3}
                style={{ resize: 'none' }}
              />
              <span className="onboarding-char-count">{bio.length}/300</span>
            </div>

            <div className="auth-field">
              <label>Company</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Your company (optional)"
              />
            </div>
          </div>

          <div className="onboarding-section">
            <label className="onboarding-section-label">What best describes you?</label>
            <div className="onboarding-role-pills">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  className={`onboarding-role-pill ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="onboarding-section">
            <label className="onboarding-section-label">What are you interested in? <span className="onboarding-hint">(up to 5)</span></label>
            <div className="onboarding-interest-tags">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  type="button"
                  className={`onboarding-interest-tag ${interests.includes(i) ? 'active' : ''}`}
                  onClick={() => toggleInterest(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="onboarding-actions">
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary" onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 3: CONNECT TOOLS ===== */}
      {step === 3 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">Connect your tools</h1>
          <p className="onboarding-subtitle">
            Add an API key to your encrypted vault. Client-side AES-256-GCM — we never see your keys.
          </p>

          <div className="onboarding-service-icons">
            {['Stripe', 'OpenAI', 'GitHub', 'Slack', 'Supabase', 'Twilio'].map(s => (
              <div key={s} className="onboarding-service-icon">{s}</div>
            ))}
          </div>

          {vaultSaved && (
            <div className="onboarding-success">Credential saved and encrypted.</div>
          )}

          <div className="onboarding-form-grid">
            <div className="auth-field">
              <label>Service name</label>
              <input
                type="text"
                value={vaultService}
                onChange={e => setVaultService(e.target.value)}
                placeholder="e.g. openai, stripe, github"
              />
            </div>
            <div className="auth-field">
              <label>API key</label>
              <input
                type="password"
                value={vaultKey}
                onChange={e => setVaultKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
              />
            </div>
            <div className="auth-field">
              <label>Key hint <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional, max 8 chars)</span></label>
              <input
                type="text"
                value={vaultHint}
                onChange={e => setVaultHint(e.target.value.slice(0, 8))}
                placeholder="sk-ab..."
              />
            </div>
          </div>

          <div className="onboarding-trust">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span>Client-side encryption — we never see your keys</span>
          </div>

          {credentialCount > 0 && (
            <p className="onboarding-hint-text">{credentialCount} credential{credentialCount !== 1 ? 's' : ''} saved in your vault</p>
          )}

          <div className="onboarding-actions">
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {vaultService || vaultKey ? (
                <button className="auth-btn primary" onClick={handleSaveVault} disabled={saving}>
                  {saving ? 'Encrypting...' : 'Save & Continue'}
                </button>
              ) : (
                <button className="auth-btn primary" onClick={goNext}>
                  {vaultSaved || credentialCount > 0 ? 'Continue' : 'Skip for now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 4: PAYMENT METHOD ===== */}
      {step === 4 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">Connect payment method</h1>
          <p className="onboarding-subtitle">
            Add a card for marketplace purchases, subscriptions, and Runs. Powered by Stripe — we never store your card details.
          </p>

          {/* Benefits */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            {[
              { icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', label: 'One-click marketplace', color: '#6EE05A' },
              { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', label: 'Instant Runs top-up', color: '#00d4ff' },
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Stripe secured', color: '#a78bfa' },
            ].map(({ icon, label, color }) => (
              <div key={label} style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                padding: '1rem',
                textAlign: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 6 }}>
                  <path d={icon} />
                </svg>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Saved cards */}
          {paymentMethods.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="onboarding-section-label">Saved cards</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: pm.is_default ? 'rgba(126,217,87,0.06)' : 'var(--bg-tertiary)',
                      border: pm.is_default ? '1px solid rgba(126,217,87,0.3)' : '1px solid var(--border)',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                      <rect x="1" y="1" width="22" height="14" rx="2" />
                      <line x1="1" y1="6" x2="23" y2="6" />
                    </svg>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {pm.card_brand}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginLeft: 8 }}>
                        ****{pm.card_last4}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                        {pm.card_exp_month}/{pm.card_exp_year}
                      </span>
                    </div>
                    {pm.is_default && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, color: '#6EE05A',
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                        padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(126,217,87,0.12)',
                      }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add card button */}
          {paymentMethods.length === 0 && (
            <button
              className="auth-btn primary"
              onClick={handleAddPaymentMethod}
              disabled={paymentLoading}
              style={{ maxWidth: 320, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              {paymentLoading ? 'Setting up...' : 'Add Card via Stripe'}
            </button>
          )}

          <div className="onboarding-trust" style={{ marginBottom: '1rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#635bff">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span>Secured by Stripe — PCI Level 1 compliant</span>
          </div>

          <div className="onboarding-actions">
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary" onClick={goNext}>
              {paymentMethods.length > 0 ? 'Continue' : 'Skip for now'}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 5: JOIN COMMUNITY ===== */}
      {step === 5 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">Join the community</h1>
          <p className="onboarding-subtitle">
            Connect with builders, ask questions, and share workflows.
          </p>

          <a
            href="https://0n.app.clientclub.net/communities/groups/the-0nboard/home"
            target="_blank"
            rel="noopener noreferrer"
            className="onboarding-group-card selected"
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <div className="onboarding-group-icon" style={{ fontSize: '1.5rem', flexShrink: 0 }}>0n</div>
            <div className="onboarding-group-info">
              <div className="onboarding-group-name">The 0nBoard</div>
              <div className="onboarding-group-desc">Our official community hub — announcements, support, and direct access to the team</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>Join &rarr;</span>
          </a>

          {groups.length > 0 ? (
            <div className="onboarding-group-grid">
              {groups.map(g => (
                <label key={g.slug} className={`onboarding-group-card ${selectedGroups.includes(g.slug) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(g.slug)}
                    onChange={() => {
                      setSelectedGroups(prev =>
                        prev.includes(g.slug) ? prev.filter(s => s !== g.slug) : [...prev, g.slug]
                      )
                    }}
                    hidden
                  />
                  <div className="onboarding-group-icon">{g.icon || '0n'}</div>
                  <div className="onboarding-group-info">
                    <div className="onboarding-group-name">{g.name}</div>
                    <div className="onboarding-group-desc">{g.description}</div>
                    <div className="onboarding-group-members">{g.member_count} members</div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="onboarding-empty-state">
              <p>Community groups are being set up. You can join them later from the forum.</p>
            </div>
          )}

          <div className="onboarding-actions">
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary" onClick={groups.length > 0 ? handleJoinGroups : goNext} disabled={saving}>
              {saving ? 'Joining...' : groups.length > 0 ? `Join ${selectedGroups.length} group${selectedGroups.length !== 1 ? 's' : ''} & Continue` : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 6: LAUNCH PAD ===== */}
      {step === 6 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">You&apos;re all set!</h1>
          <p className="onboarding-subtitle">
            Welcome to the 0n Network, {fullName.split(' ')[0] || 'friend'}. Here&apos;s a summary of your setup.
          </p>

          <div className="onboarding-summary">
            <div className="onboarding-summary-row">
              <span className="onboarding-summary-label">Name</span>
              <span className="onboarding-summary-value">{fullName}</span>
            </div>
            {role && (
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Role</span>
                <span className="onboarding-summary-value" style={{ textTransform: 'capitalize' }}>{role}</span>
              </div>
            )}
            {credentialCount > 0 && (
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Vault</span>
                <span className="onboarding-summary-value">{credentialCount} credential{credentialCount !== 1 ? 's' : ''} encrypted</span>
              </div>
            )}
            {paymentMethods.length > 0 && (
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Payment</span>
                <span className="onboarding-summary-value" style={{ textTransform: 'capitalize' }}>
                  {paymentMethods[0].card_brand} ****{paymentMethods[0].card_last4}
                </span>
              </div>
            )}
            {groupsJoined > 0 && (
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Community</span>
                <span className="onboarding-summary-value">{groupsJoined} group{groupsJoined !== 1 ? 's' : ''} joined</span>
              </div>
            )}
          </div>

          {/* Vendor application */}
          <div style={{
            background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z" />
                <line x1="3" y1="7" x2="21" y2="7" />
                <path d="M16 11a4 4 0 0 1-8 0" />
              </svg>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#00d4ff' }}>
                Want to sell on the marketplace?
              </span>
            </div>

            {vendorApplied ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#6EE05A">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#6EE05A', fontWeight: 600 }}>
                  Vendor application submitted! We&apos;ll review and set up your Stripe Connect account.
                </span>
              </div>
            ) : wantsVendor ? (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Sell workflows, templates, and services. Earn 80% of every sale with automated payouts via Stripe Connect.
                </p>
                <div className="auth-field" style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={vendorBusiness}
                    onChange={e => setVendorBusiness(e.target.value)}
                    placeholder="Your business or brand name"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="auth-btn primary"
                    onClick={handleApplyVendor}
                    disabled={saving}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    {saving ? 'Submitting...' : 'Apply as Vendor'}
                  </button>
                  <button
                    className="auth-btn secondary"
                    onClick={() => setWantsVendor(false)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Sell workflows, templates, and services to the 0n community. Earn 80% with automated Stripe payouts.
                </p>
                <button
                  onClick={() => setWantsVendor(true)}
                  style={{
                    background: 'none', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8,
                    color: '#00d4ff', fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Apply to sell
                </button>
              </div>
            )}
          </div>

          <label className="onboarding-section-label" style={{ textAlign: 'center', display: 'block', marginBottom: '1rem' }}>Choose your path</label>
          <div className="onboarding-path-grid">
            <Link href="/learn" className="onboarding-path-card">
              <div className="onboarding-path-icon" style={{ color: '#00d4ff' }}><IconBook size={28} /></div>
              <div className="onboarding-path-title">Explore Courses</div>
              <div className="onboarding-path-desc">Learn 0nMCP from scratch with free interactive lessons</div>
            </Link>
            <Link href="/builder" className="onboarding-path-card">
              <div className="onboarding-path-icon" style={{ color: '#a78bfa' }}><IconHammer size={28} /></div>
              <div className="onboarding-path-title">Build a Workflow</div>
              <div className="onboarding-path-desc">Describe what you need — AI builds your .0n file</div>
            </Link>
            <Link href="/forum" className="onboarding-path-card">
              <div className="onboarding-path-icon" style={{ color: '#6EE05A' }}><IconForum size={28} /></div>
              <div className="onboarding-path-title">Browse Forum</div>
              <div className="onboarding-path-desc">Ask questions, share tips, earn reputation</div>
            </Link>
            <a href="https://0n.app.clientclub.net/communities/groups/the-0nboard/home" target="_blank" rel="noopener noreferrer" className="onboarding-path-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="onboarding-path-icon"><BrandIcon name="0nmcp" size={28} /></div>
              <div className="onboarding-path-title">The 0nBoard</div>
              <div className="onboarding-path-desc">Our community hub — real-time support &amp; announcements</div>
            </a>
          </div>

          <div className="onboarding-sponsor-cta">
            <Link href="/sponsor">
              Support 0nMCP — Starting at $5/mo
            </Link>
          </div>

          <div className="onboarding-actions" style={{ justifyContent: 'center' }}>
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary" onClick={handleComplete} disabled={saving} style={{ minWidth: 200 }}>
              {saving ? 'Finishing...' : 'Launch Console'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
