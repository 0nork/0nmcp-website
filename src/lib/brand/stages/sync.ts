import { createClient } from '@supabase/supabase-js'
import { syncBrandToCRM } from '../crm/syncBrand'
import type { OnBrandFile, BrandInput } from '@/types/brand'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function stageSyncAndSave(
  brandFile: OnBrandFile,
  input: BrandInput
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []

  // Save .0n file to Supabase
  const { error: dbError } = await supabase
    .from('brand_profiles')
    .upsert({
      sub_location_id: brandFile.sub_location_id,
      schema_version: '0n-brand/v1',
      brand_json: brandFile,
      canva_folder_id: brandFile.metadata?.canva_folder_id,
      generation_mode: input.mode,
      generation_source: input.source_url ?? input.logo_url ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'sub_location_id' })

  if (dbError) errors.push(`Supabase: ${dbError.message}`)

  // Save individual assets
  if (brandFile.canva_assets?.length) {
    const assetRows = brandFile.canva_assets.map(a => ({
      sub_location_id: brandFile.sub_location_id,
      asset_type: a.type,
      canva_design_id: a.design_id,
      canva_export_url: a.export_url,
      canva_edit_url: a.edit_url,
      format: 'png',
    }))

    const { error: assetError } = await supabase
      .from('brand_assets')
      .upsert(assetRows, { onConflict: 'sub_location_id,asset_type' })

    if (assetError) errors.push(`brand_assets: ${assetError.message}`)
  }

  // Sync to CRM — non-fatal
  const crmResult = await syncBrandToCRM(brandFile.sub_location_id, brandFile)
  if (!crmResult.success) {
    errors.push(`CRM sync: ${crmResult.error}`)
  } else {
    await supabase
      .from('brand_profiles')
      .update({ crm_synced_at: new Date().toISOString() })
      .eq('sub_location_id', brandFile.sub_location_id)
  }

  return { success: errors.length === 0, errors }
}
