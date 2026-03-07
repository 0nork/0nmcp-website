'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Menu, Server, Zap, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { StatusDot } from './StatusDot'

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  chat: 'Chat',
  community: 'Community',
  builder: 'Builder',
  vault: 'Vault',
  flows: 'Create Workflow',
  operations: 'Operations',
  social: 'Social Hub',
  reporting: 'Reporting',
  migrate: 'Migrate Workflows',
  store: 'Store',
  linkedin: 'LinkedIn',
  request: 'Request Integration',
  history: 'History',
  terminal: 'Terminal',
  code: '0n Code',
  convert: 'Convert',
  account: 'Account',
  admin: 'Admin',
  spark: 'Spark Runner',
}

interface HeaderProps {
  view: string
  mcpOnline: boolean
  mcpMode?: string
  connectedCount: number
  userPlan: string
  userName?: string
  userEmail?: string
  onCmdK: () => void
  onMobileMenu: () => void
  onUpgradeClick: () => void
  onAccountClick: () => void
}

export function Header({ view, mcpOnline, mcpMode, connectedCount, userPlan, userName, userEmail, onCmdK, onMobileMenu, onUpgradeClick, onAccountClick }: HeaderProps) {
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    if (avatarOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [avatarOpen])

  const initials = userName ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : userEmail ? userEmail[0].toUpperCase() : '?'

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }
  return (
    <header
      className="shrink-0 h-14 flex items-center justify-between px-4 md:px-6 lg:px-8 relative z-10"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: mobile menu + logo + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenu}
          className="md:hidden p-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          {/* Console logo — full on desktop, icon only on mobile */}
          <img
            src="/brand/0n-console.png"
            alt="0n Console"
            className="hidden sm:block"
            style={{ height: 28, objectFit: 'contain' }}
          />
          <img
            src="/brand/icon-green.png"
            alt="0n"
            className="sm:hidden"
            style={{ width: 24, height: 24, objectFit: 'contain' }}
          />
          {view !== 'dashboard' && (
            <span
              className="text-sm font-medium hidden sm:inline"
              style={{ color: 'var(--text-muted)' }}
            >
              / {VIEW_LABELS[view] || view}
            </span>
          )}
        </div>
      </div>

      {/* Right: status + search + vault counter */}
      <div className="flex items-center gap-3">
        {/* Forum/Console toggle */}
        <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <a
            href="/forum"
            style={{
              padding: '5px 14px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700,
              textDecoration: 'none', background: 'transparent', color: 'var(--text-secondary)',
            }}
          >
            Forum
          </a>
          <span
            style={{
              padding: '5px 14px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700,
              background: 'var(--accent)', color: 'var(--bg-primary)',
            }}
          >
            Console
          </span>
        </div>

        {/* 0nMCP status badge with mode */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            backgroundColor: mcpOnline
              ? mcpMode === 'local' ? 'rgba(126,217,87,0.06)' : 'rgba(0,212,255,0.06)'
              : 'rgba(255,255,255,0.04)',
            border: mcpOnline
              ? mcpMode === 'local' ? '1px solid rgba(126,217,87,0.2)' : '1px solid rgba(0,212,255,0.2)'
              : '1px solid var(--border)',
          }}
        >
          <Server
            size={12}
            style={{ color: mcpOnline ? (mcpMode === 'local' ? '#7ed957' : '#00d4ff') : 'var(--text-muted)' }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: mcpOnline ? (mcpMode === 'local' ? '#7ed957' : '#00d4ff') : 'var(--text-muted)' }}
          >
            {mcpOnline ? '0nMCP' : 'Offline'}
          </span>
          {mcpOnline && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
                background: mcpMode === 'local' ? 'rgba(126,217,87,0.15)' : 'rgba(0,212,255,0.15)',
                color: mcpMode === 'local' ? '#7ed957' : '#00d4ff',
              }}
            >
              {mcpMode === 'local' ? 'LOCAL' : 'CLOUD'}
            </span>
          )}
          <StatusDot status={mcpOnline ? 'online' : 'offline'} />
        </div>

        {/* Cmd+K search */}
        <button
          onClick={onCmdK}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <Search size={14} />
          <span className="text-xs hidden sm:inline">Search...</span>
          <kbd
            className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {'\u2318'}K
          </kbd>
        </button>

        {/* Upgrade / Plan badge */}
        {userPlan === 'free' || !userPlan ? (
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all"
            style={{
              background: 'rgba(126,217,87,0.1)',
              border: '1px solid rgba(126,217,87,0.3)',
              color: '#7ed957',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(126,217,87,0.18)'
              e.currentTarget.style.borderColor = 'rgba(126,217,87,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(126,217,87,0.1)'
              e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)'
            }}
          >
            <Zap size={12} />
            Upgrade
            <style>{`
              @keyframes pulseGlow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(126,217,87,0); }
                50% { box-shadow: 0 0 8px 2px rgba(126,217,87,0.15); }
              }
            `}</style>
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: userPlan === 'team' ? 'rgba(0,212,255,0.06)' : 'rgba(126,217,87,0.06)',
              border: `1px solid ${userPlan === 'team' ? 'rgba(0,212,255,0.2)' : 'rgba(126,217,87,0.2)'}`,
            }}
          >
            <span
              className="text-xs font-semibold uppercase"
              style={{ color: userPlan === 'team' ? '#00d4ff' : '#7ed957' }}
            >
              {userPlan}
            </span>
          </div>
        )}

        {/* Vault counter */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
          }}
        >
          <StatusDot status={connectedCount > 0 ? 'online' : 'unknown'} />
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
          >
            {connectedCount}
          </span>
        </div>

        {/* User Avatar + Dropdown */}
        <div ref={avatarRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setAvatarOpen(p => !p)}
            className="flex items-center gap-2 rounded-lg transition-all cursor-pointer"
            style={{
              padding: '4px 8px 4px 4px',
              border: avatarOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: avatarOpen ? 'rgba(126,217,87,0.06)' : 'rgba(255,255,255,0.04)',
            }}
            onMouseEnter={(e) => { if (!avatarOpen) e.currentTarget.style.borderColor = 'var(--border-hover)' }}
            onMouseLeave={(e) => { if (!avatarOpen) e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0a0a0f' }}>{initials}</span>
            </div>
            <ChevronDown
              size={12}
              className="hidden sm:block"
              style={{
                color: 'var(--text-muted)',
                transform: avatarOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {avatarOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 240,
                backgroundColor: '#0a0a0f',
                border: '1px solid var(--border)',
                borderRadius: 14,
                boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(126,217,87,0.05)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'avatarDrop 0.15s ease',
              }}
            >
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {userName || 'User'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {userEmail || ''}
                </div>
                {userPlan && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      background: userPlan === 'free' ? 'rgba(255,255,255,0.06)' : 'rgba(126,217,87,0.12)',
                      color: userPlan === 'free' ? 'var(--text-muted)' : 'var(--accent)',
                      border: `1px solid ${userPlan === 'free' ? 'var(--border)' : 'rgba(126,217,87,0.3)'}`,
                    }}
                  >
                    {userPlan}
                  </span>
                )}
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => { setAvatarOpen(false); onAccountClick() }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <Settings size={14} />
                  Account Settings
                </button>

                <button
                  onClick={() => { setAvatarOpen(false); window.open('/forum', '_self') }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <User size={14} />
                  My Profile
                </button>
              </div>

              {/* Sign out */}
              <div style={{ padding: '6px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'none',
                    color: '#ff3b30',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,48,0.08)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>

              <style>{`
                @keyframes avatarDrop {
                  from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
