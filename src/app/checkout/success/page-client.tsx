'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return }
    // Could verify session here — for now just show success
    setStatus('success')
  }, [sessionId])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '480px',
        padding: '3rem 2rem',
      }}>
        {status === 'loading' && (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Processing...</p>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(110, 224, 90, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6EE05A', marginBottom: '0.75rem' }}>
              You&apos;re 0n.
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Your subscription is active. Welcome to the 0n ecosystem.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/dashboard" style={{
                padding: '12px 24px', background: '#6EE05A', color: '#0B0F19',
                borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
              }}>
                Go to Dashboard
              </Link>
              <Link href="/learn" style={{
                padding: '12px 24px', background: 'var(--bg-card)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: '8px',
                fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
              }}>
                Start Learning
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
              Your payment may have been processed. Check your email for confirmation.
            </p>
            <Link href="/dashboard" style={{
              padding: '12px 24px', background: 'var(--bg-card)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
            }}>
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
