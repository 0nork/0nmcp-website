/**
 * CRM Community Sync — Bridges community activity ↔ CRM sub-location
 * Sub-location: nphConTwfHcVE1oA0uep
 *
 * All operations target the 'community' CRM location.
 * Syncs: member registration, thread/reply activity, votes, karma, badges, engagement level
 */

import {
  upsertContact,
  findContactByEmail,
  addContactTags,
  removeContactTags,
  addContactNote,
  createOpportunity,
  updateOpportunity,
  findOpportunityByContact,
} from './crm'
import type { CrmContact } from './crm'

// ==================== CONFIG ====================

const COMMUNITY_PIPELINE_ID = process.env.CRM_COMMUNITY_PIPELINE_ID || ''
const COMMUNITY_STAGES: Record<string, string> = {
  newcomer: process.env.CRM_COMMUNITY_STAGE_NEWCOMER || '',
  member: process.env.CRM_COMMUNITY_STAGE_MEMBER || '',
  contributor: process.env.CRM_COMMUNITY_STAGE_CONTRIBUTOR || '',
  power_user: process.env.CRM_COMMUNITY_STAGE_POWER_USER || '',
  expert: process.env.CRM_COMMUNITY_STAGE_EXPERT || '',
  legend: process.env.CRM_COMMUNITY_STAGE_LEGEND || '',
}

const ENGAGEMENT_TAGS = {
  member: '0n-community-member',
  active: 'community-active',
  threadCreator: 'thread-creator',
  replier: 'community-replier',
  voter: 'community-voter',
  helper: 'community-helper',
  solutionProvider: 'solution-provider',
  newcomer: 'reputation-newcomer',
  contributor: 'reputation-contributor',
  powerUser: 'reputation-power-user',
  expert: 'reputation-expert',
  legend: 'reputation-legend',
  certified: 'certified-expert',
} as const

// ==================== MEMBER SYNC ====================

/**
 * Sync a new community member to CRM sub-location
 * Called when a user first interacts with the community
 */
export async function syncCommunityMember(data: {
  email: string
  fullName?: string
  company?: string
  userId?: string
}): Promise<string | null> {
  try {
    const [firstName, ...lastParts] = (data.fullName || '').split(' ')

    const contact = await upsertContact({
      email: data.email,
      firstName: firstName || data.email.split('@')[0],
      lastName: lastParts.join(' ') || undefined,
      source: '0nmcp.com/community',
      tags: ['0nmcp', ENGAGEMENT_TAGS.member, ENGAGEMENT_TAGS.newcomer],
      companyName: data.company || undefined,
    }, 'community')

    // Create engagement pipeline opportunity
    if (COMMUNITY_PIPELINE_ID && COMMUNITY_STAGES.newcomer) {
      await createOpportunity({
        name: `${data.email} — Community Member`,
        pipelineId: COMMUNITY_PIPELINE_ID,
        pipelineStageId: COMMUNITY_STAGES.newcomer,
        contactId: contact.id,
        monetaryValue: 0,
      }, 'community')
    }

    console.log(`[community-sync] Member synced: ${data.email} → ${contact.id}`)
    return contact.id
  } catch (err) {
    console.error('[community-sync] syncCommunityMember error:', err)
    return null
  }
}

/**
 * Ensure a user exists as a community contact, return their CRM contact ID
 */
export async function ensureCommunityContact(email: string, fullName?: string): Promise<CrmContact | null> {
  try {
    let contact = await findContactByEmail(email, 'community')
    if (!contact) {
      contact = await upsertContact({
        email,
        firstName: fullName?.split(' ')[0] || email.split('@')[0],
        lastName: fullName?.split(' ').slice(1).join(' ') || undefined,
        source: '0nmcp.com/community',
        tags: ['0nmcp', ENGAGEMENT_TAGS.member],
      }, 'community')
    }
    return contact
  } catch (err) {
    console.error('[community-sync] ensureCommunityContact error:', err)
    return null
  }
}

// ==================== ACTIVITY SYNC ====================

/**
 * Sync a new thread creation to CRM
 */
export async function syncThreadCreated(data: {
  email: string
  fullName?: string
  threadTitle: string
  threadSlug: string
  group: string
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.email, data.fullName)
    if (!contact) return

    await addContactTags(contact.id, [
      ENGAGEMENT_TAGS.active,
      ENGAGEMENT_TAGS.threadCreator,
      `group-${data.group}`,
    ])

    await addContactNote(
      contact.id,
      `Created thread: "${data.threadTitle}" in ${data.group}\nhttps://0nmcp.com/forum/${data.threadSlug}`
    )

    console.log(`[community-sync] Thread synced: "${data.threadTitle}" by ${data.email}`)
  } catch (err) {
    console.error('[community-sync] syncThreadCreated error:', err)
  }
}

/**
 * Sync a reply to CRM
 */
export async function syncReplyCreated(data: {
  email: string
  fullName?: string
  threadTitle: string
  threadSlug: string
  replyPreview: string
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.email, data.fullName)
    if (!contact) return

    await addContactTags(contact.id, [
      ENGAGEMENT_TAGS.active,
      ENGAGEMENT_TAGS.replier,
    ])

    await addContactNote(
      contact.id,
      `Replied to: "${data.threadTitle}"\n${data.replyPreview.slice(0, 200)}...\nhttps://0nmcp.com/forum/${data.threadSlug}`
    )

    console.log(`[community-sync] Reply synced in "${data.threadTitle}" by ${data.email}`)
  } catch (err) {
    console.error('[community-sync] syncReplyCreated error:', err)
  }
}

