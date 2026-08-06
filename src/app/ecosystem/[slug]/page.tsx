import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as Icons from 'lucide-react';
import { ArrowRight, Check, ExternalLink, Lock, Sparkles } from 'lucide-react';

import { ECOSYSTEM_APPS, getApp, getAppSlugs } from '@/lib/ecosystem';
import type { EcosystemApp } from '@/lib/ecosystem/types';
import { SITE_URL } from '@/lib/cro9';
import { EcosystemCta, EcosystemLink } from './cta';

// Statically render every app page at build time.
export const dynamicParams = false;
export function generateStaticParams() {
  return getAppSlugs().map((slug) => ({ slug }));
}

// ──────────────────────────────────────────────────────────────────────────
// METADATA  — self-referencing canonical, full OG + Twitter
// ──────────────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return {};

  const url = `${SITE_URL}/ecosystem/${app.slug}`;
  const ogImage = app.ogImage.startsWith('http')
    ? app.ogImage
    : `${SITE_URL}${app.ogImage}`;

  return {
    // src/app/layout.tsx sets a STATIC title, not `title: { template }`, so
    // Next appends nothing. Per INSTALL.md §7 the suffix is added here rather
    // than in each app's data file, so every future app inherits it.
    title: `${app.metaTitle} | 0nMCP`,
    description: app.metaDescription,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      siteName: '0nMCP',
      locale: 'en_US',
      title: app.metaTitle,
      description: app.metaDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${app.name} — ${app.category}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: app.metaTitle,
      description: app.metaDescription,
      images: [ogImage],
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────
// JSON-LD  — SoftwareApplication + Offers, FAQPage, BreadcrumbList
// ──────────────────────────────────────────────────────────────────────────
function buildJsonLd(app: EcosystemApp) {
  const url = `${SITE_URL}/ecosystem/${app.slug}`;

  const publisher = {
    '@type': 'Organization',
    name: 'RocketOpp LLC',
    url: 'https://rocketopp.com',
  };

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: app.name,
    url: app.domain,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: app.category,
    operatingSystem: 'Web browser',
    description: app.metaDescription,
    // Only concrete, verifiable features. No invented metrics.
    featureList: app.capabilities.map((c) => c.title),
    softwareHelp: { '@type': 'CreativeWork', url: `${app.domain}/docs` },
    publisher,
    author: publisher,
    isBasedOn: {
      '@type': 'SoftwareApplication',
      name: '0nMCP',
      url: SITE_URL,
      applicationCategory: 'DeveloperApplication',
      description:
        'Universal AI orchestration layer exposing 1,598+ tools across 106 services behind one protocol.',
    },
    offers: {
      '@type': 'AggregateOffer',
      offerCount: app.offers.length,
      lowPrice: Math.min(...app.offers.map((o) => o.price)),
      highPrice: Math.max(...app.offers.map((o) => o.price)),
      priceCurrency: app.offers[0]?.currency ?? 'USD',
      offers: app.offers.map((o) => ({
        '@type': 'Offer',
        name: `${app.name} ${o.name}`,
        description: o.description,
        price: o.price,
        priceCurrency: o.currency,
        url: `${app.domain}/pricing`,
        availability: 'https://schema.org/InStock',
        ...(o.billingPeriod
          ? {
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: o.price,
                priceCurrency: o.currency,
                billingIncrement: 1,
                unitCode: o.billingPeriod === 'MONTH' ? 'MON' : 'ANN',
              },
            }
          : {}),
      })),
    },
    // DELIBERATELY ABSENT: aggregateRating / reviewCount.
    // Do not add these until real, attributable reviews exist.
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: app.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '0n Apps', item: `${SITE_URL}/ecosystem` },
      { '@type': 'ListItem', position: 3, name: app.name, item: url },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: app.metaTitle,
    description: app.metaDescription,
    dateModified: app.lastUpdated,
    isPartOf: { '@type': 'WebSite', name: '0nMCP', url: SITE_URL },
    about: { '@id': `${url}#software` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: app.ogImage.startsWith('http') ? app.ogImage : `${SITE_URL}${app.ogImage}`,
    },
  };

  return [softwareApplication, faqPage, breadcrumb, webPage];
}

