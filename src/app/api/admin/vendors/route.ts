import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createConnectedAccount, createOnboardingLink } from '@/lib/stripe-connect'

const ADMIN_EMAIL = 'mike@rocketopp.com'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** GET — List all vendor applications */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // pending, approved, rejected

    const admin = getAdmin()

    let query = admin
      .from('vendor_profiles')
      .select('*, user:profiles!vendor_profiles_user_id_fkey(email, full_name, avatar_url)')
      .order('applied_at', { ascending: false })

    if (status === 'pending') {
      query = query.eq('is_approved', false).is('approved_at', null)
    } else if (status === 'approved') {
      query = query.eq('is_approved', true)
    } else if (status === 'rejected') {
      query = query.eq('is_approved', false).not('approved_at', 'is', null)
    }

    const { data: vendors, error } = await query

    if (error) {
      // Fallback without join
      const { data: fallback } = await admin
        .from('vendor_profiles')
        .select('*')
        .order('applied_at', { ascending: false })

      return NextResponse.json({ vendors: fallback || [] })
    }

    // Platform stats
    const { count: totalVendors } = await admin
      .from('vendor_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_approved', true)

    const { data: revenueData } = await admin
      .from('marketplace_transactions')
      .select('amount_cents, platform_fee_cents')
      .eq('status', 'completed')

    const totalGMV = revenueData?.reduce((sum, t) => sum + t.amount_cents, 0) || 0
    const totalFees = revenueData?.reduce((sum, t) => sum + t.platform_fee_cents, 0) || 0

    return NextResponse.json({
      vendors: vendors || [],
      stats: {
        totalVendors: totalVendors || 0,
        totalGMV,
        totalFees,
        totalTransactions: revenueData?.length || 0,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

/** POST — Approve or reject a vendor */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { vendorId, action } = body

    if (!vendorId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'vendorId and action (approve/reject) required' }, { status: 400 })
    }

    const admin = getAdmin()

    // Get vendor + user info
    const { data: vendor } = await admin
      .from('vendor_profiles')
      .select('user_id, business_name, country')
      .eq('id', vendorId)
      .single()

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    if (action === 'reject') {
      await admin.from('vendor_profiles').update({
        is_approved: false,
        approved_at: new Date().toISOString(),
      }).eq('id', vendorId)

      await admin.from('profiles').update({
        vendor_status: 'rejected',
      }).eq('id', vendor.user_id)

      return NextResponse.json({ status: 'rejected' })
    }

    // Approve: get email and create Stripe Connected Account
    const { data: profile } = await admin
      .from('profiles')
      .select('email')
      .eq('id', vendor.user_id)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    const { accountId } = await createConnectedAccount(
      vendor.user_id,
      profile.email,
      vendor.business_name || undefined,
      vendor.country || 'US'
    )

    // Generate onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'
    const onboardingUrl = await createOnboardingLink(
      accountId,
      `${baseUrl}/console?view=vendor&vendor=onboarded`,
      `${baseUrl}/console?view=vendor&vendor=refresh`
    )

    return NextResponse.json({
      status: 'approved',
      accountId,
      onboardingUrl,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to process vendor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
