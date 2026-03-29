/**
 * OnPress Cloud Extractor
 * Extracts a DesignSystem from a Figma file using the REST API.
 * Ported from class-onpress-figma-api.php + class-onpress-extractor.php.
 */

import { getFigmaFile } from '@/lib/figma/api'
import type {
  DesignSystem,
  DesignToken,
  ExtractedComponent,
  PageData,
  LayoutData,
  StyleData,
  FillData,
  StrokeData,
  EffectData,
} from './types'

// ── Helpers ──

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbaToString(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFillsFromNode(node: any): FillData[] {
  if (!node.fills || !Array.isArray(node.fills)) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return node.fills.filter((f: any) => f.visible !== false).map((fill: any) => {
    const data: FillData = {
      type: fill.type,
      color: null,
      opacity: fill.opacity ?? 1,
      gradientStops: null,
      imageHash: null,
    }
    if (fill.type === 'SOLID' && fill.color) {
      data.color = rgbToHex(fill.color.r, fill.color.g, fill.color.b)
    } else if (fill.type === 'IMAGE') {
      data.imageHash = fill.imageRef ?? null
    } else if (fill.type?.includes('GRADIENT') && fill.gradientStops) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.gradientStops = fill.gradientStops.map((s: any) => ({
        color: rgbToHex(s.color.r, s.color.g, s.color.b),
        position: s.position,
        opacity: s.color.a,
      }))
    }
    return data
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStrokesFromNode(node: any): StrokeData[] {
  if (!node.strokes || !Array.isArray(node.strokes)) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return node.strokes.filter((s: any) => s.visible !== false).map((stroke: any) => ({
    type: stroke.type,
    color: stroke.type === 'SOLID' && stroke.color
      ? rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b)
      : null,
    weight: node.strokeWeight ?? 1,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEffectsFromNode(node: any): EffectData[] {
  if (!node.effects) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return node.effects.filter((e: any) => e.visible !== false).map((effect: any) => ({
    type: effect.type,
    color: effect.color
      ? rgbaToString(effect.color.r, effect.color.g, effect.color.b, effect.color.a)
      : null,
    offset: effect.offset ?? null,
    radius: effect.radius ?? 0,
    spread: effect.spread ?? 0,
    visible: effect.visible ?? true,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCornerRadius(node: any): number | number[] {
  if (typeof node.cornerRadius === 'number') return node.cornerRadius
  if (node.rectangleCornerRadii) return node.rectangleCornerRadii
  return 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractLayout(node: any): LayoutData | null {
  if (!node.layoutMode || node.layoutMode === 'NONE') return null
  return {
    mode: node.layoutMode,
    paddingTop: node.paddingTop ?? 0,
    paddingRight: node.paddingRight ?? 0,
    paddingBottom: node.paddingBottom ?? 0,
    paddingLeft: node.paddingLeft ?? 0,
    itemSpacing: node.itemSpacing ?? 0,
    primaryAlign: node.primaryAxisAlignItems ?? 'MIN',
    counterAlign: node.counterAxisAlignItems ?? 'MIN',
    wrap: node.layoutWrap ?? 'NO_WRAP',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStyleData(node: any): StyleData {
  const style: StyleData = {
    fills: extractFillsFromNode(node),
    strokes: extractStrokesFromNode(node),
    cornerRadius: extractCornerRadius(node),
    opacity: node.opacity ?? 1,
    effects: extractEffectsFromNode(node),
    fontSize: null,
    fontFamily: null,
    fontWeight: null,
    lineHeight: null,
    letterSpacing: null,
    textAlign: null,
    textCase: null,
    textDecoration: null,
    color: null,
  }

  // Text-specific properties
  if (node.type === 'TEXT' && node.style) {
    style.fontFamily = node.style.fontFamily ?? null
    style.fontWeight = String(node.style.fontWeight ?? '')
    style.fontSize = node.style.fontSize ?? null
    style.lineHeight = node.style.lineHeightPx ?? null
    style.letterSpacing = node.style.letterSpacing ?? null
    style.textAlign = node.style.textAlignHorizontal ?? null
    style.textCase = node.style.textCase ?? null
    style.textDecoration = node.style.textDecoration ?? null

    // Text color from fills
    if (style.fills.length > 0 && style.fills[0].color) {
      style.color = style.fills[0].color
    }
  }

  return style
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNodeTree(node: any, depth = 0, maxDepth = 10): ExtractedComponent {
  const component: ExtractedComponent = {
    id: node.id,
    name: node.name ?? '',
    type: node.type,
    width: node.absoluteBoundingBox?.width ?? node.size?.x ?? 0,
    height: node.absoluteBoundingBox?.height ?? node.size?.y ?? 0,
    layout: extractLayout(node),
    styles: extractStyleData(node),
    children: [],
    text: node.type === 'TEXT' ? (node.characters ?? null) : null,
    imageHash: null,
    isComponent: node.type === 'COMPONENT' || node.type === 'COMPONENT_SET',
    componentName: node.type === 'COMPONENT' ? node.name : null,
    exportBytes: null,
  }

  // Check for image fills
  if (node.fills && Array.isArray(node.fills)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgFill = node.fills.find((f: any) => f.type === 'IMAGE')
    if (imgFill?.imageRef) {
      component.imageHash = imgFill.imageRef
    }
  }

  // Recurse children
  if (node.children && depth < maxDepth) {
    for (const child of node.children) {
      if (child.visible !== false) {
        component.children.push(extractNodeTree(child, depth + 1, maxDepth))
      }
    }
  }

  return component
}

// ── Color extraction from styles ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractColorTokensFromStyles(fileData: any): DesignToken[] {
  const colors: DesignToken[] = []
  const styles = fileData.styles || {}

  for (const [, styleMeta] of Object.entries(styles)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = styleMeta as any
    if (meta.styleType === 'FILL') {
      colors.push({
        name: meta.name,
        type: 'color',
        value: { hex: '#000000', rgba: 'rgba(0,0,0,1)' },
      })
    }
  }

  // Also walk the tree and collect unique solid fills
  const seenColors = new Set<string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walkForColors(node: any) {
    if (node.fills && Array.isArray(node.fills)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const fill of node.fills.filter((f: any) => f.type === 'SOLID' && f.visible !== false)) {
        if (fill.color) {
          const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b)
          if (!seenColors.has(hex)) {
            seenColors.add(hex)
            const name = node.name || `color-${hex.slice(1)}`
            colors.push({
              name,
              type: 'color',
              value: {
                hex,
                rgba: rgbaToString(fill.color.r, fill.color.g, fill.color.b, fill.opacity ?? 1),
              },
            })
          }
        }
      }
    }
    if (node.children) {
      for (const child of node.children) walkForColors(child)
    }
  }
  walkForColors(fileData.document)

  return colors
}

// ── Typography extraction ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTypographyTokens(fileData: any): DesignToken[] {
  const tokens: DesignToken[] = []
  const seen = new Set<string>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walk(node: any) {
    if (node.type === 'TEXT' && node.style) {
      const s = node.style
      const key = `${s.fontFamily}-${s.fontWeight}-${s.fontSize}`
      if (!seen.has(key)) {
        seen.add(key)
        tokens.push({
          name: node.name || `${s.fontFamily} ${s.fontWeight} ${s.fontSize}px`,
          type: 'typography',
          value: {
            fontFamily: s.fontFamily,
            fontWeight: String(s.fontWeight ?? 400),
            fontSize: s.fontSize,
            lineHeight: s.lineHeightPx ?? null,
            letterSpacing: s.letterSpacing ?? 0,
            textCase: s.textCase ?? 'ORIGINAL',
            textDecoration: s.textDecoration ?? 'NONE',
          },
        })
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child)
    }
  }
  walk(fileData.document)

  return tokens
}

// ── Spacing + Radii extraction ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSpacingTokens(fileData: any): DesignToken[] {
  const seen = new Set<number>()
  const tokens: DesignToken[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walk(node: any) {
    if (node.layoutMode && node.layoutMode !== 'NONE') {
      for (const val of [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft, node.itemSpacing]) {
        if (val > 0 && !seen.has(val)) {
          seen.add(val)
          tokens.push({ name: `spacing-${val}`, type: 'spacing', value: val })
        }
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child)
    }
  }
  walk(fileData.document)

  return tokens.sort((a, b) => a.value - b.value)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRadiiTokens(fileData: any): DesignToken[] {
  const radii = new Set<number>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walk(node: any) {
    if (typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
      radii.add(node.cornerRadius)
    }
    if (node.children) {
      for (const child of node.children) walk(child)
    }
  }
  walk(fileData.document)

  return [...radii].sort((a, b) => a - b).map(r => ({
    name: `radius-${r}`,
    type: 'borderRadius',
    value: r,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEffectTokens(fileData: any): DesignToken[] {
  const tokens: DesignToken[] = []
  const styles = fileData.styles || {}

  for (const [, styleMeta] of Object.entries(styles)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = styleMeta as any
    if (meta.styleType === 'EFFECT') {
      tokens.push({
        name: meta.name,
        type: 'effect',
        value: [],
      })
    }
  }

  return tokens
}

// ── Main extract function ──

/**
 * Extract a full DesignSystem from a Figma file via REST API.
 * @param fileKey - Figma file key (from URL)
 * @param accessToken - Figma OAuth access token
 */
export async function extractDesignSystem(
  fileKey: string,
  accessToken: string
): Promise<DesignSystem> {
  // Fetch full file from Figma API
  const fileData = await getFigmaFile(fileKey, { accessToken }) as Record<string, unknown>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = (fileData as any).document
  if (!doc) {
    throw new Error('Invalid Figma file data: no document found')
  }

  // Extract tokens
  const colors = extractColorTokensFromStyles(fileData)
  const typography = extractTypographyTokens(fileData)
  const effects = extractEffectTokens(fileData)
  const spacing = extractSpacingTokens(fileData)
  const radii = extractRadiiTokens(fileData)

  // Extract page structure + components
  const pages: PageData[] = []
  const allComponents: ExtractedComponent[] = []

  for (const page of doc.children || []) {
    const pageData: PageData = { name: page.name, frames: [] }

    for (const frame of page.children || []) {
      if (['FRAME', 'COMPONENT', 'COMPONENT_SET', 'SECTION'].includes(frame.type)) {
        const extracted = extractNodeTree(frame)
        pageData.frames.push(extracted)

        if (extracted.isComponent) allComponents.push(extracted)

        // Collect nested components
        function findComponents(node: ExtractedComponent) {
          if (node.isComponent) allComponents.push(node)
          node.children.forEach(findComponents)
        }
        extracted.children.forEach(findComponents)
      }
    }
    pages.push(pageData)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileName = (fileData as any).name || 'Untitled'

  return {
    colors,
    typography,
    effects,
    spacing,
    radii,
    components: allComponents,
    pages,
    metadata: {
      fileName,
      pageCount: pages.length,
      componentCount: allComponents.length,
      timestamp: new Date().toISOString(),
    },
  }
}
