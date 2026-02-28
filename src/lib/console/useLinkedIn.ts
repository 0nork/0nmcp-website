'use client'

import { useState, useCallback } from 'react'
import type { Archetype } from '@/lib/linkedin/types'

export interface LinkedInMember {
  id: string
  linkedin_name: string
  linkedin_headline: string | null
  linkedin_avatar_url: string | null
  linkedin_profile_url: string | null
  archetype: Archetype | null
  onboarding_completed: boolean
  automated_posting_enabled: boolean
  posting_frequency: string
  total_posts: number
  total_engagements: number
}

export interface GeneratedPost {
  content: string
  valid: boolean
  tone_match_score: number
  banned_phrases_found: string[]
}

export function useLinkedIn() {
  const [member, setMember] = useState<LinkedInMember | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null)
  const [error, setError] = useState<string | null>(null)

  /** Fetch member profile from API */
  const fetchMember = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/linkedin/member')
      if (res.status === 404) {
        setMember(null)
        return
      }
      if (!res.ok) throw new Error('Failed to fetch member')
      const data = await res.json()
      setMember(data.member)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  /** Generate a post preview */
  const generatePost = useCallback(async (topic?: string, context?: string) => {
    if (!member) return null
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/linkedin/post/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: member.id, topic, context }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }
      const data = await res.json()
      const post: GeneratedPost = {
        content: data.content,
        valid: data.valid,
        tone_match_score: data.tone_match_score,
        banned_phrases_found: data.banned_phrases_found || [],
      }
      setGeneratedPost(post)
      return post
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setGenerating(false)
    }
  }, [member])

  /** Publish a post to LinkedIn */
  const publishPost = useCallback(async (content: string) => {
    if (!member) return null
    setPublishing(true)
    setError(null)
    try {
      const res = await fetch('/api/linkedin/post/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: member.id, content }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Publish failed')
      }
      const data = await res.json()
      // Refresh member to update post count
      await fetchMember()
      return { postUrl: data.post_url, postId: data.post_id }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setPublishing(false)
    }
  }, [member, fetchMember])

  /** Toggle automated posting */
  const toggleAutomation = useCallback(async (enabled: boolean, frequency?: string) => {
    if (!member) return false
    setError(null)
    try {
      const res = await fetch('/api/linkedin/post/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: member.id, enabled, frequency }),
      })
      if (!res.ok) throw new Error('Failed to update automation')
      await fetchMember()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [member, fetchMember])

  /** Start LinkedIn OAuth flow */
  const connect = useCallback(() => {
    window.location.href = '/api/linkedin/auth'
  }, [])

  return {
    member,
    loading,
    generating,
    publishing,
    generatedPost,
    error,
    fetchMember,
    generatePost,
    publishPost,
    toggleAutomation,
    connect,
    setGeneratedPost,
    setError,
  }
}
