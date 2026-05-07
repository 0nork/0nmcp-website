import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function generateReferralCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = '0n-'
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * GET /api/console/affiliate
 * Returns the user's referral link, code, and stats.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = /* TODO_GETUSER_MANUAL: review this call — getSession() preferred per Rule 10a */ await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get or create referral code from profile
  const { data: profile } = await admin
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  let referralCode = profile?.referral_code

  // Auto-generate if missing
  if (!referralCode) {
    referralCode = generateReferralCode()
    await admin
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('id', user.id)
  }

  // Fetch referral stats
  const { data: referrals } = await admin
    .from('affiliate_referrals')
    .select('id, referred_email, status, commission_cents, converted_at, created_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  const all = referrals || []
  const converted = all.filter(r => r.status === 'converted')
  const pending = all.filter(r => r.status === 'pending')
  const totalEarnings = all.reduce((sum, r) => sum + (r.commission_cents || 0), 0)

  return NextResponse.json({
    referralCode,
    referralLink: `https://0nmcp.com/signup?ref=${referralCode}`,
    stats: {
      totalReferrals: all.length,
      converted: converted.length,
      pending: pending.length,
      earningsCents: totalEarnings,
    },
    referrals: all.slice(0, 50),
  })
}

/**
 * POST /api/console/affiliate
 * Regenerate a referral code.
 */
export async function POST() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = /* TODO_GETUSER_MANUAL: review this call — getSession() preferred per Rule 10a */ await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const newCode = generateReferralCode()

  const { error } = await admin
    .from('profiles')
    .update({ referral_code: newCode })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to regenerate code' }, { status: 500 })
  }

  return NextResponse.json({
    referralCode: newCode,
    referralLink: `https://0nmcp.com/signup?ref=${newCode}`,
  })
}
