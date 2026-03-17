/**
 * LinkedIn Advertising API — REST wrappers
 * Uses LinkedIn Marketing API v202603
 */

import type {
  AdAccount, Campaign, CampaignGroup, Creative,
  AdAnalytics, TargetingFacet, AudienceCount,
  TargetingCriteria, ConversionEvent,
} from './types'

const API_BASE = 'https://api.linkedin.com/rest'
const LI_VERSION = '202603'

function linkedinAdsHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'LinkedIn-Version': LI_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
  }
}

async function liRequest<T>(
  accessToken: string,
  path: string,
  options?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options?.method || 'GET',
    headers: linkedinAdsHeaders(accessToken),
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn Ads API ${res.status}: ${err}`)
  }

  if (res.status === 204) return {} as T
  return res.json()
}

/* ── Ad Accounts ── */

export async function getAdAccounts(accessToken: string): Promise<AdAccount[]> {
  const data = await liRequest<{ elements: Record<string, unknown>[] }>(
    accessToken,
    '/adAccounts?q=search&search=(type:(values:List(BUSINESS,ENTERPRISE)))&count=100'
  )

  return (data.elements || []).map(mapAdAccount)
}

function mapAdAccount(raw: Record<string, unknown>): AdAccount {
  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    status: (raw.status as AdAccount['status']) || 'DRAFT',
    currency: String(raw.currency || 'USD'),
    type: (raw.type as AdAccount['type']) || 'BUSINESS',
    created: String(raw.created || ''),
  }
}

/* ── Campaign Groups ── */

export async function getCampaignGroups(
  accessToken: string,
  accountId: string
): Promise<CampaignGroup[]> {
  const data = await liRequest<{ elements: Record<string, unknown>[] }>(
    accessToken,
    `/adCampaignGroups?q=search&search=(account:(values:List(urn:li:sponsoredAccount:${accountId})))&count=100`
  )

  return (data.elements || []).map(raw => ({
    id: String(raw.id || ''),
    account: accountId,
    name: String(raw.name || ''),
    status: (raw.status as CampaignGroup['status']) || 'DRAFT',
    totalBudget: raw.totalBudget as CampaignGroup['totalBudget'],
  }))
}

/* ── Campaigns ── */

export async function getCampaigns(
  accessToken: string,
  accountId: string
): Promise<Campaign[]> {
  const data = await liRequest<{ elements: Record<string, unknown>[] }>(
    accessToken,
    `/adCampaigns?q=search&search=(account:(values:List(urn:li:sponsoredAccount:${accountId})))&count=100`
  )

  return (data.elements || []).map(raw => mapCampaign(raw, accountId))
}

export async function getCampaign(
  accessToken: string,
  accountId: string,
  campaignId: string
): Promise<Campaign> {
  const raw = await liRequest<Record<string, unknown>>(
    accessToken,
    `/adCampaigns/${campaignId}`
  )

  return mapCampaign(raw, accountId)
}

function mapCampaign(raw: Record<string, unknown>, accountId: string): Campaign {
  return {
    id: String(raw.id || ''),
    account: accountId,
    name: String(raw.name || ''),
    status: (raw.status as Campaign['status']) || 'DRAFT',
    type: (raw.type as Campaign['type']) || 'SPONSORED_UPDATES',
    dailyBudget: raw.dailyBudget as Campaign['dailyBudget'],
    totalBudget: raw.totalBudget as Campaign['totalBudget'],
    targeting: raw.targeting as Campaign['targeting'],
    creativeSelection: (raw.creativeSelection as Campaign['creativeSelection']) || 'OPTIMIZED',
    created: String((raw.changeAuditStamps as Record<string, Record<string, unknown>> | undefined)?.created?.time || ''),
  }
}

export async function createCampaign(
  accessToken: string,
  accountId: string,
  data: {
    name: string
    type?: Campaign['type']
    status?: Campaign['status']
    dailyBudget?: { amount: string; currencyCode: string }
    totalBudget?: { amount: string; currencyCode: string }
    campaignGroupId?: string
    targeting?: TargetingCriteria
  }
): Promise<Campaign> {
  const body: Record<string, unknown> = {
    account: `urn:li:sponsoredAccount:${accountId}`,
    name: data.name,
    type: data.type || 'SPONSORED_UPDATES',
    status: data.status || 'DRAFT',
    creativeSelection: 'OPTIMIZED',
    objectiveType: 'BRAND_AWARENESS',
    costType: 'CPM',
  }

  if (data.dailyBudget) body.dailyBudget = data.dailyBudget
  if (data.totalBudget) body.totalBudget = data.totalBudget
  if (data.campaignGroupId) body.campaignGroup = `urn:li:sponsoredCampaignGroup:${data.campaignGroupId}`
  if (data.targeting) body.targeting = data.targeting

  const result = await liRequest<Record<string, unknown>>(
    accessToken,
    '/adCampaigns',
    { method: 'POST', body }
  )

  return mapCampaign(result, accountId)
}

export async function updateCampaign(
  accessToken: string,
  accountId: string,
  campaignId: string,
  data: Partial<Pick<Campaign, 'name' | 'status' | 'dailyBudget' | 'totalBudget'>>
): Promise<void> {
  const body: Record<string, unknown> = {}
  if (data.name) body.name = data.name
  if (data.status) body.status = data.status
  if (data.dailyBudget) body.dailyBudget = data.dailyBudget
  if (data.totalBudget) body.totalBudget = data.totalBudget

  await liRequest(
    accessToken,
    `/adCampaigns/${campaignId}`,
    { method: 'PATCH', body: { patch: { $set: body } } }
  )
}

/* ── Creatives ── */

export async function getCreatives(
  accessToken: string,
  accountId: string,
  campaignId?: string
): Promise<Creative[]> {
  let path = `/adCreatives?q=search&search=(account:(values:List(urn:li:sponsoredAccount:${accountId})))`
  if (campaignId) {
    path = `/adCreatives?q=search&search=(campaign:(values:List(urn:li:sponsoredCampaign:${campaignId})))`
  }

  const data = await liRequest<{ elements: Record<string, unknown>[] }>(
    accessToken,
    `${path}&count=100`
  )

  return (data.elements || []).map(raw => ({
    id: String(raw.id || ''),
    campaign: String(raw.campaign || ''),
    status: (raw.status as Creative['status']) || 'DRAFT',
    type: (raw.type as Creative['type']) || 'SPONSORED_STATUS_UPDATE',
    content: (raw.content || {}) as Record<string, unknown>,
  }))
}

/* ── Analytics ── */

export async function getAnalytics(
  accessToken: string,
  params: {
    accountId: string
    pivot: 'CAMPAIGN' | 'CREATIVE' | 'ACCOUNT' | 'COMPANY'
    timeGranularity: 'DAILY' | 'MONTHLY' | 'ALL'
    startDate: string // YYYY-MM-DD
    endDate: string   // YYYY-MM-DD
    campaignIds?: string[]
  }
): Promise<AdAnalytics[]> {
  const { accountId, pivot, timeGranularity, startDate, endDate, campaignIds } = params

  const [startY, startM, startD] = startDate.split('-').map(Number)
  const [endY, endM, endD] = endDate.split('-').map(Number)

  let path = `/adAnalytics?q=analytics`
    + `&pivot=${pivot}`
    + `&timeGranularity=${timeGranularity}`
    + `&dateRange=(start:(year:${startY},month:${startM},day:${startD}),end:(year:${endY},month:${endM},day:${endD}))`
    + `&accounts=List(urn:li:sponsoredAccount:${accountId})`

  if (campaignIds?.length) {
    path += `&campaigns=List(${campaignIds.map(id => `urn:li:sponsoredCampaign:${id}`).join(',')})`
  }

  const data = await liRequest<{ elements: Record<string, unknown>[] }>(accessToken, path)

  return (data.elements || []).map(raw => ({
    impressions: Number(raw.impressions || 0),
    clicks: Number(raw.clicks || 0),
    costInLocalCurrency: Number(raw.costInLocalCurrency || 0),
    conversions: Number(raw.externalWebsiteConversions || 0),
    ctr: Number(raw.clicks || 0) / Math.max(Number(raw.impressions || 1), 1),
    cpm: (Number(raw.costInLocalCurrency || 0) / Math.max(Number(raw.impressions || 1), 1)) * 1000,
    cpc: Number(raw.costInLocalCurrency || 0) / Math.max(Number(raw.clicks || 1), 1),
    spend: Number(raw.costInLocalCurrency || 0),
    dateRange: raw.dateRange as AdAnalytics['dateRange'],
    pivot: pivot,
    pivotValue: String(raw.pivotValue || ''),
  }))
}

/* ── Audience Count ── */

export async function getAudienceCount(
  accessToken: string,
  targetingCriteria: TargetingCriteria
): Promise<AudienceCount> {
  const data = await liRequest<Record<string, unknown>>(
    accessToken,
    '/audienceCounts',
    { method: 'POST', body: { targetingCriteria } }
  )

  return {
    targetingCriteria,
    estimatedSize: Number(data.total || 0),
    estimatedMin: Number(data.min || 0),
    estimatedMax: Number(data.max || 0),
  }
}

/* ── Targeting Facets ── */

export async function getTargetingFacets(accessToken: string): Promise<TargetingFacet[]> {
  const data = await liRequest<{ elements: Record<string, unknown>[] }>(
    accessToken,
    '/adTargetingFacets?q=ALL'
  )

  return (data.elements || []).map(raw => ({
    name: String(raw.name || ''),
    entities: Array.isArray(raw.entities)
      ? raw.entities.map((e: Record<string, unknown>) => ({
          urn: String(e.urn || ''),
          name: String(e.name || ''),
        }))
      : [],
  }))
}

/* ── Conversion Events ── */

export async function streamConversionEvent(
  accessToken: string,
  data: ConversionEvent
): Promise<void> {
  await liRequest(
    accessToken,
    '/conversionEvents',
    { method: 'POST', body: data }
  )
}
