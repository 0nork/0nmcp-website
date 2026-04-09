'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/console/exec/ScoreRing'
import { SubScoreBar } from '@/components/console/exec/SubScoreBar'
import { type ScoreBand } from '@/lib/0nexec/scoring-engine'
import { AlertCircle, RefreshCw, DollarSign, Clock, Zap, X, ChevronDown, ChevronRight } from 'lucide-react'

interface ScoreFlag {
  type: string
  severity: string
  message: string
  hackNumber?: number
  layer?: string
}

interface ClientWithScore {
  id: string
  client_name: string
  pipedrive_deal_id: string
  client_industry: string | null
  pm_name: string | null
  score: {
    score_total: number
    score_dream: number
    score_likelihood: number
    score_speed: number
    score_friction: number
    band: ScoreBand
    flags: ScoreFlag[]
    computed_at: string
  } | null
}

const STAGES = ['Discovery', 'Offer Build', 'Creative', 'Launch', 'Optimize', 'Scale / Retain']

function bandColor(band: ScoreBand): string {
  switch (band) {
    case 'NOMINAL': return '#fafafa'
    case 'MONITOR': return '#fafafa'
    case 'REVIEW': return '#F5C518'
    case 'CRITICAL': return '#EF4444'
  }
}

export default function ExecPipelinePage() {
  const [clients, setClients] = useState<ClientWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [criticalCount, setCriticalCount] = useState(0)
  const [selectedClient, setSelectedClient] = useState<ClientWithScore | null>(null)

  useEffect(() => {
    fetch('/api/exec/scores')
      .then(r => r.json())
      .then(data => {
        setClients(data.clients || [])
        setCriticalCount(data.criticalCount || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[rgba(255,255,255,0.1)] border-t-[#fafafa] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] mb-1">0nExec Pipeline</h1>
          <p className="text-sm text-[#b4b4b4]">
            {clients.length} clients tracked — {criticalCount} critical
          </p>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <Badge className="bg-[#EF4444]/15 text-[#EF4444] border-0 gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {criticalCount} Critical
            </Badge>
          )}
        </div>
      </div>

      {/* Score Legend */}
      <div className="flex items-center gap-6">
        {([
          { band: 'NOMINAL', range: '80–100', color: '#fafafa' },
          { band: 'MONITOR', range: '60–79', color: '#fafafa' },
          { band: 'REVIEW', range: '40–59', color: '#F5C518' },
          { band: 'CRITICAL', range: '0–39', color: '#EF4444' },
        ]).map(b => (
          <div key={b.band} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
            <span className="text-[#b4b4b4] font-medium">{b.band}</span>
            <span className="text-[#b4b4b4] font-mono">{b.range}</span>
          </div>
        ))}
      </div>

      {/* Pipeline Board */}
      {clients.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage, stageIdx) => {
              const stageClients = clients.filter((_, i) => i % STAGES.length === stageIdx)
              const avgScore = stageClients.length > 0
                ? Math.round(stageClients.reduce((s, c) => s + (c.score?.score_total || 0), 0) / stageClients.length)
                : 0
              const hasCritical = stageClients.some(c => c.score?.band === 'CRITICAL')

              return (
                <div key={stage} className="w-64 shrink-0">
                  {/* Stage Header */}
                  <div className={`rounded-t-lg px-3 py-2.5 border border-b-0 bg-[#273142] ${hasCritical ? 'border-[#EF4444]/40' : 'border-[rgba(255,255,255,0.1)]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">{stage}</span>
                      <span className="text-[10px] font-mono text-[#b4b4b4]">{stageClients.length}</span>
                    </div>
                    {stageClients.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 flex-1 rounded-full bg-[#1a1a1a] overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${avgScore}%`, background: avgScore >= 80 ? '#fafafa' : avgScore >= 60 ? '#fafafa' : avgScore >= 40 ? '#F5C518' : '#EF4444' }} />
                        </div>
                        <span className="text-[10px] font-mono text-[#b4b4b4]">{avgScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Client Cards */}
                  <div className={`rounded-b-lg border bg-[#141414] p-2 space-y-2 min-h-[200px] ${hasCritical ? 'border-[#EF4444]/40' : 'border-[rgba(255,255,255,0.1)]'}`}>
                    {stageClients.map(client => {
                      const score = client.score
                      const band = (score?.band || 'MONITOR') as ScoreBand
                      const total = score?.score_total || 0
                      const color = bandColor(band)

                      return (
                        <Card
                          key={client.id}
                          className="bg-[#273142] border-[rgba(255,255,255,0.1)] hover:border-[#fafafa]/30 cursor-pointer transition-colors"
                          onClick={() => setSelectedClient(client)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <ScoreRing score={total} band={band} size={48} strokeWidth={3} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#fafafa] truncate">{client.client_name}</div>
                                {client.pm_name && (
                                  <div className="text-[10px] text-[#b4b4b4] mt-0.5">{client.pm_name}</div>
                                )}
                                <Badge className="mt-1.5 border-0 text-[9px] font-bold" style={{ background: `${color}15`, color }}>
                                  {band}
                                </Badge>
                              </div>
                            </div>

                            {score?.flags && score.flags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {score.flags.slice(0, 4).map((f, i) => (
                                  <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: f.severity === 'critical' ? '#EF4444' : '#F5C518' }} title={f.message} />
                                ))}
                                {score.flags.length > 4 && <span className="text-[9px] text-[#b4b4b4]">+{score.flags.length - 4}</span>}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                    {stageClients.length === 0 && (
                      <div className="text-center py-8 text-[#b4b4b4] text-xs">No clients</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="bg-[#273142] border-[rgba(255,255,255,0.1)]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-[#1a1a1a] flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#487fff]" />
            </div>
            <h3 className="text-lg font-bold text-[#fafafa] mb-2">No Clients Yet</h3>
            <p className="text-sm text-[#b4b4b4] mb-6 max-w-md mx-auto">
              Connect Pipedrive and add your first client to start tracking pipeline health.
            </p>
            <Button className="bg-[#487fff] text-[#141414] hover:bg-[#3a6fdd] gap-1.5" asChild>
              <a href="/console/integrations"><Zap className="w-4 h-4" /> Connect Pipedrive</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={() => setSelectedClient(null)}>
          <div className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm" />
          <Card className="relative bg-[#273142] border-[rgba(255,255,255,0.1)] max-w-lg w-full max-h-[85vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ScoreRing score={selectedClient.score?.score_total || 0} band={(selectedClient.score?.band || 'MONITOR') as ScoreBand} size={72} strokeWidth={5} />
                  <div>
                    <h2 className="text-lg font-bold text-[#fafafa]">{selectedClient.client_name}</h2>
                    {selectedClient.pm_name && <p className="text-xs text-[#b4b4b4]">PM: {selectedClient.pm_name}</p>}
                    {selectedClient.client_industry && <p className="text-xs text-[#b4b4b4] capitalize">{selectedClient.client_industry.replace('_', ' ')}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)} className="text-[#b4b4b4] hover:text-[#fafafa]">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {selectedClient.score && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b4b4b4]">Value Equation Breakdown</h3>
                  <SubScoreBar label="Dream Outcome" value={selectedClient.score.score_dream} color="#fafafa" />
                  <SubScoreBar label="Proof / Likelihood" value={selectedClient.score.score_likelihood} color="#fafafa" />
                  <SubScoreBar label="Speed to Result" value={selectedClient.score.score_speed} color="#F5C518" />
                  <SubScoreBar label="Low Friction" value={selectedClient.score.score_friction} color="#b4b4b4" />
                </div>
              )}

              {selectedClient.score?.flags && selectedClient.score.flags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#b4b4b4]">Active Flags</h3>
                  {selectedClient.score.flags.map((flag, i) => (
                    <div key={i} className={`rounded-lg border p-3 flex items-start gap-2.5 ${
                      flag.severity === 'critical' ? 'border-[#EF4444]/30 bg-[#EF4444]/5' : 'border-[#F5C518]/30 bg-[#F5C518]/5'
                    }`}>
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${flag.severity === 'critical' ? 'text-[#EF4444]' : 'text-[#F5C518]'}`} />
                      <div>
                        {flag.hackNumber && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#b4b4b4]">Hack #{flag.hackNumber} · {flag.layer}</span>
                        )}
                        <p className="text-xs text-[#fafafa] mt-0.5">{flag.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#1a1a1a] p-3 flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-[#487fff]" />
                  <div>
                    <div className="text-[10px] text-[#b4b4b4]">Deal ID</div>
                    <div className="text-xs font-mono text-[#fafafa]">{selectedClient.pipedrive_deal_id}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-[#1a1a1a] p-3 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#b4b4b4]" />
                  <div>
                    <div className="text-[10px] text-[#b4b4b4]">Last Scored</div>
                    <div className="text-xs font-mono text-[#fafafa]">
                      {selectedClient.score?.computed_at ? new Date(selectedClient.score.computed_at).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
