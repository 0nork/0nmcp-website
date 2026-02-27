/**
 * 0n Console — Service Definitions
 * Ported from onork-app/lib/services.ts, adapted for 0nmcp.com
 *
 * Each service defines its label, logo key, brand color, description,
 * capabilities, and credential fields needed for connection.
 */

export interface ServiceField {
  /** Field key (used as storage key) */
  k: string;
  /** Label shown in UI */
  lb: string;
  /** Placeholder text */
  ph: string;
  /** Help text / tooltip */
  h: string;
  /** Link to where the user finds this value */
  lk: string;
  /** Human-readable location description */
  ll: string;
  /** Whether this field is a secret (masked in UI) */
  s?: boolean;
}

export interface ServiceConfig {
  /** Display label */
  l: string;
  /** Logo identifier key (maps to icon/image assets) */
  logo: string;
  /** Brand color hex */
  c: string;
  /** Short description */
  d: string;
  /** Capabilities list */
  cap: string[];
  /** Credential fields */
  f: ServiceField[];
}

export const SVC: Record<string, ServiceConfig> = {
  crm: {
    l: "CRM", logo: "rocket", c: "#7c3aed",
    d: "All-in-one CRM for contacts, pipelines, workflows, calendars, invoicing, and automation.",
    cap: ["Contacts", "Pipelines", "Workflows", "Calendar", "Invoicing", "SMS/Email", "Opportunities", "50+ Webhooks"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "690ffe...", h: "Marketplace app ID", lk: "https://marketplace.gohighlevel.com/apps", ll: "Marketplace > My Apps > Settings" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxx-xxxx", s: true, h: "OAuth secret", lk: "https://marketplace.gohighlevel.com/apps", ll: "My Apps > Settings > Secret" },
      { k: "location_id", lb: "Location ID", ph: "ve9EPM...", h: "Sub-account ID", lk: "https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken/", ll: "Settings > Business Profile > Location ID" },
    ],
  },
  supabase: {
    l: "Supabase", logo: "supabase", c: "#3ecf8e",
    d: "Open-source PostgreSQL database, auth, real-time, edge functions, and storage.",
    cap: ["Database", "Auth", "Real-time", "Storage", "Edge Functions", "REST API", "RLS", "Webhooks"],
    f: [
      { k: "url", lb: "Project URL", ph: "https://xxx.supabase.co", h: "Unique project URL", lk: "https://supabase.com/dashboard/projects", ll: "Dashboard > Project > Settings > API" },
      { k: "anon_key", lb: "Anon Key", ph: "eyJhbG...", h: "Client-safe, respects RLS", lk: "https://supabase.com/dashboard/project/_/settings/api", ll: "Settings > API > anon public" },
      { k: "service_role", lb: "Service Role", ph: "eyJhbG...", s: true, h: "Bypasses RLS - server only", lk: "https://supabase.com/dashboard/project/_/settings/api", ll: "Settings > API > service_role" },
    ],
  },
  stripe: {
    l: "Stripe", logo: "stripe", c: "#635bff",
    d: "Payments, subscriptions, invoices, disputes, and revenue tracking.",
    cap: ["Payments", "Subscriptions", "Invoices", "Customers", "Coupons", "Payment Links", "Refunds", "Webhooks"],
    f: [
      { k: "secret_key", lb: "Secret Key", ph: "sk_live_...", s: true, h: "Server-side API key", lk: "https://dashboard.stripe.com/apikeys", ll: "Developers > API Keys > Secret" },
      { k: "webhook_secret", lb: "Webhook Secret", ph: "whsec_...", s: true, h: "Verify webhook signatures", lk: "https://dashboard.stripe.com/webhooks", ll: "Webhooks > Signing Secret" },
    ],
  },
  anthropic: {
    l: "Anthropic", logo: "anthropic", c: "#d4a574",
    d: "Claude AI - advanced reasoning, analysis, coding, 200K context, tool use.",
    cap: ["Claude Opus/Sonnet", "200K Context", "Code Gen", "Vision", "Tool Use", "JSON Output", "Batch API", "Analysis"],
    f: [
      { k: "api_key", lb: "API Key", ph: "sk-ant-api03-...", s: true, h: "Per-token billing", lk: "https://console.anthropic.com/settings/keys", ll: "Console > Settings > API Keys" },
    ],
  },
  openai: {
    l: "OpenAI", logo: "openai", c: "#10a37f",
    d: "GPT-4o, DALL-E, Whisper, Embeddings - versatile AI for generation and analysis.",
    cap: ["GPT-4o", "DALL-E", "Whisper", "Embeddings", "Functions", "JSON Mode", "Vision", "Fine-tuning"],
    f: [
      { k: "api_key", lb: "API Key", ph: "sk-proj-...", s: true, h: "Project-scoped key", lk: "https://platform.openai.com/api-keys", ll: "Platform > API Keys > Create" },
    ],
  },
  gemini: {
    l: "Gemini", logo: "gemini", c: "#4285f4",
    d: "Google's multimodal AI - text, images, code, and long-context reasoning up to 2M tokens.",
    cap: ["Gemini Pro/Ultra", "2M Context", "Multimodal", "Code Gen", "Grounding", "Search", "JSON Output", "Vision"],
    f: [
      { k: "api_key", lb: "API Key", ph: "AIzaSy...", s: true, h: "Google AI Studio key", lk: "https://aistudio.google.com/apikey", ll: "AI Studio > Get API Key > Create" },
    ],
  },
  perplexity: {
    l: "Perplexity", logo: "perplexity", c: "#20b8cd",
    d: "AI-powered search engine API - real-time web answers with citations.",
    cap: ["Web Search", "Citations", "Sonar Models", "Real-time Data", "Structured Output", "Focus Modes", "Follow-ups", "Pro Search"],
    f: [
      { k: "api_key", lb: "API Key", ph: "pplx-...", s: true, h: "Perplexity API key", lk: "https://www.perplexity.ai/settings/api", ll: "Settings > API > Generate Key" },
    ],
  },
  vercel: {
    l: "Vercel", logo: "vercel", c: "#e2e2e2",
    d: "Frontend deployment - instant deploys, previews, edge functions, analytics.",
    cap: ["Git Deploys", "Previews", "Edge Functions", "Serverless", "Analytics", "Domains", "Env Vars", "Rollback"],
    f: [
      { k: "token", lb: "Access Token", ph: "vercel_...", s: true, h: "Deployment token", lk: "https://vercel.com/account/tokens", ll: "Account > Tokens > Create" },
      { k: "project_id", lb: "Project ID", ph: "prj_...", h: "In project settings", lk: "https://vercel.com/dashboard", ll: "Dashboard > Project > Settings" },
    ],
  },
  github: {
    l: "GitHub", logo: "github", c: "#e2e2e2",
    d: "Code hosting, PRs, CI/CD, issues, actions, releases, and collaboration.",
    cap: ["Repos", "Pull Requests", "Actions", "Issues", "Releases", "Branch Rules", "Webhooks", "Pages"],
    f: [
      { k: "token", lb: "PAT", ph: "ghp_...", s: true, h: "Fine-grained recommended", lk: "https://github.com/settings/tokens?type=beta", ll: "Settings > Tokens > Fine-grained" },
      { k: "repo", lb: "Repository", ph: "org/repo", h: "owner/repo format", lk: "https://github.com", ll: "Your repo URL path" },
    ],
  },
  n8n: {
    l: "n8n", logo: "n8n", c: "#ff6d5a",
    d: "Open-source workflow automation - 400+ integrations, visual builder, code nodes.",
    cap: ["Visual Builder", "400+ Integrations", "Webhooks", "Code Nodes", "AI Agents", "Error Handling", "Sub-workflows", "Credentials"],
    f: [
      { k: "url", lb: "Instance URL", ph: "https://xxx.app.n8n.cloud", h: "Cloud or self-hosted", lk: "https://app.n8n.cloud/manage", ll: "n8n Cloud > Manage > URL" },
      { k: "api_key", lb: "API Key", ph: "n8n_api_...", s: true, h: "Enable API first", lk: "https://docs.n8n.io/api/authentication/", ll: "Settings > API > Create Key" },
    ],
  },
  gmail: {
    l: "Gmail", logo: "gmail", c: "#d93025",
    d: "Send and manage email via Google's API - compose, read, labels, and search.",
    cap: ["Send Email", "Read Inbox", "Labels", "Search", "Attachments", "Drafts", "Threads", "Filters"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud Console OAuth", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials > OAuth" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 client secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Client Secret" },
    ],
  },
  slack: {
    l: "Slack", logo: "slack", c: "#e01e5a",
    d: "Team messaging - send messages, manage channels, post notifications, and build bots.",
    cap: ["Send Messages", "Channels", "Threads", "Reactions", "File Upload", "Blocks", "Webhooks", "Bot Users"],
    f: [
      { k: "bot_token", lb: "Bot Token", ph: "xoxb-...", s: true, h: "Bot user OAuth token", lk: "https://api.slack.com/apps", ll: "Apps > Your App > OAuth > Bot Token" },
      { k: "webhook_url", lb: "Webhook URL", ph: "https://hooks.slack.com/...", h: "Incoming webhook URL", lk: "https://api.slack.com/apps", ll: "App > Incoming Webhooks > Add" },
    ],
  },
  clickup: {
    l: "ClickUp", logo: "clickup", c: "#7b68ee",
    d: "Project management - tasks, docs, goals, dashboards, time tracking, and sprints.",
    cap: ["Tasks", "Spaces", "Docs", "Goals", "Time Tracking", "Dashboards", "Automations", "Sprints"],
    f: [
      { k: "api_key", lb: "API Key", ph: "pk_...", s: true, h: "Personal API token", lk: "https://app.clickup.com/settings/apps", ll: "Settings > Apps > API Token > Generate" },
    ],
  },
  notion: {
    l: "Notion", logo: "notion", c: "#e2e2e2",
    d: "All-in-one workspace - pages, databases, wikis, and project tracking.",
    cap: ["Pages", "Databases", "Blocks", "Search", "Comments", "Users", "Relations", "Formulas"],
    f: [
      { k: "api_key", lb: "Integration Token", ph: "ntn_...", s: true, h: "Internal integration secret", lk: "https://www.notion.so/my-integrations", ll: "My Integrations > New > Internal > Secret" },
    ],
  },
  gdrive: {
    l: "Google Drive", logo: "gdrive", c: "#4285f4",
    d: "Cloud storage - files, folders, sharing, search, and collaboration.",
    cap: ["Upload/Download", "Folders", "Sharing", "Search", "Permissions", "Revisions", "Export", "Thumbnails"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Same as Gmail if using Google Cloud", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
    ],
  },
  whatsapp: {
    l: "WhatsApp", logo: "whatsapp", c: "#25d366",
    d: "Business messaging - send templates, media, and manage conversations at scale.",
    cap: ["Send Messages", "Templates", "Media", "Contacts", "Groups", "Status", "Webhooks", "Business Profile"],
    f: [
      { k: "token", lb: "Access Token", ph: "EAAxxxxx...", s: true, h: "WhatsApp Business API token", lk: "https://developers.facebook.com/apps/", ll: "Meta Developers > App > WhatsApp > API Setup" },
      { k: "phone_id", lb: "Phone Number ID", ph: "1234567890", h: "Assigned phone ID", lk: "https://developers.facebook.com/apps/", ll: "WhatsApp > API Setup > Phone Number ID" },
    ],
  },
  outlook: {
    l: "Outlook", logo: "outlook", c: "#0078d4",
    d: "Microsoft email - send, read, calendar events, and contacts via Graph API.",
    cap: ["Send Email", "Read Mail", "Calendar", "Contacts", "Folders", "Attachments", "Search", "Rules"],
    f: [
      { k: "client_id", lb: "App (Client) ID", ph: "xxxxxxxx-xxxx-...", h: "Azure AD app registration", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "Azure > App Registrations > Your App > Overview" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxx", s: true, h: "Azure AD client secret", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "App > Certificates & Secrets > New" },
    ],
  },
  whimsical: {
    l: "Whimsical", logo: "whimsical", c: "#a855f7",
    d: "Visual collaboration - flowcharts, wireframes, mind maps, and docs.",
    cap: ["Flowcharts", "Wireframes", "Mind Maps", "Docs", "Sticky Notes", "Templates", "Export", "Embed"],
    f: [
      { k: "api_key", lb: "API Key", ph: "whim_...", s: true, h: "Whimsical API token", lk: "https://whimsical.com/settings", ll: "Settings > API > Generate Key" },
    ],
  },
  hubspot: {
    l: "HubSpot", logo: "hubspot", c: "#ff7a59",
    d: "CRM, marketing, sales, and service hub - contacts, deals, emails, and analytics.",
    cap: ["Contacts", "Deals", "Companies", "Emails", "Tickets", "Forms", "Workflows", "Analytics"],
    f: [
      { k: "access_token", lb: "Private App Token", ph: "pat-...", s: true, h: "Private app access token", lk: "https://app.hubspot.com/private-apps/", ll: "Settings > Integrations > Private Apps > Create" },
      { k: "portal_id", lb: "Hub ID", ph: "12345678", h: "Your HubSpot account ID", lk: "https://app.hubspot.com/account-and-billing/", ll: "Settings > Account > Hub ID (top-right)" },
    ],
  },
  salesforce: {
    l: "Salesforce", logo: "salesforce", c: "#00a1e0",
    d: "Enterprise CRM - leads, opportunities, accounts, reports, and workflow rules.",
    cap: ["Leads", "Opportunities", "Accounts", "Contacts", "Reports", "Dashboards", "Flows", "Apex"],
    f: [
      { k: "client_id", lb: "Connected App Key", ph: "3MVG9...", h: "Connected App consumer key", lk: "https://login.salesforce.com/", ll: "Setup > Apps > App Manager > Connected App > Consumer Key" },
      { k: "client_secret", lb: "Consumer Secret", ph: "xxxxxxxx", s: true, h: "Connected App consumer secret", lk: "https://login.salesforce.com/", ll: "App Manager > Your App > Consumer Secret" },
      { k: "instance_url", lb: "Instance URL", ph: "https://xxx.my.salesforce.com", h: "Your Salesforce domain", lk: "https://login.salesforce.com/", ll: "Login > URL shown in browser" },
    ],
  },
  sendgrid: {
    l: "SendGrid", logo: "sendgrid", c: "#1a82e2",
    d: "Transactional and marketing email - templates, analytics, and deliverability.",
    cap: ["Send Email", "Templates", "Lists", "Segments", "Analytics", "Webhooks", "Suppressions", "IP Management"],
    f: [
      { k: "api_key", lb: "API Key", ph: "SG.xxxx...", s: true, h: "Full access or restricted", lk: "https://app.sendgrid.com/settings/api_keys", ll: "Settings > API Keys > Create" },
    ],
  },
  twilio: {
    l: "Twilio", logo: "twilio", c: "#f22f46",
    d: "Communications platform - SMS, voice, video, and WhatsApp messaging.",
    cap: ["SMS", "Voice Calls", "WhatsApp", "Video", "Verify", "Lookup", "Studio Flows", "Conversations"],
    f: [
      { k: "account_sid", lb: "Account SID", ph: "ACxxxxxxxx...", h: "Account identifier", lk: "https://console.twilio.com/", ll: "Console > Account > Account SID" },
      { k: "auth_token", lb: "Auth Token", ph: "xxxxxxxx", s: true, h: "Account auth token", lk: "https://console.twilio.com/", ll: "Console > Account > Auth Token" },
    ],
  },
  mcpfed: {
    l: "MCPFED", logo: "mcpfed", c: "#7c3aed",
    d: "MCP Federation - discover, publish, and manage AI tool servers. The App Store for MCP.",
    cap: ["Server Registry", "One-Click Install", "Publish", "Analytics", "Orgs", "Versioning", ".0n Standard", "API"],
    f: [
      { k: "api_key", lb: "Federation Key", ph: "mf_live_...", s: true, h: "Registry API auth", lk: "https://mcpfed.com/settings/api", ll: "MCPFED > Settings > API Keys" },
      { k: "org_id", lb: "Org ID", ph: "org_...", h: "Publisher org ID", lk: "https://mcpfed.com/dashboard", ll: "Dashboard > Organization > ID" },
    ],
  },
};

/** All service keys as a typed array */
export const SERVICE_KEYS = Object.keys(SVC) as Array<keyof typeof SVC>;

/** Total number of registered services */
export const SERVICE_COUNT = SERVICE_KEYS.length;
