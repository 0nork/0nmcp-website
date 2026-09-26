'use client'

/**
 * The hCaptcha checkbox for sign-in — because the auth project demands one.
 *
 * Found 2026-09-25 from the 0n3 sign-in form: "captcha protection: request
 * disallowed (no captcha_token found)". That is Supabase Auth talking. Captcha
 * protection is a PROJECT-WIDE switch on pwujhhmlrtxjmjzyttwn, turned on
 * 2026-09-15 for 0nCore's sign-up, and once on, every password grant from
 * every client on the project must carry a token — this site's /login called
 * signInWithPassword from the browser with none, so it has been refused since.
 *
 * A port of 0nCore's components/security/HCaptchaBox.tsx with the same PUBLIC
 * site key, so the one secret in the Supabase dashboard verifies both. A page
 * where the script is blocked reports `configured:false` and the form submits
 * without a token: the server enforces, and a wall of nothing is worse than
 * its error. Tokens are single-use — `reset()` after a rejected attempt.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

declare global {
  interface Window { hcaptcha?: any; __hcaptchaLoading?: Promise<void> }
}

export const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '6588d920-772a-457e-96e6-8a285098d46a'
const SCRIPT = 'https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off'

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.hcaptcha) return Promise.resolve()
  if (window.__hcaptchaLoading) return window.__hcaptchaLoading
  window.__hcaptchaLoading = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = SCRIPT
    el.async = true
    el.defer = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error('hCaptcha script blocked or unreachable'))
    document.head.appendChild(el)
  })
  return window.__hcaptchaLoading
}

export interface HCaptchaHandle { reset: () => void }
export interface HCaptchaBoxProps {
  onToken: (token: string | null, meta: { configured: boolean }) => void
  theme?: 'light' | 'dark'
  className?: string
}

const HCaptchaBox = forwardRef<HCaptchaHandle, HCaptchaBoxProps>(function HCaptchaBox({ onToken, theme = 'light', className }, ref) {
  const box = useRef<HTMLDivElement | null>(null)
  const widget = useRef<string | null>(null)
  const cb = useRef(onToken)
  cb.current = onToken
  const [failed, setFailed] = useState(false)

  useImperativeHandle(ref, () => ({
    reset() {
      try { if (widget.current !== null && window.hcaptcha) window.hcaptcha.reset(widget.current) } catch { /* gone */ }
      cb.current(null, { configured: true })
    },
  }), [])

  useEffect(() => {
    let dead = false
    if (!HCAPTCHA_SITE_KEY) { cb.current(null, { configured: false }); return }
    loadScript()
      .then(() => {
        if (dead || !box.current || !window.hcaptcha) return
        box.current.innerHTML = ''
        widget.current = window.hcaptcha.render(box.current, {
          sitekey: HCAPTCHA_SITE_KEY,
          theme,
          callback: (t: string) => cb.current(t, { configured: true }),
          'expired-callback': () => cb.current(null, { configured: true }),
          'error-callback': () => cb.current(null, { configured: true }),
        })
      })
      .catch(() => { if (dead) return; setFailed(true); cb.current(null, { configured: false }) })
    return () => {
      dead = true
      try { if (widget.current !== null && window.hcaptcha) window.hcaptcha.remove(widget.current) } catch { /* already gone */ }
      widget.current = null
    }
  }, [theme])

  if (!HCAPTCHA_SITE_KEY || failed) return null
  return <div ref={box} className={className} />
})

export default HCaptchaBox
