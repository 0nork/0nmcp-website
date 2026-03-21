import { ImageResponse } from 'next/og'

export const alt = 'Install 0nMCP — 1,155 AI Tools Inside Claude in 60 Seconds'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0f1419',
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
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Orange glow left */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
            top: '20%',
            left: '-5%',
            display: 'flex',
          }}
        />

        {/* Green glow right */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(126,217,87,0.1) 0%, transparent 70%)',
            bottom: '10%',
            right: '-5%',
            display: 'flex',
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: 'linear-gradient(90deg, #ff6b35, #7ed957, #00d4ff)',
            display: 'flex',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 20,
            background: 'rgba(255,107,53,0.12)',
            border: '1px solid rgba(255,107,53,0.3)',
            marginBottom: 28,
            fontSize: 16,
            color: '#ff6b35',
            fontWeight: 700,
          }}
        >
          60 seconds to install
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#ffffff',
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            Install
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#7ed957',
              fontFamily: 'monospace',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            0nMCP
          </span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 26,
            color: '#8888a0',
            fontFamily: 'system-ui, sans-serif',
            marginBottom: 44,
            display: 'flex',
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          1,155 AI tools across 91 services. Inside Claude. Free.
        </div>

        {/* Platform pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {[
            { label: 'Desktop', color: '#a78bfa' },
            { label: 'Web', color: '#00d4ff' },
            { label: 'Mobile', color: '#7ed957' },
            { label: 'CLI', color: '#ff6b35' },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 22px',
                borderRadius: 12,
                background: `rgba(255,255,255,0.04)`,
                border: `1px solid ${p.color}44`,
                fontSize: 18,
                fontWeight: 600,
                color: p.color,
              }}
            >
              {p.label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18, color: '#55556a', fontWeight: 600 }}>
            0nmcp.com/install0n
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
