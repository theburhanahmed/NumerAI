'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface Premium3DPlanetProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'giant'
  type?: 'earth' | 'gas-giant' | 'ice' | 'lava'
  withRings?: boolean
  withMoons?: boolean
  className?: string
}

export function Premium3DPlanet({
  size = 'lg',
  type = 'earth',
  withRings = true,
  withMoons = true,
  className = '',
}: Premium3DPlanetProps) {
  const sizeMap = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-96 h-96',
    giant: 'w-[600px] h-[600px]',
  }

  const planetGradients = {
    earth: {
      core: 'radial-gradient(circle at 35% 35%, #6eb5ff 0%, #4a9eff 15%, #2d7dd2 35%, #1e5a9e 55%, #0f3a6b 75%, #0a2540 100%)',
      atmosphere: 'rgba(74, 158, 255, 0.4)',
      glow: '#4a9eff',
    },
    'gas-giant': {
      core: 'radial-gradient(circle at 35% 35%, #ffb366 0%, #ff9a56 15%, #ff8533 35%, #e67326 55%, #cc5500 75%, #994400 100%)',
      atmosphere: 'rgba(255, 133, 51, 0.4)',
      glow: '#ff8533',
    },
    ice: {
      core: 'radial-gradient(circle at 35% 35%, #e0f7ff 0%, #b3e5fc 15%, #81d4fa 35%, #4fc3f7 55%, #29b6f6 75%, #0288d1 100%)',
      atmosphere: 'rgba(129, 212, 250, 0.4)',
      glow: '#4fc3f7',
    },
    lava: {
      core: 'radial-gradient(circle at 35% 35%, #ffeb3b 0%, #ff9800 15%, #ff5722 35%, #f44336 55%, #d32f2f 75%, #b71c1c 100%)',
      atmosphere: 'rgba(255, 87, 34, 0.4)',
      glow: '#ff5722',
    },
  }

  const planet = planetGradients[type]

  return (
    <div
      className={`relative ${sizeMap[size]} ${className}`}
      style={{
        perspective: '2000px',
      }}
    >
      {/* Main Planet */}
      <motion.div
        className="absolute inset-0"
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Planet Core with Hyper-realistic Lighting */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: planet.core,
            boxShadow: `
              inset -60px -60px 120px rgba(0, 0, 0, 0.7),
              inset 30px 30px 80px rgba(255, 255, 255, 0.25),
              inset 0 0 40px rgba(255, 255, 255, 0.1),
              0 60px 180px rgba(0, 0, 0, 0.8),
              0 0 120px ${planet.glow}40,
              0 0 200px ${planet.glow}20
            `,
          }}
        >
          {/* Surface Texture Details */}
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: `
                radial-gradient(circle at 15% 85%, rgba(0, 0, 0, 0.4) 0%, transparent 40%),
                radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.25) 0%, transparent 35%),
                radial-gradient(circle at 60% 60%, rgba(0, 0, 0, 0.3) 0%, transparent 25%),
                radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 30%),
                radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.25) 0%, transparent 20%)
              `,
            }}
          />

          {/* Specular Highlights */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 10%, transparent 25%)',
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Atmospheric Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, transparent 55%, ${planet.atmosphere} 75%, transparent 100%)`,
              filter: 'blur(30px)',
            }}
            animate={{
              opacity: [0.5, 0.9, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Volumetric Lighting Edge */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 25% 25%, transparent 40%, ${planet.glow}15 70%, ${planet.glow}30 85%, transparent 100%)`,
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* Particle Ring System */}
      {withRings && (
        <>
          {[1, 2, 3].map((ring, index) => (
            <motion.div
              key={ring}
              className="absolute"
              style={{
                width: `${130 + index * 35}%`,
                height: `${130 + index * 35}%`,
                left: `${-15 - index * 17.5}%`,
                top: `${-15 - index * 17.5}%`,
                transform: 'rotateX(75deg)',
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateZ: [0, 360],
              }}
              transition={{
                duration: 50 + index * 15,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {/* Particle Ring */}
              <div className="relative w-full h-full">
                {[...Array(40 - index * 10)].map((_, i) => {
                  const angle = (i / (40 - index * 10)) * Math.PI * 2
                  const x = 50 + 50 * Math.cos(angle)
                  const y = 50 + 50 * Math.sin(angle)
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${3 - index * 0.5}px`,
                        height: `${3 - index * 0.5}px`,
                        background: planet.glow,
                        boxShadow: `0 0 ${8 - index * 2}px ${planet.glow}, 0 0 ${16 - index * 4}px ${planet.glow}80`,
                      }}
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  )
                })}
              </div>
            </motion.div>
          ))}
        </>
      )}

      {/* Orbiting Moons */}
      {withMoons && (
        <>
          {[1, 2, 3].map((moon, index) => (
            <motion.div
              key={moon}
              className="absolute"
              style={{
                width: '100%',
                height: '100%',
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + index * 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: `${15 - index * 3}%`,
                  height: `${15 - index * 3}%`,
                  left: `${120 + index * 20}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: `radial-gradient(circle at 35% 35%, #d4d4d4 0%, #9e9e9e 40%, #616161 70%, #424242 100%)`,
                  boxShadow: `
                    inset -10px -10px 20px rgba(0, 0, 0, 0.6),
                    inset 5px 5px 15px rgba(255, 255, 255, 0.3),
                    0 10px 30px rgba(0, 0, 0, 0.6),
                    0 0 20px ${planet.glow}30
                  `,
                }}
              />
            </motion.div>
          ))}
        </>
      )}

      {/* Outer Bloom Glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${planet.glow}30 0%, ${planet.glow}15 30%, transparent 70%)`,
          filter: 'blur(60px)',
          transform: 'scale(2)',
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [2, 2.2, 2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Depth-of-Field Blur Edge */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, transparent 60%, rgba(11, 15, 25, 0.3) 90%, rgba(11, 15, 25, 0.6) 100%)',
          filter: 'blur(4px)',
        }}
      />
    </div>
  )
}

