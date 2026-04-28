import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Terminal,
  Zap,
  Shield,
  Workflow,
  Boxes,
  Rocket,
  Network,
  Lock,
  Sparkles,
  Cpu,
  HeartPulse,
  LineChart,
  PenLine,
  Users,
  Globe,
  Linkedin,
  ScrollText,
  KeyRound,
  Bot,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { STATS_DISPLAY } from '@/data/stats'
import ServerPipeline from '@/components/ServerPipeline'
import Reveal from '@/components/Reveal'
import RequestAccessForm from '@/components/RequestAccessForm'
import HeroQuickCapture from '@/components/HeroQuickCapture'
import StickyCTA from '@/components/StickyCTA'
import AnimatedGrid from '@/components/AnimatedGrid'
import AnimatedConnectors from '@/components/AnimatedConnectors'

// AI client + integration logos shown in trust strip
const TRUST_LOGOS = [
  { name: 'Anthropic', src: '/logos/anthropic.svg' },
  { name: 'OpenAI', src: '/logos/openai.svg' },
  { name: 'Stripe', src: '/logos/stripe.svg' },
  { name: 'Slack', src: '/logos/slack.svg' },
  { name: 'Supabase', src: '/logos/supabase.svg' },
  { name: 'Notion', src: '/logos/notion.svg' },
  { name: 'Airtable', src: '/logos/airtable.svg' },
  { name: 'Shopify', src: '/logos/shopify.svg' },
  { name: 'Calendly', src: '/logos/calendly.svg' },
]

// Apps you can build today on 0nCore — what real subscribers run.
// Intentionally omits the Website Factory (paid premium offering).
const APPS = [
  {
    icon: HeartPulse,
    name: 'HIPAA Compliance Scanner',
    desc: 'Scans any healthcare site against the 2026 NPRM in 60 seconds. 63 checks across 5 weighted domains, AI-synthesized roadmap, branded PDF report.',
    color: 'text-[#6EE05A]',
    border: 'border-[#6EE05A]/25',
    bg: 'bg-[#6EE05A]/5',
  },
  {
    icon: LineChart,
    name: 'SXO Audit Engine',
    desc: 'Search Experience Optimization scoring across BLUF, Table Trap, Information Gain. Runs on any URL, returns a Living-DOM rewrite plan.',
    color: 'text-[#14b8a6]',
    border: 'border-[#14b8a6]/25',
    bg: 'bg-[#14b8a6]/5',
  },
  {
    icon: PenLine,
    name: 'AI Blog Engine',
    desc: 'Daily SXO-optimized posts to your CMS. Self-improving via the multi-AI council. Radial-burst publishes to Dev.to, LinkedIn, and your CRM.',
    color: 'text-[#a78bfa]',
    border: 'border-[#a78bfa]/25',
    bg: 'bg-[#a78bfa]/5',
  },
  {
    icon: Users,
    name: 'CRM Setup Wizard',
    desc: 'Spins up contacts, pipelines, custom fields, and 245 CRM tools in your account. No PIT, no scopes, no developer required.',
    color: 'text-[#f59e0b]',
    border: 'border-[#f59e0b]/25',
    bg: 'bg-[#f59e0b]/5',
  },
  {
    icon: Globe,
    name: 'IndexNow Auto-Submitter',
    desc: 'Daily 09:00 UTC cron. Submits every URL across your domains to Bing, Yandex, Naver, and Seznam in one pass. ~1 second per 750 URLs.',
    color: 'text-[#6EE05A]',
    border: 'border-[#6EE05A]/25',
    bg: 'bg-[#6EE05A]/5',
  },
  {
    icon: Linkedin,
    name: 'LinkedIn Posting Engine',
    desc: 'VPIS-scored content with Big Egg writing style. Schedules + drafts + posts + tracks engagement. The growth engine, automated.',
    color: 'text-[#14b8a6]',
    border: 'border-[#14b8a6]/25',
    bg: 'bg-[#14b8a6]/5',
  },
  {
    icon: ClipboardList,
    name: 'Lead Capture Flow',
    desc: 'Drop-in form on any site, posts straight to your CRM tagged + segmented + workflow-triggered. Goodbye Zapier middleware.',
    color: 'text-[#a78bfa]',
    border: 'border-[#a78bfa]/25',
    bg: 'bg-[#a78bfa]/5',
  },
  {
    icon: ScrollText,
    name: 'Daily Report Generator',
    desc: 'Pulls metrics from every connected service, runs them through the AI council, drops a branded summary in your inbox at 7am.',
    color: 'text-[#f59e0b]',
    border: 'border-[#f59e0b]/25',
    bg: 'bg-[#f59e0b]/5',
  },
  {
    icon: KeyRound,
    name: 'Vault Setup',
    desc: 'AES-256-GCM credential vault bound to your hardware fingerprint. Patent-pending Seal of Truth integrity. Multi-party escrow built in.',
    color: 'text-[#6EE05A]',
    border: 'border-[#6EE05A]/25',
    bg: 'bg-[#6EE05A]/5',
  },
  {
    icon: Bot,
    name: 'Custom Voice Agent',
    desc: 'Train a domain-specific AI agent on your knowledge base. Available as a chat widget, voice line, or API endpoint. No prompt-engineering.',
    color: 'text-[#14b8a6]',
    border: 'border-[#14b8a6]/25',
    bg: 'bg-[#14b8a6]/5',
  },
]

