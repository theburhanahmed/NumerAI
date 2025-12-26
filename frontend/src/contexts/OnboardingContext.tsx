'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface OnboardingContextType {
  isOnboardingComplete: boolean
  showOnboarding: boolean
  completeOnboarding: () => void
  dismissOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check localStorage for onboarding status
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('onboarding_complete') === 'true'
      const dismissed = localStorage.getItem('onboarding_dismissed') === 'true'
      setIsOnboardingComplete(completed)
      // Show onboarding if not completed and not dismissed
      setShowOnboarding(!completed && !dismissed)
    }
  }, [])

  const completeOnboarding = () => {
    setIsOnboardingComplete(true)
    setShowOnboarding(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_complete', 'true')
    }
  }

  const dismissOnboarding = () => {
    setShowOnboarding(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_dismissed', 'true')
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        showOnboarding,
        completeOnboarding,
        dismissOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

