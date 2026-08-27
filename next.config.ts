import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  trailingSlash: false,

  // The `gohighlevel` service entry was a duplicate of `crm` (slug 0nmcp-crm) that
  // published a forbidden vendor brand name on three indexed pages. Entry deleted;
  // these 301s move the link equity to the surviving CRM pages instead of 404ing.
  async redirects() {
    return [
      { source: '/turn-it-on/gohighlevel', destination: '/turn-it-on/0nmcp-crm', permanent: true },
      { source: '/integrations/gohighlevel', destination: '/integrations/0nmcp-crm', permanent: true },
      { source: '/tools/gohighlevel', destination: '/tools/0nmcp-crm', permanent: true },

      // `listkit` was published as a connector with four tool ids that exist
      // nowhere in the orchestrator — `service: "listkit"` throws
      // `Unknown service: listkit` in WorkflowRunner._executeService, and
      // 0nMCP/workflow.js says why in its own words: "ListKit has no API". It is
      // a partner data source, not an integration, so the three service pages
      // point at the partner listing that describes it truthfully.
      { source: '/turn-it-on/listkit', destination: '/partners', permanent: true },
      { source: '/integrations/listkit', destination: '/partners', permanent: true },
      { source: '/tools/listkit', destination: '/partners', permanent: true },
    ]
  },

  async rewrites() {
    return [
      {
        source: '/.well-known/oauth-protected-resource',
        destination: '/api/.well-known/oauth-protected-resource',
      },
      {
        source: '/.well-known/oauth-authorization-server',
        destination: '/api/.well-known/oauth-authorization-server',
      },
      {
        source: '/.well-known/jwks.json',
        destination: '/api/.well-known/jwks',
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/console/terminal',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/console/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "0nmcp",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",

  // Source map upload auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload wider set of client source files for better stack traces
  widenClientFileUpload: true,

  // Proxy route to bypass ad-blockers
  tunnelRoute: "/monitoring",

  // Suppress non-CI output
  silent: true,

  // Disable source map upload if no auth token configured
  ...(process.env.SENTRY_AUTH_TOKEN ? {} : { sourcemaps: { disable: true } }),
})
