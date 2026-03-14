'use client'

import { useState } from 'react'
import type { BuilderSuggestion } from './useBuilderSuggestions'

interface BuilderSuggestionsProps {
  suggestions: BuilderSuggestion[]
  onSelect: (suggestion: BuilderSuggestion) => void
}

export default function BuilderSuggestions({ suggestions, onSelect }: BuilderSuggestionsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (suggestions.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      padding: '12px 16px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10, 10, 15, 0.6)',
    }}>
      <style>{`
        .builder-suggest-row::-webkit-scrollbar { display: none; }
        @keyframes builderSuggestIn {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 768px) {
          .builder-suggest-cards { flex-direction: column !important; }
          .builder-suggest-card { max-width: 100% !important; }
        }
      `}</style>
      <div
        className="builder-suggest-cards"
        style={{ display: 'flex', gap: '10px', width: '100%' }}
      >
        {suggestions.map((s, i) => {
          const isHovered = hoveredId === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="builder-suggest-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: isHovered ? 'var(--bg-card)' : 'rgba(15, 15, 22, 0.8)',
                border: `1px solid ${isHovered ? s.color + '55' : 'var(--border)'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                flex: '1 1 0',
                minWidth: '200px',
                maxWidth: '360px',
                boxShadow: isHovered ? `0 0 16px ${s.color}18` : 'none',
                transition: 'all 200ms ease',
                animation: `builderSuggestIn 0.3s ease-out ${i * 80}ms both`,
                flexShrink: 0,
              }}
            >
              {/* Icon circle */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: s.color + '18',
                border: `1px solid ${s.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
                boxShadow: isHovered ? `0 0 8px ${s.color}30` : 'none',
                transition: 'box-shadow 200ms ease',
              }}>
                {s.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px',
                }}>
                  {s.text}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {s.description}
                </div>
              </div>

              {/* Arrow */}
              <span style={{
                color: isHovered ? s.color : 'var(--text-muted)',
                fontSize: '14px',
                flexShrink: 0,
                transition: 'color 150ms ease, transform 150ms ease',
                transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
              }}>
                →
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
