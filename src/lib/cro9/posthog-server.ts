import { PostHog } from 'posthog-node'

let client: PostHog | null = null

export function getPostHogServer(): PostHog {
  if (!client) {
    const key = process.env.POSTHOG_PERSONAL_API_KEY
    if (!key) throw new Error('POSTHOG_PERSONAL_API_KEY not set')
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return client
}
