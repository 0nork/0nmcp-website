import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.0nmcp.com'
const INDEXNOW_KEY = '0nmcp-indexnow-2026-03'

/**
 * GET /api/admin/indexing — Get indexing status and available actions
 */
export async function GET() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`

  return NextResponse.json({
    site: SITE_URL,
    sitemap: sitemapUrl,
    indexnow_key: INDEXNOW_KEY,
    engines: {
      google: { ping: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, status: 'available' },
      bing: { ping: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, indexnow: true, status: 'available' },
      yandex: { indexnow: true, status: 'available' },
      seznam: { indexnow: true, status: 'available' },
      naver: { indexnow: true, status: 'available' },
    },
  })
}

/**
 * POST /api/admin/indexing — Submit URLs to search engines
 *
 * Actions:
 * - ping_sitemap: Ping Google + Bing with sitemap URL
 * - indexnow: Submit specific URLs via IndexNow (Bing, Yandex, Seznam, Naver)
 * - submit_all: Ping sitemap + IndexNow for top pages
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, urls } = body

  const results: Record<string, { status: string; response?: string; error?: string }> = {}

  if (action === 'ping_sitemap' || action === 'submit_all') {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`

    // Google sitemap ping
    try {
      const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`)
      results.google_ping = { status: googleRes.ok ? 'success' : 'failed', response: `${googleRes.status} ${googleRes.statusText}` }
    } catch (e) {
      results.google_ping = { status: 'error', error: String(e) }
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
    // Determine URLs to submit
    let urlList: string[] = urls || []

    if (!urlList.length || action === 'submit_all') {
      // Default: submit high-priority pages
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

    // IndexNow to Bing (covers Bing, Yandex, Seznam, Naver)
    const indexNowPayload = {
      host: 'www.0nmcp.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urlList.slice(0, 10000), // IndexNow max 10k per request
    }

    // Submit to Bing IndexNow
    try {
      const bingRes = await fetch('https://www.bing.com/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      })
      results.bing_indexnow = {
        status: bingRes.ok || bingRes.status === 202 ? 'success' : 'failed',
        response: `${bingRes.status} ${bingRes.statusText}`,
      }
    } catch (e) {
      results.bing_indexnow = { status: 'error', error: String(e) }
    }

    // Submit to Yandex IndexNow
    try {
      const yandexRes = await fetch('https://yandex.com/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      })
      results.yandex_indexnow = {
        status: yandexRes.ok || yandexRes.status === 202 ? 'success' : 'failed',
        response: `${yandexRes.status} ${yandexRes.statusText}`,
      }
    } catch (e) {
      results.yandex_indexnow = { status: 'error', error: String(e) }
    }

    // Submit to Seznam IndexNow
    try {
      const seznamRes = await fetch('https://search.seznam.cz/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      })
      results.seznam_indexnow = {
        status: seznamRes.ok || seznamRes.status === 202 ? 'success' : 'failed',
        response: `${seznamRes.status} ${seznamRes.statusText}`,
      }
    } catch (e) {
      results.seznam_indexnow = { status: 'error', error: String(e) }
    }

    // Submit to Naver IndexNow
    try {
      const naverRes = await fetch('https://searchadvisor.naver.com/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      })
      results.naver_indexnow = {
        status: naverRes.ok || naverRes.status === 202 ? 'success' : 'failed',
        response: `${naverRes.status} ${naverRes.statusText}`,
      }
    } catch (e) {
      results.naver_indexnow = { status: 'error', error: String(e) }
    }

    results.urls_submitted = { status: 'info', response: `${urlList.length} URLs submitted` }
  }

  return NextResponse.json({ ok: true, results })
}
