'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useBuilder, type GenerateConfig } from '@/lib/console/useBuilder'
import {
  type AssetType,
  type BuilderAsset,
  ASSET_TYPE_LABELS,
  ASSET_TYPE_COLORS,
} from '@/components/console/StoreTypes'

/* ──────────────────────────────────────────── */
/*  Constants                                   */
/* ──────────────────────────────────────────── */

const ASSET_TYPES: AssetType[] = ['landing_page', 'email', 'form', 'product_page']

const STYLE_OPTIONS: { key: GenerateConfig['style']; label: string }[] = [
  { key: 'minimal', label: 'Minimal' },
  { key: 'bold', label: 'Bold' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'creative', label: 'Creative' },
]

const SECTION_OPTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'features', label: 'Features' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'cta', label: 'CTA' },
  { key: 'social-proof', label: 'Social Proof' },
]

type DeviceSize = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTHS: Record<DeviceSize, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
}

type ExportFormat = 'html' | 'react' | 'crm_funnel' | 'crm_email'

const EXPORT_OPTIONS: { key: ExportFormat; label: string }[] = [
  { key: 'html', label: 'HTML' },
  { key: 'react', label: 'React' },
  { key: 'crm_funnel', label: 'Rocket+ Funnel' },
  { key: 'crm_email', label: 'Rocket+ Email' },
]

/* ──────────────────────────────────────────── */
/*  Styles                                      */
/* ──────────────────────────────────────────── */

const colors = {
  bg: '#0B0F19',
  card: '#111827',
  cardHover: '#111827',
  border: '#222222',
  borderHover: '#2D3748',
  text: '#e5e5e5',
  textSecondary: '#999999',
  textMuted: '#4A5568',
  accent: '#ff6b35',
  accentDim: 'rgba(255, 107, 53, 0.15)',
  accentBorder: 'rgba(255, 107, 53, 0.3)',
  green: '#6EE05A',
  greenDim: 'rgba(110, 224, 90, 0.15)',
  greenBorder: 'rgba(110, 224, 90, 0.3)',
  red: '#ef4444',
  redDim: 'rgba(239, 68, 68, 0.15)',
}

/* ──────────────────────────────────────────── */
/*  BuilderView                                 */
/* ──────────────────────────────────────────── */

