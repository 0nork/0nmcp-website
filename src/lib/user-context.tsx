'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type UserTier = 'free' | 'supporter' | 'builder' | 'enterprise'

export interface Module {
  id: string
  name: string
  icon: string
  category: string
  tier: UserTier
  description: string
  href?: string
  color?: string
}

export interface UserContextType {
  tier: UserTier
  setTier: (tier: UserTier) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// 0nMCP Module definitions
export const ALL_MODULES: Module[] = [
  // Free tier
  {
    id: 'course-generator',
    name: 'Course Generator',
    icon: 'GraduationCap',
    category: 'Content',
    tier: 'free',
    description: 'AI-powered course creation and curriculum builder',
    href: '/console/courses/generate',
    color: '#6EE05A',
  },
  {
    id: '0nmail',
    name: '0nMail',
    icon: 'Mail',
    category: 'Communication',
    tier: 'free',
    description: 'Smart email sequences with AI compose',
    href: '/console/mail',
    color: '#60A5FA',
  },
  {
    id: 'crm-contacts',
    name: 'CRM Contacts',
    icon: 'Users',
    category: 'CRM',
    tier: 'free',
    description: 'Contact management and pipeline tracking',
    href: '/console/crm',
    color: '#A78BFA',
  },
  {
    id: 'social-publisher',
    name: 'Social Publisher',
    icon: 'Activity',
    category: 'Marketing',
    tier: 'free',
    description: 'Multi-platform social media publishing',
    href: '/console/social',
    color: '#F59E0B',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    icon: 'Database',
    category: 'Content',
    tier: 'free',
    description: 'AI-searchable docs and knowledge management',
    href: '/console/learn',
    color: '#14B8A6',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: 'Layers',
    category: 'Platform',
    tier: 'free',
    description: 'Browse and install workflow add-ons',
    href: '/console/marketplace',
    color: '#EC4899',
  },

  // Supporter tier
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'BarChart3',
    category: 'Reporting',
    tier: 'supporter',
    description: 'Full reporting and analytics dashboard',
    href: '/console/reporting',
    color: '#8B5CF6',
  },

  // Builder tier
  {
    id: 'ai-autoresponder',
    name: 'AI AutoResponder',
    icon: 'MessageSquare',
    category: 'Automation',
    tier: 'builder',
    description: 'AI-powered auto-reply across all channels',
    href: '/console/ai-employee',
    color: '#F43F5E',
  },
]

export const TIER_ORDER: Record<UserTier, number> = {
  free: 0,
  supporter: 1,
  builder: 2,
  enterprise: 3,
}

export const TIER_LABELS: Record<UserTier, string> = {
  free: 'Free',
  supporter: 'Supporter',
  builder: 'Builder',
  enterprise: 'Enterprise',
}

export function hasAccess(requiredTier: UserTier, userTier: UserTier): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[requiredTier]
}

export function getAccessibleModules(userTier: UserTier): Module[] {
  return ALL_MODULES.filter((module) => hasAccess(module.tier, userTier))
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<UserTier>('free')

  useEffect(() => {
    const savedTier = localStorage.getItem('0nmcp-user-tier') as UserTier | null
    if (savedTier && ['free', 'supporter', 'builder', 'enterprise'].includes(savedTier)) {
      setTier(savedTier)
    }
  }, [])

  const handleSetTier = (newTier: UserTier) => {
    setTier(newTier)
    localStorage.setItem('0nmcp-user-tier', newTier)
  }

  return (
    <UserContext.Provider value={{ tier, setTier: handleSetTier }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    // Return a default instead of throwing, since not all pages wrap in UserProvider
    return { tier: 'free' as UserTier, setTier: () => {} }
  }
  return context
}
