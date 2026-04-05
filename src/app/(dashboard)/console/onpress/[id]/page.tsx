'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Generation {
  id: string
  version: number
  status: string
  zip_path: string | null
  file_manifest: string[]
  created_at: string
}

interface Project {
  id: string
  name: string
  figma_file_key: string
  figma_file_name: string | null
  generation_type: string
  status: string
  config: Record<string, unknown>
  design_system: Record<string, unknown> | null
  created_at: string
  updated_at: string
  onpress_generations: Generation[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#7A8290', extracting: '#FBBF24', extracted: '#60A5FA',
  generating: '#FBBF24', completed: '#6EE05A', error: '#F87171',
  pending: '#7A8290', running: '#FBBF24',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  const projectId = params.id as string

  const fetchProject = async () => {
    const res = await fetch(`/api/onpress/projects/${projectId}`)
    if (!res.ok) { router.push('/console/onpress'); return }
    const data = await res.json()
    setProject(data.project)
    setLoading(false)
  }

  useEffect(() => { fetchProject() }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExtract = async () => {
    setActionLoading('extract')
    setError('')
    try {
      const res = await fetch('/api/onpress/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchProject()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleGenerate = async () => {
    setActionLoading('generate')
    setError('')
    try {
      const res = await fetch('/api/onpress/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.download_url) setDownloadUrl(data.download_url)
      await fetchProject()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownload = async (genId: string) => {
    try {
      const res = await fetch(`/api/onpress/download/${genId}`)
      const data = await res.json()
      if (data.download_url) {
        window.open(data.download_url, '_blank')
      }
    } catch {
      setError('Failed to get download URL')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/onpress/projects/${projectId}`, { method: 'DELETE' })
    router.push('/console/onpress')
  }

  if (loading || !project) {
    return (
      <div style={{ padding: '32px 28px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ width: 36, height: 36, border: '2px solid var(--jp-border)', borderTopColor: 'var(--jp-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '80px auto' }} />
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ds = project.design_system as any

  return (
    <div style={{ padding: '32px 28px 96px', maxWidth: 800, margin: '0 auto' }}>
      <button
        onClick={() => router.push('/console/onpress')}
        style={{ background: 'none', border: 'none', color: '#7A8290', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 24, fontFamily: 'inherit' }}
      >
        &larr; Back to OnPress
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{project.name}</h1>
          <p style={{ fontSize: 13, color: '#7A8290', marginTop: 4 }}>
            {project.generation_type} &middot; {project.figma_file_key}
          </p>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
          color: STATUS_COLORS[project.status], textTransform: 'capitalize' as const,
          background: `${STATUS_COLORS[project.status]}15`,
        }}>
          {project.status}
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#F87171' }}>
          {error}
        </div>
      )}

      {downloadUrl && (
        <div style={{ background: 'rgba(110,224,90,0.1)', border: '1px solid rgba(110,224,90,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#6EE05A' }}>
          Generation complete!{' '}
          <a href={downloadUrl} target="_blank" rel="noopener" style={{ color: '#6EE05A', fontWeight: 600 }}>
            Download ZIP
          </a>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={handleExtract}
          disabled={actionLoading !== null}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: actionLoading === 'extract' ? '#4A5568' : 'rgba(96,165,250,0.1)',
            border: '1px solid rgba(96,165,250,0.3)',
            color: '#60A5FA', fontWeight: 600, fontSize: 13,
            cursor: actionLoading ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {actionLoading === 'extract' ? 'Extracting...' : 'Extract Design'}
        </button>

        <button
          onClick={handleGenerate}
          disabled={actionLoading !== null || !project.design_system}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: actionLoading === 'generate' ? '#4A5568' : project.design_system ? '#6EE05A' : '#2D3748',
            border: 'none',
            color: project.design_system ? '#0B0F19' : '#4A5568',
            fontWeight: 700, fontSize: 13,
            cursor: (actionLoading || !project.design_system) ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {actionLoading === 'generate' ? 'Generating...' : `Generate ${project.generation_type}`}
        </button>

        <button
          onClick={handleDelete}
          style={{
            padding: '10px 16px', borderRadius: 10, marginLeft: 'auto',
            background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)',
            color: '#F87171', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Delete
        </button>
      </div>

      {/* Design System Preview */}
      {ds && (
        <div style={{ background: 'var(--jp-surface)', border: '1px solid var(--jp-border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Design System</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
            {[
              { label: 'Colors', count: ds.colors?.length || 0 },
              { label: 'Typography', count: ds.typography?.length || 0 },
              { label: 'Components', count: ds.components?.length || 0 },
              { label: 'Pages', count: ds.pages?.length || 0 },
              { label: 'Spacing', count: ds.spacing?.length || 0 },
              { label: 'Radii', count: ds.radii?.length || 0 },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.count}</div>
                <div style={{ fontSize: 11, color: '#7A8290', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Color Swatches */}
          {ds.colors?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 12, color: '#7A8290', marginBottom: 8 }}>Colors</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {ds.colors.slice(0, 20).map((c: any, i: number) => (
                  <div
                    key={i}
                    title={`${c.name}: ${c.value?.hex}`}
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: c.value?.hex || '#000',
                      border: '1px solid var(--border)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generations */}
      {project.onpress_generations?.length > 0 && (
        <div style={{ background: 'var(--jp-surface)', border: '1px solid var(--jp-border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Builds</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {project.onpress_generations.map(gen => (
              <div key={gen.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8,
              }}>
                <div>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>v{gen.version}</span>
                  <span style={{ fontSize: 12, color: STATUS_COLORS[gen.status], marginLeft: 12, textTransform: 'capitalize' as const }}>
                    {gen.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#4A5568', marginLeft: 12 }}>
                    {gen.file_manifest?.length || 0} files
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#4A5568' }}>
                    {new Date(gen.created_at).toLocaleString()}
                  </span>
                  {gen.status === 'completed' && gen.zip_path && (
                    <button
                      onClick={() => handleDownload(gen.id)}
                      style={{
                        padding: '5px 12px', borderRadius: 6,
                        background: 'rgba(110,224,90,0.1)', border: '1px solid rgba(110,224,90,0.3)',
                        color: '#6EE05A', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
