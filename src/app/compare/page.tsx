import type { Metadata } from 'next'
import Link from 'next/link'
import comparisonsData from '@/data/comparisons.json'
import { STATS, STATS_DISPLAY } from '@/data/stats'
import AnimatedGrid from '@/components/AnimatedGrid'

export const metadata: Metadata = {
  title: '0nMCP vs Every AI Tool — Best AI Software Comparison 2026 | Claude vs GPT vs Gemini vs Zapier',
  description:
    'The definitive AI tool comparison for 2026. Compare 0nMCP against Claude, GPT, Gemini, Zapier, Make, n8n, OpenClaw, and 13+ platforms. 1,640+ tools, 111 services, free and open source. Feature tables, pricing, and honest assessments.',
  keywords: [
    'best AI software',
    'compare AI assistants',
    'Claude alternatives',
    'AI orchestration comparison',
    'best AI assistant for business',
    'Claude vs GPT vs Gemini',
    'Zapier alternatives 2026',
    'best MCP server',
    'AI automation tools compared',
    'OpenClaw vs 0nMCP',
    'AI workflow automation',
    'MCP server comparison',
    'AI API orchestrator',
    'n8n alternatives',
    'Make alternatives',
    'AI tools for developers',
    'best automation platform 2026',
  ],
  openGraph: {
    title: '0nMCP vs Every AI Tool on the Planet — The Definitive Comparison',
    description: `${comparisonsData.comparisons.length} head-to-head comparisons. ${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. Free and open source.`,
    url: 'https://www.0nmcp.com/compare',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP vs Every AI Tool — The Definitive 2026 Comparison',
    description: `${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. Compare against Claude, GPT, Gemini, Zapier, Make, n8n, and more.`,
  },
  alternates: { canonical: 'https://www.0nmcp.com/compare' },
}

// ─── Color coding for competitor categories ─────────────────────
const COMP_COLORS: Record<string, string> = {
  Zapier: '#ff4a00',
  Make: '#6d00cc',
  n8n: '#ea4b71',
  'Power Automate': '#0066ff',
  IFTTT: '#33ccff',
  Pipedream: '#22c55e',
  Activepieces: '#6366f1',
  Workato: '#e11d48',
  'Tray.io': '#8b5cf6',
  Windmill: '#06b6d4',
  LangChain: '#1c3d5a',
  'Relay.app': '#f59e0b',
  OpenClaw: '#ef4444',
}

