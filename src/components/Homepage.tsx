import Link from 'next/link'
import {
  ArrowRight,
  Github,
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
        {/* Soft grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(110,224,90,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(110,224,90,0.4)_1px,transparent_1px)] [background-size:48px_48px]"
        />
        {/* Soft glow blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-[#6EE05A]/10 blur-[120px]"
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-36 lg:pb-32">
          {/* ── LEFT: text + CTAs ── */}
          <div className="lg:col-span-7 flex flex-col justify-center">
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
                The universal AI
              </span>
              <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                API orchestrator.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services. One install.
              Zero configuration. Patent-pending Three-Level Execution. Powered by the .0n SWITCH
              file format.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild size="lg" className="h-12 px-7 text-base font-bold">
                <Link href="/start">
                  Turn It 0n — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base font-semibold">
                <a href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-5 text-base">
                <Link href="/docs">Read the docs</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <code className="rounded-md border border-[#6EE05A]/25 bg-[#6EE05A]/8 px-3 py-1.5 font-mono text-sm text-[#6EE05A]">
                $ npx 0nmcp@latest
              </code>
              <span className="text-xs text-muted-foreground font-mono">
                works with Claude, Cursor, Windsurf, Gemini, VS Code, Zed
              </span>
            </div>
          </div>

          {/* ── RIGHT: animated pipeline ── */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-[600px]">
              <ServerPipeline />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ══════════════════════════════════════════════ */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4 lg:grid-cols-7">
          {[
            { v: STATS_DISPLAY.tools, l: 'Tools' },
            { v: STATS_DISPLAY.services, l: 'Services' },
            { v: STATS_DISPLAY.categories, l: 'Categories' },
            { v: '$0', l: 'Local Use' },
            { v: 'MIT', l: 'License' },
            { v: STATS_DISPLAY.ai_platforms, l: 'AI Platforms' },
            { v: STATS_DISPLAY.patents, l: 'Patents' },
          ].map((s) => (
            <div key={s.l} className="bg-card/80 px-4 py-6 text-center">
              <div className="font-mono text-2xl font-black text-[#6EE05A] tabular-nums">{s.v}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.l}
              </div>
            </div>
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
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <Card
                key={f.title}
                className="border-border/60 bg-card/60 backdrop-blur transition-colors hover:border-[#6EE05A]/30 hover:bg-card/80"
              >
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
            {PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <Card key={p.label} className={`border ${p.border} ${p.bg} backdrop-blur`}>
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
              )
            })}
          </div>
        </div>
      </section>

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
            {STEPS.map((s) => (
              <Card key={s.n} className="relative border-border/60 bg-card/60 backdrop-blur">
                <CardHeader>
                  <div className="font-mono text-3xl font-black text-[#6EE05A]/30">{s.n}</div>
                  <CardTitle className="text-xl text-white">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-white/70">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
                <Link href="/marketplace">
                  Browse the marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <Link href="/0n-standard">
                  Read the .0n spec
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Open spec', desc: 'MIT licensed. Competitors can adopt it.' },
              { label: '70% to builder', desc: 'Stripe Connect payouts. Auto-split.' },
              { label: '11 apps live', desc: 'HIPAA, SXO, AI Blog, IndexNow, more.' },
              { label: 'No landing page', desc: 'AI agents discover via UCP manifest.' },
            ].map((c) => (
              <Card key={c.label} className="border-[#a78bfa]/25 bg-[#a78bfa]/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-[#a78bfa]">{c.label}</CardTitle>
                  <CardDescription className="text-white/65">{c.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════ */}
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
              {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. One command. Free
              forever.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base font-bold">
                <Link href="/start">
                  Turn It 0n — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <a href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener">
                  <Github className="mr-2 h-4 w-4" />
                  Star on GitHub
                </a>
              </Button>
            </div>
            <Separator className="my-10 bg-border/50" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              MIT licensed · 5 patents pending · 0nork / RocketOpp LLC
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
