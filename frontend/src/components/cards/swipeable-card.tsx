'use client'

import React, { useState } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-media-query'

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

/**
 * Swipeable card component for mobile gestures
 * Supports left/right swipe actions
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}: SwipeableCardProps) {
  const isMobile = useIsMobile()
  const [exitX, setExitX] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!isMobile) return
    const threshold = 100
    if (info.offset.x > threshold && onSwipeRight) {
      setExitX(200)
      onSwipeRight()
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      setExitX(-200)
      onSwipeLeft()
    }
  }

  if (!isMobile) {
    // Non-swipeable version for desktop
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{
        x,
        rotate,
        opacity,
      }}
      drag="x"
      dragConstraints={{
        left: 0,
        right: 0,
      }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={
        exitX !== 0
          ? {
              x: exitX,
            }
          : {}
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
}

