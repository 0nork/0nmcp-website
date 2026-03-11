import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { fetchSearchData } from '@/lib/cro9/search-console'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.0nmcp.com'
const INDEXNOW_KEY = '0nmcp-indexnow-2026-03'

/**
 * GET /api/console/seo — Fetch GSC analytics + indexing status
 *
 * Query params:
 *   days=7|28|90 (default 28)
 *   action=status (just return indexing config, no GSC call)
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Just return config/status
  if (action === 'status') {
    const hasGoogleCreds = !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    )

    return NextResponse.json({
      site: SITE_URL,
      indexnow_key: INDEXNOW_KEY,
      google_connected: hasGoogleCreds,
      engines: ['Google (GSC)', 'Bing', 'Yandex', 'Seznam', 'Naver'],
    })
  }

  // Fetch GSC analytics
  const days = parseInt(searchParams.get('days') || '28', 10)
  const validDays = [7, 28, 90].includes(days) ? days : 28

  try {
    const pages = await fetchSearchData(`${SITE_URL}/`, validDays)

    // Compute summary stats
    const totalClicks = pages.reduce((sum, p) => sum + p.clicks, 0)
    const totalImpressions = pages.reduce((sum, p) => sum + p.impressions, 0)
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
    const avgPosition = pages.length > 0
      ? pages.reduce((sum, p) => sum + p.position * p.impressions, 0) / totalImpressions
      : 0

    // Top pages (by clicks)
    const topPages = pages
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20)
      .map(p => ({
        url: p.url.replace(SITE_URL, ''),
        query: p.query,
        clicks: p.clicks,
        impressions: p.impressions,
        ctr: p.ctr,
        position: p.position,
      }))

    // Top queries (aggregate by query)
    const queryMap = new Map<string, { clicks: number; impressions: number; pages: number }>()
    for (const p of pages) {
      if (!p.query) continue
      const existing = queryMap.get(p.query)
      if (existing) {
        existing.clicks += p.clicks
        existing.impressions += p.impressions
        existing.pages++
      } else {
        queryMap.set(p.query, { clicks: p.clicks, impressions: p.impressions, pages: 1 })
      }
    }
    const topQueries = [...queryMap.entries()]
      .sort((a, b) => b[1].clicks - a[1].clicks)
      .slice(0, 20)
      .map(([query, data]) => ({
        query,
        clicks: data.clicks,
        impressions: data.impressions,
        pages: data.pages,
      }))

    return NextResponse.json({
      summary: {
        totalClicks,
        totalImpressions,
        avgCtr: Math.round(avgCtr * 10000) / 100,
        avgPosition: Math.round(avgPosition * 100) / 100,
        totalPages: pages.length,
        period: `${validDays}d`,
      },
      topPages,
      topQueries,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch GSC data',
      detail: String(error),
      summary: null,
      topPages: [],
      topQueries: [],
    }, { status: 200 }) // Return 200 so frontend can show the error gracefully
  }
}

/**
 * POST /api/console/seo — Submit URLs for indexing
 *
 * Body:
 *   action: 'submit_all' | 'indexnow' | 'ping_sitemap'
 *   urls?: string[] (for indexnow action)
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, urls } = body

  const results: Record<string, { status: string; response?: string; error?: string }> = {}

  if (action === 'ping_sitemap' || action === 'submit_all') {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`

    // Google Search Console — submit sitemap via API
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

      if (clientId && clientSecret && refreshToken) {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId, client_secret: clientSecret,
            refresh_token: refreshToken, grant_type: 'refresh_token',
          }),
        })
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          const encodedSite = encodeURIComponent(`${SITE_URL}/`)
          const encodedSitemap = encodeURIComponent(sitemapUrl)
          const gscRes = await fetch(
            `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`,
            { method: 'PUT', headers: { Authorization: `Bearer ${tokenData.access_token}` } }
          )
          results.google_gsc = {
            status: gscRes.ok || gscRes.status === 204 ? 'success' : 'failed',
            response: `${gscRes.status} ${gscRes.statusText}`,
          }
        } else {
          results.google_gsc = { status: 'error', error: 'Token refresh failed' }
        }
      } else {
        results.google_gsc = { status: 'skipped', response: 'No Google credentials' }
      }
    } catch (e) {
      results.google_gsc = { status: 'error', error: String(e) }
    }

    // Bing sitemap ping
    try {
      const bingRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
      results.bing_ping = { status: bingRes.ok ? 'success' : 'failed', response: `${bingRes.status} ${bingRes.statusText}` }
    } catch (e) {
      results.bing_ping = { status: 'error', error: String(e) }
    }
  }

  if (action === 'indexnow' || action === 'submit_all') {
    let urlList: string[] = urls || []

    if (!urlList.length || action === 'submit_all') {
      urlList = [
        SITE_URL,
        `${SITE_URL}/turn-it-on`,
        `${SITE_URL}/integrations`,
        `${SITE_URL}/compare`,
        `${SITE_URL}/glossary`,
        `${SITE_URL}/forum`,
        `${SITE_URL}/community`,
        `${SITE_URL}/builder`,
        `${SITE_URL}/store/onork-mini`,
        `${SITE_URL}/blog`,
        `${SITE_URL}/learn`,
        `${SITE_URL}/install/skill`,
        `${SITE_URL}/security`,
        `${SITE_URL}/marketplace`,
        `${SITE_URL}/0n-standard`,
        `${SITE_URL}/convert`,
        `${SITE_URL}/downloads`,
        `${SITE_URL}/products/social0n`,
        `${SITE_URL}/products/app0n`,
        `${SITE_URL}/products/web0n`,
        `${SITE_URL}/products/cro9`,
        `${SITE_URL}/connect`,
        `${SITE_URL}/partners`,
        `${SITE_URL}/sponsor`,
      ]
    }

    const indexNowPayload = {
      host: 'www.0nmcp.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urlList.slice(0, 10000),
    }

    const engines = [
      { name: 'bing_indexnow', url: 'https://www.bing.com/indexnow' },
      { name: 'yandex_indexnow', url: 'https://yandex.com/indexnow' },
      { name: 'seznam_indexnow', url: 'https://search.seznam.cz/indexnow' },
      { name: 'naver_indexnow', url: 'https://searchadvisor.naver.com/indexnow' },
    ]

    await Promise.allSettled(engines.map(async (engine) => {
      try {
        const res = await fetch(engine.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(indexNowPayload),
        })
        results[engine.name] = {
          status: res.ok || res.status === 202 ? 'success' : 'failed',
          response: `${res.status} ${res.statusText}`,
        }
      } catch (e) {
        results[engine.name] = { status: 'error', error: String(e) }
      }
    }))

    results.urls_submitted = { status: 'info', response: `${urlList.length} URLs submitted` }
  }

  return NextResponse.json({ ok: true, results })
}
