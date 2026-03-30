/**
 * 0nDefender Patent Intelligence — Finding Classifier
 * Calls Anthropic API to classify findings, with rule-based fallback.
 */

import { OUR_PATENTS, buildPatentContext, ALL_PATENT_KEYWORDS } from './our-patents';

export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingCategory =
  | 'patent_conflict'
  | 'mcp_entrant'
  | 'acquisition_signal'
  | 'brand_violation'
  | 'opportunity';

export interface ClassificationResult {
  threat_level: ThreatLevel;
  category: FindingCategory;
  overlapping_patents: string[];
  overlap_summary: string;
  recommended_action: string;
}

export interface RawFinding {
  title: string;
  description: string;
  source_url: string;
  source_type: string;
  category?: FindingCategory;
  raw_data?: Record<string, unknown>;
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Classify a finding using Anthropic API, falling back to rules if the API call fails.
 */
export async function classifyFinding(finding: RawFinding): Promise<ClassificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      return await classifyWithAI(finding, apiKey);
    } catch (err) {
      console.error('[0nDefender] AI classification failed, using rule-based fallback:', err);
    }
  }

  return classifyWithRules(finding);
}

async function classifyWithAI(
  finding: RawFinding,
  apiKey: string
): Promise<ClassificationResult> {
  const patentContext = buildPatentContext();

  const systemPrompt = `You are a patent intelligence analyst for RocketOpp LLC. Your job is to classify findings that may relate to our patent portfolio.

OUR PATENT PORTFOLIO:
${patentContext}

Given a finding (title, description, source), classify it with:
1. threat_level: "critical" | "high" | "medium" | "low" | "info"
2. category: "patent_conflict" | "mcp_entrant" | "acquisition_signal" | "brand_violation" | "opportunity"
3. overlapping_patents: array of our patent app numbers that overlap (e.g. ["63/968,814"])
4. overlap_summary: 1-2 sentence explanation of how this finding relates to our patents
5. recommended_action: specific next step (e.g. "File opposition", "Monitor quarterly", "Send C&D")

Classification guidelines:
- critical: Direct patent infringement or identical claims being filed
- high: Strong overlap with our claims, active competitor product
- medium: Partial overlap, emerging competitor, or indirect threat
- low: Tangential relation, worth monitoring
- info: General industry news, no direct threat

Respond ONLY with valid JSON matching this exact structure:
{"threat_level":"...","category":"...","overlapping_patents":[...],"overlap_summary":"...","recommended_action":"..."}`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Classify this finding:\n\nTitle: ${finding.title}\nDescription: ${finding.description}\nSource: ${finding.source_url}\nSource Type: ${finding.source_type}`,
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
    throw new Error('No text block in Anthropic response');
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Anthropic response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as ClassificationResult;

  // Validate required fields
  if (!parsed.threat_level || !parsed.category || !parsed.overlap_summary || !parsed.recommended_action) {
    throw new Error('Incomplete classification result');
  }

  if (!Array.isArray(parsed.overlapping_patents)) {
    parsed.overlapping_patents = [];
  }

  return parsed;
}

/**
 * Rule-based fallback classifier when AI is unavailable.
 */
function classifyWithRules(finding: RawFinding): ClassificationResult {
  const text = `${finding.title} ${finding.description}`.toLowerCase();
  const overlapping: string[] = [];
  let maxScore = 0;

  for (const patent of OUR_PATENTS) {
    let score = 0;
    for (const claim of patent.claims) {
      for (const keyword of claim.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
    }
    if (score > 0) {
      overlapping.push(patent.appNumber);
    }
    maxScore = Math.max(maxScore, score);
  }

  // Brand-specific checks
  const brandTerms = ['0nmcp', 'mcpfed', '0ncore', '0nplex', '0nork', '0nvault'];
  const hasBrandViolation = brandTerms.some((term) => text.includes(term));

  // Category determination
  let category: FindingCategory = finding.category || 'mcp_entrant';
  if (hasBrandViolation) {
    category = 'brand_violation';
  } else if (text.includes('patent') || text.includes('filing') || text.includes('claims')) {
    category = 'patent_conflict';
  } else if (text.includes('acqui') || text.includes('funding') || text.includes('series')) {
    category = 'acquisition_signal';
  }

  // Threat level based on keyword overlap score
  let threat_level: ThreatLevel;
  if (hasBrandViolation || maxScore >= 5) {
    threat_level = 'critical';
  } else if (maxScore >= 3) {
    threat_level = 'high';
  } else if (maxScore >= 2) {
    threat_level = 'medium';
  } else if (maxScore >= 1) {
    threat_level = 'low';
  } else {
    threat_level = 'info';
  }

  // Generate overlap summary
  let overlap_summary: string;
  if (overlapping.length === 0) {
    overlap_summary = 'No direct overlap with our patent claims detected via keyword analysis.';
  } else {
    const patentNames = overlapping
      .map((num) => OUR_PATENTS.find((p) => p.appNumber === num)?.shortName || num)
      .join(', ');
    overlap_summary = `Keyword overlap detected with ${overlapping.length} patent(s): ${patentNames}. ${maxScore} matching keyword(s) found.`;
  }

  // Recommended action based on threat level
  const actionMap: Record<ThreatLevel, string> = {
    critical: 'Immediate review required. Consult patent counsel within 48 hours.',
    high: 'Priority review. Schedule patent counsel review within 1 week.',
    medium: 'Add to watch list. Review in next monthly patent review.',
    low: 'Monitor quarterly. No immediate action required.',
    info: 'Archive for reference. No action needed.',
  };

  return {
    threat_level,
    category,
    overlapping_patents: overlapping,
    overlap_summary,
    recommended_action: actionMap[threat_level],
  };
}
