'use client'

import {
  LayoutDashboard,
  MessageSquare,
  Shield,
  Workflow,
  History,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { StatusDot } from './StatusDot'

type View = 'dashboard' | 'chat' | 'vault' | 'flows' | 'history' | 'community'

interface SidebarProps {
  view: string
  setView: (v: string) => void
  collapsed: boolean
  setCollapsed: (b: boolean) => void
  connectedCount: number
  mcpOnline: boolean
}

const NAV_ITEMS: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'community', label: 'Community', icon: Users },
  { key: 'vault', label: 'Vault', icon: Shield },
  { key: 'flows', label: 'Flows', icon: Workflow },
  { key: 'history', label: 'History', icon: History },
]

export function Sidebar({
  view,
  setView,
  collapsed,
  setCollapsed,
  connectedCount,
  mcpOnline,
}: SidebarProps) {
  return (
    <aside
      className="h-full shrink-0 flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? '4rem' : '16rem',
        backgroundColor: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className={`shrink-0 flex items-center gap-2.5 h-14 ${collapsed ? 'justify-center px-2' : 'px-4'}`}
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          }}
        >
          <span className="text-xs font-black" style={{ color: 'var(--bg-primary)' }}>
            0n
          </span>
        </div>
        {!collapsed && (
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
          >
            Console
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
              }`}
              style={{
                backgroundColor: active ? 'var(--accent-glow)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={20}
                className="shrink-0 transition-colors"
                style={{ color: active ? 'var(--accent)' : undefined }}
              />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className={`shrink-0 px-3 py-3 space-y-3 ${collapsed ? 'px-2' : ''}`}
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Status row */}
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <StatusDot status={mcpOnline ? 'online' : 'offline'} />
          {!collapsed && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {connectedCount} connected
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-2 py-2 rounded-lg transition-colors cursor-pointer ${
            collapsed ? 'justify-center px-0' : 'px-2'
          }`}
          style={{
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
