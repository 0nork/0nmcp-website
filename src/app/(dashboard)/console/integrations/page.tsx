'use client'

import { useState, useCallback, useEffect } from 'react'
import { STATS_DISPLAY } from '@/data/stats'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ExternalLink, X, Shield } from 'lucide-react'

interface ServiceDef {
  id: string
  name: string
  color: string
  icon: string
  pattern: string
  placeholder: string
  category: string
  description: string
  toolCount: number
  scopes: string[]
  guide: string[]
  keyUrl: string
  affiliateUrl?: string
  keyLabel: string
}

const SERVICES: ServiceDef[] = [
  // AI
  { id: 'anthropic', name: 'Anthropic', color: '#D4A574', icon: 'An', pattern: 'sk-ant-...', placeholder: 'sk-ant-api03-...', category: 'AI',
    description: 'Claude AI — the brain behind 0nMCP orchestration', toolCount: 12,
    scopes: ['Messages', 'Completions', 'Tool Use', 'Vision'],
    guide: ['Go to console.anthropic.com', 'Click "API Keys" in the left sidebar', 'Click "Create Key" and name it "0nMCP"', 'Copy the key (starts with sk-ant-)'],
    keyUrl: 'https://console.anthropic.com/settings/keys', keyLabel: 'Get API Key' },
  { id: 'openai', name: 'OpenAI', color: '#10a37f', icon: 'OA', pattern: 'sk-...', placeholder: 'sk-proj-...', category: 'AI',
    description: 'GPT-4o, DALL-E, Whisper — AI completions and generation', toolCount: 15,
    scopes: ['Chat', 'Images', 'Audio', 'Embeddings', 'Assistants'],
    guide: ['Go to platform.openai.com/api-keys', 'Click "Create new secret key"', 'Name it "0nMCP" and copy the key'],
    keyUrl: 'https://platform.openai.com/api-keys', keyLabel: 'Get API Key' },
  { id: 'gemini', name: 'Google Gemini', color: '#4285F4', icon: 'Gm', pattern: 'AIza...', placeholder: 'AIzaSyXXXXXXXXX', category: 'AI',
    description: 'Gemini 2.0 — Google\'s multimodal AI', toolCount: 10,
    scopes: ['Chat', 'Embeddings', 'Vision', 'Code Generation'],
    guide: ['Go to aistudio.google.com/apikey', 'Click "Create API Key"', 'Select your Google Cloud project', 'Copy the generated API key'],
    keyUrl: 'https://aistudio.google.com/apikey', keyLabel: 'Get API Key' },
  { id: 'groq', name: 'Groq', color: '#F55036', icon: 'Gq', pattern: 'gsk_...', placeholder: 'gsk_...', category: 'AI',
    description: 'Ultra-fast inference — Llama, Mixtral at lightning speed', toolCount: 8,
    scopes: ['Chat Completions', 'Models'],
    guide: ['Go to console.groq.com/keys', 'Click "Create API Key"', 'Copy the key (starts with gsk_)'],
    keyUrl: 'https://console.groq.com/keys', keyLabel: 'Get Free Key' },
  // Design
  { id: 'canva', name: 'Canva', color: '#00C4CC', icon: 'Cv', pattern: 'CNapi...', placeholder: 'CNapi...', category: 'Design',
    description: '0nBrand — AI brand generation, logos, social templates, business cards', toolCount: 15,
    scopes: ['Designs', 'Brand Kits', 'Uploads', 'Export', 'Folders', 'Templates'],
    guide: ['Go to canva.com/developers', 'Create or select a Connect app', 'Go to Configuration > API Keys', 'Generate and copy the API key'],
    keyUrl: 'https://www.canva.com/developers', keyLabel: 'Get API Key' },
  { id: 'figma', name: 'Figma', color: '#F24E1E', icon: 'Fg', pattern: 'figd_...', placeholder: 'figd_xxxxx', category: 'Design',
    description: 'Design files, components, styles, variables, exports', toolCount: 20,
    scopes: ['Files', 'Components', 'Styles', 'Comments', 'Exports'],
    guide: ['Go to figma.com/settings', 'Scroll to "Personal Access Tokens"', 'Click "Create a new personal access token"', 'Copy the token'],
    keyUrl: 'https://www.figma.com/developers/api#access-tokens', keyLabel: 'Get Token' },
  // CRM
  { id: 'crm', name: 'CRM (PIT Token)', color: '#6EE05A', icon: '0n', pattern: 'pit-...', placeholder: 'pit-xxxxxxxx-xxxx-xxxx', category: 'CRM',
    description: 'Full CRM access — contacts, pipeline, calendar, email, SMS', toolCount: 245,
    scopes: ['Contacts', 'Calendars', 'Opportunities', 'Invoices', 'Conversations', 'Social', 'Users'],
    guide: ['Go to your CRM Settings > Business Profile', 'Scroll to "API" section', 'Generate a Private Integration Token (PIT)', 'Copy the token'],
    keyUrl: 'https://app.rocketclients.com/settings', keyLabel: 'Get PIT Token' },
  // Payments
  { id: 'stripe', name: 'Stripe', color: '#635BFF', icon: 'St', pattern: 'rk_live_...', placeholder: 'rk_live_...', category: 'Payments',
    description: 'Payment processing — invoices, subscriptions, checkout', toolCount: 32,
    scopes: ['Charges', 'Customers', 'Invoices', 'Subscriptions', 'Products'],
    guide: ['Go to dashboard.stripe.com/apikeys', 'Copy your "Secret key" (live mode)'],
    keyUrl: 'https://dashboard.stripe.com/apikeys', keyLabel: 'Get API Key' },
  // Communication
  { id: 'slack', name: 'Slack', color: '#4A154B', icon: 'Sl', pattern: 'xoxb-...', placeholder: 'xoxb-xxxx', category: 'Communication',
    description: 'Team messaging, channels, notifications', toolCount: 14,
    scopes: ['Messages', 'Channels', 'Users', 'Files'],
    guide: ['Go to api.slack.com/apps', 'Create a new app', 'Go to OAuth & Permissions', 'Copy the "Bot User OAuth Token"'],
    keyUrl: 'https://api.slack.com/apps', keyLabel: 'Create App' },
  { id: 'telegram', name: 'Telegram', color: '#26A5E4', icon: 'Tg', pattern: '123456:ABC...', placeholder: '123456789:AAxx', category: 'Communication',
    description: 'Telegram Bot API — messages, groups, channels', toolCount: 132,
    scopes: ['Messages', 'Groups', 'Channels', 'Media', 'Commands'],
    guide: ['Open Telegram and message @BotFather', 'Send /newbot and follow prompts', 'Copy the HTTP API token'],
    keyUrl: 'https://t.me/BotFather', keyLabel: 'Create Bot' },
  // Developer
  { id: 'github', name: 'GitHub', color: '#FFFFFF', icon: 'GH', pattern: 'ghp_...', placeholder: 'ghp_xxxxx', category: 'Developer',
    description: 'Repository management, issues, PRs, Actions', toolCount: 28,
    scopes: ['Repos', 'Issues', 'Pull Requests', 'Actions', 'Releases'],
    guide: ['Go to github.com/settings/tokens', 'Click "Generate new token (classic)"', 'Select scopes and copy'],
    keyUrl: 'https://github.com/settings/tokens/new', keyLabel: 'Generate Token' },
  // Infrastructure
  { id: 'supabase', name: 'Supabase', color: '#3ECF8E', icon: 'Sb', pattern: 'eyJ...', placeholder: 'eyJhbGci...', category: 'Infrastructure',
    description: 'Postgres database, auth, storage, realtime', toolCount: 22,
    scopes: ['Database', 'Auth', 'Storage', 'Realtime'],
    guide: ['Go to supabase.com/dashboard', 'Select project > Settings > API', 'Copy the key'],
    keyUrl: 'https://supabase.com/dashboard', keyLabel: 'Get API Key' },
  // Email
  { id: 'sendgrid', name: 'SendGrid', color: '#1A82E2', icon: 'SG', pattern: 'SG.', placeholder: 'SG.xxxxxxxx...', category: 'Email',
    description: 'Transactional and marketing email delivery', toolCount: 18,
    scopes: ['Send Email', 'Templates', 'Contacts', 'Stats'],
    guide: ['Go to app.sendgrid.com/settings/api_keys', 'Click "Create API Key"', 'Copy the key'],
    keyUrl: 'https://app.sendgrid.com/settings/api_keys', keyLabel: 'Get API Key' },
  // Analytics
  { id: 'ga4', name: 'Google Analytics 4', color: '#E37400', icon: 'GA', pattern: 'G-...', placeholder: 'G-XXXXXXXXXX', category: 'Analytics',
    description: 'Pageviews, events, conversions, real-time reports', toolCount: 6,
    scopes: ['Pageviews', 'Events', 'Conversions', 'Audiences'],
    guide: ['Go to analytics.google.com', 'Click Admin > Data Streams', 'Copy the "Measurement ID"'],
    keyUrl: 'https://analytics.google.com', keyLabel: 'Get Measurement ID' },
]

