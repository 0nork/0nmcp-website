'use client'

import { useState } from 'react'

const SAMPLE_WORKFLOW = `name: scout-agent
version: "1.0"
description: Monitors new leads and enriches contact data
author: 0nCrew

steps:
  - id: step_001
    name: Search for contact
    mcp_server: crm
    tool: search_contacts
    inputs:
      query: "{{trigger.contact_email}}"

  - id: step_002
    name: Enrich contact
    mcp_server: crm
    tool: update_contact
    depends_on: [step_001]
    inputs:
      contactId: "{{step_001.output.contacts[0].id}}"
      tags: ["enriched", "scout-processed"]

  - id: step_003
    name: Notify team
    mcp_server: slack
    tool: send_message
    depends_on: [step_002]
    inputs:
      channel: "#leads"
      text: "New lead enriched: {{step_001.output.contacts[0].name}}"
`

const DIR_STRUCTURE = [
  { name: 'config.json', type: 'file' },
  { name: 'connections/', type: 'dir', children: [
    { name: 'crm.0n', type: 'file' },
    { name: 'stripe.0n', type: 'file' },
    { name: 'supabase.0n', type: 'file' },
    { name: 'github.0n', type: 'file' },
    { name: 'vercel.0n', type: 'file' },
  ]},
  { name: 'workflows/', type: 'dir' },
  { name: 'snapshots/', type: 'dir' },
  { name: 'history/', type: 'dir' },
  { name: 'cache/', type: 'dir' },
  { name: 'plugins/', type: 'dir' },
]

export default function CodePage() {
  const [tab, setTab] = useState<'files' | 'editor'>('files')
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())

  const toggleDir = (name: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
            0n Code
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            View and edit .0n workflow files
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-card)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid var(--border)' }}>
          {(['files', 'editor'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none',
              background: tab === t ? 'rgba(167,139,250,0.15)' : 'transparent',
              color: tab === t ? '#a78bfa' : 'var(--text-muted)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{t === 'files' ? 'File Explorer' : 'Editor'}</button>
          ))}
        </div>
      </div>

      {tab === 'files' ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>~/.0n/</div>
          {DIR_STRUCTURE.map(item => (
            <div key={item.name}>
              <div
                onClick={() => item.type === 'dir' && toggleDir(item.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.375rem',
                  fontSize: '0.8rem', color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)', cursor: item.type === 'dir' ? 'pointer' : 'default',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}
              >
                <span style={{ color: item.type === 'dir' ? '#ff6b35' : '#a78bfa', fontSize: '0.9rem' }}>
                  {item.type === 'dir' ? (expandedDirs.has(item.name) ? '📂' : '📁') : '📄'}
                </span>
                {item.name}
              </div>
              {item.type === 'dir' && expandedDirs.has(item.name) && (item as { children?: typeof DIR_STRUCTURE }).children?.map(child => (
                <div key={child.name} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.75rem 0.375rem 2rem',
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)', cursor: 'pointer',
                }}>
                  <span style={{ color: '#7ed957', fontSize: '0.8rem' }}>📄</span>
                  {child.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>scout-agent.0n</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>— Sample Workflow</span>
          </div>
          <pre style={{
            background: '#080810', padding: '1.25rem', margin: 0,
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#c8c8d8',
            lineHeight: 1.7, minHeight: '400px', overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}>{SAMPLE_WORKFLOW}</pre>
        </div>
      )}
    </div>
  )
}
