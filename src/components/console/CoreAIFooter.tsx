'use client'

import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, ExternalLink, Check, ChevronUp } from 'lucide-react'
import { useVault } from '@/lib/console/VaultProvider'
import { SVC } from '@/lib/console/services'
import { getLogoSrc } from './logo-map'

const AI_PROVIDERS = [
  { key: 'anthropic', label: 'Claude', color: '#a78bfa' },
  { key: 'openai', label: 'GPT-4o', color: '#10a37f' },
  { key: 'gemini', label: 'Gemini', color: '#4285f4' },
  { key: 'groq', label: 'Groq', color: '#f55036' },
  { key: 'openrouter', label: 'OpenRouter', color: '#f97316' },
  { key: 'perplexity', label: 'Perplexity', color: '#22d3ee' },
]

interface CoreAIFooterProps {
  coreAI: string | null
  onSetCoreAI: (provider: string) => void
  onTutorialTrigger: () => void
}

export function CoreAIFooter({ coreAI, onSetCoreAI, onTutorialTrigger }: CoreAIFooterProps) {
  const vault = useVault()
  const [selected, setSelected] = useState<string | null>(null)
  const [keyValue, setKeyValue] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine state
  const hasActiveCore = coreAI && vault.isConnected(coreAI)

  // Auto-collapse after setting Core AI
  useEffect(() => {
    if (hasActiveCore && !justSaved) {
      const timer = setTimeout(() => setCollapsed(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [hasActiveCore, justSaved])

  // Focus input when provider selected
  useEffect(() => {
    if (selected) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [selected])

  const handleSave = async () => {
    if (!selected || !keyValue.trim()) return
    setSaving(true)

    vault.set(selected, 'api_key', keyValue.trim())
    onSetCoreAI(selected)

    // Persist to server
    try {
      await fetch('/api/console/core-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selected }),
      })
    } catch { /* continue — localStorage is primary */ }

    setSaving(false)
    setJustSaved(true)
    setKeyValue('')
    setSelected(null)

    // Show tutorial on first save
    if (!localStorage.getItem('0n_tutorial_seen')) {
      onTutorialTrigger()
    }

    // Reset justSaved after animation
    setTimeout(() => setJustSaved(false), 2000)
  }

  const getHelpLink = (provider: string) => {
    const svc = SVC[provider]
    if (!svc?.f?.[0]?.lk) return null
    return svc.f[0].lk
  }

  const getProviderDisplayName = (key: string) => {
    return AI_PROVIDERS.find(p => p.key === key)?.label || key
  }

  // ─── State C: Active (thin bar) ───
  if (hasActiveCore && !selected) {
    if (collapsed) {
      return (
        <div
          onClick={() => setCollapsed(false)}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            height: 4,
            background: 'linear-gradient(90deg, transparent, rgba(126,217,87,0.3), transparent)',
            cursor: 'pointer',
            transition: 'height 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.height = '8px' }}
          onMouseLeave={e => { e.currentTarget.style.height = '4px' }}
        />
      )
    }

    const activeProvider = AI_PROVIDERS.find(p => p.key === coreAI)
    const logo = coreAI ? getLogoSrc(coreAI) : null

    return (
      <div style={{
        flexShrink: 0,
        height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: 'linear-gradient(180deg, #0c0c14, #080810)',
        borderTop: '1px solid rgba(126,217,87,0.2)',
        boxShadow: '0 -4px 30px rgba(126,217,87,0.06), inset 0 1px 0 rgba(126,217,87,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {logo ? (
            <img src={logo} alt="" width={16} height={16} style={{ borderRadius: 3 }} />
          ) : (
            <div style={{ width: 16, height: 16, borderRadius: 3, background: activeProvider?.color || '#6EE05A' }} />
          )}
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Core AI: <strong style={{ color: 'var(--text-primary)' }}>{activeProvider?.label || coreAI}</strong>
          </span>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: '#6EE05A', boxShadow: '0 0 8px rgba(126,217,87,0.5)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { setSelected(null); setCollapsed(false) }}
            onMouseDown={() => setSelected(null)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6EE05A' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Change
          </button>
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', padding: 2,
            }}
          >
            <ChevronUp size={14} />
          </button>
        </div>
      </div>
    )
  }

  // ─── State A & B: Provider Selection / Key Input ───
  return (
    <div style={{
      flexShrink: 0,
      background: 'linear-gradient(180deg, #0c0c14, #080810)',
      borderTop: '1px solid rgba(126,217,87,0.2)',
      boxShadow: '0 -4px 30px rgba(126,217,87,0.06), inset 0 1px 0 rgba(126,217,87,0.12)',
      padding: '16px 20px',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Top row: label + provider logos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Power your console
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Select your Core AI to unlock everything
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {AI_PROVIDERS.map(p => {
              const logo = getLogoSrc(p.key)
              const isSelected = selected === p.key
              const isActive = coreAI === p.key && vault.isConnected(p.key)
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    if (isSelected) {
                      setSelected(null)
                      setKeyValue('')
                    } else {
                      setSelected(p.key)
                      setKeyValue('')
                      setShowKey(false)
                    }
                  }}
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? `${p.color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? `${p.color}50` : isActive ? 'rgba(126,217,87,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                    opacity: selected && !isSelected ? 0.3 : 1,
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  title={p.label}
                  onMouseEnter={e => {
                    if (!selected || isSelected) {
                      e.currentTarget.style.borderColor = `${p.color}60`
                      e.currentTarget.style.boxShadow = `0 0 16px ${p.color}20`
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isSelected ? `${p.color}50` : isActive ? 'rgba(126,217,87,0.3)' : 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {logo ? (
                    <img src={logo} alt={p.label} width={22} height={22} style={{ borderRadius: 4 }} />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.label.slice(0, 2)}</span>
                  )}
                  {isActive && !isSelected && (
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 10, height: 10, borderRadius: 5,
                      background: '#6EE05A', border: '2px solid #080810',
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Key Input (State B) */}
        {selected && (
          <div style={{
            marginTop: 14,
            display: 'flex', alignItems: 'center', gap: 10,
            animation: 'footerSlideIn 0.2s ease',
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type={showKey ? 'text' : 'password'}
                value={keyValue}
                onChange={e => setKeyValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                placeholder={`Add your ${getProviderDisplayName(selected)} API key here`}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 2,
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!keyValue.trim() || saving}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                background: keyValue.trim()
                  ? 'linear-gradient(135deg, #6EE05A, #4CAF3D)'
                  : 'rgba(255,255,255,0.04)',
                border: 'none',
                color: keyValue.trim() ? '#0B0F19' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 800,
                cursor: keyValue.trim() ? 'pointer' : 'default',
                fontFamily: 'inherit',
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '...' : justSaved ? <Check size={16} /> : 'TURN 0N'}
            </button>
          </div>
        )}

        {/* Help link */}
        {selected && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
            {getHelpLink(selected) && (
              <a
                href={getHelpLink(selected)!}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 11, color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#6EE05A' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                Where do I find this? <ExternalLink size={10} />
              </a>
            )}
            {coreAI && vault.isConnected(coreAI) && (
              <button
                onClick={() => { setSelected(null); setKeyValue('') }}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes footerSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
