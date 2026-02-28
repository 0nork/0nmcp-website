import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '0nMCP',
    short_name: '0nMCP',
    description: 'Universal AI API Orchestrator — 819 tools, 48 services. Manage add0ns, execute tasks, build workflows.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#00ff88',
    orientation: 'any',
    categories: ['developer', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
