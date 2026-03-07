'use client'

import { useState } from 'react'

/* ─── SHARED STYLES ─────────────────────────────────────────── */
const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '0.875rem',
  padding: '1.25rem',
} as const

const header = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-display)',
  margin: 0,
} as const

const sub = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  margin: '0.25rem 0 0 0',
} as const

const badge = (color: string) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.65rem',
  fontWeight: 700,
  padding: '0.25rem 0.625rem',
  borderRadius: '0.375rem',
  background: `${color}12`,
  color,
  border: `1px solid ${color}25`,
  letterSpacing: '0.04em',
}) as const

const statBlock = (color: string) => ({
  ...card,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '0.375rem',
  padding: '1.25rem',
  textAlign: 'center' as const,
  borderColor: `${color}20`,
})

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '0.75rem',
} as const

/* ─── OPERATIONS VIEW ───────────────────────────────────────── */
export function OperationsView({ flowCount, history }: {
  flowCount: number
  history: { id: string; type: string; detail: string; ts: number }[]
}) {
  return (
    <div style={{ padding: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={header}>Operations</h1>
      <p style={sub}>Active automations, workflow runs, and execution history</p>

      <div style={{ ...grid, marginTop: '1.25rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div style={statBlock('#22d3ee')}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#22d3ee', fontFamily: 'var(--font-mono)' }}>{flowCount}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saved Workflows</span>
        </div>
        <div style={statBlock('#7ed957')}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#7ed957', fontFamily: 'var(--font-mono)' }}>{history.filter(h => h.type === 'workflow').length}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Runs This Session</span>
        </div>
        <div style={statBlock('#ff6b35')}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ff6b35', fontFamily: 'var(--font-mono)' }}>{history.filter(h => h.type === 'error').length}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Errors</span>
        </div>
      </div>

      <div style={{ ...card, marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</span>
          <span style={badge('#22d3ee')}>LIVE</span>
        </div>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No operations yet. Run a workflow or execute a command to see activity here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.slice(0, 15).map(entry => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: entry.type === 'error' ? '#ef4444' : entry.type === 'workflow' ? '#22d3ee' : '#7ed957',
                }} />
                <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{entry.detail}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── SOCIAL HUB VIEW ───────────────────────────────────────── */
export function SocialView() {
  const platforms = [
    { name: 'Dev.to', icon: '🛠', color: '#0A0A0A', status: 'ready' },
    { name: 'LinkedIn', icon: '💼', color: '#0077b5', status: 'ready' },
    { name: 'Reddit', icon: '🔴', color: '#FF4500', status: 'ready' },
    { name: 'Twitter/X', icon: '𝕏', color: '#1DA1F2', status: 'coming' },
    { name: 'Medium', icon: '✍', color: '#00ab6c', status: 'coming' },
    { name: 'Hacker News', icon: '🟧', color: '#FF6600', status: 'coming' },
  ]

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={header}>Social Hub</h1>
      <p style={sub}>Multi-platform content distribution powered by 0nMCP</p>

      <div style={{ ...grid, marginTop: '1.25rem' }}>
        {platforms.map(p => (
          <div key={p.name} style={{
            ...card,
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            opacity: p.status === 'coming' ? 0.5 : 1,
            cursor: p.status === 'ready' ? 'pointer' : 'default',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
              <div style={{ fontSize: '0.65rem', color: p.status === 'ready' ? '#7ed957' : 'var(--text-muted)' }}>
                {p.status === 'ready' ? 'Connected' : 'Coming soon'}
              </div>
            </div>
            {p.status === 'ready' && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7ed957' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quick Post</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
          Use the AI Chat to draft and publish. Try: &quot;Write a LinkedIn post about AI automation&quot;
        </p>
      </div>
    </div>
  )
}

/* ─── REPORTING VIEW ────────────────────────────────────────── */
export function ReportingView({ historyCount, messageCount, connectedCount }: {
  historyCount: number; messageCount: number; connectedCount: number
}) {
  return (
    <div style={{ padding: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={header}>Reporting</h1>
      <p style={sub}>Analytics, usage metrics, and insights</p>

      <div style={{ ...grid, marginTop: '1.25rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Actions', value: historyCount, color: '#7ed957' },
          { label: 'Messages', value: messageCount, color: '#00d4ff' },
          { label: 'Services', value: connectedCount, color: '#ff6b35' },
          { label: 'Uptime', value: '99.9%', color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={statBlock(s.color)}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Session Summary</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
          Detailed analytics dashboards available with the Builder plan. Includes API usage tracking, cost analysis, and performance metrics.
        </p>
      </div>
    </div>
  )
}

/* ─── CODE VIEW ─────────────────────────────────────────────── */
export function CodeView() {
  const [tab, setTab] = useState<'files' | 'editor'>('files')

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={header}>0n Code</h1>
          <p style={sub}>View and edit .0n workflow files</p>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['files', 'editor'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none',
              background: tab === t ? 'rgba(167,139,250,0.15)' : 'transparent',
              color: tab === t ? '#a78bfa' : 'var(--text-muted)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{t === 'files' ? 'Files' : 'Editor'}</button>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginTop: '1.25rem' }}>
        {tab === 'files' ? (
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>~/.0n/</div>
            {['config.json', 'connections/', 'workflows/', 'snapshots/', 'history/', 'cache/', 'plugins/'].map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
                fontSize: '0.75rem', color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ color: f.endsWith('/') ? '#ff6b35' : '#a78bfa' }}>
                  {f.endsWith('/') ? '📁' : '📄'}
                </span>
                {f}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#0a0a0f', borderRadius: '0.5rem', padding: '1rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#a78bfa',
            lineHeight: 1.8, minHeight: '300px',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>{'# Select a .0n file to edit'}</span>
            <br />
            <span style={{ color: '#7ed957' }}>name</span>: <span style={{ color: '#ff6b35' }}>my-workflow</span>
            <br />
            <span style={{ color: '#7ed957' }}>version</span>: <span style={{ color: '#ff6b35' }}>&quot;1.0&quot;</span>
            <br />
            <span style={{ color: '#7ed957' }}>steps</span>:
            <br />
            <span style={{ color: 'var(--text-muted)' }}>{'  '}- <span style={{ color: '#7ed957' }}>id</span>: <span style={{ color: '#ff6b35' }}>step_001</span></span>
            <br />
            <span style={{ color: 'var(--text-muted)' }}>{'    '}<span style={{ color: '#7ed957' }}>tool</span>: <span style={{ color: '#ff6b35' }}>search_contacts</span></span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── LINKEDIN VIEW ─────────────────────────────────────────── */
export function LinkedInView() {
  return (
    <div style={{ padding: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={header}>LinkedIn</h1>
      <p style={sub}>LinkedIn content management and publishing</p>

      <div style={{ ...grid, marginTop: '1.25rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'Draft Post', desc: 'AI-generated LinkedIn post', icon: '✏️', color: '#0077b5' },
          { label: 'Schedule', desc: 'Queue posts for optimal times', icon: '📅', color: '#00d4ff' },
          { label: 'Analytics', desc: 'Track engagement metrics', icon: '📊', color: '#7ed957' },
        ].map(a => (
          <div key={a.label} style={{ ...card, cursor: 'pointer', borderColor: `${a.color}20` }}>
            <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{a.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{a.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quick Draft</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
          Use AI Chat: &quot;Write a LinkedIn post about [topic]&quot; to generate professional content instantly.
        </p>
      </div>
    </div>
  )
}

/* ─── MIGRATE VIEW ──────────────────────────────────────────── */
export function MigrateView() {
  const sources = [
    { name: 'Zapier', icon: '⚡', color: '#FF4A00' },
    { name: 'Make (Integromat)', icon: '🔄', color: '#6D00CC' },
    { name: 'n8n', icon: '🔗', color: '#EA4B71' },
    { name: 'IFTTT', icon: '🔲', color: '#000' },
    { name: '.env File', icon: '📄', color: '#7ed957' },
    { name: 'JSON Config', icon: '{ }', color: '#00d4ff' },
  ]

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={header}>Migrate</h1>
      <p style={sub}>Import workflows and credentials from other platforms</p>

      <div style={{ ...grid, marginTop: '1.25rem' }}>
        {sources.map(s => (
          <div key={s.name} style={{
            ...card, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Import from {s.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Credential Import</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>
          Drop a .env file or paste JSON credentials to auto-map them to 0nMCP services. Supports all 48 services.
        </p>
        <div style={{
          marginTop: '0.75rem', padding: '2rem', borderRadius: '0.5rem',
          border: '2px dashed var(--border)', textAlign: 'center',
          color: 'var(--text-muted)', fontSize: '0.75rem',
        }}>
          Drop .env, .json, or .csv file here — or use AI Chat: &quot;import my credentials&quot;
        </div>
      </div>
    </div>
  )
}

/* ─── CONVERT VIEW ──────────────────────────────────────────── */
export function ConvertView() {
  const formats = [
    { name: 'OpenAI → 0nMCP', desc: 'Convert OpenAI function calls', color: '#10A37F' },
    { name: 'Gemini → 0nMCP', desc: 'Convert Google AI configs', color: '#1A73E8' },
    { name: 'LangChain → 0nMCP', desc: 'Convert LangChain tools', color: '#1C3C3C' },
    { name: '.0n → JSON', desc: 'Export as standard JSON', color: '#ff6b35' },
  ]

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <h1 style={header}>Convert</h1>
      <p style={sub}>Transform configurations between AI platforms</p>

      <div style={{ ...grid, marginTop: '1.25rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {formats.map(f => (
          <div key={f.name} style={{
            ...card, cursor: 'pointer',
            borderColor: `${f.color}20`,
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: f.color }}>{f.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, marginTop: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Paste & Convert</span>
        <textarea
          placeholder='Paste your OpenAI function_call JSON, Gemini tool config, or any AI platform config here...'
          style={{
            width: '100%', marginTop: '0.75rem', padding: '0.75rem',
            background: '#0a0a0f', border: '1px solid var(--border)',
            borderRadius: '0.5rem', color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            minHeight: '150px', resize: 'vertical',
          }}
        />
      </div>
    </div>
  )
}
