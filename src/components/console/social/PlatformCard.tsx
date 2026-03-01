'use client'

import { useState } from 'react'

interface PlatformCardProps {
  name: string
  icon: string
  connected: boolean
  postCount: number
  lastPosted: string | null
  color: string
  onClick?: () => void
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

export function PlatformCard({
  name,
  icon,
  connected,
  postCount,
  lastPosted,
  color,
  onClick,
}: PlatformCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(160deg, #1a1a25 0%, #111118 100%)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
        padding: 20,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${color}15`
          : '0 2px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow overlay on hover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 30% 30%, ${color}08, transparent 60%)`,
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Icon + Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            backgroundColor: `${color}20`,
            color: color === '#0a0a0a' || color === '#000000' || color === '#010101' ? 'var(--text-primary)' : color,
            border: `1px solid ${color}30`,
          }}
        >
          {icon}
        </div>

        {/* Connection status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: connected ? '#7ed957' : 'var(--text-muted)',
              boxShadow: connected ? '0 0 8px rgba(126,217,87,0.4)' : 'none',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: connected ? '#7ed957' : 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            {connected ? 'Connected' : 'Not connected'}
          </span>
        </div>
      </div>

      {/* Platform Name */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          marginBottom: 12,
          position: 'relative',
        }}
      >
        {name}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
            }}
          >
            {postCount}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
              marginTop: 2,
            }}
          >
            Posts
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Last posted
          </div>
          <div
            style={{
              fontSize: 12,
              color: lastPosted ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              marginTop: 2,
            }}
          >
            {lastPosted ? timeAgo(lastPosted) : 'Never'}
          </div>
        </div>
      </div>
    </div>
  )
}
