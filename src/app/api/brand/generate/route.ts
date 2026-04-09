import { NextResponse } from 'next/server'
import { runPipeline } from '@/lib/brand/pipeline'
import { stageExtract } from '@/lib/brand/stages/extract'
import { stageBrandVoice } from '@/lib/brand/stages/voice'
import { stageAssemble } from '@/lib/brand/stages/assemble'
import { stageSyncAndSave } from '@/lib/brand/stages/sync'
import type { BrandInput } from '@/types/brand'

export async function POST(req: Request) {
  let input: BrandInput

  try {
    input = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!input.sub_location_id) {
    return NextResponse.json({ error: 'sub_location_id required' }, { status: 400 })
  }

  if (!['url', 'logo', 'colors', 'random'].includes(input.mode)) {
    return NextResponse.json({ error: 'mode must be url | logo | colors | random' }, { status: 400 })
  }

  try {
    // Pipeline: Extract → Voice → Assemble
    // Note: Canva asset generation (generate + export stages) will be added
    // when Canva MCP integration is wired. For now, pipeline runs extract → voice → assemble.
    const { result, errors } = await runPipeline(
      [
        { name: 'extract', fn: stageExtract as (input: unknown) => Promise<unknown> },
        { name: 'voice', fn: stageBrandVoice as (input: unknown) => Promise<unknown> },
        { name: 'assemble', fn: stageAssemble as (input: unknown) => Promise<unknown> },
      ],
      input,
      input.sub_location_id
    )

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Pipeline failed', details: errors }, { status: 500 })
    }

    // Save + Sync CRM
    const assembled = (result as { assembled: unknown }).assembled
    const syncResult = await stageSyncAndSave(assembled as Parameters<typeof stageSyncAndSave>[0], input)

    return NextResponse.json({
      success: true,
      sub_location_id: input.sub_location_id,
      brand: assembled,
      crm_synced: syncResult.success,
      errors: syncResult.errors.length > 0 ? syncResult.errors : undefined,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