// ─── Comparison data ───────────────────────────────────────────────
const COMPARISON: Record<
  string,
  { metric: string; typical: string; onmcp: string }[]
> = {
  overview: [
    { metric: 'Total tools', typical: '10–50', onmcp: '1,554' },
    { metric: 'Connected services', typical: '1–5', onmcp: '96 services' },
    { metric: 'Configuration', typical: 'Manual YAML/JSON', onmcp: 'Zero config' },
    { metric: 'License', typical: 'Varies', onmcp: 'MIT — free forever' },
    { metric: 'Patents pending', typical: 'None', onmcp: '5 US provisionals' },
  ],
  crm: [
    { metric: 'CRM tools', typical: '0', onmcp: '245 tools' },
    { metric: 'Contacts', typical: 'None', onmcp: 'Full CRUD + tags + segments' },
    { metric: 'Calendars', typical: 'None', onmcp: '27 tools — booking, availability' },
    { metric: 'Invoices & payments', typical: 'None', onmcp: '36 tools — Stripe + CRM' },
    { metric: 'Social media', typical: 'None', onmcp: '35 tools — FB, IG, LinkedIn' },
    { metric: 'Pipeline', typical: 'None', onmcp: '14 tools — opportunities, stages' },
  ],
  security: [
    { metric: 'Credential storage', typical: 'Plain text .env', onmcp: 'AES-256-GCM vault' },
    { metric: 'Key derivation', typical: 'None', onmcp: 'PBKDF2-SHA512 (100k)' },
    { metric: 'Hardware binding', typical: 'None', onmcp: 'Machine fingerprint lock' },
    { metric: 'Integrity', typical: 'None', onmcp: 'Seal of Truth (SHA3-256)' },
    { metric: 'Escrow', typical: 'None', onmcp: 'Multi-party X25519 ECDH' },
  ],
  ai: [
    { metric: 'AI platforms', typical: '1 model', onmcp: '7+ platforms' },
    { metric: 'Multi-AI debate', typical: 'None', onmcp: '0nPlex — 5 models synthesize' },
    { metric: 'Brand voice', typical: 'None', onmcp: '0nCore voice generation' },
    { metric: 'Config generation', typical: 'Manual', onmcp: 'Auto for Claude, Gemini, Cursor' },
    { metric: 'Local AI', typical: 'None', onmcp: 'Ollama + Groq fallback' },
  ],
}

// ─── Pillars (Three-Level Execution) ───────────────────────────────
const PILLARS = [
  {
    icon: Workflow,
    label: 'Pipeline',
    desc: 'Sequential step execution. Each step waits for the previous to complete. Best for ordered workflows where each output feeds the next.',
    color: 'text-[#6EE05A]',
    border: 'border-[#6EE05A]/30',
    bg: 'bg-[#6EE05A]/5',
  },
  {
    icon: Boxes,
    label: 'Assembly Line',
    desc: 'Parallel batched execution. Run the same operation across many inputs concurrently. Used for bulk imports, scans, message blasts.',
    color: 'text-[#14b8a6]',
    border: 'border-[#14b8a6]/30',
    bg: 'bg-[#14b8a6]/5',
  },
  {
    icon: Network,
    label: 'Radial Burst',
    desc: 'Fan-out to many services from one trigger. Patent-pending. Publish content to 8 platforms in one call. Sync state across every connected service.',
    color: 'text-[#a78bfa]',
    border: 'border-[#a78bfa]/30',
    bg: 'bg-[#a78bfa]/5',
  },
]

