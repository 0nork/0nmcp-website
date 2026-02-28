'use client'

import { useState, useEffect, useMemo } from 'react'
import { getAllCategories, getAllServices, getServicesInCategory } from '@/lib/sxo-helpers'
import type { Service } from '@/lib/sxo-helpers'
import ServicePaletteItem from './ServicePaletteItem'

const SERVICE_LOGOS: Record<string, string> = {
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
