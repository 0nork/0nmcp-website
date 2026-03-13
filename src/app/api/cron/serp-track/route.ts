import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const ZENSERP_API_KEY = process.env.ZENSERP_API_KEY
const ZENSERP_BASE = 'https://app.zenserp.com/api/v2/search'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

interface ZenserpResult {
  position?: number
  title?: string
  url?: string
  destination?: string
  description?: string
}

interface ZenserpResponse {
  query?: { total_results?: number }
  organic?: ZenserpResult[]
  featured_snippet?: { title?: string; url?: string; description?: string }
  questions?: Array<{ question: string; answer?: string }>
  related_searches?: Array<{ query: string }>
}

/**
 * GET /api/cron/serp-track
 * Runs every other day via Vercel cron.
 * Queries Zenserp for each active keyword and stores position data.
 * Budget: 50 requests/month, ~15 keywords every 2 days = ~15 requests per run.
 */
export async function GET(request: Request) {
  // Verify cron secret or allow manual trigger from admin
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow Vercel cron (no auth needed for Vercel internal crons)
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron && !authHeader?.includes(process.env.SUPABASE_SERVICE_ROLE_KEY || '___')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!ZENSERP_API_KEY) {
    return NextResponse.json({ error: 'ZENSERP_API_KEY not configured' }, { status: 500 })
  }

  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  // Fetch active keywords, ordered by priority
  const { data: keywords } = await admin
    .from('serp_keywords')
    .select('keyword, category')
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .limit(15) // Stay within budget (50/month ÷ ~15 runs/month ≈ 3.3 per run, but we batch)

  if (!keywords?.length) {
    return NextResponse.json({ message: 'No active keywords', tracked: 0 })
  }

  const results: Array<{ keyword: string; position: number | null; url: string | null }> = []

  for (const kw of keywords) {
    try {
      const params = new URLSearchParams({
        q: kw.keyword,
        search_engine: 'google.com',
        gl: 'us',
        hl: 'en',
        num: '100',
        location: 'United States',
        device: 'desktop',
      })

      const res = await fetch(`${ZENSERP_BASE}?${params}`, {
        headers: { apikey: ZENSERP_API_KEY },
      })

      if (!res.ok) {
        console.error(`Zenserp error for "${kw.keyword}": ${res.status}`)
        continue
      }

      const data: ZenserpResponse = await res.json()
      const organicResults = data.organic || []

      // Find 0nmcp.com in results
      const match = organicResults.find(
        (r) => r.url?.includes('0nmcp.com') || r.destination?.includes('0nmcp.com')
      )

      const hasFeaturedSnippet = data.featured_snippet?.url?.includes('0nmcp.com') || false

      await admin.from('serp_tracking').insert({
        keyword: kw.keyword,
        position: match?.position ?? null,
        url: match?.url || match?.destination || null,
        title: match?.title || null,
        description: match?.description || null,
        search_engine: 'google.com',
        device: 'desktop',
        location: 'United States',
        total_results: data.query?.total_results || null,
        featured_snippet: hasFeaturedSnippet,
        people_also_ask: data.questions?.slice(0, 5) || null,
        related_searches: data.related_searches?.slice(0, 5) || null,
        raw_result: { organic_count: organicResults.length, top3: organicResults.slice(0, 3) },
      })

      results.push({
        keyword: kw.keyword,
        position: match?.position ?? null,
        url: match?.url || null,
      })

      // Small delay to be respectful
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`SERP track error for "${kw.keyword}":`, err)
    }
  }

  return NextResponse.json({
    message: `Tracked ${results.length} keywords`,
    tracked: results.length,
    results,
    timestamp: new Date().toISOString(),
  })
}
