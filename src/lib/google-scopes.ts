/**
 * Google OAuth Scopes & Service Mapping
 *
 * Maps Google OAuth scopes to 0nMCP services.
 * One consent screen → 17 services → ~200 tools unlocked.
 */

/** All scopes requested in the "Connect Google" flow */
export const GOOGLE_CONNECT_SCOPES = [
  // Identity (non-sensitive)
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',

  // Tier 1 — Non-sensitive (no Google review needed)
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/calendar.events.freebusy',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/indexing',

  // Tier 2 — Sensitive (needs Google verification)
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/content',
  'https://www.googleapis.com/auth/tagmanager.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/drive',
]

/** Maps scope URLs → which 0nMCP service keys they unlock */
export const SCOPE_SERVICE_MAP: Record<string, string[]> = {
  'https://www.googleapis.com/auth/gmail.send': ['gmail'],
  'https://www.googleapis.com/auth/gmail.readonly': ['gmail'],
  'https://www.googleapis.com/auth/gmail.labels': ['gmail'],
  'https://www.googleapis.com/auth/calendar.events.readonly': ['google_calendar'],
  'https://www.googleapis.com/auth/calendar.events': ['google_calendar'],
  'https://www.googleapis.com/auth/calendar.events.freebusy': ['google_calendar'],
  'https://www.googleapis.com/auth/spreadsheets': ['google_sheets'],
  'https://www.googleapis.com/auth/drive.file': ['google_drive'],
  'https://www.googleapis.com/auth/drive': ['google_drive', 'google_docs', 'google_slides'],
  'https://www.googleapis.com/auth/analytics.readonly': ['ga4'],
  'https://www.googleapis.com/auth/youtube.readonly': ['youtube'],
  'https://www.googleapis.com/auth/yt-analytics.readonly': ['youtube'],
  'https://www.googleapis.com/auth/tasks': ['google_tasks'],
  'https://www.googleapis.com/auth/business.manage': ['google_business'],
  'https://www.googleapis.com/auth/adwords': ['google_ads'],
  'https://www.googleapis.com/auth/content': ['merchant_center'],
  'https://www.googleapis.com/auth/tagmanager.readonly': ['tag_manager'],
  'https://www.googleapis.com/auth/webmasters.readonly': ['search_console'],
  'https://www.googleapis.com/auth/indexing': ['search_console'],
  'https://www.googleapis.com/auth/documents': ['google_docs'],
  'https://www.googleapis.com/auth/presentations': ['google_slides'],
  'https://www.googleapis.com/auth/forms.body.readonly': ['google_forms'],
  'https://www.googleapis.com/auth/forms.responses.readonly': ['google_forms'],
}

/** All Google services that can be unlocked, with display info */
export const GOOGLE_SERVICES_UNLOCKED = [
  { key: 'gmail', name: 'Gmail', icon: 'gmail', scopes: ['gmail.send', 'gmail.readonly', 'gmail.labels'] },
  { key: 'google_calendar', name: 'Google Calendar', icon: 'gcalendar', scopes: ['calendar.events', 'calendar.events.readonly'] },
  { key: 'google_sheets', name: 'Google Sheets', icon: 'gsheets', scopes: ['spreadsheets'] },
  { key: 'google_drive', name: 'Google Drive', icon: 'gdrive', scopes: ['drive', 'drive.file'] },
  { key: 'google_docs', name: 'Google Docs', icon: 'gdocs', scopes: ['documents'] },
  { key: 'google_slides', name: 'Google Slides', icon: 'gslides', scopes: ['presentations'] },
  { key: 'google_forms', name: 'Google Forms', icon: 'gforms', scopes: ['forms.body.readonly'] },
  { key: 'youtube', name: 'YouTube', icon: 'youtube', scopes: ['youtube.readonly', 'yt-analytics.readonly'] },
  { key: 'ga4', name: 'Google Analytics', icon: 'ga4', scopes: ['analytics.readonly'] },
  { key: 'google_ads', name: 'Google Ads', icon: 'google_ads', scopes: ['adwords'] },
  { key: 'google_tasks', name: 'Google Tasks', icon: 'gtasks', scopes: ['tasks'] },
  { key: 'google_business', name: 'Google Business', icon: 'gbusiness', scopes: ['business.manage'] },
  { key: 'search_console', name: 'Search Console', icon: 'gsearch', scopes: ['webmasters.readonly'] },
  { key: 'merchant_center', name: 'Merchant Center', icon: 'gmerchant', scopes: ['content'] },
  { key: 'tag_manager', name: 'Tag Manager', icon: 'gtm', scopes: ['tagmanager.readonly'] },
]

/** Derive which services were granted from a list of scope URLs */
export function getGrantedServices(grantedScopes: string[]): string[] {
  const services = new Set<string>()
  for (const scope of grantedScopes) {
    const mapped = SCOPE_SERVICE_MAP[scope]
    if (mapped) mapped.forEach(s => services.add(s))
  }
  return Array.from(services)
}
