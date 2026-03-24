'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser, getAccessibleModules, ALL_MODULES, type UserTier } from '@/lib/user-context'
import { ModuleCard } from '@/components/module-card'
import { UserProvider } from '@/lib/user-context'

interface DashboardData {
  userName: string
  sparks: number
  tools: number
  services: number
  executions: number
}

function DashboardContent() {
  const { tier } = useUser()
  const accessibleModules = getAccessibleModules(tier)
  const lockedCount = ALL_MODULES.length - accessibleModules.length

  const [data, setData] = useState<DashboardData>({
    userName: '',
    sparks: 0,
    tools: 1171,
    services: 54,
    executions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const accountRes = await fetch('/api/console/account')
        const account = accountRes.ok ? await accountRes.json() : {}

        const sparksRes = await fetch('/api/sparks/balance')
        const sparks = sparksRes.ok ? await sparksRes.json() : { balance: 0 }

        setData({
          userName: account.full_name?.split(' ')[0] || '',
          sparks: sparks.balance ?? 0,
          tools: 1171,
          services: 54,
          executions: 0,
        })
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  const statCards = [
    { label: 'Sparks Balance', value: data.sparks, color: '#6EE05A', icon: sparkIcon },
    { label: 'Tools Available', value: data.tools, color: '#60A5FA', icon: toolIcon },
    { label: 'Services', value: data.services, color: '#A78BFA', icon: serviceIcon },
    { label: 'Executions', value: data.executions, color: '#F59E0B', icon: execIcon },
  ]

  return (
    <div className="dashboard-r0n">
      {/* Header */}
      <div className="dashboard-r0n-header">
        <h1 className="dashboard-r0n-title">
          {data.userName ? `Welcome back, ${data.userName}` : 'Welcome to 0nMCP'}
        </h1>
        <p className="dashboard-r0n-subtitle">Your AI command center is ready.</p>
      </div>

      <div className="dashboard-r0n-layout">
        {/* Main content */}
        <div className="dashboard-r0n-main">
          {/* Stat Cards */}
          <div className="dashboard-r0n-stats">
            {statCards.map(card => (
              <div key={card.label} className="module-card stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">{card.label}</span>
                  <span className="stat-card-icon" style={{ color: card.color }}>
                    {card.icon}
                  </span>
                </div>
                <div className="stat-card-value" style={{ color: card.color }}>
                  {card.value.toLocaleString()}
                </div>
                <p className="stat-card-sub">
                  {card.label === 'Sparks Balance' && (lockedCount > 0 ? `${lockedCount} modules locked` : 'All modules unlocked')}
                  {card.label === 'Tools Available' && '0nMCP v2.5.0'}
                  {card.label === 'Services' && '22 categories'}
                  {card.label === 'Executions' && 'This month'}
                </p>
              </div>
            ))}
          </div>

          {/* Module Grid */}
          <h2 className="dashboard-r0n-section-title">Your Modules</h2>
          <div className="dashboard-r0n-modules">
            {ALL_MODULES.map((module) => {
              const isComingSoon = module.id === 'analytics'
              return (
                <ModuleCard
                  key={module.id}
                  module={module}
                  userTier={tier}
                  onAction={() => {
                    if (module.href) window.location.href = module.href
                  }}
                  comingSoon={isComingSoon}
                />
              )
            })}
          </div>

          {/* Upgrade prompt */}
          {tier !== 'enterprise' && (
            <div className="dashboard-r0n-upgrade">
              <div>
                <h3 className="dashboard-r0n-upgrade-title">Unlock More Power</h3>
                <p className="dashboard-r0n-upgrade-desc">
                  {tier === 'free'
                    ? 'Upgrade to Supporter to access Analytics and more features'
                    : 'Upgrade to unlock all modules and priority support'}
                </p>
              </div>
              <Link href="/console/pricing" className="dashboard-r0n-upgrade-btn">
                View Plans
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="dashboard-r0n-sidebar">
          <h3 className="dashboard-r0n-sidebar-title">Quick Actions</h3>
          <div className="dashboard-r0n-actions">
            {[
              { label: 'Canvas Builder', href: '/console/builder/canvas', desc: 'Visual page builder', color: '#6EE05A' },
              { label: 'Generate a Course', href: '/console/courses/generate', desc: 'AI-powered course creator', color: '#60A5FA' },
              { label: 'Browse Store', href: '/console/marketplace', desc: 'Discover add-ons', color: '#A78BFA' },
              { label: 'Workflow Builder', href: '/builder', desc: 'Create .0n workflows', color: '#F59E0B' },
              { label: 'Visit Forum', href: '/forum', desc: 'Connect with builders', color: '#EC4899' },
            ].map(action => (
              <Link key={action.label} href={action.href} className="dashboard-r0n-action">
                <div className="dashboard-r0n-action-dot" style={{ backgroundColor: action.color }} />
                <div>
                  <div className="dashboard-r0n-action-label">{action.label}</div>
                  <div className="dashboard-r0n-action-desc">{action.desc}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <UserProvider>
      <DashboardContent />
    </UserProvider>
  )
}

/* Inline SVG Icons */

const sparkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const toolIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
)

const serviceIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const execIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)
