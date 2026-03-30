/**
 * LinkedIn API Client — Complete REST wrapper
 * Covers Profile, Social, Organization, Ads, Events, and Reporting
 *
 * Base URL: https://api.linkedin.com
 * Auth: Bearer token
 * LinkedIn REST API version: 202603
 */

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

export interface LinkedInApiError {
  status: number
  message: string
  serviceErrorCode?: number
}

export interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  headline?: string
  profileUrl?: string
  profilePhoto?: string
  vanityName?: string
  email?: string
}

export interface LinkedInEmail {
  emailAddress: string
}

export interface LinkedInConnection {
  id: string
  firstName: string
  lastName: string
  headline?: string
  profileUrl?: string
}

export interface LinkedInPost {
  id?: string
  author: string
  commentary: string
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN'
  distribution?: {
    feedDistribution: 'MAIN_FEED' | 'NONE'
    targetEntities?: { urn: string }[]
  }
  content?: {
    media?: { title: string; id: string }
    article?: { source: string; title: string; description: string; thumbnail?: string }
  }
  lifecycleState: 'PUBLISHED' | 'DRAFT'
}

export interface LinkedInComment {
  actor: string
  message: string
  parentComment?: string
}

export interface LinkedInOrg {
  id: string
  name: string
  vanityName?: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  industry?: string
  staffCount?: number
}

export interface OrgStats {
  followerCount: number
  pageViews: number
  uniqueVisitors: number
  dateRange?: { start: string; end: string }
}

export interface FollowerStats {
  organic: number
  paid: number
  total: number
  byFunction?: Record<string, number>
  bySeniority?: Record<string, number>
  byIndustry?: Record<string, number>
  byRegion?: Record<string, number>
}

export interface VisitorStats {
  pageViews: number
  uniqueVisitors: number
  byFunction?: Record<string, number>
  bySeniority?: Record<string, number>
}

export interface AdAccount {
  id: string
  name: string
  status: string
  currency: string
  type: string
  created: string
}

export interface Campaign {
  id: string
  account: string
  name: string
  status: string
  type: string
  objective?: string
  dailyBudget?: { amount: string; currencyCode: string }
  totalBudget?: { amount: string; currencyCode: string }
  targeting?: TargetingCriteria
  creativeSelection: string
  startDate?: string
  endDate?: string
  created: string
}

export interface Creative {
  id: string
  campaign: string
  status: string
  type: string
  headline?: string
  description?: string
  destinationUrl?: string
  callToAction?: string
  content: Record<string, unknown>
}

export interface AdAnalytics {
  impressions: number
  clicks: number
  spend: number
  conversions: number
  ctr: number
  cpm: number
  cpc: number
  engagementRate: number
  leads: number
  shares: number
  comments: number
  reactions: number
  dateRange?: { start: string; end: string }
  pivotValue?: string
}

export interface TargetingCriteria {
  include: { and: Record<string, unknown>[] }
  exclude?: { or: Record<string, unknown>[] }
}

export interface TargetingFacet {
  name: string
  entities: { urn: string; name: string }[]
}

export interface LeadFormResponse {
  id: string
  formId: string
  submittedAt: string
  answers: { question: string; answer: string }[]
}

export interface LinkedInEvent {
  id?: string
  name: string
  description?: string
  organizerUrn: string
  startAt: string
  endAt: string
  eventUrl?: string
  format: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  locale?: string
}

export interface EventAttendee {
  id: string
  firstName: string
  lastName: string
  headline?: string
  rsvpStatus: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'
}

export interface ConversionTracking {
  id: string
  name: string
  type: string
  attributionType: string
  conversionCount: number
  conversionValue: number
  dateRange?: { start: string; end: string }
}

export interface ImageUploadResult {
  uploadUrl: string
  imageUrn: string
}

/* ──────────────────────────────────────────────
   Client
   ────────────────────────────────────────────── */

