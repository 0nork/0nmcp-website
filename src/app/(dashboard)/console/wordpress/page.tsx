'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Shield, Database, Zap, Check } from 'lucide-react'
import Link from 'next/link'

export default function WordPressPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[#fafafa]">WordPress Hosting</h1><p className="text-sm text-[#b4b4b4]">Managed WordPress hosting with SSL, CDN, and daily backups.</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ label: 'Sites', value: '0', icon: Globe, color: '#487fff' },{ label: 'SSL', value: '—', icon: Shield, color: '#22D3A5' },{ label: 'Storage', value: '—', icon: Database, color: '#F5C518' },{ label: 'Uptime', value: '99.9%', icon: Zap, color: '#487fff' }].map(s => (
          <Card key={s.label} className="bg-[#273142] border-white/10"><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
            <div><div className="text-2xl font-bold text-[#fafafa]">{s.value}</div><div className="text-[10px] text-[#b4b4b4]">{s.label}</div></div>
          </CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'Standard', price: '$39', features: ['Managed WordPress','Free SSL','Daily backups','1-click staging','CDN included'] },
          { name: 'Pro', price: '$79', features: ['Everything in Standard','Enhanced performance','Priority support','Multisite support','Advanced caching'], featured: true },
        ].map(p => (
          <Card key={p.name} className={`bg-[#273142] border transition-all hover:translate-y-[-2px] ${p.featured ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/10'}`}>
            <CardContent className="p-5">
              {p.featured && <Badge className="bg-primary/15 text-primary border-0 text-[9px] mb-2">Recommended</Badge>}
              <h3 className="text-base font-bold text-[#fafafa]">WordPress {p.name}</h3>
              <div className="text-2xl font-bold text-[#fafafa] my-3">{p.price}<span className="text-sm text-[#b4b4b4]">/mo</span></div>
              <ul className="space-y-1.5 mb-4">{p.features.map(f => <li key={f} className="flex items-start gap-2 text-xs text-[#fafafa]"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{f}</li>)}</ul>
              <Button className={`w-full ${p.featured ? 'bg-primary text-white' : 'bg-white/5 text-[#fafafa] border border-white/10'}`} asChild><Link href="/console/store">Subscribe</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
