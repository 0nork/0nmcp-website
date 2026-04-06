'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowInstance,
  Handle,
  Position,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/**
 * 0n Canvas — Interactive Site Architecture Viewer & Scanner
 *
 * Features:
 * - Live URL crawler (fetches sitemap.xml from any domain)
 * - Interactive flowchart visualization
 * - Sitemap XML export
 * - .0n SWITCH file export (blueprint)
 * - Copy JSON to clipboard
 */

// ── Types ──

interface SiteNodeData extends Record<string, unknown> {
  label: string
  path: string
  nodeType: string
  color: string
  childCount: number
  lastmod?: string
  isLive: boolean
}

type SiteFlowNode = Node<SiteNodeData, 'siteNode'>

interface ScanStats {
  total_pages: number
  dynamic_routes: number
  groups: number
  api_routes: number
  total_nodes: number
  total_edges: number
}

interface ScanResult {
  schema: string
  generated: string
  site: string
  isLive: boolean
  urlCount: number
  stats: ScanStats
  nodes: SiteFlowNode[]
  edges: Edge[]
  tree: Record<string, unknown>
}

// ── Custom Node Component ──

function SiteNode({ data }: { data: SiteNodeData }) {
  return (
    <div
      className="canvas-node"
      style={{
        background: 'var(--bg-card)',
        border: `2px solid color-mix(in srgb, ${data.color} 25%, transparent)`,
        borderRadius: 'var(--radius-card)',
        padding: '12px 16px',
        minWidth: 200,
        maxWidth: 260,
        boxShadow: `var(--shadow-md), 0 0 0 1px color-mix(in srgb, ${data.color} 8%, transparent)`,
        transition: 'all var(--duration-fast) var(--ease-standard)',
        cursor: 'grab',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: data.color,
          width: 10,
          height: 10,
          border: '2px solid var(--bg-primary)',
          boxShadow: `0 0 8px color-mix(in srgb, ${data.color} 50%, transparent)`,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: data.color,
          width: 10,
          height: 10,
          border: '2px solid var(--bg-primary)',
          boxShadow: `0 0 8px color-mix(in srgb, ${data.color} 50%, transparent)`,
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: data.color,
            boxShadow: `0 0 10px color-mix(in srgb, ${data.color} 60%, transparent)`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {data.label}
        </span>
        {data.childCount > 0 && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: data.color,
              background: `color-mix(in srgb, ${data.color} 12%, transparent)`,
              padding: '2px 7px',
              borderRadius: 'var(--radius-badge)',
              flexShrink: 0,
              letterSpacing: '0.03em',
            }}
          >
            {data.childCount}
          </span>
        )}
      </div>

      {/* Path */}
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {data.path}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: data.color,
            opacity: 0.8,
          }}
        >
          {data.nodeType}
        </span>
        {data.isLive && (
          <span
            style={{
              fontSize: 7,
              fontWeight: 700,
              color: 'var(--color-success)',
              background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
              padding: '1px 5px',
              borderRadius: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            LIVE
          </span>
        )}
        {data.lastmod && (
          <span
            style={{
              fontSize: 8,
              color: 'var(--text-muted)',
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {data.lastmod.slice(0, 10)}
          </span>
        )}
      </div>
    </div>
  )
}

const nodeTypes = { siteNode: SiteNode }

// ── Export Panel ──

function ExportPanel({
  site,
  onExportXml,
  onExportSwitch,
  onCopyJson,
  onClose,
}: {
  site: string
  onExportXml: () => void
  onExportSwitch: () => void
  onCopyJson: () => void
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-modal)',
          padding: 32,
          minWidth: 380,
          maxWidth: 440,
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 6,
              fontFamily: 'var(--font-display)',
            }}
          >
            Export Site Blueprint
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Download the architecture of <strong style={{ color: 'var(--accent)' }}>{site}</strong> in
            your preferred format.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onExportSwitch} style={exportBtnStyle('var(--accent)')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Download .0n SWITCH File</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                Full site blueprint in 0n Standard format
              </div>
            </div>
          </button>

          <button onClick={onExportXml} style={exportBtnStyle('var(--color-cyan)')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Download Sitemap XML</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                Standard sitemap.xml for search engines
              </div>
            </div>
          </button>

          <button onClick={onCopyJson} style={exportBtnStyle('var(--color-purple)')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Copy JSON to Clipboard</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                Raw scan data including nodes & edges
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '10px',
            borderRadius: 'var(--radius-button)',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function exportBtnStyle(accentColor: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 18px',
    borderRadius: 'var(--radius-card)',
    background: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
    border: `1px solid color-mix(in srgb, ${accentColor} 20%, transparent)`,
    color: accentColor,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    textAlign: 'left',
    transition: 'all var(--duration-fast) var(--ease-standard)',
    width: '100%',
  }
}

// ── Scan Log (live crawler feedback) ──

function ScanLog({
  messages,
  isScanning,
}: {
  messages: string[]
  isScanning: boolean
}) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) return null

  return (
    <div
      ref={logRef}
      style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 16px',
        maxWidth: 500,
        maxHeight: 180,
        overflow: 'auto',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
      }}
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            color: i === messages.length - 1 && isScanning ? 'var(--accent)' : 'var(--text-muted)',
            padding: '2px 0',
            opacity: i === messages.length - 1 ? 1 : 0.6,
          }}
        >
          <span style={{ color: 'var(--accent)', marginRight: 8 }}>{'>'}</span>
          {msg}
        </div>
      ))}
      {isScanning && (
        <div style={{ color: 'var(--accent)', padding: '2px 0', animation: 'pulse 1.5s infinite' }}>
          <span style={{ marginRight: 8 }}>{'>'}</span>
          Scanning...
        </div>
      )}
    </div>
  )
}

