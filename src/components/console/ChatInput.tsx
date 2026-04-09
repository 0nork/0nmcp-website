'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { STATS_DISPLAY } from '@/data/stats'
import { Send } from 'lucide-react'

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

  // Listen for chat-prefill events from capability cards
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && typeof detail === 'string') {
        setValue(detail)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('chat-prefill', handler)
    return () => window.removeEventListener('chat-prefill', handler)
  }, [])

  return (
    <div className="shrink-0 p-3 md:p-4 bg-[#080B0F] border-t border-neutral-700/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={mcpOnline ? 'Ask Jaxx anything... or type / for commands' : 'Ask anything or type / for commands...'}
            rows={1}
            className="flex-1 px-4 py-3 h-12 max-h-[120px] rounded-xl text-sm resize-none bg-[#0F1419] border border-neutral-700/30 text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-[#6EE05A]/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !value.trim()}
            className={`w-12 h-12 rounded-xl shrink-0 self-end flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed ${
              value.trim() && !loading
                ? 'bg-[#6EE05A] text-[#080B0F] shadow-sm shadow-[#6EE05A]/20 hover:bg-[#7FF06A]'
                : 'bg-[#0F1419] text-neutral-600 border border-neutral-700/30'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${mcpOnline ? 'bg-[#6EE05A] animate-pulse shadow-sm shadow-[#6EE05A]/50' : 'bg-neutral-600'}`} />
          {mcpOnline ? (
            <span>
              <span className="text-[#6EE05A]">0nMCP Live</span>
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
