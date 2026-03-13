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

// ── Shared Styles ──

const COLORS = {
  bg: '#0a0a0a',
  card: '#111111',
  cardHover: '#161616',
  border: '#222222',
  borderHover: '#333333',
  accent: '#7ed957',
  accentGlow: 'rgba(126, 217, 87, 0.12)',
  accentBorder: 'rgba(126, 217, 87, 0.3)',
  orange: '#ff6b35',
  cyan: '#00d4ff',
  purple: '#a78bfa',
  yellow: '#f59e0b',
  red: '#ef4444',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
} as const

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  active: { bg: 'rgba(126,217,87,0.12)', color: '#7ed957', border: 'rgba(126,217,87,0.3)' },
  draft: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  archived: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' },
}

const ASSET_TYPE_COLORS: Record<string, string> = {
  workflow: '#7ed957',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 24, height: 24, border: `2px solid ${COLORS.border}`,
          borderTopColor: COLORS.accent, borderRadius: '50%',
          animation: 'vendor-spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes vendor-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── State 1: Not a Vendor ──

  if (vendorStatus === 'not_vendor') {
    return (
      <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto', animation: 'vendor-fade-in 0.3s ease' }}>
        {/* Hero */}
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: `linear-gradient(145deg, ${COLORS.accentGlow} 0%, ${COLORS.card} 60%, ${COLORS.bg} 100%)`,
          borderRadius: 16, border: `1px solid ${COLORS.accentBorder}`,
          marginBottom: 32,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            backgroundColor: COLORS.accentGlow, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            border: `1px solid ${COLORS.accentBorder}`,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Sell on the 0nMCP Marketplace
          </h2>
          <p style={{ fontSize: 15, color: COLORS.textSecondary, maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Create and sell workflows, templates, landing pages, and more. Earn 80% of every sale.
          </p>

          {/* Apply form */}
          <div style={{ maxWidth: 360, margin: '0 auto' }}>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business Name"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${COLORS.border}`,
                color: COLORS.textPrimary, fontSize: 14, outline: 'none',
                marginBottom: 10, boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.accent }}
              onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border }}
            />
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${COLORS.border}`,
                color: COLORS.textPrimary, fontSize: 14, outline: 'none',
                marginBottom: 16, boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              <option value="individual" style={{ backgroundColor: '#111' }}>Individual</option>
              <option value="company" style={{ backgroundColor: '#111' }}>Company</option>
            </select>

            {applyError && (
              <p style={{ fontSize: 13, color: COLORS.red, marginBottom: 12 }}>{applyError}</p>
            )}

            <button
              onClick={handleApply}
              disabled={applyLoading}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                backgroundColor: COLORS.accent, color: '#000', fontSize: 14,
                fontWeight: 700, cursor: applyLoading ? 'wait' : 'pointer',
                opacity: applyLoading ? 0.6 : 1, transition: 'opacity 0.2s',
              }}
            >
              {applyLoading ? 'Submitting...' : 'Apply Now'}
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '85%', title: '85% Revenue Share', desc: 'Keep the majority of every sale. Starting at just 15% platform fee.' },
            { icon: '$', title: 'Stripe Express Payouts', desc: 'Automatic payouts to your bank account. Stripe handles everything.' },
            { icon: '~', title: 'Global Marketplace', desc: 'Reach thousands of AI engineers looking for premium workflows.' },
          ].map((feat) => (
            <div key={feat.title} style={{
              padding: '20px 16px', borderRadius: 12, backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`, textAlign: 'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: COLORS.accentGlow, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontSize: 18, fontWeight: 800,
                color: COLORS.accent, fontFamily: 'var(--font-mono)',
                border: `1px solid ${COLORS.accentBorder}`,
              }}>
                {feat.icon}
              </div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 6 }}>
                {feat.title}
              </h4>
              <p style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>
                {feat.desc}
              </p>
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
      <div style={{ padding: '24px', maxWidth: 560, margin: '0 auto', animation: 'vendor-fade-in 0.3s ease' }}>
        <div style={{
          padding: '40px 32px', borderRadius: 16, backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`, textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            backgroundColor: 'rgba(245,158,11,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: '1px solid rgba(245,158,11,0.3)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={COLORS.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Application Under Review
          </h2>
          <p style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Your vendor application is being reviewed by our team. This typically takes 1-2 business days.
          </p>

          <div style={{
            padding: '16px 20px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)',
            border: `1px solid ${COLORS.border}`, textAlign: 'left',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 12 }}>
              What happens next:
            </p>
            {[
              'We review your application details',
              'Your Stripe Express account is created',
              'You complete identity verification with Stripe',
              'Your vendor storefront goes live',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 10,
                  fontWeight: 700, color: COLORS.textMuted, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {vendor?.business_name && (
            <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 16 }}>
              Applied as <span style={{ color: COLORS.textSecondary, fontWeight: 600 }}>{vendor.business_name}</span>
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
      <div style={{ padding: '24px', maxWidth: 560, margin: '0 auto', animation: 'vendor-fade-in 0.3s ease' }}>
        <div style={{
          padding: '40px 32px', borderRadius: 16, backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.accentBorder}`, textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            backgroundColor: COLORS.accentGlow, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            border: `1px solid ${COLORS.accentBorder}`,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Complete Stripe Setup
          </h2>
          <p style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.6, maxWidth: 400, margin: '0 auto 24px' }}>
            Your application has been approved. Complete your Stripe Express onboarding to start receiving payments. Stripe securely handles identity verification, tax information, and banking details.
          </p>

          {actionError && (
            <p style={{ fontSize: 13, color: COLORS.red, marginBottom: 16 }}>{actionError}</p>
          )}

          <button
            onClick={handleStartOnboarding}
            disabled={onboardingLoading}
            style={{
              padding: '12px 32px', borderRadius: 10, border: 'none',
              backgroundColor: COLORS.accent, color: '#000', fontSize: 14,
              fontWeight: 700, cursor: onboardingLoading ? 'wait' : 'pointer',
              opacity: onboardingLoading ? 0.6 : 1, transition: 'opacity 0.2s',
            }}
          >
            {onboardingLoading ? 'Redirecting to Stripe...' : 'Start Stripe Onboarding'}
          </button>

          <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 16, lineHeight: 1.5 }}>
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
  const tierColor = tierFee <= 5 ? COLORS.accent : tierFee <= 10 ? COLORS.cyan : COLORS.orange

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
    <div style={{ padding: '24px', maxWidth: 960, margin: '0 auto', animation: 'vendor-fade-in 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Vendor Dashboard
          </h2>
          <p style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
            {vendor?.business_name || 'Your storefront'}
          </p>
        </div>

        {/* Tier badge */}
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
          backgroundColor: `${tierColor}18`, color: tierColor,
          border: `1px solid ${tierColor}40`, fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {tierLabel} ({100 - tierFee}% share)
        </span>
      </div>

      {actionError && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 16,
          backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          color: COLORS.red, fontSize: 13, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} style={{
            background: 'none', border: 'none', color: COLORS.red,
            cursor: 'pointer', fontSize: 16, padding: '0 4px',
          }}>x</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: activeTab === tab.key ? COLORS.accent : COLORS.textMuted,
              borderBottom: activeTab === tab.key ? `2px solid ${COLORS.accent}` : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: -1,
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) e.currentTarget.style.color = COLORS.textSecondary
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) e.currentTarget.style.color = COLORS.textMuted
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── My Listings Tab ── */}
      {activeTab === 'listings' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: COLORS.textSecondary }}>
              {listings.length} listing{listings.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => { setEditingListing(null); setShowListingForm(true) }}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                backgroundColor: COLORS.accent, color: '#000', fontSize: 13,
                fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              + Create Listing
            </button>
          </div>

          {listings.length === 0 && !loading && (
            <div style={{
              textAlign: 'center', padding: '48px 24px', borderRadius: 12,
              backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`,
            }}>
              <p style={{ fontSize: 15, color: COLORS.textSecondary, marginBottom: 4 }}>No listings yet</p>
              <p style={{ fontSize: 12, color: COLORS.textMuted }}>Create your first listing to start selling.</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {listings.map((listing, i) => {
              const statusStyle = STATUS_COLORS[listing.status] || STATUS_COLORS.draft
              const typeColor = ASSET_TYPE_COLORS[listing.asset_type] || COLORS.accent
              const typeLabel = ASSET_TYPE_LABELS[listing.asset_type] || listing.asset_type

              return (
                <div
                  key={listing.id}
                  style={{
                    borderRadius: 12, backgroundColor: COLORS.card,
                    border: `1px solid ${COLORS.border}`, overflow: 'hidden',
                    transition: 'border-color 0.2s, transform 0.2s',
                    animation: 'vendor-stagger-in 0.4s ease both',
                    animationDelay: `${i * 60}ms`,
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.borderHover
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Card header */}
                  <div style={{ padding: '14px 16px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{
                        fontSize: 14, fontWeight: 700, color: COLORS.textPrimary,
                        flex: 1, marginRight: 8, lineHeight: 1.3,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {listing.title}
                      </h4>

                      {/* Three-dot menu */}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setMenuOpen(menuOpen === listing.id ? null : listing.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '2px 6px', borderRadius: 4, color: COLORS.textMuted,
                            fontSize: 18, lineHeight: 1,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.textPrimary }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textMuted }}
                        >
                          ...
                        </button>

                        {menuOpen === listing.id && (
                          <>
                            <div
                              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                              onClick={() => setMenuOpen(null)}
                            />
                            <div style={{
                              position: 'absolute', right: 0, top: '100%', zIndex: 50,
                              width: 160, borderRadius: 10, padding: 4,
                              backgroundColor: '#1a1a1a', border: `1px solid ${COLORS.border}`,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        backgroundColor: statusStyle.bg, color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`, textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {listing.status}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        backgroundColor: `${typeColor}15`, color: typeColor,
                        border: `1px solid ${typeColor}30`,
                      }}>
                        {typeLabel}
                      </span>
                    </div>

                    {/* Price & purchases */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, color: COLORS.textPrimary,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {listing.price === 0 ? 'Free' : `$${(listing.price / 100).toFixed(2)}`}
                      </span>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <KpiCard label="Total Revenue" value={`$${totalRevenueDollars.toFixed(2)}`} color={COLORS.accent} />
            <KpiCard label="Pending Payouts" value={`$${(pendingPayoutsCents / 100).toFixed(2)}`} color={COLORS.cyan} />
            <KpiCard label="Platform Fees" value={`$${totalPlatformFees.toFixed(2)}`} color={COLORS.orange} />
            <KpiCard label="Total Sales" value={String(totalSales)} color={COLORS.purple} />
          </div>

          {/* Tier info */}
          <div style={{
            padding: '20px 24px', borderRadius: 12, backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 12 }}>
              Vendor Tier
            </h4>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Contributor', fee: 15, min: 0, color: COLORS.orange },
                { label: 'Top Seller', fee: 10, min: 100, color: COLORS.cyan },
                { label: 'Partner', fee: 5, min: 500, color: COLORS.accent },
              ].map((tier) => {
                const isActive = tierLabel === tier.label
                return (
                  <div key={tier.label} style={{
                    flex: 1, padding: '14px 16px', borderRadius: 10,
                    backgroundColor: isActive ? `${tier.color}12` : 'rgba(255,255,255,0.02)',
                    border: isActive ? `1px solid ${tier.color}40` : `1px solid ${COLORS.border}`,
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: isActive ? tier.color : COLORS.textMuted, marginBottom: 4 }}>
                      {tier.label}
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: isActive ? COLORS.textPrimary : COLORS.textMuted, fontFamily: 'var(--font-mono)' }}>
                      {100 - tier.fee}%
                    </p>
                    <p style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>
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
        <div style={{
          borderRadius: 12, backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`, overflow: 'hidden',
        }}>
          {transactions.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: COLORS.textSecondary }}>No transactions yet</p>
              <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                Transactions will appear here when buyers purchase your listings.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {['Date', 'Listing', 'Amount', 'Fee', 'Net', 'Status'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 14px', fontSize: 11, fontWeight: 600,
                      color: COLORS.textMuted, textAlign: 'left',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: `1px solid ${COLORS.border}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <td style={{ padding: '10px 14px', fontSize: 12, color: COLORS.textSecondary, fontFamily: 'var(--font-mono)' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: COLORS.textPrimary, fontWeight: 500 }}>
                      {tx.listing_name}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: COLORS.textPrimary, fontFamily: 'var(--font-mono)' }}>
                      ${(tx.amount_cents / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: COLORS.red, fontFamily: 'var(--font-mono)' }}>
                      -${(tx.platform_fee_cents / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: COLORS.accent, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      ${(tx.vendor_payout_cents / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        backgroundColor: tx.status === 'completed' ? 'rgba(126,217,87,0.12)' : 'rgba(245,158,11,0.12)',
                        color: tx.status === 'completed' ? COLORS.accent : COLORS.yellow,
                        textTransform: 'uppercase',
                      }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={handleOpenStripeDashboard}
              style={{
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${COLORS.border}`,
                backgroundColor: 'transparent', color: COLORS.textSecondary, fontSize: 12,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = COLORS.accent
                e.currentTarget.style.color = COLORS.accent
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.border
                e.currentTarget.style.color = COLORS.textSecondary
              }}
            >
              Open Stripe Dashboard
            </button>
          </div>

          <div style={{
            borderRadius: 12, backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`, overflow: 'hidden',
          }}>
            {payouts.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: COLORS.textSecondary }}>No payouts yet</p>
                <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                  Payouts are processed automatically by Stripe when you make sales.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    {['Date', 'Amount', 'Status', 'Arrival Date'].map((h) => (
                      <th key={h} style={{
                        padding: '10px 14px', fontSize: 11, fontWeight: 600,
                        color: COLORS.textMuted, textAlign: 'left',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((po) => (
                    <tr
                      key={po.id}
                      style={{ borderBottom: `1px solid ${COLORS.border}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <td style={{ padding: '10px 14px', fontSize: 12, color: COLORS.textSecondary, fontFamily: 'var(--font-mono)' }}>
                        {new Date(po.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 14, color: COLORS.accent, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ${(po.amount_cents / 100).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          backgroundColor: po.status === 'paid' ? 'rgba(126,217,87,0.12)' : po.status === 'in_transit' ? 'rgba(0,212,255,0.12)' : 'rgba(245,158,11,0.12)',
                          color: po.status === 'paid' ? COLORS.accent : po.status === 'in_transit' ? COLORS.cyan : COLORS.yellow,
                          textTransform: 'uppercase',
                        }}>
                          {po.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: COLORS.textSecondary, fontFamily: 'var(--font-mono)' }}>
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
    <div style={{
      padding: '16px 18px', borderRadius: 12, backgroundColor: COLORS.card,
      border: `1px solid ${COLORS.border}`,
    }}>
      <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
        {value}
      </p>
    </div>
  )
}

function MenuButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', padding: '8px 12px', border: 'none',
        background: 'none', textAlign: 'left', fontSize: 13, cursor: 'pointer',
        borderRadius: 6, color: danger ? COLORS.red : COLORS.textSecondary,
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)' }}
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
