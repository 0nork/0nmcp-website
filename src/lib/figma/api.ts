/**
 * Figma REST API client
 * Wraps key Figma endpoints used by OnPress extraction.
 */

const FIGMA_API = 'https://api.figma.com/v1'

interface FigmaApiOptions {
  accessToken: string
}

/** Parse a Figma file URL into a file key */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  // https://www.figma.com/file/ABC123/FileName or /design/ABC123/...
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)
  if (!match) return null

  const fileKey = match[1]

  // Check for node-id param
  const urlObj = new URL(url)
  const nodeId = urlObj.searchParams.get('node-id') || undefined

  return { fileKey, nodeId }
}

/** Get full Figma file data */
export async function getFigmaFile(
  fileKey: string,
  opts: FigmaApiOptions
): Promise<Record<string, unknown>> {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}`, {
    headers: { 'X-Figma-Token': opts.accessToken },
  })

  if (!res.ok) {
    throw new Error(`Figma API /files/${fileKey} failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

/** Get file styles (published) */
export async function getFigmaStyles(
  fileKey: string,
  opts: FigmaApiOptions
): Promise<Record<string, unknown>> {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}/styles`, {
    headers: { 'X-Figma-Token': opts.accessToken },
  })

  if (!res.ok) {
    throw new Error(`Figma styles fetch failed: ${res.status}`)
  }

  return res.json()
}

/** Get file components */
export async function getFigmaComponents(
  fileKey: string,
  opts: FigmaApiOptions
): Promise<Record<string, unknown>> {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}/components`, {
    headers: { 'X-Figma-Token': opts.accessToken },
  })

  if (!res.ok) {
    throw new Error(`Figma components fetch failed: ${res.status}`)
  }

  return res.json()
}

/** Export images for given node IDs */
export async function getFigmaImages(
  fileKey: string,
  nodeIds: string[],
  opts: FigmaApiOptions & { format?: 'png' | 'svg' | 'jpg'; scale?: number }
): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    ids: nodeIds.join(','),
    format: opts.format || 'png',
    scale: String(opts.scale || 2),
  })

  const res = await fetch(`${FIGMA_API}/images/${fileKey}?${params}`, {
    headers: { 'X-Figma-Token': opts.accessToken },
  })

  if (!res.ok) {
    throw new Error(`Figma image export failed: ${res.status}`)
  }

  const data = await res.json()
  return data.images || {}
}

/** Get file variables (design tokens) */
export async function getFigmaVariables(
  fileKey: string,
  opts: FigmaApiOptions
): Promise<Record<string, unknown>> {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}/variables/local`, {
    headers: { 'X-Figma-Token': opts.accessToken },
  })

  if (!res.ok) {
    throw new Error(`Figma variables fetch failed: ${res.status}`)
  }

  return res.json()
}

/** Get specific nodes from a file */
export async function getFigmaNodes(
  fileKey: string,
  nodeIds: string[],
  opts: FigmaApiOptions
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({ ids: nodeIds.join(',') })

  const res = await fetch(`${FIGMA_API}/files/${fileKey}/nodes?${params}`, {
    headers: { 'X-Figma-Token': opts.accessToken },
  })

  if (!res.ok) {
    throw new Error(`Figma nodes fetch failed: ${res.status}`)
  }

  return res.json()
}
