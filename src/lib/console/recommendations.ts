/**
 * 0nMCP Console — Agentic AI Recommendation Engine
 *
 * Analyzes recent chat messages + session context to predict what the
 * user is likely to accomplish next. Returns 2-3 smart recommendations
 * with confidence percentages.
 *
 * Scoring model (max 100 pts per candidate):
 *  1. Message keyword analysis  — 0–40 pts
 *  2. Sequential pattern match  — 0–25 pts
 *  3. Context boosting          — 0–20 pts
 *  4. Freshness penalty         — −10 pts (if just done)
 *
 * Confidence is clamped to [45, 97] — always humble, never certain.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecommendationContext {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  connectedServices: string[];
  recentActions: string[]; // e.g. ['created_workflow', 'viewed_vault']
  currentView: string;
  hasWorkflows: boolean;
  hasVaultFiles: boolean;
  hasPurchases: boolean;
}

export interface Recommendation {
  id: string;
  label: string;
  description: string;
  confidence: number; // 45–97
  command: string;
  category:
    | "vault"
    | "engine"
    | "deed"
    | "workflow"
    | "store"
    | "builder"
    | "social"
    | "crm"
    | "convert"
    | "general";
  icon: string; // Lucide icon name
  action: "chat_command" | "navigate" | "api_call";
  actionPayload?: string;
}

/** Extended internal type — not exposed in Recommendation but used for scoring */
interface ScoredEntry extends CommandEntry {
  score: number;
}

// ---------------------------------------------------------------------------
// CommandEntry (exported for pin selector)
// ---------------------------------------------------------------------------

export interface CommandEntry {
  id: string;
  label: string;
  description: string;
  command: string;
  category: Recommendation["category"];
  icon: string;

  // Intelligence layer (internal scoring signals — not exposed to consumers)
  keywords: string[];
  contextSignals: {
    views?: string[];           // currentView values that boost this
    services?: string[];        // connected services that boost this
    hasWorkflows?: boolean;     // requires/boosts when user has workflows
    hasVaultFiles?: boolean;    // requires/boosts when user has vault files
    hasPurchases?: boolean;     // requires/boosts when user has purchases
  };
  prerequisites: {
    hasWorkflows?: boolean;
    hasVaultFiles?: boolean;
    hasPurchases?: boolean;
    connectedServices?: string[];
  };
  followsAfter: string[];       // command IDs that commonly precede this one
  action: Recommendation["action"];
  actionPayload?: string;
}

// ---------------------------------------------------------------------------
// COMMAND DATABASE — 46 entries
// ---------------------------------------------------------------------------

