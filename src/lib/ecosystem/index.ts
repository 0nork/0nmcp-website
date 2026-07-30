import type { EcosystemApp } from './types';
import { ontask } from './0ntask';

/**
 * The 0n ecosystem registry.
 *
 * TO ADD APP #2 (web0n, social0n, 0nCore, CRO9 …):
 *   1. Copy lib/ecosystem/0ntask.ts → lib/ecosystem/<slug>.ts
 *   2. Rewrite the content. Keep the SXO rules in types.ts.
 *   3. Import and add it to the array below.
 *   4. Done — the route, metadata, all JSON-LD, the sitemap entry, and the
 *      CRO9 instrumentation are generated for you.
 *
 * Order matters: it drives the /ecosystem index page and the ItemList schema.
 * Lead with the most GTM-ready product.
 */
export const ECOSYSTEM_APPS: EcosystemApp[] = [
  ontask,
  // web0n,
  // social0n,
  // cro9,
  // 0ncore,
];

export function getApp(slug: string): EcosystemApp | undefined {
  return ECOSYSTEM_APPS.find((a) => a.slug === slug);
}

export function getAppSlugs(): string[] {
  return ECOSYSTEM_APPS.map((a) => a.slug);
}

export type { EcosystemApp };
