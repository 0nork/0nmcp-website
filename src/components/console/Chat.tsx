'use client'

import { useRef, useEffect } from 'react'
import { STATS_DISPLAY } from '@/data/stats'

export interface ChatMessage {
  role: 'user' | 'system'
  text: string
  source?: '0nmcp' | 'agent-studio' | 'claude-byok' | 'claude' | 'openai-byok' | 'gemini-byok' | 'local'
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
  'agent-studio': { label: '0n Agent', color: 'var(--accent)' },
  'claude-byok': { label: 'Claude', color: 'var(--color-purple, #a78bfa)' },
  'claude': { label: 'Claude', color: 'var(--color-cyan, #00d4ff)' },
  'openai-byok': { label: 'GPT-4o', color: '#10a37f' },
  'gemini-byok': { label: 'Gemini', color: '#4285f4' },
  'local': { label: 'Local', color: 'var(--text-muted)' },
}

const AI_SOURCE_SET = new Set(['agent-studio', 'claude-byok', 'claude', 'openai-byok', 'gemini-byok'])

function formatTime(ts?: string) {
  if (ts) return ts
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function sourceGradient(source?: string): string {
  if (!source || !AI_SOURCE_SET.has(source)) return 'linear-gradient(135deg, var(--accent, #7ed957), var(--color-teal, #00C2C7))'
  if (source === 'openai-byok') return 'linear-gradient(135deg, #10a37f, #1a7f5a)'
  if (source === 'gemini-byok') return 'linear-gradient(135deg, #4285f4, #34a853)'
  if (source === 'claude-byok' || source === 'claude') return 'linear-gradient(135deg, #a78bfa, #6366f1)'
  return 'linear-gradient(135deg, var(--accent, #7ed957), var(--color-teal, #00C2C7))'
}

export function Chat({ messages, loading, hasAIKey, onNavigateVault }: ChatProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const prevLenRef = useRef(0)

  useEffect(() => {
    if (messages.length !== prevLenRef.current) {
      prevLenRef.current = messages.length
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  const lastSystemMsg = [...messages].reverse().find(m => m.role === 'system')
  const showInlineBYOK = !hasAIKey && lastSystemMsg?.source === 'local' && messages.length > 0

  // ── Empty State ──
  if (messages.length === 0 && !loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          {!hasAIKey ? (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, var(--accent-glow, rgba(126,217,87,0.15)), rgba(0,194,199,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--accent-dim, rgba(126,217,87,0.2))',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #7ed957)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v1m0 16v1m8.66-13.5l-.87.5M4.21 16l-.87.5M20.66 16l-.87-.5M4.21 8l-.87-.5M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary, #f0f4f8)', fontFamily: 'var(--font-display, Inter)' }}>
                Set up your Core AI below
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #6b7280)', marginBottom: 12, lineHeight: 1.5 }}>
                Select a provider in the footer to unlock AI-powered chat, automation, and all console features.
              </p>
              <div style={{ fontSize: 22, color: 'var(--text-muted)', animation: 'chatArrowBounce 1.5s ease infinite' }}>&#8595;</div>
            </>
          ) : (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, var(--accent, #7ed957), var(--color-teal, #00C2C7))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px var(--accent-glow, rgba(126,217,87,0.2))',
              }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 900, color: '#000', fontFamily: 'var(--font-mono)' }}>0n</span>
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary, #f0f4f8)' }}>
                Ask 0n anything
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #6b7280)', lineHeight: 1.5 }}>
                Execute tasks across {STATS_DISPLAY.services} services, manage workflows, or ask about your connected tools.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Messages ──
  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '16px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="chat-msg-row"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              animation: 'chatMsgIn 0.3s ease both',
              animationDelay: `${Math.min(i, 5) * 40}ms`,
            }}
          >
            {/* Avatar */}
            {m.role === 'system' ? (
              <div style={{
                width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                background: sourceGradient(m.source),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 12px color-mix(in srgb, ${SOURCE_LABELS[m.source || '0nmcp']?.color || 'var(--accent)'} 25%, transparent)`,
              }}>
                {m.loading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={2} strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                ) : (
                  <span style={{ fontSize: '0.5625rem', fontWeight: 900, color: '#000', fontFamily: 'var(--font-mono)' }}>0n</span>
                )}
              </div>
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: 12, flexShrink: 0,
                background: 'var(--bg-card, rgba(255,255,255,0.03))',
                border: '1px solid var(--border, #1e1e2e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary, #9ca3af)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
            )}

            {/* Bubble + metadata */}
            <div className="chat-msg-bubble" style={{ maxWidth: '70%', minWidth: 0 }}>
              <div style={{
                padding: '12px 16px', borderRadius: 16, fontSize: '0.8125rem', lineHeight: 1.6,
                fontFamily: 'var(--font-body, sans-serif)',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                ...(m.role === 'user' ? {
                  background: 'linear-gradient(135deg, var(--accent-glow, rgba(126,217,87,0.12)), rgba(0,194,199,0.08))',
                  border: '1px solid var(--accent-dim, rgba(126,217,87,0.2))',
                  borderTopRightRadius: 4,
                  color: 'var(--text-primary, #f0f4f8)',
                } : {
                  background: 'var(--bg-card, rgba(255,255,255,0.03))',
                  border: '1px solid var(--border, #1e1e2e)',
                  borderTopLeftRadius: 4,
                  color: 'var(--text-primary, #f0f4f8)',
                }),
              }}>
                {m.loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                    <span>Executing via 0nMCP</span>
                    <span style={{ display: 'inline-flex', gap: 3 }}>
                      {[0,1,2].map(d => (
                        <span key={d} style={{
                          width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)',
                          animation: `chatDotPulse 1.2s ease infinite ${d * 0.2}s`,
                        }} />
                      ))}
                    </span>
                  </span>
                ) : m.text}
              </div>

              {/* Execution metadata */}
              {m.role === 'system' && m.source === '0nmcp' && !m.loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, paddingLeft: 4 }}>
                  {m.status && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: m.status === 'completed' ? 'var(--accent, #7ed957)' : 'var(--color-red, #ef4444)',
                        boxShadow: m.status === 'completed' ? '0 0 6px var(--accent-glow)' : '0 0 6px rgba(239,68,68,0.4)',
                      }} />
                      <span style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {m.status}
                      </span>
                    </div>
                  )}
                  {m.steps != null && m.steps > 0 && (
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {m.steps} step{m.steps !== 1 ? 's' : ''}
                    </span>
                  )}
                  {m.services && m.services.length > 0 && (
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      via {m.services.join(', ')}
                    </span>
                  )}
                </div>
              )}

              {/* Source + timestamp */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, paddingLeft: 4,
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {m.role === 'system' && m.source && SOURCE_LABELS[m.source] && (
                  <span style={{ fontSize: '0.625rem', fontWeight: 600, color: SOURCE_LABELS[m.source].color, fontFamily: 'var(--font-mono)' }}>
                    {SOURCE_LABELS[m.source].label}
                  </span>
                )}
                <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted, #6b7280)' }}>{formatTime(m.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Inline BYOK banner */}
        {showInlineBYOK && !loading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14,
            maxWidth: 480, margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(0,212,255,0.06))',
            border: '1px solid rgba(167,139,250,0.2)',
            animation: 'chatMsgIn 0.3s ease both',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 3v1m0 16v1m8.66-13.5l-.87.5M4.21 16l-.87.5M20.66 16l-.87-.5M4.21 8l-.87-.5M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <p style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Connect an AI key for powered responses.
            </p>
            <button
              onClick={() => onNavigateVault?.()}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: '0.6875rem', fontWeight: 600,
                background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)',
                color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}
            >
              Connect
            </button>
          </div>
        )}

        {/* Loading dots */}
        {loading && !messages.some(m => m.loading) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent, #7ed957), var(--color-teal, #00C2C7))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={2} strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', gap: 4,
            }}>
              {[0,1,2].map(d => (
                <span key={d} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent, #7ed957)',
                  animation: `chatDotPulse 1.2s ease infinite ${d * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <style>{`
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatDotPulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes chatArrowBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive chat */
        @media (max-width: 767px) {
          .chat-msg-bubble { max-width: 88% !important; }
          .chat-msg-row { gap: 8px !important; }
          .chat-msg-avatar { width: 28px !important; height: 28px !important; border-radius: 10px !important; }
          .chat-msg-text { padding: 10px 12px !important; font-size: 0.8rem !important; border-radius: 14px !important; }
        }
        @media (max-width: 480px) {
          .chat-msg-bubble { max-width: 92% !important; }
          .chat-msg-text { padding: 8px 10px !important; font-size: 0.75rem !important; }
        }
        @media (max-width: 360px) {
          .chat-msg-bubble { max-width: 95% !important; }
          .chat-msg-avatar { width: 24px !important; height: 24px !important; }
        }
      `}</style>
    </div>
  )
}
