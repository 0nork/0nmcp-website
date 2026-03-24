'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { IconChart, IconSend, IconDocument, IconRobot, IconForum, IconUsers, IconEnvelope, IconGear } from '@/components/CategoryIcons'

interface Stats {
  users: number
  personas: number
  threads: number
  posts: number
  topicSeeds: number
  personaThreads: number
  personaReplies: number
  recentSignups: number
}

interface RecentUser {
  id: string
  email: string
  full_name: string | null
  reputation_level: string
  karma: number
  is_persona: boolean
  created_at: string
}

interface RecentThread {
  id: string
  title: string
  slug: string
  reply_count: number
  score: number
  created_at: string
  profiles: { full_name: string | null; is_persona: boolean } | null
}

const sections: Array<{ title: string; description: string; href: string; icon: ReactNode; color: string; external?: boolean }> = [
  {
    title: 'SERP Analytics',
    description: 'Keyword rankings, position tracking, Zenserp data.',
    href: '/admin/analytics',
    icon: <IconChart size={20} />,
    color: '#00d4ff',
  },
  {
    title: 'Site Builder',
    description: 'AI website generation — Claude builds 4 pages, deploy to CRM funnel.',
    href: '/admin/site-builder',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
    color: '#6EE05A',
  },
  {
    title: 'Blog Engine',
    description: 'CRO9 auto-blogging — SEO analysis, content generation, adaptive weights.',
    href: '/admin/blog',
    icon: <IconChart size={20} />,
    color: '#ff6b35',
  },
  {
    title: 'QA Distribution',
    description: 'Multi-platform content generation and distribution.',
    href: '/admin/qa',
    icon: <IconSend size={20} />,
    color: '#ff6b35',
  },
  {
    title: 'Content Pipeline',
    description: 'AI marketing — review, edit, approve, post.',
    href: '/admin/content',
    icon: <IconDocument size={20} />,
    color: '#6EE05A',
  },
  {
    title: 'AI Personas',
    description: 'Forum agents — generate, seed threads, manage.',
    href: '/admin/personas',
    icon: <IconRobot size={20} />,
    color: '#ff69b4',
  },
  {
    title: 'Forum Moderation',
    description: 'Threads, groups, reported content.',
    href: '/admin/forum',
    icon: <IconForum size={20} />,
    color: '#9945ff',
  },
  {
    title: 'User Management',
    description: 'Members, roles, bans, onboarding.',
    href: '/admin/users',
    icon: <IconUsers size={20} />,
    color: '#00d4ff',
  },
  {
    title: 'Email Settings',
    description: 'Notification rules, templates, CRM sync.',
    href: '/admin/email',
    icon: <IconEnvelope size={20} />,
    color: '#ff6b35',
  },
  {
    title: 'Catalog Manager',
    description: 'Add services, sync snapshot, wire MCP tools into the builder.',
    href: '/admin/catalog',
    icon: <IconGear size={20} />,
    color: '#6EE05A',
  },
  {
    title: 'CRM Portal',
    description: 'Contacts, pipeline, engagement.',
    href: 'https://0n.app.clientclub.net/',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    color: '#ff6b35',
    external: true,
  },
  {
    title: 'Supabase',
    description: 'Database, auth, storage.',
    href: 'https://supabase.com/dashboard/project/yaehbwimocvvnnlojkxe',
    icon: <svg width="20" height="20" viewBox="0 0 109 113" fill="currentColor"><path d="M63.7 110.3c-2.6 3.3-8.1 1.5-8.2-2.7l-1.4-46.2h52.4c4.8 0 7.4 5.5 4.4 9.3L63.7 110.3z" opacity="0.6"/><path d="M45.3 2.7c2.6-3.3 8.1-1.5 8.2 2.7l.8 46.2H2.5c-4.8 0-7.4-5.5-4.4-9.3L45.3 2.7z"/></svg>,
    color: '#3ECF8E',
    external: true,
  },
  {
    title: 'Vercel',
    description: 'Deployments, domains, env vars.',
    href: 'https://vercel.com',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 19.5h20L12 2z"/></svg>,
    color: '#fff',
    external: true,
  },
  {
    title: 'GitHub',
    description: '0nork/0nmcp-website repo.',
    href: 'https://github.com/0nork/0nmcp-website',
    icon: <IconGear size={20} />,
    color: '#8b949e',
    external: true,
  },
]

// Lazy-loaded TodoModal
const TodoModal = dynamic(() => import('@/components/admin/TodoModal'), { ssr: false })

