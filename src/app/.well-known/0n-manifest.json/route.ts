import { NextResponse } from 'next/server'
import { optimizeManifest } from '@/lib/linkedin/network/manifest-optimizer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /.well-known/0n-manifest.json
 * Machine-readable manifest of available LinkedIn tools.
 * Self-optimizes based on AI interaction data.
 */
export async function GET() {
  try {
    const manifest = await optimizeManifest()
    return NextResponse.json(manifest, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 min cache
        'Content-Type': 'application/json',
      },
    })
  } catch {
    // Fallback to base manifest
    const { buildManifest } = await import('@/lib/linkedin/network/manifest')
    return NextResponse.json(buildManifest())
  }
}
