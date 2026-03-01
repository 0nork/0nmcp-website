'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Workflow,
  Palette,
  FileText,
  Lock,
  ScrollText,
  Gift,
  Puzzle,
  FolderOpen,
  Search,
  MoreVertical,
  ExternalLink,
  Download,
  Smartphone,
  Tablet,
  FileOutput,
  Eye,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type VaultCategory = 'all' | 'workflow' | 'brand' | 'template' | 'credentials' | 'deed' | 'drop' | 'puzzle'

interface VaultFile {
  id: string
  name: string
  type: VaultCategory
  description?: string
  created_at: string
  source?: string
  file_data: Record<string, unknown>
}

interface VaultFilesPanelProps {
  onSwitchToCredentials: () => void
  onAddToBuilder?: (data: Record<string, unknown>) => void
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_CONFIG: Record<
  VaultCategory,
  {
    label: string
    icon: typeof Workflow
    color: string
    emptyTitle: string
    emptyDesc: string
  }
> = {
  all: {
    label: 'All Files',
    icon: FolderOpen,
    color: '#7ed957',
    emptyTitle: 'No vault files yet',
    emptyDesc: 'Purchase SWITCH files from the store or create them in the builder to see them here.',
  },
  workflow: {
    label: 'SWITCH / RUNs',
    icon: Workflow,
    color: '#7ed957',
    emptyTitle: 'No SWITCH files',
    emptyDesc: 'SWITCH files are executable .0n workflow definitions. Create one in the builder or purchase from the store.',
  },
  brand: {
    label: 'Brand',
    icon: Palette,
    color: '#a78bfa',
    emptyTitle: 'No brand files',
    emptyDesc: 'Brand identity files contain logos, colors, fonts, and voice guidelines for your business.',
  },
  template: {
    label: 'Templates',
    icon: FileText,
    color: '#00d4ff',
    emptyTitle: 'No templates',
    emptyDesc: 'Templates are reusable .0n configurations you can customize and deploy across projects.',
  },
  credentials: {
    label: 'Credentials',
    icon: Lock,
    color: '#ff6b35',
    emptyTitle: 'Manage API keys',
    emptyDesc: 'Switch to the credential vault to manage your service API keys and connections.',
  },
  deed: {
    label: 'Deeds',
    icon: ScrollText,
    color: '#f59e0b',
    emptyTitle: 'No deed files',
    emptyDesc: 'Digital deed transfers package entire business assets into a single encrypted .0nv container.',
  },
  drop: {
    label: 'Drops',
    icon: Gift,
    color: '#ec4899',
    emptyTitle: 'No drops',
    emptyDesc: 'Puzzle drops are gift files sent to you by other users. Check back later.',
  },
  puzzle: {
    label: 'Puzzles',
    icon: Puzzle,
    color: '#6366f1',
    emptyTitle: 'No puzzle files',
    emptyDesc: 'Puzzle files are challenge-based .0n files that unlock content when solved.',
  },
}

const CATEGORIES: VaultCategory[] = ['all', 'workflow', 'brand', 'template', 'credentials', 'deed', 'drop', 'puzzle']

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function truncate(str: string, max: number): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '...' : str
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(30, 30, 42, 0.95)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.25rem',
        color: 'var(--text-primary)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        zIndex: 9999,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'vfp-toast-in 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      {message}
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Action Menu                                                        */
/* ------------------------------------------------------------------ */

function ActionMenu({
  file,
  onClose,
  onOpenInBuilder,
  onDownload,
  onToast,
  onViewDetails,
}: {
  file: VaultFile
  onClose: () => void
  onOpenInBuilder?: (data: Record<string, unknown>) => void
  onDownload: (file: VaultFile) => void
  onToast: (msg: string) => void
  onViewDetails: (file: VaultFile) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const isBuilderType = file.type === 'workflow' || file.type === 'template'
  const isDeedType = file.type === 'deed'

  const actions = [
    ...(isBuilderType && onOpenInBuilder
      ? [{ label: 'Open in Builder', icon: ExternalLink, onClick: () => { onOpenInBuilder(file.file_data); onClose() } }]
      : []),
    { label: 'Download .0n', icon: Download, onClick: () => { onDownload(file); onClose() } },
    { label: 'Send to Mobile Vault', icon: Smartphone, onClick: () => { onToast('Coming soon: Mobile vault sync'); onClose() } },
    { label: 'Send to iPad', icon: Tablet, onClick: () => { onToast('Coming soon: iPad vault sync'); onClose() } },
    ...(isDeedType
      ? [{ label: 'Send to Deed File', icon: FileOutput, onClick: () => { onToast('Coming soon: Deed file export'); onClose() } }]
      : []),
    { label: 'View Details', icon: Eye, onClick: () => { onViewDetails(file); onClose() } },
  ]

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.25rem',
        backgroundColor: 'rgba(20, 20, 30, 0.97)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '0.375rem',
        minWidth: '12rem',
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        animation: 'vfp-menu-in 0.15s ease-out',
      }}
    >
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              width: '100%',
              padding: '0.5rem 0.625rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            <Icon size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Detail Modal                                                       */
/* ------------------------------------------------------------------ */

function DetailOverlay({ file, onClose }: { file: VaultFile; onClose: () => void }) {
  const config = CATEGORY_CONFIG[file.type] || CATEGORY_CONFIG.all
  const Icon = config.icon

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'vfp-fade-in 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          maxWidth: '40rem',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '1.5rem',
          animation: 'vfp-scale-in 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: config.color + '18',
              }}
            >
              <Icon size={18} style={{ color: config.color }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {file.name}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatDate(file.created_at)}
                {file.source ? ` \u00b7 ${file.source}` : ''}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.375rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        {file.description && (
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {file.description}
          </p>
        )}

        {/* File data */}
        <div>
          <h4
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}
          >
            File Data
          </h4>
          <pre
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.75rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              overflow: 'auto',
              maxHeight: '20rem',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {JSON.stringify(file.file_data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Skeleton Cards                                                     */
/* ------------------------------------------------------------------ */

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '1.25rem',
        animation: 'vfp-stagger-in 0.4s ease both',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <div
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.625rem',
            backgroundColor: 'rgba(255,255,255,0.04)',
            animation: 'vfp-pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: '60%',
              height: '0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: 'rgba(255,255,255,0.06)',
              marginBottom: '0.375rem',
              animation: 'vfp-pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '40%',
              height: '0.5rem',
              borderRadius: '0.25rem',
              backgroundColor: 'rgba(255,255,255,0.04)',
              animation: 'vfp-pulse 1.5s ease-in-out infinite',
              animationDelay: '0.2s',
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '0.625rem',
          borderRadius: '0.25rem',
          backgroundColor: 'rgba(255,255,255,0.04)',
          marginBottom: '0.375rem',
          animation: 'vfp-pulse 1.5s ease-in-out infinite',
          animationDelay: '0.3s',
        }}
      />
      <div
        style={{
          width: '75%',
          height: '0.625rem',
          borderRadius: '0.25rem',
          backgroundColor: 'rgba(255,255,255,0.03)',
          animation: 'vfp-pulse 1.5s ease-in-out infinite',
          animationDelay: '0.4s',
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  File Card                                                          */
/* ------------------------------------------------------------------ */

function FileCard({
  file,
  index,
  onOpenInBuilder,
  onDownload,
  onToast,
  onViewDetails,
}: {
  file: VaultFile
  index: number
  onOpenInBuilder?: (data: Record<string, unknown>) => void
  onDownload: (file: VaultFile) => void
  onToast: (msg: string) => void
  onViewDetails: (file: VaultFile) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const config = CATEGORY_CONFIG[file.type] || CATEGORY_CONFIG.all
  const Icon = config.icon

  return (
    <div
      className="group"
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '1.25rem',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        animation: 'vfp-stagger-in 0.4s ease both',
        animationDelay: `${index * 50}ms`,
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = config.color + '40'
        e.currentTarget.style.boxShadow = `0 0 20px ${config.color}10`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '1rem',
          right: '1rem',
          height: '2px',
          borderRadius: '0 0 2px 2px',
          backgroundColor: config.color,
          opacity: 0.35,
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.625rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            backgroundColor: config.color + '18',
          }}
        >
          <Icon size={16} style={{ color: config.color }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            {/* Type badge */}
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                backgroundColor: config.color + '14',
                color: config.color,
                border: `1px solid ${config.color}25`,
              }}
            >
              {config.label}
            </span>
            {/* Source badge */}
            {file.source && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {file.source}
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s, background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <ActionMenu
              file={file}
              onClose={() => setMenuOpen(false)}
              onOpenInBuilder={onOpenInBuilder}
              onDownload={onDownload}
              onToast={onToast}
              onViewDetails={onViewDetails}
            />
          )}
        </div>
      </div>

      {/* Description preview */}
      {file.description && (
        <p
          style={{
            fontSize: '0.8125rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            margin: '0 0 0.75rem 0',
          }}
        >
          {truncate(file.description, 120)}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {formatDate(file.created_at)}
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            color: config.color,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
          className="group-hover:!opacity-100"
        >
          Actions <ChevronRight size={10} />
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function VaultFilesPanel({ onSwitchToCredentials, onAddToBuilder }: VaultFilesPanelProps) {
  const [files, setFiles] = useState<VaultFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<VaultCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [detailFile, setDetailFile] = useState<VaultFile | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  /* Fetch files */
  useEffect(() => {
    let cancelled = false
    async function fetchFiles() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/console/vault-files')
        if (!res.ok) throw new Error(`Failed to fetch vault files (${res.status})`)
        const data = await res.json()
        if (!cancelled) {
          setFiles(Array.isArray(data.files) ? data.files : Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load vault files')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchFiles()
    return () => { cancelled = true }
  }, [])

  /* Computed counts */
  const categoryCounts = CATEGORIES.reduce<Record<VaultCategory, number>>((acc, cat) => {
    if (cat === 'all') {
      acc[cat] = files.length
    } else if (cat === 'credentials') {
      acc[cat] = 0 // credentials handled by VaultOverlay
    } else {
      acc[cat] = files.filter((f) => f.type === cat).length
    }
    return acc
  }, {} as Record<VaultCategory, number>)

  /* Filtered files */
  const filteredFiles = files.filter((f) => {
    const matchesCategory = activeCategory === 'all' || f.type === activeCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  /* Handlers */
  const handleCategoryClick = useCallback(
    (cat: VaultCategory) => {
      if (cat === 'credentials') {
        onSwitchToCredentials()
        return
      }
      setActiveCategory(cat)
    },
    [onSwitchToCredentials],
  )

  const handleDownload = useCallback((file: VaultFile) => {
    const blob = new Blob([JSON.stringify(file.file_data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file.name.replace(/\s+/g, '-').toLowerCase()}.0n`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToast(`Downloaded ${file.name}`)
  }, [])

  const handleToast = useCallback((msg: string) => {
    setToast(msg)
  }, [])

  const handleViewDetails = useCallback((file: VaultFile) => {
    setDetailFile(file)
  }, [])

  /* Active category config */
  const activeCfg = CATEGORY_CONFIG[activeCategory]

  return (
    <div style={{ animation: 'vfp-fade-in 0.3s ease' }}>
      {/* Section Header */}
      <div style={{ padding: '1rem 1rem 0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Vault Files
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {files.length} file{files.length !== 1 ? 's' : ''} in your vault
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            style={{
              height: '2.25rem',
              paddingLeft: '2.25rem',
              paddingRight: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              outline: 'none',
              width: '12rem',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div
        ref={tabsRef}
        style={{
          display: 'flex',
          gap: '0.25rem',
          padding: '0.75rem 1rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {CATEGORIES.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat]
          const Icon = cfg.icon
          const isActive = activeCategory === cat
          const count = categoryCounts[cat]

          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'background-color 0.2s ease, color 0.2s ease',
                backgroundColor: isActive ? cfg.color + '18' : 'transparent',
                color: isActive ? cfg.color : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon size={14} />
              {cfg.label}
              {/* Count badge */}
              {cat !== 'credentials' && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '0.0625rem 0.375rem',
                    borderRadius: '999px',
                    minWidth: '1.25rem',
                    textAlign: 'center',
                    backgroundColor: isActive ? cfg.color + '25' : 'rgba(255,255,255,0.06)',
                    color: isActive ? cfg.color : 'var(--text-muted)',
                  }}
                >
                  {count}
                </span>
              )}
              {cat === 'credentials' && (
                <ChevronRight
                  size={12}
                  style={{
                    opacity: 0.5,
                    color: isActive ? cfg.color : 'var(--text-muted)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div style={{ padding: '0 1rem 1rem 1rem' }}>
        {/* Loading state */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
              gap: '0.75rem',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              animation: 'vfp-fade-in 0.3s ease',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                backgroundColor: 'rgba(239,68,68,0.1)',
              }}
            >
              <X size={20} style={{ color: '#ef4444' }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredFiles.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              animation: 'vfp-fade-in 0.3s ease',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                backgroundColor: activeCfg.color + '14',
              }}
            >
              <activeCfg.icon size={24} style={{ color: activeCfg.color }} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {searchQuery ? 'No matching files' : activeCfg.emptyTitle}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '24rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              {searchQuery ? `No files match "${searchQuery}" in this category.` : activeCfg.emptyDesc}
            </p>
          </div>
        )}

        {/* File grid */}
        {!loading && !error && filteredFiles.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
              gap: '0.75rem',
            }}
          >
            {filteredFiles.map((file, i) => (
              <FileCard
                key={file.id}
                file={file}
                index={i}
                onOpenInBuilder={onAddToBuilder}
                onDownload={handleDownload}
                onToast={handleToast}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'var(--border)',
          margin: '0 1rem',
        }}
      />

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Detail overlay */}
      {detailFile && <DetailOverlay file={detailFile} onClose={() => setDetailFile(null)} />}

      {/* Keyframes */}
      <style>{`
        @keyframes vfp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes vfp-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes vfp-menu-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vfp-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes vfp-scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes vfp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        /* Hide scrollbar on category tabs */
        div::-webkit-scrollbar {
          display: none;
        }
        /* Group hover for "Actions" hint */
        .group:hover .group-hover\\!opacity-100 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
