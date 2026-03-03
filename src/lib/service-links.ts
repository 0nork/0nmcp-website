import { SVC } from '@/lib/console/services'

interface AdminServiceOverride {
  affiliate_url?: string | null
  custom_help_url?: string | null
  is_enabled?: boolean
}

let adminOverrides: Record<string, AdminServiceOverride> = {}
let loaded = false

/** Fetch admin service overrides (call once on mount) */
export async function loadAdminOverrides(): Promise<void> {
  if (loaded) return
  try {
    const res = await fetch('/api/admin/services')
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data)) {
      adminOverrides = {}
      for (const svc of data) {
        adminOverrides[svc.id] = {
          affiliate_url: svc.affiliate_url,
          custom_help_url: svc.custom_help_url,
          is_enabled: svc.is_enabled,
        }
      }
      loaded = true
    }
  } catch { /* silently fail */ }
}

/** Resolve the help/credential URL for a service */
export function resolveServiceLink(serviceId: string): string {
  const override = adminOverrides[serviceId]
  if (override?.affiliate_url) return override.affiliate_url
  if (override?.custom_help_url) return override.custom_help_url

  const svc = SVC[serviceId]
  if (svc?.f?.[0]?.lk) return svc.f[0].lk
  return '#'
}

/** Check if a service is enabled (default true if no override) */
export function isServiceEnabled(serviceId: string): boolean {
  const override = adminOverrides[serviceId]
  if (override && typeof override.is_enabled === 'boolean') return override.is_enabled
  return true
}

/** Get all admin overrides (for admin panel) */
export function getAdminOverrides(): Record<string, AdminServiceOverride> {
  return { ...adminOverrides }
}

/** Reset cache (for admin updates) */
export function resetAdminOverrides(): void {
  loaded = false
  adminOverrides = {}
}
