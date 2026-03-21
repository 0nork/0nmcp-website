'use client'

import { useState, useCallback } from 'react'

const OBJECTIVES = [
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'CONVERSIONS', label: 'Conversions' },
  { value: 'BRAND_AWARENESS', label: 'Brand Awareness' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'MESSAGES', label: 'Messages' },
]

const SPECIAL_AD_CATEGORIES = [
  { value: 'NONE', label: 'None' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'EMPLOYMENT', label: 'Employment' },
  { value: 'HOUSING', label: 'Housing' },
  { value: 'SOCIAL_ISSUES', label: 'Social Issues' },
]

const INTEREST_SUGGESTIONS = [
  'Spa & Wellness',
  'Massage',
  'Skincare',
  'Self-care',
  'Beauty',
  'Health & Fitness',
]

const AD_FORMATS = [
  { value: 'SINGLE_IMAGE', label: 'Single Image' },
  { value: 'CAROUSEL', label: 'Carousel' },
  { value: 'VIDEO', label: 'Video' },
]

const CTA_OPTIONS = [
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'BOOK_NOW', label: 'Book Now' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'GET_OFFER', label: 'Get Offer' },
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'SEND_MESSAGE', label: 'Send Message' },
]

const AGES_MIN = Array.from({ length: 48 }, (_, i) => i + 18)
const AGES_MAX = [...Array.from({ length: 47 }, (_, i) => i + 19), '65+']

type CampaignData = {
  name: string
  objective: string
  dailyBudget: string
  startDate: string
  endDate: string
  specialCategories: string[]
  location: string
  ageMin: number
  ageMax: string
  gender: string
  interests: string
  adFormat: string
  primaryText: string
  headline: string
  description: string
  cta: string
  linkUrl: string
}

const INITIAL_CAMPAIGN: CampaignData = {
  name: '',
  objective: 'TRAFFIC',
  dailyBudget: '20',
  startDate: '',
  endDate: '',
  specialCategories: ['NONE'],
  location: '',
  ageMin: 25,
  ageMax: '55',
  gender: 'ALL',
  interests: '',
  adFormat: 'SINGLE_IMAGE',
  primaryText: '',
  headline: '',
  description: '',
  cta: 'LEARN_MORE',
  linkUrl: '',
}

