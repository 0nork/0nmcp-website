'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Group {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
  thread_count: number
}

const TRANSITION = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

/* ── SVG icon map — color comes from parent ── */
function GroupIcon({ slug, color }: { slug: string; color: string }) {
  const p = {
    width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 2,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }

  let icon: React.ReactNode
  switch (slug) {
    case 'all':
      icon = <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
      break
    case 'showcase':
      icon = <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
      break
    case 'off-topic':
      icon = <svg {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
      break
    case 'bug-reports':
      icon = <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      break
    case 'feature-requests':
      icon = <svg {...p}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
      break
    case 'help-support':
      icon = <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
      break
    case 'integrations':
      icon = <svg {...p}><path d="M13.5 2 8 9l5.5-1L8 22l5.5-13-5.5 1z" /></svg>
      break
    case 'general':
      icon = <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
      break
    case 'tutorials':
      icon = <svg {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
      break
    case 'workflows':
      icon = <svg {...p}><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
      break
    case 'rocket-community':
      icon = <svg {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
      break
    default:
      icon = <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
  }

  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: 'linear-gradient(145deg, var(--border) 0%, #0B0F19 100%)',
        boxShadow: 'inset 0 1px 1px var(--border), 0 2px 4px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: TRANSITION,
      }}
    >
      {icon}
    </div>
  )
}

export default function ForumSidebar({
  onGroupChange,
  activeGroup,
}: {
  onGroupChange?: (slug: string) => void
  activeGroup?: string
}) {
  const searchParams = useSearchParams()
  const currentGroup = activeGroup || searchParams.get('group') || 'all'
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    fetch('/api/community/groups')
      .then(r => r.json())
      .then(d => setGroups(d.groups || []))
      .catch(() => {})
  }, [])

  function handleGroupClick(slug: string) {
    if (onGroupChange) onGroupChange(slug)
  }

  return (
    <aside
      style={{
        width: '16rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        backgroundColor: 'var(--bg-primary)',
        borderRight: '1px solid var(--border)',
        transition: TRANSITION,
        overflow: 'hidden',
      }}
    >
      {/* 0nboard Logo */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem 0.75rem 0.75rem',
        }}
      >
        <img
          src="/brand/0n-board.png"
          alt="0nboard"
          style={{ height: '2rem', objectFit: 'contain' }}
        />
      </div>

      {/* New Thread */}
      <div style={{ padding: '0 0.75rem 0.75rem', flexShrink: 0 }}>
        <Link
          href={`/forum/new${currentGroup !== 'all' ? `?group=${currentGroup}` : ''}`}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem 0',
            borderRadius: '0.75rem',
            fontWeight: 700,
            fontSize: '0.8125rem',
            textAlign: 'center',
            textDecoration: 'none',
            background: 'var(--accent)',
            color: '#0B0F19',
            transition: TRANSITION,
          }}
        >
          + New Thread
        </Link>
      </div>

      {/* Groups */}
      <nav
        style={{
          flex: 1,
          padding: '0 0.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#444',
          padding: '0.5rem 0.75rem 0.25rem',
        }}>
          Groups
        </div>

        <GroupButton slug="all" label="All" color="#6EE05A" active={currentGroup === 'all'} onClick={() => handleGroupClick('all')} />

        {groups.map(g => (
          <GroupButton
            key={g.id}
            slug={g.slug}
            label={g.name}
            color={g.color}
            count={g.thread_count}
            active={currentGroup === g.slug}
            onClick={() => handleGroupClick(g.slug)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <Link
          href="/console"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
            textDecoration: 'none', transition: TRANSITION,
          }}
        >
          &#8592; Back to Console
        </Link>
      </div>
    </aside>
  )
}

function GroupButton({ slug, label, color, count, active, onClick }: {
  slug: string; label: string; color: string; count?: number; active: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  // Active: black bg, category color left border, category color icon
  // Hover: 3px border in category color fades in around the button
  // Default: transparent bg, no border highlight

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        padding: '0.5rem 0.75rem',
        backgroundColor: active ? '#0B0F19' : 'transparent',
        borderTop: active ? 'none' : hovered ? `3px solid ${color}40` : '3px solid transparent',
        borderRight: active ? 'none' : hovered ? `3px solid ${color}40` : '3px solid transparent',
        borderBottom: active ? 'none' : hovered ? `3px solid ${color}40` : '3px solid transparent',
        borderLeft: active ? `4px solid ${color}` : hovered ? `3px solid ${color}40` : '4px solid transparent',
        color: active ? '#ffffff' : hovered ? '#ccc' : '#999',
        transition: TRANSITION,
        fontFamily: 'inherit',
        fontSize: '0.8125rem',
        fontWeight: active ? 600 : 500,
        textAlign: 'left',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    >
      <GroupIcon slug={slug} color={active ? color : hovered ? color : '#6EE05A'} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: '0.625rem', color: '#444' }}>{count}</span>
      )}
    </button>
  )
}
