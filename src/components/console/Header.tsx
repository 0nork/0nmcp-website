'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Menu, Zap, User, LogOut, Settings, ChevronDown, AlertTriangle } from 'lucide-react'
import { StatusDot } from './StatusDot'
import { getLogoSrc } from './logo-map'

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  chat: 'Chat',
  vault: 'Vault',
  flows: 'Create',
  engine: '0nEngine',
  builder: 'Builder',
  store: 'Store',
  training: 'Brain',
  runs: 'Runs Manager',
  sync: 'Sync',
  outreach: 'Enricher',
  listkit: 'ListKit',
  linkedin: 'LinkedIn',
  social: 'Social',
  reporting: 'Reporting',
  vendor: 'Vendor Hub',
  account: 'Account',
  admin: 'Admin',
  operations: 'Operations',
  code: 'Code',
  convert: 'Converter',
  migrate: 'Migrate',
  community: 'Community',
  terminal: 'Terminal',
  affiliate: 'Affiliates',
  downloads: 'Downloads',
  blog: '0nBlog',
}

const CORE_AI_LABELS: Record<string, { label: string; color: string }> = {
  anthropic: { label: 'Claude', color: '#a78bfa' },
  openai: { label: 'GPT-4o', color: '#10a37f' },
  gemini: { label: 'Gemini', color: '#4285f4' },
  groq: { label: 'Groq', color: '#f55036' },
  openrouter: { label: 'OpenRouter', color: '#f97316' },
  perplexity: { label: 'Perplexity', color: '#22d3ee' },
}

interface HeaderProps {
  view: string
  mcpOnline: boolean
  mcpMode?: string
  connectedCount: number
  userPlan: string
  userName?: string
  userEmail?: string
  coreAI?: string | null
  runCount?: number | null
  runLimit?: number | null
  isOwner?: boolean
  onCmdK: () => void
  onMobileMenu: () => void
  onUpgradeClick: () => void
  onAccountClick: () => void
  onSetupAI?: () => void
  onNavigateVault?: () => void
}

