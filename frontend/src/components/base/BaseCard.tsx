/**
 * BaseCard Component
 * 
 * Base card component using design system variants.
 * This component should be used as the foundation for all card components.
 */

import * as React from "react"
import { cardVariants, type CardVariantProps } from "@/design-system/variants"
import { cn } from "@/lib/utils"

export interface BaseCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    CardVariantProps {
  hover?: boolean
  interactive?: boolean
}

const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ className, variant, padding, hover = false, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding }),
          hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          interactive && "cursor-pointer",
          className
        )}
        {...props}
      />
    )
  }
)
BaseCard.displayName = "BaseCard"

const BaseCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
BaseCardHeader.displayName = "BaseCardHeader"

const BaseCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
BaseCardTitle.displayName = "BaseCardTitle"

const BaseCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
BaseCardDescription.displayName = "BaseCardDescription"

const BaseCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
BaseCardContent.displayName = "BaseCardContent"

const BaseCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  />
))
BaseCardFooter.displayName = "BaseCardFooter"

export {
  BaseCard,
  BaseCardHeader,
  BaseCardTitle,
  BaseCardDescription,
  BaseCardContent,
  BaseCardFooter,
}

