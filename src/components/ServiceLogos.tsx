/* ── Real SVG brand logos for all 26 0nMCP services ── */

type P = { size?: number; className?: string }

const Stripe = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#635BFF" />
    <path d="M11.2 9.65c0-.68.56-.94 1.49-.94.99 0 2.24.3 3.23.84V6.66c-1.08-.43-2.15-.6-3.23-.6-2.64 0-4.4 1.38-4.4 3.68 0 3.59 4.94 3.02 4.94 4.57 0 .8-.7 1.06-1.67 1.06-1.15 0-2.61-.47-3.77-1.11v2.93c1.28.55 2.58.79 3.77.79 2.7 0 4.56-1.34 4.56-3.67-.01-3.87-4.92-3.19-4.92-4.67z" fill="#FFF" />
  </svg>
)

const Slack = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.27 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.833 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.522-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.527 2.527 0 0 1 0 8.834a2.527 2.527 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.527 2.527 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.52 2.522v6.312z" fill="#2EB67D" />
    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.52 2.522A2.528 2.528 0 0 1 15.166 24a2.527 2.527 0 0 1-2.521-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.521-2.522 2.527 2.527 0 0 1 2.521-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52h-6.313z" fill="#ECB22E" />
  </svg>
)

const GitHub = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

const OpenAI = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#000" />
    <path d="M18.7 10.4c.3-1.4-.2-2.9-1.3-3.8-.8-.7-1.8-1-2.8-.9-.3-.9-1-1.7-1.8-2.2-1.3-.7-2.8-.6-4 .2-.7-.7-1.6-1.1-2.6-1.1-1.4 0-2.7.8-3.3 2.1-1 .2-1.8.8-2.3 1.7-.7 1.3-.5 2.9.4 4-.3 1.4.2 2.9 1.3 3.8.8.7 1.8 1 2.8.9.3.9 1 1.7 1.8 2.2 1.3.7 2.8.6 4-.2.7.7 1.6 1.1 2.6 1.1 1.4 0 2.7-.8 3.3-2.1 1-.2 1.8-.8 2.3-1.7.7-1.3.5-2.9-.4-4zm-7.6 7.4c-.7 0-1.4-.2-1.9-.7l.1-.1 3.2-1.8c.2-.1.2-.2.2-.4V10l1.3.8v4.5c0 1.4-1.3 2.5-2.9 2.5zm-6.2-2.3c-.4-.6-.5-1.3-.3-2l.1.1 3.2 1.8c.2.1.3.1.4 0l3.8-2.2v1.5l-3.2 1.9c-1.2.7-2.8.3-3.6-.7l-.4-.4zM4 9.1c.3-.6.9-1 1.5-1.2V13c0 .2.1.3.2.4l3.8 2.2-1.3.8L5 14.5C3.8 13.8 3.4 12.2 4 11V9.1zm10.7 2.5L10.9 9.4l1.3-.8 3.2 1.9c1.2.7 1.7 2.3 1 3.5-.3.6-.9 1-1.5 1.2v-5.1c0-.2-.1-.3-.2-.4v-.1zm1.3-2l-.1-.1-3.2-1.8c-.2-.1-.3-.1-.4 0L8.5 9.9V8.4l3.2-1.9c1.2-.7 2.8-.3 3.6.8.3.5.5 1.1.4 1.7l-.1.1.4.5zm-5.6 2.7l-1.3-.8V7c0-1.4 1.2-2.6 2.7-2.6.9 0 1.7.4 2.1 1.1l-.1.1-3.2 1.8c-.1.1-.2.2-.2.4v4.5zm.7-1.6l1.7-1 1.7 1v1.9l-1.7 1-1.7-1v-1.9z" fill="#fff" />
  </svg>
)

