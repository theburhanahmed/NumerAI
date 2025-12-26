'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircleIcon,
  BookOpenIcon,
  MessageSquareIcon,
  XIcon,
} from 'lucide-react'
import { SpaceCard } from '../space/space-card'

interface HelpItem {
  id: string
  question: string
  answer: string
  category: 'numerology' | 'features' | 'account'
}

/**
 * Contextual help panel with FAQ and support
 * Updated to use cyan theme colors
 */
export function ContextualHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const helpItems: HelpItem[] = [
    {
      id: '1',
      question: 'What is a Life Path number?',
      answer:
        "Your Life Path number is the most important number in numerology. It represents your life's journey and core purpose.",
      category: 'numerology',
    },
    {
      id: '2',
      question: 'How do I use the AI Numerologist?',
      answer:
        'Click the chat icon to start a conversation. Ask any question about numerology and get instant personalized insights.',
      category: 'features',
    },
    {
      id: '3',
      question: 'How do I update my birth date?',
      answer:
        'Go to Settings > Profile and update your birth information. Your readings will automatically recalculate.',
      category: 'account',
    },
  ]

  const categories = [
    {
      id: 'all',
      label: 'All Topics',
      icon: <BookOpenIcon className="w-4 h-4" />,
    },
    {
      id: 'numerology',
      label: 'Numerology',
      icon: <HelpCircleIcon className="w-4 h-4" />,
    },
    {
      id: 'features',
      label: 'Features',
      icon: <MessageSquareIcon className="w-4 h-4" />,
    },
    {
      id: 'account',
      label: 'Account',
      icon: <HelpCircleIcon className="w-4 h-4" />,
    },
  ]

  const filteredItems =
    activeCategory === 'all'
      ? helpItems
      : helpItems.filter((item) => item.category === activeCategory)

  return (
    <>
      {/* Help Button - Updated to cyan theme */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-40 p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/50"
        whileHover={{
          scale: 1.1,
          y: -4,
        }}
        whileTap={{
          scale: 0.9,
        }}
        aria-label="Open help"
      >
        <HelpCircleIcon className="w-6 h-6" />
      </motion.button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />

            {/* Panel */}
            <motion.div
              initial={{
                x: '100%',
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: '100%',
              }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0B0F19] border-l border-cyan-500/20 z-[91] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0B0F19] border-b border-cyan-500/20 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-['Playfair_Display'] font-bold text-white">
                    Help Center
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    Find answers to common questions
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20 text-white"
                  aria-label="Close help"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Categories */}
              <div className="p-6 border-b border-cyan-500/20">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30'
                          : 'bg-[#1a2942]/40 text-white/70 border border-cyan-500/20 hover:border-cyan-500/40'
                      }`}
                    >
                      {category.icon}
                      <span className="text-sm font-medium">
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Help Items */}
              <div className="p-6 space-y-4">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.1,
                    }}
                  >
                    <SpaceCard variant="default" className="p-4">
                      <h4 className="font-semibold text-white mb-2">
                        {item.question}
                      </h4>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {item.answer}
                      </p>
                    </SpaceCard>
                  </motion.div>
                ))}
              </div>

              {/* Contact Support */}
              <div className="p-6 border-t border-cyan-500/20">
                <SpaceCard variant="premium" className="p-6 text-center">
                  <MessageSquareIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <h4 className="text-lg font-['Playfair_Display'] font-bold text-white mb-2">
                    Still need help?
                  </h4>
                  <p className="text-sm text-white/70 mb-4">
                    Our support team is here to assist you
                  </p>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl">
                    Contact Support
                  </button>
                </SpaceCard>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

