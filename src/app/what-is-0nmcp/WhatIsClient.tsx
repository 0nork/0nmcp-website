'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  Code2,
  CreditCard,
  Database,
  Globe,
  Lock,
  Mail,
  Megaphone,
  Send,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Wand2,
  X,
  Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { STATS_DISPLAY } from '@/data/stats'
import Reveal from '@/components/Reveal'
import HeroQuickCapture from '@/components/HeroQuickCapture'
import RequestAccessForm from '@/components/RequestAccessForm'
import StickyCTA from '@/components/StickyCTA'
import CountdownToLaunch from '@/components/CountdownToLaunch'
import AnimatedGrid from '@/components/AnimatedGrid'
import AnimatedConnectors from '@/components/AnimatedConnectors'
import { ScrollArea } from '@/components/smooth-scroll-area'

// ─── Action cards (what 0nMCP can do) ────────────────────────────────
const ACTIONS = [
  {
    icon: Mail,
    title: 'Send and reply to emails',
    desc: 'Your AI drafts and sends emails to your customers — not just writes them and hands them to you.',
    color: 'text-[#6EE05A]',
    border: 'border-[#6EE05A]/25',
    bg: 'bg-[#6EE05A]/5',
  },
  {
    icon: Users,
    title: 'Update contacts and deals',
    desc: 'When someone fills out a form or makes a purchase, your CRM gets the new record instantly. No copy-paste.',
    color: 'text-[#14b8a6]',
    border: 'border-[#14b8a6]/25',
    bg: 'bg-[#14b8a6]/5',
  },
  {
    icon: CreditCard,
    title: 'Charge payments and create invoices',
    desc: 'Need to send someone an invoice? It gets created in Stripe and delivered — in seconds.',
    color: 'text-[#a78bfa]',
    border: 'border-[#a78bfa]/25',
    bg: 'bg-[#a78bfa]/5',
  },
  {
    icon: Database,
    title: 'Read and write to databases',
    desc: 'Look up information, make updates, store new data — safely and automatically.',
    color: 'text-[#f59e0b]',
    border: 'border-[#f59e0b]/25',
    bg: 'bg-[#f59e0b]/5',
  },
  {
    icon: Megaphone,
    title: 'Post and schedule social content',
    desc: 'Write a post and publish it — or schedule it for later — across every social channel.',
    color: 'text-[#6EE05A]',
    border: 'border-[#6EE05A]/25',
    bg: 'bg-[#6EE05A]/5',
  },
]

// ─── Service tags shown in cloud ─────────────────────────────────────
const SERVICES = [
  { name: 'Stripe', highlight: true },
  { name: 'Supabase', highlight: true },
  { name: 'Google Calendar', highlight: true },
  { name: 'Gmail', highlight: true },
  { name: 'Slack' },
  { name: 'Twilio' },
  { name: 'GitHub' },
  { name: 'Shopify' },
  { name: 'HubSpot' },
  { name: 'Notion' },
  { name: 'Airtable' },
  { name: 'Discord' },
  { name: 'Google Sheets' },
  { name: 'Figma' },
  { name: 'Zoom' },
  { name: 'LinkedIn' },
  { name: 'Mailchimp' },
  { name: 'DocuSign' },
  { name: 'WordPress' },
  { name: 'Webflow' },
  { name: '+ 130 more' },
]

// ─── 0nCore engine responsibilities ─────────────────────────────────
const ENGINE_DUTIES = [
  {
    icon: Lock,
    title: 'Keeps your passwords and API keys safe',
    desc: 'AES-256 encryption — the same protection banks use — locks your private info up tight.',
  },
  {
    icon: Wand2,
    title: 'Figures out the best way to do things',
    desc: 'Some jobs run one step at a time. Others run all at once. 0nCore picks the fastest path.',
  },
  {
    icon: Zap,
    title: 'Connects your AI to the right tool at the right time',
    desc: 'When you describe what you want, 0nCore reads your request and routes it to the right service — no manual setup.',
  },
]

