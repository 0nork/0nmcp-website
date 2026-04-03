'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/**
 * 0n Canvas — Interactive Site Architecture Viewer
 *
 * Scans URL structures and renders them as interactive flowcharts.
 * Exports as .0n sitemap files.
 */

interface ScanResult {
  stats: {
    total_pages: number
    dynamic_routes: number
    groups: number
    total_nodes: number
    total_edges: number
  }
  nodes: Node[]
  edges: Edge[]
  tree: any
}

/* ─── Custom Node Component ─── */
function SiteNode({ data }: NodeProps) {
  const d = data as {
    label: string
    path: string
    nodeType: string
    color: string
    childCount: number
  }

  return (
    <div style={{
      background: '#111827',
      border: `2px solid ${d.color}40`,
      borderRadius: 12,
      padding: '10px 16px',
      minWidth: 180,
      boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px ${d.color}15`,
      transition: 'all 0.2s',
      cursor: 'grab',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: d.color, width: 8, height: 8, border: '2px solid #111827' }} />
      <Handle type="source" position={Position.Right} style={{ background: d.color, width: 8, height: 8, border: '2px solid #111827' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: d.color,
          boxShadow: `0 0 6px ${d.color}80`,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 13, fontWeight: 700, color: '#E8EAED',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {d.label}
        </span>
        {d.childCount > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: d.color,
            background: `${d.color}15`,
            padding: '1px 6px', borderRadius: 4,
            marginLeft: 'auto', flexShrink: 0,
          }}>
            {d.childCount}
          </span>
        )}
      </div>

      <div style={{
        fontSize: 10, color: '#4A5568',
        fontFamily: "'JetBrains Mono', monospace",
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {d.path}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
      }}>
        <span style={{
          fontSize: 8, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: d.color, opacity: 0.7,
        }}>
          {d.nodeType}
        </span>
      </div>
    </div>
  )
}

const nodeTypes = { siteNode: SiteNode }

/* ─── Main Component ─── */
export default function CanvasClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const [stats, setStats] = useState<ScanResult['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanUrl, setScanUrl] = useState('0nmcp.com')
  const [exportData, setExportData] = useState<any>(null)

  const loadCanvas = useCallback(async (url: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/canvas/scan?url=${encodeURIComponent(url)}`)
      const data: ScanResult & { schema: string; tree: any } = await res.json()
      setNodes(data.nodes)
      setEdges(data.edges)
      setStats(data.stats)
      setExportData(data)
    } catch (e) {
      console.error('Canvas scan failed:', e)
    }
    setLoading(false)
  }, [setNodes, setEdges])

  useEffect(() => {
    loadCanvas('0nmcp.com')
  }, [loadCanvas])

  function handleScan() {
    if (scanUrl.trim()) loadCanvas(scanUrl.trim())
  }

  function handleExport() {
    if (!exportData) return
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${scanUrl.replace(/[^a-z0-9]/gi, '-')}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleCopy() {
    if (!exportData) return
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
  }

  const legend = useMemo(() => [
    { color: '#6EE05A', label: 'Page' },
    { color: '#a78bfa', label: 'Dynamic' },
    { color: '#f59e0b', label: 'Group' },
    { color: '#00d4ff', label: 'API' },
  ], [])

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#0B0F19',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 50,
    }}>
      <style>{`
        .react-flow__attribution { display: none !important; }
        .react-flow__minimap { border-radius: 10px !important; border: 1px solid #1E293B !important; overflow: hidden !important; }
        .react-flow__controls { border-radius: 10px !important; border: 1px solid #1E293B !important; overflow: hidden !important; }
        .react-flow__controls button { background: #111827 !important; color: #E8EAED !important; border-bottom: 1px solid #1E293B !important; }
        .react-flow__controls button:hover { background: #162032 !important; }
        .react-flow__controls button svg { fill: #E8EAED !important; }
      `}</style>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E293B" gap={20} size={1} />
        <Controls position="bottom-left" />
        <MiniMap
          nodeColor={(n) => (n.data as any)?.color || '#6EE05A'}
          maskColor="rgba(11, 15, 25, 0.85)"
          style={{ background: '#111827' }}
          position="bottom-right"
        />

        {/* ── Top Bar ── */}
        <Panel position="top-left">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px',
            background: '#111827',
            border: '1px solid #1E293B',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            {/* Logo */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#E8EAED', letterSpacing: '-0.02em' }}>
                <span style={{ color: '#6EE05A' }}>0n</span>Canvas
              </span>
            </div>

            <div style={{ width: 1, height: 24, background: '#1E293B' }} />

            {/* URL Input */}
            <input
              value={scanUrl}
              onChange={e => setScanUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Enter URL to scan..."
              style={{
                width: 220,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #1E293B',
                background: '#0B0F19',
                color: '#E8EAED',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                outline: 'none',
              }}
            />
            <button onClick={handleScan} disabled={loading} style={{
              padding: '8px 14px', borderRadius: 8,
              background: '#6EE05A', color: '#000',
              fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.5 : 1,
            }}>
              {loading ? 'Scanning...' : 'Scan'}
            </button>
          </div>
        </Panel>

        {/* ── Stats Bar ── */}
        <Panel position="top-right">
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            padding: '12px 16px',
            background: '#111827',
            border: '1px solid #1E293B',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            minWidth: 180,
          }}>
            {stats && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                  Site Map
                </div>
                {[
                  { label: 'Pages', value: stats.total_pages, color: '#6EE05A' },
                  { label: 'Dynamic', value: stats.dynamic_routes, color: '#a78bfa' },
                  { label: 'Groups', value: stats.groups, color: '#f59e0b' },
                  { label: 'Nodes', value: stats.total_nodes, color: '#E8EAED' },
                  { label: 'Connections', value: stats.total_edges, color: '#E8EAED' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#7A8290' }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: 8, marginTop: 4, display: 'flex', gap: 6 }}>
                  <button onClick={handleExport} style={{
                    flex: 1, padding: '6px 10px', borderRadius: 6,
                    background: 'rgba(110,224,90,0.1)', border: '1px solid rgba(110,224,90,0.2)',
                    color: '#6EE05A', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Export .0n
                  </button>
                  <button onClick={handleCopy} style={{
                    flex: 1, padding: '6px 10px', borderRadius: 6,
                    background: '#1E293B', border: '1px solid #2D3748',
                    color: '#7A8290', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Copy JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* ── Legend ── */}
        <Panel position="bottom-left" style={{ marginLeft: 50, marginBottom: 10 }}>
          <div style={{
            display: 'flex', gap: 12,
            padding: '8px 14px',
            background: '#111827',
            border: '1px solid #1E293B',
            borderRadius: 8,
          }}>
            {legend.map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 10, color: '#7A8290', fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
            <div style={{ width: 1, height: 14, background: '#1E293B' }} />
            <span style={{ fontSize: 10, color: '#4A5568' }}>
              Dashed = dynamic route
            </span>
          </div>
        </Panel>

        {/* ── Back Button ── */}
        <Panel position="top-center">
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            background: '#111827', border: '1px solid #1E293B',
            color: '#7A8290', fontSize: 11, fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.2s',
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to 0nmcp.com
          </a>
        </Panel>
      </ReactFlow>
    </div>
  )
}
