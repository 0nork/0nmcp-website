import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { generateAsset, type BuilderConfig } from '@/lib/marketing-builder'
import { checkBalance, deductRuns, isOwner } from '@/lib/runs'

const SPARK_ACTION = 'api.builder.generate'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { assetType, prompt, brandColors, companyName, logoUrl, style, includeCheckout, checkoutPrice, crmWebhook, sections } = body

    if (!assetType || !prompt) {
      return NextResponse.json({ error: 'assetType and prompt are required' }, { status: 400 })
    }

    const validTypes = ['landing_page', 'email', 'form', 'product_page']
    if (!validTypes.includes(assetType)) {
      return NextResponse.json({ error: `Invalid assetType. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    // Check Runs balance (owner is free)
    if (!isOwner(user.email || '')) {
      const balance = await checkBalance(user.id, SPARK_ACTION, user.email || '')
      if (!balance.allowed) {
        return NextResponse.json({
          error: 'insufficient_runs',
          message: `This action costs 10 Runs. You have ${balance.balance}.`,
          balance: balance.balance,
          cost: 10,
        }, { status: 402 })
      }
    }

    const config: BuilderConfig = {
      assetType,
      prompt,
      brandColors,
      companyName,
      logoUrl,
      style,
      includeCheckout,
      checkoutPrice,
      crmWebhook,
      sections,
    }

    const result = await generateAsset(config)

    // Deduct Runs
    if (!isOwner(user.email || '')) {
      await deductRuns(user.id, SPARK_ACTION, `Generated ${assetType}: ${result.title}`)
    }

    // Save to database
    const { data: asset, error } = await getAdmin()
      .from('builder_assets')
      .insert({
        user_id: user.id,
        asset_type: assetType,
        title: result.title,
        prompt,
        config: { brandColors, companyName, logoUrl, style, includeCheckout, checkoutPrice, crmWebhook, sections },
        html: result.html,
        metadata: result.metadata,
        status: 'draft',
      })
      .select('id, title, asset_type, status, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: `Failed to save asset: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      asset: { ...asset, html: result.html, metadata: result.metadata },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
