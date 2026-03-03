import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const redirect = searchParams.get('redirect') || '/0nboarding'

  if (code) {
    const supabase = await createSupabaseServer()
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Password recovery -> send to reset page
        if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }

        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const provider = user.app_metadata?.provider || 'email'
          const meta = user.user_metadata || {}

          // For LinkedIn signups: fire PACG pipeline
          if (provider === 'linkedin_oidc') {
            try {
              await handleLinkedInOnboarding(user.id, meta)
              const archetype = await getArchetypeTier(user.id)
              return NextResponse.redirect(
                `${origin}/0nboarding?provider=linkedin&archetype=${archetype || 'individual'}`
              )
            } catch {
              // Pipeline failed gracefully — still redirect to onboarding
              return NextResponse.redirect(`${origin}/0nboarding?provider=linkedin`)
            }
          }

          // For Google/GitHub: profile data auto-saved via trigger, redirect to onboarding
          if (provider === 'google' || provider === 'github') {
            // Check if returning user (onboarding already completed)
            const isReturning = await checkReturningUser(user.id)
            if (isReturning) {
              return NextResponse.redirect(`${origin}/console`)
            }
            return NextResponse.redirect(`${origin}/0nboarding?provider=${provider}`)
          }

          // Check if returning user for email auth too
          const isReturning = await checkReturningUser(user.id)
          if (isReturning && redirect === '/0nboarding') {
            return NextResponse.redirect(`${origin}/console`)
          }
        }

        return NextResponse.redirect(`${origin}${redirect}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

/**
 * Handle LinkedIn onboarding: create linkedin_members row + run PACG pipeline
 */
async function handleLinkedInOnboarding(userId: string, meta: Record<string, unknown>) {
  const admin = getAdminClient()
  if (!admin) return

  const firstName = (meta.full_name as string)?.split(' ')[0] || (meta.name as string)?.split(' ')[0] || ''
  const lastName = (meta.full_name as string)?.split(' ').slice(1).join(' ') || (meta.name as string)?.split(' ').slice(1).join(' ') || ''

  // Upsert linkedin_members row
  await admin.from('linkedin_members').upsert({
    user_id: userId,
    linkedin_id: (meta.sub as string) || (meta.provider_id as string) || userId,
    linkedin_name: `${firstName} ${lastName}`.trim() || 'Unknown',
    linkedin_headline: (meta.headline as string) || null,
    linkedin_avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
    linkedin_profile_url: null,
    linkedin_access_token: '', // OAuth token managed by Supabase
    onboarding_completed: false,
    automated_posting_enabled: false,
    posting_frequency: 'weekly',
    total_posts: 0,
    total_engagements: 0,
  }, { onConflict: 'user_id' })

  // Get the member ID
  const { data: member } = await admin
    .from('linkedin_members')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!member) return

  // Run PACG pipeline
  try {
    const { runOnboarding } = await import('@/lib/linkedin/pipeline/onboarding')
    await runOnboarding(member.id, {
      id: userId,
      localizedFirstName: firstName,
      localizedLastName: lastName,
      headline: (meta.headline as string) || undefined,
      industry: undefined,
      profilePicture: (meta.avatar_url as string) || (meta.picture as string) || undefined,
    })
  } catch {
    // PACG pipeline errors are non-fatal
  }
}

/**
 * Get the archetype tier for a LinkedIn member
 */
async function getArchetypeTier(userId: string): Promise<string | null> {
  const admin = getAdminClient()
  if (!admin) return null

  const { data } = await admin
    .from('linkedin_members')
    .select('archetype')
    .eq('user_id', userId)
    .single()

  if (!data?.archetype) return null
  const archetype = data.archetype as { tier?: string }
  return archetype.tier || null
}

/**
 * Check if a user has already completed onboarding
 */
async function checkReturningUser(userId: string): Promise<boolean> {
  const admin = getAdminClient()
  if (!admin) return false

  const { data } = await admin
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single()

  return data?.onboarding_completed === true
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}
