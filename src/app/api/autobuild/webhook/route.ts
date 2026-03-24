/**
 * AutoBuild Webhook — CRM Agent Studio callback
 *
 * POST /api/autobuild/webhook
 *   Called by the CRM AI Website Builder agent (Step 1 in agent flow).
 *   Runs AI page generation + CRM funnel deployment via autobuild.ts.
 *
 * Auth: x-webhook-secret header must match WEB0N_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePages, deployToFunnel } from '@/lib/autobuild'

export const dynamic = 'force-dynamic'
export const maxDuration = 120 // AI generation can take a while

interface WebhookPayload {
  businessName: string
  locationId: string
  contactId?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  website?: string
  brandColor?: string
}

export async function POST(req: NextRequest) {
  // Auth — verify webhook secret
  const secret = req.headers.get('x-webhook-secret')
  if (!secret || secret !== process.env.WEB0N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload: WebhookPayload = await req.json()

    if (!payload.businessName) {
      return NextResponse.json({ error: 'businessName is required' }, { status: 400 })
    }

    const locationId = payload.locationId || process.env.CRM_LOCATION_ID
    if (!locationId) {
      return NextResponse.json({ error: 'locationId is required' }, { status: 400 })
    }

    const apiKey = process.env.CRM_AGENCY_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'CRM_AGENCY_KEY not configured' }, { status: 500 })
    }

    console.log('[autobuild/webhook] Building site for:', payload.businessName)

    // 1. Generate pages via AI
    const pages = await generatePages({
      name: payload.businessName,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      website: payload.website,
      brandColor: payload.brandColor || '#6EE05A',
    })

    // 2. Deploy to CRM funnel
    const result = await deployToFunnel(pages, locationId, payload.businessName, apiKey)

    if (result.error) {
      console.error('[autobuild/webhook] Deploy error:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        pages: [],
      }, { status: 500 })
    }

    console.log('[autobuild/webhook] Complete:', result.funnelId, '->', result.funnelUrl)

    return NextResponse.json({
      success: true,
      funnelId: result.funnelId,
      funnelUrl: result.funnelUrl,
      pages: result.pages,
      builtAt: new Date().toISOString(),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    console.error('[autobuild/webhook] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
