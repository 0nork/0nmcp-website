import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePost } from '@/lib/linkedin/pipeline/post-generator'
import { processExpiredWindows } from '@/lib/linkedin/lvos/observer'
import { runPlateauCycle } from '@/lib/linkedin/lvos/plateau-detector'
import type { Archetype } from '@/lib/linkedin/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const results = {
    postsGenerated: 0,
    postsPublished: 0,
    windowsProcessed: 0,
    plateauResult: null as null | { plateauDetected: boolean; newVariantsCreated: number },
    errors: [] as string[],
  }

  const admin = getAdmin()

  try {
    // 1. Process expired LVOS observation windows
    results.windowsProcessed = await processExpiredWindows()
  } catch (err) {
    results.errors.push(`LVOS windows: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  try {
    // 2. Run plateau detection cycle
    const plateau = await runPlateauCycle()
    results.plateauResult = {
      plateauDetected: plateau.plateauDetected,
      newVariantsCreated: plateau.newVariantsCreated,
    }
  } catch (err) {
    results.errors.push(`Plateau cycle: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  try {
    // 3. Generate and publish automated posts
    const { data: members } = await admin
      .from('linkedin_members')
      .select('*')
      .eq('automated_posting_enabled', true)

    if (members && members.length > 0) {
      for (const member of members) {
        // Check if it's time to post based on frequency
        const shouldPost = checkPostingSchedule(member.posting_frequency, member.last_post_at)
        if (!shouldPost) continue

        const archetype = member.archetype as Archetype
        if (!archetype) continue

        try {
          // Generate post
          const post = await generatePost({ archetype })
          if (!post.valid) continue

          results.postsGenerated++

          // Publish to LinkedIn
          const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${member.linkedin_access_token}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify({
              author: `urn:li:person:${member.linkedin_id}`,
              lifecycleState: 'PUBLISHED',
              specificContent: {
                'com.linkedin.ugc.ShareContent': {
                  shareCommentary: { text: post.content },
                  shareMediaCategory: 'NONE',
                },
              },
              visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
              },
            }),
          })

          if (res.ok) {
            const data = await res.json()
            results.postsPublished++

            // Record automated post
            await admin.from('automated_posts').insert({
              member_id: member.id,
              content: post.content,
              linkedin_post_id: data.id || null,
              posted_at: new Date().toISOString(),
            })

            // Update member stats
            await admin.rpc('increment_member_posts', { mid: member.id })
          }
        } catch (err) {
          results.errors.push(`Post for ${member.id}: ${err instanceof Error ? err.message : 'unknown'}`)
        }
      }
    }
  } catch (err) {
    results.errors.push(`Auto-posting: ${err instanceof Error ? err.message : 'unknown'}`)
  }

  return NextResponse.json(results)
}

function checkPostingSchedule(frequency: string, lastPostAt: string | null): boolean {
  if (!lastPostAt) return true

  const lastPost = new Date(lastPostAt)
  const now = new Date()
  const hoursSince = (now.getTime() - lastPost.getTime()) / (1000 * 60 * 60)

  switch (frequency) {
    case 'daily': return hoursSince >= 22
    case 'weekly': return hoursSince >= 156 // ~6.5 days
    case 'biweekly': return hoursSince >= 312 // ~13 days
    default: return hoursSince >= 156
  }
}
