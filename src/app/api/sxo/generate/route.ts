import { NextRequest, NextResponse } from 'next/server'
import { generateSxoPages, type SxoInput } from '@/lib/sxo-engine'
import { createSupabaseServer } from '@/lib/supabase/server'
import { checkBalance, deductSparks, build402Response, isOwner } from '@/lib/sparks'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/sxo/generate
 *
 * Free for unauthenticated users (lead gen).
 * Costs 10 Sparks for authenticated users (tracked usage).
 * Owner: always free.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.brand) {
      return NextResponse.json({ error: 'Missing required field: brand' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (user && !isOwner(user.email || '')) {
      const { allowed, balance, cost } = await checkBalance(user.id, 'api.sxo.generate', user.email || '')
      if (!allowed) {
        return NextResponse.json(build402Response(balance, cost, 'api.sxo.generate'), { status: 402 })
      }
    }

    const input: SxoInput = {
      brand: body.brand,
      industry: body.industry || 'business',
      services: body.services || [],
      locations: body.locations || [],
      cta: body.cta,
      domain: body.domain,
      logo: body.logo,
      primaryColor: body.primaryColor,
      tagline: body.tagline,
      phone: body.phone,
      email: body.email,
    }

    const output = generateSxoPages(input)

    if (user && !isOwner(user.email || '')) {
      try {
        await deductSparks(user.id, 'api.sxo.generate', `SXO generate: ${body.brand}`)
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json(output)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sxo/generate?brand=...&industry=...&services=...&locations=...
 *
 * Quick generation via query params.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const brand = p.get('brand')

  if (!brand) {
    return NextResponse.json({
      error: 'Missing required parameter: brand',
      cost: 'Free for guests, 10 Sparks for members',
      usage: {
        endpoint: '/api/sxo/generate',
        method: 'POST (recommended) or GET',
        body: {
          brand: 'Your Business Name (required)',
          industry: 'contractor | saas | agency | ecommerce | realestate',
          services: ['Service 1', 'Service 2'],
          locations: ['City 1', 'City 2'],
          domain: 'yourdomain.com',
          phone: '555-123-4567',
          email: 'info@yourdomain.com',
          cta: 'Contact us for a free estimate.',
          tagline: 'Your tagline here',
        },
      },
    }, { status: 400 })
  }

  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (user && !isOwner(user.email || '')) {
      const { allowed, balance, cost } = await checkBalance(user.id, 'api.sxo.generate', user.email || '')
      if (!allowed) {
        return NextResponse.json(build402Response(balance, cost, 'api.sxo.generate'), { status: 402 })
      }
    }

    const input: SxoInput = {
      brand,
      industry: p.get('industry') || 'business',
      services: (p.get('services') || '').split(',').map(s => s.trim()).filter(Boolean),
      locations: (p.get('locations') || '').split(',').map(s => s.trim()).filter(Boolean),
      cta: p.get('cta') || undefined,
      domain: p.get('domain') || undefined,
      phone: p.get('phone') || undefined,
      email: p.get('email') || undefined,
    }

    const output = generateSxoPages(input)

    if (user && !isOwner(user.email || '')) {
      try {
        await deductSparks(user.id, 'api.sxo.generate', `SXO generate: ${brand}`)
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json(output)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
