'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const handler = () => {
      // Auto-redirect when back online
      if (navigator.onLine) {
        router.replace('/app')
      }
    }
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [router])

  const handleRetry = async () => {
    setChecking(true)
    try {
      const res = await fetch('/app', { method: 'HEAD', cache: 'no-store' })
      if (res.ok) {
        router.replace('/app')
        return
      }
    } catch {
      // Still offline
    }
    setChecking(false)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 16,
      padding: '40px 24px',
      textAlign: 'center',
      color: 'var(--text-muted)',
    }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 56, height: 56, opacity: 0.4 }}
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 28,
        fontWeight: 700,
        color: 'var(--accent)',
        opacity: 0.6,
      }}>
        0nMCP
      </div>

      <h2 style={{
        fontSize: 18,
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
      }}>
        You&apos;re offline
      </h2>

      <p style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 300 }}>
        Check your connection and try again. Your saved add0ns and settings are still available locally.
      </p>

      <button
        onClick={handleRetry}
        disabled={checking}
        style={{
          marginTop: 8,
          background: 'var(--accent)',
          border: 'none',
          borderRadius: 8,
          padding: '12px 24px',
          color: 'var(--bg-primary)',
          fontWeight: 600,
          fontSize: 14,
          cursor: checking ? 'not-allowed' : 'pointer',
          opacity: checking ? 0.6 : 1,
        }}
      >
        {checking ? 'Checking...' : 'Retry connection'}
      </button>
    </div>
  )
}
