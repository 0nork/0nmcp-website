'use client'

/**
 * /console/settings/theme — Theme Administration Portal
 *
 * Live color editor for the entire 0nMCP site.
 * Changes saved to localStorage + Supabase for persistence.
 * Preview updates in real-time as you adjust colors.
 */

import { useState, useEffect, useCallback } from 'react'

interface ThemeColors {
  // Backgrounds
  bgPrimary: string
  bgSecondary: string
  bgCard: string
  bgDeep: string
  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  // Brand
  accent: string
  accentAction: string
  accentDim: string
  // Accents
  colorCyan: string
  colorPurple: string
  colorAmber: string
  colorRed: string
  colorOrange: string
  // CTA
  ctaBg: string
  ctaText: string
  ctaHover: string
  // Border
  border: string
  borderHover: string
}

const DARK_DEFAULTS: ThemeColors = {
  bgPrimary: '#0d1117',
  bgSecondary: '#161b22',
  bgCard: '#1f2937',
  bgDeep: '#040A1A',
  textPrimary: '#f0f4f8',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  accent: '#7ed957',
  accentAction: '#2d8a1e',
  accentDim: '#5cb83a',
  colorCyan: '#14b8a6',
  colorPurple: '#8b5cf6',
  colorAmber: '#d97706',
  colorRed: '#b91c1c',
  colorOrange: '#FF6B35',
  ctaBg: '#FF6B35',
  ctaText: '#ffffff',
  ctaHover: '#e55a2b',
  border: '#30363d',
  borderHover: '#484f58',
}

const LIGHT_DEFAULTS: ThemeColors = {
  bgPrimary: '#f8f9fb',
  bgSecondary: '#ffffff',
  bgCard: '#ffffff',
  bgDeep: '#f1f2f7',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  accent: '#16a34a',
  accentAction: '#2d8a1e',
  accentDim: '#22c55e',
  colorCyan: '#0d9488',
  colorPurple: '#7c3aed',
  colorAmber: '#b45309',
  colorRed: '#991b1b',
  colorOrange: '#ea580c',
  ctaBg: '#2d8a1e',
  ctaText: '#ffffff',
  ctaHover: '#246d18',
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
}

// ── Theme Presets ──
interface ThemePreset {
  name: string
  description: string
  dark: ThemeColors
  light: ThemeColors
  logo?: string // SVG data URI or URL
  accentName: string
}

