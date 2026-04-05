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
    <div className="jp-wrapper" style={{ position: 'relative', minHeight: '100vh', zIndex: 1 }}>
      <ConsoleSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={isAdmin}
      />
      <div className="jp-main">
        <ConsoleHeader
          userEmail={userEmail}
          userName={userName}
          onMenuToggle={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="jp-content" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
