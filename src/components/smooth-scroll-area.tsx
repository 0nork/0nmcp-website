'use client'

import * as React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { cn } from '@/lib/utils'

/**
 * Smooth, brand-themed scroll area.
 *
 * Drop-in replacement for shadcn's ScrollArea with a `scrollbarClassName`
 * escape hatch that lets a caller restyle the track and the thumb
 * independently. Defaults: thin track, gradient thumb in 0n brand
 * colors (green → teal), gentle hover ramp, smooth scroll behavior.
 *
 * Usage
 *   <ScrollArea className="rounded-md bg-card p-4">
 *     {children}
 *   </ScrollArea>
 *
 * Override thumb gradient
 *   <ScrollArea
 *     scrollbarClassName={{
 *       track: 'w-2.5',
 *       thumb: 'bg-gradient-to-b from-[#a78bfa] to-[#14b8a6]',
 *     }}
 *   >…</ScrollArea>
 */

type ScrollbarPalette = {
  track?: string
  thumb?: string
}

interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  scrollbarClassName?: ScrollbarPalette
  /**
   * Show the horizontal scrollbar in addition to the vertical one.
   * Useful for code blocks that wrap to long single lines.
   */
  horizontal?: boolean
}

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, scrollbarClassName, horizontal, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden [scroll-behavior:smooth]', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] [scroll-behavior:smooth]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <SmoothScrollBar orientation="vertical" palette={scrollbarClassName} />
    {horizontal && <SmoothScrollBar orientation="horizontal" palette={scrollbarClassName} />}
    <ScrollAreaPrimitive.Corner className="bg-transparent" />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = 'SmoothScrollArea'

interface SmoothScrollBarProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  palette?: ScrollbarPalette
}

const SmoothScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  SmoothScrollBarProps
>(({ className, orientation = 'vertical', palette, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none p-px transition-[width,height,opacity] duration-200',
      'data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100',
      orientation === 'vertical' && 'h-full w-2 hover:w-3',
      orientation === 'horizontal' && 'h-2 w-full flex-col hover:h-3',
      // Default track — translucent, brand-tinted on hover
      'bg-white/[0.02] hover:bg-[#6EE05A]/[0.05]',
      palette?.track,
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        'relative flex-1 rounded-full transition-colors',
        // Brand gradient by default — green → teal
        'bg-gradient-to-b from-[#6EE05A] to-[#14b8a6]',
        // Horizontal needs a left-to-right gradient direction
        orientation === 'horizontal' && 'bg-gradient-to-r from-[#6EE05A] to-[#14b8a6]',
        'opacity-70 hover:opacity-100',
        palette?.thumb,
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
SmoothScrollBar.displayName = 'SmoothScrollBar'
