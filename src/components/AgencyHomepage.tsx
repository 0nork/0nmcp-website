import Link from 'next/link'
import {
  ArrowRight, Boxes, CircuitBoard, Clock, Flag, Gauge, GitBranch, Headphones,
  LifeBuoy, Lock, MapPin, MessageSquare, Network, Phone, Plug, Rocket, Server,
  ShieldCheck, Sparkles, Timer, Wrench, XCircle,
} from 'lucide-react'
import { STATS_DISPLAY } from '@/data/stats'
import FlyIn from '@/components/FlyIn'
import { STEP } from '@/components/fly-steps'
import EngineCore from '@/components/EngineCore'

/**
 * The 0nMCP homepage, rewritten for one reader: an agency owner whose build has
 * stalled.
 *
 * THE OLD PAGE SOLD A TOOL COUNT. "1,640 tools across 109 services" is a fact
 * about our product and not a reason for anyone to act — an agency with a
 * half-finished app and a developer who stopped replying does not have a tools
 * problem. So the page now opens on their situation and gets to the number only
 * once it is the answer to something.
 *
 * ENGINE, NOT APP. The positioning is that everything else in the ecosystem —
 * the CRM, the copilot, web0n, the client portals — runs on this. The hero says
 * it, and the graphic behind it argues it before a word is read: everything
 * orbits one core and every packet flows inward.
 *
 * US-BASED IS A FEATURE, and it is stated plainly rather than implied by a flag
 * icon. It is the single most common reason this buyer has been burned, so it
 * gets its own section with specifics — a timezone, a phone, a name — because
 * "US-based" with no detail is exactly what the last vendor said too.
 *
 * MOTION IS THE BRAND HERE. Everything arrives object by object and leaves when
 * it goes, via FlyIn. Directions alternate deliberately: a grid that all marches
 * in from the left reads as a template, and the brief was bold.
 */

const STUCK = [
  { icon: XCircle, t: 'The app is 70% done', d: 'It demos fine and it has never touched a real client. The last 30% is the part nobody scoped.' },
  { icon: Clock, t: 'The developer went quiet', d: 'Three weeks, two follow-ups, one read receipt. Nobody left knows how the thing works.' },
  { icon: Network, t: 'Nothing talks to anything', d: 'The CRM, the billing, the forms and the reporting are four islands and a spreadsheet.' },
  { icon: GitBranch, t: 'You cannot say what is next', d: 'Not because you lack ideas. Because no one has told you what is actually possible from here.' },
  { icon: Server, t: 'Offshore, again', d: 'Cheap, then slow, then silent. Nine timezones from the client who is asking you why it broke.' },
  { icon: Gauge, t: 'You are the integration', d: 'Copying between tabs at 11pm is not a workflow, and it does not scale past you.' },
]

const ENGINE = [
  { icon: Plug, t: 'One connection, everything behind it', d: `${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services — CRM, Stripe, Google, Slack, Shopify, Supabase — reachable from one place instead of ${STATS_DISPLAY.services} integrations you maintain forever.` },
  { icon: CircuitBoard, t: 'The layer under your product', d: 'You keep your brand, your pricing and your client relationship. We are the part nobody sees, which is exactly where infrastructure belongs.' },
  { icon: ShieldCheck, t: 'Plan, approve, run, receipt', d: 'Nothing runs before someone approves it, and every action leaves a receipt in plain English. The safety model is the product.' },
  { icon: Lock, t: 'Keys stay yours', d: 'Credentials live encrypted in your own vault. Connect a service once and every product you build can use it without the key being copied anywhere.' },
]

const WHITELABEL = [
  { icon: Sparkles, t: 'Agency Copilot', d: 'Your operators describe an outcome in plain English and it happens across every client account. Under your logo, on your domain.' },
  { icon: Boxes, t: 'US-based agency CRM', d: 'Contacts, pipelines, conversations, calendars and billing — the whole operating layer, white-labelled, with the AI already wired into it.' },
  { icon: Rocket, t: 'Client portals that sell the retainer', d: 'Every client sees what you did for them this week, in sentences. Invisible work is the work that gets cancelled.' },
  { icon: Wrench, t: 'Ship what you already promised', d: 'Most of what your half-built app needs already exists here. The job is usually connecting it, not building it again.' },
]

