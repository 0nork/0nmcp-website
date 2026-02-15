'use client'

import { useState, useMemo } from 'react'
import { getAllCategories, getServicesInCategory } from '@/lib/sxo-helpers'
import ServicePaletteItem from './ServicePaletteItem'

export default function ServicePalette() {
  const [search, setSearch] = useState('')
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['everyday']))

  const categories = useMemo(() => getAllCategories(), [])

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim()
    return categories.map((cat) => {
      const services = getServicesInCategory(cat.id)
      if (!q) return { ...cat, services }
      const filtered = services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tools?.some((t) => t.name.toLowerCase().includes(q))
      )
      return { ...cat, services: filtered }
    }).filter((cat) => cat.services.length > 0)
  }, [categories, search])

  function toggleCategory(catId: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  return (
    <div className="builder-palette">
      <div className="builder-palette-header">
        <input
          className="builder-palette-search"
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="builder-palette-body">
        {filteredCategories.map((cat) => {
          const isOpen = openCategories.has(cat.id) || search.length > 0
          return (
            <div key={cat.id} className="builder-category">
              <div
                className="builder-category-header"
                onClick={() => toggleCategory(cat.id)}
              >
                <span className={`builder-category-chevron${isOpen ? ' open' : ''}`}>
                  &#9654;
                </span>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
              {isOpen && (
                <div className="builder-category-services">
                  {cat.services.map((service) => (
                    <ServicePaletteItem key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
