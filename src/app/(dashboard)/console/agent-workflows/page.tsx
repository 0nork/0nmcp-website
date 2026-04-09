'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Search, AlertCircle, Play, Clock, ChevronRight, X, Layers } from 'lucide-react'

interface WorkflowStep { step: number; service: string; action: string; description: string }
interface Workflow {
  id: string; name: string; slug: string; description: string; status: string
  trigger_event: string; trigger_conditions: Record<string, unknown>
  steps: WorkflowStep[]; services: string[]; total_executions: number
  executions_today: number; last_executed_at: string | null; created_at: string
}

const SERVICE_COLORS: Record<string, string> = {
  crm: '#487fff', supabase: '#3ECF8E', stripe: '#635BFF', slack: '#E0B3E6',
  telegram: '#26A5E4', anthropic: '#D4A574', openai: '#10a37f',
}

const LOCATIONS = [
  { id: 'F76MNKOMQCMruMrumtdf', name: 'Spa Ligonier' },
  { id: 'nphConTwfHcVE1oA0uep', name: '0ncore' },
]

export default function AgentWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Workflow | null>(null)
  const [webhookStatus, setWebhookStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/console/agent-workflows')
      .then(r => r.json())
      .then(data => { setWorkflows(data.workflows || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const registerWebhook = async (locationId: string) => {
    setWebhookStatus(prev => ({ ...prev, [locationId]: 'registering' }))
    try {
      const res = await fetch('/api/console/agent-workflows/register-webhook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      })
      const data = await res.json()
      setWebhookStatus(prev => ({ ...prev, [locationId]: data.success ? (data.alreadyExisted ? 'already' : 'connected') : `error:${data.error}` }))
    } catch (err) {
      setWebhookStatus(prev => ({ ...prev, [locationId]: `error:${(err as Error).message}` }))
    }
  }

  const spaCount = workflows.filter(w => w.slug.startsWith('0nspa')).length
  const filtered = workflows.filter(w => {
    if (filter === 'spa' && !w.slug.startsWith('0nspa')) return false
    if (filter === 'platform' && w.slug.startsWith('0nspa')) return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="animate-in slide-in-from-top-2 duration-500">
        <h1 className="text-xl font-bold text-[#fafafa] mb-1">AI Agent Workflows</h1>
        <p className="text-sm text-[#b4b4b4]">
          {workflows.length} workflows — {workflows.filter(w => w.status === 'active').length} active — {spaCount} Spa Ligonier
        </p>
      </div>

      {/* Webhook Banner */}
      <div className="rounded-lg border border-amber-500/30 border-l-4 border-l-amber-500 bg-amber-500/10 p-4 animate-in slide-in-from-top-3 duration-500 delay-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-amber-300">CRM Webhooks Not Connected</span>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px]">ACTION REQUIRED</Badge>
              </div>
              <p className="text-xs text-[#fafafa]/70 m-0">Your workflows won&apos;t fire until each CRM location is registered.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {LOCATIONS.map(loc => {
              const s = webhookStatus[loc.id]
              const ok = s === 'connected' || s === 'already'
              return (
                <Button key={loc.id} size="sm" onClick={() => registerWebhook(loc.id)} disabled={s === 'registering'}
                  className={ok ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : loc.name === 'Spa Ligonier' ? 'bg-primary text-white hover:opacity-90' : 'bg-transparent text-[#fafafa] border border-white/10 hover:border-white/30'}>
                  {s === 'registering' ? '...' : ok ? '✓ Connected' : s?.startsWith('error') ? 'Retry' : `Connect ${loc.name}`}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-500 delay-150">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-[#273142] border border-white/10 h-9">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">All ({workflows.length})</TabsTrigger>
            <TabsTrigger value="spa" className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">Spa ({spaCount})</TabsTrigger>
            <TabsTrigger value="platform" className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Platform ({workflows.length - spaCount})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b4b4b4]" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 h-8 w-44 bg-[#273142] border-white/10 text-[#fafafa] text-xs" />
        </div>
      </div>

      {/* Horizontal Cards */}
      <div className="space-y-2">
        {filtered.map((w, i) => {
          const isSpa = w.slug.startsWith('0nspa')
          return (
            <Card
              key={w.id}
              className="bg-[#273142] border-white/10 hover:border-primary/30 cursor-pointer transition-all duration-200 hover:translate-x-1 group"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => setSelected(w)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* Status + Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${w.status === 'active' ? 'bg-emerald-400' : 'bg-[#b4b4b4]'}`} />
                    <span className="text-sm font-semibold text-[#fafafa] truncate">{w.name}</span>
                    {isSpa && <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[9px] shrink-0">SPA</Badge>}
                  </div>
                  <p className="text-xs text-[#b4b4b4] truncate">{w.description?.slice(0, 80)}</p>
                </div>

                {/* Services */}
                <div className="hidden md:flex gap-1 shrink-0">
                  {w.services?.slice(0, 3).map(s => (
                    <Badge key={s} className="border-0 text-[9px] font-bold font-mono uppercase" style={{ background: `${SERVICE_COLORS[s] || '#b4b4b4'}15`, color: SERVICE_COLORS[s] || '#b4b4b4' }}>
                      {s}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="hidden lg:flex items-center gap-4 shrink-0 text-[10px] text-[#b4b4b4] font-mono">
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {w.steps?.length || 0}</span>
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {w.total_executions}</span>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-[#b4b4b4] shrink-0 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-[#b4b4b4] text-sm">No workflows match your filter</p>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative bg-[#273142] border-white/10 max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#fafafa]">{selected.name}</h2>
                      <Badge className={`border-0 text-[9px] ${selected.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {selected.status}
                      </Badge>
                      {selected.slug.startsWith('0nspa') && <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[9px]">SPA LIGONIER</Badge>}
                    </div>
                    <p className="text-xs text-[#b4b4b4] mt-0.5">{selected.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="text-[#b4b4b4] hover:text-[#fafafa] shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-[#1a1a1a] p-3">
                  <p className="text-[10px] text-[#b4b4b4] mb-0.5">Trigger</p>
                  <p className="text-xs font-mono text-[#fafafa]">{selected.trigger_event}</p>
                </div>
                <div className="rounded-lg bg-[#1a1a1a] p-3">
                  <p className="text-[10px] text-[#b4b4b4] mb-0.5">Executions</p>
                  <p className="text-xs font-mono text-[#fafafa]">{selected.total_executions}</p>
                </div>
                <div className="rounded-lg bg-[#1a1a1a] p-3">
                  <p className="text-[10px] text-[#b4b4b4] mb-0.5">Last Run</p>
                  <p className="text-xs font-mono text-[#fafafa]">{selected.last_executed_at ? new Date(selected.last_executed_at).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b4b4b4] mb-2">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.services?.map(s => (
                    <Badge key={s} className="border-0 text-[10px] font-bold font-mono uppercase" style={{ background: `${SERVICE_COLORS[s] || '#b4b4b4'}15`, color: SERVICE_COLORS[s] || '#b4b4b4' }}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Steps */}
              {selected.steps?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#b4b4b4] mb-3">
                    {selected.steps.length} Steps
                  </p>
                  <div className="space-y-2">
                    {selected.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#1a1a1a] animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 60}ms` }}>
                        <span className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold font-mono shrink-0" style={{ background: `${SERVICE_COLORS[step.service] || '#b4b4b4'}15`, color: SERVICE_COLORS[step.service] || '#b4b4b4' }}>
                          {step.step}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold" style={{ color: SERVICE_COLORS[step.service] || '#b4b4b4' }}>{step.service}</span>
                            <span className="text-xs text-[#b4b4b4]">→</span>
                            <span className="text-xs text-[#fafafa]">{step.action}</span>
                          </div>
                          <p className="text-[11px] text-[#b4b4b4] mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {selected.trigger_conditions && Object.keys(selected.trigger_conditions).length > 0 && (
                <div className="rounded-lg bg-[#1a1a1a] p-3">
                  <p className="text-[10px] font-bold text-[#b4b4b4] mb-1">Trigger Conditions</p>
                  <code className="text-xs font-mono text-[#fafafa]">{JSON.stringify(selected.trigger_conditions, null, 2)}</code>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
