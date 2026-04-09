import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'node:crypto'
import { getCanvaAuthUrl } from '@/lib/canva/client'

const REDIRECT_URI = process.env.CANVA_REDIRECT_URI || 'https://0nmcp.com/api/canva/oauth/callback'

export async function GET() {
  const codeVerifier = crypto.randomBytes(64).toString('base64url')
  const state = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest()
    .toString('base64url')

  const cookieStore = await cookies()
  cookieStore.set('canva_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 })
  cookieStore.set('canva_verifier', codeVerifier, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 })

  const url = getCanvaAuthUrl(REDIRECT_URI, state, codeChallenge)
  return NextResponse.redirect(url)
}
