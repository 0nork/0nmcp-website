import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ThreadClient from './ThreadClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

function reputationColor(level?: string) {
  switch (level) {
    case 'legend': return '#ff69b4'
    case 'expert': return '#FFD700'
    case 'power_user': return '#ff6b35'
    case 'contributor': return '#9945ff'
    case 'member': return '#00d4ff'
    default: return 'var(--text-muted)'
  }
}

function reputationLabel(level?: string) {
  switch (level) {
    case 'legend': return 'Legend'
    case 'expert': return 'Expert'
    case 'power_user': return 'Power User'
    case 'contributor': return 'Contributor'
    case 'member': return 'Member'
    default: return null
  }
}

function authorName(p?: { full_name: string | null; email: string }) {
  return p?.full_name || p?.email?.split('@')[0] || 'Anonymous'
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

interface ThreadData {
  id: string
  title: string
  slug: string
  category: string
  body: string
  is_pinned: boolean
  is_locked: boolean
  reply_count: number
  view_count: number
  score: number
  created_at: string
  user_id: string
  group_id: string | null
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string }
  community_groups?: { name: string; slug: string; icon: string | null; color: string } | null
}

interface PostData {
  id: string
  body: string
  is_solution: boolean
  score: number
  created_at: string
  parent_post_id: string | null
  user_id: string
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string }
}

async function getThread(slug: string) {
  const admin = getAdmin()
  if (!admin) return null

  const { data: thread } = await admin
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_user_id_fkey(full_name, email, karma, reputation_level, avatar_url),
      community_groups!community_threads_group_id_fkey(name, slug, icon, color)
    `)
    .eq('slug', slug)
    .single()

  if (!thread) return null

  // Increment view count (fire and forget)
  admin.rpc('increment_view_count', { thread_id: thread.id }).then()

  const { data: posts } = await admin
    .from('community_posts')
    .select('*, profiles!community_posts_user_id_fkey(full_name, email, karma, reputation_level, avatar_url)')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })

  return { thread: thread as ThreadData, posts: (posts || []) as PostData[] }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getThread(slug)

  if (!data) {
    return { title: 'Thread Not Found — 0nMCP Forum' }
  }

  const { thread } = data
  const description = thread.body.slice(0, 155).replace(/\n/g, ' ')

  return {
    title: `${thread.title} — 0nMCP Forum`,
    description,
    openGraph: {
      title: `${thread.title} — 0nMCP Forum`,
      description,
      url: `https://0nmcp.com/forum/${thread.slug}`,
      type: 'article',
    },
    alternates: { canonical: `https://0nmcp.com/forum/${thread.slug}` },
  }
}

