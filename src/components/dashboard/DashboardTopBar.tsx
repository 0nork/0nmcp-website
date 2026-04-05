'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, Search, Bell, Settings, ChevronDown, Zap, LayoutGrid, BookOpen, Users, BarChart3, Code, X } from 'lucide-react'

export default function DashboardTopBar({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const megaRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/console/account')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUserName(data.full_name || '')
          setUserEmail(data.email || '')
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut: Cmd+K for search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(p => !p)
        setTimeout(() => searchRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') { setSearchOpen(false); setMegaMenuOpen(false); setDropdownOpen(false) }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const initials = userName
    ? userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : userEmail ? userEmail[0].toUpperCase() : '?'

  const megaMenuItems = [
    { section: 'Workspace', items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutGrid size={16} />, desc: 'Overview & stats' },
      { label: 'Projects', href: '/dashboard/projects', icon: <BarChart3 size={16} />, desc: 'Companies & tasks' },
      { label: 'Console', href: '/console', icon: <Code size={16} />, desc: 'Advanced tools' },
    ]},
    { section: 'Create', items: [
      { label: 'AI Generator', href: '/console/courses/generate', icon: <Zap size={16} />, desc: 'Generate content with AI' },
      { label: 'Workflow Builder', href: '/builder', icon: <Settings size={16} />, desc: 'Build .0n workflows' },
      { label: 'Canvas Builder', href: '/console/builder/canvas', icon: <LayoutGrid size={16} />, desc: 'Visual page builder' },
    ]},
    { section: 'Community', items: [
      { label: 'Forum', href: '/forum', icon: <Users size={16} />, desc: 'Connect with builders' },
      { label: 'Store', href: '/console/marketplace', icon: <BookOpen size={16} />, desc: 'Browse add-ons' },
      { label: 'Learn', href: '/learn', icon: <BookOpen size={16} />, desc: 'Courses & tutorials' },
    ]},
  ]

  return (
    <>
      <style>{`
        @keyframes topbar-fadein {
          from { opacity: 0; transform: translate3d(0, 8px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes topbar-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .topbar-dropdown { animation: topbar-fadein 0.3s ease-out forwards; }
        .topbar-mega { animation: topbar-slide-down 0.35s ease-out forwards; }
        .topbar-search-overlay { animation: topbar-fadein 0.2s ease-out forwards; }
        .topbar-btn { transition: all 0.2s ease; }
        .topbar-btn:hover { background: var(--border) !important; }
        .topbar-menu-item { transition: all 0.2s ease; border-radius: 8px; }
        .topbar-menu-item:hover { background: rgba(126,217,87,0.06) !important; }
        .topbar-avatar { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .topbar-avatar:hover { transform: scale(1.08); box-shadow: 0 0 0 2px rgba(126,217,87,0.3); }
      `}</style>

      <header style={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px',
        background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', zIndex: 50,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onMobileMenu && (
            <button onClick={onMobileMenu} className="topbar-btn md:hidden" style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6,
            }}>
              <Menu size={18} />
            </button>
          )}
          <button onClick={() => router.push('/dashboard')} style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0,
          }}>
            <img src="/brand/logo-white.png" alt="0nMCP" style={{ height: 22, objectFit: 'contain' }} />
          </button>

          {/* Mega Menu Toggle */}
          <div ref={megaRef} style={{ position: 'relative' }}>
            <button onClick={() => setMegaMenuOpen(p => !p)} className="topbar-btn" style={{
              background: megaMenuOpen ? 'var(--border)' : 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px 10px',
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit',
            }}>
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown size={12} style={{ transition: 'transform 0.2s ease', transform: megaMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>

            {megaMenuOpen && (
              <div className="topbar-mega" style={{
                position: 'absolute', left: 0, top: 42, width: 580,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.4)', zIndex: 100,
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
              }}>
                {megaMenuItems.map(section => (
                  <div key={section.section}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '4px 10px', marginBottom: 4 }}>
                      {section.section}
                    </div>
                    {section.items.map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setMegaMenuOpen(false)} className="topbar-menu-item" style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 10px',
                        textDecoration: 'none',
                      }}>
                        <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Search */}
          <button onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100) }} className="topbar-btn" style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
            padding: 6, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 6, fontSize: 12, fontFamily: 'inherit',
          }}>
            <Search size={16} />
            <span className="hidden sm:inline" style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>⌘K</span>
          </button>

          {/* Notifications */}
          <button className="topbar-btn" style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
            padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6, position: 'relative',
          }}>
            <Bell size={16} />
          </button>

          {/* Settings */}
          <button onClick={() => router.push('/console?view=account')} className="topbar-btn" style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
            padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6,
          }}>
            <Settings size={16} />
          </button>

          {/* Avatar Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 4 }}>
            <button onClick={() => setDropdownOpen(p => !p)} className="topbar-avatar" style={{
              width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--accent, #6EE05A), #00d4ff)',
              color: '#0B0F19', fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
            }}>
              {initials}
            </button>

            {dropdownOpen && (
              <div className="topbar-dropdown" style={{
                position: 'absolute', right: 0, top: 40, width: 240,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', zIndex: 100,
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{userName || 'User'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{userEmail}</div>
                </div>
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Projects', href: '/dashboard/projects' },
                  { label: 'Account Settings', href: '/console?view=account' },
                ].map(item => (
                  <button key={item.label} className="topbar-menu-item" onClick={() => { router.push(item.href); setDropdownOpen(false) }} style={{
                    width: '100%', textAlign: 'left' as const, padding: '8px 12px', border: 'none',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: 13,
                    cursor: 'pointer', fontFamily: 'inherit', display: 'block',
                  }}>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                  <button className="topbar-menu-item" onClick={async () => {
                    await fetch('/api/auth/signout', { method: 'POST' })
                    window.location.href = '/login'
                  }} style={{
                    width: '100%', textAlign: 'left' as const, padding: '8px 12px', border: 'none',
                    background: 'transparent', color: '#ff3b30', fontSize: 13,
                    cursor: 'pointer', fontFamily: 'inherit', display: 'block',
                  }}>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="topbar-search-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120,
        }} onClick={() => setSearchOpen(false)}>
          <div style={{
            width: '100%', maxWidth: 540, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10, borderBottom: '1px solid var(--border)' }}>
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tools, pages, projects..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 15, fontFamily: 'inherit',
                }}
              />
              <button onClick={() => setSearchOpen(false)} style={{
                background: 'var(--border)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: 'var(--text-muted)',
                fontSize: 11, fontFamily: 'var(--font-mono)',
              }}>ESC</button>
            </div>
            <div style={{ padding: 12, maxHeight: 320, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '4px 8px', marginBottom: 4 }}>
                Quick Access
              </div>
              {[
                { label: 'Dashboard', href: '/dashboard', icon: '📊' },
                { label: 'Projects', href: '/dashboard/projects', icon: '📁' },
                { label: 'Console', href: '/console', icon: '⚡' },
                { label: 'Store', href: '/console/marketplace', icon: '🏪' },
                { label: 'Forum', href: '/forum', icon: '💬' },
                { label: 'AI Generator', href: '/console/courses/generate', icon: '🤖' },
              ].filter(item => !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                <Link key={item.label} href={item.href} onClick={() => setSearchOpen(false)} className="topbar-menu-item" style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', textDecoration: 'none',
                }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
