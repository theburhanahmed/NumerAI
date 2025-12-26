'use client'

import React, { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Generate stars
    const stars: Star[] = []
    const starCount = 200
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      })
    }

    // Animation
    let animationFrame: number
    let twinkleOffset = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      twinkleOffset += 0.01
      stars.forEach((star) => {
        const twinkle =
          Math.sin(twinkleOffset * star.twinkleSpeed * 100) * 0.3 + 0.7
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        // Add glow for larger stars
        if (star.size > 1.5) {
          ctx.fillStyle = `rgba(0, 212, 255, ${star.opacity * twinkle * 0.3})`
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      animationFrame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        opacity: 0.6,
      }}
    />
  )
}

