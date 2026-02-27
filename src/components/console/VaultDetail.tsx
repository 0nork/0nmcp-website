'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
} from 'lucide-react'
import { StatusDot } from './StatusDot'

/** Credential field definition */
interface CredField {
  key: string
  label: string
  placeholder: string
  secret: boolean
  help: string
  link: string
  linkLabel: string
}

/** Service definitions with credential fields */
const SERVICE_FIELDS: Record<
  string,
  {
    label: string
    desc: string
    color: string
    caps: string[]
    fields: CredField[]
  }
> = {
  stripe: {
    label: 'Stripe',
    desc: 'Accept payments, manage subscriptions, and handle billing. The global standard for online payments.',
    color: '#635bff',
    caps: ['charges', 'customers', 'subscriptions', 'invoices', 'refunds', 'webhooks'],
    fields: [
      { key: 'api_key', label: 'Secret Key', placeholder: 'sk_live_...', secret: true, help: 'Your Stripe secret API key.', link: 'https://dashboard.stripe.com/apikeys', linkLabel: 'Stripe Dashboard' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_...', secret: true, help: 'Used to verify incoming webhook events.', link: 'https://dashboard.stripe.com/webhooks', linkLabel: 'Webhook Settings' },
    ],
  },
  slack: {
    label: 'Slack',
    desc: 'Send messages, manage channels, and build rich integrations with your team workspace.',
    color: '#e01e5a',
    caps: ['messages', 'channels', 'users', 'reactions', 'files', 'threads'],
    fields: [
      { key: 'bot_token', label: 'Bot Token', placeholder: 'xoxb-...', secret: true, help: 'Your Slack bot user OAuth token.', link: 'https://api.slack.com/apps', linkLabel: 'Slack Apps' },
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/...', secret: false, help: 'Incoming webhook URL for posting messages.', link: 'https://api.slack.com/messaging/webhooks', linkLabel: 'Webhook Docs' },
    ],
  },
  github: {
    label: 'GitHub',
    desc: 'Manage repositories, issues, pull requests, and GitHub Actions programmatically.',
    color: '#f0f6fc',
    caps: ['repos', 'issues', 'pulls', 'actions', 'releases', 'gists'],
    fields: [
      { key: 'token', label: 'Personal Access Token', placeholder: 'ghp_...', secret: true, help: 'Fine-grained or classic personal access token.', link: 'https://github.com/settings/tokens', linkLabel: 'GitHub Tokens' },
    ],
  },
  openai: {
    label: 'OpenAI',
    desc: 'Access GPT-4, DALL-E, embeddings, and other AI models via the OpenAI API.',
    color: '#10a37f',
    caps: ['completions', 'embeddings', 'images', 'audio', 'moderation'],
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'sk-...', secret: true, help: 'Your OpenAI API key.', link: 'https://platform.openai.com/api-keys', linkLabel: 'OpenAI Dashboard' },
      { key: 'org_id', label: 'Organization ID', placeholder: 'org-...', secret: false, help: 'Optional. Required for multi-org accounts.', link: 'https://platform.openai.com/account/organization', linkLabel: 'Org Settings' },
    ],
  },
  supabase: {
    label: 'Supabase',
    desc: 'Open-source Firebase alternative with Postgres, auth, storage, and edge functions.',
    color: '#3ecf8e',
    caps: ['database', 'auth', 'storage', 'functions', 'realtime'],
    fields: [
      { key: 'url', label: 'Project URL', placeholder: 'https://xxx.supabase.co', secret: false, help: 'Your Supabase project URL.', link: 'https://supabase.com/dashboard/project/_/settings/api', linkLabel: 'API Settings' },
      { key: 'anon_key', label: 'Anon Key', placeholder: 'eyJ...', secret: true, help: 'Public anon key for client-side operations.', link: 'https://supabase.com/dashboard/project/_/settings/api', linkLabel: 'API Settings' },
      { key: 'service_role_key', label: 'Service Role Key', placeholder: 'eyJ...', secret: true, help: 'Server-side key with full access. Keep secret.', link: 'https://supabase.com/dashboard/project/_/settings/api', linkLabel: 'API Settings' },
    ],
  },
  crm: {
    label: 'CRM',
    desc: 'Full CRM integration with 245 tools across contacts, calendars, conversations, payments, and more.',
    color: '#ff6b35',
    caps: ['contacts', 'calendars', 'conversations', 'opportunities', 'invoices', 'social', 'payments'],
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'pit-...', secret: true, help: 'Your CRM API key (Private Integration Token).', link: '#', linkLabel: 'CRM Settings' },
      { key: 'location_id', label: 'Location ID', placeholder: 'loc-...', secret: false, help: 'The location/sub-account ID.', link: '#', linkLabel: 'CRM Locations' },
    ],
  },
}

