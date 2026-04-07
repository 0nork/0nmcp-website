'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { PulseSidebar } from '@/components/console/PulseSidebar'
import { Separator } from '@/components/ui/separator'
import '@/app/console.css'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPlan, setUserPlan] = useState('free')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/console/account')
      .then(r => {
        if (!r.ok) {
          router.push('/login')
          return null
        }
        return r.json()
      })
      .then(data => {
        if (data) {
          setLoading(false)
          setUserName(data.name || data.full_name || '')
          setUserEmail(data.email || '')
          setUserPlan(data.plan || 'free')
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <PulseSidebar
          userName={userName}
          userEmail={userEmail}
          userPlan={userPlan}
          onSignOut={async () => {
            try {
              await fetch('/api/auth/signout', { method: 'POST' })
            } catch { /* ignore */ }
            router.push('/login')
          }}
        />
        <SidebarInset>
          <header
            className="console-pulse-header"
            style={{
              position: 'sticky', top: 0, zIndex: 40,
              display: 'flex', height: 56, alignItems: 'center', gap: 8,
              padding: '0 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              backdropFilter: 'blur(12px)',
              flexShrink: 0,
            }}
          >
            <SidebarTrigger
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                background: 'transparent', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            />
            <Separator orientation="vertical" style={{ height: 24 }} />
            <div style={{ flex: 1 }} />
            {/* Header tools will be added from the page */}
            <div id="console-header-tools" />
          </header>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', minHeight: 0,
            background: 'var(--bg-primary)',
          }}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
