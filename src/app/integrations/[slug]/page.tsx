import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'
import ServiceIcon from '@/components/ServiceLogos'
import { STATS_DISPLAY } from '@/data/stats'

type Service = (typeof servicesData.services)[number]
type Capability = (typeof capabilitiesData.capabilities)[number]
type Tool = { id: string; name: string; description: string }

const logicServices = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']

function findService(slug: string): Service | undefined {
  return servicesData.services.find((s) => s.slug === slug && !logicServices.includes(s.id))
}

function getCapabilities(serviceId: string): { asTrigger: Capability[]; asAction: Capability[] } {
  const all = capabilitiesData.capabilities
  return {
    asTrigger: all.filter((c) => c.trigger_service === serviceId),
    asAction: all.filter((c) => c.action_service === serviceId),
  }
}

function getConnectedServices(serviceId: string): Service[] {
  const caps = capabilitiesData.capabilities
  const connectedIds = new Set<string>()
  caps.forEach((c) => {
    if (c.trigger_service === serviceId && c.action_service) connectedIds.add(c.action_service)
    if (c.action_service === serviceId && c.trigger_service) connectedIds.add(c.trigger_service)
  })
  connectedIds.delete(serviceId)
  return servicesData.services.filter((s) => connectedIds.has(s.id) && !logicServices.includes(s.id))
}

function serviceName(id: string | undefined): string {
  if (!id) return 'Unknown'
  return servicesData.services.find((s) => s.id === id)?.name || id
}

