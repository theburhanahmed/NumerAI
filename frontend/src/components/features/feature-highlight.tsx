'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface FeatureHighlightProps {
  title: string
  description: string
  badge?: string
  children: React.ReactNode
}

/**
 * Highlight component to draw attention to new or important features
 * Uses pulsing animation and cosmic styling
 */
export function FeatureHighlight({
  title,
  description,
  badge = 'NEW',
  children,
}: FeatureHighlightProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="relative">
      {/* Pulsing Glow */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Content */}
      <div className="relative">
        {/* Badge */}
        <motion.div
          className="absolute -top-3 -right-3 z-10"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, -4, 0],
                }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full border border-cyan-400/50 shadow-lg shadow-cyan-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white">{badge}</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="bg-[#1a2942]/60 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 p-6">
          <div className="mb-4">
            <h3 className="text-xl font-['Playfair_Display'] font-bold text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-white/70">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
