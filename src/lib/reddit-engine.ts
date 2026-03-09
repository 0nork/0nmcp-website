/**
 * Reddit Growth Engine — Learning Loop + Forum Cross-Pollination
 *
 * SCAN  → Find Reddit opportunities (keyword + subreddit monitoring)
 * DRAFT → Generate content using forum personas (zero API cost — pre-queued)
 * POST  → Submit to Reddit + create matching forum thread
 * TRACK → Check engagement scores periodically
 * LEARN → Adjust weights based on what works
 *
 * Cross-Pollination:
 * - Reddit hot topics → Forum discussion threads
 * - Forum trending threads → Adapted Reddit posts
 * - Shared persona voices across both platforms
 */

import { createClient } from '@supabase/supabase-js'
import { submitPost, submitComment, pickSubreddit } from './platforms/reddit'
import { injectBacklinks, BACKLINK_KEYPHRASES } from './personas'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _admin: any = null
function getAdmin(): any {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _admin
}

// =============================================================================
// Types
// =============================================================================

interface RedditOpportunity {
  id: string
  reddit_post_id: string
  subreddit: string
  title: string
  body: string | null
  author: string | null
  score: number
  num_comments: number
  permalink: string | null
  keywords_matched: string[]
  opportunity_type: string
  priority_score: number
  status: string
}

interface RedditContent {
  id: string
  opportunity_id: string | null
  content_type: string
  subreddit: string
  title: string | null
  body: string
  persona: string | null
  tone: string | null
  word_count: number
  includes_link: boolean
  link_url: string | null
  status: string
  reddit_post_id: string | null
  reddit_post_url: string | null
  posted_at: string | null
}

interface WeightRow {
  id: string
  dimension: string
  key: string
  weight: number
  total_posts: number
  total_score: number
  avg_score: number
}

// =============================================================================
// Constants
// =============================================================================

const SCAN_KEYWORDS = [
  'MCP server', 'model context protocol', 'AI orchestration',
  'API connector', 'workflow automation', 'Claude tools',
  'AI tools integration', 'multi-service AI', 'LLM tools',
  'AI API wrapper', 'n8n alternative', 'Zapier alternative',
  'AI agent tools', 'MCP protocol', 'agentic AI',
  'autonomous agents', 'AI workflow', 'AI automation',
]

const SCAN_SUBREDDITS = [
  'ClaudeAI', 'LocalLLaMA', 'artificial', 'SaaS', 'selfhosted',
  'webdev', 'node', 'programming', 'automation', 'MCP',
  'nocode', 'Entrepreneur', 'startups', 'devops',
]

/** Map Reddit content to a forum group */
const SUBREDDIT_TO_FORUM_GROUP: Record<string, string> = {
  ClaudeAI: 'integrations',
  LocalLLaMA: 'general',
  artificial: 'general',
  SaaS: 'showcase',
  selfhosted: 'integrations',
  webdev: 'tutorials',
  node: 'integrations',
  programming: 'general',
  automation: 'workflows',
  MCP: 'general',
  nocode: 'workflows',
  Entrepreneur: 'showcase',
  startups: 'showcase',
  devops: 'integrations',
}

/** Length bucket classifier */
function getLengthBucket(wordCount: number): string {
  if (wordCount < 150) return 'short_50_150'
  if (wordCount < 400) return 'medium_150_400'
  if (wordCount < 800) return 'long_400_800'
  return 'very_long_800_plus'
}

// =============================================================================
// 1. SCAN — Find Reddit Opportunities
// =============================================================================

/**
 * Scan Reddit for opportunities without using the Reddit API.
 * Uses JSON feeds (no auth required) to find posts matching our keywords.
 * Falls back gracefully if Reddit blocks requests.
 */
