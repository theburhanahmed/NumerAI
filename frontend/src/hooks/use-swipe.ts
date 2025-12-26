/**
 * useSwipe Hook
 * 
 * Hook for detecting swipe gestures on touch devices.
 */

import { useState, useRef, useEffect, useCallback } from 'react'

export interface SwipeOptions {
  threshold?: number // Minimum distance for a swipe (default: 50px)
  velocityThreshold?: number // Minimum velocity for a swipe (default: 0.3)
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  preventDefault?: boolean
}

export interface SwipeState {
  swiping: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
}

export function useSwipe(options: SwipeOptions = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    preventDefault = true,
  } = options

  const [swipeState, setSwipeState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    distance: 0,
  })

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault()
      }
      const touch = e.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      setSwipeState({
        swiping: true,
        direction: null,
        distance: 0,
      })
    },
    [preventDefault]
  )

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = touch.clientY - touchStart.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let direction: 'left' | 'right' | 'up' | 'down' | null = null
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    setSwipeState({
      swiping: true,
      direction,
      distance,
    })
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStart.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const time = Date.now() - touchStart.current.time
      const velocity = distance / time

      let direction: 'left' | 'right' | 'up' | 'down' | null = null
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      if (distance >= threshold && velocity >= velocityThreshold) {
        switch (direction) {
          case 'left':
            onSwipeLeft?.()
            break
          case 'right':
            onSwipeRight?.()
            break
          case 'up':
            onSwipeUp?.()
            break
          case 'down':
            onSwipeDown?.()
            break
        }
      }

      setSwipeState({
        swiping: false,
        direction: null,
        distance: 0,
      })
      touchStart.current = null
    },
    [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  )

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart)
        elementRef.current.removeEventListener('touchmove', handleTouchMove)
        elementRef.current.removeEventListener('touchend', handleTouchEnd)
      }

      elementRef.current = node

      if (node) {
        node.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
        node.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
        node.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })
      }
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]
  )

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart)
        elementRef.current.removeEventListener('touchmove', handleTouchMove)
        elementRef.current.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    ref: setRef,
    ...swipeState,
  }
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void> | void,
  options?: { threshold?: number; enabled?: boolean }
) {
  const { threshold = 80, enabled = true } = options || {}
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const { ref, swiping, direction, distance } = useSwipe({
    onSwipeDown: async () => {
      if (enabled && distance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      }
    },
    preventDefault: false,
  })

  useEffect(() => {
    if (swiping && direction === 'down') {
      setPullDistance(Math.min(distance, threshold * 1.5))
    } else if (!swiping) {
      setPullDistance(0)
    }
  }, [swiping, direction, distance, threshold])

  return {
    ref,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
  }
}

