/**
 * 0n Console — Theme Mapping
 * Maps the 0nmcp.com design system CSS variables to a consumable
 * theme object for console components.
 *
 * The 0nmcp.com design system (defined in globals.css) uses:
 *   --bg-primary:       #0a0a0f
 *   --bg-secondary:     #111118
 *   --bg-tertiary:      #16161f
 *   --bg-card:          #1a1a25
 *   --accent:           #00ff88  (green)
 *   --accent-dim:       #00cc6a
 *   --accent-glow:      rgba(0, 255, 136, 0.15)
 *   --accent-secondary: #00d4ff  (cyan)
 *   --text-primary:     #e8e8ef
 *   --text-secondary:   #8888a0
 *   --text-muted:       #55556a
 *   --border:           #2a2a3a
 *   --border-hover:     #3a3a50
 *   --font-display:     'Instrument Sans', sans-serif
 *   --font-mono:        'JetBrains Mono', monospace
 *
 * Components should use THEME.xxx or var() references so everything
 * stays consistent with the global design system.
 */

// ─── Theme Object (CSS var references) ──────────────────────────

export const THEME = {
  // Backgrounds
  bg: "var(--bg-primary)",
  bgSecondary: "var(--bg-secondary)",
  bgTertiary: "var(--bg-tertiary)",
  bgCard: "var(--bg-card)",

  // Text
  text: "var(--text-primary)",
  textDim: "var(--text-secondary)",
  textMuted: "var(--text-muted)",

  // Accent
  accent: "var(--accent)",
  accentDim: "var(--accent-dim)",
  accentGlow: "var(--accent-glow)",
  accentSecondary: "var(--accent-secondary)",

  // Borders
  border: "var(--border)",
  borderHover: "var(--border-hover)",

  // Fonts
  fontDisplay: "var(--font-display)",
  fontMono: "var(--font-mono)",

  // Status colors (raw hex for direct use)
  green: "#00ff88",
  greenDim: "#00cc6a",
  red: "#ff4444",
  redDim: "#cc3333",
  amber: "#ffbb33",
  amberDim: "#cc9922",
  cyan: "#00d4ff",
  cyanDim: "#00aacc",
} as const;

// ─── Raw Hex Values (for non-CSS contexts) ──────────────────────

export const HEX = {
  bgPrimary: "#0a0a0f",
  bgSecondary: "#111118",
  bgTertiary: "#16161f",
  bgCard: "#1a1a25",
  accent: "#00ff88",
  accentDim: "#00cc6a",
  accentSecondary: "#00d4ff",
  textPrimary: "#e8e8ef",
  textSecondary: "#8888a0",
  textMuted: "#55556a",
  border: "#2a2a3a",
  borderHover: "#3a3a50",
} as const;

// ─── Gradient Utilities ─────────────────────────────────────────

export const GRADIENTS = {
  /** Primary accent gradient (green to cyan) */
  primary: "linear-gradient(135deg, #00ff88, #00d4ff)",

  /** Soft glow version of primary gradient */
  primarySoft: "linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 212, 255, 0.15))",

  /** Accent glow for hover states */
  glow: "linear-gradient(135deg, rgba(0, 255, 136, 0.25), rgba(0, 212, 255, 0.1))",

  /** Card hover gradient overlay */
  cardHover: "linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 212, 255, 0.03))",

  /** Radial glow for background effects */
  radialGlow: "radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.08), transparent 70%)",

  /** Top-down fade for headers */
  headerFade: "linear-gradient(180deg, rgba(0, 255, 136, 0.05) 0%, transparent 100%)",

  /** Success state */
  success: "linear-gradient(135deg, #00ff88, #00cc6a)",

  /** Error state */
  error: "linear-gradient(135deg, #ff4444, #cc3333)",

  /** Warning state */
  warning: "linear-gradient(135deg, #ffbb33, #cc9922)",

  /** Text gradient for accent headings (use with background-clip: text) */
  textAccent: "linear-gradient(135deg, #00ff88, #00d4ff)",
} as const;

// ─── Shadow Utilities ───────────────────────────────────────────

export const SHADOWS = {
  /** Subtle card shadow */
  card: "0 2px 8px rgba(0, 0, 0, 0.3)",

  /** Elevated card shadow */
  cardHover: "0 4px 16px rgba(0, 0, 0, 0.4)",

  /** Accent glow shadow */
  glow: "0 0 20px rgba(0, 255, 136, 0.15)",

  /** Strong accent glow */
  glowStrong: "0 0 30px rgba(0, 255, 136, 0.25)",

  /** Inset glow for focused inputs */
  inputFocus: "0 0 0 2px rgba(0, 255, 136, 0.2), inset 0 0 0 1px rgba(0, 255, 136, 0.3)",

  /** Cyan accent glow */
  cyanGlow: "0 0 20px rgba(0, 212, 255, 0.15)",
} as const;

// ─── Tailwind Class Helpers ─────────────────────────────────────

/**
 * Common Tailwind class combinations for console components.
 * These map to the 0nmcp.com design system using CSS variables
 * via arbitrary value syntax.
 */
export const TW = {
  /** Standard card container */
  card: "rounded-xl border border-[var(--border)] bg-[var(--bg-card)]",

  /** Card with hover effect */
  cardHover: "rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-all duration-200",

  /** Primary button */
  btnPrimary: "rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] font-semibold px-4 py-2 hover:opacity-90 transition-opacity",

  /** Ghost/outline button */
  btnGhost: "rounded-lg border border-[var(--border)] text-[var(--text-secondary)] px-4 py-2 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200",

  /** Text input */
  input: "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-3 py-2 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors",

  /** Badge / chip */
  badge: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)]",

  /** Accent badge */
  badgeAccent: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/20",

  /** Monospace text */
  mono: "font-[var(--font-mono)]",

  /** Muted text */
  muted: "text-[var(--text-muted)]",

  /** Secondary text */
  dim: "text-[var(--text-secondary)]",
} as const;

export type ThemeKey = keyof typeof THEME;
export type GradientKey = keyof typeof GRADIENTS;
export type ShadowKey = keyof typeof SHADOWS;
