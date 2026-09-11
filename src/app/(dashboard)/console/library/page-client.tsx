'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Play, Clock, Zap, ChevronDown, ChevronRight } from 'lucide-react'

interface SavedWorkflow {
  id: string
  name: string
  description: string
  tags: string[] | null
  use_count: number
  last_used_at: string | null
  crm_workflow_id: string | null
  created_at: string
}

export default function LibraryPage() {
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [running, setRunning] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    // For now use a default sub_location_id — will be dynamic per user
    fetch('/api/workflows/library?sub_location_id=6MSqx0trfxgLxeHBJE1k')
      .then(r => r.json())
      .then(data => { setWorkflows(data.workflows || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleRun(workflow: SavedWorkflow) {
    if (!workflow.crm_workflow_id) return
    setRunning(workflow.id)
    try {
      await fetch('/api/workflows/generate-and-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: workflow.name,
          sub_location_id: '6MSqx0trfxgLxeHBJE1k',
          context: 'library_rerun',
        }),
      })
      // Refresh
      const res = await fetch('/api/workflows/library?sub_location_id=6MSqx0trfxgLxeHBJE1k')
      const data = await res.json()
      setWorkflows(data.workflows || [])
    } catch { /* ignore */ }
    setRunning(null)
  }

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    (w.description || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#487fff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] mb-1">Workflow Library</h1>
          <p className="text-sm text-[#b4b4b4]">{workflows.length} saved workflows</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b4b4b4]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-[#273142] border-white/10 text-[#fafafa] placeholder:text-[#b4b4b4]" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-[#273142] border-white/10">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-[#1a1a1a] flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#487fff]" />
            </div>
            <h3 className="text-lg font-bold text-[#fafafa] mb-2">No Saved Workflows</h3>
            <p className="text-sm text-[#b4b4b4] max-w-md mx-auto">
              Workflows you create from chat or the builder will appear here. Try asking Jaxx to create one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(wf => (
            <Card key={wf.id} className="bg-[#273142] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F97316]/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#fafafa] truncate">{wf.name}</span>
                      {wf.crm_workflow_id && <Badge className="bg-[#22D3A5]/15 text-[#22D3A5] border-0 text-[9px]">CRM Linked</Badge>}
                    </div>
                    {wf.description && (
                      <p className="text-xs text-[#b4b4b4] mt-0.5 truncate">{wf.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[#b4b4b4] font-mono">
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {wf.use_count} runs</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {wf.last_used_at ? new Date(wf.last_used_at).toLocaleDateString() : 'Never run'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={running === wf.id || !wf.crm_workflow_id}
                      onClick={() => handleRun(wf)}
                      className="bg-[#487fff] text-white hover:bg-[#487fff]/80 gap-1"
                    >
                      {running === wf.id ? 'Running...' : <><Play className="w-3 h-3" /> Run</>}
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="text-[#b4b4b4] hover:text-[#fafafa]"
                      onClick={() => setExpanded(expanded === wf.id ? null : wf.id)}
                    >
                      {expanded === wf.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {expanded === wf.id && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-[#b4b4b4] space-y-1">
                    <p><span className="text-[#fafafa] font-medium">ID:</span> {wf.id}</p>
                    {wf.crm_workflow_id && <p><span className="text-[#fafafa] font-medium">CRM ID:</span> {wf.crm_workflow_id}</p>}
                    <p><span className="text-[#fafafa] font-medium">Created:</span> {new Date(wf.created_at).toLocaleString()}</p>
                    {wf.tags?.length ? <p><span className="text-[#fafafa] font-medium">Tags:</span> {wf.tags.join(', ')}</p> : null}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
