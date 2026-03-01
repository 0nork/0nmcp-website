'use client'

import { useState, useCallback } from 'react'
import type { QADistributionTemplate } from '@/data/premium-templates/qa-distribution.0n'

interface PremiumOnboardingProps {
  template: QADistributionTemplate
  onComplete: (config: OnboardingConfig) => void
  onClose: () => void
}

interface OnboardingConfig {
  selectedPlatforms: string[]
  topic: string
  keywords: string
  websiteUrl: string
  tone: string
  frequency: string
  connectedServices: Record<string, string>
}

const TOTAL_STEPS = 6

export default function PremiumOnboarding({
  template,
  onComplete,
  onClose,
}: PremiumOnboardingProps) {
  const [step, setStep] = useState(0)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [tone, setTone] = useState('professional')
  const [frequency, setFrequency] = useState('daily')
  const [serviceKeys, setServiceKeys] = useState<Record<string, string>>({})
  const [testingService, setTestingService] = useState<string | null>(null)
  const [testedServices, setTestedServices] = useState<Set<string>>(new Set())

  const canAdvance = useCallback((): boolean => {
    switch (step) {
      case 0:
        return true
      case 1:
        return selectedPlatforms.length >= 3
      case 2:
        return topic.trim().length > 0 && keywords.trim().length > 0
      case 3:
        return frequency.length > 0
      case 4:
        return true // Services are optional
      case 5:
        return true
      default:
        return false
    }
  }, [step, selectedPlatforms, topic, keywords, frequency])

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1 && canAdvance()) {
      setStep((s) => s + 1)
    }
  }, [step, canAdvance])

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1)
  }, [step])

  const handleTogglePlatform = useCallback((id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }, [])

  const handleTestService = useCallback(
    (service: string) => {
      if (!serviceKeys[service]) return
      setTestingService(service)
      // Simulate a test (in production would hit /api/console/test-key)
      setTimeout(() => {
        setTestedServices((prev) => new Set([...prev, service]))
        setTestingService(null)
      }, 1500)
    },
    [serviceKeys]
  )

  const handleActivate = useCallback(() => {
    onComplete({
      selectedPlatforms,
      topic,
      keywords,
      websiteUrl,
      tone,
      frequency,
      connectedServices: serviceKeys,
    })
  }, [selectedPlatforms, topic, keywords, websiteUrl, tone, frequency, serviceKeys, onComplete])

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', desc: '1 post per day' },
    { value: 'twice-daily', label: 'Twice Daily', desc: '2 posts per day' },
    { value: '3x-week', label: '3x Week', desc: 'Mon, Wed, Fri' },
    { value: 'weekly', label: 'Weekly', desc: '1 post per week' },
  ]

  const requiredServices = ['openai', 'anthropic']

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'var(--bg-card, #1a1a25)',
          border: '1px solid var(--border, #2a2a3a)',
          borderRadius: 16,
          padding: 0,
        }}
      >
        {/* Top Bar: Step dots + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border, #2a2a3a)',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    i === step
                      ? 'var(--accent, #7ed957)'
                      : i < step
                        ? 'var(--accent-secondary, #00d4ff)'
                        : 'var(--border, #2a2a3a)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #55556a)',
              fontSize: 18,
              cursor: 'pointer',
              padding: '2px 6px',
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>

        {/* Step Content */}
        <div style={{ padding: 24 }}>
          {/* ===== Step 0: Welcome ===== */}
          {step === 0 && (
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--accent, #7ed957), var(--accent-secondary, #00d4ff))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  margin: '0 auto 20px',
                  color: '#000',
                  fontWeight: 700,
                }}
              >
                QA
              </div>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  textAlign: 'center',
                  color: 'var(--text-primary, #e8e8ef)',
                  margin: '0 0 8px',
                }}
              >
                {template.name}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-secondary, #8888a0)',
                  textAlign: 'center',
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                  maxWidth: 480,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                {template.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxWidth: 400,
                  margin: '0 auto',
                }}
              >
                {[
                  'AI-powered content generation with quality scoring',
                  'Automatic platform-specific formatting',
                  'Smart hashtag injection per platform',
                  'Distribute to 12 platforms simultaneously',
                  'Daily engagement tracking and Slack reports',
                  `${template.steps.length}-step automated pipeline`,
                ].map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13,
                      color: 'var(--text-secondary, #8888a0)',
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--accent, #7ed957)',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      +
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Step 1: Connect Platforms ===== */}
          {step === 1 && (
            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary, #e8e8ef)',
                  margin: '0 0 4px',
                }}
              >
                Select Platforms
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary, #8888a0)',
                  margin: '0 0 20px',
                }}
              >
                Choose where to distribute content. Minimum 3 platforms required.
                <span
                  style={{
                    marginLeft: 8,
                    fontWeight: 600,
                    color:
                      selectedPlatforms.length >= 3
                        ? 'var(--accent, #7ed957)'
                        : 'var(--text-muted, #55556a)',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {selectedPlatforms.length}/{template.platforms.length}
                </span>
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                {template.platforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id)
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleTogglePlatform(platform.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '14px 8px',
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? platform.color : 'var(--border, #2a2a3a)'}`,
                        background: isSelected
                          ? `${platform.color}12`
                          : 'var(--bg-primary, #0a0a0f)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: isSelected ? platform.color : 'var(--bg-card, #1a1a25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          fontWeight: 700,
                          color: isSelected ? '#fff' : 'var(--text-muted, #55556a)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {platform.name.charAt(0)}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isSelected
                            ? 'var(--text-primary, #e8e8ef)'
                            : 'var(--text-secondary, #8888a0)',
                        }}
                      >
                        {platform.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ===== Step 2: Configure Content ===== */}
          {step === 2 && (
            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary, #e8e8ef)',
                  margin: '0 0 4px',
                }}
              >
                Configure Content
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary, #8888a0)',
                  margin: '0 0 20px',
                }}
              >
                Tell the AI what kind of content to create.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Topic */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary, #8888a0)',
                      marginBottom: 6,
                    }}
                  >
                    Content Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., AI automation, developer tools"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border, #2a2a3a)',
                      background: 'var(--bg-primary, #0a0a0f)',
                      color: 'var(--text-primary, #e8e8ef)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--accent, #7ed957)')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--border, #2a2a3a)')
                    }
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary, #8888a0)',
                      marginBottom: 6,
                    }}
                  >
                    Target Keywords *
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="comma-separated keywords"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border, #2a2a3a)',
                      background: 'var(--bg-primary, #0a0a0f)',
                      color: 'var(--text-primary, #e8e8ef)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--accent, #7ed957)')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--border, #2a2a3a)')
                    }
                  />
                </div>

                {/* Website URL */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary, #8888a0)',
                      marginBottom: 6,
                    }}
                  >
                    Website URL (optional)
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border, #2a2a3a)',
                      background: 'var(--bg-primary, #0a0a0f)',
                      color: 'var(--text-primary, #e8e8ef)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--accent, #7ed957)')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--border, #2a2a3a)')
                    }
                  />
                </div>

                {/* Tone */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary, #8888a0)',
                      marginBottom: 6,
                    }}
                  >
                    Content Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border, #2a2a3a)',
                      background: 'var(--bg-primary, #0a0a0f)',
                      color: 'var(--text-primary, #e8e8ef)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="technical">Technical</option>
                    <option value="witty">Witty</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ===== Step 3: Set Frequency ===== */}
          {step === 3 && (
            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary, #e8e8ef)',
                  margin: '0 0 4px',
                }}
              >
                Set Frequency
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary, #8888a0)',
                  margin: '0 0 20px',
                }}
              >
                How often should content be generated and distributed?
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                }}
              >
                {frequencyOptions.map((opt) => {
                  const isSelected = frequency === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      style={{
                        padding: '18px 16px',
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? 'var(--accent, #7ed957)' : 'var(--border, #2a2a3a)'}`,
                        background: isSelected
                          ? 'var(--accent-glow, rgba(126,217,87,0.08))'
                          : 'var(--bg-primary, #0a0a0f)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: isSelected
                            ? 'var(--accent, #7ed957)'
                            : 'var(--text-primary, #e8e8ef)',
                          marginBottom: 4,
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted, #55556a)',
                        }}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ===== Step 4: Connect Services ===== */}
          {step === 4 && (
            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary, #e8e8ef)',
                  margin: '0 0 4px',
                }}
              >
                Connect Services
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary, #8888a0)',
                  margin: '0 0 20px',
                }}
              >
                Provide API keys for the required services. You can skip and connect later.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {requiredServices.map((service) => {
                  const isTested = testedServices.has(service)
                  const isTesting = testingService === service
                  return (
                    <div
                      key={service}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 10,
                        border: `1px solid ${isTested ? 'var(--accent, #7ed957)40' : 'var(--border, #2a2a3a)'}`,
                        background: isTested
                          ? 'rgba(126,217,87,0.04)'
                          : 'var(--bg-primary, #0a0a0f)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--text-primary, #e8e8ef)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {service}
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#ff6b35',
                              marginLeft: 6,
                              textTransform: 'uppercase',
                            }}
                          >
                            Required
                          </span>
                        </div>
                        {isTested && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--accent, #7ed957)',
                              fontFamily: 'var(--font-mono, monospace)',
                            }}
                          >
                            Connected
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="password"
                          placeholder={`${service} API key`}
                          value={serviceKeys[service] ?? ''}
                          onChange={(e) =>
                            setServiceKeys((prev) => ({
                              ...prev,
                              [service]: e.target.value,
                            }))
                          }
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--border, #2a2a3a)',
                            background: 'var(--bg-card, #1a1a25)',
                            color: 'var(--text-primary, #e8e8ef)',
                            fontSize: 13,
                            fontFamily: 'var(--font-mono, monospace)',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor =
                              'var(--accent, #7ed957)')
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor =
                              'var(--border, #2a2a3a)')
                          }
                        />
                        <button
                          onClick={() => handleTestService(service)}
                          disabled={!serviceKeys[service] || isTesting}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 6,
                            border: '1px solid var(--border, #2a2a3a)',
                            background: isTesting
                              ? 'var(--accent-glow, rgba(126,217,87,0.1))'
                              : 'transparent',
                            color: serviceKeys[service]
                              ? 'var(--accent, #7ed957)'
                              : 'var(--text-muted, #55556a)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: serviceKeys[service] ? 'pointer' : 'default',
                            opacity: serviceKeys[service] ? 1 : 0.5,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isTesting ? 'Testing...' : isTested ? 'Retest' : 'Test'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={handleNext}
                style={{
                  display: 'block',
                  marginTop: 16,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #55556a)',
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 4,
                }}
              >
                Skip for now -- connect later
              </button>
            </div>
          )}

          {/* ===== Step 5: Review & Activate ===== */}
          {step === 5 && (
            <div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary, #e8e8ef)',
                  margin: '0 0 4px',
                }}
              >
                Review & Activate
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary, #8888a0)',
                  margin: '0 0 20px',
                }}
              >
                Confirm your configuration and activate the QA Distribution Engine.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Selected Platforms */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'var(--bg-primary, #0a0a0f)',
                    border: '1px solid var(--border, #2a2a3a)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted, #55556a)',
                      marginBottom: 8,
                    }}
                  >
                    Platforms ({selectedPlatforms.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedPlatforms.map((id) => {
                      const platform = template.platforms.find((p) => p.id === id)
                      return (
                        <span
                          key={id}
                          style={{
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#fff',
                            background: `${platform?.color ?? '#555'}40`,
                            border: `1px solid ${platform?.color ?? '#555'}60`,
                          }}
                        >
                          {platform?.name ?? id}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Content Config */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'var(--bg-primary, #0a0a0f)',
                    border: '1px solid var(--border, #2a2a3a)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted, #55556a)',
                      marginBottom: 8,
                    }}
                  >
                    Content
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary, #8888a0)', lineHeight: 1.8 }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary, #e8e8ef)' }}>Topic:</strong> {topic}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary, #e8e8ef)' }}>Keywords:</strong> {keywords}
                    </div>
                    {websiteUrl && (
                      <div>
                        <strong style={{ color: 'var(--text-primary, #e8e8ef)' }}>Website:</strong> {websiteUrl}
                      </div>
                    )}
                    <div>
                      <strong style={{ color: 'var(--text-primary, #e8e8ef)' }}>Tone:</strong>{' '}
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Frequency */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'var(--bg-primary, #0a0a0f)',
                    border: '1px solid var(--border, #2a2a3a)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted, #55556a)',
                      marginBottom: 6,
                    }}
                  >
                    Frequency
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent, #7ed957)' }}>
                    {frequencyOptions.find((o) => o.value === frequency)?.label ?? frequency}
                  </div>
                </div>

                {/* Connected Services */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'var(--bg-primary, #0a0a0f)',
                    border: '1px solid var(--border, #2a2a3a)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-muted, #55556a)',
                      marginBottom: 8,
                    }}
                  >
                    Services
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {requiredServices.map((svc) => (
                      <div
                        key={svc}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: testedServices.has(svc)
                              ? 'var(--accent, #7ed957)'
                              : serviceKeys[svc]
                                ? '#ffaa00'
                                : '#ff4444',
                          }}
                        />
                        <span
                          style={{
                            color: 'var(--text-secondary, #8888a0)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {svc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderTop: '1px solid var(--border, #2a2a3a)',
          }}
        >
          <div>
            {step > 0 && (
              <button
                onClick={handleBack}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--text-secondary, #8888a0)',
                  border: '1px solid var(--border, #2a2a3a)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
            )}
          </div>
          <div>
            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  background: canAdvance()
                    ? 'var(--accent, #7ed957)'
                    : 'var(--border, #2a2a3a)',
                  color: canAdvance() ? '#000' : 'var(--text-muted, #55556a)',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: canAdvance() ? 'pointer' : 'default',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (canAdvance()) e.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {step === 0 ? 'Get Started' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleActivate}
                style={{
                  padding: '10px 28px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--accent, #7ed957), var(--accent-secondary, #00d4ff))',
                  color: '#000',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Activate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
