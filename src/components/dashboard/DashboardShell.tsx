'use client'

import { useState, useEffect } from 'react'
import DashboardTopBar from './DashboardTopBar'
import { BackendSidebar, BackendSidebarProvider } from './BackendSidebar'
import DashboardRightSidebar from './DashboardRightSidebar'
import AuthModal from '@/components/AuthModal'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [connectedCount,  setConnectedCount]  = useState(0)
  const [mcpOnline,       setMcpOnline]       = useState(false)
  const [isAdmin,         setIsAdmin]         = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [showAuthModal,   setShowAuthModal]   = useState(false)
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false)

  const handleOpenVault = () => {
    const isConsole = window.location.pathname.startsWith('/console')
    if (isConsole) {
      window.dispatchEvent(new CustomEvent('0n:open-vault'))
    } else {
      window.location.href = '/console?view=vault'
    }
  }

  useEffect(() => {
    fetch('/api/console/account')
      .then(r => { if (!r.ok) { setIsAuthenticated(false); setShowAuthModal(true) } })
      .catch(() => { setIsAuthenticated(false); setShowAuthModal(true) })

    fetch('/api/admin/users?stats=true')
      .then(r => { if (r.ok) setIsAdmin(true) })
      .catch(() => {})

    fetch('/api/console/health')
      .then(r => r.json())
      .then(data => {
        const online = data.status === 'online' || data.status === 'cloud'
        setMcpOnline(online)
        if (data.connections) setConnectedCount(data.connections)
      })
      .catch(() => {})

    fetch('/api/console/vault/status')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.connectedCount != null) setConnectedCount(data.connectedCount)
        else if (data?.connected != null) setConnectedCount(data.connected)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/console/health')
        .then(r => r.json())
        .then(data => {
          const online = data.status === 'online' || data.status === 'cloud'
          setMcpOnline(online)
          if (data.connections) setConnectedCount(data.connections)
        })
        .catch(() => setMcpOnline(false))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BackendSidebarProvider connectedCount={connectedCount} mcpOnline={mcpOnline} isAdmin={isAdmin}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <DashboardTopBar onMobileMenu={() => setMobileMenuOpen(p => !p)} />

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 md:hidden"
              style={{ backgroundColor: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <div
            className={`fixed md:relative z-50 h-[calc(100vh-48px)] transition-transform duration-300 md:translate-x-0 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <BackendSidebar />
          </div>

          <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
            {children}
          </main>

          {/* Floating right sidebar — sits outside content flow */}
          <div className="hidden md:block">
            <DashboardRightSidebar
              connectedCount={connectedCount}
              onOpenVault={handleOpenVault}
            />
          </div>

        </div>
      </div>

      {!isAuthenticated && (
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setIsAuthenticated(true)
            setShowAuthModal(false)
            window.location.reload()
          }}
        />
      )}
    </BackendSidebarProvider>
  )
}
