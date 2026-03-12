/**
 * web0n.com — CRM Integration + Business Logic Helpers
 * Handles contact creation, opportunities, invoices, and brief generation
 */

import { upsertContact, createOpportunity, updateOpportunity, addContactTags } from './crm'
import type { CrmContact, CrmOpportunity } from './crm'

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
