import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import {
  createConnectedAccount,
  createOnboardingLink,
  getVendorProfile,
} from '@/lib/stripe-connect'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/vendor/onboarding
 * Return current vendor onboarding status
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vendor = await getVendorProfile(user.id)

  return NextResponse.json({
    hasVendorProfile: !!vendor,
    isApproved: vendor?.is_approved || false,
    stripeOnboardingComplete: vendor?.stripe_onboarding_complete || false,
    chargesEnabled: vendor?.charges_enabled || false,
    payoutsEnabled: vendor?.payouts_enabled || false,
    businessName: vendor?.business_name || null,
    vendorTier: vendor?.vendor_tier || 'standard',
  })
}

/**
 * POST /api/vendor/onboarding
 * Actions: "init" (create Connect account + get link) or "refresh" (get new link)
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { action?: string; businessName?: string; businessType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { action } = body
  const baseUrl = 'https://www.0nmcp.com'
  const returnUrl = `${baseUrl}/console?view=vendor&onboarding=complete`
  const refreshUrl = `${baseUrl}/console?view=vendor&onboarding=refresh`

  if (action === 'init') {
    const businessName = body.businessName || ''
    const businessType = body.businessType || 'individual'

    if (!businessName.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    try {
      // Check if they already have a vendor profile with a Stripe account
      const existing = await getVendorProfile(user.id)

      if (existing?.stripe_account_id) {
        // Already have an account, just generate a new onboarding link
        const url = await createOnboardingLink(existing.stripe_account_id, returnUrl, refreshUrl)
        return NextResponse.json({ url, accountId: existing.stripe_account_id })
      }

      // Create new Connect account
      const { accountId } = await createConnectedAccount(
        user.id,
        user.email || '',
        businessName,
      )

      // Update business type
      await getSupabaseAdmin().from('vendor_profiles').update({
        business_type: businessType,
        application_fee_percent: 15,
      }).eq('user_id', user.id)

      // Generate onboarding link
      const url = await createOnboardingLink(accountId, returnUrl, refreshUrl)

      return NextResponse.json({ url, accountId })
    } catch (err) {
      console.error('Vendor onboarding init error:', err)
      return NextResponse.json({ error: 'Failed to create seller account' }, { status: 500 })
    }
  }

  if (action === 'refresh') {
    try {
      const vendor = await getVendorProfile(user.id)
      if (!vendor?.stripe_account_id) {
        return NextResponse.json({ error: 'No Stripe account found. Please start onboarding first.' }, { status: 400 })
      }

      const url = await createOnboardingLink(vendor.stripe_account_id, returnUrl, refreshUrl)
      return NextResponse.json({ url })
    } catch (err) {
      console.error('Vendor onboarding refresh error:', err)
      return NextResponse.json({ error: 'Failed to get onboarding link' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action. Use "init" or "refresh".' }, { status: 400 })
}
