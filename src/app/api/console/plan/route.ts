import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ plan: 'free' })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ plan: 'free' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, sponsor_tier, stripe_customer_id')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      plan: profile?.plan || 'free',
      sponsorTier: profile?.sponsor_tier || null,
      stripeCustomerId: profile?.stripe_customer_id || null,
    })
  } catch {
    return NextResponse.json({ plan: 'free' })
  }
}
