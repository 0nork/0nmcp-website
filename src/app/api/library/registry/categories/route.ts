/**
 * GET /api/library/registry/categories[?free=true]
 *
 * Returns shadcn.io block categories with item counts. Server-cached
 * for 6 hours. Used by the /library page to render category tiles.
 *
 * When ?free=true (default for the public library page), the response
 * is filtered to free items only — counts reflect free counts, and
 * any category that contains zero free items is omitted entirely.
 */
import { NextRequest, NextResponse } from 'next/server'
import { loadRegistry } from '@/lib/shadcn-registry'

export const revalidate = 21600

export async function GET(req: NextRequest) {
  const free = req.nextUrl.searchParams.get('free') !== 'false' // default true
  try {
    const { categories, totals } = await loadRegistry()
    if (!free) {
      return NextResponse.json({ ok: true, totals, categories })
    }
    const freeCategories = categories
      .filter((c) => c.freeCount > 0)
      .map((c) => ({
        slug: c.slug,
        label: c.label,
        count: c.freeCount,
        premiumCount: 0,
        freeCount: c.freeCount,
      }))
      .sort((a, b) => b.count - a.count)
    return NextResponse.json({
      ok: true,
      totals: {
        items: totals.free,
        free: totals.free,
        premium: 0,
        categories: freeCategories.length,
      },
      categories: freeCategories,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ ok: false, error: msg }, { status: 502 })
  }
}
