'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import OnTerminal from './OnTerminal'
import type { OnTerminalConfig } from './OnTerminalTypes'

interface AuthGatedTerminalProps extends OnTerminalConfig {
  requiredPlan?: 'free' | 'pro' | 'team' | 'enterprise'
  fallback?: React.ReactNode
}

export default function OnTerminalAuth({
  requiredPlan = 'free',
  fallback,
  ...config
}: AuthGatedTerminalProps) {
  const [auth, setAuth] = useState<{ user: any; plan: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setAuth({ user: session.user, plan: data?.plan || 'free' })
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) {
    return (
      <div className="on-terminal-container" style={{ padding: 40, textAlign: 'center' }}>
        <div className="on-terminal-loading">
          <div className="on-terminal-loading-spinner" />
          <div className="on-terminal-loading-text">AUTHENTICATING</div>
        </div>
      </div>
    )
  }

  if (!auth) {
    return fallback || (
      <div className="on-terminal-container" style={{ padding: 40, textAlign: 'center', color: '#3a4260' }}>
        Sign in to access the terminal
      </div>
    )
  }

  const planOrder = ['free', 'pro', 'team', 'enterprise']
  if (planOrder.indexOf(auth.plan) < planOrder.indexOf(requiredPlan)) {
    return (
      <div className="on-terminal-container" style={{ padding: 40, textAlign: 'center', color: '#ffc940' }}>
        Upgrade to {requiredPlan} to access the terminal
      </div>
    )
  }

  return (
    <OnTerminal
      {...config}
      session={{
        userId: auth.user.id,
        email: auth.user.email,
        plan: auth.plan as any,
      }}
    />
  )
}
