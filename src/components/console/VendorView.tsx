'use client'

import { useEffect, useState, useCallback } from 'react'
import type { VendorProfile, VendorTransaction, VendorPayout } from './StoreTypes'
import { useVendor, type VendorListing, type VendorStatus } from '@/lib/console/useVendor'
import { VendorListingForm } from './VendorListingForm'

// ── Props ──

interface VendorViewProps {
  vendor: VendorProfile | null
  listings: VendorListing[]
  transactions: VendorTransaction[]
  payouts: VendorPayout[]
  loading: boolean
  vendorStatus: VendorStatus
  onFetchDashboard: () => void
  onFetchListings: (status?: string) => void
  onCreateListing: (data: {
    title: string
    description: string
    category: string
    asset_type: string
    price: number
    tags: string[]
    services: string[]
    cover_image_url?: string
    status?: 'draft' | 'active'
  }) => Promise<{ listing?: VendorListing; error?: string }>
  onUpdateListing: (id: string, data: Partial<{
    title: string
    description: string
    category: string
    asset_type: string
    price: number
    tags: string[]
    services: string[]
    cover_image_url: string
  }>) => Promise<{ listing?: VendorListing; error?: string }>
  onDeleteListing: (id: string) => Promise<{ error?: string }>
  onPublishListing: (id: string) => Promise<{ error?: string }>
  onUnpublishListing: (id: string) => Promise<{ error?: string }>
  onApplyAsVendor: (businessName: string, businessType: string) => Promise<{ error?: string }>
  onGetOnboardingLink: () => Promise<{ url?: string; error?: string }>
  onGetDashboardLink: () => Promise<{ url?: string; error?: string }>
}

// ── Color constants (kept for dynamic CSS where Tailwind can't be used) ──

const ACCENT = '#6EE05A'
const ACCENT_GLOW = 'rgba(110, 224, 90, 0.12)'
const ACCENT_BORDER = 'rgba(110, 224, 90, 0.3)'
const CARD_BORDER = '#222222'
const CARD_BORDER_HOVER = '#2D3748'
const ORANGE = '#ff6b35'
const CYAN = '#00d4ff'
const PURPLE = '#a78bfa'
const YELLOW = '#f59e0b'
const RED = '#ef4444'

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  active: { bg: 'rgba(126,217,87,0.12)', color: '#6EE05A', border: 'rgba(126,217,87,0.3)' },
  draft: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  archived: { bg: 'var(--border)', color: 'rgba(255,255,255,0.4)', border: 'var(--border)' },
}

const ASSET_TYPE_COLORS: Record<string, string> = {
  workflow: '#6EE05A',
  landing_page: '#6366f1',
  email: '#06b6d4',
  form: '#f59e0b',
  product_page: '#ec4899',
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  workflow: 'Workflow',
  landing_page: 'Landing Page',
  email: 'Email',
  form: 'Form',
  product_page: 'Product Page',
}

// ── Component ──

