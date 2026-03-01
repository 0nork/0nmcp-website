'use client'

import {
  Clock,
  Sparkles,
  ArrowRight,
  Server,
  Zap,
  Rocket,
  Shield,
  Workflow,
  MessageSquare,
} from 'lucide-react'
import { StatusDot } from './StatusDot'

// Brand logo map for connected services — keyed by lowercase service name
const SERVICE_LOGO_MAP: Record<string, string> = {
  // Payments & Commerce
  stripe: 'https://cdn.simpleicons.org/stripe/635BFF',
  shopify: 'https://cdn.simpleicons.org/shopify/96BF48',
  paypal: 'https://cdn.simpleicons.org/paypal/003087',
  // Communication
  slack: 'https://cdn.simpleicons.org/slack/4A154B',
  discord: 'https://cdn.simpleicons.org/discord/5865F2',
  twilio: 'https://cdn.simpleicons.org/twilio/F22F46',
  sendgrid: 'https://cdn.simpleicons.org/sendgrid/51A9E3',
  mailchimp: 'https://cdn.simpleicons.org/mailchimp/FFE01B',
  // Developer
  github: 'https://cdn.simpleicons.org/github/ffffff',
  linear: 'https://cdn.simpleicons.org/linear/5E6AD2',
  jira: 'https://cdn.simpleicons.org/jira/0052CC',
  // Database / Backend
  supabase: 'https://cdn.simpleicons.org/supabase/3FCF8E',
  mongodb: 'https://cdn.simpleicons.org/mongodb/47A248',
  airtable: 'https://cdn.simpleicons.org/airtable/18BFFF',
  notion: 'https://cdn.simpleicons.org/notion/ffffff',
  // AI
  openai: 'https://cdn.simpleicons.org/openai/ffffff',
  anthropic: 'https://cdn.simpleicons.org/anthropic/d4a574',
  // Google
  gmail: 'https://cdn.simpleicons.org/gmail/EA4335',
  google_sheets: 'https://cdn.simpleicons.org/googlesheets/34A853',
  google_drive: 'https://cdn.simpleicons.org/googledrive/4285F4',
  google_calendar: 'https://cdn.simpleicons.org/googlecalendar/4285F4',
  // Video / Scheduling
  zoom: 'https://cdn.simpleicons.org/zoom/2D8CFF',
  calendly: 'https://cdn.simpleicons.org/calendly/006BFF',
  // CRM / Support
  hubspot: 'https://cdn.simpleicons.org/hubspot/FF7A59',
  zendesk: 'https://cdn.simpleicons.org/zendesk/03363D',
  // Microsoft
  microsoft: 'https://cdn.simpleicons.org/microsoft/00A4EF',
  // Social
  linkedin: 'https://cdn.simpleicons.org/linkedin/0077B5',
  twitter: 'https://cdn.simpleicons.org/x/ffffff',
  // CRM (internal)
  crm: 'https://cdn.simpleicons.org/salesforce/00A1E0',
  rocket: 'https://cdn.simpleicons.org/salesforce/00A1E0',
}