// ─── Why 0nMCP feature cards ───────────────────────────────────────
const FEATURES = [
  {
    icon: Terminal,
    title: 'One install, every AI editor',
    desc: 'npx 0nmcp@latest. Works in Claude Code, Cursor, Windsurf, VS Code, Zed, JetBrains, and 30+ more.',
  },
  {
    icon: Zap,
    title: '1,554 tools across 96 services',
    desc: 'CRM, Stripe, Slack, GitHub, Supabase, Google Workspace, OpenAI, and 89 more — all callable from one MCP server.',
  },
  {
    icon: Shield,
    title: 'Vault-secured credentials',
    desc: 'AES-256-GCM with hardware fingerprint binding. PBKDF2-SHA512. Patent-pending Seal of Truth integrity layer.',
  },
  {
    icon: Cpu,
    title: 'Three-Level Execution',
    desc: 'Pipeline. Assembly Line. Radial Burst. Patent-pending orchestration that scales from one task to fan-out across all services.',
  },
  {
    icon: Lock,
    title: 'Open spec — UCP marketplace',
    desc: '/.well-known/ucp lets any AI agent discover, buy, and run AI apps without prior integration. 70% revenue to builders.',
  },
  {
    icon: Sparkles,
    title: 'MIT licensed core',
    desc: 'Free forever. Self-host. Fork it. The marketplace is optional — the orchestrator is yours.',
  },
]

// ─── How It Works steps ────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Install',
    desc: 'Run `npx 0nmcp@latest` once. The server starts and waits on stdio.',
  },
  {
    n: '02',
    title: 'Connect',
    desc: 'Add 0nMCP to your AI editor’s MCP config. Tool discovery is automatic.',
  },
  {
    n: '03',
    title: 'Describe outcomes',
    desc: '"Create a contact, send an invoice, post to LinkedIn." 0nMCP routes to the right services.',
  },
  {
    n: '04',
    title: 'Ship',
    desc: 'Save the workflow as a .0n SWITCH file. Replay it. Sell it on the marketplace.',
  },
]

// ─── FAQ ────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'What is 0nMCP?',
    a: '0nMCP is a universal AI API orchestrator built on the Model Context Protocol. One install gives any AI editor (Claude, Cursor, Windsurf, etc.) access to 1,554 tools across 96 services — CRM, Stripe, Slack, GitHub, Supabase, and more. MIT licensed. Five US patents pending.',
  },
  {
    q: 'How do I install it?',
    a: 'Run `npx 0nmcp@latest` in your terminal. Works with npm, pnpm, yarn, and bun. Add it to your AI editor’s MCP config and you’re done — tools are discovered automatically.',
  },
  {
    q: 'Is 0nMCP free?',
    a: 'The core orchestrator is MIT licensed and free forever. You can self-host it with no cost. Marketplace executions cost $0.01 each, and the 0nCore dashboard starts at $80/mo.',
  },
  {
    q: 'How is this different from Zapier or n8n?',
    a: 'Those are visual workflow builders. 0nMCP runs locally with zero cloud dependency. Your AI talks directly to 96 services through natural language — no drag-and-drop, no monthly task limits, no vendor lock-in. The .0n file format makes workflows portable across any MCP-compatible client.',
  },
  {
    q: 'What is the .0n file format?',
    a: 'A portable JSON spec for AI workflows. One file describes triggers, steps, AI calls, and integrations. Any MCP client can import and run it. Workflows you build in Claude Desktop run identically in Cursor, the CLI, or the marketplace runtime.',
  },
  {
    q: 'What is UCP — the Universal Commerce Protocol?',
    a: 'An open standard for AI-agent commerce. The /.well-known/ucp endpoint returns JSON describing your products, checkout flow, and fulfillment hooks. Any AI agent (ChatGPT, Claude, Perplexity) can discover, buy, and run your AI apps without prior integration. The spec is open — competitors can adopt it.',
  },
  {
    q: 'How do I sell my AI app on the marketplace?',
    a: 'Build your workflow as a .0n file. Upload through the publish flow. Set price + revenue share. Once approved, your app appears in the catalog and any subscriber can install it. You keep 70% of every sale. Stripe Connect handles payouts.',
  },
  {
    q: 'Is it secure?',
    a: '0nVault uses AES-256-GCM with hardware fingerprint binding and PBKDF2-SHA512 key derivation. The patent-pending Seal of Truth layer provides SHA3-256 content-addressed integrity. Multi-party escrow uses X25519 ECDH for up to 8 parties. Cisco called the competition a "security nightmare."',
  },
]

