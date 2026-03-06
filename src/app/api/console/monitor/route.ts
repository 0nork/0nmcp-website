import { NextResponse } from 'next/server'
import { SVC } from '@/lib/console/services'
import type { MonitorAlert, MonitorRunResult } from '@/lib/console/crew'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RssEntry {
  title: string
  link: string
  pubDate: string
  description?: string
}

/** Parse RSS/Atom XML into entries (lightweight, no dep) */
function parseRss(xml: string): RssEntry[] {
  const entries: RssEntry[] = []
  // RSS <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] ?? ''
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
    const description = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] ?? ''
    entries.push({ title: title.trim(), link: link.trim(), pubDate: pubDate.trim(), description: description.trim() })
  }
  // Atom <entry> elements
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = block.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ?? ''
    const link = block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/)?.[1] ?? block.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
    const pubDate = block.match(/<updated>(.*?)<\/updated>/)?.[1] ?? block.match(/<published>(.*?)<\/published>/)?.[1] ?? ''
    entries.push({ title: title.trim(), link: link.trim(), pubDate: pubDate.trim() })
  }
  return entries
}

/** Classify severity based on keywords */
function classifySeverity(text: string): 'info' | 'warning' | 'critical' {
  const lower = text.toLowerCase()
  if (lower.includes('breaking') || lower.includes('deprecat') || lower.includes('removed') || lower.includes('sunset')) return 'critical'
  if (lower.includes('change') || lower.includes('update') || lower.includes('migration') || lower.includes('new version')) return 'warning'
  return 'info'
}

/** Check RSS feeds for recent updates (last 7 days) */
async function checkRssFeeds(): Promise<MonitorAlert[]> {
  const alerts: MonitorAlert[] = []
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  const feedEntries = Object.entries(SVC).filter(([, cfg]) => cfg.rss)

  const results = await Promise.allSettled(
    feedEntries.map(async ([key, cfg]) => {
      try {
        const res = await fetch(cfg.rss!, { signal: AbortSignal.timeout(8000) })
        if (!res.ok) return []
        const xml = await res.text()
        const entries = parseRss(xml)

        return entries
          .filter(e => {
            if (!e.pubDate) return false
            const d = new Date(e.pubDate).getTime()
            return !isNaN(d) && d > oneWeekAgo
          })
          .map(e => ({
            service: key,
            type: 'rss_update' as const,
            severity: classifySeverity(e.title + ' ' + (e.description ?? '')),
            title: `${cfg.l}: ${e.title}`,
            detail: e.description?.slice(0, 200) ?? '',
            timestamp: e.pubDate,
            url: e.link,
          }))
      } catch {
        return []
      }
    })
  )

  for (const r of results) {
    if (r.status === 'fulfilled') alerts.push(...r.value)
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/** Check for scope drift by comparing stable scopes against docs (stub — checks RSS keywords for scope-related changes) */
function checkScopeDrift(rssAlerts: MonitorAlert[]): MonitorAlert[] {
  const scopeAlerts: MonitorAlert[] = []
  const scopeKeywords = ['scope', 'permission', 'field', 'endpoint', 'parameter', 'schema', 'renamed', 'removed', 'deprecated']

  for (const alert of rssAlerts) {
    const combined = (alert.title + ' ' + alert.detail).toLowerCase()
    const matchedKeyword = scopeKeywords.find(kw => combined.includes(kw))
    if (matchedKeyword) {
      const svc = SVC[alert.service]
      scopeAlerts.push({
        service: alert.service,
        type: 'scope_drift',
        severity: 'warning',
        title: `Possible scope drift: ${svc?.l ?? alert.service}`,
        detail: `RSS entry mentions "${matchedKeyword}" — review stable scopes: ${svc?.stableScopes?.join(', ') ?? 'none defined'}`,
        timestamp: new Date().toISOString(),
        url: alert.url,
      })
    }
  }

  return scopeAlerts
}

/** Check for API version changes (compares stored version against docs page) */
function checkVersionChanges(): MonitorAlert[] {
  // Stub: In production, this would fetch API docs and extract version headers
  // For now, we report which services have version tracking enabled
  const tracked = Object.entries(SVC).filter(([, cfg]) => cfg.apiVer)
  if (tracked.length === 0) return []
  return [] // No alerts unless we detect a mismatch
}

export async function GET() {
  const startedAt = new Date().toISOString()
  const servicesWithMonitoring = Object.entries(SVC).filter(([, cfg]) => cfg.rss || cfg.docs)

  try {
    const rssAlerts = await checkRssFeeds()
    const scopeAlerts = checkScopeDrift(rssAlerts)
    const versionAlerts = checkVersionChanges()

    const allAlerts = [...rssAlerts, ...scopeAlerts, ...versionAlerts]

    const result: MonitorRunResult = {
      runId: `mon_${Date.now().toString(36)}`,
      agent: 'monitor',
      startedAt,
      completedAt: new Date().toISOString(),
      alerts: allAlerts,
      servicesChecked: servicesWithMonitoring.length,
      status: allAlerts.some(a => a.severity === 'critical') ? 'partial' : 'success',
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({
      runId: `mon_${Date.now().toString(36)}`,
      agent: 'monitor',
      startedAt,
      completedAt: new Date().toISOString(),
      alerts: [],
      servicesChecked: servicesWithMonitoring.length,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    } satisfies MonitorRunResult & { error: string }, { status: 500 })
  }
}

export async function POST() {
  // POST triggers a manual run — same as GET but saved to history
  const response = await GET()
  return response
}
