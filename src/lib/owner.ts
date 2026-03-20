/**
 * Owner utilities — mike@rocketopp.com superadmin bypass
 *
 * - isOwnerEmail(): check if email is the superadmin
 * - OWNER_COUPON: 100% off coupon applied to all owner purchases
 * - getOwnerDiscount(): returns Stripe coupon params for checkout
 */

const OWNER_EMAILS = new Set(['mike@rocketopp.com'])

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return OWNER_EMAILS.has(email.toLowerCase().trim())
}

/**
 * Returns Stripe checkout discount params for owner accounts.
 * Creates a 100% coupon on the fly if needed, or uses a fixed coupon ID.
 */
export function getOwnerCheckoutParams(email: string): Record<string, unknown> | null {
  if (!isOwnerEmail(email)) return null

  return {
    discounts: [{
      coupon: process.env.STRIPE_OWNER_COUPON_ID || undefined,
    }],
    // If no coupon exists, use allow_promotion_codes so owner can enter one manually
    ...(process.env.STRIPE_OWNER_COUPON_ID ? {} : { allow_promotion_codes: true }),
  }
}

/**
 * Check if a user should get full access regardless of plan.
 */
export function hasOwnerBypass(email: string | null | undefined): boolean {
  return isOwnerEmail(email)
}
