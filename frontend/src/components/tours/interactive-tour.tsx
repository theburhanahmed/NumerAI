'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react'
import { SpaceButton } from '../space/space-button'

interface TourStep {
  target: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface InteractiveTourProps {
  steps: TourStep[]
  onComplete: () => void
  onSkip: () => void
}

/**
 * Interactive product tour with cosmic theme
 * Guides users through key features
 */
export function InteractiveTour({
  steps,
  onComplete,
  onSkip,
}: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
      setIsVisible(false)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
      />

      {/* Tour Card */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.9,
        }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md mx-4"
      >
        <div className="bg-[#1a2942]/95 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                <span className="text-sm font-semibold text-cyan-400">
                  {currentStep + 1} / {steps.length}
                </span>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Skip tour"
            >
              <XIcon className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-2xl font-['Playfair_Display'] font-bold text-white mb-3">
              {step.title}
            </h3>
            <p className="text-white/80 leading-relaxed">{step.content}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-1 bg-[#0a1628]/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{
                  duration: 0.3,
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`text-sm font-medium ${currentStep === 0 ? 'text-white/30 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300'}`}
            >
              ← Back
            </button>

            <div className="flex gap-2">
              <SpaceButton variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tour
              </SpaceButton>
              <SpaceButton
                variant="primary"
                size="sm"
                onClick={handleNext}
                icon={
                  isLastStep ? undefined : (
                    <ArrowRightIcon className="w-4 h-4" />
                  )
                }
              >
                {isLastStep ? 'Get Started' : 'Next'}
              </SpaceButton>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

