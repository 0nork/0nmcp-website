'use client'

import { useState, useEffect } from 'react'
import { STATS_DISPLAY } from '@/data/stats'

// ── Ecosystem Data ──

interface EcoNode {
  id: string
  name: string
  type: 'product' | 'service' | 'database' | 'skill' | 'infrastructure'
  status: 'live' | 'building' | 'planned'
  description: string
  stats?: string
  url?: string
  color: string
  connections: string[]
}

const ECOSYSTEM: EcoNode[] = [
  // Core Products
  {
    id: '0nmcp',
    name: '0nMCP',
    type: 'product',
    status: 'live',
    description: 'Universal AI API Orchestrator — the core engine',
    stats: `${STATS_DISPLAY.tools} tools | ${STATS_DISPLAY.services} services | ${STATS_DISPLAY.categories} categories`,
    url: 'https://www.npmjs.com/package/0nmcp',
    color: '#ff6b35',
    connections: ['0n-spec', 'supabase-main', 'crm', 'stripe-main'],
  },
  {
    id: '0nmcp-website',
    name: '0nmcp.com',
    type: 'product',
    status: 'live',
    description: 'Marketing + Community + Console (0nLive)',
    stats: '91+ pages | 33 API routes | 50+ components',
    url: 'https://www.0nmcp.com',
    color: '#6EE05A',
    connections: ['supabase-main', 'stripe-main', '0nmcp', 'brain', 'command-queue'],
  },
  {
    id: 'marketplace',
    name: '0n Marketplace',
    type: 'product',
    status: 'live',
    description: 'SaaS platform — pay-per-execution workflow store',
    stats: 'Metered billing | AI workflow builder',
    url: 'https://marketplace.rocketclients.com',
    color: '#00d4ff',
    connections: ['supabase-main', 'stripe-main', '0nmcp', '0n-spec'],
  },
  {
    id: 'command-center',
    name: '0nCommand Center',
    type: 'product',
    status: 'live',
    description: '545-tool API Command Center — cloned from 0ntask template',
    stats: '80 routes | 10 engines | OAuth SSO',
    color: '#a78bfa',
    connections: ['0nmcp', 'supabase-command', 'crm'],
  },
  {
    id: '0ncore',
    name: '0nCore',
    type: 'product',
    status: 'building',
    description: 'Client CRM portal — deploy creations, manage business',
    stats: 'PIN access | Metered billing',
    url: 'https://0ncore.com',
    color: '#f97316',
    connections: ['supabase-customers', '0nmcp', 'crm'],
  },
  {
    id: '0n-spec',
    name: '0n-spec',
    type: 'product',
    status: 'live',
    description: 'The .0n Standard — universal config format + template engine',
    stats: 'npm: 0n-spec | CC-BY-4.0',
    url: 'https://www.npmjs.com/package/0n-spec',
    color: '#64748b',
    connections: ['0nmcp', 'marketplace'],
  },

  // AI Systems
  {
    id: 'brain',
    name: 'Council Brain',
    type: 'service',
    status: 'live',
    description: 'Self-training AI — 5 tiers, 7 personas, offline training',
    stats: 'Seed → Neural | $0/mo API cost',
    color: '#a78bfa',
    connections: ['0nmcp-website', 'training-skill', 'command-queue'],
  },
  {
    id: 'training-skill',
    name: '/training Skill',
    type: 'skill',
    status: 'live',
    description: 'Offline brain training — runs in Claude Code (MAX plan)',
    stats: 'Generates knowledge → writes to Supabase',
    color: '#a78bfa',
    connections: ['brain', 'supabase-main'],
  },
  {
    id: 'command-queue',
    name: 'Command Queue',
    type: 'service',
    status: 'live',
    description: '0nCommand ↔ 0nLive bridge — Supabase message bus',
    stats: 'Bidirectional | VIP permissions',
    color: '#00d4ff',
    connections: ['0nmcp-website', 'sync-skill', 'supabase-main'],
  },
  {
    id: 'sync-skill',
    name: '/0ncommand-sync',
    type: 'skill',
    status: 'live',
    description: 'Offline sync — pulls commands, executes, pushes results',
    stats: 'Poll → Claim → Execute → Complete',
    color: '#00d4ff',
    connections: ['command-queue', 'supabase-main'],
  },

  // Databases
  {
    id: 'supabase-main',
    name: 'Supabase (Main)',
    type: 'database',
    status: 'live',
    description: '0nmcp.com + Marketplace shared database',
    stats: 'pwujhhmlrtxjmjzyttwn | 50+ migrations',
    color: '#3ecf8e',
    connections: ['0nmcp-website', 'marketplace'],
  },
  {
    id: 'supabase-customers',
    name: 'Supabase (Customers)',
    type: 'database',
    status: 'live',
    description: '0nork customer portal database',
    stats: 'yaehbwimocvvnnlojkxe',
    color: '#3ecf8e',
    connections: ['0ncore'],
  },
  {
    id: 'supabase-command',
    name: 'Supabase (Command)',
    type: 'database',
    status: 'live',
    description: '0nCommand Center database',
    stats: 'Separate instance',
    color: '#3ecf8e',
    connections: ['command-center'],
  },

  // Infrastructure
  {
    id: 'crm',
    name: 'CRM (245 tools)',
    type: 'infrastructure',
    status: 'live',
    description: 'Full CRM integration — contacts, pipelines, conversations, social',
    stats: '245 tools | 12 modules | PIT auth',
    color: '#ef4444',
    connections: ['0nmcp', 'command-center', '0ncore'],
  },
  {
    id: 'stripe-main',
    name: 'Stripe',
    type: 'infrastructure',
    status: 'live',
    description: 'Payments — Runs, subscriptions, metered billing',
    stats: 'acct_1T2fHeQjehctdkQR',
    color: '#635bff',
    connections: ['0nmcp-website', 'marketplace'],
  },
  {
    id: 'vault',
    name: '0nVault',
    type: 'service',
    status: 'live',
    description: 'AES-256-GCM encrypted credential storage + containers',
    stats: 'Patent Pending: US #63/990,046',
    color: '#f59e0b',
    connections: ['0nmcp', '0nmcp-website'],
  },

  // Skills
  {
    id: '0ncommand-skill',
    name: '/0ncommand',
    type: 'skill',
    status: 'live',
    description: 'Master orchestrator — loads full ecosystem, builds automations',
    stats: 'The control plane',
    color: '#ff6b35',
    connections: ['0nmcp', 'sync-skill', 'training-skill'],
  },
  {
    id: '0nmcp-skill',
    name: '/0nmcp (User Skill)',
    type: 'skill',
    status: 'planned',
    description: 'Downloadable skill — turns Claude Code into 0nMCP environment',
    stats: 'Auth → Vault → Tools → Runs',
    color: '#ff6b35',
    connections: ['0nmcp-website', 'supabase-main', 'vault'],
  },
]