export function Header({ view, mcpOnline, mcpMode, connectedCount, userPlan, userName, userEmail, coreAI, runCount, runLimit, isOwner, onCmdK, onMobileMenu, onUpgradeClick, onAccountClick, onSetupAI, onNavigateVault }: HeaderProps) {
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!avatarOpen) return
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen])

  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : userEmail ? userEmail[0].toUpperCase() : '?'

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch { /* ignore */ }
    // Clear any local state and redirect
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    window.location.href = '/login'
  }

  return (
    <header style={{
      height: 56,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.25rem',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMobileMenu}
          className="md:hidden"
          style={{ background: 'none', border: 'none', color: '#808090', cursor: 'pointer', padding: 4 }}
        >
          <Menu size={20} />
        </button>

        {view !== 'dashboard' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#3a3a4a', fontSize: '0.875rem' }}>/</span>
            <span style={{ color: '#e2e2e8', fontSize: '0.875rem', fontWeight: 600 }}>
              {VIEW_LABELS[view] || view}
            </span>
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* MCP status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <StatusDot status={mcpOnline ? 'online' : 'offline'} />
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: mcpOnline ? '#7ed957' : '#4a4a5a',
          }}>
            {mcpOnline ? (mcpMode === 'local' ? 'Local' : 'Cloud') : 'Offline'}
          </span>
        </div>

        {/* Search */}
        <button
          onClick={onCmdK}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#68687a',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
        >
          <Search size={13} />
          <span className="hidden sm:inline" style={{ fontSize: '0.75rem' }}>Search</span>
          <kbd className="hidden sm:inline" style={{
            fontSize: '0.6rem',
            padding: '2px 5px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#4a4a5a',
            fontFamily: 'var(--font-mono)',
          }}>
            {'\u2318'}K
          </kbd>
        </button>

        {/* Core AI Badge / Warning */}
        {coreAI ? (() => {
          const info = CORE_AI_LABELS[coreAI]
          const logo = getLogoSrc(coreAI)
          return (
            <button
              onClick={onNavigateVault}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8,
                background: `${info?.color || '#7ed957'}08`,
                border: `1px solid ${info?.color || '#7ed957'}20`,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${info?.color || '#7ed957'}40` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${info?.color || '#7ed957'}20` }}
            >
              {logo ? (
                <img src={logo} alt="" width={14} height={14} style={{ borderRadius: 3 }} />
              ) : null}
              <span className="hidden sm:inline" style={{ fontSize: '0.7rem', fontWeight: 600, color: info?.color || '#7ed957' }}>
                {info?.label || coreAI}
              </span>
            </button>
          )
        })() : (
          <button
            onClick={onSetupAI}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8,
              background: 'rgba(255,107,53,0.06)',
              border: '1px solid rgba(255,107,53,0.2)',
              cursor: 'pointer', fontFamily: 'inherit',
              animation: 'headerPulse 2s ease infinite',
            }}
          >
            <AlertTriangle size={12} style={{ color: '#ff6b35' }} />
            <span className="hidden sm:inline" style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ff6b35' }}>
              Set up AI
            </span>
          </button>
        )}

        {/* Spark Counter */}
        {(runCount !== undefined && runCount !== null) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Zap size={11} style={{
              color: isOwner ? '#7ed957'
                : runLimit && runCount / runLimit > 0.5 ? '#7ed957'
                : runLimit && runCount / runLimit > 0.1 ? '#f59e0b'
                : '#ef4444'
            }} />
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: isOwner ? '#7ed957' : 'var(--text-secondary)',
            }}>
              {isOwner ? '\u221E' : runLimit ? `${runCount}/${runLimit}` : runCount}
            </span>
          </div>
        )}

        {/* Plan badge */}
        {(userPlan === 'free' || !userPlan) ? (
          <button
            onClick={onUpgradeClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 8,
              background: 'rgba(126,217,87,0.06)',
              border: '1px solid rgba(126,217,87,0.15)',
              color: '#7ed957',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Zap size={12} />
            <span className="hidden sm:inline">Upgrade</span>
          </button>
        ) : (
          <span style={{
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: '0.625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            background: 'rgba(126,217,87,0.06)',
            color: '#7ed957',
            border: '1px solid rgba(126,217,87,0.12)',
          }}>
            {userPlan}
          </span>
        )}

        {/* Avatar */}
        <div ref={avatarRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setAvatarOpen(p => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px 3px 3px',
              borderRadius: 8,
              border: `1px solid ${avatarOpen ? 'rgba(126,217,87,0.2)' : 'rgba(255,255,255,0.06)'}`,
              background: avatarOpen ? 'rgba(126,217,87,0.04)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0f1419' }}>{initials}</span>
            </div>
            <ChevronDown
              size={12}
              className="hidden sm:block"
              style={{
                color: '#4a4a5a',
                transform: avatarOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {avatarOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 220,
              background: '#0d0d14',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'headerDrop 0.12s ease',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e8', marginBottom: 2 }}>
                  {userName || 'User'}
                </div>
                <div style={{ fontSize: 11, color: '#4a4a5a', fontFamily: 'var(--font-mono)' }}>
                  {userEmail}
                </div>
                {userPlan && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 5,
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: userPlan === 'free' ? 'rgba(255,255,255,0.04)' : 'rgba(126,217,87,0.08)',
                    color: userPlan === 'free' ? '#4a4a5a' : '#7ed957',
                    border: `1px solid ${userPlan === 'free' ? 'rgba(255,255,255,0.06)' : 'rgba(126,217,87,0.15)'}`,
                  }}>
                    {userPlan}
                  </span>
                )}
              </div>

              {/* Menu */}
              <div style={{ padding: 4 }}>
                {[
                  { icon: <Settings size={14} />, label: 'Account', action: () => { setAvatarOpen(false); onAccountClick() } },
                  { icon: <User size={14} />, label: 'Profile', action: () => { setAvatarOpen(false); window.location.href = '/forum' } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'none',
                      color: '#808090',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e2e8' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#808090' }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <div style={{ padding: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'none',
                    color: '#ef4444',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>

              <style>{`
                @keyframes headerDrop {
                  from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes headerPulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
