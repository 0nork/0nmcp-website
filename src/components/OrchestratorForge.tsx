'use client'

import { useState, useRef, useCallback } from 'react'

/**
 * 0nMCP Live Orchestrator Forge — Interactive Lead Gen Demo
 *
 * 5-stage flow:
 * 1. Start — Full-width banner with CTA
 * 2. Discover — Animated connection visualization with hub + radial burst
 * 3. Execute — 4-patent pipeline with typewriter terminal output
 * 4. Capture — Lead capture form
 * 5. Done — Confirmation
 */

const SERVICES = [
  { name: 'Stripe', abbr: 'St', color: '#635bff' },
  { name: 'Slack', abbr: 'Sl', color: '#4a154b' },
  { name: 'GitHub', abbr: 'Gh', color: '#333333' },
  { name: 'Supabase', abbr: 'Sb', color: '#3ecf8e' },
  { name: 'SendGrid', abbr: 'Sg', color: '#1a82e2' },
  { name: 'Twilio', abbr: 'Tw', color: '#f22f46' },
  { name: 'Google', abbr: 'Go', color: '#4285f4' },
  { name: 'Shopify', abbr: 'Sh', color: '#96bf48' },
  { name: 'Discord', abbr: 'Dc', color: '#5865f2' },
  { name: 'HubSpot', abbr: 'Hs', color: '#ff7a59' },
  { name: 'Linear', abbr: 'Li', color: '#5e6ad2' },
  { name: 'Notion', abbr: 'No', color: 'var(--text-primary)' },
  { name: 'OpenAI', abbr: 'Oa', color: '#10a37f' },
  { name: 'Anthropic', abbr: 'An', color: '#d4a574' },
  { name: 'Zoom', abbr: 'Zm', color: '#2d8cff' },
  { name: 'Jira', abbr: 'Ji', color: '#0052cc' },
  { name: 'Mailchimp', abbr: 'Mc', color: '#ffe01b' },
  { name: 'Figma', abbr: 'Fi', color: '#a259ff' },
  { name: 'Vercel', abbr: 'Vc', color: '#000000' },
  { name: 'LinkedIn', abbr: 'Ln', color: '#0A66C2' },
  { name: 'Square', abbr: 'Sq', color: '#333333' },
  { name: 'MongoDB', abbr: 'Mg', color: '#47a248' },
  { name: 'QuickBooks', abbr: 'Qb', color: '#2ca01c' },
  { name: 'Salesforce', abbr: 'Sf', color: '#00a1e0' },
]

const PIPELINE_STAGES = [
  { label: 'Analyze', desc: 'Understanding request' },
  { label: 'Route', desc: 'Selecting services' },
  { label: 'Execute', desc: 'Running workflow' },
  { label: 'Verify', desc: 'Securing output' },
]

type Stage = 'start' | 'discover' | 'execute' | 'capture' | 'done'

