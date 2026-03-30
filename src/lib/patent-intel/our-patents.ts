/**
 * 0nDefender Patent Intelligence — Our Patent Reference Data
 * Server-side only. NEVER import from client components.
 */

export interface PatentClaim {
  id: string;
  summary: string;
  keywords: string[];
}

export interface PatentApplication {
  appNumber: string;
  filingDate: string;
  title: string;
  shortName: string;
  claims: PatentClaim[];
  status: string;
  statusDetail: string;
  inventor: string;
  assignee: string;
}

export const OUR_PATENTS: PatentApplication[] = [
  {
    appNumber: '63/968,814',
    filingDate: '2026-01-27',
    title:
      'System and Method for Federated MCP Server Orchestration with Multi-Layer Workflow Execution',
    shortName: 'MCP Federation / Workflow Execution',
    claims: [
      {
        id: '814-1',
        summary: 'Pipeline execution — sequential step chaining with context propagation',
        keywords: ['pipeline', 'sequential', 'workflow', 'step chaining', 'context propagation'],
      },
      {
        id: '814-2',
        summary: 'Assembly Line execution — parallel batch processing with dependency resolution',
        keywords: ['assembly line', 'parallel', 'batch', 'dependency resolution'],
      },
      {
        id: '814-3',
        summary: 'Radial Burst execution — fan-out concurrent invocation with aggregation',
        keywords: ['radial burst', 'fan-out', 'concurrent', 'aggregation'],
      },
      {
        id: '814-4',
        summary: 'Federation hub — cross-server capability discovery and routing',
        keywords: ['federation', 'hub', 'capability discovery', 'routing', 'cross-server'],
      },
      {
        id: '814-5',
        summary: 'JSON Smart Deploy — declarative deployment from structured config',
        keywords: ['json', 'smart deploy', 'declarative', 'deployment', 'config'],
      },
      {
        id: '814-6',
        summary: '.FED container format — portable federated server bundles',
        keywords: ['.fed', 'container', 'portable', 'federated', 'bundle'],
      },
    ],
    status: 'pending',
    statusDetail: 'Missing Parts response filed',
    inventor: 'Michael A Mento Jr.',
    assignee: 'RocketOpp LLC',
  },
  {
    appNumber: '63/990,046',
    filingDate: '2026-02-24',
    title:
      'System and Method for Semantically-Layered Encrypted Digital Business Asset Transfer with Multi-Party Escrow Key Distribution',
    shortName: '0nVault / Encrypted Transfer',
    claims: [
      {
        id: '046-1',
        summary: '7 semantic layers (K1-K7) with independent encryption keys per layer',
        keywords: ['semantic layers', 'K1-K7', 'independent encryption', 'per-layer keys'],
      },
      {
        id: '046-2',
        summary: 'AES-256-GCM per-layer encryption with unique IVs',
        keywords: ['AES-256-GCM', 'per-layer encryption', 'unique IV'],
      },
      {
        id: '046-3',
        summary: 'Argon2id vault — memory-hard credential double-encryption',
        keywords: ['Argon2id', 'vault', 'memory-hard', 'double-encryption', 'credential'],
      },
      {
        id: '046-4',
        summary: 'X25519 ECDH multi-party escrow key distribution',
        keywords: ['X25519', 'ECDH', 'multi-party', 'escrow', 'key distribution'],
      },
      {
        id: '046-5',
        summary: 'SHA3-256 Seal of Truth — content-addressed integrity verification',
        keywords: ['SHA3-256', 'seal of truth', 'content-addressed', 'integrity'],
      },
      {
        id: '046-6',
        summary: 'Ed25519 digital signatures for transfer authentication',
        keywords: ['Ed25519', 'digital signatures', 'transfer', 'authentication'],
      },
    ],
    status: 'active',
    statusDetail: 'Active',
    inventor: 'Michael A Mento Jr.',
    assignee: 'RocketOpp LLC',
  },
  {
    appNumber: '64/006,268',
    filingDate: '2026-03-15',
    title:
      'System and Method for Multi-Persona Heterogeneous AI Model Orchestration with Dual-Track Competitive Scoring',
    shortName: 'Multi-Persona AI / ACKO',
    claims: [
      {
        id: '268-1',
        summary: 'Multi-persona AI orchestration across heterogeneous models',
        keywords: ['multi-persona', 'heterogeneous', 'AI models', 'orchestration'],
      },
      {
        id: '268-2',
        summary: 'Dual-track competitive scoring — parallel evaluation with winner selection',
        keywords: ['dual-track', 'competitive scoring', 'parallel evaluation', 'winner selection'],
      },
      {
        id: '268-3',
        summary: 'ACKO knowledge accumulation with 0.82 confidence threshold',
        keywords: ['ACKO', 'knowledge accumulation', '0.82 threshold', 'confidence'],
      },
      {
        id: '268-4',
        summary: 'Brain Training Factory — structured knowledge extraction and storage',
        keywords: ['brain training factory', 'knowledge extraction', 'storage', 'structured'],
      },
      {
        id: '268-5',
        summary: 'Rate-limited cross-user training — privacy-preserving knowledge sharing',
        keywords: ['rate-limited', 'cross-user', 'training', 'privacy-preserving', 'knowledge sharing'],
      },
    ],
    status: 'active',
    statusDetail: 'Active — micro entity certified',
    inventor: 'Michael A Mento Jr.',
    assignee: 'RocketOpp LLC',
  },
  {
    appNumber: '64/006,282',
    filingDate: '2026-03-15',
    title:
      'System and Method for Profile-Adaptive Content Generation via OAuth Callback, Language Variation Optimization with Thompson Sampling, and Cross-User Behavioral Conversion Intelligence Aggregation',
    shortName: 'PACG / LVOS / CUCIA',
    claims: [
      {
        id: '282-1',
        summary: 'PACG — profile-adaptive content generation via OAuth callback data',
        keywords: ['PACG', 'profile-adaptive', 'content generation', 'OAuth callback'],
      },
      {
        id: '282-2',
        summary: 'LinkedIn archetype classification from profile signals',
        keywords: ['LinkedIn', 'archetype', 'classification', 'profile signals'],
      },
      {
        id: '282-3',
        summary: 'Authenticity validation — scoring content against user voice patterns',
        keywords: ['authenticity', 'validation', 'scoring', 'voice patterns'],
      },
      {
        id: '282-4',
        summary: 'LVOS — language variation optimization with Thompson Sampling exploration',
        keywords: ['LVOS', 'language variation', 'Thompson Sampling', 'optimization', 'exploration'],
      },
      {
        id: '282-5',
        summary: 'CUCIA — cross-user behavioral conversion intelligence with dampened prior transfer',
        keywords: ['CUCIA', 'cross-user', 'behavioral', 'conversion intelligence', 'dampened prior'],
      },
    ],
    status: 'active',
    statusDetail: 'Active — micro entity certified. TAICD excluded.',
    inventor: 'Michael A Mento Jr.',
    assignee: 'RocketOpp LLC',
  },
];

/**
 * All unique keywords across all patents, for quick matching.
 */
export const ALL_PATENT_KEYWORDS: string[] = Array.from(
  new Set(OUR_PATENTS.flatMap((p) => p.claims.flatMap((c) => c.keywords)))
);

/**
 * Build a formatted summary of all patents for use in AI prompts.
 */
export function buildPatentContext(): string {
  return OUR_PATENTS.map((p) => {
    const claimText = p.claims.map((c) => `  - [${c.id}] ${c.summary}`).join('\n');
    return [
      `Patent: ${p.appNumber} (filed ${p.filingDate})`,
      `Title: ${p.title}`,
      `Status: ${p.status} — ${p.statusDetail}`,
      `Claims:\n${claimText}`,
    ].join('\n');
  }).join('\n\n');
}

/**
 * Get patent by app number.
 */
export function getPatentByNumber(appNumber: string): PatentApplication | undefined {
  return OUR_PATENTS.find((p) => p.appNumber === appNumber);
}

/**
 * Get all claim IDs as a flat array.
 */
export function getAllClaimIds(): string[] {
  return OUR_PATENTS.flatMap((p) => p.claims.map((c) => c.id));
}
