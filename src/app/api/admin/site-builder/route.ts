/**
 * Admin Site Builder API
 *
 * POST /api/admin/site-builder
 *   action: "generate" — Generate 4 pages via Claude AI (costs money!)
 *   action: "deploy"   — Deploy generated pages to CRM funnel
 *   action: "preview"  — Return generated HTML for preview
 *
 * Admin only (mike@rocketopp.com).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { generatePages, deployToFunnel } from '@/lib/autobuild'

const ADMIN_EMAILS = ['mike@rocketopp.com']

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null
  return supabase
}

export async function POST(request: NextRequest) {
  const supabase = await requireAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'generate') {
      // Generate pages via Claude AI — WARNING: costs money!
      const { business } = body as {
        business: {
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
      }

      if (!business?.name) {
        return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
      }

      const pages = await generatePages(business)

      return NextResponse.json({
        success: true,
        pages: pages.map(p => ({ name: p.name, slug: p.slug, htmlLength: p.html.length })),
        fullPages: pages,
        generatedAt: new Date().toISOString(),
      })
    }

    if (action === 'deploy') {
      // Deploy pages to CRM funnel
      const { pages, locationId, businessName } = body as {
        pages: Array<{ name: string; slug: string; html: string }>
        locationId: string
        businessName: string
      }

      if (!pages?.length || !locationId || !businessName) {
        return NextResponse.json({ error: 'pages, locationId, and businessName are required' }, { status: 400 })
      }

      const apiKey = process.env.CRM_AGENCY_KEY
      if (!apiKey) {
        return NextResponse.json({ error: 'CRM_AGENCY_KEY not configured' }, { status: 500 })
      }

      const result = await deployToFunnel(pages, locationId, businessName, apiKey)

      return NextResponse.json({
        success: !result.error,
        ...result,
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use "generate" or "deploy"' }, { status: 400 })
  } catch (err) {
    console.error('[site-builder]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    )
  }
}
