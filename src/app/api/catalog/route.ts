import { NextResponse } from 'next/server'
import servicesData from '@/data/services.json'

/**
 * GET /api/catalog — Public API serving the 0nMCP service catalog
 * Consumable by MCPFED, the marketplace, and any external tools.
 */
export async function GET() {
  return NextResponse.json(servicesData, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
