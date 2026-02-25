// =============================================================================
// QA Distribution Engine — Scheduler
// =============================================================================
// Automated distribution scheduling with rate limiting and Supabase persistence
// =============================================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PlatformId, PLATFORMS, GeneratedContent, DistributionStatus } from './types'

// ---------------------------------------------------------------------------
// Rate Limits per Platform (posts per day)
// ---------------------------------------------------------------------------

const PLATFORM_RATE_LIMITS: Record<PlatformId, number> = {
  quora: 3,
  reddit: 5,
  poe: 10,
  warrior_forum: 2,
  indiehackers: 3,
  growthhackers: 3,
  medium: 2,
  hackernews: 2,
  producthunt: 1,
  dev_to: 3,
  hashnode: 3,
  linkedin: 5,
}

// Optimal posting hours (UTC) per platform
const OPTIMAL_HOURS: Record<PlatformId, number[]> = {
  quora: [14, 15, 16, 17],
  reddit: [13, 14, 15, 16, 17],
  poe: [10, 11, 14, 15],
  warrior_forum: [14, 15, 16],
  indiehackers: [14, 15, 16, 17],
  growthhackers: [14, 15, 16],
  medium: [8, 9, 10, 14, 15],
  hackernews: [14, 15, 16],
  producthunt: [7, 8],
  dev_to: [8, 9, 14, 15],
  hashnode: [8, 9, 14, 15],
  linkedin: [8, 9, 10, 11, 14],
}

// ---------------------------------------------------------------------------
// Scheduler Types
// ---------------------------------------------------------------------------

export interface ScheduleEntry {
  id?: string
  contentId: string
  platform: PlatformId
  scheduledFor: string // ISO datetime
  status: DistributionStatus
  retryCount: number
  maxRetries: number
  createdAt?: string
}

export interface ScheduleResult {
  scheduled: number
  skipped: number
  entries: ScheduleEntry[]
  errors: string[]
}

export interface DailyUsage {
  platform: PlatformId
  date: string
  count: number
  limit: number
}

// ---------------------------------------------------------------------------
// Distribution Scheduler
// ---------------------------------------------------------------------------

