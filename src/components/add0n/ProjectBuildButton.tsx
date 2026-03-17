'use client'

// components/add0n/ProjectBuildButton.tsx
// One-click build trigger for use in project list rows and detail pages.
// Resolves client fields from web0n_projects via projectId — no form required.

import { useState } from 'react'

interface ProjectBuildButtonProps {
  projectId:   string         // web0n project UUID — server resolves all CRM fields
  contactId?:  string         // optional: skip contact upsert if already known
  locationId?: string         // optional: override default CRM location
  action?:     'build_website' | 'build_funnel' | 'build_workflow' | 'build_pipeline' | 'deploy_snapshot'
  size?:       'sm' | 'md'
  onSuccess?:  (conversationId: string) => void
  onError?:    (error: string) => void
}

type ButtonState = 'idle' | 'loading' | 'done' | 'error'

export default function ProjectBuildButton({
  projectId,
  contactId,
  locationId,
  action    = 'build_website',
  size      = 'md',
  onSuccess,
  onError,
}: ProjectBuildButtonProps) {
  const [state,  setState]  = useState<ButtonState>('idle')
  const [convId, setConvId] = useState<string | null>(null)

  const trigger = async () => {
    if (state === 'loading' || state === 'done') return
    setState('loading')

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? ''}/api/crm-agent/trigger`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WEB0N_INTERNAL_API_KEY ?? ''}`,
          },
          body: JSON.stringify({ projectId, contactId, locationId, action }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)

      setConvId(data.conversationId)
      setState('done')
      onSuccess?.(data.conversationId)
      setTimeout(() => setState('idle'), 5000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setState('error')
      onError?.(msg)
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const LABELS: Record<ButtonState, string> = {
    idle:    size === 'sm' ? 'Build' : 'Build website',
    loading: 'Triggering...',
    done:    'Triggered ✓',
    error:   'Failed — retry',
  }

  return (
    <>
      <button
        onClick={trigger}
        disabled={state === 'loading'}
        data-state={state}
        className={`project-build-btn size-${size}`}
        title={convId ? `Conversation: ${convId}` : `Trigger Add0n ${action} build`}
      >
        {state === 'loading' && <span className="spinner" aria-hidden="true" />}
        {LABELS[state]}
      </button>

      <style>{`
        .project-build-btn { align-items:center; background:rgba(110,224,90,.12); border:1px solid rgba(110,224,90,.35); border-radius:8px; color:#6EE05A; cursor:pointer; display:inline-flex; font-family:'Space Grotesk',sans-serif; font-weight:600; gap:8px; letter-spacing:.01em; transition:background .15s,border-color .15s,opacity .15s; white-space:nowrap; }
        .project-build-btn.size-md { font-size:14px; padding:8px 16px; }
        .project-build-btn.size-sm { font-size:12px; padding:5px 12px; border-radius:6px; }
        .project-build-btn:hover:not(:disabled) { background:rgba(110,224,90,.2); border-color:rgba(110,224,90,.6); }
        .project-build-btn:disabled { opacity:.6; cursor:not-allowed; }
        .project-build-btn[data-state="done"]  { background:rgba(110,224,90,.18); border-color:rgba(110,224,90,.5); }
        .project-build-btn[data-state="error"] { background:rgba(255,80,80,.1); border-color:rgba(255,80,80,.35); color:#ff6b6b; }
        .spinner { width:12px; height:12px; border:2px solid rgba(110,224,90,.25); border-top-color:#6EE05A; border-radius:50%; animation:spin .6s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </>
  )
}

// ─── Usage ────────────────────────────────────────────────────────────────────
//
// Project list row (minimal):
// <ProjectBuildButton projectId={project.id} size="sm" />
//
// Detail page (full context, skips upsert):
// <ProjectBuildButton
//   projectId={project.id}
//   contactId={project.crm_contact_id}
//   locationId={project.crm_location_id}
//   action="build_website"
//   onSuccess={(id) => toast(`Build queued · ${id}`)}
//   onError={(e)  => toast.error(e)}
// />
