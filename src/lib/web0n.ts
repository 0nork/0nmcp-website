/**
 * web0n.com — CRM Integration + Business Logic Helpers
 * Handles contact creation, opportunities, invoices, and brief generation
 */

import { upsertContact, createOpportunity, updateOpportunity, addContactTags, createLocation, addContactNote } from './crm'
import type { CrmContact, CrmOpportunity } from './crm'
import type { SupabaseClient } from '@supabase/supabase-js'
import { runAutoBuild } from './autobuild'

const PIPELINE_ID = process.env.WEB0N_CRM_PIPELINE_ID || ''
const DEPOSIT_AMOUNT = 998.50
const TOTAL_PRICE = 1997

// CRM API base for direct invoice calls
const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

function getCrmHeaders(): Record<string, string> {
  const key = process.env.CRM_API_KEY
  if (!key) throw new Error('CRM API key not configured')
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Version': API_VERSION,
  }
}

// ==================== TYPES ====================

export interface Web0nProjectData {
  businessName: string
  businessType?: string
  phone?: string
  email: string
  address?: string
  city?: string
  state?: string
  zip?: string
  websiteUrl?: string
  googlePlaceId?: string
  googleData?: Record<string, unknown>
  brandColors?: { primary: string; secondary: string; accent: string }
  logoUrl?: string
  tagline?: string
  services?: string[]
  specialRequests?: string
}

