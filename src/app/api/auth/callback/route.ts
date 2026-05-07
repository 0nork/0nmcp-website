import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { provisionUser, getUserCrmAccount } from '@/lib/crm-provisioning'
import { sendWelcomeEmail } from '@/lib/crm-sync'
import { stripe } from '@/lib/stripe'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const redirect = searchParams.get('redirect') || '/0nboarding'

  if (code) {
    const supabase = await createSupabaseServer()
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Password recovery -> send to reset page
        if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }

        // Get the authenticated user
        const user = (await supabase.auth.getSession()).data.session?.user ?? null
        if (user) {
          const provider = user.app_metadata?.provider || 'email'
          const meta = user.user_metadata || {}

          // Auto-provision CRM sub-account for EVERY new user (non-blocking)
          autoProvisionCrm(user.id, user.email || '', meta).catch(() => {})

          // Create Stripe customer if not already created (non-blocking)
          ensureStripeCustomer(user.id, user.email || '', meta).catch(() => {})

          // Send welcome email for NEW users (non-blocking)
          sendWelcomeIfNew(user.id, user.email || '', meta).catch(() => {})

          // Convert affiliate referral + grant Runs bonus (non-blocking)
          convertReferral(user.id, user.email || '').catch(() => {})

          // For LinkedIn signups: fire PACG pipeline
          if (provider === 'linkedin_oidc') {
            try {
              await handleLinkedInOnboarding(user.id, meta)
              const archetype = await getArchetypeTier(user.id)
              return NextResponse.redirect(
                `${origin}/0nboarding?provider=linkedin&archetype=${archetype || 'individual'}`
              )
            } catch {
              // Pipeline failed gracefully — still redirect to onboarding
              return NextResponse.redirect(`${origin}/0nboarding?provider=linkedin`)
            }
          }

          // For Google/GitHub: profile data auto-saved via trigger, redirect to onboarding
          if (provider === 'google' || provider === 'github') {
            // Check if returning user (onboarding already completed)
            const isReturning = await checkReturningUser(user.id)
            if (isReturning) {
              return NextResponse.redirect(`${origin}/console`)
            }
            return NextResponse.redirect(`${origin}/0nboarding?provider=${provider}`)
          }

          // Check if returning user for email auth too
          const isReturning = await checkReturningUser(user.id)
          if (isReturning && redirect === '/0nboarding') {
            return NextResponse.redirect(`${origin}/console`)
          }
        }

        return NextResponse.redirect(`${origin}${redirect}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

/**
 * Handle LinkedIn onboarding: create linkedin_members row + run PACG pipeline
 */
async function handleLinkedInOnboarding(userId: string, meta: Record<string, unknown>) {
  const admin = getAdminClient()
  if (!admin) return

  const firstName = (meta.full_name as string)?.split(' ')[0] || (meta.name as string)?.split(' ')[0] || ''
  const lastName = (meta.full_name as string)?.split(' ').slice(1).join(' ') || (meta.name as string)?.split(' ').slice(1).join(' ') || ''

  // Upsert linkedin_members row
  await admin.from('linkedin_members').upsert({
    user_id: userId,
    linkedin_id: (meta.sub as string) || (meta.provider_id as string) || userId,
    linkedin_name: `${firstName} ${lastName}`.trim() || 'Unknown',
    linkedin_headline: (meta.headline as string) || null,
    linkedin_avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
    linkedin_profile_url: null,
    linkedin_access_token: '', // OAuth token managed by Supabase
    onboarding_completed: false,
    automated_posting_enabled: false,
    posting_frequency: 'weekly',
    total_posts: 0,
    total_engagements: 0,
  }, { onConflict: 'user_id' })

  // Get the member ID
  const { data: member } = await admin
    .from('linkedin_members')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!member) return

  // Run PACG pipeline
  try {
    const { runOnboarding } = await import('@/lib/linkedin/pipeline/onboarding')
    await runOnboarding(member.id, {
      id: userId,
      localizedFirstName: firstName,
      localizedLastName: lastName,
      headline: (meta.headline as string) || undefined,
      industry: undefined,
      profilePicture: (meta.avatar_url as string) || (meta.picture as string) || undefined,
    })
  } catch {
    // PACG pipeline errors are non-fatal
  }
}

/**
 * Get the archetype tier for a LinkedIn member
 */
async function getArchetypeTier(userId: string): Promise<string | null> {
  const admin = getAdminClient()
  if (!admin) return null

  const { data } = await admin
    .from('linkedin_members')
    .select('archetype')
    .eq('user_id', userId)
    .single()

  if (!data?.archetype) return null
  const archetype = data.archetype as { tier?: string }
  return archetype.tier || null
}

/**
 * Check if a user has already completed onboarding
 */
async function checkReturningUser(userId: string): Promise<boolean> {
  const admin = getAdminClient()
  if (!admin) return false

  const { data } = await admin
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single()

  return data?.onboarding_completed === true
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * Ensure a Stripe customer exists for this user.
 * NEVER throws — failures are logged but don't block auth.
 * Non-blocking — runs in background via fire-and-forget.
 */
async function ensureStripeCustomer(userId: string, email: string, meta: Record<string, unknown>) {
  try {
    const admin = getAdminClient()
    if (!admin) return

    // Check if user already has a stripe_customer_id
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profile?.stripe_customer_id) return

    // Create Stripe customer
    const fullName = (meta.full_name as string) || (meta.name as string) || email.split('@')[0]
    const customer = await stripe.customers.create({
      email,
      name: fullName,
      metadata: {
        supabase_user_id: userId,
      },
    })

    // Store the stripe_customer_id on the profile
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)

    console.log(`[auth] Stripe customer created for ${email} → ${customer.id}`)
  } catch (err) {
    console.error('[Stripe Customer Creation Failed]', email, err instanceof Error ? err.message : err)
    Sentry.captureException(err, {
      tags: { area: 'stripe-customer-creation', phase: 'auth-callback' },
      extra: { userId, email },
    })
    // Do NOT re-throw — auth callback must never fail due to Stripe
  }
}

/**
 * Auto-provision CRM sub-account for every new user on signup.
 * NEVER throws — failures are logged and queued for retry.
 * Non-blocking — runs in background, failures don't block auth.
 */
async function autoProvisionCrm(userId: string, email: string, meta: Record<string, unknown>) {
  try {
    // Skip if already provisioned
    const existing = await getUserCrmAccount(userId).catch(() => null)
    if (existing) return

    const fullName = (meta.full_name as string) || (meta.name as string) || email.split('@')[0]
    const company = (meta.company as string) || ''

    const result = await provisionUser({ userId, email, fullName, company })
    if (result.success) {
      console.log(`[auth] CRM auto-provisioned for ${email} → location: ${result.locationId}`)
    } else {
      console.error(`[auth] CRM provision returned error for ${email}: ${result.error}`)
      // provisionUser already queues to crm_provision_queue on failure
    }
  } catch (err) {
    console.error('[CRM Provision Failed]', email, err instanceof Error ? err.message : err)
    Sentry.captureException(err, {
      tags: { area: 'crm-provisioning', phase: 'auto-provision' },
      extra: { userId, email },
    })
    // Do NOT re-throw — auth callback must never fail due to CRM
  }
}

/**
 * Send welcome email only for NEW users (first time through callback).
 * Checks if user already has onboarding_completed or crm_contact_id — if so, skip.
 * NEVER throws — failures don't block auth.
 */
async function sendWelcomeIfNew(userId: string, email: string, meta: Record<string, unknown>) {
  try {
    const admin = getAdminClient()
    if (!admin) return

    const { data: profile } = await admin
      .from('profiles')
      .select('onboarding_completed, crm_contact_id')
      .eq('id', userId)
      .single()

    // Skip if returning user (already onboarded = not first login)
    if (profile?.onboarding_completed || profile?.crm_contact_id) return

    const fullName = (meta.full_name as string) || (meta.name as string) || ''
    const sent = await sendWelcomeEmail(email, fullName || undefined)

    if (sent) {
      console.log(`[auth] Welcome email sent to ${email}`)
    }
  } catch (err) {
    console.error('[Welcome Email Failed]', email, err instanceof Error ? err.message : err)
    // Do NOT re-throw — auth callback must never fail due to email
  }
}

/**
 * Convert affiliate referral when a referred user signs up.
 * Checks if the user was referred (referred_by on profile), finds the pending referral,
 * marks it converted, and grants 50 Runs to the referrer.
 * NEVER throws — failures don't block auth.
 */
async function convertReferral(userId: string, email: string) {
  try {
    const admin = getAdminClient()
    if (!admin) return

    // Check if this user has a referral code on their profile
    const { data: profile } = await admin
      .from('profiles')
      .select('referred_by')
      .eq('id', userId)
      .single()

    if (!profile?.referred_by) return // Not a referred user

    // Find the pending referral
    const { data: referral } = await admin
      .from('affiliate_referrals')
      .select('id, referrer_id, status')
      .eq('referral_code', profile.referred_by)
      .eq('status', 'pending')
      .maybeSingle()

    if (!referral) return // Already converted or doesn't exist

    // Convert the referral
    await admin
      .from('affiliate_referrals')
      .update({
        status: 'converted',
        referred_user_id: userId,
        referred_email: email,
        converted_at: new Date().toISOString(),
      })
      .eq('id', referral.id)

    // Grant 50 Runs to the referrer
    try {
      // Credit the referrer's run balance
      await admin.rpc('credit_runs', {
        p_user_id: referral.referrer_id,
        p_amount: 50,
        p_type: 'bonus',
        p_description: `Referral bonus: ${email} signed up`,
      })
      console.log(`[affiliate] Converted referral: ${email} → 50 Runs to referrer ${referral.referrer_id}`)
    } catch {
      // If RPC doesn't exist yet, try manual insert
      await admin.from('run_balances').upsert({
        user_id: referral.referrer_id,
        balance: 50,
        lifetime_earned: 50,
      }, { onConflict: 'user_id' })

      await admin.from('run_transactions').insert({
        user_id: referral.referrer_id,
        amount: 50,
        type: 'bonus',
        description: `Referral bonus: ${email} signed up`,
      })
      console.log(`[affiliate] Converted referral (manual): ${email} → 50 Runs to referrer`)
    }
  } catch (err) {
    console.error('[Referral Conversion Failed]', email, err instanceof Error ? err.message : err)
    // Do NOT re-throw — auth callback must never fail due to affiliates
  }
}
