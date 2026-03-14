'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'

export default function DashboardTopBar({ onMobileMenu }: { onMobileMenu?: () => void }) {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/console/account')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUserName(data.full_name || '')
          setUserEmail(data.email || '')
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const initials = userName
    ? userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : userEmail
      ? userEmail[0].toUpperCase()
      : '?'

  return (
    <header
      style={{
        height: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        zIndex: 50,
      }}
    >
      {/* Left: hamburger (mobile) + brand icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onMobileMenu && (
          <button
            onClick={onMobileMenu}
            className="md:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu size={18} />
          </button>
        )}
        <button
          onClick={() => router.push('/console')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
          }}
        >
          <img
            src="/brand/icon-green.png"
            alt="0n"
            style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'contain' }}
          />
          <span
            className="hidden sm:inline"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            0n Console
          </span>
        </button>
      </div>

      {/* Right: avatar dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen((p) => !p)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent, #7ed957), #00d4ff)',
            color: '#0a0a0f',
            fontSize: 11,
            fontWeight: 800,
            fontFamily: 'inherit',
          }}
        >
          {initials}
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 36,
              width: 220,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              zIndex: 100,
            }}
          >
            {/* User info */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {userName || 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {userEmail}
              </div>
            </div>

            <button
              onClick={() => { router.push('/console?view=account'); setDropdownOpen(false) }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 13,
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Account Settings
            </button>

            <button
              onClick={async () => {
                await fetch('/api/auth/signout', { method: 'POST' })
                window.location.href = '/login'
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                color: '#ff3b30',
                fontSize: 13,
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,48,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
