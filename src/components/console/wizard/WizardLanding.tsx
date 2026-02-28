'use client'

import { useState } from 'react'
import {
  Plus,
  Linkedin,
  UserPlus,
  FileText,
  Receipt,
  Users,
  Calendar,
  Headphones,
  Code2,
  RefreshCw,
  Mail,
  Bell,
  TrendingUp,
  Repeat,
  Webhook,
  Database,
  Mic,
  Package,
  MessageCircle,
  PenTool,
  Smartphone,
  Instagram,
  Twitter,
  DollarSign,
  Send,
  GitBranch,
  ShoppingCart,
  Bot,
  BarChart3,
  Star,
  Activity,
  Sparkles,
  Globe,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'
import { GlossyTile } from './GlossyTile'
import {
  WIZARD_TEMPLATES,
  CATEGORIES as DATA_CATEGORIES,
  type WorkflowTemplate,
  type Category as DataCategory,
} from '@/data/wizard-templates'

const ALL_CATEGORIES = ['All', ...DATA_CATEGORIES] as const
type Category = 'All' | DataCategory

/** Map template icon strings to actual Lucide components */
const TEMPLATE_ICON_MAP: Record<string, LucideIcon> = {
  Linkedin,
  UserPlus,
  FileText,
  Receipt,
  Users,
  Calendar,
  Headphones,
  Code2,
  RefreshCw,
  Mail,
  Bell,
  TrendingUp,
  Repeat,
  Webhook,
  Database,
  Mic,
  Package,
  MessageCircle,
  PenTool,
  Smartphone,
  Instagram,
  Twitter,
  DollarSign,
  Send,
  GitBranch,
  ShoppingCart,
  Bot,
  BarChart3,
  Star,
  Activity,
  Sparkles,
  Globe,
  Clock,
}

function getPopularityBadge(popularity: number): string | undefined {
  if (popularity >= 90) return 'Popular'
  if (popularity >= 80) return 'Trending'
  if (popularity >= 70) return 'Hot'
  return undefined
}

export default function WizardLanding() {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filtered =
    activeCategory === 'All'
      ? WIZARD_TEMPLATES
      : WIZARD_TEMPLATES.filter(
          (t) => t.category === activeCategory
        )

  function handleSelectTemplate(template: WorkflowTemplate) {
    dispatch({ type: 'SELECT_TEMPLATE', template })
    dispatch({ type: 'START_THINKING', nextStep: 'trigger' })
  }

  function handleStartFromScratch() {
    dispatch({ type: 'START_FROM_SCRATCH' })
    dispatch({ type: 'START_THINKING', nextStep: 'trigger' })
  }

  return (
    <div
      style={{
        padding: '24px',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        What would you like to automate?
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '6px 0 20px 0',
        }}
      >
        Choose a template to get started, or build from scratch.
      </p>

      {/* Category filter pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor:
                activeCategory === cat
                  ? 'var(--accent)'
                  : 'rgba(255,255,255,0.04)',
              color:
                activeCategory === cat
                  ? 'var(--bg-primary)'
                  : 'var(--text-secondary)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Template tiles */}
        {filtered.map((template, index) => {
          const IconComponent = TEMPLATE_ICON_MAP[template.icon]
          const badge = getPopularityBadge(template.popularity)

          return (
            <div
              key={template.id}
              style={{
                animation: 'console-stagger-in 0.4s ease both',
                animationDelay: `${index * 40}ms`,
              }}
            >
              <GlossyTile
                icon={IconComponent || template.icon}
                label={template.name}
                sublabel={
                  template.description.length > 50
                    ? template.description.slice(0, 47) + '...'
                    : template.description
                }
                badge={badge}
                onClick={() => handleSelectTemplate(template)}
              />
            </div>
          )
        })}

        {/* Start from scratch tile */}
        <div
          style={{
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: `${filtered.length * 40}ms`,
          }}
        >
          <GlossyTile
            icon="Plus"
            label="Start from scratch"
            sublabel="Build your own"
            onClick={handleStartFromScratch}
            accentBorder
          />
        </div>
      </div>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
