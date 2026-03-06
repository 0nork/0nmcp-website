/**
 * RSS Feed Library — Generation + Consumption
 *
 * Uses `feed` for generating RSS 2.0 / Atom 1.0 / JSON Feed
 * Uses `rss-parser` for consuming external feeds (0nMonitor)
 */

import { Feed } from 'feed'
import Parser from 'rss-parser'

const SITE_URL = 'https://0nmcp.com'
const AUTHOR = { name: 'Mike Mento', email: 'mike@rocketopp.com', link: SITE_URL }

/** Create a base Feed instance with 0nMCP branding */
export function createBaseFeed(opts: {
  title: string
  description: string
  feedPath: string
  id?: string
}): Feed {
  return new Feed({
    title: opts.title,
    description: opts.description,
    id: opts.id ?? `${SITE_URL}${opts.feedPath}`,
    link: SITE_URL,
    language: 'en',
    image: `${SITE_URL}/brand/icon-green.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `Copyright ${new Date().getFullYear()} RocketOpp LLC`,
    generator: '0nMCP Feed Engine',
    feedLinks: {
      rss2: `${SITE_URL}${opts.feedPath}?format=rss`,
      atom: `${SITE_URL}${opts.feedPath}?format=atom`,
      json: `${SITE_URL}${opts.feedPath}?format=json`,
    },
    author: AUTHOR,
  })
}

/** Render feed to the requested format */
export function renderFeed(feed: Feed, format?: string | null): { body: string; contentType: string } {
  switch (format) {
    case 'atom':
      return { body: feed.atom1(), contentType: 'application/atom+xml; charset=utf-8' }
    case 'json':
      return { body: feed.json1(), contentType: 'application/feed+json; charset=utf-8' }
    case 'rss':
    default:
      return { body: feed.rss2(), contentType: 'application/rss+xml; charset=utf-8' }
  }
}

/** Parse an external RSS/Atom feed URL */
export async function parseFeed(url: string, timeout = 8000) {
  const parser = new Parser({ timeout })
  return parser.parseURL(url)
}

/** Parse RSS/Atom from raw XML string */
export async function parseFeedString(xml: string) {
  const parser = new Parser()
  return parser.parseString(xml)
}

export { SITE_URL, AUTHOR }
