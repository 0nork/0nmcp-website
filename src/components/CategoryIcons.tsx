/**
 * CategoryIcons.tsx
 *
 * Clean flat SVG icons for categories, archetypes, and onboarding paths.
 * All icons are 24x24 viewBox, white fill/stroke by default.
 * Use className or style to override color/size.
 *
 * Brand product icons use white-on-green circle backgrounds.
 */

import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const defaults = (size = 24): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
})

// ─── Category Icons (flat, single-color) ────────────────────────────────

export function IconBolt({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
    </svg>
  )
}

export function IconChat({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="currentColor" />
    </svg>
  )
}

export function IconEnvelope({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" opacity="0.25" />
      <path d="M2 6l10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconCreditCard({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="1" y="4" width="22" height="16" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="14" width="4" height="2" rx="0.5" fill="currentColor" />
    </svg>
  )
}

export function IconUsers({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="9" cy="7" r="4" fill="currentColor" />
      <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" fill="currentColor" opacity="0.6" />
      <circle cx="17" cy="8" r="3" fill="currentColor" opacity="0.5" />
      <path d="M22 21v-1.5a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconClipboard({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="8" y="1" width="8" height="4" rx="1" fill="currentColor" />
      <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconDocument({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor" opacity="0.15" />
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconHeadset({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="1" y="14" width="4" height="6" rx="1.5" fill="currentColor" />
      <rect x="19" y="14" width="4" height="6" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function IconGlobe({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function IconMegaphone({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M21 3L10 8H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h5l11 5V3z" fill="currentColor" opacity="0.3" />
      <path d="M21 3L10 8H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h5l11 5V3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M7 12v4a2 2 0 0 0 2 2h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconBrain({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M12 2C8 2 5 5 5 8.5c0 2 1 3.5 2 4.5v1.5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V13c1-1 2-2.5 2-4.5C19 5 16 2 12 2z" fill="currentColor" opacity="0.2" />
      <path d="M12 2C8 2 5 5 5 8.5c0 2 1 3.5 2 4.5v1.5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V13c1-1 2-2.5 2-4.5C19 5 16 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="22" x2="14" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 2v6M8 6l4 2 4-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function IconKeyboard({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="2" y="4" width="20" height="14" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="6" y="8" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="10" y="8" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="14" y="8" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="6" y="12" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="10" y="12" width="4" height="2" rx="0.3" fill="currentColor" />
      <rect x="16" y="12" width="2" height="2" rx="0.3" fill="currentColor" />
    </svg>
  )
}

export function IconPhone({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="5" y="1" width="14" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="5" y="1" width="14" height="22" rx="3" fill="currentColor" opacity="0.1" />
      <line x1="5" y1="5" x2="19" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="5" y1="19" x2="19" y2="19" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="21" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function IconChart({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="10" y="6" width="4" height="15" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" />
    </svg>
  )
}

export function IconBank({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M3 21h18M3 10h18M5 6l7-4 7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="10" width="2" height="8" fill="currentColor" opacity="0.5" />
      <rect x="11" y="10" width="2" height="8" fill="currentColor" opacity="0.5" />
      <rect x="17" y="10" width="2" height="8" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

export function IconCloud({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="currentColor" opacity="0.2" />
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconLink({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M10 13a5 5 0 0 0 7.07.71l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M14 11a5 5 0 0 0-7.07-.71l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconGear({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconSend({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 2L15 22l-4-9-9-4L22 2z" fill="currentColor" opacity="0.2" />
      <path d="M22 2L15 22l-4-9-9-4L22 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconSnowflake({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.5" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="2" x2="9" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="2" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="22" x2="9" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="22" x2="15" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconBubble({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="currentColor" opacity="0.2" />
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconReceipt({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" fill="currentColor" opacity="0.1" />
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconRobot({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="3" y="7" width="18" height="14" rx="3" fill="currentColor" opacity="0.15" />
      <rect x="3" y="7" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="9" cy="13" r="1.5" fill="currentColor" />
      <circle cx="15" cy="13" r="1.5" fill="currentColor" />
      <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
    </svg>
  )
}

export function IconWrench({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="currentColor" opacity="0.2" />
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconTicket({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v4h20v-4a3 3 0 0 1 0-6V5H2v4z" fill="currentColor" opacity="0.15" />
      <path d="M2 9a3 3 0 0 1 0 6v4h20v-4a3 3 0 0 1 0-6V5H2v4z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="10" y1="5" x2="10" y2="19" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  )
}

export function IconTarget({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

export function IconCalendar({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="14" width="2" height="2" rx="0.3" fill="currentColor" />
      <rect x="11" y="14" width="2" height="2" rx="0.3" fill="currentColor" />
    </svg>
  )
}

export function IconShuffle({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <polyline points="16,3 21,3 21,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="4" y1="20" x2="21" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="21,16 21,21 16,21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="4" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconRepeat({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <polyline points="17,1 21,5 17,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <polyline points="7,23 3,19 7,15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconSync({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M21.5 2v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2.5 22v-6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2.5 12A9.96 9.96 0 0 1 6 5.6l15.5-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M21.5 12A9.96 9.96 0 0 1 18 18.4L2.5 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconShield({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.15" />
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconCheck({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconEarth({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}

export function IconClock({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconFolder({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" fill="currentColor" opacity="0.15" />
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconVideo({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="2" y="5" width="15" height="14" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="2" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <polygon points="17,9 22,6 22,18 17,15" fill="currentColor" opacity="0.5" />
      <polygon points="17,9 22,6 22,18 17,15" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconShoppingBag({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z" fill="currentColor" opacity="0.12" />
      <path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="3" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 11a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconContactBook({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="10" r="3" fill="currentColor" opacity="0.4" />
      <path d="M8 18c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="1" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="13" x2="4" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="18" x2="4" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconMagnet({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M6 3v7a6 6 0 0 0 12 0V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="3" y="2" width="6" height="4" rx="0.5" fill="currentColor" />
      <rect x="15" y="2" width="6" height="4" rx="0.5" fill="currentColor" />
    </svg>
  )
}

export function IconRuler({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <rect x="1" y="6" width="22" height="12" rx="2" fill="currentColor" opacity="0.1" transform="rotate(-45 12 12)" />
      <rect x="1" y="6" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(-45 12 12)" />
      <line x1="7" y1="7" x2="7" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" transform="rotate(-45 12 12)" />
      <line x1="11" y1="7" x2="11" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" transform="rotate(-45 12 12)" />
      <line x1="15" y1="7" x2="15" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" transform="rotate(-45 12 12)" />
    </svg>
  )
}

// ─── Onboarding Path Icons ─────────────────────────────────────────────

export function IconBook({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3z" fill="currentColor" opacity="0.15" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z" fill="currentColor" opacity="0.15" />
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconHammer({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M17.64 2.36a2.83 2.83 0 0 1 4 4L15 13l-4-4 6.64-6.64z" fill="currentColor" opacity="0.3" />
      <path d="M17.64 2.36a2.83 2.83 0 0 1 4 4L15 13l-4-4 6.64-6.64z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function IconForum({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Archetype Icons (used in LinkedIn onboarding) ──────────────────────

export function IconStar({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" />
    </svg>
  )
}

export function IconDiamond({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <polygon points="12,2 22,12 12,22 2,12" fill="currentColor" opacity="0.3" />
      <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

export function IconSparkle({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="currentColor" />
    </svg>
  )
}

export function IconRising({ size = 24, ...props }: IconProps) {
  return (
    <svg {...defaults(size)} {...props}>
      <path d="M22 7l-8.5 8.5-5-5L2 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="16,7 22,7 22,13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// ─── Brand Product Icon Wrapper (white on green circle) ─────────────────

export function BrandIcon({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#7ed957',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/brand/icons/${name}.svg`}
        alt={name}
        width={size * 0.55}
        height={size * 0.55}
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    </div>
  )
}

// ─── Category Icon Map (replaces emoji) ─────────────────────────────────

export const CATEGORY_ICONS: Record<string, React.ComponentType<IconProps>> = {
  // Homepage categories
  'Everyday Tools': IconBolt,
  'Communication': IconChat,
  'Email Marketing': IconEnvelope,
  'Payments': IconCreditCard,
  'CRM & Sales': IconUsers,
  'Project Mgmt': IconClipboard,
  'Docs & Storage': IconDocument,
  'Support': IconHeadset,
  'Websites': IconGlobe,
  'Advertising': IconMegaphone,
  'AI': IconBrain,
  'Developer': IconKeyboard,
  'Social Media': IconPhone,
  'Accounting': IconChart,
  'Finance': IconBank,
  'Cloud': IconCloud,
  'Integration': IconLink,
  'Automation': IconGear,
  'Outreach': IconSend,
  'Cold Email': IconSnowflake,
  'Messaging': IconBubble,
  // services.json categories
  'Orchestration': IconShuffle,
  'Everyday': IconBolt,
  'Email': IconEnvelope,
  'Billing': IconCreditCard,
  'Contact Management': IconContactBook,
  'Task Management': IconClipboard,
  'Ticketing': IconTicket,
  'AI & ML': IconRobot,
  'Utilities': IconWrench,
  'Social': IconPhone,
  'Marketing': IconMegaphone,
  'Chat': IconChat,
  'Invoicing': IconReceipt,
  'Scheduling': IconCalendar,
  'Calendar': IconCalendar,
  'Targeting': IconTarget,
  'E-Commerce': IconShoppingBag,
  'Data': IconChart,
  'Security': IconShield,
  'Sync': IconSync,
  // Builder categories (unique names only — duplicates already mapped above)
  'Live Data': IconGear,
  'Triggers': IconBolt,
  'Actions': IconShuffle,
  'Notifications': IconBubble,
  'Database': IconChart,
  'Dev Tools': IconKeyboard,
  'Productivity': IconClipboard,
  'Ecommerce': IconShoppingBag,
  'Logic': IconRepeat,
  'Active': IconBolt,
}

// Helper to get an icon component by category name
export function getCategoryIcon(name: string): React.ComponentType<IconProps> {
  return CATEGORY_ICONS[name] || IconBolt
}
