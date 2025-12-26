'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-media-query'

interface TouchOptimizedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  ariaLabel?: string
  fullWidth?: boolean
}

/**
 * Touch-optimized button with proper touch targets (min 44x44px)
 * Includes haptic feedback simulation and enhanced touch states
 * Adapted from Magic Patterns design system
 */
export function TouchOptimizedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ariaLabel,
  fullWidth = false,
}: TouchOptimizedButtonProps) {
  const isMobile = useIsMobile()

  // Ensure minimum touch target size on mobile
  const sizeClasses = {
    sm: isMobile ? 'px-5 py-3 text-sm min-h-[44px]' : 'px-4 py-2 text-sm',
    md: isMobile ? 'px-7 py-4 text-base min-h-[48px]' : 'px-6 py-3 text-base',
    lg: isMobile ? 'px-9 py-5 text-lg min-h-[52px]' : 'px-8 py-4 text-lg',
  }

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/50 shadow-lg shadow-cyan-500/30',
    secondary:
      'bg-[#1a2942]/60 backdrop-blur-xl text-white border border-cyan-500/30 hover:border-cyan-500/50',
    ghost: 
      'bg-transparent text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10',
    danger:
      'bg-gradient-to-r from-red-500 to-rose-600 text-white border border-red-400/50 shadow-lg shadow-red-500/30',
    success:
      'bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400/50 shadow-lg shadow-green-500/30',
  }

  const handleClick = () => {
    if (disabled || loading) return
    
    // Simulate haptic feedback on mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
    onClick?.()
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl 
        transition-all duration-300 relative overflow-hidden
        ${sizeClasses[size]} 
        ${variantStyles[variant]} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileHover={
        !disabled && !loading && !isMobile
          ? {
              scale: 1.05,
              y: -2,
            }
          : undefined
      }
      whileTap={
        !disabled && !loading
          ? {
              scale: 0.95,
            }
          : undefined
      }
      // Enhanced touch feedback
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
      
      {/* Content */}
      <span className={loading ? 'opacity-0' : 'flex items-center gap-2'}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </span>
      
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        whileHover={{
          translateX: '100%',
          transition: { duration: 0.5 },
        }}
      />
    </motion.button>
  )
}
