'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function SkeletonCard() {
  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl p-6 md:p-8">
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/2"></div>
          </div>
        </div>
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-full"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-5/6"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-4/6"></div>
        </div>
        {/* Footer skeleton */}
        <div className="flex gap-3 pt-4">
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex-1"></div>
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex-1"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({
  width = 'full',
}: {
  width?: 'full' | '3/4' | '1/2' | '1/4'
}) {
  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  }

  return (
    <motion.div
      className={`h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg ${widths[width]}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function SkeletonCircle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  return (
    <motion.div
      className={`${sizes[size]} bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

