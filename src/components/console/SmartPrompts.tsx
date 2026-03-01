'use client'

/**
 * SmartPrompts.tsx
 *
 * AI recommendation CTAs displayed above the chat input. Shows 2-3 contextual
 * suggestions the AI predicts the user is likely to want next, with confidence
 * percentages and category-colored visual cues.
 */

import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import {
  type Recommendation,
  CATEGORY_COLORS,
} from '@/lib/console/recommendations'
import { IconMap } from './icon-map'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SmartPromptsProps {
  recommendations: Recommendation[]
  onExecute: (rec: Recommendation) => void
  isThinking?: boolean
}

// ---------------------------------------------------------------------------
// Confidence badge color logic
// ---------------------------------------------------------------------------

function getConfidenceOpacity(confidence: number): number {
  if (confidence >= 80) return 1
  if (confidence >= 60) return 0.8
  return 0.5
}

function getConfidenceFontSize(confidence: number): string {
  if (confidence >= 60) return '11px'
  return '10px'
}

// ---------------------------------------------------------------------------
// Single recommendation card
// ---------------------------------------------------------------------------

interface CardProps {
  rec: Recommendation
  onExecute: (rec: Recommendation) => void
  animationDelay: number
  isVisible: boolean
}

function RecommendationCard({ rec, onExecute, animationDelay, isVisible }: CardProps) {
  const [hovered, setHovered] = useState(false)
  const categoryColor = CATEGORY_COLORS[rec.category] ?? '#8888a0'
  const opacity = getConfidenceOpacity(rec.confidence)

  const IconComponent = IconMap[rec.icon] ?? IconMap['Terminal']

  return (
    <button
      onClick={() => onExecute(rec)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: hovered ? 'var(--bg-tertiary)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? categoryColor + '55' : 'var(--border)'}`,
        borderRadius: '10px',
        cursor: 'pointer',
        textAlign: 'left',
        flex: '1 1 0',
        minWidth: '180px',
        maxWidth: '340px',
        boxShadow: hovered ? `0 0 12px ${categoryColor}22` : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 200ms ease ${animationDelay}ms, transform 200ms ease ${animationDelay}ms, background 150ms ease, border-color 150ms ease, box-shadow 150ms ease`,
        flexShrink: 0,
      }}
      aria-label={`${rec.label} — ${rec.description}`}
    >
      {/* Confidence badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: categoryColor + '22',
          border: `1px solid ${categoryColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
          flexShrink: 0,
          boxShadow: rec.confidence >= 80 ? `0 0 8px ${categoryColor}44` : 'none',
        }}
      >
        <IconComponent
          size={16}
          style={{ color: categoryColor, opacity }}
        />
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '2px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {rec.label}
          </span>

          {/* Confidence percentage pill */}
          <span
            style={{
              fontSize: getConfidenceFontSize(rec.confidence),
              fontWeight: rec.confidence >= 80 ? 700 : 500,
              color: categoryColor,
              opacity,
              background: categoryColor + '18',
              padding: '1px 6px',
              borderRadius: '20px',
              flexShrink: 0,
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            }}
          >
            {rec.confidence}%
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {rec.description}
        </p>
      </div>

      {/* Arrow */}
      <ArrowRight
        size={14}
        style={{
          color: hovered ? categoryColor : 'var(--text-muted)',
          flexShrink: 0,
          transition: 'color 150ms ease, transform 150ms ease',
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
        }}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Thinking indicator
// ---------------------------------------------------------------------------

function ThinkingBar() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 4px',
      }}
    >
      <Sparkles size={12} style={{ color: 'var(--accent)', opacity: 0.7 }} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Analyzing context...
      </span>
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'var(--accent)',
              opacity: 0.5,
              animation: `smartPromptsDot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes smartPromptsDot {
          0%, 60%, 100% { opacity: 0.2; transform: scale(0.9); }
          30% { opacity: 0.9; transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SmartPrompts({ recommendations, onExecute, isThinking }: SmartPromptsProps) {
  // Track the cards currently rendered so we can animate transitions
  const [visibleRecs, setVisibleRecs] = useState<Recommendation[]>([])
  const [cardsVisible, setCardsVisible] = useState(false)
  const prevRecsRef = useRef<Recommendation[]>([])

  useEffect(() => {
    if (recommendations.length === 0) {
      // Fade out
      setCardsVisible(false)
      const t = setTimeout(() => setVisibleRecs([]), 220)
      return () => clearTimeout(t)
    }

    const prevIds = prevRecsRef.current.map((r) => r.id).join(',')
    const nextIds = recommendations.map((r) => r.id).join(',')

    if (prevIds === nextIds) return // No change

    // Fade out old cards then swap in new ones
    setCardsVisible(false)

    const swapTimer = setTimeout(() => {
      setVisibleRecs(recommendations)
      prevRecsRef.current = recommendations
      // Small tick so DOM updates before we trigger transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setCardsVisible(true))
      })
    }, 220)

    return () => clearTimeout(swapTimer)
  }, [recommendations])

  // Mount initial set without fade-out
  useEffect(() => {
    if (visibleRecs.length === 0 && recommendations.length > 0) {
      setVisibleRecs(recommendations)
      prevRecsRef.current = recommendations
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setCardsVisible(true))
      })
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (visibleRecs.length === 0 && !isThinking) return null

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '10px',
        paddingBottom: '2px',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
          paddingLeft: '2px',
        }}
      >
        <Sparkles size={12} style={{ color: 'var(--accent)', opacity: 0.8 }} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Suggested next
        </span>
        {isThinking && <ThinkingBar />}
      </div>

      {/* Cards row */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          .smart-prompts-scroll::-webkit-scrollbar { display: none; }

          @media (max-width: 639px) {
            .smart-prompts-inner {
              flex-direction: column !important;
            }
            .smart-prompts-inner > * {
              max-width: 100% !important;
            }
          }
        `}</style>

        <div
          className="smart-prompts-inner"
          style={{
            display: 'flex',
            gap: '8px',
            width: '100%',
          }}
        >
          {visibleRecs.map((rec, i) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onExecute={onExecute}
              animationDelay={i * 100}
              isVisible={cardsVisible}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SmartPrompts
