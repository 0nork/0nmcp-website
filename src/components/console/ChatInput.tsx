'use client'

import { useState, useRef, useCallback } from 'react'
import { SendHorizontal } from 'lucide-react'
import { StatusDot } from './StatusDot'

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
    if (inputRef.current) {
      inputRef.current.style.height = '48px'
    }
  }, [value, loading, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setValue(v)
    if (v === '/') {
      onSlash()
    }
    // Auto-resize
    if (inputRef.current) {
      inputRef.current.style.height = '48px'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div
      className="shrink-0 px-4 md:px-8 lg:px-12 pb-4 pt-2"
      style={{
        backgroundColor: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={
              mcpOnline
                ? 'Ask 0n anything... or type / for commands'
                : 'Ask anything or type / for commands...'
            }
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
            style={{
              height: '48px',
              maxHeight: '120px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={handleSend}
            disabled={loading || !value.trim()}
            className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center transition-all cursor-pointer self-end"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: 'var(--bg-primary)',
              border: 'none',
              opacity: loading || !value.trim() ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
        <div
          className="flex items-center justify-center gap-2 text-xs mt-2 tracking-widest uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          <StatusDot status={mcpOnline ? 'online' : 'offline'} size="sm" />
          {mcpOnline ? (
            <span>
              <span style={{ color: 'var(--accent)' }}>0nMCP Live</span>
              {' \u00b7 '}564 Tools{' \u00b7 '}26 Services
            </span>
          ) : (
            <span>0n Console{' \u00b7 '}Type / for commands</span>
          )}
        </div>
      </div>
    </div>
  )
}
