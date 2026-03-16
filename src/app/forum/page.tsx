import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import ForumClient from './ForumClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export const metadata: Metadata = {
  title: '0nboard — MCP & Agentic AI Community',
  description: 'The hub for MCP server development, agentic AI workflows, AI orchestration, generative AI tools, and autonomous agent discussions. Join the 0nMCP community.',
  keywords: ['MCP server', 'agentic AI', 'AI orchestration', 'generative AI', 'autonomous agents', 'model context protocol', 'AI workflow automation', '0nMCP', '0nboard'],
  openGraph: {
    title: '0nboard — MCP & Agentic AI Community',
    description: 'The hub for MCP server development, agentic AI workflows, and AI orchestration discussions.',
    url: 'https://www.0nmcp.com/forum',
  },
  alternates: { canonical: 'https://www.0nmcp.com/forum' },
}

async function getInitialData() {
  const admin = getAdmin()
  if (!admin) return { threads: [], groups: [], total: 0 }

  const [threadsResult, groupsResult] = await Promise.all([
    admin
      .from('community_threads')
      .select(`
        *,
        profiles(full_name, email, karma, reputation_level, avatar_url),
        community_groups(name, slug, icon, color)
      `, { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('hot_score', { ascending: false })
      .range(0, 29),
    admin
      .from('community_groups')
      .select('*')
      .order('thread_count', { ascending: false }),
  ])

  return {
    threads: threadsResult.data || [],
    groups: groupsResult.data || [],
    total: threadsResult.count || 0,
  }
}

async function ForumContent() {
  const { threads, groups, total } = await getInitialData()

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '0nboard — MCP & Agentic AI Community',
    description: 'The hub for MCP server development, agentic AI workflows, AI orchestration, and autonomous agent discussions.',
    url: 'https://www.0nmcp.com/forum',
    numberOfItems: total,
    hasPart: threads.slice(0, 10).map((t: { title: string; slug: string; body: string; created_at: string; score: number; reply_count: number; profiles?: { full_name: string | null; email: string }; user_id: string }) => ({
      '@type': 'DiscussionForumPosting',
      headline: t.title,
      url: `https://www.0nmcp.com/forum/${t.slug}`,
      text: t.body?.slice(0, 200),
      datePublished: t.created_at,
      author: {
        '@type': 'Person',
        name: t.profiles?.full_name || t.profiles?.email?.split('@')[0] || 'Anonymous',
        url: `https://www.0nmcp.com/u/${t.user_id}`,
      },
      interactionStatistic: [
        { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: t.score },
        { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: t.reply_count },
      ],
    })),
    isPartOf: { '@type': 'WebSite', name: '0nMCP', url: 'https://www.0nmcp.com' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      {/* 0nboard logo header */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 1rem 0' }}>
        <img
          src="/brand/0n-board.png"
          alt="0nboard"
          style={{ height: '2.5rem', objectFit: 'contain' }}
        />
      </div>
      <ForumClient
        initialThreads={threads}
        initialGroups={groups}
        initialTotal={total}
      />
    </>
  )
}

export default function ForumPage() {
  return (
    <Suspense fallback={
      <div className="py-6 px-4 md:px-6 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading forum...</p>
      </div>
    }>
      <ForumContent />
    </Suspense>
  )
}
