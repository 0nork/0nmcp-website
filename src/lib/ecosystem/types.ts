/**
 * The 0n Apps data contract.
 *
 * One file per app under src/lib/ecosystem/, registered in index.ts. The route,
 * metadata, all JSON-LD and the breadcrumbs are generated from this shape, so
 * adding an app is a content task rather than a build task.
 *
 * HOUSE RULES — these are load-bearing, not style preferences:
 *
 *  1. ONE UNIQUE PRIMARY KEYWORD PER APP. Never point two properties at the same
 *     term. 0ntask.com already fights for "AI task manager"; this page targets
 *     "MCP task manager" — near-zero competition, rising volume, and the phrase a
 *     developer evaluating MCP actually types. Pointing both at one keyword makes
 *     them compete with each other.
 *
 *  2. whatItIs[0] MUST open with "<Name> is a …". That definitional sentence is
 *     what an LLM lifts verbatim when asked "what is X", and it is rendered with
 *     emphasis for exactly that reason.
 *
 *  3. REAL PRICES ONLY. No placeholder tiers.
 *
 *  4. NO aggregateRating until real reviews exist. Fabricated ratings are a
 *     Google manual-action risk, and answer engines weight verifiable sources —
 *     inventing them costs more than it gains.
 *
 *  5. Every app declares `basedOn: 0nMCP`, which emits schema.org isBasedOn.
 *     Each app page then becomes an independent machine-readable assertion that
 *     0nMCP is the foundation. Ten apps means ten such assertions.
 */

export type Offer = {
  name: string
  priceUsd: number
  /** 'month' for subscriptions, 'once' for one-time. */
  period: 'month' | 'once'
  blurb: string
}

export type Faq = { q: string; a: string }

export type CrossLink = {
  label: string
  href: string
  /** Why the link exists — keeps anchors contextual rather than generic. */
  context: string
}

export type ComparisonRow = {
  dimension: string
  app: string
  others: string
}

export type EcosystemApp = {
  slug: string
  name: string
  /** Visible H1. Must NOT duplicate the app's own homepage H1 or they compete. */
  h1: string
  /** <title>. The layout appends "| 0nMCP" — do not include the brand here. */
  metaTitle: string
  metaDescription: string
  /** The single term this page owns. See house rule 1. */
  primaryKeyword: string
  /** Live product domain. */
  url: string
  tagline: string
  /** whatItIs[0] is the AEO citation target. See house rule 2. */
  whatItIs: string[]
  whoItIsFor: string[]
  capabilities: { title: string; body: string }[]
  /** Highest-extraction asset on the page — tables get pulled into AI answers. */
  comparison: ComparisonRow[]
  offers: Offer[]
  faqs: Faq[]
  crossLinks: CrossLink[]
  /** How this app uses 0nMCP. Rendered as body copy, emitted as isBasedOn. */
  builtOn: string
  ogImage?: string
  /** ISO date — drives dateModified freshness signal. */
  lastUpdated: string
}
