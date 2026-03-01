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
import { FlowsOverlay } from '@/components/console/FlowsOverlay'
import { HistoryOverlay } from '@/components/console/HistoryOverlay'
import { IdeasTicker } from '@/components/console/IdeasTicker'
import { CommunityView } from '@/components/console/CommunityView'
import { StoreView } from '@/components/console/StoreView'
import { PremiumFlowActionModal } from '@/components/console/PremiumFlowActionModal'
import { ListingDetailModal } from '@/components/console/ListingDetailModal'
import { LinkedInView } from '@/components/console/LinkedInView'
import { RequestIntegrationView } from '@/components/console/RequestIntegrationView'
import { OperationsView } from '@/components/console/OperationsView'
import { SocialView } from '@/components/console/SocialView'
import { ReportingView } from '@/components/console/ReportingView'
import MigrateView from '@/components/console/MigrateView'
import { CreateView } from '@/components/console/CreateView'
import BuilderApp from '@/components/builder/BuilderApp'
import FeedbackAgent from '@/components/console/FeedbackAgent'
import { LearnView } from '@/components/console/LearnView'
import dynamic from 'next/dynamic'

const OnTerminal = dynamic(
  () => import('@/components/terminal/OnTerminal'),
  { ssr: false }
)

const CodeTerminal = dynamic(
  () => import('@/components/console/CodeTerminal').then(m => ({ default: m.CodeTerminal })),
  { ssr: false }
)

// Hooks & data
import { useVault, useFlows, useHistory } from '@/lib/console/hooks'
import { useStore } from '@/lib/console/useStore'
import { useLinkedIn } from '@/lib/console/useLinkedIn'
import { useOperations } from '@/lib/console/useOperations'
import { getIdeas } from '@/lib/console/ideas'
import type { PurchaseWithWorkflow, StoreListing } from '@/components/console/StoreTypes'

type View = 'dashboard' | 'chat' | 'vault' | 'flows' | 'history' | 'community' | 'builder' | 'store' | 'linkedin' | 'request' | 'operations' | 'social' | 'reporting' | 'migrate' | 'terminal' | 'learn' | 'code'

interface McpHealth {
  version?: string
  uptime?: number
  connections?: number
  services?: string[]
  tools?: number
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

  // ─── Hooks ────────────────────────────────────────────────────
  const vault = useVault()
  const flowsHook = useFlows()
  const historyHook = useHistory()
  const store = useStore()
  const linkedin = useLinkedIn()
  const operations = useOperations()

  // ─── Store Modal State ──────────────────────────────────────
  const [activePremiumPurchase, setActivePremiumPurchase] = useState<PurchaseWithWorkflow | null>(null)
  const [premiumDetailListing, setPremiumDetailListing] = useState<StoreListing | null>(null)

