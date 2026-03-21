import type { MetadataRoute } from 'next'
import { STATS_DISPLAY } from '@/data/stats'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '0nMCP',
    short_name: '0nMCP',
    description: `Universal AI API Orchestrator — ${STATS_DISPLAY.tools} tools, ${STATS_DISPLAY.services} services. Manage add0ns, execute tasks, build workflows.`,
    start_url: '/app',
    display: 'standalone',
    background_color: '#0f1419',
    theme_color: '#7ed957',
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
