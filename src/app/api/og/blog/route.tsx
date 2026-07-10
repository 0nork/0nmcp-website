import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || '0nMCP Blog'
  const subtitle = searchParams.get('subtitle') || '1,640+ tools · 111 services · Universal AI Orchestrator'
  const category = searchParams.get('category') || ''

  const categoryColors: Record<string, string> = {
    guides: '#6EE05A',
    tutorials: '#60A5FA',
    comparisons: '#FBBF24',
    'case-studies': '#F472B6',
    news: '#A78BFA',
    '': '#6EE05A',
  }

  const accentColor = categoryColors[category] || '#6EE05A'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: '#0B0F19',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${accentColor}20`,
                border: `2px solid ${accentColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 900,
                color: accentColor,
              }}
            >
              0n
            </div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#E8EAED',
                letterSpacing: '-0.02em',
              }}
            >
              0nMCP
            </span>
          </div>

          {category && (
            <div
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
                color: accentColor,
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? '42px' : title.length > 40 ? '48px' : '56px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#7A8290',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #1E293B',
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '24px',
              fontSize: '14px',
              color: '#4A5568',
              fontWeight: 600,
            }}
          >
            <span>0nmcp.com</span>
            <span>·</span>
            <span>npm install -g 0nmcp</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            {['1,640+ tools', '111 services', 'MIT'].map((stat) => (
              <div
                key={stat}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: '#111827',
                  border: '1px solid #1E293B',
                  fontSize: '12px',
                  color: '#7A8290',
                  fontWeight: 600,
                }}
              >
                {stat}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