const PRESETS: ThemePreset[] = [
  {
    name: '0nMCP Default',
    description: 'The original — dark slate with lime green',
    accentName: 'Lime Green',
    dark: DARK_DEFAULTS,
    light: LIGHT_DEFAULTS,
  },
  {
    name: 'Spa Ligonier',
    description: 'Luxury spa — burgundy, gold, cream',
    accentName: 'Gold',
    dark: {
      ...DARK_DEFAULTS,
      bgPrimary: '#100305', bgSecondary: '#1c0508', bgCard: '#160406', bgDeep: '#0a0102',
      textPrimary: '#F4DCD0', textSecondary: '#c8a68a', textMuted: '#9a7262',
      accent: '#C8792D', accentAction: '#C8792D', accentDim: '#a86420',
      colorCyan: '#C8792D', colorPurple: '#8b5cf6', colorOrange: '#C8792D',
      ctaBg: '#C8792D', ctaText: '#ffffff', ctaHover: '#a86420',
      border: 'rgba(200,121,45,0.2)', borderHover: 'rgba(200,121,45,0.4)',
    },
    light: {
      ...LIGHT_DEFAULTS,
      bgPrimary: '#FAEEE8', bgSecondary: '#ffffff', bgCard: '#ffffff', bgDeep: '#F4DCD0',
      textPrimary: '#272727', textSecondary: '#5a4a42', textMuted: '#9a7262',
      accent: '#570301', accentAction: '#570301', accentDim: '#8B1A10',
      ctaBg: '#C8792D', ctaText: '#ffffff', ctaHover: '#a86420',
      border: '#e8d5c8', borderHover: '#d4b8a4',
    },
  },
  {
    name: 'Midnight Blue',
    description: 'Deep ocean — navy with electric blue',
    accentName: 'Electric Blue',
    dark: {
      ...DARK_DEFAULTS,
      bgPrimary: '#0a0e1a', bgSecondary: '#111827', bgCard: '#1e293b', bgDeep: '#060a14',
      accent: '#3b82f6', accentAction: '#2563eb', accentDim: '#1d4ed8',
      colorCyan: '#06b6d4', colorPurple: '#8b5cf6',
      ctaBg: '#3b82f6', ctaHover: '#2563eb',
      border: '#1e293b', borderHover: '#334155',
    },
    light: {
      ...LIGHT_DEFAULTS,
      accent: '#2563eb', accentAction: '#1d4ed8', accentDim: '#3b82f6',
      ctaBg: '#2563eb', ctaHover: '#1d4ed8',
    },
  },
  {
    name: 'Ember',
    description: 'Warm fire — charcoal with orange glow',
    accentName: 'Fire Orange',
    dark: {
      ...DARK_DEFAULTS,
      bgPrimary: '#1a1210', bgSecondary: '#231a16', bgCard: '#2d211c', bgDeep: '#0f0a08',
      accent: '#f97316', accentAction: '#ea580c', accentDim: '#c2410c',
      colorCyan: '#14b8a6', colorAmber: '#f59e0b',
      ctaBg: '#f97316', ctaHover: '#ea580c',
      border: '#3d2e26', borderHover: '#5a4438',
    },
    light: {
      ...LIGHT_DEFAULTS,
      accent: '#ea580c', accentAction: '#c2410c', accentDim: '#f97316',
      ctaBg: '#ea580c', ctaHover: '#c2410c',
    },
  },
  {
    name: 'Arctic',
    description: 'Clean and clinical — white with teal',
    accentName: 'Teal',
    dark: {
      ...DARK_DEFAULTS,
      bgPrimary: '#0f1419', bgSecondary: '#151d26', bgCard: '#1c2733', bgDeep: '#080d12',
      accent: '#14b8a6', accentAction: '#0d9488', accentDim: '#0f766e',
      ctaBg: '#14b8a6', ctaHover: '#0d9488',
      border: '#1c2733', borderHover: '#2a3a4a',
    },
    light: {
      ...LIGHT_DEFAULTS,
      accent: '#0d9488', accentAction: '#0f766e', accentDim: '#14b8a6',
      ctaBg: '#0d9488', ctaHover: '#0f766e',
    },
  },
  {
    name: 'Royal Purple',
    description: 'Regal — deep violet with purple accents',
    accentName: 'Violet',
    dark: {
      ...DARK_DEFAULTS,
      bgPrimary: '#0f0a1a', bgSecondary: '#1a1229', bgCard: '#251c38', bgDeep: '#080514',
      accent: '#a78bfa', accentAction: '#8b5cf6', accentDim: '#7c3aed',
      colorCyan: '#06b6d4', colorPurple: '#c084fc',
      ctaBg: '#8b5cf6', ctaHover: '#7c3aed',
      border: '#2d2044', borderHover: '#3f2e5c',
    },
    light: {
      ...LIGHT_DEFAULTS,
      accent: '#7c3aed', accentAction: '#6d28d9', accentDim: '#8b5cf6',
      ctaBg: '#7c3aed', ctaHover: '#6d28d9',
    },
  },
]

const TOKEN_MAP: Record<keyof ThemeColors, string> = {
  bgPrimary: '--bg-primary',
  bgSecondary: '--bg-secondary',
  bgCard: '--bg-card',
  bgDeep: '--bg-deep',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textMuted: '--text-muted',
  accent: '--accent',
  accentAction: '--accent-action',
  accentDim: '--accent-dim',
  colorCyan: '--color-cyan',
  colorPurple: '--color-purple',
  colorAmber: '--color-amber',
  colorRed: '--color-red',
  colorOrange: '--color-orange',
  ctaBg: '--cta-bg',
  ctaText: '--cta-text',
  ctaHover: '--cta-hover',
  border: '--border',
  borderHover: '--border-hover',
}

const GROUPS: { label: string; keys: (keyof ThemeColors)[] }[] = [
  { label: 'Backgrounds', keys: ['bgPrimary', 'bgSecondary', 'bgCard', 'bgDeep'] },
  { label: 'Text', keys: ['textPrimary', 'textSecondary', 'textMuted'] },
  { label: 'Brand Green', keys: ['accent', 'accentAction', 'accentDim'] },
  { label: 'Accent Colors', keys: ['colorCyan', 'colorPurple', 'colorAmber', 'colorRed', 'colorOrange'] },
  { label: 'CTA Buttons', keys: ['ctaBg', 'ctaText', 'ctaHover'] },
  { label: 'Borders', keys: ['border', 'borderHover'] },
]

const LABELS: Record<keyof ThemeColors, string> = {
  bgPrimary: 'Site Background',
  bgSecondary: 'Sidebar / Elevated',
  bgCard: 'Card / Panel',
  bgDeep: 'Deep / Hero',
  textPrimary: 'Primary Text',
  textSecondary: 'Secondary Text',
  textMuted: 'Muted Text',
  accent: 'Brand Green',
  accentAction: 'Action Green (CTA)',
  accentDim: 'Dim Green',
  colorCyan: 'Cyan (Integration)',
  colorPurple: 'Purple (AI/Data)',
  colorAmber: 'Amber (Warning)',
  colorRed: 'Red (Error)',
  colorOrange: 'Orange (Action)',
  ctaBg: 'CTA Background',
  ctaText: 'CTA Text',
  ctaHover: 'CTA Hover',
  border: 'Border',
  borderHover: 'Border Hover',
}