export const ALL_COMMANDS: CommandEntry[] = [
  // ───────────────────────────────────────────────────────────────────────
  // VAULT (8)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "vault_create",
    label: "Create Encrypted Vault",
    description: "Seal credentials into an AES-256-GCM encrypted .0nv vault file with hardware fingerprint binding.",
    command: "/vault create",
    category: "vault",
    icon: "Lock",
    keywords: [
      "vault", "encrypt", "seal", "secure", "credentials", "keys", "api keys",
      "protect", "aes", "store credentials", "hide keys", "lock"
    ],
    contextSignals: { views: ["vault", "settings", "engine"] },
    prerequisites: {},
    followsAfter: ["engine_verify", "engine_import"],
    action: "chat_command",
  },
  {
    id: "vault_open",
    label: "Open Vault File",
    description: "Decrypt and access the contents of an existing .0nv vault file.",
    command: "/vault open",
    category: "vault",
    icon: "Unlock",
    keywords: [
      "open vault", "decrypt", "access vault", "read vault", "load vault",
      "unseal vault", "unlock", "view credentials"
    ],
    contextSignals: { views: ["vault"], hasVaultFiles: true },
    prerequisites: { hasVaultFiles: true },
    followsAfter: ["vault_create", "vault_verify"],
    action: "chat_command",
  },
  {
    id: "vault_inspect",
    label: "Inspect Vault",
    description: "View vault metadata, layer manifest, and creation info without decrypting.",
    command: "/vault inspect",
    category: "vault",
    icon: "ScanLine",
    keywords: [
      "inspect vault", "vault metadata", "vault info", "vault details",
      "what's in vault", "vault contents", "check vault"
    ],
    contextSignals: { views: ["vault"], hasVaultFiles: true },
    prerequisites: { hasVaultFiles: true },
    followsAfter: ["vault_create", "vault_open"],
    action: "chat_command",
  },
  {
    id: "vault_verify",
    label: "Verify Vault Integrity",
    description: "Run the Seal of Truth SHA3-256 verification to confirm the vault has not been tampered with.",
    command: "/vault verify",
    category: "vault",
    icon: "ShieldCheck",
    keywords: [
      "verify vault", "integrity", "seal of truth", "tamper", "authentic",
      "valid vault", "check integrity", "sha3", "trust"
    ],
    contextSignals: { views: ["vault"], hasVaultFiles: true },
    prerequisites: { hasVaultFiles: true },
    followsAfter: ["vault_create", "vault_open", "vault_inspect"],
    action: "chat_command",
  },
  {
    id: "vault_seal",
    label: "Seal Credentials",
    description: "Encrypt individual API keys with AES-256-GCM and hardware fingerprint binding.",
    command: "/vault seal",
    category: "vault",
    icon: "KeyRound",
    keywords: [
      "seal", "seal credentials", "seal keys", "bind to machine", "hardware bind",
      "encrypt keys", "machine locked"
    ],
    contextSignals: { views: ["vault", "engine", "settings"] },
    prerequisites: {},
    followsAfter: ["engine_import", "engine_verify"],
    action: "chat_command",
  },
  {
    id: "vault_unseal",
    label: "Unseal Credentials",
    description: "Decrypt hardware-bound credentials sealed with /vault seal.",
    command: "/vault unseal",
    category: "vault",
    icon: "KeySquare",
    keywords: [
      "unseal", "unseal credentials", "decrypt keys", "unlock credentials",
      "restore keys", "retrieve credentials"
    ],
    contextSignals: { views: ["vault"], hasVaultFiles: true },
    prerequisites: { hasVaultFiles: true },
    followsAfter: ["vault_seal", "vault_create"],
    action: "chat_command",
  },
  {
    id: "vault_container",
    label: "Create Vault Container",
    description: "Multi-layer encrypted container with 7 semantic layers: workflows, credentials, env_vars, mcp_configs, site_profiles, ai_brain, audit_trail.",
    command: "/vault container",
    category: "vault",
    icon: "Boxes",
    keywords: [
      "container", "vault container", "multi layer", "7 layers", "all in one",
      "full backup", "comprehensive vault", "bundle vault", "package everything"
    ],
    contextSignals: { views: ["vault"], hasVaultFiles: true },
    prerequisites: {},
    followsAfter: ["vault_create", "engine_bundle"],
    action: "chat_command",
  },
  {
    id: "vault_escrow",
    label: "Create Escrow Package",
    description: "Multi-party escrow using X25519 ECDH — up to 8 parties with per-layer access matrix.",
    command: "/vault escrow",
    category: "vault",
    icon: "Users",
    keywords: [
      "escrow", "multi party", "share vault", "split key", "x25519",
      "shared access", "team vault", "delegate", "escrow package"
    ],
    contextSignals: { views: ["vault"], hasVaultFiles: true },
    prerequisites: { hasVaultFiles: true },
    followsAfter: ["vault_container", "deed_create"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // DEED (6)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "deed_create",
    label: "Create Business Deed",
    description: "Package all digital business assets — credentials, workflows, AI brain, site profiles — into a transferable .0nv container.",
    command: "/deed create",
    category: "deed",
    icon: "FileSignature",
    keywords: [
      "deed", "business deed", "transfer business", "sell business",
      "package assets", "digital assets", "business transfer", "convey",
      "hand off", "ownership", "chain of custody"
    ],
    contextSignals: { views: ["vault", "engine"] },
    prerequisites: {},
    followsAfter: ["vault_container", "engine_bundle"],
    action: "chat_command",
  },
  {
    id: "deed_open",
    label: "Open Deed File",
    description: "Decrypt and view the full contents of a business deed .0nv file.",
    command: "/deed open",
    category: "deed",
    icon: "FolderOpen",
    keywords: [
      "open deed", "read deed", "view deed", "access deed",
      "decrypt deed", "load deed"
    ],
    contextSignals: { views: ["vault"] },
    prerequisites: {},
    followsAfter: ["deed_accept", "deed_inspect"],
    action: "chat_command",
  },
  {
    id: "deed_inspect",
    label: "Inspect Deed",
    description: "View deed metadata and the full chain of custody transfer history without decrypting.",
    command: "/deed inspect",
    category: "deed",
    icon: "ClipboardList",
    keywords: [
      "inspect deed", "deed info", "deed details", "deed metadata",
      "chain of custody", "transfer history", "deed audit"
    ],
    contextSignals: { views: ["vault"] },
    prerequisites: {},
    followsAfter: ["deed_create", "deed_accept"],
    action: "chat_command",
  },
  {
    id: "deed_verify",
    label: "Verify Deed Authenticity",
    description: "Verify Ed25519 digital signatures and Seal of Truth to confirm deed integrity.",
    command: "/deed verify",
    category: "deed",
    icon: "BadgeCheck",
    keywords: [
      "verify deed", "authentic", "deed signature", "ed25519",
      "deed integrity", "trust deed", "valid deed"
    ],
    contextSignals: { views: ["vault"] },
    prerequisites: {},
    followsAfter: ["deed_open", "deed_inspect"],
    action: "chat_command",
  },
  {
    id: "deed_accept",
    label: "Accept Deed Transfer",
    description: "Accept an incoming business deed transfer and take ownership of all included assets.",
    command: "/deed accept",
    category: "deed",
    icon: "HandshakeIcon",
    keywords: [
      "accept deed", "receive deed", "incoming transfer", "take ownership",
      "claim deed", "accept transfer", "new owner"
    ],
    contextSignals: { views: ["vault"] },
    prerequisites: {},
    followsAfter: ["deed_verify"],
    action: "chat_command",
  },
  {
    id: "deed_import",
    label: "Import Deed Assets",
    description: "Unpack and import deed contents — writes .0n connection files, .env, workflows, MCP configs, and AI brain data locally.",
    command: "/deed import",
    category: "deed",
    icon: "PackageOpen",
    keywords: [
      "import deed", "unpack deed", "restore deed", "load deed assets",
      "install deed", "apply deed", "deploy deed"
    ],
    contextSignals: { views: ["vault", "engine"] },
    prerequisites: {},
    followsAfter: ["deed_accept", "deed_open"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // ENGINE (6)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "engine_import",
    label: "Import Credentials",
    description: "Auto-detect and import API keys from .env files, CSV exports, or JSON configs — maps to all 26 services.",
    command: "/engine import",
    category: "engine",
    icon: "Download",
    keywords: [
      "import", "import credentials", "import keys", "load env", "dotenv",
      "csv import", "connect services", "add keys", "turn it on",
      "setup", "get started", "onboard"
    ],
    contextSignals: { views: ["engine", "settings"] },
    prerequisites: {},
    followsAfter: [],
    action: "chat_command",
  },
  {
    id: "engine_verify",
    label: "Verify API Keys",
    description: "Test all imported credentials — live API health check across every connected service.",
    command: "/engine verify",
    category: "engine",
    icon: "Zap",
    keywords: [
      "verify", "test keys", "check keys", "api health", "validate credentials",
      "test connections", "are keys valid", "ping services", "health check"
    ],
    contextSignals: { views: ["engine", "settings"] },
    prerequisites: {},
    followsAfter: ["engine_import"],
    action: "chat_command",
  },
  {
    id: "engine_platforms",
    label: "Generate AI Platform Configs",
    description: "Generate ready-to-paste config files for Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, and OpenAI.",
    command: "/engine platforms",
    category: "engine",
    icon: "Cpu",
    keywords: [
      "platform config", "claude desktop", "cursor", "windsurf", "cline",
      "ai config", "mcp config", "ide config", "generate config",
      "setup claude", "setup cursor"
    ],
    contextSignals: { views: ["engine"] },
    prerequisites: {},
    followsAfter: ["engine_verify"],
    action: "chat_command",
  },
  {
    id: "engine_export",
    label: "Export Brain Bundle",
    description: "Create a portable AES-256-GCM encrypted credential package that works on any machine (no hardware binding).",
    command: "/engine export",
    category: "engine",
    icon: "UploadCloud",
    keywords: [
      "export", "brain bundle", "portable", "share credentials",
      "backup credentials", "move setup", "export keys", "portable bundle"
    ],
    contextSignals: { views: ["engine"] },
    prerequisites: {},
    followsAfter: ["engine_verify", "engine_import"],
    action: "chat_command",
  },
  {
    id: "engine_bundle",
    label: "Bundle Everything",
    description: "Full system export — credentials, workflows, configs, AI brain — into one portable encrypted package.",
    command: "/engine bundle",
    category: "engine",
    icon: "Package",
    keywords: [
      "bundle", "full export", "everything", "complete backup",
      "all in one", "full bundle", "export all", "package up"
    ],
    contextSignals: { views: ["engine"], hasWorkflows: true },
    prerequisites: {},
    followsAfter: ["engine_export", "workflow_list"],
    action: "chat_command",
  },
  {
    id: "engine_open",
    label: "Open Brain Bundle",
    description: "Decrypt and restore from a portable brain bundle — reconstruct all credentials and configs.",
    command: "/engine open",
    category: "engine",
    icon: "BrainCircuit",
    keywords: [
      "open bundle", "restore bundle", "load bundle", "import bundle",
      "decrypt bundle", "restore brain", "apply bundle"
    ],
    contextSignals: { views: ["engine"] },
    prerequisites: {},
    followsAfter: ["engine_bundle", "engine_export"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // WORKFLOW (6)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "workflow_create",
    label: "Create New Workflow",
    description: "Build a new .0n SWITCH file — define steps, triggers, actions, and service integrations.",
    command: "/workflow create",
    category: "workflow",
    icon: "GitBranch",
    keywords: [
      "create workflow", "new workflow", "build workflow", "make workflow",
      "automate", "automation", "switch file", "run", "new run",
      "workflow", "flow", "pipeline"
    ],
    contextSignals: { views: ["builder", "workflows"] },
    prerequisites: {},
    followsAfter: [],
    action: "chat_command",
  },
  {
    id: "workflow_run",
    label: "Run Workflow",
    description: "Execute a saved .0n SWITCH file — runs all steps in sequence with live output.",
    command: "/workflow run",
    category: "workflow",
    icon: "Play",
    keywords: [
      "run workflow", "execute", "start workflow", "fire workflow",
      "trigger workflow", "run run", "execute switch", "launch workflow"
    ],
    contextSignals: { views: ["workflows"], hasWorkflows: true },
    prerequisites: { hasWorkflows: true },
    followsAfter: ["workflow_create", "workflow_test", "workflow_import"],
    action: "chat_command",
  },
  {
    id: "workflow_list",
    label: "List Workflows",
    description: "View all saved .0n SWITCH files — names, last run timestamps, and status.",
    command: "/workflow list",
    category: "workflow",
    icon: "List",
    keywords: [
      "list workflows", "show workflows", "my workflows", "all workflows",
      "saved workflows", "workflow list", "runs", "show runs"
    ],
    contextSignals: { views: ["workflows"], hasWorkflows: true },
    prerequisites: { hasWorkflows: true },
    followsAfter: ["workflow_create"],
    action: "chat_command",
  },
  {
    id: "workflow_deploy",
    label: "Deploy Workflow Live",
    description: "Deploy a workflow with full production setup — CRM tags, custom values, webhook handlers, everything.",
    command: "/workflow deploy",
    category: "workflow",
    icon: "Rocket",
    keywords: [
      "deploy", "deploy workflow", "go live", "production", "publish workflow",
      "activate workflow", "launch", "deploy live"
    ],
    contextSignals: { views: ["workflows", "builder"], hasWorkflows: true },
    prerequisites: { hasWorkflows: true },
    followsAfter: ["workflow_test", "workflow_create"],
    action: "chat_command",
  },
  {
    id: "workflow_test",
    label: "Test Workflow",
    description: "Dry-run a workflow without executing real actions — validate logic and catch errors before deployment.",
    command: "/workflow test",
    category: "workflow",
    icon: "TestTube",
    keywords: [
      "test workflow", "dry run", "validate workflow", "check workflow",
      "preview workflow", "workflow test", "debug workflow"
    ],
    contextSignals: { views: ["workflows", "builder"], hasWorkflows: true },
    prerequisites: { hasWorkflows: true },
    followsAfter: ["workflow_create"],
    action: "chat_command",
  },
  {
    id: "workflow_import",
    label: "Import Workflow",
    description: "Import a .0n SWITCH file from the store or from a local file upload.",
    command: "/workflow import",
    category: "workflow",
    icon: "FileInput",
    keywords: [
      "import workflow", "load workflow", "upload workflow",
      "download workflow", "get workflow", "install workflow"
    ],
    contextSignals: { views: ["store", "workflows"], hasPurchases: true },
    prerequisites: {},
    followsAfter: ["store_purchase", "store_download"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // STORE (4)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "store_browse",
    label: "Browse Store",
    description: "Explore the 0n Marketplace — ready-made .0n SWITCH files for common automation tasks.",
    command: "/store browse",
    category: "store",
    icon: "ShoppingBag",
    keywords: [
      "store", "browse", "marketplace", "shop", "listings",
      "buy workflow", "find workflows", "explore", "catalog"
    ],
    contextSignals: { views: ["store"] },
    prerequisites: {},
    followsAfter: [],
    action: "navigate",
    actionPayload: "store",
  },
  {
    id: "store_purchase",
    label: "Get Store Listing",
    description: "Purchase or claim a marketplace listing — pay-per-execution or one-time.",
    command: "/store purchase",
    category: "store",
    icon: "CreditCard",
    keywords: [
      "purchase", "buy", "claim listing", "get workflow",
      "checkout", "pay", "acquire"
    ],
    contextSignals: { views: ["store"] },
    prerequisites: {},
    followsAfter: ["store_browse"],
    action: "chat_command",
  },
  {
    id: "store_publish",
    label: "Publish to Store",
    description: "List your .0n SWITCH file on the marketplace — earn per execution.",
    command: "/store publish",
    category: "store",
    icon: "SendHorizontal",
    keywords: [
      "publish", "sell workflow", "list workflow", "monetize",
      "upload to store", "submit to marketplace", "earn"
    ],
    contextSignals: { views: ["store", "workflows"], hasWorkflows: true },
    prerequisites: { hasWorkflows: true },
    followsAfter: ["workflow_test", "workflow_deploy"],
    action: "chat_command",
  },
  {
    id: "store_download",
    label: "Download .0n File",
    description: "Download a purchased SWITCH file to your local environment.",
    command: "/store download",
    category: "store",
    icon: "FileDown",
    keywords: [
      "download", "get file", "download workflow", "retrieve",
      "pull workflow", "download switch"
    ],
    contextSignals: { views: ["store"], hasPurchases: true },
    prerequisites: { hasPurchases: true },
    followsAfter: ["store_purchase"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // BUILDER (4)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "builder_open",
    label: "Open Visual Builder",
    description: "Launch the drag-and-drop workflow editor — visually wire steps and service calls.",
    command: "/builder open",
    category: "builder",
    icon: "LayoutTemplate",
    keywords: [
      "builder", "visual builder", "drag drop", "visual editor",
      "flow editor", "open builder", "graphical", "no code"
    ],
    contextSignals: { views: ["builder"] },
    prerequisites: {},
    followsAfter: [],
    action: "navigate",
    actionPayload: "builder",
  },
  {
    id: "builder_save",
    label: "Save Workflow",
    description: "Save the current visual builder state as a .0n SWITCH file.",
    command: "/builder save",
    category: "builder",
    icon: "Save",
    keywords: [
      "save", "save workflow", "save builder", "checkpoint",
      "persist workflow", "store workflow"
    ],
    contextSignals: { views: ["builder"] },
    prerequisites: {},
    followsAfter: ["builder_open"],
    action: "chat_command",
  },
  {
    id: "builder_convert",
    label: "Convert Format",
    description: "Convert between workflow config formats — import Zapier, Make, n8n or export to OpenAI/Gemini.",
    command: "/builder convert",
    category: "convert",
    icon: "RefreshCw",
    keywords: [
      "convert", "format", "zapier", "make", "n8n", "openai format",
      "gemini format", "transform", "migrate format"
    ],
    contextSignals: { views: ["builder", "converter"] },
    prerequisites: {},
    followsAfter: ["builder_open"],
    action: "navigate",
    actionPayload: "convert",
  },
  {
    id: "builder_preview",
    label: "Preview Workflow",
    description: "Preview the current workflow execution plan without actually running it.",
    command: "/builder preview",
    category: "builder",
    icon: "Eye",
    keywords: [
      "preview", "preview workflow", "step through", "show steps",
      "execution plan", "what will happen", "walk through"
    ],
    contextSignals: { views: ["builder"], hasWorkflows: true },
    prerequisites: {},
    followsAfter: ["builder_open", "builder_save"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // SOCIAL (3)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "social_post",
    label: "Post to Social",
    description: "Publish content to LinkedIn, Dev.to, and Reddit simultaneously.",
    command: "/social post",
    category: "social",
    icon: "Share2",
    keywords: [
      "post", "social", "linkedin", "devto", "reddit",
      "publish post", "share content", "social media"
    ],
    contextSignals: {
      views: ["social"],
      services: ["linkedin"],
    },
    prerequisites: {},
    followsAfter: [],
    action: "chat_command",
  },
  {
    id: "social_schedule",
    label: "Schedule Posts",
    description: "Queue social media content for future publishing — build a content calendar.",
    command: "/social schedule",
    category: "social",
    icon: "CalendarClock",
    keywords: [
      "schedule", "queue post", "content calendar", "schedule post",
      "future post", "plan content", "drip"
    ],
    contextSignals: { views: ["social"] },
    prerequisites: {},
    followsAfter: ["social_post"],
    action: "chat_command",
  },
  {
    id: "social_analytics",
    label: "View Social Analytics",
    description: "Engagement metrics — impressions, clicks, reactions across all connected social platforms.",
    command: "/social analytics",
    category: "social",
    icon: "BarChart3",
    keywords: [
      "analytics", "engagement", "metrics", "impressions",
      "social stats", "performance", "clicks", "views"
    ],
    contextSignals: { views: ["social"] },
    prerequisites: {},
    followsAfter: ["social_post", "social_schedule"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // CRM (5)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "crm_contacts",
    label: "Manage Contacts",
    description: "Create, update, tag, and search contacts in the ROCKET CRM across 23 contact tools.",
    command: "/crm contacts",
    category: "crm",
    icon: "ContactRound",
    keywords: [
      "contacts", "crm contacts", "manage contacts", "contact list",
      "add contact", "find contact", "search contacts", "customer"
    ],
    contextSignals: { views: ["crm"], services: ["crm"] },
    prerequisites: { connectedServices: ["crm"] },
    followsAfter: [],
    action: "chat_command",
  },
  {
    id: "crm_workflows",
    label: "CRM Workflows",
    description: "Manage ROCKET CRM automation — add contacts to workflows, trigger sequences.",
    command: "/crm workflows",
    category: "crm",
    icon: "Workflow",
    keywords: [
      "crm workflow", "automation", "sequences", "drip", "trigger sequence",
      "add to workflow", "crm automation"
    ],
    contextSignals: { views: ["crm"], services: ["crm"] },
    prerequisites: { connectedServices: ["crm"] },
    followsAfter: ["crm_contacts"],
    action: "chat_command",
  },
  {
    id: "crm_calendar",
    label: "Calendar Management",
    description: "View availability, create appointments, manage team calendars in ROCKET CRM.",
    command: "/crm calendar",
    category: "crm",
    icon: "Calendar",
    keywords: [
      "calendar", "appointment", "schedule", "booking",
      "availability", "slot", "meeting", "book"
    ],
    contextSignals: { views: ["crm"], services: ["crm"] },
    prerequisites: { connectedServices: ["crm"] },
    followsAfter: ["crm_contacts"],
    action: "chat_command",
  },
  {
    id: "crm_conversations",
    label: "View Conversations",
    description: "Browse CRM conversation threads — SMS, email, chat across all channels.",
    command: "/crm conversations",
    category: "crm",
    icon: "MessageCircle",
    keywords: [
      "conversations", "messages", "sms", "chat", "inbox",
      "email threads", "communications", "crm messages"
    ],
    contextSignals: { views: ["crm"], services: ["crm"] },
    prerequisites: { connectedServices: ["crm"] },
    followsAfter: ["crm_contacts"],
    action: "chat_command",
  },
  {
    id: "crm_opportunities",
    label: "Pipeline Management",
    description: "View and update sales pipeline — opportunities, stages, deal values, and forecasts.",
    command: "/crm opportunities",
    category: "crm",
    icon: "TrendingUp",
    keywords: [
      "pipeline", "opportunities", "deals", "sales", "funnel",
      "deal stage", "forecast", "revenue", "leads"
    ],
    contextSignals: { views: ["crm"], services: ["crm"] },
    prerequisites: { connectedServices: ["crm"] },
    followsAfter: ["crm_contacts"],
    action: "chat_command",
  },

  // ───────────────────────────────────────────────────────────────────────
  // GENERAL (4)
  // ───────────────────────────────────────────────────────────────────────
  {
    id: "help",
    label: "Get Help",
    description: "Show all available commands, categories, and quick-start guides.",
    command: "/help",
    category: "general",
    icon: "HelpCircle",
    keywords: [
      "help", "what can you do", "commands", "how do i",
      "guide", "docs", "tutorial", "list commands", "options"
    ],
    contextSignals: {},
    prerequisites: {},
    followsAfter: [],
    action: "chat_command",
  },
  {
    id: "settings",
    label: "Console Settings",
    description: "Configure console preferences — theme, default services, notification settings.",
    command: "/settings",
    category: "general",
    icon: "Settings",
    keywords: [
      "settings", "preferences", "configure", "options",
      "setup", "config", "customize"
    ],
    contextSignals: { views: ["settings"] },
    prerequisites: {},
    followsAfter: [],
    action: "navigate",
    actionPayload: "settings",
  },
  {
    id: "connect_service",
    label: "Connect New Service",
    description: "Add API credentials for any of the 26 supported services — instantly activates related tools.",
    command: "/connect",
    category: "general",
    icon: "Plus",
    keywords: [
      "connect", "add service", "new service", "api key", "credential",
      "authorize", "link service", "integrate"
    ],
    contextSignals: { views: ["engine", "settings"] },
    prerequisites: {},
    followsAfter: ["engine_import"],
    action: "chat_command",
  },
  {
    id: "export_data",
    label: "Export My Data",
    description: "Download a full export of all your data — workflows, history, connections, and settings.",
    command: "/export",
    category: "general",
    icon: "DatabaseBackup",
    keywords: [
      "export data", "download data", "my data", "backup",
      "export everything", "data export", "gdpr"
    ],
    contextSignals: { views: ["settings"] },
    prerequisites: {},
    followsAfter: ["engine_bundle"],
    action: "chat_command",
  },
];

// ---------------------------------------------------------------------------
// CATEGORY COLORS
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<string, string> = {
  vault:    "#a78bfa",
  engine:   "#00d4ff",
  deed:     "#f59e0b",
  workflow: "#7ed957",
  store:    "#ec4899",
  builder:  "#6366f1",
  social:   "#38bdf8",
  crm:      "#ff6b35",
  convert:  "#8b5cf6",
  general:  "#8888a0",
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build a fast lookup: commandId → CommandEntry */
const COMMAND_MAP = new Map<string, CommandEntry>(
  ALL_COMMANDS.map((c) => [c.id, c])
);

/**
 * Tokenize a block of text into lowercase words.
 * Strips punctuation so "vault," and "vault" both match.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Compute a keyword match score between a tokenized query and a command's keywords.
 *
 * - Exact whole-word match → 8 pts
 * - Partial match (query word is substring of keyword or vice-versa) → 3 pts
 * - Multi-word keyword phrase fully present in query string → 15 pts
 */
function keywordScore(queryTokens: string[], queryRaw: string, cmd: CommandEntry): number {
  let score = 0;
  const qRaw = queryRaw.toLowerCase();

  for (const kw of cmd.keywords) {
    const kwLower = kw.toLowerCase();

    // Multi-word phrase check (highest priority)
    if (kwLower.includes(" ") && qRaw.includes(kwLower)) {
      score += 15;
      continue;
    }

    // Single-word checks
    if (queryTokens.includes(kwLower)) {
      score += 8;
    } else {
      // Partial: query word appears inside keyword or vice-versa
      const hasPartial = queryTokens.some(
        (t) => t.length > 3 && (kwLower.includes(t) || t.includes(kwLower))
      );
      if (hasPartial) score += 3;
    }
  }

  // Normalize to 40-point max ceiling
  return Math.min(score, 40);
}

/**
 * Score sequential patterns.
 * If any recentAction maps to a command ID and this command `followsAfter` it → pts.
 */
function sequentialScore(recentActions: string[], cmd: CommandEntry): number {
  if (cmd.followsAfter.length === 0) return 0;

  let score = 0;
  for (const action of recentActions) {
    if (cmd.followsAfter.includes(action)) {
      // Recency bonus: first action in list is most recent
      const recencyBonus = recentActions.indexOf(action) === 0 ? 10 : 5;
      score += 15 + recencyBonus;
    }
  }
  return Math.min(score, 25);
}

/**
 * Score contextual signals.
 * Connected services, current view, and booleans all contribute.
 */
function contextScore(cmd: CommandEntry, ctx: RecommendationContext): number {
  const signals = cmd.contextSignals;
  let score = 0;

  // Current view match
  if (signals.views?.includes(ctx.currentView)) {
    score += 10;
  }

  // Connected service match
  if (signals.services) {
    const matched = signals.services.filter((s) =>
      ctx.connectedServices.includes(s)
    ).length;
    score += matched * 5;
  }

  // Boolean context signals
  if (signals.hasWorkflows && ctx.hasWorkflows) score += 4;
  if (signals.hasVaultFiles && ctx.hasVaultFiles) score += 4;
  if (signals.hasPurchases && ctx.hasPurchases) score += 3;

  return Math.min(score, 20);
}

/**
 * Apply a freshness penalty if the user just performed this action.
 */
function freshnessPenalty(cmd: CommandEntry, recentActions: string[]): number {
  return recentActions.includes(cmd.id) ? -10 : 0;
}

/**
 * Check whether prerequisites are satisfied for a given command.
 * Commands with unmet prerequisites are filtered out entirely.
 */
function prerequisitesMet(cmd: CommandEntry, ctx: RecommendationContext): boolean {
  const p = cmd.prerequisites;

  if (p.hasWorkflows === true && !ctx.hasWorkflows) return false;
  if (p.hasVaultFiles === true && !ctx.hasVaultFiles) return false;
  if (p.hasPurchases === true && !ctx.hasPurchases) return false;

  if (p.connectedServices) {
    const allMet = p.connectedServices.every((s) =>
      ctx.connectedServices.includes(s)
    );
    if (!allMet) return false;
  }

  return true;
}

/**
 * Clamp confidence to [45, 97].
 * Always humble — never 100%, never below 45%.
 */
function clampConfidence(raw: number): number {
  // raw scores typically land 0–105; map to 45–97 range
  const mapped = 45 + Math.round((raw / 105) * 52);
  return Math.max(45, Math.min(97, mapped));
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * getRecommendations
 *
 * Analyzes context and returns the top 2–3 commands the user is most
 * likely to want next, sorted by confidence (highest first).
 */
export function getRecommendations(ctx: RecommendationContext): Recommendation[] {
  // ── 1. Build query corpus from recent messages ─────────────────────────
  // We weight the last message 2×, and include up to 5 messages total.
  const recentMessages = ctx.messages.slice(-5);
  const weightedTexts: string[] = [];

  recentMessages.forEach((msg, idx) => {
    // Only analyse user messages for intent signals
    if (msg.role !== "user") return;
    // Most recent user message gets doubled weight
    const isLast =
      idx === recentMessages.length - 1 ||
      (idx === recentMessages.length - 2 && ctx.messages[idx + 1]?.role === "assistant");
    weightedTexts.push(msg.content);
    if (isLast) weightedTexts.push(msg.content); // duplicate = 2× weight
  });

  const queryRaw = weightedTexts.join(" ");
  const queryTokens = tokenize(queryRaw);

  // ── 2. Score every command ─────────────────────────────────────────────
  const scored: ScoredEntry[] = [];

  for (const cmd of ALL_COMMANDS) {
    // Gate: prerequisites
    if (!prerequisitesMet(cmd, ctx)) continue;

    const kw = keywordScore(queryTokens, queryRaw, cmd);
    const seq = sequentialScore(ctx.recentActions, cmd);
    const ctxPts = contextScore(cmd, ctx);
    const penalty = freshnessPenalty(cmd, ctx.recentActions);

    const total = kw + seq + ctxPts + penalty;

    // Only include commands that earned at least some signal
    if (total > 0) {
      scored.push({ ...cmd, score: total });
    }
  }

  // ── 3. Sort by score descending ────────────────────────────────────────
  scored.sort((a, b) => b.score - a.score);

  // ── 4. Take top 3 and convert to Recommendation[] ─────────────────────
  const top = scored.slice(0, 3);

  // If we found fewer than 2, pad with high-utility fallbacks
  if (top.length < 2) {
    const fallbackIds = ["engine_import", "workflow_create", "store_browse"];
    for (const fid of fallbackIds) {
      if (top.length >= 3) break;
      if (top.some((t) => t.id === fid)) continue;
      const entry = COMMAND_MAP.get(fid);
      if (entry) top.push({ ...entry, score: 20 });
    }
  }

  return top.map((entry): Recommendation => ({
    id: entry.id,
    label: entry.label,
    description: entry.description,
    confidence: clampConfidence(entry.score),
    command: entry.command,
    category: entry.category,
    icon: entry.icon,
    action: entry.action,
    actionPayload: entry.actionPayload,
  }));
}