function ServiceLogo({ name }: { name: string }) {
  const key = name.toLowerCase().replace(/\s+/g, '_')
  const logoUrl = SERVICE_LOGO_MAP[key]

  if (!logoUrl) return null

  return (
    <img
      src={logoUrl}
      alt=""
      width={14}
      height={14}
      style={{
        borderRadius: 2,
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  )
}

interface DashboardViewProps {
  mcpOnline: boolean
  mcpHealth: {
    version?: string
    uptime?: number
    connections?: number
    services?: string[]
    mode?: string
  } | null
  connectedCount: number
  flowCount: number
  historyCount: number
  messageCount: number
  connectedServices: string[]
  recentHistory: {
    id: string
    type: string
    detail: string
    ts: number
  }[]
}

export function DashboardView({
  mcpOnline,
  mcpHealth,
  connectedCount,
  flowCount,
  historyCount,
  messageCount,
  connectedServices,
  recentHistory,
}: DashboardViewProps) {
  const stats = [
    {
      label: 'Connected Services',
      value: connectedCount,
      icon: Shield,
      accentVar: '--accent',
    },
    {
      label: 'Active Workflows',
      value: flowCount,
      icon: Workflow,
      accentVar: '--accent-secondary',
    },
    {
      label: 'Recent Activity',
      value: historyCount,
      icon: Clock,
      accentVar: '--accent',
    },
    {
      label: 'Chat Messages',
      value: messageCount,
      icon: MessageSquare,
      accentVar: '--accent-secondary',
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-full mx-auto w-full space-y-6" style={{ animation: 'console-fade-in 0.3s ease' }}>
      {/* Welcome */}
      <div>
        <h1
          className="text-2xl lg:text-3xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Command Center
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {mcpOnline
            ? '0nMCP online \u2014 819 tools across 48 services ready.'
            : connectedCount > 0
              ? `${connectedCount} service${connectedCount !== 1 ? 's' : ''} connected and ready.`
              : 'Connect your first service to get started.'}
        </p>
      </div>

      {/* 0nMCP Server Status Banner */}
      <div
        className="glow-box rounded-2xl p-5 transition-all"
        style={{
          borderColor: mcpOnline ? 'rgba(126,217,87,0.2)' : 'rgba(239,68,68,0.2)',
          backgroundColor: mcpOnline ? 'rgba(126,217,87,0.03)' : 'rgba(239,68,68,0.03)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: mcpOnline ? 'rgba(126,217,87,0.1)' : 'rgba(239,68,68,0.1)',
              }}
            >
              <Server
                size={20}
                style={{ color: mcpOnline ? 'var(--accent)' : '#ef4444' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  0nMCP Server
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: mcpOnline ? 'rgba(126,217,87,0.15)' : 'rgba(239,68,68,0.15)',
                    color: mcpOnline ? 'var(--accent)' : '#ef4444',
                  }}
                >
                  {mcpOnline ? (mcpHealth?.mode === 'local' ? 'LOCAL' : 'CLOUD') : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {mcpOnline && mcpHealth
                  ? mcpHealth.mode === 'cloud'
                    ? `v${mcpHealth.version || '2.2.0'} — 819 tools across 48 services ready`
                    : `v${mcpHealth.version || '2.2.0'} — ${mcpHealth.connections || 0} connections active`
                  : mcpOnline
                    ? 'Universal AI API Orchestrator'
                    : 'Run: npx 0nmcp serve --port 3001'}
              </p>
            </div>
          </div>
          {mcpOnline && (
            <div className="hidden sm:flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1.5">
                <Zap size={12} style={{ color: 'var(--accent)' }} />
                <span>819 Tools</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Server size={12} style={{ color: 'var(--accent-secondary)' }} />
                <span>48 Services</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="glow-box rounded-2xl p-4 text-left transition-all duration-300 group cursor-default"
              style={{
                animation: 'console-stagger-in 0.4s ease both',
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `var(${s.accentVar}, #7ed957)14` }}
              >
                <Icon size={18} style={{ color: `var(${s.accentVar})` }} />
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {s.value}
              </div>
              <div className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                {s.label}
                <ArrowRight
                  size={12}
                  className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ideas */}
        <div
          className="glow-box rounded-2xl p-5"
          style={{
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: '280ms',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Ideas
            </h2>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              Based on your stack
            </span>
          </div>
          <div className="space-y-2">
            {connectedServices.length > 0 ? (
              [
                'Sync new contacts to your CRM automatically',
                'Send Slack alerts on payment failures',
                'Auto-respond to form submissions',
                'Generate weekly analytics reports',
                'Backup data across services nightly',
              ]
                .slice(0, 5)
                .map((idea, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 py-2 px-3 rounded-xl transition-colors cursor-default"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {idea}
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-sm py-3 text-center" style={{ color: 'var(--text-muted)' }}>
                Connect services to unlock ideas
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="glow-box rounded-2xl p-5"
          style={{
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: '340ms',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} style={{ color: 'var(--accent-secondary)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h2>
            {recentHistory.length > 0 && (
              <span
                className="text-xs ml-auto transition-colors cursor-pointer"
                style={{ color: 'var(--accent-secondary)' }}
              >
                View all
              </span>
            )}
          </div>
          <div className="space-y-1">
            {recentHistory.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      entry.type === 'connect'
                        ? 'var(--accent)'
                        : entry.type === 'workflow'
                          ? 'var(--accent-secondary)'
                          : entry.type === 'error'
                            ? '#ef4444'
                            : 'var(--accent)',
                  }}
                />
                <span
                  className="text-sm truncate flex-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {entry.detail}
                </span>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {new Date(entry.ts).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
            {recentHistory.length === 0 && (
              <p className="text-sm py-3 text-center" style={{ color: 'var(--text-muted)' }}>
                No activity yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Connected Services chips */}
      {connectedServices.length > 0 && (
        <div
          className="glow-box rounded-2xl p-5"
          style={{
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: '400ms',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Connected Services
            </h2>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
              {connectedServices.length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedServices.map((name) => (
              <div
                key={name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                }}
              >
                <ServiceLogo name={name} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {name}
                </span>
                <StatusDot status="online" size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Get Started CTA */}
      {connectedCount === 0 && (
        <div
          className="glow-box rounded-2xl p-8 text-center"
          style={{
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: '460ms',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-glow)' }}
          >
            <Rocket size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Get Started with 0nMCP
          </h3>
          <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Connect your first service to unlock AI-powered automations across 48 platforms.
          </p>
          <span
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Open Vault to connect <ArrowRight size={14} />
          </span>
        </div>
      )}

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
