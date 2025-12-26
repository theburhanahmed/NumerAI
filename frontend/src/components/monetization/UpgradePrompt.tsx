/**
 * UpgradePrompt Component
 * 
 * Contextual upgrade suggestions for premium features.
 */

'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { LockIcon, SparklesIcon, ArrowRightIcon, XIcon } from "lucide-react"
import { BaseButton } from "@/components/base/BaseButton"
import { BaseCard } from "@/components/base/BaseCard"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useSubscription } from "@/contexts/SubscriptionContext"

export interface UpgradePromptProps {
  feature: string
  description?: string
  variant?: 'banner' | 'modal' | 'inline'
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function UpgradePrompt({
  feature,
  description,
  variant = 'banner',
  dismissible = true,
  onDismiss,
  className,
}: UpgradePromptProps) {
  const router = useRouter()
  const { subscriptionPlan } = useSubscription()
  const [dismissed, setDismissed] = React.useState(false)

  const handleUpgrade = () => {
    router.push('/subscription')
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (dismissed || subscriptionPlan === 'premium' || subscriptionPlan === 'elite') {
    return null
  }

  const defaultDescription = description || `Unlock ${feature} with a Premium subscription`

  if (variant === 'inline') {
    return (
      <BaseCard
        variant="space"
        padding="sm"
        className={cn("border-primary/30 bg-primary/5", className)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <LockIcon className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">{feature}</div>
              <div className="text-xs text-muted-foreground">{defaultDescription}</div>
            </div>
          </div>
          <BaseButton
            variant="space"
            size="sm"
            onClick={handleUpgrade}
            className="gap-2"
          >
            Upgrade
            <ArrowRightIcon className="w-4 h-4" />
          </BaseButton>
        </div>
      </BaseCard>
    )
  }

  if (variant === 'modal') {
    return (
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleDismiss}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <BaseCard variant="space" padding="lg" className="max-w-md">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <LockIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 font-['Playfair_Display']">
                    Unlock {feature}
                  </h3>
                  <p className="text-muted-foreground">{defaultDescription}</p>
                </div>
                <div className="flex gap-3">
                  {dismissible && (
                    <BaseButton
                      variant="outline"
                      onClick={handleDismiss}
                      className="flex-1"
                    >
                      Maybe Later
                    </BaseButton>
                  )}
                  <BaseButton
                    variant="space"
                    onClick={handleUpgrade}
                    className="flex-1 gap-2"
                  >
                    Upgrade to Premium
                    <ArrowRightIcon className="w-4 h-4" />
                  </BaseButton>
                </div>
              </BaseCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Banner variant (default)
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={cn("w-full", className)}
        >
          <BaseCard
            variant="space"
            padding="md"
            className="border-primary/30 bg-primary/5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <SparklesIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-semibold">{feature}</div>
                  <div className="text-sm text-muted-foreground">{defaultDescription}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BaseButton
                  variant="space"
                  onClick={handleUpgrade}
                  className="gap-2"
                >
                  Upgrade
                  <ArrowRightIcon className="w-4 h-4" />
                </BaseButton>
                {dismissible && (
                  <button
                    onClick={handleDismiss}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Dismiss"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </BaseCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Lock icon overlay for premium features
 */
export function PremiumLock({
  feature,
  onClick,
  className,
}: {
  feature?: string
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10",
        onClick && "cursor-pointer hover:bg-background/90",
        className
      )}
      onClick={onClick}
    >
      <div className="text-center">
        <LockIcon className="w-8 h-8 text-primary mx-auto mb-2" />
        {feature && (
          <p className="text-sm font-semibold">{feature}</p>
        )}
        <p className="text-xs text-muted-foreground">Premium Feature</p>
      </div>
    </div>
  )
}