const Discord = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#5865F2" />
    <path d="M16.93 7.56a13.2 13.2 0 0 0-3.26-1.01.05.05 0 0 0-.05.02c-.14.25-.3.58-.41.84a12.2 12.2 0 0 0-3.66 0c-.11-.26-.27-.59-.41-.84a.05.05 0 0 0-.05-.02c-1.13.2-2.22.53-3.26 1.01a.04.04 0 0 0-.02.02C3.74 10.88 3.24 14.1 3.49 17.29c0 .01.01.03.02.04a13.3 13.3 0 0 0 4 2.02.05.05 0 0 0 .06-.02c.31-.42.58-.86.82-1.33a.05.05 0 0 0-.03-.07 8.76 8.76 0 0 1-1.25-.6.05.05 0 0 1 0-.08c.08-.06.17-.13.25-.19a.05.05 0 0 1 .05-.01c2.63 1.2 5.47 1.2 8.07 0a.05.05 0 0 1 .05.01c.08.07.17.13.25.2a.05.05 0 0 1 0 .07c-.4.23-.81.43-1.25.6a.05.05 0 0 0-.03.07c.24.47.52.91.82 1.33a.05.05 0 0 0 .06.02 13.26 13.26 0 0 0 4.01-2.02.05.05 0 0 0 .02-.03c.29-3.04-.49-6.23-2.07-8.8a.04.04 0 0 0-.02-.02zM9.35 15.17c-.76 0-1.39-.7-1.39-1.56s.61-1.56 1.39-1.56c.78 0 1.4.71 1.39 1.56 0 .86-.62 1.56-1.39 1.56zm5.14 0c-.76 0-1.39-.7-1.39-1.56s.61-1.56 1.39-1.56c.78 0 1.4.71 1.39 1.56 0 .86-.61 1.56-1.39 1.56z" fill="#fff" />
  </svg>
)

const Notion = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#fff" />
    <path d="M4.46 4.39l8.29-.61c1.02-.09 1.28-.03 1.92.44l2.65 1.85c.44.32.59.4.59.75v11.76c0 .63-.23.99-.99 1.04l-9.63.56c-.57.03-.84-.06-1.14-.44L4 17.33c-.33-.47-.46-.82-.46-1.23V5.35c0-.51.23-.93.92-.96z" fill="#000" />
    <path d="M12.75 3.78l-8.29.61c-.69.03-.92.45-.92.96v10.75c0 .41.13.76.46 1.23l2.16 2.41c.3.38.57.47 1.14.44l9.63-.56c.76-.05.99-.41.99-1.04V6.82c0-.35-.15-.43-.59-.75l-2.65-1.85c-.64-.47-.9-.53-1.92-.44zm-.95 2.26c.14-.02.27-.02.38.02l4.5.7c.18.08.18.18.18.2v.48c0 .18-.12.3-.31.31l-4.75.29c-.18.01-.31-.1-.31-.28v-.58c0-.2.13-.38.31-.42v.28zm-4.98 2.07c-.03-.19.1-.36.29-.38l1.97-.12c.17-.01.32.1.34.27l.18 1.03c.02.17-.1.33-.27.34l-1.87.1c-.19.01-.35-.13-.37-.32l-.27-.92zm0 3.16c-.03-.19.1-.36.29-.38l1.97-.12c.17-.01.32.1.34.27l.18 1.03c.02.17-.1.33-.27.34l-1.87.1c-.19.01-.35-.13-.37-.32l-.27-.92zm0 3.16c-.03-.19.1-.36.29-.38l1.97-.12c.17-.01.32.1.34.27l.18 1.03c.02.17-.1.33-.27.34l-1.87.1c-.19.01-.35-.13-.37-.32l-.27-.92zm4.66-6.2l5.26-.32c.18-.01.31.13.31.31v6.55c0 .18-.13.33-.31.34l-5.26.32c-.18.01-.31-.13-.31-.31V8.55c0-.18.13-.33.31-.34v-.02z" fill="#fff" />
  </svg>
)

const Twilio = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="12" fill="#F22F46" />
    <path d="M12 4.8a7.2 7.2 0 1 0 0 14.4 7.2 7.2 0 0 0 0-14.4zm-1.68 10.32a1.68 1.68 0 1 1 0-3.36 1.68 1.68 0 0 1 0 3.36zm0-3.84a1.68 1.68 0 1 1 0-3.36 1.68 1.68 0 0 1 0 3.36zm3.36 3.84a1.68 1.68 0 1 1 0-3.36 1.68 1.68 0 0 1 0 3.36zm0-3.84a1.68 1.68 0 1 1 0-3.36 1.68 1.68 0 0 1 0 3.36z" fill="#fff" />
  </svg>
)