const TYPE_LABELS: Record<string, { label: string; bg: string }> = {
  product: { label: 'PRODUCT', bg: 'rgba(110, 224, 90, 0.15)' },
  service: { label: 'SERVICE', bg: 'rgba(0, 212, 255, 0.15)' },
  database: { label: 'DATABASE', bg: 'rgba(62, 207, 142, 0.15)' },
  skill: { label: 'SKILL', bg: 'rgba(167, 139, 250, 0.15)' },
  infrastructure: { label: 'INFRA', bg: 'rgba(239, 68, 68, 0.15)' },
}

const STATUS_DOTS: Record<string, string> = {
  live: '#6EE05A',
  building: '#ffb74d',
  planned: '#78788c',
}

export function AdminEcosystem() {
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [brainStats, setBrainStats] = useState<{ tier: number; knowledge: number; avgScore: number } | null>(null)
  const [queueStats, setQueueStats] = useState<{ pending: number; completed_today: number } | null>(null)

  useEffect(() => {
    // Fetch live stats
    fetch('/api/training/leaderboard')
      .then(r => r.json())
      .then(data => {
        setBrainStats({
          tier: data.currentTier?.tier ?? 0,
          knowledge: data.totalKnowledge ?? 0,
          avgScore: data.avgScore ?? 0,
        })
      })
      .catch(() => {})

    fetch('/api/command-queue')
      .then(r => r.json())
      .then(data => {
        setQueueStats({
          pending: data.pending ?? 0,
          completed_today: data.completed_today ?? 0,
        })
      })
      .catch(() => {})
  }, [])

  const filtered = filter === 'all' ? ECOSYSTEM : ECOSYSTEM.filter(n => n.type === filter)
  const selectedNode = ECOSYSTEM.find(n => n.id === selected)

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: 'var(--text-primary)' }}>
          0n Ecosystem Map
        </h2>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Everything we&apos;ve built and how it connects. Owner-only view.
        </div>
      </div>

      {/* Live Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 10,
        marginBottom: 20,
      }}>
        {[
          { label: 'Products', value: ECOSYSTEM.filter(n => n.type === 'product').length, color: '#6EE05A' },
          { label: 'Services', value: ECOSYSTEM.filter(n => n.type === 'service').length, color: '#00d4ff' },
          { label: 'Brain Tier', value: brainStats?.tier ?? '...', color: '#a78bfa' },
          { label: 'Knowledge', value: brainStats?.knowledge ?? '...', color: '#a78bfa' },
          { label: 'Queue', value: queueStats ? `${queueStats.pending} pending` : '...', color: '#ffb74d' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '12px 14px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'product', 'service', 'database', 'skill', 'infrastructure'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === f ? 'rgba(255, 107, 53, 0.4)' : 'var(--border)'}`,
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              color: filter === f ? '#ff6b35' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Two-column: Grid + Detail */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Node Grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, alignContent: 'start' }}>
          {filtered.map(node => (
            <button
              key={node.id}
              onClick={() => setSelected(selected === node.id ? null : node.id)}
              style={{
                background: selected === node.id ? 'rgba(255, 107, 53, 0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selected === node.id ? 'rgba(255, 107, 53, 0.3)' : 'var(--border)'}`,
                borderRadius: 10,
                padding: '14px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {/* Status dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: STATUS_DOTS[node.status],
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600, fontSize: 14, color: node.color }}>
                  {node.name}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: TYPE_LABELS[node.type]?.bg,
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>
                  {TYPE_LABELS[node.type]?.label}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {node.description}
              </div>
              {node.stats && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                  {node.stats}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <div style={{
            width: 300,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 20,
            alignSelf: 'start',
            position: 'sticky',
            top: 20,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${selectedNode.color}33, ${selectedNode.color}11)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
              border: `1px solid ${selectedNode.color}44`,
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: STATUS_DOTS[selectedNode.status],
              }} />
            </div>

            <h3 style={{ margin: 0, fontSize: 18, color: selectedNode.color, marginBottom: 4 }}>
              {selectedNode.name}
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              {selectedNode.description}
            </div>

            {selectedNode.stats && (
              <div style={{
                fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
                padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6, marginBottom: 12,
              }}>
                {selectedNode.stats}
              </div>
            )}

            {selectedNode.url && (
              <a href={selectedNode.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', fontSize: 12, color: '#00d4ff', marginBottom: 12,
                textDecoration: 'none',
              }}>
                {selectedNode.url} →
              </a>
            )}

            {/* Connections */}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Connects to:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selectedNode.connections.map(connId => {
                const conn = ECOSYSTEM.find(n => n.id === connId)
                return conn ? (
                  <button
                    key={connId}
                    onClick={() => setSelected(connId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: conn.color, flexShrink: 0 }} />
                    {conn.name}
                  </button>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>

      {/* Architecture Diagram */}
      <div style={{
        marginTop: 24,
        background: 'rgba(0, 212, 255, 0.03)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        borderRadius: 12,
        padding: 20,
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#00d4ff' }}>
          Data Flow Architecture
        </h3>
        <pre style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: 0,
          overflow: 'auto',
        }}>
{`0nCommand (OFFLINE)                  Supabase                    0nLive (ONLINE)
═══════════════════                  ════════                    ═══════════════
Claude Code (MAX plan)               Message Bus                 Vercel (0nmcp.com)
│                                    │                           │
├── /training                        │                           ├── Console Dashboard
│   └── Generates knowledge ────────►│ council_knowledge ───────►│   └── TrainingView
│                                    │                           │
├── /0ncommand-sync                  │                           ├── Command Queue UI
│   ├── Pulls pending commands ◄─────│ command_queue ◄───────────│   └── Queue commands
│   └── Pushes results ─────────────►│ command_queue ───────────►│   └── See results
│                                    │                           │
├── /0ncommand                       │                           ├── Admin Ecosystem
│   └── Full orchestration           │ sync_ledger               │   └── System map
│                                    │                           │
├── Content generation               │                           ├── Marketplace
│   └── Blog, social, SEO ─────────►│ posts, content ──────────►│   └── Store listings
│                                    │                           │
└── CRM actions ─────────────────────┼───────────────────────────┤   └── 245 tools
                                     │                           │
                                     └── vip_permissions ────────┘`}
        </pre>
      </div>

      {/* Planned: Downloadable Skill */}
      <div style={{
        marginTop: 16,
        background: 'rgba(255, 107, 53, 0.05)',
        border: '1px solid rgba(255, 107, 53, 0.2)',
        borderRadius: 12,
        padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 9, padding: '2px 8px', borderRadius: 4,
            background: 'rgba(255, 183, 77, 0.2)', color: '#ffb74d',
            fontWeight: 600, letterSpacing: '0.05em',
          }}>
            PLANNED
          </span>
          <h3 style={{ margin: 0, fontSize: 14, color: '#ff6b35' }}>
            Downloadable 0nMCP Skill for Claude Code
          </h3>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Users download a skill file, import it into Claude Code, authenticate with their 0nmcp.com account,
          and instantly turn Claude into a full 0nMCP environment. They get access to their Vault keys,
          workflows, training data — all powered by their Runs balance.
          This turns every Claude Code user into a potential 0nMCP customer.
        </div>
        <div style={{
          fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
          marginTop: 10, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 6,
        }}>
          Flow: Download SKILL.md → Import to ~/.claude/skills/ → /0nmcp login → Authenticated 0nMCP environment
        </div>
      </div>
    </div>
  )
}
