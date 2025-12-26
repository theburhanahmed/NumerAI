/**
 * FeatureExplanation Component
 * 
 * Inline help text and explanations for complex features.
 */

'use client'

import * as React from "react"
import { HelpCircleIcon, InfoIcon } from "lucide-react"
import { ContextualTooltip } from "@/components/onboarding/ContextualTooltip"
import { cn } from "@/lib/utils"

export interface FeatureExplanationProps {
  feature: string
  explanation: string
  variant?: 'tooltip' | 'inline' | 'modal'
  className?: string
}

export function FeatureExplanation({
  feature,
  explanation,
  variant = 'tooltip',
  className,
}: FeatureExplanationProps) {
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-start gap-2 p-3 rounded-lg bg-muted/50", className)}>
        <InfoIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-sm mb-1">{feature}</div>
          <p className="text-sm text-muted-foreground">{explanation}</p>
        </div>
      </div>
    )
  }

  if (variant === 'tooltip') {
    return (
      <ContextualTooltip
        id={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
        content={explanation}
        title={feature}
        showOnce={false}
        className={className}
      >
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Learn more about ${feature}`}
        >
          <HelpCircleIcon className="w-4 h-4" />
        </button>
      </ContextualTooltip>
    )
  }

  // Modal variant would use Dialog component
  return null
}

