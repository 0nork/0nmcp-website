'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, Mail, MessageSquare, Zap, AlertCircle } from 'lucide-react'

const NOTIFICATION_GROUPS = [
  { title: 'Workflow Alerts', icon: Zap, items: [
    { id: 'wf_complete', label: 'Workflow completed', description: 'When an automated workflow finishes', default: true },
    { id: 'wf_failed', label: 'Workflow failed', description: 'When a workflow encounters an error', default: true },
    { id: 'wf_created', label: 'New workflow generated', description: 'When AI creates a new workflow from chat', default: true },
  ]},
  { title: '0nExec Alerts', icon: AlertCircle, items: [
    { id: 'exec_critical', label: 'Client score CRITICAL', description: 'When any client drops below 40', default: true },
    { id: 'exec_review', label: 'Client score REVIEW', description: 'When any client drops below 60', default: false },
    { id: 'exec_predictive', label: 'Predictive flags', description: 'AI predicts a client may become critical', default: true },
  ]},
  { title: 'Communication', icon: MessageSquare, items: [
    { id: 'slack_alerts', label: 'Slack notifications', description: 'Send alerts to connected Slack workspace', default: true },
    { id: 'email_digest', label: 'Daily email digest', description: 'Summary of activity and flags', default: false },
  ]},
  { title: 'Account', icon: Bell, items: [
    { id: 'token_expiry', label: 'Token expiration warning', description: '7 days before any connected token expires', default: true },
    { id: 'new_addon', label: 'New Add0n available', description: 'When new add0ns are added to the store', default: false },
    { id: 'billing', label: 'Billing notifications', description: 'Usage reports and payment confirmations', default: true },
  ]},
]

export default function NotificationsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[#fafafa]">Notification Preferences</h1>

      {NOTIFICATION_GROUPS.map(group => (
        <Card key={group.title} className="bg-[#273142] border-white/10">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-[#fafafa] mb-4 flex items-center gap-2">
              <group.icon className="w-4 h-4 text-[#487fff]" /> {group.title}
            </h3>
            <div className="space-y-4">
              {group.items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#fafafa]">{item.label}</Label>
                    <p className="text-[10px] text-[#b4b4b4]">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.default} className="data-[state=checked]:bg-[#487fff]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