const RESCUE = [
  { n: '01', t: 'We read what you have', d: 'Repo, dashboard, whatever exists. You get an honest inventory of what works, what is wired, and what was only ever a screenshot.' },
  { n: '02', t: 'You get the list', d: 'What is left, in order, with real timelines. Including the parts we think you should not build.' },
  { n: '03', t: 'It runs on the engine', d: 'The integrations you were going to write one by one are already here. That is normally where the months come back.' },
  { n: '04', t: 'You ship, under your name', d: 'White-labelled end to end. Your clients never learn we exist, which is the entire point.' },
]

const TRUST = [
  { icon: MapPin, t: 'Pennsylvania, USA', d: 'RocketOpp LLC. A registered US company with an address you can look up, not a contractor pool.' },
  { icon: Phone, t: 'One number, one person', d: 'You get an owner, not a ticket queue and not a rotating account manager.' },
  { icon: Timer, t: 'Your business hours', d: 'Eastern time. Answers during the day you are actually working, not overnight while your client waits.' },
  { icon: Headphones, t: 'Consulting, not just software', d: 'Marketing agency consulting is part of it. Deciding what to build is usually worth more than building it.' },
]

const FACTS = [
  { k: STATS_DISPLAY.tools, v: 'tools, one connection' },
  { k: STATS_DISPLAY.services, v: 'services already wired' },
  { k: '100%', v: 'US-based, US-owned' },
  { k: 'White-label', v: 'your brand, end to end' },
]

