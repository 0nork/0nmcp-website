'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────

export interface SocialPlatform {
  id: string
  name: string
  icon: string
  connected: boolean
  expired?: boolean
  postCount: number
  lastPosted: string | null
  color: string
  method: 'oauth' | 'api_key'
  username: string | null
  avatar: string | null
  connectUrl: string | null
  comingSoon?: boolean
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

const ICON_MAP: Record<string, string> = {
  linkedin: 'Li',
  facebook: 'Fb',
  instagram: 'Ig',
  x_twitter: 'X',
  google: 'G',
  reddit: 'Rd',
  dev_to: 'Dv',
}

const DEFAULT_PLATFORMS: SocialPlatform[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'Li', connected: false, postCount: 0, lastPosted: null, color: '#0077b5', method: 'oauth', username: null, avatar: null, connectUrl: '/api/linkedin/auth' },
  { id: 'reddit', name: 'Reddit', icon: 'Rd', connected: false, postCount: 0, lastPosted: null, color: '#ff4500', method: 'oauth', username: null, avatar: null, connectUrl: '/api/social/reddit/auth' },
  { id: 'dev_to', name: 'Dev.to', icon: 'Dv', connected: false, postCount: 0, lastPosted: null, color: '#0a0a0a', method: 'api_key', username: null, avatar: null, connectUrl: null },
  { id: 'x_twitter', name: 'X / Twitter', icon: 'X', connected: false, postCount: 0, lastPosted: null, color: '#000000', method: 'oauth', username: null, avatar: null, connectUrl: null, comingSoon: true },
  { id: 'facebook', name: 'Facebook', icon: 'Fb', connected: false, postCount: 0, lastPosted: null, color: '#1877f2', method: 'oauth', username: null, avatar: null, connectUrl: null, comingSoon: true },
  { id: 'instagram', name: 'Instagram', icon: 'Ig', connected: false, postCount: 0, lastPosted: null, color: '#e4405f', method: 'oauth', username: null, avatar: null, connectUrl: null, comingSoon: true },
]

// ─── Hook ────────────────────────────────────────────────────────

export function useSocial() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(DEFAULT_PLATFORMS)
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [autoPostEnabled, setAutoPostEnabled] = useState(false)
  const [accountsLoaded, setAccountsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem(POSTS_KEY)
      if (savedPosts) setRecentPosts(JSON.parse(savedPosts))
      const savedAutoPost = localStorage.getItem(AUTOPOST_KEY)
      if (savedAutoPost) setAutoPostEnabled(JSON.parse(savedAutoPost))
    } catch { /* ignore */ }
  }, [])

  // Fetch real connected accounts on mount
  const refreshAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/console/social/accounts')
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data.platforms)) return

      setPlatforms((prev) =>
        data.platforms.map((p: {
          id: string; name: string; color: string; connected: boolean;
          expired?: boolean; method: string; username: string | null;
          avatar: string | null; connectUrl: string | null; comingSoon?: boolean
        }) => {
          const existing = prev.find((e) => e.id === p.id)
          return {
            id: p.id,
            name: p.name,
            icon: ICON_MAP[p.id] || p.id.slice(0, 2).toUpperCase(),
            connected: p.connected,
            expired: p.expired,
            postCount: existing?.postCount || 0,
            lastPosted: existing?.lastPosted || null,
            color: p.color,
            method: (p.method || 'oauth') as 'oauth' | 'api_key',
            username: p.username,
            avatar: p.avatar,
            connectUrl: p.connectUrl,
            comingSoon: p.comingSoon,
          }
        })
      )
    } catch { /* silent */ }
    finally { setAccountsLoaded(true) }
  }, [])

  useEffect(() => { refreshAccounts() }, [refreshAccounts])

  // Persist posts
  useEffect(() => {
    if (recentPosts.length > 0) localStorage.setItem(POSTS_KEY, JSON.stringify(recentPosts))
  }, [recentPosts])

  useEffect(() => {
    localStorage.setItem(AUTOPOST_KEY, JSON.stringify(autoPostEnabled))
  }, [autoPostEnabled])

  const toggleAutoPost = useCallback(() => setAutoPostEnabled((p) => !p), [])

  const refreshPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/console/social/post')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.posts)) {
        setRecentPosts(data.posts)
        localStorage.setItem(POSTS_KEY, JSON.stringify(data.posts))
      }
    } catch { /* silent */ }
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
        if (!res.ok) throw new Error('Post failed')

        const data: CreatePostResult = await res.json()

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

        setPlatforms((prev) =>
          prev.map((p) => {
            const result = data.results.find((r) => r.platform === p.id)
            if (result && result.success) {
              return { ...p, postCount: p.postCount + 1, lastPosted: new Date().toISOString() }
            }
            return p
          })
        )

        return data
      } catch { return null }
      finally { setIsPosting(false) }
    }, []
  )

  // Connect Dev.to via API key
  const connectDevTo = useCallback(async (apiKey: string): Promise<{ success: boolean; username?: string; error?: string }> => {
    try {
      const res = await fetch('/api/console/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'dev_to', api_key: apiKey }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error }
      await refreshAccounts()
      return { success: true, username: data.username }
    } catch {
      return { success: false, error: 'Connection failed' }
    }
  }, [refreshAccounts])

  // Disconnect a platform
  const disconnect = useCallback(async (platform: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/console/social/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      if (res.ok) {
        await refreshAccounts()
        return true
      }
      return false
    } catch { return false }
  }, [refreshAccounts])

  return {
    platforms,
    recentPosts,
    isPosting,
    autoPostEnabled,
    accountsLoaded,
    toggleAutoPost,
    createPost,
    refreshPosts,
    refreshAccounts,
    connectDevTo,
    disconnect,
  }
}
