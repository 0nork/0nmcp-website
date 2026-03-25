import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
const WEBHOOK_SECRET = process.env.WPSXO_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || ''

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwujhhmlrtxjmjzyttwn.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const CRM_API = 'https://services.leadconnectorhq.com'
const CRM_PIT = process.env.CRM_AGENCY_PIT || ''

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = WEBHOOK_SECRET
      ? stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
      : JSON.parse(body) as Stripe.Event
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckout(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleCheckout(session: Stripe.Checkout.Session) {
  const email = session.customer_email || session.customer_details?.email || ''
  const tier = session.metadata?.tier || 'pro'
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.toString() || ''
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.toString() || ''

  // 1. Generate license key
  const key = generateKey()

  // 2. Create/find user in Supabase auth
  let userId: string | null = null
  const { data: existingUser } = await supabase.auth.admin.listUsers()
  const found = existingUser?.users?.find(u => u.email === email)
  if (found) {
    userId = found.id
  } else {
    const { data: newUser } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { source: 'wpsxo', tier },
    })
    userId = newUser?.user?.id || null
  }

  // 3. Auto-provision CRM sub-location
  let crmLocationId = ''
  try {
    const crmRes = await fetch(`${CRM_API}/locations/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRM_PIT}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId: 'bknfhTkdDLapbwfZqQNi',
        name: `WP-SXO: ${email}`,
        email: email,
        templateId: '', // TODO: add snapshot template ID for pre-built funnel
      }),
    })
    const crmData = await crmRes.json() as Record<string, unknown>
    const location = crmData.location as Record<string, string> | undefined
    crmLocationId = location?.id || ''
  } catch {
    // CRM provisioning failed — continue anyway, can retry later
  }

  // 4. Store license in Supabase
  await supabase.from('wpsxo_licenses').insert({
    user_id: userId,
    key,
    email,
    tier,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    crm_location_id: crmLocationId,
    status: 'active',
    activated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      checkout_session: session.id,
      provisioned_at: new Date().toISOString(),
    },
  })

  // 5. Send welcome email via CRM (if location was created)
  // TODO: trigger welcome workflow via CRM API

  console.log(`[WP-SXO] License created: ${key} (${tier}) for ${email}`)
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const subId = subscription.id
  const status = subscription.status

  if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
    await supabase
      .from('wpsxo_licenses')
      .update({ status: status === 'canceled' ? 'cancelled' : 'expired' })
      .eq('stripe_subscription_id', subId)
    console.log(`[WP-SXO] License ${status}: ${subId}`)
  } else if (status === 'active') {
    await supabase
      .from('wpsxo_licenses')
      .update({
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subId)
  }
}

function generateKey(): string {
  const seg = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let s = ''
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
    return s
  }
  return `WPSXO-${seg()}-${seg()}-${seg()}-${seg()}`
}
