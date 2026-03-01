'use client'

import { useRef, useEffect } from 'react'
import { User, Zap, CheckCircle2, XCircle, Loader2, Terminal } from 'lucide-react'

export interface ChatMessage {
  role: 'user' | 'system'
  text: string
  source?: '0nmcp' | 'local'
  status?: 'completed' | 'failed'
  steps?: number
  services?: string[]
  loading?: boolean
  timestamp?: string
}

interface ChatProps {
  messages: ChatMessage[]
  loading: boolean
}

function formatTime(ts?: string) {
  if (ts) return ts
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function Chat({ messages, loading }: ChatProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
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
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                }}
              >
                {m.loading ? (
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--bg-primary)' }} />
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

              <div
                className={`text-xs mt-1 px-1 ${m.role === 'user' ? 'text-right' : ''}`}
                style={{ color: 'var(--text-muted)' }}
              >
                {m.source === '0nmcp' && (
                  <span className="mr-2" style={{ color: 'var(--accent)' }}>
                    0nMCP
                  </span>
                )}
                {formatTime(m.timestamp)}
              </div>
            </div>
          </div>
        ))}

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
