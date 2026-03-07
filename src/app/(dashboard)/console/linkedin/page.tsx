'use client'

export default function LinkedInPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
        LinkedIn
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
        LinkedIn content management and publishing
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Draft Post', desc: 'AI-generated professional content', icon: '✏️', color: '#0077b5' },
          { label: 'Schedule', desc: 'Queue posts for optimal engagement', icon: '📅', color: '#00d4ff' },
          { label: 'Analytics', desc: 'Track impressions and engagement', icon: '📊', color: '#7ed957' },
        ].map(a => (
          <div key={a.label} style={{
            background: 'var(--bg-card)', border: `1px solid ${a.color}20`, borderRadius: '0.875rem',
            padding: '1.5rem', cursor: 'pointer',
          }}>
            <span style={{ fontSize: '2rem' }}>{a.icon}</span>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.75rem' }}>{a.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{a.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Quick Draft</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
          Compose a LinkedIn post with AI assistance. Your post will be formatted for maximum engagement.
        </p>
        <textarea
          placeholder="What do you want to share on LinkedIn? AI will help you craft the perfect post..."
          style={{
            width: '100%', padding: '1rem', minHeight: 150,
            background: '#080810', border: '1px solid var(--border)', borderRadius: '0.5rem',
            color: 'var(--text-secondary)', fontFamily: 'inherit', fontSize: '0.85rem',
            resize: 'vertical', lineHeight: 1.6,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', gap: '0.5rem' }}>
          <button style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>AI Enhance</button>
          <button style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
            background: '#0077b5', color: '#fff', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Post to LinkedIn</button>
        </div>
      </div>
    </div>
  )
}
