'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Star, Zap, ArrowRight, X } from 'lucide-react'

interface StoreProduct {
  id: string; name: string; slug: string; description: string; tagline: string
  category: string; icon: string; price_monthly: number; price_annual: number | null
  features: string[] | unknown; is_featured: boolean; display_order: number
}

const CATEGORY_LABELS: Record<string, string> = {
  package: 'Packages', listings: 'Listings', hosting: 'Hosting',
  communication: 'Communication', ai: 'AI', enterprise: 'Enterprise',
}

function getFeatures(product: StoreProduct): string[] {
  if (Array.isArray(product.features)) return product.features as string[]
  if (typeof product.features === 'string') {
    try { return JSON.parse(product.features) } catch { return [] }
  }
  return []
}

export default function StorePage() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [selected, setSelected] = useState<StoreProduct | null>(null)

  useEffect(() => {
    fetch('/api/store/products')
      .then(r => r.json())
      .then(data => {
        const prods = data.products || data.addons || []
        setProducts(prods.sort((a: StoreProduct, b: StoreProduct) => (a.display_order || 100) - (b.display_order || 100)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const categories = ['all', ...new Set(products.map(p => p.category))]
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter)
  const packages = filtered.filter(p => p.category === 'package')
  const alaCarte = filtered.filter(p => p.category !== 'package')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#fafafa] mb-2">0nMCP Store</h1>
        <p className="text-sm text-[#b4b4b4] max-w-lg mx-auto">
          Everything your business needs — listings, hosting, communication, and AI.
          Provisioned instantly through your CRM sub-location.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3 bg-[#273142] rounded-lg p-1 border border-white/10">
          <button onClick={() => setBilling('monthly')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-primary text-white' : 'text-[#b4b4b4]'}`}>Monthly</button>
          <button onClick={() => setBilling('annual')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billing === 'annual' ? 'bg-primary text-white' : 'text-[#b4b4b4]'}`}>
            Annual <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[9px] ml-1">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-[#273142] border border-white/10 flex-wrap h-auto p-1">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white capitalize">
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Packages */}
      {packages.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#b4b4b4] mb-3">Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map(pkg => {
              const price = billing === 'annual' && pkg.price_annual ? (pkg.price_annual / 12) : pkg.price_monthly
              const features = getFeatures(pkg)
              return (
                <Card key={pkg.id} className={`bg-[#273142] border transition-all duration-200 hover:translate-y-[-2px] cursor-pointer ${pkg.is_featured ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/10 hover:border-primary/30'}`} onClick={() => setSelected(pkg)}>
                  <CardContent className="p-6">
                    {pkg.is_featured && <Badge className="bg-primary/15 text-primary border-0 text-[9px] mb-3 gap-1"><Star className="w-3 h-3" /> Most Popular</Badge>}
                    <div className="text-2xl mb-1">{pkg.icon}</div>
                    <h3 className="text-lg font-bold text-[#fafafa] mb-1">{pkg.name}</h3>
                    <p className="text-xs text-[#b4b4b4] mb-4">{pkg.tagline}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-[#fafafa]">${Math.round(price)}</span>
                      <span className="text-sm text-[#b4b4b4]">/mo</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {features.slice(0, 6).map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-xs text-[#fafafa]"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{f}</li>
                      ))}
                    </ul>
                    <Button className={`w-full ${pkg.is_featured ? 'bg-primary text-white' : 'bg-white/5 text-[#fafafa] border border-white/10 hover:bg-white/10'}`}>
                      Get Started <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* À La Carte */}
      {alaCarte.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#b4b4b4] mb-3">{filter === 'all' ? 'À La Carte' : CATEGORY_LABELS[filter] || filter}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {alaCarte.map(product => {
              const price = billing === 'annual' && product.price_annual ? (product.price_annual / 12) : product.price_monthly
              return (
                <Card key={product.id} className="bg-[#273142] border-white/10 hover:border-primary/30 cursor-pointer transition-all duration-200 hover:translate-x-1 group" onClick={() => setSelected(product)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-2xl shrink-0">{product.icon}</div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-[#fafafa]">{product.name}</span>
                      <p className="text-[10px] text-[#b4b4b4] truncate">{product.tagline}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-[#fafafa]">${Math.round(price)}</div>
                      <div className="text-[9px] text-[#b4b4b4]">/mo</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#b4b4b4] shrink-0 group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <Card className="bg-[#273142] border-white/10"><CardContent className="p-12 text-center">
          <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#fafafa] mb-2">Store Loading</h3>
          <p className="text-sm text-[#b4b4b4]">Products will appear once the store API is configured.</p>
        </CardContent></Card>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative bg-[#273142] border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-2">{selected.icon}</div>
                  <h2 className="text-xl font-bold text-[#fafafa]">{selected.name}</h2>
                  <p className="text-xs text-[#b4b4b4] mt-1">{selected.tagline}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="text-[#b4b4b4] hover:text-[#fafafa]"><X className="w-4 h-4" /></Button>
              </div>

              <div className="rounded-lg bg-[#1a1a1a] p-4 text-center">
                <span className="text-4xl font-bold text-[#fafafa]">${billing === 'annual' && selected.price_annual ? Math.round(selected.price_annual / 12) : selected.price_monthly}</span>
                <span className="text-sm text-[#b4b4b4]">/mo</span>
                {billing === 'annual' && selected.price_annual && (
                  <p className="text-xs text-emerald-400 mt-1">${selected.price_annual}/year — save ${Math.round(selected.price_monthly * 12 - selected.price_annual)}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b4b4b4] mb-2">Features</p>
                <ul className="space-y-2">
                  {getFeatures(selected).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#fafafa]"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
              </div>

              <Button className="w-full bg-primary text-white hover:opacity-90 text-sm font-bold py-5">
                Subscribe — ${billing === 'annual' && selected.price_annual ? Math.round(selected.price_annual / 12) : selected.price_monthly}/mo
              </Button>

              <p className="text-[10px] text-[#b4b4b4] text-center">Cancel anytime. Provisioned instantly.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
