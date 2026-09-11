'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

// Components
// Header is now in layout.tsx (Pulse sidebar system)
import { Chat, type ChatMessage } from '@/components/console/Chat'
import { ChatInput } from '@/components/console/ChatInput'
import { CommandPalette } from '@/components/console/CommandPalette'
import { DashboardView } from '@/components/console/DashboardView'
import { VaultOverlay } from '@/components/console/VaultOverlay'
import { VaultDetail } from '@/components/console/VaultDetail'
import { VaultFilesPanel } from '@/components/console/VaultFilesPanel'
import { IdeasTicker } from '@/components/console/IdeasTicker'
import { StoreView } from '@/components/console/StoreView'
import { PremiumFlowActionModal } from '@/components/console/PremiumFlowActionModal'
import { ListingDetailModal } from '@/components/console/ListingDetailModal'
import { CreateView } from '@/components/console/CreateView'
import { UpgradeModal } from '@/components/console/UpgradeModal'
import FeedbackAgent from '@/components/console/FeedbackAgent'
import { CoreAIFooter } from '@/components/console/CoreAIFooter'
import { CoreAITutorial } from '@/components/console/CoreAITutorial'
import { AccountView } from '@/components/console/AccountView'
import { AdminView } from '@/components/console/AdminView'
import { SmartPrompts } from '@/components/console/SmartPrompts'
import { PinnedCommands } from '@/components/console/PinnedCommands'
import { OperationsView, SocialView, ReportingView, CodeView, LinkedInView, MigrateView, ConvertView } from '@/components/console/FeatureViews'
import { RunsView } from '@/components/console/RunsView'
import { BuilderView } from '@/components/console/BuilderView'
import { EngineView } from '@/components/console/EngineView'
import { VendorView } from '@/components/console/VendorView'
import { OutreachView } from '@/components/console/OutreachView'
import { TrainingView } from '@/components/console/TrainingView'
import { CommandQueueView } from '@/components/console/CommandQueueView'
import { SeoView } from '@/components/console/SeoView'
import { SiteBuilderView } from '@/components/console/SiteBuilderView'
import { BundleManager } from '@/components/console/BundleManager'
import { AffiliateView } from '@/components/console/AffiliateView'
import { DownloadsView } from '@/components/console/DownloadsView'

// Hooks & data
import { useVault, useFlows, useHistory } from '@/lib/console/hooks'
import { useStore } from '@/lib/console/useStore'
import { getIdeas } from '@/lib/console/ideas'
import { getRecommendations, type RecommendationContext, type Recommendation } from '@/lib/console/recommendations'
import type { PurchaseWithWorkflow, StoreListing } from '@/components/console/StoreTypes'

type View = 'dashboard' | 'chat' | 'vault' | 'flows' | 'store' | 'account' | 'admin' | 'operations' | 'social' | 'reporting' | 'code' | 'linkedin' | 'migrate' | 'convert' | 'runs' | 'vendor' | 'builder' | 'engine' | 'outreach' | 'listkit' | 'training' | 'sync' | 'seo' | 'site-builder' | 'affiliate' | 'downloads'

interface McpHealth {
  version?: string
  uptime?: number
  connections?: number
  services?: string[]
  tools?: number
  mode?: string
}

interface McpWorkflow {
  name: string
  path?: string
  type?: string
  version?: string
}

