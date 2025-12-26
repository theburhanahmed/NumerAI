/**
 * FAQ Page
 * 
 * Comprehensive FAQ with searchable, categorized questions.
 */

'use client'

import * as React from "react"
import { SearchIcon, ChevronDownIcon } from "lucide-react"
import { BaseInput } from "@/components/base/BaseInput"
import { BaseCard } from "@/components/base/BaseCard"
import { CosmicPageLayout } from "@/components/cosmic/cosmic-page-layout"
import { Container } from "@/components/layout/Container"
import { cn } from "@/lib/utils"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqCategories = [
  'Getting Started',
  'Numerology Basics',
  'Features',
  'Subscription',
  'Technical',
  'Privacy & Security',
]

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is numerology?',
    answer: 'Numerology is the study of numbers and their mystical significance. It uses your name and birth date to reveal insights about your personality, life path, and future.',
    category: 'Numerology Basics',
  },
  {
    id: '2',
    question: 'How do I get started?',
    answer: 'Simply create an account, complete your profile with your name and birth date, and we\'ll calculate your numerology profile. You can then explore daily readings, birth charts, and more.',
    category: 'Getting Started',
  },
  {
    id: '3',
    question: 'What is a Life Path number?',
    answer: 'Your Life Path number is the most important number in your numerology profile. It reveals your life\'s purpose, natural talents, and the lessons you\'re here to learn.',
    category: 'Numerology Basics',
  },
  {
    id: '4',
    question: 'What features are available in the free plan?',
    answer: 'The free plan includes basic Life Path analysis, 3 daily readings per day, basic name analysis, Personal Year forecast, and community forum access.',
    category: 'Subscription',
  },
  {
    id: '5',
    question: 'What\'s included in Premium?',
    answer: 'Premium includes everything in Free, plus unlimited daily readings, 10 full reports per month, AI numerologist chat, all advanced calculators, name & phone numerology, personalized remedies, compatibility analysis, and birth chart & forecasts.',
    category: 'Subscription',
  },
  {
    id: '6',
    question: 'How accurate is the AI numerologist?',
    answer: 'Our AI numerologist is trained on extensive numerology knowledge and provides accurate interpretations. However, numerology is a tool for guidance and self-reflection, not absolute prediction.',
    category: 'Features',
  },
  {
    id: '7',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to premium features until the end of your billing period.',
    category: 'Subscription',
  },
  {
    id: '8',
    question: 'Is my data secure?',
    answer: 'Yes, we use SSL encryption and follow GDPR guidelines. Your personal information is never shared with third parties. You can export or delete your data at any time.',
    category: 'Privacy & Security',
  },
  {
    id: '9',
    question: 'How do I calculate compatibility?',
    answer: 'Go to the Compatibility page and add the person you want to compare with. We\'ll analyze both numerology profiles and provide detailed compatibility insights.',
    category: 'Features',
  },
  {
    id: '10',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and PayPal through our secure payment processor, Stripe.',
    category: 'Subscription',
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())

  const filteredFAQs = React.useMemo(() => {
    let filtered = faqData

    if (selectedCategory) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.category.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <CosmicPageLayout>
      <Container size="xl" className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 font-['Playfair_Display'] text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Find answers to common questions about NumerAI
          </p>

          {/* Search */}
          <div className="mb-8">
            <BaseInput
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm transition-colors",
                !selectedCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent"
              )}
            >
              All
            </button>
            {faqCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm transition-colors",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <BaseCard variant="default" padding="lg" className="text-center">
                <p className="text-muted-foreground">
                  No FAQs found matching your search.
                </p>
              </BaseCard>
            ) : (
              filteredFAQs.map((faq) => (
                <BaseCard
                  key={faq.id}
                  variant="space"
                  padding="md"
                  className="cursor-pointer"
                  onClick={() => toggleItem(faq.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      {openItems.has(faq.id) && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                    <ChevronDownIcon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-transform",
                        openItems.has(faq.id) && "transform rotate-180"
                      )}
                    />
                  </div>
                </BaseCard>
              ))
            )}
          </div>
        </div>
      </Container>
    </CosmicPageLayout>
  )
}

