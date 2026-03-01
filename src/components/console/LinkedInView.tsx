'use client'

import { useState, useEffect } from 'react'
import {
  Linkedin,
  Sparkles,
  Send,
  RefreshCw,
  Zap,
  Clock,
  BarChart3,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import type { useLinkedIn } from '@/lib/console/useLinkedIn'

type LinkedInHook = ReturnType<typeof useLinkedIn>

interface LinkedInViewProps {
  linkedin: LinkedInHook
}

export function LinkedInView({ linkedin }: LinkedInViewProps) {
  const {
    member,
    loading,
    generating,
    publishing,
    generatedPost,
    error,
    fetchMember,
    generatePost,
    publishPost,
    toggleAutomation,
    connect,
    setGeneratedPost,
    setError,
  } = linkedin

  const [topic, setTopic] = useState('')
  const [copied, setCopied] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchMember()
  }, [fetchMember])

  const handleGenerate = async () => {
    setPublishedUrl(null)
    await generatePost(topic || undefined)
  }

  const handlePublish = async () => {
    if (!generatedPost) return
    const result = await publishPost(generatedPost.content)
    if (result) {
      setPublishedUrl(result.postUrl)
      setGeneratedPost(null)
    }
  }

  const handleCopy = () => {
    if (!generatedPost) return
    navigator.clipboard.writeText(generatedPost.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Not Connected ─────────────────────────────────
  if (!loading && !member) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #0077B5, #00A0DC)' }}
          >
            <Linkedin size={32} style={{ color: '#fff' }} />
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Connect LinkedIn
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            Connect your LinkedIn profile to unlock AI-powered post generation,
            professional archetype analysis, and automated posting.
          </p>
          <button
            onClick={connect}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #0077B5, #00A0DC)',
              color: '#fff',
              border: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span className="flex items-center justify-center gap-2">
              <Linkedin size={18} />
              Connect with LinkedIn
            </span>
          </button>
          <p
            className="text-xs mt-4"
            style={{ color: 'var(--text-muted)' }}
          >
            We request profile, email, and posting permissions. Your data is never shared.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw
          size={24}
          className="animate-spin"
          style={{ color: 'var(--text-muted)' }}
        />
      </div>
    )
  }

  // ─── Connected View ────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{
              backgroundColor: 'rgba(255,59,48,0.1)',
              border: '1px solid rgba(255,59,48,0.2)',
              color: '#ff6b6b',
            }}
          >
            <AlertCircle size={16} />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs underline cursor-pointer bg-transparent border-none"
              style={{ color: '#ff6b6b' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Profile Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-start gap-4">
            {member?.linkedin_avatar_url ? (
              <img
                src={member.linkedin_avatar_url}
                alt={member.linkedin_name}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0077B5, #00A0DC)' }}
              >
                <Linkedin size={24} style={{ color: '#fff' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg font-bold truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {member?.linkedin_name}
                </h2>
                <div
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #0077B5, #00A0DC)',
                    color: '#fff',
                  }}
                >
                  Connected
                </div>
              </div>
              {member?.linkedin_headline && (
                <p
                  className="text-sm truncate mt-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {member.linkedin_headline}
                </p>
              )}
              {member?.archetype && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    member.archetype.tier,
                    member.archetype.domain,
                    member.archetype.style,
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-xs"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {member?.linkedin_profile_url && (
              <a
                href={member.linkedin_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0077B5')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-3 mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <StatCard icon={BarChart3} label="Posts" value={member?.total_posts || 0} />
            <StatCard icon={Zap} label="Engagements" value={member?.total_engagements || 0} />
            <StatCard
              icon={Clock}
              label="Automation"
              value={member?.automated_posting_enabled ? 'On' : 'Off'}
              accent={member?.automated_posting_enabled}
            />
          </div>
        </div>

        {/* Post Generator */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <h3
            className="text-sm font-semibold flex items-center gap-2 mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            Generate LinkedIn Post
          </h3>

          <div className="flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic or idea (optional)..."
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate()
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all flex items-center gap-2"
              style={{
                background: generating
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                color: generating ? 'var(--text-muted)' : '#fff',
                border: 'none',
              }}
            >
              {generating ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {/* Generated Post Preview */}
          {generatedPost && (
            <div className="mt-4 space-y-3">
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: generatedPost.valid
                    ? '1px solid rgba(126,217,87,0.2)'
                    : '1px solid rgba(255,59,48,0.2)',
                }}
              >
                <pre
                  className="text-sm whitespace-pre-wrap"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    margin: 0,
                  }}
                >
                  {generatedPost.content}
                </pre>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded-md"
                    style={{
                      backgroundColor: generatedPost.valid
                        ? 'rgba(126,217,87,0.1)'
                        : 'rgba(255,59,48,0.1)',
                      color: generatedPost.valid ? '#7ed957' : '#ff6b6b',
                    }}
                  >
                    {generatedPost.valid ? 'Valid' : 'Issues found'}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {generatedPost.content.length} chars
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <RefreshCw size={14} />
                    Regenerate
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={publishing || !generatedPost.valid}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
                    style={{
                      background: publishing
                        ? 'rgba(255,255,255,0.06)'
                        : 'linear-gradient(135deg, #0077B5, #00A0DC)',
                      color: publishing ? 'var(--text-muted)' : '#fff',
                      border: 'none',
                    }}
                  >
                    {publishing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {publishing ? 'Publishing...' : 'Publish to LinkedIn'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Published success */}
          {publishedUrl && (
            <div
              className="mt-4 flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(126,217,87,0.06)',
                border: '1px solid rgba(126,217,87,0.2)',
                color: '#7ed957',
              }}
            >
              <Check size={16} />
              Post published!
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1"
                style={{ color: '#7ed957' }}
              >
                View on LinkedIn
              </a>
            </div>
          )}
        </div>

        {/* Automation Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Zap size={16} style={{ color: '#ffbb33' }} />
                Automated Posting
              </h3>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                AI generates and publishes posts on your schedule.
                Frequency: {member?.posting_frequency || 'weekly'}
              </p>
            </div>
            <button
              onClick={() => toggleAutomation(!member?.automated_posting_enabled)}
              className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
              style={{
                backgroundColor: member?.automated_posting_enabled
                  ? 'rgba(255,59,48,0.1)'
                  : 'rgba(126,217,87,0.1)',
                border: member?.automated_posting_enabled
                  ? '1px solid rgba(255,59,48,0.2)'
                  : '1px solid rgba(126,217,87,0.2)',
                color: member?.automated_posting_enabled ? '#ff6b6b' : '#7ed957',
              }}
            >
              {member?.automated_posting_enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof BarChart3
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
      }}
    >
      <Icon
        size={16}
        className="mx-auto mb-1"
        style={{ color: accent ? '#7ed957' : 'var(--text-muted)' }}
      />
      <div
        className="text-lg font-bold"
        style={{ color: accent ? '#7ed957' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  )
}