  // ─── Derived ──────────────────────────────────────────────────
  const connectedKeys = vault.connectedServices
  const ideas = useMemo(() => getIdeas(connectedKeys), [connectedKeys])

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
    // Check 0nMCP health
    fetch('/api/console/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'online') {
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
    if (params.get('view') === 'store') {
      setView('store')
      if (params.get('purchased') === 'true') {
        store.fetchListings()
        store.fetchPurchases()
      }
      window.history.replaceState({}, '', '/console')
    }

    // Detect LinkedIn OAuth return
    if (params.get('linkedin') === 'connected') {
      setView('linkedin')
      linkedin.fetchMember()
      window.history.replaceState({}, '', '/console')
    }
    if (params.get('linkedin_error')) {
      setView('linkedin')
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
          const online = data.status === 'online'
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
        case '/vault':
          setView('vault')
          setVaultService(null)
          break
        case '/flows':
          setView('flows')
          break
        case '/community':
          setView('community')
          break
        case '/builder':
          setView('builder')
          break
        case '/store':
          setView('store')
          break
        case '/linkedin':
          setView('linkedin')
          break
        case '/request':
          setView('request')
          break
        case '/operations':
          setView('operations')
          break
        case '/social':
          setView('social')
          break
        case '/reporting':
          setView('reporting')
          break
        case '/migrate':
          setView('migrate')
          break
        case '/terminal':
          setView('terminal')
          break
        case '/learn':
          setView('learn')
          break
        case '/code':
          setView('code')
          break
        case '/history':
          setView('history')
          break
        case '/status':
          fetch('/api/console/health')
            .then((r) => r.json())
            .then((data) => {
              setMcpOnline(data.status === 'online')
              if (data.status === 'online') setMcpHealth(data)
              historyHook.add(
                'connect',
                `Status check: 0nMCP ${data.status === 'online' ? 'online' : 'offline'}`
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
    [historyHook, handleChatSend]
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
    setView(v as View)
    if (v !== 'vault') setVaultService(null)
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

  // ─── History for HistoryOverlay (convert ts string to number) ─
  const fullHistory = useMemo(
    () =>
      historyHook.history.map((h) => ({
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
      setView('builder')
      setActivePremiumPurchase(null)
    },
    []
  )

  // ─── Render ───────────────────────────────────────────────────
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <DashboardView
            mcpOnline={mcpOnline}
            mcpHealth={mcpHealth}
            connectedCount={vault.connectedCount}
            flowCount={flowsHook.flows.length}
            historyCount={historyHook.history.length}
            messageCount={messages.length}
            connectedServices={connectedKeys}
            recentHistory={recentHistory}
          />
        )

      case 'chat':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            {ideas.length > 0 && messages.length === 0 && (
              <IdeasTicker ideas={ideas} onClick={handleIdeaClick} />
            )}
            <Chat messages={messages} loading={chatLoading} />
            <ChatInput
              onSend={handleChatSend}
              onSlash={() => setCmdPaletteOpen(true)}
              loading={chatLoading}
              mcpOnline={mcpOnline}
            />
          </div>
        )

      case 'vault':
        if (vaultService) {
          return (
            <div className="flex-1 overflow-y-auto">
              <VaultDetail
                service={vaultService}
                onBack={() => setVaultService(null)}
                vault={vault.credentials}
                onSave={vault.set}
              />
            </div>
          )
        }
        return (
          <div className="flex-1 overflow-y-auto">
            <VaultOverlay
              onSelect={setVaultService}
              connectedServices={connectedKeys}
              searchQuery={vaultSearch}
              onSearch={setVaultSearch}
            />
          </div>
        )

      case 'flows':
        return (
          <div className="flex-1 min-h-0 overflow-hidden">
            <CreateView
              onAddToBuilder={(workflow: Record<string, unknown>) => {
                localStorage.setItem('0nmcp-builder-import', JSON.stringify(workflow))
                historyHook.add('workflow', 'Workflow created via 0n Create Agent')
                setView('builder')
              }}
            />
          </div>
        )

      case 'operations':
        return (
          <div className="flex-1 overflow-y-auto">
            <OperationsView
              operations={operations.operations}
              onPause={operations.pause}
              onResume={operations.resume}
              onRun={(id: string) => {
                operations.incrementRun(id)
                const op = operations.getById(id)
                if (op) {
                  historyHook.add('workflow', `Ran operation: ${op.name}`)
                }
              }}
              onDelete={operations.remove}
              onCreateNew={() => setView('flows')}
            />
          </div>
        )

      case 'social':
        return (
          <div className="flex-1 overflow-y-auto">
            <SocialView />
          </div>
        )

      case 'reporting':
        return (
          <div className="flex-1 overflow-y-auto">
            <ReportingView />
          </div>
        )

      case 'migrate':
        return (
          <div className="flex-1 overflow-y-auto">
            <MigrateView
              onAddToBuilder={(workflow: Record<string, unknown>) => {
                localStorage.setItem('0nmcp-builder-import', JSON.stringify(workflow))
                setView('builder')
              }}
              onAddToOperations={(
                workflow: Record<string, unknown>,
                name: string,
                trigger: Record<string, unknown>,
                services: string[]
              ) => {
                const triggerType = typeof trigger.type === 'string' ? trigger.type : 'manual'
                operations.add({
                  name: name || 'Migrated Workflow',
                  description: 'Imported from external platform',
                  trigger: triggerType,
                  actions: [],
                  services: services || [],
                  notifications: [],
                  frequency: null,
                  workflowData: workflow,
                })
                historyHook.add('workflow', `Migrated workflow: ${name}`)
                setView('operations')
              }}
            />
          </div>
        )

      case 'community':
        return (
          <div className="flex-1 min-h-0">
            <CommunityView />
          </div>
        )

      case 'builder':
        return (
          <div className="flex-1 min-h-0 overflow-hidden">
            <BuilderApp />
          </div>
        )

      case 'linkedin':
        return (
          <div className="flex-1 min-h-0">
            <LinkedInView linkedin={linkedin} />
          </div>
        )

      case 'request':
        return (
          <div className="flex-1 overflow-y-auto">
            <RequestIntegrationView />
          </div>
        )

      case 'store':
        return (
          <div className="flex-1 overflow-y-auto">
            <StoreView
              listings={store.listings}
              purchasedIds={store.purchasedIds}
              loading={store.loading}
              onFetch={store.fetchListings}
              onCheckout={store.checkout}
            />
          </div>
        )

      case 'terminal':
        return (
          <div className="flex-1 min-h-0 overflow-hidden">
            <OnTerminal
              height="100%"
              enableNode={true}
              enablePython={true}
              packages={['0nmcp']}
              onReady={() => historyHook.add('terminal', 'Web Terminal opened')}
            />
          </div>
        )

      case 'learn':
        return (
          <div className="flex-1 min-h-0">
            <LearnView />
          </div>
        )

      case 'code':
        return (
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeTerminal />
          </div>
        )

      case 'history':
        return (
          <div className="flex-1 overflow-y-auto">
            <HistoryOverlay history={fullHistory} onClear={historyHook.clear} />
          </div>
        )

      default:
        return null
    }
  }

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
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header
          view={view}
          mcpOnline={mcpOnline}
          connectedCount={vault.connectedCount}
          onCmdK={() => setCmdPaletteOpen(true)}
          onMobileMenu={() => setMobileMenuOpen((p) => !p)}
        />

        {/* Content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderContent()}
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

      {/* Feedback Agent */}
      <FeedbackAgent />
    </div>
  )
}
