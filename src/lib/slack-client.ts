import { createHmac, timingSafeEqual } from 'crypto'

export async function verifySlackSignature(
  body: string,
  headers: Headers
): Promise<boolean> {
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) return false

  const timestamp = headers.get('x-slack-request-timestamp')
  const slackSignature = headers.get('x-slack-signature')

  if (!timestamp || !slackSignature) return false

  // Reject requests older than 5 minutes
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > 300) return false

  const sigBasestring = `v0:${timestamp}:${body}`
  const mySignature = 'v0=' + createHmac('sha256', signingSecret)
    .update(sigBasestring)
    .digest('hex')

  try {
    return timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  } catch {
    return false
  }
}
