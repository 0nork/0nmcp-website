import { NextRequest, NextResponse } from 'next/server'
import { generateSxoPages, type SxoInput } from '@/lib/sxo-engine'
import { withSparks } from '@/lib/sparks-guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/sxo/generate
 *
 * Costs: 10 Sparks ⚡
 *
 * Generate SXO-optimized pages from structured business input.
 * Returns markdown + schema + metadata for each page.
 *
 * Body: SxoInput (brand, industry, services, locations, etc.)
 */
export const POST = withSparks('api.sxo.generate', async (req) => {
  const body = await req.json()

  if (!body.brand) {
    return NextResponse.json({ error: 'Missing required field: brand' }, { status: 400 })
  }

  const input: SxoInput = {
    brand: body.brand,
    industry: body.industry || 'business',
    services: body.services || [],
    locations: body.locations || [],
    cta: body.cta,
    domain: body.domain,
    logo: body.logo,
    primaryColor: body.primaryColor,
    tagline: body.tagline,
    phone: body.phone,
    email: body.email,
  }

  const output = generateSxoPages(input)
  return NextResponse.json(output)
})

/**
 * GET /api/sxo/generate?brand=...&industry=...&services=...&locations=...
 *
 * Costs: 10 Sparks ⚡
 *
 * Quick generation via query params (same as POST but GET-friendly).
 */
export const GET = withSparks('api.sxo.generate', async (req) => {
  const p = req.nextUrl.searchParams
  const brand = p.get('brand')

  if (!brand) {
    return NextResponse.json({
      error: 'Missing required parameter: brand',
      cost: '10 Sparks ⚡ per generation',
      usage: {
        endpoint: '/api/sxo/generate',
        method: 'POST (recommended) or GET',
        body: {
          brand: 'Your Business Name (required)',
          industry: 'contractor | saas | agency | ecommerce | realestate',
          services: ['Service 1', 'Service 2'],
          locations: ['City 1', 'City 2'],
          domain: 'yourdomain.com',
          phone: '555-123-4567',
          email: 'info@yourdomain.com',
          cta: 'Contact us for a free estimate.',
          tagline: 'Your tagline here',
        },
      },
    }, { status: 400 })
  }

  const input: SxoInput = {
    brand,
    industry: p.get('industry') || 'business',
    services: (p.get('services') || '').split(',').map(s => s.trim()).filter(Boolean),
    locations: (p.get('locations') || '').split(',').map(s => s.trim()).filter(Boolean),
    cta: p.get('cta') || undefined,
    domain: p.get('domain') || undefined,
    phone: p.get('phone') || undefined,
    email: p.get('email') || undefined,
  }

  const output = generateSxoPages(input)
  return NextResponse.json(output)
})