// ─── Massive comparison table data ──────────────────────────────
const MEGA_TABLE = [
  { dim: 'Total Tools', onmcp: '1,640+', claude: '~20', gpt: '~15', gemini: '~10', zapier: '7,000+ apps', make: '1,500+ apps', n8n: '400+ nodes', openclaw: '~50' },
  { dim: 'Built-in Services', onmcp: '111', claude: '1 (Anthropic)', gpt: '1 (OpenAI)', gemini: '1 (Google)', zapier: 'Via connectors', make: 'Via modules', n8n: 'Via nodes', openclaw: '~10' },
  { dim: 'Self-Hosted', onmcp: 'Yes (local-first)', claude: 'No', gpt: 'No', gemini: 'No', zapier: 'No', make: 'No', n8n: 'Yes', openclaw: 'Partial' },
  { dim: 'AI-Native Orchestration', onmcp: 'Yes (describe outcomes)', claude: 'Chat only', gpt: 'Chat only', gemini: 'Chat only', zapier: 'No (visual builder)', make: 'No (visual builder)', n8n: 'No (visual builder)', openclaw: 'Partial' },
  { dim: 'MCP Protocol Support', onmcp: 'Native (built on MCP)', claude: 'Client only', gpt: 'No', gemini: 'No', zapier: 'No', make: 'No', n8n: 'No', openclaw: 'Yes' },
  { dim: 'CRM Integration', onmcp: '245 tools (12 modules)', claude: 'No', gpt: 'No', gemini: 'No', zapier: 'Basic triggers', make: 'Basic triggers', n8n: 'Basic node', openclaw: 'No' },
  { dim: 'Vault Encryption', onmcp: 'AES-256-GCM + hardware bind', claude: 'No', gpt: 'No', gemini: 'No', zapier: 'Cloud-stored keys', make: 'Cloud-stored keys', n8n: 'Plain .env', openclaw: '⚠️ BREACH' },
  { dim: 'Multi-AI Platform', onmcp: '7+ platforms (Claude, Gemini, Grok, Cursor...)', claude: 'Claude only', gpt: 'GPT only', gemini: 'Gemini only', zapier: 'Platform agnostic', make: 'Platform agnostic', n8n: 'Platform agnostic', openclaw: '2-3 platforms' },
  { dim: 'Workflow Format', onmcp: '.0n portable files', claude: 'N/A', gpt: 'N/A', gemini: 'N/A', zapier: 'Proprietary Zaps', make: 'Proprietary Scenarios', n8n: 'JSON workflows', openclaw: 'JSON' },
  { dim: 'Execution Model', onmcp: 'Pipeline + Assembly Line + Radial Burst', claude: 'Sequential chat', gpt: 'Sequential chat', gemini: 'Sequential chat', zapier: 'Sequential Zaps', make: 'Scenario paths', n8n: 'Node graph', openclaw: 'Sequential' },
  { dim: 'Patent Protection', onmcp: '5 patents pending', claude: 'N/A', gpt: 'N/A', gemini: 'N/A', zapier: 'N/A', make: 'N/A', n8n: 'N/A', openclaw: 'N/A' },
  { dim: 'Open Source', onmcp: 'Yes (MIT)', claude: 'No', gpt: 'No', gemini: 'No', zapier: 'No', make: 'No', n8n: 'Fair-code', openclaw: 'Yes' },
  { dim: 'Free Tier', onmcp: 'Unlimited local use', claude: 'Limited msgs', gpt: 'Limited msgs', gemini: 'Limited msgs', zapier: '100 tasks/mo', make: '1,000 ops/mo', n8n: 'Self-host free', openclaw: 'Free' },
  { dim: 'Paid Pricing', onmcp: '$0.01/execution or $80/mo', claude: '$20/mo', gpt: '$20/mo', gemini: '$20/mo', zapier: '$19.99-799/mo', make: '$9-299/mo', n8n: '$20-150/mo cloud', openclaw: 'Free' },
  { dim: 'Business Deed Transfer', onmcp: 'Yes (patent pending)', claude: 'No', gpt: 'No', gemini: 'No', zapier: 'No', make: 'No', n8n: 'No', openclaw: 'No' },
  { dim: 'Credential Portability', onmcp: 'Engine import/export', claude: 'No', gpt: 'No', gemini: 'No', zapier: 'No export', make: 'No export', n8n: 'Manual .env', openclaw: 'Manual' },
  { dim: 'Webhook Verification', onmcp: '7 providers (HMAC)', claude: 'No', gpt: 'No', gemini: 'No', zapier: 'Basic', make: 'Basic', n8n: 'Basic', openclaw: 'No' },
]

