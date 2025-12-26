'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LiquidMetalOrbProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LiquidMetalOrb({
  size = 'md',
  className = '',
}: LiquidMetalOrbProps) {
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  }

  return (
    <motion.div
      className={`relative ${sizeMap[size]} ${className}`}
      animate={{
        y: [0, -20, 0],
        rotateY: [0, 360],
      }}
      transition={{
        y: {
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        rotateY: {
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        },
      }}
      style={{
        perspective: '1000px',
      }}
    >
      {/* Liquid Metal Core */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 35% 35%, 
              #ffffff 0%, 
              #e0e7ff 10%, 
              #c7d2fe 20%, 
              #a5b4fc 35%, 
              #818cf8 50%, 
              #6366f1 70%, 
              #4f46e5 85%, 
              #4338ca 100%
            )
          `,
          boxShadow: `
            inset -30px -30px 60px rgba(0, 0, 0, 0.4),
            inset 20px 20px 40px rgba(255, 255, 255, 0.9),
            0 30px 90px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(99, 102, 241, 0.5)
          `,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Liquid Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.6) 0%, transparent 50%)',
            filter: 'blur(10px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Chrome Reflection */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(45deg, 
                  transparent 30%, 
                  rgba(255, 255, 255, 0.8) 50%, 
                  transparent 70%
                )
              `,
              transform: 'translateX(-100%)',
              animation: 'shine 4s infinite',
            }}
          />
        </motion.div>

        {/* Specular Highlight */}
        <div
          className="absolute top-[15%] left-[25%] w-[40%] h-[40%] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />

        {/* Refraction Edge */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 70% 70%, transparent 50%, rgba(67, 56, 202, 0.6) 80%, transparent 100%)',
            filter: 'blur(15px)',
          }}
        />
      </div>

      {/* Bloom Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)',
          filter: 'blur(40px)',
          transform: 'scale(1.6)',
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1.6, 1.8, 1.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />
    </motion.div>
  )
}

