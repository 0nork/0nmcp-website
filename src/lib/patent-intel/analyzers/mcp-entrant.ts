/**
 * 0nDefender Patent Intelligence — MCP Entrant Analyzer
 * Searches for new entrants in the MCP ecosystem that may overlap our patents.
 */

import type { RawFinding } from '../classifier';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SEARCH_QUERIES = [
  'MCP orchestration platform 2026',
  'MCP server federation protocol',
  'AI workflow automation MCP tool',
  'model context protocol marketplace',
  'MCP multi-server routing',
  'MCP workflow execution engine',
];

const WATCHLIST_COMPANIES = [
  'Anthropic MCP ecosystem',
  'LangChain MCP integration',
  'Vercel AI SDK MCP',
  'Microsoft Copilot MCP',
  'Google Gemini MCP support',
  'AWS Bedrock MCP',
  'Salesforce AI MCP',
  'ServiceNow MCP',
  'Zapier MCP automation',
  'n8n MCP integration',
  'Make.com MCP',
  'Relevance AI MCP',
  'Rivet AI MCP',
];

/**
 * Run the MCP entrant analysis scan.
 * Searches for new competitors and ecosystem entrants via Anthropic web search.
 */
export async function analyzeMcpEntrants(): Promise<RawFinding[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[0nDefender:mcp-entrant] No ANTHROPIC_API_KEY set');
    return [];
  }

  const findings: RawFinding[] = [];

  // Run general MCP ecosystem search
  try {
    const ecosystemFindings = await searchMcpEcosystem(apiKey);
    findings.push(...ecosystemFindings);
  } catch (err) {
    console.error('[0nDefender:mcp-entrant] Ecosystem search failed:', err);
  }

  // Run watchlist company search
  try {
    const watchlistFindings = await searchWatchlistCompanies(apiKey);
    findings.push(...watchlistFindings);
  } catch (err) {
    console.error('[0nDefender:mcp-entrant] Watchlist search failed:', err);
  }

  return findings;
}

async function searchMcpEcosystem(apiKey: string): Promise<RawFinding[]> {
  const queryList = SEARCH_QUERIES.map((q, i) => `${i + 1}. "${q}"`).join('\n');

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
          content: `You are a competitive intelligence analyst monitoring the MCP (Model Context Protocol) ecosystem for RocketOpp LLC.

Search the web for new MCP ecosystem entrants, platforms, and tools. Focus on these topics:
${queryList}

For each relevant finding, extract:
- company/project name
- what they're building
- URL source
- how it might compete with MCP orchestration, workflow execution, or federation

Respond with a JSON array of findings. Each finding should have:
{"title": "...", "description": "...", "source_url": "...", "company": "..."}

Only include genuinely new or notable entrants. Exclude Anthropic's own MCP documentation. Return [] if nothing notable found.
Respond ONLY with the JSON array, no other text.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown');
    throw new Error(`Anthropic API returned ${response.status}: ${errText}`);
  }

  return parseAnthropicFindings(await response.json(), 'mcp_ecosystem_search');
}

async function searchWatchlistCompanies(apiKey: string): Promise<RawFinding[]> {
  const companiesList = WATCHLIST_COMPANIES.map((c, i) => `${i + 1}. ${c}`).join('\n');

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
          content: `You are a competitive intelligence analyst. Search the web for recent MCP-related activity from these companies/projects:

${companiesList}

Look for:
- New MCP server implementations
- MCP marketplace or hub announcements
- Workflow orchestration features using MCP
- Federation or multi-server routing features
- Any product launches that compete with MCP orchestration platforms

For each finding, extract:
{"title": "...", "description": "...", "source_url": "...", "company": "..."}

Only include findings from the last 90 days. Return a JSON array. Return [] if nothing notable.
Respond ONLY with the JSON array, no other text.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown');
    throw new Error(`Anthropic API returned ${response.status}: ${errText}`);
  }

  return parseAnthropicFindings(await response.json(), 'watchlist_company_search');
}

function parseAnthropicFindings(
  data: { content?: Array<{ type: string; text?: string }> },
  sourceType: string
): RawFinding[] {
  const textBlock = data.content?.find(
    (block: { type: string; text?: string }) => block.type === 'text'
  );

  if (!textBlock?.text) {
    console.warn(`[0nDefender:mcp-entrant] No text in response for ${sourceType}`);
    return [];
  }

  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.warn(`[0nDefender:mcp-entrant] No JSON array found in response for ${sourceType}`);
    return [];
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      title?: string;
      description?: string;
      source_url?: string;
      company?: string;
    }>;

    return parsed
      .filter((item) => item.title && item.description)
      .map((item) => ({
        title: item.title || 'Untitled MCP Entrant',
        description: item.description || '',
        source_url: item.source_url || 'https://unknown',
        source_type: sourceType,
        category: 'mcp_entrant' as const,
        raw_data: { company: item.company },
      }));
  } catch (err) {
    console.error(`[0nDefender:mcp-entrant] JSON parse error for ${sourceType}:`, err);
    return [];
  }
}