function estimateReach(budget: number): [number, number] {
  const base = budget * 30
  const low = Math.round(base * 0.8)
  const high = Math.round(base * 1.4)
  return [low, high]
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// --- Inline style objects ---

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1419',
    padding: '32px 24px 80px',
  } as React.CSSProperties,

  container: {
    maxWidth: 800,
    margin: '0 auto',
  } as React.CSSProperties,

  header: {
    marginBottom: 40,
  } as React.CSSProperties,

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  } as React.CSSProperties,

  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(24, 119, 242, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    color: '#1877F2',
    flexShrink: 0,
  } as React.CSSProperties,

  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#e8eaed',
    margin: 0,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  subtitle: {
    fontSize: 14,
    color: '#9aa0a8',
    margin: 0,
    marginTop: 2,
  } as React.CSSProperties,

  badge: (connected: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: connected ? 'rgba(126,217,87,0.10)' : 'rgba(255,107,53,0.10)',
    color: connected ? '#7ed957' : '#ff6b35',
    border: `1px solid ${connected ? 'rgba(126,217,87,0.2)' : 'rgba(255,107,53,0.2)'}`,
    marginTop: 12,
  } as React.CSSProperties),

  dot: (connected: boolean) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: connected ? '#7ed957' : '#ff6b35',
  } as React.CSSProperties),

  // Steps
  stepsNav: {
    display: 'flex',
    gap: 0,
    marginBottom: 32,
    position: 'relative' as const,
  } as React.CSSProperties,

  stepIndicator: (active: boolean, complete: boolean) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    position: 'relative' as const,
    padding: '0 4px',
  }),

  stepCircle: (active: boolean, complete: boolean) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    background: complete ? '#7ed957' : active ? 'rgba(24, 119, 242, 0.2)' : 'rgba(255,255,255,0.05)',
    color: complete ? '#0f1419' : active ? '#1877F2' : '#5f6672',
    border: `2px solid ${complete ? '#7ed957' : active ? '#1877F2' : 'rgba(255,255,255,0.08)'}`,
    transition: 'all 0.2s ease',
  } as React.CSSProperties),

  stepLabel: (active: boolean, complete: boolean) => ({
    fontSize: 11,
    fontWeight: 600,
    color: complete ? '#7ed957' : active ? '#e8eaed' : '#5f6672',
    textAlign: 'center' as const,
    letterSpacing: '0.02em',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties),

  stepLine: (complete: boolean) => ({
    position: 'absolute' as const,
    top: 18,
    left: 'calc(50% + 22px)',
    right: 'calc(-50% + 22px)',
    height: 2,
    background: complete ? '#7ed957' : 'rgba(255,255,255,0.06)',
    zIndex: 0,
  } as React.CSSProperties),

  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
  } as React.CSSProperties,

  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e8eaed',
    margin: '0 0 24px',
  } as React.CSSProperties,

  // Form
  fieldGroup: {
    marginBottom: 20,
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#9aa0a8',
    marginBottom: 6,
    letterSpacing: '0.02em',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8eaed',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8eaed',
    fontSize: 14,
    outline: 'none',
    appearance: 'none' as const,
    boxSizing: 'border-box' as const,
    cursor: 'pointer',
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8eaed',
    fontSize: 14,
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 80,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  } as React.CSSProperties,

  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 16,
  } as React.CSSProperties,

  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 10,
    marginTop: 4,
  } as React.CSSProperties,

  checkboxLabel: (checked: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 10,
    border: `1px solid ${checked ? 'rgba(24,119,242,0.3)' : 'rgba(255,255,255,0.08)'}`,
    background: checked ? 'rgba(24,119,242,0.08)' : 'rgba(255,255,255,0.02)',
    color: checked ? '#1877F2' : '#9aa0a8',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties),

  pill: (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: `1px solid ${active ? 'rgba(126,217,87,0.3)' : 'rgba(255,255,255,0.08)'}`,
    background: active ? 'rgba(126,217,87,0.10)' : 'rgba(255,255,255,0.03)',
    color: active ? '#7ed957' : '#9aa0a8',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties),

  // Buttons
  btnPrimary: {
    padding: '12px 28px',
    borderRadius: 10,
    border: 'none',
    background: '#7ed957',
    color: '#0f1419',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    letterSpacing: '0.01em',
  } as React.CSSProperties,

  btnSecondary: {
    padding: '12px 28px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e8eaed',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties,

  btnMeta: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid rgba(24,119,242,0.3)',
    background: 'rgba(24,119,242,0.10)',
    color: '#1877F2',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,

  navButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 32,
  } as React.CSSProperties,

  // Preview
  previewCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  } as React.CSSProperties,

  previewImage: {
    width: '100%',
    height: 200,
    background: 'linear-gradient(135deg, rgba(24,119,242,0.15) 0%, rgba(126,217,87,0.08) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5f6672',
    fontSize: 14,
  } as React.CSSProperties,

  previewBody: {
    padding: 20,
  } as React.CSSProperties,

  previewSponsor: {
    fontSize: 11,
    color: '#5f6672',
    marginBottom: 4,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  } as React.CSSProperties,

  previewHeadline: {
    fontSize: 16,
    fontWeight: 700,
    color: '#e8eaed',
    margin: '6px 0',
  } as React.CSSProperties,

  previewText: {
    fontSize: 13,
    color: '#9aa0a8',
    lineHeight: 1.5,
    margin: '8px 0 16px',
  } as React.CSSProperties,

  previewCta: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: 6,
    background: '#1877F2',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    border: 'none',
    cursor: 'default',
  } as React.CSSProperties,

  estimate: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderRadius: 12,
    background: 'rgba(24,119,242,0.06)',
    border: '1px solid rgba(24,119,242,0.12)',
    marginBottom: 24,
  } as React.CSSProperties,

  estimateLabel: {
    fontSize: 13,
    color: '#9aa0a8',
  } as React.CSSProperties,

  estimateValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1877F2',
  } as React.CSSProperties,

  actionRow: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  } as React.CSSProperties,

  successBanner: {
    padding: '16px 20px',
    borderRadius: 12,
    background: 'rgba(126,217,87,0.08)',
    border: '1px solid rgba(126,217,87,0.2)',
    color: '#7ed957',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  } as React.CSSProperties,

  errorBanner: {
    padding: '16px 20px',
    borderRadius: 12,
    background: 'rgba(255,107,53,0.08)',
    border: '1px solid rgba(255,107,53,0.2)',
    color: '#ff6b35',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 24,
  } as React.CSSProperties,

  generatingOverlay: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(24,119,242,0.06)',
    border: '1px solid rgba(24,119,242,0.12)',
    color: '#1877F2',
    fontSize: 13,
    fontWeight: 600,
    marginTop: 12,
  } as React.CSSProperties,
}

