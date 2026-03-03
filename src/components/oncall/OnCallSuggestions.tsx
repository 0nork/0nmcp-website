'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { CATEGORY_COLORS } from '@/lib/console/recommendations'

export interface Suggestion {
  id: string
  text: string
  category: string
  action: 'navigate' | 'chat' | 'vault_prompt'
  payload?: string
}

interface OnCallSuggestionsProps {
  suggestions: Suggestion[]
  onSelect: (suggestion: Suggestion) => void
  onDismiss: (id: string) => void
  onAutoClose: () => void
}

export function OnCallSuggestions({ suggestions, onSelect, onDismiss, onAutoClose }: OnCallSuggestionsProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Auto-collapse after 8 seconds
  useEffect(() => {
    timerRef.current = setTimeout(onAutoClose, 8000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [onAutoClose])

  // Reset timer on interaction
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(onAutoClose, 8000)
  }

  if (suggestions.length === 0) return null

  return (
    <div
      className="flex flex-col gap-2 mb-3"
      style={{
        width: 'min(320px, calc(100vw - 40px))',
        animation: 'oncall-suggest-in 0.3s ease-out',
      }}
      onMouseEnter={resetTimer}
    >
      {suggestions.map((s, i) => {
        const borderColor = CATEGORY_COLORS[s.category] || '#8888a0'
        return (
          <button
            key={s.id}
            onClick={() => { resetTimer(); onSelect(s) }}
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all group"
            style={{
              background: 'rgba(10, 10, 15, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${borderColor}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              animation: `oncall-suggest-in 0.3s ease-out ${i * 0.08}s both`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = borderColor
              e.currentTarget.style.boxShadow = `0 4px 20px ${borderColor}20`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.borderLeftColor = borderColor
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'
            }}
          >
            <span className="flex-1 text-[13px] leading-snug" style={{ color: 'var(--text-primary)' }}>
              {s.text}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onDismiss(s.id) }}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center transition-opacity cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={12} />
            </button>
          </button>
        )
      })}

      <style>{`
        @keyframes oncall-suggest-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
