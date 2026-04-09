'use client'

import { useRef, useEffect } from 'react'
import { STATS_DISPLAY } from '@/data/stats'
import { Zap, Lock, Link2, Mail, Users, Layers } from 'lucide-react'

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
  '0nmcp': { label: '0nMCP', color: 'text-[#6EE05A]' },
  'agent-studio': { label: '0n Agent', color: 'text-[#6EE05A]' },
  'claude-byok': { label: 'Claude', color: 'text-violet-400' },
  'claude': { label: 'Claude', color: 'text-cyan-400' },
  'openai-byok': { label: 'GPT-4o', color: 'text-emerald-400' },
  'gemini-byok': { label: 'Gemini', color: 'text-blue-400' },
  'local': { label: 'Local', color: 'text-neutral-500' },
}

function formatTime(ts?: string) {
  if (ts) return ts
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Capability cards for empty state
const capabilities = [
  { icon: Zap, label: 'Workflows', desc: 'Run, build, or schedule', prompt: 'Create a workflow that ' },
  { icon: Lock, label: 'Vault', desc: 'Manage API keys safely', prompt: 'Open the vault and show my ' },
  { icon: Link2, label: 'Services', desc: 'Connect new integrations', prompt: 'Connect my ' },
  { icon: Mail, label: 'Campaigns', desc: 'Draft and send via AI', prompt: 'Draft a campaign for ' },
  { icon: Users, label: 'Contacts', desc: 'Query your CRM data', prompt: 'Find all contacts who ' },
  { icon: Layers, label: 'Builder', desc: 'Visual flow editor', prompt: 'Build a workflow that ' },
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

  const lastSystemMsg = [...messages].reverse().find(m => m.role === 'system')
  const showInlineBYOK = !hasAIKey && lastSystemMsg?.source === 'local' && messages.length > 0

  // ── Empty State ──
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden min-h-0">
        <div className="text-center max-w-lg">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-[#6EE05A] flex items-center justify-center shadow-lg shadow-[#6EE05A]/20">
            <span className="text-lg font-black text-[#080B0F] font-mono">0n</span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Ask Jaxx anything</h3>
          <p className="text-sm text-neutral-400 mb-6">
            Execute tasks across {STATS_DISPLAY.services} services, manage workflows, or ask about your connected tools.
          </p>

          {/* Capability cards — 2x3 grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {capabilities.map(cap => (
              <button
                key={cap.label}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-neutral-700/30 bg-[#0F1419] hover:border-[#6EE05A]/30 hover:bg-[#6EE05A]/5 transition-all cursor-pointer group"
                onClick={() => {
                  // Pre-fill input — dispatch custom event
                  window.dispatchEvent(new CustomEvent('chat-prefill', { detail: cap.prompt }))
                }}
              >
                <cap.icon className="w-5 h-5 text-neutral-500 group-hover:text-[#6EE05A] transition-colors" />
                <span className="text-xs font-medium text-neutral-300 group-hover:text-white">{cap.label}</span>
                <span className="text-[10px] text-neutral-600">{cap.desc}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-neutral-600">
            Type <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-mono">/</kbd> to see all commands
          </p>

          {!hasAIKey && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M12 3v1m0 16v1m8.66-13.5l-.87.5M4.21 16l-.87.5M20.66 16l-.87-.5M4.21 8l-.87-.5M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <span className="text-xs text-neutral-500">Select a provider in the footer to unlock AI chat</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Messages ──
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-5">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {m.role === 'system' ? (
              <div className="w-8 h-8 rounded-xl shrink-0 bg-[#6EE05A] flex items-center justify-center shadow-sm shadow-[#6EE05A]/25">
                {m.loading ? (
                  <div className="w-4 h-4 border-2 border-[#080B0F]/30 border-t-[#080B0F] rounded-full animate-spin" />
                ) : (
                  <span className="text-[9px] font-black text-[#080B0F] font-mono">0n</span>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl shrink-0 bg-[#0F1419] border border-neutral-700/30 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
            )}

            {/* Bubble + metadata */}
            <div className="max-w-[70%] min-w-0">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                m.role === 'user'
                  ? 'bg-[#6EE05A]/10 border border-[#6EE05A]/20 rounded-tr-sm text-neutral-200'
                  : 'bg-[#0F1419] border border-neutral-700/30 rounded-tl-sm text-neutral-200'
              }`}>
                {m.loading ? (
                  <span className="flex items-center gap-2 text-neutral-500">
                    <span>Executing via 0nMCP</span>
                    <span className="inline-flex gap-1">
                      {[0, 1, 2].map(d => (
                        <span
                          key={d}
                          className="w-1 h-1 rounded-full bg-[#6EE05A] animate-pulse"
                          style={{ animationDelay: `${d * 200}ms` }}
                        />
                      ))}
                    </span>
                  </span>
                ) : m.text}
              </div>

              {/* Execution metadata */}
              {m.role === 'system' && m.source === '0nmcp' && !m.loading && (
                <div className="flex items-center gap-2.5 mt-1.5 pl-1">
                  {m.status && (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'completed' ? 'bg-[#6EE05A]' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 font-mono">
                        {m.status}
                      </span>
                    </div>
                  )}
                  {m.steps != null && m.steps > 0 && (
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {m.steps} step{m.steps !== 1 ? 's' : ''}
                    </span>
                  )}
                  {m.services && m.services.length > 0 && (
                    <span className="text-[10px] text-neutral-500 font-mono">
                      via {m.services.join(', ')}
                    </span>
                  )}
                </div>
              )}

              {/* Source + timestamp */}
              <div className={`flex items-center gap-1.5 mt-1 pl-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'system' && m.source && SOURCE_LABELS[m.source] && (
                  <span className={`text-[10px] font-semibold font-mono ${SOURCE_LABELS[m.source].color}`}>
                    {SOURCE_LABELS[m.source].label}
                  </span>
                )}
                <span className="text-[9px] text-neutral-600">{formatTime(m.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Inline BYOK banner */}
        {showInlineBYOK && !loading && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl max-w-md mx-auto bg-violet-500/8 border border-violet-500/20 animate-in fade-in duration-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M12 3v1m0 16v1m8.66-13.5l-.87.5M4.21 16l-.87.5M20.66 16l-.87-.5M4.21 8l-.87-.5M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <p className="flex-1 text-xs text-neutral-400 m-0">
              Connect an AI key for powered responses.
            </p>
            <button
              onClick={() => onNavigateVault?.()}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-400 cursor-pointer shrink-0 hover:bg-violet-500/25 transition-colors"
            >
              Connect
            </button>
          </div>
        )}

        {/* Loading dots */}
        {loading && !messages.some(m => m.loading) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl shrink-0 bg-[#6EE05A] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#080B0F]/30 border-t-[#080B0F] rounded-full animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#0F1419] border border-neutral-700/30 flex gap-1.5">
              {[0, 1, 2].map(d => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-[#6EE05A] animate-pulse"
                  style={{ animationDelay: `${d * 200}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  )
}
