/**
 * 0nDefender Patent Intelligence — Brand Protection Analyzer
 * Monitors for unauthorized use of 0nMCP names and false "patent pending" claims.
 */

import type { RawFinding } from '../classifier';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/** Brand terms to monitor — these are our trademarks and product names */
const PROTECTED_TERMS = [
  '0nMCP',
  '0nork',
  '0nCore',
  '0nPlex',
  '0nVault',
  '0nDefender',
  'MCPFed',
  'Seal of Truth',
  'Turn it 0n',
  'Brain Training Factory',
];

/** Our own domains — findings from these are NOT violations */
const OUR_DOMAINS = [
  '0nmcp.com',
  'rocketopp.com',
  'rocketclients.com',
  'npmjs.com/package/0nmcp',
  'npmjs.com/package/0nork',
  'npmjs.com/package/0n-spec',
  'github.com/0nork',
  'github.com/Crypto-Goatz',
];

/**
 * Run the brand protection analysis scan.
 * Searches for unauthorized use of our brand names and false patent claims.
 */
export async function analyzeBrandProtection(): Promise<RawFinding[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[0nDefender:brand-protection] No ANTHROPIC_API_KEY set');
    return [];
  }

  const findings: RawFinding[] = [];

  // Search for unauthorized brand usage
  try {
    const brandFindings = await searchBrandUsage(apiKey);
    findings.push(...brandFindings);
  } catch (err) {
    console.error('[0nDefender:brand-protection] Brand search failed:', err);
  }

  // Search for false patent pending claims in MCP space
  try {
    const patentClaimFindings = await searchFalsePatentClaims(apiKey);
    findings.push(...patentClaimFindings);
  } catch (err) {
    console.error('[0nDefender:brand-protection] Patent claims search failed:', err);
  }

  return findings;
}

async function searchBrandUsage(apiKey: string): Promise<RawFinding[]> {
  const termsFormatted = PROTECTED_TERMS.map((t) => `"${t}"`).join(', ');
  const domainsFormatted = OUR_DOMAINS.map((d) => `- ${d}`).join('\n');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 5,
        },
      ],
      messages: [
        {
          role: 'user',
          content: `You are a brand protection analyst for RocketOpp LLC. Search the web for unauthorized use of our brand names and product terms.

Protected terms to search for: ${termsFormatted}

Our legitimate domains (EXCLUDE these from findings):
${domainsFormatted}

Search for:
1. Websites or products using our exact brand names (especially "0nMCP", "MCPFed", "0nCore")
2. npm packages, GitHub repos, or tools impersonating our products
3. Marketing content misusing our terminology
4. Domain squatting (e.g., 0nmcp.io, 0nmcp.dev, 0nork.com if not ours)
5. Social media accounts impersonating our brand

For each violation found, extract:
{"title": "...", "description": "...", "source_url": "...", "violating_term": "...", "violation_type": "impersonation|domain_squatting|trademark_misuse|false_affiliation"}

IMPORTANT: Exclude any results from our own domains listed above. Only flag genuine unauthorized usage.
Return a JSON array. Return [] if no violations found.
Respond ONLY with the JSON array, no other text.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown');
    throw new Error(`Anthropic API returned ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return parseBrandFindings(data, 'brand_usage_search');
}

async function searchFalsePatentClaims(apiKey: string): Promise<RawFinding[]> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 5,
        },
      ],
      messages: [
        {
          role: 'user',
          content: `You are a patent enforcement analyst. Search the web for false "patent pending" claims in the MCP (Model Context Protocol) ecosystem.

RocketOpp LLC holds the ONLY patent applications in the MCP orchestration space:
- 63/968,814: Federated MCP Server Orchestration
- 63/990,046: Encrypted Digital Business Asset Transfer
- 64/006,268: Multi-Persona AI Model Orchestration
- 64/006,282: Profile-Adaptive Content Generation

Search for:
1. Any MCP-related product or service claiming "patent pending" status (that isn't ours)
2. Companies claiming to have patented MCP orchestration methods
3. Products claiming proprietary workflow execution patterns similar to Pipeline/Assembly Line/Radial Burst
4. Any entity claiming "patent pending" on encrypted vault/container transfer systems

For each finding, extract:
{"title": "...", "description": "...", "source_url": "...", "claimed_patent": "...", "company": "..."}

Only flag genuinely suspicious claims. Return a JSON array. Return [] if none found.
Respond ONLY with the JSON array, no other text.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown');
    throw new Error(`Anthropic API returned ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return parseBrandFindings(data, 'false_patent_claim_search');
}

function parseBrandFindings(
  data: { content?: Array<{ type: string; text?: string }> },
  sourceType: string
): RawFinding[] {
  const textBlock = data.content?.find(
    (block: { type: string; text?: string }) => block.type === 'text'
  );

  if (!textBlock?.text) {
    return [];
  }

  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      title?: string;
      description?: string;
      source_url?: string;
      violating_term?: string;
      violation_type?: string;
      claimed_patent?: string;
      company?: string;
    }>;

    // Filter out findings from our own domains
    const filtered = parsed.filter((item) => {
      if (!item.source_url) return true;
      const url = item.source_url.toLowerCase();
      return !OUR_DOMAINS.some((domain) => url.includes(domain.toLowerCase()));
    });

    return filtered
      .filter((item) => item.title && item.description)
      .map((item) => ({
        title: item.title || 'Untitled Brand Finding',
        description: item.description || '',
        source_url: item.source_url || 'https://unknown',
        source_type: sourceType,
        category: 'brand_violation' as const,
        raw_data: {
          violating_term: item.violating_term,
          violation_type: item.violation_type,
          claimed_patent: item.claimed_patent,
          company: item.company,
        },
      }));
  } catch (err) {
    console.error(`[0nDefender:brand-protection] JSON parse error for ${sourceType}:`, err);
    return [];
  }
}
