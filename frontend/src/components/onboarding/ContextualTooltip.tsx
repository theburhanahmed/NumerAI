/**
 * ContextualTooltip Component
 * 
 * Contextual tooltip system for first-time feature explanations.
 * Tracks which tooltips user has seen and allows dismissal.
 */

'use client'

import * as React from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { XIcon, HelpCircleIcon } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"
import { BaseButton } from "@/components/base/BaseButton"

export interface ContextualTooltipProps {
  id: string
  content: string
  title?: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  showOnce?: boolean
  delayDuration?: number
  className?: string
}

export function ContextualTooltip({
  id,
  content,
  title,
  children,
  position = 'top',
  showOnce = true,
  delayDuration = 300,
  className,
}: ContextualTooltipProps) {
  const [dismissedTooltips, setDismissedTooltips] = useLocalStorage<string[]>(
    'dismissed-tooltips',
    []
  )
  const [open, setOpen] = React.useState(false)
  const [showDismiss, setShowDismiss] = React.useState(false)

  const isDismissed = dismissedTooltips.includes(id)
  const shouldShow = !showOnce || !isDismissed

  React.useEffect(() => {
    if (shouldShow && open) {
      const timer = setTimeout(() => {
        setShowDismiss(true)
      }, 2000) // Show dismiss option after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [open, shouldShow])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!dismissedTooltips.includes(id)) {
      setDismissedTooltips([...dismissedTooltips, id])
    }
    setOpen(false)
  }

  if (!shouldShow) {
    return <>{children}</>
  }

  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={position}
            className={cn(
              "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "max-w-xs",
              className
            )}
            sideOffset={5}
          >
            {title && (
              <div className="font-semibold mb-1">{title}</div>
            )}
            <div className="flex items-start gap-2">
              <p className="text-sm">{content}</p>
              {showDismiss && showOnce && (
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
                  aria-label="Don't show again"
                  title="Don't show again"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
            <Tooltip.Arrow className="fill-popover" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

/**
 * First-time tooltip that shows only once
 */
export function FirstTimeTooltip({
  id,
  content,
  title,
  children,
  ...props
}: Omit<ContextualTooltipProps, 'showOnce'>) {
  return (
    <ContextualTooltip
      id={id}
      content={content}
      title={title}
      showOnce={true}
      {...props}
    >
      {children}
    </ContextualTooltip>
  )
}

/**
 * Help icon with contextual tooltip
 */
export function HelpTooltip({
  id,
  content,
  title,
  className,
}: Omit<ContextualTooltipProps, 'children'>) {
  return (
    <ContextualTooltip
      id={id}
      content={content}
      title={title}
      showOnce={false}
      className={className}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Help"
      >
        <HelpCircleIcon className="w-4 h-4" />
      </button>
    </ContextualTooltip>
  )
}

/**
 * Hook to manage tooltip dismissal state
 */
export function useTooltipDismiss() {
  const [dismissedTooltips, setDismissedTooltips] = useLocalStorage<string[]>(
    'dismissed-tooltips',
    []
  )

  const dismissTooltip = (id: string) => {
    if (!dismissedTooltips.includes(id)) {
      setDismissedTooltips([...dismissedTooltips, id])
    }
  }

  const resetTooltip = (id: string) => {
    setDismissedTooltips(dismissedTooltips.filter((tooltipId) => tooltipId !== id))
  }

  const resetAllTooltips = () => {
    setDismissedTooltips([])
  }

  const isDismissed = (id: string) => {
    return dismissedTooltips.includes(id)
  }

  return {
    dismissedTooltips,
    dismissTooltip,
    resetTooltip,
    resetAllTooltips,
    isDismissed,
  }
}