/** Generic fallback for services without specific field definitions */
function getServiceDef(service: string) {
  return (
    SERVICE_FIELDS[service] || {
      label: service.charAt(0).toUpperCase() + service.slice(1),
      desc: `Connect your ${service} account.`,
      color: '#8888a0',
      caps: [],
      fields: [
        {
          key: 'api_key',
          label: 'API Key',
          placeholder: 'Enter your API key...',
          secret: true,
          help: `Your ${service} API key.`,
          link: '#',
          linkLabel: 'Find API Key',
        },
      ],
    }
  )
}

interface VaultDetailProps {
  service: string
  onBack: () => void
  vault: Record<string, Record<string, string>>
  onSave: (service: string, key: string, value: string) => void
}

export function VaultDetail({ service, onBack, vault, onSave }: VaultDetailProps) {
  const svc = getServiceDef(service)
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [localValues, setLocalValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const f of svc.fields) {
      initial[f.key] = vault[service]?.[f.key] || ''
    }
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const accentColor = svc.color === '#ffffff' || svc.color === '#e2e2e2' ? '#60a5fa' : svc.color
  const isConnected = svc.fields.some((f) => vault[service]?.[f.key])

  const handleSave = () => {
    setSaving(true)
    setSaveResult(null)
    try {
      for (const f of svc.fields) {
        if (localValues[f.key]) {
          onSave(service, f.key, localValues[f.key])
        }
      }
      setSaveResult('success')
    } catch {
      setSaveResult('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveResult(null), 3000)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      // Simulate connection test
      await new Promise((r) => setTimeout(r, 1200))
      const hasKeys = svc.fields.some((f) => localValues[f.key])
      setTestResult(hasKeys ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
      setTimeout(() => setTestResult(null), 4000)
    }
  }

  return (
    <div
      className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-5"
      style={{ animation: 'console-slide-in 0.3s ease' }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm transition-colors cursor-pointer bg-transparent border-none p-0"
        style={{ color: 'var(--accent-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--accent-secondary)')}
      >
        <ArrowLeft size={14} />
        All services
      </button>

      {/* Service header */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold"
          style={{
            backgroundColor: accentColor + '18',
            color: accentColor,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {svc.label.slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            {svc.label}
          </div>
          <div className="text-sm flex items-center gap-2 mt-0.5">
            <StatusDot status={isConnected ? 'online' : 'offline'} />
            <span style={{ color: isConnected ? 'var(--accent)' : '#ef4444' }}>
              {isConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div
        className="glow-box rounded-xl p-4 text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {svc.desc}
      </div>

      {/* Capabilities */}
      <div>
        <h4
          className="text-xs font-semibold tracking-wider uppercase mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Capabilities ({svc.caps.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {svc.caps.map((c) => (
            <span
              key={c}
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: accentColor + '14',
                border: `1px solid ${accentColor}25`,
                color: accentColor,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Credential fields */}
      <div>
        <h4
          className="text-xs font-semibold tracking-wider uppercase mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Credentials ({svc.fields.length})
        </h4>

        <div className="space-y-3">
          {svc.fields.map((f) => (
            <div
              key={f.key}
              className="glow-box rounded-xl p-4 transition-all duration-200"
              style={{
                borderColor: localValues[f.key] ? accentColor + '30' : undefined,
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {f.label}
                </label>
                {f.secret && (
                  <button
                    onClick={() => setShow((p) => ({ ...p, [f.key]: !p[f.key] }))}
                    className="flex items-center gap-1 text-xs transition-colors cursor-pointer bg-transparent border-none"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {show[f.key] ? <EyeOff size={12} /> : <Eye size={12} />}
                    {show[f.key] ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
              <input
                type={f.secret && !show[f.key] ? 'password' : 'text'}
                value={localValues[f.key]}
                onChange={(e) =>
                  setLocalValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                {f.help}
              </p>
              <a
                href={f.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium no-underline mt-1.5"
                style={{ color: accentColor }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                <ExternalLink size={10} />
                {f.linkLabel}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            color: 'var(--bg-primary)',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveResult === 'success' ? (
            <CheckCircle2 size={16} />
          ) : saveResult === 'error' ? (
            <XCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving
            ? 'Saving...'
            : saveResult === 'success'
              ? 'Saved'
              : saveResult === 'error'
                ? 'Error'
                : 'Save Credentials'}
        </button>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            opacity: testing ? 0.6 : 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {testing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : testResult === 'success' ? (
            <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
          ) : testResult === 'error' ? (
            <XCircle size={16} className="text-red-500" />
          ) : null}
          {testing
            ? 'Testing...'
            : testResult === 'success'
              ? 'Connected'
              : testResult === 'error'
                ? 'Failed'
                : 'Test Connection'}
        </button>
      </div>

      <style>{`
        @keyframes console-slide-in {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
