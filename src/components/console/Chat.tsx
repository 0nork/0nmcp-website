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
  'claude-byok': { label: 'Claude', color: 'text-[#D4D4D4]' },
  'claude': { label: 'Claude', color: 'text-[#D4D4D4]' },
  'openai-byok': { label: 'GPT-4o', color: 'text-[#D4D4D4]' },
  'gemini-byok': { label: 'Gemini', color: 'text-[#D4D4D4]' },
  'local': { label: 'Local', color: 'text-[#6B6B6B]' },
}

function formatTime(ts?: string) {
  if (ts) return ts
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

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
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-[#6EE05A] flex items-center justify-center">
            <span className="text-lg font-black text-[#000000] font-mono">0n</span>
          </div>
          <h3 className="text-lg font-bold text-[#FFFFFF] mb-2">Ask Jaxx anything</h3>
          <p className="text-sm text-[#D4D4D4] mb-6">
            Execute tasks across {STATS_DISPLAY.services} services, manage workflows, or ask about your connected tools.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {capabilities.map(cap => (
              <button
                key={cap.label}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#2A2A2A] bg-[#111111] hover:border-[#6EE05A] hover:bg-[#1A1A1A] transition-all cursor-pointer group"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('chat-prefill', { detail: cap.prompt }))
                }}
              >
                <cap.icon className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#6EE05A] transition-colors" />
                <span className="text-xs font-medium text-[#D4D4D4] group-hover:text-[#FFFFFF]">{cap.label}</span>
                <span className="text-[10px] text-[#6B6B6B]">{cap.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Type <kbd className="px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#D4D4D4] border border-[#2A2A2A] text-[10px] font-mono">/</kbd> to see all commands
          </p>
          {!hasAIKey && (
            <p className="mt-4 text-xs text-[#6B6B6B]">Select a provider in the footer to unlock AI chat</p>
          )}
        </div>
      </div>
    )
  }

  // ── Messages ──
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-5">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {m.role === 'system' ? (
              <div className="w-8 h-8 rounded-xl shrink-0 bg-[#6EE05A] flex items-center justify-center">
                {m.loading ? (
                  <div className="w-4 h-4 border-2 border-[#000000]/30 border-t-[#000000] rounded-full animate-spin" />
                ) : (
                  <span className="text-[9px] font-black text-[#000000] font-mono">0n</span>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl shrink-0 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
            )}

            {/* Bubble */}
            <div className="max-w-[70%] min-w-0">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                m.role === 'user'
                  ? 'bg-[#1A1A1A] border border-[#2A2A2A] rounded-tr-sm text-[#FFFFFF]'
                  : 'bg-[#111111] border border-[#2A2A2A] rounded-tl-sm text-[#D4D4D4]'
              }`}>
                {m.loading ? (
                  <span className="flex items-center gap-2 text-[#6B6B6B]">
                    <span>Executing via 0nMCP</span>
                    <span className="inline-flex gap-1">
                      {[0, 1, 2].map(d => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#6EE05A] animate-pulse" style={{ animationDelay: `${d * 200}ms` }} />
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
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'completed' ? 'bg-[#6EE05A]' : 'bg-[#EF4444]'}`} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B6B6B] font-mono">{m.status}</span>
                    </div>
                  )}
                  {m.steps != null && m.steps > 0 && (
                    <span className="text-[10px] text-[#6B6B6B] font-mono">{m.steps} step{m.steps !== 1 ? 's' : ''}</span>
                  )}
                  {m.services && m.services.length > 0 && (
                    <span className="text-[10px] text-[#6B6B6B] font-mono">via {m.services.join(', ')}</span>
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
                <span className="text-[9px] text-[#6B6B6B]">{formatTime(m.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* BYOK banner */}
        {showInlineBYOK && !loading && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl max-w-md mx-auto bg-[#1A1A1A] border border-[#2A2A2A]">
            <p className="flex-1 text-xs text-[#D4D4D4] m-0">Connect an AI key for powered responses.</p>
            <button onClick={() => onNavigateVault?.()} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#6EE05A] text-[#000000] cursor-pointer shrink-0 hover:bg-[#5BC94A] transition-colors">
              Connect
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !messages.some(m => m.loading) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl shrink-0 bg-[#6EE05A] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#000000]/30 border-t-[#000000] rounded-full animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#111111] border border-[#2A2A2A] flex gap-1.5">
              {[0, 1, 2].map(d => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#6EE05A] animate-pulse" style={{ animationDelay: `${d * 200}ms` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  )
}
