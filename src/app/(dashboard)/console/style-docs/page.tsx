'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const ADMIN_EMAIL = 'mike@rocketopp.com'

// All Wowdash demo pages organized by category
const DEMO_SECTIONS = [
  {
    title: 'Dashboards',
    description: '14 complete dashboard layouts',
    items: [
      { name: 'AI Dashboard', path: '/dashboard', color: '#6EE05A' },
      { name: 'CRM', path: '/crm', color: '#EAB308' },
      { name: 'eCommerce', path: '/ecommerce', color: '#06B6D4' },
      { name: 'Analytics', path: '/analytics', color: '#8B5CF6' },
      { name: 'Finance', path: '/finance', color: '#10B981' },
      { name: 'Cryptocurrency', path: '/cryptocurrency', color: '#EF4444' },
      { name: 'Investment', path: '/investment', color: '#22C55E' },
      { name: 'LMS / Learning', path: '/lms', color: '#7C3AED' },
      { name: 'NFT & Gaming', path: '/nft', color: '#6EE05A' },
      { name: 'Medical', path: '/medical', color: '#DC2626' },
      { name: 'Inventory', path: '/inventory', color: '#F59E0B' },
      { name: 'Booking', path: '/booking', color: '#3B82F6' },
      { name: 'Help Desk', path: '/help', color: '#14B8A6' },
      { name: 'Podcast', path: '/podcast', color: '#EC4899' },
    ],
  },
  {
    title: 'App Pages',
    description: 'Full application layouts',
    items: [
      { name: 'Chat / Messaging', path: '/chat', color: '#6EE05A' },
      { name: 'Email Inbox', path: '/email', color: '#3B82F6' },
      { name: 'Email Detail', path: '/email-details', color: '#3B82F6' },
      { name: 'Calendar', path: '/calendar', color: '#8B5CF6' },
      { name: 'Kanban Board', path: '/kanban', color: '#F59E0B' },
    ],
  },
  {
    title: 'UI Components',
    description: 'Individual component demos — reference these when requesting styles',
    items: [
      { name: 'Typography', path: '/typography', color: '#9CA3AF' },
      { name: 'Colors', path: '/colors', color: '#6EE05A' },
      { name: 'Buttons', path: '/buttons', color: '#3B82F6' },
      { name: 'Alerts', path: '/alert', color: '#F59E0B' },
      { name: 'Cards', path: '/card', color: '#8B5CF6' },
      { name: 'Badges', path: '/badges', color: '#EF4444' },
      { name: 'Avatars', path: '/avatar', color: '#06B6D4' },
      { name: 'Dropdowns', path: '/dropdown', color: '#10B981' },
      { name: 'Progress Bars', path: '/progress-bar', color: '#6EE05A' },
      { name: 'Tabs & Accordions', path: '/tab-accordion', color: '#EC4899' },
      { name: 'Pagination', path: '/pagination', color: '#9CA3AF' },
      { name: 'Tooltips & Popovers', path: '/tooltip', color: '#F59E0B' },
      { name: 'Star Ratings', path: '/star-rating', color: '#EAB308' },
      { name: 'Tags', path: '/tags', color: '#14B8A6' },
      { name: 'Lists', path: '/list', color: '#3B82F6' },
      { name: 'Radio Buttons', path: '/radio', color: '#8B5CF6' },
      { name: 'Switches', path: '/switch', color: '#6EE05A' },
    ],
  },
  {
    title: 'Forms',
    description: 'Form layouts and validation patterns',
    items: [
      { name: 'Input Forms', path: '/input-forms', color: '#3B82F6' },
      { name: 'Input Layout', path: '/input-layout', color: '#8B5CF6' },
      { name: 'Form Validation', path: '/form-validation', color: '#EF4444' },
    ],
  },
  {
    title: 'Charts',
    description: 'ApexCharts visualization components',
    items: [
      { name: 'Line Charts', path: '/line-chart', color: '#6EE05A' },
      { name: 'Column Charts', path: '/column-chart', color: '#3B82F6' },
      { name: 'Pie Charts', path: '/pie-chart', color: '#F59E0B' },
    ],
  },
  {
    title: 'Data Display',
    description: 'Tables, user grids, profiles',
    items: [
      { name: 'Basic Table', path: '/basic-table', color: '#9CA3AF' },
      { name: 'Users List', path: '/users-list', color: '#3B82F6' },
      { name: 'Users Grid', path: '/users-grid', color: '#8B5CF6' },
      { name: 'View Profile', path: '/view-profile', color: '#6EE05A' },
      { name: 'Widgets', path: '/widgets', color: '#F59E0B' },
    ],
  },
  {
    title: 'Settings',
    description: 'Settings page patterns',
    items: [
      { name: 'Company Settings', path: '/company', color: '#3B82F6' },
      { name: 'Notification Settings', path: '/settings-notification', color: '#F59E0B' },
      { name: 'Notification Alerts', path: '/notification-alert', color: '#EF4444' },
    ],
  },
]

