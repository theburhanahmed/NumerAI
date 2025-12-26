'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface CrystalNumerologyCubeProps {
  number: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'cyan' | 'purple' | 'blue' | 'pink' | 'gold'
  className?: string
  onClick?: () => void
  animate?: boolean
}

/**
 * 3D crystal cubes for displaying numerology numbers
 * Features glassmorphism and glow effects
 * Adapted from Magic Patterns design system
 */
export function CrystalNumerologyCube({
  number,
  size = 'md',
  color = 'cyan',
  className = '',
  onClick,
  animate = true,
}: CrystalNumerologyCubeProps) {
  const prefersReducedMotion = useReducedMotion()
  const shouldAnimate = animate && !prefersReducedMotion

  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  }

  const fontSizeMap = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  }

  const colorMap = {
    cyan: {
      primary: '#00d4ff',
      secondary: '#4a9eff',
      glow: 'rgba(0, 212, 255, 0.6)',
      gradient: 'from-cyan-400 to-blue-600',
    },
    purple: {
      primary: '#a855f7',
      secondary: '#8b5cf6',
      glow: 'rgba(168, 85, 247, 0.6)',
      gradient: 'from-purple-400 to-indigo-600',
    },
    blue: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      glow: 'rgba(59, 130, 246, 0.6)',
      gradient: 'from-blue-400 to-indigo-600',
    },
    pink: {
      primary: '#ec4899',
      secondary: '#db2777',
      glow: 'rgba(236, 72, 153, 0.6)',
      gradient: 'from-pink-400 to-rose-600',
    },
    gold: {
      primary: '#f59e0b',
      secondary: '#d97706',
      glow: 'rgba(245, 158, 11, 0.6)',
      gradient: 'from-amber-400 to-orange-600',
    },
  }

  const colors = colorMap[color]

  const cubeAnimation = shouldAnimate
    ? {
        rotateY: [0, 360],
        rotateX: [0, 15, 0],
      }
    : {}

  const cubeTransition = shouldAnimate
    ? {
        rotateY: {
          duration: 20,
          repeat: Infinity,
          ease: 'linear' as const,
        },
        rotateX: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : undefined

  return (
    <motion.div
      className={`relative ${sizeMap[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        perspective: '1000px',
      }}
      animate={cubeAnimation}
      transition={cubeTransition}
      whileHover={
        onClick
          ? {
              scale: 1.1,
              rotateY: 180,
              transition: {
                duration: 0.6,
              },
            }
          : shouldAnimate
          ? {
              scale: 1.05,
            }
          : undefined
      }
      onClick={onClick}
    >
      {/* Crystal Cube */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-15deg) rotateY(30deg)',
        }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}40 0%, ${colors.secondary}20 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.primary}60`,
            boxShadow: `
              inset 0 0 30px ${colors.glow},
              0 0 40px ${colors.glow},
              0 20px 60px rgba(0, 0, 0, 0.5)
            `,
            transform: 'translateZ(50px)',
          }}
        >
          <motion.span
            className={`${fontSizeMap[size]} font-bold font-['Playfair_Display']`}
            style={{
              color: colors.primary,
              textShadow: `
                0 0 20px ${colors.glow},
                0 0 40px ${colors.glow},
                0 0 60px ${colors.glow}
              `,
            }}
            animate={
              shouldAnimate
                ? {
                    textShadow: [
                      `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
                      `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
                      `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {number}
          </motion.span>
        </div>

        {/* Top Face */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(180deg, ${colors.primary}50 0%, ${colors.secondary}30 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.primary}50`,
            boxShadow: `inset 0 0 20px ${colors.glow}`,
            transform: 'rotateX(90deg) translateZ(50px)',
          }}
        />

        {/* Right Face */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(90deg, ${colors.secondary}30 0%, ${colors.primary}20 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.primary}40`,
            boxShadow: `inset 0 0 20px ${colors.glow}`,
            transform: 'rotateY(90deg) translateZ(50px)',
          }}
        />

        {/* Specular Highlights */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 40%)',
            transform: 'translateZ(51px)',
            filter: 'blur(4px)',
          }}
          animate={
            shouldAnimate
              ? {
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Bloom Glow */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(30px)',
          transform: 'scale(1.5)',
        }}
        animate={
          shouldAnimate
            ? {
                opacity: [0.4, 0.8, 0.4],
                scale: [1.5, 1.7, 1.5],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Floating Animation */}
      {shouldAnimate && (
        <motion.div
          className="absolute inset-0"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  )
}
