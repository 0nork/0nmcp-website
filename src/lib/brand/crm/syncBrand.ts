import { getContrastTextColor } from '../utils/colorContrast'
import type { OnBrandFile } from '@/types/brand'

export async function syncBrandToCRM(
  subLocationId: string,
  brandJson: OnBrandFile
): Promise<{ success: boolean; error?: string }> {
  const payload: Record<string, string | undefined> = {
    businessName: brandJson.business.name,
    phone: brandJson.business.phone,
    website: brandJson.metadata?.source_url,
    logoUrl: brandJson.identity.logos.primary.url,
    faviconUrl: brandJson.identity.logos.icon.url,
    primaryColor: brandJson.identity.colors.primary,
    secondaryColor: brandJson.identity.colors.secondary,
    buttonColor: brandJson.identity.colors.accent,
    buttonTextColor: getContrastTextColor(brandJson.identity.colors.accent),
    calendarUrl: brandJson.business.booking_url,
    description: brandJson.business.description?.substring(0, 160),
  }

  // Remove undefined/empty values — CRM API rejects them
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined && v !== '')
  )

  const res = await fetch(
    `${process.env.CRM_BASE_URL}/locations/${subLocationId}/settings`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': process.env.CRM_API_VERSION ?? '2021-07-28',
      },
      body: JSON.stringify(cleanPayload),
    }
  )

  if (!res.ok) {
    const error = await res.text()
    return { success: false, error: `CRM API ${res.status}: ${error}` }
  }

  return { success: true }
}
