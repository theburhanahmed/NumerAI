'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, MenuIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-media-query'

interface MobileNavDrawerProps {
  children: React.ReactNode
  trigger?: React.ReactNode
}

/**
 * Mobile navigation drawer with smooth slide-in animation
 * Includes backdrop and proper touch handling
 */
export function MobileNavDrawer({
  children,
  trigger,
}: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20 text-white"
        aria-label="Open navigation menu"
      >
        {trigger || <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{
                x: '100%',
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: '100%',
              }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0B0F19] border-l border-cyan-500/20 z-[101] overflow-y-auto"
            >
              {/* Close Button */}
              <div className="sticky top-0 bg-[#0B0F19] border-b border-cyan-500/20 p-4 flex justify-between items-center">
                <h2 className="text-xl font-['Playfair_Display'] font-bold text-white">
                  Menu
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20 text-white"
                  aria-label="Close menu"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

