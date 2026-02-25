import { PageData } from './types'

/**
 * Google Search Console API integration.
 *
 * Uses OAuth2 with a refresh token to authenticate.
 * Required environment variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REFRESH_TOKEN
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SEARCH_CONSOLE_API =
  'https://searchconsole.googleapis.com/webmasters/v3'

/**
 * Get a fresh access token using the refresh token.
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.'
    )
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh Google access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Format a Date as YYYY-MM-DD for the Search Console API.
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Raw row from the Search Console API response.
 */
interface GSCRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

/**
 * Fetch search analytics data from Google Search Console.
 *
 * Queries for page + query dimensions, then aggregates by page
 * to get the top query per page and combined metrics.
 *
 * @param siteUrl - The site URL as registered in Search Console
 *                  (e.g., "https://0nmcp.com/" or "sc-domain:0nmcp.com")
 * @param days - Number of days to look back (default 28)
 * @returns Array of PageData, sorted by impressions descending
 */
export async function fetchSearchData(
  siteUrl: string,
  days: number = 28
): Promise<PageData[]> {
  const accessToken = await getAccessToken()

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  // Encode siteUrl for the API path
  const encodedSiteUrl = encodeURIComponent(siteUrl)

  const response = await fetch(
    `${SEARCH_CONSOLE_API}/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page', 'query'],
        rowLimit: 500,
        dimensionFilterGroups: [],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Search Console API error: ${error}`)
  }

  const data = await response.json()

  if (!data.rows || data.rows.length === 0) {
    return []
  }

  // Aggregate by page (combine all queries per page, keep top query)
  const pageMap = new Map<
    string,
    {
      url: string
      clicks: number
      impressions: number
      positionWeightedSum: number
      topQuery: string
      topQueryImpressions: number
    }
  >()

  for (const row of data.rows as GSCRow[]) {
    const pageUrl = row.keys[0]
    const query = row.keys[1]

    let entry = pageMap.get(pageUrl)
    if (!entry) {
      entry = {
        url: pageUrl,
        clicks: 0,
        impressions: 0,
        positionWeightedSum: 0,
        topQuery: '',
        topQueryImpressions: 0,
      }
      pageMap.set(pageUrl, entry)
    }

    entry.clicks += row.clicks
    entry.impressions += row.impressions
    entry.positionWeightedSum += row.position * row.impressions

    // Track top query by impressions
    if (row.impressions > entry.topQueryImpressions) {
      entry.topQuery = query
      entry.topQueryImpressions = row.impressions
    }
  }

  // Convert to PageData array
  const pages: PageData[] = []
  for (const entry of pageMap.values()) {
    const ctr =
      entry.impressions > 0 ? entry.clicks / entry.impressions : 0
    const position =
      entry.impressions > 0
        ? entry.positionWeightedSum / entry.impressions
        : 100

    pages.push({
      url: entry.url,
      query: entry.topQuery,
      impressions: entry.impressions,
      clicks: entry.clicks,
      ctr: Math.round(ctr * 10000) / 10000,
      position: Math.round(position * 100) / 100,
    })
  }

  // Sort by impressions descending
  pages.sort((a, b) => b.impressions - a.impressions)

  return pages
}
