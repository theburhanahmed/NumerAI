/**
 * SuccessMessage Component
 * 
 * Success feedback components for user actions.
 */

'use client'

import * as React from "react"
import { CheckCircleIcon, XIcon } from "lucide-react"
import { BaseCard } from "@/components/base/BaseCard"
import { BaseButton } from "@/components/base/BaseButton"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface SuccessMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  autoDismiss?: boolean
  dismissDelay?: number
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function SuccessMessage({
  title,
  message,
  onDismiss,
  autoDismiss = false,
  dismissDelay = 5000,
  action,
  className,
}: SuccessMessageProps) {
  React.useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss()
      }, dismissDelay)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, dismissDelay, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("w-full", className)}
    >
      <BaseCard
        variant="default"
        padding="md"
        className="border-green-500/50 bg-green-50 dark:bg-green-950/20"
      >
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                {title}
              </h4>
            )}
            <p className="text-sm text-green-800 dark:text-green-200">
              {message}
            </p>
            {action && (
              <BaseButton
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="mt-3"
              >
                {action.label}
              </BaseButton>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              aria-label="Dismiss"
            >
              <XIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            </button>
          )}
        </div>
      </BaseCard>
    </motion.div>
  )
}

/**
 * Inline success indicator
 */
export function SuccessIndicator({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-green-600 dark:text-green-400", className)}>
      <CheckCircleIcon className="w-4 h-4" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Progress indicator for multi-step processes
 */
export interface ProgressStep {
  id: string
  label: string
  completed: boolean
  current?: boolean
}

export interface ProgressIndicatorProps {
  steps: ProgressStep[]
  className?: string
}

export function ProgressIndicator({
  steps,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  step.completed
                    ? "bg-green-600 text-white"
                    : step.current
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.completed ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs text-center",
                  step.current
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 -mt-4",
                  step.completed ? "bg-green-600" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

