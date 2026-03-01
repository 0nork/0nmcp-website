'use client'

import { useState, useRef, useCallback } from 'react'
import type { MigrationResult } from '@/lib/console/migrate'
import { PLATFORM_INFO, migrateWorkflow } from '@/lib/console/migrate'
import UnravelAnimation from './migrate/UnravelAnimation'
import PlatformDetector from './migrate/PlatformDetector'

type WorkflowPlatform = keyof typeof PLATFORM_INFO

interface MigrateViewProps {
  onAddToBuilder: (workflow: Record<string, unknown>) => void
  onAddToOperations: (
    workflow: Record<string, unknown>,
    name: string,
    trigger: Record<string, unknown>,
    services: string[]
  ) => void
}

type ViewState = 'idle' | 'processing' | 'complete' | 'error'

const SUPPORTED_EXTENSIONS = ['.json', '.yaml', '.yml', '.zip', '.txt', '.zap']

export default function MigrateView({ onAddToBuilder, onAddToOperations }: MigrateViewProps) {
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    setViewState('processing')
    setErrorMsg('')
    setFileName(file.name)

    try {
      const content = await file.text()
      const migrationResult = await migrateWorkflow(content, file.name)
      setResult(migrationResult)
      setViewState('complete')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Migration failed. Please try again.')
      setViewState('error')
    }
  }, [])

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleReset = useCallback(() => {
    setViewState('idle')
    setResult(null)
    setErrorMsg('')
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleDownload = useCallback(() => {
    if (!result?.workflow) return
    const blob = new Blob([JSON.stringify(result.workflow, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name =
      typeof result.workflow.name === 'string'
        ? result.workflow.name.replace(/\s+/g, '-').toLowerCase()
        : 'migrated-workflow'
    a.download = `${name}.0n.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  const handleRebuildInBuilder = useCallback(() => {
    if (!result?.workflow) return
    localStorage.setItem('0n_migrated_workflow', JSON.stringify(result.workflow))
    onAddToBuilder(result.workflow)
  }, [result, onAddToBuilder])

  const handleAddToOperations = useCallback(() => {
    if (!result?.workflow) return
    const wf = result.workflow as Record<string, unknown>
    const name = typeof wf.name === 'string' ? wf.name : 'Migrated Workflow'
    const trigger = typeof wf.trigger === 'object' && wf.trigger !== null ? (wf.trigger as Record<string, unknown>) : {}
    onAddToOperations(wf, name, trigger, result.servicesDetected)
  }, [result, onAddToOperations])

  const platforms = (Object.keys(PLATFORM_INFO) as WorkflowPlatform[]).filter(
    (p) => p !== 'unknown'
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary, #e8e8ef)',
            margin: 0,
          }}
        >
          Migrate Workflows
        </h2>
        <div
          style={{
            fontSize: 14,
            color: 'var(--accent, #7ed957)',
            fontWeight: 600,
            fontFamily: 'var(--font-mono, monospace)',
            marginTop: 4,
          }}
        >
          Unravel
        </div>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary, #8888a0)',
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          Import workflows from any platform and convert them to .0n format.
          Drop a file below or select your source platform.
        </p>
      </div>

      {/* Supported Platforms Grid */}
      {viewState === 'idle' && (
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted, #55556a)',
              marginBottom: 12,
            }}
          >
            Supported Platforms
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 10,
            }}
          >
            {platforms.map((key) => {
              const info = PLATFORM_INFO[key]
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-card, #1a1a25)',
                    border: '1px solid var(--border, #2a2a3a)',
                    cursor: 'default',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = info.color)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--border, #2a2a3a)')
                  }
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      background: info.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: key === 'ifttt' ? '#000' : '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {info.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary, #e8e8ef)',
                    }}
                  >
                    {info.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Drop Zone (idle) */}
      {viewState === 'idle' && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent, #7ed957)' : 'var(--border, #2a2a3a)'}`,
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver
              ? 'var(--accent-glow, rgba(126,217,87,0.05))'
              : 'var(--bg-card, #1a1a25)',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 12,
              opacity: 0.6,
            }}
          >
            {dragOver ? '\u2B07' : '\u2B06'}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary, #e8e8ef)',
              marginBottom: 6,
            }}
          >
            Drop your workflow file here or click to browse
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted, #55556a)',
            }}
          >
            Accepts {SUPPORTED_EXTENSIONS.join(', ')}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_EXTENSIONS.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Processing State */}
      {viewState === 'processing' && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--bg-card, #1a1a25)',
            borderRadius: 16,
            border: '1px solid var(--border, #2a2a3a)',
          }}
        >
          <UnravelAnimation />
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--accent, #7ed957)',
              marginTop: 24,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            Unraveling your workflow...
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-muted, #55556a)',
              marginTop: 8,
            }}
          >
            Analyzing {fileName}
          </div>
        </div>
      )}

      {/* Results State */}
      {viewState === 'complete' && result && (
        <div>
          <PlatformDetector result={result} />

          {/* Free Migration Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.08))',
              border: '1px solid var(--accent, #7ed957)30',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--accent, #7ed957)',
                background: 'var(--accent, #7ed957)18',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              Premium
            </span>
            <span
              style={{
                fontSize: 13,
                color: 'var(--text-secondary, #8888a0)',
              }}
            >
              Free Premium for 30 days on migrated workflows
            </span>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginTop: 20,
            }}
          >
            <button
              onClick={handleRebuildInBuilder}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: 'var(--accent, #7ed957)',
                color: '#000',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Rebuild in Builder
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: 'transparent',
                color: 'var(--accent-secondary, #00d4ff)',
                border: '1px solid var(--accent-secondary, #00d4ff)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              Download .0n
            </button>
            <button
              onClick={handleAddToOperations}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: 'transparent',
                color: 'var(--text-primary, #e8e8ef)',
                border: '1px solid var(--border, #2a2a3a)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'var(--text-secondary, #8888a0)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--border, #2a2a3a)')
              }
            >
              Add to Operations
            </button>
          </div>

          {/* Start Over */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #55556a)',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 4,
              }}
            >
              Migrate another workflow
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {viewState === 'error' && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 24px',
            background: 'var(--bg-card, #1a1a25)',
            borderRadius: 16,
            border: '1px solid #ff444440',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#ff444418',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 22,
            }}
          >
            !
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#ff4444',
              marginBottom: 8,
            }}
          >
            Migration Failed
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary, #8888a0)',
              marginBottom: 20,
              maxWidth: 400,
              margin: '0 auto 20px',
              lineHeight: 1.5,
            }}
          >
            {errorMsg}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: 'var(--accent, #7ed957)',
                color: '#000',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: 'transparent',
                color: 'var(--text-secondary, #8888a0)',
                border: '1px solid var(--border, #2a2a3a)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Choose Different File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
