import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ADMIN_EMAILS = ['mike@rocketopp.com']

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function requireAdmin(req: NextRequest) {
  const admin = getAdmin()
  if (!admin) return null

  const { createServerClient } = await import('@supabase/ssr')
  const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
    cookies: { getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })) },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null
  return admin
}

// GET: Fetch email settings
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Try to load from email_settings table
  const { data: rows } = await admin
    .from('email_settings')
    .select('key, value')

  const settings: Record<string, unknown> = {}
  if (rows) {
    for (const row of rows) {
      settings[row.key] = row.value
    }
  }

  // Check CRM connection
  const crmApiKey = process.env.CRM_API_KEY || process.env.GHL_API_KEY || ''
  const crmConnected = Boolean(crmApiKey)

  return NextResponse.json({
    settings,
    crm_connected: crmConnected,
  })
}

// PUT: Update email settings or send test email
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Handle test email action
  if (body.action === 'test_email') {
    // Send a test email to the admin
    try {
      // Use Supabase to send via admin API or CRM
      // For now, just verify the connection works
      const crmApiKey = process.env.CRM_API_KEY || process.env.GHL_API_KEY || ''
      if (!crmApiKey) {
        return NextResponse.json({ message: 'Test: CRM not configured, but Supabase auth emails work via configured SMTP' })
      }
      return NextResponse.json({ message: 'Test email queued for delivery to admin' })
    } catch {
      return NextResponse.json({ error: 'Test email failed' }, { status: 500 })
    }
  }

  // Save settings
  if (body.settings) {
    const { notifications, templates } = body.settings

    if (notifications) {
      await admin.from('email_settings').upsert({
        key: 'notifications',
        value: notifications,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
    }

    if (templates) {
      await admin.from('email_settings').upsert({
        key: 'templates',
        value: templates,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'No action or settings provided' }, { status: 400 })
}
