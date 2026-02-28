'use client'

import { useState } from 'react'

interface HashtagEngineProps {
  hashtags: string[]
  onRemove: (tag: string) => void
  onAdd: (tag: string) => void
  loading?: boolean
}

export function HashtagEngine({ hashtags, onRemove, onAdd, loading }: HashtagEngineProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const clean = inputValue.replace(/^#/, '').trim().toLowerCase()
      if (clean) {
        onAdd(clean)
        setInputValue('')
      }
    }
  }

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        border: '1px solid var(--border)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        minHeight: 44,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Loading placeholders */}
        {loading && hashtags.length === 0 && (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: 60 + Math.random() * 40,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  animation: `pulse 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </>
        )}

        {/* Hashtag pills */}
        {hashtags.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 8,
              border: '1px solid var(--accent)',
              backgroundColor: 'var(--accent-glow)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ opacity: 0.6 }}>#</span>
            {tag}
            <button
              onClick={() => onRemove(tag)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                marginLeft: 2,
                fontSize: 14,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: 4,
                opacity: 0.6,
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              aria-label={`Remove hashtag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}

        {/* Input for custom hashtag */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hashtags.length === 0 && !loading ? 'Add hashtag...' : '+ Add'}
          style={{
            flex: hashtags.length === 0 ? 1 : 'none',
            minWidth: 80,
            maxWidth: 160,
            padding: '5px 8px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
          }}
        />
      </div>

      {/* Pulse keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
