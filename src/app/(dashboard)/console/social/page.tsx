'use client'

export default function SocialPage() {
  const platforms = [
    { name: 'Dev.to', icon: '🛠', color: '#0A0A0A', status: 'ready', desc: 'Developer community publishing' },
    { name: 'LinkedIn', icon: '💼', color: '#0077b5', status: 'ready', desc: 'Professional network posting' },
    { name: 'Reddit', icon: '🔴', color: '#FF4500', status: 'ready', desc: 'Subreddit & community posting' },
    { name: 'Twitter/X', icon: '𝕏', color: '#1DA1F2', status: 'coming', desc: 'Social media broadcasting' },
    { name: 'Medium', icon: '✍', color: '#00ab6c', status: 'coming', desc: 'Long-form content publishing' },
    { name: 'Hacker News', icon: '🟧', color: '#FF6600', status: 'coming', desc: 'Tech community sharing' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
        Social Hub
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
        Multi-platform content distribution powered by 0nMCP
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {platforms.map(p => (
          <div key={p.name} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem',
            padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
            opacity: p.status === 'coming' ? 0.5 : 1,
            cursor: p.status === 'ready' ? 'pointer' : 'default',
          }}>
            <span style={{ fontSize: '2rem' }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.desc}</div>
              <div style={{ fontSize: '0.65rem', color: p.status === 'ready' ? '#7ed957' : 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                {p.status === 'ready' ? '● Connected' : '○ Coming soon'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>Quick Post</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
          Use the AI Chat to draft and publish across platforms. Try commands like:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            'Write a LinkedIn post about AI automation',
            'Draft a Dev.to article on MCP servers',
            'Create a Reddit post for r/selfhosted',
          ].map(cmd => (
            <span key={cmd} style={{
              fontSize: '0.7rem', padding: '0.375rem 0.75rem', borderRadius: '2rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
            }}>{cmd}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
