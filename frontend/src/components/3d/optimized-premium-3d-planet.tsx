'use client'

import React, { Suspense, lazy } from 'react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useIsMobile } from '@/hooks/use-media-query'
import { CosmicSkeletonLoader } from '@/components/cosmic/cosmic-skeleton-loader'

// Lazy load the heavy 3D component
const Premium3DPlanet = lazy(() =>
  import('./premium-3d-planet').then((module) => ({
    default: module.Premium3DPlanet,
  }))
)

interface OptimizedPremium3DPlanetProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'giant'
  type?: 'earth' | 'gas-giant' | 'ice' | 'lava'
  withRings?: boolean
  withMoons?: boolean
  className?: string
}

/**
 * Performance-optimized wrapper for Premium3DPlanet
 * - Lazy loads the component
 * - Only renders when visible
 * - Respects reduced motion preferences
 * - Reduces complexity on mobile
 * - Shows skeleton loader while loading
 */
export function OptimizedPremium3DPlanet({
  size = 'lg',
  type = 'earth',
  withRings = true,
  withMoons = true,
  className = '',
}: OptimizedPremium3DPlanetProps) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  })
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  // Simplified static version for reduced motion
  if (prefersReducedMotion) {
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
        <div
          className="w-64 h-64 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 35%, #4a9eff 0%, #1e5a9e 40%, #0a2540 100%)',
            boxShadow:
              '0 40px 120px rgba(0, 0, 0, 0.6), 0 0 80px rgba(0, 212, 255, 0.3)',
          }}
          role="img"
          aria-label="Cosmic planet decoration"
        />
      </div>
    )
  }

  // Reduce complexity on mobile for better performance
  const mobileOptimizedProps = {
    size: isMobile && size === 'giant' ? 'xl' as const : size,
    type,
    withRings: isMobile ? false : withRings,
    withMoons: isMobile ? false : withMoons,
    className: '',
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {isVisible ? (
        <Suspense fallback={<CosmicSkeletonLoader variant="planet" />}>
          <Premium3DPlanet {...mobileOptimizedProps} />
        </Suspense>
      ) : (
        <CosmicSkeletonLoader variant="planet" />
      )}
    </div>
  )
}

