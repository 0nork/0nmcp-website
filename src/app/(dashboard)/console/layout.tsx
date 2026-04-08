'use client'

/**
 * Console Layout — Wowdash App Shell
 * Pattern: SidebarProvider → Sidebar + Main (Header + Content + Footer)
 * Adapted from Wowdash MainLayout.tsx + SidebarLayout.tsx
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { WowdashSidebar } from '@/components/console/WowdashSidebar'
import { cn } from '@/lib/utils'
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
      <div className="min-h-screen bg-[#080B0F] flex items-center justify-center">
        <div className="size-9 border-2 border-neutral-700 border-t-primary rounded-full animate-spin" />
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
          try {
            await fetch('/api/auth/signout', { method: 'POST' })
          } catch { /* ignore */ }
          router.push('/login')
        }}
      />
      <main className="grow flex flex-col min-h-screen">
        {/* Header — Wowdash pattern */}
        <div className={cn(
          "bg-sidebar border-b border-neutral-700/30",
          "flex items-center justify-between h-[72px] shrink-0 gap-2 px-6 py-4",
          "sticky top-0 z-[2]"
        )}>
          {/* Left: Sidebar trigger + Search */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="!p-0 h-auto w-auto !bg-transparent cursor-pointer text-neutral-400 hover:text-white" />
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                document.dispatchEvent(event)
              }}
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <Search className="size-4" />
              <span className="text-sm hidden md:inline">Search...</span>
              <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500 border border-neutral-700">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Notifications */}
          <div className="flex items-center gap-3">
            <button className="relative text-neutral-400 hover:text-white transition-colors">
              <Bell className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />
            </button>
          </div>
        </div>

        {/* Content area — Wowdash dashboard-body pattern */}
        <div className="bg-[#1e2734] dark:bg-[#1e2734] p-4 md:p-6 flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-sidebar py-4 px-6 border-t border-neutral-700/30">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>&copy; {new Date().getFullYear()} RocketOpp LLC. All rights reserved.</span>
            <span className="text-primary font-medium">0nMCP</span>
          </div>
        </footer>
      </main>
    </SidebarProvider>
    </TooltipProvider>
  )
}