// shadcn/ui components available in the project
const SHADCN_COMPONENTS = [
  'accordion', 'alert', 'alert-dialog', 'avatar', 'badge', 'breadcrumb', 'button',
  'calendar', 'card', 'carousel', 'checkbox', 'collapsible', 'command', 'dialog',
  'dropdown-menu', 'input', 'label', 'popover', 'radio-group', 'select', 'separator',
  'sheet', 'sidebar', 'skeleton', 'sonner', 'switch', 'table', 'tabs', 'textarea',
  'tooltip',
]

export default function StyleDocsPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [demoUrl, setDemoUrl] = useState('')

  useEffect(() => {
    fetch('/api/console/account')
      .then(r => r.json())
      .then(data => {
        if (data?.email === ADMIN_EMAIL) {
          setAuthorized(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-[#6EE05A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-neutral-500 text-sm">
        Admin access required.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">0nMCP Style Docs</h1>
        <p className="text-sm text-neutral-400">
          Wowdash component library reference. Point at any component below and describe what you want.
          These are the building blocks for every console page.
        </p>
      </div>

      {/* Brand Tokens */}
      <div className="rounded-lg border border-neutral-700/30 bg-[#0F1419] p-5">
        <h2 className="text-sm font-bold text-white mb-3">Brand Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: 'Primary', value: '#6EE05A', css: '--primary' },
            { name: 'Background', value: '#080B0F', css: '--background' },
            { name: 'Card', value: '#0F1419', css: '--card' },
            { name: 'Sidebar', value: '#0A0D12', css: '--sidebar' },
            { name: 'Border', value: '#1A2030', css: '--border' },
            { name: 'Muted', value: '#6B7280', css: '--muted-foreground' },
          ].map(t => (
            <div key={t.name} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md border border-neutral-700/50 shrink-0" style={{ background: t.value }} />
              <div>
                <div className="text-xs font-medium text-neutral-300">{t.name}</div>
                <div className="text-[10px] font-mono text-neutral-500">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Demo Viewer */}
      <div className="rounded-lg border border-neutral-700/30 bg-[#0F1419] p-5">
        <h2 className="text-sm font-bold text-white mb-1">Live Demo Viewer</h2>
        <p className="text-xs text-neutral-500 mb-3">
          Wowdash live demo. Click any page below to load it here, or visit{' '}
          <a href="https://wowdash-react-shadcn.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[#6EE05A] underline">
            wowdash-react-shadcn.vercel.app
          </a>{' '}directly.
        </p>
        {demoUrl ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono">{demoUrl}</span>
              <button onClick={() => setDemoUrl('')} className="text-xs text-neutral-500 hover:text-white cursor-pointer">
                Close preview
              </button>
            </div>
            <iframe
              src={demoUrl}
              className="w-full h-[600px] rounded-lg border border-neutral-700/50"
              title="Wowdash Demo"
            />
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-600 text-sm">
            Select a page below to preview it here
          </div>
        )}
      </div>

      {/* Component Sections */}
      {DEMO_SECTIONS.map(section => (
        <div key={section.title} className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-white">{section.title}</h2>
            <p className="text-xs text-neutral-500">{section.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {section.items.map(item => (
              <button
                key={item.name}
                onClick={() => setDemoUrl(`https://wowdash-react-shadcn.vercel.app${item.path}`)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral-700/30 bg-[#0F1419] hover:border-[#6EE05A]/30 hover:bg-[#6EE05A]/5 transition-all cursor-pointer text-left group"
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-sm text-neutral-300 group-hover:text-white truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* shadcn/ui Components Available */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-white">shadcn/ui Components (Installed)</h2>
          <p className="text-xs text-neutral-500">
            These are already installed in our project at <code className="text-[#6EE05A] text-[10px]">src/components/ui/</code>.
            Reference by name when requesting UI changes.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SHADCN_COMPONENTS.map(c => (
            <span key={c} className="px-2.5 py-1 rounded-md bg-[#0F1419] border border-neutral-700/30 text-xs text-neutral-400 font-mono">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* How To Use This Page */}
      <div className="rounded-lg border border-[#6EE05A]/20 bg-[#6EE05A]/5 p-5 space-y-2">
        <h2 className="text-sm font-bold text-[#6EE05A]">How To Use This Page</h2>
        <ol className="text-xs text-neutral-400 space-y-1.5 list-decimal list-inside">
          <li>Click any component above to preview the Wowdash demo in the viewer</li>
          <li>Take a screenshot of the element you want</li>
          <li>Share it with Claude Code and say &quot;make [page] look like this&quot;</li>
          <li>Claude extracts the Wowdash component, adapts it to dark theme with 0nMCP tokens</li>
          <li>You verify in browser before push</li>
        </ol>
        <p className="text-xs text-neutral-500 mt-2">
          This page will grow as we add custom components and theme extensions.
        </p>
      </div>
    </div>
  )
}
