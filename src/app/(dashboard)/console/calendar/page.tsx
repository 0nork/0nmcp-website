'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalIcon, Clock, Users, Plus, Settings } from 'lucide-react'
import Link from 'next/link'

export default function CalendarPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa]">Calendar</h1>
          <p className="text-sm text-[#b4b4b4]">Manage appointments, bookings, and scheduling.</p>
        </div>
        <Button className="bg-primary text-white gap-1.5"><Plus className="w-4 h-4" /> New Event</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Today', value: '0', sub: 'appointments', icon: CalIcon, color: '#487fff' },
          { label: 'This Week', value: '0', sub: 'scheduled', icon: Clock, color: '#22D3A5' },
          { label: 'Contacts', value: '0', sub: 'with bookings', icon: Users, color: '#F5C518' },
        ].map(s => (
          <Card key={s.label} className="bg-[#273142] border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#fafafa]">{s.value}</div>
                <div className="text-[10px] text-[#b4b4b4]">{s.sub}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#273142] border-white/10">
        <CardContent className="p-12 text-center">
          <CalIcon className="w-12 h-12 text-[#b4b4b4] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#fafafa] mb-2">Connect Your Calendar</h3>
          <p className="text-sm text-[#b4b4b4] mb-4 max-w-md mx-auto">Connect your CRM calendar to manage appointments, send reminders, and track no-shows.</p>
          <Button className="bg-primary text-white" asChild><Link href="/console/integrations">Connect CRM</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
