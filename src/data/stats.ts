/**
 * 0nMCP — Centralized Stats
 * Single source of truth for all platform numbers.
 * Every page on the site imports from here.
 * When a new service is added, update services.json meta — these propagate everywhere.
 */

import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'

// ─── LIVE STATS (from JSON meta — always up to date) ─────────────
export const STATS = {
  tools: servicesData.meta.total_tools,
  services: servicesData.meta.total_services,
  capabilities: capabilitiesData.meta.total_capabilities,
  categories: servicesData.meta.categories,

  // Breakdown
  catalog_tools: servicesData.meta.catalog_tools,
  crm_tools: servicesData.meta.crm_module_tools,
  vault_tools: servicesData.meta.vault_tools,
  vault_container_tools: servicesData.meta.vault_container_tools,
  deed_tools: servicesData.meta.deed_tools,
  engine_tools: servicesData.meta.engine_tools,
  app_tools: servicesData.meta.app_tools,
} as const

// ─── FORMATTED (with commas for display) ─────────────────────────
export const STATS_DISPLAY = {
  tools: STATS.tools.toLocaleString(),
  services: STATS.services.toLocaleString(),
  capabilities: STATS.capabilities.toLocaleString(),
  categories: STATS.categories.toLocaleString(),
} as const

// ─── HERO STATS ARRAY (for stat grids) ───────────────────────────
export const HERO_STATS = [
  { value: STATS.tools, label: 'Tools' },
  { value: STATS.services, label: 'Services' },
  { value: STATS.capabilities, label: 'Capabilities' },
  { value: STATS.categories, label: 'Categories' },
] as const
