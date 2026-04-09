import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { exchangeCanvaToken, storeCanvaToken, getUserProfile } from '@/lib/canva/client'

const REDIRECT_URI = process.env.CANVA_REDIRECT_URI || 'https://0nmcp.com/api/canva/oauth/callback'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect('https://0nmcp.com/console/integrations?error=canva_denied')
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get('canva_state')?.value
  const codeVerifier = cookieStore.get('canva_verifier')?.value

  if (!savedState || savedState !== state) {
    return NextResponse.redirect('https://0nmcp.com/console/integrations?error=canva_state_mismatch')
  }

  if (!code || !codeVerifier) {
    return NextResponse.redirect('https://0nmcp.com/console/integrations?error=canva_missing_params')
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCanvaToken(code, codeVerifier, REDIRECT_URI)

    // Get user from session cookie
    const authCookie = req.cookies.get('sb-pwujhhmlrtxjmjzyttwn-auth-token')?.value
      || req.cookies.get('sb-pwujhhmlrtxjmjzyttwn-auth-token.0')?.value

    let userId: string | null = null

    if (authCookie) {
      try {
        const parsed = JSON.parse(authCookie)
        const { data } = await supabase.auth.getUser(parsed?.access_token || parsed?.[0])
        userId = data.user?.id ?? null
      } catch {
        // Try direct token
        const { data } = await supabase.auth.getUser(authCookie)
        userId = data.user?.id ?? null
      }
    }

    if (!userId) {
      return NextResponse.redirect('https://0nmcp.com/console/integrations?error=canva_no_session')
    }

    // Store tokens
    await storeCanvaToken(userId, tokens)

    // Get Canva user profile and update
    try {
      const profile = await getUserProfile(userId)
      await supabase.from('canva_tokens').update({
        canva_user_id: profile?.user?.id,
        canva_display_name: profile?.user?.display_name,
      }).eq('user_id', userId)
    } catch { /* non-fatal */ }

    // Clean up cookies
    cookieStore.delete('canva_state')
    cookieStore.delete('canva_verifier')

    return NextResponse.redirect('https://0nmcp.com/console/integrations?success=canva_connected')
  } catch (err) {
    console.error('Canva OAuth error:', err)
    return NextResponse.redirect('https://0nmcp.com/console/integrations?error=canva_token_failed')
  }
}
