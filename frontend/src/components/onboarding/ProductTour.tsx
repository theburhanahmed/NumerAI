/**
 * ProductTour Component
 * 
 * Enhanced interactive product tour for feature discovery.
 * Uses the existing InteractiveTour with additional features.
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InteractiveTour } from '../tours/interactive-tour'
import { useLocalStorage } from '@/hooks/use-local-storage'

export interface TourStep {
  target: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  route?: string
}

export interface ProductTourProps {
  tourId: string
  steps: TourStep[]
  autoStart?: boolean
  onComplete?: () => void
  onSkip?: () => void
}

const defaultTours: Record<string, TourStep[]> = {
  dashboard: [
    {
      target: '[data-tour="dashboard-overview"]',
      title: 'Your Numerology Dashboard',
      content: 'Welcome to your dashboard! Here you can see your numerology overview, daily readings, and quick access to key features.',
      position: 'bottom',
    },
    {
      target: '[data-tour="daily-reading"]',
      title: 'Daily Reading',
      content: 'Get personalized numerology insights for each day. Check back daily for new guidance!',
      position: 'right',
      route: '/daily-reading',
    },
    {
      target: '[data-tour="birth-chart"]',
      title: 'Birth Chart',
      content: 'View your complete numerology profile including Life Path, Destiny, and Soul Urge numbers.',
      position: 'right',
      route: '/birth-chart',
    },
    {
      target: '[data-tour="ai-chat"]',
      title: 'AI Numerologist',
      content: 'Chat with our AI numerologist to get instant answers to your numerology questions.',
      position: 'right',
      route: '/ai-chat',
    },
  ],
  'daily-reading': [
    {
      target: '[data-tour="reading-card"]',
      title: 'Daily Numerology Reading',
      content: 'Your daily reading provides personalized insights based on today\'s numerological energy.',
      position: 'bottom',
    },
    {
      target: '[data-tour="date-picker"]',
      title: 'Explore Other Dates',
      content: 'Select any date to see numerology insights for that day. Perfect for planning important events!',
      position: 'top',
    },
  ],
  'birth-chart': [
    {
      target: '[data-tour="life-path"]',
      title: 'Life Path Number',
      content: 'Your Life Path number reveals your life\'s purpose and the lessons you\'re here to learn.',
      position: 'right',
    },
    {
      target: '[data-tour="destiny-number"]',
      title: 'Destiny Number',
      content: 'Your Destiny number shows what you\'re meant to achieve in this lifetime.',
      position: 'right',
    },
  ],
  'ai-chat': [
    {
      target: '[data-tour="chat-input"]',
      title: 'AI Chat',
      content: 'Ask any numerology question and get instant, personalized answers from our AI numerologist.',
      position: 'top',
    },
    {
      target: '[data-tour="suggested-questions"]',
      title: 'Suggested Questions',
      content: 'Not sure what to ask? Try these suggested questions to get started.',
      position: 'top',
    },
  ],
}

export function ProductTour({
  tourId,
  steps,
  autoStart = false,
  onComplete,
  onSkip,
}: ProductTourProps) {
  const [showTour, setShowTour] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    `tour-${tourId}-completed`,
    false
  )
  const router = useRouter()

  useEffect(() => {
    if (autoStart && !hasSeenTour) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [autoStart, hasSeenTour])

  const handleComplete = () => {
    setHasSeenTour(true)
    setShowTour(false)
    onComplete?.()
  }

  const handleSkip = () => {
    setHasSeenTour(true)
    setShowTour(false)
    onSkip?.()
  }

  const handleStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex]
    if (step.route) {
      // Navigate to the route if specified
      router.push(step.route)
    }
  }

  if (!showTour || hasSeenTour) {
    return null
  }

  return (
    <InteractiveTour
      steps={steps}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  )
}

/**
 * Hook to get tour steps for a specific page
 */
export function useTourSteps(page: keyof typeof defaultTours): TourStep[] {
  return defaultTours[page] || []
}

/**
 * Hook to start a tour programmatically
 */
export function useProductTour(tourId: string) {
  const [showTour, setShowTour] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    `tour-${tourId}-completed`,
    false
  )

  const startTour = () => {
    if (!hasSeenTour) {
      setShowTour(true)
    }
  }

  const resetTour = () => {
    setHasSeenTour(false)
    setShowTour(false)
  }

  return {
    showTour,
    startTour,
    resetTour,
    hasSeenTour,
  }
}

export { defaultTours }

