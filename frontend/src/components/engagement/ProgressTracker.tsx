/**
 * ProgressTracker Component
 * 
 * Tracks user's numerology journey progress.
 */

'use client'

import * as React from "react"
import { CheckCircleIcon, CircleIcon } from "lucide-react"
import { BaseCard } from "@/components/base/BaseCard"
import { cn } from "@/lib/utils"

export interface ProgressItem {
  id: string
  label: string
  completed: boolean
  description?: string
}

export interface ProgressTrackerProps {
  items: ProgressItem[]
  title?: string
  className?: string
}

export function ProgressTracker({
  items,
  title = "Your Numerology Journey",
  className,
}: ProgressTrackerProps) {
  const completedCount = items.filter((item) => item.completed).length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  return (
    <BaseCard variant="space" padding="md" className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 font-['Playfair_Display']">
          {title}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {completedCount} of {items.length} completed
          </span>
          <span className="text-sm font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-2 rounded-lg transition-colors",
              item.completed
                ? "bg-primary/10"
                : "hover:bg-muted/50"
            )}
          >
            {item.completed ? (
              <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            ) : (
              <CircleIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "font-medium",
                  item.completed && "line-through text-muted-foreground"
                )}
              >
                {item.label}
              </div>
              {item.description && (
                <div className="text-sm text-muted-foreground mt-0.5">
                  {item.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  )
}

