'use client'

import { useState, useRef } from 'react'

/**
 * 0nMCP Live Orchestrator Forge — Interactive Lead Gen Demo
 *
 * 3-stage flow:
 * 1. "Connect" button → tool discovery animation
 * 2. User types a task → simulated execution through 4 patent stages
 * 3. Lead capture form → CRM contact creation
 */

const TOOLS = [
  'Gmail', 'Stripe', 'Notion', 'Slack', 'Calendar', 'HubSpot',
  'Linear', 'QuickBooks', 'Asana', 'Zoom', 'Airtable', 'Shopify',
  'GitHub', 'Supabase', 'Discord', 'Twilio', 'SendGrid', 'Jira',
  'MongoDB', 'Figma', 'Vercel', 'Mailchimp', 'Square', 'Dropbox',
]

type Stage = 'start' | 'discover' | 'execute' | 'capture' | 'done'

export default function OrchestratorForge() {
  const [stage, setStage] = useState<Stage>('start')
  const [task, setTask] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [execLines, setExecLines] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function startDemo() {
    setStage('discover')
    setTimeout(() => inputRef.current?.focus(), 1200)
  }

  async function executeTask() {
    const taskText = task || 'Book a meeting with John and send a follow-up email with an invoice'
    setStage('execute')
    setExecLines([])

    const lines = [
      `[0nMCP] Task received: "${taskText}"`,
      '[0nPlex] 7 AI agents debating optimal execution path...',
      '[0nPlex] Consensus: Pipeline → 3 steps, 2 services',
      '[0nVault] Credentials unlocked via AES-256-GCM + hardware fingerprint...',
      '[0nCore] Brand voice profile applied...',
      '[Step 1/3] calendar.event.create → Google Calendar ✓',
      '[Step 2/3] email.send → SendGrid (follow-up template) ✓',
      '[Step 3/3] invoice.create → Stripe ($250 consultation) ✓',
      '[Seal of Truth] SHA3-256 verification: all steps verified ✓',
      '',
      'EXECUTION COMPLETE — 0nMCP orchestrated 3 tools in 1.2s',
    ]

    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300))
      setExecLines(prev => [...prev, lines[i]])
    }
  }

  async function submitLead() {
    if (!email) return
    setSubmitting(true)

    try {
      // Send to CRM via the request-access endpoint
      await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Demo User',
          email,
          type: 'orchestrator-demo',
          source: 'orchestrator-forge',
          company: '',
          message: `Used Orchestrator Forge demo. Task: "${task || 'default'}"`,
        }),
      })
    } catch {}

    setSubmitting(false)
    setStage('done')
  }

  return (
    <section style={{
      maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem',
    }}>
      <div style={{
        borderRadius: 20, padding: '2.5rem 2rem', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a, #064e3b)',
        color: '#fff', position: 'relative',
        boxShadow: '0 16px 50px rgba(0,0,0,0.2), 0 0 0 2px #16a34a',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            background: '#6EE05A', color: '#0f172a', fontSize: 11,
            fontWeight: 900, letterSpacing: '0.06em', marginBottom: 12,
          }}>
            TURN IT 0N
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, marginBottom: 6 }}>
            0nMCP Live Orchestrator
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto' }}>
            Watch 945+ tools come alive. See patented orchestration in action. Then get this power for yourself.
          </p>
        </div>

        {/* Stage: Start */}
        {stage === 'start' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <button onClick={startDemo} style={{
              padding: '18px 40px', borderRadius: 16,
              background: '#fff', color: '#0f172a',
              fontSize: 18, fontWeight: 900, border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)' }}
            >
              Connect Your AI to 945+ Tools
              <span style={{ fontSize: 24 }}>→</span>
            </button>
            <p style={{ fontSize: 12, color: '#6EE05A', marginTop: 16 }}>Zero config. Patented security. MIT licensed.</p>
          </div>
        )}

        {/* Stage: Discover */}
        {stage === 'discover' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: 8, marginBottom: 24,
            }}>
              {TOOLS.map((tool, i) => (
                <div key={tool} style={{
                  padding: '10px 8px', borderRadius: 10, textAlign: 'center',
                  background: 'rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 600,
                  animation: `fadeIn 0.3s ${i * 50}ms both`,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  {tool}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: '#6EE05A', textAlign: 'center', marginBottom: 12 }}>
              945+ tools discovered. Type any task to see 0nMCP orchestrate it:
            </p>
            <div style={{ display: 'flex', gap: 8, maxWidth: 560, margin: '0 auto' }}>
              <input
                ref={inputRef}
                type="text"
                value={task}
                onChange={e => setTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && executeTask()}
                placeholder="e.g. Check my calendar and book a flight to NYC"
                style={{
                  flex: 1, padding: '14px 18px', borderRadius: 12,
                  border: 'none', fontSize: 14, color: '#1a1a1a',
                  outline: 'none', background: '#fff',
                }}
              />
              <button onClick={executeTask} style={{
                padding: '14px 24px', borderRadius: 12,
                background: '#6EE05A', color: '#0f172a',
                fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                Execute →
              </button>
            </div>
          </div>
        )}

        {/* Stage: Execute */}
        {stage === 'execute' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Patent pipeline */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 0, marginBottom: 20, fontSize: 11, flexWrap: 'wrap',
            }}>
              {['0nCore Voice', '0nPlex 7-AI Debate', 'Seal of Truth', '0nVault Secured'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 6,
                    background: 'rgba(110,224,90,0.15)', color: '#6EE05A',
                    fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    {step}
                  </span>
                  {i < 3 && <span style={{ margin: '0 6px', color: '#6EE05A' }}>→</span>}
                </div>
              ))}
            </div>

            {/* Terminal output */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', borderRadius: 14,
              padding: 20, fontFamily: 'monospace', fontSize: 12.5,
              lineHeight: 2, color: '#6EE05A', maxHeight: 320, overflow: 'auto',
            }}>
              {execLines.map((line, i) => (
                <div key={i} style={{
                  color: line.startsWith('EXECUTION') ? '#fff' : line.startsWith('[Step') ? '#fbbf24' : '#6EE05A',
                  fontWeight: line.startsWith('EXECUTION') ? 900 : 400,
                  animation: 'fadeIn 0.2s ease-out',
                }}>
                  {line || '\u00A0'}
                </div>
              ))}
              {execLines.length < 11 && (
                <span style={{ animation: 'blink 1s infinite' }}>▌</span>
              )}
            </div>

            {/* CTA after execution */}
            {execLines.length >= 11 && (
              <div style={{ textAlign: 'center', marginTop: 20, animation: 'fadeIn 0.5s ease-out' }}>
                <button onClick={() => setStage('capture')} style={{
                  padding: '16px 36px', borderRadius: 14,
                  background: '#fff', color: '#0f172a',
                  fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  I Want This — Get Early Access
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stage: Lead Capture */}
        {stage === 'capture' && (
          <div style={{
            maxWidth: 400, margin: '0 auto', padding: '1rem 0',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <div style={{
              background: '#fff', borderRadius: 16, padding: 28,
              color: '#1a1a1a', boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Get Early Access</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
                Personalized 0nMCP setup guide + Founders Badge + priority onboarding.
              </p>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={{ ...inputStyle, marginBottom: 8 }}
              />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <button onClick={submitLead} disabled={submitting || !email} style={{
                width: '100%', padding: '14px', borderRadius: 10,
                background: !email ? '#ccc' : '#1a1a1a', color: '#fff',
                fontWeight: 800, fontSize: 15, border: 'none',
                cursor: !email ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}>
                {submitting ? 'Submitting...' : 'Get Early Access'}
              </button>
            </div>
          </div>
        )}

        {/* Stage: Done */}
        {stage === 'done' && (
          <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>You're In</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', maxWidth: 360, margin: '0 auto' }}>
              Check your email. Your personalized 0nMCP setup guide is on the way. Founders Badge activated.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </section>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1px solid #ddd', fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
}
