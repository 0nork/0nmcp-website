'use client'

import { type ReactNode } from 'react'
import {
  Activity,
  ArrowRight,
  Blocks,
  Brain,
  KeyRound,
  Link2,
  MessageSquare,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { STATS, STATS_DISPLAY } from '@/data/stats'

/**
 * The 0nMCP dashboard, rebuilt in web0n's visual language.
 *
 * WHY IT LOOKS DIFFERENT NOW: the old version was a dark grid of seven equally
 * weighted, differently coloured tiles. Seven equal choices is not a dashboard, it
 * is a menu — nothing tells you what matters, so every visit starts with a
 * decision instead of an answer.
 *
 * web0n solves that, and this copies its pattern:
 *   - Black chrome, LIGHT content. That contrast IS the layout, and 0nMCP's shell
 *     is already dark, so the content surface goes light to match.
 *   - ONE hero card for the thing that actually matters. In web0n it is your
 *     website; here it is whether 0nMCP is running and what it can reach.
 *   - Then "What would you like to do?" — calm, equal-weight cards, muted until
 *     hovered, rather than seven competing colours.
 *   - Plain-English copy. web0n says "Your website, in one calm place", not
 *     "Manage API keys".
 *
 * Tailwind only. The previous file was built from inline style objects, which
 * breaks the house rule and made every spacing value a one-off.
 *
 * Props are unchanged on purpose, so this drops into the 1,099-line console page
 * without touching it.
 */

interface DashboardViewProps {
  mcpOnline: boolean
  mcpHealth: {
    version?: string
    uptime?: number
    connections?: number
    services?: string[]
    mode?: string
    tools?: number
  } | null
  connectedCount: number
  flowCount: number
  historyCount: number
  messageCount: number
  connectedServices: string[]
  recentHistory: { id: string; type: string; detail: string; ts: number }[]
  onNavigate?: (view: string) => void
}

const ACTIONS: { key: string; title: string; body: string; icon: ReactNode }[] = [
  { key: 'chat', title: 'Ask it something', body: 'Describe what you want and it does the work.', icon: <MessageSquare className="h-5 w-5" /> },
  { key: 'flows', title: 'Build a flow', body: 'Chain steps together and let them run on their own.', icon: <Sparkles className="h-5 w-5" /> },
  { key: 'integrations', title: 'Connect an app', body: 'Slack, Google, your CRM — connect once, use everywhere.', icon: <Link2 className="h-5 w-5" /> },
  { key: 'credentials', title: 'Your vault', body: 'Every key you have stored, encrypted and in one place.', icon: <KeyRound className="h-5 w-5" /> },
  { key: 'builder', title: 'Visual builder', body: 'Lay something out without writing code.', icon: <Blocks className="h-5 w-5" /> },
  { key: 'store', title: 'Browse the store', body: 'Ready-made flows and add-ons you can drop in.', icon: <ShoppingBag className="h-5 w-5" /> },
  { key: 'training', title: 'Train the brain', body: 'Teach it how your business actually works.', icon: <Brain className="h-5 w-5" /> },
]

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function DashboardView({
  mcpOnline,
  mcpHealth,
  connectedCount,
  flowCount,
  historyCount,
  messageCount,
  connectedServices,
  recentHistory,
  onNavigate,
}: DashboardViewProps) {
  const tools = mcpHealth?.tools ?? STATS.tools ?? null
  const services = mcpHealth?.services?.length ?? null

  return (
    <div className="min-h-full bg-neutral-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="space-y-9">
          {/* ── Greeting ── */}
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Your command centre</h1>
            <p className="mt-1 text-neutral-500">
              Everything you have connected, in one calm place. Ask for an outcome and it does the work.
            </p>
          </div>

          {/* ── The one thing that matters: is it running, and what can it reach? ── */}
          <div className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-sm">
            <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${mcpOnline ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                    aria-hidden
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    0nMCP · {mcpOnline ? 'online' : 'offline'}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-semibold text-neutral-900">
                  {mcpOnline
                    ? connectedCount > 0
                      ? `${connectedCount} ${connectedCount === 1 ? 'app is' : 'apps are'} connected and ready`
                      : 'Running — nothing connected yet'
                    : 'Not reachable right now'}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {mcpOnline
                    ? connectedCount > 0
                      ? 'Anything you ask can use these. Connect more to widen what it can do.'
                      : 'Connect your first app and it can start doing real work for you.'
                    : 'Nothing is lost. It picks up where it left off once it is back.'}
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => onNavigate?.('chat')}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <MessageSquare className="h-4 w-4" /> Ask it something
                  </button>
                  <button
                    onClick={() => onNavigate?.('integrations')}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {connectedCount > 0 ? 'Connect another app' : 'Connect your first app'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Capability, stated plainly rather than as a wall of counters. */}
              <dl className="grid shrink-0 grid-cols-3 gap-4 sm:w-64">
                <Metric label="Apps" value={connectedCount} />
                <Metric label="Flows" value={flowCount} />
                <Metric label="Tools" value={tools ?? '—'} />
              </dl>
            </div>

            {(services || mcpHealth?.version || STATS_DISPLAY?.services) && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-neutral-200/70 bg-neutral-50/60 px-7 py-3 text-xs text-neutral-500">
                <span>{services ?? STATS_DISPLAY?.services} services reachable</span>
                {mcpHealth?.version ? <span>v{mcpHealth.version}</span> : null}
                {mcpHealth?.mode ? <span className="capitalize">{mcpHealth.mode} mode</span> : null}
              </div>
            )}
          </div>

          {/* ── Connected apps ── */}
          {connectedServices.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-neutral-500">Connected</p>
              <div className="flex flex-wrap gap-2">
                {connectedServices.slice(0, 18).map((s) => (
                  <button
                    key={s}
                    onClick={() => onNavigate?.('credentials')}
                    className="rounded-full border border-neutral-200/70 bg-white px-3.5 py-1.5 text-xs font-medium capitalize text-neutral-700 shadow-sm transition hover:border-neutral-300"
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
                {connectedServices.length > 18 && (
                  <span className="px-2 py-1.5 text-xs text-neutral-400">
                    +{connectedServices.length - 18} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── What would you like to do? ── */}
          <div>
            <p className="mb-3 text-sm font-medium text-neutral-500">What would you like to do?</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ACTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => onNavigate?.(a.key)}
                  className="group flex flex-col rounded-2xl border border-neutral-200/70 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-900 group-hover:text-white">
                    {a.icon}
                  </span>
                  <span className="mt-4 text-sm font-semibold text-neutral-900">{a.title}</span>
                  <span className="mt-1 text-xs leading-relaxed text-neutral-500">{a.body}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Recent activity ── */}
          <div>
            <p className="mb-3 text-sm font-medium text-neutral-500">Recent activity</p>
            {recentHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
                <Activity className="mx-auto h-5 w-5 text-neutral-300" />
                <p className="mt-3 text-sm text-neutral-500">Nothing has run yet.</p>
                <button
                  onClick={() => onNavigate?.('chat')}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 hover:underline"
                >
                  Ask it to do something <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200/70 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
                {recentHistory.slice(0, 8).map((h) => (
                  <div key={h.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium capitalize text-neutral-600">
                      {h.type}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">{h.detail}</span>
                    <span className="shrink-0 text-xs text-neutral-400">{timeAgo(h.ts)}</span>
                  </div>
                ))}
              </div>
            )}
            {(historyCount > 8 || messageCount > 0) && (
              <p className="mt-3 text-xs text-neutral-400">
                {historyCount} events recorded
                {messageCount > 0 ? ` · ${messageCount} messages this session` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-400">{label}</dt>
      <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-neutral-900">{value}</dd>
    </div>
  )
}
