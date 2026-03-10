'use client'

import { useState, useCallback, useEffect } from 'react'
import type { VendorListing } from '@/lib/console/useVendor'

// ── Constants ──

const CATEGORIES = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'data', label: 'Data' },
  { value: 'devops', label: 'DevOps' },
  { value: 'custom', label: 'Custom' },
]

const ASSET_TYPES = [
  { value: 'workflow', label: 'Workflow' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'email', label: 'Email Template' },
  { value: 'form', label: 'Form' },
  { value: 'product_page', label: 'Product Page' },
]

const AVAILABLE_SERVICES = [
  { key: 'anthropic', label: 'Anthropic' },
  { key: 'openai', label: 'OpenAI' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'supabase', label: 'Supabase' },
  { key: 'slack', label: 'Slack' },
  { key: 'github', label: 'GitHub' },
  { key: 'gmail', label: 'Gmail' },
  { key: 'google_sheets', label: 'Google Sheets' },
  { key: 'google_drive', label: 'Google Drive' },
  { key: 'sendgrid', label: 'SendGrid' },
  { key: 'twilio', label: 'Twilio' },
  { key: 'discord', label: 'Discord' },
  { key: 'shopify', label: 'Shopify' },
  { key: 'airtable', label: 'Airtable' },
  { key: 'notion', label: 'Notion' },
  { key: 'mongodb', label: 'MongoDB' },
  { key: 'hubspot', label: 'HubSpot' },
  { key: 'zendesk', label: 'Zendesk' },
  { key: 'jira', label: 'Jira' },
  { key: 'linear', label: 'Linear' },
]

const COLORS = {
  bg: '#0a0a0a',
  card: '#111111',
  border: '#222222',
  borderFocus: '#7ed957',
  accent: '#7ed957',
  accentGlow: 'rgba(126, 217, 87, 0.12)',
  accentBorder: 'rgba(126, 217, 87, 0.3)',
  orange: '#ff6b35',
  red: '#ef4444',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
} as const

// ── Props ──

interface VendorListingFormProps {
  listing?: VendorListing | null
  onSubmit: (data: {
    title: string
    description: string
    category: string
    asset_type: string
    price: number
    tags: string[]
    services: string[]
    cover_image_url?: string
    status?: 'draft' | 'active'
  }) => Promise<void>
  onClose: () => void
}

// ── Component ──

export function VendorListingForm({ listing, onSubmit, onClose }: VendorListingFormProps) {
  const isEditing = !!listing

  const [title, setTitle] = useState(listing?.title || '')
  const [description, setDescription] = useState(listing?.description || '')
  const [category, setCategory] = useState(listing?.category || 'marketing')
  const [assetType, setAssetType] = useState(listing?.asset_type || 'workflow')
  const [priceDisplay, setPriceDisplay] = useState(
    listing ? (listing.price / 100).toFixed(2) : ''
  )
  const [tagsInput, setTagsInput] = useState(listing?.tags?.join(', ') || '')
  const [services, setServices] = useState<string[]>(listing?.services || [])
  const [coverImageUrl, setCoverImageUrl] = useState(listing?.cover_image_url || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const toggleService = useCallback((key: string) => {
    setServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }, [])

  const handleSubmit = useCallback(async (status: 'draft' | 'active') => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    const priceCents = Math.round(parseFloat(priceDisplay || '0') * 100)
    if (isNaN(priceCents) || priceCents < 0) {
      setError('Price must be a valid number')
      return
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        asset_type: assetType,
        price: priceCents,
        tags,
        services,
        ...(coverImageUrl.trim() ? { cover_image_url: coverImageUrl.trim() } : {}),
        status,
      })
    } catch {
      setError('Failed to save listing')
    } finally {
      setSubmitting(false)
    }
  }, [title, description, category, assetType, priceDisplay, tagsInput, services, coverImageUrl, onSubmit])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        animation: 'vlf-fade-in 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 600, maxHeight: '90vh',
          borderRadius: 16, backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'vlf-slide-up 0.3s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.02em' }}>
            {isEditing ? 'Edit Listing' : 'Create Listing'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: COLORS.textMuted,
              fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.textPrimary }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textMuted }}
          >
            x
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 16,
              backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: COLORS.red, fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Title */}
          <FormField label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lead Nurture Email Sequence"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.borderFocus }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border }}
            />
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this listing includes and how it works..."
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical' as const,
                minHeight: 80,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.borderFocus }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border }}
            />
          </FormField>

          {/* Category & Asset Type — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} style={{ backgroundColor: '#111' }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Asset Type">
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {ASSET_TYPES.map((a) => (
                  <option key={a.value} value={a.value} style={{ backgroundColor: '#111' }}>
                    {a.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Price */}
          <FormField label="Price (USD)">
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, color: COLORS.textMuted, fontWeight: 600,
              }}>
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
                placeholder="0.00"
                style={{
                  ...inputStyle,
                  paddingLeft: 28,
                  fontFamily: 'var(--font-mono)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.borderFocus }}
                onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border }}
              />
            </div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
              Set to 0 for a free listing. Price is in dollars.
            </p>
          </FormField>

          {/* Tags */}
          <FormField label="Tags">
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="email, automation, lead-gen"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.borderFocus }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border }}
            />
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
              Comma-separated tags for search and discovery.
            </p>
          </FormField>

          {/* Services multi-select */}
          <FormField label="Required Services">
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              padding: '10px 12px', borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.border}`,
            }}>
              {AVAILABLE_SERVICES.map((svc) => {
                const selected = services.includes(svc.key)
                return (
                  <button
                    key={svc.key}
                    type="button"
                    onClick={() => toggleService(svc.key)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                      backgroundColor: selected ? COLORS.accentGlow : 'rgba(255,255,255,0.04)',
                      color: selected ? COLORS.accent : COLORS.textMuted,
                      outline: selected ? `1px solid ${COLORS.accentBorder}` : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.color = COLORS.textSecondary
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.color = COLORS.textMuted
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                      }
                    }}
                  >
                    {svc.label}
                  </button>
                )
              })}
            </div>
          </FormField>

          {/* Cover Image URL */}
          <FormField label="Cover Image URL">
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.borderFocus }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border }}
            />
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
              Optional. A 4:3 aspect ratio image works best.
            </p>
          </FormField>
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${COLORS.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '10px 20px', borderRadius: 8,
              border: `1px solid ${COLORS.border}`, backgroundColor: 'transparent',
              color: COLORS.textSecondary, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.textMuted
              e.currentTarget.style.color = COLORS.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border
              e.currentTarget.style.color = COLORS.textSecondary
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            style={{
              padding: '10px 20px', borderRadius: 8,
              border: `1px solid ${COLORS.border}`, backgroundColor: 'rgba(255,255,255,0.06)',
              color: COLORS.textPrimary, fontSize: 13, fontWeight: 600,
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.5 : 1, transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
            }}
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('active')}
            disabled={submitting}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              backgroundColor: COLORS.accent, color: '#000',
              fontSize: 13, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.5 : 1, transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = submitting ? '0.5' : '1' }}
          >
            {isEditing ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes vlf-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes vlf-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

// ── Helper components ──

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: COLORS.textSecondary, marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Shared input style ──

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: `1px solid ${COLORS.border}`,
  color: COLORS.textPrimary,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
