// components/add0n/ProductCard.tsx

'use client'

interface ProductCardProps {
  listing: {
    id:          string
    slug:        string
    title:       string
    tagline:     string
    price_cents: number
    icon_emoji:  string
    is_featured: boolean
    purchased:   boolean
    action_key:  string | null
  }
  onBuy: () => void
  onUse: () => void
}

export default function ProductCard({ listing, onBuy, onUse }: ProductCardProps) {
  const price = listing.price_cents === 0
    ? 'Included'
    : `$${(listing.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

  return (
    <div className={`product-card ${listing.is_featured ? 'featured' : ''}`}>
      {listing.is_featured && <div className="featured-badge">Featured</div>}
      <div className="pc-icon">{listing.icon_emoji}</div>
      <h3 className="pc-title">{listing.title}</h3>
      <p className="pc-tagline">{listing.tagline}</p>
      <div className="pc-footer">
        <span className="pc-price">{price}</span>
        {listing.purchased ? (
          <button className="pc-btn use" onClick={onUse}>Use &rarr;</button>
        ) : (
          <button className="pc-btn buy" onClick={listing.price_cents === 0 ? onUse : onBuy}>
            {listing.price_cents === 0 ? 'Use \u2192' : `Buy ${price}`}
          </button>
        )}
      </div>
      <style>{`
        .product-card { background:#0E1117; border:1px solid #1e2533; border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:8px; position:relative; transition:border-color .15s; }
        .product-card:hover { border-color:#2a3547; }
        .product-card.featured { border-color:rgba(110,224,90,.3); }
        .featured-badge { position:absolute; top:12px; right:12px; background:rgba(110,224,90,.12); border:1px solid rgba(110,224,90,.3); border-radius:4px; color:#6EE05A; font-size:10px; font-family:'Space Grotesk',sans-serif; font-weight:600; letter-spacing:.06em; padding:2px 8px; text-transform:uppercase; }
        .pc-icon { font-size:28px; line-height:1; }
        .pc-title { font-family:'Barlow',sans-serif; font-weight:900; font-size:16px; color:#e2e8f0; margin:0; }
        .pc-tagline { font-size:13px; color:#7a8694; font-family:'Space Grotesk',sans-serif; margin:0; line-height:1.5; flex:1; }
        .pc-footer { display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
        .pc-price { font-family:'JetBrains Mono',monospace; font-size:14px; color:#e2e8f0; font-weight:600; }
        .pc-btn { border:none; border-radius:6px; cursor:pointer; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600; padding:7px 16px; }
        .pc-btn.use { background:rgba(110,224,90,.12); border:1px solid rgba(110,224,90,.35); color:#6EE05A; }
        .pc-btn.buy { background:#6EE05A; color:#080B0F; }
        .pc-btn:hover { opacity:.85; }
      `}</style>
    </div>
  )
}
