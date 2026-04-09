'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreRing } from '@/components/console/exec/ScoreRing'
import { SubScoreBar } from '@/components/console/exec/SubScoreBar'
import type { ScoreBand } from '@/lib/0nexec/scoring-engine'
import { DollarSign, Megaphone, Truck, Users, Shield, AlertCircle } from 'lucide-react'

interface ClientScore {
  id: string
  client_name: string
  pm_name: string | null
  client_industry: string | null
  score: {
    score_total: number
    score_dream: number
    score_likelihood: number
    score_speed: number
    score_friction: number
    band: ScoreBand
    flags: Array<{ type: string; severity: string; message: string }>
  } | null
}

const LANES = [
  {
    id: 'revenue',
    title: 'Revenue',
    icon: DollarSign,
    description: 'Deal value, pipeline velocity, won/lost trends',
    scoreKey: 'score_dream' as const,
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: Megaphone,
    description: 'CTR vs baseline, CPA, creative health (12-hack audit)',
    scoreKey: 'score_likelihood' as const,
  },
  {
    id: 'delivery',
    title: 'Delivery / Ops',
    icon: Truck,
    description: 'Stage days vs baseline, activity completion rate',
    scoreKey: 'score_speed' as const,
  },
  {
    id: 'team',
    title: 'Team Performance',
    icon: Users,
    description: 'Client load balance, at-risk ownership, avg score per PM',
    scoreKey: 'score_friction' as const,
  },
  {
    id: 'retention',
    title: 'Retention',
    icon: Shield,
    description: '30-day score trend, churn risk, engagement velocity',
    scoreKey: 'score_total' as const,
  },
]

export default function DepartmentsPage() {
  const [clients, setClients] = useState<ClientScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exec/scores')
      .then(r => r.json())
      .then(data => { setClients(data.clients || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#2A2A2A] border-t-[#FFFFFF] rounded-full animate-spin" />
      </div>
    )
  }

  // Group by PM for team lane
  const pmGroups = new Map<string, ClientScore[]>()
  for (const c of clients) {
    const pm = c.pm_name || 'Unassigned'
    if (!pmGroups.has(pm)) pmGroups.set(pm, [])
    pmGroups.get(pm)!.push(c)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#FFFFFF] mb-1">Departments</h1>
        <p className="text-sm text-[#6B6B6B]">
          Five-lane view across Revenue, Marketing, Delivery, Team, and Retention.
        </p>
      </div>

      {/* Five Lanes */}
      <div className="space-y-4">
        {LANES.map(lane => {
          // Calculate lane aggregate score
          const laneScores = clients
            .filter(c => c.score)
            .map(c => {
              const s = c.score!
              if (lane.scoreKey === 'score_total') return s.score_total
              return (s as unknown as unknown as Record<string, number>)[lane.scoreKey] || 0
            })

          const avgScore = laneScores.length > 0
            ? Math.round(laneScores.reduce((a, b) => a + b, 0) / laneScores.length)
            : 0

          const maxScore = lane.scoreKey === 'score_total' ? 100 : 25
          const normalizedAvg = lane.scoreKey === 'score_total'
            ? avgScore
            : Math.round((avgScore / 25) * 100)

          const band: ScoreBand = normalizedAvg >= 80 ? 'NOMINAL' : normalizedAvg >= 60 ? 'MONITOR' : normalizedAvg >= 40 ? 'REVIEW' : 'CRITICAL'

          // Get worst clients for this lane
          const sorted = [...clients]
            .filter(c => c.score)
            .sort((a, b) => {
              const aVal = lane.scoreKey === 'score_total' ? (a.score?.score_total || 0) : ((a.score as unknown as Record<string, number>)?.[lane.scoreKey] || 0)
              const bVal = lane.scoreKey === 'score_total' ? (b.score?.score_total || 0) : ((b.score as unknown as Record<string, number>)?.[lane.scoreKey] || 0)
              return aVal - bVal
            })

          const flagCount = lane.id === 'marketing'
            ? clients.reduce((sum, c) => sum + (c.score?.flags?.filter(f => f.type === 'hack_violation').length || 0), 0)
            : lane.id === 'delivery'
            ? clients.reduce((sum, c) => sum + (c.score?.flags?.filter(f => f.type === 'stage_overrun' || f.type === 'no_contact').length || 0), 0)
            : 0

          return (
            <Card key={lane.id} className="bg-[#111111] border-[#2A2A2A]">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Lane header */}
                  <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center shrink-0">
                    <lane.icon className="w-5 h-5 text-[#FFFFFF]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-[#FFFFFF]">{lane.title}</h3>
                        {flagCount > 0 && (
                          <Badge className="bg-[#EF4444]/15 text-[#EF4444] border-0 text-[9px] gap-1">
                            <AlertCircle className="w-3 h-3" /> {flagCount} flags
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold font-mono text-[#FFFFFF]">{normalizedAvg}</span>
                        <ScoreRing score={normalizedAvg} band={band} size={40} strokeWidth={3} showLabel={false} />
                      </div>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mb-3">{lane.description}</p>

                    {/* Client bars — worst 4 */}
                    <div className="space-y-2">
                      {sorted.slice(0, 4).map(client => {
                        const val = lane.scoreKey === 'score_total'
                          ? (client.score?.score_total || 0)
                          : ((client.score as unknown as Record<string, number>)?.[lane.scoreKey] || 0)
                        const clientBand: ScoreBand = lane.scoreKey === 'score_total'
                          ? (client.score?.band || 'MONITOR') as ScoreBand
                          : val >= 20 ? 'NOMINAL' : val >= 15 ? 'MONITOR' : val >= 10 ? 'REVIEW' : 'CRITICAL'

                        const barColor = clientBand === 'CRITICAL' ? '#EF4444'
                          : clientBand === 'REVIEW' ? '#F5C518'
                          : clientBand === 'MONITOR' ? '#D4D4D4'
                          : '#FFFFFF'

                        return (
                          <div key={client.id} className="flex items-center gap-3">
                            <span className="text-xs text-[#D4D4D4] w-36 truncate">{client.client_name}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-[#1A1A1A] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(val / maxScore) * 100}%`, background: barColor }}
                              />
                            </div>
                            <span className="text-xs font-mono text-[#6B6B6B] w-8 text-right">{val}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* PM Load Distribution */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-[#FFFFFF] mb-4">PM Load Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from(pmGroups.entries()).map(([pm, pmClients]) => {
              const critCount = pmClients.filter(c => c.score?.band === 'CRITICAL').length
              const avgScore = pmClients.length > 0
                ? Math.round(pmClients.reduce((s, c) => s + (c.score?.score_total || 0), 0) / pmClients.length)
                : 0

              return (
                <div key={pm} className="rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#FFFFFF]">{pm}</span>
                    <span className="text-xs font-mono text-[#6B6B6B]">{pmClients.length} clients</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold font-mono text-[#FFFFFF]">{avgScore}</span>
                    <span className="text-xs text-[#6B6B6B]">avg score</span>
                    {critCount > 0 && (
                      <Badge className="ml-auto bg-[#EF4444]/15 text-[#EF4444] border-0 text-[9px]">
                        {critCount} critical
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {pmClients.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <span className="text-[#D4D4D4] truncate mr-2">{c.client_name}</span>
                        <span className="font-mono" style={{
                          color: c.score?.band === 'CRITICAL' ? '#EF4444' : c.score?.band === 'REVIEW' ? '#F5C518' : '#D4D4D4'
                        }}>
                          {c.score?.score_total || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
