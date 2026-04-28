/**
 * GET /r/registry.json
 *
 * Master index of every 0n component in the Programmatic Website Design
 * Components registry. shadcn-CLI compatible.
 *
 * Public consumers fetch this to discover what's available.
 */
import { NextResponse } from 'next/server'
import { toShadcnRegistryJson } from '@/lib/0n-registry'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(toShadcnRegistryJson(), {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
