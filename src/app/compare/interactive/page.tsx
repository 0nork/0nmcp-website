'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

/* ─── Competitor Data ─── */

type Competitor = {
  id: string
  name: string
  color: string
  logo: React.ReactNode
  data: Record<string, string>
}

const DIMENSIONS = [
  'Total tools / integrations',
  'Pricing (free tier)',
  'AI platforms supported',
  'CRM integration',
  'Security (vault / encryption)',
  'Portability (.0n files)',
  'Open source',
  'Self-hosted option',
  'Voice AI',
  'Course generation',
  'Social media automation',
  'E-commerce tools',
  'Custom workflows',
  'API execution speed',
  'Patent protection',
  'Credential management',
] as const

/* ── Inline SVG Logos ── */

const Logo0nMCP = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#111827" stroke="#6EE05A" strokeWidth="2" />
    <text x="14" y="19" textAnchor="middle" fill="#6EE05A" fontFamily="monospace" fontWeight="800" fontSize="11">0n</text>
  </svg>
)

const LogoZapier = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#FF4A00" />
    <path d="M17 8h-2.5l-3 5.5L8 8H5.5l5 8-5 8H8l3.5-5.5 3 5.5H17l-5-8 5-8z" fill="#fff" transform="translate(1,-2) scale(0.85)" />
  </svg>
)

const LogoMake = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#6D00CC" />
    <circle cx="14" cy="14" r="6" fill="none" stroke="#fff" strokeWidth="2.5" />
    <circle cx="14" cy="14" r="2" fill="#fff" />
  </svg>
)

const LogoN8N = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#EA4B71" />
    <text x="14" y="19" textAnchor="middle" fill="#fff" fontFamily="monospace" fontWeight="800" fontSize="12">n8n</text>
  </svg>
)

const LogoOpenClaw = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#EF4444" />
    <path d="M10 10l4 4-4 4M14 10l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const LogoClaude = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#D4A574" />
    <circle cx="14" cy="14" r="6" fill="none" stroke="#fff" strokeWidth="2" />
    <circle cx="14" cy="12" r="1.5" fill="#fff" />
    <path d="M11 16c0 0 1.5 2 3 2s3-2 3-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const LogoChatGPT = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#10A37F" />
    <path d="M14 7c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 2.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm-2 4h4v.75h-1.5v3.25h-1v-3.25H12v-.75z" fill="#fff" />
  </svg>
)

const LogoGemini = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#4285F4" />
    <path d="M14 7c0 3.87-3.13 7-7 7 3.87 0 7 3.13 7 7 0-3.87 3.13-7 7-7-3.87 0-7-3.13-7-7z" fill="#fff" />
  </svg>
)

const LogoGrok = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#000" stroke="#333" strokeWidth="1" />
    <text x="14" y="19" textAnchor="middle" fill="#fff" fontFamily="monospace" fontWeight="800" fontSize="11">Xai</text>
  </svg>
)

const LogoCursor = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#1A1A2E" />
    <path d="M9 8l10 6-10 6V8z" fill="#fff" opacity="0.9" />
  </svg>
)

const LogoWindsurf = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#0EA5E9" />
    <path d="M8 18c2-3 4-8 6-8s4 5 6 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M10 16c1.5-2 3-5 4-5s2.5 3 4 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
)

const LogoPowerAutomate = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#0066FF" />
    <path d="M8 10h6l-2 4h5l-7 8 2-5H8l4-7z" fill="#fff" />
  </svg>
)

const LogoPipedream = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#22C55E" />
    <path d="M9 14h10M14 9v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const LogoLangChain = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#1C3D5A" />
    <circle cx="10" cy="14" r="3" fill="none" stroke="#fff" strokeWidth="1.5" />
    <circle cx="18" cy="14" r="3" fill="none" stroke="#fff" strokeWidth="1.5" />
    <path d="M13 14h2" stroke="#fff" strokeWidth="1.5" />
  </svg>
)

