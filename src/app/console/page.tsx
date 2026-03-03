'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Components
import { Sidebar, type SidebarMode } from '@/components/console/Sidebar'
import { Header } from '@/components/console/Header'
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
import { AccountView } from '@/components/console/AccountView'
import { AdminView } from '@/components/console/AdminView'
import { SmartPrompts } from '@/components/console/SmartPrompts'
import { PinnedCommands } from '@/components/console/PinnedCommands'

// Hooks & data
import { useVault, useFlows, useHistory } from '@/lib/console/hooks'
import { useStore } from '@/lib/console/useStore'
import { getIdeas } from '@/lib/console/ideas'
import { getRecommendations, type RecommendationContext, type Recommendation } from '@/lib/console/recommendations'
import type { PurchaseWithWorkflow, StoreListing } from '@/components/console/StoreTypes'

type View = 'dashboard' | 'chat' | 'vault' | 'flows' | 'store' | 'account' | 'admin'

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
  // ─── View State ───────────────────────────────────────────────
  const [view, setView] = useState<View>('dashboard')
  const [visitedViews, setVisitedViews] = useState<Set<View>>(() => new Set(['dashboard']))
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('open')
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ─── MCP State ────────────────────────────────────────────────
  const [mcpOnline, setMcpOnline] = useState(false)
  const [mcpHealth, setMcpHealth] = useState<McpHealth | null>(null)
  const [mcpWorkflows, setMcpWorkflows] = useState<McpWorkflow[]>([])

  // ─── Chat State ───────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  // ─── Vault State ──────────────────────────────────────────────
  const [vaultSearch, setVaultSearch] = useState('')
  const [vaultService, setVaultService] = useState<string | null>(null)
  const [vaultSubView, setVaultSubView] = useState<'files' | 'credentials'>('files')

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

  // ─── Sidebar Mode Toggle ───────────────────────────────────
  const handleToggleSidebarMode = useCallback(() => {
    setSidebarMode((prev) => {
      if (prev === 'open') return 'hidden'
      if (prev === 'hidden') return 'icons'
      return 'open'
    })
  }, [])

  // ─── Initialization ───────────────────────────────────────────
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

    // Check 0nMCP health
    fetch('/api/console/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'online' || data.status === 'cloud') {
          setMcpOnline(true)
          setMcpHealth(data)
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
        case '/flows':
          setView('flows')
          break
        case '/builder':
          window.location.href = '/builder'
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
    // Credentials sidebar item → open Vault in credentials sub-view
    if (v === 'credentials') {
      setView('vault')
      setVaultSubView('credentials')
      setVaultService(null)
      setMobileMenuOpen(false)
      return
    }
    setView(v as View)
    if (v !== 'vault') {
      setVaultService(null)
    } else {
      setVaultSubView('files')
      setVaultService(null)
    }
    setMobileMenuOpen(false)
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
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            backgroundColor: 'rgba(10,10,15,0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-50 h-full transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          view={view}
          setView={handleSetView}
          mode={sidebarMode}
          onToggleMode={handleToggleSidebarMode}
          connectedCount={vault.connectedCount}
          mcpOnline={mcpOnline}
          isAdmin={isAdmin}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header
          view={view}
          mcpOnline={mcpOnline}
          connectedCount={vault.connectedCount}
          userPlan={userPlan}
          onCmdK={() => setCmdPaletteOpen(true)}
          onMobileMenu={() => setMobileMenuOpen((p) => !p)}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />

        {/* Content — visited views stay mounted for state persistence */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Dashboard */}
          <div style={{ display: view === 'dashboard' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0 overflow-auto">
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

          {/* Chat */}
          {visitedViews.has('chat') && (
            <div style={{ display: view === 'chat' ? 'flex' : 'none' }} className="flex-1 flex-col min-h-0">
              {/* Pinned Commands Bar */}
              <PinnedCommands
                onExecuteCommand={handlePinnedCommand}
                onNavigate={handleSetView}
              />
              {ideas.length > 0 && messages.length === 0 && (
                <IdeasTicker ideas={ideas} onClick={handleIdeaClick} />
              )}
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
              {/* AI Smart Prompts */}
              <SmartPrompts
                recommendations={recommendations}
                onExecute={handleRecommendationExecute}
                isThinking={recsThinking}
              />
              <ChatInput
                onSend={handleChatSend}
                onSlash={() => setCmdPaletteOpen(true)}
                loading={chatLoading}
                mcpOnline={mcpOnline}
              />
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
              ) : (
                <VaultFilesPanel
                  onSwitchToCredentials={() => setVaultSubView('credentials')}
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
        </main>
      </div>

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
