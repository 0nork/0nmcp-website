'use client'

import { Search, Menu, Server } from 'lucide-react'
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
}

interface HeaderProps {
  view: string
  mcpOnline: boolean
  connectedCount: number
  onCmdK: () => void
  onMobileMenu: () => void
}

export function Header({ view, mcpOnline, connectedCount, onCmdK, onMobileMenu }: HeaderProps) {
  return (
    <header
      className="shrink-0 h-14 flex items-center justify-between px-4 md:px-6 lg:px-8 z-10"
      style={{
        backgroundColor: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: mobile menu + title */}
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
        <h1
          className="text-lg font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</span>{' '}
          Console
          <span
            className="text-sm font-normal ml-2 hidden sm:inline"
            style={{ color: 'var(--text-muted)' }}
          >
            / {VIEW_LABELS[view] || view}
          </span>
        </h1>
      </div>

      {/* Right: status + search + vault counter */}
      <div className="flex items-center gap-3">
        {/* 0nMCP status badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{
            backgroundColor: mcpOnline ? 'rgba(0,255,136,0.06)' : 'rgba(255,255,255,0.04)',
            border: mcpOnline
              ? '1px solid rgba(0,255,136,0.2)'
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
