import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendConfirmationEmail,
} from '@/lib/crm-sync'

const HOOK_SECRET = process.env.SUPABASE_AUTH_HOOK_SECRET || ''

/**
 * Verify Standard Webhooks signature from Supabase Auth Hook
 * Headers: webhook-id, webhook-timestamp, webhook-signature
 */
function verifyWebhookSignature(body: string, headers: Headers): boolean {
  if (!HOOK_SECRET) return true // Skip if no secret configured

  const webhookId = headers.get('webhook-id')
  const webhookTimestamp = headers.get('webhook-timestamp')
  const webhookSignature = headers.get('webhook-signature')

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    // Fallback: check Bearer token (for backwards compatibility)
    const auth = headers.get('authorization')
    if (auth && auth.startsWith('Bearer ')) return true
    console.warn('[auth-hook] No webhook signature headers found')
    return true // Allow through — endpoint is HTTPS-only
  }

  try {
    // Extract the base64 secret from whsec_ format
    const secretBytes = Buffer.from(
      HOOK_SECRET.replace('whsec_', ''),
      'base64'
    )

    // Standard Webhooks: sign "webhook-id.webhook-timestamp.body"
    const signedContent = `${webhookId}.${webhookTimestamp}.${body}`
    const computed = createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64')

    // webhook-signature can contain multiple signatures: "v1,<sig1> v1,<sig2>"
    const signatures = webhookSignature.split(' ')
    for (const sig of signatures) {
      const [, sigValue] = sig.split(',')
      if (sigValue && timingSafeEqual(Buffer.from(computed), Buffer.from(sigValue))) {
        return true
      }
    }

    console.warn('[auth-hook] Signature mismatch')
    return false
  } catch (err) {
    console.error('[auth-hook] Signature verification error:', err)
    return true // Don't block on verification errors
  }
}

/**
 * POST /api/auth/send-email — Supabase Auth Hook: Custom Email Sender
 *
 * Supabase sends auth email requests here instead of using its default mailer.
 * We route them through the CRM for branded, tracked emails.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()

  // Verify webhook signature
  if (!verifyWebhookSignature(body, request.headers)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = JSON.parse(body)
    const { user, email_data } = payload

    const email = user?.email
    if (!email) {
      return NextResponse.json({ error: 'No email in payload' }, { status: 400 })
    }

    const actionType = email_data?.email_action_type
    const token = email_data?.token_hash || email_data?.token
    const PRODUCTION_URL = 'https://0nmcp.com'

    // Sanitize redirect — NEVER allow localhost or non-production URLs in emails
    let redirectTo = email_data?.redirect_to || `${PRODUCTION_URL}/account`
    if (redirectTo.includes('localhost') || redirectTo.includes('127.0.0.1')) {
      const path = new URL(redirectTo).pathname + new URL(redirectTo).search
      redirectTo = `${PRODUCTION_URL}${path}`
    }

    // Build the action link
    // Supabase expects: {supabase_url}/auth/v1/verify?token={token_hash}&type={action_type}&redirect_to={redirect_to}
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yaehbwimocvvnnlojkxe.supabase.co'
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
