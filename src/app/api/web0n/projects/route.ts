import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createWeb0nContact, createWeb0nOpportunity, createDepositInvoice } from '@/lib/web0n'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const {
      businessName, businessType, phone, email, address, city, state, zip,
      websiteUrl, googlePlaceId, googleData, brandColors, logoUrl, tagline,
      services, specialRequests, interestedInGoogleListing,
    } = body

    if (!businessName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Business name and email are required' }, { status: 400 })
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

      // 3. Create deposit invoice
      try {
        const invoice = await createDepositInvoice(contact.id, { businessName, email, businessType, phone, address, city, state, zip, websiteUrl, googlePlaceId, googleData, brandColors, logoUrl, tagline, services, specialRequests })
        depositInvoiceId = invoice.id
        invoiceUrl = invoice.invoiceUrl
      } catch (err) {
        console.error('CRM invoice creation failed (non-fatal):', err)
      }
    } catch (err) {
      console.error('CRM contact creation failed (non-fatal):', err)
    }

    // 4. Insert project into Supabase
    const { data: project, error } = await supabase
      .from('web0n_projects')
      .insert({
        user_id: user.id,
        status: 'intake',
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
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({
      project,
      invoiceUrl,
      message: 'Project created successfully',
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Check if admin — admins see all projects
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true

  let query = supabase
    .from('web0n_projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data: projects, error } = await query

  if (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }

  return NextResponse.json({ projects: projects || [] })
}
