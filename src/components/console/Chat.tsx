'use client'

import { useRef, useEffect } from 'react'
import { User, Zap, CheckCircle2, XCircle, Loader2, Terminal, Sparkles } from 'lucide-react'

export interface ChatMessage {
  role: 'user' | 'system'
  text: string
  source?: '0nmcp' | 'claude-byok' | 'claude' | 'openai-byok' | 'gemini-byok' | 'local'
  status?: 'completed' | 'failed'
  steps?: number
  services?: string[]
  loading?: boolean
  timestamp?: string
}

interface ChatProps {
  messages: ChatMessage[]
  loading: boolean
  hasAIKey?: boolean
  onNavigateVault?: (service?: string) => void
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  '0nmcp': { label: '0nMCP', color: 'var(--accent)' },
  'claude-byok': { label: 'Claude (Your Key)', color: '#a78bfa' },
  'claude': { label: 'Claude', color: '#00d4ff' },
  'openai-byok': { label: 'GPT-4o (Your Key)', color: '#10a37f' },
  'gemini-byok': { label: 'Gemini (Your Key)', color: '#4285f4' },
  'local': { label: 'Local', color: 'var(--text-muted)' },
}

const AI_SOURCE_SET = new Set(['claude-byok', 'claude', 'openai-byok', 'gemini-byok'])

