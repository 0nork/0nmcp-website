import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = getAdmin()

    // Get vendor profile
    const { data: vendor } = await admin
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) {
      return NextResponse.json({ vendor: null, status: 'not_vendor' })
    }

    // Get listing count
    const { count: listingCount } = await admin
      .from('store_listings')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .neq('status', 'archived')

    // Get recent transactions
    const { data: transactions } = await admin
      .from('marketplace_transactions')
      .select('id, listing_name, amount_cents, platform_fee_cents, vendor_payout_cents, status, created_at')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get payouts
    const { data: payouts } = await admin
      .from('marketplace_payouts')
      .select('id, amount_cents, currency, status, arrival_date, created_at')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      vendor,
      status: vendor.stripe_onboarding_complete ? 'active' : vendor.is_approved ? 'onboarding' : 'pending',
      listingCount: listingCount || 0,
      transactions: transactions || [],
      payouts: payouts || [],
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
