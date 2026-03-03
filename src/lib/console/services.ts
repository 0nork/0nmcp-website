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
  cat: 'ai' | 'crm' | 'database' | 'messaging' | 'email' | 'dev' | 'cloud' | 'social' | 'ads' | 'finance' | 'productivity' | 'ecommerce' | 'automation' | 'video';
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
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
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
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
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
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  google_sheets: {
    l: "Google Sheets", logo: "gsheets", c: "#0f9d58", cat: "productivity", pri: 39,
    d: "Spreadsheet automation - read, write, formulas, charts, and data sync.",
    cap: ["Read/Write", "Formulas", "Charts", "Pivot Tables", "Sheets", "Formatting", "Named Ranges", "Data Validation"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Same Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  google_calendar: {
    l: "Google Calendar", logo: "gcalendar", c: "#4285f4", cat: "productivity", pri: 50,
    d: "Calendar scheduling - events, reminders, availability, and meeting rooms.",
    cap: ["Events", "Calendars", "Free/Busy", "Reminders", "Attendees", "Recurrence", "ACLs", "Colors"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  google_docs: {
    l: "Google Docs", logo: "gdocs", c: "#4285f4", cat: "productivity", pri: 100,
    d: "Document creation and editing - collaborative writing, templates, and export.",
    cap: ["Create Docs", "Edit Content", "Templates", "Export PDF", "Comments", "Suggestions", "Sharing", "Revisions"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  google_slides: {
    l: "Google Slides", logo: "gslides", c: "#f4b400", cat: "productivity", pri: 101,
    d: "Presentation creation - slides, themes, speaker notes, and collaborative editing.",
    cap: ["Create Slides", "Themes", "Speaker Notes", "Animations", "Charts", "Export", "Sharing", "Templates"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  google_forms: {
    l: "Google Forms", logo: "gforms", c: "#673ab7", cat: "productivity", pri: 102,
    d: "Form builder - surveys, quizzes, response collection, and analytics.",
    cap: ["Create Forms", "Responses", "Quizzes", "Logic", "Themes", "Analytics", "Export", "Notifications"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  google_tasks: {
    l: "Google Tasks", logo: "gtasks", c: "#4285f4", cat: "productivity", pri: 103,
    d: "Task management - create, organize, and track tasks integrated with Gmail and Calendar.",
    cap: ["Tasks", "Task Lists", "Due Dates", "Subtasks", "Notes", "Completion", "Ordering", "Sync"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  ga4: {
    l: "Google Analytics", logo: "ga4", c: "#e37400", cat: "productivity", pri: 104,
    d: "Web analytics - page views, sessions, conversions, audiences, and real-time data.",
    cap: ["Reports", "Real-time", "Audiences", "Conversions", "Events", "User Explorer", "Cohorts", "Funnels"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
      { k: "property_id", lb: "Property ID", ph: "123456789", h: "GA4 property ID (numeric)", lk: "https://analytics.google.com/analytics/web/#/a/p/admin/account", ll: "Analytics > Admin > Property > Property Details" },
    ],
  },
  google_business: {
    l: "Google Business", logo: "gbusiness", c: "#4285f4", cat: "crm", pri: 105,
    d: "Google Business Profile - manage listings, reviews, posts, and local SEO.",
    cap: ["Listings", "Reviews", "Posts", "Photos", "Q&A", "Insights", "Attributes", "Hours"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  search_console: {
    l: "Search Console", logo: "gsearch", c: "#4285f4", cat: "dev", pri: 106,
    d: "Google Search Console - search performance, indexing, sitemaps, and URL inspection.",
    cap: ["Search Analytics", "Index Coverage", "Sitemaps", "URL Inspection", "Mobile Usability", "Core Web Vitals", "Links", "Removals"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
      { k: "site_url", lb: "Site URL", ph: "https://yourdomain.com", h: "Verified property URL", lk: "https://search.google.com/search-console", ll: "Search Console > Properties" },
    ],
  },
  merchant_center: {
    l: "Merchant Center", logo: "gmerchant", c: "#4285f4", cat: "ecommerce", pri: 107,
    d: "Google Merchant Center - product feeds, shopping campaigns, and inventory management.",
    cap: ["Product Feeds", "Shopping Ads", "Inventory", "Promotions", "Local Inventory", "Reviews", "Reports", "Diagnostics"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
      { k: "merchant_id", lb: "Merchant ID", ph: "123456789", h: "Merchant Center account ID", lk: "https://merchants.google.com/", ll: "Merchant Center > Settings > Account Info" },
    ],
  },
  tag_manager: {
    l: "Tag Manager", logo: "gtm", c: "#4285f4", cat: "dev", pri: 108,
    d: "Google Tag Manager - manage tags, triggers, and variables without code changes.",
    cap: ["Containers", "Tags", "Triggers", "Variables", "Workspaces", "Versions", "Templates", "Consent"],
    f: [
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "Google Cloud OAuth credentials", lk: "https://console.cloud.google.com/apis/credentials", ll: "Cloud Console > APIs > Credentials" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
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

  // ─── GoHighLevel — THE BOLD MOVE ────────────────────────
  gohighlevel: {
    l: "GoHighLevel", logo: "gohighlevel", c: "#38b2ac", cat: "crm", pri: 6,
    d: "All-in-one CRM, funnels, websites, email/SMS, pipelines, calendars, workflows, reputation, memberships, invoicing, and blogging.",
    cap: ["CRM", "Funnels", "Landing Pages", "Email Marketing", "SMS", "Pipelines", "Calendars", "Workflows", "Reputation Management", "Memberships", "Surveys", "Invoicing", "Blogging"],
    f: [
      { k: "api_key", lb: "API Key", ph: "eyJhbGciOi...", s: true, h: "Agency or Location level API key", lk: "https://marketplace.gohighlevel.com/", ll: "Settings > Business Profile > API Key" },
      { k: "location_id", lb: "Location ID", ph: "ve9EPM...", h: "Sub-account Location ID", lk: "https://marketplace.gohighlevel.com/", ll: "Settings > Business Profile > Location ID" },
    ],
  },

  // ─── Additional AI ───────────────────────────────────────
  cohere: {
    l: "Cohere", logo: "cohere", c: "#39594d", cat: "ai", pri: 59,
    d: "Enterprise AI - embed, generate, rerank, and classify text with production-grade models.",
    cap: ["Generate", "Embed", "Rerank", "Classify", "Summarize", "Chat", "RAG", "Fine-tune"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Cohere API key", lk: "https://dashboard.cohere.com/api-keys", ll: "Dashboard > API Keys > Create" },
    ],
  },
  mistral: {
    l: "Mistral AI", logo: "mistral", c: "#f97316", cat: "ai", pri: 60,
    d: "Open-weight LLMs - Mistral, Mixtral, and Codestral for text, code, and embeddings.",
    cap: ["Chat", "Code Gen", "Embeddings", "Function Calling", "JSON Mode", "Vision", "Fine-tune", "Guardrails"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Mistral API key", lk: "https://console.mistral.ai/api-keys/", ll: "Console > API Keys > Create" },
    ],
  },
  replicate: {
    l: "Replicate", logo: "replicate", c: "#000000", cat: "ai", pri: 61,
    d: "Run open-source ML models in the cloud - Stable Diffusion, LLaMA, Whisper, and more.",
    cap: ["Image Gen", "Video Gen", "Audio", "LLMs", "Fine-tune", "Training", "Predictions", "Webhooks"],
    f: [
      { k: "api_key", lb: "API Token", ph: "r8_xxxxxxxx", s: true, h: "Replicate API token", lk: "https://replicate.com/account/api-tokens", ll: "Account > API Tokens > Create" },
    ],
  },
  stability: {
    l: "Stability AI", logo: "stability", c: "#a855f7", cat: "ai", pri: 62,
    d: "Image generation and editing - Stable Diffusion, SDXL, upscaling, and inpainting.",
    cap: ["Text-to-Image", "Image-to-Image", "Upscale", "Inpaint", "Outpaint", "Control", "3D", "Video"],
    f: [
      { k: "api_key", lb: "API Key", ph: "sk-xxxxxxxx", s: true, h: "Stability AI API key", lk: "https://platform.stability.ai/account/keys", ll: "Platform > Account > API Keys" },
    ],
  },
  elevenlabs: {
    l: "ElevenLabs", logo: "elevenlabs", c: "#000000", cat: "ai", pri: 63,
    d: "AI voice synthesis - text-to-speech, voice cloning, dubbing, and audio generation.",
    cap: ["Text-to-Speech", "Voice Cloning", "Dubbing", "Sound Effects", "Voice Library", "Projects", "Pronunciations", "Streaming"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "ElevenLabs API key", lk: "https://elevenlabs.io/app/settings/api-keys", ll: "Settings > API Keys > Create" },
    ],
  },
  deepgram: {
    l: "Deepgram", logo: "deepgram", c: "#13ef93", cat: "ai", pri: 64,
    d: "Speech AI - real-time transcription, text-to-speech, and audio intelligence.",
    cap: ["Transcription", "Text-to-Speech", "Real-time", "Summarization", "Topic Detection", "Sentiment", "Diarization", "Translation"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Deepgram API key", lk: "https://console.deepgram.com/project/keys", ll: "Console > Project > API Keys > Create" },
    ],
  },
  groq: {
    l: "Groq", logo: "groq", c: "#f55036", cat: "ai", pri: 65,
    d: "Ultra-fast LLM inference - LPU-powered, sub-second responses for Llama, Mixtral, Gemma.",
    cap: ["Chat", "Fast Inference", "Code Gen", "JSON Mode", "Tool Use", "Vision", "Streaming", "Batch"],
    f: [
      { k: "api_key", lb: "API Key", ph: "gsk_xxxxxxxx", s: true, h: "Groq API key", lk: "https://console.groq.com/keys", ll: "Console > API Keys > Create" },
    ],
  },

  // ─── Additional Database ─────────────────────────────────
  planetscale: {
    l: "PlanetScale", logo: "planetscale", c: "#000000", cat: "database", pri: 66,
    d: "Serverless MySQL - branching, deploy requests, and horizontal scaling.",
    cap: ["MySQL", "Branching", "Deploy Requests", "Insights", "Boost", "Connect", "Imports", "Webhooks"],
    f: [
      { k: "host", lb: "Host", ph: "aws.connect.psdb.cloud", h: "Database host", lk: "https://app.planetscale.com/", ll: "Dashboard > Database > Connect > Host" },
      { k: "username", lb: "Username", ph: "xxxxxxxx", h: "Branch credentials username", lk: "https://app.planetscale.com/", ll: "Database > Connect > Username" },
      { k: "password", lb: "Password", ph: "pscale_pw_xxxx", s: true, h: "Branch credentials password", lk: "https://app.planetscale.com/", ll: "Database > Connect > Password" },
    ],
  },
  neon: {
    l: "Neon", logo: "neon", c: "#00e599", cat: "database", pri: 67,
    d: "Serverless PostgreSQL - branching, autoscaling, and instant provisioning.",
    cap: ["PostgreSQL", "Branching", "Autoscale", "Connection Pooling", "Logical Replication", "Extensions", "SQL Editor", "API"],
    f: [
      { k: "connection_string", lb: "Connection String", ph: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb", s: true, h: "Neon database connection string", lk: "https://console.neon.tech/", ll: "Console > Project > Connection Details" },
      { k: "api_key", lb: "API Key", ph: "neon_xxxxxxxx", s: true, h: "Neon management API key", lk: "https://console.neon.tech/app/settings/api-keys", ll: "Account Settings > API Keys > Generate" },
    ],
  },
  turso: {
    l: "Turso", logo: "turso", c: "#4ff8d2", cat: "database", pri: 68,
    d: "Edge SQLite database - libSQL, embedded replicas, and global distribution.",
    cap: ["SQLite", "Edge Replicas", "Embedded", "Groups", "CLI", "Extensions", "Platform API", "Webhooks"],
    f: [
      { k: "url", lb: "Database URL", ph: "libsql://xxx-xxx.turso.io", h: "Turso database URL", lk: "https://turso.tech/app", ll: "Dashboard > Database > URL" },
      { k: "auth_token", lb: "Auth Token", ph: "eyJhbGciOi...", s: true, h: "Turso database auth token", lk: "https://turso.tech/app", ll: "Dashboard > Database > Generate Token" },
    ],
  },
  cockroachdb: {
    l: "CockroachDB", logo: "cockroachdb", c: "#6933ff", cat: "database", pri: 69,
    d: "Distributed SQL database - PostgreSQL-compatible, multi-region, and serverless.",
    cap: ["Distributed SQL", "Multi-Region", "Serverless", "Change Data Capture", "Import/Export", "Backup", "RBAC", "Monitoring"],
    f: [
      { k: "connection_string", lb: "Connection String", ph: "postgresql://user:pass@xxx.cockroachlabs.cloud:26257/defaultdb", s: true, h: "CockroachDB connection string", lk: "https://cockroachlabs.cloud/", ll: "Cockroach Cloud > Cluster > Connect" },
    ],
  },

  // ─── Additional Messaging ────────────────────────────────
  telegram: {
    l: "Telegram", logo: "telegram", c: "#26a5e4", cat: "messaging", pri: 70,
    d: "Messaging platform - bots, channels, groups, and inline mode.",
    cap: ["Send Messages", "Bots", "Channels", "Groups", "Inline Mode", "Payments", "Games", "Webhooks"],
    f: [
      { k: "bot_token", lb: "Bot Token", ph: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11", s: true, h: "Telegram Bot API token from @BotFather", lk: "https://t.me/BotFather", ll: "Telegram > @BotFather > /newbot > Token" },
    ],
  },

  // ─── Additional Email ────────────────────────────────────
  postmark: {
    l: "Postmark", logo: "postmark", c: "#ffde00", cat: "email", pri: 71,
    d: "Transactional email - fast delivery, templates, bounce tracking, and inbound processing.",
    cap: ["Send Email", "Templates", "Bounce Tracking", "Inbound", "Click Tracking", "Streams", "Stats", "Webhooks"],
    f: [
      { k: "server_token", lb: "Server API Token", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", s: true, h: "Server-level API token", lk: "https://account.postmarkapp.com/servers", ll: "Servers > Your Server > API Tokens" },
    ],
  },
  mailgun: {
    l: "Mailgun", logo: "mailgun", c: "#f06b54", cat: "email", pri: 72,
    d: "Email API - sending, receiving, tracking, and validation at scale.",
    cap: ["Send Email", "Receive Email", "Routes", "Templates", "Tracking", "Validation", "Suppressions", "Webhooks"],
    f: [
      { k: "api_key", lb: "API Key", ph: "key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "Mailgun private API key", lk: "https://app.mailgun.com/settings/api_security", ll: "Settings > API Security > API Keys" },
      { k: "domain", lb: "Domain", ph: "mg.yourdomain.com", h: "Verified sending domain", lk: "https://app.mailgun.com/sending/domains", ll: "Sending > Domains" },
    ],
  },
  convertkit: {
    l: "Kit (ConvertKit)", logo: "convertkit", c: "#fb6970", cat: "email", pri: 73,
    d: "Creator email marketing - subscribers, sequences, automations, and landing pages.",
    cap: ["Subscribers", "Sequences", "Broadcasts", "Forms", "Tags", "Automations", "Landing Pages", "Commerce"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Kit API key", lk: "https://app.kit.com/account_settings/developer_settings", ll: "Account Settings > Developer Settings > API Key" },
      { k: "api_secret", lb: "API Secret", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Kit API secret", lk: "https://app.kit.com/account_settings/developer_settings", ll: "Developer Settings > API Secret" },
    ],
  },
  brevo: {
    l: "Brevo", logo: "brevo", c: "#0b996e", cat: "email", pri: 74,
    d: "All-in-one CRM suite - email, SMS, chat, and marketing automation (formerly Sendinblue).",
    cap: ["Email", "SMS", "Chat", "Contacts", "Automations", "Templates", "Transactional", "WhatsApp"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xkeysib-xxxxxxxx", s: true, h: "Brevo API v3 key", lk: "https://app.brevo.com/settings/keys/api", ll: "Settings > SMTP & API > API Keys" },
    ],
  },
  activecampaign: {
    l: "ActiveCampaign", logo: "activecampaign", c: "#004cff", cat: "email", pri: 75,
    d: "Email marketing and CRM automation - contacts, deals, automations, and campaigns.",
    cap: ["Contacts", "Deals", "Automations", "Campaigns", "Lists", "Tags", "Scoring", "Webhooks"],
    f: [
      { k: "api_url", lb: "API URL", ph: "https://youraccountname.api-us1.com", h: "Account API URL", lk: "https://help.activecampaign.com/hc/en-us/articles/207317590", ll: "Settings > Developer > API Access > URL" },
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "ActiveCampaign API key", lk: "https://help.activecampaign.com/hc/en-us/articles/207317590", ll: "Settings > Developer > API Access > Key" },
    ],
  },
  lemlist: {
    l: "Lemlist", logo: "lemlist", c: "#6c5ce7", cat: "email", pri: 76,
    d: "Cold outreach - personalized email sequences, multichannel campaigns, and lead finder.",
    cap: ["Campaigns", "Sequences", "Leads", "Personalization", "Multichannel", "Analytics", "Warm-up", "Webhooks"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Lemlist API key", lk: "https://app.lemlist.com/settings/integrations", ll: "Settings > Integrations > API" },
    ],
  },

  // ─── Additional Cloud / Dev ──────────────────────────────
  cloudflare: {
    l: "Cloudflare", logo: "cloudflare", c: "#f38020", cat: "cloud", pri: 77,
    d: "Edge platform - CDN, DNS, Workers, Pages, R2 storage, and DDoS protection.",
    cap: ["Workers", "Pages", "R2 Storage", "DNS", "CDN", "Firewall", "Analytics", "D1 Database"],
    f: [
      { k: "api_token", lb: "API Token", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Scoped API token (recommended over Global)", lk: "https://dash.cloudflare.com/profile/api-tokens", ll: "Profile > API Tokens > Create Token" },
      { k: "account_id", lb: "Account ID", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", h: "Cloudflare account ID", lk: "https://dash.cloudflare.com/", ll: "Dashboard > Any domain > Overview > Account ID (right sidebar)" },
    ],
  },
  netlify: {
    l: "Netlify", logo: "netlify", c: "#00c7b7", cat: "cloud", pri: 78,
    d: "Web deployment - instant deploys, forms, functions, identity, and edge handlers.",
    cap: ["Git Deploys", "Functions", "Forms", "Identity", "Edge Handlers", "Split Testing", "Analytics", "Large Media"],
    f: [
      { k: "access_token", lb: "Personal Access Token", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Netlify personal access token", lk: "https://app.netlify.com/user/applications#personal-access-tokens", ll: "User Settings > Applications > Personal Access Tokens" },
    ],
  },
  railway: {
    l: "Railway", logo: "railway", c: "#0b0d0e", cat: "cloud", pri: 79,
    d: "Cloud deployment - instant deploys from GitHub, databases, cron jobs, and volumes.",
    cap: ["Deploy", "Databases", "Cron Jobs", "Volumes", "Private Networking", "Observability", "Templates", "CLI"],
    f: [
      { k: "api_token", lb: "API Token", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", s: true, h: "Railway API token", lk: "https://railway.app/account/tokens", ll: "Account > Tokens > Create Token" },
    ],
  },
  render: {
    l: "Render", logo: "render", c: "#46e3b7", cat: "cloud", pri: 80,
    d: "Cloud platform - web services, static sites, databases, cron jobs, and Docker.",
    cap: ["Web Services", "Static Sites", "Databases", "Cron Jobs", "Docker", "Private Services", "Disks", "Blueprints"],
    f: [
      { k: "api_key", lb: "API Key", ph: "rnd_xxxxxxxxxxxxxxxx", s: true, h: "Render API key", lk: "https://dashboard.render.com/u/settings#api-keys", ll: "Account > Settings > API Keys" },
    ],
  },
  aws: {
    l: "AWS", logo: "aws", c: "#ff9900", cat: "cloud", pri: 81,
    d: "Amazon Web Services - S3, Lambda, DynamoDB, SES, and 200+ cloud services.",
    cap: ["S3 Storage", "Lambda", "DynamoDB", "SES Email", "SQS Queues", "SNS", "CloudWatch", "IAM"],
    f: [
      { k: "access_key_id", lb: "Access Key ID", ph: "AKIAXXXXXXXXXXXXXXXX", h: "IAM access key ID", lk: "https://console.aws.amazon.com/iam/home#/security_credentials", ll: "IAM > Security Credentials > Access Keys" },
      { k: "secret_access_key", lb: "Secret Access Key", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "IAM secret access key", lk: "https://console.aws.amazon.com/iam/home#/security_credentials", ll: "IAM > Security Credentials > Access Keys" },
      { k: "region", lb: "Region", ph: "us-east-1", h: "Default AWS region", lk: "https://docs.aws.amazon.com/general/latest/gr/rande.html", ll: "AWS Regions list" },
    ],
  },
  gcloud: {
    l: "Google Cloud", logo: "gcloud", c: "#4285f4", cat: "cloud", pri: 82,
    d: "Google Cloud Platform - Compute, Cloud Functions, BigQuery, Pub/Sub, and Vertex AI.",
    cap: ["Cloud Functions", "BigQuery", "Pub/Sub", "Cloud Run", "Vertex AI", "Firestore", "Cloud Storage", "IAM"],
    f: [
      { k: "service_account_json", lb: "Service Account Key (JSON)", ph: '{"type":"service_account",...}', s: true, h: "Service account key file contents", lk: "https://console.cloud.google.com/iam-admin/serviceaccounts", ll: "IAM > Service Accounts > Keys > Add Key > JSON" },
      { k: "project_id", lb: "Project ID", ph: "my-project-123456", h: "GCP project ID", lk: "https://console.cloud.google.com/", ll: "Dashboard > Project Info > Project ID" },
    ],
  },
  webflow: {
    l: "Webflow", logo: "webflow", c: "#4353ff", cat: "dev", pri: 83,
    d: "Visual web development - design, CMS, e-commerce, and hosting without code.",
    cap: ["Sites", "CMS", "E-commerce", "Forms", "Memberships", "Logic", "Localization", "Webhooks"],
    f: [
      { k: "api_token", lb: "API Token", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Webflow API v2 token", lk: "https://webflow.com/dashboard/integrations/api-tokens", ll: "Dashboard > Integrations > API Tokens > Generate" },
    ],
  },

  // ─── Additional Social ───────────────────────────────────
  pinterest: {
    l: "Pinterest", logo: "pinterest", c: "#e60023", cat: "social", pri: 84,
    d: "Visual discovery platform - pins, boards, shopping, and ad management.",
    cap: ["Pins", "Boards", "Shopping", "Analytics", "Catalogs", "Audiences", "Conversions", "API"],
    f: [
      { k: "access_token", lb: "Access Token", ph: "pina_xxxxxxxx", s: true, h: "Pinterest API access token", lk: "https://developers.pinterest.com/apps/", ll: "Pinterest Developers > Apps > Access Token" },
    ],
  },
  youtube: {
    l: "YouTube", logo: "youtube", c: "#ff0000", cat: "social", pri: 85,
    d: "Video platform - upload, manage channels, playlists, analytics, and live streaming.",
    cap: ["Upload", "Channels", "Playlists", "Analytics", "Live Streaming", "Comments", "Search", "Captions"],
    f: [
      { k: "api_key", lb: "API Key", ph: "AIzaSy...", h: "YouTube Data API key", lk: "https://console.cloud.google.com/apis/credentials", ll: "Google Cloud > APIs > Credentials > Create API Key" },
      { k: "client_id", lb: "OAuth Client ID", ph: "xxxxx.apps.googleusercontent.com", h: "For channel management", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Client ID" },
      { k: "client_secret", lb: "OAuth Secret", ph: "GOCSPX-...", s: true, h: "OAuth 2.0 secret", lk: "https://console.cloud.google.com/apis/credentials", ll: "Credentials > OAuth > Secret" },
      { k: "refresh_token", lb: "Refresh Token", ph: "1//0xxxxx...", s: true, h: "Auto-populated via Connect Google", lk: "https://0nmcp.com/console", ll: "Console > Vault > Connect Google" },
    ],
  },
  twitch: {
    l: "Twitch", logo: "twitch", c: "#9146ff", cat: "social", pri: 86,
    d: "Live streaming platform - streams, chat, clips, and channel management.",
    cap: ["Streams", "Chat", "Clips", "Channels", "Subscriptions", "Emotes", "Polls", "Webhooks"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", h: "Twitch app client ID", lk: "https://dev.twitch.tv/console/apps", ll: "Dev Console > Applications > Your App > Client ID" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "Twitch app client secret", lk: "https://dev.twitch.tv/console/apps", ll: "Applications > Your App > Client Secret" },
    ],
  },

  // ─── Additional Finance ──────────────────────────────────
  xero: {
    l: "Xero", logo: "xero", c: "#13b5ea", cat: "finance", pri: 87,
    d: "Cloud accounting - invoicing, bank reconciliation, payroll, and financial reporting.",
    cap: ["Invoices", "Contacts", "Bank Transactions", "Accounts", "Payroll", "Reports", "Quotes", "Purchase Orders"],
    f: [
      { k: "client_id", lb: "Client ID", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", h: "Xero OAuth2 app client ID", lk: "https://developer.xero.com/app/manage", ll: "Xero Developer > My Apps > Configuration > Client ID" },
      { k: "client_secret", lb: "Client Secret", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "Xero OAuth2 app secret", lk: "https://developer.xero.com/app/manage", ll: "My Apps > Configuration > Client Secret" },
    ],
  },
  wave: {
    l: "Wave", logo: "wave", c: "#1c6dd0", cat: "finance", pri: 88,
    d: "Free accounting - invoicing, receipts, payments, payroll, and financial reports.",
    cap: ["Invoices", "Receipts", "Payments", "Customers", "Products", "Reports", "Payroll", "Banking"],
    f: [
      { k: "access_token", lb: "Access Token (Full Access)", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Wave API full access token", lk: "https://developer.waveapps.com/hc/en-us/articles/360019762711", ll: "Developer Portal > My Apps > Full Access Token" },
    ],
  },

  // ─── Additional Productivity ─────────────────────────────
  monday: {
    l: "Monday.com", logo: "monday", c: "#ff3d57", cat: "productivity", pri: 89,
    d: "Work OS - boards, items, automations, dashboards, and integrations.",
    cap: ["Boards", "Items", "Groups", "Columns", "Automations", "Dashboards", "Workspaces", "Webhooks"],
    f: [
      { k: "api_key", lb: "API Token", ph: "eyJhbGciOi...", s: true, h: "Monday.com API v2 token", lk: "https://auth.monday.com/admin/integrations/api", ll: "Admin > Integrations > API > Personal API Token" },
    ],
  },
  figma: {
    l: "Figma", logo: "figma", c: "#f24e1e", cat: "productivity", pri: 90,
    d: "Design platform - files, components, images, comments, and team management.",
    cap: ["Files", "Images", "Components", "Comments", "Teams", "Projects", "Styles", "Webhooks"],
    f: [
      { k: "access_token", lb: "Personal Access Token", ph: "figd_xxxxxxxx", s: true, h: "Figma personal access token", lk: "https://www.figma.com/developers/api#access-tokens", ll: "Settings > Account > Personal Access Tokens > Create" },
    ],
  },
  typeform: {
    l: "Typeform", logo: "typeform", c: "#262627", cat: "productivity", pri: 91,
    d: "Form builder - surveys, quizzes, lead gen forms, and data collection.",
    cap: ["Forms", "Responses", "Logic Jumps", "Themes", "Workspaces", "Webhooks", "Insights", "Integrations"],
    f: [
      { k: "access_token", lb: "Personal Access Token", ph: "tfp_xxxxxxxx", s: true, h: "Typeform personal access token", lk: "https://admin.typeform.com/user/tokens", ll: "Account > Personal Tokens > Generate" },
    ],
  },
  loom: {
    l: "Loom", logo: "loom", c: "#625df5", cat: "video", pri: 92,
    d: "Video messaging - record, share, and manage screen recordings and video content.",
    cap: ["Videos", "Folders", "Embed", "Transcripts", "Comments", "Sharing", "Analytics", "Webhooks"],
    f: [
      { k: "access_token", lb: "Developer Token", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Loom developer API token", lk: "https://www.loom.com/account-settings", ll: "Account Settings > Developer > API Token" },
    ],
  },

  // ─── Additional E-Commerce ───────────────────────────────
  woocommerce: {
    l: "WooCommerce", logo: "woocommerce", c: "#96588a", cat: "ecommerce", pri: 93,
    d: "WordPress e-commerce - products, orders, customers, coupons, and reports.",
    cap: ["Products", "Orders", "Customers", "Coupons", "Reports", "Shipping", "Taxes", "Webhooks"],
    f: [
      { k: "url", lb: "Store URL", ph: "https://yourstore.com", h: "WordPress site URL", lk: "https://woocommerce.com/document/woocommerce-rest-api/", ll: "WordPress Admin > WooCommerce > Settings" },
      { k: "consumer_key", lb: "Consumer Key", ph: "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", h: "WooCommerce REST API consumer key", lk: "https://woocommerce.com/document/woocommerce-rest-api/", ll: "WooCommerce > Settings > Advanced > REST API > Add Key" },
      { k: "consumer_secret", lb: "Consumer Secret", ph: "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "WooCommerce REST API consumer secret", lk: "https://woocommerce.com/document/woocommerce-rest-api/", ll: "REST API > Add Key > Consumer Secret" },
    ],
  },
  bigcommerce: {
    l: "BigCommerce", logo: "bigcommerce", c: "#121118", cat: "ecommerce", pri: 94,
    d: "E-commerce platform - catalog, orders, customers, and storefront APIs.",
    cap: ["Catalog", "Orders", "Customers", "Carts", "Checkouts", "Themes", "Webhooks", "GraphQL"],
    f: [
      { k: "store_hash", lb: "Store Hash", ph: "xxxxxxxx", h: "Your BigCommerce store hash", lk: "https://developer.bigcommerce.com/docs/start/authentication/api-accounts", ll: "Advanced Settings > API Accounts > Store Hash" },
      { k: "access_token", lb: "API Token", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "BigCommerce API token", lk: "https://developer.bigcommerce.com/docs/start/authentication/api-accounts", ll: "Advanced Settings > API Accounts > Create API Account" },
    ],
  },

  // ─── Additional Automation ───────────────────────────────
  make: {
    l: "Make", logo: "make", c: "#6d00cc", cat: "automation", pri: 95,
    d: "Visual automation (formerly Integromat) - scenarios, modules, and data transformations.",
    cap: ["Scenarios", "Modules", "Data Stores", "Webhooks", "Routers", "Iterators", "Aggregators", "Error Handling"],
    f: [
      { k: "api_token", lb: "API Token", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", s: true, h: "Make API token", lk: "https://www.make.com/en/api/authentication", ll: "Profile > API > Create Token" },
      { k: "team_id", lb: "Team ID", ph: "123456", h: "Your Make team/organization ID", lk: "https://www.make.com/", ll: "Team Settings > Team ID" },
    ],
  },

  // ─── Additional CRM / Support ────────────────────────────
  freshdesk: {
    l: "Freshdesk", logo: "freshdesk", c: "#25c16f", cat: "crm", pri: 96,
    d: "Customer support - tickets, contacts, automations, knowledge base, and SLA.",
    cap: ["Tickets", "Contacts", "Automations", "Knowledge Base", "SLA", "Groups", "Canned Responses", "Webhooks"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxx", s: true, h: "Freshdesk API key", lk: "https://support.freshdesk.com/en/support/solutions/articles/215517-how-to-find-your-api-key", ll: "Profile > Your API Key" },
      { k: "domain", lb: "Domain", ph: "yourcompany.freshdesk.com", h: "Freshdesk subdomain", lk: "https://freshdesk.com/", ll: "Your Freshdesk URL" },
    ],
  },

  // ─── DocuSign / Trello / WordPress ───────────────────────
  docusign: {
    l: "DocuSign", logo: "docusign", c: "#463688", cat: "productivity", pri: 97,
    d: "Electronic signatures - envelopes, templates, signing, and document management.",
    cap: ["Envelopes", "Templates", "Signing", "Recipients", "Tabs", "Brands", "Bulk Send", "Webhooks"],
    f: [
      { k: "integration_key", lb: "Integration Key", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", h: "DocuSign app integration key", lk: "https://admindemo.docusign.com/apps-and-keys", ll: "Admin > Apps and Keys > Integration Key" },
      { k: "secret_key", lb: "Secret Key", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", s: true, h: "DocuSign secret key", lk: "https://admindemo.docusign.com/apps-and-keys", ll: "Apps and Keys > Secret Key" },
      { k: "account_id", lb: "Account ID", ph: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", h: "DocuSign account ID", lk: "https://admindemo.docusign.com/apps-and-keys", ll: "Apps and Keys > API Account ID" },
    ],
  },
  trello: {
    l: "Trello", logo: "trello", c: "#0079bf", cat: "productivity", pri: 98,
    d: "Kanban boards - cards, lists, boards, checklists, and power-ups.",
    cap: ["Boards", "Cards", "Lists", "Checklists", "Labels", "Members", "Webhooks", "Power-Ups"],
    f: [
      { k: "api_key", lb: "API Key", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", h: "Trello API key", lk: "https://trello.com/power-ups/admin", ll: "Power-Ups Admin > API Key" },
      { k: "token", lb: "Token", ph: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", s: true, h: "Trello token (authorize via API key page)", lk: "https://trello.com/power-ups/admin", ll: "Power-Ups Admin > Token" },
    ],
  },
  wordpress: {
    l: "WordPress", logo: "wordpress", c: "#21759b", cat: "ecommerce", pri: 99,
    d: "CMS platform - posts, pages, media, users, custom post types, and plugins.",
    cap: ["Posts", "Pages", "Media", "Users", "Taxonomies", "Custom Fields", "Comments", "REST API"],
    f: [
      { k: "url", lb: "Site URL", ph: "https://yoursite.com", h: "WordPress site URL", lk: "https://developer.wordpress.org/rest-api/", ll: "Your WordPress site URL" },
      { k: "username", lb: "Username", ph: "admin", h: "WordPress username", lk: "https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/", ll: "Users > Your Profile > Username" },
      { k: "app_password", lb: "Application Password", ph: "xxxx xxxx xxxx xxxx xxxx", s: true, h: "WordPress application password", lk: "https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/", ll: "Users > Profile > Application Passwords > Add New" },
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
  email: 'Email & Marketing',
  dev: 'Dev Tools',
  cloud: 'Cloud / Infrastructure',
  social: 'Social Media',
  ads: 'Advertising',
  finance: 'Payments / Finance',
  productivity: 'Productivity',
  ecommerce: 'E-Commerce',
  automation: 'Automation',
  video: 'Video',
};

/** Category display order */
export const CATEGORY_ORDER: ServiceConfig['cat'][] = [
  'ai', 'crm', 'finance', 'database', 'dev', 'cloud',
  'messaging', 'email', 'social', 'ads', 'productivity',
  'ecommerce', 'automation', 'video',
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
