'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SpaceCard } from '@/components/space/space-card'
import { SpaceButton } from '@/components/space/space-button'
import { SpacePlanet } from '@/components/space/space-planet'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  planetType?: 'earth' | 'gas-giant' | 'ringed' | 'moon'
}

/**
 * Empty state component with cosmic styling
 * Adapted from Magic Patterns design system
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  planetType = 'moon',
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SpaceCard
        variant="premium"
        className="p-12 text-center relative overflow-hidden"
      >
        {/* Background Planet */}
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <SpacePlanet type={planetType} size="lg" />
        </div>

        <div className="relative z-10">
          {/* Icon */}
          {icon ? (
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20"
            >
              <div className="text-cyan-400">{icon}</div>
            </motion.div>
          ) : (
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <SpacePlanet type={planetType} size="sm" />
            </motion.div>
          )}

          {/* Title */}
          <motion.h3
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-['Playfair_Display'] font-bold text-white mb-3"
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 mb-6 max-w-md mx-auto leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Action Button */}
          {actionLabel && onAction && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SpaceButton variant="primary" onClick={onAction}>
                {actionLabel}
              </SpaceButton>
            </motion.div>
          )}
        </div>
      </SpaceCard>
    </motion.div>
  )
}