function formatTime(ts?: string) {
  if (ts) return ts
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const AI_PROVIDERS = [
  { key: 'anthropic', label: 'Claude', sub: 'Anthropic', color: '#a78bfa', gradient: 'linear-gradient(135deg, #a78bfa, #6366f1)' },
  { key: 'openai', label: 'GPT-4o', sub: 'OpenAI', color: '#10a37f', gradient: 'linear-gradient(135deg, #10a37f, #1a7f5a)' },
  { key: 'google', label: 'Gemini', sub: 'Google', color: '#4285f4', gradient: 'linear-gradient(135deg, #4285f4, #34a853)' },
]

export function Chat({ messages, loading, hasAIKey, onNavigateVault }: ChatProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const prevLenRef = useRef(0)

  useEffect(() => {
    if (messages.length !== prevLenRef.current) {
      prevLenRef.current = messages.length
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // Show BYOK banner when last response was local (no AI key available)
  const lastSystemMsg = [...messages].reverse().find(m => m.role === 'system')
  const showInlineBYOK = !hasAIKey && lastSystemMsg?.source === 'local' && messages.length > 0

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {!hasAIKey ? (
            <>
              {/* BYOK Onboarding — Pick Your AI Provider */}
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(0,212,255,0.15))' }}
              >
                <Sparkles size={28} style={{ color: '#a78bfa' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Connect Your AI
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                Pick any provider. Your key is encrypted with AES-256-GCM and only you can access it.
              </p>

              {/* 3 Provider Cards */}
              <div className="flex gap-3 justify-center mb-5">
                {AI_PROVIDERS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => onNavigateVault?.(p.key)}
                    className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      minWidth: '120px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = p.color
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = `0 4px 20px ${p.color}25`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background: p.gradient, color: '#fff' }}
                    >
                      {p.label.slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: p.color }}>{p.label}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.sub}</span>
                  </button>
                ))}
              </div>

              <div
                className="pt-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  You can still chat — basic commands and local knowledge work without a key.
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Type <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>/help</span> or describe what you want to automate.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Normal empty state — key connected */}
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-glow)' }}
              >
                <Terminal size={28} style={{ color: 'var(--accent)' }} />
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Ask 0n anything
              </h3>
              <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
                Execute tasks across 48 services, manage workflows, or ask about your connected tools.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{
              animation: 'console-msg-in 0.3s ease both',
              animationDelay: `${Math.min(i, 5) * 40}ms`,
            }}
          >
            {/* Avatar */}
            {m.role === 'system' ? (
              <div
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: m.source && AI_SOURCE_SET.has(m.source)
                    ? m.source === 'openai-byok'
                      ? 'linear-gradient(135deg, #10a37f, #1a7f5a)'
                      : m.source === 'gemini-byok'
                        ? 'linear-gradient(135deg, #4285f4, #34a853)'
                        : 'linear-gradient(135deg, #a78bfa, #00d4ff)'
                    : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                }}
              >
                {m.loading ? (
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--bg-primary)' }} />
                ) : m.source && AI_SOURCE_SET.has(m.source) ? (
                  <Sparkles size={14} style={{ color: '#fff' }} />
                ) : (
                  <span
                    className="text-[10px] font-black"
                    style={{ color: 'var(--bg-primary)' }}
                  >
                    0n
                  </span>
                )}
              </div>
            ) : (
              <div
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <User size={14} style={{ color: 'var(--text-secondary)' }} />
              </div>
            )}

            {/* Bubble */}
            <div className="max-w-[70%] lg:max-w-[60%] min-w-0">
              <div
                className="text-sm leading-relaxed break-words whitespace-pre-wrap px-4 py-3 rounded-2xl"
                style={
                  m.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, rgba(126,217,87,0.15), rgba(0,212,255,0.1))',
                        borderTopRightRadius: '0.375rem',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(126,217,87,0.2)',
                      }
                    : {
                        backgroundColor: 'var(--bg-card)',
                        borderTopLeftRadius: '0.375rem',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }
                }
              >
                {m.loading ? (
                  <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="console-loading-dots">Executing via 0nMCP</span>
                  </span>
                ) : (
                  m.text
                )}
              </div>

              {/* Execution metadata */}
              {m.role === 'system' && m.source === '0nmcp' && !m.loading && (
                <div className="flex items-center gap-3 mt-1.5 px-1">
                  <div className="flex items-center gap-1">
                    {m.status === 'completed' ? (
                      <CheckCircle2 size={11} style={{ color: 'var(--accent)' }} />
                    ) : m.status === 'failed' ? (
                      <XCircle size={11} className="text-red-500" />
                    ) : null}
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {m.status || 'done'}
                    </span>
                  </div>
                  {m.steps != null && m.steps > 0 && (
                    <div className="flex items-center gap-1">
                      <Zap size={10} style={{ color: 'var(--accent-secondary)' }} />
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {m.steps} step{m.steps !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {m.services && m.services.length > 0 && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      via {m.services.join(', ')}
                    </span>
                  )}
                </div>
              )}

              {/* Source label + timestamp */}
              <div
                className={`flex items-center gap-2 text-xs mt-1 px-1 ${m.role === 'user' ? 'justify-end' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              >
                {m.role === 'system' && m.source && SOURCE_LABELS[m.source] && (
                  <span style={{ color: SOURCE_LABELS[m.source].color }}>
                    {SOURCE_LABELS[m.source].label}
                  </span>
                )}
                <span>{formatTime(m.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Inline BYOK banner — shown after local responses when no key */}
        {showInlineBYOK && !loading && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mx-auto max-w-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(0,212,255,0.06))',
              border: '1px solid rgba(167,139,250,0.2)',
              animation: 'console-msg-in 0.3s ease both',
            }}
          >
            <Sparkles size={18} style={{ color: '#a78bfa' }} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Connect an AI key (Claude, GPT, or Gemini) for AI-powered responses.
              </p>
            </div>
            <button
              onClick={() => onNavigateVault?.()}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
              style={{
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.3)',
                color: '#a78bfa',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.15)' }}
            >
              Connect
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {loading && !messages.some((m) => m.loading) && (
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              }}
            >
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--bg-primary)' }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-md"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--accent)',
                      animation: 'console-dot-pulse 1.2s ease infinite',
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

      <style>{`
        @keyframes console-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes console-dot-pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        .console-loading-dots::after {
          content: '';
          animation: console-ellipsis 1.5s infinite;
        }
        @keyframes console-ellipsis {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }
      `}</style>
    </div>
  )
}
