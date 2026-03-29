/**
 * OnPress Packager
 * Packages generated files into a ZIP using JSZip.
 * Uploads to Supabase Storage.
 */

import JSZip from 'jszip'
import { createClient } from '@supabase/supabase-js'

const STORAGE_BUCKET = 'onpress-outputs'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * Package a file map into a ZIP buffer.
 * @param files - Map of filename → content
 * @param rootDir - Root directory name inside the ZIP
 */
export async function createZipBuffer(
  files: Record<string, string>,
  rootDir: string
): Promise<Buffer> {
  const zip = new JSZip()
  const folder = zip.folder(rootDir)!

  for (const [filename, content] of Object.entries(files)) {
    folder.file(filename, content)
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  return buffer
}

/**
 * Upload a ZIP buffer to Supabase Storage.
 * Returns the storage path.
 */
export async function uploadZipToStorage(
  buffer: Buffer,
  userId: string,
  projectId: string,
  filename: string
): Promise<string> {
  const admin = getAdminClient()
  if (!admin) throw new Error('Missing Supabase admin client')

  const storagePath = `${userId}/${projectId}/${filename}`

  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'application/zip',
      upsert: true,
    })

  if (error) {
    throw new Error(`Failed to upload ZIP: ${error.message}`)
  }

  return storagePath
}

/**
 * Get a signed download URL for a ZIP file.
 * Expires in 1 hour.
 */
export async function getDownloadUrl(storagePath: string): Promise<string> {
  const admin = getAdminClient()
  if (!admin) throw new Error('Missing Supabase admin client')

  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate download URL: ${error?.message}`)
  }

  return data.signedUrl
}

/**
 * Full pipeline: generate ZIP → upload → return download URL.
 */
export async function packageAndUpload(
  files: Record<string, string>,
  rootDir: string,
  userId: string,
  projectId: string
): Promise<{ storagePath: string; downloadUrl: string; fileCount: number; manifest: string[] }> {
  const filename = `${rootDir}.zip`
  const buffer = await createZipBuffer(files, rootDir)
  const storagePath = await uploadZipToStorage(buffer, userId, projectId, filename)
  const downloadUrl = await getDownloadUrl(storagePath)

  return {
    storagePath,
    downloadUrl,
    fileCount: Object.keys(files).length,
    manifest: Object.keys(files),
  }
}