// ─── Workflow walkthrough ────────────────────────────────────────────
const WORKFLOW = [
  {
    title: 'You say what you want',
    desc: '"Send a thank-you email to everyone who signed up this week and add them to my Stripe customer list."',
  },
  {
    title: '0nCore reads the request',
    desc: 'It figures out which tools are needed — your email system and Stripe — and plans the steps.',
  },
  {
    title: '0nMCP does the work',
    desc: 'Pulls up the new signups, creates the customers in Stripe, sends the emails — all in one go.',
  },
  {
    title: 'You get a summary',
    desc: '"Done. 14 customers added. 14 emails sent." That\u2019s it. You didn\u2019t lift a finger.',
  },
]

// ─── Audience cards ──────────────────────────────────────────────────
const AUDIENCES = [
  {
    icon: Briefcase,
    title: 'Business owners and founders',
    desc: 'Wearing ten hats? Hand the repetitive ones to 0nMCP. No new hire. No new software to learn.',
    color: 'text-[#6EE05A]',
    bg: 'bg-[#6EE05A]/5',
    border: 'border-[#6EE05A]/25',
  },
  {
    icon: Code2,
    title: 'Developers and technical teams',
    desc: 'Building with AI? Get a 2,000+ capability head start, ready to plug into Claude, ChatGPT, Cursor, or any MCP-compatible client.',
    color: 'text-[#14b8a6]',
    bg: 'bg-[#14b8a6]/5',
    border: 'border-[#14b8a6]/25',
  },
  {
    icon: Megaphone,
    title: 'Marketing and sales teams',
    desc: 'Imagine your AI pulling last week\u2019s leads, scoring them, drafting personalized outreach, and sending it — while you sleep.',
    color: 'text-[#a78bfa]',
    bg: 'bg-[#a78bfa]/5',
    border: 'border-[#a78bfa]/25',
  },
  {
    icon: Users,
    title: 'Agencies and service providers',
    desc: 'Deliver more for your clients without adding headcount. Branded automation flows — built once, sold forever.',
    color: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/5',
    border: 'border-[#f59e0b]/25',
  },
]

// ─── Comparison rows ─────────────────────────────────────────────────
const COMPARISON: { label: string; chat: boolean | string; mcp: boolean | string }[] = [
  { label: 'Get advice and ideas', chat: true, mcp: true },
  { label: 'Send a real email from your inbox', chat: false, mcp: true },
  { label: 'Add a new contact to your CRM', chat: false, mcp: true },
  { label: 'Charge a customer in Stripe', chat: false, mcp: true },
  { label: 'Read data from your database', chat: false, mcp: true },
  { label: 'Run on multiple AI platforms', chat: false, mcp: '7+ platforms' },
  { label: 'Keep your API keys encrypted', chat: false, mcp: 'Bank-grade' },
  { label: 'Free to start using', chat: 'Usually', mcp: true },
]

// ─── FAQ entries ─────────────────────────────────────────────────────
const FAQ = [
  {
    q: 'What is 0nMCP in simple terms?',
    a: '0nMCP is a tool that gives your AI assistant the ability to take real actions. Instead of just talking, your AI can send emails, update customer records, charge payments, and more — using tools your business already has. Think of it as giving your AI a pair of hands.',
  },
  {
    q: 'What is 0nCore?',
    a: '0nCore is the engine that powers 0nMCP. It handles the smart routing of requests, keeps your credentials safe with bank-grade encryption, and figures out the fastest way to complete tasks — whether that\u2019s one step at a time or many steps at once. You don\u2019t interact with 0nCore directly. It just runs in the background, making everything work.',
  },
  {
    q: 'Do I need to know how to code?',
    a: 'No. You can sign up at 0nmcp.com and start connecting tools from a regular web dashboard — no code, no terminal, no setup headaches. Developers can also install with npm if they want to build custom things on top of it.',
  },
  {
    q: 'Which AI platforms work with 0nMCP?',
    a: '0nMCP works with Claude (Anthropic), ChatGPT (OpenAI), Cursor, Windsurf, Gemini, Continue, and Cline. It uses the Model Context Protocol (MCP) — an open standard — so as more AI platforms adopt it, 0nMCP will work with those too.',
  },
  {
    q: 'Is 0nMCP free?',
    a: 'Yes, 0nMCP is free to install and use for your own automations. On the marketplace, some pre-built workflow templates cost a small fee per run — usually $0.10 per execution. There are no monthly fees just to use the core tool.',
  },
  {
    q: 'How is 0nMCP different from Zapier or Make?',
    a: 'Zapier and Make are great for simple "if this, then that" automations you set up in advance. 0nMCP is AI-driven — you describe what you want in plain English, and the AI figures out the steps. There\u2019s no visual flowchart to build. It also works inside your AI assistant, not as a separate app you have to visit.',
  },
  {
    q: 'What does "0n" mean?',
    a: '"0n" is short for "always on." Your business automation runs all the time — not just when you remember to check a tool. The name also hints at "Turn it 0n" — connecting a new service so your AI has access to it.',
  },
  {
    q: 'Where can I learn more or get help?',
    a: 'The best place to start is the community forum and the integrations directory. Full documentation lives at /turn-it-on, and a glossary of AI terms at /glossary. For specific questions you can reach the team at mike@rocketopp.com.',
  },
]

