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

/* Animated provision step — shows spinner then checkmark after delay */
function ProvisionStep({ label, delay, onDone }: { label: string; delay: number; onDone?: () => void }) {
  const [status, setStatus] = useState<'waiting' | 'running' | 'done'>('waiting')
  useEffect(() => {
    const t1 = setTimeout(() => setStatus('running'), delay)
    const t2 = setTimeout(() => {
      setStatus('done')
      onDone?.()
    }, delay + 1200 + Math.random() * 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay])

  return (
    <div className={[
      'flex items-center gap-3 px-4 py-3 rounded-[10px] border transition-all duration-[400ms]',
      status === 'done'
        ? 'bg-[rgba(126,217,87,0.06)] border-[rgba(126,217,87,0.2)]'
        : 'bg-transparent border-[var(--border)]',
      status === 'waiting' ? 'opacity-40' : 'opacity-100',
    ].join(' ')}>
      {status === 'done' ? (
        <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-[#7ed957]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      ) : status === 'running' ? (
        <div className="w-6 h-6 rounded-full shrink-0 border-2 border-[var(--border)] border-t-[#7ed957] animate-spin" />
      ) : (
        <div className="w-6 h-6 rounded-full shrink-0 border-2 border-[var(--border)]" />
      )}
      <span className={[
        'text-sm transition-all duration-300',
        status === 'done' ? 'font-semibold text-[var(--text-primary)]' : 'font-normal text-[var(--text-secondary)]',
      ].join(' ')}>{label}</span>
      {status === 'done' && (
        <span className="ml-auto text-[0.7rem] text-[#7ed957] font-semibold">Done</span>
      )}
    </div>
  )
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

      {error && <div className="auth-error max-w-[600px] mx-auto mb-4">{error}</div>}

      {/* ===== STEP 1: WELCOME + PLATFORM PICKER ===== */}
      {step === 1 && (
        <div className="onboarding-card fadeInUp max-w-[720px] relative overflow-hidden">
          {/* Animated gradient background glow */}
          <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle, rgba(126,217,87,0.08) 0%, rgba(0,212,255,0.04) 40%, transparent 70%)', animation: 'pulseGlow 4s ease-in-out infinite' }} />

          <div className="relative z-[1]">
            {/* Welcome */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[20px] bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] mb-5 text-xs font-semibold text-[#7ed957] tracking-[0.05em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7ed957]" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
                You&apos;re in — {STATS_DISPLAY.tools} tools unlocked
              </div>
              <h1 className="onboarding-title text-[clamp(1.5rem,3vw,2rem)]">
                {fullName ? `Welcome, ${fullName.split(' ')[0]}!` : 'Welcome to 0nMCP'}
              </h1>
              <p className="onboarding-subtitle max-w-[480px] mx-auto mt-2 mb-0">
                The universal AI orchestrator. {STATS_DISPLAY.tools} tools, {STATS_DISPLAY.services} services, 7-layer encryption.
                Let&apos;s get you set up in 60 seconds.
              </p>
            </div>

            {/* Quick Profile (optional) */}
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-[520px] mx-auto">
              {[
                { id: 'ob-company', label: 'Company', placeholder: 'Acme Inc', value: company, setter: setCompany, icon: 'M3 21h18M3 7l9-4 9 4M5 7v10h2V7M17 7v10h2V7M9 7v10h2V7M13 7v10h2V7' },
                { id: 'ob-website', label: 'Website', placeholder: 'acme.com', value: bio, setter: setBio, icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9c-2.5-2.8-4-6-4-9s1.5-6.2 4-9z' },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="flex items-center gap-1.5 text-[var(--text-muted)] text-[0.7rem] font-semibold mb-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon}/></svg>
                    {f.label} <span className="text-[rgba(255,255,255,0.2)] font-normal">(optional)</span>
                  </label>
                  <input
                    id={f.id} type="text" value={f.value} onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full h-[38px] rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] px-3 text-[0.8rem] outline-none transition-[border-color] duration-200 font-[inherit]"
                    onFocus={e => { e.target.style.borderColor = 'rgba(126,217,87,0.4)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                  />
                </div>
              ))}
            </div>

            {/* What are you installing for? */}
            <div className="mb-8">
              <p className="text-center text-[var(--text-secondary)] text-[0.85rem] font-semibold mb-4">
                What are you building with 0nMCP?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: 'AI Automation', color: '#7ed957' },
                  { label: 'CRM + Sales', color: '#00d4ff' },
                  { label: 'E-Commerce', color: '#f59e0b' },
                  { label: 'Agency Work', color: '#a78bfa' },
                  { label: 'DevOps', color: '#ef4444' },
                  { label: 'Content Creation', color: '#ec4899' },
                  { label: 'Data Analytics', color: '#06b6d4' },
                  { label: 'Just Exploring', color: 'var(--text-muted)' },
                ].map(tag => {
                  const selected = interests.includes(tag.label)
                  return (
                    <button
                      key={tag.label}
                      onClick={() => toggleInterest(tag.label)}
                      className="px-3.5 py-1.5 rounded-[20px] cursor-pointer text-[0.775rem] font-semibold transition-all duration-200"
                      style={{
                        background: selected ? `${tag.color}20` : 'var(--bg-card)',
                        border: `1px solid ${selected ? tag.color + '60' : 'var(--border)'}`,
                        color: selected ? tag.color : 'var(--text-muted)',
                        transform: selected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >{tag.label}</button>
                  )
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8 flex-wrap">
              {[
                { val: STATS_DISPLAY.tools, label: 'Tools', color: '#7ed957' },
                { val: STATS_DISPLAY.services, label: 'Services', color: '#00d4ff' },
                { val: '5', label: 'Patents', color: '#a78bfa' },
                { val: '$0', label: 'Free', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-extrabold font-mono" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-widest font-semibold">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 items-center max-w-[400px] mx-auto">
              <a
                href="/install"
                className="max-w-[360px] w-full h-[52px] rounded-[10px] text-black border-none text-base font-bold flex items-center justify-center gap-2 no-underline cursor-pointer transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #7ed957 0%, #5cb83a 100%)', boxShadow: '0 4px 20px rgba(126,217,87,0.3)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Install 0nMCP Now
              </a>
              <button className="auth-btn secondary max-w-[360px] w-full text-[0.8rem] opacity-70" onClick={async () => {
                if (company || bio || interests.length > 0) {
                  if (supabase && userId) {
                    await supabase.from('profiles').update({
                      company, bio, interests,
                    }).eq('id', userId)
                  }
                }
                goNext()
              }}>
                Skip for now — set up profile first
              </button>
            </div>
          </div>

          {/* Keyframe animation */}
          <style>{`
            @keyframes pulseGlow {
              0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
              50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
            }
          `}</style>
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
          <div className="rounded-2xl p-8 text-center my-6 bg-[rgba(126,217,87,0.06)]"
            style={{ border: `1px solid ${ARCHETYPE_DISPLAY[archetypeTier]?.color || '#6EE05A'}40` }}>
            <div className="mb-2" style={{ color: ARCHETYPE_DISPLAY[archetypeTier]?.color || '#6EE05A' }}>
              {(() => { const AIcon = ARCHETYPE_DISPLAY[archetypeTier]?.icon || IconStar; return <AIcon size={48} /> })()}
            </div>
            <div className="text-2xl font-extrabold mb-2" style={{ color: ARCHETYPE_DISPLAY[archetypeTier]?.color || '#6EE05A' }}>
              {ARCHETYPE_DISPLAY[archetypeTier]?.title || archetypeTier}
            </div>
            <p className="text-[var(--text-secondary)] text-[0.9rem] max-w-[400px] mx-auto m-0">
              {ARCHETYPE_DISPLAY[archetypeTier]?.desc || 'Your unique profile has been classified.'}
            </p>
          </div>

          {/* Follow-up Question */}
          {followUpQuestion && (
            <div className="mt-6">
              <label className="onboarding-section-label block mb-3">
                One quick question to personalize your experience:
              </label>
              <p className="text-[var(--text-primary)] text-base font-semibold mb-3">
                {followUpQuestion}
              </p>
              <div className="auth-field">
                <textarea
                  value={followUpAnswer}
                  onChange={e => setFollowUpAnswer(e.target.value.slice(0, 500))}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="resize-none"
                />
                <span className="onboarding-char-count">{followUpAnswer.length}/500</span>
              </div>
            </div>
          )}

          <div className="onboarding-actions mt-6">
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
                className="resize-none"
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

      {/* ===== STEP 3: AUTO-PROVISION WORKSPACE ===== */}
      {step === 3 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">Setting up your workspace</h1>
          <p className="onboarding-subtitle">
            We&apos;re provisioning your AI workspace with {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services. This takes about 3 seconds.
          </p>

          {/* Animated provision checklist */}
          <div className="flex flex-col gap-3 my-6">
            {[
              { label: 'Creating your AI knowledge base', delay: 0 },
              { label: 'Configuring encrypted vault', delay: 400 },
              { label: `Connecting ${STATS_DISPLAY.tools} tools`, delay: 800 },
              { label: 'Preparing your console', delay: 1200 },
              { label: 'Sending welcome email', delay: 1600 },
            ].map((item, i) => (
              <ProvisionStep key={i} label={item.label} delay={item.delay} onDone={i === 4 ? () => {
                // Auto-advance after all steps complete
                setTimeout(goNext, 800)
              } : undefined} />
            ))}
          </div>

          <div className="onboarding-trust">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span>Connect API keys anytime from your Console settings</span>
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
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', label: 'One-click marketplace', color: '#6EE05A' },
              { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', label: 'Instant Runs top-up', color: '#00d4ff' },
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Stripe secured', color: '#a78bfa' },
            ].map(({ icon, label, color }) => (
              <div key={label} className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl p-4 text-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5">
                  <path d={icon} />
                </svg>
                <div className="text-[0.72rem] text-[var(--text-secondary)] leading-snug">{label}</div>
              </div>
            ))}
          </div>

          {/* Saved cards */}
          {paymentMethods.length > 0 && (
            <div className="mb-6">
              <label className="onboarding-section-label">Saved cards</label>
              <div className="flex flex-col gap-2">
                {paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: pm.is_default ? 'rgba(126,217,87,0.06)' : 'var(--bg-tertiary)',
                      border: pm.is_default ? '1px solid rgba(126,217,87,0.3)' : '1px solid var(--border)',
                    }}
                  >
                    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                      <rect x="1" y="1" width="22" height="14" rx="2" />
                      <line x1="1" y1="6" x2="23" y2="6" />
                    </svg>
                    <div className="flex-1">
                      <span className="text-[0.85rem] font-semibold text-[var(--text-primary)] capitalize">
                        {pm.card_brand}
                      </span>
                      <span className="text-[0.85rem] text-[var(--text-secondary)] font-mono ml-2">
                        ****{pm.card_last4}
                      </span>
                      <span className="text-[0.75rem] text-[var(--text-muted)] ml-2">
                        {pm.card_exp_month}/{pm.card_exp_year}
                      </span>
                    </div>
                    {pm.is_default && (
                      <span className="text-[0.65rem] font-bold text-[#6EE05A] font-mono tracking-[0.05em] px-2 py-0.5 rounded bg-[rgba(126,217,87,0.12)]">
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
              className="auth-btn primary max-w-[320px] mx-auto mb-4 flex items-center justify-center gap-2"
              onClick={handleAddPaymentMethod}
              disabled={paymentLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              {paymentLoading ? 'Setting up...' : 'Add Card via Stripe'}
            </button>
          )}

          <div className="onboarding-trust mb-4">
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
          <h1 className="onboarding-title">You&apos;re in the network</h1>
          <p className="onboarding-subtitle">
            You&apos;ve been added to The 0nBoard — our community hub for builders, announcements, and support.
          </p>

          {/* Community channels — clean compact list */}
          <div className="flex flex-col gap-2 my-6">
            {[
              { name: 'Announcements', desc: 'Product updates and releases', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> },
              { name: 'Help & Support', desc: 'Ask questions, get answers fast', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
              { name: 'Showcase', desc: 'Show what you&apos;ve built with 0nMCP', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              { name: 'Feature Requests', desc: 'Vote on what gets built next', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff8c00" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg> },
            ].map((ch) => (
              <div key={ch.name} className="flex items-center gap-3.5 px-4 py-3 rounded-[10px] bg-[rgba(126,217,87,0.04)] border border-[rgba(126,217,87,0.1)]">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center">
                  {ch.icon}
                </div>
                <div>
                  <div className="font-semibold text-[0.875rem] text-[var(--text-primary)]">{ch.name}</div>
                  <div className="text-[0.75rem] text-[var(--text-muted)]">{ch.desc}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2.5" strokeLinecap="round" className="ml-auto shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            ))}
          </div>

          <div className="text-center p-4 bg-[rgba(126,217,87,0.06)] rounded-[10px] border border-[rgba(126,217,87,0.15)] mb-4">
            <div className="text-[0.8rem] text-[var(--text-muted)]">
              Access the full community anytime from your console or at
            </div>
            <a href="/forum" className="text-[var(--accent)] font-semibold text-[0.85rem] no-underline">
              0nmcp.com/forum
            </a>
          </div>

          <div className="onboarding-actions">
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary" onClick={goNext}>Continue</button>
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
                <span className="onboarding-summary-value capitalize">{role}</span>
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
                <span className="onboarding-summary-value capitalize">
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
          <div className="bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.15)] rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z" />
                <line x1="3" y1="7" x2="21" y2="7" />
                <path d="M16 11a4 4 0 0 1-8 0" />
              </svg>
              <span className="text-[0.9rem] font-bold text-[#00d4ff]">
                Want to sell on the marketplace?
              </span>
            </div>

            {vendorApplied ? (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#6EE05A">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span className="text-[0.85rem] text-[#6EE05A] font-semibold">
                  Vendor application submitted! We&apos;ll review and set up your Stripe Connect account.
                </span>
              </div>
            ) : wantsVendor ? (
              <div>
                <p className="text-[0.8rem] text-[var(--text-secondary)] mb-3">
                  Sell workflows, templates, and services. Earn 80% of every sale with automated payouts via Stripe Connect.
                </p>
                <div className="auth-field mb-3">
                  <input
                    type="text"
                    value={vendorBusiness}
                    onChange={e => setVendorBusiness(e.target.value)}
                    placeholder="Your business or brand name"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="auth-btn primary text-[0.8rem] py-2 px-4"
                    onClick={handleApplyVendor}
                    disabled={saving}
                  >
                    {saving ? 'Submitting...' : 'Apply as Vendor'}
                  </button>
                  <button
                    className="auth-btn secondary text-[0.8rem] py-2 px-4"
                    onClick={() => setWantsVendor(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[0.8rem] text-[var(--text-secondary)] mb-3">
                  Sell workflows, templates, and services to the 0n community. Earn 80% with automated Stripe payouts.
                </p>
                <button
                  onClick={() => setWantsVendor(true)}
                  className="bg-transparent border border-[rgba(0,212,255,0.3)] rounded-lg text-[#00d4ff] text-[0.8rem] font-semibold px-4 py-2 cursor-pointer font-[inherit]"
                >
                  Apply to sell
                </button>
              </div>
            )}
          </div>

          <label className="onboarding-section-label text-center block mb-4">Choose your path</label>
          <div className="onboarding-path-grid">
            <Link href="/learn" className="onboarding-path-card">
              <div className="onboarding-path-icon text-[#00d4ff]"><IconBook size={28} /></div>
              <div className="onboarding-path-title">Explore Courses</div>
              <div className="onboarding-path-desc">Learn 0nMCP from scratch with free interactive lessons</div>
            </Link>
            <Link href="/builder" className="onboarding-path-card">
              <div className="onboarding-path-icon text-[#a78bfa]"><IconHammer size={28} /></div>
              <div className="onboarding-path-title">Build a Workflow</div>
              <div className="onboarding-path-desc">Describe what you need — AI builds your .0n file</div>
            </Link>
            <Link href="/forum" className="onboarding-path-card">
              <div className="onboarding-path-icon text-[#6EE05A]"><IconForum size={28} /></div>
              <div className="onboarding-path-title">Browse Forum</div>
              <div className="onboarding-path-desc">Ask questions, share tips, earn reputation</div>
            </Link>
            <a href="https://0n.app.clientclub.net/communities/groups/the-0nboard/home" target="_blank" rel="noopener noreferrer" className="onboarding-path-card no-underline text-[inherit]">
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

          <div className="onboarding-actions justify-center">
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary min-w-[200px]" onClick={handleComplete} disabled={saving}>
              {saving ? 'Finishing...' : 'Launch Console'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
