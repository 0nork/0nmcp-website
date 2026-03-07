import { NextRequest, NextResponse } from 'next/server'
import { auditWebsite } from '@/lib/sxo-auditor'
import { withSparks } from '@/lib/sparks-guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/sxo/audit
 * Body: { url: "https://example.com" }
 *
 * Costs: 5 Sparks ⚡
 *
 * Runs the SXO website auditor against a URL. Returns score, grade,
 * category breakdown, and prioritized recommendations.
 */
export const POST = withSparks('api.sxo.audit', async (req) => {
  const body = await req.json()
  const url = body.url

  if (!url) {
    return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 })
  }

  const result = await auditWebsite(url)
  return NextResponse.json(result)
})

/**
 * GET /api/sxo/audit?url=https://example.com
 *
 * Costs: 5 Sparks ⚡
 */
export const GET = withSparks('api.sxo.audit', async (req) => {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({
      error: 'Missing required parameter: url',
      usage: {
        GET: '/api/sxo/audit?url=https://example.com',
        POST: { url: 'https://example.com' },
      },
      cost: '5 Sparks ⚡ per audit',
      scoring: {
        categories: [
          'Technical SEO (20 pts) — title, meta, headings, canonical, viewport',
          'Content Quality (20 pts) — word count, structure, images, links',
          'Schema Markup (15 pts) — JSON-LD presence, business schema',
          'SXO Formula (25 pts) — entity, services, problem/solution, CTA, location',
          'Authority (10 pts) — trust signals, social proof',
          'Performance (10 pts) — page size, script count',
        ],
        grades: 'A+ (90+) → F (below 35)',
      },
    }, { status: 400 })
  }

  const result = await auditWebsite(url)
  return NextResponse.json(result)
})