const Supabase = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13.7 21.8c-.5.6-1.5.2-1.5-.6V14h8.4c.9 0 1.4 1 .8 1.7l-7.7 6.1z" fill="#3ECF8E" />
    <path d="M13.7 21.8c-.5.6-1.5.2-1.5-.6V14h8.4c.9 0 1.4 1 .8 1.7l-7.7 6.1z" fill="url(#sb_a)" fillOpacity=".2" />
    <path d="M10.3 2.2c.5-.6 1.5-.2 1.5.6V10H3.4c-.9 0-1.4-1-.8-1.7l7.7-6.1z" fill="#3ECF8E" />
    <defs><linearGradient id="sb_a" x1="12.2" y1="16.1" x2="18.8" y2="19.2" gradientUnits="userSpaceOnUse"><stop stopColor="#249361" /><stop offset="1" stopColor="#3ECF8E" /></linearGradient></defs>
  </svg>
)

const Shopify = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M15.34 3.65s-.07 0-.1.03c-.03.02-.44 1.34-.44 1.34s-.4-.79-1.12-.79c-.05 0-.1 0-.15.01-.17-.24-.38-.37-.57-.37-.14 0-.28.06-.4.18C12 3.4 11.27 3.3 10.81 4.53l-.62 1.92c-.47-.15-.81-.25-.85-.27-.26-.08-.27-.08-.3-.33C9 5.6 8.3 1.65 8.3 1.65l-4.4.82S7.23 18.5 7.24 18.55l6.68 1.22S17.04 4.38 17.04 4.3c0-.07-.04-.12-.11-.13-.22-.04-1.15-.33-1.59-.52zM12.2 7.41l-.63 1.95s-.7-.37-1.56-.31c-1.24.1-1.25.86-1.24 1.06.07 1.1 2.96 1.34 3.12 3.92.13 2.03-1.08 3.42-2.81 3.53-2.09.13-3.24-1.1-3.24-1.1l.44-1.89s1.16.87 2.09.81c.6-.04.82-.53.8-.87-.09-1.43-2.44-1.35-2.59-3.71-.13-1.99 1.18-4.01 4.06-4.19.44-.02.87.04 1.24.16l.32-.36z" fill="#96BF48" />
  </svg>
)

const HubSpot = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M16.75 7.94V5.72a2.08 2.08 0 0 0 1.2-1.88 2.1 2.1 0 0 0-2.1-2.1 2.1 2.1 0 0 0-2.1 2.1c0 .84.5 1.56 1.2 1.88v2.22a4.72 4.72 0 0 0-2.28 1.13l-6.04-4.7a2.37 2.37 0 0 0 .07-.56A2.29 2.29 0 0 0 4.41 1.5 2.29 2.29 0 0 0 2.12 3.8a2.29 2.29 0 0 0 2.29 2.29c.44 0 .85-.13 1.2-.35l5.93 4.62a4.73 4.73 0 0 0-.04 5.6l-1.82 1.82a2.07 2.07 0 0 0-.62-.1 2.1 2.1 0 1 0 2.1 2.1c0-.22-.04-.43-.1-.62l1.79-1.79a4.74 4.74 0 1 0 3.9-9.43zm-.9 7.54a2.84 2.84 0 1 1 0-5.68 2.84 2.84 0 0 1 0 5.68z" fill="#FF7A59" />
  </svg>
)

const Gmail = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" fill="#fff" />
    <path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 6v12h20V6" stroke="#4285F4" strokeWidth="1.5" />
    <path d="M2 18l7-5.5M22 18l-7-5.5" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const Jira = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22.16 11.16L13.34 2.34 12 1l-8.16 8.16a.48.48 0 0 0 0 .68l7.48 7.48 .68.68 8.16-8.16a.48.48 0 0 0 0-.68zM12 15.36L8.64 12 12 8.64 15.36 12 12 15.36z" fill="#2684FF" />
    <path d="M12 8.64a4.74 4.74 0 0 1-.01-6.7L5.17 8.76l3.47 3.47L12 8.64z" fill="url(#jira_a)" />
    <path d="M15.37 11.99L12 15.36a4.74 4.74 0 0 1 0 6.71l6.83-6.83-3.46-3.25z" fill="url(#jira_b)" />
    <defs>
      <linearGradient id="jira_a" x1="11.3" y1="5.44" x2="7.06" y2="9.58" gradientUnits="userSpaceOnUse"><stop stopColor="#0052CC" /><stop offset="1" stopColor="#2684FF" /></linearGradient>
      <linearGradient id="jira_b" x1="12.77" y1="18.47" x2="17.01" y2="14.33" gradientUnits="userSpaceOnUse"><stop stopColor="#0052CC" /><stop offset="1" stopColor="#2684FF" /></linearGradient>
    </defs>
  </svg>
)

