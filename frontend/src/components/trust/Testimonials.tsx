/**
 * Testimonials Component
 * 
 * User testimonials display for trust building.
 */

'use client'

import * as React from "react"
import Image from "next/image"
import { StarIcon, QuoteIcon } from "lucide-react"
import { BaseCard } from "@/components/base/BaseCard"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface Testimonial {
  id: string
  name: string
  role?: string
  rating: number
  text: string
  avatar?: string
  verified?: boolean
}

export interface TestimonialsProps {
  testimonials: Testimonial[]
  autoRotate?: boolean
  rotateInterval?: number
  className?: string
}

export function Testimonials({
  testimonials,
  autoRotate = true,
  rotateInterval = 5000,
  className,
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, rotateInterval)

    return () => clearInterval(interval)
  }, [autoRotate, rotateInterval, testimonials.length])

  const currentTestimonial = testimonials[currentIndex]

  if (!currentTestimonial) return null

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <BaseCard variant="space" padding="lg" className="relative">
            <QuoteIcon className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
            
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < currentTestimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <p className="text-lg leading-relaxed">{currentTestimonial.text}</p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              {currentTestimonial.avatar ? (
                <Image
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {currentTestimonial.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentTestimonial.name}</span>
                  {currentTestimonial.verified && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                {currentTestimonial.role && (
                  <span className="text-sm text-muted-foreground">
                    {currentTestimonial.role}
                  </span>
                )}
              </div>
            </div>

            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentIndex
                        ? "bg-primary w-6"
                        : "bg-muted-foreground hover:bg-primary/50"
                    )}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </BaseCard>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * Testimonials grid for displaying multiple at once
 */
export function TestimonialsGrid({
  testimonials,
  className,
}: {
  testimonials: Testimonial[]
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {testimonials.map((testimonial) => (
        <BaseCard key={testimonial.id} variant="default" padding="md">
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < testimonial.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <p className="text-sm mb-4 leading-relaxed">{testimonial.text}</p>
          <div className="flex items-center gap-2">
            {testimonial.avatar ? (
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-semibold">
                  {testimonial.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="text-sm font-semibold">{testimonial.name}</div>
              {testimonial.role && (
                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
              )}
            </div>
          </div>
        </BaseCard>
      ))}
    </div>
  )
}

