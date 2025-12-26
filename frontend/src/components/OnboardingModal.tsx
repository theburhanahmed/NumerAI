'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, SparklesIcon, ArrowRightIcon } from 'lucide-react'
import { SpaceCard } from './space/space-card'
import { SpaceButton } from './space/space-button'
import { SpacePlanet } from './space/space-planet'
import { useOnboarding } from '@/contexts/OnboardingContext'

export function OnboardingModal() {
  const router = useRouter()
  const { showOnboarding, dismissOnboarding, completeOnboarding } = useOnboarding()

  if (!showOnboarding) return null

  const handleStart = () => {
    router.push('/onboarding')
  }

  const handleDismiss = () => {
    dismissOnboarding()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        {/* Modal */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: 20,
          }}
          transition={{
            type: 'spring',
            damping: 25,
          }}
          className="relative z-10 w-full max-w-lg"
        >
          <SpaceCard variant="premium" className="p-8 relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-xl bg-[#0a1628]/60 backdrop-blur-xl border border-cyan-500/20 text-white/70 hover:text-white hover:bg-[#0a1628]/80 transition-all"
            >
              <XIcon className="w-5 h-5" />
            </button>

            {/* Decorative Planet */}
            <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
              <SpacePlanet type="earth" size="md" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  delay: 0.2,
                  type: 'spring',
                }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30"
              >
                <SparklesIcon className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl font-['Playfair_Display'] font-bold text-white mb-4">
                Welcome to NumerAI
              </h2>

              <p className="text-white/70 mb-8 leading-relaxed">
                Let's personalize your cosmic journey with a quick setup. We'll
                gather some information to create accurate numerology readings
                tailored just for you.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  {
                    icon: '🎯',
                    label: 'Personalized',
                  },
                  {
                    icon: '✨',
                    label: 'Accurate',
                  },
                  {
                    icon: '🚀',
                    label: 'Insightful',
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.3 + i * 0.1,
                    }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <p className="text-sm text-white/70">{feature.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <SpaceButton
                  variant="primary"
                  size="lg"
                  onClick={handleStart}
                  icon={<ArrowRightIcon className="w-5 h-5" />}
                  className="flex-1"
                >
                  Get Started
                </SpaceButton>
                <SpaceButton
                  variant="ghost"
                  size="lg"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Maybe Later
                </SpaceButton>
              </div>

              <p className="text-xs text-white/50 mt-4">
                Takes less than 2 minutes
              </p>
            </div>
          </SpaceCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

