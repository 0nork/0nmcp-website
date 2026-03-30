/**
 * 0nDefender Patent Intelligence — Acquisition Signal Analyzer
 * Monitors for companies that might acquire, license, or compete with our IP.
 */

import type { RawFinding } from '../classifier';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SIGNAL_SEARCHES = [
  {
    query: 'MCP model context protocol enterprise strategy announcement 2026',
    context: 'Enterprise MCP adoption and strategy',
  },
  {
    query: 'AI orchestration platform funding round series 2025 2026',
    context: 'Funding rounds in AI orchestration space',
  },
  {
    query: 'AI workflow automation company acquisition 2025 2026',
    context: 'M&A activity in AI workflow automation',
  },
  {
    query: 'MCP marketplace platform launch enterprise',
    context: 'MCP marketplace and platform launches',
  },
  {
    query: 'AI agent orchestration patent licensing deal',
    context: 'Patent licensing deals in AI agent space',
  },
];

/**
 * Run the acquisition signal analysis scan.
 * Searches for companies and events that signal IP acquisition or licensing opportunities.
 */
export async function analyzeAcquisitionSignals(): Promise<RawFinding[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[0nDefender:acquisition-signal] No ANTHROPIC_API_KEY set');
    return [];
  }

  const findings: RawFinding[] = [];

  try {
    const results = await searchAcquisitionSignals(apiKey);
    findings.push(...results);
  } catch (err) {
    console.error('[0nDefender:acquisition-signal] Search failed:', err);
  }

  return findings;
}

async function searchAcquisitionSignals(apiKey: string): Promise<RawFinding[]> {
  const searchList = SIGNAL_SEARCHES.map((s, i) => `${i + 1}. "${s.query}" — ${s.context}`).join('\n');

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
          content: `You are a business intelligence analyst monitoring the AI orchestration and MCP ecosystem for acquisition, licensing, and partnership opportunities.

RocketOpp LLC holds 4 patent applications covering:
1. Federated MCP Server Orchestration with Multi-Layer Workflow Execution
2. Semantically-Layered Encrypted Digital Business Asset Transfer
3. Multi-Persona Heterogeneous AI Model Orchestration with Dual-Track Scoring
4. Profile-Adaptive Content Generation with Thompson Sampling

Search the web for these types of signals:
${searchList}

For each finding, classify the signal type:
- "opportunity": Company that might want to license our patents or partner
- "acquisition_risk": Company acquiring competitors or building similar tech
- "funding": Funding round that could lead to competitive product development
- "enterprise_adoption": Large enterprise adopting MCP, potential customer

For each finding, extract:
{"title": "...", "description": "...", "source_url": "...", "company": "...", "signal_type": "opportunity|acquisition_risk|funding|enterprise_adoption", "relevance": "..."}

Focus on actionable intelligence. Return a JSON array. Return [] if nothing notable.
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
      company?: string;
      signal_type?: string;
      relevance?: string;
    }>;

    return parsed
      .filter((item) => item.title && item.description)
      .map((item) => {
        const signalType = item.signal_type || 'opportunity';
        const isOpportunity = signalType === 'opportunity' || signalType === 'enterprise_adoption';

        return {
          title: item.title || 'Untitled Signal',
          description: `${item.description || ''} ${item.relevance ? `Relevance: ${item.relevance}` : ''}`.trim(),
          source_url: item.source_url || 'https://unknown',
          source_type: 'acquisition_signal_search',
          category: (isOpportunity ? 'opportunity' : 'acquisition_signal') as 'opportunity' | 'acquisition_signal',
          raw_data: {
            company: item.company,
            signal_type: signalType,
            relevance: item.relevance,
          },
        };
      });
  } catch (err) {
    console.error('[0nDefender:acquisition-signal] JSON parse error:', err);
    return [];
  }
}
