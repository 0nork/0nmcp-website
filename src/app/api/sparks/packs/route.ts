import { NextResponse } from 'next/server'
import { getPacks } from '@/lib/sparks'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sparks/packs
 *
 * Returns all active Spark packs with pricing.
 * Public endpoint — no auth required.
 */
export async function GET() {
  try {
    const packs = await getPacks()

    return NextResponse.json({
      packs: packs.map(p => ({
        id: p.id,
        name: p.name,
        sparks: p.sparks,
        price: `$${(p.price_cents / 100).toFixed(0)}`,
        price_cents: p.price_cents,
        bonus: p.bonus_pct > 0 ? `${p.bonus_pct}% bonus` : null,
        badge: p.badge,
        purchase_url: `/api/sparks/purchase?pack=${p.id}`,
      })),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch packs' },
      { status: 500 }
    )
  }
}
