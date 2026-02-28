'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const OnTerminal = dynamic(
  () => import('@/components/terminal/OnTerminal'),
  { ssr: false }
)

export default function TerminalPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) {
      router.push('/login')
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        background: '#060810',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{
          width: 24, height: 24,
          border: '2px solid rgba(0,255,102,0.2)',
          borderTopColor: '#00ff66',
          borderRadius: '50%',
          animation: 'on-terminal-spin 0.8s linear infinite',
        }} />
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 12,
          color: '#3a4260',
          letterSpacing: 2,
        }}>
          LOADING TERMINAL
        </div>
        <style>{`@keyframes on-terminal-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', background: '#060810' }}>
      <OnTerminal
        height="100vh"
        enableNode={true}
        enablePython={true}
        enablePreview={true}
        session={{
          userId: session.user.id,
          email: session.user.email,
          plan: 'pro',
        }}
        onCommand={(cmd, runtime) => {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'terminal_command', {
              event_category: 'terminal',
              event_label: runtime,
              value: cmd.split(' ')[0],
            })
          }
        }}
      />
    </div>
  )
}
