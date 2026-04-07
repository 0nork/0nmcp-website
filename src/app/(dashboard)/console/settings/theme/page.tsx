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

  // Load saved theme on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('0n_theme_' + mode)
      if (stored) setColors(JSON.parse(stored))
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

      {/* Color Groups */}
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

      {/* Preview Section */}
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
