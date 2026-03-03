'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'

interface UseOAuthPopupOptions {
  onSuccess?: (session: { user: { id: string; email?: string } }) => void
  onError?: (error: string) => void
  redirectTo?: string
}

export function useOAuthPopup(options: UseOAuthPopupOptions = {}) {
  const popupRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close()
    }
  }, [])

  const signIn = useCallback(async (provider: Provider) => {
    const supabase = createSupabaseBrowser()
    if (!supabase) {
      options.onError?.('Authentication service not configured')
      return
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'
    const redirectTo = options.redirectTo || '/0nboarding'
    const callbackUrl = `${siteUrl}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`

    // Get the OAuth URL without redirecting
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: true,
        scopes: provider === 'linkedin_oidc'
          ? 'openid profile email w_member_social'
          : undefined,
      },
    })

    if (error || !data?.url) {
      options.onError?.(error?.message || 'Failed to get auth URL')
      return
    }

    // Open centered popup
    const w = 500
    const h = 700
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    const features = `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`

    const popup = window.open(data.url, '0nMCP Sign In', features)

    // Fallback: if popup blocked, redirect normally
    if (!popup || popup.closed) {
      window.location.href = data.url
      return
    }

    popupRef.current = popup

    // Listen for auth state change on parent window
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        cleanup()
        options.onSuccess?.({ user: { id: session.user.id, email: session.user.email } })
      }
    })

    // Also poll for popup close (in case user closes it manually)
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        cleanup()
      }
    }, 500)

    function cleanup() {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      subscription.unsubscribe()
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }
      popupRef.current = null
    }
  }, [options])

  return { signIn }
}
