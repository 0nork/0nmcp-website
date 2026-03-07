import { NextRequest, NextResponse } from 'next/server'
import { auditWebsite } from '@/lib/sxo-auditor'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/sxo/audit
 * Body: { url: "https://example.com" }
 *
 * GET /api/sxo/audit?url=https://example.com
 *
 * Runs the SXO website auditor against a URL. Returns score, grade,
 * category breakdown, and prioritized recommendations.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = body.url

    if (!url) {
      return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 })
    }

    const result = await auditWebsite(url)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({
      error: 'Missing required parameter: url',
      usage: {
        GET: '/api/sxo/audit?url=https://example.com',
        POST: { url: 'https://example.com' },
      },
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

  try {
    const result = await auditWebsite(url)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit failed' },
      { status: 500 }
    )
  }
}