// ──────────────────────────────────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────────────────────────────────
export default async function EcosystemAppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();

  const jsonLd = buildJsonLd(app);
  const siblings = ECOSYSTEM_APPS.filter((a) => a.slug !== app.slug);

  return (
    <>
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Schema is authored by us from typed data — not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <article className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        {/* ── Visible breadcrumbs (match BreadcrumbList schema exactly) ── */}
        <nav aria-label="Breadcrumb" className="py-6 text-sm text-neutral-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">
                0nMCP
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/ecosystem" className="hover:text-white">
                0n Apps
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white">
              {app.name}
            </li>
          </ol>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <header className="border-b border-white/10 pb-12">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {app.category}
          </p>

          {/* Exactly one H1, and it carries the primary keyword. */}
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {app.h1}
          </h1>

          {/* The deck is the AEO pull-quote. Keep it two sentences, max. */}
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-neutral-300">
            {app.deck}
          </p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {app.chips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300"
              >
                {chip}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <EcosystemCta
              app={app.slug}
              href={app.appUrl}
              placement="hero-primary"
              event="ecosystem_app_cta_click"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Start free on {app.name}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </EcosystemCta>

            <EcosystemCta
              app={app.slug}
              href={`${app.domain}/pricing`}
              placement="hero-secondary"
              event="ecosystem_app_pricing_click"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 font-medium text-white transition hover:bg-white/5"
            >
              See pricing
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </EcosystemCta>
          </div>
        </header>

        {/* ── WHAT IT IS — the definitional/AEO block ───────────────────── */}
        <section aria-labelledby="what-is" className="border-b border-white/10 py-14">
          <h2 id="what-is" className="text-3xl font-semibold tracking-tight">
            What is {app.name}?
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-neutral-300">
            {app.whatItIs.map((p, i) => (
              // First paragraph is the citation target — emphasize it.
              <p key={i} className={i === 0 ? 'text-pretty font-medium text-white' : 'text-pretty'}>
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* ── WHY 0nMCP — the strategic moat ────────────────────────────── */}
        <section aria-labelledby="why-mcp" className="border-b border-white/10 py-14">
          <h2 id="why-mcp" className="text-3xl font-semibold tracking-tight">
            Why {app.name} runs on 0nMCP
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-neutral-300">
            {app.whyMcp.map((p, i) => (
              <p key={i} className="text-pretty">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/capabilities"
              className="inline-flex items-center gap-2 text-emerald-300 underline decoration-emerald-500/40 underline-offset-4 hover:decoration-emerald-400"
            >
              Browse all 106 services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/0n-standard"
              className="inline-flex items-center gap-2 text-emerald-300 underline decoration-emerald-500/40 underline-offset-4 hover:decoration-emerald-400"
            >
              Read the .0n standard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ── CAPABILITIES ─────────────────────────────────────────────── */}
        <section aria-labelledby="capabilities" className="border-b border-white/10 py-14">
          <h2 id="capabilities" className="text-3xl font-semibold tracking-tight">
            What can {app.name} do?
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {app.capabilities.map((cap) => {
              const Icon =
                (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
                  cap.icon
                ] ?? Sparkles;
              return (
                <div
                  key={cap.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
                >
                  <Icon className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                  {/* H3 under the section H2 — hierarchy stays intact. */}
                  <h3 className="mt-4 flex items-center gap-2 text-xl font-semibold">
                    {cap.title}
                    {cap.status === 'beta' && (
                      <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Beta
                      </span>
                    )}
                  </h3>
                  <p className="mt-3 text-pretty leading-relaxed text-neutral-300">{cap.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section aria-labelledby="how-it-works" className="border-b border-white/10 py-14">
          <h2 id="how-it-works" className="text-3xl font-semibold tracking-tight">
            How does {app.name} work?
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {app.howItWorks.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-bold text-neutral-950">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-neutral-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── INTEGRATIONS — long-tail keyword surface ──────────────────── */}
        <section aria-labelledby="integrations" className="border-b border-white/10 py-14">
          <h2 id="integrations" className="text-3xl font-semibold tracking-tight">
            Which apps does {app.name} connect to?
          </h2>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-neutral-300">
            Over 100, reached through 0nMCP rather than built one at a time. Authorize a service once
            in the encrypted vault and every task, agent, and automation can use it.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {app.integrations.map((name) => (
              <li
                key={name}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-neutral-300"
              >
                {name}
              </li>
            ))}
            <li className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-sm text-emerald-300">
              <Link href="/integrations">+ all 106 services →</Link>
            </li>
          </ul>
        </section>

        {/* ── COMPARISON TABLE — high AEO extraction value ──────────────── */}
        <section aria-labelledby="comparison" className="border-b border-white/10 py-14">
          <h2 id="comparison" className="text-3xl font-semibold tracking-tight">
            {app.name} vs {app.comparison.againstLabel}
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Feature comparison of {app.name} against {app.comparison.againstLabel}
              </caption>
              <thead>
                <tr className="border-b border-white/15">
                  <th scope="col" className="py-3 pr-4 font-semibold text-neutral-400">
                    Dimension
                  </th>
                  <th scope="col" className="py-3 pr-4 font-semibold text-emerald-300">
                    {app.name}
                  </th>
                  <th scope="col" className="py-3 font-semibold text-neutral-400">
                    Typical {app.comparison.againstLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {app.comparison.rows.map((row) => (
                  <tr key={row.dimension} className="border-b border-white/5 align-top">
                    <th scope="row" className="py-4 pr-4 font-medium text-white">
                      {row.dimension}
                    </th>
                    <td className="py-4 pr-4 text-neutral-200">{row.ours}</td>
                    <td className="py-4 text-neutral-400">{row.theirs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── PRICING — mirrors the Offer schema exactly ────────────────── */}
        <section aria-labelledby="pricing" className="border-b border-white/10 py-14">
          <h2 id="pricing" className="text-3xl font-semibold tracking-tight">
            How much does {app.name} cost?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {app.offers.map((offer) => (
              <div
                key={offer.name}
                className={`flex flex-col rounded-xl border p-6 ${
                  offer.featured
                    ? 'border-emerald-500/50 bg-emerald-500/[0.07]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <h3 className="text-lg font-semibold">{offer.name}</h3>
                <p className="mt-3">
                  <span className="text-3xl font-bold">
                    {offer.price === 0 ? 'Free' : `$${offer.price}`}
                  </span>
                  {offer.price > 0 && (
                    <span className="text-sm text-neutral-400">
                      {offer.billingPeriod === 'MONTH' ? '/mo' : ' once'}
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-neutral-400">{offer.description}</p>
                {offer.trialDays && (
                  <p className="mt-2 text-xs text-emerald-300">{offer.trialDays}-day trial</p>
                )}
                {offer.limitNote && (
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {offer.limitNote}
                  </p>
                )}
                <ul className="mt-5 flex-1 space-y-2 text-sm text-neutral-300">
                  {offer.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <EcosystemCta
                  app={app.slug}
                  href={app.appUrl}
                  placement={`pricing-${offer.name.toLowerCase().replace(/\s+/g, '-')}`}
                  event="ecosystem_plan_selected"
                  extra={{ tier: offer.name, price: offer.price }}
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    offer.featured
                      ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
                      : 'border border-white/15 text-white hover:bg-white/5'
                  }`}
                >
                  {offer.price === 0 ? 'Start free' : `Get ${offer.name}`}
                </EcosystemCta>
              </div>
            ))}
          </div>
        </section>

        {/* ── AUDIENCES ────────────────────────────────────────────────── */}
        <section aria-labelledby="who-for" className="border-b border-white/10 py-14">
          <h2 id="who-for" className="text-3xl font-semibold tracking-tight">
            Who is {app.name} for?
          </h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {app.audiences.map((a) => (
              <div key={a.who} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <dt className="text-lg font-semibold text-white">{a.who}</dt>
                <dd className="mt-2 text-pretty leading-relaxed text-neutral-300">{a.why}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── SECURITY ─────────────────────────────────────────────────── */}
        <section aria-labelledby="security" className="border-b border-white/10 py-14">
          <h2 id="security" className="text-3xl font-semibold tracking-tight">
            Is {app.name} secure?
          </h2>
          <ul className="mt-7 space-y-4">
            {app.security.map((point) => (
              <li key={point} className="flex gap-3 text-lg leading-relaxed text-neutral-300">
                <Lock className="mt-1.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <span className="text-pretty">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ — mirrors FAQPage schema, questions as H3 ─────────────── */}
        <section aria-labelledby="faq" className="border-b border-white/10 py-14">
          <h2 id="faq" className="text-3xl font-semibold tracking-tight">
            {app.name} — frequently asked questions
          </h2>
          <div className="mt-8 divide-y divide-white/10">
            {app.faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="cursor-pointer list-none">
                  {/* H3, NOT H2 — questions are children of the FAQ heading. */}
                  <h3 className="flex items-start justify-between gap-4 text-lg font-medium text-white">
                    {faq.question}
                    <span
                      className="mt-1 shrink-0 text-emerald-400 transition group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </h3>
                </summary>
                <p className="mt-3 text-pretty leading-relaxed text-neutral-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CROSS-LINKS — passes authority both ways ──────────────────── */}
        <section aria-labelledby="explore" className="border-b border-white/10 py-14">
          <h2 id="explore" className="text-3xl font-semibold tracking-tight">
            Explore the 0n ecosystem
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {app.crossLinks.map((link) => (
              <li key={link.href}>
                <EcosystemLink
                  app={app.slug}
                  href={link.href}
                  external={link.external}
                  placement="cross-link"
                  className="block h-full rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-500/40 hover:bg-white/[0.06]"
                >
                  <span className="flex items-center gap-2 font-semibold text-white">
                    {link.label}
                    {link.external ? (
                      <ExternalLink className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
                    )}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-neutral-400">
                    {link.note}
                  </span>
                </EcosystemLink>
              </li>
            ))}
          </ul>

          {siblings.length > 0 && (
            <>
              <h3 className="mt-12 text-xl font-semibold">Other apps built on 0nMCP</h3>
              <ul className="mt-4 flex flex-wrap gap-3">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/ecosystem/${s.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-emerald-500/40"
                    >
                      {s.name}
                      <span className="text-neutral-500">{s.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section aria-labelledby="final-cta" className="py-16">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.12] to-transparent p-10 text-center">
            <h2 id="final-cta" className="text-3xl font-semibold tracking-tight">
              {app.finalCta.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-300">
              {app.finalCta.body}
            </p>
            <EcosystemCta
              app={app.slug}
              href={app.appUrl}
              placement="footer-cta"
              event="ecosystem_app_cta_click"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-8 py-4 text-lg font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              {app.finalCta.button}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </EcosystemCta>
            <p className="mt-4 text-sm text-neutral-400">
              Free forever tier · No credit card ·{' '}
              <EcosystemCta
                app={app.slug}
                href={app.domain}
                placement="footer-microlink"
                event="ecosystem_app_site_click"
                className="underline underline-offset-4 hover:text-white"
              >
                {app.domain.replace('https://', '')}
              </EcosystemCta>
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
