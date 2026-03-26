'use client'

import { useState, useEffect } from 'react'

interface BrainStats {
  entries: number
  avgScore: number
  tier: string
  lastTraining: string
  growthRate: number
}

interface KnowledgeEntry {
  id: string
  topic: string
  score: number
  source: string
  created_at: string
}

export default function OnAIPage() {
  const [stats, setStats] = useState<BrainStats>({ entries: 0, avgScore: 0, tier: 'Seedling', lastTraining: 'Never', growthRate: 0 })
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [training, setTraining] = useState(false)
  const [testPrompt, setTestPrompt] = useState('')
  const [testResult, setTestResult] = useState('')
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const res = await fetch('/api/0nai/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || stats)
        setEntries(data.recent || [])
      }
    } catch {}
  }

  async function runTraining() {
    setTraining(true)
    try {
      const res = await fetch('/api/0nai/train', { method: 'POST' })
      const data = await res.json()
      if (data.success) loadStats()
    } catch {}
    setTraining(false)
  }

  async function testAI() {
    if (!testPrompt.trim()) return
    setTesting(true)
    setTestResult('')
    try {
      const res = await fetch('/api/0nai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testPrompt }),
      })
      const data = await res.json()
      setTestResult(data.result || data.error || 'No response')
    } catch (err) {
      setTestResult('Error: could not reach 0nAI')
    }
    setTesting(false)
  }

  const tierColors: Record<string, string> = {
    Seedling: '#22c55e', Sprout: '#3b82f6', Sapling: '#a855f7',
    Tree: '#f59e0b', Forest: '#ef4444', Ecosystem: '#ec4899',
  }

  const tierThresholds = [
    { name: 'Seedling', min: 0, max: 100 },
    { name: 'Sprout', min: 100, max: 500 },
    { name: 'Sapling', min: 500, max: 2000 },
    { name: 'Tree', min: 2000, max: 5000 },
    { name: 'Forest', min: 5000, max: 10000 },
    { name: 'Ecosystem', min: 10000, max: 20000 },
  ]

  const currentTier = tierThresholds.find(t => stats.entries >= t.min && stats.entries < t.max) || tierThresholds[0]
  const tierProgress = ((stats.entries - currentTier.min) / (currentTier.max - currentTier.min)) * 100

  return (
    <div style={{ padding: '2rem', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--accent)' }}>0n</span>AI Brain
            <span style={{
              background: `${tierColors[currentTier.name]}20`,
              color: tierColors[currentTier.name],
              fontSize: 11, fontWeight: 700, padding: '3px 10px',
              borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
            }}>{currentTier.name}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
            Training the AI brain. Every entry makes it smarter.
          </p>
        </div>
        <button
          onClick={runTraining}
          disabled={training}
          style={{
            padding: '10px 20px', background: 'var(--accent)', color: '#000',
            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit', opacity: training ? 0.5 : 1,
          }}
        >
          {training ? 'Training...' : 'Run Training Batch'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Knowledge Entries', value: stats.entries, color: '#22c55e' },
          { label: 'Avg Score', value: (stats.avgScore * 100).toFixed(0) + '%', color: '#3b82f6' },
          { label: 'Growth Rate', value: stats.growthRate + '/day', color: '#a855f7' },
          { label: 'Last Training', value: stats.lastTraining, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="module-card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tier Progress */}
      <div className="module-card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Brain Tier: <strong style={{ color: tierColors[currentTier.name] }}>{currentTier.name}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {stats.entries} / {currentTier.max} entries
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${Math.min(tierProgress, 100)}%`,
            background: `linear-gradient(90deg, ${tierColors[currentTier.name]}, ${tierColors[currentTier.name]}80)`,
            borderRadius: 4, transition: 'width 1s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
          {tierThresholds.map(t => (
            <span key={t.name} style={{ color: stats.entries >= t.min ? tierColors[t.name] : 'var(--text-muted)', fontWeight: stats.entries >= t.min ? 700 : 400 }}>
              {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Test AI */}
      <div className="module-card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', margin: '0 0 12px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
          Test 0nAI
        </h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={testPrompt}
            onChange={e => setTestPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && testAI()}
            placeholder="Ask the brain something..."
            style={{
              flex: 1, padding: '10px 14px', background: 'var(--bg-primary)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={testAI}
            disabled={testing}
            style={{
              padding: '10px 20px', background: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit', opacity: testing ? 0.5 : 1,
            }}
          >
            {testing ? '...' : 'Ask'}
          </button>
        </div>
        {testResult && (
          <div style={{
            background: 'var(--bg-primary)', border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)', borderRadius: 8, padding: 14,
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' as const,
          }}>
            {testResult}
          </div>
        )}
      </div>

      {/* Recent Knowledge Entries */}
      <div className="module-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
          Recent Knowledge Entries
        </h3>
        {entries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            {entries.map(e => (
              <div key={e.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'var(--bg-primary)',
                border: '1px solid var(--border)', borderRadius: 8, fontSize: 13,
              }}>
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{e.topic}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  color: e.score >= 0.8 ? '#22c55e' : e.score >= 0.6 ? '#f59e0b' : '#ef4444',
                  marginLeft: 12,
                }}>
                  {(e.score * 100).toFixed(0)}%
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 12 }}>
                  {e.source}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
            No entries yet. Click "Run Training Batch" to start building the brain.
          </div>
        )}
      </div>
    </div>
  )
}
