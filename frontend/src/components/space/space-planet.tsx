'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SpacePlanetProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'sm' | 'md' | 'lg'
  type?: 'earth' | 'gas-giant' | 'ringed' | 'moon'
  className?: string
  withRing?: boolean
  withOrbit?: boolean
}

export function SpacePlanet({
  size = 'medium',
  type = 'earth',
  className = '',
  withRing = false,
  withOrbit = false,
}: SpacePlanetProps) {
  // Normalize size prop (support both old and new naming)
  const normalizedSize = size === 'sm' ? 'small' : size === 'md' ? 'medium' : size === 'lg' ? 'large' : size

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
    xlarge: 'w-96 h-96',
  }

  const planetGradients = {
    earth:
      'radial-gradient(circle at 30% 30%, #4a9eff 0%, #1a5fb4 30%, #0d3a6b 60%, #051d3a 100%)',
    'gas-giant':
      'radial-gradient(circle at 30% 30%, #ff9a56 0%, #ff6b35 30%, #d84315 60%, #8b2500 100%)',
    ringed:
      'radial-gradient(circle at 30% 30%, #e8d5b7 0%, #c9a66b 30%, #8b7355 60%, #5c4a3a 100%)',
    moon: 'radial-gradient(circle at 30% 30%, #d4d4d4 0%, #9e9e9e 30%, #616161 60%, #424242 100%)',
  }

  return (
    <div className={`relative ${className}`}>
      {/* Orbit Path */}
      {withOrbit && (
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-500/20"
          style={{
            width: '120%',
            height: '120%',
            left: '-10%',
            top: '-10%',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Planet */}
      <motion.div
        className={`${sizeClasses[normalizedSize]} relative rounded-full`}
        style={{
          background: planetGradients[type],
          boxShadow: `
            inset -20px -20px 40px rgba(0, 0, 0, 0.5),
            inset 10px 10px 30px rgba(255, 255, 255, 0.2),
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(0, 212, 255, 0.1)
          `,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Surface Details */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 40%),
              radial-gradient(circle at 60% 60%, rgba(0, 0, 0, 0.2) 0%, transparent 30%)
            `,
          }}
        />

        {/* Atmosphere Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, transparent 60%, rgba(0, 212, 255, 0.2) 100%)',
            filter: 'blur(8px)',
          }}
        />
      </motion.div>

      {/* Ring */}
      {withRing && (
        <motion.div
          className="absolute"
          style={{
            width: '140%',
            height: '140%',
            left: '-20%',
            top: '-20%',
            transform: 'rotateX(75deg)',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateZ: 360,
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              border: '8px solid rgba(0, 212, 255, 0.3)',
              boxShadow: `
                0 0 20px rgba(0, 212, 255, 0.3),
                inset 0 0 20px rgba(0, 212, 255, 0.2)
              `,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '4px solid rgba(0, 212, 255, 0.2)',
              margin: '12px',
            }}
          />
        </motion.div>
      )}
    </div>
  )
}

