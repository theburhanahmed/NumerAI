/**
 * InstallPrompt Component
 * 
 * PWA install prompt for mobile and desktop browsers.
 */

'use client'

import * as React from "react"
import { DownloadIcon, XIcon } from "lucide-react"
import { BaseButton } from "@/components/base/BaseButton"
import { BaseCard } from "@/components/base/BaseCard"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useLocalStorage } from "@/hooks/use-local-storage"

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [dismissed, setDismissed] = useLocalStorage('pwa-install-dismissed', false)

  React.useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!dismissed) {
        // Show prompt after a delay
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
  }

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <BaseCard
            variant="space"
            padding="md"
            className="border-cyan-500/30 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DownloadIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">Install NumerAI</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Install our app for a better experience and offline access.
                </p>
                <div className="flex gap-2">
                  <BaseButton
                    variant="space"
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1"
                  >
                    Install
                  </BaseButton>
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="px-3"
                    aria-label="Dismiss"
                  >
                    <XIcon className="w-4 h-4" />
                  </BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Hook to programmatically trigger install prompt
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      return true
    }

    return false
  }

  return {
    install,
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
  }
}

