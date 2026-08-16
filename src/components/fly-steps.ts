/**
 * Stagger delays for FlyIn — deliberately NOT in FlyIn.tsx.
 *
 * FlyIn.tsx is a 'use client' module. A plain array exported from a client
 * module and read by a SERVER component does not come back as an array: Next
 * turns every export into a client reference, so `STEP[0]` evaluates to
 * undefined on the server. It fails silently — no error, no warning, just
 * `delayClass={undefined}` on every element and a page where twenty things
 * animate simultaneously instead of one after another.
 *
 * That is the whole reason this file exists. Values a server component reads
 * live in a plain module; only the component itself is client.
 *
 * The classes must also be LITERAL. Tailwind scans source text, so a computed
 * `[transition-delay:${n}ms]` emits no class at all — the same silent failure
 * from the other direction.
 */
export const STEP = [
  '[transition-delay:0ms]',
  '[transition-delay:70ms]',
  '[transition-delay:140ms]',
  '[transition-delay:210ms]',
  '[transition-delay:280ms]',
  '[transition-delay:350ms]',
  '[transition-delay:420ms]',
  '[transition-delay:490ms]',
  '[transition-delay:560ms]',
  '[transition-delay:630ms]',
  '[transition-delay:700ms]',
  '[transition-delay:770ms]',
] as const
