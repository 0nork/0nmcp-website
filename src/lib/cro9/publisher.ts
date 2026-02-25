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
 * Save a blog post draft to Supabase.
 * Creates a new row in the blog_posts table with status = 'draft'.
 *
 * @param post - The blog post to save
 * @returns The ID of the saved post
 */
export async function saveDraft(post: BlogPost): Promise<string> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  const slug = post.slug || slugify(post.title)

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      slug,
      content: post.content,
      meta_description: post.metaDescription,
      target_query: post.targetQuery,
      bucket: post.bucket,
      word_count: post.wordCount,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    // If slug collision, append a random suffix and retry
    if (error.code === '23505') {
      const uniqueSlug = `${slug}-${Date.now().toString(36)}`
      const { data: retryData, error: retryError } = await supabase
        .from('blog_posts')
        .insert({
          title: post.title,
          slug: uniqueSlug,
          content: post.content,
          meta_description: post.metaDescription,
          target_query: post.targetQuery,
          bucket: post.bucket,
          word_count: post.wordCount,
          status: 'draft',
        })
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
 * Publish a blog post by updating its status and publish date.
 *
 * @param postId - The UUID of the post to publish
 * @returns The published post's slug for URL generation
 */
export async function publishPost(post: BlogPost): Promise<string> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  // If the post has an ID, update it
  if (post.id) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        title: post.title,
        content: post.content,
        meta_description: post.metaDescription,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id)
      .select('slug')
      .single()

    if (error) throw new Error(`Failed to publish: ${error.message}`)
    return data.slug
  }

  // Otherwise, save and publish in one step
  const slug = post.slug || slugify(post.title)

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      slug,
      content: post.content,
      meta_description: post.metaDescription,
      target_query: post.targetQuery,
      bucket: post.bucket,
      word_count: post.wordCount,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .select('slug')
    .single()

  if (error) throw new Error(`Failed to publish: ${error.message}`)
  return data.slug
}

/**
 * Publish a post by its ID (update status to published).
 */
export async function publishPostById(postId: string): Promise<{
  slug: string
  title: string
  publishedAt: string
}> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  const publishedAt = new Date().toISOString()

  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      status: 'published',
      published_at: publishedAt,
      updated_at: publishedAt,
    })
    .eq('id', postId)
    .select('slug, title')
    .single()

  if (error) throw new Error(`Failed to publish: ${error.message}`)

  return {
    slug: data.slug,
    title: data.title,
    publishedAt,
  }
}

/**
 * Get all blog posts with optional status filter.
 */
export async function getPosts(
  status?: string,
  limit: number = 50
): Promise<BlogPost[]> {
  const supabase = await createSupabaseServer()
  if (!supabase) throw new Error('Supabase not configured')

  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to fetch posts: ${error.message}`)

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    metaDescription: row.meta_description,
    targetQuery: row.target_query,
    bucket: row.bucket,
    wordCount: row.word_count,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }))
}
