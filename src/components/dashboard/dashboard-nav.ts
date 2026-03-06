export interface DashboardTab {
  key: string
  label: string
  href: string
  iconPath: string // SVG path(s) for inline icon
  external?: boolean
}

export const DASHBOARD_TABS: DashboardTab[] = [
  {
    key: 'console',
    label: 'Console',
    href: '/console',
    iconPath:
      '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/><path d="m7 10 2 2-2 2"/><line x1="12" y1="14" x2="16" y2="14"/>',
  },
  {
    key: 'builder',
    label: 'Builder',
    href: '/builder',
    iconPath:
      '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  },
  {
    key: 'connections',
    label: 'Connections',
    href: '/console',
    iconPath:
      '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    href: '/store',
    iconPath:
      '<path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z"/><line x1="3" y1="7" x2="21" y2="7"/><path d="M16 11a4 4 0 0 1-8 0"/>',
  },
  {
    key: 'admin',
    label: 'Admin',
    href: '/admin',
    iconPath: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  },
]

export interface SitemapEntry {
  label: string
  href: string
}

export const DASHBOARD_SITEMAP: Record<string, SitemapEntry[]> = {
  '/console': [
    { label: 'Dashboard', href: '/console' },
    { label: 'Terminal', href: '/console/terminal' },
    { label: 'Tools', href: '/console/tools' },
  ],
  '/builder': [{ label: 'Builder', href: '/builder' }],
  '/admin': [
    { label: 'Home', href: '/admin' },
    { label: 'Blog', href: '/admin/blog' },
    { label: 'Blog Generate', href: '/admin/blog/generate' },
    { label: 'Blog Learning', href: '/admin/blog/learning' },
    { label: 'Blog SEO', href: '/admin/blog/seo' },
    { label: 'Content', href: '/admin/content' },
    { label: 'Email', href: '/admin/email' },
    { label: 'Forum', href: '/admin/forum' },
    { label: 'Personas', href: '/admin/personas' },
    { label: 'QA', href: '/admin/qa' },
    { label: 'QA Generate', href: '/admin/qa/generate' },
    { label: 'QA History', href: '/admin/qa/history' },
    { label: 'Users', href: '/admin/users' },
    { label: 'AI Brain', href: '/admin/ai-settings' },
  ],
}
