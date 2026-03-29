'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  figma_file_name: string | null
  generation_type: string
  status: string
  created_at: string
}

interface FigmaStatus {
  connected: boolean
  handle?: string
  email?: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#7A8290',
  extracting: '#FBBF24',
  extracted: '#60A5FA',
  generating: '#FBBF24',
  completed: '#6EE05A',
  error: '#F87171',
}

export default function OnPressPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [figmaStatus, setFigmaStatus] = useState<FigmaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const figmaParam = searchParams.get('figma')

  useEffect(() => {
    Promise.all([
      fetch('/api/onpress/projects').then(r => r.json()),
      fetch('/api/figma/status').then(r => r.json()),
    ]).then(([projectsData, statusData]) => {
      setProjects(projectsData.projects || [])
      setFigmaStatus(statusData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDisconnect = async () => {
    await fetch('/api/figma/disconnect', { method: 'POST' })
    setFigmaStatus({ connected: false })
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 28px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ width: 36, height: 36, border: '2px solid var(--jp-border)', borderTopColor: 'var(--jp-green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '80px auto' }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 28px 96px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e8eaed', letterSpacing: '-0.02em', margin: 0 }}>
            OnPress
          </h1>
          <p style={{ fontSize: 14, color: '#7a8290', marginTop: 4 }}>
            Convert Figma designs into WordPress themes & plugins
          </p>
        </div>
        <button
          onClick={() => router.push('/console/onpress/new')}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: '#6EE05A', color: '#0B0F19',
            border: 'none', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + New Project
        </button>
      </div>

      {/* Figma connection banner */}
      {figmaParam === 'connected' && (
        <div style={{ background: 'rgba(110,224,90,0.1)', border: '1px solid rgba(110,224,90,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#6EE05A' }}>
          Figma connected successfully!
        </div>
      )}
      {figmaParam === 'denied' && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#F87171' }}>
          Figma authorization was denied. Please try again.
        </div>
      )}

      {/* Figma Status Card */}
      <div style={{
        background: 'var(--jp-surface)', border: '1px solid var(--jp-border)',
        borderRadius: 12, padding: 20, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7A8290', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              Figma Connection
            </span>
            {figmaStatus?.connected ? (
              <div style={{ marginTop: 6 }}>
                <span style={{ color: '#6EE05A', fontSize: 14 }}>Connected</span>
                <span style={{ color: '#7A8290', fontSize: 13, marginLeft: 12 }}>
                  {figmaStatus.handle || figmaStatus.email}
                </span>
              </div>
            ) : (
              <div style={{ marginTop: 6, color: '#7A8290', fontSize: 14 }}>
                Not connected
              </div>
            )}
          </div>
          {figmaStatus?.connected ? (
            <button
              onClick={handleDisconnect}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                color: '#F87171', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Disconnect
            </button>
          ) : (
            <a
              href="/api/figma/oauth"
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(110,224,90,0.1)', border: '1px solid rgba(110,224,90,0.3)',
                color: '#6EE05A', fontSize: 13, cursor: 'pointer', textDecoration: 'none',
                fontFamily: 'inherit', fontWeight: 600,
              }}
            >
              Connect Figma
            </a>
          )}
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div style={{
          background: 'var(--jp-surface)', border: '1px solid var(--jp-border)',
          borderRadius: 12, padding: '48px 20px', textAlign: 'center' as const,
        }}>
          <p style={{ color: '#7A8290', fontSize: 14, marginBottom: 16 }}>
            No projects yet. Create your first OnPress project to get started.
          </p>
          <button
            onClick={() => router.push('/console/onpress/new')}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'rgba(110,224,90,0.1)', border: '1px solid rgba(110,224,90,0.3)',
              color: '#6EE05A', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => router.push(`/console/onpress/${project.id}`)}
              style={{
                background: 'var(--jp-surface)', border: '1px solid var(--jp-border)',
                borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--jp-border-hi)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--jp-border)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e8eaed', margin: 0 }}>
                    {project.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#7A8290', margin: '4px 0 0' }}>
                    {project.figma_file_name || project.name} &middot; {project.generation_type}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: STATUS_COLORS[project.status] || '#7A8290',
                    textTransform: 'capitalize' as const,
                  }}>
                    {project.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#4A5568' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
