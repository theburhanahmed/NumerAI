'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface AnimatedNumberProps {
  number: string | number
  label: string
  delay?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'cyan' | 'purple' | 'blue' | 'pink' | 'gold'
}

/**
 * Animated number display with pulsing effect
 * Adapted from Magic Patterns design system
 */
export function AnimatedNumber({
  number,
  label,
  delay = 0,
  size = 'md',
  color = 'cyan',
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion()

  const sizeStyles = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-7xl',
  }

  const colorGradients = {
    cyan: 'from-cyan-400 to-blue-600',
    purple: 'from-purple-400 to-indigo-600',
    blue: 'from-blue-400 to-indigo-600',
    pink: 'from-pink-400 to-rose-600',
    gold: 'from-amber-400 to-orange-600',
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      className="relative group"
    >
      <div className="bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 text-center transition-all group-hover:scale-105 group-hover:shadow-xl">
        <motion.div
          className={`${sizeStyles[size]} font-bold bg-gradient-to-r ${colorGradients[color]} bg-clip-text text-transparent mb-2`}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.1, 1],
                }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {number}
        </motion.div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
    </motion.div>
  )
}