const STEP_LABELS = ['Campaign', 'Audience', 'Creative', 'Review']

export default function FacebookAdsPage() {
  const [step, setStep] = useState(0)
  const [campaign, setCampaign] = useState<CampaignData>({ ...INITIAL_CAMPAIGN, startDate: todayStr() })
  const [launching, setLaunching] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const connected = true // Placeholder for actual Meta connection check

  const update = useCallback((field: keyof CampaignData, value: string | number | string[]) => {
    setCampaign(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleSpecialCategory = useCallback((cat: string) => {
    setCampaign(prev => {
      const current = prev.specialCategories
      if (cat === 'NONE') return { ...prev, specialCategories: ['NONE'] }
      const without = current.filter(c => c !== 'NONE')
      if (without.includes(cat)) {
        const next = without.filter(c => c !== cat)
        return { ...prev, specialCategories: next.length === 0 ? ['NONE'] : next }
      }
      return { ...prev, specialCategories: [...without, cat] }
    })
  }, [])

  const toggleInterest = useCallback((interest: string) => {
    setCampaign(prev => {
      const current = prev.interests.split(',').map(s => s.trim()).filter(Boolean)
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter(i => i !== interest).join(', ') }
      }
      return { ...prev, interests: [...current, interest].join(', ') }
    })
  }, [])

  const interestList = campaign.interests.split(',').map(s => s.trim()).filter(Boolean)

  const handleGenerateAdCopy = useCallback(async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/console/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate compelling Facebook ad copy for this campaign:
Campaign: ${campaign.name || 'Untitled Campaign'}
Objective: ${campaign.objective}
Target: ${campaign.location}, ages ${campaign.ageMin}-${campaign.ageMax}, interests: ${campaign.interests || 'general'}

Return a JSON object with these fields only, no markdown:
{"primaryText": "...", "headline": "...", "description": "..."}

Make it persuasive, professional, and optimized for ${campaign.objective.toLowerCase().replace('_', ' ')}. Keep the headline under 40 characters. Primary text should be 2-3 sentences. Description should be 1 sentence.`,
          mode: 'facebook-ads',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.response || data.message || ''
        const jsonMatch = text.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            setCampaign(prev => ({
              ...prev,
              primaryText: parsed.primaryText || prev.primaryText,
              headline: parsed.headline || prev.headline,
              description: parsed.description || prev.description,
            }))
          } catch {
            // Silently fail on parse error
          }
        }
      }
    } catch {
      // Silently fail on network error
    } finally {
      setGenerating(false)
    }
  }, [campaign.name, campaign.objective, campaign.location, campaign.ageMin, campaign.ageMax, campaign.interests])

  const handleLaunch = useCallback(async () => {
    setLaunching(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/console/facebook-ads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Campaign created successfully! Workflow saved.')
      } else {
        setError(data.error || 'Failed to create campaign.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLaunching(false)
    }
  }, [campaign])

  const handleSaveWorkflow = useCallback(() => {
    const workflow = {
      $0n: {
        type: 'workflow',
        version: '1.0.0',
        name: `fb-ads-${campaign.name || 'campaign'}`.replace(/\s+/g, '-').toLowerCase(),
        description: `Facebook Ads campaign: ${campaign.name}`,
      },
      trigger: { type: 'manual', config: {} },
      inputs: {
        objective: { type: 'string', default: campaign.objective },
        dailyBudget: { type: 'number', default: parseFloat(campaign.dailyBudget) || 20 },
      },
      steps: [
        {
          id: 'step_001',
          name: 'Create campaign',
          service: 'facebook',
          action: 'create_campaign',
          params: {
            name: campaign.name,
            objective: campaign.objective,
            daily_budget: parseFloat(campaign.dailyBudget) * 100,
            special_ad_categories: campaign.specialCategories.filter(c => c !== 'NONE'),
          },
          output: 'campaign',
        },
        {
          id: 'step_002',
          name: 'Set audience targeting',
          service: 'facebook',
          action: 'create_ad_set',
          params: {
            campaign_id: '{{step_001.output.id}}',
            targeting: {
              geo_locations: { cities: [campaign.location] },
              age_min: campaign.ageMin,
              age_max: campaign.ageMax === '65+' ? 65 : parseInt(campaign.ageMax as string),
              genders: campaign.gender === 'ALL' ? [0] : campaign.gender === 'MALE' ? [1] : [2],
              interests: interestList,
            },
            daily_budget: parseFloat(campaign.dailyBudget) * 100,
            start_time: campaign.startDate,
            end_time: campaign.endDate || undefined,
          },
          output: 'adSet',
        },
        {
          id: 'step_003',
          name: 'Create ad creative',
          service: 'facebook',
          action: 'create_ad_creative',
          params: {
            name: `${campaign.name} - Creative`,
            body: campaign.primaryText,
            title: campaign.headline,
            description: campaign.description,
            call_to_action_type: campaign.cta,
            link: campaign.linkUrl,
          },
          output: 'creative',
        },
      ],
    }
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.$0n.name}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }, [campaign, interestList])

  const canProceed = (s: number): boolean => {
    if (s === 0) return !!campaign.name.trim() && !!campaign.dailyBudget
    if (s === 1) return !!campaign.location.trim()
    if (s === 2) return !!campaign.primaryText.trim() && !!campaign.headline.trim()
    return true
  }

  const [reach0, reach1] = estimateReach(parseFloat(campaign.dailyBudget) || 0)
  const ctaLabel = CTA_OPTIONS.find(c => c.value === campaign.cta)?.label || 'Learn More'

  // --- Render ---

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <div style={styles.metaIcon}>f</div>
            <div>
              <h1 style={styles.title}>Facebook Ads</h1>
              <p style={styles.subtitle}>Create and manage Facebook ad campaigns</p>
            </div>
          </div>
          <div style={styles.badge(connected)}>
            <div style={styles.dot(connected)} />
            {connected ? 'Meta Connected' : 'Not Connected'}
          </div>
        </div>

        {/* Step Navigation */}
        <div style={styles.stepsNav}>
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              style={styles.stepIndicator(i === step, i < step)}
              onClick={() => { if (i <= step || canProceed(step)) setStep(i) }}
            >
              {i < STEP_LABELS.length - 1 && (
                <div style={styles.stepLine(i < step)} />
              )}
              <div style={styles.stepCircle(i === step, i < step)}>
                {i < step ? '\u2713' : i + 1}
              </div>
              <span style={styles.stepLabel(i === step, i < step)}>{label}</span>
            </div>
          ))}
        </div>

        {/* Banners */}
        {success && <div style={styles.successBanner}>{'\u2713'} {success}</div>}
        {error && <div style={styles.errorBanner}>{error}</div>}

        {/* Step 1: Campaign Setup */}
        {step === 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Campaign Setup</h2>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Campaign Name</label>
              <input
                style={styles.input}
                value={campaign.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Spring Spa Special - March 2026"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Campaign Objective</label>
              <select
                style={styles.select}
                value={campaign.objective}
                onChange={e => update('objective', e.target.value)}
              >
                {OBJECTIVES.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Daily Budget ($)</label>
              <input
                style={styles.input}
                type="number"
                min="1"
                step="1"
                value={campaign.dailyBudget}
                onChange={e => update('dailyBudget', e.target.value)}
                placeholder="20"
              />
            </div>

            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={campaign.startDate}
                  onChange={e => update('startDate', e.target.value)}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>End Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={campaign.endDate}
                  onChange={e => update('endDate', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Special Ad Categories</label>
              <div style={styles.checkboxGroup}>
                {SPECIAL_AD_CATEGORIES.map(cat => {
                  const checked = campaign.specialCategories.includes(cat.value)
                  return (
                    <label key={cat.value} style={styles.checkboxLabel(checked)} onClick={e => e.preventDefault()}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSpecialCategory(cat.value)}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `2px solid ${checked ? '#1877F2' : 'rgba(255,255,255,0.15)'}`,
                        background: checked ? '#1877F2' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#fff',
                        flexShrink: 0,
                      }}>
                        {checked ? '\u2713' : ''}
                      </span>
                      {cat.label}
                    </label>
                  )
                })}
              </div>
            </div>

            <div style={styles.navButtons}>
              <div />
              <button
                style={{ ...styles.btnPrimary, opacity: canProceed(0) ? 1 : 0.4 }}
                disabled={!canProceed(0)}
                onClick={() => setStep(1)}
              >
                Next: Audience Targeting
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Audience Targeting */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Audience Targeting</h2>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Location</label>
              <input
                style={styles.input}
                value={campaign.location}
                onChange={e => update('location', e.target.value)}
                placeholder="City, State, or ZIP code"
              />
            </div>

            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Age Min</label>
                <select
                  style={styles.select}
                  value={campaign.ageMin}
                  onChange={e => update('ageMin', parseInt(e.target.value))}
                >
                  {AGES_MIN.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Age Max</label>
                <select
                  style={styles.select}
                  value={campaign.ageMax}
                  onChange={e => update('ageMax', e.target.value)}
                >
                  {AGES_MAX.map(a => (
                    <option key={String(a)} value={String(a)}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Gender</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['ALL', 'MALE', 'FEMALE'].map(g => (
                  <button
                    key={g}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 10,
                      border: `1px solid ${campaign.gender === g ? 'rgba(24,119,242,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      background: campaign.gender === g ? 'rgba(24,119,242,0.10)' : 'rgba(255,255,255,0.03)',
                      color: campaign.gender === g ? '#1877F2' : '#9aa0a8',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => update('gender', g)}
                  >
                    {g === 'ALL' ? 'All' : g === 'MALE' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Interests (comma separated)</label>
              <textarea
                style={styles.textarea}
                value={campaign.interests}
                onChange={e => update('interests', e.target.value)}
                placeholder="e.g. Spa, Wellness, Massage therapy"
                rows={2}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Suggested Interests</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INTEREST_SUGGESTIONS.map(interest => (
                  <button
                    key={interest}
                    style={styles.pill(interestList.includes(interest))}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.navButtons}>
              <button style={styles.btnSecondary} onClick={() => setStep(0)}>
                Back
              </button>
              <button
                style={{ ...styles.btnPrimary, opacity: canProceed(1) ? 1 : 0.4 }}
                disabled={!canProceed(1)}
                onClick={() => setStep(2)}
              >
                Next: Ad Creative
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ad Creative */}
        {step === 2 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Ad Creative</h2>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Ad Format</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {AD_FORMATS.map(f => (
                  <button
                    key={f.value}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 10,
                      border: `1px solid ${campaign.adFormat === f.value ? 'rgba(24,119,242,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      background: campaign.adFormat === f.value ? 'rgba(24,119,242,0.10)' : 'rgba(255,255,255,0.03)',
                      color: campaign.adFormat === f.value ? '#1877F2' : '#9aa0a8',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => update('adFormat', f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Primary Text</label>
              <textarea
                style={styles.textarea}
                value={campaign.primaryText}
                onChange={e => update('primaryText', e.target.value)}
                placeholder="The main ad copy your audience will see..."
                rows={4}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Headline</label>
                <input
                  style={styles.input}
                  value={campaign.headline}
                  onChange={e => update('headline', e.target.value)}
                  placeholder="Short, punchy headline"
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Call to Action</label>
                <select
                  style={styles.select}
                  value={campaign.cta}
                  onChange={e => update('cta', e.target.value)}
                >
                  {CTA_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Description</label>
              <input
                style={styles.input}
                value={campaign.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Short description below the headline"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Link URL</label>
              <input
                style={styles.input}
                value={campaign.linkUrl}
                onChange={e => update('linkUrl', e.target.value)}
                placeholder="https://thespaatligonier.com/book"
              />
            </div>

            <button
              style={{ ...styles.btnMeta, opacity: generating ? 0.6 : 1, marginTop: 4 }}
              disabled={generating}
              onClick={handleGenerateAdCopy}
            >
              {generating ? '' : '\u2728'} {generating ? 'Generating...' : 'Generate Ad Copy with AI'}
            </button>
            {generating && (
              <div style={styles.generatingOverlay}>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 14 }}>{'\u25E0'}</span>
                Crafting persuasive ad copy...
              </div>
            )}

            <div style={styles.navButtons}>
              <button style={styles.btnSecondary} onClick={() => setStep(1)}>
                Back
              </button>
              <button
                style={{ ...styles.btnPrimary, opacity: canProceed(2) ? 1 : 0.4 }}
                disabled={!canProceed(2)}
                onClick={() => setStep(3)}
              >
                Next: Review & Launch
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {step === 3 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Review & Launch</h2>

            {/* Ad Preview */}
            <div style={styles.previewCard}>
              <div style={styles.previewImage}>
                {campaign.adFormat === 'VIDEO' ? '\u25B6 Video Preview' : campaign.adFormat === 'CAROUSEL' ? '\u25C0 Carousel Preview \u25B6' : 'Image Preview'}
              </div>
              <div style={styles.previewBody}>
                <div style={styles.previewSponsor}>Sponsored</div>
                <div style={styles.previewHeadline}>
                  {campaign.headline || 'Your Headline Here'}
                </div>
                <div style={styles.previewText}>
                  {campaign.primaryText || 'Your primary ad text will appear here...'}
                </div>
                {campaign.description && (
                  <div style={{ fontSize: 12, color: '#5f6672', marginBottom: 12 }}>
                    {campaign.description}
                  </div>
                )}
                <span style={styles.previewCta}>{ctaLabel}</span>
              </div>
            </div>

            {/* Cost Estimate */}
            <div style={styles.estimate}>
              <div>
                <div style={styles.estimateLabel}>Estimated daily reach</div>
                <div style={styles.estimateValue}>
                  {reach0.toLocaleString()} - {reach1.toLocaleString()} people
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' as const }}>
                <div style={styles.estimateLabel}>Daily budget</div>
                <div style={{ ...styles.estimateValue, color: '#7ed957' }}>
                  ${parseFloat(campaign.dailyBudget).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Summary Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 24 }}>
              {[
                ['Campaign', campaign.name],
                ['Objective', OBJECTIVES.find(o => o.value === campaign.objective)?.label],
                ['Location', campaign.location],
                ['Audience', `Ages ${campaign.ageMin}-${campaign.ageMax}, ${campaign.gender === 'ALL' ? 'All genders' : campaign.gender}`],
                ['Format', AD_FORMATS.find(f => f.value === campaign.adFormat)?.label],
                ['Schedule', `${campaign.startDate}${campaign.endDate ? ' \u2192 ' + campaign.endDate : ' (ongoing)'}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#5f6672', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, color: '#e8eaed' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={styles.actionRow}>
              <button style={styles.btnSecondary} onClick={() => setStep(2)}>
                Back
              </button>
              <button style={styles.btnSecondary} onClick={handleSaveWorkflow}>
                Save as .0n Workflow
              </button>
              <button
                style={{
                  ...styles.btnPrimary,
                  flex: 1,
                  opacity: launching ? 0.6 : 1,
                  fontSize: 15,
                  padding: '14px 28px',
                }}
                disabled={launching}
                onClick={handleLaunch}
              >
                {launching ? 'Launching...' : 'Launch Campaign'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
