'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import ForumSidebar from '@/components/forum/ForumSidebar'
import ForumSearch from '@/components/forum/ForumSearch'

const TRENDING_POSTS = [
  {
    title: '0nMCP v2.2.0: 819 Tools Across 48 Services — Full Breakdown',
    date: 'Mar 1, 2026',
    slug: '0nmcp-v2-2-0-release',
  },
  {
    title: 'How to Build a Full CRM Automation with .0n SWITCH Files in 10 Minutes',
    date: 'Feb 27, 2026',
    slug: 'crm-automation-switch-files',
  },
  {
    title: 'The 0nVault Container System: Secure AI Brain Transfer Explained',
    date: 'Feb 24, 2026',
    slug: '0nvault-container-system',
  },
]

export default function ForumShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])

  let headerTitle = ''
  if (pathname === '/forum/new') headerTitle = 'New Thread'
  else if (pathname.startsWith('/forum/c/')) headerTitle = 'Group'
  else if (pathname !== '/forum' && pathname.startsWith('/forum/')) headerTitle = 'Thread'

  const handleGroupChange = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') {
      params.delete('group')
    } else {
      params.set('group', slug)
    }
    router.push(`/forum?${params.toString()}`)
    setMobileMenuOpen(false)
  }, [router, searchParams])

  function handleChatSend() {
    const text = chatInput.trim()
    if (!text) return
    setChatMessages(prev => [...prev, { role: 'user', text }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'AI assistant coming soon. In the meantime, search the forum or post a new thread.' }])
    }, 600)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block" style={{ height: '100%' }}>
        <ForumSidebar
          onGroupChange={handleGroupChange}
          activeGroup={searchParams.get('group') || 'all'}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(0,0,0,0.6)',
            }}
          />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
            <ForumSidebar
              onGroupChange={handleGroupChange}
              activeGroup={searchParams.get('group') || 'all'}
            />
          </div>
        </>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {/* Header with mobile menu button */}
        <header
          style={{
            flexShrink: 0,
            height: '3.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-secondary)',
                cursor: 'pointer', padding: '0.25rem', display: 'flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Mobile search toggle */}
            <button
              className="lg:hidden"
              onClick={() => setMobileSearchOpen(prev => !prev)}
              style={{
                background: mobileSearchOpen ? 'rgba(126,217,87,0.1)' : 'none',
                border: 'none',
                color: mobileSearchOpen ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                borderRadius: '6px',
                transition: 'color 0.2s, background 0.2s',
              }}
              title="Search forum"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            <img
              src="/brand/icon-green.png"
              alt="0n"
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Forum
            </span>
            {headerTitle && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                / {headerTitle}
              </span>
            )}
          </div>

          {/* Toggle + Chat button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* AI Chat button */}
            <button
              onClick={() => setChatOpen(true)}
              title="Ask AI"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'rgba(126,217,87,0.06)',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <span
                style={{
                  padding: '5px 14px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700,
                  background: 'var(--accent)', color: 'var(--bg-primary)',
                }}
              >
                Forum
              </span>
              <a
                href="/console"
                style={{
                  padding: '5px 14px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700,
                  textDecoration: 'none', background: 'transparent', color: 'var(--text-secondary)',
                }}
              >
                Console
              </a>
            </div>
          </div>
        </header>

        {/* Mobile search bar — slides in below header */}
        {mobileSearchOpen && (
          <div
            className="lg:hidden"
            style={{
              flexShrink: 0,
              padding: '0.5rem 1rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-primary)',
            }}
          >
            <ForumSearch />
          </div>
        )}

        {/* Scrollable content + right sidebar */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflow: 'auto' }}>
            {children}
          </main>

          {/* Desktop right sidebar — Trending Posts */}
          <aside
            className="hidden lg:flex"
            style={{
              width: '280px',
              flexShrink: 0,
              flexDirection: 'column',
              gap: '1rem',
              padding: '1.25rem 1rem',
              borderLeft: '1px solid var(--border)',
              overflowY: 'auto',
              background: 'var(--bg-primary)',
            }}
          >
            {/* Trending Posts */}
            <div>
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                marginBottom: '0.625rem',
              }}>
                Trending Posts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {TRENDING_POSTS.map(post => (
                  <a
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    style={{
                      display: 'block',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      marginBottom: '0.375rem',
                    }}>
                      {post.title}
                    </div>
                    <div style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.375rem',
                    }}>
                      {post.date}
                    </div>
                    <div style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                    }}>
                      Read more &rarr;
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Write a Post CTA */}
            <a
              href="/admin/blog"
              style={{
                display: 'block',
                padding: '0.625rem',
                borderRadius: '10px',
                background: 'rgba(126,217,87,0.08)',
                border: '1px solid rgba(126,217,87,0.25)',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(126,217,87,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(126,217,87,0.08)')}
            >
              Write a Post
            </a>
          </aside>
        </div>
      </div>

      {/* ===================== CHAT DRAWER ===================== */}
      {/* Backdrop */}
      {chatOpen && (
        <div
          onClick={() => setChatOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: '#000000',
          borderTop: '1px solid #1e1e2a',
          borderRadius: '18px 18px 0 0',
          height: chatOpen ? 'clamp(320px, 60vh, 540px)' : '0',
          overflow: 'hidden',
          transition: 'height 0.38s cubic-bezier(0.32, 0, 0, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: '0.75rem 1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '0.625rem',
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: '#2a2a3a',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ask 0n AI</span>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
              display: 'flex',
              borderRadius: '6px',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Message area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {chatMessages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>0n</div>
              <div>Ask anything about 0nMCP, workflows, or this community.</div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '0.5rem 0.875rem',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'rgba(126,217,87,0.12)' : '#111118',
                border: msg.role === 'user' ? '1px solid rgba(126,217,87,0.3)' : '1px solid #1e1e2a',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div style={{
          flexShrink: 0,
          padding: '0.625rem 1rem calc(0.625rem + env(safe-area-inset-bottom))',
          borderTop: '1px solid #111118',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end',
        }}>
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() } }}
            rows={1}
            placeholder="Ask about 0nMCP..."
            style={{
              flex: 1,
              background: '#111118',
              border: '1px solid #1e1e2a',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              padding: '0.625rem 0.875rem',
              fontSize: '0.9375rem',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              outline: 'none',
              minHeight: '44px',
            }}
          />
          <button
            onClick={handleChatSend}
            disabled={!chatInput.trim()}
            style={{
              flexShrink: 0,
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: chatInput.trim() ? 'var(--accent)' : '#1a1a25',
              border: 'none',
              cursor: chatInput.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              color: chatInput.trim() ? '#0a0a0f' : 'var(--text-muted)',
              fontFamily: 'inherit',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
