/**
 * 0n Ecosystem — app page data contract
 *
 * One file per app under lib/ecosystem/<slug>.ts implements EcosystemApp.
 * app/ecosystem/[slug]/page.tsx renders any of them with full SXO/AEO output.
 *
 * SXO CONTRACT — every app page gets, automatically:
 *   - self-referencing canonical + OG + Twitter
 *   - SoftwareApplication + Offer JSON-LD (real prices only)
 *   - FAQPage JSON-LD from `faqs`
 *   - BreadcrumbList JSON-LD
 *   - single keyword-bearing H1, logical H2 > H3 hierarchy
 *   - CRO9 event instrumentation on every outbound CTA
 *
 * HOUSE RULES (do not violate — see 0nTask handoff §8):
 *   - NEVER add aggregateRating/reviewCount until real reviews exist.
 *   - Only claim "two-way sync" for integrations that genuinely have it.
 *   - Never write "GHL", "Go High Level", or "HighLevel" — always "CRM".
 */

export interface AppOffer {
  /** Display name of the tier, e.g. "Pro" */
  name: string;
  /** Numeric price. Use 0 for free tiers. */
  price: number;
  /** ISO currency code */
  currency: string;
  /** Billing cadence for schema. Use null for one-time purchases. */
  billingPeriod: 'MONTH' | 'YEAR' | null;
  /** Short human description of what the tier unlocks */
  description: string;
  /** Bullet list shown in the pricing table */
  includes: string[];
  /** Optional trial length in days */
  trialDays?: number;
  /** Renders a highlight border + badge */
  featured?: boolean;
  /** Scarcity/urgency line, e.g. "First 100 accounts only" */
  limitNote?: string;
}

export interface AppCapability {
  /** lucide-react icon name */
  icon: string;
  title: string;
  /** 2–3 sentences. Written for humans first, extractable by LLMs second. */
  body: string;
  /** Optional BETA/NEW flag */
  status?: 'beta' | 'new';
}

export interface AppFaq {
  /** Phrase as a real search query — this becomes FAQPage schema */
  question: string;
  /** Answer the question in the FIRST sentence. Then elaborate. */
  answer: string;
}

export interface AppStep {
  title: string;
  body: string;
}

export interface ComparisonRow {
  dimension: string;
  /** How this app handles it */
  ours: string;
  /** How the legacy/traditional category handles it */
  theirs: string;
}

export interface CrossLink {
  label: string;
  href: string;
  /** Why a reader would click. Also serves as the link's topical context. */
  note: string;
  /** true = another 0n ecosystem domain, false = internal 0nmcp.com page */
  external: boolean;
}

export interface EcosystemApp {
  // ── Identity ──────────────────────────────────────────────────────────
  slug: string;
  name: string;
  /** One-line category descriptor, used in schema + breadcrumbs */
  category: string;
  /** Primary production domain, no trailing slash */
  domain: string;
  /** Where "Start free" points (the app itself, not marketing) */
  appUrl: string;

  // ── SXO meta ──────────────────────────────────────────────────────────
  /** 50–60 chars. Keyword front-loaded. Layout template appends the suffix. */
  metaTitle: string;
  /** 150–160 chars. Must contain a CTA. */
  metaDescription: string;
  /** Primary keyword this page targets */
  primaryKeyword: string;
  /** Secondary keywords — inform copy, not a meta keywords tag */
  secondaryKeywords: string[];
  /** OG/Twitter image path, absolute or site-relative */
  ogImage: string;

  // ── Above the fold ────────────────────────────────────────────────────
  /** The H1. MUST contain the primary keyword. */
  h1: string;
  /** 1–2 sentences directly under the H1. This is what LLMs quote. */
  deck: string;
  /** Short proof chips, e.g. "Free tier", "No credit card" */
  chips: string[];

  // ── Body ──────────────────────────────────────────────────────────────
  /**
   * The definitional answer. First sentence MUST be a clean
   * "X is a ..." statement — this is the AEO citation target.
   */
  whatItIs: string[];
  /** Why it's built on 0nMCP — the strategic moat paragraph */
  whyMcp: string[];
  capabilities: AppCapability[];
  howItWorks: AppStep[];
  comparison: {
    /** e.g. "traditional task managers" */
    againstLabel: string;
    rows: ComparisonRow[];
  };
  offers: AppOffer[];
  /** Audience segments — each becomes an H3 */
  audiences: { who: string; why: string }[];
  security: string[];
  faqs: AppFaq[];

  // ── Linking ───────────────────────────────────────────────────────────
  /** Internal 0nmcp.com pages + sibling ecosystem domains */
  crossLinks: CrossLink[];
  /** Notable integrations named on-page (drives long-tail + AEO) */
  integrations: string[];

  // ── Closing ───────────────────────────────────────────────────────────
  finalCta: { heading: string; body: string; button: string };

  /** ISO date, drives dateModified in schema */
  lastUpdated: string;
}
