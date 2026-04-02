/**
 * 0nMCP — Centralized Stats
 * Single source of truth for all platform numbers.
 * Every page on the site imports from here.
 * When a new service is added, update services.json meta — these propagate everywhere.
 *
 * UPDATE HERE WHEN:
 * - New patent filed → increment patents
 * - New service added → update services.json meta (auto-propagates)
 * - New AI platform supported → increment ai_platforms
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

  // Platform constants
  patents: 5,
  ai_platforms: 7,
  license: 'MIT',
  local_cost: '$0',
  execution_cost: '$0.01',
  version: 'v2.9.1',
} as const

// ─── FORMATTED (with commas for display) ─────────────────────────
export const STATS_DISPLAY = {
  tools: STATS.tools.toLocaleString(),
  services: STATS.services.toLocaleString(),
  capabilities: STATS.capabilities.toLocaleString(),
  categories: STATS.categories.toLocaleString(),
  patents: String(STATS.patents),
  ai_platforms: `${STATS.ai_platforms}+`,
  license: STATS.license,
  local_cost: STATS.local_cost,
  version: STATS.version,
} as const

// ─── HERO STATS ARRAY (for stat grids) ───────────────────────────
export const HERO_STATS = [
  { value: STATS.tools, label: 'Tools' },
  { value: STATS.services, label: 'Services' },
  { value: STATS.capabilities, label: 'Capabilities' },
  { value: STATS.categories, label: 'Categories' },
] as const

// ─── FULL STATS BAR (for footer / compare / landing pages) ───────
export const STATS_BAR = [
  { value: STATS_DISPLAY.tools, label: 'TOOLS' },
  { value: STATS_DISPLAY.services, label: 'SERVICES' },
  { value: STATS_DISPLAY.categories, label: 'CATEGORIES' },
  { value: STATS.local_cost, label: 'LOCAL USE' },
  { value: STATS.license, label: 'LICENSED' },
  { value: STATS_DISPLAY.ai_platforms, label: 'AI PLATFORMS' },
  { value: STATS_DISPLAY.patents, label: 'PATENTS PENDING' },
] as const