// ─── Competitor deep-dive data ──────────────────────────────────
const COMPETITORS = [
  {
    name: 'Claude (Anthropic)',
    color: '#d4a574',
    slug: null,
    tagline: 'The AI model 0nMCP supercharges',
    whatTheyDo: 'Claude is Anthropic\'s frontier AI assistant, known for strong reasoning, long-context understanding, and safety-focused design. It excels at analysis, writing, coding, and conversation.',
    where0nMCPWins: '0nMCP turns Claude from a chatbot into a full-stack business operator. Without 0nMCP, Claude can only talk. With 0nMCP, Claude can execute across 111 real services: create Stripe invoices, send Slack messages, update CRM contacts, manage GitHub repos, and orchestrate multi-step workflows.',
    pricing: { them: 'Free tier / $20/mo Pro / $100/mo Team', us: 'Free (MIT) + Claude as AI backend' },
    features: [
      { f: 'API integrations', us: '111 services, 1,640+ tools', them: '0 (chat only)' },
      { f: 'Workflow execution', us: 'Pipeline + Assembly Line + Radial Burst', them: 'No workflow engine' },
      { f: 'CRM management', us: '245 CRM tools', them: 'No CRM access' },
      { f: 'Credential security', us: 'AES-256 vault', them: 'No credential storage' },
      { f: 'Self-hosted', us: 'Yes', them: 'No (cloud only)' },
    ],
  },
  {
    name: 'ChatGPT (OpenAI)',
    color: '#10a37f',
    slug: null,
    tagline: 'General AI assistant vs specialized orchestrator',
    whatTheyDo: 'ChatGPT is OpenAI\'s conversational AI, the most widely used AI assistant globally. It offers GPT-4o, code interpreter, DALL-E image generation, and browsing capabilities.',
    where0nMCPWins: '0nMCP provides what ChatGPT cannot: direct API execution across 111 services. ChatGPT can write code that calls APIs, but 0nMCP actually executes those calls with vault-encrypted credentials, rate limiting, and error handling built in. ChatGPT is a brain; 0nMCP gives it hands.',
    pricing: { them: 'Free / $20/mo Plus / $200/mo Pro', us: 'Free (MIT) local use' },
    features: [
      { f: 'Direct API calls', us: '111 services natively', them: 'Via code interpreter (limited)' },
      { f: 'Real-time execution', us: 'Instant tool calls', them: 'Code sandbox only' },
      { f: 'Credential management', us: 'Encrypted vault', them: 'No credential storage' },
      { f: 'Multi-service orchestration', us: 'Native (one prompt)', them: 'Manual code required' },
      { f: 'Open source', us: 'Yes (MIT)', them: 'No' },
    ],
  },
  {
    name: 'Gemini (Google)',
    color: '#4285f4',
    slug: null,
    tagline: 'Google\'s AI vs universal orchestration',
    whatTheyDo: 'Gemini is Google\'s multimodal AI model family, deeply integrated with Google Workspace (Docs, Sheets, Gmail, Calendar). It offers strong reasoning and access to Google\'s search index.',
    where0nMCPWins: '0nMCP connects to 111 services, not just Google\'s ecosystem. While Gemini can interact with Google Workspace, 0nMCP orchestrates across Stripe, Slack, GitHub, CRM, Shopify, and 50 more services simultaneously. Plus, 0nMCP generates Gemini-compatible configs, so Gemini users get the best of both worlds.',
    pricing: { them: 'Free / $20/mo Advanced', us: 'Free (MIT) + Gemini config support' },
    features: [
      { f: 'Service breadth', us: '111 services', them: 'Google Workspace + limited' },
      { f: 'Non-Google integrations', us: 'Stripe, Slack, CRM, GitHub, etc.', them: 'Limited or none' },
      { f: 'Self-hosted', us: 'Yes (local-first)', them: 'No (cloud only)' },
      { f: 'Workflow portability', us: '.0n files work everywhere', them: 'Google ecosystem lock-in' },
      { f: 'CRM tools', us: '245 tools', them: '0' },
    ],
  },
  {
    name: 'Zapier',
    color: '#ff4a00',
    slug: '0nmcp-vs-zapier',
    tagline: 'The automation giant vs the orchestration engine',
    whatTheyDo: 'Zapier is the world\'s largest no-code automation platform with 7,000+ app connections and a visual Zap builder. It popularized trigger-action automation for non-technical users.',
    where0nMCPWins: '0nMCP is AI-native: describe what you want, and AI orchestrates the execution. No dragging, no dropping, no configuring triggers. 0nMCP runs locally (your data stays private), costs nothing for self-hosted use, and provides 1,640+ tools with deeper API coverage than Zapier\'s basic actions.',
    pricing: { them: '$19.99/mo (Starter) to $799/mo (Company)', us: 'Free (MIT) / $0.01 per execution' },
    features: [
      { f: 'Interface', us: 'Natural language', them: 'Visual drag-and-drop' },
      { f: 'Tool depth', us: '1,640+ tools (deep API coverage)', them: '7,000+ apps (basic actions)' },
      { f: 'AI orchestration', us: 'Native (AI decides tools)', them: 'AI as add-on step' },
      { f: 'Data privacy', us: 'Local-first, vault encrypted', them: 'Cloud-only, data on Zapier servers' },
      { f: 'Cost at scale', us: '$0.01/execution', them: '$0.01-0.05/task + subscription' },
    ],
  },
  {
    name: 'Make (Integromat)',
    color: '#6d00cc',
    slug: '0nmcp-vs-make',
    tagline: 'Visual scenarios vs AI-driven orchestration',
    whatTheyDo: 'Make (formerly Integromat) offers visual scenario building with advanced branching, error handling, and data transformation. It\'s popular with power users who outgrow Zapier.',
    where0nMCPWins: '0nMCP eliminates the need for visual builders entirely. Instead of spending hours designing scenario flows, describe your outcome and let AI handle the orchestration. 0nMCP\'s three-level execution model (Pipeline, Assembly Line, Radial Burst) handles complex parallel workflows that Make\'s sequential model struggles with.',
    pricing: { them: '$9/mo (Core) to $299/mo (Teams)', us: 'Free (MIT) / $0.01 per execution' },
    features: [
      { f: 'Parallel execution', us: 'Radial Burst (true parallel)', them: 'Limited branching' },
      { f: 'Setup time', us: '1 command install', them: 'Hours of scenario building' },
      { f: 'Self-hosted', us: 'Yes', them: 'No (cloud only)' },
      { f: 'Open source', us: 'MIT license', them: 'Proprietary' },
      { f: 'API depth per service', us: 'Full API coverage', them: 'Curated actions only' },
    ],
  },
  {
    name: 'n8n',
    color: '#ea4b71',
    slug: '0nmcp-vs-n8n',
    tagline: 'Self-hosted workflow builder vs AI-native orchestrator',
    whatTheyDo: 'n8n is a fair-code licensed workflow automation tool that can be self-hosted. It offers 400+ integrations with a visual node-based editor and supports custom JavaScript/Python code.',
    where0nMCPWins: 'Both are self-hostable, but 0nMCP is AI-native. n8n still requires manual workflow construction. 0nMCP provides 1,640+ tools (vs n8n\'s 400+ nodes), deeper API coverage per service, and true AI orchestration where you describe outcomes instead of building flows. Plus, 0nMCP\'s vault encryption beats n8n\'s plain .env files.',
    pricing: { them: 'Free (self-host) / $20-150/mo (cloud)', us: 'Free (MIT) / $0.01 per execution' },
    features: [
      { f: 'AI orchestration', us: 'Native (describe outcomes)', them: 'No (manual node building)' },
      { f: 'Tool count', us: '1,640+ tools', them: '400+ nodes' },
      { f: 'Credential security', us: 'AES-256 vault + hardware bind', them: 'Plain .env files' },
      { f: 'License', us: 'MIT (true open source)', them: 'Fair-code (restrictions apply)' },
      { f: 'MCP support', us: 'Native', them: 'No' },
    ],
  },
  {
    name: 'OpenClaw',
    color: '#ef4444',
    slug: '0nmcp-vs-openclaw',
    tagline: 'Open MCP registry vs complete orchestration platform',
    whatTheyDo: 'OpenClaw is an open-source MCP server registry and directory. It catalogs available MCP servers and provides a way to discover and connect to them.',
    where0nMCPWins: '0nMCP is not just a registry; it\'s a complete orchestration platform. Where OpenClaw helps you find MCP servers, 0nMCP IS the MCP server with 1,640+ tools built in. 0nMCP includes vault encryption, credential management, workflow execution, CRM integration, and patent-pending security that OpenClaw does not offer.',
    pricing: { them: 'Free (open source)', us: 'Free (MIT) / $0.01 per execution' },
    features: [
      { f: 'Built-in tools', us: '1,640+ tools', them: 'Registry (links to other servers)' },
      { f: 'Execution engine', us: 'Full workflow runtime', them: 'No execution engine' },
      { f: 'Credential vault', us: 'AES-256 + hardware binding', them: 'No vault' },
      { f: 'CRM module', us: '245 tools', them: 'No CRM' },
      { f: 'Patent protection', us: '5 patents pending', them: 'None' },
    ],
  },
]

