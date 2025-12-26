'use client'

import React from 'react'
import { motion } from 'framer-motion'

// Floating Neon Runes Component
export function FloatingNeonRunes({ count = 8 }: { count?: number }) {
  const runes = ['☿', '♀', '♁', '♂', '♃', '♄', '♅', '♆']

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${24 + Math.random() * 24}px`,
            color: i % 2 === 0 ? '#00d4ff' : '#a855f7',
            textShadow: `
              0 0 20px currentColor,
              0 0 40px currentColor,
              0 0 60px currentColor
            `,
          }}
          animate={{
            y: [0, -30 - Math.random() * 30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 360],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 4,
          }}
        >
          {runes[i % runes.length]}
        </motion.div>
      ))}
    </div>
  )
}

// Particle Swarm Component
export function ParticleSwarm({ count = 50 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => {
        const color = ['#00d4ff', '#4a9eff', '#a855f7', '#ec4899'][i % 4]
        const pathRadius = 100 + Math.random() * 200
        const duration = 15 + Math.random() * 10

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: '50%',
              top: '50%',
              background: color,
              boxShadow: `0 0 ${8 + Math.random() * 8}px ${color}, 0 0 ${16 + Math.random() * 16}px ${color}`,
            }}
            animate={{
              x: [
                0,
                pathRadius * Math.cos((i / count) * Math.PI * 2),
                pathRadius * Math.cos((i / count) * Math.PI * 2 + Math.PI),
                0,
              ],
              y: [
                0,
                pathRadius * Math.sin((i / count) * Math.PI * 2),
                pathRadius * Math.sin((i / count) * Math.PI * 2 + Math.PI),
                0,
              ],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i / count) * duration,
            }}
          />
        )
      })}
    </div>
  )
}

// Nebula Streaks Component
export function NebulaStreaks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Horizontal Streaks */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute h-px"
          style={{
            left: 0,
            right: 0,
            top: `${20 + i * 15}%`,
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(0, 212, 255, 0.3) 20%, 
              rgba(168, 85, 247, 0.3) 50%, 
              rgba(236, 72, 153, 0.3) 80%, 
              transparent 100%
            )`,
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
        />
      ))}

      {/* Diagonal Streaks */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`d-${i}`}
          className="absolute w-full h-px origin-left"
          style={{
            left: 0,
            top: `${30 + i * 20}%`,
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(74, 158, 255, 0.4) 30%, 
              rgba(139, 92, 246, 0.4) 70%, 
              transparent 100%
            )`,
            filter: 'blur(3px)',
            transform: `rotate(${-15 + i * 10}deg)`,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scaleX: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}

      {/* Volumetric Fog Clouds */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`fog-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${200 + Math.random() * 300}px`,
            height: `${100 + Math.random() * 150}px`,
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 80}%`,
            background: `radial-gradient(ellipse, 
              rgba(0, 212, 255, 0.15) 0%, 
              rgba(168, 85, 247, 0.1) 50%, 
              transparent 100%
            )`,
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 3,
          }}
        />
      ))}
    </div>
  )
}

// Cosmic Fog Component
export function CosmicFog() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: `${300 + Math.random() * 400}px`,
            height: `${200 + Math.random() * 300}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(ellipse, 
              rgba(0, 212, 255, 0.08) 0%, 
              rgba(74, 158, 255, 0.05) 30%,
              rgba(168, 85, 247, 0.03) 60%, 
              transparent 100%
            )`,
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 4,
          }}
        />
      ))}
    </div>
  )
}

