/**
 * GET /api/library/registry/category/[slug]
 *
 * Returns the slim items for one shadcn.io category. Supports ?type=,
 * ?premium=, ?limit=, ?offset= query params for client-side pagination.
 */
import { NextRequest, NextResponse } from 'next/server'
import { loadRegistry, shadcnPreviewUrl, typeLabel } from '@/lib/shadcn-registry'

export const revalidate = 21600

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params
  const sp = req.nextUrl.searchParams
  const type = sp.get('type') // e.g., "block", "example", "ui"
  const premium = sp.get('premium') // "true" | "false" | null
  const limit = Math.min(Number(sp.get('limit')) || 100, 500)
  const offset = Math.max(Number(sp.get('offset')) || 0, 0)

  try {
    const { items } = await loadRegistry()

    let filtered = items.filter((i) => i.category === slug)

    if (type) filtered = filtered.filter((i) => i.type === `registry:${type}`)
    if (premium === 'true') filtered = filtered.filter((i) => i.premium)
    else if (premium === 'false') filtered = filtered.filter((i) => !i.premium)

    const page = filtered.slice(offset, offset + limit).map((i) => ({
      name: i.name,
      title: i.title,
      description: i.description,
      premium: i.premium,
      typeLabel: typeLabel(i.type),
      previewUrl: shadcnPreviewUrl(i.name),
      installCommand: `npx shadcn@latest add https://www.shadcn.io/r/${i.name}.json`,
    }))

    return NextResponse.json({
      ok: true,
      slug,
      total: filtered.length,
      offset,
      limit,
      items: page,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ ok: false, error: msg }, { status: 502 })
  }
}
