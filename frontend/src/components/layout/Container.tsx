/**
 * Container Component
 * 
 * Container component with consistent max-widths using design tokens.
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { containerWidths } from "@/design-system/tokens"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof containerWidths
  center?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "2xl", center = true, children, ...props }, ref) => {
    const maxWidth = containerWidths[size]

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          center && "mx-auto",
          className
        )}
        style={{ maxWidth }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container }

