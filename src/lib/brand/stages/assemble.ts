import type {
  BrandInput, ExtractedBrand, GeneratedAssets, ExportedAssets,
  BrandVoice, OnBrandFile, DynamicFact
} from '@/types/brand'

type AssembleInput = BrandInput & ExtractedBrand & GeneratedAssets & ExportedAssets & { brandVoice: BrandVoice }

export async function stageAssemble(input: AssembleInput): Promise<AssembleInput & { assembled: OnBrandFile }> {
  const now = new Date().toISOString()

  const assembled: OnBrandFile = {
    schema: '0n-brand/v1',
    generated: now,
    sub_location_id: input.sub_location_id,

    metadata: {
      generation_mode: input.mode,
      source_url: input.source_url,
      canva_folder_id: input.canvaFolderId,
      generated_at: now,
    },

    business: {
      name: input.business_name ?? input.name ?? '',
      tagline: input.tagline ?? '',
      description: input.description ?? input.business_description ?? '',
      founded: input.founded ? String(input.founded) : '',
      phone: input.phone ?? '',
      booking_url: '',
      contact_url: '',
    },

    identity: {
      logos: {
        primary: {
          url: input.logoAssets?.primary?.export_url ?? input.logo_primary_url ?? '',
          width: 180, height: 48,
          canva_design_id: input.logoAssets?.primary?.design_id,
          canva_edit_url: input.logoAssets?.primary?.edit_url,
        },
        icon: {
          url: input.logoAssets?.icon?.export_url ?? input.logo_icon_url ?? '',
          width: 48, height: 48,
          canva_design_id: input.logoAssets?.icon?.design_id,
          canva_edit_url: input.logoAssets?.icon?.edit_url,
        },
        dark: { url: '', width: 180, height: 48 },
        light: { url: '', width: 180, height: 48 },
      },
      colors: {
        primary: input.primary_color ?? '#000000',
        secondary: input.secondary_color ?? '#ffffff',
        accent: input.accent_color ?? '#6EE05A',
        background: input.background_color ?? '#ffffff',
        text_color: input.text_color ?? '#000000',
      },
      fonts: {
        display: { family: input.display_font ?? '', weight: '700' },
        body: { family: input.body_font ?? '', weight: '400' },
        mono: { family: '', weight: '400' },
      },
    },

    dynamic_facts: buildDynamicFacts(input),

    services: input.services?.slice(0, 3).map((s, i) => ({
      id: i + 1,
      name: s.name ?? '',
      description: s.description ?? '',
      price: String(s.price ?? ''),
      price_type: (s.price_type as 'flat') ?? 'flat',
      units_label: '',
      units_conducted: '',
      enabled: true,
    })) ?? [
      { id: 1, enabled: false },
      { id: 2, enabled: false },
      { id: 3, enabled: false },
    ],

    voice: input.brandVoice,

    canva_assets: input.exportedAssets?.map(a => ({
      type: a.type,
      design_id: a.design_id,
      export_url: a.export_url ?? '',
      edit_url: a.edit_url,
      thumbnail_url: a.thumbnail_url,
    })),
  }

  return { ...input, assembled }
}

function buildDynamicFacts(input: Partial<ExtractedBrand>): DynamicFact[] {
  const facts: DynamicFact[] = []

  if (input.founded) {
    facts.push({
      id: 'yib',
      label: 'Years in business',
      type: 'age_from_year',
      value: String(input.founded),
      suffix: 'years in business',
      enabled: true,
    })
  }

  return facts
}
