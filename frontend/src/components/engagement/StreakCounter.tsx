/**
 * StreakCounter Component
 * 
 * Daily engagement streak counter for user retention.
 */

'use client'

import * as React from "react"
import { FlameIcon, CalendarIcon } from "lucide-react"
import { BaseCard } from "@/components/base/BaseCard"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"

export interface StreakCounterProps {
  className?: string
  onStreakMilestone?: (days: number) => void
}

export function StreakCounter({ className, onStreakMilestone }: StreakCounterProps) {
  const [streakData, setStreakData] = useLocalStorage<{
    currentStreak: number
    longestStreak: number
    lastVisitDate: string
  }>('streak-data', {
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: '',
  })

  React.useEffect(() => {
    const today = new Date().toDateString()
    const lastVisit = streakData.lastVisitDate
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = streakData.currentStreak
    let newLongestStreak = streakData.longestStreak

    if (lastVisit === today) {
      // Already visited today, no change
      return
    } else if (lastVisit === yesterday.toDateString()) {
      // Consecutive day
      newStreak = streakData.currentStreak + 1
    } else if (lastVisit && lastVisit !== today) {
      // Streak broken
      newStreak = 1
    } else {
      // First visit or first visit in a while
      newStreak = 1
    }

    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak
    }

    // Check for milestones
    if (newStreak > streakData.currentStreak) {
      const milestones = [7, 14, 30, 60, 90, 100]
      if (milestones.includes(newStreak)) {
        onStreakMilestone?.(newStreak)
      }
    }

    setStreakData({
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastVisitDate: today,
    })
  }, []) // Only run once on mount

  return (
    <BaseCard
      variant="space"
      padding="md"
      className={cn("text-center", className)}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <FlameIcon className="w-5 h-5 text-orange-500" />
        <span className="text-2xl font-bold">{streakData.currentStreak}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-1">Day Streak</p>
      {streakData.longestStreak > streakData.currentStreak && (
        <p className="text-xs text-muted-foreground">
          Best: {streakData.longestStreak} days
        </p>
      )}
    </BaseCard>
  )
}

