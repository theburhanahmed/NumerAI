'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircleIcon } from 'lucide-react'

interface CosmicTooltipProps {
  content: string
  children?: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click'
  icon?: boolean
}

/**
 * Cosmic-themed tooltip with glassmorphism
 * Provides contextual help for complex features
 * Fixed z-index to prevent overlapping issues
 */
export function CosmicTooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  icon = false,
}: CosmicTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-cyan-500/80',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-cyan-500/80',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-cyan-500/80',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-cyan-500/80',
  }

  const handleInteraction = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible)
    }
  }

  const triggerProps =
    trigger === 'hover'
      ? {
          onMouseEnter: () => setIsVisible(true),
          onMouseLeave: () => setIsVisible(false),
          onFocus: () => setIsVisible(true),
          onBlur: () => setIsVisible(false),
        }
      : {
          onClick: handleInteraction,
        }

  return (
    <div className="relative inline-block">
      <div
        {...triggerProps}
        className="cursor-help"
        role="button"
        aria-label="Show help"
        tabIndex={0}
      >
        {icon ? (
          <HelpCircleIcon className="w-5 h-5 text-cyan-400 hover:text-cyan-300 transition-colors" />
        ) : (
          children
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
            }}
            transition={{
              duration: 0.2,
            }}
            className={`absolute z-[9999] ${positionStyles[position]}`}
            style={{
              pointerEvents: 'none',
            }}
          >
            <div className="relative">
              {/* Tooltip Content */}
              <div className="px-4 py-3 bg-[#1a2942]/95 backdrop-blur-xl rounded-xl border border-cyan-500/30 shadow-xl shadow-cyan-500/20 max-w-xs pointer-events-auto">
                <p className="text-sm text-white leading-relaxed">{content}</p>
              </div>

              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-4 border-transparent ${arrowStyles[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

