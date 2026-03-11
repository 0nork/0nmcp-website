'use client'

export default function SiteBuilderPage() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0b' }}>
      <iframe
        src="/tools/site-builder.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#0a0a0b',
        }}
        title="Site Builder"
        allow="clipboard-write"
      />
    </div>
  )
}
