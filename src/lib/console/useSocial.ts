'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────

export interface SocialPlatform {
  id: string
  name: string
  icon: string
  connected: boolean
  postCount: number
  lastPosted: string | null
  color: string
}

export interface SocialPost {
  id: string
  content: string
  platforms: string[]
  hashtags: string[]
  status: 'posted' | 'failed' | 'scheduled' | 'pending'
  createdAt: string
  results?: { platform: string; success: boolean; url?: string }[]
}

interface CreatePostResult {
  success: boolean
  results: { platform: string; success: boolean; url?: string }[]
}

// ─── Constants ───────────────────────────────────────────────────

const POSTS_KEY = '0n_social_posts'
const AUTOPOST_KEY = '0n_social_autopost'

const DEFAULT_PLATFORMS: SocialPlatform[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'Li', connected: true, postCount: 0, lastPosted: null, color: '#0077b5' },
  { id: 'reddit', name: 'Reddit', icon: 'Rd', connected: true, postCount: 0, lastPosted: null, color: '#ff4500' },
  { id: 'dev_to', name: 'Dev.to', icon: 'Dv', connected: false, postCount: 0, lastPosted: null, color: '#0a0a0a' },
  { id: 'x_twitter', name: 'X / Twitter', icon: 'X', connected: false, postCount: 0, lastPosted: null, color: '#000000' },
  { id: 'instagram', name: 'Instagram', icon: 'Ig', connected: false, postCount: 0, lastPosted: null, color: '#e4405f' },
  { id: 'tiktok', name: 'TikTok', icon: 'Tk', connected: false, postCount: 0, lastPosted: null, color: '#010101' },
]

// ─── Hook ────────────────────────────────────────────────────────

export function useSocial() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(DEFAULT_PLATFORMS)
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [autoPostEnabled, setAutoPostEnabled] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem(POSTS_KEY)
      if (savedPosts) {
        setRecentPosts(JSON.parse(savedPosts))
      }
      const savedAutoPost = localStorage.getItem(AUTOPOST_KEY)
      if (savedAutoPost) {
        setAutoPostEnabled(JSON.parse(savedAutoPost))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Persist posts to localStorage
  useEffect(() => {
    if (recentPosts.length > 0) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(recentPosts))
    }
  }, [recentPosts])

  // Persist auto-post toggle
  useEffect(() => {
    localStorage.setItem(AUTOPOST_KEY, JSON.stringify(autoPostEnabled))
  }, [autoPostEnabled])

  const toggleAutoPost = useCallback(() => {
    setAutoPostEnabled((prev) => !prev)
  }, [])

  const refreshPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/console/social/post')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.posts)) {
          setRecentPosts(data.posts)
          localStorage.setItem(POSTS_KEY, JSON.stringify(data.posts))
        }
      }
    } catch {
      // Silently fail — local data is still available
    }
  }, [])

  const createPost = useCallback(
    async (content: string, selectedPlatforms: string[], hashtags: string[]): Promise<CreatePostResult | null> => {
      setIsPosting(true)
      try {
        const res = await fetch('/api/console/social/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, platforms: selectedPlatforms, hashtags }),
        })

        if (!res.ok) {
          throw new Error('Post failed')
        }

        const data: CreatePostResult = await res.json()

        // Build the new post entry
        const newPost: SocialPost = {
          id: Date.now().toString(),
          content,
          platforms: selectedPlatforms,
          hashtags,
          status: data.results.every((r) => r.success) ? 'posted' : 'failed',
          createdAt: new Date().toISOString(),
          results: data.results,
        }

        setRecentPosts((prev) => [newPost, ...prev].slice(0, 50))

        // Update platform stats
        setPlatforms((prev) =>
          prev.map((p) => {
            const result = data.results.find((r) => r.platform === p.id)
            if (result && result.success) {
              return {
                ...p,
                postCount: p.postCount + 1,
                lastPosted: new Date().toISOString(),
              }
            }
            return p
          })
        )

        return data
      } catch {
        return null
      } finally {
        setIsPosting(false)
      }
    },
    []
  )

  return {
    platforms,
    recentPosts,
    isPosting,
    autoPostEnabled,
    toggleAutoPost,
    createPost,
    refreshPosts,
  }
}
