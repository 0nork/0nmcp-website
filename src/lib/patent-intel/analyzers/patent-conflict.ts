/**
 * 0nDefender Patent Intelligence — Patent Conflict Analyzer
 * Searches Google Patents and USPTO for filings overlapping our claims.
 */

import type { RawFinding } from '../classifier';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const PATENT_SEARCH_QUERIES = [
  {
    query: 'MCP server federation orchestration patent 2025 2026',
    target_patent: '63/968,814',
    focus: 'federated MCP orchestration, multi-layer workflow execution, pipeline/assembly line/radial burst',
  },
  {
    query: 'encrypted digital asset transfer semantic layers patent 2025 2026',
    target_patent: '63/990,046',
    focus: 'semantically-layered encryption, multi-party escrow, AES-256-GCM per-layer, Argon2id vault',
  },
  {
    query: 'multi-persona AI orchestration dual-track scoring patent 2025 2026',
    target_patent: '64/006,268',
    focus: 'multi-persona heterogeneous AI models, dual-track competitive scoring, knowledge accumulation threshold',
  },
  {
    query: 'profile-adaptive content generation Thompson Sampling patent 2025 2026',
    target_patent: '64/006,282',
    focus: 'OAuth callback content generation, language variation optimization, cross-user behavioral intelligence',
  },
  {
    query: 'AI workflow execution pipeline parallel burst patent filing',
    target_patent: '63/968,814',
    focus: 'three-tier execution patterns: sequential pipeline, parallel assembly line, fan-out radial burst',
  },
];

/**
 * Run the patent conflict analysis scan.
 * Searches for patent filings that may overlap our claims.
 */
export async function analyzePatentConflicts(): Promise<RawFinding[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[0nDefender:patent-conflict] No ANTHROPIC_API_KEY set');
    return [];
  }

  const findings: RawFinding[] = [];

  // Run searches in sequence to stay within rate limits
  for (const search of PATENT_SEARCH_QUERIES) {
    try {
      const results = await searchPatentDatabase(apiKey, search);
      findings.push(...results);
    } catch (err) {
      console.error(
        `[0nDefender:patent-conflict] Search failed for "${search.query}":`,
        err
      );
    }
  }

  return findings;
}

async function searchPatentDatabase(
  apiKey: string,
  search: { query: string; target_patent: string; focus: string }
): Promise<RawFinding[]> {
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
          content: `You are a patent analyst. Search Google Patents (patents.google.com) and USPTO (patents.uspto.gov) for patent applications or grants that may conflict with our claims.

Search query: "${search.query}"

Our patent being protected: ${search.target_patent}
Key claims to check for overlap: ${search.focus}

Search for:
1. Published patent applications (US, PCT, EP) with similar claims
2. Granted patents covering similar methods
3. Recent filings (2024-2026) in the same technical area

For each potentially conflicting patent found, extract:
- Patent/application number
- Title
- Assignee/applicant
- Filing date (if available)
- Which of our claims it potentially overlaps
- Brief overlap analysis

Return a JSON array of findings:
[{"title": "US20250XXXXXX - [Patent Title]", "description": "Filed by [Company]. Claims overlap with our [specific claims]. [Analysis].", "source_url": "https://patents.google.com/patent/...", "patent_number": "...", "assignee": "...", "overlap_claims": "..."}]

Return [] if no conflicting patents found. Be thorough but only flag genuine overlaps.
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
      patent_number?: string;
      assignee?: string;
      overlap_claims?: string;
    }>;

    return parsed
      .filter((item) => item.title && item.description)
      .map((item) => ({
        title: item.title || 'Unknown Patent',
        description: `${item.description || ''} ${item.overlap_claims ? `Overlap: ${item.overlap_claims}` : ''}`.trim(),
        source_url: item.source_url || `https://patents.google.com/patent/${item.patent_number || ''}`,
        source_type: 'patent_database_search',
        category: 'patent_conflict' as const,
        raw_data: {
          patent_number: item.patent_number,
          assignee: item.assignee,
          target_patent: search.target_patent,
          overlap_claims: item.overlap_claims,
        },
      }));
  } catch (err) {
    console.error('[0nDefender:patent-conflict] JSON parse error:', err);
    return [];
  }
}
