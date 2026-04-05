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
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string; avatar_url?: string | null }
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
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string; avatar_url?: string | null }
}

async function getThread(slug: string) {
  const admin = getAdmin()
  if (!admin) return null

  const { data: thread } = await admin
    .from('community_threads')
    .select(`
      *,
      profiles(full_name, email, karma, reputation_level, avatar_url),
      community_groups(name, slug, icon, color)
    `)
    .eq('slug', slug)
    .single()

  if (!thread) return null

  // Increment view count (fire and forget)
  admin.rpc('increment_view_count', { thread_id: thread.id }).then()

  const { data: posts } = await admin
    .from('community_posts')
    .select('*, profiles(full_name, email, karma, reputation_level, avatar_url)')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })

  return { thread: thread as ThreadData, posts: (posts || []) as PostData[] }
}

const GROUP_TITLE_SUFFIXES: Record<string, string> = {
  workflows: 'Agentic AI Workflows',
  integrations: 'MCP Integrations',
  tutorials: 'MCP Tutorials',
  help: 'MCP Help',
  showcase: 'AI Showcase',
  'feature-requests': 'Feature Requests',
  general: 'Agentic AI Discussion',
}

function cleanDescription(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, '')          // strip code blocks
    .replace(/\n---\n\*Discuss more at[\s\S]*$/, '') // strip backlink footer
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links → text
    .replace(/[#*_~`]/g, '')                 // strip markdown formatting
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getThread(slug)

  if (!data) {
    return { title: 'Thread Not Found — 0nMCP Forum' }
  }

  const { thread } = data
  const description = cleanDescription(thread.body)
  const groupSlug = thread.community_groups?.slug || 'general'
  const titleSuffix = GROUP_TITLE_SUFFIXES[groupSlug] || '0nMCP Forum'

  return {
    title: `${thread.title} — ${titleSuffix} — 0nMCP`,
    description,
    openGraph: {
      title: `${thread.title} — ${titleSuffix}`,
      description,
      url: `https://www.0nmcp.com/forum/${thread.slug}`,
      type: 'article',
      publishedTime: thread.created_at,
    },
    other: {
      'article:published_time': thread.created_at,
    },
    alternates: { canonical: `https://www.0nmcp.com/forum/${thread.slug}` },
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
  const threadUrl = `https://www.0nmcp.com/forum/${thread.slug}`
  const authorUrl = `https://www.0nmcp.com/u/${thread.user_id}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Forum', item: 'https://www.0nmcp.com/forum' },
      ...(groupData ? [{ '@type': 'ListItem', position: 3, name: groupData.name, item: `https://www.0nmcp.com/forum?group=${groupData.slug}` }] : []),
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
              url: `https://www.0nmcp.com/u/${solutionPost.user_id}`,
            },
            upvoteCount: solutionPost.score,
          },
        } : {}),
        ...(posts.length > 0 && !solutionPost ? {
          suggestedAnswer: posts.slice(0, 3).map(p => ({
            '@type': 'Answer',
            text: p.body,
            dateCreated: p.created_at,
            author: { '@type': 'Person', name: authorName(p.profiles), url: `https://www.0nmcp.com/u/${p.user_id}` },
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
          author: { '@type': 'Person', name: authorName(p.profiles), url: `https://www.0nmcp.com/u/${p.user_id}` },
          upvoteCount: p.score,
        })),
      } : {}),
    }
  }

  const categories = [
    { label: 'Feature Requests', slug: 'feature-requests' },
    { label: 'Show & Tell', slug: 'showcase' },
    { label: 'Help', slug: 'help' },
    { label: 'Integrations', slug: 'integrations' },
    { label: 'General', slug: 'general' },
  ]

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <style>{`
        .thread-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 680px) 260px;
          gap: 2rem;
          align-items: start;
          justify-content: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        @media (max-width: 1200px) {
          .thread-layout { grid-template-columns: minmax(0, 680px) 260px; gap: 1.75rem; }
          .forum-sidebar-left { display: none; }
        }
        @media (max-width: 860px) {
          .thread-layout { grid-template-columns: minmax(0, 1fr); max-width: 680px; }
          .forum-sidebar-left { display: none; }
          .forum-sidebar { order: 2; }
        }
      `}</style>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(mainJsonLd) }} />

      <div className="thread-layout">
        {/* -- Left Sidebar: Quick Nav -- */}
        <div className="forum-sidebar-left" style={{ position: 'sticky', top: '5.5rem', maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.125rem 1.25rem' }}>
            <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #6EE05A' }}>
              Quick Nav
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link href="/forum" style={{
                display: 'block', padding: '5px 8px', borderRadius: 6,
                color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600,
                textDecoration: 'none', borderLeft: '2px solid transparent',
              }}>
                Forum (all)
              </Link>
              {categories.map(c => (
                <Link key={c.slug} href={`/forum?group=${c.slug}`} style={{
                  display: 'block', padding: '5px 8px', borderRadius: 6,
                  color: groupData?.slug === c.slug ? '#6EE05A' : '#6b7280',
                  fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                  background: groupData?.slug === c.slug ? 'rgba(110,224,90,0.06)' : 'transparent',
                  borderLeft: groupData?.slug === c.slug ? '2px solid #6EE05A' : '2px solid transparent',
                }}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem 1.125rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Replies', value: thread.reply_count },
                { label: 'Views', value: thread.view_count },
                { label: 'Karma', value: thread.score },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -- Main Content (center column) -- */}
        <div>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              flexWrap: 'nowrap',
              overflow: 'hidden',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <Link
              href="/forum"
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                flexShrink: 0,
                fontWeight: 500,
              }}
            >
              Forum
            </Link>
            {groupData && (
              <>
                <span style={{ flexShrink: 0, opacity: 0.5 }}>/</span>
                <Link
                  href={`/forum?group=${groupData.slug}`}
                  style={{
                    color: groupData.color,
                    textDecoration: 'none',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '90px',
                    flexShrink: 1,
                  }}
                >
                  {groupData.name}
                </Link>
              </>
            )}
            <span style={{ flexShrink: 0, opacity: 0.5 }}>/</span>
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
                flex: 1,
                color: 'var(--text-secondary)',
              }}
            >
              {thread.title}
            </span>
          </nav>

          {/* Search Bar */}
          <form
            action="/forum"
            method="get"
            style={{ marginBottom: '1rem' }}
            onSubmit={undefined}
          >
            <div style={{ position: 'relative' }}>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search forum..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </form>

          {/* Thread -- server-rendered for SEO, black background */}
          <article
            className="rounded-xl mb-0"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            {/* Content */}
            <div className="py-5 px-5 flex-1 min-w-0">
              {/* Meta */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2" style={{ fontSize: '0.6875rem' }}>
                {groupData && (
                  <span
                    style={{
                      fontSize: '0.5625rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: groupData.color,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {groupData.name}
                  </span>
                )}
                {thread.is_pinned && (
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>Pinned</span>
                )}
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {thread.profiles?.avatar_url && (
                    <img
                      src={thread.profiles.avatar_url}
                      alt=""
                      width={18}
                      height={18}
                      style={{ borderRadius: '50%', verticalAlign: 'middle' }}
                    />
                  )}
                  Posted by{' '}
                  <Link
                    href={`/u/${thread.user_id}`}
                    style={{
                      fontWeight: 700,
                      textDecoration: 'none',
                      color: reputationColor(thread.profiles?.reputation_level),
                    }}
                  >
                    {authorName(thread.profiles)}
                  </Link>
                  {repLabel && (
                    <span style={{
                      marginLeft: '4px',
                      fontSize: '0.5625rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: reputationColor(thread.profiles?.reputation_level) + '15',
                      color: reputationColor(thread.profiles?.reputation_level),
                    }}>
                      {repLabel}
                    </span>
                  )}
                  {thread.profiles?.karma ? (
                    <span style={{ marginLeft: '4px', opacity: 0.5 }}>({thread.profiles.karma} karma)</span>
                  ) : null}
                  <span style={{ margin: '0 4px' }}>&middot;</span>
                  {timeAgo(thread.created_at)}
                  <span style={{ margin: '0 4px' }}>&middot;</span>
                  {thread.view_count} views
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
                  fontWeight: 800,
                  marginBottom: '0.875rem',
                  lineHeight: 1.25,
                  color: '#f0f0f5',
                  letterSpacing: '-0.025em',
                }}
              >
                {thread.is_locked && <span style={{ marginRight: '6px', opacity: 0.5 }}>&#128274;</span>}
                {thread.title}
              </h1>

              {/* Body */}
              <div
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  color: '#e8e8ee',
                }}
              >
                {thread.body}
              </div>
            </div>

            {/* Karma + comment banner bar */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--border)',
                borderRadius: '0 0 12px 12px',
                padding: '0.625rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              {/* Score/Karma (prominent) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span style={{
                  fontSize: '0.9375rem',
                  fontWeight: 800,
                  color: thread.score > 0 ? '#ff6b35' : thread.score < 0 ? '#9945ff' : 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {thread.score}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>karma</span>
              </div>

              {/* Divider */}
              <span style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0 }} />

              {/* Comments count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {thread.reply_count}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {thread.reply_count === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </div>
          </article>

          {/* Client island -- votes, reply form, comment tree */}
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

        {/* -- Right Sidebar -- */}
        <div className="forum-sidebar" style={{ position: 'sticky', top: '5.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Grid CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #0B0F19, #162032)',
            borderRadius: 14, padding: '1.5rem', textAlign: 'center',
            border: '1px solid rgba(110,224,90,0.15)',
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Join the <span style={{ color: '#6EE05A' }}>Grid</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#7A8290', lineHeight: 1.6, marginBottom: '1rem' }}>
              Unlock gamification, leaderboards, events, AI courses, and affiliate rewards.
            </p>
            <Link href="/grid" style={{
              display: 'block', padding: '10px', borderRadius: 8, background: '#6EE05A', color: '#000',
              fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center',
            }}>
              Enter the Grid
            </Link>
          </div>

          {/* Topics */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem 1.125rem',
          }}>
            <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #6EE05A' }}>
              Topics
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link href="/forum" style={{
                display: 'flex', justifyContent: 'space-between', width: '100%',
                padding: '6px 8px', borderRadius: 6, textDecoration: 'none',
                color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600,
              }}>
                <span>All Topics</span>
              </Link>
              {categories.map(c => (
                <Link key={c.slug} href={`/forum?group=${c.slug}`} style={{
                  display: 'flex', justifyContent: 'space-between', width: '100%',
                  padding: '6px 8px', borderRadius: 6, textDecoration: 'none',
                  color: groupData?.slug === c.slug ? '#6EE05A' : '#6b7280',
                  background: groupData?.slug === c.slug ? 'rgba(110,224,90,0.06)' : 'transparent',
                  fontSize: '0.8125rem', fontWeight: 600,
                }}>
                  <span>{c.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* About */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem 1.125rem',
          }}>
            <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #6EE05A' }}>
              About
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              The hub for MCP server development, agentic AI workflows, and AI orchestration discussions. Built on 0nMCP.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
