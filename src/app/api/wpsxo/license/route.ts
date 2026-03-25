import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwujhhmlrtxjmjzyttwn.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * POST /api/wpsxo/license — Validate + activate a license key
 * Called by the WP-SXO plugin on activation
 */
export async function POST(req: NextRequest) {
  try {
    const { action, key, domain } = await req.json()

    if (action === 'validate' || action === 'activate') {
      if (!key) return NextResponse.json({ valid: false, error: 'Key required' }, { status: 400 })

      const { data: license } = await supabase
        .from('wpsxo_licenses')
        .select('*')
        .eq('key', key.toUpperCase())
        .single()

      if (!license) return NextResponse.json({ valid: false, error: 'Invalid license key' })

      if (license.status !== 'active') {
        return NextResponse.json({ valid: false, error: `License is ${license.status}`, tier: license.tier })
      }

      // Check expiry
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        await supabase.from('wpsxo_licenses').update({ status: 'expired' }).eq('id', license.id)
        return NextResponse.json({ valid: false, error: 'License expired', tier: license.tier })
      }

      // Activate on domain
      if (action === 'activate' && domain) {
        await supabase.from('wpsxo_licenses').update({
          domain,
          activated_at: license.activated_at || new Date().toISOString(),
          downloads: (license.downloads || 0) + 1,
        }).eq('id', license.id)
      }

      return NextResponse.json({
        valid: true,
        tier: license.tier,
        status: license.status,
        domain: license.domain,
        expires_at: license.expires_at,
        features: getTierFeatures(license.tier),
      })
    }

    if (action === 'deactivate') {
      if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })
      await supabase.from('wpsxo_licenses').update({ domain: null }).eq('key', key.toUpperCase())
      return NextResponse.json({ deactivated: true })
    }

    // Lookup by email
    if (action === 'lookup') {
      const { email } = await req.json()
      const { data: licenses } = await supabase
        .from('wpsxo_licenses')
        .select('key, tier, status, domain, created_at')
        .eq('email', email)
      return NextResponse.json({ licenses: licenses || [] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function getTierFeatures(tier: string) {
  switch (tier) {
    case 'free': return {
      sxo_scoring: true,
      score_details: false,
      recommendations: false,
      ai_generation: false,
      cro9: false,
      api_access: false,
      generations_per_month: 3,
    }
    case 'pro': return {
      sxo_scoring: true,
      score_details: true,
      recommendations: true,
      ai_generation: false,
      cro9: true,
      api_access: true,
      generations_per_month: 0,
    }
    case 'max': return {
      sxo_scoring: true,
      score_details: true,
      recommendations: true,
      ai_generation: true,
      cro9: true,
      api_access: true,
      generations_per_month: -1, // unlimited
    }
    default: return { sxo_scoring: true }
  }
}