const Trello = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#0079BF" />
    <rect x="4.5" y="4.5" width="6" height="13" rx="1.2" fill="#fff" />
    <rect x="13.5" y="4.5" width="6" height="8.5" rx="1.2" fill="#fff" />
  </svg>
)

const GoogleCalendar = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="4" width="20" height="18" rx="2" fill="#fff" stroke="#4285F4" strokeWidth="1.5" />
    <rect x="2" y="4" width="20" height="5" rx="2" fill="#4285F4" />
    <circle cx="8" cy="14" r="1.2" fill="#EA4335" />
    <circle cx="12" cy="14" r="1.2" fill="#34A853" />
    <circle cx="16" cy="14" r="1.2" fill="#FBBC05" />
    <circle cx="8" cy="18" r="1.2" fill="#4285F4" />
    <circle cx="12" cy="18" r="1.2" fill="#EA4335" />
  </svg>
)

const Mailchimp = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#FFE01B" />
    <path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm2.5 10.5c-.69.4-1.55.5-2.5.5s-1.81-.1-2.5-.5C8.5 14.7 8 13.5 8 12s.5-2.7 1.5-3.5c.69-.4 1.55-.5 2.5-.5s1.81.1 2.5.5c1 .8 1.5 2 1.5 3.5s-.5 2.7-1.5 3.5z" fill="#000" />
  </svg>
)

const SendGrid = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#1A82E2" />
    <path d="M8 8h4v4H8zM12 12h4v4h-4zM8 16h4v4H8zM16 8h4v4h-4zM4 12h4v4H4z" fill="#fff" fillOpacity=".9" />
  </svg>
)

const GoogleSheets = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#0F9D58" />
    <path d="M14 2v6h6" fill="#87CEAC" />
    <rect x="7" y="12" width="10" height="7" rx="0.5" fill="#fff" />
    <line x1="7" y1="15" x2="17" y2="15" stroke="#0F9D58" strokeWidth="0.7" />
    <line x1="11" y1="12" x2="11" y2="19" stroke="#0F9D58" strokeWidth="0.7" />
  </svg>
)

const Airtable = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11.53 2.34a1 1 0 0 1 .94 0l8.5 4.6c.58.31.58 1.15 0 1.46L12.47 13a1 1 0 0 1-.94 0l-8.5-4.6a.82.82 0 0 1 0-1.46l8.5-4.6z" fill="#FCB400" />
    <path d="M12.74 14.08l8.03-4.35c.6-.33 1.33.13 1.33.82v7.23c0 .37-.2.72-.53.89l-8.03 4.14c-.55.28-1.2-.13-1.2-.75v-7.08c0-.36.16-.7.4-.9z" fill="#18BFFF" />
    <path d="M11.26 14.08L3.23 9.73c-.6-.33-1.33.13-1.33.82v7.23c0 .37.2.72.53.89l8.03 4.14c.55.28 1.2-.13 1.2-.75v-7.08c0-.36-.16-.7-.4-.9z" fill="#F82B60" />
  </svg>
)

const Asana = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="6" r="4" fill="#F06A6A" />
    <circle cx="5.5" cy="16" r="4" fill="#F06A6A" />
    <circle cx="18.5" cy="16" r="4" fill="#F06A6A" />
  </svg>
)

const Linear = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#5E6AD2" />
    <path d="M4.5 16.88a8.75 8.75 0 0 0 2.62 2.62l10-10a8.75 8.75 0 0 0-2.62-2.62l-10 10z" fill="#fff" />
    <path d="M4.08 13.7A8.72 8.72 0 0 0 4 14.75c0 .46.04.92.1 1.36l6.13-6.13a8.75 8.75 0 0 0-1.36-.1c-.35 0-.71.03-1.05.08L4.08 13.7z" fill="#fff" fillOpacity=".7" />
    <path d="M19.92 10.3a8.72 8.72 0 0 0 .08-1.05c0-.46-.04-.92-.1-1.36l-6.13 6.13c.44.06.9.1 1.36.1.35 0 .71-.03 1.05-.08l3.74-3.74z" fill="#fff" fillOpacity=".7" />
  </svg>
)