const COMPETITORS: Competitor[] = [
  {
    id: '0nmcp',
    name: '0nMCP',
    color: '#6EE05A',
    logo: <Logo0nMCP />,
    data: {
      'Total tools / integrations': '900+ tools, 55 services',
      'Pricing (free tier)': 'Free forever (MIT) / $80/mo managed',
      'AI platforms supported': 'Claude, Gemini, Grok, Cursor, Windsurf, VS Code, OpenAI (7+)',
      'CRM integration': '245 tools across 12 modules (deepest in market)',
      'Security (vault / encryption)': 'AES-256-GCM + hardware binding + Argon2id (patent-pending)',
      'Portability (.0n files)': 'Universal .0n format works on any machine / platform',
      'Open source': 'Yes (MIT license)',
      'Self-hosted option': 'Yes (local-first by default)',
      'Voice AI': 'Yes (0nCore Pro+)',
      'Course generation': 'Yes (AI-powered course builder)',
      'Social media automation': '35 social tools (multi-platform)',
      'E-commerce tools': 'Stripe + Shopify + Square (50+ tools)',
      'Custom workflows': '.0n SWITCH files with AI orchestration',
      'API execution speed': 'Local execution, sub-100ms routing',
      'Patent protection': '5 patents filed (vault, container, routing, seal, deed)',
      'Credential management': '0nVault container system (7 encrypted layers)',
    },
  },
  {
    id: 'zapier',
    name: 'Zapier',
    color: '#FF4A00',
    logo: <LogoZapier />,
    data: {
      'Total tools / integrations': '7,000+ app connections (surface-level)',
      'Pricing (free tier)': 'Free (100 tasks/mo) / $19.99/mo+',
      'AI platforms supported': 'Web UI only (no MCP, no CLI)',
      'CRM integration': 'Basic triggers/actions via connectors',
      'Security (vault / encryption)': 'Cloud-stored credentials, SOC 2',
      'Portability (.0n files)': 'No portability (locked to Zapier)',
      'Open source': 'No',
      'Self-hosted option': 'No (cloud only)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'Via third-party connections',
      'E-commerce tools': 'Via Shopify/Stripe connectors',
      'Custom workflows': 'Drag-and-drop Zap builder',
      'API execution speed': 'Cloud-based, 1-15 min polling',
      'Patent protection': 'No public patents',
      'Credential management': 'Cloud OAuth vault',
    },
  },
  {
    id: 'make',
    name: 'Make',
    color: '#6D00CC',
    logo: <LogoMake />,
    data: {
      'Total tools / integrations': '1,800+ app modules',
      'Pricing (free tier)': 'Free (1,000 ops/mo) / $9/mo+',
      'AI platforms supported': 'Web UI only',
      'CRM integration': 'Via modules (limited depth)',
      'Security (vault / encryption)': 'Cloud-stored, SOC 2, GDPR',
      'Portability (.0n files)': 'JSON blueprints (Make-only)',
      'Open source': 'No',
      'Self-hosted option': 'No (cloud only)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'Social modules available',
      'E-commerce tools': 'Shopify/WooCommerce modules',
      'Custom workflows': 'Visual scenario builder',
      'API execution speed': 'Cloud-based, near-real-time',
      'Patent protection': 'No public patents',
      'Credential management': 'Cloud connection store',
    },
  },
  {
    id: 'n8n',
    name: 'n8n',
    color: '#EA4B71',
    logo: <LogoN8N />,
    data: {
      'Total tools / integrations': '400+ nodes',
      'Pricing (free tier)': 'Free (self-hosted) / $20/mo cloud',
      'AI platforms supported': 'AI agent nodes (OpenAI, Anthropic)',
      'CRM integration': 'Via community nodes',
      'Security (vault / encryption)': 'Self-hosted: your responsibility',
      'Portability (.0n files)': 'JSON workflows (n8n-only format)',
      'Open source': 'Yes (fair-code license)',
      'Self-hosted option': 'Yes',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'Via nodes',
      'E-commerce tools': 'Shopify/Stripe nodes',
      'Custom workflows': 'Node-based visual builder',
      'API execution speed': 'Self-hosted: depends on infra',
      'Patent protection': 'No',
      'Credential management': 'Encrypted credential store',
    },
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    color: '#EF4444',
    logo: <LogoOpenClaw />,
    data: {
      'Total tools / integrations': '~50 tools',
      'Pricing (free tier)': 'Free (open source)',
      'AI platforms supported': 'MCP-compatible clients',
      'CRM integration': 'None built-in',
      'Security (vault / encryption)': 'Basic env-based credentials',
      'Portability (.0n files)': 'No standard format',
      'Open source': 'Yes',
      'Self-hosted option': 'Yes',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'Limited',
      'E-commerce tools': 'Limited',
      'Custom workflows': 'Code-based',
      'API execution speed': 'Local execution',
      'Patent protection': 'No',
      'Credential management': '.env files',
    },
  },
  {
    id: 'claude',
    name: 'Claude',
    color: '#D4A574',
    logo: <LogoClaude />,
    data: {
      'Total tools / integrations': 'Depends on connected MCP servers',
      'Pricing (free tier)': 'Free tier / $20/mo Pro / $100/mo Max',
      'AI platforms supported': 'Claude only',
      'CRM integration': 'Via MCP servers (like 0nMCP)',
      'Security (vault / encryption)': 'Anthropic cloud security',
      'Portability (.0n files)': 'No workflow portability',
      'Open source': 'No (MCP protocol is open)',
      'Self-hosted option': 'No (API available)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'Via MCP tools',
      'E-commerce tools': 'Via MCP tools',
      'Custom workflows': 'Natural language prompts',
      'API execution speed': 'Cloud API latency',
      'Patent protection': 'Anthropic patents',
      'Credential management': 'MCP config files',
    },
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    color: '#10A37F',
    logo: <LogoChatGPT />,
    data: {
      'Total tools / integrations': 'GPT Store plugins (variable)',
      'Pricing (free tier)': 'Free / $20/mo Plus / $200/mo Pro',
      'AI platforms supported': 'ChatGPT only',
      'CRM integration': 'Via plugins (limited)',
      'Security (vault / encryption)': 'OpenAI cloud security',
      'Portability (.0n files)': 'No portability',
      'Open source': 'No',
      'Self-hosted option': 'No (API available)',
      'Voice AI': 'Yes (built-in voice)',
      'Course generation': 'No dedicated tool',
      'Social media automation': 'Via plugins',
      'E-commerce tools': 'Via plugins',
      'Custom workflows': 'GPT Builder / Custom GPTs',
      'API execution speed': 'Cloud API latency',
      'Patent protection': 'OpenAI patents',
      'Credential management': 'Plugin OAuth',
    },
  },
  {
    id: 'gemini',
    name: 'Gemini',
    color: '#4285F4',
    logo: <LogoGemini />,
    data: {
      'Total tools / integrations': 'Google Workspace + Extensions',
      'Pricing (free tier)': 'Free / $20/mo Advanced',
      'AI platforms supported': 'Gemini only',
      'CRM integration': 'No native CRM',
      'Security (vault / encryption)': 'Google cloud security',
      'Portability (.0n files)': 'No portability',
      'Open source': 'No',
      'Self-hosted option': 'No (Vertex AI available)',
      'Voice AI': 'Yes (Google voice)',
      'Course generation': 'No',
      'Social media automation': 'No',
      'E-commerce tools': 'No',
      'Custom workflows': 'Gems (custom personas)',
      'API execution speed': 'Cloud API latency',
      'Patent protection': 'Google patents',
      'Credential management': 'Google OAuth',
    },
  },
  {
    id: 'grok',
    name: 'Grok',
    color: '#888888',
    logo: <LogoGrok />,
    data: {
      'Total tools / integrations': 'X/Twitter integration + web search',
      'Pricing (free tier)': 'Included with X Premium ($8/mo)',
      'AI platforms supported': 'X/Grok only',
      'CRM integration': 'No',
      'Security (vault / encryption)': 'xAI cloud security',
      'Portability (.0n files)': 'No portability',
      'Open source': 'Grok-1 weights are open',
      'Self-hosted option': 'No (weights available)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'X/Twitter only',
      'E-commerce tools': 'No',
      'Custom workflows': 'No',
      'API execution speed': 'Cloud API',
      'Patent protection': 'No public patents',
      'Credential management': 'X OAuth',
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    color: '#1A1A2E',
    logo: <LogoCursor />,
    data: {
      'Total tools / integrations': 'Code editor + MCP servers',
      'Pricing (free tier)': 'Free tier / $20/mo Pro',
      'AI platforms supported': 'Cursor built-in (Claude/GPT backend)',
      'CRM integration': 'Via MCP servers',
      'Security (vault / encryption)': 'Local editor security',
      'Portability (.0n files)': 'No workflow portability',
      'Open source': 'No',
      'Self-hosted option': 'Desktop app (local)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'No',
      'E-commerce tools': 'No',
      'Custom workflows': 'AI code generation',
      'API execution speed': 'Via connected MCP servers',
      'Patent protection': 'No public patents',
      'Credential management': 'MCP config files',
    },
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    color: '#0EA5E9',
    logo: <LogoWindsurf />,
    data: {
      'Total tools / integrations': 'Code editor + MCP support',
      'Pricing (free tier)': 'Free tier / $15/mo Pro',
      'AI platforms supported': 'Windsurf AI (Cascade)',
      'CRM integration': 'Via MCP servers',
      'Security (vault / encryption)': 'Local editor security',
      'Portability (.0n files)': 'No workflow portability',
      'Open source': 'No',
      'Self-hosted option': 'Desktop app (local)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'No',
      'E-commerce tools': 'No',
      'Custom workflows': 'AI code generation (Flows)',
      'API execution speed': 'Via connected MCP servers',
      'Patent protection': 'No public patents',
      'Credential management': 'MCP config files',
    },
  },
  {
    id: 'powerautomate',
    name: 'Power Automate',
    color: '#0066FF',
    logo: <LogoPowerAutomate />,
    data: {
      'Total tools / integrations': '1,000+ Microsoft connectors',
      'Pricing (free tier)': 'Free with M365 / $15/user/mo standalone',
      'AI platforms supported': 'Copilot (Microsoft AI)',
      'CRM integration': 'Dynamics 365 deep integration',
      'Security (vault / encryption)': 'Azure AD + DLP policies',
      'Portability (.0n files)': 'No (locked to Microsoft)',
      'Open source': 'No',
      'Self-hosted option': 'On-premises gateway',
      'Voice AI': 'Via Copilot',
      'Course generation': 'No',
      'Social media automation': 'Limited connectors',
      'E-commerce tools': 'Via connectors',
      'Custom workflows': 'Cloud flows + desktop flows (RPA)',
      'API execution speed': 'Cloud-based',
      'Patent protection': 'Microsoft patents',
      'Credential management': 'Azure Key Vault',
    },
  },
  {
    id: 'pipedream',
    name: 'Pipedream',
    color: '#22C55E',
    logo: <LogoPipedream />,
    data: {
      'Total tools / integrations': '2,200+ API integrations',
      'Pricing (free tier)': 'Free (10,000 invocations/mo) / $19/mo',
      'AI platforms supported': 'Code-based (any AI via API)',
      'CRM integration': 'Via API connectors',
      'Security (vault / encryption)': 'Cloud-stored, SOC 2',
      'Portability (.0n files)': 'No (Pipedream platform)',
      'Open source': 'Components are open source',
      'Self-hosted option': 'No (cloud only)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'Via connectors',
      'E-commerce tools': 'Via Stripe/Shopify connectors',
      'Custom workflows': 'Code-first workflow builder',
      'API execution speed': 'Cloud-based, serverless',
      'Patent protection': 'No public patents',
      'Credential management': 'Connected accounts store',
    },
  },
  {
    id: 'langchain',
    name: 'LangChain',
    color: '#1C3D5A',
    logo: <LogoLangChain />,
    data: {
      'Total tools / integrations': '160+ tool integrations (code library)',
      'Pricing (free tier)': 'Free (open source) / LangSmith $39/mo',
      'AI platforms supported': 'Any LLM (OpenAI, Anthropic, etc.)',
      'CRM integration': 'No built-in CRM',
      'Security (vault / encryption)': 'Developer responsibility',
      'Portability (.0n files)': 'Python/JS code (dev-only)',
      'Open source': 'Yes (MIT)',
      'Self-hosted option': 'Yes (code library)',
      'Voice AI': 'No',
      'Course generation': 'No',
      'Social media automation': 'No',
      'E-commerce tools': 'No',
      'Custom workflows': 'LCEL chains + LangGraph agents',
      'API execution speed': 'Depends on implementation',
      'Patent protection': 'No',
      'Credential management': 'Environment variables',
    },
  },
]

/* ─── Helper: check if 0nMCP wins a dimension ─── */
function is0nMCPAdvantage(dimension: string, value: string): boolean {
  const v = value.toLowerCase()
  return v.includes('900+') || v.includes('patent') || v.includes('aes-256') || v.includes('.0n') || v.includes('245 tools') || v.includes('free forever')
}

function isWeakValue(value: string): boolean {
  const v = value.toLowerCase()
  return v.includes('no') && !v.includes('node') && v.length < 40
}

/* ─── Component ─── */

export default function InteractiveComparePage() {
  const [selected, setSelected] = useState<string[]>(['0nmcp', 'zapier'])
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return COMPETITORS
    return COMPETITORS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const selectedCompetitors = useMemo(
    () => COMPETITORS.filter((c) => selected.includes(c.id)),
    [selected]
  )

  function toggleSelection(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev // minimum 2
        return prev.filter((s) => s !== id)
      }
      if (prev.length >= 4) return prev // maximum 4
      return [...prev, id]
    })
  }

  return (
    <div className="homepage">
      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '45vh', paddingTop: '7rem', paddingBottom: '2rem' }}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Interactive Tool — {COMPETITORS.length} platforms</span>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Compare<br />
            <span className="hero-title-accent">Side by Side</span>
          </h1>

          <p className="hero-subtitle">
            Select 2-4 platforms below and see exactly how they stack up across {DIMENSIONS.length} dimensions.
          </p>

          <Link href="/compare" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Back to detailed comparisons
          </Link>
        </div>
      </section>

      {/* Selection Grid */}
      <section className="section-container" style={{ padding: '2rem 1.5rem 1rem' }}>
        <h2 className="section-label">Select Platforms</h2>
        <p className="section-desc" style={{ marginBottom: '1rem' }}>
          Choose 2-4 tools to compare. Click to toggle.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
          <input
            type="text"
            placeholder="Search platforms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-display)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Platform chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.625rem',
          justifyContent: 'center',
          maxWidth: 900,
          margin: '0 auto',
        }}>
          {filtered.map((comp) => {
            const isSelected = selected.includes(comp.id)
            const isDisabled = !isSelected && selected.length >= 4
            return (
              <button
                key={comp.id}
                onClick={() => toggleSelection(comp.id)}
                disabled={isDisabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 10,
                  border: `2px solid ${isSelected ? comp.color : 'var(--border)'}`,
                  background: isSelected ? `${comp.color}12` : 'rgba(255,255,255,0.02)',
                  color: isSelected ? comp.color : 'var(--text-secondary)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.4 : 1,
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-display)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.8125rem',
                }}
              >
                {comp.logo}
                {comp.name}
                {isSelected && (
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: comp.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    color: '#0B0F19',
                    marginLeft: '0.25rem',
                  }}>
                    &#10003;
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          marginTop: '1rem',
        }}>
          {selected.length}/4 selected {selected.length < 2 ? '(minimum 2)' : selected.length >= 4 ? '(maximum reached)' : ''}
        </p>
      </section>

      {/* Comparison Table */}
      <section className="section-container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <h2 className="section-label">Comparison Matrix</h2>
        <p className="section-desc">
          {selectedCompetitors.map((c) => c.name).join(' vs ')}
        </p>

        <div style={{ overflowX: 'auto', maxWidth: 1100, margin: '0 auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '0.8125rem',
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderBottom: '2px solid var(--border)',
                  position: 'sticky',
                  left: 0,
                  background: 'var(--bg-primary)',
                  zIndex: 2,
                  minWidth: 180,
                }}>
                  Dimension
                </th>
                {selectedCompetitors.map((comp) => (
                  <th key={comp.id} style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    borderBottom: `2px solid ${comp.color}`,
                    minWidth: 180,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {comp.logo}
                      <span style={{ fontWeight: 700, color: comp.color, fontSize: '0.8125rem' }}>{comp.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((dim, i) => (
                <tr key={dim} style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                }}>
                  <td style={{
                    padding: '0.875rem 1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    left: 0,
                    background: i % 2 === 0 ? '#0D1120' : 'var(--bg-primary)',
                    zIndex: 1,
                    fontSize: '0.75rem',
                  }}>
                    {dim}
                  </td>
                  {selectedCompetitors.map((comp) => {
                    const val = comp.data[dim] || 'N/A'
                    const isAdvantage = comp.id === '0nmcp' && is0nMCPAdvantage(dim, val)
                    const isWeak = isWeakValue(val)
                    return (
                      <td key={comp.id} style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border)',
                        color: isAdvantage ? '#6EE05A' : isWeak ? 'var(--text-muted)' : 'var(--text-secondary)',
                        fontWeight: isAdvantage ? 600 : 400,
                        fontSize: '0.75rem',
                        lineHeight: 1.5,
                        textAlign: 'center',
                        background: isAdvantage ? 'rgba(110, 224, 90, 0.04)' : 'transparent',
                      }}>
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta-section">
        <div className="final-cta-glow" aria-hidden="true" />
        <h2 className="final-cta-title">
          See the<br />
          <span className="hero-title-accent">difference?</span>
        </h2>
        <p className="final-cta-subtitle">
          900+ tools. 55 services. One install. Free and open source.
        </p>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="hero-cta-primary">
            Request Early Access
          </Link>
          <Link href="/compare" className="hero-cta-secondary">
            Detailed Comparisons
          </Link>
        </div>
      </section>
    </div>
  )
}
