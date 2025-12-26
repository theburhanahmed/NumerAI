/**
 * Badges Component
 * 
 * Achievement badges for feature completion and milestones.
 */

'use client'

import * as React from "react"
import { TrophyIcon, StarIcon, SparklesIcon, CrownIcon } from "lucide-react"
import { BaseCard } from "@/components/base/BaseCard"
import { badgeVariants } from "@/design-system/variants"
import { cn } from "@/lib/utils"

export interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  unlockedAt?: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface BadgesProps {
  badges: Badge[]
  className?: string
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500',
}

export function Badges({ badges, className }: BadgesProps) {
  const unlockedBadges = badges.filter((b) => b.unlocked)
  const lockedBadges = badges.filter((b) => !b.unlocked)

  return (
    <BaseCard variant="space" padding="md" className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 font-['Playfair_Display']">
          Achievements
        </h3>
        <p className="text-sm text-muted-foreground">
          {unlockedBadges.length} of {badges.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border transition-all",
              badge.unlocked
                ? "border-primary bg-primary/5"
                : "border-muted bg-muted/20 opacity-60"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                badge.unlocked
                  ? badge.rarity
                    ? rarityColors[badge.rarity]
                    : "bg-primary"
                  : "bg-muted"
              )}
            >
              <div className={cn(badge.unlocked ? "text-white" : "text-muted-foreground")}>
                {badge.icon}
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "text-sm font-semibold mb-1",
                  badge.unlocked ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {badge.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {badge.description}
              </div>
              {badge.unlocked && badge.unlockedAt && (
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(badge.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  )
}

/**
 * Badge display for single badge
 */
export function BadgeDisplay({ badge }: { badge: Badge }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
        badge.unlocked
          ? "border-primary bg-primary/10"
          : "border-muted bg-muted/20 opacity-60"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 flex items-center justify-center",
          badge.unlocked ? "text-primary" : "text-muted-foreground"
        )}
      >
        {badge.icon}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          badge.unlocked ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {badge.name}
      </span>
    </div>
  )
}

