'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Phone, Send, Users } from 'lucide-react'
import Link from 'next/link'

export default function WhatsAppPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa]">WhatsApp Business</h1>
          <p className="text-sm text-[#b4b4b4]">Send template messages, manage conversations, automate responses.</p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-400 border-0">$29/mo</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Messages Sent', value: '0', icon: Send, color: '#22D3A5' },
          { label: 'Messages Received', value: '0', icon: MessageSquare, color: '#487fff' },
          { label: 'Conversations', value: '0', icon: Users, color: '#F5C518' },
        ].map(s => (
          <Card key={s.label} className="bg-[#273142] border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
              <div><div className="text-2xl font-bold text-[#fafafa]">{s.value}</div><div className="text-[10px] text-[#b4b4b4]">{s.label}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#273142] border-white/10"><CardContent className="p-12 text-center">
        <Phone className="w-12 h-12 text-[#b4b4b4] mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#fafafa] mb-2">Get WhatsApp Business</h3>
        <p className="text-sm text-[#b4b4b4] mb-4 max-w-md mx-auto">WhatsApp Business API with template messages, quick replies, and automation triggers.</p>
        <Button className="bg-primary text-white" asChild><Link href="/console/store">View in Store — $29/mo</Link></Button>
      </CardContent></Card>
    </div>
  )
}
