/**
 * Lazy Loading Utilities
 * 
 * Utilities for lazy loading heavy components and modules.
 */

import { ComponentType, lazy, LazyExoticComponent } from 'react'
import dynamic from 'next/dynamic'

/**
 * Lazy load a component with loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return lazy(importFunc)
}

/**
 * Dynamic import with Next.js dynamic
 */
export function dynamicLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: () => JSX.Element | null
    ssr?: boolean
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || (() => null),
    ssr: options?.ssr !== false,
  })
}

/**
 * Lazy load 3D components (heavy)
 */
export const Lazy3DComponents = {
  CrystalNumerologyCube: dynamicLoad(
    () => import('@/components/3d/crystal-numerology-cube'),
    { ssr: false }
  ),
  Premium3DPlanet: dynamicLoad(
    () => import('@/components/3d/premium-3d-planet'),
    { ssr: false }
  ),
  OptimizedPremium3DPlanet: dynamicLoad(
    () => import('@/components/3d/optimized-premium-3d-planet'),
    { ssr: false }
  ),
}

/**
 * Lazy load chart components (if using recharts/chart.js)
 */
export const LazyCharts = {
  // Will be implemented when charts are added
  // NumerologyChart: dynamicLoad(() => import('@/components/charts/NumerologyChart')),
}

/**
 * Lazy load heavy feature modules
 */
export const LazyFeatures = {
  // Add heavy feature modules here as needed
}

/**
 * Preload a component before it's needed
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  if (typeof window !== 'undefined') {
    importFunc()
  }
}

// Fix React import
import React from 'react'

/**
 * Intersection Observer hook for lazy loading on scroll
 */
export function useLazyLoad(
  threshold = 0.1,
  rootMargin = '50px'
) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) {
            observer.unobserve(ref.current)
          }
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, rootMargin])

  return { ref, isVisible }
}

