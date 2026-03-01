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
  if (!HOOK_SECRET) {
    console.warn('[auth-hook] SUPABASE_AUTH_HOOK_SECRET not configured — skipping verification')
    return true
  }

  const webhookId = headers.get('webhook-id')
  const webhookTimestamp = headers.get('webhook-timestamp')
  const webhookSignature = headers.get('webhook-signature')

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    console.warn('[auth-hook] Missing webhook signature headers — rejecting')
    return false
  }

  // Reject requests older than 5 minutes (replay protection)
  const ts = parseInt(webhookTimestamp, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > 300) {
    console.warn('[auth-hook] Webhook timestamp too old — rejecting')
    return false
  }

  try {
    const secretBytes = Buffer.from(
      HOOK_SECRET.replace('whsec_', ''),
      'base64'
    )

    const signedContent = `${webhookId}.${webhookTimestamp}.${body}`
    const computed = createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64')

    const signatures = webhookSignature.split(' ')
    for (const sig of signatures) {
      const [, sigValue] = sig.split(',')
      if (sigValue) {
        const computedBuf = Buffer.from(computed)
        const sigBuf = Buffer.from(sigValue)
        if (computedBuf.length === sigBuf.length && timingSafeEqual(computedBuf, sigBuf)) {
          return true
        }
      }
    }

    console.warn('[auth-hook] Signature mismatch')
    return false
  } catch (err) {
    console.error('[auth-hook] Signature verification error:', err)
    return false
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
