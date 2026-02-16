'use client'

import { useState } from 'react'

interface FAQSectionProps {
  triggerName: string
  actionName: string
}

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-lg overflow-hidden transition-all duration-200"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: `1px solid ${
              openIndex === index ? 'var(--accent)' : 'var(--border)'
            }`,
          }}
        >
          <button
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
            className="w-full flex items-center justify-between px-6 py-4 text-left"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span
              className="text-sm font-medium pr-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {item.question}
            </span>
            <span
              className="text-lg transition-transform duration-200 flex-shrink-0"
              style={{
                color: 'var(--accent)',
                transform:
                  openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
              }}
            >
              +
            </span>
          </button>
          {openIndex === index && (
            <div
              className="px-6 pb-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              <p className="text-sm leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function FAQSection({
  triggerName,
  actionName,
}: FAQSectionProps) {
  const displayAction = actionName || 'multiple services'

  const faqItems: FAQItem[] = [
    {
      question: `Can I connect ${triggerName} to ${displayAction} for free?`,
      answer: `Yes! 0nMCP is open source and free to use. Install it with "npx 0nmcp" and start connecting ${triggerName} to ${displayAction} immediately. No credit card required, no trial period, no feature gates.`,
    },
    {
      question: 'How long does setup take?',
      answer: `Under 60 seconds. Run "npx 0nmcp", provide your API keys, and describe what you want to automate in plain English. 0nMCP handles the rest -- no drag-and-drop builders, no complex configurations.`,
    },
    {
      question: 'Is this better than Zapier?',
      answer:
        '0nMCP has no monthly fees, runs locally on your machine (your data never touches our servers), supports 545+ tools across 26 services, and lets you describe workflows in plain English instead of building multi-step automations by hand.',
    },
    {
      question: `Does it work with my existing ${triggerName} account?`,
      answer: `Yes. 0nMCP connects to your existing ${triggerName} account via API keys. It doesn't create separate accounts or require special permissions beyond what you already have.`,
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section className="py-16">
      <div className="section-container max-w-3xl">
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-10"
          style={{ color: 'var(--text-primary)' }}
        >
          Frequently Asked Questions
        </h2>

        <FAQAccordion items={faqItems} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </div>
    </section>
  )
}