export async function scanRedditOpportunities(limit = 5): Promise<{
  found: number
  new: number
  errors: string[]
}> {
  const admin = getAdmin()
  const results = { found: 0, new: 0, errors: [] as string[] }

  // Pick 3 random subreddits per scan to avoid rate limits
  const shuffled = [...SCAN_SUBREDDITS].sort(() => Math.random() - 0.5)
  const targetSubs = shuffled.slice(0, 3)

  for (const sub of targetSubs) {
    try {
      // Use Reddit's public JSON API (no auth needed)
      const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=25`, {
        headers: { 'User-Agent': '0nMCP-Scanner/1.0' },
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) {
        results.errors.push(`r/${sub}: HTTP ${res.status}`)
        continue
      }

      const data = await res.json()
      const posts = data?.data?.children || []

      for (const child of posts) {
        const post = child.data
        if (!post || !post.id) continue

        const text = `${post.title || ''} ${post.selftext || ''}`.toLowerCase()
        const matched = SCAN_KEYWORDS.filter(kw => text.includes(kw.toLowerCase()))

        if (matched.length === 0) continue

        results.found++

        // Calculate priority: keyword matches * (1 + log(score+1)) * subreddit weight
        const weight = await getWeight('subreddit', sub)
        const priority = matched.length * (1 + Math.log(Math.max(post.score, 1) + 1)) * weight

        // Determine opportunity type
        const type = post.num_comments < 3 ? 'comment' : 'post'

        // Upsert — skip if already tracked
        const { error } = await admin
          .from('reddit_opportunities')
          .upsert({
            reddit_post_id: post.id,
            subreddit: sub,
            title: (post.title || '').slice(0, 500),
            body: (post.selftext || '').slice(0, 2000),
            author: post.author || null,
            score: post.score || 0,
            num_comments: post.num_comments || 0,
            permalink: post.permalink ? `https://reddit.com${post.permalink}` : null,
            keywords_matched: matched,
            opportunity_type: type,
            priority_score: Math.round(priority * 100) / 100,
            status: 'found',
          }, { onConflict: 'reddit_post_id' })

        if (!error) results.new++
      }

      // Rate limit between subreddits
      await delay(2000)
    } catch (err) {
      results.errors.push(`r/${sub}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  return results
}

// =============================================================================
// 2. DRAFT — Generate Content for Reddit (from pre-queued forum content)
// =============================================================================

/**
 * Draft Reddit content from a forum thread.
 * Adapts the forum post for Reddit (shorter, more casual, includes backlink).
 * This does NOT call the AI API — it reuses existing persona content.
 */
export async function draftFromForumThread(thread: {
  id: string
  title: string
  body: string
  slug: string
  category: string
  author_name: string
}): Promise<string | null> {
  const admin = getAdmin()

  // Pick the best subreddit based on category
  const subreddit = pickSubreddit(thread.category)

  // Adapt body for Reddit:
  // - Strip forum backlinks (we'll add Reddit-appropriate ones)
  // - Add a link back to the forum thread
  let redditBody = thread.body
    .replace(/\n\n---\n\*Discuss more at.*?\*/g, '') // Remove forum backlinks
    .trim()

  // Add Reddit-appropriate footer
  const keyphraseIdx = Math.abs(hashCode(thread.id)) % BACKLINK_KEYPHRASES.length
  const keyphrase = BACKLINK_KEYPHRASES[keyphraseIdx]
  redditBody += `\n\n---\n\nFull discussion on our forum: [${keyphrase}](https://0nmcp.com/forum/${thread.slug})`

  const wordCount = redditBody.split(/\s+/).length

  // Insert into reddit_content
  const { data, error } = await admin
    .from('reddit_content')
    .insert({
      content_type: 'post',
      subreddit,
      title: thread.title,
      body: redditBody,
      persona: thread.author_name,
      tone: 'casual',
      word_count: wordCount,
      includes_link: true,
      link_url: `https://0nmcp.com/forum/${thread.slug}`,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[reddit-engine] Failed to draft content:', error.message)
    return null
  }

  return data.id
}

/**
 * Draft a Reddit comment in response to an opportunity.
 * Reuses persona expertise to generate a helpful, non-promotional reply.
 */
export async function draftCommentForOpportunity(
  opportunity: RedditOpportunity,
  personaName: string,
  responseBody: string,
): Promise<string | null> {
  const admin = getAdmin()

  // Clean and adapt the response
  let body = responseBody
    .replace(/\n\n---\n\*Discuss more at.*?\*/g, '')
    .trim()

  // 50% chance to include a subtle backlink
  if (Math.random() > 0.5) {
    body += `\n\nI've been using [0nMCP](https://0nmcp.com) for this kind of thing — works well with ${opportunity.keywords_matched[0] || 'API orchestration'}.`
  }

  const wordCount = body.split(/\s+/).length

  const { data, error } = await admin
    .from('reddit_content')
    .insert({
      opportunity_id: opportunity.id,
      content_type: 'comment',
      subreddit: opportunity.subreddit,
      body,
      persona: personaName,
      tone: 'helpful',
      word_count: wordCount,
      includes_link: body.includes('0nmcp.com'),
      link_url: body.includes('0nmcp.com') ? 'https://0nmcp.com' : null,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[reddit-engine] Failed to draft comment:', error.message)
    return null
  }

  return data.id
}

// =============================================================================
// 3. POST — Submit to Reddit + Cross-Post to Forum
// =============================================================================

/**
 * Post approved content to Reddit and create a matching forum thread.
 * Returns the Reddit URL on success.
 */
export async function postToReddit(contentId: string): Promise<{
  success: boolean
  redditUrl?: string
  forumThreadId?: string
  error?: string
}> {
  const admin = getAdmin()

  // Fetch the content
  const { data: content, error: fetchErr } = await admin
    .from('reddit_content')
    .select('*')
    .eq('id', contentId)
    .eq('status', 'approved')
    .single()

  if (fetchErr || !content) {
    return { success: false, error: 'Content not found or not approved' }
  }

  const c = content as RedditContent

  try {
    let redditUrl: string | undefined
    let redditThingId: string | undefined

    if (c.content_type === 'post') {
      // Submit self-post
      const result = await submitPost(c.subreddit, c.title || 'Discussion', c.body)
      if (!result.success) {
        await admin.from('reddit_content').update({ status: 'failed' }).eq('id', contentId)
        return { success: false, error: result.error }
      }
      redditUrl = result.url
      redditThingId = result.id
    } else {
      // Submit comment on the original opportunity post
      if (!c.opportunity_id) {
        return { success: false, error: 'Comment has no opportunity_id' }
      }
      const { data: opp } = await admin
        .from('reddit_opportunities')
        .select('reddit_post_id')
        .eq('id', c.opportunity_id)
        .single()

      if (!opp) return { success: false, error: 'Opportunity not found' }

      const result = await submitComment(`t3_${opp.reddit_post_id}`, c.body)
      if (!result.success) {
        await admin.from('reddit_content').update({ status: 'failed' }).eq('id', contentId)
        return { success: false, error: result.error }
      }
      redditThingId = result.id
    }

    // Update content status
    await admin.from('reddit_content').update({
      status: 'posted',
      reddit_post_id: redditThingId || null,
      reddit_post_url: redditUrl || null,
      posted_at: new Date().toISOString(),
    }).eq('id', contentId)

    // Mark opportunity as engaged
    if (c.opportunity_id) {
      await admin.from('reddit_opportunities')
        .update({ status: 'engaged' })
        .eq('id', c.opportunity_id)
    }

    // Create initial engagement tracking row
    if (redditThingId) {
      await admin.from('reddit_engagement').insert({
        content_id: contentId,
        reddit_thing_id: redditThingId,
        check_number: 0,
        score: 0,
        num_replies: 0,
      })
    }

    // ===== CROSS-POST TO FORUM =====
    let forumThreadId: string | undefined
    if (c.content_type === 'post' && c.title) {
      forumThreadId = await crossPostToForum(c)
    }

    return { success: true, redditUrl, forumThreadId }
  } catch (err) {
    await admin.from('reddit_content').update({ status: 'failed' }).eq('id', contentId)
    return { success: false, error: err instanceof Error ? err.message : 'Post failed' }
  }
}

/**
 * Cross-post Reddit content to the 0nmcp.com forum.
 * Creates a matching forum thread using the same persona.
 */
async function crossPostToForum(content: RedditContent): Promise<string | undefined> {
  const admin = getAdmin()

  try {
    // Find the persona's profile
    const personaSlug = (content.persona || '').toLowerCase().replace(/\s+/g, '-')
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', `persona-${personaSlug}@0nmcp.internal`)
      .eq('is_persona', true)
      .single()

    if (!profile) {
      console.log(`[reddit-engine] No forum profile for persona "${content.persona}" — skipping forum cross-post`)
      return undefined
    }

    // Map subreddit to forum group
    const groupSlug = SUBREDDIT_TO_FORUM_GROUP[content.subreddit] || 'general'
    const { data: group } = await admin
      .from('community_groups')
      .select('id')
      .eq('slug', groupSlug)
      .single()

    // Adapt body for forum — add backlinks, reference Reddit discussion
    let forumBody = content.body
      .replace(/Full discussion on our forum:.*$/m, '') // Remove Reddit's forum link
      .trim()

    // Add forum backlinks
    forumBody = injectBacklinks(forumBody, hashCode(content.id))

    // Add Reddit cross-reference
    if (content.reddit_post_url) {
      forumBody += `\n\n*Also discussing this on [Reddit](${content.reddit_post_url}).*`
    }

    const slug = (content.title || 'discussion')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80) + '-' + Date.now().toString(36)

    const { data: thread, error } = await admin
      .from('community_threads')
      .insert({
        user_id: profile.id,
        title: content.title,
        slug,
        body: forumBody,
        category: groupSlug,
        group_id: group?.id || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[reddit-engine] Forum cross-post failed:', error.message)
      return undefined
    }

    // Auto-upvote from other personas
    await autoUpvoteThread(admin, thread.id, personaSlug)

    console.log(`[reddit-engine] Cross-posted to forum: /forum/${slug}`)
    return thread.id
  } catch (err) {
    console.error('[reddit-engine] Forum cross-post error:', err)
    return undefined
  }
}

// =============================================================================
// 4. TRACK — Check Engagement Scores
// =============================================================================

/**
 * Check engagement on posted Reddit content.
 * Fetches current scores, reply counts, and removal status.
 */
export async function trackEngagement(): Promise<{
  checked: number
  updated: number
  removed: number
  errors: string[]
}> {
  const admin = getAdmin()
  const results = { checked: 0, updated: 0, removed: 0, errors: [] as string[] }

  // Get content posted in the last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: content } = await admin
    .from('reddit_content')
    .select('id, subreddit, reddit_post_id, content_type')
    .eq('status', 'posted')
    .gte('posted_at', since)
    .limit(10)

  if (!content?.length) return results

  for (const c of content) {
    if (!c.reddit_post_id) continue

    try {
      // Fetch current Reddit data via public JSON API
      const thingId = c.reddit_post_id.replace('t3_', '').replace('t1_', '')
      const isComment = c.content_type === 'comment'
      const endpoint = isComment
        ? `https://www.reddit.com/api/info.json?id=t1_${thingId}`
        : `https://www.reddit.com/by_id/t3_${thingId}.json`

      const res = await fetch(endpoint, {
        headers: { 'User-Agent': '0nMCP-Tracker/1.0' },
        signal: AbortSignal.timeout(10000),
      })

      results.checked++

      if (!res.ok) {
        results.errors.push(`${c.id}: HTTP ${res.status}`)
        continue
      }

      const data = await res.json()
      const thing = data?.data?.children?.[0]?.data

      if (!thing) continue

      // Get current check number
      const { data: lastCheck } = await admin
        .from('reddit_engagement')
        .select('check_number')
        .eq('content_id', c.id)
        .order('check_number', { ascending: false })
        .limit(1)
        .single()

      const checkNum = (lastCheck?.check_number || 0) + 1
      const isRemoved = thing.removed_by_category != null || thing.body === '[removed]'

      await admin.from('reddit_engagement').insert({
        content_id: c.id,
        reddit_thing_id: c.reddit_post_id,
        check_number: checkNum,
        score: thing.score || 0,
        num_replies: thing.num_comments || 0,
        upvote_ratio: thing.upvote_ratio || null,
        is_removed: isRemoved,
      })

      results.updated++
      if (isRemoved) results.removed++

      await delay(2000) // Rate limit
    } catch (err) {
      results.errors.push(`${c.id}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  return results
}

// =============================================================================
// 5. LEARN — Adjust Weights Based on Performance
// =============================================================================

/**
 * Recalculate weights based on actual engagement data.
 * Higher-scoring content patterns get higher weights for future prioritization.
 */
export async function adjustWeights(): Promise<{
  adjusted: number
  dimensions: string[]
}> {
  const admin = getAdmin()
  const results = { adjusted: 0, dimensions: [] as string[] }

  // Get all posted content with their latest engagement scores
  const { data: performance } = await admin
    .from('reddit_content')
    .select(`
      id, subreddit, content_type, tone, word_count, posted_at,
      reddit_engagement(score, num_replies, is_removed, check_number)
    `)
    .eq('status', 'posted')
    .not('posted_at', 'is', null)
    .limit(200)

  if (!performance?.length) return results

  // Build dimension aggregates
  const aggregates: Record<string, Record<string, { total: number; scores: number[]; count: number }>> = {
    subreddit: {},
    content_type: {},
    tone: {},
    length: {},
    hour: {},
  }

  for (const item of performance) {
    // Get the latest engagement score
    const engagements = (item.reddit_engagement || []) as Array<{
      score: number; num_replies: number; is_removed: boolean; check_number: number
    }>
    if (engagements.length === 0) continue

    const latest = engagements.reduce((a, b) => a.check_number > b.check_number ? a : b)
    if (latest.is_removed) continue // Don't learn from removed content

    const score = latest.score + latest.num_replies * 2 // Replies worth 2x upvotes

    // Aggregate by subreddit
    const sub = item.subreddit as string
    if (!aggregates.subreddit[sub]) aggregates.subreddit[sub] = { total: 0, scores: [], count: 0 }
    aggregates.subreddit[sub].total += score
    aggregates.subreddit[sub].scores.push(score)
    aggregates.subreddit[sub].count++

    // Aggregate by content type
    const type = item.content_type as string
    if (!aggregates.content_type[type]) aggregates.content_type[type] = { total: 0, scores: [], count: 0 }
    aggregates.content_type[type].total += score
    aggregates.content_type[type].scores.push(score)
    aggregates.content_type[type].count++

    // Aggregate by tone
    const tone = (item.tone as string) || 'casual'
    if (!aggregates.tone[tone]) aggregates.tone[tone] = { total: 0, scores: [], count: 0 }
    aggregates.tone[tone].total += score
    aggregates.tone[tone].scores.push(score)
    aggregates.tone[tone].count++

    // Aggregate by length bucket
    const bucket = getLengthBucket(item.word_count as number)
    if (!aggregates.length[bucket]) aggregates.length[bucket] = { total: 0, scores: [], count: 0 }
    aggregates.length[bucket].total += score
    aggregates.length[bucket].scores.push(score)
    aggregates.length[bucket].count++

    // Aggregate by hour
    if (item.posted_at) {
      const hour = String(new Date(item.posted_at as string).getUTCHours())
      if (!aggregates.hour[hour]) aggregates.hour[hour] = { total: 0, scores: [], count: 0 }
      aggregates.hour[hour].total += score
      aggregates.hour[hour].scores.push(score)
      aggregates.hour[hour].count++
    }
  }

  // Update weights
  for (const [dimension, keys] of Object.entries(aggregates)) {
    for (const [key, agg] of Object.entries(keys)) {
      if (agg.count < 2) continue // Need at least 2 data points

      const avgScore = agg.total / agg.count

      // Weight formula: sigmoid-like — maps avg score to 0.2–2.0 range
      // avgScore of 0 → weight 0.5, avgScore of 10 → weight 1.5, avgScore of 50+ → weight 2.0
      const newWeight = Math.max(0.2, Math.min(2.0, 0.5 + (avgScore / (avgScore + 10)) * 1.5))

      const { error } = await admin
        .from('reddit_weights')
        .upsert({
          dimension,
          key,
          weight: Math.round(newWeight * 10000) / 10000,
          total_posts: agg.count,
          total_score: agg.total,
          avg_score: Math.round(avgScore * 100) / 100,
          last_adjusted: new Date().toISOString(),
        }, { onConflict: 'dimension,key' })

      if (!error) results.adjusted++
    }

    if (Object.keys(keys).length > 0) results.dimensions.push(dimension)
  }

  return results
}

// =============================================================================
// 6. FORUM → REDDIT Cross-Pollination
// =============================================================================

/**
 * Find trending forum threads that haven't been posted to Reddit yet.
 * A thread is "trending" if it has 3+ upvotes or 2+ replies within 24h.
 */
export async function findForumThreadsForReddit(limit = 3): Promise<Array<{
  id: string
  title: string
  body: string
  slug: string
  category: string
  author_name: string
  score: number
}>> {
  const admin = getAdmin()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Get recent threads with good engagement
  const { data: threads } = await admin
    .from('community_threads')
    .select('id, title, body, slug, category, score, reply_count, user_id, profiles(full_name)')
    .gte('created_at', since)
    .or('score.gte.3,reply_count.gte.2')
    .order('score', { ascending: false })
    .limit(limit * 2) // Fetch extra in case some are already posted

  if (!threads?.length) return []

  // Filter out threads already cross-posted to Reddit
  const threadIds = threads.map((t: Record<string, unknown>) => t.id as string)
  const { data: existing } = await admin
    .from('reddit_content')
    .select('id')
    .in('title', threads.map((t: Record<string, unknown>) => t.title as string))
    .eq('content_type', 'post')

  const existingTitles = new Set((existing || []).map((e: Record<string, unknown>) => e.id))

  return threads
    .filter((t: Record<string, unknown>) => !existingTitles.has(t.id as string))
    .slice(0, limit)
    .map((t: Record<string, unknown>) => ({
      id: t.id as string,
      title: t.title as string,
      body: t.body as string,
      slug: t.slug as string,
      category: (t.category as string) || 'general',
      author_name: ((t as Record<string, unknown>).profiles as Record<string, unknown>)?.full_name as string || 'Community Member',
      score: t.score as number,
    }))
}

/**
 * Find Reddit opportunities and create matching forum discussion threads.
 * Hot Reddit topics become forum discussions for SEO + community engagement.
 */
export async function redditToForum(limit = 2): Promise<{
  created: number
  errors: string[]
}> {
  const admin = getAdmin()
  const results = { created: 0, errors: [] as string[] }

  // Get high-priority unfulfilled opportunities
  const { data: opportunities } = await admin
    .from('reddit_opportunities')
    .select('*')
    .eq('status', 'found')
    .gte('priority_score', 3)
    .order('priority_score', { ascending: false })
    .limit(limit)

  if (!opportunities?.length) return results

  for (const opp of opportunities) {
    try {
      // Find a random persona to create the forum thread
      const { data: persona } = await admin
        .from('community_personas')
        .select('slug, name')
        .eq('is_active', true)
        .limit(5)

      if (!persona?.length) continue

      const p = persona[Math.floor(Math.random() * persona.length)]

      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', `persona-${p.slug}@0nmcp.internal`)
        .eq('is_persona', true)
        .single()

      if (!profile) continue

      // Map subreddit to forum group
      const groupSlug = SUBREDDIT_TO_FORUM_GROUP[opp.subreddit] || 'general'
      const { data: group } = await admin
        .from('community_groups')
        .select('id')
        .eq('slug', groupSlug)
        .single()

      // Create a discussion-starter forum thread inspired by the Reddit post
      const title = `Discussion: ${(opp.title as string).slice(0, 100)}`
      let body = `Saw an interesting discussion on r/${opp.subreddit} about this — wanted to bring it here.\n\n`
      body += `**Original topic:** ${opp.title}\n\n`

      if (opp.body) {
        // Include a relevant excerpt (not the whole thing)
        const excerpt = (opp.body as string).slice(0, 300)
        body += `> ${excerpt}${(opp.body as string).length > 300 ? '...' : ''}\n\n`
      }

      body += `What are your thoughts? Has anyone here dealt with ${(opp.keywords_matched as string[])[0] || 'this'}?`
      body = injectBacklinks(body, hashCode(opp.id as string))

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80) + '-' + Date.now().toString(36)

      const { error } = await admin
        .from('community_threads')
        .insert({
          user_id: profile.id,
          title,
          slug,
          body,
          category: groupSlug,
          group_id: group?.id || null,
        })

      if (error) {
        results.errors.push(`${opp.id}: ${error.message}`)
        continue
      }

      // Mark opportunity as forum-posted
      await admin.from('reddit_opportunities')
        .update({ status: 'forum_posted' })
        .eq('id', opp.id)

      results.created++
    } catch (err) {
      results.errors.push(`${opp.id}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  return results
}

// =============================================================================
// 7. Weight Lookup + Helpers
// =============================================================================

async function getWeight(dimension: string, key: string): Promise<number> {
  const admin = getAdmin()
  const { data } = await admin
    .from('reddit_weights')
    .select('weight')
    .eq('dimension', dimension)
    .eq('key', key)
    .single()

  return (data as WeightRow | null)?.weight ?? 1.0
}

/**
 * Get top-performing dimensions for content strategy
 */
export async function getTopWeights(dimension: string, limit = 5): Promise<WeightRow[]> {
  const admin = getAdmin()
  const { data } = await admin
    .from('reddit_weights')
    .select('*')
    .eq('dimension', dimension)
    .order('weight', { ascending: false })
    .limit(limit)

  return (data || []) as WeightRow[]
}

/**
 * Get the full performance dashboard data
 */
export async function getPerformanceDashboard(): Promise<{
  totalOpportunities: number
  totalContent: number
  totalPosted: number
  totalEngagements: number
  avgScore: number
  topSubreddits: WeightRow[]
  topContentTypes: WeightRow[]
  topTones: WeightRow[]
  recentContent: RedditContent[]
}> {
  const admin = getAdmin()

  const [opps, content, posted, engagements, topSubs, topTypes, topTones, recent] = await Promise.all([
    admin.from('reddit_opportunities').select('id', { count: 'exact', head: true }),
    admin.from('reddit_content').select('id', { count: 'exact', head: true }),
    admin.from('reddit_content').select('id', { count: 'exact', head: true }).eq('status', 'posted'),
    admin.from('reddit_engagement').select('score').not('score', 'is', null),
    getTopWeights('subreddit'),
    getTopWeights('content_type'),
    getTopWeights('tone'),
    admin.from('reddit_content').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const scores = ((engagements.data || []) as Array<{ score: number }>).map(e => e.score)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  return {
    totalOpportunities: opps.count || 0,
    totalContent: content.count || 0,
    totalPosted: posted.count || 0,
    totalEngagements: scores.length,
    avgScore: Math.round(avgScore * 100) / 100,
    topSubreddits: topSubs,
    topContentTypes: topTypes,
    topTones: topTones,
    recentContent: (recent.data || []) as RedditContent[],
  }
}

// =============================================================================
// Utility
// =============================================================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return hash
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function autoUpvoteThread(admin: any, threadId: string, excludeSlug: string) {
  try {
    const { data: personas } = await admin
      .from('community_personas')
      .select('slug')
      .eq('is_active', true)
      .neq('slug', excludeSlug)
      .limit(10)

    if (!personas || personas.length < 2) return

    const shuffled = personas.sort(() => Math.random() - 0.5).slice(0, 2)

    for (const p of shuffled) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', `persona-${p.slug}@0nmcp.internal`)
        .eq('is_persona', true)
        .single()

      if (!profile) continue

      await admin.from('community_votes').upsert({
        user_id: profile.id,
        thread_id: threadId,
        vote: 1,
      }, { onConflict: 'user_id,thread_id' })
    }

    const { data: votes } = await admin
      .from('community_votes')
      .select('vote')
      .eq('thread_id', threadId)

    if (votes) {
      const score = votes.reduce((sum: number, v: { vote: number }) => sum + v.vote, 0)
      await admin.from('community_threads').update({ score }).eq('id', threadId)
    }
  } catch (err) {
    console.error('[reddit-engine] autoUpvote error:', err)
  }
}