export function BuilderView() {
  const builder = useBuilder()

  // ── Config state ──
  const [assetType, setAssetType] = useState<AssetType>('landing_page')
  const [prompt, setPrompt] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#ff6b35')
  const [secondaryColor, setSecondaryColor] = useState('#0B0F19')
  const [accentColor, setAccentColor] = useState('#6EE05A')
  const [style, setStyle] = useState<GenerateConfig['style']>('minimal')
  const [sections, setSections] = useState<string[]>(['hero', 'features', 'cta'])
  const [crmWebhook, setCrmWebhook] = useState('')
  const [checkoutPrice, setCheckoutPrice] = useState('')
  const [includeCheckout, setIncludeCheckout] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)

  // ── Preview state ──
  const [device, setDevice] = useState<DeviceSize>('desktop')
  const [editingHtml, setEditingHtml] = useState(false)
  const [editHtmlValue, setEditHtmlValue] = useState('')

  // ── Refs ──
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // ── Load assets on mount ──
  useEffect(() => {
    builder.fetchAssets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync edit HTML when current asset changes ──
  useEffect(() => {
    if (builder.previewHtml) {
      setEditHtmlValue(builder.previewHtml)
    }
  }, [builder.previewHtml])

  // ── Generate ──
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    const config: GenerateConfig = {
      assetType,
      prompt: prompt.trim(),
      companyName: companyName || undefined,
      brandColors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
      style,
    }

    if (assetType === 'landing_page') {
      config.sections = sections
    }

    if (assetType === 'form' && crmWebhook) {
      config.crmWebhook = crmWebhook
    }

    if (assetType === 'product_page') {
      if (checkoutPrice) config.checkoutPrice = parseFloat(checkoutPrice)
      config.includeCheckout = includeCheckout
    }

    await builder.generateAsset(config)
    setEditingHtml(false)
  }, [
    prompt, assetType, companyName, primaryColor, secondaryColor,
    accentColor, style, sections, crmWebhook, checkoutPrice,
    includeCheckout, builder,
  ])

  // ── Export ──
  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!builder.currentAsset) return

    const result = await builder.exportAsset(builder.currentAsset.id, format)
    if (!result) return

    const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [builder])

  // ── Copy HTML ──
  const handleCopyHtml = useCallback(async () => {
    const html = editingHtml ? editHtmlValue : builder.previewHtml
    if (!html) return
    try {
      await navigator.clipboard.writeText(html)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = html
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }, [editingHtml, editHtmlValue, builder.previewHtml])

  // ── Save edited HTML ──
  const handleSaveHtml = useCallback(async () => {
    if (!builder.currentAsset) return
    await builder.updateAsset(builder.currentAsset.id, { html: editHtmlValue })
    setEditingHtml(false)
  }, [builder, editHtmlValue])

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    if (!builder.currentAsset) return
    await builder.deleteAsset(builder.currentAsset.id)
  }, [builder])

  // ── Load asset into preview ──
  const handleSelectAsset = useCallback(async (asset: BuilderAsset) => {
    await builder.getAsset(asset.id)
    setEditingHtml(false)
  }, [builder])

  // ── Toggle section ──
  const toggleSection = useCallback((key: string) => {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }, [])

  // ── Format date ──
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  /* ──────────────────────────────────────────── */
  /*  Render                                      */
  /* ──────────────────────────────────────────── */

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        minHeight: 0,
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animation: 'builder-fade-in 0.3s ease',
      }}
    >
      {/* ═══ LEFT PANEL — Config ═══ */}
      <div
        style={{
          width: 320,
          minWidth: 320,
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 16px 12px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: colors.text }}>
            AI Builder
          </h2>
          <p style={{ fontSize: 12, color: colors.textSecondary, margin: '4px 0 0' }}>
            Generate marketing assets with AI
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* Asset Type Segmented Control */}
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Asset Type
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              marginBottom: 16,
            }}
          >
            {ASSET_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setAssetType(t)}
                style={{
                  padding: '8px 8px',
                  borderRadius: 8,
                  border: assetType === t
                    ? `1px solid ${ASSET_TYPE_COLORS[t]}`
                    : `1px solid ${colors.border}`,
                  backgroundColor: assetType === t
                    ? `${ASSET_TYPE_COLORS[t]}15`
                    : 'transparent',
                  color: assetType === t ? ASSET_TYPE_COLORS[t] : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (assetType !== t) {
                    e.currentTarget.style.borderColor = colors.borderHover
                    e.currentTarget.style.color = colors.text
                  }
                }}
                onMouseLeave={(e) => {
                  if (assetType !== t) {
                    e.currentTarget.style.borderColor = colors.border
                    e.currentTarget.style.color = colors.textSecondary
                  }
                }}
              >
                {ASSET_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Prompt */}
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build..."
            rows={6}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              backgroundColor: 'rgba(255,255,255,0.03)',
              color: colors.text,
              fontSize: 13,
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = colors.accent }}
            onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
          />

          {/* Brand Settings — Collapsible */}
          <button
            onClick={() => setBrandOpen(!brandOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              marginTop: 12,
              border: 'none',
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            <span>Brand Settings</span>
            <span style={{ fontSize: 14, transition: 'transform 0.2s', transform: brandOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▾
            </span>
          </button>

          {brandOpen && (
            <div style={{ paddingBottom: 12 }}>
              {/* Company Name */}
              <label style={{ fontSize: 11, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
                Company Name
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: colors.text,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 10,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = colors.accent }}
                onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
              />

              {/* Color Pickers */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                {[
                  { label: 'Primary', value: primaryColor, setter: setPrimaryColor },
                  { label: 'Secondary', value: secondaryColor, setter: setSecondaryColor },
                  { label: 'Accent', value: accentColor, setter: setAccentColor },
                ].map((c) => (
                  <div key={c.label} style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
                      {c.label}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => c.setter(e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          padding: 0,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                        }}
                      />
                      <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                        {c.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Style Selector */}
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginTop: 12, marginBottom: 8 }}>
            Style
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {STYLE_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: style === opt.key ? colors.accentDim : 'transparent',
                  border: style === opt.key
                    ? `1px solid ${colors.accentBorder}`
                    : `1px solid transparent`,
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="style"
                  checked={style === opt.key}
                  onChange={() => setStyle(opt.key)}
                  style={{ accentColor: colors.accent, margin: 0 }}
                />
                <span style={{ fontSize: 12, color: style === opt.key ? colors.accent : colors.textSecondary }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Landing Page Sections */}
          {assetType === 'landing_page' && (
            <>
              <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Sections
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {SECTION_OPTIONS.map((sec) => (
                  <label
                    key={sec.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      color: sections.includes(sec.key) ? colors.text : colors.textSecondary,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sections.includes(sec.key)}
                      onChange={() => toggleSection(sec.key)}
                      style={{ accentColor: colors.accent, margin: 0 }}
                    />
                    {sec.label}
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Form — CRM Webhook */}
          {assetType === 'form' && (
            <>
              <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                CRM Webhook URL
              </label>
              <input
                value={crmWebhook}
                onChange={(e) => setCrmWebhook(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: colors.text,
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  marginBottom: 16,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = colors.accent }}
                onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
              />
            </>
          )}

          {/* Product Page — Price + Checkout */}
          {assetType === 'product_page' && (
            <>
              <label style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Price ($)
              </label>
              <input
                value={checkoutPrice}
                onChange={(e) => setCheckoutPrice(e.target.value)}
                placeholder="49.99"
                type="number"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: colors.text,
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  marginBottom: 10,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = colors.accent }}
                onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: includeCheckout ? colors.text : colors.textSecondary,
                  marginBottom: 16,
                }}
              >
                <input
                  type="checkbox"
                  checked={includeCheckout}
                  onChange={() => setIncludeCheckout(!includeCheckout)}
                  style={{ accentColor: colors.accent, margin: 0 }}
                />
                Include Checkout
              </label>
            </>
          )}

          {/* Error */}
          {builder.error && (
            <div
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                backgroundColor: colors.redDim,
                border: `1px solid ${colors.red}33`,
                color: colors.red,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {builder.error}
              <button
                onClick={builder.clearError}
                style={{
                  float: 'right',
                  background: 'none',
                  border: 'none',
                  color: colors.red,
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                x
              </button>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={builder.generating || !prompt.trim()}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              background: builder.generating
                ? `linear-gradient(135deg, ${colors.accent}88, ${colors.accent}44)`
                : `linear-gradient(135deg, ${colors.accent}, #e85d2c)`,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: builder.generating || !prompt.trim() ? 'not-allowed' : 'pointer',
              opacity: !prompt.trim() && !builder.generating ? 0.5 : 1,
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {builder.generating && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)`,
                  animation: 'builder-shimmer 1.5s ease-in-out infinite',
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {builder.generating ? 'Generating...' : 'Generate'}
            </span>
            {!builder.generating && (
              <span
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  fontWeight: 500,
                }}
              >
                10 Runs
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ═══ CENTER PANEL — Preview ═══ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Device Toggle Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '8px 16px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: device === d
                  ? `1px solid ${colors.accentBorder}`
                  : `1px solid ${colors.border}`,
                backgroundColor: device === d ? colors.accentDim : 'transparent',
                color: device === d ? colors.accent : colors.textSecondary,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (device !== d) {
                  e.currentTarget.style.borderColor = colors.borderHover
                  e.currentTarget.style.color = colors.text
                }
              }}
              onMouseLeave={(e) => {
                if (device !== d) {
                  e.currentTarget.style.borderColor = colors.border
                  e.currentTarget.style.color = colors.textSecondary
                }
              }}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)} {DEVICE_WIDTHS[d]}
            </button>
          ))}

          {/* Right side: edit toggle */}
          {builder.currentAsset && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button
                onClick={() => {
                  if (editingHtml) {
                    handleSaveHtml()
                  } else {
                    setEditingHtml(true)
                  }
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `1px solid ${editingHtml ? colors.greenBorder : colors.border}`,
                  backgroundColor: editingHtml ? colors.greenDim : 'transparent',
                  color: editingHtml ? colors.green : colors.textSecondary,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {editingHtml ? 'Save HTML' : 'Edit HTML'}
              </button>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 20,
            overflow: 'auto',
            backgroundColor: '#080808',
          }}
        >
          {!builder.currentAsset && !builder.generating ? (
            /* Empty state */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 400,
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  backgroundColor: colors.accentDim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>
                Generate your first marketing asset
              </h3>
              <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, maxWidth: 360, textAlign: 'center', lineHeight: 1.5 }}>
                Choose an asset type, describe what you want, and let AI build it. Landing pages, emails, forms, and product pages.
              </p>
            </div>
          ) : builder.generating ? (
            /* Loading state */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 400,
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: `2px solid ${colors.accent}`,
                  borderTopColor: 'transparent',
                  animation: 'builder-spin 0.8s linear infinite',
                }}
              />
              <p style={{ fontSize: 14, color: colors.textSecondary, margin: 0 }}>
                Building your {ASSET_TYPE_LABELS[assetType].toLowerCase()}...
              </p>
            </div>
          ) : editingHtml ? (
            /* HTML Editor */
            <textarea
              value={editHtmlValue}
              onChange={(e) => setEditHtmlValue(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                minHeight: 500,
                padding: 16,
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                backgroundColor: '#0B0F19',
                color: '#c8d6e5',
                fontSize: 12,
                lineHeight: 1.6,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.green }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border }}
            />
          ) : (
            /* iframe preview */
            <div
              style={{
                width: DEVICE_WIDTHS[device],
                maxWidth: '100%',
                transition: 'width 0.3s ease',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: `1px solid ${colors.border}`,
                backgroundColor: '#fff',
              }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={builder.previewHtml || ''}
                title="Asset Preview"
                style={{
                  width: '100%',
                  height: 700,
                  border: 'none',
                  display: 'block',
                }}
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Actions + Asset List ═══ */}
      <div
        style={{
          width: 280,
          minWidth: 280,
          borderLeft: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Actions section */}
        {builder.currentAsset && (
          <div
            style={{
              padding: 16,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <h3 style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Export
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
              {EXPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleExport(opt.key)}
                  style={{
                    padding: '7px 8px',
                    borderRadius: 6,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: 'transparent',
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent
                    e.currentTarget.style.color = colors.accent
                    e.currentTarget.style.backgroundColor = colors.accentDim
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border
                    e.currentTarget.style.color = colors.textSecondary
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Copy HTML */}
            <button
              onClick={handleCopyHtml}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: `1px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderHover
                e.currentTarget.style.color = colors.text
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.color = colors.textSecondary
              }}
            >
              Copy HTML
            </button>

            {/* Sell on Marketplace */}
            <button
              onClick={() => {
                if (builder.currentAsset) {
                  builder.updateAsset(builder.currentAsset.id, { status: 'published' })
                }
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: `1px solid ${colors.greenBorder}`,
                backgroundColor: colors.greenDim,
                color: colors.green,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${colors.green}25`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.greenDim
              }}
            >
              Sell on Marketplace
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: `1px solid transparent`,
                backgroundColor: 'transparent',
                color: colors.textMuted,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.red
                e.currentTarget.style.backgroundColor = colors.redDim
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textMuted
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Delete Asset
            </button>
          </div>
        )}

        {/* My Assets List */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              My Assets
            </h3>
            <span style={{ fontSize: 11, color: colors.textMuted }}>
              {builder.assets.length}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {builder.loading && builder.assets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `2px solid ${colors.accent}`,
                    borderTopColor: 'transparent',
                    animation: 'builder-spin 0.8s linear infinite',
                    margin: '0 auto',
                  }}
                />
              </div>
            ) : builder.assets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
                  No assets yet. Generate your first one.
                </p>
              </div>
            ) : (
              builder.assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: builder.currentAsset?.id === asset.id
                      ? `1px solid ${colors.accentBorder}`
                      : `1px solid transparent`,
                    backgroundColor: builder.currentAsset?.id === asset.id
                      ? colors.accentDim
                      : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (builder.currentAsset?.id !== asset.id) {
                      e.currentTarget.style.backgroundColor = colors.cardHover
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (builder.currentAsset?.id !== asset.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: `${ASSET_TYPE_COLORS[asset.asset_type]}20`,
                        color: ASSET_TYPE_COLORS[asset.asset_type],
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ASSET_TYPE_LABELS[asset.asset_type]}
                    </span>
                    <span style={{ fontSize: 10, color: colors.textMuted, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {formatDate(asset.created_at)}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: builder.currentAsset?.id === asset.id ? colors.text : colors.textSecondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {asset.title}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══ CSS Animations ═══ */}
      <style>{`
        @keyframes builder-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes builder-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes builder-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
