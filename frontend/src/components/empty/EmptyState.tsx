/**
 * EmptyState Component
 * 
 * Enhanced empty state component with illustrations and clear CTAs.
 * Provides helpful messaging for different empty states.
 */

import * as React from "react"
import { BaseCard } from "@/components/base/BaseCard"
import { BaseButton } from "@/components/base/BaseButton"
import { cn } from "@/lib/utils"
import {
  InboxIcon,
  SearchIcon,
  FileTextIcon,
  UsersIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "lucide-react"

export type EmptyStateType =
  | "default"
  | "no-data"
  | "no-results"
  | "no-reports"
  | "no-people"
  | "no-consultations"
  | "no-readings"
  | "error"

export interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
  illustration?: React.ReactNode
}

const defaultConfig: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  default: {
    icon: <InboxIcon className="w-12 h-12" />,
    title: "Nothing here yet",
    description: "Get started by creating your first item",
  },
  "no-data": {
    icon: <FileTextIcon className="w-12 h-12" />,
    title: "No data available",
    description: "Complete your profile to see your numerology insights",
  },
  "no-results": {
    icon: <SearchIcon className="w-12 h-12" />,
    title: "No results found",
    description: "Try adjusting your search or filters",
  },
  "no-reports": {
    icon: <FileTextIcon className="w-12 h-12" />,
    title: "No reports yet",
    description: "Generate your first numerology report to get started",
  },
  "no-people": {
    icon: <UsersIcon className="w-12 h-12" />,
    title: "No people added",
    description: "Add people to compare numerology profiles and relationships",
  },
  "no-consultations": {
    icon: <CalendarIcon className="w-12 h-12" />,
    title: "No consultations scheduled",
    description: "Book a consultation with our numerology experts",
  },
  "no-readings": {
    icon: <SparklesIcon className="w-12 h-12" />,
    title: "No readings available",
    description: "Complete your profile to unlock daily numerology readings",
  },
  error: {
    icon: <InboxIcon className="w-12 h-12" />,
    title: "Something went wrong",
    description: "We couldn't load this content. Please try again",
  },
}

export function EmptyState({
  type = "default",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  illustration,
}: EmptyStateProps) {
  const config = defaultConfig[type]
  const displayIcon = icon || config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description

  return (
    <BaseCard
      variant="space"
      padding="lg"
      className={cn("text-center", className)}
    >
      <div className="flex flex-col items-center justify-center py-8 px-4">
        {illustration ? (
          <div className="mb-6">{illustration}</div>
        ) : (
          <div className="mb-6 text-muted-foreground">{displayIcon}</div>
        )}

        <h3 className="text-xl font-semibold mb-2 font-['Playfair_Display']">
          {displayTitle}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {displayDescription}
        </p>

        {(onAction || onSecondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onAction && (
              <BaseButton
                variant="space"
                onClick={onAction}
                className="gap-2"
              >
                {actionLabel || "Get Started"}
                <ArrowRightIcon className="w-4 h-4" />
              </BaseButton>
            )}
            {onSecondaryAction && (
              <BaseButton
                variant="outline"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel || "Learn More"}
              </BaseButton>
            )}
          </div>
        )}
      </div>
    </BaseCard>
  )
}

