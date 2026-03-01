'use client'

import { useState, useEffect, useMemo } from 'react'
import { getAllCategories, getAllServices, getServicesInCategory } from '@/lib/sxo-helpers'
import type { Service } from '@/lib/sxo-helpers'
import ServicePaletteItem from './ServicePaletteItem'

// SVG data URI helper for logic/control flow nodes
const svg = (paths: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`)}`

const SERVICE_LOGOS: Record<string, string> = {
  // ─── Real brand logos ───────────────────────────────────────
  stripe: 'https://cdn.simpleicons.org/stripe/635BFF',
  slack: 'https://cdn.simpleicons.org/slack/4A154B',
  discord: 'https://cdn.simpleicons.org/discord/5865F2',
  github: 'https://cdn.simpleicons.org/github/white',
  gmail: 'https://cdn.simpleicons.org/gmail/EA4335',
  google_sheets: 'https://cdn.simpleicons.org/googlesheets/34A853',
  google_drive: 'https://cdn.simpleicons.org/googledrive/4285F4',
  google_calendar: 'https://cdn.simpleicons.org/googlecalendar/4285F4',
  notion: 'https://cdn.simpleicons.org/notion/white',
  airtable: 'https://cdn.simpleicons.org/airtable/18BFFF',
  shopify: 'https://cdn.simpleicons.org/shopify/7AB55C',
  twilio: 'https://cdn.simpleicons.org/twilio/F22F46',
  sendgrid: 'https://cdn.simpleicons.org/sendgrid/1A82E2',
  resend: 'https://cdn.simpleicons.org/resend/white',
  jira: 'https://cdn.simpleicons.org/jira/0052CC',
  hubspot: 'https://cdn.simpleicons.org/hubspot/FF7A59',
  zendesk: 'https://cdn.simpleicons.org/zendesk/03363D',
  mailchimp: 'https://cdn.simpleicons.org/mailchimp/FFE01B',
  zoom: 'https://cdn.simpleicons.org/zoom/0B5CFF',
  linear: 'https://cdn.simpleicons.org/linear/5E6AD2',
  mongodb: 'https://cdn.simpleicons.org/mongodb/47A248',
  openai: 'https://cdn.simpleicons.org/openai/white',
  anthropic: 'https://cdn.simpleicons.org/anthropic/white',
  supabase: 'https://cdn.simpleicons.org/supabase/3FCF8E',
  calendly: 'https://cdn.simpleicons.org/calendly/006BFF',
  microsoft: 'https://cdn.simpleicons.org/microsoft/white',
  crm: 'https://cdn.simpleicons.org/rocket/ff6b35',

  // ─── Logic / Control Flow nodes (SVG data URIs) ─────────────
  delay: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', '%23f59e0b'),
  schedule: svg('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', '%234285F4'),
  condition: svg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', '%2322d3ee'),
  loop: svg('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>', '%23a855f7'),
  transform: svg('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>', '%2310b981'),
  trigger: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', '%23f97316'),
  error_handling: svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', '%23ef4444'),
}

export default function ServicePalette() {
  const [search, setSearch] = useState('')
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['active', 'logic', 'everyday']))
  const [activeServiceIds, setActiveServiceIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem('0n-vault')
      if (raw) {
        const vault = JSON.parse(raw)
        setActiveServiceIds(new Set(Object.keys(vault)))
      }
    } catch {}
  }, [])

  const categories = useMemo(() => getAllCategories(), [])
  const allServices = useMemo(() => getAllServices(), [])

  const activeServices = useMemo(() => {
    if (activeServiceIds.size === 0) return []
    return allServices.filter((s) => activeServiceIds.has(s.id))
  }, [allServices, activeServiceIds])

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim()

    // Build filtered active services
    let filteredActive = activeServices
    if (q) {
      filteredActive = activeServices.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tools?.some((t) => t.name.toLowerCase().includes(q))
      )
    }

    // Build filtered regular categories
    const regularCategories = categories.map((cat) => {
      const services = getServicesInCategory(cat.id)
      if (!q) return { ...cat, services }
      const filtered = services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tools?.some((t) => t.name.toLowerCase().includes(q))
      )
      return { ...cat, services: filtered }
    }).filter((cat) => cat.services.length > 0)

    // Prepend active category if it has services
    const result: Array<{ id: string; label: string; icon: string; services: Service[]; isActive?: boolean }> = []

    if (filteredActive.length > 0) {
      result.push({
        id: 'active',
        label: 'Active',
        icon: '\u26A1',
        services: filteredActive,
        isActive: true,
      })
    }

    for (const cat of regularCategories) {
      result.push({ ...cat, isActive: false })
    }

    return result
  }, [categories, activeServices, search])

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
                style={cat.isActive ? { color: 'var(--accent)' } : undefined}
              >
                <span className={`builder-category-chevron${isOpen ? ' open' : ''}`}>
                  &#9654;
                </span>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.isActive && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#3FCF8E',
                      marginLeft: 6,
                    }}
                  />
                )}
              </div>
              {isOpen && (
                <div className="builder-category-services">
                  {cat.services.map((service) => {
                    const serviceWithLogo = { ...service, logo: SERVICE_LOGOS[service.id] || '' }
                    return (
                      <ServicePaletteItem key={service.id} service={serviceWithLogo as Service} />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
