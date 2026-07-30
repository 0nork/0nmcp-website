'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { track, ecosystemUrl } from '@/lib/cro9';

/**
 * Outbound CTA to an ecosystem property.
 *
 * Does three things every plain <a> fails to do:
 *   1. Fires a CRO9 event so this page gets attribution credit.
 *   2. Stamps canonical UTM + cro9_ref params so the DESTINATION property can
 *      attribute the session back here (cross-domain attribution).
 *   3. Keeps rel/target correct for outbound links.
 */
export function EcosystemCta({
  app,
  href,
  placement,
  event,
  extra = {},
  className,
  children,
}: {
  app: string;
  href: string;
  placement: string;
  event: string;
  extra?: Record<string, string | number | boolean>;
  className?: string;
  children: ReactNode;
}) {
  const target = ecosystemUrl(href, { app, placement });

  return (
    <a
      href={target}
      className={className}
      // Ecosystem properties are ours — pass full referrer, no nofollow.
      rel="noopener"
      onClick={() => track(event, { app, placement, destination: href, ...extra })}
    >
      {children}
    </a>
  );
}

/**
 * Cross-link that may be internal (next/link, prefetched) or an ecosystem
 * domain (stamped + tracked). Internal links stay internal so PageRank flows.
 */
export function EcosystemLink({
  app,
  href,
  external,
  placement,
  className,
  children,
}: {
  app: string;
  href: string;
  external: boolean;
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  if (!external) {
    return (
      <Link
        href={href}
        className={className}
        onClick={() =>
          track('ecosystem_internal_link_click', { app, placement, destination: href })
        }
      >
        {children}
      </Link>
    );
  }

  return (
    <EcosystemCta
      app={app}
      href={href}
      placement={placement}
      event="ecosystem_outbound_link_click"
      className={className}
    >
      {children}
    </EcosystemCta>
  );
}
