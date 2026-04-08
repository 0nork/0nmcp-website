'use client'

import { useState, useRef, useCallback } from 'react'
import { STATS_DISPLAY } from '@/data/stats'

interface ChatInputProps {
  onSend: (text: string) => void
  onSlash: () => void
  loading: boolean
  mcpOnline: boolean
}

export function ChatInput({ onSend, onSlash, loading, mcpOnline }: ChatInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setValue('')
    if (inputRef.current) inputRef.current.style.height = '48px'
  }, [value, loading, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setValue(v)
    if (v === '/') onSlash()
    if (inputRef.current) {
      inputRef.current.style.height = '48px'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div style={{
      flexShrink: 0, padding: 'clamp(6px, 1vw, 12px) clamp(10px, 2vw, 20px) clamp(10px, 1.5vw, 16px)',
      background: 'var(--bg-deep, #040A1A)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border, #1e1e2e)',
    }}>
      <div style={{ maxWidth: 'min(760px, 100%)', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={mcpOnline ? 'Ask Jaxx anything... or type / for commands' : 'Ask anything or type / for commands...'}
            rows={1}
            style={{
              flex: 1, padding: '12px 16px', height: 48, maxHeight: 120,
              borderRadius: 12, fontSize: '0.8125rem', resize: 'none',
              fontFamily: 'var(--font-body, sans-serif)',
              background: 'var(--bg-primary, #0a0a0a)',
              border: '1px solid var(--border, #1e1e2e)',
              color: 'var(--text-primary, #f0f4f8)',
              outline: 'none', opacity: loading ? 0.6 : 1,
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent, #7ed957)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border, #1e1e2e)' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !value.trim()}
            style={{
              width: 48, height: 48, borderRadius: 12, border: 'none', cursor: 'pointer',
              flexShrink: 0, alignSelf: 'flex-end',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: value.trim() && !loading
                ? 'linear-gradient(135deg, var(--accent, #7ed957), var(--color-teal, #00C2C7))'
                : 'var(--bg-secondary, #1e1e2e)',
              color: value.trim() && !loading ? '#000' : 'var(--text-muted, #6b7280)',
              transition: 'all 0.15s ease',
              boxShadow: value.trim() && !loading ? '0 0 20px var(--accent-glow, rgba(126,217,87,0.2))' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 8, fontSize: '0.625rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-muted, #6b7280)',
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: mcpOnline ? 'var(--accent, #7ed957)' : 'var(--text-muted, #6b7280)',
            boxShadow: mcpOnline ? '0 0 6px var(--accent-glow, rgba(126,217,87,0.4))' : 'none',
          }} />
          {mcpOnline ? (
            <span>
              <span style={{ color: 'var(--accent, #7ed957)' }}>0nMCP Live</span>
              {' \u00b7 '}{STATS_DISPLAY.tools} Tools{' \u00b7 '}{STATS_DISPLAY.services} Services
            </span>
          ) : (
            <span>0n Console{' \u00b7 '}Type / for commands</span>
          )}
        </div>
      </div>
    </div>
  )
}