const DocuSign = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#FFF" />
    <path d="M17.2 4H6.8C5.81 4 5 4.81 5 5.8v12.4c0 .99.81 1.8 1.8 1.8h10.4c.99 0 1.8-.81 1.8-1.8V5.8c0-.99-.81-1.8-1.8-1.8z" stroke="#463688" strokeWidth="1.5" />
    <path d="M8 12l2.5 2.5L16 9" stroke="#463688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Zendesk = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#03363D" />
    <path d="M11 6v8.47L5 18V6h6zm2 0c0 2.21 1.34 4 3 4s3-1.79 3-4h-6zm0 4.53V18h6V10.53l-6 3.47zM5 6c0 2.21 1.34 4 3 4s3-1.79 3-4H5z" fill="#fff" />
  </svg>
)

const WordPress = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#21759B" />
    <path d="M3.01 12c0 3.59 2.09 6.7 5.11 8.17L3.85 8.73A8.96 8.96 0 0 0 3.01 12zm15.07-.72c0-1.12-.4-1.9-.75-2.5-.46-.75-.89-1.38-.89-2.13 0-.84.63-1.61 1.53-1.61h.12a8.96 8.96 0 0 0-13.55.72h.79c1.28 0 3.26-.16 3.26-.16.66-.04.74.93.08 1.01 0 0-.66.08-1.4.12l4.46 13.26 2.68-8.03-1.91-5.23c-.66-.04-1.28-.12-1.28-.12-.66-.04-.58-1.05.08-1.01 0 0 2.02.16 3.22.16 1.28 0 3.26-.16 3.26-.16.66-.04.74.93.08 1.01 0 0-.67.08-1.4.12l4.42 13.14.74-2.95c.46-1.32.75-2.37.75-3.64z" fill="#fff" />
  </svg>
)

const GoogleAds = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 17.25l5.05-8.74 4.22 7.3L9.22 21 3 17.25z" fill="#FBBC04" />
    <path d="M21 17.25L15.95 8.51l-4.22 7.3L14.78 21 21 17.25z" fill="#4285F4" />
    <path d="M15.95 8.51L12 2 8.05 8.51h7.9z" fill="#34A853" />
    <circle cx="6.5" cy="18.5" r="2.5" fill="#EA4335" />
  </svg>
)

const FacebookAds = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#1877F2" />
    <path d="M16.67 15.19l.53-3.44h-3.3V9.5c0-.94.46-1.86 1.94-1.86h1.5V4.65S16.02 4.44 14.76 4.44c-2.63 0-4.35 1.59-4.35 4.47v2.62H7.35v3.44h3.06V24h3.77v-8.81h2.49z" fill="#fff" />
  </svg>
)

const Anthropic = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#181818" />
    <path d="M13.76 6h2.48L20 18h-2.48l-.87-2.83h-4.3L11.48 18H9l3.76-12h1zm.37 7.29l-1.5-4.88-1.5 4.88h3zm-7.37-1.67L4 18h2.48l2.76-6.38-2.48-6.38L4 11.62z" fill="#D4A27F" />
  </svg>
)

/* ── New service logos ── */

const CRM = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#FF6B35" />
    <path d="M7 8.5A1.5 1.5 0 0 1 8.5 7h7A1.5 1.5 0 0 1 17 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 15.5v-7z" stroke="#fff" strokeWidth="1.5" />
    <path d="M10 11h4M10 13.5h2.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const MongoDB = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12.55 2.13c-.18-.37-.41-.37-.55-.37s-.37 0-.55.37C10.17 4.57 7 9.36 7 13.5c0 3.04 2.24 5.5 5 5.5s5-2.46 5-5.5c0-4.14-3.17-8.93-4.45-11.37z" fill="#47A248" />
    <path d="M12 18.5c-.28 0-.5-.07-.5-.15v-3.7c0-.08.22-.15.5-.15s.5.07.5.15v3.7c0 .08-.22.15-.5.15z" fill="#B8C4C2" />
    <path d="M12.5 14.65v3.7c0 .08-.22.15-.5.15V13c1.5 1 .5 1.35.5 1.65z" fill="#6CAC48" />
  </svg>
)

const GoogleDrive = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8.19 3h7.62L22 14.34H8.19z" fill="#FBBC04" />
    <path d="M2 14.34l3.81 6.6h10.38L12.38 14.34H2z" fill="#4285F4" />
    <path d="M15.81 3L8.19 14.34 12 20.94 22 3H15.81z" fill="#34A853" />
  </svg>
)

const Calendly = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#006BFF" />
    <path d="M14.5 8.5a3.25 3.25 0 0 0-5.62 0M8 12.5a3.25 3.25 0 0 0 5.62 2.81" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="15" cy="12" r="1" fill="#fff" />
  </svg>
)

