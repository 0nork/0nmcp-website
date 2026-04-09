'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Check, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Addon {
  id: string
  name: string
  slug: string
  description: string
  category: string
  icon: string
  color: string
  price_cents: number
  price_label: string
  features: string[]
  console_path: string
  chat_enabled: boolean
  workflow_enabled: boolean
}

const CATEGORY_ORDER = ['intelligence', 'automation', 'design', 'marketing', 'analytics', 'security', 'tools']

export default function StorePage() {
  const [addons, setAddons] = useState<Addon[]>([])
  const [installed, setInstalled] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [installing, setInstalling] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/addons/catalog').then(r => r.json()),
      fetch('/api/addons/installed').then(r => r.json()),
    ]).then(([catalog, inst]) => {
      setAddons(catalog.addons || [])
      setInstalled(new Set((inst.installed || []).map((i: { addon_id: string }) => i.addon_id)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleInstall(addonId: string) {
    setInstalling(addonId)
    const isInstalled = installed.has(addonId)

    if (isInstalled) {
      await fetch('/api/addons/install', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addon_id: addonId }),
      })
      setInstalled(prev => { const n = new Set(prev); n.delete(addonId); return n })
    } else {
      await fetch('/api/addons/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addon_id: addonId }),
      })
      setInstalled(prev => new Set(prev).add(addonId))
    }
    setInstalling(null)
  }

  const filtered = addons.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  const categories = CATEGORY_ORDER.filter(c => filtered.some(a => a.category === c))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#487fff] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] mb-1">Add0n Store</h1>
          <p className="text-sm text-[#b4b4b4]">{addons.length} add0ns available — {installed.size} installed</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b4b4b4]" />
          <Input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search add0ns..."
            className="pl-9 bg-[#273142] border-white/10 text-[#fafafa] placeholder:text-[#b4b4b4]"
          />
        </div>
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#b4b4b4] mb-3 capitalize">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.filter(a => a.category === cat).map(addon => {
              const isInst = installed.has(addon.id)
              return (
                <Card key={addon.id} className="bg-[#273142] border-white/10 hover:border-[#487fff]/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: `${addon.color}20`, color: addon.color }}>
                        {addon.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#fafafa]">{addon.name}</span>
                          <Badge className="bg-white/5 text-[#b4b4b4] border-0 text-[9px]">{addon.price_label}</Badge>
                        </div>
                        <p className="text-xs text-[#b4b4b4] mt-0.5 line-clamp-2">{addon.description}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {addon.features?.slice(0, 3).map(f => (
                        <Badge key={f} className="bg-white/5 text-[#b4b4b4] border-0 text-[9px]">{f}</Badge>
                      ))}
                      {(addon.features?.length || 0) > 3 && (
                        <Badge className="bg-white/5 text-[#b4b4b4] border-0 text-[9px]">+{addon.features.length - 3}</Badge>
                      )}
                    </div>

                    {/* Capabilities */}
                    <div className="flex items-center gap-2 mb-4 text-[10px] text-[#b4b4b4]">
                      {addon.chat_enabled && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#487fff]" />Chat</span>}
                      {addon.workflow_enabled && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />Workflows</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleInstall(addon.id)}
                        disabled={installing === addon.id}
                        className={isInst
                          ? 'bg-[#22D3A5]/15 text-[#22D3A5] border border-[#22D3A5]/30 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 flex-1'
                          : 'bg-[#487fff] text-white hover:bg-[#487fff]/80 flex-1'
                        }
                      >
                        {installing === addon.id ? 'Working...' : isInst ? (
                          <><Check className="w-3.5 h-3.5 mr-1" /> Installed</>
                        ) : (
                          <><Plus className="w-3.5 h-3.5 mr-1" /> Install</>
                        )}
                      </Button>
                      {isInst && addon.console_path && (
                        <Button size="sm" variant="outline" className="border-white/10 text-[#fafafa]" asChild>
                          <Link href={addon.console_path}><ExternalLink className="w-3.5 h-3.5" /></Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
