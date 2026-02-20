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
  title: 'Forum — 0nMCP Community Discussions',
  description: 'Ask questions, share automations, discuss AI orchestration. The 0nMCP community forum.',
  openGraph: {
    title: 'Forum — 0nMCP Community',
    description: 'Ask questions, share automations, discuss AI orchestration.',
    url: 'https://0nmcp.com/forum',
  },
  alternates: { canonical: 'https://0nmcp.com/forum' },
}

async function getInitialData() {
  const admin = getAdmin()
  if (!admin) return { threads: [], groups: [], total: 0 }

  const [threadsResult, groupsResult] = await Promise.all([
    admin
      .from('community_threads')
      .select(`
        *,
        profiles!community_threads_user_id_fkey(full_name, email, karma, reputation_level, avatar_url),
        community_groups!community_threads_group_id_fkey(name, slug, icon, color)
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

  return (
    <ForumClient
      initialThreads={threads}
      initialGroups={groups}
      initialTotal={total}
    />
  )
}

export default function ForumPage() {
  return (
    <Suspense fallback={
      <div className="pt-28 pb-24 px-4 md:px-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading forum...</p>
      </div>
    }>
      <ForumContent />
    </Suspense>
  )
}
