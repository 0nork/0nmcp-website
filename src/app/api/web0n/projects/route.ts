import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createWeb0nContact, createWeb0nOpportunity, createDepositInvoice, runDepositPaidAutomation } from '@/lib/web0n'

const DEPOSIT_AMOUNT = 998.50

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  // Auth is optional — guests can submit projects
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  const adminSupabase = createSupabaseAdmin()
  const db = adminSupabase || supabase

  try {
    const body = await request.json()

    const {
      businessName, businessType, phone, email, address, city, state, zip,
      websiteUrl, googlePlaceId, googleData, brandColors, logoUrl, tagline,
      services, specialRequests, interestedInGoogleListing, couponCode,
    } = body

    if (!businessName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Business name and email are required' }, { status: 400 })
    }

    // Validate coupon code if provided
    let isFree = false
    let discountPercent = 0
    let discountAmount = 0
    let validatedCode = ''

    if (couponCode) {
      const code = couponCode.toUpperCase().trim()

      const { data: coupon, error: couponErr } = await db
        .from('web0n_coupons')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .single()

      if (couponErr || !coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }

      // Check max uses
      if (coupon.times_used >= coupon.max_uses) {
        return NextResponse.json({ error: 'This coupon code has already been redeemed' }, { status: 400 })
      }

      // Check email restriction
      if (coupon.restrict_to_email && coupon.restrict_to_email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: 'This coupon code is not valid for your email' }, { status: 400 })
      }

      validatedCode = code
      if (coupon.discount_type === 'full') {
        isFree = true
        discountPercent = 100
        discountAmount = DEPOSIT_AMOUNT
      } else if (coupon.discount_type === 'percent') {
        discountPercent = Number(coupon.discount_value)
        discountAmount = Math.round(DEPOSIT_AMOUNT * (discountPercent / 100) * 100) / 100
        if (discountPercent >= 100) isFree = true
      }

      // Mark coupon as used (atomic increment)
      await db
        .from('web0n_coupons')
        .update({
          times_used: coupon.times_used + 1,
          redeemed_by_email: email,
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', coupon.id)
    }

    // 1. Create CRM contact
    let crmContactId: string | undefined
    let crmOpportunityId: string | undefined
    let depositInvoiceId: string | undefined
    let invoiceUrl: string | undefined

    try {
      const contact = await createWeb0nContact({
        businessName, businessType, phone, email, address, city, state, zip,
        websiteUrl, googlePlaceId, googleData, brandColors, logoUrl, tagline, services, specialRequests,
      })
      crmContactId = contact.id

      // 2. Create CRM opportunity
      try {
        const opp = await createWeb0nOpportunity(contact.id, { businessName, email, businessType, phone, address, city, state, zip, websiteUrl, googlePlaceId, googleData, brandColors, logoUrl, tagline, services, specialRequests })
        crmOpportunityId = opp.id
      } catch (err) {
        console.error('CRM opportunity creation failed (non-fatal):', err)
      }

      // 3. Create deposit invoice (skip if coupon makes it fully free)
      if (!isFree) {
        try {
          const depositDue = DEPOSIT_AMOUNT - discountAmount
          const invoice = await createDepositInvoice(contact.id, { businessName, email, businessType, phone, address, city, state, zip, websiteUrl, googlePlaceId, googleData, brandColors, logoUrl, tagline, services, specialRequests }, depositDue > 0 ? depositDue : undefined)
          depositInvoiceId = invoice.id
          invoiceUrl = invoice.invoiceUrl
        } catch (err) {
          console.error('CRM invoice creation failed (non-fatal):', err)
        }
      }
    } catch (err) {
      console.error('CRM contact creation failed (non-fatal):', err)
    }

    // 4. Insert project into Supabase
    const { data: project, error } = await db
      .from('web0n_projects')
      .insert({
        user_id: user?.id || null,
        status: isFree ? 'deposit_paid' : 'intake',
        business_name: businessName,
        business_type: businessType || null,
        phone: phone || null,
        email,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        website_url: websiteUrl || null,
        google_place_id: googlePlaceId || null,
        google_data: googleData || null,
        brand_colors: brandColors || null,
        logo_url: logoUrl || null,
        tagline: tagline || null,
        services: services || null,
        special_requests: specialRequests || null,
        interested_in_google_listing: interestedInGoogleListing || false,
        crm_contact_id: crmContactId || null,
        crm_opportunity_id: crmOpportunityId || null,
        deposit_invoice_id: depositInvoiceId || null,
        coupon_code: validatedCode || null,
        discount_amount: discountAmount || null,
        ...(isFree ? { deposit_paid_at: new Date().toISOString() } : {}),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Fire deposit-paid automation for free coupon projects
    if (isFree && project?.id) {
      runDepositPaidAutomation(project.id, db).catch(err =>
        console.error('[web0n] Free coupon automation failed:', err)
      )
    }

    return NextResponse.json({
      project,
      invoiceUrl: isFree ? null : invoiceUrl,
      isFree,
      discountPercent,
      discountAmount,
      depositDue: isFree ? 0 : DEPOSIT_AMOUNT - discountAmount,
      message: isFree
        ? 'Project created — no payment required!'
        : discountAmount > 0
          ? `Project created — ${discountPercent}% off applied! Deposit: $${(DEPOSIT_AMOUNT - discountAmount).toFixed(2)}`
          : 'Project created successfully',
    })
  } catch (err) {
    console.error('Project creation error:', err)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const adminSupabase = createSupabaseAdmin()
  const db = adminSupabase || supabase

  // Check if admin — admins see all projects
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, email')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true
  const userEmail = user.email || profile?.email || ''

  let query = db
    .from('web0n_projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    // Match by user_id OR email (handles projects created before login / as guest)
    query = query.or(`user_id.eq.${user.id},and(user_id.is.null,email.ilike.${userEmail})`)
  }

  const { data: projects, error } = await query

  if (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }

  // Auto-link unlinked projects to this user (by email match)
  if (projects?.length && userEmail) {
    const unlinked = projects.filter(p => !p.user_id && p.email?.toLowerCase() === userEmail.toLowerCase())
    if (unlinked.length > 0) {
      await db
        .from('web0n_projects')
        .update({ user_id: user.id })
        .in('id', unlinked.map(p => p.id))
    }
  }

  return NextResponse.json({ projects: projects || [] })
}