export default function AgencyHomepage() {
  return (
    <main className="overflow-x-clip">
      {/* ══ HERO ══ the claim, and the graphic that argues it ══════════════ */}
      <section className="relative isolate min-h-[92vh] overflow-hidden border-b border-[#30363d]">
        <EngineCore className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
        {/* Keeps the headline readable over the busiest part of the canvas. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/55 to-[#0d1117]" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-6 py-24">
          <FlyIn direction="down" once delayClass={STEP[0]}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6EE05A]/30 bg-[#6EE05A]/10 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#6EE05A]">
              <Flag className="h-3.5 w-3.5" /> US-based · built for agencies
            </span>
          </FlyIn>

          {/* Line by line, because the sentence has a turn in it. */}
          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.03em] text-[#f0f4f8] sm:text-7xl">
            <FlyIn direction="lift" once delayClass={STEP[1]} as="span" className="block">
              Your app is half built.
            </FlyIn>
            <FlyIn direction="lift" once delayClass={STEP[3]} as="span" className="block text-[#8b949e]">
              Your developer stopped replying.
            </FlyIn>
            <FlyIn direction="lift" once delayClass={STEP[5]} as="span" className="mt-2 block bg-gradient-to-r from-[#6EE05A] via-[#6EE05A] to-[#00C2C7] bg-clip-text text-transparent">
              We are the engine that finishes it.
            </FlyIn>
          </h1>

          {/* BLUF — the whole proposition in two sentences, above the fold. */}
          <FlyIn direction="up" once delayClass={STEP[7]}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#8b949e] sm:text-xl">
              0nMCP is the white-label AI engine underneath the agency stack — an
              agency copilot, a US-based agency CRM, and client portals that all run
              on one connection to{' '}
              <strong className="font-semibold text-[#f0f4f8]">{STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services</strong>.
              You ship it under your own brand; your clients never learn we exist.
            </p>
          </FlyIn>

          <FlyIn direction="up" once delayClass={STEP[9]}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/partners"
                className="btn-green group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold"
              >
                Get unstuck — talk to a US partner
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/roi-calculator"
                className="inline-flex items-center gap-2 rounded-full border border-[#30363d] px-7 py-3.5 text-[15px] font-semibold text-[#f0f4f8] transition-colors hover:border-[#6EE05A]/50 hover:text-[#6EE05A]"
              >
                See what it saves you
              </Link>
            </div>
          </FlyIn>

          <div className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {FACTS.map((f, i) => (
              <FlyIn key={f.v} direction="up" once delayClass={STEP[Math.min(i + 10, STEP.length - 1)]}>
                <div className="font-mono text-2xl font-bold text-[#6EE05A] sm:text-3xl">{f.k}</div>
                <div className="mt-1 text-[12.5px] leading-snug text-[#8b949e]">{f.v}</div>
              </FlyIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ THE STUCK ══ amber, on purpose — the pain must not look like the
           promise, or the page reads as one long pitch ═══════════════════ */}
      <section className="relative border-b border-[#30363d] bg-[#12100b] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FlyIn direction="left">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#f59e0b]">
              Where most agencies actually are
            </span>
          </FlyIn>
          <FlyIn direction="left" delayClass={STEP[1]}>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.02em] text-[#f0f4f8] sm:text-5xl">
              Nobody sells you the part where it stalls.
            </h2>
          </FlyIn>
          <FlyIn direction="left" delayClass={STEP[2]}>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#a8a29e]">
              If more than two of these are true, the problem is not your idea and
              it is not your team. It is that you have been buying pieces instead
              of standing on an engine.
            </p>
          </FlyIn>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STUCK.map(({ icon: Icon, t, d }, i) => (
              <FlyIn
                key={t}
                as="li"
                // Alternating, so the grid arrives from both sides.
                direction={i % 2 === 0 ? 'tilt-left' : 'tilt-right'}
                delayClass={STEP[i % STEP.length]}
                className="rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/[0.04] p-6"
              >
                <Icon className="h-5 w-5 text-[#f59e0b]" strokeWidth={2} />
                <h3 className="mt-4 text-[16px] font-bold text-[#f0f4f8]">{t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#a8a29e]">{d}</p>
              </FlyIn>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ THE ENGINE ══ what it actually is ════════════════════════════ */}
      <section className="relative border-b border-[#30363d] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FlyIn direction="right">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#6EE05A]">
              The engine of the ecosystem
            </span>
          </FlyIn>
          <FlyIn direction="right" delayClass={STEP[1]}>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.02em] text-[#f0f4f8] sm:text-5xl">
              One thing under everything you sell.
            </h2>
          </FlyIn>
          <FlyIn direction="right" delayClass={STEP[2]}>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#8b949e]">
              The CRM, the copilot, the websites, the client portals — every product
              in this ecosystem is the same engine wearing a different face. That is
              why adding the next one takes days instead of quarters.
            </p>
          </FlyIn>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {ENGINE.map(({ icon: Icon, t, d }, i) => (
              <FlyIn
                key={t}
                direction={i % 2 === 0 ? 'left' : 'right'}
                delayClass={STEP[i % STEP.length]}
                className="group rounded-2xl border border-[#30363d] bg-white/[0.02] p-7 transition-colors hover:border-[#6EE05A]/40"
              >
                <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-[#6EE05A]/10 transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5 text-[#6EE05A]" strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-[18px] font-bold text-[#f0f4f8]">{t}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#8b949e]">{d}</p>
              </FlyIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHITE LABEL ══ the thing they are buying ═════════════════════ */}
      <section className="relative border-b border-[#30363d] bg-white/[0.015] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FlyIn direction="in">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#00C2C7]">
              White-label AI for agencies
            </span>
          </FlyIn>
          <FlyIn direction="in" delayClass={STEP[1]}>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.02em] text-[#f0f4f8] sm:text-5xl">
              Your logo. Your pricing. Your client.
            </h2>
          </FlyIn>
          <FlyIn direction="in" delayClass={STEP[2]}>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#8b949e]">
              We do not sell to your clients, ever. You resell the whole stack as
              your own product and keep the relationship, the margin and the brand.
            </p>
          </FlyIn>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {WHITELABEL.map(({ icon: Icon, t, d }, i) => (
              <FlyIn
                key={t}
                direction={i % 2 === 0 ? 'tilt-right' : 'tilt-left'}
                delayClass={STEP[i % STEP.length]}
                className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-7"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-[#00C2C7]" strokeWidth={2} />
                  <h3 className="text-[18px] font-bold text-[#f0f4f8]">{t}</h3>
                </div>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#8b949e]">{d}</p>
              </FlyIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ THE RESCUE ══ what actually happens, numbered because it IS a
           sequence — the numbers are information, not decoration ═════════ */}
      <section className="relative border-b border-[#30363d] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FlyIn direction="up">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#6EE05A]">
              How a stalled build gets finished
            </span>
          </FlyIn>
          <FlyIn direction="up" delayClass={STEP[1]}>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.02em] text-[#f0f4f8] sm:text-5xl">
              Four steps, and the first one is free.
            </h2>
          </FlyIn>

          <ol className="mt-14 space-y-3">
            {RESCUE.map(({ n, t, d }, i) => (
              <FlyIn
                key={n}
                as="li"
                direction={i % 2 === 0 ? 'left' : 'right'}
                delayClass={STEP[i % STEP.length]}
                className="flex gap-6 rounded-2xl border border-[#30363d] bg-white/[0.02] p-7"
              >
                <span className="font-mono text-3xl font-black text-[#6EE05A]/35">{n}</span>
                <div>
                  <h3 className="text-[18px] font-bold text-[#f0f4f8]">{t}</h3>
                  <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-[#8b949e]">{d}</p>
                </div>
              </FlyIn>
            ))}
          </ol>
        </div>
      </section>

      {/* ══ US-BASED ══ specifics, because the last vendor said it too ═══ */}
      <section className="relative border-b border-[#30363d] bg-white/[0.015] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FlyIn direction="down">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#6EE05A]">
              <Flag className="h-3.5 w-3.5" /> A reliable US-based partner
            </span>
          </FlyIn>
          <FlyIn direction="down" delayClass={STEP[1]}>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.02em] text-[#f0f4f8] sm:text-5xl">
              You can call us, and a person answers.
            </h2>
          </FlyIn>
          <FlyIn direction="down" delayClass={STEP[2]}>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#8b949e]">
              Everyone claims this, so here are the specifics.
            </p>
          </FlyIn>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map(({ icon: Icon, t, d }, i) => (
              <FlyIn
                key={t}
                direction="up"
                delayClass={STEP[i % STEP.length]}
                className="rounded-2xl border border-[#30363d] bg-[#0d1117] p-6"
              >
                <Icon className="h-5 w-5 text-[#6EE05A]" strokeWidth={2} />
                <h3 className="mt-4 text-[15.5px] font-bold text-[#f0f4f8]">{t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#8b949e]">{d}</p>
              </FlyIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLOSE ══ */}
      <section className="relative overflow-hidden py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6EE05A]/[0.07] blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <FlyIn direction="in">
            <LifeBuoy className="mx-auto h-9 w-9 text-[#6EE05A]" strokeWidth={1.6} />
          </FlyIn>
          <FlyIn direction="up" delayClass={STEP[1]}>
            <h2 className="mt-7 text-4xl font-black leading-tight tracking-[-0.02em] text-[#f0f4f8] sm:text-5xl">
              Send us the half-built thing.
            </h2>
          </FlyIn>
          <FlyIn direction="up" delayClass={STEP[2]}>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#8b949e]">
              You will get an honest read on what you have and what is left — in
              order, with real dates. If the answer is that you should not build it,
              we will say that too.
            </p>
          </FlyIn>
          <FlyIn direction="up" delayClass={STEP[3]}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/partners"
                className="btn-green group inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold"
              >
                Book a US-based consult
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 rounded-full border border-[#30363d] px-8 py-4 text-[15px] font-semibold text-[#f0f4f8] transition-colors hover:border-[#6EE05A]/50 hover:text-[#6EE05A]"
              >
                <MessageSquare className="h-4 w-4" /> Free site audit first
              </Link>
            </div>
          </FlyIn>
        </div>
      </section>
    </main>
  )
}
