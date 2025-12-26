'use client'

import React from 'react'
import { AmbientParticles } from '../effects/ambient-particles'
import { FloatingOrbs } from '../effects/floating-orbs'

interface PageLayoutProps {
  children: React.ReactNode
  showNav?: boolean
  className?: string
  navbar?: React.ReactNode
}

export function PageLayout({
  children,
  showNav = true,
  className = '',
  navbar,
}: PageLayoutProps) {
  return (
    <div
      className={`w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden ${className}`}
    >
      <AmbientParticles />
      <FloatingOrbs />
      {showNav && navbar}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

