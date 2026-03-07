import { NextRequest, NextResponse } from 'next/server'
import { auditWebsite } from '@/lib/sxo-auditor'
import { createSupabaseServer } from '@/lib/supabase/server'
import { checkBalance, deductSparks, build402Response, isOwner } from '@/lib/sparks'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/sxo/audit
 * Body: { url: "https://example.com" }
 *
 * Free for unauthenticated users (lead gen).
 * Costs 5 Sparks for authenticated users (tracked usage).
 * Owner: always free.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = body.url

    if (!url) {
      return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 })
    }

    // Check auth — if logged in, use Sparks; if not, allow free access
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (user && !isOwner(user.email || '')) {
      const { allowed, balance, cost } = await checkBalance(user.id, 'api.sxo.audit', user.email || '')
      if (!allowed) {
        return NextResponse.json(build402Response(balance, cost, 'api.sxo.audit'), { status: 402 })
      }
    }

    const result = await auditWebsite(url)

    // Deduct Sparks after success (authenticated non-owners only)
    if (user && !isOwner(user.email || '')) {
      try {
        await deductSparks(user.id, 'api.sxo.audit', `SXO audit: ${url}`)
      } catch {
        // Non-critical — don't fail the response
      }
    }

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
      cost: 'Free for guests, 5 Sparks for members',
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
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (user && !isOwner(user.email || '')) {
      const { allowed, balance, cost } = await checkBalance(user.id, 'api.sxo.audit', user.email || '')
      if (!allowed) {
        return NextResponse.json(build402Response(balance, cost, 'api.sxo.audit'), { status: 402 })
      }
    }

    const result = await auditWebsite(url)

    if (user && !isOwner(user.email || '')) {
      try {
        await deductSparks(user.id, 'api.sxo.audit', `SXO audit: ${url}`)
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audit failed' },
      { status: 500 }
    )
  }
}
