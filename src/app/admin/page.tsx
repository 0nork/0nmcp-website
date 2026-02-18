'use client'

import Link from 'next/link'

const sections = [
  {
    title: 'Content Pipeline',
    description: 'AI-generated marketing content — review, edit, approve, post.',
    href: '/admin/content',
    icon: '📝',
    color: '#00ff88',
  },
  {
    title: 'AI Personas',
    description: 'Forum agents — generate characters, seed threads, build organic activity.',
    href: '/admin/personas',
    icon: '🤖',
    color: '#ff69b4',
  },
  {
    title: 'Community Forum',
    description: 'Moderate threads, manage groups, view reported content.',
    href: '/forum',
    icon: '💬',
    color: '#9945ff',
  },
  {
    title: 'CRM Portal',
    description: 'Community sub-location — contacts, pipeline, engagement.',
    href: 'https://0n.app.clientclub.net/',
    icon: '🚀',
    color: '#ff6b35',
    external: true,
  },
  {
    title: 'Supabase',
    description: 'Database, auth, storage, edge functions.',
    href: 'https://supabase.com/dashboard/project/pwujhhmlrtxjmjzyttwn',
    icon: '🗄️',
    color: '#00d4ff',
    external: true,
  },
  {
    title: 'Vercel',
    description: 'Deployments, domains, environment variables.',
    href: 'https://vercel.com',
    icon: '▲',
    color: '#fff',
    external: true,
  },
]

export default function AdminDashboard() {
  return (
    <div style={{ padding: '120px 32px 64px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
          Admin
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
          0nMCP.com management dashboard
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {sections.map((s) => {
          const inner = (
            <div
              style={{
                padding: '20px 24px',
                borderRadius: 16,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: s.color }}>{s.title}</span>
                {s.external && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>↗</span>
                )}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
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
    </div>
  )
}
