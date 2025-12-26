'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface PageTransitionProps {
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
}

/**
 * Page transition wrapper with smooth animations
 * Respects reduced motion preferences
 */
export function PageTransition({ children, mode = 'wait' }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -20,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

