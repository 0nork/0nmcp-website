import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TrackingEvent {
  id: string
  page_url: string | null
  referrer: string | null
  event_type: string
  device: string | null
  browser: string | null
  session_id: string | null
  created_at: string
}

function getRangeDate(range: string): Date {
  const now = new Date()
  switch (range) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
}

function getChartBucketLabel(date: Date, range: string): string {
  if (range === '24h') {
    return date.toLocaleString('en-US', { hour: 'numeric', hour12: true })
  }
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' })
}

function buildChartData(
  events: TrackingEvent[],
  range: string,
  rangeStart: Date
): { label: string; value: number }[] {
  const buckets = new Map<string, number>()

  if (range === '24h') {
    for (let i = 0; i < 24; i++) {
      const d = new Date(rangeStart.getTime() + i * 60 * 60 * 1000)
      const label = getChartBucketLabel(d, range)
      buckets.set(label, 0)
    }
  } else {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    for (let i = 0; i < days; i++) {
      const d = new Date(rangeStart.getTime() + i * 24 * 60 * 60 * 1000)
      const label = getChartBucketLabel(d, range)
      buckets.set(label, 0)
    }
  }

  for (const event of events) {
    const d = new Date(event.created_at)
    const label = getChartBucketLabel(d, range)
    buckets.set(label, (buckets.get(label) || 0) + 1)
  }

  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }))
}

function aggregateTopItems(
  events: TrackingEvent[],
  key: 'page_url' | 'referrer',
  limit: number
): { url?: string; referrer?: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const event of events) {
    const val = event[key]
    if (val) {
      counts.set(val, (counts.get(val) || 0) + 1)
    }
  }

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  return sorted.map(([name, count]) => {
    if (key === 'page_url') return { url: name, count }
    return { referrer: name, count }
  })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('site_id')
    const range = searchParams.get('range') || '7d'

    if (!siteId) {
      return NextResponse.json({ error: 'Missing site_id' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const rangeStart = getRangeDate(range)

    const { data: events, error } = await supabase
      .from('tracking_events')
      .select('id, page_url, referrer, event_type, device, browser, session_id, created_at')
      .eq('site_id', siteId)
      .gte('created_at', rangeStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000)

    if (error) {
      console.error('Tracking query error:', error)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    const allEvents: TrackingEvent[] = events || []
    const totalVisits = allEvents.length
    const uniqueSessions = new Set(allEvents.map((e) => e.session_id).filter(Boolean))
    const uniqueVisitors = uniqueSessions.size || Math.ceil(totalVisits * 0.7)
    const pageViews = allEvents.filter((e) => e.event_type === 'pageview').length

    const topPages = aggregateTopItems(allEvents, 'page_url', 10)
    const topReferrers = aggregateTopItems(allEvents, 'referrer', 10)
    const chartData = buildChartData(allEvents, range, rangeStart)

    const recentEvents = allEvents.slice(0, 50).map((e) => ({
      id: e.id,
      page_url: e.page_url,
      referrer: e.referrer,
      event_type: e.event_type,
      device: e.device,
      browser: e.browser,
      created_at: e.created_at,
    }))

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      pageViews,
      topPages,
      topReferrers,
      chartData,
      recentEvents,
    })
  } catch (err) {
    console.error('Tracking aggregation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