export default function OrchestratorForge() {
  const [stage, setStage] = useState<Stage>('start')
  const [task, setTask] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [execLines, setExecLines] = useState<string[]>([])

  // Discover stage state
  const [visibleServices, setVisibleServices] = useState<number>(0)
  const [connectingLines, setConnectingLines] = useState<number>(0)
  const [toolCount, setToolCount] = useState(0)
  const [showRings, setShowRings] = useState(false)
  const [showTaskInput, setShowTaskInput] = useState(false)

  // Execute stage state
  const [activePipelineStage, setActivePipelineStage] = useState(-1)
  const [showIWantThis, setShowIWantThis] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getServicePosition = useCallback((index: number, total: number, cx: number, cy: number, radius: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    }
  }, [])

  function startDemo() {
    setStage('discover')
    setVisibleServices(0)
    setConnectingLines(0)
    setToolCount(0)
    setShowRings(false)
    setShowTaskInput(false)

    // Stagger service appearances
    let svcCount = 0
    const svcInterval = setInterval(() => {
      svcCount++
      setVisibleServices(svcCount)
      if (svcCount >= SERVICES.length) clearInterval(svcInterval)
    }, 50)

    // Start connecting lines after 400ms
    setTimeout(() => {
      let lineCount = 0
      const lineInterval = setInterval(() => {
        lineCount++
        setConnectingLines(lineCount)
        if (lineCount >= SERVICES.length) clearInterval(lineInterval)
      }, 80)
    }, 400)

    // Animate tool counter
    setTimeout(() => {
      const targets = [100, 245, 400, 550, 700, 850, 995]
      let tIdx = 0
      const countInterval = setInterval(() => {
        if (tIdx < targets.length) {
          setToolCount(targets[tIdx])
          tIdx++
        } else {
          clearInterval(countInterval)
        }
      }, 300)
    }, 600)

    // Show radial burst rings
    setTimeout(() => setShowRings(true), 2200)

    // Show task input
    setTimeout(() => {
      setShowTaskInput(true)
      setTimeout(() => inputRef.current?.focus(), 100)
    }, 3000)
  }

  async function executeTask(overrideTask?: string) {
    const taskText = overrideTask || task || 'Book a meeting with John and send a follow-up email with an invoice'
    setStage('execute')
    setExecLines([])
    setActivePipelineStage(-1)
    setShowIWantThis(false)

    const lines = [
      { text: `[0nMCP] Task received: "${taskText}"`, pipelineStage: 0 },
      { text: '[0nMCP] Analyzing intent... matching to available services', pipelineStage: 0 },
      { text: '[0nMCP] Routing: Pipeline > 3 steps across 3 services', pipelineStage: 1 },
      { text: '[0nMCP] Services selected: Google Calendar, SendGrid, Stripe', pipelineStage: 1 },
      { text: '[Step 1/3] Google Calendar > calendar.event.create', pipelineStage: 2 },
      { text: '[Step 2/3] SendGrid > email.send (follow-up template)', pipelineStage: 2 },
      { text: '[Step 3/3] Stripe > invoice.create ($250 consultation)', pipelineStage: 2 },
      { text: '[0nMCP] All 3 steps executed successfully', pipelineStage: 3 },
      { text: '[0nMCP] Encrypted + sealed with AES-256-GCM', pipelineStage: 3 },
      { text: '', pipelineStage: 3 },
      { text: 'EXECUTION COMPLETE -- 0nMCP orchestrated 3 services in 1.2s', pipelineStage: 3 },
    ]

    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 350 + Math.random() * 250))
      setActivePipelineStage(lines[i].pipelineStage)
      setExecLines(prev => [...prev, lines[i].text])
    }

    await new Promise(r => setTimeout(r, 600))
    setShowIWantThis(true)
  }

  async function submitLead() {
    if (!email) return
    setSubmitting(true)

    try {
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

  // SVG dimensions for connection visualization
  const SVG_W = 800
  const SVG_H = 500
  const CX = SVG_W / 2
  const CY = SVG_H / 2
  const RADIUS = 200

  return (
    <section style={{ width: '100%', padding: 0 }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          overflow: 'hidden',
          background: '#07080C',
          color: 'var(--text-primary, #E8ECF4)',
          position: 'relative',
        }}
      >
        {/* Ambient background particles */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 300 + i * 80,
              height: 300 + i * 80,
              borderRadius: '50%',
              border: '1px solid rgba(110,224,90,0.04)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `ambientPulse ${6 + i * 2}s ease-in-out infinite ${i * 0.5}s`,
            }} />
          ))}
        </div>

        {/* Content wrapper */}
        <div style={{ position: 'relative', zIndex: 1, padding: '3rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{
              display: 'inline-block',
              padding: '5px 18px',
              borderRadius: 24,
              background: 'linear-gradient(135deg, #6EE05A, #3ecf8e)',
              color: '#0f172a',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.1em',
              marginBottom: 16,
              textTransform: 'uppercase',
            }}>
              TURN IT 0N
            </span>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              fontWeight: 900,
              marginBottom: 8,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              0nMCP Live Orchestrator
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 1.5vw, 17px)',
              color: 'rgba(255,255,255,0.55)',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              Watch 1,598+ tools come alive. See patent-pending orchestration in action. Then get this power for yourself.
            </p>
          </div>

          {/* ===================== STAGE 1: START ===================== */}
          {stage === 'start' && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 0 2rem',
              animation: 'forgeSlideUp 0.5s ease-out',
            }}>
              <button
                onClick={startDemo}
                style={{
                  padding: '20px 48px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
                  color: '#0f172a',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 0 20px rgba(110,224,90,0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 14px 50px rgba(0,0,0,0.4), 0 0 30px rgba(110,224,90,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.3), 0 0 20px rgba(110,224,90,0.2)'
                }}
              >
                Connect Your AI to 1,598+ Tools
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#6EE05A',
                  fontSize: 18,
                  fontWeight: 700,
                }}>
                  &rarr;
                </span>
              </button>
              <p style={{
                fontSize: 13,
                color: '#6EE05A',
                marginTop: 20,
                letterSpacing: '0.03em',
              }}>
                Zero config. Patent-pending security. Source-available.
              </p>
            </div>
          )}

          {/* ===================== STAGE 2: DISCOVER ===================== */}
          {stage === 'discover' && (
            <div style={{ animation: 'forgeSlideUp 0.4s ease-out' }}>
              {/* Connection Visualization */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: 800,
                margin: '0 auto 24px',
                aspectRatio: '800 / 500',
              }}>
                <svg
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                >
                  {/* Connection lines from center hub to each service */}
                  {SERVICES.map((svc, i) => {
                    if (i >= connectingLines) return null
                    const pos = getServicePosition(i, SERVICES.length, CX, CY, RADIUS)
                    return (
                      <line
                        key={`line-${i}`}
                        x1={CX}
                        y1={CY}
                        x2={pos.x}
                        y2={pos.y}
                        stroke="#6EE05A"
                        strokeWidth={1.5}
                        strokeOpacity={0.4}
                        style={{
                          strokeDasharray: 300,
                          strokeDashoffset: 300,
                          animation: `forgeDrawLine 0.6s ease-out ${i * 0.08}s forwards`,
                        }}
                      />
                    )
                  })}

                  {/* Radial burst rings */}
                  {showRings && [1, 2, 3].map(ring => (
                    <circle
                      key={`ring-${ring}`}
                      cx={CX}
                      cy={CY}
                      r={60 * ring}
                      fill="none"
                      stroke="#6EE05A"
                      strokeWidth={1}
                      strokeOpacity={0}
                      style={{
                        animation: `forgeRadialBurst 2s ease-out ${ring * 0.3}s forwards`,
                        transformOrigin: `${CX}px ${CY}px`,
                      }}
                    />
                  ))}

                  {/* Center hub */}
                  <circle
                    cx={CX}
                    cy={CY}
                    r={36}
                    fill="#0f172a"
                    stroke="#6EE05A"
                    strokeWidth={3}
                    style={{
                      animation: 'forgeHubPulse 2s ease-in-out infinite',
                      filter: 'drop-shadow(0 0 12px rgba(110,224,90,0.5))',
                    }}
                  />
                  <text
                    x={CX}
                    y={CY - 6}
                    textAnchor="middle"
                    fill="#6EE05A"
                    fontSize={10}
                    fontWeight={900}
                    letterSpacing="0.05em"
                  >
                    0nMCP
                  </text>
                  <text
                    x={CX}
                    y={CY + 8}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize={7}
                    fontWeight={600}
                  >
                    HUB
                  </text>

                  {/* Service nodes */}
                  {SERVICES.map((svc, i) => {
                    if (i >= visibleServices) return null
                    const pos = getServicePosition(i, SERVICES.length, CX, CY, RADIUS)
                    const isNotion = svc.name === 'Notion'
                    const isVercel = svc.name === 'Vercel'
                    const isDark = svc.color === '#333333' || svc.color === '#000000' || svc.color === '#4a154b'
                    return (
                      <g
                        key={svc.name}
                        style={{
                          animation: `forgeNodeAppear 0.4s ease-out ${i * 0.05}s both`,
                        }}
                      >
                        {/* Glow ring on connection */}
                        {i < connectingLines && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={24}
                            fill="none"
                            stroke={svc.color}
                            strokeWidth={1.5}
                            strokeOpacity={0}
                            style={{
                              animation: `forgeGlowPing 1s ease-out ${0.4 + i * 0.08}s forwards`,
                            }}
                          />
                        )}
                        {/* Circle avatar */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={20}
                          fill={svc.color}
                          stroke={isNotion || isVercel ? 'rgba(255,255,255,0.3)' : 'none'}
                          strokeWidth={isNotion || isVercel ? 1.5 : 0}
                          style={{
                            filter: i < connectingLines
                              ? `drop-shadow(0 0 6px ${svc.color}80)`
                              : 'none',
                            transition: 'filter 0.3s ease',
                          }}
                        />
                        {/* Abbreviation */}
                        <text
                          x={pos.x}
                          y={pos.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={isDark || isVercel ? '#fff' : (svc.color === '#ffe01b' ? '#333' : '#fff')}
                          fontSize={10}
                          fontWeight={800}
                          letterSpacing="0.02em"
                          style={{ pointerEvents: 'none' }}
                        >
                          {svc.abbr}
                        </text>
                        {/* Service name below */}
                        <text
                          x={pos.x}
                          y={pos.y + 34}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.6)"
                          fontSize={8}
                          fontWeight={600}
                          style={{ pointerEvents: 'none' }}
                        >
                          {svc.name}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Tool counter */}
              <div style={{
                textAlign: 'center',
                marginBottom: 24,
                minHeight: 40,
              }}>
                {toolCount > 0 && (
                  <p style={{
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    fontWeight: 800,
                    color: '#6EE05A',
                    animation: 'forgeSlideUp 0.3s ease-out',
                    margin: 0,
                  }}>
                    {toolCount >= 995 ? (
                      <>1,598+ tools ready</>
                    ) : (
                      <>Connecting... {toolCount} tools</>
                    )}
                  </p>
                )}
              </div>

              {/* Pre-set workflow buttons */}
              {showTaskInput && (
                <div style={{
                  maxWidth: 680,
                  margin: '0 auto',
                  animation: 'forgeSlideUp 0.5s ease-out',
                }}>
                  <p style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}>
                    Choose a workflow to see 0nMCP orchestrate it:
                  </p>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    justifyContent: 'center',
                  }}>
                    {[
                      { label: 'Send invoice + follow-up email', task: 'Send an invoice and follow-up email', services: 'Stripe, SendGrid', icon: '/' },
                      { label: 'Book meeting + notify team', task: 'Book a meeting and notify the team on Slack', services: 'Google Calendar, Slack', icon: '|' },
                      { label: 'Score leads + update CRM', task: 'Score all new leads and update the CRM pipeline', services: 'CRM, Supabase', icon: ':' },
                      { label: 'Post to all socials', task: 'Write and publish a social media post across all platforms', services: 'LinkedIn, Twitter, Dev.to', icon: '#' },
                      { label: 'Deploy site + run tests', task: 'Deploy the latest build and run integration tests', services: 'Vercel, GitHub', icon: '>' },
                      { label: 'Onboard new client', task: 'Create a new client account with CRM contact, Stripe customer, and welcome email', services: 'CRM, Stripe, SendGrid', icon: '+' },
                    ].map(w => (
                      <button
                        key={w.label}
                        onClick={() => { setTask(w.task); executeTask(w.task) }}
                        style={{
                          padding: '10px 18px',
                          borderRadius: 10,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(110,224,90,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(110,224,90,0.3)'
                          e.currentTarget.style.color = '#6EE05A'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--bg-card)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = '#e2e8f0'
                        }}
                      >
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.5 }}>{w.icon}</span>
                        {w.label}
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>{w.services}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== STAGE 3: EXECUTE ===================== */}
          {stage === 'execute' && (
            <div style={{ animation: 'forgeSlideUp 0.4s ease-out' }}>
              {/* Patent pipeline stages */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0,
                marginBottom: 28,
                flexWrap: 'wrap',
                padding: '0 1rem',
              }}>
                {PIPELINE_STAGES.map((ps, i) => {
                  const isActive = i <= activePipelineStage
                  const isCurrent = i === activePipelineStage
                  return (
                    <div key={ps.label} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        background: isActive
                          ? 'rgba(110,224,90,0.15)'
                          : 'var(--bg-card)',
                        border: `1px solid ${isActive ? 'rgba(110,224,90,0.4)' : 'var(--border)'}`,
                        transition: 'all 0.4s ease',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {isCurrent && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(110,224,90,0.08)',
                            animation: 'forgeStagePulse 1.5s ease-in-out infinite',
                          }} />
                        )}
                        <div style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: isActive ? '#6EE05A' : 'rgba(255,255,255,0.3)',
                          position: 'relative',
                          transition: 'color 0.4s ease',
                          whiteSpace: 'nowrap',
                        }}>
                          {isActive && <span style={{ marginRight: 4 }}>&#10003;</span>}
                          {ps.label}
                        </div>
                        <div style={{
                          fontSize: 9,
                          color: isActive ? 'rgba(110,224,90,0.7)' : 'rgba(255,255,255,0.2)',
                          marginTop: 2,
                          position: 'relative',
                          transition: 'color 0.4s ease',
                          whiteSpace: 'nowrap',
                        }}>
                          {ps.desc}
                        </div>
                      </div>
                      {i < PIPELINE_STAGES.length - 1 && (
                        <div style={{
                          width: 32,
                          height: 2,
                          margin: '0 4px',
                          background: i < activePipelineStage
                            ? '#6EE05A'
                            : 'var(--border)',
                          transition: 'background 0.4s ease',
                          borderRadius: 1,
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          {i < activePipelineStage && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(90deg, transparent, #6EE05A, transparent)',
                              animation: 'forgeLineShimmer 1.5s ease-in-out infinite',
                            }} />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Terminal output */}
              <div style={{
                maxWidth: 720,
                margin: '0 auto',
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(110,224,90,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                  {/* Terminal header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    background: 'rgba(0,0,0,0.3)',
                    borderBottom: '1px solid var(--bg-card)',
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                    <span style={{
                      marginLeft: 12,
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      fontFamily: 'monospace',
                    }}>
                      0nmcp execute
                    </span>
                  </div>
                  {/* Terminal body */}
                  <div style={{
                    padding: '20px 24px',
                    fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
                    fontSize: 'clamp(11px, 1.2vw, 13px)',
                    lineHeight: 2,
                    color: '#6EE05A',
                    minHeight: 280,
                    maxHeight: 380,
                    overflow: 'auto',
                  }}>
                    {execLines.map((line, i) => {
                      const isComplete = line.startsWith('EXECUTION')
                      const isStep = line.startsWith('[Step')
                      const isSeal = line.startsWith('[Seal')
                      const isVault = line.startsWith('[0nVault')
                      return (
                        <div
                          key={i}
                          style={{
                            color: isComplete ? '#fff'
                              : isStep ? '#fbbf24'
                              : isSeal ? '#a78bfa'
                              : isVault ? '#38bdf8'
                              : '#6EE05A',
                            fontWeight: isComplete ? 900 : 400,
                            fontSize: isComplete ? 'clamp(12px, 1.3vw, 14px)' : undefined,
                            animation: 'forgeTypeIn 0.3s ease-out',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {line ? (
                            <>
                              <span style={{ opacity: 0.3, marginRight: 8 }}>&gt;</span>
                              {line}
                              {isStep && <span style={{ color: '#6EE05A', marginLeft: 6 }}>&#10003;</span>}
                            </>
                          ) : '\u00A0'}
                        </div>
                      )
                    })}
                    {execLines.length < 12 && (
                      <span style={{
                        color: '#6EE05A',
                        animation: 'forgeBlink 1s step-end infinite',
                      }}>
                        &#9612;
                      </span>
                    )}
                  </div>
                </div>

                {/* I Want This CTA */}
                {showIWantThis && (
                  <div style={{
                    textAlign: 'center',
                    marginTop: 28,
                    animation: 'forgeSlideUp 0.5s ease-out',
                  }}>
                    <button
                      onClick={() => setStage('capture')}
                      style={{
                        padding: '18px 44px',
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
                        color: '#0f172a',
                        fontWeight: 900,
                        fontSize: 'clamp(15px, 1.8vw, 18px)',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 0 20px rgba(110,224,90,0.2)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        animation: 'forgeCtaPulse 2s ease-in-out infinite',
                        letterSpacing: '-0.01em',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                        e.currentTarget.style.animationPlayState = 'paused'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.animationPlayState = 'running'
                      }}
                    >
                      I Want This &mdash; Get Early Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== STAGE 4: CAPTURE ===================== */}
          {stage === 'capture' && (
            <div style={{
              maxWidth: 440,
              margin: '0 auto',
              padding: '1rem 0',
              animation: 'forgeSlideUp 0.4s ease-out',
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 20,
                padding: 32,
                border: '1px solid rgba(110,224,90,0.2)',
                boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
              }}>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 900,
                  marginBottom: 6,
                  letterSpacing: '-0.02em',
                }}>
                  Get Early Access
                </h3>
                <p style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}>
                  Personalized 0nMCP setup guide + Founders Badge + priority onboarding.
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: 15,
                    outline: 'none',
                    background: 'var(--border)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                    marginBottom: 10,
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(110,224,90,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: 15,
                    outline: 'none',
                    background: 'var(--border)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                    marginBottom: 16,
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(110,224,90,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button
                  onClick={submitLead}
                  disabled={submitting || !email}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 12,
                    background: !email
                      ? 'var(--border)'
                      : 'linear-gradient(135deg, #6EE05A, #3ecf8e)',
                    color: !email ? 'rgba(255,255,255,0.3)' : '#0f172a',
                    fontWeight: 900,
                    fontSize: 16,
                    border: 'none',
                    cursor: !email ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.15s ease, opacity 0.2s ease',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => { if (email) e.currentTarget.style.transform = 'scale(1.02)' }}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {submitting ? 'Submitting...' : 'Get Early Access'}
                </button>
              </div>
            </div>
          )}

          {/* ===================== STAGE 5: DONE ===================== */}
          {stage === 'done' && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 0',
              animation: 'forgeSlideUp 0.4s ease-out',
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(110,224,90,0.15)',
                border: '2px solid #6EE05A',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                animation: 'forgeHubPulse 2s ease-in-out infinite',
              }}>
                <span style={{ fontSize: 32, color: '#6EE05A' }}>&#10003;</span>
              </div>
              <h3 style={{
                fontSize: 26,
                fontWeight: 900,
                marginBottom: 10,
                letterSpacing: '-0.02em',
              }}>
                You&apos;re In
              </h3>
              <p style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.5)',
                maxWidth: 400,
                margin: '0 auto',
                lineHeight: 1.6,
              }}>
                Check your email. Your personalized 0nMCP setup guide is on the way. Founders Badge activated.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===================== KEYFRAME ANIMATIONS ===================== */}
      <style>{`
        @keyframes forgeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes forgeTypeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes forgeBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes forgeHubPulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(110,224,90,0.5));
          }
          50% {
            filter: drop-shadow(0 0 24px rgba(110,224,90,0.8));
          }
        }

        @keyframes forgeDrawLine {
          to { stroke-dashoffset: 0; }
        }

        @keyframes forgeNodeAppear {
          from {
            opacity: 0;
            transform: scale(0.4);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes forgeGlowPing {
          0% {
            r: 20;
            stroke-opacity: 0.6;
          }
          100% {
            r: 30;
            stroke-opacity: 0;
          }
        }

        @keyframes forgeRadialBurst {
          0% {
            transform: scale(0.3);
            stroke-opacity: 0.6;
          }
          60% {
            stroke-opacity: 0.2;
          }
          100% {
            transform: scale(1.8);
            stroke-opacity: 0;
          }
        }

        @keyframes forgeStagePulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        @keyframes forgeLineShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes forgeCtaPulse {
          0%, 100% {
            box-shadow: 0 8px 40px rgba(0,0,0,0.3), 0 0 20px rgba(110,224,90,0.2);
          }
          50% {
            box-shadow: 0 8px 40px rgba(0,0,0,0.3), 0 0 40px rgba(110,224,90,0.4);
          }
        }

        @keyframes ambientPulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </section>
  )
}
