/**
 * TrialBanner Component
 * 
 * Free trial banner with countdown timer and feature highlights.
 */

'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { ClockIcon, SparklesIcon, ArrowRightIcon } from "lucide-react"
import { BaseButton } from "@/components/base/BaseButton"
import { BaseCard } from "@/components/base/BaseCard"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface TrialBannerProps {
  trialEndDate: Date
  features?: string[]
  onUpgrade?: () => void
  className?: string
}

export function TrialBanner({
  trialEndDate,
  features = [
    'Unlimited daily readings',
    'AI numerologist chat',
    'Full numerology reports',
    'Advanced calculators',
  ],
  onUpgrade,
  className,
}: TrialBannerProps) {
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = React.useState(false)

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const end = trialEndDate.getTime()
      const difference = end - now

      if (difference <= 0) {
        setIsExpired(true)
        return
      }

      setTimeRemaining({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [trialEndDate])

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      router.push('/subscription')
    }
  }

  if (isExpired) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
    >
      <BaseCard
        variant="space"
        padding="md"
        className="border-primary/30 bg-gradient-to-r from-primary/10 to-purple-500/10"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Premium Trial Active</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Your trial ends in{' '}
              <span className="font-semibold text-foreground">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          <BaseButton
            variant="space"
            onClick={handleUpgrade}
            className="gap-2 whitespace-nowrap"
          >
            Upgrade Now
            <ArrowRightIcon className="w-4 h-4" />
          </BaseButton>
        </div>
      </BaseCard>
    </motion.div>
  )
}

