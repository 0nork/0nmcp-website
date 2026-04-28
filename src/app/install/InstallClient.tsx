'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Code2,
  Globe,
  Linkedin,
  MessageCircle,
  Sparkles,
  Terminal,
  Wand2,
  Webhook,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { SegmentLayout, SegmentLayoutContent } from '@/components/segment-layout'
import { ScrollArea } from '@/components/smooth-scroll-area'
import AnimatedGrid from '@/components/AnimatedGrid'
import AnimatedConnectors from '@/components/AnimatedConnectors'
import Reveal from '@/components/Reveal'
import StickyCTA from '@/components/StickyCTA'

// ─── Install card (used inside each segment panel) ──────────────────
function InstallCard({
  icon: Icon,
  title,
  desc,
  cta,
  code,
  bullets,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  cta: { label: string; href: string }
  code: string | null
  bullets: string[]
}) {
  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#6EE05A]/10 ring-1 ring-[#6EE05A]/25">
            <Icon className="h-5 w-5 text-[#6EE05A]" />
          </div>
          <CardTitle className="text-xl text-white">{title}</CardTitle>
        </div>
        <CardDescription className="text-base text-white/70">{desc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {code && (
          <ScrollArea horizontal className="rounded-xl border border-border/60 bg-[#0d1117] p-4">
            <pre className="font-mono text-xs text-[#6EE05A]">
              <code>{code}</code>
            </pre>
          </ScrollArea>
        )}
        <ul className="space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-white/75">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#6EE05A]" />
              {b}
            </li>
          ))}
        </ul>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={cta.href} target={cta.href.startsWith('http') ? '_blank' : undefined}>
            {cta.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

const FAQ = [
  {
    q: 'Do I need an API key to install 0nMCP?',
    a: 'Not for the orchestrator itself — `npx 0nmcp@latest` runs without one. You only need keys for the services you connect to (Stripe, your CRM, etc.), and even those can be managed inside 0nCore so you never see them.',
  },
  {
    q: 'Is the same configuration shared across editors?',
    a: 'Yes. The Claude / Cursor / Windsurf / Gemini configs are byte-identical — same `command`, same `args`. Pick the one you use most; you can add the others later by pasting the same block into their MCP settings.',
  },
  {
    q: 'How do I update?',
    a: 'You don\u2019t. `npx 0nmcp@latest` always pulls the latest. If you ran `npm install -g 0nmcp` once, run `npm update -g 0nmcp` to refresh.',
  },
  {
    q: 'What does this cost?',
    a: 'The orchestrator is MIT-licensed and free forever. Some marketplace apps cost ~$0.01 per execution. The 0nCore dashboard subscription starts at $80/mo for everything bundled — voice AI, course generator, all 150+ services pre-wired.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Credentials live in 0nVault — AES-256-GCM with hardware-fingerprint binding. Nothing leaves your machine unencrypted, and only your hardware can unlock the vault. Patent pending US #63/990,046.',
  },
  {
    q: 'I want to integrate with my own app.',
    a: 'Use the HTTP API — Bearer-token auth, scoped per workspace, streaming responses for long-running workflows. Same toolset as the MCP path. See the API tab above.',
  },
]

export default function InstallClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <AnimatedGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6EE05A]/[0.06] blur-[140px]"
        />
        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-12 text-center sm:px-6 lg:px-8 lg:pt-36 lg:pb-16">
          <Reveal direction="up">
            <Badge variant="outline" className="mb-5 font-mono text-[10px] uppercase tracking-widest">
              <Sparkles className="mr-1.5 h-3 w-3 text-[#6EE05A]" />
              Install · Connect · Build
            </Badge>
            <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Get 0nMCP running
              </span>
              <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                in 60 seconds.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
              Pick your AI editor on the left or your platform on the right. Same orchestrator,
              same 2,000+ capabilities, same 150+ services — everywhere you build.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-7 text-base font-bold">
                <Link href="#segments">
                  Pick your platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base font-semibold">
                <a href="https://0ncore.com" target="_blank" rel="noopener">
                  Skip install — open 0nCore
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ SEGMENT LAYOUT — 9 install paths ════════════════════════ */}
      <section id="segments" className="scroll-mt-24 relative overflow-hidden">
        <AnimatedConnectors intensity={0.18} />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Reveal direction="up">
            <SegmentLayout
              defaultValue="claude"
              leftLabel="AI Editors"
              rightLabel="Platforms"
              leftItems={[
                { label: 'Claude', value: 'claude', icon: Sparkles, caption: 'Desktop · Code' },
                { label: 'ChatGPT', value: 'gpt', icon: MessageCircle, caption: 'GPT actions' },
                { label: 'Cursor', value: 'cursor', icon: Code2, caption: 'Composer · chat' },
                { label: 'Gemini', value: 'gemini', icon: Wand2, caption: 'Gemini Code' },
              ]}
              rightItems={[
                { label: 'WordPress', value: 'wordpress', icon: Globe, caption: 'Plugin · pattern picker' },
                { label: 'Slack', value: 'slack', icon: MessageCircle, caption: 'Bot + slash commands' },
                { label: 'LinkedIn', value: 'linkedin', icon: Linkedin, caption: 'VPIS engine' },
                { label: 'NPM', value: 'npm', icon: Terminal, caption: 'CLI install' },
                { label: 'API', value: 'api', icon: Webhook, caption: 'HTTP + webhooks' },
              ]}
            >
              <SegmentLayoutContent value="claude">
                <InstallCard
                  icon={Sparkles}
                  title="Claude Desktop & Claude Code"
                  desc="Add the 0nMCP server to Claude's MCP config. Every one of our 2,000+ capabilities appears as a tool inside chat — no API key wrangling, no manual schema."
                  cta={{ label: 'Open the Claude deep-dive', href: '/install/claude' }}
                  code={`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"]
    }
  }
}`}
                  bullets={[
                    'Works in Claude Desktop, Claude Code, and the web app',
                    'All 2,000+ capabilities exposed as tools',
                    'Zero key management — credentials live in 0nVault',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="gpt">
                <InstallCard
                  icon={MessageCircle}
                  title="ChatGPT custom GPT actions"
                  desc="Wire 0nMCP into a custom GPT via the actions schema. ChatGPT calls our HTTP endpoint, we route through to 150+ services."
                  cta={{ label: 'Get the actions URL', href: 'https://0ncore.com' }}
                  code={`# Custom GPT → Configure → Actions
Schema URL:  https://www.0nmcp.com/api/gpt/actions/openapi.json
Auth:        Bearer token from 0nCore`}
                  bullets={[
                    'No GPT plugin store gating — runs as a custom GPT action',
                    'Same toolset as Claude / Cursor users',
                    'Output streams back into the conversation',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="cursor">
                <InstallCard
                  icon={Code2}
                  title="Cursor — Composer + chat"
                  desc="Drop the same MCP server entry into Cursor's settings. Tools light up across chat, composer, and agent mode automatically."
                  cta={{ label: 'Cursor MCP docs', href: 'https://docs.cursor.com/context/model-context-protocol' }}
                  code={`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"]
    }
  }
}`}
                  bullets={[
                    'Same config as Claude — copy/paste',
                    'Drives the agent loop, not just chat',
                    'Auto-reloads when you publish new tools to the registry',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="gemini">
                <InstallCard
                  icon={Wand2}
                  title="Gemini Code & Google AI Studio"
                  desc="Connect through the Gemini function-calling layer. Gemini sees every 0nMCP capability and routes calls automatically."
                  cta={{ label: 'Gemini setup notes', href: '/install#segments' }}
                  code={`# Gemini Code · settings.json
{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"]
    }
  }
}`}
                  bullets={[
                    'Native function-calling support',
                    'Same 2,000+ capability surface as Claude / GPT',
                    'Works in AI Studio prototypes too',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="wordpress">
                <InstallCard
                  icon={Globe}
                  title="WordPress plugin"
                  desc="The 0nCore WP plugin ships a pattern picker, REST bridge, CRM sync, tracking, and a built-in chat — all backed by 0nMCP. Install it like any other plugin."
                  cta={{ label: 'Get the WP plugin', href: '/wordpress' }}
                  code={null}
                  bullets={[
                    'Pattern library inside Gutenberg with live previews',
                    'CRM webhook + UTM capture wired in',
                    'No code — install, activate, sign into 0nCore',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="slack">
                <InstallCard
                  icon={MessageCircle}
                  title="Slack bot + slash commands"
                  desc="Add 0nMCP to your Slack workspace and your team gets the entire toolset behind /commands. Channel mentions trigger workflows; results stream back."
                  cta={{ label: 'Add to Slack', href: 'https://0ncore.com' }}
                  code={'/0n create contact "Sarah Chen" sarah@acme.com'}
                  bullets={[
                    'Slash commands for any 0nMCP capability',
                    'Channel-aware — replies post in-thread',
                    'Workflow triggers on emoji reactions',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="linkedin">
                <InstallCard
                  icon={Linkedin}
                  title="LinkedIn — VPIS posting engine"
                  desc="Use 0nMCP as the brain behind your LinkedIn growth: VPIS-scored content, Big Egg writing style, scheduling, drafting, posting, and engagement tracking."
                  cta={{ label: 'Open LinkedIn engine', href: 'https://0ncore.com' }}
                  code={null}
                  bullets={[
                    'AI-drafted posts in your voice profile',
                    'VPIS scoring per post (Value · Passion · Insight · Story)',
                    'Engagement metrics fed back into the next cycle',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="npm">
                <InstallCard
                  icon={Terminal}
                  title="NPM CLI — run from any terminal"
                  desc="One command installs 0nMCP globally. From there it works as an MCP server, an HTTP server, a workflow runtime, or a CLI."
                  cta={{ label: 'View on npm', href: 'https://www.npmjs.com/package/0nmcp' }}
                  code={`# Run the latest without installing
npx 0nmcp@latest

# Or install globally
npm install -g 0nmcp`}
                  bullets={[
                    'macOS · Linux · Windows · Node 18+',
                    'Zero config — autodiscovers your AI editor',
                    'Same binary backs MCP, HTTP, and the workflow runtime',
                  ]}
                />
              </SegmentLayoutContent>

              <SegmentLayoutContent value="api">
                <InstallCard
                  icon={Webhook}
                  title="HTTP API + webhooks"
                  desc="Don't want an MCP client? Hit our HTTP endpoint directly with a Bearer token. Same toolset, same outputs, REST-friendly."
                  cta={{ label: 'API reference', href: '/install#segments' }}
                  code={`curl -X POST https://www.0nmcp.com/api/execute \\
  -H "Authorization: Bearer \${ONMCP_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "tool": "crm_create_contact", "args": { … } }'`}
                  bullets={[
                    'Bearer-token auth, scoped per workspace',
                    'Webhook-driven — point any service at /api/webhooks/<id>',
                    'Streaming responses for long-running workflows',
                  ]}
                />
              </SegmentLayoutContent>
            </SegmentLayout>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════ */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal direction="up">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
                Install FAQ
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Six questions that come up most.
                </span>
              </h2>
            </div>
          </Reveal>
          <Reveal direction="up" delay={100}>
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
          </Reveal>
        </div>
      </section>

      {/* ═══ Final CTA ═══════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Card className="relative overflow-hidden border-[#6EE05A]/25 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-[#161b22] backdrop-blur">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6EE05A]/15 blur-[100px]"
          />
          <CardContent className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Skip the install. Run it on 0nCore.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
              Want every install path, every service, every capability without the setup? 0nCore
              ships everything pre-wired in a dashboard you can use today.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base font-bold">
                <a href="https://0ncore.com" target="_blank" rel="noopener">
                  Try 0nCore — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8">
                <Link href="/what-is-0nmcp">What is 0nMCP?</Link>
              </Button>
            </div>
            <Separator className="my-10 bg-border/50" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              5 patents pending · MIT-licensed core · 0nork / RocketOpp LLC
            </p>
          </CardContent>
        </Card>
      </section>

      <StickyCTA />
    </main>
  )
}
