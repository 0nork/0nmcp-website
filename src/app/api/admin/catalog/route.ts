import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import catalogSnapshot from '@/data/catalog-snapshot.json'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ADMIN_EMAILS = ['mike@rocketopp.com']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null
  return user
}

/**
 * GET /api/admin/catalog
 * Returns the current catalog snapshot + any custom services from DB
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = await checkAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const admin = getAdmin()

  // Get custom services added via admin UI (stored in Supabase)
  const { data: customServices } = await admin
    .from('custom_catalog_services')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({
    snapshot: {
      meta: catalogSnapshot.$meta,
      serviceCount: catalogSnapshot.service_ids.length,
      services: (catalogSnapshot.services as Array<{ id: string; name: string; action_count: number; base_url: string; auth_type: string }>).map(s => ({
        id: s.id,
        name: s.name,
        actionCount: s.action_count,
        baseUrl: s.base_url,
        authType: s.auth_type,
      })),
    },
    customServices: customServices || [],
    comingSoon: [
      'gemini', 'perplexity', 'cohere', 'mistral', 'replicate', 'stability',
      'elevenlabs', 'deepgram', 'groq', 'salesforce', 'freshdesk',
      'planetscale', 'neon', 'turso', 'cockroachdb', 'webflow',
      'postmark', 'mailgun', 'convertkit', 'brevo', 'activecampaign', 'lemlist',
      'outlook', 'xero', 'wave', 'pinterest', 'youtube', 'twitch',
      'clickup', 'monday', 'figma', 'typeform', 'loom', 'docusign', 'trello',
      'woocommerce', 'bigcommerce', 'wordpress', 'vercel', 'netlify',
      'railway', 'render', 'aws', 'gcloud', 'telegram',
    ],
  })
}

/**
 * POST /api/admin/catalog
 * Add a new service to the catalog (stored in Supabase, merged at runtime)
 *
 * Body: {
 *   id: string,           // e.g. "gemini"
 *   name: string,         // e.g. "Google Gemini"
 *   base_url: string,     // e.g. "https://generativelanguage.googleapis.com"
 *   auth_type: string,    // "api_key" | "oauth" | "bearer"
 *   category: string,     // "ai" | "marketing" | etc.
 *   actions: Array<{ id: string, name: string, method: string, path: string, description: string }>
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = await checkAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  let body: {
    id?: string
    name?: string
    base_url?: string
    auth_type?: string
    category?: string
    actions?: Array<{ id: string; name: string; method: string; path: string; description: string }>
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.id || !body.name || !body.actions?.length) {
    return NextResponse.json({
      error: 'Required: id, name, actions (array with at least one action)',
    }, { status: 400 })
  }

  // Check if already in snapshot
  if ((catalogSnapshot.service_ids as string[]).includes(body.id)) {
    return NextResponse.json({
      error: `Service "${body.id}" already exists in the catalog snapshot. Run sync-catalog.mjs to update it.`,
    }, { status: 409 })
  }

  const admin = getAdmin()

  const { data, error } = await admin
    .from('custom_catalog_services')
    .upsert({
      service_id: body.id,
      name: body.name,
      base_url: body.base_url || '',
      auth_type: body.auth_type || 'api_key',
      category: body.category || 'other',
      actions: body.actions,
      action_count: body.actions.length,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'service_id' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    service: data,
    message: `Service "${body.name}" added with ${body.actions.length} actions. It will be available in the builder immediately.`,
  })
}

/**
 * DELETE /api/admin/catalog
 * Remove a custom service. Query param: serviceId
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = await checkAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const serviceId = request.nextUrl.searchParams.get('serviceId')
  if (!serviceId) {
    return NextResponse.json({ error: 'serviceId query param required' }, { status: 400 })
  }

  const admin = getAdmin()
  const { error } = await admin
    .from('custom_catalog_services')
    .delete()
    .eq('service_id', serviceId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, deleted: serviceId })
}
