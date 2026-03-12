import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'

const DEPOSIT_AMOUNT = 998.50

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const db = createSupabaseAdmin() || supabase
  if (!db) {
    return NextResponse.json({ valid: false, error: 'Service unavailable' }, { status: 500 })
  }

  try {
    const { code, email } = await request.json()
    if (!code) {
      return NextResponse.json({ valid: false })
    }

    const { data: coupon } = await db
      .from('web0n_coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .single()

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' })
    }

    if (coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'This coupon has already been redeemed' })
    }

    if (coupon.restrict_to_email && email && coupon.restrict_to_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ valid: false, error: 'This coupon is not valid for your email' })
    }

    const discountPercent = coupon.discount_type === 'full' ? 100 : Number(coupon.discount_value)
    const discountAmount = Math.round(DEPOSIT_AMOUNT * (discountPercent / 100) * 100) / 100
    const depositDue = Math.max(0, DEPOSIT_AMOUNT - discountAmount)

    return NextResponse.json({
      valid: true,
      discountType: coupon.discount_type,
      discountPercent,
      discountAmount,
      depositDue,
      isFree: discountPercent >= 100,
    })
  } catch {
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 })
  }
}
