'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CosmicSkeletonLoaderProps {
  variant?: 'planet' | 'card' | 'text' | 'cube'
  count?: number
  className?: string
}

/**
 * Cosmic-themed skeleton loaders for better perceived performance
 */
export function CosmicSkeletonLoader({
  variant = 'card',
  count = 1,
  className = '',
}: CosmicSkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'planet':
        return (
          <div className={`relative ${className}`}>
            <motion.div
              className="w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-500/20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        )
      case 'card':
        return (
          <motion.div
            className={`p-6 rounded-2xl bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 ${className}`}
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="space-y-4">
              <div className="h-6 bg-cyan-500/20 rounded-lg w-3/4" />
              <div className="h-4 bg-cyan-500/10 rounded-lg w-full" />
              <div className="h-4 bg-cyan-500/10 rounded-lg w-5/6" />
            </div>
          </motion.div>
        )
      case 'text':
        return (
          <motion.div
            className={`space-y-3 ${className}`}
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="h-4 bg-cyan-500/20 rounded w-full" />
            <div className="h-4 bg-cyan-500/20 rounded w-5/6" />
            <div className="h-4 bg-cyan-500/20 rounded w-4/6" />
          </motion.div>
        )
      case 'cube':
        return (
          <motion.div
            className={`w-24 h-24 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-500/20 ${className}`}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              rotateY: [0, 180, 360],
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              rotateY: {
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
            style={{
              perspective: '1000px',
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {Array.from({
        length: count,
      }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  )
}

