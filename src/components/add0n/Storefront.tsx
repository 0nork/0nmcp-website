// components/add0n/Storefront.tsx
// Main storefront UI rendered inside the CRM iframe.
// Shows product grid, purchase state, recent build history.

'use client'

import { useState }     from 'react'
import ProductCard      from './ProductCard'
import PurchaseModal    from './PurchaseModal'
import BuildTriggerForm from './BuildTriggerForm'

interface StorefrontProps {
  state: {
    location:  { locationId: string; companyId: string; userId: string }
    listings:  any[]
    history:   any[]
  }
}

export default function Storefront({ state }: StorefrontProps) {
  const [activeTab,      setActiveTab]      = useState<'store' | 'builds'>('store')
  const [selectedListing, setSelectedListing] = useState<any | null>(null)
  const [buildTarget,    setBuildTarget]    = useState<any | null>(null)

  const categories = [...new Set(state.listings.map(l => l.category))]

  return (
    <div className="storefront">
      {/* Header */}
      <div className="sf-header">
        <div className="sf-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://0nmcp.com/_next/static/media/0n-logo.png" alt="0n" height={28} />
        </div>
        <div className="sf-title">
          <span className="sf-app-name">Add0n</span>
          <span className="sf-app-sub">Rocket+CRM powered by 0nMCP</span>
        </div>
        <div className="sf-tabs">
          <button className={activeTab === 'store'  ? 'active' : ''} onClick={() => setActiveTab('store')}>Store</button>
          <button className={activeTab === 'builds' ? 'active' : ''} onClick={() => setActiveTab('builds')}>Builds</button>
        </div>
      </div>

      {/* Store tab */}
      {activeTab === 'store' && (
        <div className="sf-body">
          {categories.map(cat => {
            const catListings = state.listings.filter(l => l.category === cat)
            return (
              <div key={cat} className="sf-category">
                <h2 className="sf-category-title">{cat}</h2>
                <div className="sf-grid">
                  {catListings.map(listing => (
                    <ProductCard
                      key={listing.id}
                      listing={listing}
                      onBuy={() => setSelectedListing(listing)}
                      onUse={() => setBuildTarget(listing)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Builds tab */}
      {activeTab === 'builds' && (
        <div className="sf-body">
          <h2 className="sf-category-title">Recent builds</h2>
          {state.history.length === 0 && (
            <p style={{ color:'#7a8694', fontSize:14 }}>No builds yet. Purchase a product to get started.</p>
          )}
          {state.history.map(h => (
            <div key={h.id} className="sf-history-row">
              <span className={`sf-status sf-status-${h.status}`}>{h.status}</span>
              <span className="sf-history-name">{h.business_name ?? '\u2014'}</span>
              <span className="sf-history-action">{h.action}</span>
              <span className="sf-history-date">{new Date(h.triggered_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Purchase modal */}
      {selectedListing && (
        <PurchaseModal
          listing={selectedListing}
          locationId={state.location.locationId}
          onClose={() => setSelectedListing(null)}
          onComplete={() => { setSelectedListing(null); window.location.reload() }}
        />
      )}

      {/* Build trigger drawer */}
      {buildTarget && (
        <div className="sf-drawer-overlay" onClick={() => setBuildTarget(null)}>
          <div className="sf-drawer" onClick={e => e.stopPropagation()}>
            <div className="sf-drawer-header">
              <span>{buildTarget.icon_emoji} {buildTarget.title}</span>
              <button onClick={() => setBuildTarget(null)}>{'\u2715'}</button>
            </div>
            <BuildTriggerForm
              action={buildTarget.action_key ?? 'build_website'}
              locationId={state.location.locationId}
            />
          </div>
        </div>
      )}

      <style>{`
        .storefront { display:flex; flex-direction:column; height:100vh; background:#080B0F; overflow:hidden; }
        .sf-header { display:flex; align-items:center; gap:16px; padding:14px 20px; background:#0E1117; border-bottom:1px solid #1e2533; flex-shrink:0; }
        .sf-logo img { display:block; }
        .sf-title { flex:1; }
        .sf-app-name { display:block; font-family:'Barlow',sans-serif; font-weight:900; font-size:16px; color:#e2e8f0; line-height:1.1; }
        .sf-app-sub  { display:block; font-size:11px; color:#7a8694; font-family:'Space Grotesk',sans-serif; }
        .sf-tabs { display:flex; gap:4px; }
        .sf-tabs button { background:none; border:1px solid transparent; border-radius:6px; color:#7a8694; cursor:pointer; font-family:'Space Grotesk',sans-serif; font-size:13px; padding:6px 14px; }
        .sf-tabs button.active { border-color:#1e2533; background:#080B0F; color:#e2e8f0; }
        .sf-body { flex:1; overflow-y:auto; padding:20px; }
        .sf-category { margin-bottom:32px; }
        .sf-category-title { font-family:'Barlow',sans-serif; font-weight:900; font-size:14px; color:#7a8694; letter-spacing:.08em; text-transform:uppercase; margin:0 0 14px; }
        .sf-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
        .sf-history-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #1e2533; font-size:13px; }
        .sf-status { padding:3px 8px; border-radius:4px; font-size:11px; font-family:'JetBrains Mono',monospace; }
        .sf-status-complete  { background:rgba(110,224,90,.1); color:#6EE05A; }
        .sf-status-triggered { background:rgba(100,160,255,.1); color:#64A0FF; }
        .sf-status-fallback  { background:rgba(255,180,50,.1); color:#FFB432; }
        .sf-status-error     { background:rgba(255,80,80,.1); color:#ff6b6b; }
        .sf-history-name  { flex:1; color:#e2e8f0; font-family:'Space Grotesk',sans-serif; }
        .sf-history-action{ color:#7a8694; font-family:'JetBrains Mono',monospace; font-size:11px; }
        .sf-history-date  { color:#7a8694; font-size:12px; white-space:nowrap; }
        .sf-drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; justify-content:flex-end; }
        .sf-drawer { width:520px; max-width:100vw; background:#0E1117; border-left:1px solid #1e2533; display:flex; flex-direction:column; overflow-y:auto; }
        .sf-drawer-header { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #1e2533; font-family:'Space Grotesk',sans-serif; font-weight:600; color:#e2e8f0; }
        .sf-drawer-header button { background:none; border:none; color:#7a8694; cursor:pointer; font-size:16px; }
      `}</style>
    </div>
  )
}
