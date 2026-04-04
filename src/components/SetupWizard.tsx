'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

/* ─── Types ─────────────────────────────────────────────────────── */

interface SetupWizardProps {
  onComplete?: () => void
  onSkip?: () => void
  embedded?: boolean
}

interface WizardState {
  currentStep: number
  platforms: string[]
  services: Record<string, string>
  completed: boolean
}

const TOTAL_STEPS = 5
const STORAGE_KEY = '0n-wizard'

/* ─── Platform Data ─────────────────────────────────────────────── */

const PLATFORMS = [
  {
    key: 'claude',
    name: '0nClaude',
    subtitle: 'Claude Desktop / Claude Code',
    desc: '1,589 tools inside Claude',
    color: '#d4a27f',
    letter: 'C',
  },
  {
    key: 'slack',
    name: '0nSlack',
    subtitle: 'Slack workspace',
    desc: 'AI workflows in any channel',
    color: '#4a154b',
    letter: 'S',
  },
  {
    key: 'gpt',
    name: '0nGPT',
    subtitle: 'ChatGPT',
    desc: 'GPT action with 102 services',
    color: '#10a37f',
    letter: 'G',
  },
  {
    key: 'press',
    name: '0nPress',
    subtitle: 'WordPress',
    desc: 'AI chat + CRM on your site',
    color: '#21759b',
    letter: 'W',
  },
]

const PLATFORM_CONFIGS: Record<string, {
  steps: string[]
  config: string
  testLabel: string
  testDesc: string
}> = {
  claude: {
    steps: [
      'Open Claude Desktop',
      'Go to Settings > Developer > Edit Config',
      'Paste the config below',
      'Restart Claude Desktop',
    ],
    config: `{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`,
    testLabel: 'Verify Installation',
    testDesc: 'Type "list tools" in Claude Desktop to confirm 0nMCP is connected.',
  },
  slack: {
    steps: [
      'Click "Add to Slack" below',
      'Authorize 0nMCP for your workspace',
      'Type /0n status in any channel',
    ],
    config: '',
    testLabel: 'Test in Slack',
    testDesc: 'Type /0n status in any Slack channel to verify.',
  },
  gpt: {
    steps: [
      'Open ChatGPT > Create a GPT',
      'Go to Actions > Add Action',
      'Set the Action URL below',
      'Set Auth to OAuth from your 0nMCP account',
    ],
    config: 'https://www.0nmcp.com/api/chatgpt/mcp',
    testLabel: 'Test the Action',
    testDesc: 'Test the action URL in your GPT to confirm it connects.',
  },
  press: {
    steps: [
      'Download the 0nPress plugin from your dashboard',
      'In WordPress: Plugins > Add New > Upload',
      'Activate the plugin',
      'Enter your PIT token in the 0nCore settings',
    ],
    config: '',
    testLabel: 'Verify in WordPress',
    testDesc: 'Check your WordPress admin for the 0nCore menu item.',
  },
}

const SERVICES = [
  { key: 'stripe', name: 'Stripe', desc: 'Payments & invoicing', color: '#635bff', letter: 'S', keyUrl: 'https://dashboard.stripe.com/apikeys' },
  { key: 'openai', name: 'OpenAI', desc: 'AI completions', color: '#10a37f', letter: 'O', keyUrl: 'https://platform.openai.com/api-keys' },
  { key: 'anthropic', name: 'Anthropic', desc: 'Claude API', color: '#d4a27f', letter: 'A', keyUrl: 'https://console.anthropic.com/settings/keys' },
  { key: 'supabase', name: 'Supabase', desc: 'Database & auth', color: '#3ecf8e', letter: 'D', keyUrl: 'https://supabase.com/dashboard/project/_/settings/api' },
  { key: 'slack', name: 'Slack', desc: 'Messaging', color: '#4a154b', letter: 'M', keyUrl: 'https://api.slack.com/apps' },
  { key: 'github', name: 'GitHub', desc: 'Code & repos', color: '#333', letter: 'G', keyUrl: 'https://github.com/settings/tokens' },
]

