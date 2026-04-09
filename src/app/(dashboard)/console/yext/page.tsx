'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, MapPin, Star, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function YextPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[#fafafa]">Yext Listings</h1><p className="text-sm text-[#b4b4b4]">Manage your business listings across 40-80+ directories.</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Directories', value: '0', sub: 'synced', icon: Globe, color: '#487fff' },{ label: 'Reviews', value: '0', sub: 'monitored', icon: Star, color: '#F5C518' },{ label: 'Locations', value: '0', sub: 'managed', icon: MapPin, color: '#22D3A5' }].map(s => (
          <Card key={s.label} className="bg-[#273142] border-white/10"><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
            <div><div className="text-2xl font-bold text-[#fafafa]">{s.value}</div><div className="text-[10px] text-[#b4b4b4]">{s.sub}</div></div>
          </CardContent></Card>
        ))}
      </div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#b4b4b4]">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Essential', dirs: '40+', price: '$59', features: ['Google Business Profile','Facebook','Yelp','Apple Maps','Duplicate suppression'] },
          { name: 'Standard', dirs: '60+', price: '$79', features: ['Everything in Essential','Industry directories','Review monitoring','Analytics dashboard'], featured: true },
          { name: 'Premium', dirs: '80+', price: '$119', features: ['Everything in Standard','Premium directories','Enhanced analytics','Priority support'] },
        ].map(p => (
          <Card key={p.name} className={`bg-[#273142] border transition-all hover:translate-y-[-2px] cursor-pointer ${p.featured ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/10'}`}>
            <CardContent className="p-5">
              {p.featured && <Badge className="bg-primary/15 text-primary border-0 text-[9px] mb-2">Popular</Badge>}
              <h3 className="text-base font-bold text-[#fafafa]">Yext {p.name}</h3>
              <p className="text-xs text-[#b4b4b4] mb-3">{p.dirs} directories</p>
              <div className="text-2xl font-bold text-[#fafafa] mb-3">{p.price}<span className="text-sm text-[#b4b4b4]">/mo</span></div>
              <ul className="space-y-1.5 mb-4">{p.features.map(f => <li key={f} className="flex items-start gap-2 text-xs text-[#fafafa]"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{f}</li>)}</ul>
              <Button className={`w-full ${p.featured ? 'bg-primary text-white' : 'bg-white/5 text-[#fafafa] border border-white/10'}`} asChild><Link href="/console/store">Get Started</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
