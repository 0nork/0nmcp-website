/**
 * GET /r/[name].json
 *
 * Returns a single component schema in shadcn-CLI format. The `name`
 * segment includes the `.json` suffix because the shadcn CLI calls
 *   `https://0nmcp.com/r/0n-spotlight.json`
 * Next.js routes match the literal segment, so we strip `.json` here.
 */
import { NextResponse } from 'next/server'
import { getRegistryItem, toShadcnItemJson } from '@/lib/0n-registry'

export const dynamic = 'force-static'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name: raw } = await ctx.params
  const name = raw.endsWith('.json') ? raw.slice(0, -'.json'.length) : raw

  const item = getRegistryItem(name)
  if (!item) {
    return NextResponse.json(
      { error: `Component '${name}' not found in 0n registry` },
      { status: 404 },
    )
  }

  return NextResponse.json(toShadcnItemJson(item), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
