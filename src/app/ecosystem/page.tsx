import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ECOSYSTEM_APPS } from '@/lib/ecosystem';
import { SITE_URL } from '@/lib/cro9';

/**
 * /ecosystem — the hub page.
 *
 * SXO ROLE: this page is the authority collector. Every app page links up to
 * it, it links down to every app page, and it targets the category-level
 * queries the individual app pages cannot ("apps built on MCP", "MCP app
 * ecosystem"). Ship it at the same time as the first app page — a child route
 * with no parent is a crawl dead-end.
 */
export const metadata: Metadata = {
  // layout.tsx uses a static title, so the brand suffix is added here.
  title: 'The 0n Apps — Apps Built on 0nMCP | 0nMCP',
  description:
    'Every app in the 0n ecosystem runs on 0nMCP — 1,640+ tools across 111 services, one identity, one encrypted vault. Explore 0nTask and the rest. Start free.',
  alternates: { canonical: `${SITE_URL}/ecosystem` },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/ecosystem`,
    siteName: '0nMCP',
    locale: 'en_US',
    title: 'The 0n Apps — Apps Built on 0nMCP',
    description:
      'Every app in the 0n ecosystem runs on 0nMCP — 1,640+ tools across 111 services, one identity, one encrypted vault.',
    images: [{ url: `${SITE_URL}/ecosystem/opengraph-image.png`, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function EcosystemIndexPage() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Apps built on 0nMCP',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: ECOSYSTEM_APPS.length,
    itemListElement: ECOSYSTEM_APPS.map((app, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/ecosystem/${app.slug}`,
      name: app.name,
      description: app.metaDescription,
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '0n Apps', item: `${SITE_URL}/ecosystem` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <nav aria-label="Breadcrumb" className="py-6 text-sm text-neutral-400">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">
                0nMCP
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white">
              0n Apps
            </li>
          </ol>
        </nav>

        <header className="border-b border-white/10 pb-12">
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Apps built on 0nMCP
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-neutral-300">
            0nMCP is the orchestration layer — 1,640+ tools across 111 services behind one protocol.
            These are the products built on top of it. One identity, one encrypted vault, and every
            integration shared across all of them.
          </p>
        </header>

        <section aria-labelledby="apps" className="py-12">
          <h2 id="apps" className="sr-only">
            App directory
          </h2>
          <ul className="grid gap-6">
            {ECOSYSTEM_APPS.map((app) => (
              <li key={app.slug}>
                <Link
                  href={`/ecosystem/${app.slug}`}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-emerald-500/40 hover:bg-white/[0.06]"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-300">
                    {app.category}
                  </p>
                  <h3 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                    {app.name}
                    <ArrowRight className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                  </h3>
                  <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-neutral-300">
                    {app.deck}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {app.chips.slice(0, 4).map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-neutral-400"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
