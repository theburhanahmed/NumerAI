/**
 * BaseInput Component
 * 
 * Base input component using design system variants.
 * This component should be used as the foundation for all input components.
 */

import * as React from "react"
import { inputVariants, type InputVariantProps } from "@/design-system/variants"
import { cn } from "@/lib/utils"

export interface BaseInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    InputVariantProps {
  error?: boolean
  errorMessage?: string
  label?: string
}

const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  ({ className, variant, size, type, error, errorMessage, label, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            inputVariants({ variant, size }),
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && errorMessage && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
BaseInput.displayName = "BaseInput"

export { BaseInput }

