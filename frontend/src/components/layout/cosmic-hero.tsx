'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SpaceButton } from '@/components/space/space-button'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface CosmicHeroProps {
  badge?: string
  heading: string
  highlightText: string
  subheading: string
  primaryCTA: {
    label: string
    onClick: () => void
  }
  secondaryCTA?: {
    label: string
    onClick: () => void
  }
  stats?: Array<{
    value: string
    label: string
  }>
}

/**
 * Cosmic hero section with animated planet and particle effects
 * Adapted from Magic Patterns design system
 */
export function CosmicHero({
  badge,
  heading,
  highlightText,
  subheading,
  primaryCTA,
  secondaryCTA,
  stats,
}: CosmicHeroProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 pt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            {/* Badge */}
            {badge && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className="px-4 py-2 bg-[#1a2942]/60 backdrop-blur-xl rounded-full border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                  <span className="text-cyan-400 text-sm font-semibold">
                    {badge}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Heading */}
            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold text-white mb-6 leading-tight"
            >
              {heading}
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                {highlightText}
              </motion.span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/70 mb-8 leading-relaxed max-w-xl"
            >
              {subheading}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <SpaceButton
                variant="primary"
                size="lg"
                onClick={primaryCTA.onClick}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {primaryCTA.label}
              </SpaceButton>
              {secondaryCTA && (
                <SpaceButton
                  variant="secondary"
                  size="lg"
                  onClick={secondaryCTA.onClick}
                >
                  {secondaryCTA.label}
                </SpaceButton>
              )}
            </motion.div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-cyan-400 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Content - Giant Glowing Planet */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[600px] flex items-center justify-center"
          >
            {/* Main Planet */}
            <motion.div
              className="relative w-96 h-96"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      rotateY: 360,
                    }
              }
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Planet Core */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, #4a9eff 0%, #1e5a9e 40%, #0a2540 100%)',
                  boxShadow: `
                    inset -40px -40px 80px rgba(0, 0, 0, 0.5),
                    inset 20px 20px 60px rgba(255, 255, 255, 0.2),
                    0 40px 120px rgba(0, 0, 0, 0.6),
                    0 0 80px rgba(0, 212, 255, 0.3)
                  `,
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
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, transparent 60%, rgba(0, 212, 255, 0.3) 100%)',
                    filter: 'blur(20px)',
                  }}
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          opacity: [0.5, 0.8, 0.5],
                        }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              {/* Orbital Rings */}
              {!prefersReducedMotion &&
                [1, 2, 3].map((ring, index) => (
                  <motion.div
                    key={ring}
                    className="absolute"
                    style={{
                      width: `${140 + index * 30}%`,
                      height: `${140 + index * 30}%`,
                      left: `${-20 - index * 15}%`,
                      top: `${-20 - index * 15}%`,
                      transform: 'rotateX(75deg)',
                      transformStyle: 'preserve-3d',
                    }}
                    animate={{
                      rotateZ: 360,
                    }}
                    transition={{
                      duration: 40 + index * 10,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        border: `${3 - index}px solid rgba(0, 212, 255, ${0.3 - index * 0.08})`,
                        boxShadow: `
                          0 0 ${20 + index * 10}px rgba(0, 212, 255, ${0.3 - index * 0.08}),
                          inset 0 0 ${20 + index * 10}px rgba(0, 212, 255, ${0.2 - index * 0.05})
                        `,
                      }}
                    />
                  </motion.div>
                ))}

              {/* Outer Glow */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  transform: 'scale(1.8)',
                }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1.8, 2, 1.8],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Floating Particles */}
            {!prefersReducedMotion && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: Math.random() * 4 + 1 + 'px',
                      height: Math.random() * 4 + 1 + 'px',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      background:
                        i % 3 === 0
                          ? '#00d4ff'
                          : i % 3 === 1
                            ? '#4a9eff'
                            : '#a855f7',
                      boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
                    }}
                    animate={{
                      y: [0, -40 - Math.random() * 40, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 3,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

