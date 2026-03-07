'use client'

import { useState } from 'react'

interface McpHealth {
  version?: string
  uptime?: number
  connections?: number
  services?: string[]
  tools?: number
  mode?: string
  workflows_count?: number
}

interface McpWorkflow {
  name: string
  path?: string
  type?: string
  version?: string
}

interface SparkViewProps {
  mcpOnline: boolean
  mcpHealth: McpHealth | null
  mcpWorkflows: McpWorkflow[]
  onRunWorkflow: (name: string) => void
}

const QUICK_ACTIONS = [
  { name: 'publish-blog', label: 'Publish Blog', icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z', color: '#7ed957' },
  { name: 'crm-client-check', label: 'CRM Check', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', color: '#00d4ff' },
  { name: 'social-blast', label: 'Social Blast', icon: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13', color: '#a78bfa' },
  { name: 'client-onboard', label: 'Onboard Client', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6', color: '#ff6b35' },
  { name: 'deploy-notify', label: 'Deploy Notify', icon: 'M22 12h-4l-3 9L9 3l-3 9H2', color: '#7ed957' },
  { name: 'rss-update', label: 'RSS Update', icon: 'M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', color: '#00d4ff' },
]

export function SparkView({ mcpOnline, mcpHealth, mcpWorkflows, onRunWorkflow }: SparkViewProps) {
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null)
  const [recentRuns, setRecentRuns] = useState<{ name: string; time: string; status: string }[]>([])

  const isLocal = mcpHealth?.mode === 'local'

  const handleRun = async (name: string) => {
    setRunningWorkflow(name)
    onRunWorkflow(name)
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setRecentRuns(prev => [{ name, time, status: 'running' }, ...prev].slice(0, 5))
    // Clear running state after 3s
    setTimeout(() => {
      setRunningWorkflow(null)
      setRecentRuns(prev =>
        prev.map(r => r.name === name && r.status === 'running' ? { ...r, status: 'done' } : r)
      )
    }, 3000)
  }

  // Offline state — show setup instructions
  if (!mcpOnline) {
    return (
      <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            0nSpark is Offline
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 480, margin: '0 auto' }}>
            Start your local 0nMCP server to unlock free, unlimited workflow execution.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: '1.5rem',
          border: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            SETUP
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { step: '1', cmd: 'npm install -g 0nmcp', desc: 'Install 0nMCP globally' },
              { step: '2', cmd: '0nmcp engine import', desc: 'Import your API credentials' },
              { step: '3', cmd: '0nmcp serve --port 3001', desc: 'Start the local server' },
            ].map(({ step, cmd, desc }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: 8,
                  background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: '#7ed957', fontFamily: 'var(--font-mono)',
                }}>
                  {step}
                </span>
                <div>
                  <code style={{
                    display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
                    color: '#7ed957', marginBottom: 2,
                  }}>
                    {cmd}
                  </code>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', lineHeight: 1.5 }}>
            The Console auto-switches to Spark Runner when <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>0nmcp serve</code> is detected locally.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 960, margin: '0 auto', overflowY: 'auto' }}>
      {/* Mode Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem', borderRadius: 12, marginBottom: '1.5rem',
        background: isLocal ? 'rgba(126,217,87,0.06)' : 'rgba(0,212,255,0.06)',
        border: `1px solid ${isLocal ? 'rgba(126,217,87,0.2)' : 'rgba(0,212,255,0.2)'}`,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isLocal ? '#7ed957' : '#00d4ff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isLocal ? '#7ed957' : '#00d4ff' }}>
            {isLocal ? 'Local Mode (Free)' : 'Cloud Mode (Sparks)'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            {mcpHealth?.tools || 0} tools | v{mcpHealth?.version || '2.2.0'}
            {mcpHealth?.uptime ? ` | up ${Math.floor(mcpHealth.uptime / 60)}m` : ''}
          </span>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
          background: isLocal ? 'rgba(126,217,87,0.15)' : 'rgba(0,212,255,0.15)',
          color: isLocal ? '#7ed957' : '#00d4ff',
        }}>
          {isLocal ? 'LOCAL' : 'CLOUD'}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '0.75rem',
        }}>
          QUICK ACTIONS
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem',
        }}>
          {QUICK_ACTIONS.map(({ name, label, icon, color }) => (
            <button
              key={name}
              onClick={() => handleRun(name)}
              disabled={runningWorkflow === name}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '1rem 0.5rem', borderRadius: 12, cursor: 'pointer',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', transition: 'all 0.2s',
                opacity: runningWorkflow === name ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color
                e.currentTarget.style.background = `${color}08`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--bg-card)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{label}</span>
              {runningWorkflow === name && (
                <span style={{ fontSize: '0.6rem', color, fontFamily: 'var(--font-mono)' }}>Running...</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* All Workflows */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '0.75rem',
        }}>
          ALL WORKFLOWS ({mcpWorkflows.length})
        </h3>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {mcpWorkflows.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No workflows found in ~/.0n/workflows/
            </div>
          ) : (
            mcpWorkflows.map((wf, i) => (
              <div
                key={wf.name}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: i < mcpWorkflows.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: 3, flexShrink: 0,
                    background: QUICK_ACTIONS.find(q => q.name === wf.name) ? '#7ed957' : 'var(--text-muted)',
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {wf.name}
                  </span>
                  {wf.version && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      v{wf.version}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRun(wf.name)}
                  disabled={runningWorkflow === wf.name}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                    cursor: 'pointer', border: '1px solid rgba(126,217,87,0.3)',
                    background: runningWorkflow === wf.name ? 'rgba(126,217,87,0.2)' : 'rgba(126,217,87,0.08)',
                    color: '#7ed957', fontFamily: 'var(--font-mono)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(126,217,87,0.2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(126,217,87,0.08)' }}
                >
                  {runningWorkflow === wf.name ? 'Running...' : 'Run'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Runs */}
      {recentRuns.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '0.75rem',
          }}>
            RECENT RUNS
          </h3>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            {recentRuns.map((run, i) => (
              <div
                key={`${run.name}-${run.time}-${i}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 1rem',
                  borderBottom: i < recentRuns.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: 3,
                    background: run.status === 'running' ? '#ff6b35' : '#7ed957',
                    animation: run.status === 'running' ? 'sparkPulse 1s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {run.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {run.time}
                </span>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes sparkPulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
