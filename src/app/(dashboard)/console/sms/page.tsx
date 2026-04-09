'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function SMSPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[#fafafa]">SMS Messaging</h1><p className="text-sm text-[#b4b4b4]">2-way SMS with automation triggers and MMS support.</p></div>
        <Badge className="bg-emerald-500/15 text-emerald-400 border-0">From $15/mo</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Sent', value: '0', icon: Send, color: '#487fff' },{ label: 'Received', value: '0', icon: MessageSquare, color: '#22D3A5' },{ label: 'Delivery Rate', value: '—', icon: TrendingUp, color: '#F5C518' }].map(s => (
          <Card key={s.label} className="bg-[#273142] border-white/10"><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
            <div><div className="text-2xl font-bold text-[#fafafa]">{s.value}</div><div className="text-[10px] text-[#b4b4b4]">{s.label}</div></div>
          </CardContent></Card>
        ))}
      </div>
      <Card className="bg-[#273142] border-white/10"><CardContent className="p-8 text-center">
        <h3 className="text-lg font-bold text-[#fafafa] mb-4">Choose Your SMS Pack</h3>
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {[{ msgs: '500', price: '$15' },{ msgs: '2,000', price: '$50' },{ msgs: '5,000', price: '$100' }].map(p => (
            <Card key={p.msgs} className="bg-[#1a1a1a] border-white/10 hover:border-primary/30 cursor-pointer transition-colors"><CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-[#fafafa]">{p.msgs}</div><div className="text-xs text-[#b4b4b4]">SMS/mo</div>
              <div className="text-sm font-bold text-primary mt-2">{p.price}/mo</div>
            </CardContent></Card>
          ))}
        </div>
        <Button className="bg-primary text-white mt-4" asChild><Link href="/console/store">Subscribe in Store</Link></Button>
      </CardContent></Card>
    </div>
  )
}
