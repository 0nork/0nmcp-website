'use client'

import { useState, useRef, useEffect } from 'react'

interface BuilderPromptProps {
  onSubmit: (prompt: string) => void
  loading?: boolean
  stepCount: number
}

export default function BuilderPrompt({ onSubmit, loading, stepCount }: BuilderPromptProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = '0'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [value])

  const placeholder = stepCount === 0
    ? 'Describe what your workflow should do...'
    : `Modify your ${stepCount}-step workflow...`

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
      background: focused
        ? 'rgba(126, 217, 87, 0.02)'
        : 'rgba(10, 10, 15, 0.4)',
      transition: 'background 200ms ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        background: 'var(--bg-card)',
        border: `1px solid ${focused ? 'rgba(126, 217, 87, 0.3)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: focused ? '0 0 20px rgba(126, 217, 87, 0.06)' : 'none',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}>
        {/* AI icon */}
        <span style={{
          fontSize: '16px',
          lineHeight: '24px',
          flexShrink: 0,
          opacity: focused || value ? 1 : 0.5,
          transition: 'opacity 200ms ease',
        }}>
          ✦
        </span>

        {/* Input */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: '24px',
            resize: 'none',
            fontFamily: 'inherit',
            minHeight: '24px',
            maxHeight: '120px',
          }}
        />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            border: 'none',
            background: value.trim()
              ? 'linear-gradient(135deg, #7ed957, #5cb83a)'
              : 'rgba(255, 255, 255, 0.06)',
            color: value.trim() ? '#0f1419' : 'var(--text-muted)',
            cursor: value.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 700,
            flexShrink: 0,
            transition: 'all 200ms ease',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? (
            <span style={{
              width: 14,
              height: 14,
              border: '2px solid rgba(10,10,15,0.3)',
              borderTopColor: '#0f1419',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }} />
          ) : (
            '→'
          )}
        </button>
      </div>

      {/* Hint text */}
      {focused && (
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '6px',
          paddingLeft: '4px',
          animation: 'builderSuggestIn 0.2s ease-out',
        }}>
          Press Enter to generate &middot; Shift+Enter for new line
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
