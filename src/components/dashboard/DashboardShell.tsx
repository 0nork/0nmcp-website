'use client'

import DashboardTopBar from './DashboardTopBar'
import DashboardLeftSidebar from './DashboardLeftSidebar'
import DashboardRightSidebar from './DashboardRightSidebar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <DashboardTopBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <DashboardLeftSidebar />
        <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
        <DashboardRightSidebar />
      </div>
    </div>
  )
}
