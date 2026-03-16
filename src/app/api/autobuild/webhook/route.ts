/**
 * AutoBuild Webhook — Trigger AI website generation from CRM workflows
 *
 * POST /api/autobuild/webhook
 *
 * CRM Workflow Setup:
 *   1. Create workflow in CRM UI
 *   2. Trigger: Opportunity Stage Changed / Contact Tag Added / Manual
 *   3. Action: "Send Webhook" → POST https://0nmcp.com/api/autobuild/webhook
 *   4. Headers: x-webhook-secret: <WEB0N_WEBHOOK_SECRET>
 *   5. Body (CRM merge fields):
 *      {
 *        "contactId": "{{contact.id}}",
 *        "locationId": "{{location.id}}",          // CRM sub-account to deploy to
 *        "businessName": "{{contact.company_name}}",
 *        "businessType": "{{contact.custom_field.business_type}}",
 *        "email": "{{contact.email}}",
 *        "phone": "{{contact.phone}}",
 *        "address": "{{contact.address1}}",
 *        "city": "{{contact.city}}",
 *        "state": "{{contact.state}}",
 *        "zip": "{{contact.postal_code}}",
 *        "website": "{{contact.website}}",
 *        "brandColor": "#7ed957",
 *        "tagline": "{{contact.custom_field.tagline}}",
 *        "services": "{{contact.custom_field.services}}"
 *      }
 *
 * Also supports:
 *   - "projectId" field → looks up business data from web0n_projects table
 *   - "opportunityId" field → looks up contact from CRM opportunity
 *
 * Returns: { success, funnelId, funnelUrl, pages }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePages, deployToFunnel } from '@/lib/autobuild'
import { addContactNote } from '@/lib/crm'

const WEBHOOK_SECRET = process.env.WEB0N_WEBHOOK_SECRET || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getServiceClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

function verifyRequest(request: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return true // No secret configured = open (dev mode)
  const sig = request.headers.get('x-webhook-secret')
    || request.headers.get('x-webhook-signature')
    || ''
  const auth = request.headers.get('authorization') || ''
  return sig === WEBHOOK_SECRET || auth === `Bearer ${WEBHOOK_SECRET}`
}

export async function POST(request: NextRequest) {
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('[autobuild-webhook] Received:', JSON.stringify(body).slice(0, 500))

    // ---- Resolve business data ----
    let biz: {
      name: string
      type?: string
      services?: string[]
      phone?: string
      email?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      website?: string
      brandColor?: string
      tagline?: string
    }
    let locationId: string | undefined = body.locationId
    let contactId: string | undefined = body.contactId
    let projectId: string | undefined = body.projectId

    if (body.projectId) {
      // Mode 1: Look up from web0n_projects table
      const db = getServiceClient()
      if (!db) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
      }

      const { data: project, error } = await db
        .from('web0n_projects')
        .select('*')
        .eq('id', body.projectId)
        .single()

      if (error || !project) {
        return NextResponse.json({ error: `Project not found: ${body.projectId}` }, { status: 404 })
      }

      biz = {
        name: project.business_name,
        type: project.business_type,
        services: project.services,
        phone: project.phone,
        email: project.email,
        address: project.address,
        city: project.city,
        state: project.state,
        zip: project.zip,
        website: project.website_url,
        brandColor: project.brand_colors?.primary,
        tagline: project.tagline,
      }
      locationId = locationId || project.crm_location_id
      contactId = contactId || project.crm_contact_id
      projectId = project.id

    } else if (body.businessName) {
      // Mode 2: Direct business data from CRM workflow merge fields
      const servicesList = body.services
        ? (typeof body.services === 'string' ? body.services.split(',').map((s: string) => s.trim()) : body.services)
        : undefined

      biz = {
        name: body.businessName,
        type: body.businessType,
        services: servicesList,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        website: body.website,
        brandColor: body.brandColor || '#7ed957',
        tagline: body.tagline,
      }

    } else {
      return NextResponse.json({
        error: 'Provide either "projectId" or "businessName" in the request body',
        example: {
          businessName: 'Acme Corp',
          locationId: 'abc123',
          email: 'info@acme.com',
          phone: '+1-555-0100',
        },
      }, { status: 400 })
    }

    if (!biz.name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    // ---- Step 1: Generate pages with Claude AI ----
    console.log('[autobuild-webhook] Generating pages for:', biz.name)
    const pages = await generatePages(biz)
    console.log('[autobuild-webhook] Generated', pages.length, 'pages')

    // ---- Step 2: Deploy to CRM funnel (if locationId provided) ----
    let deployResult = null
    if (locationId) {
      const apiKey = process.env.CRM_AGENCY_KEY
      if (!apiKey) {
        console.error('[autobuild-webhook] CRM_AGENCY_KEY not configured, skipping deploy')
      } else {
        console.log('[autobuild-webhook] Deploying to location:', locationId)
        deployResult = await deployToFunnel(pages, locationId, biz.name, apiKey)
        console.log('[autobuild-webhook] Deploy result:', deployResult.funnelId, deployResult.funnelUrl)
      }
    } else {
      console.log('[autobuild-webhook] No locationId — pages generated but not deployed')
    }

    // ---- Step 3: Update Supabase project (if projectId) ----
    if (projectId && deployResult && !deployResult.error) {
      const db = getServiceClient()
      if (db) {
        await db.from('web0n_projects').update({
          status: 'review',
          site_url: deployResult.funnelUrl || null,
          build_brief: {
            funnelId: deployResult.funnelId,
            funnelUrl: deployResult.funnelUrl,
            pages: deployResult.pages,
            builtAt: new Date().toISOString(),
            engine: 'autobuild-webhook',
          },
        }).eq('id', projectId)
      }
    }

    // ---- Step 4: Add CRM note (if contactId) ----
    if (contactId && pages.length > 0) {
      const pageNames = pages.map(p => p.name).join(', ')
      const note = deployResult?.funnelUrl
        ? `AutoBuild complete: ${pages.length} pages (${pageNames}). Funnel: ${deployResult.funnelUrl}`
        : `AutoBuild generated ${pages.length} pages (${pageNames}). Awaiting deployment — no location ID.`
      addContactNote(contactId, note).catch(() => {})
    }

    // ---- Response ----
    return NextResponse.json({
      success: true,
      business: biz.name,
      pagesGenerated: pages.length,
      pages: pages.map(p => ({ name: p.name, slug: p.slug, htmlLength: p.html.length })),
      deployed: !!deployResult && !deployResult.error,
      funnelId: deployResult?.funnelId,
      funnelUrl: deployResult?.funnelUrl,
      deployedPages: deployResult?.pages,
      error: deployResult?.error,
    })

  } catch (err) {
    console.error('[autobuild-webhook] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AutoBuild failed' },
      { status: 500 }
    )
  }
}

// GET — health check + setup instructions
export async function GET() {
  return NextResponse.json({
    service: 'AutoBuild Webhook',
    status: 'ready',
    version: '1.0.0',
    usage: {
      method: 'POST',
      url: 'https://0nmcp.com/api/autobuild/webhook',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': '<WEB0N_WEBHOOK_SECRET>',
      },
      modes: {
        direct: {
          description: 'Send business data directly from CRM merge fields',
          body: {
            businessName: '{{contact.company_name}}',
            locationId: '{{location.id}}',
            email: '{{contact.email}}',
            phone: '{{contact.phone}}',
            address: '{{contact.address1}}',
            city: '{{contact.city}}',
            state: '{{contact.state}}',
            zip: '{{contact.postal_code}}',
          },
        },
        project: {
          description: 'Look up business data from web0n_projects table',
          body: {
            projectId: '<supabase-project-id>',
          },
        },
      },
    },
    crmWorkflowSetup: [
      '1. Go to CRM → Automation → Workflows → Create Workflow',
      '2. Set trigger: Opportunity Stage Changed (or Contact Tag Added, Manual)',
      '3. Add action: Send Webhook (POST)',
      '4. URL: https://0nmcp.com/api/autobuild/webhook',
      '5. Add header: x-webhook-secret = <your WEB0N_WEBHOOK_SECRET>',
      '6. Set body with contact merge fields (see modes above)',
      '7. Activate workflow',
    ],
  })
}
