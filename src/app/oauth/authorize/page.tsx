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

export default function OAuthAuthorizePage() {
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
  const codeChallenge = searchParams.get('code_challenge') || ''
  const codeChallengeMethod = searchParams.get('code_challenge_method') || ''
  const appName = searchParams.get('app_name') || clientId || 'Unknown Application'
  const appLogoUrl = searchParams.get('app_logo_url') || ''

  const scopes = scope.split(' ').filter(Boolean)

  return (
    <div className="onboarding-container">
      <div className="onboarding-card fadeInUp" style={{ maxWidth: 480 }}>
        <form method="POST" action="/api/oauth/authorize">
          {/* Hidden OAuth params */}
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="hidden" name="scope" value={scope} />
          <input type="hidden" name="state" value={state} />
          <input type="hidden" name="response_type" value={responseType} />
          {codeChallenge && <input type="hidden" name="code_challenge" value={codeChallenge} />}
          {codeChallengeMethod && <input type="hidden" name="code_challenge_method" value={codeChallengeMethod} />}

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {appLogoUrl && (
              <img
                src={appLogoUrl}
                alt={appName}
                style={{ width: 48, height: 48, borderRadius: 12, marginBottom: '0.75rem' }}
              />
            )}
            <div className="onboarding-product-logo" style={{ justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              <span className="onboarding-product-bracket" style={{ color: 'var(--accent)' }}>[</span>
              <span className="onboarding-product-name">0n</span>
              <span className="onboarding-product-bracket" style={{ color: 'var(--accent)' }}>]</span>
            </div>
            <h1 className="onboarding-title" style={{ marginBottom: '0.5rem' }}>
              Authorize {appName}
            </h1>
            <p className="onboarding-subtitle">
              This application wants to access your 0n account.
            </p>
          </div>

          {/* Scope pills */}
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

          {/* Trust badge */}
          <div className="onboarding-trust" style={{ marginBottom: '1.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span>This app will never see your password or vault keys</span>
          </div>

          {/* Actions */}
          <div className="onboarding-actions">
            <button type="submit" name="action" value="deny" className="auth-btn secondary">
              Deny
            </button>
            <button type="submit" name="action" value="allow" className="auth-btn primary">
              Allow
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
