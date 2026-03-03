import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ADMIN_EMAILS = ['mike@rocketopp.com']

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function checkAdmin(req: NextRequest) {
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

// POST: Reset user password
export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { userId, method } = body

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  if (method === 'generate') {
    // Generate a new random password and set it
    const newPassword = Math.random().toString(36).slice(-10) + 'X1!'

    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, password: newPassword })
  }

  if (method === 'email') {
    // Get user email first
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
    if (userError || !userData.user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send password reset email via Supabase
    const { error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: userData.user.email,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, email: userData.user.email })
  }

  return NextResponse.json({ error: 'Invalid method. Use "generate" or "email"' }, { status: 400 })
}
