/** Map logo keys to SVG filenames in /public/logos/ (without extension) */
const LOGO_REMAP: Record<string, string> = {
  rocket: 'rocketplus',
  twitter: 'x_twitter',
  microsoft: 'm365',
  gcalendar: 'gcal',
  gforms: 'google_forms',
  facebook_ads: 'fb_ads',
  linkedin_ads: 'linkedin',
  tiktok_ads: 'tiktok',
  x_ads: 'x_twitter',
  instagram_ads: 'instagram',
}

/** All SVG filenames available in /public/logos/ */
const AVAILABLE_LOGOS = new Set([
  'activecampaign','airtable','anthropic','asana','aws','azure','bigcommerce','brevo',
  'calendly','canva','clickup','cloudflare','cockroachdb','cohere','convertkit','crm',
  'deepgram','devto','discord','docusign','dropbox','elevenlabs','facebook','fb_ads',
  'figma','freshbooks','freshdesk','ga4','gamma','gbusiness','gcal','gcloud','gdocs','gdrive',
  'gemini','github','gmail','gmerchant','gohighlevel','google_ads','google_forms',
  'groq','gsearch','gsheets','gslides','gtasks','gtm','hubspot','instagram','intercom',
  'jira','jotform','lemlist','linear','linkedin','listkit','loom','m365','mailchimp',
  'mailgun','make','mcpfed','mistral','monday','mongodb','mulesoft','n8n','neon',
  'netlify','notion','openai','outlook','perplexity','pinterest','pipedrive','plaid',
  'planetscale','postmark','quickbooks','quora','railway','reddit','render','replicate',
  'resend','rocketplus','salesforce','sendgrid','shopify','slack','smartlead','square','stability',
  'stripe','supabase','telegram','tiktok','todoist','trello','turso','twilio','twitch',
  'typeform','v0','vercel','wave','webflow','whatsapp','whimsical','wix','woocommerce',
  'wordpress','x_twitter','xero','youtube','zapier','zendesk','zoom',
])

/** Returns the /logos/... path for a service logo key, or null if no SVG exists */
export function getLogoSrc(logoKey: string): string | null {
  const mapped = LOGO_REMAP[logoKey] || logoKey
  return AVAILABLE_LOGOS.has(mapped) ? `/logos/${mapped}.svg` : null
}
