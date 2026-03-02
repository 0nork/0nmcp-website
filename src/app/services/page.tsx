import { Metadata } from 'next'
import { STATS } from '@/data/stats'
import servicesData from '@/data/services.json'
import { ServicesClient } from './ServicesClient'

export const metadata: Metadata = {
  title: `${STATS.services} Connected Services — ${STATS.tools} Tools | 0nMCP`,
  description: `Connect to ${STATS.services} services with ${STATS.tools} tools and ${STATS.capabilities} pre-built capabilities. One MCP server that connects to everything — Stripe, Gmail, Slack, CRM, AI, databases, and more.`,
  openGraph: {
    title: `${STATS.services} Services. ${STATS.tools} Tools. One MCP Server.`,
    description: `Stop switching between platforms. 0nMCP connects to ${STATS.services} services with ${STATS.tools} tools — build automations that were never possible before.`,
    type: 'website',
  },
  alternates: { canonical: 'https://0nmcp.com/services' },
}

export default function ServicesPage() {
  const categories = servicesData.categories
    .slice()
    .sort((a, b) => a.display_order - b.display_order)

  const services = servicesData.services

  // Build category->services map
  const categoryServices: Record<string, typeof services> = {}
  for (const cat of categories) {
    categoryServices[cat.id] = services
      .filter(s => s.category_id === cat.id)
      .sort((a, b) => a.display_order - b.display_order)
  }

  // Top services by tool count (for hero orbit)
  const topServices = services
    .slice()
    .sort((a, b) => b.tool_count - a.tool_count)
    .slice(0, 12)

  return (
    <ServicesClient
      categories={categories}
      categoryServices={categoryServices}
      topServices={topServices}
      allServices={services}
    />
  )
}
