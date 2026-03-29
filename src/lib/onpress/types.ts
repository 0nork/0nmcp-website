/**
 * OnPress Design System Types
 * Ported from onpress/code.ts Figma plugin interfaces.
 * These are the canonical types for the cloud engine.
 */

export interface DesignToken {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  type: string
}

export interface ExtractedComponent {
  id: string
  name: string
  type: string
  width: number
  height: number
  layout: LayoutData | null
  styles: StyleData
  children: ExtractedComponent[]
  text: string | null
  imageHash: string | null
  isComponent: boolean
  componentName: string | null
  exportBytes: number[] | null
}

export interface LayoutData {
  mode: string
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  itemSpacing: number
  primaryAlign: string
  counterAlign: string
  wrap: string
}

export interface StyleData {
  fills: FillData[]
  strokes: StrokeData[]
  cornerRadius: number | number[]
  opacity: number
  effects: EffectData[]
  fontSize: number | null
  fontFamily: string | null
  fontWeight: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lineHeight: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  letterSpacing: any
  textAlign: string | null
  textCase: string | null
  textDecoration: string | null
  color: string | null
}

export interface FillData {
  type: string
  color: string | null
  opacity: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gradientStops: any[] | null
  imageHash: string | null
}

export interface StrokeData {
  type: string
  color: string | null
  weight: number
}

export interface EffectData {
  type: string
  color: string | null
  offset: { x: number; y: number } | null
  radius: number
  spread: number
  visible: boolean
}

export interface DesignSystem {
  colors: DesignToken[]
  typography: DesignToken[]
  effects: DesignToken[]
  spacing: DesignToken[]
  radii: DesignToken[]
  components: ExtractedComponent[]
  pages: PageData[]
  metadata: {
    fileName: string
    pageCount: number
    componentCount: number
    timestamp: string
  }
}

export interface PageData {
  name: string
  frames: ExtractedComponent[]
}

/** Config for theme/plugin generation */
export interface GenerationConfig {
  slug: string
  name: string
  type: 'theme' | 'plugin'
  options?: {
    woocommerce?: boolean
    gutenbergBlocks?: boolean
    customizer?: boolean
    widgets?: boolean
    restApi?: boolean
  }
}
