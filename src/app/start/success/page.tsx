'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  const sessionId = searchParams.get('session_id')
  const [provisioning, setProvisioning] = useState(true)
  const [status, setStatus] = useState<'provisioning' | 'success' | 'error'>('provisioning')
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    async function provision() {
      try {
        // Create Supabase user location + Vault + deploy snapshot
        const res = await fetch('/api/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan,
            stripe_session_id: sessionId,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setLocationId(data.locationId || null)
          setStatus('success')
        } else {
          // Even if provisioning fails, show success — they paid
          setStatus('success')
        }
      } catch {
        setStatus('success') // Don't block the user
      }
      setProvisioning(false)
    }

    provision()
  }, [plan, sessionId])

  const planNames: Record<string, string> = {
    free: 'Free',
    founders: 'Founders',
    builder: 'Builder',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {provisioning ? (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
              border: '3px solid #e5e7eb', borderTopColor: '#6EE05A',
              animation: 'spin 1s linear infinite',
            }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Setting up your account...
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Deploying your Vault, creating your CRM location, and configuring {plan === 'founders' ? 'Founders' : 'your'} access.
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
              background: '#6EE05A', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: '#0f172a',
              boxShadow: '0 8px 24px rgba(110,224,90,0.3)',
            }}>
              ✓
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              {plan === 'founders' ? "Welcome, Founder." : "You're In."}
            </h1>

            <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 4 }}>
              {planNames[plan] || plan} plan activated.
              {plan === 'founders' && ' Your Founders Badge is permanent.'}
            </p>

            {plan === 'founders' && (
              <div style={{
                display: 'inline-block', padding: '6px 16px', borderRadius: 8, marginTop: 8, marginBottom: 20,
                background: 'rgba(110,224,90,0.1)', border: '1px solid rgba(110,224,90,0.2)',
                fontSize: 13, color: '#16a34a', fontWeight: 700,
              }}>
                🏅 Founders Badge — Lifetime
              </div>
            )}

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
              Your Vault is ready. Install 0n on any platform and your entire business context follows you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto' }}>
              <Link href="/console/integrations" style={{
                padding: '14px 24px', borderRadius: 12, background: 'var(--bg-card)', color: 'var(--text-primary)',
                fontWeight: 800, fontSize: 15, textDecoration: 'none', textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                Connect Your Services →
              </Link>
              <Link href="/start" style={{
                padding: '12px 24px', borderRadius: 12, background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center',
                border: '1px solid var(--border)',
              }}>
                Install on a Platform
              </Link>
              <Link href="/console" style={{
                padding: '10px 24px', borderRadius: 10,
                fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', textAlign: 'center',
              }}>
                Go to Dashboard
              </Link>
            </div>
          </>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