// ─── FAQ data for JSON-LD ───────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is the best AI software for business automation in 2026?',
    a: '0nMCP is the leading AI orchestration platform for business automation, offering 1,640+ tools across 111 services including Stripe, CRM, Slack, GitHub, and more. Unlike ChatGPT or Claude alone, 0nMCP can actually execute API calls, manage credentials securely, and orchestrate multi-step workflows across all your business tools.',
  },
  {
    q: 'How does 0nMCP compare to Claude, GPT, and Gemini?',
    a: 'Claude, GPT, and Gemini are AI chat models that can reason and generate text. 0nMCP turns these models into full-stack business operators by providing 1,640+ tools for real API execution. Think of it this way: Claude is the brain, 0nMCP gives it hands. 0nMCP works with all three AI models plus Grok, Cursor, and 4 more platforms.',
  },
  {
    q: 'Is 0nMCP better than Zapier for workflow automation?',
    a: '0nMCP and Zapier take fundamentally different approaches. Zapier uses visual drag-and-drop builders for 7,000+ basic app connections. 0nMCP is AI-native: describe your desired outcome in natural language, and AI handles the orchestration using 1,640+ deep API tools. 0nMCP is also free and open source (MIT licensed), self-hostable, and provides vault-encrypted credential storage.',
  },
  {
    q: 'What is the best MCP server available in 2026?',
    a: '0nMCP is the most comprehensive MCP (Model Context Protocol) server available, with 1,640+ tools across 111 services. Most MCP servers focus on a single service (1-10 tools). 0nMCP provides universal coverage including CRM (245 tools), Stripe, GitHub, Slack, Google services, and more, all in a single npm install.',
  },
  {
    q: 'Is 0nMCP free to use?',
    a: 'Yes. 0nMCP is 100% free and open source under the MIT license for local use. Install with npx 0nmcp@latest and access all 1,640+ tools at no cost. For managed cloud execution, pricing starts at $0.01 per execution with no monthly commitment.',
  },
  {
    q: 'What are the best Zapier alternatives in 2026?',
    a: 'The top Zapier alternatives in 2026 include 0nMCP (AI-native, 1,640+ tools, free), Make (visual builder, advanced branching), n8n (self-hosted, fair-code), Power Automate (Microsoft ecosystem), and Pipedream (developer-focused). 0nMCP stands out as the only AI-native option that eliminates drag-and-drop building entirely.',
  },
  {
    q: 'How does 0nMCP handle security and credentials?',
    a: '0nMCP uses patent-pending AES-256-GCM vault encryption with hardware fingerprint binding (PBKDF2-SHA512, 100K iterations). Credentials never leave your machine. The 0nVault Container System (US Patent Pending #63/990,046) provides 7 semantic layers including double-encrypted credentials via Argon2id, multi-party escrow with X25519 ECDH, and Ed25519 digital signatures.',
  },
  {
    q: 'Can 0nMCP replace multiple AI and automation tools?',
    a: 'Yes. A single 0nMCP installation replaces the need for separate Zapier/Make subscriptions (workflow automation), individual MCP servers per service, manual API integration code, credential management tools, and platform-specific AI configurations. It provides 1,640+ tools across 111 services in one npm install.',
  },
  {
    q: 'What is OpenClaw and how does it compare to 0nMCP?',
    a: 'OpenClaw is an open-source MCP server registry that helps discover available MCP servers. 0nMCP is a complete orchestration platform with 1,640+ built-in tools, vault encryption, workflow execution, CRM integration (245 tools), and patent-pending security. OpenClaw catalogs servers; 0nMCP IS the server.',
  },
  {
    q: 'Which AI platforms does 0nMCP work with?',
    a: '0nMCP generates configurations for 7+ AI platforms: Claude (Anthropic), Gemini (Google), Grok (xAI), Cursor, Windsurf, VS Code with Continue/Cline, and OpenAI-compatible clients. Run 0nmcp engine platforms to auto-generate configs for all supported platforms.',
  },
]

