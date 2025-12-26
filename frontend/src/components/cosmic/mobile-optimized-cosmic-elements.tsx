'use client'

import React from 'react'
import { useIsMobile } from '@/hooks/use-media-query'
import {
  FloatingNeonRunes,
  ParticleSwarm,
  NebulaStreaks,
  CosmicFog,
} from './cosmic-elements'

interface MobileOptimizedCosmicElementsProps {
  className?: string
}

/**
 * Mobile-optimized version of cosmic elements that reduces particle counts
 */
export function MobileOptimizedCosmicElements({
  className = '',
}: MobileOptimizedCosmicElementsProps) {
  const isMobile = useIsMobile()

  return (
    <div className={className}>
      {!isMobile && <FloatingNeonRunes count={8} />}
      <ParticleSwarm count={isMobile ? 20 : 50} />
      <NebulaStreaks />
      <CosmicFog />
    </div>
  )
}

/**
 * Alias for MobileOptimizedCosmicElements for backward compatibility
 */
export function MobileFloatingParticles({
  count,
  className = '',
}: {
  count?: number
  className?: string
}) {
  return <MobileOptimizedCosmicElements className={className} />
}

