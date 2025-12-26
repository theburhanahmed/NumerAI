/**
 * SkeletonLoader Component
 * 
 * Skeleton loader component using design system variants.
 * Provides consistent loading states throughout the application.
 */

import * as React from "react"
import { skeletonVariants, type SkeletonVariantProps } from "@/design-system/variants"
import { cn } from "@/lib/utils"

export interface SkeletonLoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    SkeletonVariantProps {
  lines?: number
  width?: string | number
  height?: string | number
  rounded?: boolean
}

const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ className, variant, size, lines = 1, width, height, rounded = true, ...props }, ref) => {
    if (lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                skeletonVariants({ variant, size }),
                rounded && "rounded-md",
                i === lines - 1 && "w-3/4" // Last line is shorter
              )}
              style={width && i === 0 ? { width } : undefined}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          skeletonVariants({ variant, size }),
          rounded && "rounded-md",
          className
        )}
        style={{ width, height }}
        {...props}
      />
    )
  }
)
SkeletonLoader.displayName = "SkeletonLoader"

// Predefined skeleton components for common use cases
export const CardSkeleton = React.forwardRef<HTMLDivElement, Omit<SkeletonLoaderProps, 'lines'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 space-y-4", className)}
      {...props}
    >
      <SkeletonLoader variant="default" size="lg" className="h-6 w-3/4" />
      <SkeletonLoader variant="default" lines={3} />
      <SkeletonLoader variant="default" size="sm" className="h-4 w-1/2" />
    </div>
  )
)
CardSkeleton.displayName = "CardSkeleton"

export const AvatarSkeleton = React.forwardRef<HTMLDivElement, SkeletonVariantProps>(
  ({ className, variant, size = "default", ...props }, ref) => (
    <SkeletonLoader
      ref={ref}
      variant={variant}
      size={size}
      rounded
      className={cn("rounded-full", className)}
      {...props}
    />
  )
)
AvatarSkeleton.displayName = "AvatarSkeleton"

export const TextSkeleton = React.forwardRef<HTMLDivElement, Omit<SkeletonLoaderProps, 'rounded'>>(
  ({ className, lines = 1, ...props }, ref) => (
    <SkeletonLoader
      ref={ref}
      variant="default"
      lines={lines}
      rounded
      className={className}
      {...props}
    />
  )
)
TextSkeleton.displayName = "TextSkeleton"

export { SkeletonLoader }

