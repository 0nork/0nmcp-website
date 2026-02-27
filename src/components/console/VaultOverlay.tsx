'use client'

import { useState } from 'react'
import { Search, Lock } from 'lucide-react'
import { StatusDot } from './StatusDot'

/** Service catalog for vault display */
const SERVICES: Record<
  string,
  { label: string; desc: string; color: string; caps: string[] }
> = {
  stripe: {
    label: 'Stripe',
    desc: 'Payment processing and billing.',
    color: '#635bff',
    caps: ['charges', 'customers', 'subscriptions', 'invoices'],
  },
  slack: {
    label: 'Slack',
    desc: 'Team messaging and notifications.',
    color: '#e01e5a',
    caps: ['messages', 'channels', 'users', 'reactions'],
  },
  github: {
    label: 'GitHub',
    desc: 'Code hosting and collaboration.',
    color: '#f0f6fc',
    caps: ['repos', 'issues', 'pulls', 'actions'],
  },
  openai: {
    label: 'OpenAI',
    desc: 'GPT models and embeddings.',
    color: '#10a37f',
    caps: ['completions', 'embeddings', 'images'],
  },
  discord: {
    label: 'Discord',
    desc: 'Community messaging platform.',
    color: '#5865f2',
    caps: ['messages', 'channels', 'webhooks'],
  },
  twilio: {
    label: 'Twilio',
    desc: 'SMS, voice, and communication APIs.',
    color: '#f22f46',
    caps: ['sms', 'voice', 'verify', 'lookup'],
  },
  sendgrid: {
    label: 'SendGrid',
    desc: 'Email delivery service.',
    color: '#1a82e2',
    caps: ['send', 'templates', 'contacts'],
  },
  shopify: {
    label: 'Shopify',
    desc: 'E-commerce platform.',
    color: '#96bf48',
    caps: ['products', 'orders', 'customers', 'inventory'],
  },
  supabase: {
    label: 'Supabase',
    desc: 'Backend-as-a-service with Postgres.',
    color: '#3ecf8e',
    caps: ['database', 'auth', 'storage', 'functions'],
  },
  notion: {
    label: 'Notion',
    desc: 'Workspace and documentation.',
    color: '#ffffff',
    caps: ['pages', 'databases', 'blocks'],
  },
  airtable: {
    label: 'Airtable',
    desc: 'Spreadsheet-database hybrid.',
    color: '#18bfff',
    caps: ['records', 'bases', 'views'],
  },
  gmail: {
    label: 'Gmail',
    desc: 'Email sending and management.',
    color: '#ea4335',
    caps: ['send', 'read', 'labels', 'drafts'],
  },
  google_sheets: {
    label: 'Google Sheets',
    desc: 'Spreadsheet automation.',
    color: '#0f9d58',
    caps: ['read', 'write', 'formulas'],
  },
  google_drive: {
    label: 'Google Drive',
    desc: 'File storage and sharing.',
    color: '#4285f4',
    caps: ['files', 'folders', 'permissions'],
  },
  mongodb: {
    label: 'MongoDB',
    desc: 'Document database.',
    color: '#00ed64',
    caps: ['crud', 'aggregation', 'indexes'],
  },
  anthropic: {
    label: 'Anthropic',
    desc: 'Claude AI models.',
    color: '#d4a574',
    caps: ['completions', 'messages'],
  },
  zendesk: {
    label: 'Zendesk',
    desc: 'Customer support platform.',
    color: '#03363d',
    caps: ['tickets', 'users', 'organizations'],
  },
  jira: {
    label: 'Jira',
    desc: 'Project tracking and management.',
    color: '#0052cc',
    caps: ['issues', 'projects', 'sprints'],
  },
  hubspot: {
    label: 'HubSpot',
    desc: 'CRM and marketing platform.',
    color: '#ff7a59',
    caps: ['contacts', 'deals', 'companies'],
  },
  mailchimp: {
    label: 'Mailchimp',
    desc: 'Email marketing automation.',
    color: '#ffe01b',
    caps: ['campaigns', 'lists', 'templates'],
  },
  google_calendar: {
    label: 'Google Calendar',
    desc: 'Calendar scheduling.',
    color: '#4285f4',
    caps: ['events', 'calendars'],
  },
  calendly: {
    label: 'Calendly',
    desc: 'Appointment scheduling.',
    color: '#006bff',
    caps: ['events', 'invitees', 'scheduling'],
  },
  zoom: {
    label: 'Zoom',
    desc: 'Video conferencing.',
    color: '#2d8cff',
    caps: ['meetings', 'recordings', 'users'],
  },
  linear: {
    label: 'Linear',
    desc: 'Issue tracking for teams.',
    color: '#5e6ad2',
    caps: ['issues', 'projects', 'cycles'],
  },
  microsoft: {
    label: 'Microsoft',
    desc: 'Microsoft 365 services.',
    color: '#00a4ef',
    caps: ['mail', 'teams', 'calendar', 'onedrive'],
  },
  crm: {
    label: 'CRM',
    desc: 'Customer relationship management. 245 tools.',
    color: '#ff6b35',
    caps: ['contacts', 'calendars', 'conversations', 'opportunities', 'invoices'],
  },
}

