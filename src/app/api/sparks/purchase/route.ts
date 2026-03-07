import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createSparkCheckout, getPacks, isOwner } from '@/lib/sparks'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sparks/purchase?pack=starter
 *
 * Creates a Stripe Checkout session for purchasing Sparks.
 * Redirects to Stripe checkout page.
 */
export async function GET(req: NextRequest) {
  try {
    const packId = req.nextUrl.searchParams.get('pack')
    const returnUrl = req.nextUrl.searchParams.get('return') || `${req.nextUrl.origin}/console`

    if (!packId) {
      // Return available packs
      const packs = await getPacks()
      return NextResponse.json({
        packs: packs.map(p => ({
          id: p.id,
          name: p.name,
          sparks: p.sparks,
          price: `$${(p.price_cents / 100).toFixed(0)}`,
          bonus: p.bonus_pct > 0 ? `${p.bonus_pct}% bonus` : null,
          badge: p.badge,
          url: `/api/sparks/purchase?pack=${p.id}`,
        })),
        usage: '/api/sparks/purchase?pack=starter',
      })
    }

    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Login required to purchase Sparks' }, { status: 401 })
    }

    if (isOwner(user.email || '')) {
      return NextResponse.json({ message: 'Owner accounts have unlimited Sparks ⚡' })
    }

    const checkoutUrl = await createSparkCheckout(
      user.id,
      user.email || '',
      packId,
      returnUrl
    )

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    // If request accepts JSON, return URL. Otherwise redirect.
    const accept = req.headers.get('accept') || ''
    if (accept.includes('application/json')) {
      return NextResponse.json({ url: checkoutUrl })
    }

    return NextResponse.redirect(checkoutUrl)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Purchase failed' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sparks/purchase
 * Body: { pack: "starter" | "builder" | "pro" | "unlimited" }
 *
 * JSON API version of purchase — always returns checkout URL.
 */
export async function POST(req: NextRequest) {
  try {
    const { pack: packId } = await req.json()
    const returnUrl = `${req.nextUrl.origin}/console`

    if (!packId) {
      return NextResponse.json({ error: 'Missing required field: pack' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    if (isOwner(user.email || '')) {
      return NextResponse.json({ message: 'Owner accounts have unlimited Sparks ⚡' })
    }

    const url = await createSparkCheckout(user.id, user.email || '', packId, returnUrl)

    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Purchase failed' },
      { status: 500 }
    )
  }
}
