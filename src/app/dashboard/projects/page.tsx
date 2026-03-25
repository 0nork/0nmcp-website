'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Company { id: string; name: string; description?: string; industry?: string; color: string; website?: string; crm_location_id?: string; created_at: string }
interface Project { id: string; company_id: string; name: string; description?: string; status: string; color: string; due_date?: string; task_count: number; done_count: number; created_at: string }
interface Task { id: string; project_id: string; title: string; description?: string; status: string; priority: string; due_date?: string; assigned_to?: string; tags: string[]; created_at: string }
interface Stats { total_companies: number; total_projects: number; total_tasks: number; todo: number; in_progress: number; done: number; urgent: number }

type View = 'overview' | 'company' | 'project'

export default function ProjectsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats>({ total_companies: 0, total_projects: 0, total_tasks: 0, todo: 0, in_progress: 0, done: 0, urgent: 0 })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('overview')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showModal, setShowModal] = useState<'company' | 'project' | 'task' | null>(null)

  const load = useCallback(async (companyId?: string) => {
    const url = companyId ? `/api/projects?company_id=${companyId}` : '/api/projects'
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json()
    setCompanies(data.companies || [])
    setProjects(data.projects || [])
    setStats(data.stats || {})
  }, [])

  const loadTasks = useCallback(async (projectId: string) => {
    const res = await fetch(`/api/projects/tasks?project_id=${projectId}`)
    if (!res.ok) return
    const data = await res.json()
    setTasks(data.tasks || [])
  }, [])

  useEffect(() => { load().finally(() => setLoading(false)) }, [load])

  async function createItem(type: string, data: Record<string, unknown>) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    })
    if (res.ok) {
      setShowModal(null)
      if (type === 'task' && selectedProject) loadTasks(selectedProject.id)
      else load()
    }
  }

  async function updateItem(type: string, id: string, updates: Record<string, unknown>) {
    await fetch('/api/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, ...updates }),
    })
    if (type === 'task' && selectedProject) loadTasks(selectedProject.id)
    else load()
  }

  async function deleteItem(type: string, id: string) {
    if (!confirm(`Delete this ${type}?`)) return
    await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    })
    if (type === 'task' && selectedProject) loadTasks(selectedProject.id)
    else if (type === 'project') { setView('company'); load() }
    else { setView('overview'); load() }
  }

  function openCompany(c: Company) {
    setSelectedCompany(c)
    setView('company')
    load(c.id)
  }

  function openProject(p: Project) {
    setSelectedProject(p)
    setView('project')
    loadTasks(p.id)
  }

  if (loading) return (
    <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const statusColors: Record<string, string> = { todo: '#6b7280', in_progress: '#3b82f6', review: '#f59e0b', done: '#22c55e', active: '#22c55e', paused: '#f59e0b', completed: '#6b7280', archived: '#374151' }
  const priorityColors: Record<string, string> = { low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' }

  return (
    <div className="dashboard-r0n">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/</span>
        <span style={{ color: view === 'overview' ? 'var(--accent)' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }} onClick={() => { setView('overview'); load() }}>Projects</span>
        {view !== 'overview' && selectedCompany && (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/</span>
            <span style={{ color: view === 'company' ? 'var(--accent)' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }} onClick={() => { setView('company'); load(selectedCompany.id) }}>{selectedCompany.name}</span>
          </>
        )}
        {view === 'project' && selectedProject && (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/</span>
            <span style={{ color: 'var(--accent)', fontSize: 13 }}>{selectedProject.name}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="dashboard-r0n-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dashboard-r0n-title">
            {view === 'overview' ? 'Projects' : view === 'company' ? selectedCompany?.name : selectedProject?.name}
          </h1>
          <p className="dashboard-r0n-subtitle">
            {view === 'overview' ? 'Manage your companies, projects, and tasks.' : view === 'company' ? (selectedCompany?.description || selectedCompany?.industry || 'Company projects') : (selectedProject?.description || 'Project tasks')}
          </p>
        </div>
        <button
          onClick={() => setShowModal(view === 'overview' ? 'company' : view === 'company' ? 'project' : 'task')}
          style={{ padding: '10px 20px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          + {view === 'overview' ? 'New Company' : view === 'company' ? 'New Project' : 'New Task'}
        </button>
      </div>

      {/* Stats */}
      {view === 'overview' && (
        <div className="dashboard-r0n-stats" style={{ marginBottom: 24 }}>
          {[
            { label: 'Companies', value: stats.total_companies, color: '#7ed957' },
            { label: 'Projects', value: stats.total_projects, color: '#60a5fa' },
            { label: 'Tasks', value: stats.total_tasks, color: '#a78bfa' },
            { label: 'Urgent', value: stats.urgent, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="module-card stat-card">
              <div className="stat-card-header"><span className="stat-card-label">{s.label}</span></div>
              <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar for project view */}
      {view === 'project' && selectedProject && selectedProject.task_count > 0 && (
        <div style={{ marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Progress</span>
            <span>{selectedProject.done_count}/{selectedProject.task_count} tasks done</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(selectedProject.done_count / selectedProject.task_count) * 100}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* OVERVIEW: Company cards */}
        {view === 'overview' && companies.map(c => (
          <div key={c.id} onClick={() => openCompany(c)} className="module-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color || '#7ed957', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#000', flexShrink: 0 }}>
              {c.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.industry || c.description || 'No description'}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
              {projects.filter(p => p.company_id === c.id).length} projects
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        ))}
        {view === 'overview' && companies.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
            No companies yet. Click "+ New Company" to get started.
          </div>
        )}

        {/* COMPANY: Project cards */}
        {view === 'company' && projects.filter(p => p.company_id === selectedCompany?.id).map(p => (
          <div key={p.id} onClick={() => openProject(p)} className="module-card" style={{ cursor: 'pointer', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[p.status] || '#6b7280' }} />
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', flex: 1 }}>{p.name}</div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${statusColors[p.status]}20`, color: statusColors[p.status], fontWeight: 600, textTransform: 'uppercase' as const }}>{p.status}</span>
            </div>
            {p.description && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, marginLeft: 20 }}>{p.description}</div>}
            <div style={{ display: 'flex', gap: 16, marginLeft: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{p.task_count} tasks</span>
              <span>{p.done_count} done</span>
              {p.due_date && <span>Due {new Date(p.due_date).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}

        {/* PROJECT: Task list */}
        {view === 'project' && (
          <>
            {['todo', 'in_progress', 'review', 'done'].map(status => {
              const filtered = tasks.filter(t => t.status === status)
              if (filtered.length === 0) return null
              return (
                <div key={status} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: statusColors[status], marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status] }} />
                    {status.replace('_', ' ')} ({filtered.length})
                  </div>
                  {filtered.map(t => (
                    <div key={t.id} className="module-card" style={{ padding: '12px 16px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        onClick={() => updateItem('task', t.id, { status: t.status === 'done' ? 'todo' : t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'review' : 'done' })}
                        style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${statusColors[t.status]}`, background: t.status === 'done' ? statusColors.done : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}
                      >
                        {t.status === 'done' && '✓'}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 14, color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</div>
                        {t.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.description}</div>}
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: `${priorityColors[t.priority]}20`, color: priorityColors[t.priority], fontWeight: 700, textTransform: 'uppercase' as const }}>{t.priority}</span>
                      {t.due_date && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(t.due_date).toLocaleDateString()}</span>}
                      <button onClick={() => deleteItem('task', t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: 4 }}>×</button>
                    </div>
                  ))}
                </div>
              )
            })}
            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
                No tasks yet. Click "+ New Task" to add one.
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={() => setShowModal(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 440, padding: 24 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              New {showModal === 'company' ? 'Company' : showModal === 'project' ? 'Project' : 'Task'}
            </h3>
            <CreateForm
              type={showModal}
              companyId={selectedCompany?.id}
              projectId={selectedProject?.id}
              onSubmit={(data) => createItem(showModal, data)}
              onCancel={() => setShowModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CreateForm({ type, companyId, projectId, onSubmit, onCancel }: {
  type: 'company' | 'project' | 'task'
  companyId?: string
  projectId?: string
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const set = (k: string, v: string) => setForm({ ...form, [k]: v })

  const inputStyle = { width: '100%', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }
  const labelStyle = { display: 'block' as const, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.03em' }

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, company_id: companyId, project_id: projectId }) }}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
        <div>
          <label style={labelStyle}>{type === 'task' ? 'Task Title' : 'Name'} *</label>
          <input style={inputStyle} required placeholder={type === 'company' ? 'e.g. The Spa In Ligonier' : type === 'project' ? 'e.g. Facials Campaign' : 'e.g. Set up Facebook Ads'} onChange={e => set(type === 'task' ? 'title' : 'name', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as const }} placeholder="Optional description..." onChange={e => set('description', e.target.value)} />
        </div>
        {type === 'company' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Industry</label>
              <input style={inputStyle} placeholder="e.g. Day Spa" onChange={e => set('industry', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Website</label>
              <input style={inputStyle} placeholder="https://..." onChange={e => set('website', e.target.value)} />
            </div>
          </div>
        )}
        {type === 'project' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" style={inputStyle} onChange={e => set('due_date', e.target.value)} />
            </div>
          </div>
        )}
        {type === 'task' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={inputStyle} onChange={e => set('priority', e.target.value)}>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" style={inputStyle} onChange={e => set('due_date', e.target.value)} />
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Create</button>
      </div>
    </form>
  )
}