export default function ConsolePage() {
  const searchParams = useSearchParams()

  // ─── View State ───────────────────────────────────────────────
  const [view, setView] = useState<View>('dashboard')
  const [visitedViews, setVisitedViews] = useState<Set<View>>(() => new Set(['dashboard']))
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)

  // ─── MCP State ────────────────────────────────────────────────
  const [mcpOnline, setMcpOnline] = useState(false)
  const [mcpHealth, setMcpHealth] = useState<McpHealth | null>(null)
  const [mcpWorkflows, setMcpWorkflows] = useState<McpWorkflow[]>([])

  // ─── Chat State (persisted to localStorage + Supabase) ────────
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('0n_chat_messages')
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[]
        // Filter out loading messages from previous sessions
        return parsed.filter(m => !m.loading)
      }
    } catch { /* ignore */ }
    return []
  })
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSessionId, setChatSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('0n_chat_session_id') || crypto.randomUUID()
  })

  // Auto-save chat messages to localStorage on every change
  useEffect(() => {
    if (messages.length === 0) return
    const toSave = messages.filter(m => !m.loading)
    localStorage.setItem('0n_chat_messages', JSON.stringify(toSave))
    localStorage.setItem('0n_chat_session_id', chatSessionId)
  }, [messages, chatSessionId])

  // Sync chat session to Supabase (debounced — saves after 2s of no new messages)
  useEffect(() => {
    if (messages.length === 0) return
    const toSave = messages.filter(m => !m.loading)
    if (toSave.length === 0) return

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/chat/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: chatSessionId,
            messages: toSave,
          }),
        })
        if (!res.ok) console.warn('[chat] Session save failed:', res.status)
      } catch { /* ignore — offline or API not ready */ }
    }, 2000)

    return () => clearTimeout(timer)
  }, [messages, chatSessionId])

  // Start a new chat session (clear messages + new ID)
  const handleNewChat = useCallback(() => {
    setMessages([])
    const newId = crypto.randomUUID()
    setChatSessionId(newId)
    localStorage.removeItem('0n_chat_messages')
    localStorage.setItem('0n_chat_session_id', newId)
  }, [])

  // ─── Vault State ──────────────────────────────────────────────
  const [vaultSearch, setVaultSearch] = useState('')
  const [vaultService, setVaultService] = useState<string | null>(null)
  const [vaultSubView, setVaultSubView] = useState<'files' | 'credentials' | 'bundles'>('files')

  // ─── Hooks ────────────────────────────────────────────────────
  const vault = useVault()
  const flowsHook = useFlows()
  const historyHook = useHistory()
  const store = useStore()

  // ─── Store Modal State ──────────────────────────────────────
  const [activePremiumPurchase, setActivePremiumPurchase] = useState<PurchaseWithWorkflow | null>(null)
  const [premiumDetailListing, setPremiumDetailListing] = useState<StoreListing | null>(null)

  // ─── Admin State ──────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false)

  // ─── Billing State ──────────────────────────────────────────
  const [userPlan, setUserPlan] = useState('free')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // ─── User Profile State (for header avatar) ──────────────
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  // ─── Core AI + Runs + Tutorial ────────────────────────
  const [showTutorial, setShowTutorial] = useState(false)
  const [runCount, setRunCount] = useState<number | null>(null)
  const [runLimit, setRunLimit] = useState<number | null>(null)

  // ─── AI Recommendation State ──────────────────────────────────
  const [recentActions, setRecentActions] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [recsThinking, setRecsThinking] = useState(false)

  const trackAction = useCallback((actionId: string) => {
    setRecentActions(prev => [actionId, ...prev].slice(0, 10))
  }, [])

  // ─── Derived ──────────────────────────────────────────────────
  const connectedKeys = vault.connectedServices
  const ideas = useMemo(() => getIdeas(connectedKeys), [connectedKeys])

  // ─── Recommendation Engine (recalculate on message count/view/action change) ──
  useEffect(() => {
    if (view !== 'chat') return

    setRecsThinking(true)
    const timer = setTimeout(() => {
      const ctx: RecommendationContext = {
        messages: messages.slice(-6).map(m => ({ role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text })),
        connectedServices: connectedKeys,
        recentActions,
        currentView: view,
        hasWorkflows: flowsHook.flows.length > 0,
        hasVaultFiles: true,
        hasPurchases: store.purchases.length > 0,
      }
      setRecommendations(getRecommendations(ctx))
      setRecsThinking(false)
    }, 600) // debounce to prevent rapid-fire recalculations

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, view, recentActions.length, connectedKeys.length, flowsHook.flows.length, store.purchases.length])

  // ─── Initialization ───────────────────────────────────────────
  // ─── Read ?view= URL param on mount ────────────────────────
  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam && viewParam !== 'upgrade') {
      setView(viewParam as View)
    }
    // Auto-open upgrade modal when redirected from Grid gate
    if (searchParams.get('ref') === 'community') {
      setShowUpgradeModal(true)
    }
  }, [searchParams])

  useEffect(() => {
    // Check admin status
    fetch('/api/admin/users?stats=true')
      .then(r => { if (r.ok) setIsAdmin(true) })
      .catch(() => {})

    // Fetch user plan
    fetch('/api/console/plan')
      .then(r => r.json())
      .then(data => { if (data.plan) setUserPlan(data.plan) })
      .catch(() => {})

    // Fetch user profile for header avatar
    fetch('/api/console/account')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUserName(data.full_name || '')
          setUserEmail(data.email || '')
          if (data.email === 'mike@rocketopp.com') setIsOwner(true)
        }
      })
      .catch(() => {})

    // Fetch spark/usage info
    fetch('/api/console/billing/status')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          if (data.isOwner) setIsOwner(true)
          if (data.runsBalance !== undefined) setRunCount(data.runsBalance)
          if (data.plan === 'free') setRunLimit(20)
          else if (data.plan === 'pro') setRunLimit(500)
          else if (data.plan === 'team') setRunLimit(5000)
        }
      })
      .catch(() => {})

    // Check 0nMCP health
    fetch('/api/console/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'online' || data.status === 'cloud') {
          setMcpOnline(true)
          setMcpHealth(data)
          if (data.mode === 'local') setView('runs')
        }
      })
      .catch(() => {})

    // Load 0nMCP workflows
    fetch('/api/console/workflows')
      .then((r) => r.json())
      .then((data) => setMcpWorkflows(data.workflows || []))
      .catch(() => {})

    // Detect URL params from redirects
    const params = new URLSearchParams(window.location.search)

    // Detect Google OAuth return
    const googleStatus = params.get('google')
    if (googleStatus === 'connected') {
      const serviceCount = params.get('services') || '0'
      setView('vault')
      setVaultSubView('credentials')
      // Brief visual notification via a system message
      setMessages(prev => [...prev, {
        role: 'system',
        text: `Google connected! ${serviceCount} services unlocked. Your vault has been automatically populated with Google credentials.`,
        source: 'local',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
      window.history.replaceState({}, '', '/console')
    } else if (googleStatus === 'denied') {
      setMessages(prev => [...prev, {
        role: 'system',
        text: 'Google connection was cancelled. You can try again from the vault.',
        source: 'local',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
      window.history.replaceState({}, '', '/console')
    } else if (googleStatus === 'error') {
      setMessages(prev => [...prev, {
        role: 'system',
        text: 'Google connection failed. Please try again.',
        source: 'local',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
      window.history.replaceState({}, '', '/console')
    }

    // Detect billing return from Stripe
    if (params.get('billing') === 'active') {
      fetch('/api/console/plan')
        .then(r => r.json())
        .then(data => { if (data.plan) setUserPlan(data.plan) })
        .catch(() => {})
      window.history.replaceState({}, '', '/console')
    }

    // Detect upgrade view request
    if (params.get('view') === 'upgrade') {
      setShowUpgradeModal(true)
      window.history.replaceState({}, '', '/console')
    }

    if (params.get('view') === 'store') {
      setView('store')
      if (params.get('purchased') === 'true') {
        store.fetchListings()
        store.fetchPurchases()
      }
      window.history.replaceState({}, '', '/console')
    }

    // Detect vendor onboarding return
    if (params.get('vendor') === 'onboarded' || params.get('vendor') === 'refresh') {
      setView('vendor')
      window.history.replaceState({}, '', '/console')
    }

    // Load premium purchases for flows view
    store.fetchPurchases()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Periodic health check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/console/health')
        .then((r) => r.json())
        .then((data) => {
          const online = data.status === 'online' || data.status === 'cloud'
          setMcpOnline(online)
          if (online) setMcpHealth(data)
        })
        .catch(() => setMcpOnline(false))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // ─── Keyboard Shortcuts ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdPaletteOpen((p) => !p)
      }
      if (e.key === 'Escape') {
        if (cmdPaletteOpen) setCmdPaletteOpen(false)
        else if (vaultService) setVaultService(null)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [cmdPaletteOpen, vaultService])

  // ─── Track visited views for persistent tab state ─────────────
  useEffect(() => {
    setVisitedViews(prev => {
      if (prev.has(view)) return prev
      return new Set(prev).add(view)
    })
  }, [view])

  // ─── Chat Handler ─────────────────────────────────────────────
  const handleChatSend = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        role: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setMessages((prev) => [...prev, userMsg])
      setChatLoading(true)

      historyHook.add('chat', text.length > 60 ? text.slice(0, 60) + '...' : text)

      try {
        const res = await fetch('/api/console/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })

        const data = await res.json()

        const sysMsg: ChatMessage = {
          role: 'system',
          text: data.text || data.error || 'No response received.',
          source: data.source || 'local',
          status: data.status,
          steps: data.steps,
          services: data.services,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
        setMessages((prev) => [...prev, sysMsg])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            text: 'Failed to reach the server. Check your connection.',
            source: 'local',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ])
      } finally {
        setChatLoading(false)
      }
    },
    [historyHook]
  )

  // ─── Command Palette Handler ──────────────────────────────────
  const handleCommand = useCallback(
    (cmd: string) => {
      setCmdPaletteOpen(false)
      switch (cmd) {
        case '/chat':
          setView('chat')
          break
        case '/credentials':
          setView('vault')
          setVaultSubView('credentials')
          setVaultService(null)
          break
        case '/vault':
          setView('vault')
          setVaultService(null)
          setVaultSubView('files')
          break
        case '/bundles':
          setView('vault')
          setVaultService(null)
          setVaultSubView('bundles')
          break
        case '/flows':
          setView('flows')
          break
        case '/builder':
          setView('builder')
          break
        case '/vendor':
          setView('vendor')
          break
        case '/outreach':
          setView('outreach')
          break
        case '/listkit':
          setView('listkit')
          break
        case '/training':
        case '/brain':
          setView('training')
          break
        case '/seo':
        case '/cro9':
          setView('seo')
          break
        case '/sync':
        case '/queue':
        case '/command':
          setView('sync')
          break
        case '/community':
        case '/forum':
          window.location.href = '/forum'
          break
        case '/store':
          setView('store')
          break
        case '/account':
        case '/request':
        case '/history':
          setView('account')
          break
        case '/admin':
          if (isAdmin) setView('admin')
          break
        case '/runs':
          setView('runs')
          break
        case '/status':
          fetch('/api/console/health')
            .then((r) => r.json())
            .then((data) => {
              const isOnline = data.status === 'online' || data.status === 'cloud'
              setMcpOnline(isOnline)
              if (isOnline) setMcpHealth(data)
              historyHook.add(
                'connect',
                `Status check: 0nMCP ${isOnline ? (data.mode === 'cloud' ? 'Cloud Mode' : 'online') : 'offline'}`
              )
            })
            .catch(() => {})
          break
        case '/affiliate':
        case '/referral':
          setView('affiliate')
          break
        case '/downloads':
          setView('downloads')
          break
        case '/help':
          setView('chat')
          handleChatSend('What commands are available in the 0n Console?')
          break
        default:
          if (cmd.startsWith('/')) {
            setView('chat')
            handleChatSend(cmd)
          }
      }
    },
    [historyHook, handleChatSend, isAdmin]
  )

  // ─── Workflow Run Handler ─────────────────────────────────────
  const handleRunWorkflow = useCallback(
    async (name: string) => {
      historyHook.add('workflow', `Running workflow: ${name}`)
      try {
        const res = await fetch('/api/console/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow: name }),
        })
        const data = await res.json()
        historyHook.add(
          'workflow',
          `Workflow "${name}": ${data.status || 'unknown'} (${data.duration_ms || 0}ms)`
        )
      } catch {
        historyHook.add('error', `Workflow "${name}" failed: server unreachable`)
      }
    },
    [historyHook]
  )

  // ─── View Handler (reset vault detail when switching) ─────────
  const handleSetView = useCallback((v: string) => {
    // These are now separate routes — sidebar handles navigation
    if (v === 'credentials' || v === 'vault') return
    if (v === 'terminal' || v === 'tools' || v === 'crew') return
    if (v === 'integrations') { window.location.href = '/console/integrations'; return }
    setView(v as View)
    if (v !== 'vault') {
      setVaultService(null)
    } else {
      setVaultSubView('files')
      setVaultService(null)
    }
  }, [])

  // ─── Ideas Click Handler ──────────────────────────────────────
  const handleIdeaClick = useCallback(
    (idea: string) => {
      setView('chat')
      handleChatSend(idea)
    },
    [handleChatSend]
  )

  // ─── Recommendation Execute Handler ──────────────────────────
  const handleRecommendationExecute = useCallback(
    (rec: Recommendation) => {
      trackAction(rec.id)
      if (rec.action === 'navigate' && rec.actionPayload) {
        handleSetView(rec.actionPayload)
      } else {
        handleChatSend(rec.command)
      }
    },
    [trackAction, handleSetView, handleChatSend]
  )

  // ─── Pinned Command Execute ─────────────────────────────────
  const handlePinnedCommand = useCallback(
    (command: string) => {
      setView('chat')
      handleChatSend(command)
    },
    [handleChatSend]
  )

  // ─── History for DashboardView (convert ts string to number) ──
  const recentHistory = useMemo(
    () =>
      historyHook.history.slice(0, 10).map((h) => ({
        id: h.id,
        type: h.type,
        detail: h.detail,
        ts: new Date(h.ts).getTime(),
      })),
    [historyHook.history]
  )

  // ─── Premium Flow Handlers ───────────────────────────────────
  const handlePremiumRun = useCallback(
    async (workflowData: Record<string, unknown>) => {
      const name = (workflowData as { name?: string }).name || 'premium-workflow'
      historyHook.add('workflow', `Running premium workflow: ${name}`)
      try {
        const res = await fetch('/api/console/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflow: workflowData }),
        })
        const data = await res.json()
        historyHook.add('workflow', `Premium "${name}": ${data.status || 'completed'}`)
      } catch {
        historyHook.add('error', `Premium "${name}" failed`)
      }
    },
    [historyHook]
  )

  const handleAddToBuilder = useCallback(
    (workflowData: Record<string, unknown>) => {
      localStorage.setItem('0nmcp-builder-import', JSON.stringify(workflowData))
      setActivePremiumPurchase(null)
      window.location.href = '/builder'
    },
    []
  )

  return (
    <div className="flex flex-col h-full" style={{ overflow: 'hidden', maxWidth: '100%', width: '100%', minWidth: 0 }}>
      {/* Content — visited views stay mounted for state persistence */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ minWidth: 0, maxWidth: '100%' }}>
          {/* Dashboard */}
          <div style={{ display: view === 'dashboard' ? 'flex' : 'none', minWidth: 0, maxWidth: '100%' }} className="flex-1 flex-col min-h-0 overflow-auto">
            <DashboardView
              mcpOnline={mcpOnline}
              mcpHealth={mcpHealth}
              connectedCount={vault.connectedCount}
              flowCount={flowsHook.flows.length}
              historyCount={historyHook.history.length}
              messageCount={messages.length}
              connectedServices={connectedKeys}
              recentHistory={recentHistory}
              onNavigate={handleSetView}
            />
          </div>

          {/* Chat — Three-column layout (Wowdash shell) */}
          {visitedViews.has('chat') && (
            <div
              className="flex-1 min-h-0 overflow-hidden"
              style={{ display: view === 'chat' ? 'flex' : 'none' }}
            >
              {/* CHAT MAIN — flex-1, takes remaining space */}
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Topbar — Quick Actions */}
                <div className="flex items-center gap-1 p-3 border-b border-white/10 shrink-0">
                  <PinnedCommands
                    onExecuteCommand={handlePinnedCommand}
                    onNavigate={handleSetView}
                  />
                </div>

                {/* Ideas Ticker */}
                {ideas.length > 0 && messages.length === 0 && (
                  <IdeasTicker ideas={ideas} onClick={handleIdeaClick} />
                )}

                {/* Messages Area — flex-1, scrollable */}
                <Chat
                  messages={messages}
                  loading={chatLoading}
                  hasAIKey={connectedKeys.includes('anthropic') || connectedKeys.includes('openai') || connectedKeys.includes('google')}
                  onNavigateVault={(service?: string) => {
                    setView('vault')
                    setVaultSubView('credentials')
                    if (service) {
                      setVaultService(service)
                      setVaultSearch('')
                    } else {
                      setVaultSearch('')
                      setVaultService(null)
                    }
                  }}
                />

                {/* Input Bar — pinned to bottom */}
                <ChatInput
                  onSend={handleChatSend}
                  onSlash={() => setCmdPaletteOpen(true)}
                  loading={chatLoading}
                  mcpOnline={mcpOnline}
                />
              </div>

              {/* CONTEXT PANEL — fixed w-72, never overlaps chat */}
              <div className="w-72 shrink-0 border-l border-white/10 bg-[#141414] hidden xl:flex flex-col overflow-hidden">
                {/* New Chat Button */}
                <div className="p-3 border-b border-white/10">
                  <button
                    onClick={handleNewChat}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#487fff] text-[#141414] text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#487fff]/80 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Chat
                  </button>
                </div>

                {/* Suggested Next */}
                {recommendations.length > 0 && (
                  <div className="p-3 border-b border-white/10">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#b4b4b4] mb-2 font-mono">
                      Suggested Next
                    </div>
                    <SmartPrompts
                      recommendations={recommendations}
                      onExecute={handleRecommendationExecute}
                      isThinking={recsThinking}
                    />
                  </div>
                )}

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#b4b4b4] px-3 py-1 mb-1 font-mono">
                    Conversations
                  </div>

                  {messages.length > 0 && (
                    <div className="px-3 py-2.5 rounded-lg mb-1 cursor-pointer bg-[#487fff]/8 border border-[#487fff]/15">
                      <div className="text-xs font-semibold text-[#FFFFFF] truncate">
                        {messages.find(m => m.role === 'user')?.text?.slice(0, 35) || 'Current Chat'}
                      </div>
                      <div className="text-[9px] text-[#487fff] mt-1 font-mono">
                        {messages.length} messages
                      </div>
                    </div>
                  )}

                  {(() => {
                    try {
                      const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('0n_chat_history') || '[]') : []
                      return (saved as Array<{ id: string; title: string; count: number; time: string }>).slice(0, 15).map((s: { id: string; title: string; count: number; time: string }) => (
                        <div
                          key={s.id}
                          className="px-3 py-2.5 rounded-lg mb-1 cursor-pointer hover:bg-white/3 transition-colors"
                        >
                          <div className="text-xs font-medium text-[#b4b4b4] truncate">
                            {s.title}
                          </div>
                          <div className="text-[10px] text-[#b4b4b4] mt-1 font-mono">
                            {s.count} msgs · {s.time}
                          </div>
                        </div>
                      ))
                    } catch { return null }
                  })()}

                  {messages.length === 0 && (
                    <div className="py-5 px-3 text-center">
                      <div className="w-10 h-10 rounded-xl mx-auto mb-2.5 bg-gradient-to-br from-[#487fff]/10 to-cyan-500/5 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-[#b4b4b4]">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-[#b4b4b4] leading-relaxed">
                        Your conversations will appear here
                      </p>
                    </div>
                  )}
                </div>

                {/* JAXX ONLINE — pinned to bottom */}
                <div className="mt-auto flex items-center gap-2 text-xs text-[#b4b4b4] p-4 border-t border-white/10">
                  <span className={`w-2 h-2 rounded-full ${mcpOnline ? 'bg-[#487fff] animate-pulse shadow-sm shadow-[#487fff]/50' : 'bg-[#b4b4b4]'}`} />
                  <span className="font-mono text-[9px] uppercase tracking-wider">
                    {mcpOnline ? 'Jaxx Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Vault */}
          {visitedViews.has('vault') && (
            <div style={{ display: view === 'vault' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              {vaultService ? (
                <VaultDetail
                  service={vaultService}
                  onBack={() => { setVaultService(null); setVaultSubView('credentials') }}
                  vault={vault.credentials}
                  onSave={vault.set}
                />
              ) : vaultSubView === 'credentials' ? (
                <VaultOverlay
                  onSelect={setVaultService}
                  connectedServices={connectedKeys}
                  searchQuery={vaultSearch}
                  onSearch={setVaultSearch}
                />
              ) : vaultSubView === 'bundles' ? (
                <BundleManager
                  connectedServices={connectedKeys}
                  vault={vault.credentials}
                  onImport={vault.set}
                  onSwitchToCredentials={() => setVaultSubView('credentials')}
                />
              ) : (
                <VaultFilesPanel
                  onSwitchToCredentials={() => setVaultSubView('credentials')}
                  onSwitchToBundles={() => setVaultSubView('bundles')}
                  onAddToBuilder={(data) => {
                    localStorage.setItem('0n_builder_import', JSON.stringify(data))
                    window.location.href = '/builder'
                  }}
                />
              )}
            </div>
          )}

          {/* Create */}
          {visitedViews.has('flows') && (
            <div style={{ display: view === 'flows' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-hidden">
              <CreateView
                onAddToBuilder={(workflow: Record<string, unknown>) => {
                  localStorage.setItem('0nmcp-builder-import', JSON.stringify(workflow))
                  historyHook.add('workflow', 'Workflow created via 0n Create Agent')
                  window.location.href = '/builder'
                }}
              />
            </div>
          )}


          {/* Store / Marketplace */}
          {visitedViews.has('store') && (
            <div style={{ display: view === 'store' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <StoreView
                listings={store.listings}
                purchasedIds={store.purchasedIds}
                loading={store.loading}
                onFetch={store.fetchListings}
                onCheckout={store.checkout}
                onSubscribe={store.subscribe}
                onGetSubscription={store.getSubscription}
              />
            </div>
          )}


          {/* Account */}
          {visitedViews.has('account') && (
            <div style={{ display: view === 'account' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <AccountView />
            </div>
          )}

          {/* Admin */}
          {isAdmin && visitedViews.has('admin') && (
            <div style={{ display: view === 'admin' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <AdminView />
            </div>
          )}

          {/* Operations */}
          {visitedViews.has('operations') && (
            <div style={{ display: view === 'operations' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <OperationsView flowCount={flowsHook.flows.length} history={recentHistory} />
            </div>
          )}

          {/* Social Hub */}
          {visitedViews.has('social') && (
            <div style={{ display: view === 'social' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <SocialView />
            </div>
          )}

          {/* Reporting */}
          {visitedViews.has('reporting') && (
            <div style={{ display: view === 'reporting' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <ReportingView historyCount={historyHook.history.length} messageCount={messages.length} connectedCount={vault.connectedCount} />
            </div>
          )}

          {/* Code */}
          {visitedViews.has('code') && (
            <div style={{ display: view === 'code' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <CodeView />
            </div>
          )}

          {/* LinkedIn */}
          {visitedViews.has('linkedin') && (
            <div style={{ display: view === 'linkedin' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <LinkedInView />
            </div>
          )}

          {/* Migrate */}
          {visitedViews.has('migrate') && (
            <div style={{ display: view === 'migrate' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <MigrateView />
            </div>
          )}

          {/* Convert */}
          {visitedViews.has('convert') && (
            <div style={{ display: view === 'convert' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <ConvertView />
            </div>
          )}

          {/* Spark Runner */}
          {visitedViews.has('runs') && (
            <div style={{ display: view === 'runs' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <RunsView
                mcpOnline={mcpOnline}
                mcpHealth={mcpHealth}
                mcpWorkflows={mcpWorkflows}
                onRunWorkflow={handleRunWorkflow}
              />
            </div>
          )}

          {/* AI Marketing Builder */}
          {visitedViews.has('builder') && (
            <div style={{ display: view === 'builder' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-hidden">
              <BuilderView />
            </div>
          )}

          {/* 0nEngine — Agentic AI Builder */}
          {visitedViews.has('engine') && (
            <div style={{ display: view === 'engine' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-hidden">
              <EngineView />
            </div>
          )}

          {/* Vendor Dashboard */}
          {visitedViews.has('vendor') && (
            <div style={{ display: view === 'vendor' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <VendorView />
            </div>
          )}

          {/* Outreach Enricher */}
          {visitedViews.has('outreach') && (
            <div style={{ display: view === 'outreach' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <OutreachView />
            </div>
          )}

          {/* ListKit — routes to outreach with listkit context */}
          {visitedViews.has('listkit') && (
            <div style={{ display: view === 'listkit' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <OutreachView initialTab="listkit" />
            </div>
          )}

          {/* Brain Training */}
          {visitedViews.has('training') && (
            <div style={{ display: view === 'training' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <TrainingView isAdmin={isAdmin} />
            </div>
          )}

          {/* Command Queue — 0nCommand ↔ 0nLive Sync */}
          {visitedViews.has('sync') && (
            <div style={{ display: view === 'sync' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <CommandQueueView isAdmin={isAdmin} />
            </div>
          )}

          {/* SEO Engine */}
          {visitedViews.has('seo') && (
            <div style={{ display: view === 'seo' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <SeoView />
            </div>
          )}

          {/* Site Builder */}
          {visitedViews.has('site-builder') && (
            <div style={{ display: view === 'site-builder' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-hidden">
              <SiteBuilderView />
            </div>
          )}

          {/* Affiliate */}
          {visitedViews.has('affiliate') && (
            <div style={{ display: view === 'affiliate' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <AffiliateView />
            </div>
          )}

          {/* Downloads */}
          {visitedViews.has('downloads') && (
            <div style={{ display: view === 'downloads' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
              <DownloadsView />
            </div>
          )}
        </main>

        {/* Core AI Footer */}
        <div id="core-ai-footer">
          <CoreAIFooter
            coreAI={vault.coreAI}
            onSetCoreAI={vault.setCoreAI}
            onTutorialTrigger={() => setShowTutorial(true)}
          />
        </div>

      {/* Core AI Tutorial Modal */}
      {showTutorial && vault.coreAI && (
        <CoreAITutorial
          provider={vault.coreAI}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        open={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onSelect={handleCommand}
      />

      {/* Premium Flow Action Modal */}
      {activePremiumPurchase && (
        <PremiumFlowActionModal
          purchase={activePremiumPurchase}
          onClose={() => setActivePremiumPurchase(null)}
          onRun={handlePremiumRun}
          onAddToBuilder={handleAddToBuilder}
          onDownload={store.download}
          onViewDetails={() => {
            if (activePremiumPurchase.listing) {
              setPremiumDetailListing(activePremiumPurchase.listing)
            }
            setActivePremiumPurchase(null)
          }}
        />
      )}

      {/* Premium Detail Listing Modal */}
      {premiumDetailListing && (
        <ListingDetailModal
          listing={premiumDetailListing}
          owned={true}
          onClose={() => setPremiumDetailListing(null)}
          onCheckout={store.checkout}
          onSubscribe={store.subscribe}
          onGetSubscription={store.getSubscription}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          currentPlan={userPlan}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Feedback Agent */}
      <FeedbackAgent />
    </div>
  )
}
// Jaxx v4.3 — 1773986047