export default async function ThreadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getThread(slug)

  if (!data) notFound()

  const { thread, posts } = data
  const groupData = thread.community_groups
  const repLabel = reputationLabel(thread.profiles?.reputation_level)
  const isHelpGroup = groupData?.slug === 'help'
  const solutionPost = posts.find(p => p.is_solution)

  // JSON-LD
  const threadUrl = `https://0nmcp.com/forum/${thread.slug}`
  const authorUrl = `https://0nmcp.com/u/${thread.user_id}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Forum', item: 'https://0nmcp.com/forum' },
      ...(groupData ? [{ '@type': 'ListItem', position: 3, name: groupData.name, item: `https://0nmcp.com/forum?group=${groupData.slug}` }] : []),
      { '@type': 'ListItem', position: groupData ? 4 : 3, name: thread.title, item: threadUrl },
    ],
  }

  let mainJsonLd: Record<string, unknown>

  if (isHelpGroup) {
    mainJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      mainEntity: {
        '@type': 'Question',
        name: thread.title,
        text: thread.body,
        dateCreated: thread.created_at,
        author: { '@type': 'Person', name: authorName(thread.profiles), url: authorUrl },
        answerCount: thread.reply_count,
        ...(solutionPost ? {
          acceptedAnswer: {
            '@type': 'Answer',
            text: solutionPost.body,
            dateCreated: solutionPost.created_at,
            author: {
              '@type': 'Person',
              name: authorName(solutionPost.profiles),
              url: `https://0nmcp.com/u/${solutionPost.user_id}`,
            },
            upvoteCount: solutionPost.score,
          },
        } : {}),
        ...(posts.length > 0 && !solutionPost ? {
          suggestedAnswer: posts.slice(0, 3).map(p => ({
            '@type': 'Answer',
            text: p.body,
            dateCreated: p.created_at,
            author: { '@type': 'Person', name: authorName(p.profiles), url: `https://0nmcp.com/u/${p.user_id}` },
            upvoteCount: p.score,
          })),
        } : {}),
      },
    }
  } else {
    mainJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'DiscussionForumPosting',
      headline: thread.title,
      text: thread.body,
      datePublished: thread.created_at,
      url: threadUrl,
      author: { '@type': 'Person', name: authorName(thread.profiles), url: authorUrl },
      interactionStatistic: [
        { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: thread.score },
        { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: thread.reply_count },
      ],
      ...(posts.length > 0 ? {
        comment: posts.filter(p => !p.parent_post_id).slice(0, 5).map(p => ({
          '@type': 'Comment',
          text: p.body,
          dateCreated: p.created_at,
          author: { '@type': 'Person', name: authorName(p.profiles), url: `https://0nmcp.com/u/${p.user_id}` },
          upvoteCount: p.score,
        })),
      } : {}),
    }
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(mainJsonLd) }} />

        {/* Breadcrumb */}
        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/forum" className="hover:underline">Forum</Link>
          {groupData && (
            <>
              <span>/</span>
              <Link href={`/forum?group=${groupData.slug}`} className="hover:underline" style={{ color: groupData.color }}>
                {groupData.icon} {groupData.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate">{thread.title}</span>
        </nav>

        {/* Thread — server-rendered content for SEO */}
        <article
          className="rounded-xl mb-6 flex"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Content */}
          <div className="py-4 px-5 flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2 text-[11px]">
              {groupData && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: groupData.color + '15', color: groupData.color }}>
                  {groupData.icon} {groupData.name}
                </span>
              )}
              {thread.is_pinned && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>Pinned</span>
              )}
              <span style={{ color: 'var(--text-muted)' }}>
                Posted by{' '}
                <Link
                  href={`/u/${thread.user_id}`}
                  className="font-bold no-underline hover:underline"
                  style={{ color: reputationColor(thread.profiles?.reputation_level) }}
                >
                  {authorName(thread.profiles)}
                </Link>
                {repLabel && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: reputationColor(thread.profiles?.reputation_level) + '15', color: reputationColor(thread.profiles?.reputation_level) }}>
                    {repLabel}
                  </span>
                )}
                {thread.profiles?.karma ? (
                  <span className="ml-1 opacity-50">({thread.profiles.karma} karma)</span>
                ) : null}
                <span className="mx-1">&middot;</span>
                {timeAgo(thread.created_at)}
                <span className="mx-1">&middot;</span>
                {thread.view_count} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold mb-3 leading-tight">
              {thread.is_locked && <span className="mr-1.5 opacity-50">&#128274;</span>}
              {thread.title}
            </h1>

            {/* Body */}
            <div className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
              {thread.body}
            </div>

            {/* Thread actions */}
            <div className="flex items-center gap-4 mt-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold">&#128172; {thread.reply_count} {thread.reply_count === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </article>

        {/* Client island — votes, reply form, comment tree */}
        <ThreadClient
          threadId={thread.id}
          threadScore={thread.score}
          isLocked={thread.is_locked}
          slug={thread.slug}
          initialPosts={posts}
          initialThreadVote={0}
          initialPostVotes={{}}
        />
      </div>
    </div>
  )
}
