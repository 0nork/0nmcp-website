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

const SOURCE_LABELS: Record<string, string> = {
  '0nmcp': '0nMCP',
  'agent-studio': '0n Agent',
  'claude-byok': 'Claude',
  'claude': 'Claude',
  'openai-byok': 'GPT-4o',
  'gemini-byok': 'Gemini',
  'local': 'Local',
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
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 bg-primary flex items-center justify-center">
            <span className="text-lg font-black text-primary-foreground font-mono">0n</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Ask Jaxx anything</h3>
          <p className="text-sm text-muted-foreground mb-8">
            Execute tasks across {STATS_DISPLAY.services} services, manage workflows, or ask about your connected tools.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {capabilities.map(cap => (
              <button
                key={cap.label}
                className="flex flex-col items-center gap-2.5 p-5 rounded-lg border border-border bg-card hover:border-primary transition-colors cursor-pointer group"
                onClick={() => window.dispatchEvent(new CustomEvent('chat-prefill', { detail: cap.prompt }))}
              >
                <cap.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">{cap.label}</span>
                <span className="text-xs text-muted-foreground">{cap.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Type <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground border border-border text-[10px] font-mono">/</kbd> to see all commands
          </p>
          {!hasAIKey && (
            <p className="mt-4 text-xs text-muted-foreground">Select a provider in the footer to unlock AI chat</p>
          )}
        </div>
      </div>
    )
  }

  // ── Messages ──
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-5">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            {m.role === 'system' ? (
              <div className="w-9 h-9 rounded-xl shrink-0 bg-primary flex items-center justify-center">
                {m.loading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <span className="text-[10px] font-black text-primary-foreground font-mono">0n</span>
                )}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl shrink-0 bg-secondary border border-border flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
            )}

            {/* Bubble */}
            <div className="max-w-[75%] min-w-0">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                m.role === 'user'
                  ? 'bg-secondary border border-border rounded-tr-sm text-foreground'
                  : 'bg-card border border-border rounded-tl-sm text-foreground'
              }`}>
                {m.loading ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span>Executing via 0nMCP</span>
                    <span className="inline-flex gap-1">
                      {[0, 1, 2].map(d => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${d * 200}ms` }} />
                      ))}
                    </span>
                  </span>
                ) : m.text}
              </div>

              {/* Metadata row */}
              <div className={`flex items-center gap-2 mt-1.5 px-1 text-[10px] font-mono ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'system' && m.source === '0nmcp' && !m.loading && m.status && (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'completed' ? 'bg-primary' : 'bg-destructive'}`} />
                    <span className="text-muted-foreground uppercase tracking-wide">{m.status}</span>
                  </>
                )}
                {m.role === 'system' && m.steps != null && m.steps > 0 && (
                  <span className="text-muted-foreground">{m.steps} step{m.steps !== 1 ? 's' : ''}</span>
                )}
                {m.role === 'system' && m.services && m.services.length > 0 && (
                  <span className="text-muted-foreground">via {m.services.join(', ')}</span>
                )}
                {m.role === 'system' && m.source && SOURCE_LABELS[m.source] && (
                  <span className="text-primary font-semibold">{SOURCE_LABELS[m.source]}</span>
                )}
                <span className="text-muted-foreground">{formatTime(m.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* BYOK banner */}
        {showInlineBYOK && !loading && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl max-w-md mx-auto bg-card border border-border">
            <p className="flex-1 text-sm text-foreground m-0">Connect an AI key for powered responses.</p>
            <button onClick={() => onNavigateVault?.()} className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground cursor-pointer shrink-0 hover:opacity-90 transition-opacity">
              Connect
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !messages.some(m => m.loading) && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl shrink-0 bg-primary flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border flex gap-1.5">
              {[0, 1, 2].map(d => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${d * 200}ms` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  )
}
