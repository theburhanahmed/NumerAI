'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BaseButton, type BaseButtonProps } from '@/components/base/BaseButton'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface GlassButtonProps extends Omit<BaseButtonProps, 'variant'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'liquid'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

/**
 * Glassmorphism button with various variants
 * Now uses BaseButton with design system variants
 */
export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  fullWidth = false,
  ...props
}: GlassButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  
  // Map size to BaseButton size
  const baseSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'
  
  // Map variant to BaseButton variant
  const baseVariant = variant === 'primary' || variant === 'liquid' ? 'glassPrimary' : variant === 'secondary' ? 'glass' : 'ghost'
  
  const motionProps = prefersReducedMotion
    ? {}
    : {
        whileHover: props.disabled || props.loading
          ? {}
          : {
              scale: 1.02,
              y: -2,
            },
        whileTap: props.disabled || props.loading
          ? {}
          : {
              scale: 0.98,
            },
      }

  return (
    <motion.div
      className={cn('inline-block', fullWidth && 'w-full')}
      {...motionProps}
      transition={{ duration: 0.2 }}
    >
      <BaseButton
        variant={baseVariant}
        size={baseSize}
        className={cn(
          'gap-2 rounded-2xl',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </BaseButton>
    </motion.div>
  )
}
