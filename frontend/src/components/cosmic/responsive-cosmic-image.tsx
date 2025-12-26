'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ResponsiveCosmicImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function ResponsiveCosmicImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: ResponsiveCosmicImageProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="w-full h-auto object-cover"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.3))',
        }}
      />
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
    </motion.div>
  )
}

