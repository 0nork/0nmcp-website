/**
 * OAuth Install — redirects to CRM authorization page
 * GET /api/marketplace/oauth/install
 */

import { NextResponse } from 'next/server'
import { getOAuthInstallUrl } from '@/lib/marketplace'

export async function GET() {
  const state = crypto.randomUUID()
  const url = getOAuthInstallUrl(state)
  return NextResponse.redirect(url)
}
