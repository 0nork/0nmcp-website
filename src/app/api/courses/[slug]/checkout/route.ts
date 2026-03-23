import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

const TIER_PRICES: Record<string, string> = {
  supporter: 'price_1T1rY5HThmAuKVQMEvWdsvcy',
  builder: 'price_1T1rYYHThmAuKVQMZIOi4kdq',
  enterprise: 'price_1T1rYiHThmAuKVQMsUKlhrSq',
}

/**
 * POST /api/courses/[slug]/checkout — Create Stripe checkout for paid courses
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title, tier_required')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Free courses don't need checkout
  if (course.tier_required === 'free') {
    return NextResponse.json({ error: 'This course is free — enroll directly' }, { status: 400 })
  }

  // Check if user already has the required tier
  const tierHierarchy: Record<string, number> = { free: 0, supporter: 1, builder: 2, enterprise: 3 }
  const { data: profile } = await supabase
    .from('profiles')
    .select('sponsor_tier')
    .eq('id', user.id)
    .single()

  const userTier = (profile as { sponsor_tier: string | null } | null)?.sponsor_tier || 'free'
  const userLevel = tierHierarchy[userTier] || 0
  const requiredLevel = tierHierarchy[course.tier_required] || 0

  if (userLevel >= requiredLevel) {
    return NextResponse.json({ error: 'You already have access — enroll directly' }, { status: 400 })
  }

  // Get stripe price ID
  const priceId = TIER_PRICES[course.tier_required]
  if (!priceId) {
    return NextResponse.json({ error: 'No pricing configured for this tier' }, { status: 500 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  // Determine base URL
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'

  // Create Stripe Checkout session
  try {
    const body = new URLSearchParams({
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${origin}/console/learn/${slug}?enrolled=true`,
      'cancel_url': `${origin}/console/learn/${slug}`,
      'customer_email': user.email || '',
      'client_reference_id': user.id,
      'metadata[user_id]': user.id,
      'metadata[course_slug]': slug,
      'metadata[tier]': course.tier_required,
      'subscription_data[metadata][user_id]': user.id,
      'subscription_data[metadata][tier]': course.tier_required,
    })

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const session = await res.json()

    if (!res.ok) {
      console.error('Stripe error:', session)
      return NextResponse.json({ error: session.error?.message || 'Stripe checkout failed' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
