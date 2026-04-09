'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Zap, Search, EllipsisVertical, Eye, Play, ChevronDown, ChevronRight, AlertCircle
} from 'lucide-react'

interface WorkflowStep {
  step: number
  service: string
  action: string
  description: string
}

interface Workflow {
  id: string
  name: string
  slug: string
  description: string
  status: string
  trigger_event: string
  trigger_conditions: Record<string, unknown>
  steps: WorkflowStep[]
  services: string[]
  total_executions: number
  executions_today: number
  last_executed_at: string | null
  created_at: string
}

const SERVICE_BADGE: Record<string, { bg: string; text: string }> = {
  crm:       { bg: 'bg-[#6EE05A]/10', text: 'text-[#6EE05A]' },
  supabase:  { bg: 'bg-[#3ECF8E]/10', text: 'text-[#3ECF8E]' },
  stripe:    { bg: 'bg-[#635BFF]/10', text: 'text-[#635BFF]' },
  slack:     { bg: 'bg-[#E0B3E6]/10', text: 'text-[#E0B3E6]' },
  telegram:  { bg: 'bg-[#26A5E4]/10', text: 'text-[#26A5E4]' },
  anthropic: { bg: 'bg-[#D4A574]/10', text: 'text-[#D4A574]' },
}

const LOCATIONS = [
  { id: 'F76MNKOMQCMruMrumtdf', name: 'Spa Ligonier' },
  { id: 'nphConTwfHcVE1oA0uep', name: '0ncore' },
]

