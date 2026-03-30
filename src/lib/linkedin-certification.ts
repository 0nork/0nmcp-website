/**
 * LinkedIn "Add to Profile" Certification System
 *
 * Generates LinkedIn certification URLs and manages cert templates
 * for 0nMCP courses. Uses the official LinkedIn Add to Profile API:
 * https://addtoprofile.linkedin.com/
 */

import { createHash } from 'crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CertTemplate {
  slug: string
  certName: string
  courseTitle: string
  courseSlug: string
  description: string
}

export interface GenerateCertUrlParams {
  certName: string
  certId: string
  issueYear: number
  issueMonth: number
  certUrl: string
}

export interface IssueCertParams {
  userEmail: string
  userName?: string
  courseSlug: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ORG_NAME = '0nMCP by RocketOpp'
const BASE_VERIFY_URL = 'https://0nmcp.com/verify'

export const CERT_TEMPLATES: Record<string, CertTemplate> = {
  'onmcp-mastery': {
    slug: 'onmcp-mastery',
    certName: '0nMCP Certified Orchestrator',
    courseTitle: '0nMCP Mastery',
    courseSlug: 'onmcp-mastery',
    description:
      'Demonstrates mastery of the 0nMCP Universal AI API Orchestrator, including tool registration, service catalog management, workflow execution, and multi-service orchestration.',
  },
  'crm-automation': {
    slug: 'crm-automation',
    certName: '0nMCP CRM Automation Specialist',
    courseTitle: 'CRM Automation Blueprint',
    courseSlug: 'crm-automation',
    description:
      'Certified specialist in CRM automation using the 0nMCP CRM module — 245 tools across contacts, calendars, conversations, payments, and more.',
  },
  'vault-security': {
    slug: 'vault-security',
    certName: '0nMCP Security Engineer',
    courseTitle: 'Vault Security',
    courseSlug: 'vault-security',
    description:
      'Expert in 0nVault encryption, AES-256-GCM credential storage, multi-party escrow, Seal of Truth verification, and container transfer systems.',
  },
  'onplex-council': {
    slug: 'onplex-council',
    certName: '0nMCP AI Council Architect',
    courseTitle: '0nPlex Council',
    courseSlug: 'onplex-council',
    description:
      'Architect of multi-AI council systems using 0nPlex — coordinating Claude, GPT, Gemini, and other models in consensus-driven decision pipelines.',
  },
  'enterprise-deployment': {
    slug: 'enterprise-deployment',
    certName: '0nMCP Enterprise Deployer',
    courseTitle: 'Enterprise Deployment',
    courseSlug: 'enterprise-deployment',
    description:
      'Certified in deploying 0nMCP at enterprise scale — HTTP server mode, webhook verification, rate limiting, credential vaults, and multi-tenant provisioning.',
  },
  'switch-files': {
    slug: 'switch-files',
    certName: '0nMCP Certified Developer',
    courseTitle: '.0n SWITCH Files',
    courseSlug: 'switch-files',
    description:
      'Developer certification for the .0n Standard — writing SWITCH files, template resolution, variable scoping, workflow runtime, and the 0n-spec ecosystem.',
  },
}

// ---------------------------------------------------------------------------
// Cert ID Generation
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic, unique certification ID from user email + course slug + date.
 * Format: 0NMCP-{8-char hash}-{YYYYMMDD}
 */
export function generateCertId(
  userEmail: string,
  courseSlug: string,
  issuedAt: Date = new Date()
): string {
  const dateStr = [
    issuedAt.getFullYear(),
    String(issuedAt.getMonth() + 1).padStart(2, '0'),
    String(issuedAt.getDate()).padStart(2, '0'),
  ].join('')

  const hash = createHash('sha256')
    .update(`${userEmail}:${courseSlug}:${dateStr}`)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase()

  return `0NMCP-${hash}-${dateStr}`
}

// ---------------------------------------------------------------------------
// LinkedIn URL Builder
// ---------------------------------------------------------------------------

/**
 * Build the official LinkedIn "Add to Profile" certification URL.
 *
 * URL format (from https://addtoprofile.linkedin.com/):
 * https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
 *   &name={certName}
 *   &organizationName={orgName}
 *   &issueYear={year}
 *   &issueMonth={month}
 *   &certUrl={verificationUrl}
 *   &certId={uniqueId}
 */
export function generateLinkedInCertUrl(params: GenerateCertUrlParams): string {
  const url = new URL('https://www.linkedin.com/profile/add')

  url.searchParams.set('startTask', 'CERTIFICATION_NAME')
  url.searchParams.set('name', params.certName)
  url.searchParams.set('organizationName', ORG_NAME)
  url.searchParams.set('issueYear', String(params.issueYear))
  url.searchParams.set('issueMonth', String(params.issueMonth))
  url.searchParams.set('certUrl', params.certUrl)
  url.searchParams.set('certId', params.certId)

  return url.toString()
}

// ---------------------------------------------------------------------------
// High-Level Issuance Helper
// ---------------------------------------------------------------------------

/**
 * Build all certification data for a given user + course, ready for DB insert.
 */
export function buildCertification(params: IssueCertParams) {
  const template = CERT_TEMPLATES[params.courseSlug]
  if (!template) {
    throw new Error(`Unknown course slug: ${params.courseSlug}`)
  }

  const now = new Date()
  const certId = generateCertId(params.userEmail, params.courseSlug, now)
  const certUrl = `${BASE_VERIFY_URL}/${certId}`

  const linkedinUrl = generateLinkedInCertUrl({
    certName: template.certName,
    certId,
    issueYear: now.getFullYear(),
    issueMonth: now.getMonth() + 1,
    certUrl,
  })

  return {
    cert_id: certId,
    user_email: params.userEmail,
    user_name: params.userName ?? null,
    course_slug: params.courseSlug,
    cert_name: template.certName,
    issued_at: now.toISOString(),
    linkedin_url: linkedinUrl,
    verified: true,
  }
}

/**
 * List all available certification templates.
 */
export function listCertTemplates(): CertTemplate[] {
  return Object.values(CERT_TEMPLATES)
}

/**
 * Look up a cert template by course slug.
 */
export function getCertTemplate(courseSlug: string): CertTemplate | null {
  return CERT_TEMPLATES[courseSlug] ?? null
}
