'use client'

import { useState } from 'react'
import { STATS_DISPLAY } from '@/data/stats'

/* ─── OPERATIONS VIEW ───────────────────────────────────────── */
export function OperationsView({ flowCount, history }: {
  flowCount: number
  history: { id: string; type: string; detail: string; ts: number }[]
}) {
  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <h1 className="text-xl font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0">Operations</h1>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">Active automations, workflow runs, and execution history</p>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="bg-[var(--bg-card)] border border-[rgba(34,211,238,0.13)] rounded-[0.875rem] p-5 flex flex-col items-center gap-1.5 text-center">
          <span className="text-3xl font-extrabold text-[#22d3ee] font-[var(--font-mono)]">{flowCount}</span>
          <span className="text-[0.7rem] text-[var(--text-muted)]">Saved Workflows</span>
        </div>
        <div className="bg-[var(--bg-card)] border border-[rgba(110,224,90,0.13)] rounded-[0.875rem] p-5 flex flex-col items-center gap-1.5 text-center">
          <span className="text-3xl font-extrabold text-[#6EE05A] font-[var(--font-mono)]">{history.filter(h => h.type === 'workflow').length}</span>
          <span className="text-[0.7rem] text-[var(--text-muted)]">Runs This Session</span>
        </div>
        <div className="bg-[var(--bg-card)] border border-[rgba(255,107,53,0.13)] rounded-[0.875rem] p-5 flex flex-col items-center gap-1.5 text-center">
          <span className="text-3xl font-extrabold text-[#ff6b35] font-[var(--font-mono)]">{history.filter(h => h.type === 'error').length}</span>
          <span className="text-[0.7rem] text-[var(--text-muted)]">Errors</span>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">Recent Activity</span>
          <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold py-1 px-2.5 rounded-md bg-[rgba(34,211,238,0.07)] text-[#22d3ee] border border-[rgba(34,211,238,0.15)] tracking-[0.04em]">LIVE</span>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-[0.8rem]">
            No operations yet. Run a workflow or execute a command to see activity here.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.slice(0, 15).map(entry => (
              <div key={entry.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.02]">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: entry.type === 'error' ? '#ef4444' : entry.type === 'workflow' ? '#22d3ee' : '#6EE05A' }}
                />
                <span className="flex-1 text-[0.75rem] text-[var(--text-secondary)]">{entry.detail}</span>
                <span className="text-[0.65rem] text-[var(--text-muted)] font-[var(--font-mono)]">
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
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <h1 className="text-xl font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0">Social Hub</h1>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">Multi-platform content distribution powered by 0nMCP</p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mt-5">
        {platforms.map(p => (
          <div
            key={p.name}
            className={[
              'bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 flex items-center gap-3',
              p.status === 'coming' ? 'opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className="text-2xl">{p.icon}</span>
            <div className="flex-1">
              <div className="text-[0.85rem] font-semibold text-[var(--text-primary)]">{p.name}</div>
              <div className={`text-[0.65rem] ${p.status === 'ready' ? 'text-[#6EE05A]' : 'text-[var(--text-muted)]'}`}>
                {p.status === 'ready' ? 'Connected' : 'Coming soon'}
              </div>
            </div>
            {p.status === 'ready' && (
              <div className="w-2 h-2 rounded-full bg-[#6EE05A]" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 mt-4">
        <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">Quick Post</span>
        <p className="text-[0.75rem] text-[var(--text-muted)] mt-2 mb-0">
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
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <h1 className="text-xl font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0">Reporting</h1>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">Analytics, usage metrics, and insights</p>

      <div className="grid grid-cols-4 gap-3 mt-5">
        {[
          { label: 'Actions', value: historyCount, color: '#6EE05A' },
          { label: 'Messages', value: messageCount, color: '#00d4ff' },
          { label: 'Services', value: connectedCount, color: '#ff6b35' },
          { label: 'Uptime', value: '99.9%', color: '#a78bfa' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-[var(--bg-card)] rounded-[0.875rem] p-5 flex flex-col items-center gap-1.5 text-center"
            style={{ border: `1px solid ${s.color}20` }}
          >
            <span className="text-[1.75rem] font-extrabold font-[var(--font-mono)]" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[0.7rem] text-[var(--text-muted)]">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 mt-4">
        <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">Session Summary</span>
        <p className="text-[0.75rem] text-[var(--text-muted)] mt-2 mb-0">
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
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0">0n Code</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">View and edit .0n workflow files</p>
        </div>
        <div className="flex gap-1">
          {(['files', 'editor'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={[
              'py-1.5 px-3 rounded-lg border-none text-[0.75rem] font-semibold cursor-pointer font-[inherit]',
              tab === t ? 'bg-[rgba(167,139,250,0.15)] text-[#a78bfa]' : 'bg-transparent text-[var(--text-muted)]',
            ].join(' ')}>
              {t === 'files' ? 'Files' : 'Editor'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 mt-5">
        {tab === 'files' ? (
          <div>
            <div className="text-[0.8rem] font-semibold text-[var(--text-primary)] mb-3">~/.0n/</div>
            {['config.json', 'connections/', 'workflows/', 'snapshots/', 'history/', 'cache/', 'plugins/'].map(f => (
              <div key={f} className="flex items-center gap-2 py-2 px-3 rounded-md text-[0.75rem] text-[var(--text-secondary)] font-[var(--font-mono)] border-b border-[var(--border)]">
                <span className={f.endsWith('/') ? 'text-[#ff6b35]' : 'text-[#a78bfa]'}>
                  {f.endsWith('/') ? '📁' : '📄'}
                </span>
                {f}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-primary)] rounded-lg p-4 font-[var(--font-mono)] text-[0.75rem] text-[#a78bfa] leading-[1.8] min-h-[300px]">
            <span className="text-[var(--text-muted)]">{'# Select a .0n file to edit'}</span>
            <br />
            <span className="text-[#6EE05A]">name</span>: <span className="text-[#ff6b35]">my-workflow</span>
            <br />
            <span className="text-[#6EE05A]">version</span>: <span className="text-[#ff6b35]">&quot;1.0&quot;</span>
            <br />
            <span className="text-[#6EE05A]">steps</span>:
            <br />
            <span className="text-[var(--text-muted)]">{'  '}- <span className="text-[#6EE05A]">id</span>: <span className="text-[#ff6b35]">step_001</span></span>
            <br />
            <span className="text-[var(--text-muted)]">{'    '}<span className="text-[#6EE05A]">tool</span>: <span className="text-[#ff6b35]">search_contacts</span></span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── LINKEDIN VIEW ─────────────────────────────────────────── */
export function LinkedInView() {
  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <h1 className="text-xl font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0">LinkedIn</h1>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">LinkedIn content management and publishing</p>

      <div className="grid grid-cols-3 gap-3 mt-5">
        {[
          { label: 'Draft Post', desc: 'AI-generated LinkedIn post', icon: '✏️', color: '#0077b5' },
          { label: 'Schedule', desc: 'Queue posts for optimal times', icon: '📅', color: '#00d4ff' },
          { label: 'Analytics', desc: 'Track engagement metrics', icon: '📊', color: '#6EE05A' },
        ].map(a => (
          <div
            key={a.label}
            className="bg-[var(--bg-card)] rounded-[0.875rem] p-5 cursor-pointer"
            style={{ border: `1px solid ${a.color}20` }}
          >
            <span className="text-2xl">{a.icon}</span>
            <div className="text-[0.85rem] font-semibold text-[var(--text-primary)] mt-2">{a.label}</div>
            <div className="text-[0.7rem] text-[var(--text-muted)] mt-1">{a.desc}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 mt-4">
        <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">Quick Draft</span>
        <p className="text-[0.75rem] text-[var(--text-muted)] mt-2 mb-0">
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
    { name: '.env File', icon: '📄', color: '#6EE05A' },
    { name: 'JSON Config', icon: '{ }', color: '#00d4ff' },
  ]

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <h1 className="text-xl font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0">Migrate</h1>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">Import workflows and credentials from other platforms</p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mt-5">
        {sources.map(s => (
          <div key={s.name} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 cursor-pointer flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-[0.85rem] font-semibold text-[var(--text-primary)]">{s.name}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)]">Import from {s.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 mt-4">
        <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">Credential Import</span>
        <p className="text-[0.75rem] text-[var(--text-muted)] mt-2 mb-0">
          Drop a .env file or paste JSON credentials to auto-map them to 0nMCP services. Supports all {STATS_DISPLAY.services} services.
        </p>
        <div className="mt-3 p-8 rounded-lg border-2 border-dashed border-[var(--border)] text-center text-[var(--text-muted)] text-[0.75rem]">
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
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <h1 className="text-xl font-bold text-[var(--text-primary)] font-[var(--font-display)] m-0">Convert</h1>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">Transform configurations between AI platforms</p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {formats.map(f => (
          <div
            key={f.name}
            className="bg-[var(--bg-card)] rounded-[0.875rem] p-5 cursor-pointer"
            style={{ border: `1px solid ${f.color}20` }}
          >
            <div className="text-[0.85rem] font-bold" style={{ color: f.color }}>{f.name}</div>
            <div className="text-[0.7rem] text-[var(--text-muted)] mt-1">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[0.875rem] p-5 mt-4">
        <span className="text-[0.85rem] font-bold text-[var(--text-primary)]">Paste & Convert</span>
        <textarea
          placeholder='Paste your OpenAI function_call JSON, Gemini tool config, or any AI platform config here...'
          className="w-full mt-3 p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] font-[var(--font-mono)] text-[0.75rem] min-h-[150px] resize-y outline-none focus:border-[var(--accent)] transition-colors duration-150"
        />
      </div>
    </div>
  )
}