interface ServiceState {
  value: string
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  error?: string
}
type VaultState = Record<string, ServiceState>

function initialState(): VaultState {
  const state: VaultState = {}
  for (const svc of SERVICES) state[svc.id] = { value: '', status: 'disconnected' }
  return state
}

export default function IntegrationsPage() {
  const [vault, setVault] = useState<VaultState>(initialState)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ServiceDef | null>(null)
  const [modalValue, setModalValue] = useState('')
  const [modalStatus, setModalStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [modalError, setModalError] = useState('')

  // Load connected status on mount
  useEffect(() => {
    fetch('/api/vault').then(r => r.json()).then(data => {
      if (data?.keys) {
        const connected: VaultState = { ...initialState() }
        for (const k of data.keys) {
          if (connected[k]) connected[k] = { value: '••••••••', status: 'connected' }
        }
        setVault(connected)
      }
    }).catch(() => {})
  }, [])

  const connectedCount = Object.values(vault).filter(v => v.status === 'connected').length
  const totalCount = SERVICES.length

  const updateService = useCallback((id: string, patch: Partial<ServiceState>) => {
    setVault(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  function openModal(svc: ServiceDef) {
    setModal(svc)
    setModalValue('')
    setModalStatus('idle')
    setModalError('')
  }

  async function handleModalSave() {
    if (!modal || !modalValue.trim()) return
    setModalStatus('saving')
    setModalError('')
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: modal.id, key: modalValue.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed' }))
        setModalError(data.error || 'Connection failed')
        setModalStatus('error')
        return
      }
      updateService(modal.id, { value: '••••••••', status: 'connected', error: undefined })
      setModalStatus('saved')
      setTimeout(() => setModal(null), 1200)
    } catch {
      setModalError('Network error')
      setModalStatus('error')
    }
  }

  const filteredServices = SERVICES.filter(svc =>
    svc.name.toLowerCase().includes(search.toLowerCase()) ||
    svc.category.toLowerCase().includes(search.toLowerCase())
  )
  const categories = Array.from(new Set(filteredServices.map(s => s.category)))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">Connected Services</h1>
        <p className="text-sm text-muted-foreground">
          {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services. Connect to unlock AI workflows.
        </p>
      </div>

      {/* Progress bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Vault</span>
            <span className="text-xs text-muted-foreground">{connectedCount}/{totalCount} connected</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.round((connectedCount / totalCount) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Service Cards by Category */}
      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredServices.filter(s => s.category === cat).map(svc => {
              const state = vault[svc.id]
              const isConnected = state?.status === 'connected'
              return (
                <Card
                  key={svc.id}
                  className={`bg-card border cursor-pointer transition-colors hover:border-primary/40 ${isConnected ? 'border-primary/30' : 'border-border'}`}
                  onClick={() => openModal(svc)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-black font-mono"
                      style={{ background: `${svc.color}15`, color: svc.color }}
                    >
                      {svc.icon}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{svc.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{svc.description}</div>
                    </div>
                    {/* Status */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                      <span className="text-[10px] text-muted-foreground font-mono">{svc.toolCount} tools</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      {filteredServices.length === 0 && (
        <p className="text-center py-12 text-muted-foreground">No services match &ldquo;{search}&rdquo;</p>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative bg-card border-border max-w-lg w-full max-h-[90vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black font-mono shrink-0"
                  style={{ background: `${modal.color}15`, color: modal.color }}
                >
                  {modal.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground">Connect {modal.name}</h2>
                  <p className="text-xs text-muted-foreground">{modal.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setModal(null)} className="shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Scopes */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {modal.toolCount} tools unlocked
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {modal.scopes.map(s => (
                    <Badge key={s} variant="outline" className="text-xs" style={{ borderColor: `${modal.color}40`, color: modal.color }}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Guide */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">How to get your key</p>
                <div className="space-y-2">
                  {modal.guide.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] font-bold"
                        style={{ background: `${modal.color}15`, color: modal.color }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get Key Link */}
              <a
                href={modal.affiliateUrl || modal.keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: modal.color, color: '#000' }}
              >
                <ExternalLink className="w-4 h-4" />
                {modal.keyLabel}
              </a>

              {/* API Key Input */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Paste your API key</p>
                <Input
                  type="password"
                  value={modalValue}
                  onChange={e => { setModalValue(e.target.value); setModalStatus('idle'); setModalError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleModalSave()}
                  placeholder={modal.placeholder}
                  autoFocus
                  className="bg-secondary border-border text-foreground font-mono"
                />
              </div>

              {modalError && <p className="text-sm text-destructive">{modalError}</p>}

              {/* Save */}
              <Button
                onClick={handleModalSave}
                disabled={!modalValue.trim() || modalStatus === 'saving'}
                className={`w-full ${modalStatus === 'saved' ? 'bg-primary/15 text-primary' : 'bg-primary text-primary-foreground'}`}
              >
                {modalStatus === 'saving' ? 'Connecting...' : modalStatus === 'saved' ? 'Connected!' : 'Connect & Save'}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" /> Encrypted with AES-256-GCM. Your key never leaves your vault.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