export default function AgentWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      })
      const data = await res.json()
      if (data.success) {
        setWebhookStatus(prev => ({ ...prev, [locationId]: data.alreadyExisted ? 'already' : 'connected' }))
      } else {
        setWebhookStatus(prev => ({ ...prev, [locationId]: `error:${data.error}` }))
      }
    } catch (err) {
      setWebhookStatus(prev => ({ ...prev, [locationId]: `error:${(err as Error).message}` }))
    }
  }

  const spaCount = workflows.filter(w => w.slug.startsWith('0nspa')).length
  const platformCount = workflows.length - spaCount

  const filtered = workflows.filter(w => {
    if (filter === 'spa' && !w.slug.startsWith('0nspa')) return false
    if (filter === 'platform' && w.slug.startsWith('0nspa')) return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) && !w.slug.includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">AI Agent Workflows</h1>
        <p className="text-sm text-muted-foreground">
          {workflows.length} workflows — {workflows.filter(w => w.status === 'active').length} active — {spaCount} Spa Ligonier
        </p>
      </div>

      {/* Webhook Banner */}
      <div className="rounded-lg border border-amber-500/30 border-l-4 border-l-amber-500 bg-amber-500/10 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-amber-300">CRM Webhooks Not Connected</span>
                <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px]">ACTION REQUIRED</Badge>
              </div>
              <p className="text-xs text-foreground/70 m-0">
                Your 9 workflows are built and ready. They won&apos;t fire until each CRM location is registered.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {LOCATIONS.map(loc => {
              const status = webhookStatus[loc.id]
              const isOk = status === 'connected' || status === 'already'
              const isLoading = status === 'registering'
              const isErr = status?.startsWith('error')
              const isPrimary = loc.name === 'Spa Ligonier'
              return (
                <Button
                  key={loc.id}
                  onClick={() => registerWebhook(loc.id)}
                  disabled={isLoading}
                  size="sm"
                  className={
                    isOk ? 'bg-primary/15 text-primary border border-primary/30'
                    : isPrimary ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'bg-transparent text-foreground border border-border hover:border-foreground'
                  }
                >
                  {isLoading ? 'Connecting...' : isOk ? '✓ Connected' : isErr ? 'Retry' : `Connect ${loc.name}`}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Error display */}
      {Object.entries(webhookStatus).filter(([, s]) => s.startsWith('error')).map(([id, s]) => (
        <div key={id} className="rounded-lg border border-destructive/30 border-l-4 border-l-destructive bg-destructive/10 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-xs text-foreground">{LOCATIONS.find(l => l.id === id)?.name}: {s.replace('error:', '')}</span>
        </div>
      ))}

      {/* Workflows Card with Tabs */}
      <Card className="bg-card border-border !p-0 overflow-hidden">
        <CardContent className="p-0">
          {/* Tab Header */}
          <div className="flex items-center justify-between border-b border-border px-4">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-transparent h-[50px] p-0 gap-0">
                <TabsTrigger value="all" className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent cursor-pointer">
                  All ({workflows.length})
                </TabsTrigger>
                <TabsTrigger value="spa" className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-amber-400 border-b-2 border-transparent data-[state=active]:border-amber-400 rounded-none data-[state=active]:shadow-none bg-transparent cursor-pointer">
                  Spa ({spaCount})
                </TabsTrigger>
                <TabsTrigger value="platform" className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none bg-transparent cursor-pointer">
                  Platform ({platformCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 h-8 w-44 bg-secondary border-border text-foreground text-xs"
              />
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="px-3 h-10 bg-secondary rounded-tl-lg text-xs font-bold text-muted-foreground uppercase tracking-wider">Workflow</TableHead>
                  <TableHead className="px-3 h-10 bg-secondary text-xs font-bold text-muted-foreground uppercase tracking-wider">Trigger</TableHead>
                  <TableHead className="px-3 h-10 bg-secondary text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Services</TableHead>
                  <TableHead className="px-3 h-10 bg-secondary text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Steps</TableHead>
                  <TableHead className="px-3 h-10 bg-secondary text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Runs</TableHead>
                  <TableHead className="px-3 h-10 bg-secondary text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Status</TableHead>
                  <TableHead className="px-3 h-10 bg-secondary rounded-tr-lg text-xs font-bold text-muted-foreground uppercase tracking-wider text-center w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(w => {
                  const isSpa = w.slug.startsWith('0nspa')
                  const isOpen = expanded === w.id

                  return (
                    <>
                      <TableRow
                        key={w.id}
                        className="border-b border-border hover:bg-secondary/30 cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : w.id)}
                      >
                        {/* Name */}
                        <TableCell className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${w.status === 'active' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                            <div>
                              <span className="text-sm font-semibold text-foreground block">{w.name}</span>
                              {isSpa && <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[9px] mt-0.5">SPA LIGONIER</Badge>}
                            </div>
                          </div>
                        </TableCell>

                        {/* Trigger */}
                        <TableCell className="py-3 px-3">
                          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">{w.trigger_event}</span>
                        </TableCell>

                        {/* Services */}
                        <TableCell className="py-3 px-3 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {w.services?.slice(0, 3).map(s => {
                              const style = SERVICE_BADGE[s] || { bg: 'bg-secondary', text: 'text-muted-foreground' }
                              return (
                                <Badge key={s} className={`${style.bg} ${style.text} border-0 text-[9px] font-bold font-mono uppercase`}>
                                  {s}
                                </Badge>
                              )
                            })}
                            {(w.services?.length || 0) > 3 && (
                              <Badge className="bg-secondary text-muted-foreground border-0 text-[9px]">+{w.services.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Steps */}
                        <TableCell className="py-3 px-3 text-center text-sm text-foreground font-mono">
                          {w.steps?.length || 0}
                        </TableCell>

                        {/* Runs */}
                        <TableCell className="py-3 px-3 text-center text-sm text-foreground font-mono">
                          {w.total_executions}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 px-3 text-center">
                          <Badge className={`rounded-full ${w.status === 'active' ? 'bg-primary/15 text-primary' : 'bg-amber-500/15 text-amber-400'} border-0`}>
                            {w.status}
                          </Badge>
                        </TableCell>

                        {/* Expand */}
                        <TableCell className="py-3 px-3 text-center">
                          {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Steps */}
                      {isOpen && w.steps && (
                        <TableRow key={`${w.id}-steps`} className="border-b border-border">
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-secondary/30 px-6 py-4">
                              <p className="text-xs text-muted-foreground mb-3">{w.description}</p>
                              <div className="space-y-2">
                                {w.steps.map((step, i) => {
                                  const svcStyle = SERVICE_BADGE[step.service] || { bg: '', text: 'text-muted-foreground' }
                                  return (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                      <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold font-mono ${isSpa ? 'bg-amber-500/10 text-amber-400' : 'bg-primary/10 text-primary'}`}>
                                        {step.step}
                                      </span>
                                      <span className={`text-xs font-mono font-semibold min-w-[70px] ${svcStyle.text}`}>{step.service}</span>
                                      <span className="text-foreground">{step.description}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">No workflows match your filter</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
