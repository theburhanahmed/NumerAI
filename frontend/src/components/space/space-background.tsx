'use client'

import React, { useMemo } from 'react'
import { Starfield } from '../effects/starfield'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export function SpaceBackground() {
  const prefersReducedMotion = useReducedMotion()

  // Memoize the gradient to avoid recalculation
  const gradient = useMemo(
    () => ({
      background: `
        radial-gradient(ellipse at top, #1a2942 0%, #0B0F19 50%),
        radial-gradient(ellipse at bottom, #0a1628 0%, #0B0F19 50%)
      `,
    }),
    [],
  )

  return (
    <div
      className="fixed inset-0 z-0"
      style={gradient}
      aria-hidden="true"
      role="presentation"
    >
      {/* Starfield - only render if motion is allowed */}
      {!prefersReducedMotion && <Starfield />}

      {/* Ambient glow effects */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  )
}