export default function WhatIsClient() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <AnimatedGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#6EE05A]/[0.06] blur-[140px]"
        />

        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-36 lg:pb-24">
          <Reveal direction="up">
            <Badge variant="outline" className="mb-6 font-mono text-[10px] uppercase tracking-widest">
              <Sparkles className="mr-1.5 h-3 w-3 text-[#6EE05A]" />
              AI Tools · Plain English
            </Badge>

            <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                What Is 0nMCP?
              </span>
              <span className="mt-2 block text-2xl font-bold leading-snug text-white/85 sm:text-3xl lg:text-4xl">
                The AI tool that does your business work for you.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75 sm:text-xl">
              Most AI tools can <em>talk about</em> your business. 0nMCP actually <strong className="text-white">runs it</strong>.
              It gives any AI assistant the power to send emails, charge payments, update contacts,
              and manage data — all by itself. Here&rsquo;s how it works, in plain English.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>By <strong className="text-white">Mike Mento</strong>, RocketOpp LLC</span>
              <span aria-hidden>·</span>
              <time dateTime="2026-04-28"><strong className="text-white">April 28, 2026</strong></time>
              <span aria-hidden>·</span>
              <span>8 min read</span>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-7 text-base font-bold">
                <Link href="#early-access">
                  Get Early Access — Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base font-semibold">
                <Link href="#install">See install methods</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ STATS GRID ═════════════════════════════════════════════ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { v: STATS_DISPLAY.capabilities_marketing, l: 'Capabilities' },
              { v: STATS_DISPLAY.services_marketing, l: 'Services connected' },
              { v: '7', l: 'AI platforms' },
              { v: 'Free', l: 'To get started' },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 80} direction="up">
                <Card className="h-full border-border/60 bg-card/60 text-center backdrop-blur">
                  <CardContent className="py-7">
                    <div className="font-mono text-3xl font-black tabular-nums sm:text-4xl">
                      <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                        {s.v}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.l}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ "Let's start simple" ═══════════════════════════════════ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal direction="up">
          <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              Let&rsquo;s start simple: What is 0nMCP?
            </span>
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-white/75">
            <p>
              You know how a TV remote talks to your TV? You press a button and the TV does
              something. <strong className="text-white">0nMCP works the same way — but for your business tools.</strong>
            </p>
            <p>
              It&rsquo;s a software package that connects your AI assistant (like Claude or ChatGPT)
              to over <strong className="text-white">2,000 real business capabilities</strong> across <strong className="text-white">150+ services</strong> — your email, customer list, payment system, calendar.
            </p>
            <p>
              Before 0nMCP, AI could only give you advice. You still had to do the work.
              With 0nMCP, your AI can <em>do</em> the work for you.
            </p>
          </div>

          <Card className="mt-8 border-l-4 border-l-[#6EE05A] border-y border-r border-border/60 bg-card/60 backdrop-blur">
            <CardHeader>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#6EE05A]">
                The big idea
              </p>
              <CardTitle className="text-lg leading-snug text-white">
                Stop describing outcomes to AI. Let AI achieve them.
              </CardTitle>
              <CardDescription className="text-white/65">
                You tell 0nMCP what you need. It picks the right tools and gets it done.
              </CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
      </section>

      {/* ═══ What can 0nMCP actually do? ═══════════════════════════ */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
                Real actions, real apps
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  What can 0nMCP actually do?
                </span>
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Imagine you had a helper who could do all of these — automatically.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIONS.map((a, i) => {
              const Icon = a.icon
              return (
                <Reveal key={a.title} delay={i * 80} direction="up">
                  <Card className={`h-full border ${a.border} ${a.bg} backdrop-blur transition-colors hover:bg-card/80`}>
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${a.border} ${a.bg}`}>
                        <Icon className={`h-6 w-6 ${a.color}`} />
                      </div>
                      <CardTitle className="mt-3 text-lg text-white">{a.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-white/70">{a.desc}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>

          <Reveal direction="up" delay={150}>
            <p className="mx-auto mt-10 max-w-2xl text-center text-base text-white/70">
              These are real things happening in real apps. Not suggestions. Not drafts you still have to finish.{' '}
              <strong className="text-white">Actual work, done by AI, using the tools your business already runs on.</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ Service tag cloud ═════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <h3 className="text-center text-base font-mono uppercase tracking-widest text-muted-foreground">
            Just a few of the 150+ services already wired in
          </h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {SERVICES.map((s, i) => (
              <Reveal key={s.name} delay={i * 30} direction="up">
                <span
                  className={[
                    'inline-block rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    s.highlight
                      ? 'border-[#6EE05A]/30 bg-[#6EE05A]/8 text-[#6EE05A]'
                      : 'border-border/60 bg-card/50 text-white/75 hover:border-[#6EE05A]/30 hover:text-[#6EE05A]',
                  ].join(' ')}
                >
                  {s.name}
                </span>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══ What is 0nCore? ════════════════════════════════════════ */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal direction="up">
            <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Now, what is 0nCore?
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/75">
              If 0nMCP is the remote control,{' '}
              <strong className="text-white">0nCore is the batteries and the Wi-Fi signal inside it.</strong>
            </p>
            <p className="mt-3 text-base leading-relaxed text-white/65">
              0nCore is the engine that makes 0nMCP run. It handles three things behind the scenes:
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            {ENGINE_DUTIES.map((d, i) => {
              const Icon = d.icon
              return (
                <Reveal key={d.title} delay={i * 100} direction="left">
                  <Card className="border-border/60 bg-card/60 backdrop-blur">
                    <CardContent className="flex gap-4 py-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6EE05A]/10 ring-1 ring-[#6EE05A]/25">
                        <Icon className="h-5 w-5 text-[#6EE05A]" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{d.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">{d.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>

          <Reveal direction="up" delay={150}>
            <Card className="mt-8 border-l-4 border-l-[#a78bfa] border-y border-r border-border/60 bg-card/60 backdrop-blur">
              <CardHeader>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#a78bfa]">
                  Simple analogy
                </p>
                <p className="mt-2 text-base leading-relaxed text-white/85">
                  Think of 0nCore like the <strong className="text-white">kitchen</strong> in a restaurant. Customers (you) place orders.
                  The waiter (0nMCP) takes the order. The kitchen (0nCore) makes it happen.{' '}
                  <strong className="text-white">You just enjoy the result.</strong>
                </p>
              </CardHeader>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ═══ Workflow: how they work together ═════════════════════ */}
      <section className="relative overflow-hidden mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <AnimatedConnectors intensity={0.28} />
        <Reveal direction="up">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
              How they work together
            </Badge>
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                One real example, four steps.
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[26px] top-2 bottom-2 w-px bg-gradient-to-b from-[#6EE05A]/40 via-[#14b8a6]/40 to-[#a78bfa]/40 sm:left-[36px]"
          />

          <div className="space-y-5">
            {WORKFLOW.map((w, i) => (
              <Reveal key={w.title} delay={i * 100} direction="left">
                <div className="relative pl-16 sm:pl-24">
                  <div className="absolute left-0 top-0 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[#6EE05A]/30 bg-[#0d1117] shadow-[0_0_24px_rgba(110,224,90,0.2)] backdrop-blur sm:h-[72px] sm:w-[72px]">
                    <span className="font-mono text-lg font-black sm:text-2xl">
                      <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                        0{i + 1}
                      </span>
                    </span>
                  </div>
                  <Card className="border-border/60 bg-card/40 backdrop-blur">
                    <CardContent className="py-5">
                      <p className="text-base font-bold text-white">{w.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">{w.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Who is it for? ═══════════════════════════════════════ */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
                Who it&rsquo;s for
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Built for anyone short on hours.
                </span>
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {AUDIENCES.map((a, i) => {
              const Icon = a.icon
              return (
                <Reveal key={a.title} delay={i * 80} direction="up">
                  <Card className={`h-full border ${a.border} ${a.bg} backdrop-blur`}>
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${a.border} ${a.bg}`}>
                        <Icon className={`h-6 w-6 ${a.color}`} />
                      </div>
                      <CardTitle className="mt-3 text-lg text-white">{a.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-white/70">{a.desc}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ Comparison table ═════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal direction="up">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
              0nMCP vs. regular AI chat
            </Badge>
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Most AI tools talk. 0nMCP works.
              </span>
            </h2>
          </div>
        </Reveal>

        <Reveal direction="up" delay={100}>
          <Card className="mt-10 border-border/60 bg-card/40 backdrop-blur">
            <CardContent className="p-0">
              <ScrollArea horizontal className="w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        What you can do
                      </th>
                      <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Regular AI chat
                      </th>
                      <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-[#6EE05A]">
                        0nMCP + 0nCore
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row) => (
                      <tr key={row.label} className="border-b border-border/30 last:border-0 transition-colors hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-semibold text-white">{row.label}</td>
                        <td className="px-6 py-4">
                          <ComparisonCell value={row.chat} positive={false} />
                        </td>
                        <td className="px-6 py-4">
                          <ComparisonCell value={row.mcp} positive={true} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal direction="up" delay={200}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-base text-white/70">
            The gap is simple: most AI tools stop at the conversation.{' '}
            <strong className="text-white">0nMCP picks up where the conversation ends and gets the job done.</strong>
          </p>
        </Reveal>
      </section>

      {/* ═══ Founders cohort + countdown CTA ═════════════════════════ */}
      <section
        id="early-access"
        className="scroll-mt-24 relative overflow-hidden border-y border-border bg-gradient-to-b from-card/40 via-card/30 to-card/40"
      >
        <AnimatedGrid peakOpacity={0.12} />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#6EE05A]">
                Public launch · May 1, 2026
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Be first in line — get your exclusive login link.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
                We&rsquo;re onboarding the founders cohort right now. Sign up free and you&rsquo;ll be one of the first to receive an exclusive login link the moment access opens.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#6EE05A]/25 bg-[#0d1117]/60 p-6 backdrop-blur sm:p-8">
              <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Launch in
              </p>
              <CountdownToLaunch className="mt-3" />
              <Separator className="my-6 bg-border/40" />
              <p className="text-center text-sm text-white/65">
                Drop your email below — your invite link arrives the moment we open the doors.
              </p>
              <div className="mt-4">
                <RequestAccessForm />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                No credit card. No code. Cancel anytime. Lifetime founder pricing locked in for early signups.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Install methods ════════════════════════════════════════ */}
      <section id="install" className="scroll-mt-24 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal direction="up">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
              Five ways to install
            </Badge>
            <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                However you build, 0nMCP plugs in.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/70">
              Pick your AI editor or run the CLI. The same 0nMCP server works across all of them.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={100}>
          <Tabs defaultValue="dashboard" className="mx-auto mt-12 max-w-3xl">
            <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="cli">CLI · npm</TabsTrigger>
              <TabsTrigger value="claude">Claude</TabsTrigger>
              <TabsTrigger value="cursor">Cursor</TabsTrigger>
              <TabsTrigger value="windsurf">Windsurf</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <InstallCard
                icon={Globe}
                title="Use the 0nCore dashboard"
                desc="The easiest path. No install, no API keys, no terminal. Sign in and connect your services from a regular web app."
                cta={{ label: 'Open 0nCore — Free', href: 'https://0ncore.com' }}
                code={null}
                bullets={[
                  'No code, no terminal, no setup',
                  'All 150+ services pre-wired',
                  'Browse the marketplace and install apps with one click',
                ]}
              />
            </TabsContent>

            <TabsContent value="cli">
              <InstallCard
                icon={Terminal}
                title="Run the CLI from any terminal"
                desc="One command installs 0nMCP globally. Connect it to any MCP-compatible AI editor."
                cta={{ label: 'Read the install guide', href: '/install' }}
                code="npx 0nmcp@latest"
                bullets={[
                  'Works on macOS, Linux, Windows',
                  'Node 18+ recommended',
                  'Zero config — autodiscovers your AI editor',
                ]}
              />
            </TabsContent>

            <TabsContent value="claude">
              <InstallCard
                icon={Sparkles}
                title="Connect to Claude Desktop or Claude Code"
                desc="Add the 0nMCP server to Claude\u2019s MCP config. Tools appear automatically inside chat."
                cta={{ label: 'Claude install steps', href: '/install/claude' }}
                code={`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"]
    }
  }
}`}
                bullets={[
                  'Works with Claude Desktop and Claude Code',
                  'All 2,000+ capabilities exposed as tools',
                  'No API keys to manage',
                ]}
              />
            </TabsContent>

            <TabsContent value="cursor">
              <InstallCard
                icon={Code2}
                title="Plug into Cursor"
                desc="Drop the same MCP server entry into Cursor\u2019s settings. Tools available in chat + composer."
                cta={{ label: 'Cursor install steps', href: '/install' }}
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
                  'Auto-reloads when you update tools',
                ]}
              />
            </TabsContent>

            <TabsContent value="windsurf">
              <InstallCard
                icon={Wand2}
                title="Plug into Windsurf"
                desc="Codeium\u2019s Windsurf supports the MCP standard. Same one-line install pattern."
                cta={{ label: 'Windsurf install steps', href: '/install' }}
                code="windsurf mcp add 0nmcp"
                bullets={[
                  'Native MCP support in Windsurf',
                  '2,000+ capabilities ready to call',
                  'Works alongside built-in Cascade tools',
                ]}
              />
            </TabsContent>
          </Tabs>
        </Reveal>
      </section>

      {/* ═══ Is my data safe? ═══════════════════════════════════════ */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal direction="up">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6EE05A]/10 ring-1 ring-[#6EE05A]/25">
                <Shield className="h-6 w-6 text-[#6EE05A]" />
              </div>
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
                Security
              </Badge>
            </div>
            <h2 className="mt-4 text-balance text-3xl font-black tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                Is my data safe?
              </span>
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/75">
              <p>
                Fair question. When you give a tool access to your email, payments, and contacts, you need to know it&rsquo;s protected.
              </p>
              <p>
                0nMCP uses <strong className="text-white">AES-256-GCM encryption</strong> — the standard banks and government systems use — to store your API keys. Credentials never travel unprotected.
              </p>
              <p>
                The <strong className="text-white">0nVault system</strong> (patent pending US #63/990,046) adds another layer: it ties your encrypted credentials to your specific device. Even if someone got the file, they couldn&rsquo;t use it without your machine.
              </p>
              <p>
                You&rsquo;re in control. Decide which tools 0nMCP can access. Revoke access to any service at any time from your dashboard.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal direction="up">
            <div className="text-center">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
                Frequently asked
              </Badge>
              <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Questions, answered.
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

      {/* ═══ Keep learning ═════════════════════════════════════════ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <h3 className="text-xl font-bold text-white">Keep learning</h3>
          <ul className="mt-4 space-y-2.5 text-base">
            {[
              { label: 'Browse all 150+ service integrations', href: '/turn-it-on' },
              { label: 'AI glossary — 80 terms explained in plain English', href: '/glossary' },
              { label: 'How 0nMCP compares to other tools', href: '/compare' },
              { label: 'Build your first automated workflow', href: '/builder' },
              { label: '0nCore — the AI dashboard', href: 'https://0ncore.com' },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group inline-flex items-center gap-2 text-[#6EE05A] underline-offset-4 hover:underline"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <StickyCTA />
    </main>
  )
}

// ── Comparison cell ────────────────────────────────────────────────
function ComparisonCell({ value, positive }: { value: boolean | string; positive: boolean }) {
  if (typeof value === 'string') {
    if (positive) {
      return (
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#6EE05A]">
          <Check className="h-4 w-4 shrink-0" />
          {value}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-white/60">
        <Check className="h-4 w-4 shrink-0 text-white/40" />
        {value}
      </span>
    )
  }
  if (value) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#6EE05A]/15 ring-1 ring-[#6EE05A]/30">
        <Check className="h-4 w-4 text-[#6EE05A]" />
      </span>
    )
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
      <X className="h-4 w-4 text-red-400" />
    </span>
  )
}

// ── Install card (used in tabs) ────────────────────────────────────
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
    <Card className="mt-6 border-border/60 bg-card/60 backdrop-blur">
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
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6EE05A]" />
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
