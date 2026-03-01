'use client'

import { useState } from 'react'

interface PlatformCardProps {
  name: string
  icon: string
  connected: boolean
  expired?: boolean
  postCount: number
  lastPosted: string | null
  color: string
  method?: 'oauth' | 'api_key'
  username?: string | null
  avatar?: string | null
  connectUrl?: string | null
  comingSoon?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
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
  expired,
  postCount,
  lastPosted,
  color,
  method,
  username,
  avatar,
  connectUrl,
  comingSoon,
  onConnect,
  onDisconnect,
}: PlatformCardProps) {
  const [hovered, setHovered] = useState(false)

  const handleConnect = () => {
    if (comingSoon) return
    if (method === 'oauth' && connectUrl) {
      // OAuth redirect
      window.location.href = connectUrl
    } else if (onConnect) {
      onConnect()
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(160deg, #1a1a25 0%, #111118 100%)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
        padding: 20,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${color}15`
          : '0 2px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        opacity: comingSoon ? 0.5 : 1,
      }}
    >
      {/* Glow overlay */}
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

      {/* Icon + Status Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${color}30` }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                backgroundColor: `${color}20`,
                color: color === '#0a0a0a' || color === '#000000' ? 'var(--text-primary)' : color,
                border: `1px solid ${color}30`,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {name}
            </div>
            {username && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                @{username}
              </div>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: connected && !expired ? '#7ed957' : expired ? '#ffbb33' : 'var(--text-muted)',
              boxShadow: connected && !expired ? '0 0 8px rgba(126,217,87,0.4)' : 'none',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: connected && !expired ? '#7ed957' : expired ? '#ffbb33' : 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            {comingSoon ? 'Coming soon' : expired ? 'Expired' : connected ? 'Connected' : 'Not connected'}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      {connected && !comingSoon && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {postCount}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              Posts
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Last posted</div>
            <div style={{ fontSize: 12, color: lastPosted ? 'var(--text-secondary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 500, marginTop: 2 }}>
              {lastPosted ? timeAgo(lastPosted) : 'Never'}
            </div>
          </div>
        </div>
      )}

      {/* Connect / Disconnect Button */}
      {!comingSoon && (
        <div style={{ position: 'relative' }}>
          {connected ? (
            <button
              onClick={onDisconnect}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff6b6b'
                e.currentTarget.style.color = '#ff6b6b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              {expired ? 'Reconnect' : 'Disconnect'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: `1px solid ${color}40`,
                backgroundColor: `${color}15`,
                color: color === '#0a0a0a' || color === '#000000' ? 'var(--text-primary)' : color,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}25` }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${color}15` }}
            >
              {method === 'api_key' ? 'Add API Key' : 'Connect'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