// CRM workflow examples per service category
const CRM_WORKFLOWS: Record<string, { trigger: string; action: string; result: string }[]> = {
  stripe: [
    { trigger: 'Payment received in Stripe', action: 'Create CRM contact + move to "Paid" pipeline stage', result: 'Automatic lead-to-customer conversion' },
    { trigger: 'Subscription canceled in Stripe', action: 'Tag CRM contact "churned" + trigger win-back workflow', result: 'Automated retention campaigns' },
    { trigger: 'New CRM opportunity created', action: 'Generate Stripe invoice + send payment link', result: 'Sales pipeline to revenue in seconds' },
  ],
  slack: [
    { trigger: 'New CRM lead submitted', action: 'Post to #leads channel with action buttons', result: 'Team sees and responds to leads in real-time' },
    { trigger: '/0n command in Slack', action: 'Score lead, book appointment, or send SMS via CRM', result: 'Run your CRM from Slack' },
    { trigger: 'CRM deal stage changed', action: 'Notify #sales channel with deal details', result: 'Revenue pipeline visible to entire team' },
  ],
  sendgrid: [
    { trigger: 'CRM tag added "newsletter"', action: 'Add to SendGrid contact list + trigger welcome series', result: 'Automatic email list management' },
    { trigger: 'SendGrid email opened', action: 'Update CRM contact engagement score', result: 'AI-powered lead scoring from email behavior' },
    { trigger: 'CRM form submitted', action: 'Send branded confirmation via SendGrid', result: 'Professional transactional emails' },
  ],
  supabase: [
    { trigger: 'New CRM contact created', action: 'Create Supabase user profile + app access', result: 'Automatic customer portal provisioning' },
    { trigger: 'Supabase user action logged', action: 'Update CRM contact timeline + engagement score', result: 'Product usage drives CRM intelligence' },
    { trigger: 'CRM opportunity won', action: 'Provision Supabase database for customer', result: 'Automated SaaS onboarding' },
  ],
  github: [
    { trigger: 'GitHub issue created', action: 'Create CRM task + notify support team', result: 'Bug reports become trackable CRM tasks' },
    { trigger: 'PR merged to main', action: 'Post to CRM timeline + trigger deployment notification', result: 'Development milestones tracked in CRM' },
    { trigger: 'CRM feature request tagged', action: 'Create GitHub issue + assign team', result: 'Customer feedback to dev pipeline' },
  ],
  figma: [
    { trigger: 'Figma design finalized (version created)', action: 'Export as HTML → create CRM funnel page + notify team on Slack', result: 'Design to live landing page — no developer needed' },
    { trigger: 'Figma design comment posted', action: 'Create CRM task for design review + assign to team member', result: 'Design feedback tracked as CRM tasks' },
    { trigger: 'Figma library published with changes', action: 'Export design tokens → update CRM email templates + commit to GitHub', result: 'Brand consistency across every channel' },
  ],
  notion: [
    { trigger: 'CRM contact created', action: 'Create Notion page with client brief template', result: 'Every new client gets a documented workspace' },
    { trigger: 'Notion page updated', action: 'Sync content to CRM custom fields', result: 'Project notes visible in CRM timeline' },
    { trigger: 'CRM deal closed', action: 'Create Notion project workspace from template', result: 'Automatic project kickoff documentation' },
  ],
  hubspot: [
    { trigger: 'HubSpot form submitted', action: 'Create CRM contact + enroll in 0nMCP workflow', result: 'Leads from HubSpot flow into your CRM automation' },
    { trigger: 'CRM contact tagged "enterprise"', action: 'Create HubSpot deal + trigger sales sequence', result: 'Enterprise leads get VIP treatment across both CRMs' },
    { trigger: 'HubSpot deal stage changed', action: 'Mirror to CRM pipeline + notify Slack', result: 'Unified pipeline across CRM platforms' },
  ],
  shopify: [
    { trigger: 'New Shopify order placed', action: 'Create CRM contact + add "customer" tag + log purchase', result: 'E-commerce customers auto-enter your CRM' },
    { trigger: 'CRM contact tagged "vip"', action: 'Apply Shopify discount code + send personalized email', result: 'CRM segmentation drives e-commerce loyalty' },
    { trigger: 'Shopify product inventory low', action: 'Create CRM task + alert team on Slack', result: 'Inventory management through CRM workflows' },
  ],
  twilio: [
    { trigger: 'CRM form submitted', action: 'Send SMS confirmation via Twilio', result: 'Instant lead acknowledgment via text' },
    { trigger: 'Twilio call completed', action: 'Log call recording + duration to CRM contact timeline', result: 'Every call tracked in customer history' },
    { trigger: 'CRM appointment reminder due', action: 'Send Twilio SMS with appointment details', result: 'Automated appointment reminders reduce no-shows' },
  ],
  airtable: [
    { trigger: 'CRM deal stage changed', action: 'Update Airtable project tracker row', result: 'Project management synced with sales pipeline' },
    { trigger: 'Airtable record created', action: 'Create CRM contact from intake form data', result: 'Intake forms flow directly to your CRM' },
    { trigger: 'CRM task completed', action: 'Mark Airtable row as done + update status', result: 'Cross-platform task completion tracking' },
  ],
  openai: [
    { trigger: 'New CRM lead created', action: 'Generate AI lead score + personalized follow-up email via OpenAI', result: 'Every lead gets AI-powered personalization' },
    { trigger: 'CRM form response received', action: 'Analyze sentiment with OpenAI + tag contact accordingly', result: 'AI sentiment analysis drives CRM segmentation' },
    { trigger: 'CRM support ticket opened', action: 'Draft AI response via OpenAI + queue for agent review', result: 'AI-assisted support with human oversight' },
  ],
  anthropic: [
    { trigger: 'CRM contact asks a question', action: 'Route to Claude AI for intelligent response + log to timeline', result: 'AI handles first-line support automatically' },
    { trigger: 'New CRM opportunity created', action: 'Generate deal analysis and talking points via Claude', result: 'Sales team gets AI-powered preparation' },
    { trigger: 'CRM workflow needs content', action: 'Generate email sequences, proposals, or reports via Claude', result: 'AI content generation inside CRM workflows' },
  ],
  zoom: [
    { trigger: 'Zoom meeting ended', action: 'Log meeting duration + attendees to CRM contact timeline', result: 'Every meeting tracked in customer history' },
    { trigger: 'CRM appointment booked', action: 'Create Zoom meeting + send invite to contact', result: 'Appointments auto-generate video calls' },
    { trigger: 'Zoom recording available', action: 'Attach to CRM contact + generate AI summary', result: 'Meeting recordings and notes in one place' },
  ],
  calendly: [
    { trigger: 'Calendly booking created', action: 'Create CRM contact + add "booked" tag + assign to rep', result: 'Every booking becomes a trackable CRM lead' },
    { trigger: 'Calendly booking canceled', action: 'Update CRM contact status + trigger re-engagement workflow', result: 'No-shows and cancels trigger automated follow-up' },
    { trigger: 'CRM lead scored above 80', action: 'Send Calendly booking link via SMS/email', result: 'Hot leads get instant scheduling options' },
  ],
  mailchimp: [
    { trigger: 'CRM tag "newsletter" added', action: 'Subscribe to Mailchimp list + add to welcome automation', result: 'CRM tagging drives email list management' },
    { trigger: 'Mailchimp email clicked', action: 'Update CRM engagement score + add "engaged" tag', result: 'Email engagement feeds CRM intelligence' },
    { trigger: 'CRM deal closed won', action: 'Move contact to "customer" Mailchimp segment', result: 'Lifecycle marketing driven by CRM pipeline' },
  ],
  discord: [
    { trigger: 'CRM customer reaches "VIP" tier', action: 'Grant Discord role + send welcome DM', result: 'Premium CRM segments get exclusive community access' },
    { trigger: 'New Discord member joins', action: 'Create CRM contact + tag "community"', result: 'Community members tracked in your CRM' },
    { trigger: 'CRM product launched', action: 'Post announcement to Discord channels', result: 'Product launches reach your community instantly' },
  ],
  linear: [
    { trigger: 'CRM feature request tagged', action: 'Create Linear issue + link to CRM contact', result: 'Customer feedback becomes dev tickets automatically' },
    { trigger: 'Linear issue completed', action: 'Notify CRM contact who requested it + update timeline', result: 'Customers know when their requests ship' },
    { trigger: 'Linear sprint completed', action: 'Generate CRM release notes + email to stakeholders', result: 'Sprint updates reach customers automatically' },
  ],
  quickbooks: [
    { trigger: 'CRM invoice sent', action: 'Create matching QuickBooks invoice + sync line items', result: 'CRM invoicing mirrors to your accounting system' },
    { trigger: 'QuickBooks payment received', action: 'Mark CRM invoice as paid + update pipeline stage', result: 'Payment status synced across both systems' },
    { trigger: 'CRM deal closed', action: 'Create QuickBooks customer + generate invoice', result: 'Won deals auto-generate accounting records' },
  ],
  pipedrive: [
    { trigger: 'Pipedrive deal created', action: 'Mirror to CRM opportunity + sync contact data', result: 'Unified pipeline across both CRM platforms' },
    { trigger: 'CRM contact updated', action: 'Sync changes to matching Pipedrive person', result: 'Contact data stays consistent everywhere' },
    { trigger: 'Pipedrive activity completed', action: 'Log to CRM timeline + update engagement score', result: 'Sales activities tracked across both systems' },
  ],
  // Google Workspace
  gmail: [
    { trigger: 'CRM form submitted', action: 'Send branded confirmation email via Gmail', result: 'Every lead gets instant professional response' },
    { trigger: 'Gmail reply received', action: 'Update CRM contact timeline + trigger follow-up workflow', result: 'Email conversations tracked in your CRM' },
    { trigger: 'CRM deal stage changed', action: 'Send Gmail notification to deal owner', result: 'Sales team stays informed automatically' },
  ],
  google_calendar: [
    { trigger: 'CRM appointment booked', action: 'Create Google Calendar event + send invite', result: 'Appointments sync to your calendar instantly' },
    { trigger: 'Google Calendar event approaching', action: 'Send CRM reminder SMS/email to contact', result: 'Automated reminders reduce no-shows' },
    { trigger: 'Google Calendar event completed', action: 'Log to CRM timeline + trigger post-meeting workflow', result: 'Meeting outcomes tracked in CRM automatically' },
  ],
  google_sheets: [
    { trigger: 'New CRM contact created', action: 'Add row to Google Sheet with contact data', result: 'Spreadsheet reporting auto-updated from CRM' },
    { trigger: 'Google Sheet row updated', action: 'Sync changes to matching CRM contact', result: 'Bulk edits in Sheets flow to your CRM' },
    { trigger: 'CRM monthly report due', action: 'Generate Google Sheet with pipeline + revenue data', result: 'Automated monthly reporting from CRM data' },
  ],
  google_drive: [
    { trigger: 'CRM deal closed', action: 'Create Google Drive folder from template + share with client', result: 'Client onboarding folders auto-created' },
    { trigger: 'File uploaded to Google Drive', action: 'Attach to CRM contact record + notify team', result: 'Documents linked to CRM contacts automatically' },
    { trigger: 'CRM proposal requested', action: 'Generate doc in Google Drive from template + CRM data', result: 'Proposals auto-populated with CRM deal info' },
  ],
  google_ads: [
    { trigger: 'Google Ads lead form submitted', action: 'Create CRM contact + tag "google-ads" + score lead', result: 'Ad leads enter CRM pipeline instantly' },
    { trigger: 'CRM contact converts to customer', action: 'Send conversion event to Google Ads', result: 'Ad optimization from actual revenue data' },
    { trigger: 'CRM lead score drops below threshold', action: 'Exclude from Google Ads remarketing list', result: 'Stop spending on cold leads automatically' },
  ],
  // Social media
  instagram: [
    { trigger: 'Instagram DM received', action: 'Create CRM contact + trigger follow-up workflow', result: 'Social conversations become CRM leads' },
    { trigger: 'CRM tag "post-feature" added', action: 'Queue Instagram post featuring the client', result: 'Client spotlights automated from CRM tags' },
    { trigger: 'Instagram comment on business post', action: 'Log to CRM contact timeline if known contact', result: 'Social engagement tracked in CRM' },
  ],
  twitter: [
    { trigger: 'Twitter/X mention received', action: 'Create CRM contact + tag "twitter-lead"', result: 'Social mentions become trackable leads' },
    { trigger: 'CRM content calendar triggers', action: 'Auto-post to Twitter/X from CRM workflow', result: 'Social media posting driven by CRM automations' },
    { trigger: 'Twitter/X DM received', action: 'Route to CRM conversations + assign agent', result: 'DMs handled through CRM support system' },
  ],
  linkedin: [
    { trigger: 'LinkedIn connection accepted', action: 'Create CRM contact + add to nurture workflow', result: 'LinkedIn network feeds your CRM pipeline' },
    { trigger: 'CRM deal stage "proposal sent"', action: 'Send LinkedIn InMail follow-up', result: 'Multi-channel follow-up from CRM triggers' },
    { trigger: 'LinkedIn message received', action: 'Log to CRM timeline + assign to sales rep', result: 'LinkedIn conversations tracked in CRM' },
  ],
  facebook_ads: [
    { trigger: 'Facebook lead ad submitted', action: 'Create CRM contact + enroll in nurture workflow', result: 'Facebook leads enter CRM within seconds' },
    { trigger: 'CRM customer lifetime value updated', action: 'Sync to Facebook Ads custom audience', result: 'Lookalike audiences built from CRM data' },
    { trigger: 'CRM deal closed won', action: 'Send purchase event to Facebook Ads', result: 'ROAS tracking from actual CRM revenue' },
  ],
  linkedin_ads: [
    { trigger: 'LinkedIn Ads lead gen form submitted', action: 'Create CRM contact + tag "linkedin-ad"', result: 'B2B ad leads flow directly to CRM' },
    { trigger: 'CRM contact tagged "decision-maker"', action: 'Add to LinkedIn Ads matched audience', result: 'CRM segmentation powers ad targeting' },
    { trigger: 'CRM deal stage "qualified"', action: 'Remove from LinkedIn prospecting campaigns', result: 'Stop advertising to already-qualified leads' },
  ],
  tiktok_ads: [
    { trigger: 'TikTok lead form submitted', action: 'Create CRM contact + assign to sales', result: 'TikTok leads in your CRM pipeline instantly' },
    { trigger: 'CRM conversion tracked', action: 'Send TikTok Ads conversion event', result: 'Optimize TikTok spend with real CRM data' },
    { trigger: 'CRM audience segment updated', action: 'Sync to TikTok Ads custom audience', result: 'CRM-driven ad targeting on TikTok' },
  ],
  // Support
  jira: [
    { trigger: 'CRM support ticket escalated', action: 'Create Jira issue + link to CRM contact', result: 'Customer issues become dev tickets automatically' },
    { trigger: 'Jira issue resolved', action: 'Notify CRM contact + close support ticket', result: 'Customers notified when bugs are fixed' },
    { trigger: 'Jira sprint completed', action: 'Generate CRM release notes email to stakeholders', result: 'Sprint completions trigger customer updates' },
  ],
  zendesk: [
    { trigger: 'CRM contact submits support request', action: 'Create Zendesk ticket + attach CRM history', result: 'Support agents see full customer context' },
    { trigger: 'Zendesk ticket resolved', action: 'Update CRM timeline + trigger satisfaction survey', result: 'Support outcomes tracked in CRM' },
    { trigger: 'Zendesk satisfaction score received', action: 'Update CRM engagement score + tag accordingly', result: 'Support quality drives CRM intelligence' },
  ],
  intercom: [
    { trigger: 'Intercom conversation started', action: 'Create CRM contact + log chat to timeline', result: 'Live chat visitors become CRM leads' },
    { trigger: 'CRM contact tagged "upsell"', action: 'Trigger Intercom targeted message', result: 'CRM segments power in-app messaging' },
    { trigger: 'Intercom user qualifies as lead', action: 'Create CRM opportunity + assign to sales', result: 'Product-qualified leads flow to sales pipeline' },
  ],
  freshdesk: [
    { trigger: 'CRM contact submits ticket', action: 'Create Freshdesk ticket with CRM contact context', result: 'Support tickets enriched with CRM data' },
    { trigger: 'Freshdesk ticket SLA breach', action: 'Escalate in CRM + notify manager', result: 'SLA tracking bridges both systems' },
    { trigger: 'Freshdesk resolution achieved', action: 'Log to CRM timeline + send thank-you email', result: 'Closed tickets trigger CRM follow-up' },
  ],
  // E-commerce
  woocommerce: [
    { trigger: 'WooCommerce order placed', action: 'Create CRM contact + log purchase + tag "customer"', result: 'E-commerce buyers auto-enter your CRM' },
    { trigger: 'CRM contact tagged "vip"', action: 'Apply WooCommerce discount coupon + notify', result: 'CRM loyalty programs drive e-commerce sales' },
    { trigger: 'WooCommerce cart abandoned', action: 'Trigger CRM abandoned cart email workflow', result: 'Cart recovery powered by CRM automation' },
  ],
  square: [
    { trigger: 'Square payment received', action: 'Create/update CRM contact + log transaction', result: 'In-person payments tracked in CRM' },
    { trigger: 'CRM contact created from referral', action: 'Generate Square loyalty reward', result: 'CRM referral program drives POS rewards' },
    { trigger: 'Square inventory alert', action: 'Create CRM task + notify purchasing team', result: 'Inventory management through CRM tasks' },
  ],
  // Messaging
  whatsapp: [
    { trigger: 'WhatsApp message received', action: 'Create CRM contact + route to conversations', result: 'WhatsApp messages managed through CRM' },
    { trigger: 'CRM appointment booked', action: 'Send WhatsApp confirmation with details', result: 'Appointment confirmations via WhatsApp' },
    { trigger: 'CRM lead scored above 80', action: 'Send WhatsApp template message with offer', result: 'Hot leads get instant WhatsApp outreach' },
  ],
  telegram: [
    { trigger: 'Telegram message received', action: 'Create CRM contact + log conversation', result: 'Telegram contacts tracked in your CRM' },
    { trigger: 'CRM workflow triggers notification', action: 'Send Telegram message to team channel', result: 'Team alerts via Telegram from CRM events' },
    { trigger: 'CRM deal won', action: 'Post celebration to Telegram team group', result: 'Sales wins shared on Telegram automatically' },
  ],
  // Email marketing
  resend: [
    { trigger: 'CRM contact created', action: 'Send branded welcome email via Resend', result: 'Every new contact gets professional welcome' },
    { trigger: 'CRM workflow step "send email"', action: 'Deliver transactional email via Resend API', result: 'CRM automations use Resend for delivery' },
    { trigger: 'Resend email bounced', action: 'Update CRM contact email status + remove from lists', result: 'Bounce management synced to CRM' },
  ],
  activecampaign: [
    { trigger: 'ActiveCampaign contact tagged', action: 'Mirror tag to CRM + update engagement score', result: 'Email marketing segments sync to CRM' },
    { trigger: 'CRM deal stage changed', action: 'Move ActiveCampaign contact to matching automation', result: 'CRM pipeline drives email sequences' },
    { trigger: 'ActiveCampaign form submitted', action: 'Create CRM contact + enroll in CRM workflow', result: 'Email signups flow directly to CRM' },
  ],
  convertkit: [
    { trigger: 'ConvertKit subscriber added', action: 'Create CRM contact + tag "newsletter"', result: 'Email subscribers tracked in your CRM' },
    { trigger: 'CRM contact reaches milestone', action: 'Add to ConvertKit sequence', result: 'CRM milestones trigger email sequences' },
    { trigger: 'ConvertKit email link clicked', action: 'Update CRM engagement score', result: 'Email clicks feed CRM lead scoring' },
  ],
  // Project management
  asana: [
    { trigger: 'CRM deal closed won', action: 'Create Asana project from template + assign team', result: 'Won deals auto-kick-off project management' },
    { trigger: 'Asana task completed', action: 'Update CRM project timeline + notify client', result: 'Task completion tracked in CRM' },
    { trigger: 'CRM support ticket created', action: 'Create Asana task + assign to support team', result: 'Support tickets become trackable tasks' },
  ],
  trello: [
    { trigger: 'CRM deal stage changed', action: 'Move Trello card to matching list', result: 'Trello boards mirror CRM pipeline stages' },
    { trigger: 'Trello card completed', action: 'Update CRM timeline + move to next stage', result: 'Task completion advances CRM pipeline' },
    { trigger: 'CRM onboarding started', action: 'Create Trello board from onboarding template', result: 'Client onboarding boards auto-created' },
  ],
  monday: [
    { trigger: 'CRM deal won', action: 'Create Monday.com project + populate with client data', result: 'Sales wins auto-create project workspaces' },
    { trigger: 'Monday.com status changed to "Done"', action: 'Update CRM timeline + trigger next workflow', result: 'Project milestones synced to CRM' },
    { trigger: 'CRM task assigned', action: 'Create Monday.com item + assign to team member', result: 'CRM tasks reflected in Monday boards' },
  ],
  // Databases
  mongodb: [
    { trigger: 'CRM contact data updated', action: 'Sync to MongoDB customer collection', result: 'CRM data mirrored to your app database' },
    { trigger: 'MongoDB user action logged', action: 'Update CRM contact engagement timeline', result: 'App usage tracked in CRM' },
    { trigger: 'CRM webhook fires', action: 'Insert event record to MongoDB for analytics', result: 'CRM events stored for custom analytics' },
  ],
  // Cloud & hosting
  cloudflare: [
    { trigger: 'CRM customer onboarded', action: 'Create Cloudflare DNS zone + configure domain', result: 'Customer domains provisioned from CRM' },
    { trigger: 'Cloudflare security event detected', action: 'Create CRM alert task + notify security team', result: 'Security events trigger CRM workflows' },
    { trigger: 'CRM customer churned', action: 'Archive Cloudflare zone + cleanup DNS', result: 'Infrastructure deprovisioning from CRM' },
  ],
  wordpress: [
    { trigger: 'WordPress form submitted', action: 'Create CRM contact + tag by form name', result: 'WordPress leads enter CRM automatically' },
    { trigger: 'CRM content workflow triggers', action: 'Create/update WordPress post via API', result: 'CRM automations publish to WordPress' },
    { trigger: 'WordPress WooCommerce order', action: 'Create CRM contact + log purchase history', result: 'WordPress sales tracked in CRM' },
  ],
  webflow: [
    { trigger: 'Webflow form submitted', action: 'Create CRM contact + enroll in workflow', result: 'Webflow leads flow to CRM instantly' },
    { trigger: 'CRM content approved', action: 'Publish to Webflow CMS collection', result: 'CRM-approved content goes live on Webflow' },
    { trigger: 'Webflow e-commerce order', action: 'Create CRM contact + tag "webflow-customer"', result: 'Webflow sales tracked in CRM pipeline' },
  ],
  // Cold email
  smartlead: [
    { trigger: 'Smartlead reply received', action: 'Create CRM opportunity + tag "warm-lead"', result: 'Cold email replies become CRM opportunities' },
    { trigger: 'CRM contact tagged "outbound"', action: 'Add to Smartlead campaign sequence', result: 'CRM tags trigger outbound email campaigns' },
    { trigger: 'Smartlead email bounced', action: 'Update CRM contact email validity', result: 'Email deliverability synced to CRM' },
  ],
  // Forms
  typeform: [
    { trigger: 'Typeform response submitted', action: 'Create CRM contact + map all fields', result: 'Survey and form data flows to CRM' },
    { trigger: 'CRM workflow needs data collection', action: 'Send Typeform link via email/SMS', result: 'CRM triggers personalized form collection' },
    { trigger: 'Typeform NPS score submitted', action: 'Update CRM satisfaction score + tag accordingly', result: 'NPS data enriches CRM profiles' },
  ],
  // Signing
  docusign: [
    { trigger: 'CRM deal stage "contract"', action: 'Generate DocuSign envelope from template + CRM data', result: 'Contracts auto-generated from CRM deals' },
    { trigger: 'DocuSign envelope signed', action: 'Move CRM deal to "signed" + trigger onboarding', result: 'Signed contracts advance CRM pipeline' },
    { trigger: 'DocuSign envelope declined', action: 'Update CRM deal status + notify sales rep', result: 'Declined contracts trigger follow-up' },
  ],
  // AI/Voice
  elevenlabs: [
    { trigger: 'CRM voicemail workflow triggered', action: 'Generate AI voicemail via ElevenLabs + deliver', result: 'AI-generated personalized voicemails from CRM' },
    { trigger: 'CRM content needs audio', action: 'Convert text to speech via ElevenLabs', result: 'CRM content goes audio automatically' },
    { trigger: 'ElevenLabs audio generated', action: 'Attach to CRM contact record + send via SMS', result: 'AI voice messages delivered through CRM' },
  ],
  // Accounting
  xero: [
    { trigger: 'CRM invoice sent', action: 'Create matching Xero invoice + sync line items', result: 'CRM invoicing mirrors to Xero accounting' },
    { trigger: 'Xero payment received', action: 'Mark CRM invoice paid + advance pipeline stage', result: 'Payment status synced from accounting to CRM' },
    { trigger: 'CRM deal closed', action: 'Create Xero contact + invoice', result: 'Won deals auto-generate accounting records' },
  ],
  default: [
    { trigger: 'Event in this service', action: 'Create or update CRM contact + log activity', result: 'Every touchpoint tracked in your CRM' },
    { trigger: 'CRM workflow triggers', action: 'Execute action in this service', result: 'CRM becomes the orchestration hub' },
    { trigger: 'Data changes in either system', action: 'Bidirectional sync keeps both systems current', result: 'Single source of truth across your stack' },
  ],
}

