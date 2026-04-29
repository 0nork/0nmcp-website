import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Gradient Headline — the brand-gradient h1 pattern.
 *
 * A drop-in headline component that paints text with an animated multi-stop
 * linear gradient. Shipped across the 0n ecosystem (sxowebsite.com,
 * 0nmcp.com, 0ncore.com) for hero sections and post-purchase moments.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-gradient-headline.json
 *
 * Use:
 *   <GradientHeadline>Free SXO Scan.</GradientHeadline>
 *
 *   <GradientHeadline as="h2" preset="0n" animate>
 *     Stop building workflows. Start describing outcomes.
 *   </GradientHeadline>
 *
 *   <GradientHeadline preset="custom" stops={['#10b981', '#06b6d4', '#8b5cf6']}>
 *     Your brand, your gradient.
 *   </GradientHeadline>
 */

import type { ElementType, ReactNode, CSSProperties } from 'react'

const PRESETS = {
  /** sxowebsite.com — violet → indigo → cyan → ice */
  sxo: ['#8B5CF6', '#6366F1', '#06B6D4', '#a5f3fc'],
  /** 0nmcp.com — green → teal → violet */
  '0n': ['#6EE05A', '#14b8a6', '#8b5cf6'],
  /** 0ncore.com — green → cyan → lavender */
  '0ncore': ['#7ed957', '#00d4ff', '#a78bfa'],
  /** verifiedsxo.com — emerald → teal */
  verified: ['#10b981', '#0d9488'],
} as const

type Preset = keyof typeof PRESETS | 'custom'

const SIZE_CLASS = {
  sm: 'text-2xl sm:text-3xl',
  md: 'text-3xl sm:text-4xl lg:text-5xl',
  lg: 'text-4xl sm:text-5xl lg:text-6xl',
  xl: 'text-5xl sm:text-6xl lg:text-7xl',
} as const

export interface GradientHeadlineProps {
  /** Tag to render — defaults to h1. Use h2/h3 for section heads. */
  as?: ElementType
  /** Built-in palette, or 'custom' to supply your own stops. */
  preset?: Preset
  /** Custom stop colors (only used when preset='custom'). */
  stops?: readonly string[]
  /** Gradient angle in degrees. Default 135. */
  angle?: number
  /** Size preset for the type scale. */
  size?: keyof typeof SIZE_CLASS
  /** Animate the gradient position. Subtle, infinite, easing. */
  animate?: boolean
  /** Forwarded className. */
  className?: string
  children: ReactNode
}

export function GradientHeadline({
  as: Tag = 'h1',
  preset = 'sxo',
  stops,
  angle = 135,
  size = 'lg',
  animate = false,
  className = '',
  children,
}: GradientHeadlineProps) {
  const palette =
    preset === 'custom'
      ? stops ?? PRESETS.sxo
      : PRESETS[preset]

  const stopList = palette
    .map((c, i) => \`\${c} \${Math.round((i / Math.max(palette.length - 1, 1)) * 100)}%\`)
    .join(', ')

  const style: CSSProperties = {
    backgroundImage: \`linear-gradient(\${angle}deg, \${stopList})\`,
    backgroundSize: animate ? '200% 200%' : '100% 100%',
    animation: animate ? 'on-gradient-shift 6s ease infinite' : undefined,
  }

  return (
    <Tag
      className={\`font-extrabold tracking-tight leading-[1.05] \${SIZE_CLASS[size]} \${className}\`}
    >
      <span className="bg-clip-text text-transparent" style={style}>
        {children}
      </span>
      {animate ? (
        <style>{\`
          @keyframes on-gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        \`}</style>
      ) : null}
    </Tag>
  )
}

GradientHeadline.PRESETS = PRESETS
`

export const gradientHeadline: RegistryItem = {
  name: '0n-gradient-headline',
  type: 'registry:component',
  title: 'Gradient Headline',
  description:
    'The brand-gradient h1 pattern shipped across the 0n ecosystem. Paints text with an animated multi-stop linear gradient. Built-in presets for sxowebsite, 0nmcp, 0ncore, verifiedsxo — or pass your own stops.',
  dependencies: [],
  registryDependencies: [],
  category: 'typography',
  useCases: [
    'Hero h1 with a branded multi-stop gradient',
    'Section headings that match a product palette',
    'Post-purchase celebration moments (e.g. "Your Report is Ready!")',
    'A/B testing brand color schemes by swapping presets',
  ],
  files: [
    {
      path: 'components/0n/gradient-headline.tsx',
      type: 'registry:component',
      target: 'components/0n/gradient-headline.tsx',
      content: SOURCE,
    },
  ],
}
