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
    <div className="flex h-full min-h-0 bg-[#0B0F19] text-[#e5e5e5] animate-[builder-fade-in_0.3s_ease]">
      {/* ═══ LEFT PANEL — Config ═══ */}
      <div className="w-80 min-w-80 border-r border-[#222222] flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-[#222222]">
          <h2 className="text-base font-bold m-0 text-[#e5e5e5]">
            AI Builder
          </h2>
          <p className="text-xs text-[#999999] mt-1 mb-0">
            Generate marketing assets with AI
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Asset Type Segmented Control */}
          <label className="text-[11px] font-semibold text-[#999999] uppercase tracking-[0.05em] block mb-2">
            Asset Type
          </label>
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {ASSET_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setAssetType(t)}
                className={[
                  'py-2 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 outline-none',
                  assetType === t
                    ? 'border'
                    : 'border border-[#222222] text-[#999999] hover:border-[#2D3748] hover:text-[#e5e5e5]',
                ].join(' ')}
                style={assetType === t ? {
                  border: `1px solid ${ASSET_TYPE_COLORS[t]}`,
                  backgroundColor: `${ASSET_TYPE_COLORS[t]}15`,
                  color: ASSET_TYPE_COLORS[t],
                } : undefined}
              >
                {ASSET_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Prompt */}
          <label className="text-[11px] font-semibold text-[#999999] uppercase tracking-[0.05em] block mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build..."
            rows={6}
            className="w-full p-3 rounded-lg border border-[#222222] bg-card text-[#e5e5e5] text-[13px] leading-relaxed resize-y outline-none font-[inherit] box-border focus:border-[#ff6b35] transition-colors duration-150"
          />

          {/* Brand Settings — Collapsible */}
          <button
            onClick={() => setBrandOpen(!brandOpen)}
            className="w-full flex items-center justify-between py-2.5 mt-3 border-none bg-transparent text-[#999999] text-[11px] font-semibold uppercase tracking-[0.05em] cursor-pointer"
          >
            <span>Brand Settings</span>
            <span
              className="text-sm transition-transform duration-200"
              style={{ transform: brandOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▾
            </span>
          </button>

          {brandOpen && (
            <div className="pb-3">
              {/* Company Name */}
              <label className="text-[11px] text-[#4A5568] block mb-1">
                Company Name
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company"
                className="w-full py-2 px-2.5 rounded-md border border-[#222222] bg-card text-[#e5e5e5] text-[13px] outline-none box-border mb-2.5 focus:border-[#ff6b35] transition-colors duration-150"
              />

              {/* Color Pickers */}
              <div className="flex gap-2.5 mb-2.5">
                {[
                  { label: 'Primary', value: primaryColor, setter: setPrimaryColor },
                  { label: 'Secondary', value: secondaryColor, setter: setSecondaryColor },
                  { label: 'Accent', value: accentColor, setter: setAccentColor },
                ].map((c) => (
                  <div key={c.label} className="flex-1">
                    <label className="text-[10px] text-[#4A5568] block mb-1">
                      {c.label}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => c.setter(e.target.value)}
                        className="w-7 h-7 p-0 border border-[#222222] rounded-md cursor-pointer bg-transparent"
                      />
                      <span className="text-[10px] text-[#4A5568] font-mono">
                        {c.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Style Selector */}
          <label className="text-[11px] font-semibold text-[#999999] uppercase tracking-[0.05em] block mt-3 mb-2">
            Style
          </label>
          <div className="flex flex-col gap-1 mb-4">
            {STYLE_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={[
                  'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-150',
                  style === opt.key
                    ? 'bg-[rgba(255,107,53,0.15)] border border-[rgba(255,107,53,0.3)]'
                    : 'border border-transparent',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="style"
                  checked={style === opt.key}
                  onChange={() => setStyle(opt.key)}
                  className="m-0 accent-[#ff6b35]"
                />
                <span className={`text-xs ${style === opt.key ? 'text-[#ff6b35]' : 'text-[#999999]'}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Landing Page Sections */}
          {assetType === 'landing_page' && (
            <>
              <label className="text-[11px] font-semibold text-[#999999] uppercase tracking-[0.05em] block mb-2">
                Sections
              </label>
              <div className="flex flex-col gap-1 mb-4">
                {SECTION_OPTIONS.map((sec) => (
                  <label
                    key={sec.key}
                    className={[
                      'flex items-center gap-2 py-[5px] px-2 rounded-md cursor-pointer text-xs',
                      sections.includes(sec.key) ? 'text-[#e5e5e5]' : 'text-[#999999]',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={sections.includes(sec.key)}
                      onChange={() => toggleSection(sec.key)}
                      className="m-0 accent-[#ff6b35]"
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
              <label className="text-[11px] font-semibold text-[#999999] uppercase tracking-[0.05em] block mb-2">
                CRM Webhook URL
              </label>
              <input
                value={crmWebhook}
                onChange={(e) => setCrmWebhook(e.target.value)}
                placeholder="https://..."
                className="w-full py-2 px-2.5 rounded-md border border-[#222222] bg-card text-[#e5e5e5] text-xs outline-none box-border font-mono mb-4 focus:border-[#ff6b35] transition-colors duration-150"
              />
            </>
          )}

          {/* Product Page — Price + Checkout */}
          {assetType === 'product_page' && (
            <>
              <label className="text-[11px] font-semibold text-[#999999] uppercase tracking-[0.05em] block mb-2">
                Price ($)
              </label>
              <input
                value={checkoutPrice}
                onChange={(e) => setCheckoutPrice(e.target.value)}
                placeholder="49.99"
                type="number"
                min="0"
                step="0.01"
                className="w-full py-2 px-2.5 rounded-md border border-[#222222] bg-card text-[#e5e5e5] text-xs outline-none box-border font-mono mb-2.5 focus:border-[#ff6b35] transition-colors duration-150"
              />
              <label
                className={[
                  'flex items-center gap-2 py-[5px] px-2 rounded-md cursor-pointer text-xs mb-4',
                  includeCheckout ? 'text-[#e5e5e5]' : 'text-[#999999]',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={includeCheckout}
                  onChange={() => setIncludeCheckout(!includeCheckout)}
                  className="m-0 accent-[#ff6b35]"
                />
                Include Checkout
              </label>
            </>
          )}

          {/* Error */}
          {builder.error && (
            <div className="py-2 px-2.5 rounded-md bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-xs mb-3">
              {builder.error}
              <button
                onClick={builder.clearError}
                className="float-right bg-none border-none text-[#ef4444] cursor-pointer text-sm leading-none p-0"
              >
                x
              </button>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={builder.generating || !prompt.trim()}
            className={[
              'w-full py-3 px-4 rounded-xl border-none text-sm font-bold transition-all duration-200 relative overflow-hidden flex items-center justify-center gap-2',
              builder.generating || !prompt.trim() ? 'cursor-not-allowed' : 'cursor-pointer',
              !prompt.trim() && !builder.generating ? 'opacity-50' : 'opacity-100',
            ].join(' ')}
            style={{
              background: builder.generating
                ? 'linear-gradient(135deg, rgba(255,107,53,0.53), rgba(255,107,53,0.27))'
                : 'linear-gradient(135deg, #ff6b35, #e85d2c)',
              color: 'var(--text-primary)',
            }}
          >
            {builder.generating && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[builder-shimmer_1.5s_ease-in-out_infinite]" />
            )}
            <span className="relative z-10">
              {builder.generating ? 'Generating...' : 'Generate'}
            </span>
            {!builder.generating && (
              <span className="relative z-10 text-[10px] py-0.5 px-1.5 rounded bg-black/25 font-medium">
                10 Runs
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ═══ CENTER PANEL — Preview ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Device Toggle Bar */}
        <div className="flex items-center gap-1 py-2 px-4 border-b border-[#222222]">
          {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={[
                'py-1.5 px-3.5 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 outline-none',
                device === d
                  ? 'border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.15)] text-[#ff6b35]'
                  : 'border border-[#222222] text-[#999999] hover:border-[#2D3748] hover:text-[#e5e5e5]',
              ].join(' ')}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)} {DEVICE_WIDTHS[d]}
            </button>
          ))}

          {/* Right side: edit toggle */}
          {builder.currentAsset && (
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={() => {
                  if (editingHtml) {
                    handleSaveHtml()
                  } else {
                    setEditingHtml(true)
                  }
                }}
                className={[
                  'py-1.5 px-3 rounded-md text-[11px] font-medium cursor-pointer outline-none transition-all duration-150',
                  editingHtml
                    ? 'border border-[rgba(110,224,90,0.3)] bg-[rgba(110,224,90,0.15)] text-[#6EE05A]'
                    : 'border border-[#222222] text-[#999999]',
                ].join(' ')}
              >
                {editingHtml ? 'Save HTML' : 'Edit HTML'}
              </button>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex justify-center items-start p-5 overflow-auto bg-[var(--bg-primary)]">
          {!builder.currentAsset && !builder.generating ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[rgba(255,107,53,0.15)] flex items-center justify-center text-4xl">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#e5e5e5] m-0">
                Generate your first marketing asset
              </h3>
              <p className="text-[13px] text-[#999999] m-0 max-w-[360px] text-center leading-relaxed">
                Choose an asset type, describe what you want, and let AI build it. Landing pages, emails, forms, and product pages.
              </p>
            </div>
          ) : builder.generating ? (
            /* Loading state */
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
              <div className="w-12 h-12 rounded-xl border-2 border-[#ff6b35] border-t-transparent animate-spin" />
              <p className="text-sm text-[#999999] m-0">
                Building your {ASSET_TYPE_LABELS[assetType].toLowerCase()}...
              </p>
            </div>
          ) : editingHtml ? (
            /* HTML Editor */
            <textarea
              value={editHtmlValue}
              onChange={(e) => setEditHtmlValue(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 rounded-xl border border-[#222222] bg-[var(--bg-primary)] text-[#c8d6e5] text-xs leading-relaxed font-[JetBrains_Mono,Fira_Code,monospace] resize-none outline-none box-border focus:border-[#6EE05A] transition-colors duration-150"
            />
          ) : (
            /* iframe preview */
            <div
              className="max-w-full rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[#222222] bg-card transition-[width] duration-300"
              style={{ width: DEVICE_WIDTHS[device] }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={builder.previewHtml || ''}
                title="Asset Preview"
                className="w-full h-[700px] border-none block"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Actions + Asset List ═══ */}
      <div className="w-[280px] min-w-[280px] border-l border-[#222222] flex flex-col overflow-hidden">
        {/* Actions section */}
        {builder.currentAsset && (
          <div className="p-4 border-b border-[#222222]">
            <h3 className="text-xs font-semibold text-[#999999] m-0 mb-3 uppercase tracking-[0.05em]">
              Export
            </h3>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {EXPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleExport(opt.key)}
                  className="py-[7px] px-2 rounded-md border border-[#222222] bg-transparent text-[#999999] text-[11px] font-medium cursor-pointer transition-all duration-150 outline-none hover:border-[#ff6b35] hover:text-[#ff6b35] hover:bg-[rgba(255,107,53,0.15)]"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Copy HTML */}
            <button
              onClick={handleCopyHtml}
              className="w-full py-2 px-3 rounded-md border border-[#222222] bg-transparent text-[#999999] text-xs font-medium cursor-pointer transition-all duration-150 outline-none mb-2 hover:border-[#2D3748] hover:text-[#e5e5e5]"
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
              className="w-full py-2 px-3 rounded-md border border-[rgba(110,224,90,0.3)] bg-[rgba(110,224,90,0.15)] text-[#6EE05A] text-xs font-semibold cursor-pointer transition-all duration-150 outline-none mb-2 hover:bg-[rgba(110,224,90,0.22)]"
            >
              Sell on Marketplace
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="py-1.5 px-2.5 rounded-md border border-transparent bg-transparent text-[#4A5568] text-[11px] cursor-pointer transition-all duration-150 outline-none hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.15)]"
            >
              Delete Asset
            </button>
          </div>
        )}

        {/* My Assets List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="py-3 px-4 border-b border-[#222222] flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#999999] m-0 uppercase tracking-[0.05em]">
              My Assets
            </h3>
            <span className="text-[11px] text-[#4A5568]">
              {builder.assets.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {builder.loading && builder.assets.length === 0 ? (
              <div className="text-center p-8">
                <div className="w-6 h-6 rounded-md border-2 border-[#ff6b35] border-t-transparent animate-spin mx-auto" />
              </div>
            ) : builder.assets.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-xs text-[#4A5568] m-0">
                  No assets yet. Generate your first one.
                </p>
              </div>
            ) : (
              builder.assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  className={[
                    'w-full flex flex-col gap-1 py-2.5 px-3 rounded-lg cursor-pointer text-left outline-none transition-all duration-150 mb-0.5',
                    builder.currentAsset?.id === asset.id
                      ? 'border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.15)]'
                      : 'border border-transparent hover:bg-[#111827]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-bold py-0.5 px-1.5 rounded uppercase tracking-[0.03em] whitespace-nowrap"
                      style={{
                        backgroundColor: `${ASSET_TYPE_COLORS[asset.asset_type]}20`,
                        color: ASSET_TYPE_COLORS[asset.asset_type],
                      }}
                    >
                      {ASSET_TYPE_LABELS[asset.asset_type]}
                    </span>
                    <span className="text-[10px] text-[#4A5568] ml-auto whitespace-nowrap">
                      {formatDate(asset.created_at)}
                    </span>
                  </div>
                  <span
                    className={[
                      'text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap',
                      builder.currentAsset?.id === asset.id ? 'text-[#e5e5e5]' : 'text-[#999999]',
                    ].join(' ')}
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
        @keyframes builder-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
