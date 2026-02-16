'use client'

import dynamic from 'next/dynamic'

const BuilderApp = dynamic(() => import('@/components/builder/BuilderApp'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
      Loading builder...
    </div>
  ),
})

export default function TabletBuilder({ isTablet }: { isTablet: boolean }) {
  if (!isTablet) {
    return (
      <div className="tablet-only-msg">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Tablet Required</p>
        <p style={{ fontSize: 13 }}>The visual builder needs a screen width of 768px or larger.</p>
      </div>
    )
  }

  return (
    <div className="tablet-builder-container">
      <BuilderApp />
    </div>
  )
}
