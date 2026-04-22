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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const avatarRef = useRef<HTMLDivElement>(null)

  // Console defaults to dark mode
  useEffect(() => {
    const saved = localStorage.getItem('0n-theme') as 'light' | 'dark' | null
    const initial = saved || 'dark'
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('0n-theme', next)
    localStorage.setItem('0n-theme-mode', next)
    document.documentElement.setAttribute('data-theme', next)
  }

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
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    window.location.href = '/login'
  }

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-[var(--bg-primary)] border-b border-[var(--border)] relative z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenu}
          className="md:hidden bg-transparent border-none text-[#808090] cursor-pointer p-1"
        >
          <Menu size={20} />
        </button>

        {view !== 'dashboard' && (
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] text-sm">/</span>
            <span className="text-[var(--text-primary)] text-sm font-semibold">
              {VIEW_LABELS[view] || view}
            </span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* MCP status */}
        <div className="flex items-center gap-1.5 py-[5px] px-2.5 rounded-lg bg-white/[0.02] border border-[var(--border)]">
          <StatusDot status={mcpOnline ? 'online' : 'offline'} />
          <span className={`text-[0.7rem] font-semibold ${mcpOnline ? 'text-[#6EE05A]' : 'text-[#4a4a5a]'}`}>
            {mcpOnline ? (mcpMode === 'local' ? 'Local' : 'Cloud') : 'Offline'}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.02] border border-[var(--border)] text-[var(--text-muted)] cursor-pointer transition-all duration-150"
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          )}
        </button>

        {/* Token */}
        <a
          href="/connect/token"
          title="Access Token"
          className="flex items-center gap-[5px] py-[5px] px-2.5 rounded-lg bg-white/[0.02] border border-[var(--border)] text-[var(--text-muted)] no-underline text-[0.7rem] font-semibold cursor-pointer transition-all duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <span className="hidden sm:inline">Token</span>
        </a>

        {/* Search */}
        <button
          onClick={onCmdK}
          className="flex items-center gap-2 py-[5px] px-3 rounded-lg bg-white/[0.02] border border-[var(--border)] text-[#68687a] cursor-pointer font-[inherit] transition-colors duration-150 hover:border-[rgba(126,217,87,0.2)]"
        >
          <Search size={13} />
          <span className="hidden sm:inline text-xs">Search</span>
          <kbd className="hidden sm:inline text-[0.6rem] py-0.5 px-[5px] rounded bg-[var(--bg-card)] border border-[var(--border)] text-[#4a4a5a] font-mono">
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
              className="flex items-center gap-[5px] py-[5px] px-2.5 rounded-lg cursor-pointer font-[inherit] transition-all duration-150"
              style={{
                background: `${info?.color || '#6EE05A'}08`,
                border: `1px solid ${info?.color || '#6EE05A'}20`,
              }}
            >
              {logo ? (
                <img src={logo} alt="" width={14} height={14} className="rounded-[3px]" />
              ) : null}
              <span className="hidden sm:inline text-[0.7rem] font-semibold" style={{ color: info?.color || '#6EE05A' }}>
                {info?.label || coreAI}
              </span>
            </button>
          )
        })() : (
          <button
            onClick={onSetupAI}
            className="flex items-center gap-[5px] py-[5px] px-2.5 rounded-lg bg-[rgba(255,107,53,0.06)] border border-[rgba(255,107,53,0.2)] cursor-pointer font-[inherit] [animation:headerPulse_2s_ease_infinite]"
          >
            <AlertTriangle size={12} className="text-[#ff6b35]" />
            <span className="hidden sm:inline text-[0.7rem] font-semibold text-[#ff6b35]">
              Set up AI
            </span>
          </button>
        )}

        {/* Spark Counter */}
        {(runCount !== undefined && runCount !== null) && (
          <div className="flex items-center gap-1 py-[5px] px-2.5 rounded-lg bg-white/[0.02] border border-[var(--border)]">
            <Zap
              size={11}
              style={{
                color: isOwner ? '#6EE05A'
                  : runLimit && runCount / runLimit > 0.5 ? '#6EE05A'
                  : runLimit && runCount / runLimit > 0.1 ? '#f59e0b'
                  : '#ef4444'
              }}
            />
            <span className={`text-[0.7rem] font-semibold ${isOwner ? 'text-[#6EE05A]' : 'text-[var(--text-secondary)]'}`}>
              {isOwner ? '\u221E' : runLimit ? `${runCount}/${runLimit}` : runCount}
            </span>
          </div>
        )}

        {/* Plan badge */}
        {(userPlan === 'free' || !userPlan) ? (
          <button
            onClick={onUpgradeClick}
            className="flex items-center gap-[5px] py-[5px] px-3 rounded-lg bg-[rgba(126,217,87,0.06)] border border-[rgba(126,217,87,0.15)] text-[#6EE05A] text-[0.7rem] font-bold cursor-pointer font-[inherit]"
          >
            <Zap size={12} />
            <span className="hidden sm:inline">Upgrade</span>
          </button>
        ) : (
          <span className="py-[5px] px-2.5 rounded-lg text-[0.625rem] font-bold uppercase tracking-[0.06em] bg-[rgba(126,217,87,0.06)] text-[#6EE05A] border border-[rgba(126,217,87,0.12)]">
            {userPlan}
          </span>
        )}

        {/* Avatar */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen(p => !p)}
            className={`flex items-center gap-1.5 py-[3px] pr-2 pl-[3px] rounded-lg border cursor-pointer font-[inherit] transition-colors duration-150 ${avatarOpen ? 'border-[rgba(126,217,87,0.2)] bg-[rgba(126,217,87,0.04)]' : 'border-[var(--border)] bg-white/[0.02]'}`}
          >
            <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-[#6EE05A] to-[#4CAF3D] flex items-center justify-center">
              <span className="text-[11px] font-extrabold text-[#0B0F19]">{initials}</span>
            </div>
            <ChevronDown
              size={12}
              className={`hidden sm:block text-[#4a4a5a] transition-transform duration-200 ${avatarOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {avatarOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-[100] overflow-hidden [animation:headerDrop_0.12s_ease]">
              {/* User info */}
              <div className="px-3.5 py-3 border-b border-[var(--border)]">
                <div className="text-[13px] font-semibold text-[#e2e2e8] mb-0.5">
                  {userName || 'User'}
                </div>
                <div className="text-[11px] text-[#4a4a5a] font-mono">
                  {userEmail}
                </div>
                {userPlan && (
                  <span className={`inline-block mt-1.5 text-[10px] font-bold py-0.5 px-2 rounded-[5px] font-mono uppercase tracking-[0.06em] border ${
                    userPlan === 'free'
                      ? 'bg-[var(--bg-card)] text-[#4a4a5a] border-[var(--border)]'
                      : 'bg-[rgba(126,217,87,0.08)] text-[#6EE05A] border-[rgba(126,217,87,0.15)]'
                  }`}>
                    {userPlan}
                  </span>
                )}
              </div>

              {/* Menu */}
              <div className="p-1">
                {[
                  { icon: <Settings size={14} />, label: 'Account', action: () => { setAvatarOpen(false); onAccountClick() } },
                  { icon: <User size={14} />, label: 'Profile', action: () => { setAvatarOpen(false); window.location.href = '/forum' } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border-none bg-transparent text-[#808090] text-[13px] font-medium cursor-pointer font-[inherit] text-left transition-all duration-100 hover:bg-[var(--bg-card)] hover:text-[#e2e2e8]"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <div className="p-1 border-t border-[var(--border)]">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border-none bg-transparent text-[#ef4444] text-[13px] font-medium cursor-pointer font-[inherit] text-left transition-all duration-100 hover:bg-[rgba(239,68,68,0.06)]"
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
