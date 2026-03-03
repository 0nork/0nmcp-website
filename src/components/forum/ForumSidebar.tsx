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
        backgroundColor: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
        transition: TRANSITION,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          height: '3.5rem',
          padding: '0 0.75rem',
          borderBottom: '1px solid var(--border)',
          gap: '0.5rem',
        }}
      >
        <img
          src="/brand/icon-green.png"
          alt="0n"
          style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', objectFit: 'contain' }}
        />
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          0n Forum
        </span>
      </div>

      {/* New Thread */}
      <div style={{ padding: '0.75rem', flexShrink: 0 }}>
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
            color: 'var(--bg-primary)',
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
        <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem 0.25rem' }}>
          Groups
        </div>

        <GroupButton
          label="All"
          icon="&#127968;"
          active={currentGroup === 'all'}
          onClick={() => handleGroupClick('all')}
        />

        {groups.map(g => (
          <GroupButton
            key={g.id}
            label={g.name}
            icon={g.icon || '&#128172;'}
            color={g.color}
            count={g.thread_count}
            active={currentGroup === g.slug}
            onClick={() => handleGroupClick(g.slug)}
          />
        ))}
      </nav>

      {/* Footer: Back to Console */}
      <div
        style={{
          flexShrink: 0,
          padding: '0.75rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <Link
          href="/console"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: TRANSITION,
          }}
        >
          &#8592; Back to Console
        </Link>
      </div>
    </aside>
  )
}

function GroupButton({
  label,
  icon,
  color,
  count,
  active,
  onClick,
}: {
  label: string
  icon: string
  color?: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

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
        border: 'none',
        padding: '0.5rem 0.75rem',
        backgroundColor: active ? (color ? color + '12' : 'rgba(255,255,255,0.06)') : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        borderLeft: active ? `3px solid ${color || 'var(--accent)'}` : '3px solid transparent',
        color: active ? (color || 'var(--text-primary)') : 'var(--text-secondary)',
        transition: TRANSITION,
        fontFamily: 'inherit',
        fontSize: '0.8125rem',
        fontWeight: active ? 600 : 500,
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: '0.875rem', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: icon }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', opacity: 0.6 }}>{count}</span>
      )}
    </button>
  )
}