// ── Main Component ──

export default function CanvasClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState<SiteFlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [stats, setStats] = useState<ScanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanUrl, setScanUrl] = useState('0nmcp.com')
  const [currentSite, setCurrentSite] = useState('0nmcp.com')
  const [exportData, setExportData] = useState<ScanResult | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [urlCount, setUrlCount] = useState(0)
  const [logMessages, setLogMessages] = useState<string[]>([])
  const [copiedJson, setCopiedJson] = useState(false)
  const [selectedNode, setSelectedNode] = useState<SiteNodeData | null>(null)
  const reactFlowRef = useRef<ReactFlowInstance<SiteFlowNode, Edge> | null>(null)

  const loadCanvas = useCallback(
    async (url: string) => {
      setLoading(true)
      setLogMessages([`Connecting to ${url}...`])
      setSelectedNode(null)

      try {
        setLogMessages((prev) => [...prev, 'Fetching sitemap...'])

        const res = await fetch(`/api/canvas/scan?url=${encodeURIComponent(url)}`)
        const data: ScanResult = await res.json()

        if (data.isLive) {
          setLogMessages((prev) => [
            ...prev,
            `Found ${data.urlCount} URLs in sitemap`,
            `Built ${data.stats.total_nodes} nodes, ${data.stats.total_edges} connections`,
            'Scan complete (live crawl)',
          ])
        } else {
          setLogMessages((prev) => [
            ...prev,
            'No sitemap found, using cached architecture',
            `Loaded ${data.stats.total_nodes} nodes`,
          ])
        }

        setNodes(data.nodes as SiteFlowNode[])
        setEdges(data.edges)
        setStats(data.stats)
        setExportData(data)
        setIsLive(data.isLive)
        setUrlCount(data.urlCount)
        setCurrentSite(url)

        // Recenter and zoom after nodes load
        setTimeout(() => {
          if (reactFlowRef.current) {
            reactFlowRef.current.fitView({ padding: 0.3, duration: 500 })
          }
        }, 100)
      } catch {
        setLogMessages((prev) => [...prev, 'Scan failed — check the URL and try again'])
      }
      setLoading(false)

      // Clear log after a few seconds
      setTimeout(() => setLogMessages([]), 4000)
    },
    [setNodes, setEdges],
  )

  useEffect(() => {
    loadCanvas('0nmcp.com')
  }, [loadCanvas])

  function handleScan() {
    if (scanUrl.trim()) loadCanvas(scanUrl.trim())
  }

  function handleExportXml() {
    const url = `/api/canvas/scan?url=${encodeURIComponent(currentSite)}&export=xml`
    window.open(url, '_blank')
    setShowExport(false)
  }

  function handleExportSwitch() {
    const url = `/api/canvas/scan?url=${encodeURIComponent(currentSite)}&export=switch`
    window.open(url, '_blank')
    setShowExport(false)
  }

  function handleCopyJson() {
    if (!exportData) return
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
    setShowExport(false)
  }

  function handleNodeClick(_event: React.MouseEvent, node: SiteFlowNode) {
    setSelectedNode(node.data)
  }

  const legend = useMemo(
    () => [
      { color: '#6EE05A', label: 'Page' },
      { color: '#a78bfa', label: 'Dynamic' },
      { color: '#f59e0b', label: 'Group' },
      { color: '#00d4ff', label: 'API' },
    ],
    [],
  )

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-primary)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      <style>{`
        .react-flow__attribution { display: none !important; }
        .react-flow__minimap {
          border-radius: var(--radius-card) !important;
          border: 1px solid var(--border) !important;
          overflow: hidden !important;
        }
        .react-flow__controls {
          border-radius: var(--radius-card) !important;
          border: 1px solid var(--border) !important;
          overflow: hidden !important;
        }
        .react-flow__controls button {
          background: var(--bg-card) !important;
          color: var(--text-primary) !important;
          border-bottom: 1px solid var(--border) !important;
        }
        .react-flow__controls button:hover {
          background: var(--bg-secondary) !important;
        }
        .react-flow__controls button svg {
          fill: var(--text-primary) !important;
        }
        .canvas-node:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-high) !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 20%, transparent); }
          50% { box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 35%, transparent); }
        }
      `}</style>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        defaultViewport={{ x: 200, y: 100, zoom: 0.85 }}
        onInit={(instance) => {
          reactFlowRef.current = instance
          // Fit to content once initial nodes are loaded
          setTimeout(() => instance.fitView({ padding: 0.3, duration: 500 }), 200)
        }}
        minZoom={0.05}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--grid-line-color)" gap={20} size={1} />
        <Controls position="bottom-left" />
        <MiniMap
          nodeColor={(n: Node) => {
            const d = n.data as Record<string, unknown>
            return (typeof d?.color === 'string' ? d.color : '#6EE05A')
          }}
          maskColor="color-mix(in srgb, var(--bg-primary) 85%, transparent)"
          style={{ background: 'var(--bg-card)' }}
          position="bottom-right"
        />

        {/* ── Top Bar (Search + Branding) ── */}
        <Panel position="top-left">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUp 0.3s var(--ease-decelerate)',
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <span style={{ color: 'var(--accent)' }}>0n</span>Canvas
              </span>
            </div>

            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

            {/* URL Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth={2}
                style={{ position: 'absolute', left: 10, zIndex: 1 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
              <input
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Paste any URL to scan..."
                style={{
                  width: 280,
                  padding: '9px 12px 9px 32px',
                  borderRadius: 'var(--radius-input)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: 'border-color var(--duration-fast)',
                }}
              />
            </div>

            <button
              onClick={handleScan}
              disabled={loading}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius-button)',
                background: loading ? 'var(--text-muted)' : 'var(--accent)',
                color: loading ? 'var(--bg-primary)' : '#000',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                transition: 'all var(--duration-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Scanning...' : 'Scan Site'}
            </button>
          </div>
        </Panel>

        {/* ── Stats + Actions Panel (Right Side) ── */}
        <Panel position="top-right">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '14px 18px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 220,
              animation: 'slideUp 0.3s var(--ease-decelerate) 0.1s both',
            }}
          >
            {/* Site header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {isLive && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    boxShadow: '0 0 8px var(--color-success)',
                    animation: 'pulse 2s infinite',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 170,
                }}
              >
                {currentSite}
              </span>
            </div>

            {isLive && (
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--color-success)',
                  fontWeight: 600,
                  padding: '4px 8px',
                  background: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
                  borderRadius: 'var(--radius-badge)',
                  textAlign: 'center',
                  marginBottom: 4,
                }}
              >
                Live crawl — {urlCount} URLs discovered
              </div>
            )}

            {stats && (
              <>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: 2,
                  }}
                >
                  Architecture
                </div>
                {[
                  { label: 'Pages', value: stats.total_pages, color: '#6EE05A' },
                  { label: 'Dynamic', value: stats.dynamic_routes, color: '#a78bfa' },
                  { label: 'Groups', value: stats.groups, color: '#f59e0b' },
                  { label: 'API Routes', value: stats.api_routes, color: '#00d4ff' },
                  { label: 'Nodes', value: stats.total_nodes, color: 'var(--text-secondary)' },
                  { label: 'Connections', value: stats.total_edges, color: 'var(--text-secondary)' },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 11,
                      padding: '2px 0',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                    <span
                      style={{
                        color: s.color,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}

                {/* Action Buttons */}
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 10,
                    marginTop: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <button
                    onClick={() => setShowExport(true)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-button)',
                      background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                      color: 'var(--accent)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all var(--duration-fast)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Export Blueprint
                  </button>

                  <button
                    onClick={handleExportXml}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-button)',
                      background: 'color-mix(in srgb, var(--color-cyan) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--color-cyan) 25%, transparent)',
                      color: 'var(--color-cyan)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all var(--duration-fast)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    Export Sitemap
                  </button>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={handleCopyJson}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-button)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        color: copiedJson ? 'var(--color-success)' : 'var(--text-muted)',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        transition: 'all var(--duration-fast)',
                      }}
                    >
                      {copiedJson ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <button
                      onClick={() => {
                        setNodes([])
                        setEdges([])
                        setStats(null)
                        setExportData(null)
                        setScanUrl('')
                        setIsLive(false)
                        setUrlCount(0)
                        setSelectedNode(null)
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-button)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        transition: 'all var(--duration-fast)',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* ── Node Detail Panel (click a node) ── */}
        {selectedNode && (
          <Panel position="bottom-right" style={{ marginBottom: 120, marginRight: 10 }}>
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--bg-card)',
                border: `1px solid color-mix(in srgb, ${selectedNode.color} 30%, var(--border))`,
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 220,
                maxWidth: 260,
                animation: 'slideUp 0.2s var(--ease-decelerate)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                  }}
                >
                  Node Detail
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  x
                </button>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                }}
              >
                {selectedNode.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 8,
                  wordBreak: 'break-all',
                }}
              >
                {selectedNode.path}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: selectedNode.color,
                    background: `color-mix(in srgb, ${selectedNode.color} 10%, transparent)`,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-badge)',
                  }}
                >
                  {selectedNode.nodeType}
                </span>
                {selectedNode.childCount > 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-primary)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-badge)',
                    }}
                  >
                    {selectedNode.childCount} children
                  </span>
                )}
                {selectedNode.isLive && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: 'var(--color-success)',
                      background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-badge)',
                    }}
                  >
                    LIVE
                  </span>
                )}
              </div>
              {selectedNode.lastmod && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                  Last modified: {selectedNode.lastmod}
                </div>
              )}
            </div>
          </Panel>
        )}

        {/* ── Legend ── */}
        <Panel position="bottom-left" style={{ marginLeft: 50, marginBottom: 10 }}>
          <div
            style={{
              display: 'flex',
              gap: 14,
              padding: '10px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-md)',
              alignItems: 'center',
            }}
          >
            {legend.map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: l.color,
                    boxShadow: `0 0 6px color-mix(in srgb, ${l.color} 50%, transparent)`,
                  }}
                />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
            <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Dashed = dynamic route
            </span>
          </div>
        </Panel>

        {/* ── Back Button ── */}
        <Panel position="top-center">
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-button)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all var(--duration-fast)',
              fontFamily: 'var(--font-display)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to 0nmcp.com
          </a>
        </Panel>
      </ReactFlow>

      {/* ── Scan Log ── */}
      <ScanLog messages={logMessages} isScanning={loading} />

      {/* ── Export Modal ── */}
      {showExport && (
        <ExportPanel
          site={currentSite}
          onExportXml={handleExportXml}
          onExportSwitch={handleExportSwitch}
          onCopyJson={handleCopyJson}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