export default function Homepage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Live animated grid — randomized fade pattern */}
        <AnimatedGrid />
        {/* Soft glow blob (lightened) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#6EE05A]/[0.06] blur-[140px]"
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-36 lg:pb-32">
          {/* ── LEFT: text + CTAs ── */}
          <Reveal direction="up" delay={0} className="lg:col-span-7 flex flex-col justify-center">
            <div className="mb-6 inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EE05A] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE05A]" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Live · v{STATS_DISPLAY.version?.replace('v', '') ?? '2.9.1'} · MIT
              </span>
            </div>

            <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Stop building workflows.
              </span>
              <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Start describing outcomes.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              0nMCP is the orchestrator running underneath {STATS_DISPLAY.capabilities_marketing} capabilities across{' '}
              {STATS_DISPLAY.services_marketing} services — CRM, payments, search, social, AI, the whole stack.
              You describe what you want done. It runs across every connected service.
            </p>

            <p className="mt-4 max-w-2xl text-base text-white/65">
              Use it anywhere — Claude, Cursor, your terminal. Or skip the setup entirely and
              <span className="font-semibold text-[#6EE05A]"> run it on 0nCore</span>: no install,
              no API keys, no code. Sign in and start building.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild size="lg" className="h-12 px-7 text-base font-bold">
                <a href="https://0ncore.com" target="_blank" rel="noopener">
                  Try 0nCore — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base font-semibold">
                <Link href="#apps">
                  See what you can build
                </Link>
              </Button>
            </div>

            {/* Inline email capture — low-friction first touch */}
            <HeroQuickCapture />

            <p className="mt-4 text-xs text-muted-foreground">
              <span className="font-semibold text-[#6EE05A]">Founders cohort</span> closes May 1 ·
              No credit card · 60-second setup
            </p>
          </Reveal>

          {/* ── RIGHT: animated pipeline ── */}
          <Reveal direction="left" delay={150} className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-[600px]">
              <ServerPipeline />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ TRUST LOGO STRIP ═══════════════════════════════════════ */}
      <Reveal>
        <section className="border-t border-border bg-card/20">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Connects to the tools you already use
            </p>
            <div className="grid grid-cols-5 items-center justify-items-center gap-x-8 gap-y-6 sm:grid-cols-10">
              {TRUST_LOGOS.map((logo, i) => (
                <Reveal key={logo.name} delay={i * 50} direction="up">
                  <div className="grayscale opacity-60 transition hover:opacity-100 hover:grayscale-0">
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={80}
                      height={28}
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══ STATS BAR ══════════════════════════════════════════════ */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4 lg:grid-cols-7">
          {[
            { v: STATS_DISPLAY.capabilities_marketing, l: 'Capabilities' },
            { v: STATS_DISPLAY.services_marketing, l: 'Services' },
            { v: STATS_DISPLAY.categories, l: 'Categories' },
            { v: '$0', l: 'Local Use' },
            { v: 'MIT', l: 'License' },
            { v: STATS_DISPLAY.ai_platforms, l: 'AI Platforms' },
            { v: STATS_DISPLAY.patents, l: 'Patents' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 60} direction="up" className="bg-card/80 px-4 py-6 text-center">
              <div className="font-mono text-2xl font-black text-[#6EE05A] tabular-nums">{s.v}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.l}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ WHY 0nMCP — feature cards ═════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
            Why 0nMCP
          </Badge>
          <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              One MCP server. Every API.
            </span>
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Stop wiring integrations one by one. 0nMCP gives every AI editor instant access to the
            full operational toolbelt — from CRM to crypto, Slack to Stripe.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal key={f.title} delay={i * 80} direction="up">
                <Card className="h-full border-border/60 bg-card/60 backdrop-blur transition-colors hover:border-[#6EE05A]/30 hover:bg-card/80">
                  <CardHeader>
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#6EE05A]/10 ring-1 ring-[#6EE05A]/20">
                      <Icon className="h-5 w-5 text-[#6EE05A]" />
                    </div>
                    <CardTitle className="text-lg text-white">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-white/70">{f.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ═══ THREE-LEVEL EXECUTION ═════════════════════════════════ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#a78bfa]">
              Patent Pending · US #63/990,046
            </Badge>
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Three-Level Execution
              </span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Three orchestration patterns purpose-built for AI agents. Pick the one that fits the
              shape of your workflow — 0nMCP handles the rest.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <Reveal key={p.label} delay={i * 120} direction="up">
                  <Card className={`h-full border ${p.border} ${p.bg} backdrop-blur`}>
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${p.border} ${p.bg}`}>
                        <Icon className={`h-6 w-6 ${p.color}`} />
                      </div>
                      <CardTitle className={`mt-3 text-2xl ${p.color}`}>{p.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-white/75">{p.desc}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ APPS YOU CAN BUILD ═══════════════════════════════════ */}
      <Reveal direction="up">
        <section id="apps" className="scroll-mt-24 relative overflow-hidden border-y border-border bg-card/30">
          <AnimatedConnectors intensity={0.22} />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#6EE05A]">
                Live on 0nCore · Built on 0nMCP
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Apps you can run right now — no code, no install.
                </span>
              </h2>
              <p className="mt-4 text-lg text-white/70">
                These are real production apps subscribers use today. Each one is a few clicks away
                inside 0nCore. Nothing to compile. Nothing to host. Plug in your accounts and go.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {APPS.map((a, i) => {
                const Icon = a.icon
                return (
                  <Reveal key={a.name} delay={i * 60} direction="up">
                    <Card className={`h-full border ${a.border} ${a.bg} backdrop-blur transition-colors hover:bg-card/80`}>
                      <CardHeader className="space-y-3 pb-3">
                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ring-1 ${a.border} ${a.bg}`}>
                          <Icon className={`h-5 w-5 ${a.color}`} />
                        </div>
                        <CardTitle className="text-base text-white leading-tight">{a.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs leading-relaxed text-white/70">{a.desc}</p>
                      </CardContent>
                    </Card>
                  </Reveal>
                )
              })}
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-white/65">
                And <span className="font-bold text-white">a lot more</span> — every app on this
                page is one of dozens already running on 0nCore.
              </p>
              <Button asChild size="lg" className="h-12 px-8 text-base font-bold">
                <a href="https://0ncore.com" target="_blank" rel="noopener">
                  Open 0nCore Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══ COMPARISON TABLE ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
            How 0nMCP Compares
          </Badge>
          <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              Built for production. Not for demos.
            </span>
          </h2>
        </div>

        <Tabs defaultValue="overview" className="mt-12">
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          {Object.entries(COMPARISON).map(([key, rows]) => (
            <TabsContent key={key} value={key}>
              <Card className="border-border/60 bg-card/40 backdrop-blur">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/60 text-left">
                          <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Metric
                          </th>
                          <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Typical MCP server
                          </th>
                          <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#6EE05A]">
                            0nMCP
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.metric} className="border-b border-border/30 last:border-0">
                            <td className="px-6 py-4 text-sm font-semibold text-white">{row.metric}</td>
                            <td className="px-6 py-4 text-sm text-white/60">{row.typical}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-[#6EE05A]">
                              {row.onmcp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════════ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
              How It Works
            </Badge>
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                From install to live workflow in 4 steps.
              </span>
            </h2>
          </div>

          <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100} direction="up">
                <Card className="relative h-full border-border/60 bg-card/60 backdrop-blur">
                  <CardHeader>
                    <div className="font-mono text-3xl font-black text-[#6EE05A]/30">{s.n}</div>
                    <CardTitle className="text-xl text-white">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-white/70">{s.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ UI SCREENSHOT SHOWCASE ═════════════════════════════════ */}
      <Reveal direction="up">
        <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/3 h-[300px] bg-gradient-to-r from-transparent via-[#6EE05A]/8 to-transparent blur-3xl"
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
              See it in action
            </Badge>
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Your AI editor. Your terminal. One unified surface.
              </span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              0nMCP plugs into the editor you already use — or runs from its own dashboard. Same
              tools, same workflows, same .0n SWITCH files.
            </p>
          </div>

          <Reveal direction="up" delay={150}>
            <div className="relative mx-auto mt-14 max-w-5xl">
              {/* Soft glow under image */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#6EE05A]/20 via-[#14b8a6]/10 to-[#a78bfa]/20 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl shadow-black/40 ring-1 ring-white/5">
                <Image
                  src="/brand/0n-console.png"
                  alt="0nMCP console — chat, flows, vault, history"
                  width={1600}
                  height={1000}
                  priority={false}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </Reveal>
        </section>
      </Reveal>

      {/* ═══ MARKETPLACE / UCP ══════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#a78bfa]">
              UCP · Universal Commerce Protocol
            </Badge>
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                The /.well-known/ucp endpoint is the new product page — for AI agents.
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Build your workflow once as a .0n file. List it on the 0nCore marketplace. Any AI
              agent — ChatGPT, Claude, Perplexity, Gemini — can discover, buy, and run it without
              prior integration.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-12 px-7">
                <a href="https://0ncore.com" target="_blank" rel="noopener">
                  Open 0nCore — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <Link href="/0n-standard">Read the .0n spec</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Open spec', desc: 'MIT licensed. Competitors can adopt it.' },
              { label: '70% to builder', desc: 'Stripe Connect payouts. Auto-split.' },
              { label: '11 apps live', desc: 'HIPAA, SXO, AI Blog, IndexNow, more.' },
              { label: 'No landing page', desc: 'AI agents discover via UCP manifest.' },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 100} direction="up">
                <Card className="h-full border-[#a78bfa]/25 bg-[#a78bfa]/5 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#a78bfa]">{c.label}</CardTitle>
                    <CardDescription className="text-white/65">{c.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REQUEST ACCESS FORM ════════════════════════════════════ */}
      <Reveal direction="up">
        <section id="early-access" className="scroll-mt-24 border-t border-border bg-card/20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
            <div>
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#6EE05A]">
                Founders Cohort · Closes May 1
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Get in before public launch — keep founder pricing forever.
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/75">
                We&rsquo;re onboarding a focused group of operators, agencies, and indie builders
                ahead of May 1. White-glove setup, a direct line to the team, and lifetime
                founder pricing on every app in the marketplace.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#6EE05A]" />
                  <span><strong className="text-white">Lifetime founder pricing</strong> — locked the day you sign up, never raises</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#14b8a6]" />
                  <span><strong className="text-white">Direct provisioning</strong> into the 0nCore dashboard with all 150+ services pre-wired</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
                  <span><strong className="text-white">Guided first run</strong> — first .0n workflow shipped on a call with us</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                  <span><strong className="text-white">Private Slack</strong> with the founding team — every question, answered same day</span>
                </li>
              </ul>
              <p className="mt-6 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Public launch May 1 · Founders pricing ends at launch · No credit card to reserve
              </p>
            </div>
            <Reveal direction="left" delay={150}>
              <RequestAccessForm />
            </Reveal>
          </div>
        </section>
      </Reveal>

      {/* ═══ FAQ ═══════════════════════════════════════════════════ */}
      <Reveal direction="up">
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
                Frequently Asked
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Questions, answered.
                </span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="mt-12">
              {FAQ.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} className="border-border/60">
                  <AccordionTrigger className="text-left text-base font-semibold text-white hover:text-[#6EE05A]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-white/70">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </Reveal>

      {/* ═══ FINAL CTA ═════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <Card className="relative overflow-hidden border-[#6EE05A]/25 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-[#161b22] backdrop-blur">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6EE05A]/15 blur-[100px]"
          />
          <CardContent className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <Rocket className="mx-auto mb-6 h-12 w-12 text-[#6EE05A]" />
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Stop building workflows. Start describing outcomes.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              {STATS_DISPLAY.capabilities_marketing} capabilities. {STATS_DISPLAY.services_marketing} services.
              One command. Free forever.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base font-bold">
                <a href="https://0ncore.com" target="_blank" rel="noopener">
                  Sign up free on 0nCore
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <Link href="#apps">See what you can build</Link>
              </Button>
            </div>
            <Separator className="my-10 bg-border/50" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              5 patents pending · MIT-licensed core · 0nork / RocketOpp LLC
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ═══ STICKY LEAD CTA ═══════════════════════════════════════ */}
      <StickyCTA />
    </main>
  )
}