function applyTheme(colors: ThemeColors) {
  const root = document.documentElement
  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    root.style.setProperty(cssVar, colors[key as keyof ThemeColors])
  }
}

function ColorInput({ label, value, cssVar, onChange }: { label: string; value: string; cssVar: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>{cssVar}</div>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: 90, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'var(--bg-primary)', color: 'var(--text-primary)',
          fontSize: '0.6875rem', fontFamily: 'var(--font-mono, monospace)',
          outline: 'none', textAlign: 'center',
        }}
      />
      <div style={{
        width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
        background: value,
      }} />
    </div>
  )
}

export default function ThemeAdminPage() {
  const [mode, setMode] = useState<'dark' | 'light'>('dark')
  const [colors, setColors] = useState<ThemeColors>(DARK_DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [activePreset, setActivePreset] = useState<string>('0nMCP Default')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [tab, setTab] = useState<'presets' | 'colors' | 'logo'>('presets')

  // Load saved theme + logo on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('0n_theme_' + mode)
      if (stored) setColors(JSON.parse(stored))
      const savedLogo = localStorage.getItem('0n_custom_logo')
      if (savedLogo) setLogoUrl(savedLogo)
    } catch { /* use defaults */ }
  }, [mode])

  // Apply colors live
  useEffect(() => {
    applyTheme(colors)
  }, [colors])

  const updateColor = useCallback((key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(async () => {
    localStorage.setItem('0n_theme_' + mode, JSON.stringify(colors))
    try {
      await fetch('/api/console/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, colors }),
      })
    } catch { /* ignore */ }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [mode, colors])

  const handleReset = useCallback(() => {
    const defaults = mode === 'dark' ? DARK_DEFAULTS : LIGHT_DEFAULTS
    setColors(defaults)
    applyTheme(defaults)
    localStorage.removeItem('0n_theme_' + mode)
    setSaved(false)
  }, [mode])

  const applyPreset = useCallback((preset: ThemePreset) => {
    const c = mode === 'dark' ? preset.dark : preset.light
    setColors(c)
    applyTheme(c)
    setActivePreset(preset.name)
    setSaved(false)
  }, [mode])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setLogoUrl(url)
      localStorage.setItem('0n_custom_logo', url)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSwitchMode = useCallback((m: 'dark' | 'light') => {
    setMode(m)
    try {
      const stored = localStorage.getItem('0n_theme_' + m)
      const c = stored ? JSON.parse(stored) : (m === 'dark' ? DARK_DEFAULTS : LIGHT_DEFAULTS)
      setColors(c)
      applyTheme(c)
    } catch {
      const c = m === 'dark' ? DARK_DEFAULTS : LIGHT_DEFAULTS
      setColors(c)
      applyTheme(c)
    }
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>Theme Administration</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>Live color editor — changes preview instantly</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(['dark', 'light'] as const).map(m => (
              <button key={m} onClick={() => handleSwitchMode(m)} style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                background: mode === m ? 'var(--accent-glow, rgba(126,217,87,0.12))' : 'transparent',
                color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'inherit',
              }}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={handleReset} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
          }}>
            Reset
          </button>
          <button onClick={handleSave} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: saved ? 'var(--accent)' : 'var(--cta-bg, #FF6B35)',
            color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>
            {saved ? 'Saved' : 'Save Theme'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {(['presets', 'colors', 'logo'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', fontFamily: 'inherit',
            background: tab === t ? 'var(--accent-glow, rgba(126,217,87,0.12))' : 'transparent',
            color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {t === 'presets' ? 'Theme Presets' : t === 'colors' ? 'Custom Colors' : 'Logo & Branding'}
          </button>
        ))}
      </div>

      {/* ── Presets Tab ── */}
      {tab === 'presets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, marginBottom: 24 }}>
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              style={{
                padding: '16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                background: activePreset === preset.name ? 'var(--accent-glow, rgba(126,217,87,0.08))' : 'var(--bg-card)',
                border: `1.5px solid ${activePreset === preset.name ? (mode === 'dark' ? preset.dark.accent : preset.light.accent) : 'var(--border)'}`,
                fontFamily: 'inherit', width: '100%', transition: 'all 0.2s',
              }}
            >
              {/* Color preview strip */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[
                  mode === 'dark' ? preset.dark.bgPrimary : preset.light.bgPrimary,
                  mode === 'dark' ? preset.dark.bgCard : preset.light.bgCard,
                  mode === 'dark' ? preset.dark.accent : preset.light.accent,
                  mode === 'dark' ? preset.dark.ctaBg : preset.light.ctaBg,
                  mode === 'dark' ? preset.dark.colorPurple : preset.light.colorPurple,
                ].map((c, i) => (
                  <div key={i} style={{ flex: 1, height: 28, borderRadius: 6, background: c, border: '1px solid rgba(255,255,255,0.08)' }} />
                ))}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {preset.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                {preset.description}
              </div>
              <div style={{
                display: 'inline-flex', padding: '2px 8px', borderRadius: 4,
                fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                background: `${mode === 'dark' ? preset.dark.accent : preset.light.accent}15`,
                color: mode === 'dark' ? preset.dark.accent : preset.light.accent,
              }}>
                {preset.accentName}
              </div>
              {activePreset === preset.name && (
                <div style={{ marginTop: 8, fontSize: '0.625rem', fontWeight: 600, color: 'var(--accent)' }}>
                  Active
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Logo Tab ── */}
      {tab === 'logo' && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Current Logo */}
            <div style={{ padding: '1.25rem', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
                Current Logo
              </div>
              <div style={{
                width: '100%', height: 120, borderRadius: 10,
                background: colors.bgPrimary, border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ maxHeight: 80, maxWidth: '80%', objectFit: 'contain' }} />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.colorCyan})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#000', fontFamily: 'var(--font-mono)' }}>0n</span>
                  </div>
                )}
              </div>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 8, border: '1px dashed var(--border)',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--text-secondary)', transition: 'all 0.15s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload Logo (PNG, SVG, WebP)
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Logo Variants */}
            <div style={{ padding: '1.25rem', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
                Logo on Backgrounds
              </div>
              {/* Dark bg preview */}
              <div style={{
                width: '100%', height: 50, borderRadius: 8, marginBottom: 8,
                background: colors.bgDeep, border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="" style={{ maxHeight: 32, objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: colors.accent, fontFamily: 'var(--font-mono)' }}>0nMCP</span>
                )}
              </div>
              {/* Light bg preview */}
              <div style={{
                width: '100%', height: 50, borderRadius: 8, marginBottom: 8,
                background: '#ffffff', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="" style={{ maxHeight: 32, objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1f2937', fontFamily: 'var(--font-mono)' }}>0nMCP</span>
                )}
              </div>
              {/* Accent bg preview */}
              <div style={{
                width: '100%', height: 50, borderRadius: 8,
                background: colors.accent, border: '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="" style={{ maxHeight: 32, objectFit: 'contain', filter: 'brightness(0)' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', fontFamily: 'var(--font-mono)' }}>0nMCP</span>
                )}
              </div>

              {/* Logo URL input */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Or paste logo URL</div>
                <input
                  type="text" value={logoUrl} onChange={e => { setLogoUrl(e.target.value); localStorage.setItem('0n_custom_logo', e.target.value) }}
                  placeholder="https://..."
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Colors Tab ── */}
      {tab === 'colors' && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {GROUPS.map(group => (
          <div key={group.label} style={{
            padding: '1rem', borderRadius: 12,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
              {group.label}
            </div>
            {group.keys.map(key => (
              <ColorInput
                key={key}
                label={LABELS[key]}
                value={colors[key]}
                cssVar={TOKEN_MAP[key]}
                onChange={v => updateColor(key, v)}
              />
            ))}
          </div>
        ))}
      </div>
      )}

      {/* Preview Section — always visible */}
      <div style={{ marginTop: 24, padding: '1.25rem', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
          Live Preview
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: colors.ctaBg, color: colors.ctaText, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
            Primary CTA
          </button>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: colors.accent, color: '#000', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
            Brand Green
          </button>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textPrimary, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
            Outline
          </button>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: colors.colorPurple, color: '#fff', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
            AI Purple
          </button>
          <button style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: colors.colorCyan, color: '#fff', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
            Integration Cyan
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <div style={{ flex: 1, padding: 16, borderRadius: 10, background: colors.bgDeep, border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.textPrimary }}>Card on Deep</div>
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: 4 }}>Secondary text on deep background</div>
            <div style={{ fontSize: '0.6875rem', color: colors.textMuted, marginTop: 4 }}>Muted text — should still be readable</div>
          </div>
          <div style={{ flex: 1, padding: 16, borderRadius: 10, background: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.textPrimary }}>Standard Card</div>
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: 4 }}>Description text on card</div>
            <div style={{ fontSize: '0.6875rem', color: colors.accent, marginTop: 4, fontFamily: 'monospace' }}>accent highlight</div>
          </div>
        </div>
      </div>
    </div>
  )
}
