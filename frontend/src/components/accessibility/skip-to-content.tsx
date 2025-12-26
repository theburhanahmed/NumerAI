'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Skip to main content link for keyboard navigation
 * Critical for accessibility
 */
export function SkipToContent() {
  return (
    <motion.a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] px-6 py-3 bg-cyan-500 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
      initial={{
        opacity: 0,
      }}
      whileFocus={{
        opacity: 1,
      }}
    >
      Skip to main content
    </motion.a>
  )
}

