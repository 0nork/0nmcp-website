'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { WowdashSidebar } from '@/components/console/WowdashSidebar'
import { Search, Bell } from 'lucide-react'
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
        if (!r.ok) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => {
        if (data) {
          setLoading(false)
          setUserName(data.name || data.full_name || '')
          setUserEmail(data.email || '')
          setUserPlan(data.plan || 'free')
          // Safety: sync user to CRM on every console load (fire-and-forget)
          fetch('/api/auth/sync-crm', { method: 'POST' }).catch(() => {})
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="size-9 border-2 border-white/10 border-t-[#487fff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
    <SidebarProvider>
      <WowdashSidebar
        userName={userName}
        userEmail={userEmail}
        userPlan={userPlan}
        onSignOut={async () => {
          try { await fetch('/api/auth/signout', { method: 'POST' }) } catch {}
          router.push('/login')
        }}
      />
      <main className="grow flex flex-col min-h-screen bg-[#141414]">
        {/* Header */}
        <div className="bg-[#273142] border-b border-white/10 flex items-center justify-between h-[72px] shrink-0 gap-2 px-6 py-4 sticky top-0 z-[2]">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="!p-0 h-auto w-auto !bg-transparent cursor-pointer text-[#b4b4b4] hover:text-[#fafafa]" />
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="flex items-center gap-2 text-[#b4b4b4] hover:text-[#fafafa] transition-colors"
            >
              <Search className="size-4" />
              <span className="text-sm hidden md:inline">Search...</span>
              <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded-lg bg-white/5 text-[#b4b4b4] border border-white/10">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-[#b4b4b4] hover:text-[#fafafa] transition-colors">
              <Bell className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#487fff]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#141414] p-4 md:p-6 flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-[#273142] py-4 px-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-[#b4b4b4]">
            <span>&copy; {new Date().getFullYear()} RocketOpp LLC. All rights reserved.</span>
            <span className="text-[#487fff] font-medium">0nMCP</span>
          </div>
        </footer>
      </main>
    </SidebarProvider>
    </TooltipProvider>
  )
}
