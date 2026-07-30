/**
 * CRO9 analytics — universal event helper
 *
 * Reads the SAME env vars used across every RocketOpp property, so this file
 * is drop-in identical on 0nmcp.com, 0ntask.com, cro9.com, web0n.com, etc.
 *
 * Required in Vercel (all environments):
 *   NEXT_PUBLIC_CRO9_ENDPOINT=https://0nmcp.com/api/v1/collect
 *   NEXT_PUBLIC_CRO9_SITE_ID=0nmcp
 *   NEXT_PUBLIC_CRO9_API_KEY=<from the 0nmcp.com dashboard>
 *   NEXT_PUBLIC_CRO9_ENV=production
 *   NEXT_PUBLIC_SITE_URL=https://www.0nmcp.com
 *
 * IMPORTANT: NEXT_PUBLIC_* values ship to the browser. Never put a private
 * key here. The CRO9 API key is a write-only collection key by design.
 */

export const CRO9_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_CRO9_ENDPOINT ?? '',
  siteId: process.env.NEXT_PUBLIC_CRO9_SITE_ID ?? '',
  apiKey: process.env.NEXT_PUBLIC_CRO9_API_KEY ?? '',
  env: process.env.NEXT_PUBLIC_CRO9_ENV ?? 'development',
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.0nmcp.com'
).replace(/\/$/, '');

type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    CRO9?: { track: (event: string, props?: Props) => void };
  }
}

/**
 * Fire a CRO9 event. Safe to call before the SDK loads, on the server, or
 * with analytics blocked — it degrades to a no-op instead of throwing.
 */
export function track(event: string, props: Props = {}): void {
  if (typeof window === 'undefined') return;

  const payload: Props = {
    ...props,
    site_id: CRO9_CONFIG.siteId,
    cro9_env: CRO9_CONFIG.env,
  };

  try {
    if (window.CRO9?.track) {
      window.CRO9.track(event, payload);
      return;
    }
    // SDK not mounted yet — beacon straight to the collector so we never
    // silently drop a conversion event during hydration.
    if (CRO9_CONFIG.endpoint && CRO9_CONFIG.apiKey && navigator.sendBeacon) {
      navigator.sendBeacon(
        CRO9_CONFIG.endpoint,
        new Blob(
          [JSON.stringify({ event, props: payload, key: CRO9_CONFIG.apiKey })],
          { type: 'application/json' },
        ),
      );
    }
  } catch {
    // Analytics must never break the page.
  }
}

/**
 * Append canonical UTM + CRO9 correlation params to an outbound ecosystem
 * link, so the destination property can attribute the session to this page.
 */
export function ecosystemUrl(
  base: string,
  opts: { app: string; placement: string; campaign?: string },
): string {
  const url = new URL(base);
  url.searchParams.set('utm_source', '0nmcp');
  url.searchParams.set('utm_medium', 'ecosystem');
  url.searchParams.set('utm_campaign', opts.campaign ?? `ecosystem-${opts.app}`);
  url.searchParams.set('utm_content', opts.placement);
  url.searchParams.set('cro9_ref', CRO9_CONFIG.siteId || '0nmcp');
  return url.toString();
}
