import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'

export type Service = (typeof servicesData.services)[number]
export type Category = (typeof servicesData.categories)[number]
export type Capability = (typeof capabilitiesData.capabilities)[number]

/** Map of service id -> service object for O(1) lookups */
const serviceById = new Map<string, Service>()
servicesData.services.forEach((s) => serviceById.set(s.id, s))

/** Map of service slug -> service object for O(1) lookups */
const serviceBySlug = new Map<string, Service>()
servicesData.services.forEach((s) => serviceBySlug.set(s.slug, s))

/** Map of capability slug -> capability object for O(1) lookups */
const capBySlug = new Map<string, Capability>()
capabilitiesData.capabilities.forEach((c) => capBySlug.set(c.slug, c))

/** Map of category id -> category object */
const categoryById = new Map<string, Category>()
servicesData.categories.forEach((c) => categoryById.set(c.id, c))

/** Get a service by its id (e.g. "gmail", "stripe") */
export function getServiceById(id: string): Service | undefined {
  return serviceById.get(id)
}

/** Get a service by its slug (e.g. "google-calendar", "x-twitter") */
export function getServiceBySlug(slug: string): Service | undefined {
  return serviceBySlug.get(slug)
}

/** Get a capability by its slug */
export function getCapabilityBySlug(slug: string): Capability | undefined {
  return capBySlug.get(slug)
}

/** Get a category by its id */
export function getCategoryById(id: string): Category | undefined {
  return categoryById.get(id)
}

/** Safely get the action_service string from a capability (some bursts have action_services array instead) */
export function getActionServiceId(cap: Capability): string | undefined {
  if ('action_service' in cap && typeof cap.action_service === 'string') {
    return cap.action_service
  }
  return undefined
}

/** Get all capabilities that involve a given service (as trigger or action) */
export function getCapabilitiesForService(serviceId: string): Capability[] {
  return capabilitiesData.capabilities.filter(
    (c) => c.trigger_service === serviceId || getActionServiceId(c) === serviceId
  )
}

/** Get all capabilities sharing a trigger_service (excluding a given capability slug) */
export function getRelatedByTrigger(
  triggerServiceId: string,
  excludeSlug: string,
  limit = 6
): Capability[] {
  return capabilitiesData.capabilities
    .filter((c) => c.trigger_service === triggerServiceId && c.slug !== excludeSlug)
    .slice(0, limit)
}

/** Get all capabilities sharing an action_service (excluding a given capability slug) */
export function getRelatedByAction(
  actionServiceId: string,
  excludeSlug: string,
  limit = 6
): Capability[] {
  return capabilitiesData.capabilities
    .filter((c) => getActionServiceId(c) === actionServiceId && c.slug !== excludeSlug)
    .slice(0, limit)
}

/** Get services in a given category, sorted by display_order */
export function getServicesInCategory(categoryId: string): Service[] {
  return servicesData.services
    .filter((s) => s.category_id === categoryId)
    .sort((a, b) => a.display_order - b.display_order)
}

/** Get all categories sorted by display_order */
export function getAllCategories(): Category[] {
  return [...servicesData.categories].sort(
    (a, b) => a.display_order - b.display_order
  )
}

/** Get all services */
export function getAllServices(): Service[] {
  return servicesData.services
}

/** Get all capabilities */
export function getAllCapabilities(): Capability[] {
  return capabilitiesData.capabilities
}

/** Check if a slug belongs to a service */
export function isServiceSlug(slug: string): boolean {
  return serviceBySlug.has(slug)
}

/** Check if a slug belongs to a capability */
export function isCapabilitySlug(slug: string): boolean {
  return capBySlug.has(slug)
}