function VendorViewInner({
  vendor,
  listings,
  transactions,
  payouts,
  loading,
  vendorStatus,
  onFetchDashboard,
  onFetchListings,
  onCreateListing,
  onUpdateListing,
  onDeleteListing,
  onPublishListing,
  onUnpublishListing,
  onApplyAsVendor,
  onGetOnboardingLink,
  onGetDashboardLink,
}: VendorViewProps) {
  // ── Local State ──
  const [activeTab, setActiveTab] = useState<'listings' | 'earnings' | 'transactions' | 'payouts'>('listings')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('individual')
  const [applyError, setApplyError] = useState<string | null>(null)
  const [applyLoading, setApplyLoading] = useState(false)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showListingForm, setShowListingForm] = useState(false)
  const [editingListing, setEditingListing] = useState<VendorListing | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    onFetchDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (vendorStatus === 'active') {
      onFetchListings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorStatus])

  // ── Handlers ──

  const handleApply = useCallback(async () => {
    if (!businessName.trim()) {
      setApplyError('Business name is required')
      return
    }
    setApplyLoading(true)
    setApplyError(null)
    const result = await onApplyAsVendor(businessName.trim(), businessType)
    setApplyLoading(false)
    if (result.error) setApplyError(result.error)
  }, [businessName, businessType, onApplyAsVendor])

  const handleStartOnboarding = useCallback(async () => {
    setOnboardingLoading(true)
    const result = await onGetOnboardingLink()
    setOnboardingLoading(false)
    if (result.url) {
      window.location.href = result.url
    } else if (result.error) {
      setActionError(result.error)
    }
  }, [onGetOnboardingLink])

  const handleOpenStripeDashboard = useCallback(async () => {
    const result = await onGetDashboardLink()
    if (result.url) {
      window.open(result.url, '_blank')
    }
  }, [onGetDashboardLink])

  const handlePublishToggle = useCallback(async (listing: VendorListing) => {
    setMenuOpen(null)
    const result = listing.status === 'active'
      ? await onUnpublishListing(listing.id)
      : await onPublishListing(listing.id)
    if (result.error) setActionError(result.error)
  }, [onPublishListing, onUnpublishListing])

  const handleDelete = useCallback(async (id: string) => {
    setMenuOpen(null)
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    const result = await onDeleteListing(id)
    if (result.error) setActionError(result.error)
  }, [onDeleteListing])

  const handleEdit = useCallback((listing: VendorListing) => {
    setMenuOpen(null)
    setEditingListing(listing)
    setShowListingForm(true)
  }, [])

  const handleFormSubmit = useCallback(async (data: {
    title: string
    description: string
    category: string
    asset_type: string
    price: number
    tags: string[]
    services: string[]
    cover_image_url?: string
    status?: 'draft' | 'active'
  }) => {
    if (editingListing) {
      const result = await onUpdateListing(editingListing.id, data)
      if (result.error) {
        setActionError(result.error)
        return
      }
    } else {
      const result = await onCreateListing(data)
      if (result.error) {
        setActionError(result.error)
        return
      }
    }
    setShowListingForm(false)
    setEditingListing(null)
  }, [editingListing, onCreateListing, onUpdateListing])

  const handleFormClose = useCallback(() => {
    setShowListingForm(false)
    setEditingListing(null)
  }, [])

  // ── Loading ──

  if (loading && !vendor) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-6 h-6 rounded-full border-2 border-t-[#6EE05A] animate-spin"
          style={{ borderColor: `${CARD_BORDER} ${CARD_BORDER} ${CARD_BORDER} ${ACCENT}` }}
        />
        <style>{`@keyframes vendor-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── State 1: Not a Vendor ──

  if (vendorStatus === 'not_vendor') {
    return (
      <div className="p-6 max-w-[720px] mx-auto animate-[vendor-fade-in_0.3s_ease]">
        {/* Hero */}
        <div
          className="text-center py-12 px-6 rounded-2xl mb-8 border"
          style={{
            background: `linear-gradient(145deg, ${ACCENT_GLOW} 0%, #111827 60%, #0B0F19 100%)`,
            borderColor: ACCENT_BORDER,
          }}
        >
          <div
            className="w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-4 border"
            style={{ backgroundColor: ACCENT_GLOW, borderColor: ACCENT_BORDER }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>

          <h2 className="text-[26px] font-extrabold text-white mb-2 tracking-[-0.02em]">
            Sell on the 0nMCP Marketplace
          </h2>
          <p className="text-[15px] text-white/70 max-w-[460px] mx-auto mb-8 leading-[1.6]">
            Create and sell workflows, templates, landing pages, and more. Earn 80% of every sale.
          </p>

          {/* Apply form */}
          <div className="max-w-[360px] mx-auto">
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business Name"
              className="w-full px-3.5 py-2.5 rounded-[10px] text-white text-[14px] outline-none mb-2.5 box-border"
              style={{ backgroundColor: 'var(--border)', border: `1px solid ${CARD_BORDER}` }}
              onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
              onBlur={(e) => { e.currentTarget.style.borderColor = CARD_BORDER }}
            />
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] text-white text-[14px] outline-none mb-4 box-border cursor-pointer"
              style={{ backgroundColor: 'var(--border)', border: `1px solid ${CARD_BORDER}` }}
            >
              <option value="individual" style={{ backgroundColor: 'var(--bg-primary)' }}>Individual</option>
              <option value="company" style={{ backgroundColor: 'var(--bg-primary)' }}>Company</option>
            </select>

            {applyError && (
              <p className="text-[13px] text-[#ef4444] mb-3">{applyError}</p>
            )}

            <button
              onClick={handleApply}
              disabled={applyLoading}
              className={[
                'w-full py-3 rounded-[10px] border-none text-[#000] text-[14px] font-bold transition-opacity duration-200',
                applyLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer',
              ].join(' ')}
              style={{ backgroundColor: ACCENT }}
            >
              {applyLoading ? 'Submitting...' : 'Apply Now'}
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '85%', title: '85% Revenue Share', desc: 'Keep the majority of every sale. Starting at just 15% platform fee.' },
            { icon: '$', title: 'Stripe Express Payouts', desc: 'Automatic payouts to your bank account. Stripe handles everything.' },
            { icon: '~', title: 'Global Marketplace', desc: 'Reach thousands of AI engineers looking for premium workflows.' },
          ].map((feat) => (
            <div
              key={feat.title}
              className="px-4 py-5 rounded-xl text-center"
              style={{ backgroundColor: '#111827', border: `1px solid ${CARD_BORDER}` }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center mx-auto mb-3 text-[18px] font-extrabold font-mono border"
                style={{ backgroundColor: ACCENT_GLOW, color: ACCENT, borderColor: ACCENT_BORDER }}
              >
                {feat.icon}
              </div>
              <h4 className="text-[13px] font-bold text-white mb-1.5">{feat.title}</h4>
              <p className="text-[11px] text-white/40 leading-[1.5] m-0">{feat.desc}</p>
            </div>
          ))}
        </div>

        <style>{vendorAnimations}</style>
      </div>
    )
  }

  // ── State 2: Applied (Pending Approval) ──

  if (vendorStatus === 'applied') {
    return (
      <div className="p-6 max-w-[560px] mx-auto animate-[vendor-fade-in_0.3s_ease]">
        <div
          className="py-10 px-8 rounded-2xl text-center border"
          style={{ backgroundColor: '#111827', borderColor: CARD_BORDER }}
        >
          <div className="w-14 h-14 rounded-[14px] bg-[rgba(245,158,11,0.12)] flex items-center justify-center mx-auto mb-5 border border-[rgba(245,158,11,0.3)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={YELLOW} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2 className="text-[22px] font-extrabold text-white mb-2 tracking-[-0.02em]">
            Application Under Review
          </h2>
          <p className="text-[14px] text-white/70 leading-[1.6] max-w-[400px] mx-auto mb-6">
            Your vendor application is being reviewed by our team. This typically takes 1-2 business days.
          </p>

          <div
            className="py-4 px-5 rounded-[10px] border text-left"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: CARD_BORDER }}
          >
            <p className="text-[13px] font-semibold text-white mb-3">
              What happens next:
            </p>
            {[
              'We review your application details',
              'Your Stripe Express account is created',
              'You complete identity verification with Stripe',
              'Your vendor storefront goes live',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-2">
                <span
                  className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-px"
                  style={{ backgroundColor: 'var(--border)', color: 'rgba(255,255,255,0.4)' }}
                >
                  {i + 1}
                </span>
                <span className="text-[13px] text-white/70 leading-[1.5]">
                  {step}
                </span>
              </div>
            ))}
          </div>

          {vendor?.business_name && (
            <p className="text-[12px] text-white/40 mt-4">
              Applied as <span className="text-white/70 font-semibold">{vendor.business_name}</span>
            </p>
          )}
        </div>

        <style>{vendorAnimations}</style>
      </div>
    )
  }

  // ── State 3: Approved, Needs Stripe Onboarding ──

  if (vendorStatus === 'approved_needs_onboarding') {
    return (
      <div className="p-6 max-w-[560px] mx-auto animate-[vendor-fade-in_0.3s_ease]">
        <div
          className="py-10 px-8 rounded-2xl text-center border"
          style={{ backgroundColor: '#111827', borderColor: ACCENT_BORDER }}
        >
          <div
            className="w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-5 border"
            style={{ backgroundColor: ACCENT_GLOW, borderColor: ACCENT_BORDER }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h2 className="text-[22px] font-extrabold text-white mb-2 tracking-[-0.02em]">
            Complete Stripe Setup
          </h2>
          <p className="text-[14px] text-white/70 leading-[1.6] max-w-[400px] mx-auto mb-6">
            Your application has been approved. Complete your Stripe Express onboarding to start receiving payments. Stripe securely handles identity verification, tax information, and banking details.
          </p>

          {actionError && (
            <p className="text-[13px] text-[#ef4444] mb-4">{actionError}</p>
          )}

          <button
            onClick={handleStartOnboarding}
            disabled={onboardingLoading}
            className={[
              'px-8 py-3 rounded-[10px] border-none text-[#000] text-[14px] font-bold transition-opacity duration-200',
              onboardingLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer',
            ].join(' ')}
            style={{ backgroundColor: ACCENT }}
          >
            {onboardingLoading ? 'Redirecting to Stripe...' : 'Start Stripe Onboarding'}
          </button>

          <p className="text-[11px] text-white/40 mt-4 leading-[1.5]">
            You will be redirected to Stripe to complete verification.<br />
            This process typically takes 5-10 minutes.
          </p>
        </div>

        <style>{vendorAnimations}</style>
      </div>
    )
  }

  // ── State 4: Fully Onboarded — Full Dashboard ──

  const tierFee = vendor?.application_fee_percent ?? 15
  const tierLabel = tierFee <= 5 ? 'Partner' : tierFee <= 10 ? 'Top Seller' : 'Contributor'
  const tierColor = tierFee <= 5 ? ACCENT : tierFee <= 10 ? CYAN : ORANGE

  const totalRevenueDollars = (vendor?.total_revenue_cents ?? 0) / 100
  const pendingPayoutsCents = transactions
    .filter((t) => t.status === 'pending' || t.status === 'processing')
    .reduce((sum, t) => sum + t.vendor_payout_cents, 0)
  const totalPlatformFees = transactions.reduce((sum, t) => sum + t.platform_fee_cents, 0) / 100
  const totalSales = vendor?.total_sales ?? 0

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'listings', label: 'My Listings' },
    { key: 'earnings', label: 'Earnings' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'payouts', label: 'Payouts' },
  ]

  return (
    <div className="p-6 max-w-[960px] mx-auto animate-[vendor-fade-in_0.3s_ease]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-extrabold text-white tracking-[-0.02em] flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Vendor Dashboard
          </h2>
          <p className="text-[13px] text-white/70 mt-0.5">
            {vendor?.business_name || 'Your storefront'}
          </p>
        </div>

        {/* Tier badge */}
        <span
          className="text-[11px] font-bold px-3 py-1 rounded-[20px] font-mono uppercase tracking-[0.05em]"
          style={{
            backgroundColor: `${tierColor}18`,
            color: tierColor,
            border: `1px solid ${tierColor}40`,
          }}
        >
          {tierLabel} ({100 - tierFee}% share)
        </span>
      </div>

      {actionError && (
        <div className="px-4 py-2.5 rounded-[10px] mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-[13px] flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="bg-none border-none text-[#ef4444] cursor-pointer text-[16px] px-1">x</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 mb-6 border-b border-[#222222] pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'px-[18px] py-2.5 border-none bg-none text-[13px] font-semibold cursor-pointer transition-all duration-200 -mb-px border-b-2',
              activeTab === tab.key
                ? 'text-[#6EE05A] border-b-[#6EE05A]'
                : 'text-white/40 border-b-transparent',
            ].join(' ')}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── My Listings Tab ── */}
      {activeTab === 'listings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-white/70 m-0">
              {listings.length} listing{listings.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => { setEditingListing(null); setShowListingForm(true) }}
              className="px-4 py-2 rounded-lg border-none text-[#000] text-[13px] font-bold cursor-pointer transition-opacity duration-200"
              style={{ backgroundColor: ACCENT }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              + Create Listing
            </button>
          </div>

          {listings.length === 0 && !loading && (
            <div
              className="text-center py-12 px-6 rounded-xl border"
              style={{ backgroundColor: '#111827', borderColor: CARD_BORDER }}
            >
              <p className="text-[15px] text-white/70 mb-1">No listings yet</p>
              <p className="text-[12px] text-white/40 m-0">Create your first listing to start selling.</p>
            </div>
          )}

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {listings.map((listing, i) => {
              const statusStyle = STATUS_COLORS[listing.status] || STATUS_COLORS.draft
              const typeColor = ASSET_TYPE_COLORS[listing.asset_type] || ACCENT
              const typeLabel = ASSET_TYPE_LABELS[listing.asset_type] || listing.asset_type

              return (
                <div
                  key={listing.id}
                  className="rounded-xl overflow-hidden transition-[border-color,transform] duration-200 relative"
                  style={{
                    backgroundColor: '#111827',
                    border: `1px solid ${CARD_BORDER}`,
                    animation: 'vendor-stagger-in 0.4s ease both',
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = CARD_BORDER_HOVER
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = CARD_BORDER
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Card header */}
                  <div className="px-4 pt-3.5 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4
                        className="text-[14px] font-bold text-white flex-1 mr-2 leading-[1.3] overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {listing.title}
                      </h4>

                      {/* Three-dot menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === listing.id ? null : listing.id)}
                          className="bg-none border-none cursor-pointer px-1.5 py-0.5 rounded text-white/40 text-[18px] leading-none"
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                        >
                          ...
                        </button>

                        {menuOpen === listing.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div
                              className="absolute right-0 top-full z-50 w-40 rounded-[10px] p-1 border shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                              style={{ backgroundColor: 'var(--bg-card)', borderColor: CARD_BORDER }}
                            >
                              <MenuButton label="Edit" onClick={() => handleEdit(listing)} />
                              <MenuButton
                                label={listing.status === 'active' ? 'Unpublish' : 'Publish'}
                                onClick={() => handlePublishToggle(listing)}
                              />
                              <MenuButton label="Delete" onClick={() => handleDelete(listing.id)} danger />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-[20px] uppercase tracking-[0.04em]"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                      >
                        {listing.status}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-[20px]"
                        style={{ backgroundColor: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}
                      >
                        {typeLabel}
                      </span>
                    </div>

                    {/* Price & purchases */}
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-white font-mono">
                        {listing.price === 0 ? 'Free' : `$${(listing.price / 100).toFixed(2)}`}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {listing.total_purchases} sale{listing.total_purchases !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Earnings Tab ── */}
      {activeTab === 'earnings' && (
        <div>
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <KpiCard label="Total Revenue" value={`$${totalRevenueDollars.toFixed(2)}`} color={ACCENT} />
            <KpiCard label="Pending Payouts" value={`$${(pendingPayoutsCents / 100).toFixed(2)}`} color={CYAN} />
            <KpiCard label="Platform Fees" value={`$${totalPlatformFees.toFixed(2)}`} color={ORANGE} />
            <KpiCard label="Total Sales" value={String(totalSales)} color={PURPLE} />
          </div>

          {/* Tier info */}
          <div
            className="px-6 py-5 rounded-xl border"
            style={{ backgroundColor: '#111827', borderColor: CARD_BORDER }}
          >
            <h4 className="text-[14px] font-bold text-white mb-3">
              Vendor Tier
            </h4>
            <div className="flex gap-4">
              {[
                { label: 'Contributor', fee: 15, min: 0, color: ORANGE },
                { label: 'Top Seller', fee: 10, min: 100, color: CYAN },
                { label: 'Partner', fee: 5, min: 500, color: ACCENT },
              ].map((tier) => {
                const isActive = tierLabel === tier.label
                return (
                  <div
                    key={tier.label}
                    className="flex-1 px-4 py-3.5 rounded-[10px] text-center"
                    style={{
                      backgroundColor: isActive ? `${tier.color}12` : 'rgba(255,255,255,0.02)',
                      border: isActive ? `1px solid ${tier.color}40` : `1px solid ${CARD_BORDER}`,
                    }}
                  >
                    <p
                      className="text-[14px] font-bold mb-1"
                      style={{ color: isActive ? tier.color : 'rgba(255,255,255,0.4)' }}
                    >
                      {tier.label}
                    </p>
                    <p
                      className="text-[22px] font-extrabold font-mono m-0"
                      style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.4)' }}
                    >
                      {100 - tier.fee}%
                    </p>
                    <p className="text-[10px] text-white/40 mt-1 m-0">
                      {tier.min === 0 ? 'Starting tier' : `${tier.min}+ sales`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Transactions Tab ── */}
      {activeTab === 'transactions' && (
        <div
          className="rounded-xl overflow-hidden border"
          style={{ backgroundColor: '#111827', borderColor: CARD_BORDER }}
        >
          {transactions.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <p className="text-[14px] text-white/70 m-0">No transactions yet</p>
              <p className="text-[12px] text-white/40 mt-1 m-0">
                Transactions will appear here when buyers purchase your listings.
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                  {['Date', 'Listing', 'Amount', 'Fee', 'Net', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-3.5 py-2.5 text-[11px] font-semibold text-white/40 text-left uppercase tracking-[0.04em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: `1px solid ${CARD_BORDER}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <td className="px-3.5 py-2.5 text-[12px] text-white/70 font-mono">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px] text-white font-medium">
                      {tx.listing_name}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px] text-white font-mono">
                      ${(tx.amount_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px] font-mono" style={{ color: RED }}>
                      -${(tx.platform_fee_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px] font-semibold font-mono" style={{ color: ACCENT }}>
                      ${(tx.vendor_payout_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-[20px] uppercase"
                        style={{
                          backgroundColor: tx.status === 'completed' ? 'rgba(126,217,87,0.12)' : 'rgba(245,158,11,0.12)',
                          color: tx.status === 'completed' ? ACCENT : YELLOW,
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Payouts Tab ── */}
      {activeTab === 'payouts' && (
        <div>
          <div className="flex justify-end mb-3">
            <button
              onClick={handleOpenStripeDashboard}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-all duration-200 bg-transparent"
              style={{ border: `1px solid ${CARD_BORDER}`, color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ACCENT
                e.currentTarget.style.color = ACCENT
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = CARD_BORDER
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              Open Stripe Dashboard
            </button>
          </div>

          <div
            className="rounded-xl overflow-hidden border"
            style={{ backgroundColor: '#111827', borderColor: CARD_BORDER }}
          >
            {payouts.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <p className="text-[14px] text-white/70 m-0">No payouts yet</p>
                <p className="text-[12px] text-white/40 mt-1 m-0">
                  Payouts are processed automatically by Stripe when you make sales.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                    {['Date', 'Amount', 'Status', 'Arrival Date'].map((h) => (
                      <th
                        key={h}
                        className="px-3.5 py-2.5 text-[11px] font-semibold text-white/40 text-left uppercase tracking-[0.04em]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((po) => (
                    <tr
                      key={po.id}
                      style={{ borderBottom: `1px solid ${CARD_BORDER}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <td className="px-3.5 py-2.5 text-[12px] text-white/70 font-mono">
                        {new Date(po.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-[14px] font-bold font-mono" style={{ color: ACCENT }}>
                        ${(po.amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-[20px] uppercase"
                          style={{
                            backgroundColor: po.status === 'paid'
                              ? 'rgba(126,217,87,0.12)'
                              : po.status === 'in_transit'
                              ? 'rgba(0,212,255,0.12)'
                              : 'rgba(245,158,11,0.12)',
                            color: po.status === 'paid'
                              ? ACCENT
                              : po.status === 'in_transit'
                              ? CYAN
                              : YELLOW,
                          }}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[12px] text-white/70 font-mono">
                        {po.arrival_date ? new Date(po.arrival_date).toLocaleDateString() : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Listing form modal */}
      {showListingForm && (
        <VendorListingForm
          listing={editingListing}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      <style>{vendorAnimations}</style>
    </div>
  )
}

// ── Sub-components ──

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="px-[18px] py-4 rounded-xl border"
      style={{ backgroundColor: '#111827', borderColor: CARD_BORDER }}
    >
      <p className="text-[11px] text-white/40 mb-1.5 uppercase tracking-[0.04em] font-semibold m-0 pb-1.5">
        {label}
      </p>
      <p className="text-[22px] font-extrabold font-mono tracking-[-0.02em] m-0" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function MenuButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-3 py-2 border-none bg-none text-left text-[13px] cursor-pointer rounded-md transition-[background-color] duration-150"
      style={{ color: danger ? RED : 'rgba(255,255,255,0.7)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--border)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {label}
    </button>
  )
}

// ── Animations ──

const vendorAnimations = `
  @keyframes vendor-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes vendor-stagger-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes vendor-spin {
    to { transform: rotate(360deg); }
  }
`

// ── Self-contained wrapper using useVendor hook ──

export function VendorView() {
  const hook = useVendor()

  useEffect(() => {
    hook.fetchDashboard()
    hook.fetchListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <VendorViewInner
      vendor={hook.vendor}
      listings={hook.listings}
      transactions={hook.transactions}
      payouts={hook.payouts}
      loading={hook.loading}
      vendorStatus={hook.vendorStatus}
      onFetchDashboard={hook.fetchDashboard}
      onFetchListings={hook.fetchListings}
      onCreateListing={hook.createListing}
      onUpdateListing={hook.updateListing}
      onDeleteListing={hook.deleteListing}
      onPublishListing={hook.publishListing}
      onUnpublishListing={hook.unpublishListing}
      onApplyAsVendor={hook.applyAsVendor}
      onGetOnboardingLink={hook.getOnboardingLink}
      onGetDashboardLink={hook.getDashboardLink}
    />
  )
}
