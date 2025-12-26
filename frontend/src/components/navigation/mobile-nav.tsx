'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  MenuIcon,
  XIcon,
  HomeIcon,
  MessageSquareIcon,
  BookOpenIcon,
  SettingsIcon,
  LogOutIcon,
} from 'lucide-react'
import { GlassButton } from '../glassmorphism/glass-button'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const menuItems = [
    {
      icon: <HomeIcon className="w-5 h-5" />,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: <MessageSquareIcon className="w-5 h-5" />,
      label: 'AI Chat',
      path: '/ai-chat',
    },
    {
      icon: <BookOpenIcon className="w-5 h-5" />,
      label: 'Reports',
      path: '/numerology-report',
    },
    {
      icon: <SettingsIcon className="w-5 h-5" />,
      label: 'Settings',
      path: '/settings',
    },
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30"
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.95,
        }}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <XIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <MenuIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

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
                damping: 25,
                stiffness: 200,
              }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-l border-white/20 dark:border-gray-700/30 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                    aria-label="Close menu"
                  >
                    <XIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 text-left transition-all hover:shadow-lg"
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.1,
                      }}
                      whileHover={{
                        scale: 1.02,
                        x: 4,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                        {item.icon}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </nav>

                {/* Logout Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <GlassButton
                    variant="secondary"
                    className="w-full"
                    icon={<LogOutIcon className="w-5 h-5" />}
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/')
                    }}
                  >
                    Sign Out
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

