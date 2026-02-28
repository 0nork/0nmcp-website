'use client'

import { useState, type ComponentType } from 'react'
import {
  Clock,
  Globe,
  FileInput,
  FileText,
  UserPlus,
  CreditCard,
  Mail,
  MessageSquare,
  Play,
  GitBranch,
  Database,
  Webhook,
  PenTool,
  Zap,
  ShoppingCart,
  Users,
  BarChart3,
  Shield,
  Bot,
  Blocks,
  Activity,
  Send,
  Bell,
  Smartphone,
  Hash,
  Linkedin,
  Instagram,
  Twitter,
  TrendingUp,
  DollarSign,
  Calendar,
  Folder,
  Server,
  Code,
  Headphones,
  Star,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Search,
  Settings,
  Download,
  ExternalLink,
  Monitor,
  Github,
} from 'lucide-react'

const ICON_MAP: Record<string, ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Clock,
  Globe,
  FileInput,
  FileText,
  UserPlus,
  CreditCard,
  Mail,
  MessageSquare,
  Play,
  GitBranch,
  Database,
  Webhook,
  PenTool,
  Zap,
  ShoppingCart,
  Users,
  BarChart3,
  Shield,
  Bot,
  Blocks,
  Activity,
  Send,
  Bell,
  Smartphone,
  Hash,
  Linkedin,
  Instagram,
  Twitter,
  TrendingUp,
  DollarSign,
  Calendar,
  Folder,
  Server,
  Code,
  Headphones,
  Star,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Search,
  Settings,
  Download,
  ExternalLink,
  Monitor,
  Github,
}

interface GlossyTileProps {
  icon: React.ReactNode | string | ComponentType<{ size?: number }>
  label: string
  sublabel?: string
  selected?: boolean
  highlighted?: boolean
  accentBorder?: boolean
  disabled?: boolean
  onClick?: () => void
  brandColor?: string
  badge?: string
  size?: 'sm' | 'md'
}

export function GlossyTile({
  icon,
  label,
  sublabel,
  selected = false,
  highlighted = false,
  accentBorder = false,
  disabled = false,
  onClick,
  brandColor,
  badge,
  size = 'md',
}: GlossyTileProps) {
  const isActive = selected || highlighted || accentBorder
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const tileDim = size === 'sm' ? 96 : 112
  const accentColor = brandColor || 'var(--accent)'

  /* Resolve the icon to a renderable element */
  let iconElement: React.ReactNode

  if (typeof icon === 'string') {
    const Resolved = ICON_MAP[icon] || Globe
    iconElement = (
      <Resolved
        size={24}
        style={{ color: isActive ? accentColor : '#e8e8ef' }}
      />
    )
  } else if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && '$$typeof' in (icon as any) === false && typeof (icon as any).render === 'function')
  ) {
    const IconComp = icon as ComponentType<{ size?: number; style?: React.CSSProperties }>
    iconElement = (
      <IconComp
        size={24}
        style={{ color: isActive ? accentColor : '#e8e8ef' }}
      />
    )
  } else {
    /* ReactNode (JSX element, img, etc.) */
    iconElement = icon
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setPressed(false)
      }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled}
      style={{
        position: 'relative',
        width: tileDim,
        height: tileDim,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 20,
        background: 'linear-gradient(145deg, #1a1a25, #111118)',
        border: `1px solid ${
          isActive
            ? accentColor
            : hovered
              ? 'var(--border-hover, rgba(60, 60, 80, 0.8))'
              : 'rgba(42, 42, 58, 0.6)'
        }`,
        boxShadow: isActive
          ? `0 0 20px rgba(0, 255, 136, 0.15)`
          : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transform: pressed
          ? 'scale(0.97)'
          : hovered && !disabled
            ? 'translateY(-2px)'
            : 'none',
        transition: pressed
          ? 'transform 100ms ease'
          : 'all 200ms ease',
        overflow: 'hidden',
        outline: 'none',
        fontFamily: 'inherit',
        color: 'inherit',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Glossy overlay */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Badge */}
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            padding: '1px 6px',
            borderRadius: 9999,
            backgroundColor: accentColor,
            color: '#0a0a0f',
            fontSize: '0.5rem',
            fontWeight: 700,
            lineHeight: '14px',
            letterSpacing: '0.02em',
            zIndex: 2,
          }}
        >
          {badge}
        </span>
      )}

      {/* Icon circle */}
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        {iconElement}
      </span>

      {/* Label */}
      <span
        style={{
          fontSize: '0.6875rem',
          lineHeight: 1.2,
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          zIndex: 1,
          fontWeight: 500,
        }}
      >
        {label}
      </span>

      {/* Sublabel */}
      {sublabel && (
        <span
          style={{
            fontSize: '0.5625rem',
            lineHeight: 1.1,
            color: 'var(--text-muted)',
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: -4,
            zIndex: 1,
          }}
        >
          {sublabel}
        </span>
      )}
    </button>
  )
}
