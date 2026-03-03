'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'

interface OAuthButtonsProps {
  mode?: 'signin' | 'signup'
  redirectTo?: string
}

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)

const PROVIDERS: { provider: Provider; label: string; Icon: React.FC; bg: string; color: string; hoverBg: string }[] = [
  { provider: 'linkedin_oidc' as Provider, label: 'LinkedIn', Icon: LinkedInIcon, bg: '#0A66C2', color: '#fff', hoverBg: '#004182' },
  { provider: 'google' as Provider, label: 'Google', Icon: GoogleIcon, bg: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', hoverBg: 'rgba(255,255,255,0.12)' },
  { provider: 'github' as Provider, label: 'GitHub', Icon: GitHubIcon, bg: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', hoverBg: 'rgba(255,255,255,0.12)' },
]

export default function OAuthButtons({ mode = 'signin', redirectTo = '/0nboarding' }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  async function handleOAuth(provider: Provider) {
    const supabase = createSupabaseBrowser()
    if (!supabase) return

    setLoadingProvider(provider as string)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'
    const callbackUrl = `${siteUrl}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        scopes: provider === 'linkedin_oidc'
          ? 'openid profile email w_member_social'
          : undefined,
      },
    })
  }

  const verb = mode === 'signin' ? 'Sign in' : 'Sign up'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {PROVIDERS.map(({ provider, label, Icon, bg, color, hoverBg }) => (
        <button
          key={provider}
          onClick={() => handleOAuth(provider)}
          disabled={!!loadingProvider}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            height: '48px',
            borderRadius: '0.5rem',
            border: bg.startsWith('#') ? 'none' : '1px solid var(--border)',
            background: bg,
            color,
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            cursor: loadingProvider ? 'wait' : 'pointer',
            opacity: loadingProvider && loadingProvider !== (provider as string) ? 0.5 : 1,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg }}
          onMouseLeave={(e) => { e.currentTarget.style.background = bg }}
        >
          {loadingProvider === (provider as string) ? (
            <span className="signup-spinner" />
          ) : (
            <Icon />
          )}
          {verb} with {label}
        </button>
      ))}
    </div>
  )
}
