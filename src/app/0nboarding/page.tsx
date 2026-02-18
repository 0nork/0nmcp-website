'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

const PRODUCTS = [
  { name: '0ncore', color: '#a855f7', desc: 'Core infrastructure — vault, signing, execution engine' },
  { name: '0nmcp', color: '#00d4ff', desc: 'Universal API Protocol — 545 tools, 26 services' },
  { name: 'app0n', color: '#00ff88', desc: 'Application Layer — workflows, builder, marketplace' },
  { name: 'social0n', color: '#ff8c00', desc: 'Community Platform — forum, groups, reputation' },
  { name: '0nork', color: '#ef4444', desc: 'Parent company — orchestration infrastructure' },
]

const ROLES = ['developer', 'founder', 'agency', 'enterprise', 'hobbyist'] as const

const INTERESTS = [
  'AI/ML', 'Automation', 'CRM', 'E-Commerce', 'DevOps',
  'Social Media', 'Analytics', 'Security', 'Education', 'IoT',
]

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  // Community state (step 4)
  const [groups, setGroups] = useState<Array<{ id: string; slug: string; name: string; description: string; icon: string; member_count: number }>>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [groupsJoined, setGroupsJoined] = useState(0)

  // Load user data
  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company, bio, avatar_url, role, interests, onboarding_step')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setCompany(profile.company || '')
        setBio(profile.bio || '')
        setAvatarUrl(profile.avatar_url || '')
        setRole(profile.role || '')
        setInterests(profile.interests || [])
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

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save progress step marker
  const saveStep = useCallback(async (nextStep: number) => {
    if (!supabase || !userId) return
    await supabase
      .from('profiles')
      .update({ onboarding_step: nextStep })
      .eq('id', userId)
  }, [supabase, userId])

  // Navigate steps
  function goNext() {
    const next = Math.min(step + 1, TOTAL_STEPS)
    setStep(next)
    saveStep(next)
    setError('')
  }

  function goBack() {
    setStep(Math.max(step - 1, 1))
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

  // Step 4: Load community groups
  useEffect(() => {
    if (step !== 4) return
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

  // Step 4: Join selected groups
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

  // Step 5: Complete onboarding
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
      router.push('/account')
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
          <h1 className="onboarding-title">Welcome to the 0n Network</h1>
          <p className="onboarding-subtitle">
            Your unified platform for AI orchestration — from encrypted credentials to community-powered learning.
          </p>

          <div className="onboarding-product-grid">
            {PRODUCTS.map(p => (
              <div key={p.name} className="onboarding-product-card" style={{ '--product-color': p.color } as React.CSSProperties}>
                <div className="onboarding-product-logo">
                  <span className="onboarding-product-bracket" style={{ color: p.color }}>[</span>
                  <span className="onboarding-product-name">{p.name}</span>
                  <span className="onboarding-product-bracket" style={{ color: p.color }}>]</span>
                </div>
                <p className="onboarding-product-desc">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="onboarding-stat-row">
            <div className="onboarding-stat"><span className="onboarding-stat-value">545</span><span className="onboarding-stat-label">Tools</span></div>
            <div className="onboarding-stat"><span className="onboarding-stat-value">26</span><span className="onboarding-stat-label">Services</span></div>
            <div className="onboarding-stat"><span className="onboarding-stat-value">AES-256</span><span className="onboarding-stat-label">Encrypted Vault</span></div>
            <div className="onboarding-stat"><span className="onboarding-stat-value">$0</span><span className="onboarding-stat-label">Free Forever</span></div>
          </div>

          <button className="auth-btn primary" onClick={goNext} style={{ maxWidth: 320, margin: '0 auto' }}>
            Let&apos;s get started
          </button>
        </div>
      )}

      {/* ===== STEP 2: PROFILE SETUP ===== */}
      {step === 2 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">Set up your profile</h1>
          <p className="onboarding-subtitle">Tell us a bit about yourself so we can personalize your experience.</p>

          <div className="onboarding-avatar-section">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="onboarding-avatar-img" />
            ) : (
              <div className="onboarding-avatar-initials">{initials || '?'}</div>
            )}
            <label className="onboarding-avatar-upload">
              <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
              {avatarUploading ? 'Uploading...' : 'Upload photo'}
            </label>
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

      {/* ===== STEP 4: JOIN COMMUNITY ===== */}
      {step === 4 && (
        <div className="onboarding-card fadeInUp">
          <h1 className="onboarding-title">Join the community</h1>
          <p className="onboarding-subtitle">
            Connect with builders, ask questions, and share workflows.
          </p>

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

      {/* ===== STEP 5: LAUNCH PAD ===== */}
      {step === 5 && (
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
            {groupsJoined > 0 && (
              <div className="onboarding-summary-row">
                <span className="onboarding-summary-label">Community</span>
                <span className="onboarding-summary-value">{groupsJoined} group{groupsJoined !== 1 ? 's' : ''} joined</span>
              </div>
            )}
          </div>

          <label className="onboarding-section-label" style={{ textAlign: 'center', display: 'block', marginBottom: '1rem' }}>Choose your path</label>
          <div className="onboarding-path-grid">
            <Link href="/learn" className="onboarding-path-card">
              <div className="onboarding-path-icon">&#x1F4DA;</div>
              <div className="onboarding-path-title">Explore Courses</div>
              <div className="onboarding-path-desc">Learn 0nMCP from scratch with free interactive lessons</div>
            </Link>
            <Link href="/builder" className="onboarding-path-card">
              <div className="onboarding-path-icon">&#x2692;&#xFE0F;</div>
              <div className="onboarding-path-title">Build a Workflow</div>
              <div className="onboarding-path-desc">Describe what you need — AI builds your .0n file</div>
            </Link>
            <Link href="/forum" className="onboarding-path-card">
              <div className="onboarding-path-icon">&#x1F4AC;</div>
              <div className="onboarding-path-title">Join Discussion</div>
              <div className="onboarding-path-desc">Ask questions, share tips, earn reputation</div>
            </Link>
          </div>

          <div className="onboarding-sponsor-cta">
            <Link href="/sponsor">
              Support 0nMCP — Starting at $5/mo
            </Link>
          </div>

          <div className="onboarding-actions" style={{ justifyContent: 'center' }}>
            <button className="auth-btn secondary" onClick={goBack}>Back</button>
            <button className="auth-btn primary" onClick={handleComplete} disabled={saving} style={{ minWidth: 200 }}>
              {saving ? 'Finishing...' : 'Go to Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
