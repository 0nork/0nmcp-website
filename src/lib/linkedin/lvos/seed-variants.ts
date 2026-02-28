export interface SeedVariant {
  variant_key: string
  question_text: string
  context_hint: string
}

/**
 * 8 seed follow-up question variants.
 * These are seeded into the lvos_variants table on first run.
 * Thompson Sampling will evolve these over time.
 */
export const SEED_VARIANTS: SeedVariant[] = [
  {
    variant_key: 'seed_industry_insight',
    question_text: "What's one thing about your industry you wish more people understood?",
    context_hint: 'Reveals domain expertise and passion points',
  },
  {
    variant_key: 'seed_recent_win',
    question_text: "What's a recent win you'd like to share with your network?",
    context_hint: 'Captures positive momentum and achievement style',
  },
  {
    variant_key: 'seed_change_industry',
    question_text: 'If you could change one thing about how your industry works, what would it be?',
    context_hint: 'Shows thought leadership and critical thinking',
  },
  {
    variant_key: 'seed_best_advice',
    question_text: "What's the best career advice you've ever received?",
    context_hint: 'Reveals values and mentorship orientation',
  },
  {
    variant_key: 'seed_exciting_trend',
    question_text: 'What trend in your field are you most excited about?',
    context_hint: 'Identifies forward-thinking and innovation focus',
  },
  {
    variant_key: 'seed_challenge_overcome',
    question_text: 'Tell me about a challenge you recently overcame at work.',
    context_hint: 'Shows resilience and problem-solving style',
  },
  {
    variant_key: 'seed_surprising_learning',
    question_text: "What's something you've learned this month that surprised you?",
    context_hint: 'Captures curiosity and growth mindset',
  },
  {
    variant_key: 'seed_advice_newcomer',
    question_text: 'If you could give one piece of advice to someone starting in your field, what would it be?',
    context_hint: 'Reveals mentoring voice and core beliefs',
  },
]