const Zoom = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#2D8CFF" />
    <rect x="3.5" y="7.5" width="12" height="9" rx="2" fill="#fff" />
    <path d="M16.5 10l4-2v8l-4-2V10z" fill="#fff" />
  </svg>
)

const Microsoft = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
    <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
    <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
    <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
  </svg>
)

const QuickBooks = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#2CA01C" />
    <path d="M8 9v6M8 9h2.5a2 2 0 0 1 0 4H8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 15V9M16 15h-2.5a2 2 0 0 1 0-4H16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Intercom = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#1F8DED" />
    <path d="M7 8v5.5M10 7v7M12 6.5v8M14 7v7M17 8v5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6 16.5c2.5 2 9.5 2 12 0" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const Dropbox = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7.5 3L2 6.75 7.5 10.5 13 6.75 7.5 3z" fill="#0061FE" />
    <path d="M16.5 3L11 6.75 16.5 10.5 22 6.75 16.5 3z" fill="#0061FE" />
    <path d="M2 14.25L7.5 18l5.5-3.75L7.5 10.5 2 14.25z" fill="#0061FE" />
    <path d="M16.5 10.5L11 14.25 16.5 18 22 14.25 16.5 10.5z" fill="#0061FE" />
    <path d="M7.5 19.2l5.5-3.75 5.5 3.75-5.5 3.75-5.5-3.75z" fill="#0061FE" fillOpacity=".6" />
  </svg>
)

const WhatsApp = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#25D366" />
    <path d="M12 4a8 8 0 0 0-6.83 12.14L4 20l3.97-1.14A8 8 0 1 0 12 4zm4.13 11.07c-.18.5-1.04.96-1.44 1-.37.04-.84.06-1.36-.08-.31-.09-.72-.21-1.24-.41-2.17-.95-3.58-3.14-3.69-3.29-.11-.14-.86-1.14-.86-2.18 0-1.04.54-1.55.74-1.76.18-.2.41-.25.54-.25h.38c.13 0 .3-.05.47.36.18.43.6 1.47.65 1.58.05.11.09.24.02.38-.07.15-.1.24-.2.36-.1.13-.22.29-.31.39-.1.1-.21.22-.09.42.12.2.52.86 1.12 1.39.77.68 1.42.89 1.62.99.2.1.31.09.43-.05.11-.15.49-.57.62-.77.13-.2.27-.16.44-.1.18.07 1.13.53 1.33.63.19.1.32.15.37.23.05.08.05.48-.13.97z" fill="#fff" />
  </svg>
)

const Instagram = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="6" fill="url(#ig_grad)" />
    <rect x="5" y="5" width="14" height="14" rx="4" stroke="#fff" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.5" stroke="#fff" strokeWidth="1.8" />
    <circle cx="17" cy="7" r="1.2" fill="#fff" />
    <defs><linearGradient id="ig_grad" x1="2" y1="22" x2="22" y2="2"><stop stopColor="#FEDA75" /><stop offset=".4" stopColor="#FA7E1E" /><stop offset=".6" stopColor="#D62976" /><stop offset=".8" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" /></linearGradient></defs>
  </svg>
)

const XTwitter = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#000" />
    <path d="M13.55 10.63L18.68 5h-1.22l-4.45 5.05L9.64 5H5.36l5.38 7.62L5.36 19h1.22l4.7-5.33L14.8 19h4.28l-5.53-8.37zm-1.66 1.88l-.55-.76L7.2 5.92h1.87l3.5 4.88.55.76 4.55 6.35h-1.87l-3.91-5.4z" fill="#fff" />
  </svg>
)

const TikTok = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#000" />
    <path d="M16.5 4.5v6.75c0 3.31-2.69 6-6 6a6 6 0 0 1-6-6 6 6 0 0 1 6-6v3a3 3 0 1 0 3 3V4.5h3z" fill="#FF0050" />
    <path d="M16.5 4.5v6.75c0 3.31-2.69 6-6 6a6 6 0 0 1-6-6 6 6 0 0 1 6-6v3a3 3 0 1 0 3 3V4.5h3z" fill="#00F2EA" fillOpacity=".5" />
  </svg>
)

