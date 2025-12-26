'use client'

import React, { Children } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface StaggeredListProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

/**
 * Staggered list animation wrapper
 * Animates children with a delay between each
 */
export function StaggeredList({
  children,
  className = '',
  staggerDelay = 0.1,
  direction = 'up',
}: StaggeredListProps) {
  const prefersReducedMotion = useReducedMotion()

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 20 }
      case 'down':
        return { opacity: 0, y: -20 }
      case 'left':
        return { opacity: 0, x: 20 }
      case 'right':
        return { opacity: 0, x: -20 }
      default:
        return { opacity: 0, y: 20 }
    }
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <motion.div
          initial={getInitialPosition()}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{
            delay: index * staggerDelay,
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
