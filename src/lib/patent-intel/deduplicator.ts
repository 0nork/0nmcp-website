/**
 * 0nDefender Patent Intelligence — Deduplication via SHA-256 hashing
 * Uses Web Crypto API (crypto.subtle) for browser/edge compatibility.
 */

/**
 * Generate a SHA-256 hash from title + source URL for content deduplication.
 * Normalizes inputs (lowercase, trimmed) before hashing.
 */
export async function contentHash(title: string, sourceUrl: string): Promise<string> {
  const normalized = `${title.toLowerCase().trim()}|${sourceUrl.toLowerCase().trim()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if a content hash already exists in the intel_findings table.
 * Returns true if a record with this hash already exists.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isDuplicate(
  hash: string,
  supabase: any
): Promise<boolean> {
  const { data, error } = await supabase
    .from('intel_findings')
    .select('id')
    .eq('content_hash', hash)
    .limit(1);

  if (error) {
    console.error('[0nDefender] Dedup check failed:', error);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}
