'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
  TrendingUpIcon,
  HeartIcon,
  GemIcon,
  UsersIcon,
  CalendarIcon,
  StarIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useAIChat } from '@/contexts/ai-chat-context'

export function CosmicNavbar() {
  const router = useRouter()
  const { logout } = useAuth()
  const { openChat } = useAIChat()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Numerology', path: '/my-numerology', hasSubmenu: true },
    { label: 'Relationships', path: '/relationships', hasSubmenu: true },
    { label: 'Timing & Cycles', path: '/timing-cycles', hasSubmenu: true },
    { label: 'Tools', path: '/tools', hasSubmenu: true },
    { label: 'Reports', path: '/reports', hasSubmenu: true },
    { label: 'Remedies', path: '/remedies' },
    { label: 'Chat', action: openChat },
    { label: 'Consultations', path: '/consultations' },
  ]

  return (
    <>
      <motion.nav
        initial={{
          y: -100,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a2942]/60 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 shadow-xl shadow-cyan-500/10 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 group"
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold font-['Playfair_Display'] text-white hidden sm:inline">
                  NumerAI
                </span>
              </motion.button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                {mainNavItems.map((item) => (
                  <motion.button
                    key={item.label}
                    onClick={() => {
                      if (item.action) {
                        item.action()
                      } else if (item.path) {
                        router.push(item.path)
                      }
                    }}
                    className="text-white/80 hover:text-cyan-400 font-medium transition-colors flex items-center gap-1"
                    whileHover={{
                      y: -2,
                    }}
                  >
                    {item.label}
                    {item.hasSubmenu && <ChevronDownIcon className="w-3 h-3" />}
                  </motion.button>
                ))}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                {/* Profile Dropdown */}
                <div className="hidden md:block relative">
                  <motion.button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                    whileHover={{
                      scale: 1.1,
                    }}
                    whileTap={{
                      scale: 0.95,
                    }}
                    aria-label="User profile menu"
                  >
                    <UserIcon className="w-5 h-5 text-white" />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 10,
                            scale: 0.95,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: 10,
                            scale: 0.95,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="absolute right-0 mt-2 w-48 bg-[#1a2942]/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden z-50"
                        >
                          <button
                            onClick={() => {
                              router.push('/settings')
                              setIsProfileOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
                          >
                            <SettingsIcon className="w-4 h-4" />
                            Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-left text-white hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
                          >
                            <LogOutIcon className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-[#1a2942]/60 backdrop-blur-xl border border-cyan-500/20"
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  aria-label="Toggle mobile menu"
                >
                  {isMenuOpen ? (
                    <XIcon className="w-6 h-6 text-white" />
                  ) : (
                    <MenuIcon className="w-6 h-6 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
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
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden"
            >
              <div className="bg-[#1a2942]/95 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl overflow-hidden">
                <div className="p-4 space-y-2">
                  {mainNavItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.action) {
                          item.action()
                        } else if (item.path) {
                          router.push(item.path)
                        }
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-cyan-500/10 rounded-xl transition-colors font-medium"
                    >
                      {item.label}
                    </button>
                  ))}

                  <div className="border-t border-cyan-500/20 pt-2">
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-cyan-500/10 rounded-xl transition-colors flex items-center gap-2 font-medium"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-white hover:bg-cyan-500/10 rounded-xl transition-colors flex items-center gap-2 font-medium"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

