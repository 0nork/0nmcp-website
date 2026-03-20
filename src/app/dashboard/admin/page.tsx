'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, CheckSquare, Bell } from 'lucide-react'

const TodoModal = dynamic(() => import('@/components/admin/TodoModal'), { ssr: false })

const BG = '#0f1419'
const CARD = '#1a2332'
const CARD_BORDER = '#243042'
const TEXT = '#e1e8f0'
const TEXT_DIM = '#7d8a9a'
const ACCENT = '#7ed957'

export default function DashboardAdminPage() {
  const [showTodo, setShowTodo] = useState(true) // Open by default
  const [todoCount, setTodoCount] = useState(0)

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.json())
      .then(d => {
        const unread = (d.notifications || []).filter((n: { read: boolean }) => !n.read).length
        setTodoCount(unread)
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.75rem', borderBottom: `1px solid ${CARD_BORDER}`,
        position: 'sticky', top: 0, zIndex: 50, background: BG,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{ color: TEXT_DIM, textDecoration: 'none', display: 'flex' }}>
            <ArrowLeft size={18} />
          </Link>
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={100} height={35} style={{ objectFit: 'contain' }} />
          <span style={{ color: '#4a5568', fontSize: '0.875rem' }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: '#ff3d3d' }} />
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Admin</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowTodo(!showTodo)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
              background: ACCENT, color: '#000', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', fontFamily: 'inherit', position: 'relative',
            }}
          >
            <CheckSquare size={16} /> To-Do List
            {todoCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                width: 20, height: 20, borderRadius: '50%',
                background: '#ff3d3d', color: '#fff', fontSize: '0.6875rem',
                fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{todoCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Admin Quick Links */}
      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Admin <span style={{ color: '#ff3d3d' }}>Panel</span>
        </h1>
        <p style={{ color: TEXT_DIM, fontSize: '0.9375rem', marginBottom: '2rem' }}>Superadmin tools and management</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Tier Switcher', desc: 'Switch subscription view', href: '/api/admin/tier-switch', color: '#7ed957' },
            { label: 'Blog Manager', desc: 'Manage blog posts', href: '/admin/blog', color: '#a78bfa' },
            { label: 'Catalog Manager', desc: 'Add/edit services', href: '/admin/catalog', color: '#00d4ff' },
            { label: 'Content Engine', desc: 'Manage content queue', href: '/admin/content', color: '#f472b6' },
            { label: 'Forum Admin', desc: 'Moderate threads', href: '/admin/forum', color: '#fbbf24' },
            { label: 'AI Settings', desc: 'Configure AI providers', href: '/admin/ai-settings', color: '#60a5fa' },
          ].map(item => (
            <Link key={item.label} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: '14px',
              background: CARD, border: `1px solid ${CARD_BORDER}`,
              textDecoration: 'none', color: TEXT,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${item.color}44`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = CARD_BORDER)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '10px',
                background: `${item.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={18} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: '0.8125rem', color: TEXT_DIM }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Todo Modal */}
      {showTodo && <TodoModal onClose={() => setShowTodo(false)} />}
    </div>
  )
}
