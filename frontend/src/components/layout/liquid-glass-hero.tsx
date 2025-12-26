'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface LiquidGlassHeroProps {
  title: string
  subtitle: string
  children?: React.ReactNode
  compact?: boolean
  badge?: string
}

/**
 * Liquid glass hero section with animated gradients
 * Adapted from Magic Patterns design system
 */
export function LiquidGlassHero({
  title,
  subtitle,
  children,
  compact = false,
  badge = 'AI-Powered Numerology',
}: LiquidGlassHeroProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      className={`relative ${compact ? 'py-16 md:py-20' : 'py-20 md:py-32'} px-4 sm:px-6 overflow-hidden`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </div>

      {/* Floating shapes */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle, ${['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)', 'rgba(59, 130, 246, 0.15)'][i % 3]} 0%, transparent 70%)`,
                left: `${(i * 20) % 100}%`,
                top: `${(i * 30) % 100}%`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Icon badge */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-purple-200 dark:border-purple-500/30 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            {badge}
          </span>
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`${compact ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl'} font-bold mb-6 leading-tight font-['Playfair_Display']`}
        >
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${compact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-medium`}
        >
          {subtitle}
        </motion.p>

        {/* CTA buttons */}
        {children && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {children}
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-500 to-transparent" />
      </div>
    </section>
  )
}

