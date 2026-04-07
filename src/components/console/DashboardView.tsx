'use client'

import { type ReactNode } from 'react'
import { StatusDot } from './StatusDot'
import {
  MessageSquare, KeyRound, Sparkles, Blocks,
  ShoppingBag, Brain, Link2,
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
}

const ACTIONS: QuickAction[] = [
  { key: 'chat', label: 'Chat', desc: 'Talk to AI assistant', icon: <MessageSquare size={20} />, color: '#a78bfa' },
  { key: 'credentials', label: 'Vault', desc: 'Manage API keys', icon: <KeyRound size={20} />, color: '#6EE05A' },
  { key: 'integrations', label: 'Integrations', desc: 'Connect services', icon: <Link2 size={20} />, color: '#00d4ff' },
  { key: 'flows', label: 'Create', desc: 'Build a workflow', icon: <Sparkles size={20} />, color: '#ff6b35' },
  { key: 'builder', label: 'Builder', desc: 'Visual editor', icon: <Blocks size={20} />, color: '#a78bfa' },
  { key: 'store', label: 'Store', desc: 'Browse marketplace', icon: <ShoppingBag size={20} />, color: '#ff6b35' },
  { key: 'training', label: 'Brain', desc: 'AI training', icon: <Brain size={20} />, color: '#a78bfa' },
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
    <div style={{ padding: '2rem 2rem 3rem', maxWidth: 960, margin: '0 auto', width: '100%' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#e2e2e8',
          margin: '0 0 0.375rem 0',
          fontFamily: 'var(--font-display)',
        }}>
          Command Center
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#68687a', margin: 0, lineHeight: 1.5 }}>
          {mcpOnline
            ? `${mcpHealth?.tools || STATS.tools} tools across ${STATS_DISPLAY.services} services — ready to go.`
            : 'Connect 0nMCP to unlock your full workspace.'}
        </p>
      </div>

      {/* Stats */}
      <div className="dash-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '2.5rem',
      }}>
        {[
          {
            label: '0nMCP',
            value: mcpOnline ? (mcpHealth?.mode === 'local' ? 'Local' : 'Cloud') : 'Offline',
            color: mcpOnline ? '#6EE05A' : '#4a4a5a',
            dot: true,
          },
          { label: 'Vault Keys', value: String(connectedCount), color: '#6EE05A' },
          { label: 'Messages', value: String(messageCount), color: '#a78bfa' },
          { label: 'Workflows', value: String(flowCount), color: '#00d4ff' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '1.125rem 1.25rem',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              marginBottom: 8,
            }}>
              {stat.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {stat.dot && <StatusDot status={mcpOnline ? 'online' : 'offline'} />}
              <span style={{
                fontSize: '1.375rem',
                fontWeight: 700,
                color: stat.color,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
              }}>
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#4a4a5a',
          marginBottom: '0.875rem',
        }}>
          Quick Actions
        </h2>
        <div className="dash-actions" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        }}>
          {ACTIONS.map(action => (
            <button
              key={action.key}
              onClick={() => onNavigate?.(action.key)}
              style={{
                padding: '1.25rem',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${action.color}30`
                e.currentTarget.style.background = `${action.color}06`
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${action.color}0c`,
                border: `1px solid ${action.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: action.color,
                flexShrink: 0,
              }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e2e8', marginBottom: 3 }}>
                  {action.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#68687a', lineHeight: 1.4 }}>
                  {action.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Connected Services */}
      {connectedServices.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#4a4a5a',
            marginBottom: '0.875rem',
          }}>
            Connected Services
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {connectedServices.map(name => (
              <span key={name} style={{
                fontSize: '0.7rem',
                fontWeight: 500,
                padding: '0.3rem 0.625rem',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid var(--border)',
                color: '#808090',
              }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h2 style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#4a4a5a',
          marginBottom: '0.875rem',
        }}>
          Recent Activity
        </h2>
        <div style={{
          borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {recentHistory.length > 0 ? recentHistory.slice(0, 8).map((entry, i) => (
            <div key={entry.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0.75rem 1.125rem',
              borderBottom: i < Math.min(recentHistory.length, 8) - 1 ? '1px solid var(--bg-card)' : 'none',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: entry.type === 'error' ? '#ef4444' : entry.type === 'workflow' ? '#00d4ff' : '#6EE05A',
              }} />
              <span style={{
                flex: 1,
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {entry.detail}
              </span>
              <span style={{
                fontSize: '0.675rem',
                color: '#4a4a5a',
                flexShrink: 0,
                fontFamily: 'var(--font-mono)',
              }}>
                {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )) : (
            <div style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              color: '#4a4a5a',
              fontSize: '0.8rem',
              lineHeight: 1.6,
            }}>
              No activity yet. Start by connecting a service or chatting with the AI.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-actions { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .dash-stats { grid-template-columns: 1fr !important; }
          .dash-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
