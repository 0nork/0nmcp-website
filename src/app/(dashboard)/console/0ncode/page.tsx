'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/* ── Types ── */
interface Artifact {
  id: string
  styleName: string
  html: string
  status: 'streaming' | 'complete' | 'error'
}

interface Session {
  id: string
  prompt: string
  timestamp: number
  artifacts: Artifact[]
}

/* ── Helpers ── */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }

const STORAGE_KEY = '0n_code_sessions'

function loadSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function saveSessions(sessions: Session[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(-50))) }
  catch { /* quota */ }
}

/* ── Style presets shown on cards ── */
const STYLE_NAMES = ['Kinetic Wireframe', 'Risograph Press', 'Volumetric Glass']
const STYLE_COLORS = ['#4ade80', '#00d4ff', '#a78bfa']

/* ── Keyframes (injected once) ── */
const KEYFRAMES = `
@keyframes 0ncode-fadein { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes 0ncode-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
@keyframes 0ncode-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes 0ncode-spin { to { transform: rotate(360deg); } }
@keyframes 0ncode-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
`

export default function OnCodePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionIdx, setSessionIdx] = useState(-1)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editorCode, setEditorCode] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRefs = useRef<(HTMLIFrameElement | null)[]>([])

  const currentSession = sessionIdx >= 0 && sessionIdx < sessions.length ? sessions[sessionIdx] : null

  /* Load sessions from localStorage on mount */
  useEffect(() => {
    const loaded = loadSessions()
    if (loaded.length > 0) {
      setSessions(loaded)
      setSessionIdx(loaded.length - 1)
    }
  }, [])

  /* Save sessions whenever they change */
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions)
  }, [sessions])

  /* Focus input on mount */
  useEffect(() => { inputRef.current?.focus() }, [])

  /* Write HTML into iframe when artifacts update */
  useEffect(() => {
    if (!currentSession) return
    currentSession.artifacts.forEach((a, i) => {
      const iframe = previewRefs.current[i]
      if (iframe && a.html) {
        try {
          const doc = iframe.contentDocument
          if (doc) {
            doc.open()
            doc.write(a.html)
            doc.close()
          }
        } catch { /* cross-origin guard */ }
      }
    })
  }, [currentSession, currentSession?.artifacts])

  /* ── Generate ── */
  const generate = useCallback(async (text: string, mode: 'generate' | 'variations' = 'generate', currentHtml?: string) => {
    if (!text.trim() || generating) return
    setGenerating(true)
    setFocusedIdx(null)
    setShowEditor(false)

    const newSession: Session = {
      id: uid(),
      prompt: text,
      timestamp: Date.now(),
      artifacts: STYLE_NAMES.map((name, i) => ({
        id: uid(),
        styleName: name,
        html: '',
        status: 'streaming' as const,
      })),
    }

    const nextSessions = [...sessions, newSession]
    setSessions(nextSessions)
    setSessionIdx(nextSessions.length - 1)

    try {
      const res = await fetch('/api/console/0ncode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, mode, currentHtml }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Generation failed')
        setSessions(prev => {
          const copy = [...prev]
          const s = { ...copy[copy.length - 1] }
          s.artifacts = s.artifacts.map(a => ({ ...a, status: 'error' as const, html: `<div style="color:#f87171;padding:2rem;font-family:monospace">${errText}</div>` }))
          copy[copy.length - 1] = s
          return copy
        })
        setGenerating(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { setGenerating(false); return }

      const decoder = new TextDecoder()
      let buffer = ''
      let currentArtifact = 0
      const htmlChunks: string[] = ['', '', '']

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        /* Protocol: stream sends markers like ===VARIATION_0===, ===VARIATION_1===, ===VARIATION_2===, ===DONE=== */
        while (true) {
          const markerMatch = buffer.match(/===VARIATION_(\d)===/);
          const doneMatch = buffer.match(/===DONE===/);

          if (markerMatch && markerMatch.index !== undefined) {
            const beforeMarker = buffer.slice(0, markerMatch.index)
            if (beforeMarker && currentArtifact < 3) {
              htmlChunks[currentArtifact] += beforeMarker
            }
            currentArtifact = parseInt(markerMatch[1])
            buffer = buffer.slice(markerMatch.index + markerMatch[0].length)

            /* Mark previous artifacts as complete */
            setSessions(prev => {
              const copy = [...prev]
              const s = { ...copy[copy.length - 1] }
              s.artifacts = s.artifacts.map((a, i) => {
                if (i < currentArtifact && a.status === 'streaming') {
                  return { ...a, html: htmlChunks[i], status: 'complete' as const }
                }
                return a
              })
              copy[copy.length - 1] = s
              return copy
            })
          } else if (doneMatch && doneMatch.index !== undefined) {
            const beforeDone = buffer.slice(0, doneMatch.index)
            if (beforeDone && currentArtifact < 3) {
              htmlChunks[currentArtifact] += beforeDone
            }
            buffer = buffer.slice(doneMatch.index + doneMatch[0].length)

            setSessions(prev => {
              const copy = [...prev]
              const s = { ...copy[copy.length - 1] }
              s.artifacts = s.artifacts.map((a, i) => ({
                ...a,
                html: htmlChunks[i] || a.html,
                status: 'complete' as const,
              }))
              copy[copy.length - 1] = s
              return copy
            })
          } else {
            /* No marker found — accumulate for current artifact */
            if (currentArtifact < 3) {
              htmlChunks[currentArtifact] += buffer
              buffer = ''

              /* Update streaming preview */
              setSessions(prev => {
                const copy = [...prev]
                const s = { ...copy[copy.length - 1] }
                s.artifacts = s.artifacts.map((a, i) => {
                  if (i === currentArtifact) {
                    return { ...a, html: htmlChunks[i] }
                  }
                  return a
                })
                copy[copy.length - 1] = s
                return copy
              })
            } else {
              buffer = ''
            }
            break
          }
        }
      }

      /* Finalize any remaining */
      setSessions(prev => {
        const copy = [...prev]
        const s = { ...copy[copy.length - 1] }
        s.artifacts = s.artifacts.map((a, i) => ({
          ...a,
          html: htmlChunks[i] || a.html,
          status: (a.status === 'streaming' ? 'complete' : a.status) as Artifact['status'],
        }))
        copy[copy.length - 1] = s
        return copy
      })
    } catch (err) {
      setSessions(prev => {
        const copy = [...prev]
        const s = { ...copy[copy.length - 1] }
        s.artifacts = s.artifacts.map(a => ({
          ...a,
          status: 'error' as const,
          html: `<div style="color:#f87171;padding:2rem;font-family:monospace">Network error: ${err instanceof Error ? err.message : 'Unknown'}</div>`,
        }))
        copy[copy.length - 1] = s
        return copy
      })
    }

    setGenerating(false)
    setPrompt('')
  }, [generating, sessions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generate(prompt)
  }

  const handleVariations = (idx: number) => {
    if (!currentSession) return
    const artifact = currentSession.artifacts[idx]
    if (artifact && artifact.html) {
      generate(`Create 3 variations of this design: ${currentSession.prompt}`, 'variations', artifact.html)
    }
  }

  const openEditor = (idx: number) => {
    if (!currentSession) return
    const artifact = currentSession.artifacts[idx]
    if (artifact) {
      setEditorCode(artifact.html)
      setShowEditor(true)
      setFocusedIdx(idx)
    }
  }

  const applyEditorCode = () => {
    if (focusedIdx === null || !currentSession) return
    setSessions(prev => {
      const copy = [...prev]
      const s = { ...copy[sessionIdx] }
      s.artifacts = s.artifacts.map((a, i) => i === focusedIdx ? { ...a, html: editorCode } : a)
      copy[sessionIdx] = s
      return copy
    })
    setShowEditor(false)
  }

  const copyCode = (html: string) => {
    navigator.clipboard.writeText(html).catch(() => {})
  }

  /* ── Render ── */
  return (
    <div style={{
      padding: '24px 24px 100px',
      maxWidth: 1200,
      margin: '0 auto',
      width: '100%',
      minHeight: '100vh',
      position: 'relative',
      fontFamily: 'var(--jp-font, var(--font-body))',
    }}>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, margin: 0,
            color: 'var(--jp-text, var(--text-primary))',
            fontFamily: 'var(--font-display)',
          }}>
            0n<span style={{ color: '#4ade80' }}>Code</span>
          </h1>
          <p style={{
            fontSize: 13, margin: '4px 0 0',
            color: 'var(--jp-text-muted, var(--text-muted))',
          }}>
            AI-powered code snippet designer
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* History toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--jp-radius-sm, 8px)',
              background: showHistory ? 'rgba(74,222,128,0.12)' : 'var(--jp-surface, var(--bg-secondary))',
              border: `1px solid ${showHistory ? 'rgba(74,222,128,0.3)' : 'var(--jp-border, var(--border))'}`,
              color: showHistory ? '#4ade80' : 'var(--jp-text-secondary, var(--text-secondary))',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
            History
          </button>
          {/* Session nav */}
          {sessions.length > 1 && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setSessionIdx(Math.max(0, sessionIdx - 1))}
                disabled={sessionIdx <= 0}
                style={{
                  width: 34, height: 34, borderRadius: 'var(--jp-radius-sm, 8px)',
                  background: 'var(--jp-surface, var(--bg-secondary))',
                  border: '1px solid var(--jp-border, var(--border))',
                  color: sessionIdx <= 0 ? 'var(--jp-text-muted)' : 'var(--jp-text-secondary)',
                  cursor: sessionIdx <= 0 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: sessionIdx <= 0 ? 0.4 : 1,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => setSessionIdx(Math.min(sessions.length - 1, sessionIdx + 1))}
                disabled={sessionIdx >= sessions.length - 1}
                style={{
                  width: 34, height: 34, borderRadius: 'var(--jp-radius-sm, 8px)',
                  background: 'var(--jp-surface, var(--bg-secondary))',
                  border: '1px solid var(--jp-border, var(--border))',
                  color: sessionIdx >= sessions.length - 1 ? 'var(--jp-text-muted)' : 'var(--jp-text-secondary)',
                  cursor: sessionIdx >= sessions.length - 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: sessionIdx >= sessions.length - 1 ? 0.4 : 1,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── History Panel ── */}
      {showHistory && sessions.length > 0 && (
        <div style={{
          background: 'var(--jp-surface, var(--bg-secondary))',
          border: '1px solid var(--jp-border, var(--border))',
          borderRadius: 'var(--jp-radius, 12px)',
          padding: 16, marginBottom: 20,
          maxHeight: 240, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--jp-text-muted)', marginBottom: 12, fontFamily: 'var(--jp-font-mono, var(--font-mono))', letterSpacing: '0.04em' }}>
            SESSION HISTORY
          </div>
          {sessions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setSessionIdx(i); setShowHistory(false); setFocusedIdx(null); setShowEditor(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 12px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: i === sessionIdx ? 'rgba(74,222,128,0.1)' : 'transparent',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === sessionIdx ? '#4ade80' : 'var(--jp-text-muted)',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: i === sessionIdx ? '#4ade80' : 'var(--jp-text, var(--text-primary))',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {s.prompt}
                </div>
                <div style={{ fontSize: 11, color: 'var(--jp-text-muted)', marginTop: 2 }}>
                  {new Date(s.timestamp).toLocaleString()} — {s.artifacts.filter(a => a.status === 'complete').length}/3 complete
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!currentSession && !generating && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: 'calc(100vh - 280px)',
          textAlign: 'center', padding: '40px 20px',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 3" />
            </svg>
          </div>
          <h2 style={{
            fontSize: 28, fontWeight: 800, margin: '0 0 8px',
            color: 'var(--jp-text, var(--text-primary))',
            fontFamily: 'var(--font-display)',
          }}>
            Describe your component
          </h2>
          <p style={{
            fontSize: 15, color: 'var(--jp-text-muted, var(--text-muted))',
            maxWidth: 400, margin: '0 0 32px', lineHeight: 1.6,
          }}>
            Type a description below and get 3 unique, production-ready design variations.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
            {['A dark login form with glassmorphism', 'A pricing table with 3 tiers', 'A testimonial card with star ratings'].map(ex => (
              <button
                key={ex}
                onClick={() => { setPrompt(ex); inputRef.current?.focus() }}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: 'var(--jp-surface, var(--bg-secondary))',
                  border: '1px solid var(--jp-border, var(--border))',
                  color: 'var(--jp-text-secondary, var(--text-secondary))',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Cards grid ── */}
      {currentSession && focusedIdx === null && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          animation: '0ncode-fadein 0.4s ease-out',
        }}>
          {currentSession.artifacts.map((artifact, i) => (
            <div key={artifact.id} style={{
              background: 'var(--jp-surface, var(--bg-secondary))',
              border: '1px solid var(--jp-border, var(--border))',
              borderRadius: 'var(--jp-radius, 12px)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              animation: `0ncode-fadein 0.4s ease-out ${i * 0.1}s both`,
            }}>
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '1px solid var(--jp-border, var(--border))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: artifact.status === 'streaming' ? STYLE_COLORS[i] : artifact.status === 'complete' ? STYLE_COLORS[i] : '#f87171',
                    boxShadow: artifact.status === 'streaming' ? `0 0 8px ${STYLE_COLORS[i]}60` : 'none',
                    animation: artifact.status === 'streaming' ? '0ncode-pulse 1.5s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: STYLE_COLORS[i],
                    fontFamily: 'var(--jp-font-mono, var(--font-mono))',
                    letterSpacing: '0.03em',
                  }}>
                    {artifact.styleName}
                  </span>
                </div>
                {artifact.status === 'streaming' && (
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid var(--jp-border)',
                    borderTopColor: STYLE_COLORS[i],
                    animation: '0ncode-spin 0.8s linear infinite',
                  }} />
                )}
              </div>

              {/* Preview */}
              <div
                style={{
                  height: 280, position: 'relative', cursor: 'pointer',
                  background: '#0a0a0a',
                }}
                onClick={() => artifact.status === 'complete' && setFocusedIdx(i)}
              >
                {artifact.html ? (
                  <iframe
                    ref={el => { previewRefs.current[i] = el }}
                    sandbox="allow-scripts"
                    style={{
                      width: '100%', height: '100%', border: 'none',
                      pointerEvents: 'none', background: '#0a0a0a',
                    }}
                    title={artifact.styleName}
                  />
                ) : (
                  /* Streaming placeholder */
                  <div style={{ padding: 20 }}>
                    {[0.9, 0.6, 0.75, 0.5, 0.85, 0.4, 0.7, 0.55].map((w, li) => (
                      <div key={li} style={{
                        height: 10, borderRadius: 4, marginBottom: 8,
                        width: `${w * 100}%`,
                        background: 'linear-gradient(90deg, rgba(74,222,128,0.06) 0%, rgba(74,222,128,0.12) 50%, rgba(74,222,128,0.06) 100%)',
                        backgroundSize: '800px 100%',
                        animation: '0ncode-shimmer 1.5s linear infinite',
                      }} />
                    ))}
                  </div>
                )}
                {/* Expand hint */}
                {artifact.status === 'complete' && (
                  <div style={{
                    position: 'absolute', bottom: 10, right: 10,
                    padding: '4px 10px', borderRadius: 6,
                    background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(74,222,128,0.2)',
                    fontSize: 11, color: '#4ade80', fontWeight: 600,
                    fontFamily: 'var(--jp-font-mono, var(--font-mono))',
                    opacity: 0.7,
                  }}>
                    Click to focus
                  </div>
                )}
              </div>

              {/* Card actions */}
              <div style={{
                display: 'flex', gap: 6, padding: '10px 14px',
                borderTop: '1px solid var(--jp-border, var(--border))',
              }}>
                <button
                  onClick={() => copyCode(artifact.html)}
                  disabled={artifact.status !== 'complete'}
                  style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6,
                    background: 'transparent', border: '1px solid var(--jp-border, var(--border))',
                    color: 'var(--jp-text-secondary)', fontSize: 12, fontWeight: 600,
                    cursor: artifact.status === 'complete' ? 'pointer' : 'default',
                    opacity: artifact.status === 'complete' ? 1 : 0.4,
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  Copy
                </button>
                <button
                  onClick={() => openEditor(i)}
                  disabled={artifact.status !== 'complete'}
                  style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6,
                    background: 'transparent', border: '1px solid var(--jp-border, var(--border))',
                    color: 'var(--jp-text-secondary)', fontSize: 12, fontWeight: 600,
                    cursor: artifact.status === 'complete' ? 'pointer' : 'default',
                    opacity: artifact.status === 'complete' ? 1 : 0.4,
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                  Edit
                </button>
                <button
                  onClick={() => handleVariations(i)}
                  disabled={artifact.status !== 'complete' || generating}
                  style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6,
                    background: artifact.status === 'complete' && !generating ? 'rgba(74,222,128,0.1)' : 'transparent',
                    border: `1px solid ${artifact.status === 'complete' && !generating ? 'rgba(74,222,128,0.25)' : 'var(--jp-border, var(--border))'}`,
                    color: artifact.status === 'complete' && !generating ? '#4ade80' : 'var(--jp-text-muted)',
                    fontSize: 12, fontWeight: 600,
                    cursor: artifact.status === 'complete' && !generating ? 'pointer' : 'default',
                    opacity: artifact.status === 'complete' ? 1 : 0.4,
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18" /></svg>
                  Vary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Focus mode ── */}
      {currentSession && focusedIdx !== null && !showEditor && (
        <div style={{ animation: '0ncode-fadein 0.3s ease-out' }}>
          {/* Focus header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setFocusedIdx(null)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'var(--jp-surface, var(--bg-secondary))',
                  border: '1px solid var(--jp-border, var(--border))',
                  color: 'var(--jp-text-secondary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: STYLE_COLORS[focusedIdx],
              }} />
              <span style={{
                fontSize: 14, fontWeight: 700, color: STYLE_COLORS[focusedIdx],
                fontFamily: 'var(--jp-font-mono, var(--font-mono))',
              }}>
                {currentSession.artifacts[focusedIdx]?.styleName}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => copyCode(currentSession.artifacts[focusedIdx]?.html || '')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'var(--jp-surface, var(--bg-secondary))',
                  border: '1px solid var(--jp-border, var(--border))',
                  color: 'var(--jp-text-secondary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                Copy
              </button>
              <button
                onClick={() => openEditor(focusedIdx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'var(--jp-surface, var(--bg-secondary))',
                  border: '1px solid var(--jp-border, var(--border))',
                  color: 'var(--jp-text-secondary)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                Edit Source
              </button>
              <button
                onClick={() => handleVariations(focusedIdx)}
                disabled={generating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  color: '#4ade80', fontSize: 13, fontWeight: 600,
                  cursor: generating ? 'default' : 'pointer',
                  fontFamily: 'inherit', opacity: generating ? 0.5 : 1,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18" /></svg>
                Generate Variations
              </button>
            </div>
          </div>

          {/* Full-size preview */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid var(--jp-border, var(--border))',
            borderRadius: 'var(--jp-radius, 12px)',
            overflow: 'hidden',
            height: 'calc(100vh - 280px)',
            minHeight: 400,
          }}>
            <iframe
              ref={el => {
                if (el && currentSession.artifacts[focusedIdx]?.html) {
                  try {
                    const doc = el.contentDocument
                    if (doc) { doc.open(); doc.write(currentSession.artifacts[focusedIdx].html); doc.close() }
                  } catch {}
                }
              }}
              sandbox="allow-scripts"
              style={{ width: '100%', height: '100%', border: 'none', background: '#0a0a0a' }}
              title="Focused preview"
            />
          </div>
        </div>
      )}

      {/* ── Code editor overlay ── */}
      {showEditor && focusedIdx !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            width: '100%', maxWidth: 900, maxHeight: '80vh',
            background: 'var(--jp-surface, var(--bg-secondary))',
            border: '1px solid var(--jp-border, var(--border))',
            borderRadius: 'var(--jp-radius, 12px)',
            display: 'flex', flexDirection: 'column',
            animation: '0ncode-fadein 0.2s ease-out',
          }}>
            {/* Editor header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--jp-border, var(--border))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--jp-text)', fontFamily: 'var(--font-display)' }}>
                  Source Editor
                </span>
                <span style={{
                  fontSize: 11, color: 'var(--jp-text-muted)',
                  fontFamily: 'var(--jp-font-mono, var(--font-mono))',
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(74,222,128,0.08)',
                }}>
                  {currentSession?.artifacts[focusedIdx]?.styleName}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={applyEditorCode}
                  style={{
                    padding: '7px 16px', borderRadius: 6,
                    background: '#4ade80', border: 'none',
                    color: '#0a0a0a', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  style={{
                    padding: '7px 16px', borderRadius: 6,
                    background: 'transparent',
                    border: '1px solid var(--jp-border, var(--border))',
                    color: 'var(--jp-text-secondary)', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            {/* Textarea */}
            <textarea
              value={editorCode}
              onChange={e => setEditorCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, minHeight: 400, padding: 20,
                background: '#0a0a0a', border: 'none', outline: 'none',
                color: '#4ade80', fontSize: 13, lineHeight: 1.6,
                fontFamily: 'var(--jp-font-mono, var(--font-mono))',
                resize: 'none', tabSize: 2,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Floating input bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 24px 20px',
        background: 'linear-gradient(transparent, var(--jp-bg, var(--bg-primary)) 30%)',
        zIndex: 50,
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 700, margin: '0 auto',
            display: 'flex', gap: 8,
          }}
        >
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: 'var(--jp-surface, var(--bg-secondary))',
            border: '1px solid var(--jp-border, var(--border))',
            borderRadius: 'var(--jp-radius, 12px)',
            padding: '0 16px',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--jp-text-muted, var(--text-muted))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 10 }}>
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={generating ? 'Generating...' : 'Describe a UI component...'}
              disabled={generating}
              style={{
                flex: 1, padding: '14px 0',
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--jp-text, var(--text-primary))',
                fontSize: 14, fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || generating}
            style={{
              width: 48, height: 48, borderRadius: 'var(--jp-radius, 12px)',
              background: prompt.trim() && !generating ? '#4ade80' : 'var(--jp-surface, var(--bg-secondary))',
              border: prompt.trim() && !generating ? 'none' : '1px solid var(--jp-border, var(--border))',
              color: prompt.trim() && !generating ? '#0a0a0a' : 'var(--jp-text-muted)',
              cursor: prompt.trim() && !generating ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
            }}
          >
            {generating ? (
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid var(--jp-border)',
                borderTopColor: '#4ade80',
                animation: '0ncode-spin 0.8s linear infinite',
              }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
