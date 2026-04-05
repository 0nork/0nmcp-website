'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { getMenuList } from '@/lib/menus'
import { Icon } from '@iconify/react'
import '@/app/jampack.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const router = useRouter()
  const pathname = usePathname()

  const menuList = getMenuList(pathname)

  useEffect(() => {
    // Load theme
    const saved = localStorage.getItem('0n-theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }

    // Load auth
    fetch('/api/console/account')
      .then(r => {
        if (!r.ok) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => {
        if (data) {
          setUserName(data.full_name || '')
          setUserEmail(data.email || '')
          setLoading(false)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('0n-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  async function handleLogout() {
    try {
      const supabase = createSupabaseBrowser()
      if (supabase) await supabase.auth.signOut()
    } catch { /* ignore */ }
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-default-100 dark:bg-background">
      {/* ── SIDEBAR ── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b border-border px-4', collapsed && 'justify-center')}>
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-8 w-8 items-center justify-center">
              0n
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-foreground">0nMCP</span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuList.map(group => (
            <div key={group.id} className="mb-4">
              {!collapsed && (
                <div className="px-4 mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.groupLabel}
                </div>
              )}
              {group.menus.map(menu => {
                const isActive = menu.active || pathname === menu.href
                return (
                  <div key={menu.id}>
                    <Link
                      href={menu.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors no-underline',
                        isActive
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        collapsed && 'justify-center px-2',
                      )}
                      title={collapsed ? menu.label : undefined}
                    >
                      <Icon icon={menu.icon} className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{menu.label}</span>}
                    </Link>
                    {/* Sub items */}
                    {!collapsed && isActive && menu.submenus.length > 0 && (
                      <div className="ml-8 mt-1 space-y-0.5">
                        {menu.submenus.map(sub => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'block py-1.5 px-3 text-xs rounded-md transition-colors no-underline',
                              sub.active
                                ? 'text-primary font-semibold bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Icon icon={collapsed ? 'heroicons-outline:chevron-right' : 'heroicons-outline:chevron-left'} className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={cn('flex flex-1 flex-col transition-all duration-300', collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]')}>
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              className="lg:hidden flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Icon icon="heroicons-outline:bars-3" className="h-5 w-5" />
            </button>
            {/* Breadcrumb */}
            <div className="text-sm font-medium text-foreground">
              {menuList.flatMap(g => g.menus).find(m => m.active)?.label || 'Dashboard'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={toggleTheme} className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors">
              <Icon icon={theme === 'light' ? 'heroicons-outline:moon' : 'heroicons-outline:sun'} className="h-5 w-5" />
            </button>
            {/* Profile */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-foreground">{userName || 'User'}</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Sign out"
              >
                <Icon icon="heroicons-outline:arrow-right-on-rectangle" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  )
}
