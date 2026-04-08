'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { PulseSidebar } from '@/components/console/PulseSidebar'
import { AppLauncher } from '@/components/console/AppLauncher'
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
            {/* Header toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Search */}
              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                  document.dispatchEvent(event)
                }}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none',
                  background: 'transparent', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              {/* App Launcher */}
              <AppLauncher />
              {/* Notifications bell */}
              <button
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none',
                  background: 'transparent', color: 'var(--text-muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent, #7ed957)',
                  boxShadow: '0 0 6px var(--accent-glow)',
                }} />
              </button>
            </div>
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
