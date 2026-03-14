import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface RawComment {
  id: string
  text: string
  authorName: string
  authorLinkedInId: string
  authorHeadline?: string
  postedAt: string
  postUrn: string
}

async function fetchCommentsForPost(
  postUrn: string,
  accessToken: string
): Promise<RawComment[]> {
  const encoded = encodeURIComponent(postUrn)
  const url = `https://api.linkedin.com/v2/socialActions/${encoded}/comments?start=0&count=50`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202308',
    },
  })

  if (!res.ok) throw new Error(`LinkedIn comments ${res.status}: ${await res.text()}`)

  const data = await res.json()
  return (data.elements || []).map((el: Record<string, unknown>) => {
    const msg = (el.message as Record<string, unknown>)?.text as string || ''
    const actor = el.actor as string || ''
    const d = el.actorDetails as Record<string, unknown> || {}
    const fn = (d.localizedFirstName as string) || ''
    const ln = (d.localizedLastName as string) || ''
    const hl = ((d.headline as Record<string, unknown>)?.localized as Record<string, string>)?.en_US || ''
    return {
      id: el.id as string,
      text: msg,
      authorName: `${fn} ${ln}`.trim() || 'LinkedIn Member',
      authorLinkedInId: actor.split(':').pop() || '',
      authorHeadline: hl || undefined,
      postedAt: new Date(el.created as number).toISOString(),
      postUrn,
    }
  })
}

export async function fetchNewCommentsForMember(memberId: string): Promise<{
  fetched: number
  new: number
  errors: string[]
}> {
  const admin = getAdmin()
  const results = { fetched: 0, new: 0, errors: [] as string[] }

  const { data: member } = await admin
    .from('linkedin_members')
    .select('linkedin_access_token, linkedin_id')
    .eq('id', memberId)
    .single()

  if (!member?.linkedin_access_token) {
    results.errors.push('No LinkedIn access token')
    return results
  }

  const { data: settings } = await admin
    .from('member_comment_settings')
    .select('monitoring_enabled, posts_to_monitor')
    .eq('member_id', memberId)
    .single()

  if (!settings?.monitoring_enabled) return results

  const { data: posts } = await admin
    .from('automated_posts')
    .select('id, linkedin_post_id')
    .eq('member_id', memberId)
    .not('linkedin_post_id', 'is', null)
    .order('posted_at', { ascending: false })
    .limit(settings?.posts_to_monitor || 10)

  if (!posts?.length) return results

  const { data: known } = await admin
    .from('post_comments')
    .select('linkedin_comment_id')
    .eq('member_id', memberId)

  const knownIds = new Set((known || []).map(c => c.linkedin_comment_id))

  for (const post of posts) {
    if (!post.linkedin_post_id) continue
    try {
      const comments = await fetchCommentsForPost(post.linkedin_post_id, member.linkedin_access_token)
      results.fetched += comments.length
      for (const c of comments) {
        if (knownIds.has(c.id)) continue
        await admin.from('post_comments').insert({
          member_id: memberId,
          post_id: post.id,
          linkedin_post_urn: post.linkedin_post_id,
          linkedin_comment_id: c.id,
          commenter_name: c.authorName,
          commenter_linkedin_id: c.authorLinkedInId || null,
          commenter_headline: c.authorHeadline || null,
          comment_text: c.text,
          comment_posted_at: c.postedAt,
        })
        results.new++
        knownIds.add(c.id)
      }
    } catch (err) {
      results.errors.push(`${post.linkedin_post_id}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }
  return results
}
