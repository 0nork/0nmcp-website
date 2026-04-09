'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/console/exec/ScoreRing'
import { SubScoreBar } from '@/components/console/exec/SubScoreBar'
import { getBandColor, type ScoreBand } from '@/lib/0nexec/scoring-engine'
import {
  AlertCircle, TrendingDown, RefreshCw, Users, DollarSign,
  Clock, MessageSquare, ChevronRight, Zap, X
} from 'lucide-react'

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
    flags: Array<{ type: string; severity: string; message: string; hackNumber?: number; layer?: string }>
    computed_at: string
  } | null
}

const STAGES = ['Discovery', 'Offer Build', 'Creative', 'Launch', 'Optimize', 'Scale / Retain']

const BAND_COLORS: Record<ScoreBand, string> = {
  NOMINAL: '#22D3A5',
  MONITOR: '#F5C518',
  REVIEW: '#F97316',
  CRITICAL: '#EF4444',
}

export default function ExecPipelinePage() {
  const [clients, setClients] = useState<ClientWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [criticalCount, setCriticalCount] = useState(0)
  const [selectedClient, setSelectedClient] = useState<ClientWithScore | null>(null)
  const [scoring, setScoring] = useState(false)

  useEffect(() => {
    fetchScores()
  }, [])

  async function fetchScores() {
    setLoading(true)
    try {
      const res = await fetch('/api/exec/scores')
      const data = await res.json()
      setClients(data.clients || [])
      setCriticalCount(data.criticalCount || 0)
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function triggerRescore() {
    setScoring(true)
    await fetch('/api/exec/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'current' }),
    })
    await fetchScores()
    setScoring(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">0nExec Pipeline</h1>
          <p className="text-sm text-muted-foreground">
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
          <Button
            size="sm"
            variant="outline"
            onClick={triggerRescore}
            disabled={scoring}
            className="border-border text-foreground gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scoring ? 'animate-spin' : ''}`} />
            {scoring ? 'Scoring...' : 'Rescore All'}
          </Button>
        </div>
      </div>

      {/* Score Legend */}
      <div className="flex items-center gap-6">
        {(['NOMINAL', 'MONITOR', 'REVIEW', 'CRITICAL'] as ScoreBand[]).map(band => (
          <div key={band} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: BAND_COLORS[band] }} />
            <span className="text-muted-foreground font-medium">{band}</span>
            <span className="text-muted-foreground font-mono">
              {band === 'NOMINAL' ? '80–100' : band === 'MONITOR' ? '60–79' : band === 'REVIEW' ? '40–59' : '0–39'}
            </span>
          </div>
        ))}
      </div>

      {/* Pipeline Board — Horizontal Scroll */}
      {clients.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => {
              // For now, distribute clients across stages evenly (will use Pipedrive stage data when wired)
              const stageIdx = STAGES.indexOf(stage)
              const stageClients = clients.filter((_, i) => i % STAGES.length === stageIdx)
              const avgScore = stageClients.length > 0
                ? Math.round(stageClients.reduce((s, c) => s + (c.score?.score_total || 0), 0) / stageClients.length)
                : 0
              const hasCritical = stageClients.some(c => c.score?.band === 'CRITICAL')

              return (
                <div key={stage} className="w-64 shrink-0">
                  {/* Stage Header */}
                  <div className={`rounded-t-lg px-3 py-2.5 border border-b-0 ${hasCritical ? 'border-[#EF4444]/40' : 'border-border'} bg-card`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">{stage}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{stageClients.length}</span>
                    </div>
                    {stageClients.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${avgScore}%`, background: getBandColor(avgScore >= 80 ? 'NOMINAL' : avgScore >= 60 ? 'MONITOR' : avgScore >= 40 ? 'REVIEW' : 'CRITICAL') }} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{avgScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Client Cards */}
                  <div className={`rounded-b-lg border ${hasCritical ? 'border-[#EF4444]/40' : 'border-border'} bg-background p-2 space-y-2 min-h-[200px]`}>
                    {stageClients.map(client => {
                      const score = client.score
                      const band = (score?.band || 'MONITOR') as ScoreBand
                      const total = score?.score_total || 0

                      return (
                        <Card
                          key={client.id}
                          className="bg-card border-border hover:border-primary/30 cursor-pointer transition-colors"
                          onClick={() => setSelectedClient(client)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <ScoreRing score={total} band={band} size={48} strokeWidth={3} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground truncate">{client.client_name}</div>
                                {client.pm_name && (
                                  <div className="text-[10px] text-muted-foreground mt-0.5">{client.pm_name}</div>
                                )}
                                <Badge
                                  className="mt-1.5 border-0 text-[9px] font-bold"
                                  style={{ background: `${BAND_COLORS[band]}15`, color: BAND_COLORS[band] }}
                                >
                                  {band}
                                </Badge>
                              </div>
                            </div>

                            {/* Flag dots */}
                            {score?.flags && score.flags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {score.flags.slice(0, 4).map((f, i) => (
                                  <span
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: f.severity === 'critical' ? '#EF4444' : '#F5C518' }}
                                    title={f.message}
                                  />
                                ))}
                                {score.flags.length > 4 && (
                                  <span className="text-[9px] text-muted-foreground">+{score.flags.length - 4}</span>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}

                    {stageClients.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs">No clients</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-primary/10 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Clients Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Connect Pipedrive and add your first client to start tracking pipeline health with AI-powered scoring.
            </p>
            <div className="flex gap-3 justify-center">
              <Button className="bg-primary text-primary-foreground gap-1.5" asChild>
                <a href="/console/integrations">
                  <Zap className="w-4 h-4" /> Connect Pipedrive
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Panel — Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={() => setSelectedClient(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative bg-card border-border max-w-lg w-full max-h-[85vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ScoreRing
                    score={selectedClient.score?.score_total || 0}
                    band={(selectedClient.score?.band || 'MONITOR') as ScoreBand}
                    size={72}
                    strokeWidth={5}
                  />
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedClient.client_name}</h2>
                    {selectedClient.pm_name && <p className="text-xs text-muted-foreground">PM: {selectedClient.pm_name}</p>}
                    {selectedClient.client_industry && <p className="text-xs text-muted-foreground capitalize">{selectedClient.client_industry}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Subscores */}
              {selectedClient.score && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Value Equation Breakdown</h3>
                  <SubScoreBar label="Dream Outcome" value={selectedClient.score.score_dream} color="#22D3A5" />
                  <SubScoreBar label="Proof / Likelihood" value={selectedClient.score.score_likelihood} color="#3B82F6" />
                  <SubScoreBar label="Speed to Result" value={selectedClient.score.score_speed} color="#F5C518" />
                  <SubScoreBar label="Low Friction" value={selectedClient.score.score_friction} color="#8B5CF6" />
                </div>
              )}

              {/* Flags */}
              {selectedClient.score?.flags && selectedClient.score.flags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Flags</h3>
                  {selectedClient.score.flags.map((flag, i) => (
                    <div key={i} className={`rounded-lg border p-3 flex items-start gap-2.5 ${
                      flag.severity === 'critical'
                        ? 'border-[#EF4444]/30 bg-[#EF4444]/5'
                        : 'border-[#F5C518]/30 bg-[#F5C518]/5'
                    }`}>
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        flag.severity === 'critical' ? 'text-[#EF4444]' : 'text-[#F5C518]'
                      }`} />
                      <div>
                        {flag.hackNumber && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Hack #{flag.hackNumber} · {flag.layer}
                          </span>
                        )}
                        <p className="text-xs text-foreground mt-0.5">{flag.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3 flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-[10px] text-muted-foreground">Deal ID</div>
                    <div className="text-xs font-mono text-foreground">{selectedClient.pipedrive_deal_id}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary p-3 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#F5C518]" />
                  <div>
                    <div className="text-[10px] text-muted-foreground">Last Scored</div>
                    <div className="text-xs font-mono text-foreground">
                      {selectedClient.score?.computed_at
                        ? new Date(selectedClient.score.computed_at).toLocaleDateString()
                        : 'Never'}
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
