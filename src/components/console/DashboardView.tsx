'use client'

import { type ReactNode } from 'react'
import { StatusDot } from './StatusDot'
import {
  MessageSquare, KeyRound, Sparkles, Blocks,
  ShoppingBag, Brain,
} from 'lucide-react'
import { STATS, STATS_DISPLAY } from '@/data/stats'

interface DashboardViewProps {
  mcpOnline: boolean
  mcpHealth: {
    version?: string
    uptime?: number
    connections?: number
    services?: string[]
    mode?: string
    tools?: number
  } | null
  connectedCount: number
  flowCount: number
  historyCount: number
  messageCount: number
  connectedServices: string[]
  recentHistory: { id: string; type: string; detail: string; ts: number }[]
  onNavigate?: (view: string) => void
}

interface QuickAction {
  key: string
  label: string
  desc: string
  icon: ReactNode
  color: string
  jpColor: string
}

const ACTIONS: QuickAction[] = [
  { key: 'chat', label: 'Chat', desc: 'Talk to AI assistant', icon: <MessageSquare size={18} />, color: '#a78bfa', jpColor: 'purple' },
  { key: 'credentials', label: 'Vault', desc: 'Manage API keys', icon: <KeyRound size={18} />, color: '#6EE05A', jpColor: 'green' },
  { key: 'flows', label: 'Create', desc: 'Build a workflow', icon: <Sparkles size={18} />, color: '#fbbf24', jpColor: 'amber' },
  { key: 'builder', label: 'Builder', desc: 'Visual editor', icon: <Blocks size={18} />, color: '#a78bfa', jpColor: 'purple' },
  { key: 'store', label: 'Store', desc: 'Browse marketplace', icon: <ShoppingBag size={18} />, color: '#00d4ff', jpColor: 'cyan' },
  { key: 'training', label: 'Brain', desc: 'AI training', icon: <Brain size={18} />, color: '#a78bfa', jpColor: 'purple' },
]

export function DashboardView({
  mcpOnline,
  mcpHealth,
  connectedCount,
  flowCount,
  historyCount,
  messageCount,
  connectedServices,
  recentHistory,
  onNavigate,
}: DashboardViewProps) {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div className="jp-page-header">
        <h1 className="jp-page-title">Command Center</h1>
        <p className="jp-page-subtitle">
          {mcpOnline
            ? `${mcpHealth?.tools || STATS.tools} tools across ${STATS_DISPLAY.services} services -- ready to go.`
            : 'Connect 0nMCP to unlock your full workspace.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="jp-stat-grid" style={{ marginBottom: 24 }}>
        {/* 0nMCP Status */}
        <div className="jp-stat-card green">
          <div className="jp-stat-header">
            <span className="jp-stat-label">0nMCP Status</span>
            <div className="jp-stat-icon green">
              <StatusDot status={mcpOnline ? 'online' : 'offline'} />
            </div>
          </div>
          <div className="jp-stat-value" style={{ color: mcpOnline ? 'var(--jp-green)' : 'var(--jp-text-muted)' }}>
            {mcpOnline ? (mcpHealth?.mode === 'local' ? 'Local' : 'Cloud') : 'Offline'}
          </div>
          {mcpOnline && (
            <span className="jp-stat-change up">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 9L5 1L9 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Online
            </span>
          )}
        </div>

        {/* Vault Keys */}
        <div className="jp-stat-card cyan">
          <div className="jp-stat-header">
            <span className="jp-stat-label">Vault Keys</span>
            <div className="jp-stat-icon cyan">
              <KeyRound size={18} />
            </div>
          </div>
          <div className="jp-stat-value">{connectedCount}</div>
          <span className="jp-stat-change up">Connected</span>
        </div>

        {/* Messages */}
        <div className="jp-stat-card purple">
          <div className="jp-stat-header">
            <span className="jp-stat-label">Messages</span>
            <div className="jp-stat-icon purple">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="jp-stat-value">{messageCount}</div>
        </div>

        {/* Workflows */}
        <div className="jp-stat-card amber">
          <div className="jp-stat-header">
            <span className="jp-stat-label">Workflows</span>
            <div className="jp-stat-icon amber">
              <Blocks size={18} />
            </div>
          </div>
          <div className="jp-stat-value">{flowCount}</div>
        </div>
      </div>

      {/* Two-column layout: Quick Actions + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Quick Actions */}
        <div className="jp-card">
          <div className="jp-card-header">
            <h4>Quick Actions</h4>
          </div>
          <div className="jp-card-body">
            <div className="jp-quick-actions">
              {ACTIONS.map(action => (
                <div
                  key={action.key}
                  className="jp-quick-action"
                  onClick={() => onNavigate?.(action.key)}
                >
                  <div className={`jp-quick-action-icon jp-stat-icon ${action.jpColor}`}>
                    {action.icon}
                  </div>
                  <div>
                    <div className="jp-quick-action-label">{action.label}</div>
                    <div className="jp-quick-action-desc">{action.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="jp-card">
          <div className="jp-card-header">
            <h4>Recent Activity</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>
              {historyCount} total
            </span>
          </div>
          {recentHistory.length > 0 ? (
            <ul className="jp-activity-list">
              {recentHistory.slice(0, 8).map((entry) => (
                <li key={entry.id} className="jp-activity-item">
                  <span
                    className={`jp-activity-dot ${
                      entry.type === 'error'
                        ? 'muted'
                        : entry.type === 'workflow'
                          ? 'cyan'
                          : 'green'
                    }`}
                  />
                  <div className="jp-activity-content">
                    <div className="jp-activity-text">{entry.detail}</div>
                  </div>
                  <span className="jp-activity-time">
                    {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="jp-empty-state">
              <div className="jp-empty-state-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="jp-empty-state-title">No activity yet</div>
              <div className="jp-empty-state-text">Start by connecting a service or chatting with the AI.</div>
            </div>
          )}
        </div>
      </div>

      {/* Connected Services */}
      {connectedServices.length > 0 && (
        <div className="jp-card" style={{ marginBottom: 24 }}>
          <div className="jp-card-header">
            <h4>Connected Services</h4>
            <span className="jp-nav-badge">{connectedServices.length} active</span>
          </div>
          <div className="jp-card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {connectedServices.map(name => (
              <span
                key={name}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'var(--jp-green-glow)',
                  color: 'var(--jp-green)',
                  textTransform: 'capitalize',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chart Area (placeholder) */}
      <div className="jp-card" style={{ marginBottom: 24 }}>
        <div className="jp-card-header">
          <h4>Usage Overview</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>Last 7 days</span>
        </div>
        <div className="jp-card-body">
          <div className="jp-chart-area">
            {[35, 55, 40, 72, 60, 48, 85, 65, 78, 90, 55, 70].map((h, i) => (
              <div
                key={i}
                className="jp-chart-bar"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .jp-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .jp-stat-grid { grid-template-columns: 1fr !important; }
          .jp-quick-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
