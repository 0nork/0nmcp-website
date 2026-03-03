/**
 * 0n Console — Service Definitions (Single Source of Truth)
 *
 * All 48 services from the 0nMCP catalog + 10 additional platform services.
 * Used by: VaultOverlay, VaultDetail, OnCall, Recommendations, Wizard.
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
  /** Category for grouping in vault UI */
  cat: 'ai' | 'crm' | 'database' | 'messaging' | 'email' | 'dev' | 'cloud' | 'social' | 'ads' | 'finance' | 'productivity' | 'ecommerce' | 'automation';
  /** Priority order for vault display (lower = higher priority) */
  pri: number;
}

export const SVC: Record<string, ServiceConfig> = {
  // ─── AI / LLM ──────────────────────────────────────────────
  anthropic: {
    l: "Anthropic", logo: "anthropic", c: "#d4a574", cat: "ai", pri: 1,
    d: "Claude AI - advanced reasoning, analysis, coding, 200K context, tool use.",
    cap: ["Claude Opus/Sonnet", "200K Context", "Code Gen", "Vision", "Tool Use", "JSON Output", "Batch API", "Analysis"],
    f: [
      { k: "api_key", lb: "API Key", ph: "sk-ant-api03-...", s: true, h: "Per-token billing", lk: "https://console.anthropic.com/settings/keys", ll: "Console > Settings > API Keys" },
    ],
  },
  openai: {
    l: "OpenAI", logo: "openai", c: "#10a37f", cat: "ai", pri: 2,
    d: "GPT-4o, DALL-E, Whisper, Embeddings - versatile AI for generation and analysis.",
    cap: ["GPT-4o", "DALL-E", "Whisper", "Embeddings", "Functions", "JSON Mode", "Vision", "Fine-tuning"],
    f: [
      { k: "api_key", lb: "API Key", ph: "sk-proj-...", s: true, h: "Project-scoped key", lk: "https://platform.openai.com/api-keys", ll: "Platform > API Keys > Create" },
    ],
  },
  gemini: {
    l: "Gemini", logo: "gemini", c: "#4285f4", cat: "ai", pri: 3,
    d: "Google's multimodal AI - text, images, code, and long-context reasoning up to 2M tokens.",
    cap: ["Gemini Pro/Ultra", "2M Context", "Multimodal", "Code Gen", "Grounding", "Search", "JSON Output", "Vision"],
    f: [
      { k: "api_key", lb: "API Key", ph: "AIzaSy...", s: true, h: "Google AI Studio key", lk: "https://aistudio.google.com/apikey", ll: "AI Studio > Get API Key > Create" },
    ],
  },
  perplexity: {
    l: "Perplexity", logo: "perplexity", c: "#20b8cd", cat: "ai", pri: 4,
    d: "AI-powered search engine API - real-time web answers with citations.",
    cap: ["Web Search", "Citations", "Sonar Models", "Real-time Data", "Structured Output", "Focus Modes", "Follow-ups", "Pro Search"],
    f: [
      { k: "api_key", lb: "API Key", ph: "pplx-...", s: true, h: "Perplexity API key", lk: "https://www.perplexity.ai/settings/api", ll: "Settings > API > Generate Key" },
    ],
  },

  // ─── CRM / Sales ───────────────────────────────────────────
  crm: {
    l: "CRM", logo: "rocket", c: "#7c3aed", cat: "crm", pri: 5,
    d: "All-in-one CRM for contacts, pipelines, workflows, calendars, invoicing, and automation. 245 tools.",
    cap: ["Contacts", "Pipelines", "Workflows", "Calendar", "Invoicing", "SMS/Email", "Opportunities", "50+ Webhooks"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "690ffe...", h: "Marketplace app ID", lk: "https://marketplace.gohighlevel.com/apps", ll: "Marketplace > My Apps > Settings" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxx-xxxx", s: true, h: "OAuth secret", lk: "https://marketplace.gohighlevel.com/apps", ll: "My Apps > Settings > Secret" },
      { k: "location_id", lb: "Location ID", ph: "ve9EPM...", h: "Sub-account ID", lk: "https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken/", ll: "Settings > Business Profile > Location ID" },
    ],
  },
  hubspot: {
    l: "HubSpot", logo: "hubspot", c: "#ff7a59", cat: "crm", pri: 10,
    d: "CRM, marketing, sales, and service hub - contacts, deals, emails, and analytics.",
    cap: ["Contacts", "Deals", "Companies", "Emails", "Tickets", "Forms", "Workflows", "Analytics"],
    f: [
      { k: "access_token", lb: "Private App Token", ph: "pat-...", s: true, h: "Private app access token", lk: "https://app.hubspot.com/private-apps/", ll: "Settings > Integrations > Private Apps > Create" },
      { k: "portal_id", lb: "Hub ID", ph: "12345678", h: "Your HubSpot account ID", lk: "https://app.hubspot.com/account-and-billing/", ll: "Settings > Account > Hub ID (top-right)" },
    ],
  },
  salesforce: {
    l: "Salesforce", logo: "salesforce", c: "#00a1e0", cat: "crm", pri: 11,
    d: "Enterprise CRM - leads, opportunities, accounts, reports, and workflow rules.",
    cap: ["Leads", "Opportunities", "Accounts", "Contacts", "Reports", "Dashboards", "Flows", "Apex"],
    f: [
      { k: "client_id", lb: "Connected App Key", ph: "3MVG9...", h: "Connected App consumer key", lk: "https://login.salesforce.com/", ll: "Setup > Apps > App Manager > Connected App > Consumer Key" },
      { k: "client_secret", lb: "Consumer Secret", ph: "xxxxxxxx", s: true, h: "Connected App consumer secret", lk: "https://login.salesforce.com/", ll: "App Manager > Your App > Consumer Secret" },
      { k: "instance_url", lb: "Instance URL", ph: "https://xxx.my.salesforce.com", h: "Your Salesforce domain", lk: "https://login.salesforce.com/", ll: "Login > URL shown in browser" },
    ],
  },
  pipedrive: {
    l: "Pipedrive", logo: "pipedrive", c: "#017737", cat: "crm", pri: 12,
    d: "Sales CRM - deals, contacts, activities, pipelines, and email tracking.",
    cap: ["Deals", "Contacts", "Activities", "Pipelines", "Products", "Email Tracking", "Webhooks", "Reports"],
    f: [
      { k: "api_key", lb: "API Token", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Personal API token", lk: "https://app.pipedrive.com/settings/api", ll: "Settings > Personal Preferences > API" },
      { k: "company_domain", lb: "Company Domain", ph: "yourcompany", h: "Your Pipedrive subdomain", lk: "https://app.pipedrive.com/", ll: "Your URL: yourcompany.pipedrive.com" },
    ],
  },
  intercom: {
    l: "Intercom", logo: "intercom", c: "#286efa", cat: "crm", pri: 13,
    d: "Customer messaging - live chat, bots, help center, and customer data platform.",
    cap: ["Live Chat", "Bots", "Help Center", "Inbox", "Contacts", "Companies", "Tags", "Events"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "dG9rOi...", s: true, h: "Intercom access token", lk: "https://app.intercom.com/a/apps/_/developer-hub", ll: "Settings > Developers > Your App > Access Token" },
    ],
  },

  // ─── Database / Backend ────────────────────────────────────
  supabase: {
    l: "Supabase", logo: "supabase", c: "#3ecf8e", cat: "database", pri: 6,
    d: "Open-source PostgreSQL database, auth, real-time, edge functions, and storage.",
    cap: ["Database", "Auth", "Real-time", "Storage", "Edge Functions", "REST API", "RLS", "Webhooks"],
    f: [
      { k: "url", lb: "Project URL", ph: "https://xxx.supabase.co", h: "Unique project URL", lk: "https://supabase.com/dashboard/projects", ll: "Dashboard > Project > Settings > API" },
      { k: "anon_key", lb: "Anon Key", ph: "eyJhbG...", h: "Client-safe, respects RLS", lk: "https://supabase.com/dashboard/project/_/settings/api", ll: "Settings > API > anon public" },
      { k: "service_role", lb: "Service Role", ph: "eyJhbG...", s: true, h: "Bypasses RLS - server only", lk: "https://supabase.com/dashboard/project/_/settings/api", ll: "Settings > API > service_role" },
    ],
  },
  mongodb: {
    l: "MongoDB", logo: "mongodb", c: "#00ed64", cat: "database", pri: 20,
    d: "Document database - flexible schemas, aggregation, atlas search, and real-time sync.",
    cap: ["CRUD", "Aggregation", "Atlas Search", "Change Streams", "Indexes", "Transactions", "Time Series", "Charts"],
    f: [
      { k: "connection_string", lb: "Connection String", ph: "mongodb+srv://...", s: true, h: "Atlas connection URI", lk: "https://cloud.mongodb.com/", ll: "Atlas > Database > Connect > Drivers" },
      { k: "app_id", lb: "Data API App ID", ph: "data-xxxxx", h: "Data API application ID", lk: "https://cloud.mongodb.com/", ll: "Atlas > Data API > App ID" },
      { k: "api_key", lb: "Data API Key", ph: "xxxxxxxx", s: true, h: "Data API key", lk: "https://cloud.mongodb.com/", ll: "Atlas > Data API > Create API Key" },
    ],
  },
  airtable: {
    l: "Airtable", logo: "airtable", c: "#18bfff", cat: "database", pri: 21,
    d: "Spreadsheet-database hybrid - bases, records, views, automations, and interfaces.",
    cap: ["Records", "Bases", "Views", "Automations", "Interfaces", "Formulas", "Attachments", "Webhooks"],
    f: [
      { k: "api_key", lb: "Personal Access Token", ph: "pat...", s: true, h: "Personal access token", lk: "https://airtable.com/create/tokens", ll: "Developer Hub > Personal Access Tokens > Create" },
    ],
  },

  // ─── Payments / Finance ────────────────────────────────────
  stripe: {
    l: "Stripe", logo: "stripe", c: "#635bff", cat: "finance", pri: 7,
    d: "Payments, subscriptions, invoices, disputes, and revenue tracking.",
    cap: ["Payments", "Subscriptions", "Invoices", "Customers", "Coupons", "Payment Links", "Refunds", "Webhooks"],
    f: [
      { k: "secret_key", lb: "Secret Key", ph: "sk_live_...", s: true, h: "Server-side API key", lk: "https://dashboard.stripe.com/apikeys", ll: "Developers > API Keys > Secret" },
      { k: "webhook_secret", lb: "Webhook Secret", ph: "whsec_...", s: true, h: "Verify webhook signatures", lk: "https://dashboard.stripe.com/webhooks", ll: "Webhooks > Signing Secret" },
    ],
  },
  square: {
    l: "Square", logo: "square", c: "#006aff", cat: "finance", pri: 30,
    d: "Payments, POS, invoices, inventory, and e-commerce for in-person and online.",
    cap: ["Payments", "POS", "Invoices", "Inventory", "Customers", "Catalog", "Orders", "Loyalty"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "EAAAxxxxxxxx", s: true, h: "Square access token", lk: "https://developer.squareup.com/apps", ll: "Developer Dashboard > App > Credentials" },
      { k: "location_id", lb: "Location ID", ph: "Lxxxxxxxx", h: "Square location ID", lk: "https://developer.squareup.com/apps", ll: "Developer Dashboard > Locations" },
    ],
  },
  plaid: {
    l: "Plaid", logo: "plaid", c: "#111111", cat: "finance", pri: 31,
    d: "Financial data API - bank connections, transactions, identity, and income verification.",
    cap: ["Bank Connect", "Transactions", "Balance", "Identity", "Income", "Assets", "Investments", "Liabilities"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "xxxxxxxxxxxxxxxxxxxxxxxx", h: "Plaid client ID", lk: "https://dashboard.plaid.com/team/keys", ll: "Dashboard > Team Settings > Keys" },
      { k: "secret", lb: "Secret", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "Plaid secret (sandbox/development/production)", lk: "https://dashboard.plaid.com/team/keys", ll: "Dashboard > Team Settings > Keys" },
    ],
  },
  quickbooks: {
    l: "QuickBooks", logo: "quickbooks", c: "#2ca01c", cat: "finance", pri: 32,
    d: "Accounting - invoices, expenses, reports, payroll, and tax prep.",
    cap: ["Invoices", "Expenses", "Customers", "Vendors", "Reports", "Payments", "Payroll", "Tax"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "ABxxxxxxxx", h: "Intuit app client ID", lk: "https://developer.intuit.com/app/developer/dashboard", ll: "Developer Portal > Dashboard > Keys & OAuth" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxx", s: true, h: "OAuth client secret", lk: "https://developer.intuit.com/app/developer/dashboard", ll: "Dashboard > Keys & OAuth > Client Secret" },
      { k: "realm_id", lb: "Realm ID (Company ID)", ph: "1234567890", h: "QuickBooks company ID", lk: "https://developer.intuit.com/app/developer/dashboard", ll: "Dashboard > Sandbox/Production company" },
    ],
  },

  // ─── Messaging / Chat ──────────────────────────────────────
  slack: {
    l: "Slack", logo: "slack", c: "#e01e5a", cat: "messaging", pri: 14,
    d: "Team messaging - send messages, manage channels, post notifications, and build bots.",
    cap: ["Send Messages", "Channels", "Threads", "Reactions", "File Upload", "Blocks", "Webhooks", "Bot Users"],
    f: [
      { k: "bot_token", lb: "Bot Token", ph: "xoxb-...", s: true, h: "Bot user OAuth token", lk: "https://api.slack.com/apps", ll: "Apps > Your App > OAuth > Bot Token" },
      { k: "webhook_url", lb: "Webhook URL", ph: "https://hooks.slack.com/...", h: "Incoming webhook URL", lk: "https://api.slack.com/apps", ll: "App > Incoming Webhooks > Add" },
    ],
  },
  discord: {
    l: "Discord", logo: "discord", c: "#5865f2", cat: "messaging", pri: 15,
    d: "Community platform - servers, channels, bots, webhooks, and slash commands.",
    cap: ["Messages", "Channels", "Webhooks", "Slash Commands", "Embeds", "Reactions", "Threads", "Roles"],
    f: [
      { k: "bot_token", lb: "Bot Token", ph: "MTxxxxxxx...", s: true, h: "Discord bot token", lk: "https://discord.com/developers/applications", ll: "Developer Portal > Bot > Token" },
      { k: "webhook_url", lb: "Webhook URL", ph: "https://discord.com/api/webhooks/...", h: "Channel webhook URL", lk: "https://discord.com/developers/docs/resources/webhook", ll: "Server > Channel Settings > Integrations > Webhooks" },
    ],
  },
  whatsapp: {
    l: "WhatsApp", logo: "whatsapp", c: "#25d366", cat: "messaging", pri: 16,
    d: "Business messaging - send templates, media, and manage conversations at scale.",
    cap: ["Send Messages", "Templates", "Media", "Contacts", "Groups", "Status", "Webhooks", "Business Profile"],
    f: [
      { k: "token", lb: "Access Token", ph: "EAAxxxxx...", s: true, h: "WhatsApp Business API token", lk: "https://developers.facebook.com/apps/", ll: "Meta Developers > App > WhatsApp > API Setup" },
      { k: "phone_id", lb: "Phone Number ID", ph: "1234567890", h: "Assigned phone ID", lk: "https://developers.facebook.com/apps/", ll: "WhatsApp > API Setup > Phone Number ID" },
    ],
  },
  twilio: {
    l: "Twilio", logo: "twilio", c: "#f22f46", cat: "messaging", pri: 17,
    d: "Communications platform - SMS, voice, video, and WhatsApp messaging.",
    cap: ["SMS", "Voice Calls", "WhatsApp", "Video", "Verify", "Lookup", "Studio Flows", "Conversations"],
    f: [
      { k: "account_sid", lb: "Account SID", ph: "ACxxxxxxxx...", h: "Account identifier", lk: "https://console.twilio.com/", ll: "Console > Account > Account SID" },
      { k: "auth_token", lb: "Auth Token", ph: "xxxxxxxx", s: true, h: "Account auth token", lk: "https://console.twilio.com/", ll: "Console > Account > Auth Token" },
    ],
  },
  zoom: {
    l: "Zoom", logo: "zoom", c: "#2d8cff", cat: "messaging", pri: 18,
    d: "Video conferencing - meetings, webinars, recordings, and phone.",
    cap: ["Meetings", "Recordings", "Webinars", "Users", "Reports", "Chat", "Phone", "Rooms"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "xxxxxxxx", h: "OAuth app client ID", lk: "https://marketplace.zoom.us/develop/create", ll: "Zoom Marketplace > Build App > OAuth > Client ID" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxx", s: true, h: "OAuth app client secret", lk: "https://marketplace.zoom.us/develop/create", ll: "Zoom Marketplace > Build App > OAuth > Client Secret" },
      { k: "account_id", lb: "Account ID", ph: "xxxxxxxx", h: "Your Zoom account ID", lk: "https://marketplace.zoom.us/", ll: "Zoom Marketplace > Manage > App Credentials" },
    ],
  },

  // ─── Email ─────────────────────────────────────────────────
  gmail: {
    l: "Gmail", logo: "gmail", c: "#d93025", cat: "email", pri: 22,
    d: "Send and manage email via Google's API - compose, read, labels, and search.",
    cap: ["Send Email", "Read Inbox", "Labels", "Search", "Attachments", "Drafts", "Threads", "Filters"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud Console OAuth", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials > OAuth" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 client secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Client Secret" },
    ],
  },
  sendgrid: {
    l: "SendGrid", logo: "sendgrid", c: "#1a82e2", cat: "email", pri: 23,
    d: "Transactional and marketing email - templates, analytics, and deliverability.",
    cap: ["Send Email", "Templates", "Lists", "Segments", "Analytics", "Webhooks", "Suppressions", "IP Management"],
    f: [
      { k: "api_key", lb: "API Key", ph: "SG.xxxx...", s: true, h: "Full access or restricted", lk: "https://app.sendgrid.com/settings/api_keys", ll: "Settings > API Keys > Create" },
    ],
  },
  resend: {
    l: "Resend", logo: "resend", c: "#000000", cat: "email", pri: 24,
    d: "Modern email API - fast delivery, React templates, domains, and webhooks.",
    cap: ["Send Email", "React Templates", "Domains", "Webhooks", "Analytics", "Contacts", "Audiences", "Broadcasts"],
    f: [
      { k: "api_key", lb: "API Key", ph: "re_...", s: true, h: "Resend API key", lk: "https://resend.com/api-keys", ll: "Dashboard > API Keys > Create" },
    ],
  },
  mailchimp: {
    l: "Mailchimp", logo: "mailchimp", c: "#ffe01b", cat: "email", pri: 25,
    d: "Email marketing - campaigns, audiences, automations, and landing pages.",
    cap: ["Campaigns", "Lists", "Templates", "Automations", "Segments", "Analytics", "Landing Pages", "A/B Testing"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxx-us21", s: true, h: "API key with data center suffix", lk: "https://us21.admin.mailchimp.com/account/api/", ll: "Account > Extras > API Keys > Create" },
    ],
  },
  outlook: {
    l: "Outlook", logo: "outlook", c: "#0078d4", cat: "email", pri: 26,
    d: "Microsoft email - send, read, calendar events, and contacts via Graph API.",
    cap: ["Send Email", "Read Mail", "Calendar", "Contacts", "Folders", "Attachments", "Search", "Rules"],
    f: [
      { k: "client_id", lb: "App (Client) ID", ph: "xxxxxxxx-xxxx-...", h: "Azure AD app registration", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "Azure > App Registrations > Your App > Overview" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxx", s: true, h: "Azure AD client secret", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "App > Certificates & Secrets > New" },
    ],
  },

  // ─── Dev / Code ────────────────────────────────────────────
  github: {
    l: "GitHub", logo: "github", c: "#e2e2e2", cat: "dev", pri: 8,
    d: "Code hosting, PRs, CI/CD, issues, actions, releases, and collaboration.",
    cap: ["Repos", "Pull Requests", "Actions", "Issues", "Releases", "Branch Rules", "Webhooks", "Pages"],
    f: [
      { k: "token", lb: "PAT", ph: "ghp_...", s: true, h: "Fine-grained recommended", lk: "https://github.com/settings/tokens?type=beta", ll: "Settings > Tokens > Fine-grained" },
      { k: "repo", lb: "Repository", ph: "org/repo", h: "owner/repo format", lk: "https://github.com", ll: "Your repo URL path" },
    ],
  },
  vercel: {
    l: "Vercel", logo: "vercel", c: "#e2e2e2", cat: "cloud", pri: 9,
    d: "Frontend deployment - instant deploys, previews, edge functions, analytics.",
    cap: ["Git Deploys", "Previews", "Edge Functions", "Serverless", "Analytics", "Domains", "Env Vars", "Rollback"],
    f: [
      { k: "token", lb: "Access Token", ph: "vercel_...", s: true, h: "Deployment token", lk: "https://vercel.com/account/tokens", ll: "Account > Tokens > Create" },
      { k: "project_id", lb: "Project ID", ph: "prj_...", h: "In project settings", lk: "https://vercel.com/dashboard", ll: "Dashboard > Project > Settings" },
    ],
  },
  linear: {
    l: "Linear", logo: "linear", c: "#5e6ad2", cat: "dev", pri: 33,
    d: "Modern issue tracking - issues, projects, cycles, and roadmaps for engineering teams.",
    cap: ["Issues", "Projects", "Cycles", "Roadmaps", "Labels", "Workflows", "Webhooks", "Git Integration"],
    f: [
      { k: "api_key", lb: "API Key", ph: "lin_api_...", s: true, h: "Personal API key", lk: "https://linear.app/settings/api", ll: "Settings > API > Personal API Keys > Create" },
    ],
  },
  jira: {
    l: "Jira", logo: "jira", c: "#0052cc", cat: "dev", pri: 34,
    d: "Project tracking - issues, sprints, boards, and agile workflows.",
    cap: ["Issues", "Projects", "Sprints", "Boards", "Workflows", "Components", "Versions", "Dashboards"],
    f: [
      { k: "email", lb: "Email", ph: "you@company.com", h: "Atlassian account email", lk: "https://id.atlassian.com/manage-profile/security/api-tokens", ll: "Atlassian Account > Security > API Tokens" },
      { k: "api_token", lb: "API Token", ph: "xxxxxxxx", s: true, h: "Atlassian API token", lk: "https://id.atlassian.com/manage-profile/security/api-tokens", ll: "Security > Create API Token" },
      { k: "domain", lb: "Jira Domain", ph: "yourcompany.atlassian.net", h: "Your Atlassian site URL", lk: "https://admin.atlassian.com/", ll: "Your Jira site URL" },
    ],
  },

  // ─── Cloud / Infrastructure ────────────────────────────────
  azure: {
    l: "Microsoft Azure", logo: "azure", c: "#0078d4", cat: "cloud", pri: 35,
    d: "Cloud computing - VMs, databases, AI services, DevOps, and enterprise infrastructure.",
    cap: ["VMs", "Databases", "AI Services", "Functions", "Storage", "DevOps", "Containers", "Networking"],
    f: [
      { k: "client_id", lb: "App (Client) ID", ph: "xxxxxxxx-xxxx-...", h: "Azure AD app registration", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "Azure Portal > App Registrations > Client ID" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxx", s: true, h: "Azure AD client secret", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "App Registrations > Certificates & Secrets" },
      { k: "tenant_id", lb: "Tenant ID", ph: "xxxxxxxx-xxxx-...", h: "Azure AD tenant", lk: "https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview", ll: "Azure AD > Overview > Tenant ID" },
    ],
  },
  microsoft: {
    l: "Microsoft 365", logo: "microsoft", c: "#00a4ef", cat: "cloud", pri: 36,
    d: "Microsoft 365 services - Teams, Mail, OneDrive, Calendar, and SharePoint via Graph API.",
    cap: ["Mail", "Teams", "Calendar", "OneDrive", "SharePoint", "Contacts", "Planner", "OneNote"],
    f: [
      { k: "client_id", lb: "App (Client) ID", ph: "xxxxxxxx-xxxx-...", h: "Azure AD app registration", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "Azure Portal > App Registrations" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxx", s: true, h: "Azure AD client secret", lk: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", ll: "Certificates & Secrets > New Client Secret" },
    ],
  },
  dropbox: {
    l: "Dropbox", logo: "dropbox", c: "#0061ff", cat: "cloud", pri: 37,
    d: "Cloud storage - files, folders, sharing, team management, and paper docs.",
    cap: ["Files", "Folders", "Sharing", "Team", "Paper", "Search", "Thumbnails", "Webhooks"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "sl.xxxxxxxx", s: true, h: "Dropbox access token", lk: "https://www.dropbox.com/developers/apps", ll: "App Console > Your App > Generate Access Token" },
    ],
  },

  // ─── Social Media ──────────────────────────────────────────
  linkedin: {
    l: "LinkedIn", logo: "linkedin", c: "#0a66c2", cat: "social", pri: 40,
    d: "Professional network - posts, company pages, messaging, and profile management.",
    cap: ["Posts", "Company Pages", "Messaging", "Profiles", "Connections", "Analytics", "Ads", "Groups"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "AQVxxxxxxx...", s: true, h: "LinkedIn OAuth access token", lk: "https://www.linkedin.com/developers/apps", ll: "Developer Portal > Your App > Auth" },
    ],
  },
  instagram: {
    l: "Instagram", logo: "instagram", c: "#e4405f", cat: "social", pri: 41,
    d: "Social media - posts, stories, reels, insights, and comment management via Graph API.",
    cap: ["Posts", "Stories", "Reels", "Comments", "Insights", "Hashtags", "Mentions", "Media Upload"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "IGQVxxxxxxx...", s: true, h: "Instagram Graph API token", lk: "https://developers.facebook.com/apps/", ll: "Meta Developers > App > Instagram > API Setup" },
      { k: "business_account_id", lb: "Business Account ID", ph: "17841400000000", h: "Instagram Business Account ID", lk: "https://developers.facebook.com/apps/", ll: "Graph API Explorer > me/accounts" },
    ],
  },
  twitter: {
    l: "X (Twitter)", logo: "twitter", c: "#000000", cat: "social", pri: 42,
    d: "Social platform - tweets, timelines, lists, and engagement via X API v2.",
    cap: ["Tweets", "Timeline", "Lists", "DMs", "Spaces", "Bookmarks", "Search", "Analytics"],
    f: [
      { k: "bearer_token", lb: "Bearer Token", ph: "AAAAAAAAAxxxxxxxxxx...", s: true, h: "X API v2 bearer token", lk: "https://developer.x.com/en/portal/dashboard", ll: "Developer Portal > Projects > Keys & Tokens" },
      { k: "api_key", lb: "API Key (Consumer Key)", ph: "xxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "OAuth 1.0a consumer key", lk: "https://developer.x.com/en/portal/dashboard", ll: "Developer Portal > Keys & Tokens > Consumer Keys" },
      { k: "api_secret", lb: "API Secret", ph: "xxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "OAuth 1.0a consumer secret", lk: "https://developer.x.com/en/portal/dashboard", ll: "Developer Portal > Keys & Tokens > Consumer Keys" },
    ],
  },
  tiktok: {
    l: "TikTok Business", logo: "tiktok", c: "#000000", cat: "social", pri: 43,
    d: "Short video platform - content publishing, analytics, and audience insights.",
    cap: ["Video Upload", "Analytics", "Comments", "User Info", "Sound", "Effects", "Insights", "Webhooks"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "act.xxxxxxxx", s: true, h: "TikTok business access token", lk: "https://business-api.tiktok.com/portal/apps", ll: "TikTok for Developers > App > Access Token" },
    ],
  },

  // ─── Advertising ───────────────────────────────────────────
  google_ads: {
    l: "Google Ads", logo: "google_ads", c: "#4285f4", cat: "ads", pri: 44,
    d: "Search, display, video, and shopping ads - campaigns, bidding, and reporting.",
    cap: ["Campaigns", "Ad Groups", "Keywords", "Bidding", "Reports", "Audiences", "Conversions", "Shopping"],
    f: [
      { k: "developer_token", lb: "Developer Token", ph: "xxxxxxxxxxxxxxxx", s: true, h: "MCC developer token", lk: "https://ads.google.com/aw/apicenter", ll: "Google Ads > Tools > API Center > Developer Token" },
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth client", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth client secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "customer_id", lb: "Customer ID", ph: "123-456-7890", h: "Google Ads customer ID", lk: "https://ads.google.com/", ll: "Top-right of Google Ads dashboard" },
    ],
  },
  facebook_ads: {
    l: "Facebook Ads", logo: "facebook_ads", c: "#1877f2", cat: "ads", pri: 45,
    d: "Social advertising - campaigns, ad sets, creatives, audiences, and pixel tracking.",
    cap: ["Campaigns", "Ad Sets", "Creatives", "Audiences", "Pixel", "Conversions", "Reports", "Lookalikes"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "EAAxxxxxxx...", s: true, h: "Meta Marketing API token", lk: "https://developers.facebook.com/tools/explorer/", ll: "Meta Business > Graph API Explorer > Generate Token" },
      { k: "ad_account_id", lb: "Ad Account ID", ph: "act_1234567890", h: "Ad account ID with act_ prefix", lk: "https://business.facebook.com/settings/ad-accounts", ll: "Business Settings > Ad Accounts" },
    ],
  },
  linkedin_ads: {
    l: "LinkedIn Ads", logo: "linkedin_ads", c: "#0a66c2", cat: "ads", pri: 46,
    d: "B2B advertising - sponsored content, InMail, lead gen forms, and account targeting.",
    cap: ["Campaigns", "Creatives", "Audiences", "Lead Gen Forms", "Conversions", "Reports", "InMail", "ABM"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "AQVxxxxxxx...", s: true, h: "LinkedIn Marketing API token", lk: "https://www.linkedin.com/developers/apps", ll: "Developer Portal > Your App > Auth" },
      { k: "ad_account_id", lb: "Ad Account ID", ph: "1234567890", h: "Sponsored account ID", lk: "https://www.linkedin.com/campaignmanager/", ll: "Campaign Manager > Account Settings" },
    ],
  },
  tiktok_ads: {
    l: "TikTok Ads", logo: "tiktok_ads", c: "#000000", cat: "ads", pri: 47,
    d: "TikTok advertising - campaigns, ad groups, creatives, audiences, and pixel.",
    cap: ["Campaigns", "Ad Groups", "Creatives", "Audiences", "Pixel", "Reports", "Spark Ads", "Conversions"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "xxxxxxxx", s: true, h: "TikTok Marketing API token", lk: "https://business-api.tiktok.com/portal/apps", ll: "TikTok for Developers > App > Access Token" },
      { k: "advertiser_id", lb: "Advertiser ID", ph: "1234567890", h: "TikTok advertiser ID", lk: "https://ads.tiktok.com/", ll: "TikTok Ads Manager > Account Settings" },
    ],
  },
  x_ads: {
    l: "X Ads", logo: "x_ads", c: "#000000", cat: "ads", pri: 48,
    d: "X (Twitter) advertising - promoted tweets, campaigns, targeting, and analytics.",
    cap: ["Campaigns", "Line Items", "Creatives", "Targeting", "Analytics", "Audiences", "Conversions", "Cards"],
    f: [
      { k: "bearer_token", lb: "Bearer Token", ph: "AAAAAAAAAxxxxxxxxxx...", s: true, h: "X Ads API bearer token", lk: "https://developer.x.com/en/portal/dashboard", ll: "Developer Portal > Keys & Tokens" },
      { k: "ads_account_id", lb: "Ads Account ID", ph: "xxxxxxxx", h: "X Ads account ID", lk: "https://ads.x.com/", ll: "X Ads Manager > Account" },
    ],
  },
  instagram_ads: {
    l: "Instagram Ads", logo: "instagram_ads", c: "#e4405f", cat: "ads", pri: 49,
    d: "Instagram advertising via Meta - stories, reels, explore, and shopping ads.",
    cap: ["Stories Ads", "Reels Ads", "Explore Ads", "Shopping Ads", "Audiences", "Reports", "Placements", "Creatives"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "EAAxxxxxxx...", s: true, h: "Same as Facebook Ads token (Meta Marketing API)", lk: "https://developers.facebook.com/tools/explorer/", ll: "Meta Business > Graph API Explorer" },
      { k: "ad_account_id", lb: "Ad Account ID", ph: "act_1234567890", h: "Meta ad account ID", lk: "https://business.facebook.com/settings/ad-accounts", ll: "Business Settings > Ad Accounts" },
    ],
  },

  // ─── Productivity ──────────────────────────────────────────
  notion: {
    l: "Notion", logo: "notion", c: "#e2e2e2", cat: "productivity", pri: 19,
    d: "All-in-one workspace - pages, databases, wikis, and project tracking.",
    cap: ["Pages", "Databases", "Blocks", "Search", "Comments", "Users", "Relations", "Formulas"],
    f: [
      { k: "api_key", lb: "Integration Token", ph: "ntn_...", s: true, h: "Internal integration secret", lk: "https://www.notion.so/my-integrations", ll: "My Integrations > New > Internal > Secret" },
    ],
  },
  clickup: {
    l: "ClickUp", logo: "clickup", c: "#7b68ee", cat: "productivity", pri: 27,
    d: "Project management - tasks, docs, goals, dashboards, time tracking, and sprints.",
    cap: ["Tasks", "Spaces", "Docs", "Goals", "Time Tracking", "Dashboards", "Automations", "Sprints"],
    f: [
      { k: "api_key", lb: "API Key", ph: "pk_...", s: true, h: "Personal API token", lk: "https://app.clickup.com/settings/apps", ll: "Settings > Apps > API Token > Generate" },
    ],
  },
  asana: {
    l: "Asana", logo: "asana", c: "#f06a6a", cat: "productivity", pri: 28,
    d: "Work management - projects, tasks, portfolios, goals, and workflow automations.",
    cap: ["Projects", "Tasks", "Portfolios", "Goals", "Sections", "Custom Fields", "Automations", "Timeline"],
    f: [
      { k: "access_token", lb: "Personal Access Token", ph: "1/1234567890:xxxxxxxxxxxx", s: true, h: "Asana PAT", lk: "https://app.asana.com/0/my-apps", ll: "My Profile Settings > Apps > Manage Developer Apps > New Access Token" },
    ],
  },
  whimsical: {
    l: "Whimsical", logo: "whimsical", c: "#a855f7", cat: "productivity", pri: 29,
    d: "Visual collaboration - flowcharts, wireframes, mind maps, and docs.",
    cap: ["Flowcharts", "Wireframes", "Mind Maps", "Docs", "Sticky Notes", "Templates", "Export", "Embed"],
    f: [
      { k: "api_key", lb: "API Key", ph: "whim_...", s: true, h: "Whimsical API token", lk: "https://whimsical.com/settings", ll: "Settings > API > Generate Key" },
    ],
  },

  // ─── Google Workspace ──────────────────────────────────────
  google_drive: {
    l: "Google Drive", logo: "gdrive", c: "#4285f4", cat: "cloud", pri: 38,
    d: "Cloud storage - files, folders, sharing, search, and collaboration.",
    cap: ["Upload/Download", "Folders", "Sharing", "Search", "Permissions", "Revisions", "Export", "Thumbnails"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Same as Gmail if using Google Cloud", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
    ],
  },
  google_sheets: {
    l: "Google Sheets", logo: "gsheets", c: "#0f9d58", cat: "productivity", pri: 39,
    d: "Spreadsheet automation - read, write, formulas, charts, and data sync.",
    cap: ["Read/Write", "Formulas", "Charts", "Pivot Tables", "Sheets", "Formatting", "Named Ranges", "Data Validation"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Same Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
    ],
  },
  google_calendar: {
    l: "Google Calendar", logo: "gcalendar", c: "#4285f4", cat: "productivity", pri: 50,
    d: "Calendar scheduling - events, reminders, availability, and meeting rooms.",
    cap: ["Events", "Calendars", "Free/Busy", "Reminders", "Attendees", "Recurrence", "ACLs", "Colors"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
    ],
  },
  calendly: {
    l: "Calendly", logo: "calendly", c: "#006bff", cat: "productivity", pri: 51,
    d: "Appointment scheduling - event types, invitees, availability, and routing.",
    cap: ["Events", "Invitees", "Event Types", "Availability", "Routing", "Webhooks", "Users", "Organizations"],
    f: [
      { k: "api_key", lb: "Personal Access Token", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Calendly PAT", lk: "https://calendly.com/integrations/api_webhooks", ll: "Integrations > API & Webhooks > Generate Token" },
    ],
  },

  // ─── E-Commerce ────────────────────────────────────────────
  shopify: {
    l: "Shopify", logo: "shopify", c: "#96bf48", cat: "ecommerce", pri: 52,
    d: "E-commerce platform - products, orders, customers, inventory, and fulfillment.",
    cap: ["Products", "Orders", "Customers", "Inventory", "Fulfillment", "Discounts", "Themes", "Webhooks"],
    f: [
      { k: "store_domain", lb: "Store Domain", ph: "your-store.myshopify.com", h: "Your Shopify store URL", lk: "https://admin.shopify.com/", ll: "Admin > Settings > Domains" },
      { k: "access_token", lb: "Admin API Token", ph: "shpat_...", s: true, h: "Custom app admin API access token", lk: "https://admin.shopify.com/store/YOUR-STORE/settings/apps/development", ll: "Settings > Apps > Develop Apps > API Credentials" },
    ],
  },

  // ─── Support ───────────────────────────────────────────────
  zendesk: {
    l: "Zendesk", logo: "zendesk", c: "#03363d", cat: "crm", pri: 53,
    d: "Customer support - tickets, knowledge base, chat, and help center.",
    cap: ["Tickets", "Users", "Organizations", "Knowledge Base", "Chat", "Talk", "Automations", "SLA"],
    f: [
      { k: "email", lb: "Email", ph: "you@company.com", h: "Agent email", lk: "https://support.zendesk.com/hc/en-us/articles/4408889192858", ll: "Admin > Channels > API" },
      { k: "api_token", lb: "API Token", ph: "xxxxxxxx", s: true, h: "Zendesk API token", lk: "https://support.zendesk.com/hc/en-us/articles/4408889192858", ll: "Admin > Channels > API > Add API Token" },
      { k: "subdomain", lb: "Subdomain", ph: "yourcompany", h: "yourcompany.zendesk.com", lk: "https://www.zendesk.com/", ll: "Your Zendesk URL subdomain" },
    ],
  },

  // ─── Automation ────────────────────────────────────────────
  n8n: {
    l: "n8n", logo: "n8n", c: "#ff6d5a", cat: "automation", pri: 54,
    d: "Open-source workflow automation - 400+ integrations, visual builder, code nodes.",
    cap: ["Visual Builder", "400+ Integrations", "Webhooks", "Code Nodes", "AI Agents", "Error Handling", "Sub-workflows", "Credentials"],
    f: [
      { k: "url", lb: "Instance URL", ph: "https://xxx.app.n8n.cloud", h: "Cloud or self-hosted", lk: "https://app.n8n.cloud/manage", ll: "n8n Cloud > Manage > URL" },
      { k: "api_key", lb: "API Key", ph: "n8n_api_...", s: true, h: "Enable API first", lk: "https://docs.n8n.io/api/authentication/", ll: "Settings > API > Create Key" },
    ],
  },
  zapier: {
    l: "Zapier", logo: "zapier", c: "#ff4a00", cat: "automation", pri: 55,
    d: "Automation platform - connect apps, build zaps, and automate workflows.",
    cap: ["Zaps", "Triggers", "Actions", "Filters", "Paths", "Formatter", "Webhooks", "Tables"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "Zapier NLA API key", lk: "https://nla.zapier.com/credentials/", ll: "Zapier NLA > Credentials > API Key" },
    ],
  },
  mulesoft: {
    l: "MuleSoft", logo: "mulesoft", c: "#00a2df", cat: "automation", pri: 56,
    d: "Enterprise integration - APIs, connectors, data transformation, and governance.",
    cap: ["APIs", "Connectors", "DataWeave", "CloudHub", "API Manager", "Exchange", "Monitoring", "Governance"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", h: "Anypoint Platform client ID", lk: "https://anypoint.mulesoft.com/", ll: "Anypoint Platform > Access Management > Connected Apps" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "Connected app client secret", lk: "https://anypoint.mulesoft.com/", ll: "Access Management > Connected Apps > Secret" },
    ],
  },

  // ─── Cold Outreach ─────────────────────────────────────────
  smartlead: {
    l: "Smartlead", logo: "smartlead", c: "#3b82f6", cat: "email", pri: 57,
    d: "Cold email outreach - campaigns, leads, sequences, email accounts, and analytics.",
    cap: ["Campaigns", "Lead Lists", "Email Sequences", "Email Accounts", "Analytics", "A/B Testing", "Warmup", "Scheduling"],
    f: [
      { k: "api_key", lb: "API Key", ph: "sl_...", s: true, h: "Smartlead API key", lk: "https://app.smartlead.ai/app/settings/api", ll: "Settings > API > Generate Key" },
    ],
  },

  // ─── 0n Ecosystem ─────────────────────────────────────────
  mcpfed: {
    l: "MCPFED", logo: "mcpfed", c: "#7c3aed", cat: "dev", pri: 58,
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

/** Category labels for UI display */
export const CATEGORY_LABELS: Record<ServiceConfig['cat'], string> = {
  ai: 'AI / LLM',
  crm: 'CRM / Sales / Support',
  database: 'Database',
  messaging: 'Messaging / Chat',
  email: 'Email',
  dev: 'Development',
  cloud: 'Cloud / Storage',
  social: 'Social Media',
  ads: 'Advertising',
  finance: 'Payments / Finance',
  productivity: 'Productivity',
  ecommerce: 'E-Commerce',
  automation: 'Automation',
};

/** Category display order */
export const CATEGORY_ORDER: ServiceConfig['cat'][] = [
  'ai', 'crm', 'finance', 'database', 'dev', 'cloud',
  'messaging', 'email', 'social', 'ads', 'productivity',
  'ecommerce', 'automation',
];

/** Get services grouped by category, sorted by priority */
export function getServicesByCategory(): Record<string, Array<[string, ServiceConfig]>> {
  const grouped: Record<string, Array<[string, ServiceConfig]>> = {};
  for (const cat of CATEGORY_ORDER) {
    grouped[cat] = [];
  }
  for (const [key, svc] of Object.entries(SVC)) {
    if (!grouped[svc.cat]) grouped[svc.cat] = [];
    grouped[svc.cat].push([key, svc]);
  }
  // Sort each category by priority
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a, b) => a[1].pri - b[1].pri);
  }
  return grouped;
}