/* ─── SVG Icons ─────────────────────────────────────────────────── */

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const WorkflowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const StoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z" />
    <line x1="3" y1="7" x2="21" y2="7" />
    <path d="M16 11a4 4 0 0 1-8 0" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

/* ─── Component ─────────────────────────────────────────────────── */

export default function SetupWizard({ onComplete, onSkip, embedded = false }: SetupWizardProps) {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    platforms: [],
    services: {},
    completed: false,
  })
  const [slideDir, setSlideDir] = useState<'left' | 'right' | 'center'>('center')
  const [animating, setAnimating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeInstallTab, setActiveInstallTab] = useState<string>('')
  const [expandedService, setExpandedService] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /* ─── Persistence ─────────────────────────────────────────────── */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as WizardState
        setState(parsed)
        if (parsed.platforms.length > 0) {
          setActiveInstallTab(parsed.platforms[0])
        }
      }
    } catch { /* ignore */ }
  }, [])

  const persist = useCallback((next: WizardState) => {
    setState(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch { /* ignore */ }
  }, [])

  /* ─── Navigation ──────────────────────────────────────────────── */

  const goTo = useCallback((step: number) => {
    if (animating || step < 1 || step > TOTAL_STEPS) return
    setSlideDir(step > state.currentStep ? 'right' : 'left')
    setAnimating(true)
    setTimeout(() => {
      const next = { ...state, currentStep: step }
      persist(next)
      setSlideDir('center')
      setTimeout(() => setAnimating(false), 50)
    }, 150)
  }, [state, animating, persist])

  const nextStep = useCallback(() => {
    goTo(state.currentStep + 1)
  }, [state.currentStep, goTo])

  const prevStep = useCallback(() => {
    goTo(state.currentStep - 1)
  }, [state.currentStep, goTo])

  const completeWizard = useCallback(() => {
    const next = { ...state, completed: true }
    persist(next)
    onComplete?.()
  }, [state, persist, onComplete])

  const restartWizard = useCallback(() => {
    const fresh: WizardState = { currentStep: 1, platforms: [], services: {}, completed: false }
    persist(fresh)
    setSlideDir('center')
  }, [persist])

  /* ─── Platform toggle ─────────────────────────────────────────── */

  const togglePlatform = useCallback((key: string) => {
    const platforms = state.platforms.includes(key)
      ? state.platforms.filter(p => p !== key)
      : [...state.platforms, key]
    const next = { ...state, platforms }
    persist(next)
    if (platforms.length > 0 && !platforms.includes(activeInstallTab)) {
      setActiveInstallTab(platforms[0])
    } else if (platforms.length > 0 && !activeInstallTab) {
      setActiveInstallTab(platforms[0])
    }
  }, [state, persist, activeInstallTab])

  /* ─── Service key ─────────────────────────────────────────────── */

  const setServiceKey = useCallback((key: string, value: string) => {
    const services = { ...state.services, [key]: value }
    persist({ ...state, services })
  }, [state, persist])

  /* ─── Copy ────────────────────────────────────────────────────── */

  const copyText = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  /* ─── Completed state ─────────────────────────────────────────── */

  if (state.completed) {
    return (
      <div style={{
        ...(!embedded ? styles.fullScreen : {}),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1.5rem',
        minHeight: embedded ? 200 : '100vh',
      }}>
        <div style={{
          background: 'rgba(126,217,87,0.08)',
          border: '1px solid rgba(126,217,87,0.2)',
          borderRadius: 16,
          padding: '2rem 3rem',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: '0.75rem' }}><CheckIcon /></div>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Setup complete</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
            {state.platforms.length} platform{state.platforms.length !== 1 ? 's' : ''} installed
            {Object.keys(state.services).length > 0 && ` / ${Object.keys(state.services).length} service${Object.keys(state.services).length !== 1 ? 's' : ''} connected`}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={styles.linkBtn}>Go to Dashboard</Link>
            <button onClick={restartWizard} style={styles.ghostBtn}>Restart Setup</button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Computed ────────────────────────────────────────────────── */

  const canProceedStep2 = state.platforms.length > 0
  const connectedServices = Object.entries(state.services).filter(([, v]) => v.trim().length > 0)

  /* ─── Render helpers ──────────────────────────────────────────── */

  const renderProgressBars = () => (
    <div style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const num = i + 1
        const isCompleted = num < state.currentStep
        const isActive = num === state.currentStep
        return (
          <div
            key={num}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              background: isActive ? '#7ed957' : isCompleted ? 'rgba(126,217,87,0.6)' : '#1e293b',
              transition: 'background 0.4s ease',
            }}
          />
        )
      })}
    </div>
  )

  const renderStepLabel = () => (
    <div style={styles.stepLabel}>STEP {state.currentStep}/{TOTAL_STEPS}</div>
  )

  const renderNav = (showBack: boolean, showSkip: boolean, nextDisabled: boolean, nextLabel = 'NEXT STEP') => (
    <div style={styles.navRow}>
      <div style={{ flex: 1, textAlign: 'left' as const }}>
        {showBack && state.currentStep > 1 && (
          <button onClick={prevStep} style={styles.backBtn}>
            <ArrowLeft /> Back
          </button>
        )}
      </div>
      <button
        onClick={state.currentStep === TOTAL_STEPS ? completeWizard : nextStep}
        disabled={nextDisabled}
        style={{
          ...styles.nextBtn,
          opacity: nextDisabled ? 0.4 : 1,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {nextLabel} <ArrowRight />
      </button>
      <div style={{ flex: 1, textAlign: 'right' as const }}>
        {showSkip && (
          <button onClick={nextStep} style={styles.skipBtn}>
            Skip
          </button>
        )}
      </div>
    </div>
  )

  /* ─── Step panels ─────────────────────────────────────────────── */

  const slideStyle = (step: number): React.CSSProperties => {
    const isActive = state.currentStep === step
    if (!isActive) return { display: 'none' }
    return {
      ...styles.slidePanel,
      opacity: animating ? 0 : 1,
      transform: animating
        ? slideDir === 'right' ? 'translateX(40px)' : 'translateX(-40px)'
        : 'translateX(0)',
    }
  }

  /* Step 1: Welcome */
  const step1 = (
    <div style={slideStyle(1)}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={styles.logoContainer}>
          <div style={styles.logoOrb}>0n</div>
        </div>
      </div>
      <h1 style={styles.heading}>Let&apos;s set up 0nMCP</h1>
      <p style={styles.subtitle}>1,589 tools. 102 services. Pick where you want to use them.</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
        <button onClick={nextStep} style={styles.nextBtn}>
          Let&apos;s Go <ArrowRight />
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={() => { onSkip?.(); completeWizard() }}
          style={styles.skipBtn}
        >
          Skip setup entirely
        </button>
      </div>
    </div>
  )

  /* Step 2: Platforms */
  const step2 = (
    <div style={slideStyle(2)}>
      {renderStepLabel()}
      <h1 style={styles.heading}>Where do you want to use 0nMCP?</h1>
      <p style={styles.subtitle}>Select all that apply. You can always add more later.</p>
      <div style={styles.platformGrid}>
        {PLATFORMS.map(p => {
          const selected = state.platforms.includes(p.key)
          return (
            <button
              key={p.key}
              onClick={() => togglePlatform(p.key)}
              className="wiz-card"
              style={{
                ...styles.card,
                borderColor: selected ? '#7ed957' : 'rgba(255,255,255,0.08)',
                background: selected ? 'rgba(126,217,87,0.06)' : 'rgba(255,255,255,0.04)',
              }}
            >
              {selected && (
                <div style={styles.cardCheck}><CheckIcon /></div>
              )}
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 800, color: '#fff',
                marginBottom: '0.75rem',
              }}>
                {p.letter}
              </div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '0.15rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>{p.subtitle}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.desc}</div>
            </button>
          )
        })}
      </div>
      {renderNav(true, true, !canProceedStep2)}
    </div>
  )

  /* Step 3: Install */
  const step3 = (
    <div style={slideStyle(3)}>
      {renderStepLabel()}
      <h1 style={styles.heading}>Install 0nMCP</h1>
      <p style={styles.subtitle}>Follow the steps for each platform you selected.</p>

      {state.platforms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
          No platforms selected. Go back to choose at least one.
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={styles.tabRow}>
            {state.platforms.map(key => {
              const p = PLATFORMS.find(pl => pl.key === key)!
              const active = activeInstallTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveInstallTab(key)}
                  style={{
                    ...styles.tab,
                    borderColor: active ? '#7ed957' : 'transparent',
                    color: active ? '#fff' : '#64748b',
                    background: active ? 'rgba(126,217,87,0.08)' : 'transparent',
                  }}
                >
                  {p.name}
                </button>
              )
            })}
          </div>

          {/* Active tab content */}
          {state.platforms.map(key => {
            if (key !== activeInstallTab) return null
            const cfg = PLATFORM_CONFIGS[key]
            if (!cfg) return null
            return (
              <div key={key} style={{ marginTop: '1.5rem' }}>
                <ol style={styles.stepsList}>
                  {cfg.steps.map((s, i) => (
                    <li key={i} style={styles.stepsItem}>{s}</li>
                  ))}
                </ol>

                {cfg.config && (
                  <div style={styles.codeBlock}>
                    <button
                      onClick={() => copyText(cfg.config, `install-${key}`)}
                      style={styles.copyBtn}
                    >
                      {copiedId === `install-${key}` ? 'Copied!' : <CopyIcon />}
                    </button>
                    <pre style={styles.codePre}>{cfg.config}</pre>
                  </div>
                )}

                {key === 'slack' && (
                  <a href="/api/slack/install" style={styles.slackBtn}>
                    Add to Slack
                  </a>
                )}

                <div style={styles.testBox}>
                  <div style={{ fontWeight: 700, color: '#7ed957', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    {cfg.testLabel}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{cfg.testDesc}</div>
                </div>
              </div>
            )
          })}
        </>
      )}
      {renderNav(true, true, false)}
    </div>
  )

  /* Step 4: Connect Services */
  const step4 = (
    <div style={slideStyle(4)}>
      {renderStepLabel()}
      <h1 style={styles.heading}>Connect your first services</h1>
      <p style={styles.subtitle}>Enter API keys to unlock AI workflows.</p>
      <div style={styles.serviceGrid}>
        {SERVICES.map(svc => {
          const hasKey = (state.services[svc.key] || '').trim().length > 0
          const expanded = expandedService === svc.key
          return (
            <div key={svc.key} style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => setExpandedService(expanded ? null : svc.key)}
                className="wiz-card"
                style={{
                  ...styles.card,
                  borderColor: hasKey ? '#7ed957' : expanded ? 'rgba(126,217,87,0.3)' : 'rgba(255,255,255,0.08)',
                  background: hasKey ? 'rgba(126,217,87,0.06)' : 'rgba(255,255,255,0.04)',
                  padding: '1rem 1.25rem',
                }}
              >
                {hasKey && <div style={styles.cardCheck}><CheckIcon /></div>}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: svc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 800, color: '#fff',
                    flexShrink: 0,
                  }}>
                    {svc.letter}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{svc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{svc.desc}</div>
                  </div>
                </div>
              </button>
              {expanded && (
                <div style={styles.keyInputArea}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="password"
                      placeholder={`${svc.name} API key`}
                      value={state.services[svc.key] || ''}
                      onChange={e => setServiceKey(svc.key, e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <a href={svc.keyUrl} target="_blank" rel="noopener noreferrer" style={styles.getKeyLink}>
                    Get API Key <ExternalIcon />
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {renderNav(true, true, false, connectedServices.length > 0 ? 'NEXT STEP' : 'NEXT STEP')}
    </div>
  )

  /* Step 5: Ready */
  const step5 = (
    <div style={slideStyle(5)}>
      {renderStepLabel()}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <SparkleIcon />
      </div>
      <h1 style={styles.heading}>You&apos;re all set!</h1>
      <p style={styles.subtitle}>0nMCP is installed and ready to go.</p>

      {/* Summary */}
      <div style={styles.summaryRow}>
        {state.platforms.length > 0 && (
          <div style={styles.summaryChip}>
            {state.platforms.length} platform{state.platforms.length !== 1 ? 's' : ''}
          </div>
        )}
        {connectedServices.length > 0 && (
          <div style={styles.summaryChip}>
            {connectedServices.length} service{connectedServices.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Action cards */}
      <div style={styles.actionGrid}>
        <Link href="/dashboard" className="wiz-card" style={styles.actionCard}>
          <DashboardIcon />
          <span style={{ fontWeight: 700 }}>Go to Dashboard</span>
        </Link>
        <Link href="/console" className="wiz-card" style={styles.actionCard}>
          <WorkflowIcon />
          <span style={{ fontWeight: 700 }}>Try a Workflow</span>
        </Link>
        <Link href="/console/marketplace" className="wiz-card" style={styles.actionCard}>
          <StoreIcon />
          <span style={{ fontWeight: 700 }}>Explore Marketplace</span>
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={completeWizard} style={styles.nextBtn}>
          Finish Setup <CheckIcon />
        </button>
      </div>
    </div>
  )

  return (
    <div
      ref={containerRef}
      style={{
        ...(!embedded ? styles.fullScreen : {}),
        padding: embedded ? '1.5rem' : '2rem 1.5rem',
      }}
    >
      <style>{`
        .wiz-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
        }
        .wiz-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
        }
        @keyframes wizFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .wiz-platform-grid {
            grid-template-columns: 1fr !important;
          }
          .wiz-service-grid {
            grid-template-columns: 1fr !important;
          }
          .wiz-action-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.inner}>
        {renderProgressBars()}

        <div style={styles.content}>
          {step1}
          {step2}
          {step3}
          {step4}
          {step5}
        </div>
      </div>
    </div>
  )
}

/* ─── Styles (all inline) ───────────────────────────────────────── */

const styles = {
  fullScreen: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a1a0f 0%, #060a0f 100%)',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as React.CSSProperties,

  inner: {
    width: '100%',
    maxWidth: 720,
    margin: '0 auto',
  } as React.CSSProperties,

  progressContainer: {
    display: 'flex',
    gap: 8,
    marginBottom: '2.5rem',
    padding: '0 0.5rem',
  } as React.CSSProperties,

  content: {
    position: 'relative' as const,
    minHeight: 420,
  } as React.CSSProperties,

  slidePanel: {
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    willChange: 'opacity, transform',
  } as React.CSSProperties,

  stepLabel: {
    color: '#7ed957',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    textAlign: 'center' as const,
    marginBottom: '0.75rem',
  } as React.CSSProperties,

  heading: {
    color: '#fff',
    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
    fontWeight: 800,
    textAlign: 'center' as const,
    margin: '0 0 0.5rem',
    lineHeight: 1.2,
  } as React.CSSProperties,

  subtitle: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    textAlign: 'center' as const,
    margin: '0 0 2rem',
    lineHeight: 1.5,
  } as React.CSSProperties,

  /* Logo orb */
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  logoOrb: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7ed957 0%, #3ecf8e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 900,
    color: '#0a1a0f',
    boxShadow: '0 0 40px rgba(126,217,87,0.25)',
    animation: 'wizFadeIn 0.6s ease',
  } as React.CSSProperties,

  /* Cards */
  card: {
    position: 'relative' as const,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '1.5rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.04)',
    outline: 'none',
    WebkitAppearance: 'none' as const,
    color: 'inherit',
  } as React.CSSProperties,

  cardCheck: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
  } as React.CSSProperties,

  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  /* Nav */
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
  } as React.CSSProperties,

  nextBtn: {
    background: '#7ed957',
    color: '#000',
    border: 'none',
    borderRadius: 9999,
    padding: '0.75rem 2rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 0 20px rgba(126,217,87,0.3)',
    transition: 'box-shadow 0.2s ease, opacity 0.2s ease',
  } as React.CSSProperties,

  backBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.75rem',
  } as React.CSSProperties,

  skipBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.5rem 0.75rem',
  } as React.CSSProperties,

  /* Install tab */
  tabRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  tab: {
    padding: '0.5rem 1rem',
    borderRadius: 10,
    border: '1px solid transparent',
    background: 'transparent',
    color: '#64748b',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  stepsList: {
    paddingLeft: '1.25rem',
    margin: '0 0 1.25rem',
    listStyleType: 'decimal',
  } as React.CSSProperties,

  stepsItem: {
    color: '#cbd5e1',
    fontSize: '0.88rem',
    lineHeight: 2,
  } as React.CSSProperties,

  codeBlock: {
    position: 'relative' as const,
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '1rem 1.25rem',
    marginBottom: '1.25rem',
    overflow: 'auto' as const,
  } as React.CSSProperties,

  codePre: {
    margin: 0,
    fontSize: '0.8rem',
    lineHeight: 1.6,
    color: '#a5f3fc',
    fontFamily: 'JetBrains Mono, Fira Code, monospace',
    whiteSpace: 'pre' as const,
  } as React.CSSProperties,

  copyBtn: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '0.35rem 0.6rem',
    color: '#94a3b8',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  } as React.CSSProperties,

  testBox: {
    background: 'rgba(126,217,87,0.06)',
    border: '1px solid rgba(126,217,87,0.15)',
    borderRadius: 12,
    padding: '1rem 1.25rem',
    marginTop: '1rem',
  } as React.CSSProperties,

  slackBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#4a154b',
    color: '#fff',
    borderRadius: 10,
    padding: '0.65rem 1.25rem',
    fontWeight: 600,
    fontSize: '0.85rem',
    textDecoration: 'none',
    marginBottom: '1rem',
  } as React.CSSProperties,

  /* Service key input */
  keyInputArea: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderTop: 'none',
    borderRadius: '0 0 16px 16px',
    padding: '0.75rem 1rem',
    marginTop: -1,
  } as React.CSSProperties,

  input: {
    flex: 1,
    background: '#0f172a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '0.55rem 0.75rem',
    color: '#e2e8f0',
    fontSize: '0.82rem',
    fontFamily: 'JetBrains Mono, monospace',
    outline: 'none',
    width: '100%',
  } as React.CSSProperties,

  getKeyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: '#7ed957',
    fontSize: '0.75rem',
    fontWeight: 600,
    textDecoration: 'none',
    marginTop: '0.5rem',
  } as React.CSSProperties,

  /* Step 5 */
  summaryRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  summaryChip: {
    background: 'rgba(126,217,87,0.1)',
    border: '1px solid rgba(126,217,87,0.2)',
    borderRadius: 9999,
    padding: '0.35rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#7ed957',
  } as React.CSSProperties,

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  } as React.CSSProperties,

  actionCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    color: '#e2e8f0',
    textDecoration: 'none',
    textAlign: 'center' as const,
    fontSize: '0.88rem',
    cursor: 'pointer',
  } as React.CSSProperties,

  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: '#7ed957',
    color: '#000',
    borderRadius: 9999,
    padding: '0.55rem 1.25rem',
    fontWeight: 700,
    fontSize: '0.82rem',
    textDecoration: 'none',
  } as React.CSSProperties,

  ghostBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#94a3b8',
    borderRadius: 9999,
    padding: '0.55rem 1.25rem',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
  } as React.CSSProperties,
}
