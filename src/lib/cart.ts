/**
 * 0n Console — Shopping Cart System
 * localStorage-backed cart with multi-item support
 */

export interface CartItem {
  listingId: string
  name: string
  price: number        // in cents
  quantity: number
  vendorId: string | null
  vendorName: string | null
  image: string | null
  slug: string
  category: string
}

const CART_KEY = '0nmcp-cart'

/** Get all cart items */
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Add an item to the cart (or increment quantity if already present) */
export function addToCart(item: Omit<CartItem, 'quantity'>, qty = 1): CartItem[] {
  const cart = getCart()
  const idx = cart.findIndex(c => c.listingId === item.listingId)
  if (idx >= 0) {
    cart[idx].quantity += qty
  } else {
    cart.push({ ...item, quantity: qty })
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new CustomEvent('cart-updated'))
  return cart
}

/** Remove an item from the cart entirely */
export function removeFromCart(listingId: string): CartItem[] {
  let cart = getCart()
  cart = cart.filter(c => c.listingId !== listingId)
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new CustomEvent('cart-updated'))
  return cart
}

/** Update item quantity (removes if qty <= 0) */
export function updateCartQuantity(listingId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeFromCart(listingId)
  const cart = getCart()
  const idx = cart.findIndex(c => c.listingId === listingId)
  if (idx >= 0) {
    cart[idx].quantity = quantity
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('cart-updated'))
  }
  return cart
}

/** Clear the entire cart */
export function clearCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_KEY)
  window.dispatchEvent(new CustomEvent('cart-updated'))
}

/** Get the cart total in cents */
export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/** Get the total number of items */
export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}

/** Check if a listing is in the cart */
export function isInCart(listingId: string): boolean {
  return getCart().some(c => c.listingId === listingId)
}