function getCRMWorkflows(serviceId: string) {
  return CRM_WORKFLOWS[serviceId] || CRM_WORKFLOWS.default
}

export async function generateStaticParams() {
  return servicesData.services
    .filter((s) => !logicServices.includes(s.id))
    .map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = findService(slug)
  if (!service) return { title: 'Integration Not Found — 0nMCP' }

  const caps = getCapabilities(service.id)
  const total = caps.asTrigger.length + caps.asAction.length
  const title = `${service.name} + CRM + AI — Connect Everything | 0nMCP`
  const description = `Connect ${service.name} to your CRM and ${total > 0 ? total + ' automations across ' : ''}55 services. ${service.tool_count} tools. AI-powered. No code required.`

  return {
    title,
    description: description.slice(0, 155),
    openGraph: { title, description: description.slice(0, 155), url: `https://www.0nmcp.com/integrations/${service.slug}` },
    alternates: { canonical: `https://www.0nmcp.com/integrations/${service.slug}` },
  }
}

export default async function IntegrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = findService(slug)
  if (!service) notFound()

  const caps = getCapabilities(service.id)
  const connected = getConnectedServices(service.id)
  const totalCaps = caps.asTrigger.length + caps.asAction.length
  const tools = (service as unknown as { tools?: Tool[] }).tools || []
  const crmWorkflows = getCRMWorkflows(service.id)

  const howToJsonLd = {
    '@context': 'https://schema.org', '@type': 'HowTo',
    name: `How to connect ${service.name} with 0nMCP`,
    description: `Set up ${service.name} integration with AI-powered orchestration in minutes.`,
    step: [
      { '@type': 'HowToStep', name: 'Install', text: 'npx 0nmcp@latest' },
      { '@type': 'HowToStep', name: 'Connect', text: `Import your ${service.name} API key with 0nmcp engine import` },
      { '@type': 'HowToStep', name: 'Automate', text: `Describe what you want in natural language — 0nMCP handles the rest` },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://www.0nmcp.com/integrations' },
      { '@type': 'ListItem', position: 3, name: service.name, item: `https://www.0nmcp.com/integrations/${service.slug}` },
    ],
  }

  return (
    <div className="homepage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── HERO ── */}
      <section className="hero-section" style={{ minHeight: '50vh', paddingTop: '7rem' }}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <nav className="text-xs mb-6 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
            <Link href="/" className="hover:underline" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span>/</span>
            <Link href="/integrations" className="hover:underline" style={{ color: 'var(--text-muted)' }}>Integrations</Link>
            <span>/</span>
            <span style={{ color: 'var(--accent)' }}>{service.name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ServiceIcon id={service.id} size={32} />
            </div>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 300 }}>+</span>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(110,224,90,0.06)', border: '1px solid rgba(110,224,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              CRM
            </div>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 300 }}>+</span>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
              54+
            </div>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <span className="hero-title-accent">{service.name}</span> + CRM<br />
            + Everything Else
          </h1>

          <p className="hero-subtitle">
            {service.tool_count} tools. {totalCaps} automations. Connect {service.name} to your CRM and {STATS_DISPLAY.services} other services through one AI orchestrator.
          </p>

          <div className="hero-install">
            <code>npx 0nmcp@latest</code>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <span className="stat-value">{service.tool_count}</span>
            <span className="stat-label">{service.name} Tools</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{totalCaps}</span>
            <span className="stat-label">Automations</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{connected.length}</span>
            <span className="stat-label">Connected Services</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">245</span>
            <span className="stat-label">CRM Tools</span>
          </div>
        </div>
      </section>

      {/* ── CRM BRIDGE — THE MONEY SECTION ── */}
      <section className="section-container" style={{ padding: '5rem 1.5rem' }}>
        <h2 className="section-label">The CRM Bridge</h2>
        <p className="section-desc">{service.name} + CRM = Fully automated business</p>

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Visual bridge diagram */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            marginBottom: '2.5rem', padding: '1.5rem', borderRadius: 16,
            background: 'rgba(110,224,90,0.03)', border: '1px solid rgba(110,224,90,0.1)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.375rem' }}>
                <ServiceIcon id={service.id} size={24} />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{service.name}</span>
            </div>
            <div style={{ flex: 1, maxWidth: 120, height: 2, background: 'linear-gradient(to right, var(--border), var(--accent), var(--border))' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, rgba(110,224,90,0.1), rgba(0,212,255,0.1))', border: '1px solid rgba(110,224,90,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.375rem', fontWeight: 900, fontSize: '0.6875rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                0nMCP
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--accent)', fontWeight: 600 }}>Orchestrator</span>
            </div>
            <div style={{ flex: 1, maxWidth: 120, height: 2, background: 'linear-gradient(to right, var(--border), var(--accent), var(--border))' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.375rem', fontWeight: 800, fontSize: '0.6875rem', color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>
                CRM
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>245 tools</span>
            </div>
          </div>

          {/* CRM workflow examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {crmWorkflows.map((wf, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '1.25rem', transition: 'border-color 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00d4ff', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>Trigger</div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{wf.trigger}</p>
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--accent)', alignSelf: 'center' }}>→</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>Action</div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{wf.action}</p>
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--accent)', alignSelf: 'center' }}>=</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>Result</div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>{wf.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLS LIST ── */}
      {tools.length > 0 && (
        <section className="section-container" style={{ padding: '5rem 1.5rem' }}>
          <h2 className="section-label">{service.name} Tools</h2>
          <p className="section-desc">{service.tool_count} tools available through 0nMCP</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', maxWidth: 900, margin: '0 auto' }}>
            {tools.map((tool) => (
              <div key={tool.id} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '1rem',
              }}>
                <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>{tool.name}</h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── AUTOMATIONS ── */}
      {(caps.asTrigger.length > 0 || caps.asAction.length > 0) && (
        <section className="section-container" style={{ padding: '5rem 1.5rem' }}>
          <h2 className="section-label">Pre-Built Automations</h2>
          <p className="section-desc">{totalCaps} ready-to-use workflows</p>

          <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: caps.asTrigger.length > 0 && caps.asAction.length > 0 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
            {caps.asTrigger.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00d4ff', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
                  When {service.name} triggers...
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {caps.asTrigger.slice(0, 8).map((cap) => (
                    <Link key={cap.slug} href={`/turn-it-on/${cap.slug}`} style={{
                      display: 'block', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '0.75rem 1rem', textDecoration: 'none', transition: 'border-color 0.2s',
                    }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{cap.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{service.name} → {serviceName(cap.action_service)}</span>
                    </Link>
                  ))}
                  {caps.asTrigger.length > 8 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>+{caps.asTrigger.length - 8} more</span>
                  )}
                </div>
              </div>
            )}

            {caps.asAction.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
                  ...sends to {service.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {caps.asAction.slice(0, 8).map((cap) => (
                    <Link key={cap.slug} href={`/turn-it-on/${cap.slug}`} style={{
                      display: 'block', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '0.75rem 1rem', textDecoration: 'none', transition: 'border-color 0.2s',
                    }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{cap.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{serviceName(cap.trigger_service)} → {service.name}</span>
                    </Link>
                  ))}
                  {caps.asAction.length > 8 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>+{caps.asAction.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CONNECTED SERVICES ── */}
      {connected.length > 0 && (
        <section className="section-container" style={{ padding: '3rem 1.5rem' }}>
          <h2 className="section-label">Connected Services</h2>
          <p className="section-desc">{service.name} works with {connected.length} other services</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: 800, margin: '0 auto' }}>
            {connected.map((s) => (
              <Link key={s.slug} href={`/integrations/${s.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', borderRadius: 9999, background: 'var(--bg-card)',
                border: '1px solid var(--border)', textDecoration: 'none', fontSize: '0.75rem',
                color: 'var(--text-secondary)', fontWeight: 600, transition: 'border-color 0.2s, color 0.2s',
              }}>
                <ServiceIcon id={s.id} size={14} />
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SETUP ── */}
      <section className="steps-section section-container">
        <h2 className="section-label">Setup</h2>
        <p className="section-desc">Three steps. Under two minutes.</p>

        <div className="steps-grid">
          {[
            { num: '01', title: 'Install', desc: 'One command installs 900+ tools across 55 services.', code: 'npx 0nmcp@latest' },
            { num: '02', title: 'Connect', desc: `Import your ${service.name} API key. Auto-detected from .env files.`, code: '0nmcp engine import' },
            { num: '03', title: 'Automate', desc: 'Tell your AI what you want. 0nMCP handles the API calls.', code: `"When ${service.name} fires, update my CRM and notify Slack"` },
          ].map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              <div className="step-code"><code>{step.code}</code></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AFFILIATE CTA ── */}
      <section className="section-container" style={{ padding: '3rem 1.5rem' }}>
        <div className="affiliate-banner">
          <div className="affiliate-content">
            <h3>Don&apos;t have {service.name} yet?</h3>
            <p>Sign up for {service.name} and connect it to 0nMCP in minutes.</p>
          </div>
          <a href={`https://0nmcp.com/go/${service.slug}`} className="affiliate-cta" target="_blank" rel="noopener noreferrer">
            Get {service.name} →
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section section-container">
        <h2 className="section-label">FAQ</h2>
        <div className="faq-grid">
          {[
            { q: `How do I connect ${service.name} to my CRM?`, a: `Install 0nMCP (npx 0nmcp@latest), import your ${service.name} API key, and import your CRM credentials. 0nMCP bridges them — ${service.name} events trigger CRM actions and vice versa. 245 CRM tools + ${service.tool_count} ${service.name} tools = unlimited automations.` },
            { q: `What can I automate with ${service.name}?`, a: `0nMCP provides ${service.tool_count} ${service.name} tools and ${totalCaps} pre-built automations. Connect to ${connected.length} other services including CRM, Stripe, Slack, and more. Describe what you want in natural language — 0nMCP handles the API calls.` },
            { q: 'Is this free?', a: '0nMCP is open source (MIT). Local use is completely free. The managed 0nCore platform starts at $80/mo with CRM integration, AI assistant, and web dashboard.' },
            { q: `Does this replace Zapier for ${service.name}?`, a: `Yes. Zapier connects apps to apps with predefined triggers. 0nMCP connects apps to AI — describe any workflow in natural language and it executes. No "zap" templates needed. Plus, 0nMCP is free for local use vs Zapier's $20+/mo.` },
          ].map((item) => (
            <details key={item.q} className="faq-item">
              <summary className="faq-question">{item.q}</summary>
              <p className="faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta-section">
        <div className="final-cta-glow" aria-hidden="true" />
        <h2 className="final-cta-title">
          Connect {service.name}.<br />
          <span className="hero-title-accent">Automate everything.</span>
        </h2>
        <p className="final-cta-subtitle">
          {service.tool_count} tools. {STATS_DISPLAY.services} services. One install.
        </p>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="hero-cta-primary">
            Request Early Access
          </Link>
          <Link href="/integrations" className="hero-cta-secondary">
            ← All Integrations
          </Link>
        </div>
      </section>
    </div>
  )
}
