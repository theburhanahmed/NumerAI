/**
 * SecurityBadge Component
 * 
 * Security and trust indicators for the platform.
 */

'use client'

import * as React from "react"
import { ShieldCheckIcon, LockIcon, CheckCircleIcon } from "lucide-react"
import { BaseCard } from "@/components/base/BaseCard"
import { cn } from "@/lib/utils"

export interface SecurityBadgeProps {
  variant?: 'ssl' | 'encryption' | 'gdpr' | 'verified'
  className?: string
}

const badgeConfig = {
  ssl: {
    icon: LockIcon,
    label: 'SSL Secured',
    description: 'Your data is encrypted in transit',
    color: 'text-green-600 dark:text-green-400',
  },
  encryption: {
    icon: ShieldCheckIcon,
    label: 'End-to-End Encryption',
    description: 'Your data is protected',
    color: 'text-blue-600 dark:text-blue-400',
  },
  gdpr: {
    icon: CheckCircleIcon,
    label: 'GDPR Compliant',
    description: 'We respect your privacy',
    color: 'text-purple-600 dark:text-purple-400',
  },
  verified: {
    icon: ShieldCheckIcon,
    label: 'Verified Platform',
    description: 'Trusted by thousands',
    color: 'text-primary',
  },
}

export function SecurityBadge({
  variant = 'ssl',
  className,
}: SecurityBadgeProps) {
  const config = badgeConfig[variant]
  const Icon = config.icon

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Icon className={cn("w-4 h-4", config.color)} />
      <div className="text-sm">
        <div className={cn("font-semibold", config.color)}>{config.label}</div>
        <div className="text-xs text-muted-foreground">{config.description}</div>
      </div>
    </div>
  )
}

/**
 * Security badges display
 */
export function SecurityBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <SecurityBadge variant="ssl" />
      <SecurityBadge variant="encryption" />
      <SecurityBadge variant="gdpr" />
    </div>
  )
}

