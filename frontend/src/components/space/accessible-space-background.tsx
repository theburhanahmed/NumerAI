'use client'

import React from 'react'
import { SpaceBackground } from './space-background'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Accessible wrapper for SpaceBackground that respects motion preferences
 */
export function AccessibleSpaceBackground() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    // Static background for users who prefer reduced motion
    return (
      <div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(to bottom, #0B0F19 0%, #1a2942 100%)',
        }}
        aria-hidden="true"
      />
    )
  }

  return <SpaceBackground />
}

