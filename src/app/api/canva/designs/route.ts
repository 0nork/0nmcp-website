/**
 * Canva Design Operations API
 * POST — create design, export, upload asset, autofill template
 * GET — list/get designs, brand templates
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  createDesign, getDesign, exportDesign, getExportJob,
  uploadAsset, getAssetUpload, createFolder, listBrandTemplates,
  autofillDesign, getAutofillJob
} from '@/lib/canva/client'

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), {
    headers: { cookie: cookieHeader },
  })
  if (!accountRes.ok) return null
  const account = await accountRes.json()
  return account.id || account.user_id || null
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  try {
    switch (action) {
      case 'create': {
        const result = await createDesign(userId, {
          design_type: body.design_type,
          title: body.title,
          asset_id: body.asset_id,
        })
        return NextResponse.json(result)
      }

      case 'export': {
        const result = await exportDesign(userId, body.design_id, body.format || 'png')
        return NextResponse.json(result)
      }

      case 'export_status': {
        const result = await getExportJob(userId, body.job_id)
        return NextResponse.json(result)
      }

      case 'upload_asset': {
        const result = await uploadAsset(userId, body.name, body.url)
        return NextResponse.json(result)
      }

      case 'upload_status': {
        const result = await getAssetUpload(userId, body.job_id)
        return NextResponse.json(result)
      }

      case 'create_folder': {
        const result = await createFolder(userId, body.name, body.parent_folder_id)
        return NextResponse.json(result)
      }

      case 'autofill': {
        const result = await autofillDesign(userId, body.brand_template_id, body.data)
        return NextResponse.json(result)
      }

      case 'autofill_status': {
        const result = await getAutofillJob(userId, body.job_id)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'templates'

  try {
    switch (action) {
      case 'design': {
        const designId = searchParams.get('design_id')
        if (!designId) return NextResponse.json({ error: 'design_id required' }, { status: 400 })
        const result = await getDesign(userId, designId)
        return NextResponse.json(result)
      }

      case 'templates': {
        const result = await listBrandTemplates(userId)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
