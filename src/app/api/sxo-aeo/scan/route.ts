/**
 * POST /api/sxo-aeo/scan — public scan + markdown markup pack.
 * Top-of-funnel for the citation engine. Free public scan with full
 * markdown download. No persistence — sxowebsite.com handles paid + history.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runCombinedScan } from '@/lib/sxo-aeo/engine'
import { generateMarkdownReport } from '@/lib/sxo-aeo/markdown'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string }
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })
    const result = await runCombinedScan(url)
    const markdown = generateMarkdownReport(result)
    return NextResponse.json({ ...result, markdown })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
