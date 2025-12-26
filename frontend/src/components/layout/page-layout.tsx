'use client'

import React from 'react'
import { AmbientParticles } from '@/components/effects/ambient-particles'
import { FloatingOrbs } from '@/components/effects/floating-orbs'
import { AppNavbar } from '@/components/navigation/app-navbar'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface PageLayoutProps {
  children: React.ReactNode
  showNav?: boolean
  className?: string
  showEffects?: boolean
}

/**
 * Base page layout with ambient effects and navigation
 * Adapted from Magic Patterns design system for Next.js
 */
export function PageLayout({
  children,
  showNav = true,
  className = '',
  showEffects = true,
}: PageLayoutProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={`w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden ${className}`}
    >
      {showEffects && !prefersReducedMotion && (
        <>
          <AmbientParticles />
          <FloatingOrbs />
        </>
      )}
      {showNav && <AppNavbar />}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

