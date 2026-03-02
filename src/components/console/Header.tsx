'use client'

import { Search, Menu, Server, Zap } from 'lucide-react'
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
}

interface HeaderProps {
  view: string
  mcpOnline: boolean
  connectedCount: number
  userPlan: string
  onCmdK: () => void
  onMobileMenu: () => void
  onUpgradeClick: () => void
}

export function Header({ view, mcpOnline, connectedCount, userPlan, onCmdK, onMobileMenu, onUpgradeClick }: HeaderProps) {
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
        {/* 0nMCP status badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            backgroundColor: mcpOnline ? 'rgba(126,217,87,0.06)' : 'rgba(255,255,255,0.04)',
            border: mcpOnline
              ? '1px solid rgba(126,217,87,0.2)'
              : '1px solid var(--border)',
          }}
        >
          <Server
            size={12}
            style={{ color: mcpOnline ? 'var(--accent)' : 'var(--text-muted)' }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: mcpOnline ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {mcpOnline ? '0nMCP' : 'Offline'}
          </span>
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
      </div>
    </header>
  )
}
