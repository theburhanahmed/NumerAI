'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BaseButton, type BaseButtonProps } from '@/components/base/BaseButton'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface SpaceButtonProps extends Omit<BaseButtonProps, 'variant'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function SpaceButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  ...props
}: SpaceButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  
  // Map size to BaseButton size
  const baseSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'
  
  // Map variant to BaseButton variant (using space variant)
  const baseVariant = 'space'
  
  const additionalStyles = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400/50 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50',
    secondary: 'bg-[#1a2942]/60 border-cyan-500/30 hover:border-cyan-500/50 hover:bg-[#1a2942]/80',
    ghost: 'bg-transparent border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50',
  }

  const motionProps = prefersReducedMotion
    ? {}
    : {
        whileHover: props.disabled || props.loading
          ? {}
          : {
              scale: 1.05,
              y: -2,
            },
        whileTap: props.disabled || props.loading
          ? {}
          : {
              scale: 0.95,
            },
      }

  return (
    <motion.div
      className="inline-block relative overflow-hidden rounded-xl"
      {...motionProps}
    >
      <BaseButton
        variant={baseVariant}
        size={baseSize}
        className={cn(
          'relative gap-2 rounded-xl',
          additionalStyles[variant],
          className
        )}
        {...props}
      >
        {/* Shine effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        
        {icon && iconPosition === 'left' && <span className="flex-shrink-0 relative z-10">{icon}</span>}
        <span className="relative z-10">{children}</span>
        {icon && iconPosition === 'right' && <span className="flex-shrink-0 relative z-10">{icon}</span>}
      </BaseButton>
    </motion.div>
  )
}

