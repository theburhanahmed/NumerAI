/**
 * BottomSheet Component
 * 
 * Mobile-optimized bottom sheet component for modals and actions.
 */

'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { XIcon } from "lucide-react"
import { BaseButton } from "@/components/base/BaseButton"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-media-query"

export interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  closeOnBackdrop?: boolean
  snapPoints?: number[] // Heights in percentage (e.g., [50, 90])
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
  closeOnBackdrop = true,
  snapPoints = [50, 90],
}: BottomSheetProps) {
  const isMobile = useIsMobile()
  const [snapPoint, setSnapPoint] = React.useState(0)

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onOpenChange(false)
    }
  }

  // Only show on mobile
  if (!isMobile) {
    return null
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl z-50",
              "max-h-[90vh] flex flex-col",
              className
            )}
            style={{
              height: `${snapPoints[snapPoint]}%`,
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 pb-4 border-b">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-4 py-4 border-t bg-muted/50">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

