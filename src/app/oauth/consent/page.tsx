'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const SCOPE_LABELS: Record<string, string> = {
  openid: 'Verify your identity',
  email: 'View your email address',
  profile: 'View your profile information',
  'read:vault': 'Read your vault credentials',
  'write:vault': 'Manage your vault credentials',
  'read:workflows': 'View your workflow files',
  'write:workflows': 'Manage your workflow files',
}

export default function OAuthConsentPage() {
  return (
    <Suspense>
      <ConsentForm />
    </Suspense>
  )
}

function ConsentForm() {
  const searchParams = useSearchParams()

  const clientId = searchParams.get('client_id') || ''
  const redirectUri = searchParams.get('redirect_uri') || ''
  const scope = searchParams.get('scope') || 'openid'
  const state = searchParams.get('state') || ''
  const responseType = searchParams.get('response_type') || 'code'

  const scopes = scope.split(' ').filter(Boolean)
  const appName = clientId || 'Unknown Application'

  function handleAllow() {
    // Build the Supabase authorize URL with consent=true
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) return

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      response_type: responseType,
      consent: 'true',
    })

    window.location.href = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`
  }

  function handleDeny() {
    if (redirectUri) {
      const sep = redirectUri.includes('?') ? '&' : '?'
      window.location.href = `${redirectUri}${sep}error=access_denied&state=${encodeURIComponent(state)}`
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card fadeInUp" style={{ maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="onboarding-product-logo" style={{ justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            <span className="onboarding-product-bracket" style={{ color: 'var(--accent)' }}>[</span>
            <span className="onboarding-product-name">0n</span>
            <span className="onboarding-product-bracket" style={{ color: 'var(--accent)' }}>]</span>
          </div>
          <h1 className="onboarding-title" style={{ marginBottom: '0.5rem' }}>Authorize {appName}</h1>
          <p className="onboarding-subtitle">
            This application wants to access your 0n account.
          </p>
        </div>

        <div className="oauth-scope-list">
          {scopes.map(s => (
            <div key={s} className="oauth-scope-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span>{SCOPE_LABELS[s] || s}</span>
            </div>
          ))}
        </div>

        <div className="onboarding-trust" style={{ marginBottom: '1.5rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
          <span>This app will never see your password or vault keys</span>
        </div>

        <div className="onboarding-actions">
          <button className="auth-btn secondary" onClick={handleDeny}>
            Deny
          </button>
          <button className="auth-btn primary" onClick={handleAllow}>
            Allow
          </button>
        </div>
      </div>
    </div>
  )
}
