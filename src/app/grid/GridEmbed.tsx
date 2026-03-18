'use client'

import { useState } from 'react'

interface GridEmbedProps {
  gridUrl: string
  hasCrmSetup: boolean
}

export default function GridEmbed({ gridUrl, hasCrmSetup }: GridEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  if (!hasCrmSetup) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 1.5rem',
            background: 'rgba(126,217,87,0.1)',
            border: '1px solid rgba(126,217,87,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e8eaed', margin: '0 0 0.5rem' }}>
            Your Grid access is being set up
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#9aa0a8', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            This usually takes less than a minute after signup.
            If this persists, reconnect below.
          </p>
          <a
            href="/api/crm/oauth/install"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 1.5rem', borderRadius: 10,
              background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
              color: '#000', fontSize: '0.875rem', fontWeight: 700,
              textDecoration: 'none', fontFamily: 'inherit',
            }}
          >
            Reconnect CRM
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Loading spinner */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '3px solid rgba(126,217,87,0.15)',
            borderTopColor: '#7ed957',
            animation: 'grid-spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes grid-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      <iframe
        src={gridUrl}
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
    </div>
  )
}
