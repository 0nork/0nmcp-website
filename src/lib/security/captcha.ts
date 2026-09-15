/**
 * hCaptcha verification for public forms.
 *
 * Mike, 2026-09-15, after a bot signup wave: "This is for forms moving forward
 * to stop spam." Twenty scripted accounts landed in the shared `profiles` table
 * between 2026-08-31 and 09-02.
 *
 * WHY THIS REPO. /api/auth/register here answers `Access-Control-Allow-Origin:
 * *` with no throttle and no human check, and it writes into the same Supabase
 * project 0nCore reads. Which of the two routes the wave actually used could
 * not be established from the rows, so both are guarded.
 *
 * SITE KEY is public and belongs in client code. SECRET is not: it lives only
 * in HCAPTCHA_SECRET on the server and is never returned to a browser.
 *
 * FAIL-OPEN WHEN UNCONFIGURED, FAIL-CLOSED WHEN CONFIGURED. If HCAPTCHA_SECRET
 * is absent the check is skipped and says so, so shipping this file cannot take
 * signup down on any deployment that has not been given the key yet. Once the
 * key is set, a missing or rejected token is a refusal. Turning it on is an env
 * var, not a deploy.
 */

export const HCAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '6588d920-772a-457e-96e6-8a285098d46a'

const VERIFY_URL = 'https://api.hcaptcha.com/siteverify'

export type CaptchaResult =
  | { ok: true; skipped: boolean; hostname?: string }
  | { ok: false; reason: string; codes: string[] }

export function captchaConfigured(): boolean {
  return Boolean(process.env.HCAPTCHA_SECRET)
}

/**
 * Verify a token from the client widget.
 *
 * `remoteip` is the caller's address; hCaptcha treats it as a hint, and a wrong
 * one (a proxy hop rather than the client) weakens scoring rather than failing
 * the call, so it is sent only when it parses as an address.
 */
export async function verifyCaptcha(token: unknown, remoteip?: string | null): Promise<CaptchaResult> {
  const secret = process.env.HCAPTCHA_SECRET
  if (!secret) return { ok: true, skipped: true }

  const t = typeof token === 'string' ? token.trim() : ''
  if (!t) return { ok: false, reason: 'Please complete the human check and try again.', codes: ['missing-input-response'] }

  const body = new URLSearchParams({ secret, response: t, sitekey: HCAPTCHA_SITE_KEY })
  if (remoteip && /^[0-9a-fA-F:.]+$/.test(remoteip)) body.set('remoteip', remoteip)

  let data: { success?: boolean; 'error-codes'?: string[]; hostname?: string }
  try {
    const r = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    })
    data = await r.json()
  } catch (e) {
    /*
      hCaptcha itself is unreachable or slow. Refusing every signup because a
      third party is down trades a spam problem for an outage, so this passes
      and records WHY -- a silent catch here is how law #5 gets paid again.
    */
    console.error('[captcha] siteverify unreachable, allowing:', e instanceof Error ? e.message : String(e))
    return { ok: true, skipped: true }
  }

  if (data?.success) return { ok: true, skipped: false, hostname: data.hostname }

  // Log hCaptcha's own words, not a generic string.
  const codes = Array.isArray(data?.['error-codes']) ? data['error-codes']! : []
  console.error('[captcha] rejected:', codes.join(',') || 'no error-codes returned')

  /*
    A secret this deployment got wrong is OUR bug, not the visitor's. Blocking
    real people behind a misconfiguration is worse than letting the wave land,
    so these two codes pass and shout.
  */
  if (codes.includes('invalid-input-secret') || codes.includes('missing-input-secret')) {
    console.error('[captcha] HCAPTCHA_SECRET is wrong or unset for this deployment — allowing signup, FIX THE ENV VAR')
    return { ok: true, skipped: true }
  }

  const expired = codes.includes('expired-input-response') || codes.includes('timeout-or-duplicate')
  return {
    ok: false,
    reason: expired
      ? 'That human check expired. Please tick it again.'
      : 'The human check did not pass. Please try again.',
    codes,
  }
}
