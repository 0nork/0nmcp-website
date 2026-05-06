import { BlogPost } from './types'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * Generate a URL-safe slug from a title, ensuring uniqueness.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/**
 * Build the canonical row for blog_posts. Centralized so saveDraft + publishPost
 * + publishOne all write the same shape — and importantly, write to BOTH `body`
 * and `content` columns. The /blog/[slug] page reads from `body`.
 *
 * Bug fix 2026-05-06: a previous batch of v4.10 launch posts only populated
 * `content`, which left every page rendering an empty body. Mike caught it.
 * This shape mirrors content → body so the bug can't recur.
 */
function buildRow(post: BlogPost, slug: string, opts: { publish: boolean }) {
  const now = new Date().toISOString()
  return {
    title: post.title,
    slug,
    content: post.content,
    body: post.body || post.content, // critical
    excerpt: post.excerpt || post.metaDescription?.slice(0, 160) || '',
    image: post.image || null,
    meta_description: post.metaDescription,
    target_query: post.targetQuery,
    bucket: post.bucket,
    word_count: post.wordCount,
    category: 'AI Search',
    author: 'RocketOpp',
    author_title: '0nMCP team',
    tags: ['ai-search', 'sxo', post.bucket?.toLowerCase()].filter(Boolean),
    source: 'cro9-daily',
    status: opts.publish ? 'published' : 'draft',
    published_at: opts.publish ? now : null,
    updated_at: now,
  }
}

export async function saveDraft(post: BlogPost): Promise<string> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  const slug = post.slug || slugify(post.title)
  const row = buildRow(post, slug, { publish: false })

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(row)
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      const uniqueSlug = `${slug}-${Date.now().toString(36)}`
      const { data: retryData, error: retryError } = await supabase
        .from('blog_posts')
        .insert(buildRow(post, uniqueSlug, { publish: false }))
        .select('id')
        .single()
      if (retryError) throw new Error(`Failed to save draft: ${retryError.message}`)
      return retryData.id
    }
    throw new Error(`Failed to save draft: ${error.message}`)
  }
  return data.id
}

/**
 * Save AND publish a post in a single insert. Used by the daily cron's
 * one-a-day auto-publish path: top-scoring brief gets published immediately,
 * the others save as drafts.
 */
export async function savePublished(post: BlogPost): Promise<{ id: string; slug: string }> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  const slug = post.slug || slugify(post.title)
  const row = buildRow(post, slug, { publish: true })

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(row)
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') {
      const uniqueSlug = `${slug}-${Date.now().toString(36)}`
      const { data: retryData, error: retryError } = await supabase
        .from('blog_posts')
        .insert(buildRow(post, uniqueSlug, { publish: true }))
        .select('id, slug')
        .single()
      if (retryError) throw new Error(`Failed to publish: ${retryError.message}`)
      return retryData
    }
    throw new Error(`Failed to publish: ${error.message}`)
  }
  return data
}

export async function publishPost(post: BlogPost): Promise<string> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  if (post.id) {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: now,
        updated_at: now,
        title: post.title,
        content: post.content,
        body: post.body || post.content, // critical — re-mirror on publish
        excerpt: post.excerpt,
        image: post.image,
        meta_description: post.metaDescription,
      })
      .eq('id', post.id)
      .select('slug')
      .single()
    if (error) throw new Error(`Failed to publish: ${error.message}`)
    return data.slug
  }

  const result = await savePublished(post)
  return result.slug
}

export async function publishPostById(postId: string): Promise<{
  slug: string
  title: string
  publishedAt: string
}> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  // Re-mirror content → body on publish in case the row was originally
  // saved before the fix.
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('content, body')
    .eq('id', postId)
    .single()

  const publishedAt = new Date().toISOString()
  const update: Record<string, unknown> = {
    status: 'published',
    published_at: publishedAt,
    updated_at: publishedAt,
  }
  if (existing && (!existing.body || existing.body.length < 200) && existing.content) {
    update.body = existing.content
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(update)
    .eq('id', postId)
    .select('slug, title')
    .single()

  if (error) throw new Error(`Failed to publish: ${error.message}`)
  return { slug: data.slug, title: data.title, publishedAt }
}