export class DistributionScheduler {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }

  private async getSupabase() {
    // Use service role key for server-side operations if available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js')
      return createClient(this.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
    }

    // Fall back to server client with cookies
    const cookieStore = await cookies()
    return createServerClient(this.supabaseUrl, this.supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component context
          }
        },
      },
    })
  }

  // Schedule content for distribution across platforms
  async scheduleContent(
    contentIds: string[],
    platforms: PlatformId[],
    options: {
      spreadOverDays?: number
      respectRateLimits?: boolean
      preferOptimalHours?: boolean
    } = {}
  ): Promise<ScheduleResult> {
    const {
      spreadOverDays = 3,
      respectRateLimits = true,
      preferOptimalHours = true,
    } = options

    const supabase = await this.getSupabase()
    const result: ScheduleResult = {
      scheduled: 0,
      skipped: 0,
      entries: [],
      errors: [],
    }

    // Get current daily usage
    const dailyUsage = respectRateLimits ? await this.getDailyUsage() : new Map()
    const now = new Date()

    for (const contentId of contentIds) {
      for (const platform of platforms) {
        try {
          // Check rate limits
          if (respectRateLimits) {
            const todayKey = `${platform}:${now.toISOString().split('T')[0]}`
            const currentUsage = dailyUsage.get(todayKey) || 0
            const limit = PLATFORM_RATE_LIMITS[platform]

            if (currentUsage >= limit) {
              result.skipped++
              result.errors.push(`Rate limit reached for ${platform} today (${currentUsage}/${limit})`)
              continue
            }
          }

          // Calculate scheduled time
          const scheduledFor = this.calculateScheduleTime(
            platform,
            now,
            spreadOverDays,
            preferOptimalHours,
            result.scheduled
          )

          const entry: ScheduleEntry = {
            contentId,
            platform,
            scheduledFor: scheduledFor.toISOString(),
            status: 'pending',
            retryCount: 0,
            maxRetries: 3,
          }

          // Save to Supabase
          const { data, error } = await supabase
            .from('qa_distributions')
            .insert({
              content_id: contentId,
              platform,
              status: 'pending',
              response: { scheduled_for: scheduledFor.toISOString() },
              created_at: new Date().toISOString(),
            })
            .select('id')
            .single()

          if (error) {
            result.errors.push(`Failed to schedule ${platform}: ${error.message}`)
            result.skipped++
          } else {
            entry.id = data.id
            result.entries.push(entry)
            result.scheduled++
          }
        } catch (err) {
          result.errors.push(`Error scheduling ${contentId} for ${platform}: ${String(err)}`)
          result.skipped++
        }
      }
    }

    return result
  }

  // Get daily usage per platform
  async getDailyUsage(): Promise<Map<string, number>> {
    const supabase = await this.getSupabase()
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('qa_distributions')
      .select('platform, created_at')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)

    const usage = new Map<string, number>()
    if (data) {
      for (const row of data) {
        const key = `${row.platform}:${today}`
        usage.set(key, (usage.get(key) || 0) + 1)
      }
    }

    return usage
  }

  // Get all pending distributions
  async getPendingDistributions(): Promise<ScheduleEntry[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('qa_distributions')
      .select('id, content_id, platform, status, response, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error || !data) return []

    return data.map((row) => ({
      id: row.id,
      contentId: row.content_id,
      platform: row.platform as PlatformId,
      scheduledFor: (row.response as Record<string, string>)?.scheduled_for || row.created_at,
      status: row.status as DistributionStatus,
      retryCount: 0,
      maxRetries: 3,
      createdAt: row.created_at,
    }))
  }

  // Update distribution status
  async updateDistributionStatus(
    distributionId: string,
    status: DistributionStatus,
    response?: Record<string, unknown>
  ): Promise<void> {
    const supabase = await this.getSupabase()

    const updateData: Record<string, unknown> = { status }
    if (status === 'completed') {
      updateData.distributed_at = new Date().toISOString()
    }
    if (response) {
      updateData.response = response
    }

    await supabase.from('qa_distributions').update(updateData).eq('id', distributionId)
  }

  // Get distribution stats
  async getDistributionStats(): Promise<{
    total: number
    pending: number
    completed: number
    failed: number
    byPlatform: Record<string, { total: number; completed: number; failed: number }>
  }> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('qa_distributions')
      .select('platform, status')

    const stats = {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      byPlatform: {} as Record<string, { total: number; completed: number; failed: number }>,
    }

    if (data) {
      stats.total = data.length

      for (const row of data) {
        if (row.status === 'pending' || row.status === 'in_progress') stats.pending++
        if (row.status === 'completed') stats.completed++
        if (row.status === 'failed') stats.failed++

        if (!stats.byPlatform[row.platform]) {
          stats.byPlatform[row.platform] = { total: 0, completed: 0, failed: 0 }
        }
        stats.byPlatform[row.platform].total++
        if (row.status === 'completed') stats.byPlatform[row.platform].completed++
        if (row.status === 'failed') stats.byPlatform[row.platform].failed++
      }
    }

    return stats
  }

  // Check rate limit availability for a platform
  async checkRateLimit(platform: PlatformId): Promise<{
    allowed: boolean
    currentUsage: number
    limit: number
    nextAvailable?: string
  }> {
    const usage = await this.getDailyUsage()
    const today = new Date().toISOString().split('T')[0]
    const key = `${platform}:${today}`
    const currentUsage = usage.get(key) || 0
    const limit = PLATFORM_RATE_LIMITS[platform]

    if (currentUsage < limit) {
      return { allowed: true, currentUsage, limit }
    }

    // Calculate when tomorrow starts
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      allowed: false,
      currentUsage,
      limit,
      nextAvailable: tomorrow.toISOString(),
    }
  }

  // -----------------------------------------------------------------------
  // Private Helpers
  // -----------------------------------------------------------------------

  private calculateScheduleTime(
    platform: PlatformId,
    baseTime: Date,
    spreadDays: number,
    useOptimalHours: boolean,
    index: number
  ): Date {
    const scheduled = new Date(baseTime)

    // Spread across days
    const dayOffset = Math.floor(index / Object.keys(PLATFORMS).length) % spreadDays
    scheduled.setDate(scheduled.getDate() + dayOffset)

    if (useOptimalHours) {
      const optimalHours = OPTIMAL_HOURS[platform]
      const hourIndex = index % optimalHours.length
      scheduled.setUTCHours(optimalHours[hourIndex], Math.floor(Math.random() * 30), 0, 0)
    } else {
      // Add some randomness to avoid posting at exact same times
      const minuteOffset = Math.floor(Math.random() * 60)
      scheduled.setMinutes(scheduled.getMinutes() + minuteOffset + index * 15)
    }

    // Ensure we're not scheduling in the past
    if (scheduled.getTime() < Date.now()) {
      scheduled.setDate(scheduled.getDate() + 1)
    }

    return scheduled
  }
}

export default DistributionScheduler