export interface Web0nProject extends Web0nProjectData {
  id: string
  userId: string
  status: string
  pages: string[]
  crmContactId?: string
  crmLocationId?: string
  crmOpportunityId?: string
  depositInvoiceId?: string
  finalInvoiceId?: string
  depositPaidAt?: string
  finalPaidAt?: string
  buildBrief?: Record<string, unknown>
  siteUrl?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

// ==================== CRM CONTACT ====================

export async function createWeb0nContact(data: Web0nProjectData): Promise<CrmContact> {
  // Split name into first/last if business name has spaces
  const nameParts = data.businessName.split(' ')
  const contact = await upsertContact({
    email: data.email,
    firstName: nameParts[0] || data.businessName,
    lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
    phone: data.phone,
    companyName: data.businessName,
    source: 'web0n',
    tags: ['web0n', 'website-client'],
  })

  // Add tags separately to ensure they're applied
  if (contact.id) {
    await addContactTags(contact.id, ['web0n', 'website-client'])
  }

  return contact
}

// ==================== CRM OPPORTUNITY ====================

// Stage types + IDs from CRM pipeline
const STAGE_ORDER = ['intake', 'deposit_paid', 'in_build', 'review', 'final_paid', 'launched'] as const
export type ProjectStage = typeof STAGE_ORDER[number]
const STAGE_IDS: Record<ProjectStage, string> = {
  intake: process.env.WEB0N_STAGE_DEPOSIT || '',
  deposit_paid: process.env.WEB0N_STAGE_DEPOSIT || '',
  in_build: process.env.WEB0N_STAGE_IN_BUILD || '',
  review: process.env.WEB0N_STAGE_REVIEW || '',
  final_paid: process.env.WEB0N_STAGE_FINAL || '',
  launched: process.env.WEB0N_STAGE_LAUNCHED || '',
}

export async function createWeb0nOpportunity(
  contactId: string,
  data: Web0nProjectData
): Promise<CrmOpportunity> {
  if (!PIPELINE_ID) {
    throw new Error('WEB0N_CRM_PIPELINE_ID not configured')
  }

  return createOpportunity({
    name: `web0n: ${data.businessName}`,
    pipelineId: PIPELINE_ID,
    pipelineStageId: STAGE_IDS.intake,
    contactId,
    monetaryValue: TOTAL_PRICE,
    status: 'open',
  })
}

// ==================== CRM INVOICES ====================

async function createCrmInvoice(params: {
  contactId: string
  name: string
  amount: number
  description: string
}): Promise<{ id: string; invoiceUrl?: string }> {
  const locationId = process.env.CRM_LOCATION_ID
  if (!locationId) throw new Error('CRM_LOCATION_ID not configured')

  const res = await fetch(`${API_BASE}/invoices/`, {
    method: 'POST',
    headers: getCrmHeaders(),
    body: JSON.stringify({
      altId: locationId,
      altType: 'location',
      name: params.name,
      contactId: params.contactId,
      currency: 'USD',
      items: [{
        name: params.description,
        amount: params.amount * 100, // cents
        qty: 1,
      }],
      termsNotes: 'Payment due upon receipt. Thank you for choosing web0n!',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`CRM Invoice create failed: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return {
    id: data.invoice?.id || data.id,
    invoiceUrl: data.invoice?.invoiceUrl || data.invoiceUrl,
  }
}

export async function createDepositInvoice(
  contactId: string,
  data: Web0nProjectData,
  customAmount?: number
): Promise<{ id: string; invoiceUrl?: string }> {
  const amount = customAmount ?? DEPOSIT_AMOUNT
  const desc = customAmount && customAmount < DEPOSIT_AMOUNT
    ? `web0n Website Build — Deposit (coupon applied, was $${DEPOSIT_AMOUNT.toFixed(2)})`
    : 'web0n Website Build — 50% Deposit (5-page professional website)'
  return createCrmInvoice({
    contactId,
    name: `web0n Deposit — ${data.businessName}`,
    amount,
    description: desc,
  })
}

export async function createFinalInvoice(
  contactId: string,
  data: Web0nProjectData
): Promise<{ id: string; invoiceUrl?: string }> {
  return createCrmInvoice({
    contactId,
    name: `web0n Final — ${data.businessName}`,
    amount: DEPOSIT_AMOUNT,
    description: 'web0n Website Build — Final Payment (50% balance before launch)',
  })
}

// ==================== PROJECT STAGE ====================

export async function updateProjectStage(
  opportunityId: string | undefined,
  stage: ProjectStage
): Promise<void> {
  if (!opportunityId) return

  const status = stage === 'launched' ? 'won' : 'open'
  const stageId = STAGE_IDS[stage]

  await updateOpportunity(opportunityId, {
    status,
    ...(stageId ? { pipelineStageId: stageId } : {}),
  })
}

// ==================== DEPOSIT-PAID AUTOMATION ====================

/**
 * Create a CRM sub-account (location) for a web0n client
 */
export async function createWeb0nSubAccount(data: Web0nProjectData): Promise<{ locationId: string }> {
  const companyId = process.env.CRM_COMPANY_ID
  if (!companyId) throw new Error('CRM_COMPANY_ID not configured')

  const location = await createLocation({
    companyId,
    name: data.businessName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    postalCode: data.zip,
    website: data.websiteUrl,
    timezone: 'America/New_York',
    country: 'US',
  })

  return { locationId: location.id }
}

/**
 * Full deposit-paid automation pipeline:
 * 1. Move opportunity to deposit_paid stage
 * 2. Create CRM sub-account for the client
 * 3. Update Supabase with the new location ID
 * 4. Add CRM note confirming deposit + sub-account
 */
export async function runDepositPaidAutomation(projectId: string, db: SupabaseClient): Promise<void> {
  // Fetch project
  const { data: project, error } = await db
    .from('web0n_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    console.error('[web0n] Deposit automation: project not found', projectId, error)
    return
  }

  // 1. Move opportunity to deposit_paid stage
  try {
    if (project.crm_opportunity_id) {
      await updateProjectStage(project.crm_opportunity_id, 'deposit_paid')
      console.log('[web0n] Opportunity moved to deposit_paid:', project.crm_opportunity_id)
    }
  } catch (err) {
    console.error('[web0n] Failed to move opportunity stage:', err)
  }

  // 2. Create CRM sub-account
  let locationId: string | undefined
  try {
    const result = await createWeb0nSubAccount({
      businessName: project.business_name,
      email: project.email,
      phone: project.phone,
      address: project.address,
      city: project.city,
      state: project.state,
      zip: project.zip,
      websiteUrl: project.website_url,
    })
    locationId = result.locationId
    console.log('[web0n] Sub-account created:', locationId, 'for', project.business_name)
  } catch (err) {
    console.error('[web0n] Failed to create sub-account:', err)
  }

  // 3. Update Supabase with location ID
  if (locationId) {
    try {
      await db
        .from('web0n_projects')
        .update({ crm_location_id: locationId })
        .eq('id', projectId)
    } catch (err) {
      console.error('[web0n] Failed to update project with location ID:', err)
    }
  }

  // 4. Add CRM note
  try {
    if (project.crm_contact_id) {
      const noteBody = locationId
        ? `Deposit received. Sub-account created: ${locationId}`
        : 'Deposit received. Sub-account creation pending.'
      await addContactNote(project.crm_contact_id, noteBody)
    }
  } catch (err) {
    console.error('[web0n] Failed to add CRM note:', err)
  }

  // 5. AutoBuild — generate website pages with AI + deploy to CRM funnel
  if (locationId) {
    try {
      // Use the agency key to deploy to the new location's funnel
      const agencyKey = process.env.CRM_AGENCY_KEY
      if (!agencyKey) {
        console.error('[web0n] Skipping autobuild: CRM_AGENCY_KEY not configured')
        return
      }

      console.log('[web0n] Starting AutoBuild for:', project.business_name)

      // Move opportunity to in_build stage
      if (project.crm_opportunity_id) {
        await updateProjectStage(project.crm_opportunity_id, 'in_build').catch(() => {})
      }
      await db.from('web0n_projects').update({ status: 'in_build' }).eq('id', projectId)

      const buildResult = await runAutoBuild({
        businessName: project.business_name,
        businessType: project.business_type,
        services: project.services,
        phone: project.phone,
        email: project.email,
        address: project.address,
        city: project.city,
        state: project.state,
        zip: project.zip,
        website: project.website_url,
        brandColor: project.brand_colors?.primary,
        tagline: project.tagline,
        googleData: project.google_data,
        locationId,
        locationApiKey: agencyKey,
      })

      if (buildResult.error) {
        console.error('[web0n] AutoBuild error:', buildResult.error)
        if (project.crm_contact_id) {
          await addContactNote(project.crm_contact_id, `AutoBuild error: ${buildResult.error}`).catch(() => {})
        }
        return
      }

      // Update project with funnel info
      await db.from('web0n_projects').update({
        status: 'review',
        site_url: buildResult.funnelUrl || null,
        build_brief: {
          funnelId: buildResult.funnelId,
          funnelUrl: buildResult.funnelUrl,
          pages: buildResult.pages,
          builtAt: new Date().toISOString(),
          engine: 'autobuild-cro9',
        },
      }).eq('id', projectId)

      // Move to review stage
      if (project.crm_opportunity_id) {
        await updateProjectStage(project.crm_opportunity_id, 'review').catch(() => {})
      }

      // Add build completion note
      if (project.crm_contact_id) {
        const pagesBuilt = buildResult.pages.map(p => p.name).join(', ')
        await addContactNote(
          project.crm_contact_id,
          `Website built! ${buildResult.pages.length} pages deployed: ${pagesBuilt}. Funnel: ${buildResult.funnelId || 'pending'}. URL: ${buildResult.funnelUrl || 'pending'}`
        ).catch(() => {})
      }

      console.log('[web0n] AutoBuild complete:', buildResult.funnelId, '→', buildResult.funnelUrl)
    } catch (err) {
      console.error('[web0n] AutoBuild failed (non-fatal):', err)
    }
  }
}

// ==================== BUILD BRIEF ====================

export function generateBuildBrief(project: Web0nProject): Record<string, unknown> {
  return {
    generatedAt: new Date().toISOString(),
    business: {
      name: project.businessName,
      type: project.businessType,
      phone: project.phone,
      email: project.email,
      address: [project.address, project.city, project.state, project.zip]
        .filter(Boolean)
        .join(', '),
      existingSite: project.websiteUrl,
    },
    brand: {
      colors: project.brandColors || { primary: '#1a1a2e', secondary: '#16213e', accent: '#0f3460' },
      logoUrl: project.logoUrl,
      tagline: project.tagline,
    },
    services: project.services || [],
    pages: project.pages || ['home', 'services', 'contact', 'booking', 'pricing'],
    specialRequests: project.specialRequests,
    googleData: project.googleData ? {
      rating: (project.googleData as Record<string, unknown>).rating,
      reviews: (project.googleData as Record<string, unknown>).userRatingsTotal,
      photos: (project.googleData as Record<string, unknown>).photos,
      openingHours: (project.googleData as Record<string, unknown>).openingHours,
    } : null,
    deliverables: {
      pages: ['Home', 'Services', 'Contact', 'Booking', 'Pricing'],
      features: [
        'Mobile-responsive design',
        'SEO-optimized content',
        'Contact form with CRM integration',
        'Online booking/scheduling',
        'Google Maps embed',
        'Social media links',
        'CRM sub-account with starter tier',
      ],
      platform: 'CRM AutoBuild',
    },
  }
}
