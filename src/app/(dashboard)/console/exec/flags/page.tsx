'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react'

interface Alert {
  id: string
  alert_type: string
  score_before: number | null
  score_after: number | null
  flag_hack_number: number | null
  flag_layer: string | null
  flag_issue: string | null
  slack_sent: boolean
  acknowledged: boolean
  created_at: string
  exec_clients?: {
    client_name: string
    pipedrive_deal_id: string
    pm_name: string | null
  }
}

export default function FlagsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exec/flags')
      .then(r => r.json())
      .then(data => { setAlerts(data.alerts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#2A2A2A] border-t-[#FFFFFF] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#FFFFFF] mb-1">Flags & Alerts</h1>
        <p className="text-sm text-[#6B6B6B]">
          {alerts.length} unacknowledged alerts across all clients.
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-[#1A1A1A] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#FFFFFF]" />
            </div>
            <h3 className="text-lg font-bold text-[#FFFFFF] mb-2">No Active Flags</h3>
            <p className="text-sm text-[#6B6B6B]">
              All clients are within normal parameters. Flags will appear here when scores drop or anomalies are detected.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <Card key={alert.id} className="bg-[#111111] border-[#2A2A2A]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    alert.alert_type === 'score_drop' ? 'bg-[#EF4444]/10' : 'bg-[#F5C518]/10'
                  }`}>
                    {alert.alert_type === 'score_drop'
                      ? <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                      : <Zap className="w-5 h-5 text-[#F5C518]" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#FFFFFF]">
                        {alert.exec_clients?.client_name || 'Unknown Client'}
                      </span>
                      {alert.score_before != null && alert.score_after != null && (
                        <Badge className="bg-[#EF4444]/15 text-[#EF4444] border-0 text-[9px] font-bold">
                          {alert.score_before} → {alert.score_after}
                        </Badge>
                      )}
                      {alert.slack_sent && (
                        <Badge className="bg-[#1A1A1A] text-[#6B6B6B] border border-[#2A2A2A] text-[9px]">
                          Slack sent
                        </Badge>
                      )}
                    </div>

                    {alert.flag_issue && (
                      <p className="text-xs text-[#D4D4D4] mb-1.5">{alert.flag_issue}</p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-[#6B6B6B] font-mono">
                      {alert.flag_hack_number && (
                        <span>Hack #{alert.flag_hack_number}</span>
                      )}
                      {alert.flag_layer && (
                        <span>{alert.flag_layer}</span>
                      )}
                      {alert.exec_clients?.pm_name && (
                        <span>PM: {alert.exec_clients.pm_name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-[#2A2A2A] text-[#D4D4D4] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
                    onClick={async () => {
                      await fetch('/api/exec/flags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ alertId: alert.id }),
                      })
                      setAlerts(prev => prev.filter(a => a.id !== alert.id))
                    }}
                  >
                    Acknowledge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
