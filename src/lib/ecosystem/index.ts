import type { EcosystemApp } from './types'
import { ONTASK } from './0ntask'

/**
 * The 0n Apps registry. Add an app by dropping its file in this directory and
 * appending it here — the route, metadata, JSON-LD, breadcrumbs and sitemap
 * entries are all generated from the data.
 */
export const ECOSYSTEM_APPS: EcosystemApp[] = [ONTASK]

export const getApp = (slug: string) => ECOSYSTEM_APPS.find((a) => a.slug === slug)
export const APP_SLUGS = ECOSYSTEM_APPS.map((a) => a.slug)

export type { EcosystemApp } from './types'
