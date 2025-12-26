'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2Icon, SparklesIcon } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  variant?: 'default' | 'cosmic'
}

export function LoadingSpinner({
  size = 'md',
  message,
  variant = 'default',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }
  const messageSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  if (variant === 'cosmic') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          className="relative"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Outer ring */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full border-4 border-cyan-500/20`}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* Inner spinning element */}
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-cyan-500 border-r-cyan-500`}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <SparklesIcon className="w-1/2 h-1/2 text-cyan-400" />
          </div>
        </motion.div>

        {message && (
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className={`${messageSizes[size]} text-white/70 text-center`}
          >
            {message}
          </motion.p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2Icon
        className={`${sizeClasses[size]} text-cyan-400 animate-spin`}
      />
      {message && (
        <p className={`${messageSizes[size]} text-white/70 text-center`}>
          {message}
        </p>
      )}
    </div>
  )
}

