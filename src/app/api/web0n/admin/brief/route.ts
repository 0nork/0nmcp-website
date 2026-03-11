import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { generateBuildBrief, type Web0nProject } from '@/lib/web0n'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Admin only
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from('web0n_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Map DB snake_case to camelCase for the brief generator
    const projectData: Web0nProject = {
      id: project.id,
      userId: project.user_id,
      status: project.status,
      businessName: project.business_name,
      businessType: project.business_type,
      phone: project.phone,
      email: project.email,
      address: project.address,
      city: project.city,
      state: project.state,
      zip: project.zip,
      websiteUrl: project.website_url,
      googlePlaceId: project.google_place_id,
      googleData: project.google_data,
      brandColors: project.brand_colors,
      logoUrl: project.logo_url,
      tagline: project.tagline,
      services: project.services,
      pages: project.pages || ['home', 'services', 'contact', 'booking', 'pricing'],
      specialRequests: project.special_requests,
      crmContactId: project.crm_contact_id,
      crmLocationId: project.crm_location_id,
      crmOpportunityId: project.crm_opportunity_id,
      depositInvoiceId: project.deposit_invoice_id,
      finalInvoiceId: project.final_invoice_id,
      depositPaidAt: project.deposit_paid_at,
      finalPaidAt: project.final_paid_at,
      buildBrief: project.build_brief,
      siteUrl: project.site_url,
      adminNotes: project.admin_notes,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }

    const brief = generateBuildBrief(projectData)

    // Save brief to project
    await supabase
      .from('web0n_projects')
      .update({ build_brief: brief })
      .eq('id', projectId)

    return NextResponse.json({ brief })
  } catch (err) {
    console.error('Brief generation error:', err)
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 })
  }
}
