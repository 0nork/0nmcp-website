import { ImageResponse } from 'next/og'

export const alt = '0nMCP — Universal AI API Orchestrator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
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
        {/* Grid pattern */}
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

        {/* Glow circle behind logo */}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: '#00ff88',
              fontFamily: 'monospace',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            0nMCP
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#8888a0',
            fontFamily: 'system-ui, sans-serif',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          Universal AI API Orchestrator
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 48,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#00ff88',
                fontFamily: 'monospace',
              }}
            >
              564
            </span>
            <span style={{ fontSize: 14, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tools
            </span>
          </div>

          <div style={{ width: 1, height: 60, background: '#2a2a3a', display: 'flex' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#00ff88',
                fontFamily: 'monospace',
              }}
            >
              26
            </span>
            <span style={{ fontSize: 14, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Services
            </span>
          </div>

          <div style={{ width: 1, height: 60, background: '#2a2a3a', display: 'flex' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#00ff88',
                fontFamily: 'monospace',
              }}
            >
              80
            </span>
            <span style={{ fontSize: 14, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Automations
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 16, color: '#55556a' }}>
            Stop building workflows. Start describing outcomes.
          </span>
        </div>

        {/* Accent line at top */}
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
