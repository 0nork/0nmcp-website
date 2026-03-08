import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import {
  createConnectedAccount,
  createOnboardingLink,
  createDashboardLink,
  getAccountStatus,
  applyAsVendor,
  getVendorProfile,
  createSetupIntent,
  savePaymentMethod,
  getPaymentMethods,
  removePaymentMethod,
} from '@/lib/stripe-connect'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stripe/connect?action=status|dashboard|payment_methods
 *
 * - status: Get vendor Connect account status
 * - dashboard: Get Stripe Express dashboard login link
 * - payment_methods: Get saved payment methods for the buyer
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const action = request.nextUrl.searchParams.get('action') || 'status'

  try {
    switch (action) {
      case 'status': {
        const vendor = await getVendorProfile(user.id)
        if (!vendor) return NextResponse.json({ vendor: null, is_vendor: false })

        let stripeStatus = null
        if (vendor.stripe_account_id) {
          stripeStatus = await getAccountStatus(vendor.stripe_account_id).catch(() => null)
        }

        return NextResponse.json({
          vendor,
          stripe_status: stripeStatus,
          is_vendor: true,
        })
      }

      case 'dashboard': {
        const vendor = await getVendorProfile(user.id)
        if (!vendor?.stripe_account_id) {
          return NextResponse.json({ error: 'No vendor account found' }, { status: 404 })
        }
        const url = await createDashboardLink(vendor.stripe_account_id)
        return NextResponse.json({ url })
      }

      case 'payment_methods': {
        const methods = await getPaymentMethods(user.id)
        return NextResponse.json({ payment_methods: methods })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err) {
    console.error('Connect GET error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stripe/connect
 *
 * Body: { action, ...params }
 *
 * Actions:
 * - apply: Submit vendor application
 * - create_account: Create Stripe Connect account (admin or auto-approve)
 * - onboarding_link: Generate Stripe-hosted onboarding URL
 * - setup_intent: Create SetupIntent for saving a card
 * - save_payment_method: Save confirmed payment method
 * - remove_payment_method: Remove a saved payment method
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { action } = body

  try {
    switch (action) {
      // ── Vendor Application ──
      case 'apply': {
        const { business_name, business_type } = body
        if (!business_name) return NextResponse.json({ error: 'Business name required' }, { status: 400 })

        const result = await applyAsVendor(user.id, business_name, business_type)
        return NextResponse.json({ success: true, vendor_id: result.vendorId })
      }

      // ── Create Connected Account ──
      case 'create_account': {
        const { business_name, country } = body
        const result = await createConnectedAccount(
          user.id,
          user.email!,
          business_name,
          country
        )
        return NextResponse.json({
          success: true,
          account_id: result.accountId,
          vendor_id: result.vendorId,
        })
      }

      // ── Generate Onboarding Link ──
      case 'onboarding_link': {
        const vendor = await getVendorProfile(user.id)
        if (!vendor?.stripe_account_id) {
          return NextResponse.json({ error: 'No vendor account' }, { status: 404 })
        }

        const origin = request.nextUrl.origin
        const url = await createOnboardingLink(
          vendor.stripe_account_id,
          `${origin}/console?vendor=onboarded`,
          `${origin}/console?vendor=refresh`
        )
        return NextResponse.json({ url })
      }

      // ── Setup Intent (save card) ──
      case 'setup_intent': {
        const result = await createSetupIntent(user.id, user.email!)
        return NextResponse.json({
          client_secret: result.clientSecret,
          customer_id: result.customerId,
        })
      }

      // ── Save Payment Method ──
      case 'save_payment_method': {
        const { payment_method_id, customer_id } = body
        if (!payment_method_id || !customer_id) {
          return NextResponse.json({ error: 'Missing payment_method_id or customer_id' }, { status: 400 })
        }
        await savePaymentMethod(user.id, customer_id, payment_method_id)
        return NextResponse.json({ success: true })
      }

      // ── Remove Payment Method ──
      case 'remove_payment_method': {
        const { id } = body
        if (!id) return NextResponse.json({ error: 'Missing payment method id' }, { status: 400 })
        await removePaymentMethod(user.id, id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err) {
    console.error('Connect POST error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    )
  }
}
