/**
 * 0nVault Snapshot — Seeds a new location with everything it needs
 *
 * When a user creates a new location (or connects CRM), this deploys:
 * - Pipeline stages
 * - Tags
 * - Custom fields
 * - Vault data tables (business info, tracking, AI prefs)
 * - Completion tracking
 *
 * Also pulls existing data from CRM to auto-fill the vault.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

// ── Snapshot Template ──────────────────────────────────────────────

export const SNAPSHOT_TAGS = [
  'website-lead', 'facebook-lead', 'google-lead', 'instagram-lead',
  'booking-confirmed', 'booking-no-show', 'booking-completed',
  'vip-client', 'newsletter-signup', 'referral',
  'new-from-massagebook', 'cro9-suspect', 'win-back-target',
  'review-requested', 'review-left', 'birthday-month',
  '0ncore-connected', '0nmcp-connected',
]

export const SNAPSHOT_CUSTOM_FIELDS = [
  { name: 'Preferred Services', key: 'preferred_services', type: 'CHECKBOX' },
  { name: 'Preferred Time', key: 'preferred_time', type: 'SINGLE_OPTIONS' },
  { name: 'How Did You Hear About Us', key: 'how_heard', type: 'TEXT' },
  { name: 'Last Visit Date', key: 'last_visit_date', type: 'DATE' },
  { name: 'Lifetime Value', key: 'lifetime_value', type: 'MONETARY' },
  { name: 'CRO9 Lead Score', key: 'cro9_score', type: 'NUMERICAL' },
  { name: 'Booking Source', key: 'booking_source', type: 'TEXT' },
  { name: 'Birthday', key: 'birthday', type: 'DATE' },
]

export const SNAPSHOT_PIPELINE = {
  name: '0nCore Client Pipeline',
  stages: [
    { name: 'Inquired', position: 0 },
    { name: 'Consultation Booked', position: 1 },
    { name: 'Appointment Booked', position: 2 },
    { name: 'No Show', position: 3 },
    { name: 'Service Completed', position: 4 },
    { name: 'Review Requested', position: 5 },
    { name: 'Rebooking', position: 6 },
  ],
}

export const VAULT_FIELDS = [
  // Business info fields
  'business_name', 'phone', 'email', 'address', 'city', 'state', 'zip',
  'website', 'hours', 'timezone', 'industry', 'description', 'logo_url',
  'google_places_id', 'booking_url',
  // Social
  'social_facebook', 'social_instagram', 'social_linkedin', 'social_youtube',
  // Tracking
  'meta_pixel_id', 'ga4_measurement_id', 'google_ads_id',
  // Services (at least 1)
  'has_services',
  // AI
  'chat_personality', 'chat_welcome',
]

// ── Deploy Snapshot ────────────────────────────────────────────────

export async function deploySnapshot(locationId: string, crmPit: string, crmLocationId: string) {
  const db = supabase()
  const results: Record<string, unknown> = {}

  // 1. Deploy tags to CRM
  results.tags = await deployTags(crmPit, crmLocationId)

  // 2. Deploy custom fields to CRM
  results.customFields = await deployCustomFields(crmPit, crmLocationId)

  // 3. Create pipeline in CRM
  results.pipeline = await deployPipeline(crmPit, crmLocationId)

  // 4. Pull business info from CRM → Vault
  results.businessInfo = await pullCrmToVault(db, locationId, crmPit, crmLocationId)

  // 5. Initialize vault tables
  results.vaultInit = await initializeVault(db, locationId)

  // 6. Calculate initial completion
  results.completion = await calculateCompletion(db, locationId)

  return results
}

// ── CRM Tag Deployment ─────────────────────────────────────────────

async function deployTags(pit: string, locationId: string) {
  const created: string[] = []
  const failed: string[] = []

  for (const tag of SNAPSHOT_TAGS) {
    try {
      const res = await fetch(`${CRM_BASE}/locations/${locationId}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pit}`,
          'Content-Type': 'application/json',
          'Version': CRM_VERSION,
        },
        body: JSON.stringify({ name: tag }),
      })
      if (res.ok) created.push(tag)
      else failed.push(tag)
    } catch {
      failed.push(tag)
    }
  }

  return { created: created.length, failed: failed.length, tags: created }
}

// ── CRM Custom Fields ──────────────────────────────────────────────

async function deployCustomFields(pit: string, locationId: string) {
  const created: string[] = []

  for (const field of SNAPSHOT_CUSTOM_FIELDS) {
    try {
      await fetch(`${CRM_BASE}/locations/${locationId}/customFields`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pit}`,
          'Content-Type': 'application/json',
          'Version': CRM_VERSION,
        },
        body: JSON.stringify({
          name: field.name,
          fieldKey: `contact.${field.key}`,
          dataType: field.type,
          model: 'contact',
        }),
      })
      created.push(field.name)
    } catch {}
  }

  return { created: created.length }
}

// ── CRM Pipeline ───────────────────────────────────────────────────

async function deployPipeline(pit: string, locationId: string) {
  try {
    const res = await fetch(`${CRM_BASE}/opportunities/pipelines`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pit}`,
        'Content-Type': 'application/json',
        'Version': CRM_VERSION,
      },
      body: JSON.stringify({
        locationId,
        name: SNAPSHOT_PIPELINE.name,
        stages: SNAPSHOT_PIPELINE.stages,
      }),
    })
    const data = await res.json()
    return { success: res.ok, pipeline: data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// ── Pull CRM Location Data → Vault ────────────────────────────────

async function pullCrmToVault(db: ReturnType<typeof supabase>, locationId: string, pit: string, crmLocationId: string) {
  try {
    const res = await fetch(`${CRM_BASE}/locations/${crmLocationId}`, {
      headers: {
        'Authorization': `Bearer ${pit}`,
        'Version': CRM_VERSION,
      },
    })

    if (!res.ok) return { success: false }

    const { location } = await res.json()

    // Upsert vault_business_info
    const { error } = await db
      .from('vault_business_info')
      .upsert({
        location_id: locationId,
        business_name: location.name || null,
        phone: location.phone || null,
        email: location.email || null,
        address: location.address || null,
        city: location.city || null,
        state: location.state || null,
        zip: location.postalCode || null,
        website: location.website || null,
        timezone: location.timezone || 'America/New_York',
        social_links: {
          facebook: location.social?.facebookUrl || null,
          instagram: location.social?.instagram || null,
          linkedin: location.social?.linkedIn || null,
          youtube: location.social?.youtube || null,
        },
        google_places_id: location.social?.googlePlacesId || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'location_id' })

    return { success: !error, pulled: Object.keys(location).length }
  } catch {
    return { success: false }
  }
}

// ── Initialize Vault Tables ────────────────────────────────────────

async function initializeVault(db: ReturnType<typeof supabase>, locationId: string) {
  // Create AI preferences with defaults
  await db.from('vault_ai_preferences').upsert({
    location_id: locationId,
    chat_name: 'AI Assistant',
    chat_welcome: 'Hi! How can I help you today?',
    tone: 'friendly',
    response_length: 'concise',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'location_id' })

  // Create tracking placeholder
  await db.from('vault_tracking').upsert({
    location_id: locationId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'location_id' })

  return { success: true }
}

// ── Vault Completion Calculator ────────────────────────────────────

export async function calculateCompletion(db: ReturnType<typeof supabase>, locationId: string) {
  // Pull all vault data
  const { data: biz } = await db.from('vault_business_info').select('*').eq('location_id', locationId).single()
  const { data: tracking } = await db.from('vault_tracking').select('*').eq('location_id', locationId).single()
  const { data: ai } = await db.from('vault_ai_preferences').select('*').eq('location_id', locationId).single()
  const { data: services } = await db.from('vault_services').select('id').eq('location_id', locationId)

  const missing: string[] = []
  let filled = 0

  // Check business info
  const bizFields = ['business_name', 'phone', 'email', 'address', 'city', 'state', 'zip', 'website', 'hours', 'timezone', 'industry', 'description', 'google_places_id', 'booking_url']
  for (const field of bizFields) {
    if (biz?.[field]) filled++
    else missing.push(field)
  }

  // Check social
  const social = biz?.social_links as Record<string, string> | null
  if (social?.facebook) filled++; else missing.push('social_facebook')
  if (social?.instagram) filled++; else missing.push('social_instagram')

  // Check tracking
  if (tracking?.meta_pixel_id) filled++; else missing.push('meta_pixel_id')
  if (tracking?.ga4_measurement_id) filled++; else missing.push('ga4_measurement_id')
  if (tracking?.google_ads_id) filled++; else missing.push('google_ads_id')

  // Check services
  if (services && services.length > 0) filled++; else missing.push('has_services')

  // Check AI
  if (ai?.chat_personality) filled++; else missing.push('chat_personality')

  const total = bizFields.length + 2 + 3 + 1 + 1 // biz + social + tracking + services + AI
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0

  // Upsert completion
  await db.from('vault_completion').upsert({
    location_id: locationId,
    total_fields: total,
    filled_fields: filled,
    completion_pct: pct,
    missing_fields: missing,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'location_id' })

  return { total, filled, pct, missing }
}

// ── Progressive Collection Prompt ──────────────────────────────────

export async function getNextPromptField(locationId: string): Promise<{ field: string; question: string } | null> {
  const db = supabase()
  const { data } = await db.from('vault_completion').select('missing_fields, last_prompt_field').eq('location_id', locationId).single()

  if (!data?.missing_fields?.length) return null

  // Priority order for prompting
  const priority = [
    'business_name', 'phone', 'email', 'address', 'website', 'hours',
    'industry', 'description', 'booking_url', 'google_places_id',
    'meta_pixel_id', 'ga4_measurement_id', 'has_services', 'chat_personality',
  ]

  const missing = data.missing_fields as string[]
  const lastPrompted = data.last_prompt_field

  // Find the highest-priority missing field we haven't just asked about
  const next = priority.find(f => missing.includes(f) && f !== lastPrompted)
    || missing.find(f => f !== lastPrompted)
    || missing[0]

  if (!next) return null

  const questions: Record<string, string> = {
    business_name: "What's your business name?",
    phone: "What's your business phone number?",
    email: "What's your business email?",
    address: "What's your business address?",
    website: "What's your website URL?",
    hours: "What are your business hours? (e.g., Mon-Fri 9-5, Sat 10-2)",
    industry: "What industry is your business in?",
    description: "Give me a brief description of your business (1-2 sentences).",
    booking_url: "Do you have an online booking URL?",
    google_places_id: "What's your Google Places ID? (I can help find it if you share your Google Business listing URL)",
    meta_pixel_id: "Do you have a Facebook/Meta Pixel ID? (This powers your ad tracking)",
    ga4_measurement_id: "Do you have a Google Analytics 4 Measurement ID? (Starts with G-)",
    has_services: "What services do you offer? List them with prices if you have them.",
    chat_personality: "How should your AI assistant sound? (e.g., 'Friendly and warm' or 'Professional and concise')",
    social_facebook: "What's your Facebook page URL?",
    social_instagram: "What's your Instagram handle?",
  }

  // Mark as prompted
  await db.from('vault_completion').update({
    last_prompt_field: next,
    last_prompted_at: new Date().toISOString(),
  }).eq('location_id', locationId)

  return {
    field: next,
    question: questions[next] || `I notice your ${next.replace(/_/g, ' ')} is missing. Can you provide it?`,
  }
}
