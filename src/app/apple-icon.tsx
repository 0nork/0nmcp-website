import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
        }}
      >
        <span
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: '#7ed957',
            fontFamily: 'monospace',
            letterSpacing: '-0.05em',
          }}
        >
          0n
        </span>
      </div>
    ),
    { ...size }
  )
}
