import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return `${Math.floor(days / 30)}mo`
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

async function getGroupData(groupSlug: string) {
  const admin = getAdmin()
  if (!admin) return null

  const { data: group } = await admin
    .from('community_groups')
    .select('*')
    .eq('slug', groupSlug)
    .single()

  if (!group) return null

  const { data: threads, count } = await admin
    .from('community_threads')
    .select(`
      id, title, slug, score, reply_count, view_count, is_pinned, is_locked, created_at, user_id,
      profiles!community_threads_user_id_fkey(full_name, email, karma, reputation_level)
    `, { count: 'exact' })
    .eq('group_id', group.id)
    .order('is_pinned', { ascending: false })
    .order('hot_score', { ascending: false })
    .limit(30)

  return { group, threads: threads || [], total: count || 0 }
}

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group: groupSlug } = await params
  const data = await getGroupData(groupSlug)

  if (!data) return { title: 'Group Not Found — 0nMCP Forum' }

  const { group } = data
  const description = group.description || `${group.name} discussions in the 0nMCP community forum.`

  return {
    title: `${group.name} — 0nMCP Forum`,
    description: description.slice(0, 155),
    openGraph: {
      title: `${group.name} — 0nMCP Forum`,
      description: description.slice(0, 155),
      url: `https://0nmcp.com/forum/c/${group.slug}`,
    },
    alternates: { canonical: `https://0nmcp.com/forum/c/${group.slug}` },
  }
}

export default async function ForumGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: groupSlug } = await params
  const data = await getGroupData(groupSlug)

  if (!data) notFound()

  const { group, threads, total } = data

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${group.name} — 0nMCP Forum`,
    description: group.description || `${group.name} discussions in the 0nMCP community.`,
    url: `https://0nmcp.com/forum/c/${group.slug}`,
    isPartOf: { '@type': 'WebSite', name: '0nMCP', url: 'https://0nmcp.com' },
    numberOfItems: total,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Forum', item: 'https://0nmcp.com/forum' },
      { '@type': 'ListItem', position: 3, name: group.name, item: `https://0nmcp.com/forum/c/${group.slug}` },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        {/* Breadcrumb */}
        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/forum" className="hover:underline">Forum</Link>
          <span>/</span>
          <span style={{ color: group.color }}>{group.icon} {group.name}</span>
        </nav>

        {/* Group Header */}
        <div className="rounded-xl p-6 mb-6" style={{ background: group.color + '08', border: `1px solid ${group.color}20` }}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{group.icon || '&#128172;'}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: group.color }}>{group.name}</h1>
              {group.description && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{group.description}</p>
              )}
            </div>
            <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{total}</div>
              <div>threads</div>
              <div className="font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{group.member_count || 0}</div>
              <div>members</div>
            </div>
          </div>
        </div>

        {/* Thread List */}
        {threads.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-base font-bold mb-1">No threads yet in {group.name}</p>
            <p className="text-sm mb-4">Be the first to start a discussion!</p>
            <Link
              href={`/forum/new?group=${group.slug}`}
              className="inline-block px-5 py-2 rounded-xl font-bold text-sm no-underline"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              + New Thread
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {threads.map((thread) => {
              const t = thread as unknown as { id: string; title: string; slug: string; score: number; reply_count: number; view_count: number; is_pinned: boolean; is_locked: boolean; created_at: string; profiles: { full_name: string | null; email: string; karma?: number; reputation_level?: string } | { full_name: string | null; email: string; karma?: number; reputation_level?: string }[] | null }
              const prof = Array.isArray(t.profiles) ? t.profiles[0] ?? null : t.profiles
              const authorDisplay = prof?.full_name || prof?.email?.split('@')[0] || 'Anonymous'

              return (
                <Link
                  key={t.id}
                  href={`/forum/${t.slug}`}
                  className="rounded-xl p-4 no-underline transition-all flex items-start gap-3"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Score */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '36px' }}>
                    <span className="text-xs font-bold tabular-nums" style={{
                      color: t.score > 0 ? '#ff6b35' : t.score < 0 ? '#9945ff' : 'var(--text-muted)',
                    }}>
                      {t.score}
                    </span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>pts</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {t.is_pinned && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>Pinned</span>
                      )}
                      <span className="font-semibold" style={{ color: reputationColor(prof?.reputation_level) }}>
                        {authorDisplay}
                      </span>
                      <span>&middot;</span>
                      <span>{timeAgo(t.created_at)}</span>
                    </div>
                    <h3 className="text-sm font-bold mb-1 leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {t.is_locked && <span className="mr-1 opacity-50">&#128274;</span>}
                      {t.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span>&#128172; {t.reply_count}</span>
                      <span>&#128065; {t.view_count}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Back to forum */}
        <div className="mt-8 text-center">
          <Link href="/forum" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            &larr; Back to all groups
          </Link>
        </div>
      </div>
    </div>
  )
}
