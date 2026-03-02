'use client'

import { useState } from 'react'
import { AdminDefender } from './AdminDefender'
import { AdminUsers } from './AdminUsers'

type AdminSection = 'overview' | 'defender' | 'users' | 'forum' | 'personas' | 'content' | 'blog' | 'qa'

interface NavItem {
  key: AdminSection
  label: string
  icon: string
  type: 'component' | 'iframe'
  src?: string
}

const COMPONENT_SECTIONS: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: '\u{1F4CA}', type: 'component' },
  { key: 'defender', label: '0nDefender', icon: '\u{1F6E1}\uFE0F', type: 'component' },
  { key: 'users', label: 'Users', icon: '\u{1F465}', type: 'component' },
]

const IFRAME_SECTIONS: NavItem[] = [
  { key: 'forum', label: 'Forum', icon: '\u{1F4AC}', type: 'iframe', src: '/admin/forum' },
  { key: 'personas', label: 'Personas', icon: '\u{1F916}', type: 'iframe', src: '/admin/personas' },
  { key: 'content', label: 'Content', icon: '\u{1F4DD}', type: 'iframe', src: '/admin/content' },
  { key: 'blog', label: 'Blog Engine', icon: '\u{1F4F0}', type: 'iframe', src: '/admin/blog' },
  { key: 'qa', label: 'QA Distribution', icon: '\u{1F3AF}', type: 'iframe', src: '/admin/qa' },
]

const ALL_SECTIONS: NavItem[] = [...COMPONENT_SECTIONS, ...IFRAME_SECTIONS]

export function AdminView() {
  const [section, setSection] = useState<AdminSection>('overview')
  const [stats, setStats] = useState<{ users: number; threats: number; scans: number } | null>(null)

  // Fetch overview stats on first render
  useState(() => {
    fetch('/api/admin/users?stats=true')
      .then(r => r.json())
      .then(data => {
        setStats({ users: data.total || 0, threats: 0, scans: 0 })
      })
      .catch(() => {})
  })

  const activeItem = ALL_SECTIONS.find(s => s.key === section)!

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1.5rem 1.5rem 1rem 1.5rem', flexShrink: 0,
      }}>
        <div style={{
          width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, rgba(126,217,87,0.15), rgba(126,217,87,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(126,217,87,0.2)',
          fontSize: '1.25rem',
        }}>
          {'\u{1F6E1}\uFE0F'}
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
            Admin Console
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Super admin access — full system control
          </p>
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '0.25rem 0.75rem', borderRadius: '9999px',
          background: 'rgba(126,217,87,0.12)', border: '1px solid rgba(126,217,87,0.25)',
          fontSize: '0.7rem', fontWeight: 600, color: '#7ed957',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
        }}>
          ADMIN
        </div>
      </div>

      {/* Two-panel layout */}
      <div style={{
        display: 'flex', flex: 1, minHeight: 0,
        padding: '0 1.5rem 1.5rem 1.5rem', gap: '1rem',
      }}>
        {/* Secondary Nav */}
        <nav style={{
          width: '180px', flexShrink: 0,
          background: 'var(--bg-card)', borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          padding: '0.5rem',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Component sections */}
          {COMPONENT_SECTIONS.map(item => (
            <NavButton
              key={item.key}
              item={item}
              active={section === item.key}
              onClick={() => setSection(item.key)}
            />
          ))}

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--border)',
            margin: '0.375rem 0.5rem',
            flexShrink: 0,
          }} />

          {/* Iframe sections */}
          {IFRAME_SECTIONS.map(item => (
            <NavButton
              key={item.key}
              item={item}
              active={section === item.key}
              onClick={() => setSection(item.key)}
            />
          ))}
        </nav>

        {/* Main Content Area */}
        <div style={{
          flex: 1, minWidth: 0, minHeight: 0,
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-card)', borderRadius: '0.75rem',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {/* Overview (component) */}
          {section === 'overview' && (
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                {[
                  { label: 'Total Users', value: stats?.users ?? '...', color: '#7ed957' },
                  { label: 'Active Threats', value: stats?.threats ?? '...', color: '#ef4444' },
                  { label: 'Scans Run', value: stats?.scans ?? '...', color: '#00d4ff' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', padding: '1.25rem',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem',
                      fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      {s.label}
                    </div>
                    <div style={{
                      fontSize: '2rem', fontWeight: 700, color: s.color,
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Defender (component) */}
          {section === 'defender' && (
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <AdminDefender />
            </div>
          )}

          {/* Users (component) */}
          {section === 'users' && (
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <AdminUsers />
            </div>
          )}

          {/* Iframe sections */}
          {activeItem.type === 'iframe' && activeItem.src && (
            <iframe
              key={activeItem.key}
              src={activeItem.src}
              style={{
                flex: 1,
                border: 'none',
                width: '100%',
                height: '100%',
                borderRadius: '0 0 0.75rem 0',
                background: 'var(--bg-primary)',
              }}
              title={activeItem.label}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        width: '100%', padding: '0.5rem 0.625rem',
        borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
        background: active
          ? 'rgba(126,217,87,0.1)'
          : hovered
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        color: active ? '#7ed957' : 'var(--text-secondary)',
        fontSize: '0.8rem', fontWeight: active ? 600 : 500,
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Active indicator bar */}
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: '25%', bottom: '25%',
          width: '2.5px', borderRadius: '2px',
          background: '#7ed957',
        }} />
      )}
      <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{item.icon}</span>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.label}
      </span>
    </button>
  )
}
