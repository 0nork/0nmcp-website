import { NextRequest, NextResponse } from 'next/server'
import {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendConfirmationEmail,
} from '@/lib/crm-sync'

const HOOK_SECRET = process.env.SUPABASE_AUTH_HOOK_SECRET || ''

/**
 * POST /api/auth/send-email — Supabase Auth Hook: Custom Email Sender
 *
 * Supabase sends auth email requests here instead of using its default mailer.
 * We route them through the CRM for branded, tracked emails.
 *
 * Configure in Supabase Dashboard:
 *   Authentication → Hooks → Send Email → HTTP Hook
 *   URL: https://0nmcp.com/api/auth/send-email
 *   Secret: SUPABASE_AUTH_HOOK_SECRET
 *
 * Payload from Supabase:
 * {
 *   "user": { "email": "...", "user_metadata": {...} },
 *   "email_data": {
 *     "token": "...",
 *     "token_hash": "...",
 *     "redirect_to": "...",
 *     "email_action_type": "signup" | "magiclink" | "recovery" | "invite" | "email_change"
 *     "site_url": "..."
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Verify hook secret
  if (HOOK_SECRET) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${HOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const payload = await request.json()
    const { user, email_data } = payload

    const email = user?.email
    if (!email) {
      return NextResponse.json({ error: 'No email in payload' }, { status: 400 })
    }

    const actionType = email_data?.email_action_type
    const token = email_data?.token_hash || email_data?.token
    const redirectTo = email_data?.redirect_to || 'https://0nmcp.com/account'
    const siteUrl = email_data?.site_url || 'https://0nmcp.com'

    // Build the action link
    // Supabase expects: {site_url}/auth/v1/verify?token={token_hash}&type={action_type}&redirect_to={redirect_to}
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || siteUrl
    const actionLink = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${actionType === 'recovery' ? 'recovery' : actionType === 'magiclink' ? 'magiclink' : 'signup'}&redirect_to=${encodeURIComponent(redirectTo)}`

    let sent = false

    switch (actionType) {
      case 'signup':
      case 'email_change':
        sent = await sendConfirmationEmail(email, actionLink)
        break

      case 'magiclink':
        sent = await sendMagicLinkEmail(email, actionLink)
        break

      case 'recovery':
        sent = await sendPasswordResetEmail(email, actionLink)
        break

      case 'invite':
        sent = await sendConfirmationEmail(email, actionLink)
        break

      default:
        console.warn(`[auth-hook] Unknown email action type: ${actionType}`)
        sent = await sendConfirmationEmail(email, actionLink)
    }

    if (!sent) {
      // Return error so Supabase falls back to default email
      return NextResponse.json({ error: 'CRM email send failed' }, { status: 500 })
    }

    console.log(`[auth-hook] Sent ${actionType} email to ${email} via CRM`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[auth-hook] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Hook failed' },
      { status: 500 }
    )
  }
}
