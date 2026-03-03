'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, SendHorizontal, Loader2, Sparkles, User } from 'lucide-react'
import type { FocusArea } from './OnCallIcon'

export interface OnCallMessage {
  role: 'user' | 'assistant'
  text: string
  source?: string
  timestamp?: string
}

interface OnCallChatProps {
  messages: OnCallMessage[]
  loading: boolean
  onSend: (text: string) => void
  onClose: () => void
  focus: FocusArea
}

const PROVIDER_BADGES: Record<string, { label: string; color: string; abbr: string }> = {
  '0nmcp':       { label: '0nMCP',         color: '#7ed957', abbr: '0n' },
  'claude-byok': { label: 'Claude (BYOK)', color: '#a78bfa', abbr: 'Cl' },
  'claude':      { label: 'Claude',        color: '#00d4ff', abbr: 'Cl' },
  'openai-byok': { label: 'GPT-4o (BYOK)', color: '#10a37f', abbr: 'GP' },
  'gemini-byok': { label: 'Gemini (BYOK)', color: '#4285f4', abbr: 'Ge' },
  'local':       { label: 'Local Brain',   color: '#8888a0', abbr: 'Lc' },
}

function formatTime(ts?: string) {
  if (ts) return ts
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function OnCallChat({ messages, loading, onSend, onClose, focus }: OnCallChatProps) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevLen = useRef(0)

  useEffect(() => {
    if (messages.length !== prevLen.current) {
      prevLen.current = messages.length
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = '40px'
  }, [input, loading, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (inputRef.current) {
      inputRef.current.style.height = '40px'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 96) + 'px'
    }
  }

  const borderColor = focus === 'vault' ? 'rgba(255,107,53,0.3)'
    : focus === 'thinking' ? 'rgba(0,212,255,0.3)'
    : focus === 'federation' ? 'rgba(167,139,250,0.3)'
    : 'var(--border)'

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: 'min(380px, calc(100vw - 40px))',
        maxHeight: 'min(520px, calc(100vh - 120px))',
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'oncall-slide-up 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7ed957, #00d4ff)' }}
          >
            <span className="text-[8px] font-black" style={{ color: '#0a0a0f' }}>0n</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            0ncall
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ minHeight: '200px' }}>
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full py-8">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'rgba(126,217,87,0.1)' }}
              >
                <Sparkles size={18} style={{ color: '#7ed957' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Ask anything or describe what you want to automate.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animation: 'oncall-msg-in 0.2s ease both' }}
          >
            {/* Avatar */}
            {m.role === 'assistant' ? (
              <div
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  background: m.source && PROVIDER_BADGES[m.source]
                    ? `linear-gradient(135deg, ${PROVIDER_BADGES[m.source].color}40, ${PROVIDER_BADGES[m.source].color}20)`
                    : 'linear-gradient(135deg, rgba(126,217,87,0.2), rgba(0,212,255,0.15))',
                }}
              >
                {m.source && PROVIDER_BADGES[m.source] ? (
                  <span className="text-[8px] font-bold" style={{ color: PROVIDER_BADGES[m.source].color }}>
                    {PROVIDER_BADGES[m.source].abbr}
                  </span>
                ) : (
                  <span className="text-[8px] font-black" style={{ color: '#7ed957' }}>0n</span>
                )}
              </div>
            ) : (
              <div
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <User size={11} style={{ color: 'var(--text-secondary)' }} />
              </div>
            )}

            {/* Bubble */}
            <div className="max-w-[85%] min-w-0">
              <div
                className="text-[13px] leading-relaxed break-words whitespace-pre-wrap px-3 py-2 rounded-xl"
                style={
                  m.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, rgba(126,217,87,0.12), rgba(0,212,255,0.08))',
                        borderTopRightRadius: '4px',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(126,217,87,0.15)',
                      }
                    : {
                        background: 'var(--bg-card)',
                        borderTopLeftRadius: '4px',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }
                }
              >
                {m.text}
              </div>
              {/* Source badge + timestamp */}
              <div
                className={`flex items-center gap-1.5 mt-0.5 px-1 text-[10px] ${m.role === 'user' ? 'justify-end' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              >
                {m.role === 'assistant' && m.source && PROVIDER_BADGES[m.source] && (
                  <span style={{ color: PROVIDER_BADGES[m.source].color }}>
                    {PROVIDER_BADGES[m.source].label}
                  </span>
                )}
                <span>{formatTime(m.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div className="flex items-start gap-2">
            <div
              className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(167,139,250,0.15))' }}
            >
              <Loader2 size={12} className="animate-spin" style={{ color: '#00d4ff' }} />
            </div>
            <div
              className="px-3 py-2 rounded-xl rounded-tl-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(d => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: '#00d4ff',
                      animation: 'oncall-dot-pulse 1.2s ease infinite',
                      animationDelay: `${d * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-3 pb-3 pt-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Ask 0ncall..."
            rows={1}
            className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none resize-none transition-colors"
            style={{
              height: '40px',
              maxHeight: '96px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-all self-end"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: '#0a0a0f',
              opacity: loading || !input.trim() ? 0.4 : 1,
            }}
          >
            <SendHorizontal size={15} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes oncall-slide-up {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes oncall-msg-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes oncall-dot-pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