/**
 * Sync a solution mark to CRM (reply marked as answer)
 */
export async function syncSolutionMarked(data: {
  solverEmail: string
  solverName?: string
  threadTitle: string
  threadSlug: string
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.solverEmail, data.solverName)
    if (!contact) return

    await addContactTags(contact.id, [
      ENGAGEMENT_TAGS.solutionProvider,
      ENGAGEMENT_TAGS.helper,
    ])

    await addContactNote(
      contact.id,
      `Solution accepted for: "${data.threadTitle}"\nhttps://0nmcp.com/forum/${data.threadSlug}`
    )

    console.log(`[community-sync] Solution synced: ${data.solverEmail} solved "${data.threadTitle}"`)
  } catch (err) {
    console.error('[community-sync] syncSolutionMarked error:', err)
  }
}

/**
 * Sync a vote event to CRM
 */
export async function syncVoteActivity(data: {
  voterEmail: string
  voterName?: string
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.voterEmail, data.voterName)
    if (!contact) return

    await addContactTags(contact.id, [
      ENGAGEMENT_TAGS.active,
      ENGAGEMENT_TAGS.voter,
    ])
  } catch (err) {
    console.error('[community-sync] syncVoteActivity error:', err)
  }
}

// ==================== ENGAGEMENT LEVEL SYNC ====================

/**
 * Sync reputation/engagement level change to CRM pipeline + tags
 * Called when karma thresholds are crossed
 */
export async function syncEngagementLevel(data: {
  email: string
  fullName?: string
  newLevel: string
  oldLevel: string
  karma: number
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.email, data.fullName)
    if (!contact) return

    // Remove old level tag, add new one
    const levelTagMap: Record<string, string> = {
      newcomer: ENGAGEMENT_TAGS.newcomer,
      member: ENGAGEMENT_TAGS.member,
      contributor: ENGAGEMENT_TAGS.contributor,
      power_user: ENGAGEMENT_TAGS.powerUser,
      expert: ENGAGEMENT_TAGS.expert,
      legend: ENGAGEMENT_TAGS.legend,
    }

    const oldTag = levelTagMap[data.oldLevel]
    const newTag = levelTagMap[data.newLevel]

    if (oldTag) await removeContactTags(contact.id, [oldTag])
    if (newTag) await addContactTags(contact.id, [newTag])

    // Move pipeline stage
    if (COMMUNITY_PIPELINE_ID && COMMUNITY_STAGES[data.newLevel]) {
      const opp = await findOpportunityByContact(contact.id, COMMUNITY_PIPELINE_ID, 'community')
      if (opp) {
        await updateOpportunity(opp.id, {
          pipelineStageId: COMMUNITY_STAGES[data.newLevel],
        })
      }
    }

    await addContactNote(
      contact.id,
      `Reputation leveled up: ${data.oldLevel} → ${data.newLevel} (karma: ${data.karma})`
    )

    console.log(`[community-sync] Level up: ${data.email} → ${data.newLevel} (karma: ${data.karma})`)
  } catch (err) {
    console.error('[community-sync] syncEngagementLevel error:', err)
  }
}

// ==================== BADGE SYNC ====================

/**
 * Sync a badge award to CRM
 */
export async function syncBadgeAwarded(data: {
  email: string
  fullName?: string
  badgeName: string
  badgeSlug: string
  badgeTier: string
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.email, data.fullName)
    if (!contact) return

    await addContactTags(contact.id, [
      `badge-${data.badgeSlug}`,
      `badge-tier-${data.badgeTier}`,
    ])

    await addContactNote(
      contact.id,
      `Badge earned: ${data.badgeName} (${data.badgeTier} tier)`
    )

    console.log(`[community-sync] Badge: ${data.email} earned "${data.badgeName}"`)
  } catch (err) {
    console.error('[community-sync] syncBadgeAwarded error:', err)
  }
}

// ==================== CERTIFICATION SYNC ====================

/**
 * Sync a course certification to CRM
 */
export async function syncCertification(data: {
  email: string
  fullName?: string
  courseName: string
  courseId: string
  completedAt: string
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.email, data.fullName)
    if (!contact) return

    await addContactTags(contact.id, [
      ENGAGEMENT_TAGS.certified,
      `certified-${data.courseId}`,
      'course-completed',
    ])

    await addContactNote(
      contact.id,
      `Certification completed: ${data.courseName}\nCompleted: ${data.completedAt}`
    )

    console.log(`[community-sync] Certification: ${data.email} completed "${data.courseName}"`)
  } catch (err) {
    console.error('[community-sync] syncCertification error:', err)
  }
}

// ==================== GROUP SYNC ====================

/**
 * Sync group membership to CRM tags
 */
export async function syncGroupJoined(data: {
  email: string
  fullName?: string
  groupSlug: string
  groupName: string
}): Promise<void> {
  try {
    const contact = await ensureCommunityContact(data.email, data.fullName)
    if (!contact) return

    await addContactTags(contact.id, [
      `group-${data.groupSlug}`,
    ])

    console.log(`[community-sync] Group join: ${data.email} → ${data.groupName}`)
  } catch (err) {
    console.error('[community-sync] syncGroupJoined error:', err)
  }
}

export async function syncGroupLeft(data: {
  email: string
  groupSlug: string
}): Promise<void> {
  try {
    const contact = await findContactByEmail(data.email, 'community')
    if (!contact) return

    await removeContactTags(contact.id, [`group-${data.groupSlug}`])
  } catch (err) {
    console.error('[community-sync] syncGroupLeft error:', err)
  }
}
