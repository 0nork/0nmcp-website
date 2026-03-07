import { NextRequest, NextResponse } from 'next/server'
import { getIndustryFormula, listIndustries } from '@/lib/sxo-engine'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sxo/formula?industry=contractor
 *
 * Returns the SXO formula template for an industry.
 * Without ?industry, returns all available industries.
 */
export async function GET(req: NextRequest) {
  const industry = req.nextUrl.searchParams.get('industry')

  if (!industry) {
    return NextResponse.json({
      industries: listIndustries(),
      usage: '/api/sxo/formula?industry=contractor',
    })
  }

  const formula = getIndustryFormula(industry)

  return NextResponse.json({
    industry: formula.industry,
    problemSolutions: formula.problemSolutions,
    blocks: [
      { type: 'entity', description: 'Business identity and value proposition' },
      { type: 'service_cluster', description: 'Service offerings with related services' },
      { type: 'problem_solution', description: 'Customer pain points with solutions' },
      { type: 'authority', description: 'Trust signals, credentials, social proof' },
      { type: 'location', description: 'Geographic signals and service areas' },
      { type: 'portfolio', description: 'Case studies and project examples' },
      { type: 'cta', description: 'Clear calls to action' },
    ],
  })
}
