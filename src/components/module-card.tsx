'use client'

import type React from 'react'
import {
  Calendar,
  BellOff,
  Users,
  GitBranch,
  Tags,
  MessageSquare,
  Activity,
  GraduationCap,
  Layers,
  Database,
  BarChart3,
  Mail,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasAccess, TIER_LABELS, type Module, type UserTier } from '@/lib/user-context'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Calendar,
  BellOff,
  Users,
  GitBranch,
  Tags,
  MessageSquare,
  Activity,
  GraduationCap,
  Layers,
  Database,
  BarChart3,
  Mail,
  Building2,
}

interface ModuleCardProps {
  module: Module
  userTier: UserTier
  onAction: () => void
  comingSoon?: boolean
}

export function ModuleCard({ module, userTier, onAction, comingSoon = false }: ModuleCardProps) {
  const Icon = ICON_MAP[module.icon] || Users
  const isUnlocked = hasAccess(module.tier, userTier)
  const color = module.color || '#6EE05A'

  const getStatus = () => {
    if (comingSoon) return 'coming-soon' as const
    if (isUnlocked) return 'active' as const
    return 'locked' as const
  }

  const status = getStatus()

  return (
    <div
      className={cn(
        'module-card',
        status === 'active' && 'module-card-active',
        status === 'locked' && 'module-card-locked',
        status === 'coming-soon' && 'module-card-coming-soon',
      )}
      onClick={onAction}
      role="button"
      tabIndex={0}
    >
      {/* Header */}
      <div className="module-card-header">
        <div className="module-card-icon-wrap" style={{
          backgroundColor: status === 'coming-soon'
            ? 'rgba(74, 85, 104, 0.15)'
            : status === 'locked'
              ? 'rgba(168, 85, 247, 0.12)'
              : `${color}15`,
        }}>
          <Icon
            className="module-card-icon"
            style={{
              color: status === 'coming-soon'
                ? '#4A5568'
                : status === 'locked'
                  ? '#A855F7'
                  : color,
            }}
          />
        </div>
        <span className={cn(
          'module-card-tier-badge',
          module.tier === 'free' && 'tier-free',
          module.tier === 'supporter' && 'tier-supporter',
          module.tier === 'builder' && 'tier-builder',
          module.tier === 'enterprise' && 'tier-enterprise',
        )}>
          {TIER_LABELS[module.tier]}
        </span>
      </div>

      {/* Title */}
      <h3 className="module-card-title">{module.name}</h3>

      {/* Status badge */}
      <span className={cn(
        'module-card-status',
        status === 'active' && 'status-active',
        status === 'locked' && 'status-locked',
        status === 'coming-soon' && 'status-coming-soon',
      )}>
        {status === 'active' && (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Active
          </>
        )}
        {status === 'locked' && (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Upgrade to Unlock
          </>
        )}
        {status === 'coming-soon' && (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Coming Soon
          </>
        )}
      </span>

      {/* Description */}
      <p className="module-card-desc">{module.description}</p>

      {/* Action button */}
      <button
        className={cn(
          'module-card-btn',
          status === 'active' && 'btn-active',
          status === 'locked' && 'btn-locked',
          status === 'coming-soon' && 'btn-coming-soon',
        )}
        disabled={status === 'coming-soon'}
      >
        {status === 'active' && 'Open Module'}
        {status === 'locked' && 'View Upgrade Options'}
        {status === 'coming-soon' && 'Coming Soon'}
      </button>
    </div>
  )
}