const Plaid = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#111" />
    <rect x="5" y="5" width="4" height="4" rx="0.5" fill="#fff" />
    <rect x="10" y="5" width="4" height="4" rx="0.5" fill="#fff" />
    <rect x="15" y="5" width="4" height="4" rx="0.5" fill="#fff" />
    <rect x="5" y="10" width="4" height="4" rx="0.5" fill="#fff" />
    <rect x="10" y="10" width="4" height="4" rx="0.5" fill="#fff" />
    <rect x="5" y="15" width="4" height="4" rx="0.5" fill="#fff" />
    <rect x="10" y="15" width="4" height="4" rx="0.5" fill="#fff" />
    <rect x="15" y="15" width="4" height="4" rx="0.5" fill="#fff" />
  </svg>
)

const Square = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#006AFF" />
    <rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" />
    <path d="M10 10h4v4h-4z" fill="#006AFF" />
  </svg>
)

const Smartlead = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#7C3AED" />
    <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Zapier = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#FF4A00" />
    <path d="M14.83 9.17L12 12l2.83 2.83M9.17 9.17L12 12 9.17 14.83M12 6.5V12M12 12v5.5M17.5 12H12M12 12H6.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const MuleSoft = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#00A0DF" />
    <circle cx="12" cy="10" r="4" stroke="#fff" strokeWidth="1.8" />
    <path d="M8 17c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const Azure = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9.5 3l-6 13h4.5L13 3H9.5z" fill="#0089D6" />
    <path d="M14.5 7l-6 14h9L21 7h-6.5z" fill="#0089D6" fillOpacity=".7" />
  </svg>
)

const Pipedrive = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#017737" />
    <circle cx="12" cy="10" r="3" stroke="#fff" strokeWidth="2" />
    <path d="M12 13v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const LinkedIn = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path d="M8.5 10v6M8.5 7.5v.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 16v-3.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/* ── Export map ── */
export const SERVICE_LOGOS: Record<string, React.FC<P>> = {
  crm: CRM,
  stripe: Stripe,
  slack: Slack,
  github: GitHub,
  openai: OpenAI,
  discord: Discord,
  notion: Notion,
  twilio: Twilio,
  supabase: Supabase,
  shopify: Shopify,
  hubspot: HubSpot,
  gmail: Gmail,
  jira: Jira,
  trello: Trello,
  'google-calendar': GoogleCalendar,
  mailchimp: Mailchimp,
  sendgrid: SendGrid,
  'google-sheets': GoogleSheets,
  'google-drive': GoogleDrive,
  airtable: Airtable,
  asana: Asana,
  linear: Linear,
  docusign: DocuSign,
  zendesk: Zendesk,
  wordpress: WordPress,
  'google-ads': GoogleAds,
  'facebook-ads': FacebookAds,
  anthropic: Anthropic,
  mongodb: MongoDB,
  calendly: Calendly,
  zoom: Zoom,
  microsoft: Microsoft,
  quickbooks: QuickBooks,
  intercom: Intercom,
  dropbox: Dropbox,
  whatsapp: WhatsApp,
  instagram: Instagram,
  x: XTwitter,
  tiktok: TikTok,
  plaid: Plaid,
  square: Square,
  smartlead: Smartlead,
  zapier: Zapier,
  mulesoft: MuleSoft,
  azure: Azure,
  pipedrive: Pipedrive,
  linkedin: LinkedIn,
  'tiktok-ads': TikTok,
  'x-ads': XTwitter,
  'linkedin-ads': LinkedIn,
  'instagram-ads': Instagram,
}

