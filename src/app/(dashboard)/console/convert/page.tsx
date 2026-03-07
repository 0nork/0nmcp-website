'use client'

import { useState } from 'react'

const formats = [
  { name: 'OpenAI → 0nMCP', desc: 'Convert OpenAI function calls to .0n workflows', color: '#10A37F' },
  { name: 'Gemini → 0nMCP', desc: 'Convert Google AI tool configs', color: '#1A73E8' },
  { name: 'LangChain → 0nMCP', desc: 'Convert LangChain tool definitions', color: '#1C3C3C' },
  { name: '.0n → JSON', desc: 'Export .0n workflows as standard JSON', color: '#ff6b35' },
  { name: 'JSON → .0n', desc: 'Convert JSON configs to .0n format', color: '#7ed957' },
  { name: 'MCP → OpenAI', desc: 'Generate OpenAI function schemas from MCP tools', color: '#00d4ff' },
]

export default function ConvertPage() {
  const [input, setInput] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
        Convert
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
        Transform configurations between AI platforms
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {formats.map(f => (
          <button
            key={f.name}
            onClick={() => setSelectedFormat(f.name)}
            style={{
              background: selectedFormat === f.name ? `${f.color}12` : 'var(--bg-card)',
              border: `1px solid ${selectedFormat === f.name ? f.color + '40' : 'var(--border)'}`,
              borderRadius: '0.875rem', padding: '1rem', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedFormat === f.name ? f.color : 'var(--text-primary)' }}>{f.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{f.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            INPUT {selectedFormat && `— ${selectedFormat.split('→')[0]?.trim()}`}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your config, function call JSON, or tool definition here...'
            style={{
              width: '100%', padding: '1rem', minHeight: 300,
              background: '#080810', border: 'none', color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              resize: 'vertical', lineHeight: 1.6,
            }}
          />
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            OUTPUT {selectedFormat && `— ${selectedFormat.split('→')[1]?.trim()}`}
          </div>
          <div style={{
            padding: '1rem', minHeight: 300, background: '#080810',
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {input ? 'Converting...' : 'Output will appear here after conversion'}
          </div>
        </div>
      </div>
    </div>
  )
}
