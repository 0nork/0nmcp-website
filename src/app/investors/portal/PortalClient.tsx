'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type VerifyResult = {
  valid: boolean
  name?: string
  email?: string
  signed_at?: string
  error?: string
}

type Tab = 'deck' | 'onesheet'

export default function PortalClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [info, setInfo] = useState<VerifyResult | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('deck')

  const verify = useCallback(async () => {
    if (!token) {
      setStatus('invalid')
      return
    }

    try {
      const res = await fetch(`/api/investors/verify?token=${encodeURIComponent(token)}`)
      const data: VerifyResult = await res.json()

      if (data.valid) {
        setInfo(data)
        setStatus('valid')
      } else {
        setInfo(data)
        setStatus('invalid')
      }
    } catch {
      setStatus('invalid')
    }
  }, [token])

  useEffect(() => {
    verify()
  }, [verify])

  if (status === 'loading') {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid rgba(126,217,87,0.2)',
              borderTopColor: '#7ed957',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }}
          />
          <p style={{ color: '#94a3b8', fontSize: 15 }}>Verifying access...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 480,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 48,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: 'rgba(239,68,68,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 28,
              color: '#ef4444',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>Access Denied</h2>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            {info?.error === 'Access has been revoked'
              ? 'Your access to these materials has been revoked.'
              : info?.error === 'Token has expired'
                ? 'Your access token has expired. Please sign a new NDA to regain access.'
                : 'This link is invalid or has expired. Please sign the NDA to access investor materials.'}
          </p>
          <button
            onClick={() => router.push('/investors')}
            style={{
              background: '#7ed957',
              color: '#000',
              border: 'none',
              padding: '14px 32px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-display, "Instrument Sans", sans-serif)',
            }}
          >
            Sign NDA
          </button>
        </div>
      </div>
    )
  }

  const signedDate = info?.signed_at
    ? new Date(info.signed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const tabs: { key: Tab; label: string; src: string }[] = [
    { key: 'deck', label: 'Pitch Deck', src: '/investors/pitch-deck.html' },
    { key: 'onesheet', label: 'One-Sheet', src: '/investors/onesheet.html' },
  ]

  return (
    <div style={{ padding: '24px 24px 0', maxWidth: 1400, margin: '0 auto' }}>
      {/* Confidential Banner */}
      <div
        style={{
          background: 'rgba(126,217,87,0.06)',
          border: '1px solid rgba(126,217,87,0.15)',
          borderRadius: 12,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ fontSize: 13, color: '#7ed957', fontWeight: 600, fontFamily: 'var(--font-mono, monospace)', letterSpacing: 1 }}>
            CONFIDENTIAL
          </span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>
            NDA signed by {info?.name} on {signedDate}
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          Access expires 30 days from signing
        </span>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          padding: 4,
          border: '1px solid rgba(255,255,255,0.06)',
          width: 'fit-content',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-display, "Instrument Sans", sans-serif)',
              transition: 'all 0.2s',
              background: activeTab === tab.key ? 'rgba(126,217,87,0.12)' : 'transparent',
              color: activeTab === tab.key ? '#7ed957' : '#94a3b8',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          overflow: 'hidden',
          minHeight: 'calc(100vh - 240px)',
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.key}
            style={{
              display: activeTab === tab.key ? 'block' : 'none',
              height: 'calc(100vh - 240px)',
            }}
          >
            <iframe
              src={tab.src}
              title={tab.label}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
