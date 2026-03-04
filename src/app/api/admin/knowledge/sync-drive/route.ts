import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getValidGoogleToken } from '@/lib/google-auth'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = ['mike@rocketopp.com']
const KNOWLEDGE_FOLDER_NAME = '0n Knowledge Base'
const DRIVE_API = 'https://www.googleapis.com/drive/v3'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface DriveFile {
  id: string
  name: string
  mimeType: string
  parents?: string[]
  modifiedTime: string
}

interface DriveFolder {
  id: string
  name: string
}

/**
 * Find a folder by name in Google Drive.
 */
async function findFolder(token: string, name: string, parentId?: string): Promise<string | null> {
  let q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`
  if (parentId) q += ` and '${parentId}' in parents`

  const res = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.files?.[0]?.id || null
}

/**
 * Create a folder in Google Drive.
 */
async function createFolder(token: string, name: string, parentId?: string): Promise<string> {
  const body: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  }
  if (parentId) body.parents = [parentId]

  const res = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return data.id
}

/**
 * List subfolders in a parent folder (each subfolder = a service_key).
 */
async function listSubfolders(token: string, parentId: string): Promise<DriveFolder[]> {
  const q = `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
  const res = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.files || []
}

/**
 * List files in a folder.
 */
async function listFiles(token: string, folderId: string): Promise<DriveFile[]> {
  const q = `'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`
  const res = await fetch(
    `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime)&pageSize=100&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.files || []
}

/**
 * Read file content — handles Google Docs (export as text) and plain files (download).
 */
async function readFileContent(token: string, file: DriveFile): Promise<string> {
  const isGoogleDoc = file.mimeType === 'application/vnd.google-apps.document'
  const url = isGoogleDoc
    ? `${DRIVE_API}/files/${file.id}/export?mimeType=text/plain`
    : `${DRIVE_API}/files/${file.id}?alt=media`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return ''
  return res.text()
}

/**
 * Parse a filename into knowledge entry metadata.
 * Format: "title.md" or "setup-guide--title.md" or "api_reference--title.txt"
 */
function parseFilename(name: string): { title: string; docType: string } {
  // Remove extension
  const base = name.replace(/\.(md|txt|doc|gdoc)$/i, '')

  // Check for doc_type prefix: "setup_guide--My Title"
  const parts = base.split('--')
  if (parts.length >= 2) {
    const typeMap: Record<string, string> = {
      setup: 'setup_guide', setup_guide: 'setup_guide',
      api: 'api_reference', api_reference: 'api_reference', reference: 'api_reference',
      troubleshoot: 'troubleshooting', troubleshooting: 'troubleshooting', debug: 'troubleshooting',
      best_practices: 'best_practices', practices: 'best_practices',
      changelog: 'changelog',
    }
    const docType = typeMap[parts[0].toLowerCase().trim()] || 'api_reference'
    const title = parts.slice(1).join('--').replace(/[-_]/g, ' ').trim()
    return { title: title || base, docType }
  }

  // Infer doc_type from keywords in filename
  const lower = base.toLowerCase()
  if (lower.includes('setup') || lower.includes('getting-started') || lower.includes('install')) {
    return { title: base.replace(/[-_]/g, ' '), docType: 'setup_guide' }
  }
  if (lower.includes('troubleshoot') || lower.includes('debug') || lower.includes('error') || lower.includes('fix')) {
    return { title: base.replace(/[-_]/g, ' '), docType: 'troubleshooting' }
  }
  if (lower.includes('best-practice') || lower.includes('tips')) {
    return { title: base.replace(/[-_]/g, ' '), docType: 'best_practices' }
  }

  return { title: base.replace(/[-_]/g, ' '), docType: 'api_reference' }
}

/**
 * POST /api/admin/knowledge/sync-drive
 *
 * Syncs the "0n Knowledge Base" Google Drive folder into the service_knowledge table.
 *
 * Folder structure:
 *   0n Knowledge Base/
 *     resend/
 *       setup-guide--Getting Started.md
 *       api_reference--Email Sending.md
 *       troubleshooting--Common Issues.md
 *     stripe/
 *       setup--API Keys.md
 *     anthropic/
 *       ...
 *
 * Each subfolder name = service_key
 * Each file = one knowledge entry
 * Filename format: "doc_type--Title.md" or just "Title.md"
 * Google Docs are exported as plain text automatically.
 */
export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  // Get Google token
  const google = await getValidGoogleToken(user.id)
  if (!google) {
    return NextResponse.json({
      error: 'Google not connected. Connect Google via the Console vault first.',
      action: 'connect_google',
    }, { status: 401 })
  }

  const token = google.accessToken
  const admin = getAdmin()

  // Find or create the knowledge base folder
  let folderId = await findFolder(token, KNOWLEDGE_FOLDER_NAME)
  if (!folderId) {
    folderId = await createFolder(token, KNOWLEDGE_FOLDER_NAME)
    // Create example subfolders
    for (const svc of ['resend', 'stripe', 'anthropic', 'supabase', 'openai']) {
      await createFolder(token, svc, folderId)
    }
    return NextResponse.json({
      success: true,
      action: 'folder_created',
      folderId,
      message: `Created "${KNOWLEDGE_FOLDER_NAME}" folder in Google Drive with example service subfolders. Add your docs there and sync again.`,
      driveUrl: `https://drive.google.com/drive/folders/${folderId}`,
    })
  }

  // List service subfolders
  const serviceFolders = await listSubfolders(token, folderId)
  if (serviceFolders.length === 0) {
    return NextResponse.json({
      success: true,
      action: 'no_services',
      message: `Found "${KNOWLEDGE_FOLDER_NAME}" folder but it has no service subfolders. Create subfolders named after services (e.g., "resend", "stripe") and add docs inside.`,
      driveUrl: `https://drive.google.com/drive/folders/${folderId}`,
    })
  }

  // Process each service folder
  const results: { service: string; imported: number; skipped: number; errors: string[] }[] = []
  let totalImported = 0

  for (const folder of serviceFolders) {
    const serviceKey = folder.name.toLowerCase().replace(/\s+/g, '_')
    const files = await listFiles(token, folder.id)
    const result = { service: serviceKey, imported: 0, skipped: 0, errors: [] as string[] }

    for (const file of files) {
      try {
        const content = await readFileContent(token, file)
        if (!content || content.trim().length < 10) {
          result.skipped++
          continue
        }

        const { title, docType } = parseFilename(file.name)

        // Upsert by service_key + title (avoids duplicates on re-sync)
        const { error } = await admin.from('service_knowledge').upsert(
          {
            service_key: serviceKey,
            doc_type: docType,
            title,
            content: content.trim(),
            url: `https://drive.google.com/file/d/${file.id}`,
            section: docType,
            tags: [serviceKey, docType, ...title.toLowerCase().split(' ').filter(w => w.length > 3)],
            priority: docType === 'setup_guide' ? 1 : docType === 'troubleshooting' ? 5 : 10,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'service_key,title', ignoreDuplicates: false }
        )

        if (error) {
          // If unique constraint doesn't exist, fall back to check-then-insert
          const { data: existing } = await admin
            .from('service_knowledge')
            .select('id')
            .eq('service_key', serviceKey)
            .eq('title', title)
            .maybeSingle()

          if (existing) {
            await admin.from('service_knowledge').update({
              doc_type: docType,
              content: content.trim(),
              url: `https://drive.google.com/file/d/${file.id}`,
              tags: [serviceKey, docType, ...title.toLowerCase().split(' ').filter(w => w.length > 3)],
              priority: docType === 'setup_guide' ? 1 : docType === 'troubleshooting' ? 5 : 10,
              updated_at: new Date().toISOString(),
            }).eq('id', existing.id)
          } else {
            await admin.from('service_knowledge').insert({
              service_key: serviceKey,
              doc_type: docType,
              title,
              content: content.trim(),
              url: `https://drive.google.com/file/d/${file.id}`,
              section: docType,
              tags: [serviceKey, docType, ...title.toLowerCase().split(' ').filter(w => w.length > 3)],
              priority: docType === 'setup_guide' ? 1 : docType === 'troubleshooting' ? 5 : 10,
              is_active: true,
            })
          }
          result.imported++
        } else {
          result.imported++
        }
        totalImported++
      } catch (err) {
        result.errors.push(`${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    results.push(result)
  }

  return NextResponse.json({
    success: true,
    action: 'synced',
    totalImported,
    services: results,
    driveUrl: `https://drive.google.com/drive/folders/${folderId}`,
    message: `Synced ${totalImported} docs from ${serviceFolders.length} service folders into the knowledge base.`,
  })
}

/**
 * GET /api/admin/knowledge/sync-drive — check sync status / folder info
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const google = await getValidGoogleToken(user.id)
  if (!google) {
    return NextResponse.json({
      connected: false,
      message: 'Google not connected. Connect via Console vault.',
    })
  }

  const folderId = await findFolder(google.accessToken, KNOWLEDGE_FOLDER_NAME)
  if (!folderId) {
    return NextResponse.json({
      connected: true,
      folderExists: false,
      message: 'No knowledge base folder found. POST to this endpoint to create one.',
    })
  }

  const serviceFolders = await listSubfolders(google.accessToken, folderId)

  // Count total files per service
  const services: { name: string; fileCount: number }[] = []
  for (const folder of serviceFolders) {
    const files = await listFiles(google.accessToken, folder.id)
    services.push({ name: folder.name, fileCount: files.length })
  }

  // Count entries in DB
  const admin = getAdmin()
  const { count } = await admin
    .from('service_knowledge')
    .select('id', { count: 'exact', head: true })

  return NextResponse.json({
    connected: true,
    folderExists: true,
    folderId,
    driveUrl: `https://drive.google.com/drive/folders/${folderId}`,
    serviceFolders: services,
    totalDriveFiles: services.reduce((s, f) => s + f.fileCount, 0),
    totalDbEntries: count || 0,
  })
}