export default function ComparePage() {
  const comparisons = comparisonsData.comparisons

  // ─── JSON-LD: Breadcrumb ────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://www.0nmcp.com/compare' },
    ],
  }

  // ─── JSON-LD: Product ───────────────────────────────────────
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: '0nMCP',
    description: `Universal AI API Orchestrator with ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services. Free and open source.`,
    brand: { '@type': 'Brand', name: '0nMCP' },
    url: 'https://www.0nmcp.com',
    offers: [
      {
        '@type': 'Offer',
        name: '0nCore Free Trial',
        price: '0',
        priceCurrency: 'USD',
        description: 'Full 0nCore dashboard. 1,640+ tools. No credit card.',
        url: 'https://0ncore.com',
      },
      {
        '@type': 'Offer',
        name: '0nCore Starter',
        price: '80',
        priceCurrency: 'USD',
        description: 'Managed dashboard with CRM integration and AI assistant.',
        url: 'https://www.0nmcp.com/signup',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      ratingCount: '127',
    },
  }

  // ─── JSON-LD: FAQPage ──────────────────────────────────────
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <div className="homepage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ═══════════════════════════════════════════════════════
          HERO: "0nMCP vs Every AI Tool on the Planet"
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <AnimatedGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6EE05A]/[0.06] blur-[140px]"
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-16 text-center sm:px-6 lg:px-8 lg:pt-36 lg:pb-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6EE05A]/25 bg-[#6EE05A]/8 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-[#6EE05A]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EE05A] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE05A]" />
            </span>
            {comparisons.length}+ head-to-head comparisons · Updated 2026
          </div>

          <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              0nMCP vs every AI tool
            </span>
            <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              on the planet.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            The definitive comparison resource for AI software, automation platforms, and MCP servers.{' '}
            <strong className="text-white">{STATS_DISPLAY.capabilities_marketing} capabilities. {STATS_DISPLAY.services_marketing} services. Free and open core.</strong>{' '}
            See exactly where 0nMCP wins, where alternatives still have an edge, and which tool is right for you.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#mega-table"
              className="inline-flex items-center justify-center rounded-xl bg-[#6EE05A] px-7 py-3 text-base font-bold text-black shadow-[0_0_28px_rgba(110,224,90,0.35)] transition-transform hover:scale-[1.02]"
            >
              See the Full Comparison →
            </Link>
            <Link
              href="#competitors"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:border-[#6EE05A]/40 hover:text-[#6EE05A]"
            >
              Competitor Deep Dives
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            <Link href="/compare/interactive" className="font-semibold text-[#6EE05A] hover:underline">
              Try the Interactive Comparison Tool — pick 2-4 platforms and compare side by side →
            </Link>
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════════════════ */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <span className="stat-value">{STATS_DISPLAY.tools}</span>
            <span className="stat-label">Tools</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{STATS_DISPLAY.services}</span>
            <span className="stat-label">Services</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{STATS_DISPLAY.categories}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{STATS.local_cost}</span>
            <span className="stat-label">Local Use</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{STATS.license}</span>
            <span className="stat-label">Licensed</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{STATS_DISPLAY.ai_platforms}</span>
            <span className="stat-label">AI Platforms</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{STATS_DISPLAY.patents}</span>
            <span className="stat-label">Patents Pending</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          "PEOPLE ALSO SEARCH" — SEO H2 TARGETS
          ═══════════════════════════════════════════════════════ */}
      <section className="section-container" style={{ padding: '5rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          <h2 className="section-label" id="best-ai-assistant" style={{ scrollMarginTop: '5rem' }}>
            Best AI Assistant for Business
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', marginBottom: '2.5rem' }}>
            Businesses in 2026 need more than a chatbot. They need an AI that can <em>do things</em>: send invoices,
            update CRM records, post to Slack, manage subscriptions, deploy code. 0nMCP is the only platform that
            turns any AI assistant (Claude, GPT, Gemini, Grok) into a full-stack business operator with{' '}
            <strong>{STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services</strong>. No other AI assistant
            comes close to this level of real-world execution capability.
          </p>

          <h2 className="section-label" id="claude-vs-gpt" style={{ scrollMarginTop: '5rem' }}>
            Claude vs GPT vs Gemini vs 0nMCP
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', marginBottom: '2.5rem' }}>
            Claude, GPT, and Gemini are AI <em>models</em>. 0nMCP is an AI <em>orchestration platform</em>.
            The comparison is not apples-to-apples because 0nMCP works <strong>with</strong> all three models.
            Claude is the brain. GPT is a brain. Gemini is a brain. 0nMCP gives every brain hands, feet, and
            access to {STATS_DISPLAY.services} services. Install 0nMCP, connect it to your preferred AI,
            and suddenly that AI can manage your entire tech stack through natural language.
          </p>

          <h2 className="section-label" id="zapier-alternatives" style={{ scrollMarginTop: '5rem' }}>
            Zapier Alternatives 2026
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', marginBottom: '2.5rem' }}>
            Zapier changed automation, but 2026 demands more. The top alternatives include{' '}
            <Link href="/compare/0nmcp-vs-make">Make</Link>,{' '}
            <Link href="/compare/0nmcp-vs-n8n">n8n</Link>,{' '}
            <Link href="/compare/0nmcp-vs-power-automate">Power Automate</Link>,{' '}
            <Link href="/compare/0nmcp-vs-pipedream">Pipedream</Link>, and{' '}
            <strong>0nMCP</strong>. What sets 0nMCP apart: it is AI-native (describe outcomes, not steps),
            open source (MIT licensed), self-hostable, and provides deeper API coverage with {STATS_DISPLAY.tools} tools
            versus Zapier&apos;s basic trigger-action model. For teams tired of paying $20-800/month for visual builders,
            0nMCP offers unlimited local use for free.
          </p>

          <h2 className="section-label" id="best-mcp-server" style={{ scrollMarginTop: '5rem' }}>
            Best MCP Server
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', marginBottom: '2.5rem' }}>
            The Model Context Protocol (MCP) ecosystem is growing fast, but most MCP servers are single-service
            (one server for Stripe, another for GitHub, another for Slack). 0nMCP is the only universal MCP server
            with <strong>{STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services in a single install</strong>.
            It includes CRM integration (245 tools), AES-256 vault encryption, workflow execution, and multi-AI platform
            support. One <code style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>npx 0nmcp@latest</code> replaces
            dozens of individual MCP servers.
          </p>

          <h2 className="section-label" id="ai-automation-tools" style={{ scrollMarginTop: '5rem' }}>
            AI Automation Tools Compared
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', marginBottom: '2.5rem' }}>
            The AI automation landscape in 2026 spans from no-code visual builders ({' '}
            <Link href="/compare/0nmcp-vs-zapier">Zapier</Link>,{' '}
            <Link href="/compare/0nmcp-vs-make">Make</Link>) to developer-focused platforms ({' '}
            <Link href="/compare/0nmcp-vs-n8n">n8n</Link>,{' '}
            <Link href="/compare/0nmcp-vs-pipedream">Pipedream</Link>) to AI-native orchestrators (0nMCP).
            The key differentiator: do you want to <em>build</em> workflows or <em>describe</em> outcomes?
            0nMCP is the only platform where AI handles tool selection, execution order, error handling, and
            retry logic. You speak English. The AI does the rest.
          </p>

          <h2 className="section-label" id="openclaw-vs-0nmcp" style={{ scrollMarginTop: '5rem' }}>
            OpenClaw vs 0nMCP
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', marginBottom: '2.5rem' }}>
            <Link href="/compare/0nmcp-vs-openclaw">OpenClaw</Link> is an open-source MCP server registry
            that catalogs available servers. 0nMCP is a complete orchestration platform. OpenClaw helps you
            <em> find</em> MCP servers. 0nMCP <strong>IS</strong> the MCP server with {STATS_DISPLAY.tools} built-in tools,
            vault encryption, CRM integration, workflow execution engine, and 5 patents pending.
            They serve different purposes: OpenClaw is a directory; 0nMCP is the platform.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          WHY TEAMS SWITCH — Quick Wins
          ═══════════════════════════════════════════════════════ */}
      <section className="section-container" style={{ padding: '3rem 1.5rem 2rem' }}>
        <h2 className="section-label">Why Teams Switch to 0nMCP</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: 1000, margin: '0 auto' }}>
          {[
            { stat: '1,640+', label: 'tools in one install', sub: 'vs 1-50 per platform' },
            { stat: '111', label: 'services included', sub: 'vs configure each separately' },
            { stat: 'AI-native', label: 'describe, don\'t build', sub: 'vs drag-and-drop builders' },
            { stat: 'Local-first', label: 'your machine, your data', sub: 'vs cloud-only SaaS' },
            { stat: '$0', label: 'unlimited local use', sub: 'vs $20-800/mo subscriptions' },
          ].map((item) => (
            <div key={item.label} className="step-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>{item.stat}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MEGA COMPARISON TABLE — 8 platforms x 17 dimensions
          ═══════════════════════════════════════════════════════ */}
      <section id="mega-table" className="table-section section-container" style={{ scrollMarginTop: '5rem', padding: '4rem 1.5rem 3rem' }}>
        <h2 className="section-label">The Definitive AI Tool Comparison Table</h2>
        <p className="section-desc">0nMCP vs Claude vs GPT vs Gemini vs Zapier vs Make vs n8n vs OpenClaw across {MEGA_TABLE.length} dimensions</p>

        <div style={{ overflowX: 'auto', maxWidth: '100%', margin: '0 auto', borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', minWidth: 160, position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>Dimension</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--accent)', fontWeight: 700, fontSize: '0.8125rem', minWidth: 140 }}>0nMCP</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#d4a574', fontWeight: 600, fontSize: '0.8125rem', minWidth: 120 }}>Claude</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#10a37f', fontWeight: 600, fontSize: '0.8125rem', minWidth: 120 }}>ChatGPT</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#4285f4', fontWeight: 600, fontSize: '0.8125rem', minWidth: 120 }}>Gemini</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff4a00', fontWeight: 600, fontSize: '0.8125rem', minWidth: 120 }}>Zapier</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#6d00cc', fontWeight: 600, fontSize: '0.8125rem', minWidth: 120 }}>Make</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ea4b71', fontWeight: 600, fontSize: '0.8125rem', minWidth: 110 }}>n8n</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ef4444', fontWeight: 600, fontSize: '0.8125rem', minWidth: 120 }}>OpenClaw</th>
              </tr>
            </thead>
            <tbody>
              {MEGA_TABLE.map((row, i) => (
                <tr key={row.dim} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8125rem', position: 'sticky', left: 0, background: i % 2 === 0 ? 'var(--bg-primary)' : 'rgba(17,24,39,0.95)', zIndex: 1 }}>{row.dim}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{row.onmcp}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{row.claude}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{row.gpt}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{row.gemini}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{row.zapier}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{row.make}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{row.n8n}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>
                    {row.openclaw === '⚠️ BREACH' ? (
                      <Link href="/blog/cisco-openclaw-security-nightmare" title="Cisco called OpenClaw a 'Security Nightmare' — credential exposure, no sandboxing, supply chain risks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontWeight: 700, textDecoration: 'none', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem' }}>
                        ⚠️ BREACH
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>{row.openclaw}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMPETITOR DEEP DIVES
          ═══════════════════════════════════════════════════════ */}
      <section id="competitors" className="section-container" style={{ padding: '4rem 1.5rem 2rem', scrollMarginTop: '5rem' }}>
        <h2 className="section-label">Competitor Deep Dives</h2>
        <p className="section-desc">Honest, detailed breakdowns of how 0nMCP compares to each major platform</p>

        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2rem' }}>
          {COMPETITORS.map((comp) => (
            <div
              key={comp.name}
              id={comp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                scrollMarginTop: '5rem',
              }}
            >
              {/* Accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: comp.color, opacity: 0.7 }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                    0nMCP vs {comp.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: comp.color, margin: 0, fontWeight: 600 }}>{comp.tagline}</p>
                </div>
                {comp.slug && (
                  <Link
                    href={`/compare/${comp.slug}`}
                    style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: 9999,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      background: `${comp.color}15`,
                      color: comp.color,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Full comparison
                  </Link>
                )}
              </div>

              {/* What they do well */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                  What {comp.name} Does Well
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {comp.whatTheyDo}
                </p>
              </div>

              {/* Where 0nMCP wins */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                  Where 0nMCP Wins
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {comp.where0nMCPWins}
                </p>
              </div>

              {/* Pricing comparison */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>
                  Pricing
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(110,224,90,0.05)', borderRadius: 12, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>0nMCP</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{comp.pricing.us}</div>
                  </div>
                  <div style={{ background: `${comp.color}08`, borderRadius: 12, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: comp.color, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{comp.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{comp.pricing.them}</div>
                  </div>
                </div>
              </div>

              {/* Feature-by-feature table */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
                  Feature-by-Feature
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="compare-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 140 }}>Feature</th>
                        <th className="compare-us" style={{ minWidth: 180 }}>0nMCP</th>
                        <th style={{ minWidth: 180, color: comp.color }}>{comp.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comp.features.map((feat) => (
                        <tr key={feat.f}>
                          <td className="compare-feature">{feat.f}</td>
                          <td className="compare-us-val">{feat.us}</td>
                          <td className="compare-them-val">{feat.them}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          EXISTING COMPARISON CARDS (all 13 /compare/[slug] links)
          ═══════════════════════════════════════════════════════ */}
      <section className="section-container" style={{ padding: '4rem 1.5rem 3rem' }}>
        <h2 className="section-label">All {comparisons.length} Detailed Comparisons</h2>
        <p className="section-desc">Pick your current tool. See how 0nMCP stacks up in a full breakdown.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', maxWidth: 1000, margin: '0 auto' }}>
          {comparisons.map((comp) => {
            const color = COMP_COLORS[comp.competitor] || '#6EE05A'
            return (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                }}
                className="compare-card-hover"
              >
                {/* Accent bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.6 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                      0nMCP vs {comp.competitor}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color, margin: 0, fontWeight: 600 }}>{comp.tagline}</p>
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: 9999,
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      background: `${color}15`,
                      color,
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0,
                    }}
                  >
                    {comp.key_differences.length} diffs
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                  {comp.description.slice(0, 140)}...
                </p>

                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  {comp.pricing_compare.slice(0, 100)}...
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>Read comparison &rarr;</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ SECTION — Long-tail SEO
          ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="section-container" style={{ padding: '4rem 1.5rem 3rem', scrollMarginTop: '5rem' }}>
        <h2 className="section-label">Frequently Asked Questions</h2>
        <p className="section-desc">Everything you need to know about AI tool comparisons</p>

        <div style={{ maxWidth: 800, margin: '2rem auto 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  padding: '1.25rem 1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {item.q}
                <span style={{ color: 'var(--accent)', fontSize: '1.25rem', flexShrink: 0, marginLeft: '1rem' }}>+</span>
              </summary>
              <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INTERNAL LINKS — SEO Juice
          ═══════════════════════════════════════════════════════ */}
      <section className="section-container" style={{ padding: '3rem 1.5rem 2rem' }}>
        <h2 className="section-label">Explore More</h2>
        <div style={{ maxWidth: 800, margin: '1rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { href: '/integrations', label: `Browse ${STATS_DISPLAY.services} Integrations` },
            { href: '/turn-it-on', label: 'Turn It 0n (Setup Guide)' },
            { href: '/glossary', label: 'AI Glossary (80+ Terms)' },
            { href: '/store/onork-mini', label: '0nork Mini Store' },
            { href: '/learn', label: 'Learning Center' },
            { href: '/forum', label: 'Community Forum' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'block',
                padding: '0.875rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
              className="compare-card-hover"
            >
              {link.label}
              <span style={{ color: 'var(--accent)', marginLeft: '0.5rem' }}>&rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="final-cta-section">
        <div className="final-cta-glow" aria-hidden="true" />
        <h2 className="final-cta-title">
          Ready to<br />
          <span className="hero-title-accent">switch?</span>
        </h2>
        <p className="final-cta-subtitle">
          One npm install. {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. Free and open source forever.
        </p>
        <div className="hero-install" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <code>npx 0nmcp@latest</code>
        </div>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="hero-cta-primary">
            Request Early Access
          </Link>
          <Link href="/integrations" className="hero-cta-secondary">
            Browse {STATS_DISPLAY.services} Integrations
          </Link>
        </div>
      </section>
    </div>
  )
}
