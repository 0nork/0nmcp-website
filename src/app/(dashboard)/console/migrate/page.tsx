'use client'

export default function MigratePage() {
  const sources = [
    { name: 'Zapier', icon: '⚡', color: '#FF4A00', desc: 'Import Zaps as .0n workflows' },
    { name: 'Make (Integromat)', icon: '🔄', color: '#6D00CC', desc: 'Convert Make scenarios' },
    { name: 'n8n', icon: '🔗', color: '#EA4B71', desc: 'Import n8n workflow JSON' },
    { name: 'IFTTT', icon: '🔲', color: '#333', desc: 'Convert IFTTT applets' },
    { name: '.env File', icon: '📄', color: '#7ed957', desc: 'Import credentials from .env' },
    { name: 'JSON Config', icon: '{ }', color: '#00d4ff', desc: 'Import from any JSON config' },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
        Migrate
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
        Import workflows and credentials from other platforms
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {sources.map(s => (
          <div key={s.name} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem',
            padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
          }}>
            <span style={{ fontSize: '2rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Credential Import</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
          Drop a .env file or paste JSON credentials. 0nMCP auto-maps to all 48 services.
        </p>
        <div style={{
          padding: '3rem', borderRadius: '0.5rem',
          border: '2px dashed var(--border)', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: '0.85rem',
          background: 'rgba(255,255,255,0.01)',
        }}>
          Drop .env, .json, or .csv file here
          <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            or use AI Chat: &quot;import my credentials from .env&quot;
          </div>
        </div>
      </div>
    </div>
  )
}
