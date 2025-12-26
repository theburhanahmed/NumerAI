'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BaseCard, type BaseCardProps } from '@/components/base/BaseCard'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface SpaceCardProps extends Omit<BaseCardProps, 'variant'> {
  children: React.ReactNode
  variant?: 'default' | 'premium' | 'interactive' | 'glass' | 'neon'
  onClick?: () => void
  glow?: boolean
  as?: 'div' | 'article' | 'section'
}

/**
 * SpaceCard - Glassmorphism card component with cosmic theme
 * Now uses BaseCard with design system variants
 * 
 * Variants:
 * - default: Standard glassmorphism
 * - premium: Enhanced with stronger border and shadow
 * - interactive: Cursor pointer and click handling
 * - glass: Pure glassmorphism effect
 * - neon: Neon border glow effect
 */
export function SpaceCard({
  children,
  variant = 'default',
  className = '',
  onClick,
  hover = true,
  glow = false,
  as = 'div',
  ...props
}: SpaceCardProps) {
  const prefersReducedMotion = useReducedMotion()
  
  // Map variant to BaseCard variant
  const baseVariant = variant === 'glass' ? 'glass' : variant === 'premium' ? 'glassPremium' : 'space'
  
  const variantStyles = {
    default: '',
    premium: 'shadow-cyan-500/10',
    interactive: '',
    glass: '',
    neon: 'border-cyan-400 shadow-cyan-500/30',
  }
  
  const glowStyles = glow
    ? 'shadow-[0_0_20px_rgba(0,212,255,0.3),0_0_40px_rgba(0,212,255,0.2)]'
    : ''

  const motionProps = prefersReducedMotion
    ? {}
    : {
        whileHover: onClick && hover
          ? {
              scale: 1.02,
            }
          : hover
          ? {
              y: -4,
            }
          : undefined,
        whileTap: onClick
          ? {
              scale: 0.98,
            }
          : undefined,
      }

  const CardComponent = onClick ? motion.button : motion[as]

  return (
    <CardComponent
      onClick={onClick}
      {...motionProps}
    >
      <BaseCard
        variant={baseVariant}
        hover={hover}
        interactive={!!onClick}
        className={cn(
          'rounded-3xl',
          variantStyles[variant],
          glowStyles,
          className
        )}
        {...props}
      >
        {children}
      </BaseCard>
    </CardComponent>
  )
}