const API_BASE = 'https://api.linkedin.com'
const REST_BASE = `${API_BASE}/rest`
const LI_VERSION = '202603'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export class LinkedInClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /* ── Internal fetch helper ── */

  private headers(contentType = 'application/json'): HeadersInit {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'LinkedIn-Version': LI_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': contentType,
    }
  }

  private async request<T>(
    path: string,
    options?: { method?: string; body?: unknown; base?: string; retries?: number }
  ): Promise<T> {
    const base = options?.base || REST_BASE
    const method = options?.method || 'GET'
    const retries = options?.retries ?? MAX_RETRIES

    const fetchOpts: RequestInit = {
      method,
      headers: this.headers(),
    }
    if (options?.body) {
      fetchOpts.body = JSON.stringify(options.body)
    }

    let lastError: LinkedInApiError | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`${base}${path}`, fetchOpts)

        // Rate limited — retry with backoff
        if (res.status === 429 && attempt < retries) {
          const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10)
          await this.sleep(retryAfter * 1000 || RETRY_DELAY_MS * (attempt + 1))
          continue
        }

        if (!res.ok) {
          let errBody = ''
          try { errBody = await res.text() } catch { /* ignore */ }
          lastError = {
            status: res.status,
            message: errBody || `HTTP ${res.status}`,
            serviceErrorCode: this.extractServiceErrorCode(errBody),
          }

          // Retry on server errors
          if (res.status >= 500 && attempt < retries) {
            await this.sleep(RETRY_DELAY_MS * (attempt + 1))
            continue
          }

          throw lastError
        }

        if (res.status === 204) return {} as T
        return (await res.json()) as T
      } catch (err) {
        if ((err as LinkedInApiError).status) throw err
        if (attempt === retries) throw { status: 0, message: String(err) }
        await this.sleep(RETRY_DELAY_MS * (attempt + 1))
      }
    }

    throw lastError || { status: 0, message: 'Max retries reached' }
  }

  private extractServiceErrorCode(body: string): number | undefined {
    try {
      const parsed = JSON.parse(body)
      return parsed.serviceErrorCode
    } catch {
      return undefined
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /* ════════════════════════════════════════════
     PROFILE
     ════════════════════════════════════════════ */

  async getProfile(): Promise<LinkedInProfile> {
    const raw = await this.request<Record<string, unknown>>('/me', {
      base: `${API_BASE}/v2`,
    })

    return {
      id: String(raw.id || ''),
      firstName: String(
        (raw.localizedFirstName as string) ||
        ((raw.firstName as Record<string, Record<string, unknown>>)?.localized as Record<string, unknown>)?.['en_US'] || ''
      ),
      lastName: String(
        (raw.localizedLastName as string) ||
        ((raw.lastName as Record<string, Record<string, unknown>>)?.localized as Record<string, unknown>)?.['en_US'] || ''
      ),
      headline: raw.localizedHeadline as string | undefined,
      vanityName: raw.vanityName as string | undefined,
      profileUrl: raw.vanityName
        ? `https://www.linkedin.com/in/${raw.vanityName}`
        : undefined,
      profilePhoto: this.extractProfilePhoto(raw),
    }
  }

  private extractProfilePhoto(raw: Record<string, unknown>): string | undefined {
    try {
      const pp = raw.profilePicture as Record<string, unknown> | undefined
      if (!pp) return undefined
      const di = pp['displayImage~'] as Record<string, unknown> | undefined
      if (!di) return undefined
      const elements = di.elements as Record<string, unknown>[] | undefined
      if (!elements?.length) return undefined
      const last = elements[elements.length - 1]
      const ids = last.identifiers as Record<string, unknown>[] | undefined
      return ids?.[0]?.identifier as string | undefined
    } catch {
      return undefined
    }
  }

  async getEmail(): Promise<LinkedInEmail> {
    const raw = await this.request<Record<string, unknown>>(
      '/emailAddress?q=members&projection=(elements*(handle~))',
      { base: `${API_BASE}/v2` }
    )

    const elements = (raw.elements as Record<string, unknown>[]) || []
    const first = elements[0] || {}
    const handle = (first['handle~'] as Record<string, unknown>) || {}
    return { emailAddress: String(handle.emailAddress || '') }
  }

  async getConnections(start = 0, count = 50): Promise<{
    connections: LinkedInConnection[]
    total: number
  }> {
    const raw = await this.request<Record<string, unknown>>(
      `/connections?q=viewer&start=${start}&count=${count}&projection=(elements*(to~(id,localizedFirstName,localizedLastName,localizedHeadline,vanityName)),paging)`,
      { base: `${API_BASE}/v2` }
    )

    const elements = (raw.elements as Record<string, unknown>[]) || []
    const paging = (raw.paging as Record<string, unknown>) || {}

    const connections: LinkedInConnection[] = elements.map(el => {
      const to = (el['to~'] as Record<string, unknown>) || {}
      return {
        id: String(to.id || ''),
        firstName: String(to.localizedFirstName || ''),
        lastName: String(to.localizedLastName || ''),
        headline: to.localizedHeadline as string | undefined,
        profileUrl: to.vanityName
          ? `https://www.linkedin.com/in/${to.vanityName}`
          : undefined,
      }
    })

    return {
      connections,
      total: Number(paging.total || connections.length),
    }
  }

  async getVerification(): Promise<{ verified: boolean; scopes: string[] }> {
    try {
      const raw = await this.request<Record<string, unknown>>(
        '/tokenIntrospection',
        {
          method: 'POST',
          body: { token: this.accessToken },
          base: `${API_BASE}/v2`,
        }
      )
      return {
        verified: Boolean(raw.active),
        scopes: String(raw.scope || '').split(' ').filter(Boolean),
      }
    } catch {
      // Fallback: if introspection fails, try a simple profile call
      try {
        await this.getProfile()
        return { verified: true, scopes: [] }
      } catch {
        return { verified: false, scopes: [] }
      }
    }
  }

  /* ════════════════════════════════════════════
     SOCIAL — Posts, Comments, Reactions
     ════════════════════════════════════════════ */

  async createPost(params: {
    authorUrn: string
    text: string
    visibility?: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN'
    mediaId?: string
    mediaTitle?: string
    articleUrl?: string
    articleTitle?: string
    articleDescription?: string
    articleThumbnail?: string
  }): Promise<{ id: string }> {
    const body: Record<string, unknown> = {
      author: params.authorUrn,
      commentary: params.text,
      visibility: params.visibility || 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
    }

    if (params.mediaId) {
      body.content = {
        media: {
          title: params.mediaTitle || 'Image',
          id: params.mediaId,
        },
      }
    } else if (params.articleUrl) {
      body.content = {
        article: {
          source: params.articleUrl,
          title: params.articleTitle || '',
          description: params.articleDescription || '',
          ...(params.articleThumbnail ? { thumbnail: params.articleThumbnail } : {}),
        },
      }
    }

    const res = await this.request<Record<string, unknown>>('/posts', {
      method: 'POST',
      body,
    })

    // LinkedIn returns the post URN in the x-restli-id header or the id field
    return { id: String(res.id || res.value || '') }
  }

  async deletePost(postUrn: string): Promise<void> {
    await this.request<void>(`/posts/${encodeURIComponent(postUrn)}`, {
      method: 'DELETE',
    })
  }

  async addComment(postUrn: string, params: {
    actorUrn: string
    message: string
    parentCommentUrn?: string
  }): Promise<{ id: string }> {
    const body: Record<string, unknown> = {
      actor: params.actorUrn,
      message: { text: params.message },
      object: postUrn,
    }
    if (params.parentCommentUrn) {
      body.parentComment = params.parentCommentUrn
    }

    const res = await this.request<Record<string, unknown>>(
      `/socialActions/${encodeURIComponent(postUrn)}/comments`,
      { method: 'POST', body }
    )

    return { id: String(res.id || '') }
  }

  async likePost(postUrn: string, actorUrn: string): Promise<void> {
    await this.request<void>(
      `/socialActions/${encodeURIComponent(postUrn)}/likes`,
      {
        method: 'POST',
        body: { actor: actorUrn, object: postUrn },
      }
    )
  }

  async uploadImage(ownerUrn: string, imageData: ArrayBuffer, filename?: string): Promise<ImageUploadResult> {
    // Step 1: Register upload
    const registerBody = {
      initializeUploadRequest: {
        owner: ownerUrn,
      },
    }

    const registerRes = await this.request<Record<string, unknown>>('/images?action=initializeUpload', {
      method: 'POST',
      body: registerBody,
    })

    const uploadValue = registerRes.value as Record<string, unknown> || {}
    const uploadUrl = String(uploadValue.uploadUrl || '')
    const imageUrn = String(uploadValue.image || '')

    if (!uploadUrl) {
      throw { status: 0, message: 'Failed to get upload URL from LinkedIn' }
    }

    // Step 2: Upload binary
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream',
        ...(filename ? { 'Content-Disposition': `attachment; filename="${filename}"` } : {}),
      },
      body: imageData,
    })

    if (!uploadRes.ok) {
      throw { status: uploadRes.status, message: 'Image upload failed' }
    }

    return { uploadUrl, imageUrn }
  }

  /* ════════════════════════════════════════════
     ORGANIZATION
     ════════════════════════════════════════════ */

  async getOrg(orgId: string): Promise<LinkedInOrg> {
    const raw = await this.request<Record<string, unknown>>(
      `/organizations/${orgId}?projection=(id,localizedName,vanityName,localizedDescription,logoV2,websiteUrl,staffCount)`
    )

    return {
      id: String(raw.id || orgId),
      name: String(raw.localizedName || ''),
      vanityName: raw.vanityName as string | undefined,
      description: raw.localizedDescription as string | undefined,
      logoUrl: this.extractOrgLogo(raw),
      websiteUrl: raw.websiteUrl as string | undefined,
      staffCount: raw.staffCount as number | undefined,
    }
  }

  private extractOrgLogo(raw: Record<string, unknown>): string | undefined {
    try {
      const logo = raw.logoV2 as Record<string, unknown> | undefined
      if (!logo) return undefined
      const original = logo.original as Record<string, unknown> | undefined
      if (!original) return undefined
      const cropped = logo['cropped~'] as Record<string, unknown> | undefined
      const target = cropped || original
      const elements = (target as Record<string, unknown>)?.elements as Record<string, unknown>[] | undefined
      if (!elements?.length) return undefined
      const ids = elements[0].identifiers as Record<string, unknown>[] | undefined
      return ids?.[0]?.identifier as string | undefined
    } catch {
      return undefined
    }
  }

  async listAdminOrgs(): Promise<LinkedInOrg[]> {
    const raw = await this.request<Record<string, unknown>>(
      '/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget))',
      { base: `${API_BASE}/v2` }
    )

    const elements = (raw.elements as Record<string, unknown>[]) || []
    const orgIds: string[] = []

    for (const el of elements) {
      const target = String(el.organizationalTarget || '')
      // Extract org ID from URN like urn:li:organization:12345
      const match = target.match(/urn:li:organization:(\d+)/)
      if (match) orgIds.push(match[1])
    }

    // Fetch each org's details
    const orgs: LinkedInOrg[] = []
    for (const orgId of orgIds) {
      try {
        const org = await this.getOrg(orgId)
        orgs.push(org)
      } catch {
        orgs.push({ id: orgId, name: `Organization ${orgId}` })
      }
    }

    return orgs
  }

  async getOrgStats(orgId: string, params?: {
    startDate?: string
    endDate?: string
    timeGranularity?: 'DAY' | 'MONTH'
  }): Promise<OrgStats> {
    const startDate = params?.startDate || this.daysAgo(30)
    const endDate = params?.endDate || this.today()
    const granularity = params?.timeGranularity || 'DAY'

    const [startY, startM, startD] = startDate.split('-').map(Number)
    const [endY, endM, endD] = endDate.split('-').map(Number)

    const raw = await this.request<Record<string, unknown>>(
      `/organizationPageStatistics?q=organization&organization=urn:li:organization:${orgId}` +
      `&timeIntervals.timeGranularityType=${granularity}` +
      `&timeIntervals.timeRange.start.year=${startY}&timeIntervals.timeRange.start.month=${startM}&timeIntervals.timeRange.start.day=${startD}` +
      `&timeIntervals.timeRange.end.year=${endY}&timeIntervals.timeRange.end.month=${endM}&timeIntervals.timeRange.end.day=${endD}`
    )

    const elements = (raw.elements as Record<string, unknown>[]) || []
    let totalViews = 0
    let totalVisitors = 0

    for (const el of elements) {
      const stats = el.totalPageStatistics as Record<string, unknown> | undefined
      if (stats) {
        const views = stats.views as Record<string, unknown> | undefined
        totalViews += Number(views?.allPageViews || 0)
        totalVisitors += Number(views?.allUniquePageViews || 0)
      }
    }

    // Get follower count
    let followerCount = 0
    try {
      const followerRaw = await this.request<Record<string, unknown>>(
        `/networkSizes/urn:li:organization:${orgId}?edgeType=CompanyFollowedByMember`
      )
      followerCount = Number(followerRaw.firstDegreeSize || 0)
    } catch { /* fallback */ }

    return {
      followerCount,
      pageViews: totalViews,
      uniqueVisitors: totalVisitors,
      dateRange: { start: startDate, end: endDate },
    }
  }

  async getFollowerStats(orgId: string): Promise<FollowerStats> {
    const raw = await this.request<Record<string, unknown>>(
      `/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${orgId}`
    )

    const elements = (raw.elements as Record<string, unknown>[]) || []
    const first = elements[0] || {}
    const followerCounts = first.followerCounts as Record<string, unknown> || {}

    const organic = Number(followerCounts.organicFollowerCount || 0)
    const paid = Number(followerCounts.paidFollowerCount || 0)

    // Parse breakdown demographics
    const byFunction = this.parseBreakdown(first.followerCountsByFunction as Record<string, unknown>[] | undefined)
    const bySeniority = this.parseBreakdown(first.followerCountsBySeniority as Record<string, unknown>[] | undefined)
    const byIndustry = this.parseBreakdown(first.followerCountsByIndustry as Record<string, unknown>[] | undefined)
    const byRegion = this.parseBreakdown(first.followerCountsByRegion as Record<string, unknown>[] | undefined)

    return {
      organic,
      paid,
      total: organic + paid,
      byFunction,
      bySeniority,
      byIndustry,
      byRegion,
    }
  }

  private parseBreakdown(items?: Record<string, unknown>[]): Record<string, number> | undefined {
    if (!items?.length) return undefined
    const result: Record<string, number> = {}
    for (const item of items) {
      const key = String(item.name || item.function || item.seniority || item.industry || item.region || item.geo || 'unknown')
      const organic = Number((item.followerCounts as Record<string, unknown>)?.organicFollowerCount || 0)
      const paid = Number((item.followerCounts as Record<string, unknown>)?.paidFollowerCount || 0)
      result[key] = organic + paid
    }
    return result
  }

  async getVisitorStats(orgId: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<VisitorStats> {
    const startDate = params?.startDate || this.daysAgo(30)
    const endDate = params?.endDate || this.today()

    const [startY, startM, startD] = startDate.split('-').map(Number)
    const [endY, endM, endD] = endDate.split('-').map(Number)

    const raw = await this.request<Record<string, unknown>>(
      `/organizationPageStatistics?q=organization&organization=urn:li:organization:${orgId}` +
      `&timeIntervals.timeGranularityType=DAY` +
      `&timeIntervals.timeRange.start.year=${startY}&timeIntervals.timeRange.start.month=${startM}&timeIntervals.timeRange.start.day=${startD}` +
      `&timeIntervals.timeRange.end.year=${endY}&timeIntervals.timeRange.end.month=${endM}&timeIntervals.timeRange.end.day=${endD}`
    )

    const elements = (raw.elements as Record<string, unknown>[]) || []
    let totalViews = 0
    let totalVisitors = 0

    for (const el of elements) {
      const stats = el.totalPageStatistics as Record<string, unknown> | undefined
      if (stats) {
        const views = stats.views as Record<string, unknown> | undefined
        totalViews += Number(views?.allPageViews || 0)
        totalVisitors += Number(views?.allUniquePageViews || 0)
      }
    }

    return { pageViews: totalViews, uniqueVisitors: totalVisitors }
  }

  /* ════════════════════════════════════════════
     ADS — Accounts, Campaigns, Creatives, Analytics
     ════════════════════════════════════════════ */

  async listAdAccounts(): Promise<AdAccount[]> {
    const data = await this.request<{ elements: Record<string, unknown>[] }>(
      '/adAccounts?q=search&search=(type:(values:List(BUSINESS,ENTERPRISE)))&count=100'
    )

    return (data.elements || []).map(raw => ({
      id: String(raw.id || ''),
      name: String(raw.name || ''),
      status: String(raw.status || 'DRAFT'),
      currency: String(raw.currency || 'USD'),
      type: String(raw.type || 'BUSINESS'),
      created: String((raw.changeAuditStamps as Record<string, Record<string, unknown>> | undefined)?.created?.time || ''),
    }))
  }

  async createCampaign(accountId: string, params: {
    name: string
    type?: string
    status?: string
    objective?: string
    dailyBudget?: { amount: string; currencyCode: string }
    totalBudget?: { amount: string; currencyCode: string }
    campaignGroupId?: string
    targeting?: TargetingCriteria
    startDate?: string
    endDate?: string
  }): Promise<Campaign> {
    const body: Record<string, unknown> = {
      account: `urn:li:sponsoredAccount:${accountId}`,
      name: params.name,
      type: params.type || 'SPONSORED_UPDATES',
      status: params.status || 'DRAFT',
      objectiveType: params.objective || 'BRAND_AWARENESS',
      costType: 'CPM',
      creativeSelection: 'OPTIMIZED',
    }

    if (params.dailyBudget) body.dailyBudget = params.dailyBudget
    if (params.totalBudget) body.totalBudget = params.totalBudget
    if (params.campaignGroupId) body.campaignGroup = `urn:li:sponsoredCampaignGroup:${params.campaignGroupId}`
    if (params.targeting) body.targeting = params.targeting

    if (params.startDate) {
      const [y, m, d] = params.startDate.split('-').map(Number)
      body.runSchedule = { ...(body.runSchedule as Record<string, unknown> || {}), start: { year: y, month: m, day: d } }
    }
    if (params.endDate) {
      const [y, m, d] = params.endDate.split('-').map(Number)
      body.runSchedule = { ...(body.runSchedule as Record<string, unknown> || {}), end: { year: y, month: m, day: d } }
    }

    const result = await this.request<Record<string, unknown>>('/adCampaigns', {
      method: 'POST',
      body,
    })

    return this.mapCampaign(result, accountId)
  }

  async listCampaigns(accountId: string, params?: {
    status?: string[]
    count?: number
  }): Promise<Campaign[]> {
    let path = `/adCampaigns?q=search&search=(account:(values:List(urn:li:sponsoredAccount:${accountId})))`
    if (params?.status?.length) {
      path += `&search=(status:(values:List(${params.status.join(',')})))`
    }
    path += `&count=${params?.count || 100}`

    const data = await this.request<{ elements: Record<string, unknown>[] }>(path)
    return (data.elements || []).map(raw => this.mapCampaign(raw, accountId))
  }

  async updateCampaign(campaignId: string, params: {
    name?: string
    status?: string
    dailyBudget?: { amount: string; currencyCode: string }
    totalBudget?: { amount: string; currencyCode: string }
  }): Promise<void> {
    const body: Record<string, unknown> = {}
    if (params.name) body.name = params.name
    if (params.status) body.status = params.status
    if (params.dailyBudget) body.dailyBudget = params.dailyBudget
    if (params.totalBudget) body.totalBudget = params.totalBudget

    await this.request(`/adCampaigns/${campaignId}`, {
      method: 'PATCH',
      body: { patch: { $set: body } },
    })
  }

  async createCreative(campaignId: string, params: {
    type?: string
    headline?: string
    description?: string
    destinationUrl?: string
    callToAction?: string
    imageUrn?: string
    postUrn?: string
  }): Promise<Creative> {
    const body: Record<string, unknown> = {
      campaign: `urn:li:sponsoredCampaign:${campaignId}`,
      status: 'DRAFT',
      type: params.type || 'SPONSORED_STATUS_UPDATE',
    }

    if (params.postUrn) {
      body.reference = params.postUrn
    } else {
      const content: Record<string, unknown> = {}
      if (params.headline) content.title = params.headline
      if (params.description) content.description = { text: params.description }
      if (params.destinationUrl) content.landingPage = params.destinationUrl
      if (params.callToAction) content.callToAction = { labelType: params.callToAction }
      if (params.imageUrn) content.media = params.imageUrn
      body.content = content
    }

    const result = await this.request<Record<string, unknown>>('/adCreatives', {
      method: 'POST',
      body,
    })

    return {
      id: String(result.id || ''),
      campaign: campaignId,
      status: String(result.status || 'DRAFT'),
      type: String(result.type || params.type || 'SPONSORED_STATUS_UPDATE'),
      headline: params.headline,
      description: params.description,
      destinationUrl: params.destinationUrl,
      callToAction: params.callToAction,
      content: (result.content || {}) as Record<string, unknown>,
    }
  }

  async getAnalytics(params: {
    accountId: string
    pivot: 'CAMPAIGN' | 'CREATIVE' | 'ACCOUNT' | 'COMPANY'
    timeGranularity: 'DAILY' | 'MONTHLY' | 'ALL'
    startDate: string
    endDate: string
    campaignIds?: string[]
  }): Promise<AdAnalytics[]> {
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

    const data = await this.request<{ elements: Record<string, unknown>[] }>(path)

    return (data.elements || []).map(raw => {
      const impressions = Number(raw.impressions || 0)
      const clicks = Number(raw.clicks || 0)
      const spend = Number(raw.costInLocalCurrency || 0)
      const conversions = Number(raw.externalWebsiteConversions || 0)
      const shares = Number(raw.shares || 0)
      const comments = Number(raw.comments || 0)
      const reactions = Number(raw.reactions || 0)
      const leads = Number(raw.oneClickLeads || raw.leadGenerationMailContactInfoShares || 0)
      const totalEngagements = clicks + shares + comments + reactions

      return {
        impressions,
        clicks,
        spend,
        conversions,
        ctr: impressions > 0 ? clicks / impressions : 0,
        cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        engagementRate: impressions > 0 ? totalEngagements / impressions : 0,
        leads,
        shares,
        comments,
        reactions,
        dateRange: raw.dateRange as AdAnalytics['dateRange'],
        pivotValue: String(raw.pivotValue || ''),
      }
    })
  }

  async getTargetingFacets(): Promise<TargetingFacet[]> {
    const data = await this.request<{ elements: Record<string, unknown>[] }>(
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

  async getLeadFormResponses(accountId: string, formId: string, params?: {
    start?: number
    count?: number
  }): Promise<LeadFormResponse[]> {
    const start = params?.start || 0
    const count = params?.count || 100

    const data = await this.request<{ elements: Record<string, unknown>[] }>(
      `/adFormResponses?q=account&account=urn:li:sponsoredAccount:${accountId}` +
      `&leadType(leadGenFormId:${formId})` +
      `&start=${start}&count=${count}`
    )

    return (data.elements || []).map(raw => ({
      id: String(raw.id || ''),
      formId,
      submittedAt: String(raw.submittedAt || ''),
      answers: Array.isArray(raw.answers)
        ? raw.answers.map((a: Record<string, unknown>) => ({
            question: String(a.questionId || a.predefinedField || ''),
            answer: String(a.answerDetails || a.freeTextAnswer || ''),
          }))
        : [],
    }))
  }

  /* ════════════════════════════════════════════
     EVENTS
     ════════════════════════════════════════════ */

  async createEvent(params: {
    organizerUrn: string
    name: string
    description?: string
    startAt: string
    endAt: string
    eventUrl?: string
    format?: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  }): Promise<LinkedInEvent> {
    const body: Record<string, unknown> = {
      organizer: params.organizerUrn,
      name: { localized: { en_US: params.name }, preferredLocale: { language: 'en', country: 'US' } },
      eventStartAt: new Date(params.startAt).getTime(),
      eventEndAt: new Date(params.endAt).getTime(),
      eventFormat: params.format || 'ONLINE',
    }

    if (params.description) {
      body.description = { localized: { en_US: params.description }, preferredLocale: { language: 'en', country: 'US' } }
    }
    if (params.eventUrl) {
      body.eventUrl = params.eventUrl
    }

    const result = await this.request<Record<string, unknown>>('/events', {
      method: 'POST',
      body,
    })

    return {
      id: String(result.id || ''),
      name: params.name,
      description: params.description,
      organizerUrn: params.organizerUrn,
      startAt: params.startAt,
      endAt: params.endAt,
      eventUrl: params.eventUrl,
      format: params.format || 'ONLINE',
    }
  }

  async getEvent(eventId: string): Promise<LinkedInEvent> {
    const raw = await this.request<Record<string, unknown>>(`/events/${eventId}`)

    return {
      id: String(raw.id || eventId),
      name: this.extractLocalized(raw.name as Record<string, unknown>) || '',
      description: this.extractLocalized(raw.description as Record<string, unknown>),
      organizerUrn: String(raw.organizer || ''),
      startAt: raw.eventStartAt ? new Date(Number(raw.eventStartAt)).toISOString() : '',
      endAt: raw.eventEndAt ? new Date(Number(raw.eventEndAt)).toISOString() : '',
      eventUrl: raw.eventUrl as string | undefined,
      format: (raw.eventFormat as LinkedInEvent['format']) || 'ONLINE',
    }
  }

  async updateEvent(eventId: string, params: {
    name?: string
    description?: string
    startAt?: string
    endAt?: string
    eventUrl?: string
    format?: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  }): Promise<void> {
    const body: Record<string, unknown> = {}

    if (params.name) {
      body.name = { localized: { en_US: params.name }, preferredLocale: { language: 'en', country: 'US' } }
    }
    if (params.description) {
      body.description = { localized: { en_US: params.description }, preferredLocale: { language: 'en', country: 'US' } }
    }
    if (params.startAt) body.eventStartAt = new Date(params.startAt).getTime()
    if (params.endAt) body.eventEndAt = new Date(params.endAt).getTime()
    if (params.eventUrl) body.eventUrl = params.eventUrl
    if (params.format) body.eventFormat = params.format

    await this.request(`/events/${eventId}`, {
      method: 'PATCH',
      body: { patch: { $set: body } },
    })
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.request<void>(`/events/${eventId}`, { method: 'DELETE' })
  }

  async listAttendees(eventId: string, params?: {
    start?: number
    count?: number
  }): Promise<EventAttendee[]> {
    const start = params?.start || 0
    const count = params?.count || 100

    const data = await this.request<{ elements: Record<string, unknown>[] }>(
      `/eventAttendees?q=event&event=urn:li:event:${eventId}&start=${start}&count=${count}`
    )

    return (data.elements || []).map(raw => {
      const attendee = raw.attendee as Record<string, unknown> || {}
      return {
        id: String(attendee.id || raw.id || ''),
        firstName: String(attendee.localizedFirstName || ''),
        lastName: String(attendee.localizedLastName || ''),
        headline: attendee.localizedHeadline as string | undefined,
        rsvpStatus: (raw.rsvpStatus as EventAttendee['rsvpStatus']) || 'ATTENDING',
      }
    })
  }

  /* ════════════════════════════════════════════
     REPORTING — Higher-level aggregations
     ════════════════════════════════════════════ */

  async getCampaignPerformance(accountId: string, campaignId: string, params?: {
    startDate?: string
    endDate?: string
    timeGranularity?: 'DAILY' | 'MONTHLY' | 'ALL'
  }): Promise<AdAnalytics[]> {
    return this.getAnalytics({
      accountId,
      pivot: 'CAMPAIGN',
      timeGranularity: params?.timeGranularity || 'DAILY',
      startDate: params?.startDate || this.daysAgo(30),
      endDate: params?.endDate || this.today(),
      campaignIds: [campaignId],
    })
  }

  async getAccountPerformance(accountId: string, params?: {
    startDate?: string
    endDate?: string
    timeGranularity?: 'DAILY' | 'MONTHLY' | 'ALL'
  }): Promise<AdAnalytics[]> {
    return this.getAnalytics({
      accountId,
      pivot: 'ACCOUNT',
      timeGranularity: params?.timeGranularity || 'DAILY',
      startDate: params?.startDate || this.daysAgo(30),
      endDate: params?.endDate || this.today(),
    })
  }

  async getConversionTracking(accountId: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<ConversionTracking[]> {
    const startDate = params?.startDate || this.daysAgo(30)
    const endDate = params?.endDate || this.today()

    // Get conversion rules for the account
    const rulesData = await this.request<{ elements: Record<string, unknown>[] }>(
      `/conversions?q=account&account=urn:li:sponsoredAccount:${accountId}&count=100`
    )

    const conversions: ConversionTracking[] = []

    for (const rule of (rulesData.elements || [])) {
      const ruleId = String(rule.id || '')
      const name = String(rule.name || 'Unnamed')
      const type = String(rule.type || 'OTHER')
      const attributionType = String(rule.attributionType || 'LAST_TOUCH')

      // Get analytics for this conversion
      let conversionCount = 0
      let conversionValue = 0

      try {
        const analyticsData = await this.getAnalytics({
          accountId,
          pivot: 'CAMPAIGN',
          timeGranularity: 'ALL',
          startDate,
          endDate,
        })

        for (const a of analyticsData) {
          conversionCount += a.conversions
          conversionValue += a.spend // approximate
        }
      } catch { /* skip analytics if not available */ }

      conversions.push({
        id: ruleId,
        name,
        type,
        attributionType,
        conversionCount,
        conversionValue,
        dateRange: { start: startDate, end: endDate },
      })
    }

    return conversions
  }

  /* ── Helpers ── */

  private mapCampaign(raw: Record<string, unknown>, accountId: string): Campaign {
    const runSchedule = raw.runSchedule as Record<string, unknown> | undefined
    const startObj = runSchedule?.start as Record<string, number> | undefined
    const endObj = runSchedule?.end as Record<string, number> | undefined

    return {
      id: String(raw.id || ''),
      account: accountId,
      name: String(raw.name || ''),
      status: String(raw.status || 'DRAFT'),
      type: String(raw.type || 'SPONSORED_UPDATES'),
      objective: raw.objectiveType as string | undefined,
      dailyBudget: raw.dailyBudget as Campaign['dailyBudget'],
      totalBudget: raw.totalBudget as Campaign['totalBudget'],
      targeting: raw.targeting as Campaign['targeting'],
      creativeSelection: String(raw.creativeSelection || 'OPTIMIZED'),
      startDate: startObj ? `${startObj.year}-${String(startObj.month).padStart(2, '0')}-${String(startObj.day).padStart(2, '0')}` : undefined,
      endDate: endObj ? `${endObj.year}-${String(endObj.month).padStart(2, '0')}-${String(endObj.day).padStart(2, '0')}` : undefined,
      created: String((raw.changeAuditStamps as Record<string, Record<string, unknown>> | undefined)?.created?.time || ''),
    }
  }

  private extractLocalized(obj: Record<string, unknown> | undefined | null): string | undefined {
    if (!obj) return undefined
    const localized = obj.localized as Record<string, string> | undefined
    if (!localized) return String(obj)
    return localized.en_US || Object.values(localized)[0] || undefined
  }

  private today(): string {
    return new Date().toISOString().split('T')[0]
  }

  private daysAgo(n: number): string {
    return new Date(Date.now() - n * 86400000).toISOString().split('T')[0]
  }
}