export default function AdminDashboard() {
  const supabase = createSupabaseBrowser()
  const [stats, setStats] = useState<Stats | null>(null)
  const [showTodo, setShowTodo] = useState(false)
  const [todoCount, setTodoCount] = useState(0)

  // Check for notifications on mount
  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.json())
      .then(d => {
        const unread = d.notifications?.length || 0
        setTodoCount(unread)
      })
      .catch(() => {})
  }, [])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentThreads, setRecentThreads] = useState<RecentThread[]>([])
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  const loadStats = useCallback(async () => {
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) setAdminEmail(user.email)

    // Parallel stat queries
    const [
      usersRes, personasRes, threadsRes, postsRes,
      seedsRes, pConvosThreads, pConvosReplies, recentRes,
      recentThreadsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('community_personas').select('*', { count: 'exact', head: true }),
      supabase.from('community_threads').select('*', { count: 'exact', head: true }),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }),
      supabase.from('persona_topic_seeds').select('*', { count: 'exact', head: true }),
      supabase.from('persona_conversations').select('*', { count: 'exact', head: true }).eq('action', 'created_thread'),
      supabase.from('persona_conversations').select('*', { count: 'exact', head: true }).eq('action', 'replied'),
      // Recent signups (last 7 days)
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      // Recent threads
      supabase.from('community_threads')
        .select('id, title, slug, reply_count, score, created_at, profiles(full_name, is_persona)')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    setStats({
      users: usersRes.count || 0,
      personas: personasRes.count || 0,
      threads: threadsRes.count || 0,
      posts: postsRes.count || 0,
      topicSeeds: seedsRes.count || 0,
      personaThreads: pConvosThreads.count || 0,
      personaReplies: pConvosReplies.count || 0,
      recentSignups: recentRes.count || 0,
    })

    // Recent users
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, full_name, reputation_level, karma, is_persona, created_at')
      .order('created_at', { ascending: false })
      .limit(8)
    if (users) setRecentUsers(users)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (recentThreadsRes.data) setRecentThreads(recentThreadsRes.data as any)

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (loading) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading admin...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Admin
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>
            0nmcp.com &mdash; {adminEmail}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowTodo(true)} style={{
            ...btnGhostStyle,
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(126,217,87,0.1), rgba(255,107,53,0.1))',
            borderColor: 'rgba(126,217,87,0.3)',
          }}>
            To-Do List
            {todoCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                width: 18, height: 18, borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{todoCount}</span>
            )}
          </button>
          <Link href="/account" style={{ ...btnGhostStyle, textDecoration: 'none' }}>
            My Account
          </Link>
          <Link href="/forum" style={{ ...btnGhostStyle, textDecoration: 'none' }}>
            View Forum
          </Link>
        </div>
        {showTodo && <TodoModal onClose={() => setShowTodo(false)} />}
      </div>

      {/* Live Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 28 }}>
          <StatBox label="Users" value={stats.users} color="var(--accent)" />
          <StatBox label="This Week" value={stats.recentSignups} color="#00d4ff" sub="new signups" />
          <StatBox label="Threads" value={stats.threads} color="#9945ff" />
          <StatBox label="Replies" value={stats.posts} color="#ff6b35" />
          <StatBox label="Personas" value={stats.personas} color="#ff69b4" />
          <StatBox label="AI Threads" value={stats.personaThreads} color="#ff69b4" />
          <StatBox label="AI Replies" value={stats.personaReplies} color="#ff69b4" />
          <StatBox label="Topic Seeds" value={stats.topicSeeds} color="#FFD700" />
        </div>
      )}

      {/* Quick Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 32 }}>
        {sections.map((s) => {
          const inner = (
            <div
              key={s.href}
              style={{
                padding: '16px 20px',
                borderRadius: 14,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = s.color + '60'
                ;(e.currentTarget as HTMLElement).style.background = s.color + '08'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: s.color, display: 'flex', alignItems: 'center' }}>{s.icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: s.color }}>{s.title}</span>
                {s.external && (
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>↗</span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {s.description}
              </p>
            </div>
          )

          if (s.external) {
            return (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                {inner}
              </a>
            )
          }

          return (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              {inner}
            </Link>
          )
        })}
      </div>

      {/* Two-column: Recent Users + Recent Threads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Users */}
        <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Recent Users</h3>
            <Link href="/admin/users" style={{ fontSize: '0.6875rem', color: 'var(--accent)', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: u.is_persona ? 'rgba(255,105,180,0.15)' : 'rgba(126,217,87,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6875rem', fontWeight: 900,
                  color: u.is_persona ? '#ff69b4' : 'var(--accent)',
                }}>
                  {u.is_persona ? 'AI' : (u.full_name?.charAt(0) || u.email.charAt(0)).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.full_name || u.email}
                  </div>
                  <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                    {u.reputation_level} &middot; {u.karma} karma &middot; {timeAgo(u.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Threads */}
        <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Recent Threads</h3>
            <Link href="/admin/forum" style={{ fontSize: '0.6875rem', color: 'var(--accent)', textDecoration: 'none' }}>Moderate</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentThreads.map(t => (
              <div key={t.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.profiles?.is_persona && (
                    <span style={{ fontSize: '0.5rem', padding: '1px 4px', borderRadius: 3, background: 'rgba(255,105,180,0.15)', color: '#ff69b4', fontWeight: 700 }}>AI</span>
                  )}
                  <Link
                    href={`/forum/${t.slug}`}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                  >
                    {t.title}
                  </Link>
                </div>
                <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {t.profiles?.full_name || 'Anonymous'} &middot; {t.reply_count} replies &middot; score {t.score} &middot; {timeAgo(t.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

const btnGhostStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: '0.75rem',
  cursor: 'pointer',
}
