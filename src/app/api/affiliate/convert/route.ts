import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/affiliate/convert
 * Called internally when a referred user makes a payment (from Stripe webhook).
 * Creates commission record and updates referrer's earnings.
 *
 * Body: { referredUserId, paymentAmountCents, stripeInvoiceId, stripeSubscriptionId }
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { referredUserId, paymentAmountCents, stripeInvoiceId, stripeSubscriptionId } = await req.json()
    if (!referredUserId || !paymentAmountCents) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const db = admin()

    // Find the referral record for this user
    const { data: referral } = await db
      .from('affiliate_referrals')
      .select('id, referrer_id, referral_code')
      .eq('referred_user_id', referredUserId)
      .single()

    if (!referral) {
      return NextResponse.json({ ok: true, message: 'No referral found — not an affiliate conversion' })
    }

    // Get referrer's commission rate (default 30%)
    const { data: referrer } = await db
      .from('profiles')
      .select('affiliate_tier')
      .eq('id', referral.referrer_id)
      .single()

    const COMMISSION_RATES: Record<string, number> = {
      standard: 0.30,
      silver: 0.30,
      gold: 0.35,
      platinum: 0.40,
    }
    const rate = COMMISSION_RATES[referrer?.affiliate_tier || 'standard'] || 0.30
    const commissionCents = Math.round(paymentAmountCents * rate)

    // Check for duplicate (same invoice)
    if (stripeInvoiceId) {
      const { data: existing } = await db
        .from('affiliate_commissions')
        .select('id')
        .eq('stripe_invoice_id', stripeInvoiceId)
        .single()
      if (existing) {
        return NextResponse.json({ ok: true, message: 'Commission already recorded for this invoice' })
      }
    }

    // Create commission record
    await db.from('affiliate_commissions').insert({
      referrer_id: referral.referrer_id,
      referred_user_id: referredUserId,
      referral_id: referral.id,
      stripe_invoice_id: stripeInvoiceId || null,
      stripe_subscription_id: stripeSubscriptionId || null,
      payment_amount_cents: paymentAmountCents,
      commission_rate: rate,
      commission_cents: commissionCents,
      status: 'pending',
    })

    // Update referral status if first conversion
    await db
      .from('affiliate_referrals')
      .update({ status: 'converted', converted_at: new Date().toISOString(), commission_cents: commissionCents })
      .eq('id', referral.id)
      .eq('status', 'pending')

    // Update referrer's running totals
    const { data: referrerProfile } = await db
      .from('profiles')
      .select('total_commission_cents, pending_commission_cents')
      .eq('id', referral.referrer_id)
      .single()

    if (referrerProfile) {
      await db.from('profiles').update({
        total_commission_cents: (referrerProfile.total_commission_cents || 0) + commissionCents,
        pending_commission_cents: (referrerProfile.pending_commission_cents || 0) + commissionCents,
      }).eq('id', referral.referrer_id)
    }

    return NextResponse.json({
      ok: true,
      commission: {
        referrerId: referral.referrer_id,
        rate,
        commissionCents,
        paymentAmountCents,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
