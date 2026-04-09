'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Check, Building2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  domain?: string
  brand: { primary: string; background: string; accent: string }
  status: string
}

interface LocationSwitcherProps {
  onSwitch?: (location: Location) => void
}

export function LocationSwitcher({ onSwitch }: LocationSwitcherProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [activeId, setActiveId] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/console/locations')
      .then(r => r.json())
      .then(data => {
        setLocations(data.locations || [])
        setActiveId(data.activeId || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const active = locations.find(l => l.id === activeId) || locations[0]

  const handleSwitch = useCallback(async (loc: Location) => {
    setActiveId(loc.id)
    setOpen(false)

    // Persist selection
    await fetch('/api/console/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId: loc.id }),
    })

    // Apply brand colors
    const root = document.documentElement
    root.style.setProperty('--primary', loc.brand.primary)
    root.style.setProperty('--accent', loc.brand.primary)
    root.style.setProperty('--ring', loc.brand.primary)
    root.style.setProperty('--sidebar-primary', loc.brand.primary)
    root.style.setProperty('--sidebar-accent', `${loc.brand.primary}1a`)

    onSwitch?.(loc)
  }, [onSwitch])

  if (loading || locations.length <= 1) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="h-9 gap-2 text-[#fafafa] hover:bg-white/5 px-3"
      >
        <div className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold" style={{ background: `${active?.brand.primary}20`, color: active?.brand.primary }}>
          {active?.name?.charAt(0) || '0'}
        </div>
        <span className="text-xs font-medium max-w-[120px] truncate hidden md:inline">{active?.name || 'Select Location'}</span>
        <ChevronDown className="w-3 h-3 text-[#b4b4b4]" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#273142] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b4b4b4] px-2">Sub-Locations</p>
            </div>
            <div className="p-1 max-h-64 overflow-y-auto">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => handleSwitch(loc)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${loc.id === activeId ? 'bg-white/5' : 'hover:bg-white/5'}`}
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: `${loc.brand.primary}20`, color: loc.brand.primary }}>
                    {loc.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#fafafa] truncate">{loc.name}</div>
                    {loc.domain && <div className="text-[9px] text-[#b4b4b4]">{loc.domain}</div>}
                  </div>
                  {loc.id === activeId && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
