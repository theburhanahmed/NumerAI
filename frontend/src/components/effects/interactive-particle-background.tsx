'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

interface InteractiveParticleBackgroundProps {
  particleCount?: number
  particleColor?: string
  glowIntensity?: number
  gravityStrength?: number
  mouseRadius?: number
  className?: string
}

export function InteractiveParticleBackground({
  particleCount = 100,
  particleColor = '#22D3EE',
  glowIntensity = 0.8,
  gravityStrength = 0.5,
  mouseRadius = 150,
  className = '',
}: InteractiveParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({
    x: 0,
    y: 0,
    active: false,
  })
  const animationFrameRef = useRef<number>()
  const prefersReducedMotion = useReducedMotion()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', {
      alpha: true,
    })
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle())
      }
    }

    const createParticle = (): Particle => {
      const maxLife = 200 + Math.random() * 200
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
        color: particleColor,
        life: maxLife,
        maxLife: maxLife,
      }
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        // Update particle life
        particle.life--
        if (particle.life <= 0) {
          particlesRef.current[index] = createParticle()
          return
        }

        // Mouse interaction - gravity effect
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < mouseRadius) {
            const force = (1 - distance / mouseRadius) * gravityStrength
            const angle = Math.atan2(dy, dx)
            particle.vx += Math.cos(angle) * force * 0.1
            particle.vy += Math.sin(angle) * force * 0.1
          }
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Boundary check with wrap-around
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Apply friction
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Calculate opacity based on life and distance to mouse
        let opacity = particle.opacity * (particle.life / particle.maxLife)
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < mouseRadius) {
            const proximityBoost = (1 - distance / mouseRadius) * glowIntensity
            opacity = Math.min(1, opacity + proximityBoost)
          }
        }

        // Draw particle with glow
        ctx.save()

        // Outer glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 4,
        )
        gradient.addColorStop(
          0,
          `${particle.color}${Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, '0')}`,
        )
        gradient.addColorStop(
          0.5,
          `${particle.color}${Math.floor(opacity * 0.3 * 255)
            .toString(16)
            .padStart(2, '0')}`,
        )
        gradient.addColorStop(1, `${particle.color}00`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2)
        ctx.fill()

        // Core particle
        ctx.fillStyle = `${particle.color}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, '0')}`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      })

      // Draw connections between nearby particles
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.15
            ctx.strokeStyle = `${particleColor}${Math.floor(opacity * 255)
              .toString(16)
              .padStart(2, '0')}`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })

      // Draw mouse cursor glow
      if (mouseRef.current.active) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          mouseRadius,
        )
        gradient.addColorStop(0, `${particleColor}20`)
        gradient.addColorStop(0.5, `${particleColor}10`)
        gradient.addColorStop(1, `${particleColor}00`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(
          mouseRef.current.x,
          mouseRef.current.y,
          mouseRadius,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    isClient,
    prefersReducedMotion,
    particleCount,
    particleColor,
    glowIntensity,
    gravityStrength,
    mouseRadius,
  ])

  if (!isClient || prefersReducedMotion) {
    return (
      <div className={`fixed inset-0 bg-[#0B0F19] ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 ${className}`}
      style={{
        background: '#0B0F19',
      }}
      aria-hidden="true"
    />
  )
}

