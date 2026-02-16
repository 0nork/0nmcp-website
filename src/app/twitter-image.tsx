import { ImageResponse } from 'next/og'

export const alt = '0nMCP — Universal AI API Orchestrator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -55%)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: '#00ff88',
            fontFamily: 'monospace',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          0nMCP
        </span>

        <span
          style={{
            fontSize: 28,
            color: '#8888a0',
            fontFamily: 'system-ui, sans-serif',
            marginBottom: 40,
          }}
        >
          Universal AI API Orchestrator
        </span>

        <span style={{ fontSize: 20, color: '#55556a' }}>
          545 tools &middot; 26 services &middot; 80+ automations
        </span>

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
