/**
 * GET /api/library/registry/categories
 *
 * Returns the 56 shadcn.io block categories with item counts. Server-cached
 * for 6 hours. Used by the /library page to render category tiles.
 */
import { NextResponse } from 'next/server'
import { loadRegistry } from '@/lib/shadcn-registry'

export const revalidate = 21600

export async function GET() {
  try {
    const { categories, totals } = await loadRegistry()
    return NextResponse.json({ ok: true, totals, categories })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ ok: false, error: msg }, { status: 502 })
  }
}