const SERVICE_COUNT = Object.keys(SERVICES).length

interface VaultOverlayProps {
  onSelect: (service: string) => void
  connectedServices: string[]
  searchQuery: string
  onSearch: (q: string) => void
}

export function VaultOverlay({
  onSelect,
  connectedServices,
  searchQuery,
  onSearch,
}: VaultOverlayProps) {
  const [filter, setFilter] = useState<'all' | 'connected' | 'setup'>('all')

  const entries = Object.entries(SERVICES).filter(([key, svc]) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      svc.label.toLowerCase().includes(q) ||
      svc.desc.toLowerCase().includes(q)
    const isConnected = connectedServices.includes(key)
    const matchesFilter =
      filter === 'all' ||
      (filter === 'connected' && isConnected) ||
      (filter === 'setup' && !isConnected)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-full mx-auto w-full" style={{ animation: 'console-fade-in 0.3s ease' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2
            className="text-xl lg:text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Service Vault
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {connectedServices.length}/{SERVICE_COUNT} services connected
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search services..."
              className="h-9 pl-9 pr-3 rounded-lg text-sm outline-none transition-all w-48"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
            }}
          >
            {(['all', 'connected', 'setup'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize border-none"
                style={{
                  backgroundColor: filter === f ? 'var(--accent-glow)' : 'transparent',
                  color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {f === 'setup' ? 'Setup Required' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {entries.map(([key, svc], i) => {
          const isConnected = connectedServices.includes(key)
          const accentColor = svc.color === '#e2e2e2' || svc.color === '#ffffff' ? '#60a5fa' : svc.color
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="glow-box rounded-2xl p-4 text-left cursor-pointer transition-all duration-300 group"
              style={{
                animation: 'console-stagger-in 0.4s ease both',
                animationDelay: `${i * 40}ms`,
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-4 right-4 h-0.5 rounded-b-full"
                style={{ backgroundColor: accentColor, opacity: isConnected ? 0.6 : 0.15 }}
              />

              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: accentColor + '18',
                    color: accentColor,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {svc.label.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {svc.label}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusDot status={isConnected ? 'online' : 'offline'} />
                    <span
                      className="text-[11px]"
                      style={{
                        color: isConnected ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    >
                      {isConnected ? 'Connected' : 'Setup required'}
                    </span>
                  </div>
                </div>
              </div>

              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {svc.desc}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium" style={{ color: accentColor }}>
                  {svc.caps.length} capabilities
                </span>
                <span
                  className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Configure &rarr;
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-16">
          <Lock size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No services match your search
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        className="text-center text-[11px] mt-6 py-3"
        style={{
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
        }}
      >
        Credentials encrypted in your browser &middot; Never sent to our servers
      </div>

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
