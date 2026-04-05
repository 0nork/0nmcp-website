'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import ConsoleSidebar from '@/components/console/ConsoleSidebar'
import ConsoleHeader from '@/components/console/ConsoleHeader'
import '@/app/jampack.css'

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check auth
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
          setUserName(data.full_name || '')
          setUserEmail(data.email || '')
          setLoading(false)
        }
      })
      .catch(() => {
        router.push('/login')
      })

    // Check admin
    fetch('/api/admin/users?stats=true')
      .then(r => { if (r.ok) setIsAdmin(true) })
      .catch(() => {})
  }, [router])

  async function handleLogout() {
    try {
      const supabase = createSupabaseBrowser()
      if (supabase) await supabase.auth.signOut()
    } catch { /* ignore */ }
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch { /* ignore */ }
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--jp-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '2px solid var(--jp-border)',
          borderTopColor: 'var(--jp-green)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div className="jp-wrapper" style={{ position: 'relative', minHeight: '100vh', zIndex: 1, ['--jp-nav-height' as string]: '0px' }}>
      <ConsoleSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
      />
      <div className="jp-main">
        {/* MegaNav is the main header now — only show mobile toggle */}
        <div style={{
          display: 'none',
          height: 48,
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid var(--jp-border)',
          background: 'var(--jp-bg-elevated)',
        }} className="jp-mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--jp-text)', cursor: 'pointer', padding: 8 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
        <main className="jp-content" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .jp-mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
