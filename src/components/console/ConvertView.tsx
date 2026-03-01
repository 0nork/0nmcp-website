'use client'

import { useState } from 'react'

interface ConvertViewProps {
  onOpenInBuilder?: (data: Record<string, unknown>) => void
}

type ConvertStatus = 'idle' | 'converting' | 'done' | 'error'

interface ConvertResult {
  workflow: Record<string, unknown>
  platform: string
  format: string
  stats: { tools: number; prompts: number; settings: number }
}

export function ConvertView({ onOpenInBuilder }: ConvertViewProps) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<ConvertStatus>('idle')
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [error, setError] = useState('')
  const [savingVault, setSavingVault] = useState(false)
  const [savedVault, setSavedVault] = useState(false)

  const handleConvert = async () => {
    if (!input.trim()) return

    setStatus('converting')
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, filename: 'console-import' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const data: ConvertResult = await res.json()
      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setStatus('error')
    }
  }

  const handleSaveToVault = async () => {
    if (!result) return
    setSavingVault(true)

    try {
      await fetch('/api/console/vault-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (result.workflow.name as string) || 'Converted Workflow',
          type: 'workflow',
          content: result.workflow,
        }),
      })
      setSavedVault(true)
      setTimeout(() => setSavedVault(false), 2500)
    } catch {
      // Ignore
    } finally {
      setSavingVault(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  }

  return (
    <div
      style={{
        padding: 24,
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em',
        }}
      >
        Brain Transplant
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, marginTop: 0 }}>
        Paste any AI config (OpenAI, Gemini, Claude Desktop, OpenClaw) and convert it to a .0n SWITCH file.
      </p>

      {/* Input */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Input Config
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>JSON or CLAUDE.md</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste your OpenAI GPT config, Gemini config, claude_desktop_config.json, or CLAUDE.md here...'
          style={{
            width: '100%',
            minHeight: 200,
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--border)',
            backgroundColor: 'rgba(0,0,0,0.3)',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            resize: 'vertical',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={handleConvert}
            disabled={status === 'converting' || !input.trim()}
            style={{
              padding: '10px 28px',
              borderRadius: 12,
              border: 'none',
              background: status === 'converting' || !input.trim()
                ? 'var(--border)'
                : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: status === 'converting' || !input.trim() ? 'var(--text-muted)' : '#0a0a0f',
              fontSize: 14,
              fontWeight: 600,
              cursor: status === 'converting' || !input.trim() ? 'wait' : 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            {status === 'converting' ? 'Converting...' : 'Convert to .0n'}
          </button>

          {input.trim() && (
            <button
              onClick={() => { setInput(''); setResult(null); setStatus('idle'); setError('') }}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div
          style={{
            ...cardStyle,
            borderColor: 'rgba(255,59,48,0.3)',
            backgroundColor: 'rgba(255,59,48,0.05)',
          }}
        >
          <span style={{ color: '#ff3b30', fontSize: 14 }}>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <>
          {/* Stats bar */}
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Platform</span>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)', marginTop: 2 }}>{result.platform}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Format</span>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.format}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Tools</span>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.stats.tools}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Prompts</span>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.stats.prompts}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Settings</span>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.stats.settings}</div>
            </div>
          </div>

          {/* Output */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                .0n Output
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(result.workflow, null, 2))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <pre
              style={{
                width: '100%',
                maxHeight: 400,
                overflow: 'auto',
                padding: 16,
                borderRadius: 12,
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                color: 'var(--accent)',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {JSON.stringify(result.workflow, null, 2)}
            </pre>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={handleSaveToVault}
                disabled={savingVault}
                style={{
                  padding: '8px 20px',
                  borderRadius: 10,
                  border: savedVault ? '1px solid rgba(126,217,87,0.3)' : 'none',
                  background: savedVault ? 'rgba(126,217,87,0.15)' : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                  color: savedVault ? '#7ed957' : '#0a0a0f',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: savingVault ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {savedVault ? 'Saved to Vault' : savingVault ? 'Saving...' : 'Save to Vault'}
              </button>

              {onOpenInBuilder && (
                <button
                  onClick={() => onOpenInBuilder(result.workflow)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Open in Builder
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
