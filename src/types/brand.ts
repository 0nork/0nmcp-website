export type GenerationMode = 'url' | 'logo' | 'colors' | 'random'

export interface BrandInput {
  mode: GenerationMode
  sub_location_id: string
  source_url?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  style_direction?: string
  industry?: string
  vibe?: string
  business_name?: string
  business_description?: string
}

export interface ExtractedBrand {
  name?: string
  tagline?: string
  description?: string
  founded?: number | null
  phone?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  text_color?: string
  display_font?: string
  body_font?: string
  logo_primary_url?: string
  logo_icon_url?: string
  industry?: string
  brand_vibe?: string
  style_description?: string
  logo_concept?: string
  services?: Array<{
    name: string
    description?: string
    price?: string
    price_type?: string
  }>
}

export interface GeneratedAsset {
  type: string
  design_id: string
  edit_url: string
  thumbnail_url: string
  export_url?: string
  export_expires_at?: string
}

export interface GeneratedAssets {
  generatedAssets: GeneratedAsset[]
  canvaFolderId: string
}

export interface ExportedAssets {
  exportedAssets: GeneratedAsset[]
  logoAssets: {
    primary?: GeneratedAsset
    icon?: GeneratedAsset
  }
}

export interface BrandVoice {
  tone: string
  personality_traits: string[]
  dos: string[]
  donts: string[]
  power_keywords: string[]
  prohibited_words: string[]
  tagline_options: string[]
  sample_headline: string
  sample_body: string
  sample_cta: string
}

export interface LogoSlot {
  url: string
  width: number
  height: number
  canva_design_id?: string
  canva_edit_url?: string
}

export interface FontDef {
  family: string
  weight: string
}

export interface DynamicFact {
  id: string
  label: string
  type: 'age_from_year' | 'count' | 'currency' | 'percentage' | 'text'
  value: string
  suffix: string
  enabled: boolean
}

export interface ServiceDef {
  id: number
  name?: string
  description?: string
  price?: string
  price_type?: 'flat' | 'hourly' | 'starting_at' | 'range' | 'free' | 'contact'
  units_label?: string
  units_conducted?: string
  enabled: boolean
}

export interface CanvaAssetRef {
  type: string
  design_id: string
  export_url: string
  edit_url: string
  thumbnail_url: string
}

export interface OnBrandFile {
  schema: '0n-brand/v1'
  generated: string
  sub_location_id: string
  metadata?: {
    generation_mode: GenerationMode
    source_url?: string
    canva_folder_id?: string
    generated_at: string
  }
  business: {
    name: string
    tagline: string
    description: string
    founded: string
    phone: string
    booking_url: string
    contact_url: string
  }
  identity: {
    logos: {
      primary: LogoSlot
      icon: LogoSlot
      dark: LogoSlot
      light: LogoSlot
    }
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text_color: string
    }
    fonts: {
      display: FontDef
      body: FontDef
      mono: FontDef
    }
  }
  dynamic_facts: DynamicFact[]
  services: ServiceDef[]
  voice?: BrandVoice
  canva_assets?: CanvaAssetRef[]
}
