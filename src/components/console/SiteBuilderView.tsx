'use client'

export function SiteBuilderView() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0a0b',
    }}>
      <iframe
        src="/tools/site-builder.html"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: '#0a0a0b',
        }}
        title="Site Builder"
        allow="clipboard-write"
      />
    </div>
  )
}