/* ── All service metadata ── */
export const ALL_SERVICES = [
  { id: 'crm', name: 'CRM', category: 'CRM', color: '#FF6B35' },
  { id: 'stripe', name: 'Stripe', category: 'Payments', color: '#635BFF' },
  { id: 'shopify', name: 'Shopify', category: 'Payments', color: '#96BF48' },
  { id: 'square', name: 'Square', category: 'Payments', color: '#006AFF' },
  { id: 'plaid', name: 'Plaid', category: 'Payments', color: '#111111' },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Payments', color: '#2CA01C' },
  { id: 'slack', name: 'Slack', category: 'Communication', color: '#E01E5A' },
  { id: 'discord', name: 'Discord', category: 'Communication', color: '#5865F2' },
  { id: 'twilio', name: 'Twilio', category: 'Communication', color: '#F22F46' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Communication', color: '#25D366' },
  { id: 'intercom', name: 'Intercom', category: 'Communication', color: '#1F8DED' },
  { id: 'gmail', name: 'Gmail', category: 'Email', color: '#EA4335' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Email', color: '#FFE01B' },
  { id: 'sendgrid', name: 'SendGrid', category: 'Email', color: '#1A82E2' },
  { id: 'smartlead', name: 'Smartlead', category: 'Email', color: '#7C3AED' },
  { id: 'github', name: 'GitHub', category: 'Developer', color: '#f0f6fc' },
  { id: 'supabase', name: 'Supabase', category: 'Developer', color: '#3ECF8E' },
  { id: 'mongodb', name: 'MongoDB', category: 'Developer', color: '#47A248' },
  { id: 'openai', name: 'OpenAI', category: 'AI', color: '#10a37f' },
  { id: 'anthropic', name: 'Anthropic', category: 'AI', color: '#D4A27F' },
  { id: 'notion', name: 'Notion', category: 'Productivity', color: '#ffffff' },
  { id: 'airtable', name: 'Airtable', category: 'Productivity', color: '#18BFFF' },
  { id: 'dropbox', name: 'Dropbox', category: 'Productivity', color: '#0061FE' },
  { id: 'google-calendar', name: 'Google Calendar', category: 'Productivity', color: '#4285F4' },
  { id: 'google-sheets', name: 'Google Sheets', category: 'Productivity', color: '#0F9D58' },
  { id: 'google-drive', name: 'Google Drive', category: 'Productivity', color: '#4285F4' },
  { id: 'calendly', name: 'Calendly', category: 'Productivity', color: '#006BFF' },
  { id: 'zoom', name: 'Zoom', category: 'Communication', color: '#2D8CFF' },
  { id: 'jira', name: 'Jira', category: 'Project Mgmt', color: '#2684FF' },
  { id: 'trello', name: 'Trello', category: 'Project Mgmt', color: '#0079BF' },
  { id: 'asana', name: 'Asana', category: 'Project Mgmt', color: '#F06A6A' },
  { id: 'linear', name: 'Linear', category: 'Project Mgmt', color: '#5E6AD2' },
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', color: '#FF7A59' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'CRM', color: '#017737' },
  { id: 'docusign', name: 'DocuSign', category: 'Docs', color: '#463688' },
  { id: 'zendesk', name: 'Zendesk', category: 'Support', color: '#03363D' },
  { id: 'wordpress', name: 'WordPress', category: 'Websites', color: '#21759B' },
  { id: 'google-ads', name: 'Google Ads', category: 'Advertising', color: '#4285F4' },
  { id: 'facebook-ads', name: 'Facebook Ads', category: 'Advertising', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', category: 'Social', color: '#E1306C' },
  { id: 'instagram-ads', name: 'Instagram Ads', category: 'Advertising', color: '#E1306C' },
  { id: 'x', name: 'X', category: 'Social', color: '#000000' },
  { id: 'x-ads', name: 'X Ads', category: 'Advertising', color: '#000000' },
  { id: 'tiktok', name: 'TikTok', category: 'Social', color: '#FF0050' },
  { id: 'tiktok-ads', name: 'TikTok Ads', category: 'Advertising', color: '#FF0050' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', color: '#0A66C2' },
  { id: 'linkedin-ads', name: 'LinkedIn Ads', category: 'Advertising', color: '#0A66C2' },
  { id: 'microsoft', name: 'Microsoft', category: 'Cloud', color: '#00A4EF' },
  { id: 'azure', name: 'Azure', category: 'Cloud', color: '#0089D6' },
  { id: 'zapier', name: 'Zapier', category: 'Automation', color: '#FF4A00' },
  { id: 'mulesoft', name: 'MuleSoft', category: 'Automation', color: '#00A0DF' },
  { id: 'vault', name: '0nVault', category: '0n Platform', color: '#7ed957' },
  { id: 'vault-container', name: 'Vault Container', category: '0n Platform', color: '#00d4ff' },
  { id: 'deed', name: 'Digital Deed', category: '0n Platform', color: '#a78bfa' },
  { id: 'engine', name: '0n Engine', category: '0n Platform', color: '#ff6b35' },
  { id: 'app-builder', name: 'App Builder', category: '0n Platform', color: '#7ed957' },
]

/* ── Convenience component ── */
export default function ServiceIcon({ id, size = 20, className }: P & { id: string }) {
  const Logo = SERVICE_LOGOS[id]
  if (!Logo) return null
  return <Logo size={size} className={className} />
}
